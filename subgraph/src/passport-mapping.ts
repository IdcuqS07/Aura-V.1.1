import { BigInt } from "@graphprotocol/graph-ts"
import { PassportIssued, ScoreUpdated } from "../generated/CreditPassport/CreditPassport"
import { Passport, ScoreUpdate, GlobalStats } from "../generated/schema"

export function handlePassportIssued(event: PassportIssued): void {
  let passport = new Passport(event.params.tokenId.toString())
  passport.tokenId = event.params.tokenId
  passport.owner = event.params.owner
  passport.creditScore = event.params.creditScore
  passport.pohScore = BigInt.fromI32(0)
  passport.badgeCount = BigInt.fromI32(0)
  passport.onchainActivity = BigInt.fromI32(0)
  passport.issuedAt = event.block.timestamp
  passport.lastUpdated = event.block.timestamp
  passport.txHash = event.transaction.hash
  passport.save()

  let stats = GlobalStats.load("global")
  if (stats == null) {
    stats = new GlobalStats("global")
    stats.totalBadges = BigInt.fromI32(0)
    stats.totalPassports = BigInt.fromI32(0)
    stats.totalUsers = BigInt.fromI32(0)
    stats.averageCreditScore = BigInt.fromI32(0)
  }
  stats.totalPassports = stats.totalPassports.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleScoreUpdated(event: ScoreUpdated): void {
  let passport = Passport.load(event.params.tokenId.toString())
  if (passport != null) {
    let update = new ScoreUpdate(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
    update.passport = passport.id
    update.oldScore = passport.creditScore
    update.newScore = event.params.newScore
    update.timestamp = event.block.timestamp
    update.txHash = event.transaction.hash
    update.save()

    passport.creditScore = event.params.newScore
    passport.lastUpdated = event.block.timestamp
    passport.save()
  }
}
