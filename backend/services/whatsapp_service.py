import random
import json
from database.db import get_db_connection

class WhatsAppService:
    @staticmethod
    def generate_pairing_session(user_id, profile_data, matched_schemes, saved_schemes=None):
        code_number = random.randint(1000, 9999)
        pairing_code = f"UDYAM-{code_number}"
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO whatsapp_sessions (pairing_code, user_id, profile_data, matched_schemes, saved_schemes)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(pairing_code) DO UPDATE SET
                profile_data=excluded.profile_data,
                matched_schemes=excluded.matched_schemes,
                saved_schemes=excluded.saved_schemes
        ''', (
            pairing_code,
            user_id,
            json.dumps(profile_data),
            json.dumps(matched_schemes[:5]),
            json.dumps(saved_schemes or [])
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "pairing_code": pairing_code,
            "status": "Session Paired",
            "qr_data": f"https://wa.me/919999999999?text=CONNECT%20{pairing_code}",
            "instruction": f"Send 'CONNECT {pairing_code}' to our official WhatsApp Business Assistant to sync your 65+ scheme match recommendations.",
            "disclaimer": "WhatsApp Integration. Preserved profile & scheme recommendations."
        }

    @staticmethod
    def get_session(pairing_code):
        conn = get_db_connection()
        session = conn.execute("SELECT * FROM whatsapp_sessions WHERE pairing_code = ?", (pairing_code,)).fetchone()
        conn.close()
        
        if not session:
            return None
            
        return {
            "pairing_code": session["pairing_code"],
            "user_id": session["user_id"],
            "profile_data": json.loads(session["profile_data"]),
            "matched_schemes": json.loads(session["matched_schemes"]),
            "saved_schemes": json.loads(session["saved_schemes"] or '[]')
        }