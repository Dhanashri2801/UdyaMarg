# backend/routes/api.py - Pure hardcoded chat (no Gemini needed)

import os
import json
import sys
from flask import Blueprint, request, jsonify

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import get_db_connection
from services.matching_engine import rank_schemes_for_user
from services.simple_language_service import SimpleLanguageService
from services.whatsapp_service import WhatsAppService

api_bp = Blueprint('api', __name__)

LANGUAGE_MAP = {
    'hi': 'Hindi', 'en': 'English', 'pa': 'Punjabi', 'bn': 'Bengali',
    'ta': 'Tamil', 'te': 'Telugu', 'mr': 'Marathi'
}

simple_lang_service = SimpleLanguageService()


# ═══════════════════════════════════════════════════════════
# 🧠 HARDCODED RAG ANSWERS (No Gemini!)
# ═══════════════════════════════════════════════════════════

RAG_STRINGS = {
    'hi': {
        'no_data': 'कृपया पहले अपनी प्रोफाइल भरें और योजनाएं खोजें।',
        'best_scheme': lambda name, pct, amount: f'आपके लिए सबसे अच्छी योजना "{name}" है जिसमें आपका {pct}% मैच है। इस योजना में आपको {amount} मिल सकता है।',
        'top_schemes': lambda n: f'आपकी प्रोफाइल के लिए शीर्ष {n} योजनाएं:',
        'scheme_line': lambda i, name, pct: f'{i}. {name} — {pct}% मैच',
        'financial': lambda name, amount: f'"{name}" में आपको {amount} तक की वित्तीय सहायता मिल सकती है।',
        'documents': lambda name, docs: f'"{name}" के लिए आवश्यक दस्तावेज़:\n{docs}',
        'no_docs': 'सामान्य दस्तावेज़: आधार कार्ड, पैन कार्ड, बैंक पासबुक, पता प्रमाण, पासपोर्ट फोटो',
        'apply': lambda name, source: f'"{name}" के लिए आवेदन करने के लिए आधिकारिक वेबसाइट पर जाएं: {source}',
        'apply_steps': lambda name, steps: f'"{name}" के लिए आवेदन प्रक्रिया:\n{steps}',
        'benefits': lambda name, list_: f'"{name}" के लाभ:\n{list_}',
        'eligible': lambda name, status, pct: f'"{name}" में आपकी पात्रता: {status} ({pct}% मैच)',
        'default': lambda name, pct, amount: f'आपकी सबसे अच्छी योजना "{name}" है ({pct}% मैच)।\n\n💰 {amount}\n\nआप पूछ सकते हैं:\n• लाभ क्या हैं?\n• कौन से दस्तावेज़ चाहिए?\n• आवेदन कैसे करें?',
    },
    'en': {
        'no_data': 'Please complete your profile first and search for schemes.',
        'best_scheme': lambda name, pct, amount: f'Your best matching scheme is "{name}" with {pct}% match. You can get {amount} from this scheme.',
        'top_schemes': lambda n: f'Top {n} schemes for your profile:',
        'scheme_line': lambda i, name, pct: f'{i}. {name} — {pct}% match',
        'financial': lambda name, amount: f'"{name}" provides financial assistance up to {amount}.',
        'documents': lambda name, docs: f'Documents required for "{name}":\n{docs}',
        'no_docs': 'Common documents: Aadhaar Card, PAN Card, Bank Passbook, Address Proof, Passport Photo',
        'apply': lambda name, source: f'To apply for "{name}", visit the official website: {source}',
        'apply_steps': lambda name, steps: f'Application steps for "{name}":\n{steps}',
        'benefits': lambda name, list_: f'Benefits of "{name}":\n{list_}',
        'eligible': lambda name, status, pct: f'Your eligibility for "{name}": {status} ({pct}% match)',
        'default': lambda name, pct, amount: f'Your best matching scheme is "{name}" ({pct}% match).\n\n💰 {amount}\n\nYou can ask about:\n• Benefits\n• Required documents\n• How to apply',
    },
    'pa': {
        'no_data': 'ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਭਰੋ ਅਤੇ ਸਕੀਮਾਂ ਲੱਭੋ।',
        'best_scheme': lambda name, pct, amount: f'ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਸਕੀਮ "{name}" ਹੈ ਜਿਸ ਵਿੱਚ ਤੁਹਾਡਾ {pct}% ਮੈਚ ਹੈ। ਇਸ ਸਕੀਮ ਵਿੱਚ ਤੁਹਾਨੂੰ {amount} ਮਿਲ ਸਕਦਾ ਹੈ।',
        'top_schemes': lambda n: f'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਲਈ ਚੋਟੀ ਦੀਆਂ {n} ਸਕੀਮਾਂ:',
        'scheme_line': lambda i, name, pct: f'{i}. {name} — {pct}% ਮੈਚ',
        'financial': lambda name, amount: f'"{name}" ਵਿੱਚ ਤੁਹਾਨੂੰ {amount} ਤੱਕ ਦੀ ਵਿੱਤੀ ਸਹਾਇਤਾ ਮਿਲ ਸਕਦੀ ਹੈ।',
        'documents': lambda name, docs: f'"{name}" ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼:\n{docs}',
        'no_docs': 'ਆਮ ਦਸਤਾਵੇਜ਼: ਆਧਾਰ ਕਾਰਡ, ਪੈਨ ਕਾਰਡ, ਬੈਂਕ ਪਾਸਬੁੱਕ, ਪਤਾ ਪਰੂਫ, ਪਾਸਪੋਰਟ ਫੋਟੋ',
        'apply': lambda name, source: f'"{name}" ਲਈ ਅਰਜ਼ੀ ਦੇਣ ਲਈ ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ \'ਤੇ ਜਾਓ: {source}',
        'apply_steps': lambda name, steps: f'"{name}" ਲਈ ਅਰਜ਼ੀ ਪ੍ਰਕਿਰਿਆ:\n{steps}',
        'benefits': lambda name, list_: f'"{name}" ਦੇ ਲਾਭ:\n{list_}',
        'eligible': lambda name, status, pct: f'"{name}" ਵਿੱਚ ਤੁਹਾਡੀ ਯੋਗਤਾ: {status} ({pct}% ਮੈਚ)',
        'default': lambda name, pct, amount: f'ਤੁਹਾਡੀ ਸਭ ਤੋਂ ਵਧੀਆ ਸਕੀਮ "{name}" ਹੈ ({pct}% ਮੈਚ)।\n\n💰 {amount}\n\nਤੁਸੀਂ ਪੁੱਛ ਸਕਦੇ ਹੋ:\n• ਲਾਭ\n• ਦਸਤਾਵੇਜ਼\n• ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ',
    },
    'bn': {
        'no_data': 'অনুগ্রহ করে প্রথমে আপনার প্রোফাইল পূরণ করুন এবং স্কিম খুঁজুন।',
        'best_scheme': lambda name, pct, amount: f'আপনার জন্য সেরা স্কিম "{name}" যেখানে আপনার {pct}% মিল আছে। এই স্কিমে আপনি {amount} পেতে পারেন।',
        'top_schemes': lambda n: f'আপনার প্রোফাইলের জন্য শীর্ষ {n}টি স্কিম:',
        'scheme_line': lambda i, name, pct: f'{i}. {name} — {pct}% মিল',
        'financial': lambda name, amount: f'"{name}" এ আপনি {amount} পর্যন্ত আর্থিক সহায়তা পেতে পারেন।',
        'documents': lambda name, docs: f'"{name}" এর জন্য প্রয়োজনীয় নথি:\n{docs}',
        'no_docs': 'সাধারণ নথি: আধার কার্ড, প্যান কার্ড, ব্যাংক পাসবুক, ঠিকানা প্রমাণ, পাসপোর্ট ফটো',
        'apply': lambda name, source: f'"{name}" এর জন্য আবেদন করতে অফিসিয়াল ওয়েবসাইটে যান: {source}',
        'apply_steps': lambda name, steps: f'"{name}" এর জন্য আবেদন প্রক্রিয়া:\n{steps}',
        'benefits': lambda name, list_: f'"{name}" এর সুবিধা:\n{list_}',
        'eligible': lambda name, status, pct: f'"{name}" এ আপনার যোগ্যতা: {status} ({pct}% মিল)',
        'default': lambda name, pct, amount: f'আপনার সেরা স্কিম "{name}" ({pct}% মিল)।\n\n💰 {amount}\n\nআপনি জিজ্ঞাসা করতে পারেন:\n• সুবিধা\n• নথি\n• কীভাবে আবেদন করবেন',
    },
    'ta': {
        'no_data': 'முதலில் உங்கள் சுயவிவரத்தை நிரப்பி திட்டங்களைத் தேடவும்.',
        'best_scheme': lambda name, pct, amount: f'உங்களுக்கான சிறந்த திட்டம் "{name}" — {pct}% பொருத்தம். இதில் நீங்கள் {amount} பெறலாம்.',
        'top_schemes': lambda n: f'உங்கள் சுயவிவரத்திற்கான சிறந்த {n} திட்டங்கள்:',
        'scheme_line': lambda i, name, pct: f'{i}. {name} — {pct}% பொருத்தம்',
        'financial': lambda name, amount: f'"{name}" இல் நீங்கள் {amount} வரை நிதி உதவி பெறலாம்.',
        'documents': lambda name, docs: f'"{name}" க்கு தேவையான ஆவணங்கள்:\n{docs}',
        'no_docs': 'பொதுவான ஆவணங்கள்: ஆதார் அட்டை, பான் அட்டை, வங்கி புத்தகம், முகவரி சான்று, பாஸ்போர்ட் புகைப்படம்',
        'apply': lambda name, source: f'"{name}" க்கு விண்ணப்பிக்க அதிகாரப்பூர்வ வலைத்தளத்திற்குச் செல்லவும்: {source}',
        'apply_steps': lambda name, steps: f'"{name}" க்கான விண்ணப்ப நடைமுறை:\n{steps}',
        'benefits': lambda name, list_: f'"{name}" இன் பலன்கள்:\n{list_}',
        'eligible': lambda name, status, pct: f'"{name}" இல் உங்கள் தகுதி: {status} ({pct}% பொருத்தம்)',
        'default': lambda name, pct, amount: f'உங்கள் சிறந்த திட்டம் "{name}" ({pct}% பொருத்தம்).\n\n💰 {amount}\n\nநீங்கள் கேட்கலாம்:\n• பலன்கள்\n• ஆவணங்கள்\n• எப்படி விண்ணப்பிப்பது',
    },
    'te': {
        'no_data': 'దయచేసి మొదట మీ ప్రొఫైల్ను పూరించి పథకాలను వెతకండి.',
        'best_scheme': lambda name, pct, amount: f'మీ కోసం ఉత్తమ పథకం "{name}" — {pct}% సరిపోలిక. దీనిలో మీరు {amount} పొందవచ్చు.',
        'top_schemes': lambda n: f'మీ ప్రొఫైల్ కోసం టాప్ {n} పథకాలు:',
        'scheme_line': lambda i, name, pct: f'{i}. {name} — {pct}% సరిపోలిక',
        'financial': lambda name, amount: f'"{name}" లో మీరు {amount} వరకు ఆర్థిక సహాయం పొందవచ్చు.',
        'documents': lambda name, docs: f'"{name}" కోసం అవసరమైన పత్రాలు:\n{docs}',
        'no_docs': 'సాధారణ పత్రాలు: ఆధార్ కార్డ్, పాన్ కార్డ్, బ్యాంక్ పాస్బుక్, చిరునామా రుజువు, పాస్పోర్ట్ ఫోటో',
        'apply': lambda name, source: f'"{name}" కోసం దరఖాస్తు చేయడానికి అధికారిక వెబ్సైట్కు వెళ్లండి: {source}',
        'apply_steps': lambda name, steps: f'"{name}" కోసం దరఖాస్తు విధానం:\n{steps}',
        'benefits': lambda name, list_: f'"{name}" ప్రయోజనాలు:\n{list_}',
        'eligible': lambda name, status, pct: f'"{name}" లో మీ అర్హత: {status} ({pct}% సరిపోలిక)',
        'default': lambda name, pct, amount: f'మీ ఉత్తమ పథకం "{name}" ({pct}% సరిపోలిక).\n\n💰 {amount}\n\nమీరు అడగవచ్చు:\n• ప్రయోజనాలు\n• పత్రాలు\n• ఎలా దరఖాస్తు చేయాలి',
    },
    'mr': {
        'no_data': 'कृपया प्रथम आपले प्रोफाइल भरा आणि योजना शोधा.',
        'best_scheme': lambda name, pct, amount: f'तुमच्यासाठी सर्वोत्तम योजना "{name}" आहे ज्यात तुमची {pct}% जुळणी आहे. या योजनेत तुम्हाला {amount} मिळू शकते.',
        'top_schemes': lambda n: f'तुमच्या प्रोफाइलसाठी शीर्ष {n} योजना:',
        'scheme_line': lambda i, name, pct: f'{i}. {name} — {pct}% जुळणी',
        'financial': lambda name, amount: f'"{name}" मध्ये तुम्हाला {amount} पर्यंत आर्थिक मदत मिळू शकते.',
        'documents': lambda name, docs: f'"{name}" साठी आवश्यक कागदपत्रे:\n{docs}',
        'no_docs': 'सामान्य कागदपत्रे: आधार कार्ड, पॅन कार्ड, बँक पासबुक, पत्ता पुरावा, पासपोर्ट फोटो',
        'apply': lambda name, source: f'"{name}" साठी अर्ज करण्यासाठी अधिकृत वेबसाइटला भेट द्या: {source}',
        'apply_steps': lambda name, steps: f'"{name}" साठी अर्ज प्रक्रिया:\n{steps}',
        'benefits': lambda name, list_: f'"{name}" चे फायदे:\n{list_}',
        'eligible': lambda name, status, pct: f'"{name}" मध्ये तुमची पात्रता: {status} ({pct}% जुळणी)',
        'default': lambda name, pct, amount: f'तुमची सर्वोत्तम योजना "{name}" ({pct}% जुळणी).\n\n💰 {amount}\n\nतुम्ही विचारू शकता:\n• फायदे\n• कागदपत्रे\n• अर्ज कसा करावा',
    },
}


def generate_hardcoded_answer(query, language, user_profile, scheme_context, matched_schemes):
    """
    Pure hardcoded RAG answer generator.
    NO Gemini, NO external API — 100% reliable.
    """
    L = RAG_STRINGS.get(language, RAG_STRINGS['en'])
    q = (query or '').lower().strip()
    
    # Pick best scheme
    best = scheme_context
    if not best and matched_schemes:
        best = matched_schemes[0] if matched_schemes else None
    
    if not best:
        return L['no_data']
    
    name = best.get('name', 'This scheme')
    pct = best.get('match_percentage', 50)
    status = best.get('eligibility_status', 'Eligible')
    amount = best.get('max_assistance_text') or 'Financial assistance available'
    
    # ─── BEST SCHEME ───
    if any(k in q for k in ['best', 'kaunsi', 'kaun', 'top', 'recommend', 'अच्छी', 'सर्वश्रेष्ठ', 'ਵਧੀਆ', 'সেরা', 'சிறந்த', 'ఉత్తమ', 'सर्वोत्तम']):
        if matched_schemes and len(matched_schemes) > 1:
            top = matched_schemes[:3]
            lines = [L['top_schemes'](len(top)), '']
            for i, s in enumerate(top, 1):
                lines.append(L['scheme_line'](i, s.get('name', '?'), s.get('match_percentage', 0)))
                if s.get('max_assistance_text'):
                    lines.append(f'   💰 {s["max_assistance_text"]}')
                lines.append('')
            return '\n'.join(lines).strip()
        return L['best_scheme'](name, pct, amount)
    
    # ─── FINANCIAL / HOW MUCH ───
    if any(k in q for k in ['how much', 'kitni', 'kitna', 'financial', 'amount', 'money', 'कितनी', 'ਕਿੰਨੀ', 'কত', 'எவ்வளவு', 'ఎంత', 'किती']):
        return L['financial'](name, amount)
    
    # ─── DOCUMENTS ───
    if any(k in q for k in ['document', 'paper', 'docs', 'दस्तावेज़', 'ਕਾਗਜ', 'ਨਥਿ', 'ஆவண', 'పత్ర', 'कागदपत्र']):
        docs = best.get('required_documents') or []
        if docs:
            doc_list = '\n'.join([f'• {d}' for d in docs[:6]])
            return L['documents'](name, doc_list)
        return L['no_docs']
    
    # ─── HOW TO APPLY ───
    if any(k in q for k in ['apply', 'kaise', 'how to', 'application', 'process', 'आवेदन', 'ਅਰਜ਼ੀ', 'আবেদন', 'விண்ணப்ப', 'దరఖాస్తు', 'अर्ज']):
        steps = best.get('application_steps') or []
        source = best.get('official_source', '')
        if steps:
            step_list = '\n'.join([f"{s.get('step', i+1)}. {s.get('title', '')}" for i, s in enumerate(steps[:5])])
            return L['apply_steps'](name, step_list)
        return L['apply'](name, source)
    
    # ─── BENEFITS ───
    if any(k in q for k in ['benefit', 'फायदा', 'लाभ', 'ਸਹੂਲਤ', 'ਸੁਵਿਧਾ', 'সুবিধা', 'பலன்', 'ప్రయోజన', 'फायदे']):
        benefits = best.get('simple_benefits') or best.get('benefits') or []
        if benefits:
            b_list = '\n'.join([f'• {b}' for b in benefits[:5]])
            return L['benefits'](name, b_list)
        return L['financial'](name, amount)
    
    # ─── ELIGIBILITY ───
    if any(k in q for k in ['eligible', 'eligibility', 'पात्र', 'योग्य', 'ਯੋਗ', 'যোগ্য', 'தகுதி', 'అర్హత', 'पात्रता']):
        return L['eligible'](name, status, pct)
    
    # ─── DEFAULT ───
    return L['default'](name, pct, amount)


# ═══════════════════════════════════════════════════════════
# 💬 CHAT ENDPOINT — Pure hardcoded
# ═══════════════════════════════════════════════════════════
@api_bp.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json or {}
        query = data.get('query', '').strip()
        language = data.get('language', 'hi')
        user_profile = data.get('user_profile', {})
        matched_schemes = data.get('matched_schemes', [])
        scheme_context = data.get('scheme_context')
        
        if not query:
            return jsonify({'success': False, 'error': 'No query provided'}), 400
        
        print(f"💬 Chat [{language}]: {query[:80]}")
        
        answer = generate_hardcoded_answer(
            query, language, user_profile, scheme_context, matched_schemes
        )
        
        print(f"✅ Answer: {answer[:80]}")
        return jsonify({'success': True, 'answer': answer})
    
    except Exception as e:
        print(f"❌ Chat error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════
# 📋 MATCH ENDPOINT
# ═══════════════════════════════════════════════════════════
@api_bp.route('/match', methods=['POST'])
def match_schemes():
    try:
        data = request.json
        user_profile = data.get('profile', {})
        checked_docs = data.get('checked_docs', {})
        
        print(f"📥 Match request: {user_profile.get('name', 'Unknown')}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM schemes')
        schemes_raw = cursor.fetchall()
        conn.close()
        
        if not schemes_raw:
            return jsonify({'success': False, 'error': 'No schemes in database'}), 500
        
        schemes = []
        for row in schemes_raw:
            scheme = dict(row)
            for field in ['categories', 'states', 'business_types', 'support_type',
                          'benefits', 'simple_benefits', 'required_documents',
                          'application_steps', 'tags', 'target_beneficiaries']:
                if scheme.get(field):
                    try:
                        scheme[field] = json.loads(scheme[field])
                    except:
                        scheme[field] = []
            
            if not scheme.get('simple_description'):
                scheme['simple_description'] = scheme.get('description', '')
            if not scheme.get('benefits'):
                scheme['benefits'] = ['Financial assistance available']
            if not scheme.get('simple_benefits'):
                scheme['simple_benefits'] = scheme.get('benefits', [])
            if not scheme.get('required_documents'):
                scheme['required_documents'] = ['Government ID proof', 'Address proof']
            if not scheme.get('max_assistance_text'):
                scheme['max_assistance_text'] = 'Financial assistance available'
            if not scheme.get('state_or_central'):
                scheme['state_or_central'] = 'Central'
            if not scheme.get('ministry'):
                scheme['ministry'] = 'Government of India'
            
            schemes.append(scheme)
        
        # use_ai=False → pure hardcoded matching (fast!)
        matched = rank_schemes_for_user(user_profile, schemes, checked_docs=checked_docs, use_ai=False)
        print(f"✅ Matched {len(matched)} schemes (hardcoded mode)")
        
        return jsonify({'success': True, 'matches': matched, 'total': len(matched)})
    except Exception as e:
        print(f"❌ Match error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════
# 📄 DOCUMENTS, PROFILE, WHATSAPP
# ═══════════════════════════════════════════════════════════
@api_bp.route('/documents/common', methods=['GET'])
def get_common_documents():
    try:
        limit = int(request.args.get('limit', 10))
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT name, required_by_schemes FROM documents ORDER BY required_by_schemes DESC LIMIT ?', (limit,))
        docs = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        if not docs:
            docs = [
                {'name': 'Aadhaar Card', 'required_by_schemes': 65},
                {'name': 'PAN Card', 'required_by_schemes': 60},
                {'name': 'Bank Account Passbook', 'required_by_schemes': 55},
                {'name': 'Address Proof', 'required_by_schemes': 50},
                {'name': 'Passport Size Photograph', 'required_by_schemes': 48},
                {'name': 'Caste Certificate', 'required_by_schemes': 35},
                {'name': 'Income Certificate', 'required_by_schemes': 30},
                {'name': 'Business Registration / Udyam Certificate', 'required_by_schemes': 25},
                {'name': 'Educational Qualification Certificate', 'required_by_schemes': 20},
                {'name': 'GST Registration Certificate', 'required_by_schemes': 15},
            ]
        return jsonify({'success': True, 'documents': docs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/profile', methods=['POST'])
def save_profile():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO user_profiles 
            (name, age, gender, category, annual_income, state, district, 
             education, employment_status, disability_status, minority_status,
             business_status, business_type, approx_investment, support_requirement,
             business_description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('name'), data.get('age'), data.get('gender'), data.get('category'),
            data.get('annual_income'), data.get('state'), data.get('district'),
            data.get('education'), data.get('employment_status'), data.get('disability_status'),
            data.get('minority_status'), data.get('business_status'), data.get('business_type'),
            data.get('approx_investment'), data.get('support_requirement'),
            data.get('business_description', '')
        ))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/whatsapp/pair', methods=['POST'])
def whatsapp_pair():
    try:
        data = request.json
        whatsapp_service = WhatsAppService()
        session = whatsapp_service.create_session(
            profile=data.get('profile', {}),
            matched_schemes=data.get('matched_schemes', []),
            saved_schemes=data.get('saved_schemes', [])
        )
        return jsonify({'success': True, 'session': session})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500