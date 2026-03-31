from fastapi import FastAPI
try:
    app = FastAPI(redirect_slashes=False)
    with open('out.txt', 'w') as f:
        f.write('OKAY')
except Exception as e:
    with open('out.txt', 'w') as f:
        f.write(str(e))
