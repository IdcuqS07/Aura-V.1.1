import { BigInt } from "@graphprotocol/graph-ts"
import { BadgeMinted } from "../generated/SimpleZKBadge/SimpleZKBadge"
import { Badge, User, GlobalStats } from "../generated/schema"

export function handleBadgeMinted(event: BadgeMinted): void {
  let badge = new Badge(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  badge.tokenId = event.params.tokenId
  badge.owner = event.params.to
  badge.badgeType = event.params.badgeType
  badge.zkProofHash = event.params.zkProofHash
  badge.issuedAt = event.block.timestamp
  badge.txHash = event.transaction.hash
  badge.save()

  let user = User.load(event.params.to.toHexString())
  if (user == null) {
    user = new User(event.params.to.toHexString())
    user.address = event.params.to
    user.totalBadges = BigInt.fromI32(0)
    user.createdAt = event.block.timestamp
  }
  user.totalBadges = user.totalBadges.plus(BigInt.fromI32(1))
  user.save()

  let stats = GlobalStats.load("global")
  if (stats == null) {
    stats = new GlobalStats("global")
    stats.totalBadges = BigInt.fromI32(0)
    stats.totalPassports = BigInt.fromI32(0)
    stats.totalUsers = BigInt.fromI32(0)
    stats.averageCreditScore = BigInt.fromI32(0)
  }
  stats.totalBadges = stats.totalBadges.plus(BigInt.fromI32(1))
  stats.save()
}
