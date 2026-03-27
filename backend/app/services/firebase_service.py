import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings

def _init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_ADMIN_KEY_PATH)
        firebase_admin.initialize_app(cred)

_init_firebase()

async def verify_firebase_token(token: str) -> dict | None:
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        return None
