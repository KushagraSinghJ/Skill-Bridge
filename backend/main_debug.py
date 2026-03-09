from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.user import router as user_router
from routes.opportunities import router as opportunities_router

app = FastAPI(title="SkillBridge Backend (Python)")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For debugging, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router, prefix="/api/auth", tags=["Auth"])
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(opportunities_router, prefix="/api/opportunities", tags=["Opportunities"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "SkillBridge Python Backend Running"}

if __name__ == "__main__":
    import uvicorn
    # Disable reload for debug testing to avoid race conditions
    uvicorn.run(app, host="0.0.0.0", port=8001)
