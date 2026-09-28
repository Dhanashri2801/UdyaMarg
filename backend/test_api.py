import unittest
import json
from app import app
from database.db import init_db

class TestSIH26092Platform(unittest.TestCase):
    def setUp(self):
        init_db()
        self.app = app.test_client()

    def test_get_all_50_schemes(self):
        response = self.app.get('/api/schemes')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertGreaterEqual(data['count'], 50)

    def test_matching_engine_50_schemes(self):
        test_profile = {
            "name": "Sunita Rani",
            "age": 30,
            "gender": "Female",
            "category": "ST",
            "annual_income": 180000,
            "state": "Punjab",
            "district": "Ludhiana",
            "business_status": "New business",
            "business_type": "Manufacturing",
            "support_requirement": "Business loan",
            "approx_investment": 200000
        }
        response = self.app.post('/api/match', json={'profile': test_profile})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertGreaterEqual(data['total_schemes_evaluated'], 50)
        
        top_match = data['matches'][0]
        self.assertIn('eligibility_status', top_match)
        self.assertIn('disclaimer', top_match)

    def test_strict_rag_voice_assistant(self):
        # 1. Valid Query from Database
        response = self.app.post('/api/chat', json={
            'query': 'What is the maximum subsidy under PMEGP?',
            'user_profile': {'category': 'OBC'},
            'scheme_context': {'name': 'Prime Minister Employment Generation Programme', 'max_assistance_text': 'Up to 35% subsidy', 'required_documents': ['Aadhaar', 'PAN']}
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('answer', data)

        # 2. Out of Scope Query -> Strict RAG Fallback
        response_out = self.app.post('/api/chat', json={
            'query': 'Tell me crypto bitcoin price or weather in London',
            'user_profile': {},
            'scheme_context': None
        })
        data_out = json.loads(response_out.data)
        self.assertIn("I don't have verified information about that in my current scheme database.", data_out['answer'])

    def test_whatsapp_pairing_session(self):
        response = self.app.post('/api/whatsapp/pair', json={
            'user_id': 'user_123',
            'profile': {'name': 'Sunita'},
            'matched_schemes': [{'name': 'PMEGP', 'match_percentage': 92}]
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('pairing_code', data['session'])
        self.assertTrue(data['session']['pairing_code'].startswith('UDYAM-'))

if __name__ == '__main__':
    unittest.main()
