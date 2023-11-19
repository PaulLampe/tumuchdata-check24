from fastapi import FastAPI, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.types import PatchRequest, PatchResponse 
from app.database import Database 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database = Database()

@app.get("/craftman/{craftman_id}")
async def getCraftsman(craftman_id: str):
    return database.getSingleCraftsman(craftman_id)

@app.get("/craftsmen")
async def getCraftsmen(postalcode: str = Query(...), limit: str = Query(20), skip: str = Query(0)):
    return database.getCraftsmen(postalcode, limit, skip)

@app.get("/craftsmen_range")
async def getCraftsmen(postalcodes: str = Query(...)):
    return database.getCraftsmenRange(postalcodes, 40)

@app.patch("/craftman/{craftman_id}")
async def patchCraftman(craftman_id: str, patch_request: PatchRequest) -> PatchResponse:
    database.updateCraftsman(craftman_id, patch_request)
    return {"id": craftman_id, "updated": patch_request}

@app.websocket("/update_notifier")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket.send_text(f"Message text was: {data}")