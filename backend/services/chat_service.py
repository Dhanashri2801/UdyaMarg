import os
import json

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

class ChatAssistantService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = None
        if self.api_key and GEMINI_AVAILABLE:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Gemini init error: {e}")

    def generate_answer(self, query, user_profile=None, scheme_context=None, matched_schemes=None, language="Hindi/Hinglish"):
        query_str = query.strip() if query else ""
        if not query_str:
            return "Kripya apna prashna puchein."

        relevant_records = []
        if scheme_context:
            relevant_records.append(scheme_context)
        if matched_schemes:
            for s in matched_schemes[:5]:
                if s not in relevant_records:
                    relevant_records.append(s)

        q_lower = query_str.lower()
        matched_db_facts = []

        for record in relevant_records:
            rec_name = str(record.get('name') or '').lower()
            if rec_name and rec_name in q_lower:
                matched_db_facts.append({
                    "name": record.get("name"),
                    "match_score": record.get("match_percentage"),
                    "eligibility_status": record.get("eligibility_status"),
                    "benefits": record.get("simple_benefits", record.get("benefits")),
                    "max_assistance": record.get("max_assistance_text"),
                    "required_documents": record.get("required_documents"),
                    "application_steps": record.get("application_steps"),
                    "official_source": record.get("official_source")
                })

        out_of_scope = ["crypto", "bitcoin", "weather", "cricket", "movie", "chatgpt", "recipe"]
        if any(k in q_lower for k in out_of_scope):
            return "I don't have verified information about that in my current scheme database."

        if self.client:
            try:
                system_instruction = (
                    "STRICT RULE: You are the UdyamAI Government Scheme Voice Assistant. "
                    "Answer ONLY using the provided context. NEVER invent facts. "
                    "If information not in context, respond: 'I don't have verified information about that.' "
                    f"Keep answer concise (2-4 sentences) in {language}."
                )
                context_payload = {
                    "User_Profile": user_profile or {},
                    "Verified_Database_Context": matched_db_facts if matched_db_facts else relevant_records[:3]
                }
                prompt = f"{system_instruction}\n\nVERIFIED CONTEXT:\n{json.dumps(context_payload, indent=2)}\n\nUSER QUESTION: {query_str}"
                
                response = self.client.interactions.create(
                    model="gemini-3.7-flash",
                    input=prompt
                )
                if response and response.output_text:
                    return response.output_text
            except Exception as e:
                print(f"Gemini error: {e}")

        # Fallback
        if "best" in q_lower or "kaunsi" in q_lower or "recommend" in q_lower:
            if matched_schemes and len(matched_schemes) > 0:
                top = matched_schemes[0]
                return f"Aapki profile ke according, sabse achhi scheme '{top['name']}' hai jisme aapka {top['match_percentage']}% match hai. Financial assistance: {top.get('max_assistance_text', 'Available')}."
        
        if "document" in q_lower or "kya lagage" in q_lower:
            if scheme_context and 'required_documents' in scheme_context:
                docs = scheme_context['required_documents'][:4]
                return f"'{scheme_context.get('name', 'Scheme')}' ke liye documents: {', '.join(docs)}."

        if "apply" in q_lower or "kaise" in q_lower:
            if scheme_context and 'application_steps' in scheme_context:
                steps = scheme_context['application_steps']
                first_step = steps[0]['description'] if steps else "Official portal par jao."
                return f"Apply: {first_step} Link: {scheme_context.get('official_source', '')}"

        if "benefit" in q_lower or "kitni" in q_lower:
            if scheme_context and 'max_assistance_text' in scheme_context:
                return f"'{scheme_context.get('name', 'Scheme')}' me: {scheme_context['max_assistance_text']}"

        if matched_schemes and len(matched_schemes) > 0:
            top = matched_schemes[0]
            return f"'{top['name']}' sabse suitable ({top['match_percentage']}% match). Details button par click karein."

        return "I don't have verified information about that in my current scheme database."