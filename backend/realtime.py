from collections import defaultdict
from typing import DefaultDict, List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: DefaultDict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id not in self.active_connections:
            return
        self.active_connections[user_id] = [
            conn for conn in self.active_connections[user_id] if conn is not websocket
        ]
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: str, payload: dict):
        stale_connections: List[WebSocket] = []
        for connection in self.active_connections.get(user_id, []):
            try:
                await connection.send_json(payload)
            except Exception:
                stale_connections.append(connection)

        if stale_connections:
            for stale in stale_connections:
                self.disconnect(user_id, stale)


manager = ConnectionManager()
