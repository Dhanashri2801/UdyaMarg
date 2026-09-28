# backend/services/matching_engine.py - WITH BUSINESS DESCRIPTION AI MATCHING

import os
import json
import re
import hashlib
from typing import Dict, List, Any, Optional

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
USE_AI = True

# Cache
_match_cache = {}


def _get_cache_key(user_profile: Dict, scheme_id: str, checked_docs: Dict) -> str:
    profile_str = json.dumps(user_profile, sort_keys=True)
    docs_str = json.dumps(checked_docs, sort_keys=True) if checked_docs else ""
    combined = f"{scheme_id}_{profile_str}_{docs_str}"
    return hashlib.md5(combined.encode()).hexdigest()


def _doc_tokens(doc_entry):
    base = re.sub(r'\([^)]*\)', '', doc_entry)
    parts = re.split(r'\s*(?:&|/|,|\band\b)\s*', base, flags=re.IGNORECASE)
    return [p.strip().lower() for p in parts if p.strip()]


def _doc_entry_available(doc_entry, available_doc_names):
    tokens = _doc_tokens(doc_entry)
    if not tokens:
        return False
    avail_lower = [a.lower() for a in available_doc_names]
    for token in tokens:
        if not any(token in a or a in token for a in avail_lower):
            return False
    return True


def _fast_rule_match(user_profile: Dict, scheme: Dict, checked_docs: Optional[Dict] = None) -> Dict:
    """Fast rule-based matching with varied scores - 100 points system"""
    
    score = 0.0
    matched_reasons = []
    missing_reasons = []

    # 1. Category (18%)
    user_cat = user_profile.get('category', '').strip()
    scheme_cats = scheme.get('categories', [])
    
    if 'All' in scheme_cats or 'General' in scheme_cats:
        score += 18
        matched_reasons.append("✓ Open to all categories")
    elif user_cat in scheme_cats:
        score += 17
        matched_reasons.append(f"✓ Category match: {user_cat}")
    elif user_cat == 'Women' and 'Women' in scheme_cats:
        score += 16
        matched_reasons.append("✓ Women category match")
    elif user_cat == 'Minorities' and 'Minorities' in scheme_cats:
        score += 16
        matched_reasons.append("✓ Minorities category match")
    elif user_cat in ['SC', 'ST'] and (user_cat in scheme_cats or any(user_cat in t for t in scheme.get('target_beneficiaries', []))):
        score += 17
        matched_reasons.append(f"✓ {user_cat} priority category")
    else:
        score += 4
        missing_reasons.append(f"⚠ Category mismatch (Requires: {', '.join(scheme_cats[:3])})")

    # 2. Income (18%)
    user_income = float(user_profile.get('annual_income', 0) or 0)
    income_limit = float(scheme.get('income_limit', 0) or 0)
    if income_limit == 0:
        score += 18
        matched_reasons.append("✓ No income ceiling")
    elif user_income <= income_limit:
        score += 18
        matched_reasons.append(f"✓ Income below limit of ₹{income_limit:,.0f}")
    else:
        score += 3
        missing_reasons.append(f"⚠ Income exceeds ₹{income_limit:,.0f}")

    # 3. Business Type (15%)
    user_biz = user_profile.get('business_type', 'Service')
    scheme_biz = scheme.get('business_types', [])
    if not scheme_biz or 'All' in scheme_biz:
        score += 15
        matched_reasons.append("✓ All business types welcome")
    elif any(user_biz.lower() in b.lower() or b.lower() in user_biz.lower() for b in scheme_biz):
        score += 14
        matched_reasons.append(f"✓ Business type: {user_biz}")
    else:
        score += 3
        missing_reasons.append(f"⚠ Business type mismatch")

    # 4. Business Description (5% bonus - AI handles the rest)
    user_desc = user_profile.get('business_description', '').strip()
    if user_desc and len(user_desc) > 20:
        score += 5
        matched_reasons.append("✓ Business description provided")
    else:
        missing_reasons.append("⚠ No business description (AI matching limited)")

    # 5. Support (14%)
    user_support = user_profile.get('support_requirement', 'Business loan')
    scheme_support = scheme.get('support_type', [])
    if not scheme_support or 'All' in scheme_support:
        score += 14
        matched_reasons.append("✓ Support available")
    elif any(user_support.lower() in s.lower() or s.lower() in user_support.lower() for s in scheme_support):
        score += 12
        matched_reasons.append(f"✓ Support: {user_support}")
    else:
        score += 3
        missing_reasons.append(f"⚠ Support mismatch")

    # 6. Location (10%)
    user_state = user_profile.get('state', '').strip()
    scheme_states = scheme.get('states', ['All'])
    scheme_scope = scheme.get('state_or_central', 'Central')
    if 'All' in scheme_states or scheme_scope == 'Central' or not user_state:
        score += 10
        if scheme_scope == 'Central':
            matched_reasons.append("✓ Central scheme (Pan-India)")
        else:
            matched_reasons.append("✓ Applicable nationwide")
    elif user_state in scheme_states:
        score += 10
        matched_reasons.append(f"✓ Applicable in {user_state}")
    else:
        score += 2
        missing_reasons.append(f"⚠ Limited to specific states")

    # 7. Age (10%)
    user_age = int(user_profile.get('age', 25) or 25)
    age_min = scheme.get('age_min', 18)
    age_max = scheme.get('age_max', 70)
    if age_min <= user_age <= age_max:
        score += 10
        matched_reasons.append(f"✓ Age {user_age} yrs within {age_min}-{age_max}")
    else:
        score += 2
        missing_reasons.append(f"⚠ Age must be {age_min}-{age_max} years")

    # 8. Investment (2%)
    approx_inv = float(user_profile.get('approx_investment', 0) or 0)
    max_cost = float(scheme.get('max_project_cost', 0) or 0)
    if max_cost == 0:
        score += 2
        matched_reasons.append("✓ No investment limit")
    elif approx_inv <= max_cost:
        score += 2
        matched_reasons.append("✓ Investment within limit")
    else:
        score += 0.5
        missing_reasons.append(f"⚠ Project limit ₹{max_cost:,.0f}")

    # 9. Documents (8%)
    if checked_docs and scheme.get('required_documents'):
        required_docs = scheme.get('required_documents', [])
        available_doc_names = [name for name, avail in checked_docs.items() if avail]
        available_count = 0
        for doc in required_docs:
            if _doc_entry_available(doc, available_doc_names):
                available_count += 1
        doc_ratio = available_count / len(required_docs) if required_docs else 0
        score += 8 * doc_ratio
        if doc_ratio >= 0.7:
            matched_reasons.append(f"✓ {available_count}/{len(required_docs)} docs ready")
        else:
            missing_reasons.append(f"⚠ Need {len(required_docs) - available_count} more docs")
    else:
        score += 4

    # Final Rule Score
    base_score = min(98, max(20, round(score)))
    
    # Add slight variation based on scheme id to avoid all same score
    scheme_id = scheme.get('id', '')
    variation = (hash(scheme_id) % 10) - 5  # -5 to +5
    match_percentage = max(20, min(98, base_score + variation))
    
    if match_percentage >= 75:
        eligibility_status = "Eligible"
    elif match_percentage >= 50:
        eligibility_status = "Partially Eligible"
    else:
        eligibility_status = "Not Eligible"

    return {
        'scheme_id': scheme['id'],
        'scheme_name': scheme['name'],
        'match_percentage': match_percentage,
        'eligibility_status': eligibility_status,
        'matched_reasons': matched_reasons[:4],
        'missing_reasons': missing_reasons[:4],
        'ai_reason': '',
        'disclaimer': "Preliminary eligibility only."
    }


def _process_single_match(user_profile: Dict, scheme: Dict, checked_docs: Optional[Dict] = None, gemini_client: Optional[Any] = None) -> Dict:
    """Process single scheme match with AI + Business Description"""
    scheme_id = scheme.get('id', 'unknown')
    
    # Check cache
    cache_key = _get_cache_key(user_profile, scheme_id, checked_docs or {})
    if cache_key in _match_cache:
        return _match_cache[cache_key]
    
    # Step 1: Rule-Based Score
    result = _fast_rule_match(user_profile, scheme, checked_docs)
    
    # Step 2: AI Enhancement
    if gemini_client and GEMINI_AVAILABLE and USE_AI:
        try:
            business_desc = user_profile.get('business_description', 'Not provided')
            
            prompt = f"""You are an expert at matching Indian Government schemes to businesses.

USER PROFILE:
- Category: {user_profile.get('category', '')}
- Annual Income: ₹{user_profile.get('annual_income', 0)}
- Business Type: {user_profile.get('business_type', '')}
- State: {user_profile.get('state', '')}
- Age: {user_profile.get('age', '')}
- Support Needed: {user_profile.get('support_requirement', '')}
- Approx Investment: ₹{user_profile.get('approx_investment', 0)}

USER'S BUSINESS DESCRIPTION:
"{business_desc}"

SCHEME DETAILS:
- Name: {scheme.get('name', '')}
- Description: {scheme.get('description', '')}
- Target Beneficiaries: {scheme.get('target_beneficiaries', [])}
- Business Types: {scheme.get('business_types', [])}
- Benefits: {scheme.get('benefits', [])}
- Support Type: {scheme.get('support_type', [])}

TASK:
Analyze if this scheme is a good match for the user's specific business described above.
Consider:
1. Does the user's business description align with the scheme's purpose?
2. Would the user actually benefit from this scheme?
3. Are there any hidden mismatches (e.g., user does tailoring but scheme is only for IT businesses)?

Rate the match from 0-100 and provide a SHORT one-line reason (max 100 chars).

Return ONLY valid JSON:
{{"score": 0-100, "reason": "short reason here"}}"""

            response = gemini_client.models.generate_content(
                model="gemini-3.6-flash",   # 👈 UPDATED MODEL (pehle "gemini-2.0-flash" tha)
                contents=prompt,
                config={'temperature': 0.2, 'max_output_tokens': 100}
            )

            if response and hasattr(response, 'text'):
                try:
                    json_match = re.search(r'\{[^{}]*\}', response.text, re.DOTALL)
                    if json_match:
                        data = json.loads(json_match.group())
                        ai_score = data.get('score', 50)
                        ai_reason = data.get('reason', 'AI evaluated your business')
                        
                        result['ai_reason'] = ai_reason
                        
                        # Blend: 70% AI + 30% Rule
                        blended = (ai_score * 0.7) + (result['match_percentage'] * 0.3)
                        result['match_percentage'] = min(98, max(20, round(blended)))
                        
                        if ai_score >= 70:
                            result['matched_reasons'].insert(0, f"🤖 AI: {ai_reason}")
                        else:
                            result['missing_reasons'].insert(0, f"🤖 AI: {ai_reason}")
                except Exception as e:
                    print(f"AI JSON parse error: {e}")
        except Exception as e:
            print(f"AI call failed: {e}")
            pass  # Fallback to rule-based
    
    # Cache result
    _match_cache[cache_key] = result
    return result


def rank_schemes_for_user(
    user_profile: Dict, 
    schemes_list: List[Dict], 
    weights: Optional[Dict] = None,
    checked_docs: Optional[Dict] = None,
    use_ai: bool = True
) -> List[Dict]:
    """Fast parallel ranking of schemes"""
    
    global USE_AI
    USE_AI = use_ai
    
    print(f"🚀 Matching {len(schemes_list)} schemes...")
    
    if not schemes_list:
        print("⚠️ No schemes to match!")
        return []
    
    # Initialize Gemini client
    gemini_client = None
    if use_ai and GEMINI_AVAILABLE:
        try:
            api_key = GEMINI_API_KEY
            if api_key:
                gemini_client = genai.Client(api_key=api_key)
                print("✅ Gemini AI ready")
        except Exception as e:
            print(f"⚠️ AI disabled: {e}")
    
    results = []
    
    for idx, scheme in enumerate(schemes_list):
        try:
            # Ensure scheme has all required fields
            if not scheme.get('name'):
                scheme['name'] = scheme.get('id', 'Unknown Scheme')
            if not scheme.get('description'):
                scheme['description'] = 'No description available'
            if not scheme.get('simple_description'):
                scheme['simple_description'] = scheme.get('description', '')
            if not scheme.get('benefits'):
                scheme['benefits'] = ['Financial assistance available']
            if not scheme.get('simple_benefits'):
                scheme['simple_benefits'] = scheme.get('benefits', ['Financial assistance available'])
            if not scheme.get('required_documents'):
                scheme['required_documents'] = ['Government ID proof', 'Address proof']
            if not scheme.get('application_steps'):
                scheme['application_steps'] = [
                    {'step': 1, 'title': 'Visit Official Website', 'description': f'Visit {scheme.get("official_source", "official portal")} to apply'},
                    {'step': 2, 'title': 'Fill Application', 'description': 'Submit your details and documents online'}
                ]
            if not scheme.get('max_assistance_text'):
                scheme['max_assistance_text'] = 'Financial assistance available'
            if not scheme.get('state_or_central'):
                scheme['state_or_central'] = 'Central'
            if not scheme.get('ministry'):
                scheme['ministry'] = 'Government of India'
            
            # Match this scheme
            if gemini_client and use_ai:
                result = _process_single_match(user_profile, scheme, checked_docs, gemini_client)
            else:
                result = _fast_rule_match(user_profile, scheme, checked_docs)
            
            # Merge with full scheme data
            merged = dict(scheme)
            merged['match_percentage'] = result['match_percentage']
            merged['eligibility_status'] = result['eligibility_status']
            merged['matched_reasons'] = result.get('matched_reasons', [])
            merged['missing_reasons'] = result.get('missing_reasons', [])
            merged['ai_reason'] = result.get('ai_reason', '')
            merged['disclaimer'] = result.get('disclaimer', 'Preliminary eligibility only.')
            
            results.append(merged)
            
            if idx % 10 == 0:
                print(f"⏳ Matched {idx+1}/{len(schemes_list)} schemes...")
                
        except Exception as e:
            print(f"❌ Error matching scheme {scheme.get('id', 'unknown')}: {e}")
            scheme['match_percentage'] = 50
            scheme['eligibility_status'] = 'Partially Eligible'
            scheme['matched_reasons'] = ['Error in matching, please try again']
            scheme['missing_reasons'] = []
            scheme['ai_reason'] = ''
            results.append(scheme)
    
    # Sort by match percentage
    results.sort(key=lambda x: x.get('match_percentage', 0), reverse=True)
    
    print(f"✅ Completed matching {len(results)} schemes")
    return results