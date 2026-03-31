from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI(redirect_slashes=False)

@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "ok"}

client = TestClient(app)

def test_health_head():
    response = client.head("/health")
    print(f"HEAD status: {response.status_code}")
    print(f"HEAD headers: {response.headers}")
    print(f"Allow header: {response.headers.get('Allow')}")

def test_health_get():
    response = client.get("/health")
    print(f"GET status: {response.status_code}")
    print(f"GET body: {response.json()}")

if __name__ == "__main__":
    test_health_head()
    test_health_get()
