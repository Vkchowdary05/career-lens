import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings


def _init_firebase():
    if not firebase_admin._apps:
        # Production on Render: provide the entire JSON content as an env var
        # named FIREBASE_ADMIN_KEY_JSON to avoid file-system issues.
        key_json = os.environ.get("FIREBASE_ADMIN_KEY_JSON")
        if key_json:
            cred_dict = json.loads(key_json)
            cred = credentials.Certificate(cred_dict)
        else:
            # Local development: use the JSON file path from .env
            cred = credentials.Certificate(settings.FIREBASE_ADMIN_KEY_PATH)
        firebase_admin.initialize_app(cred)


_init_firebase()


async def verify_firebase_token(token: str) -> dict | None:
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        return None