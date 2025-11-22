import asyncio
from blockchain import polygon_integration

async def test():
    result = await polygon_integration.mint_badge(
        "0xC3EcE9AC328CB232dDB0BC677d2e980a1a3D3974",
        "Test Badge",
        "test_proof_123"
    )
    print(f"Result: {result}")

asyncio.run(test())
