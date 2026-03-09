from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from auth.jwt_handler import decodeJWT
from database import users_collection
from realtime import manager
from routes.applications import router as applications_router
from routes.matches import router as matches_router
from routes.messages import router as messages_router
from routes.notifications import router as notifications_router
from routes.opportunities import router as opportunities_router
from routes.user import router as user_router

app = FastAPI(title="SkillBridge Backend (Python)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/auth", tags=["Auth"])
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(opportunities_router, prefix="/api/opportunities", tags=["Opportunities"])
app.include_router(applications_router, prefix="/api/applications", tags=["Applications"])
app.include_router(matches_router, prefix="/api/matches", tags=["Matches"])
app.include_router(messages_router, prefix="/api/messages", tags=["Messages"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4401)
        return

    decoded = decodeJWT(token)
    if not decoded:
        await websocket.close(code=4401)
        return

    user = await users_collection.find_one({"email": decoded["email"]})
    if not user:
        await websocket.close(code=4404)
        return

    user_id = str(user["_id"])
    await manager.connect(user_id, websocket)
    try:
        while True:
            message = await websocket.receive_text()
            if message == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)


@app.get("/", tags=["Root"])
async def root():
    return {"message": "SkillBridge Python Backend Running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
