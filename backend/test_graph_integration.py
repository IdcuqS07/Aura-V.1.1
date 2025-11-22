"""
Test script for The Graph integration
Tests GraphQL queries and caching
"""

import asyncio
from graph_client import GraphClient
from graph_cache import cached_query, get_cache_stats, invalidate_cache

async def test_graph_client():
    """Test GraphQL client functionality"""
    print("🧪 Testing The Graph Integration\n")
    
    client = GraphClient()
    
    # Test wallet address (replace with actual deployed data)
    test_wallet = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
    
    print("1️⃣ Testing get_user_badges...")
    badges = await client.get_user_badges(test_wallet)
    print(f"   ✅ Found {len(badges)} badges")
    if badges:
        print(f"   📛 First badge: {badges[0]}")
    
    print("\n2️⃣ Testing get_user_passport...")
    passport = await client.get_user_passport(test_wallet)
    if passport:
        print(f"   ✅ Passport found: Score {passport.get('creditScore', 0)}")
        print(f"   📊 Details: {passport}")
    else:
        print("   ⚠️  No passport found")
    
    print("\n3️⃣ Testing get_score_history...")
    history = await client.get_score_history(test_wallet)
    print(f"   ✅ Found {len(history)} score updates")
    if history:
        print(f"   📈 Latest update: {history[0]}")
    
    print("\n4️⃣ Testing get_defi_activity...")
    activity = await client.get_defi_activity(test_wallet)
    print(f"   ✅ DeFi Activity:")
    print(f"   💰 Total Badges: {activity.get('total_badges', 0)}")
    print(f"   📊 Credit Score: {activity.get('credit_score', 0)}")
    print(f"   🏆 Badge Breakdown: {activity.get('badge_breakdown', {})}")
    
    print("\n5️⃣ Testing get_global_stats...")
    stats = await client.get_global_stats()
    if stats:
        print(f"   ✅ Global Stats:")
        print(f"   👥 Total Users: {stats.get('totalUsers', 0)}")
        print(f"   🎫 Total Badges: {stats.get('totalBadges', 0)}")
        print(f"   📋 Total Passports: {stats.get('totalPassports', 0)}")
        print(f"   ⭐ Average Score: {stats.get('averageScore', 0)}")
    else:
        print("   ⚠️  No global stats found")
    
    print("\n6️⃣ Testing search_high_score_users...")
    high_scores = await client.search_high_score_users(700)
    print(f"   ✅ Found {len(high_scores)} users with score >= 700")
    if high_scores:
        print(f"   🏆 Top user: {high_scores[0]}")
    
    await client.close()
    print("\n✅ All tests completed!")

async def test_caching():
    """Test caching functionality"""
    print("\n\n🧪 Testing Cache Layer\n")
    
    client = GraphClient()
    test_wallet = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
    
    print("1️⃣ First query (no cache)...")
    data1 = await cached_query(
        "badges",
        {"wallet": test_wallet},
        lambda: client.get_user_badges(test_wallet)
    )
    print(f"   ✅ Retrieved {len(data1)} badges")
    
    print("\n2️⃣ Second query (from cache)...")
    data2 = await cached_query(
        "badges",
        {"wallet": test_wallet},
        lambda: client.get_user_badges(test_wallet)
    )
    print(f"   ✅ Retrieved {len(data2)} badges (cached)")
    
    print("\n3️⃣ Cache stats...")
    stats = get_cache_stats()
    print(f"   📊 Total entries: {stats['total_entries']}")
    print(f"   ✅ Active entries: {stats['active_entries']}")
    print(f"   🗂️  Cache types: {stats['cache_types']}")
    
    print("\n4️⃣ Invalidating cache...")
    invalidate_cache("badges")
    stats = get_cache_stats()
    print(f"   ✅ Cache cleared")
    print(f"   📊 Remaining entries: {stats['total_entries']}")
    
    await client.close()
    print("\n✅ Cache tests completed!")

async def main():
    """Run all tests"""
    try:
        await test_graph_client()
        await test_caching()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
