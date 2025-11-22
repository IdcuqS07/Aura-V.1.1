#!/usr/bin/env python3
"""Test WebSocket connection"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8080/ws/monitor"
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected!")
            print("Listening for events...")
            
            async for message in websocket:
                data = json.loads(message)
                print(f"\n📡 Event: {data['type']}")
                print(f"   Data: {json.dumps(data['data'], indent=2)}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
