import { PositionChanged } from "../../generated/ClearingHouse/ClearingHouse";
import { PositionChange } from "../../generated/schema";

// TODO: most of these parameters might not be necessary, just for now
export function handlePositionChanged(event: PositionChanged): void {
  let position = new PositionChange(event.transaction.hash.toHex());

  position.timestamp = event.block.timestamp.toI32();
  position.trader = event.params.trader;
  position.amm = event.params.amm;
  position.margin = event.params.margin;
  position.notional = event.params.positionNotional;
  position.exchangedSize = event.params.exchangedPositionSize;
  position.fee = event.params.fee;
  position.sizeAfter = event.params.positionSizeAfter;
  position.realizedPnl = event.params.realizedPnl;
  position.unrealizedPnlAfter = event.params.unrealizedPnlAfter;
  position.badDebt = event.params.badDebt;
  position.liquidationPenalty = event.params.liquidationPenalty;
  position.spotPrice = event.params.spotPrice;
  position.fundingPayment = event.params.fundingPayment;

  position.save();
}
