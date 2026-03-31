import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings

def _init_firebase():
    if not firebase_admin._apps:
        try:
            # Production on Render: provide the entire JSON content as an env var
            # named FIREBASE_ADMIN_KEY_JSON to avoid file-system issues.
            key_json = os.environ.get("FIREBASE_ADMIN_KEY_JSON")
            if key_json:
                cred_dict = json.loads(key_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
            else:
                # Local development: use the JSON file path from .env
                if os.path.exists(settings.FIREBASE_ADMIN_KEY_PATH):
                    cred = credentials.Certificate(settings.FIREBASE_ADMIN_KEY_PATH)
                    firebase_admin.initialize_app(cred)
                else:
                    print(f"[CareerLens] WARNING: Firebase admin key not found at {settings.FIREBASE_ADMIN_KEY_PATH} and FIREBASE_ADMIN_KEY_JSON not set. Firebase auth will fail.")
        except Exception as e:
            print(f"[CareerLens] ERROR initializing Firebase: {e}")

_init_firebase()

async def verify_firebase_token(token: str) -> dict | None:
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        return None
