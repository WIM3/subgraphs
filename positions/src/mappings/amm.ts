import { FundingRateUpdated, ReserveSnapshotted } from "../../generated/templates/Amm/Amm";
import { Amm } from "../../generated/schema";

export function handleFundingRateUpdated(event: FundingRateUpdated): void {
  let amm = Amm.load(event.address.toHex());

  if (amm) {
    amm.timestamp = event.block.timestamp.toI32();
    amm.fundingRate = event.params.rate;
    amm.underlyingPrice = event.params.underlyingPrice;

    amm.save();
  }
}

export function handleReserveSnapshotted(event: ReserveSnapshotted): void {
  let amm = Amm.load(event.address.toHex());

  if (amm) {
    amm.timestamp = event.block.timestamp.toI32();
    amm.baseAssetReserve = event.params.baseAssetReserve;
    amm.quoteAssetReserve = event.params.quoteAssetReserve;

    amm.save();
  }
}
