# backend/services/voice_service.py

import os
import requests
from typing import Dict, Optional

BHASHINI_API_KEY = os.getenv("BHASHINI_API_KEY", "")
BHASHINI_USER_ID = os.getenv("BHASHINI_USER_ID", "")

# Bhashini ULCA pipeline IDs
ULCA_CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
PIPELINE_ID = ""

LANG_MAP = {
    'hi': 'hi', 'en': 'en', 'pa': 'pa', 'bn': 'bn',
    'ta': 'ta', 'te': 'te', 'mr': 'mr',
}


class VoiceService:
    def __init__(self):
        self.api_key = BHASHINI_API_KEY
        self.user_id = BHASHINI_USER_ID
        self._config_cache = {}
    
    def _get_pipeline_config(self, task_type: str, language: str) -> Optional[Dict]:
        """Get Bhashini pipeline config (serviceId + inference URL + auth)"""
        if not self.api_key or not self.user_id:
            return None
        
        cache_key = f"{task_type}_{language}"
        if cache_key in self._config_cache:
            return self._config_cache[cache_key]
        
        try:
            payload = {
                "pipelineTasks": [{
                    "taskType": task_type,
                    "config": {"language": {"sourceLanguage": language}}
                }],
                "pipelineRequestConfig": {"pipelineId": PIPELINE_ID}
            }
            headers = {
                "userID": self.user_id,
                "ulcaApiKey": self.api_key,
                "Content-Type": "application/json"
            }
            
            r = requests.post(ULCA_CONFIG_URL, json=payload, headers=headers, timeout=15)
            r.raise_for_status()
            data = r.json()
            
            # Extract service ID
            service_id = None
            for task_cfg in data.get("pipelineResponseConfig", []):
                if task_cfg.get("taskType") == task_type:
                    configs = task_cfg.get("config") or []
                    if configs:
                        service_id = configs[0].get("serviceId")
                    break
            
            # Extract inference endpoint
            endpoint = data.get("pipelineInferenceAPIEndPoint", {})
            inference_url = endpoint.get("callbackUrl")
            auth_cfg = endpoint.get("inferenceApiKey", {})
            auth_name = auth_cfg.get("name")
            auth_value = auth_cfg.get("value")
            
            if not all([service_id, inference_url, auth_name, auth_value]):
                print(f"⚠️ Incomplete Bhashini config for {task_type}/{language}")
                return None
            
            config = {
                "service_id": service_id,
                "inference_url": inference_url,
                "auth_name": auth_name,
                "auth_value": auth_value,
            }
            self._config_cache[cache_key] = config
            return config
        except Exception as e:
            print(f"❌ Bhashini config error: {e}")
            return None
    
    def synthesize_speech(self, text: str, language_code: str = 'hi') -> Dict:
        """Convert text to speech using Bhashini TTS"""
        if not text or not text.strip():
            return {'error': 'No text'}
        
        lang = LANG_MAP.get(language_code, 'hi')
        config = self._get_pipeline_config('tts', lang)
        
        if not config:
            return {'fallback': True, 'reason': 'Bhashini not configured'}
        
        try:
            payload = {
                "pipelineTasks": [{
                    "taskType": "tts",
                    "config": {
                        "language": {"sourceLanguage": lang},
                        "serviceId": config["service_id"],
                        "gender": "female",
                        "samplingRate": 22050
                    }
                }],
                "inputData": {"input": [{"source": text}]}
            }
            headers = {
                config["auth_name"]: config["auth_value"],
                "Content-Type": "application/json"
            }
            
            r = requests.post(config["inference_url"], json=payload, headers=headers, timeout=30)
            r.raise_for_status()
            data = r.json()
            
            audios = data.get("pipelineResponse", [{}])[0].get("audio", [])
            if audios and audios[0].get("audioContent"):
                return {
                    "audio_base64": audios[0]["audioContent"],
                    "format": "wav"
                }
            return {'fallback': True, 'reason': 'No audio returned'}
        except Exception as e:
            print(f"❌ Bhashini TTS error: {e}")
            return {'fallback': True, 'reason': str(e)}
    
    def speech_to_text(self, audio_base64: str, language_code: str = 'hi') -> Dict:
        """Convert speech to text using Bhashini ASR"""
        if not audio_base64:
            return {'success': False, 'text': ''}
        
        lang = LANG_MAP.get(language_code, 'hi')
        config = self._get_pipeline_config('asr', lang)
        
        if not config:
            return {'success': False, 'text': '', 'error': 'Bhashini not configured'}
        
        try:
            payload = {
                "pipelineTasks": [{
                    "taskType": "asr",
                    "config": {
                        "language": {"sourceLanguage": lang},
                        "serviceId": config["service_id"],
                        "audioFormat": "wav",
                        "samplingRate": 16000
                    }
                }],
                "inputData": {"audio": [{"audioContent": audio_base64}]}
            }
            headers = {
                config["auth_name"]: config["auth_value"],
                "Content-Type": "application/json"
            }
            
            r = requests.post(config["inference_url"], json=payload, headers=headers, timeout=30)
            r.raise_for_status()
            data = r.json()
            
            outputs = data.get("pipelineResponse", [{}])[0].get("output", [])
            if outputs and outputs[0].get("source"):
                return {'success': True, 'text': outputs[0]['source']}
            return {'success': False, 'text': '', 'error': 'No transcript'}
        except Exception as e:
            print(f"❌ Bhashini ASR error: {e}")
            return {'success': False, 'text': '', 'error': str(e)}