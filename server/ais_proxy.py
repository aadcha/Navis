#!/usr/bin/env python3
"""
AIS Stream WebSocket Proxy - Python version
Uses the same working AIS connection as your Colab script.
Relays ship data to the Navis React app.
"""
import asyncio
import json
import websockets
import os

API_KEY = os.environ.get("VITE_AISSTREAM_API_KEY", "bcc3ddc426b8b153e0070d754b018439dd425e40")
try:
    with open(os.path.join(os.path.dirname(__file__), "..", ".env")) as f:
        for line in f:
            if line.startswith("VITE_AISSTREAM_API_KEY="):
                API_KEY = line.split("=", 1)[1].strip()
                break
except Exception:
    pass

AIS_URI = "wss://stream.aisstream.io/v0/stream"
PROXY_PORT = int(os.environ.get("AIS_PROXY_PORT", "3002"))

# Connected frontend clients
clients = set()


async def ais_stream():
    """Connect to AIS Stream and broadcast to all connected clients."""
    while True:
        try:
            async with websockets.connect(AIS_URI) as ws:
                await ws.send(json.dumps({
                    "APIKey": API_KEY,
                    "BoundingBoxes": [[[-90, -180], [90, 180]]],
                    "FilterMessageTypes": ["PositionReport", "ShipStaticData", "StaticDataReport",
                                           "ExtendedClassBPositionReport", "StandardClassBPositionReport"]
                }))
                print("[AIS] Connected to stream, relaying...")

                async for msg_json in ws:
                    for client in list(clients):
                        try:
                            await client.send(msg_json)
                        except Exception:
                            clients.discard(client)
        except Exception as e:
            print(f"[AIS] Error: {e}, reconnecting in 5s...")
            await asyncio.sleep(5)


async def handle_client(websocket, path):
    """Handle incoming WebSocket connection from frontend."""
    if path != "/ais":
        await websocket.close(4004, "Use path /ais")
        return
    clients.add(websocket)
    print(f"[Proxy] Client connected ({len(clients)} total)")
    try:
        async for _ in websocket:
            pass
    finally:
        clients.discard(websocket)
        print(f"[Proxy] Client disconnected ({len(clients)} remaining)")


async def main():
    # Start AIS stream in background
    asyncio.create_task(ais_stream())
    # Start proxy server
    async with websockets.serve(handle_client, "127.0.0.1", PROXY_PORT):
        print(f"[Proxy] ws://localhost:{PROXY_PORT}/ais")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
