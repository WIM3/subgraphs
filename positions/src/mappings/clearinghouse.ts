import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  PositionChanged,
  PositionLiquidated,
  MarginChanged,
} from "../../generated/ClearingHouse/ClearingHouse";
import {
  Position,
  PositionChange,
  PositionLiquidation,
  MarginChange,
  Amm,
} from "../../generated/schema";
import { ZERO_BI, decimal } from "../utils/common";

function calcNewAmmOpenNotional(position: Position, event: PositionChanged): BigInt {
  let signedOpenNotional = position.size.ge(ZERO_BI)
    ? position.openNotional
    : position.openNotional.neg();

  return signedOpenNotional
    .plus(event.params.realizedPnl)
    .plus(
      event.params.exchangedPositionSize.ge(ZERO_BI)
        ? event.params.positionNotional
        : event.params.positionNotional.neg()
    )
    .abs();
}

function parsePositionId(trader: Address, amm: Address): string {
  return trader.toHex() + "-" + amm.toHex();
}

function getPosition(trader: Address, amm: Address): Position {
  let id = parsePositionId(trader, amm);
  let position = Position.load(id);

  if (!position) {
    position = new Position(id);

    position.timestamp = 0;
    position.trader = trader;
    position.amm = amm;
    position.margin = ZERO_BI;
    position.openNotional = ZERO_BI;
    position.size = ZERO_BI;
    position.tradingVolume = ZERO_BI;
    position.leverage = ZERO_BI;
    position.entryPrice = ZERO_BI;
    position.underlyingPrice = ZERO_BI;
    position.fee = ZERO_BI;
    position.realizedPnl = ZERO_BI;
    position.unrealizedPnl = ZERO_BI;
    position.badDebt = ZERO_BI;
    position.liquidationPenalty = ZERO_BI;
    position.fundingPayment = ZERO_BI;
    position.totalPnlAmount = ZERO_BI;

    position.save();
  }

  return position;
}

export function handlePositionChanged(event: PositionChanged): void {
  let timestamp = event.block.timestamp.toI32();
  let position = getPosition(event.params.trader, event.params.amm);
  let change = new PositionChange(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  let amm = Amm.load(event.params.amm.toHex());

  position.timestamp = timestamp;
  position.margin = event.params.margin;
  position.openNotional = calcNewAmmOpenNotional(position, event);
  position.size = event.params.positionSizeAfter;
  position.tradingVolume = position.tradingVolume.plus(event.params.positionNotional);
  position.leverage = position.margin.isZero()
    ? ZERO_BI
    : decimal.div(position.openNotional, position.margin);
  position.entryPrice = position.size.isZero()
    ? ZERO_BI
    : decimal.div(position.openNotional, position.size).abs();
  position.realizedPnl = position.realizedPnl.plus(event.params.realizedPnl);
  position.unrealizedPnl = event.params.unrealizedPnlAfter;
  position.fundingPayment = position.fundingPayment.plus(event.params.fundingPayment);
  position.fee = position.fee.plus(event.params.fee);
  position.badDebt = position.badDebt.plus(event.params.badDebt);
  position.liquidationPenalty = position.liquidationPenalty.plus(event.params.liquidationPenalty);
  position.totalPnlAmount = position.totalPnlAmount
    .plus(event.params.realizedPnl)
    .minus(event.params.fundingPayment)
    .minus(event.params.fee)
    .minus(event.params.liquidationPenalty)
    .plus(event.params.badDebt);

  change.position = position.id;
  change.timestamp = timestamp;
  change.trader = event.params.trader;
  change.amm = event.params.amm;
  change.margin = event.params.margin;
  change.notional = event.params.positionNotional;
  change.exchangedSize = event.params.exchangedPositionSize;
  change.fee = event.params.fee;
  change.sizeAfter = event.params.positionSizeAfter;
  change.realizedPnl = event.params.realizedPnl;
  change.unrealizedPnlAfter = event.params.unrealizedPnlAfter;
  change.badDebt = event.params.badDebt;
  change.liquidationPenalty = event.params.liquidationPenalty;
  change.spotPrice = event.params.spotPrice;
  change.fundingPayment = event.params.fundingPayment;
  change.leverage = position.leverage;
  change.entryPrice = position.entryPrice;
  change.underlyingPrice = ZERO_BI;

  if (amm) {
    position.underlyingPrice = amm.underlyingPrice;
    change.underlyingPrice = amm.underlyingPrice;

    amm.timestamp = timestamp;
    amm.positionBalance = amm.positionBalance.plus(event.params.exchangedPositionSize);
    amm.tradingVolume = amm.tradingVolume.plus(event.params.positionNotional);

    amm.save();
  }

  change.save();
  position.save();
}

export function handlePositionLiquidated(event: PositionLiquidated): void {
  let liquidation = new PositionLiquidation(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  liquidation.position = parsePositionId(event.params.trader, event.params.amm);
  liquidation.timestamp = event.block.timestamp.toI32();
  liquidation.trader = event.params.trader;
  liquidation.amm = event.params.amm;
  liquidation.notional = event.params.positionNotional;
  liquidation.size = event.params.positionSize;
  liquidation.liquidationFee = event.params.liquidationFee;
  liquidation.liquidator = event.params.liquidator;
  liquidation.badDebt = event.params.badDebt;

  liquidation.save();
}

export function handleMarginChanged(event: MarginChanged): void {
  let timestamp = event.block.timestamp.toI32();
  let position = getPosition(event.params.sender, event.params.amm);
  let marginChange = new MarginChange(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  let amm = Amm.load(event.params.amm.toHex());

  position.timestamp = timestamp;
  position.margin = position.margin.plus(event.params.amount);
  position.fundingPayment = position.fundingPayment.plus(event.params.fundingPayment);
  position.totalPnlAmount = position.totalPnlAmount.minus(event.params.fundingPayment);

  marginChange.position = position.id;
  marginChange.timestamp = timestamp;
  marginChange.sender = event.params.sender;
  marginChange.amm = event.params.amm;
  marginChange.amount = event.params.amount;
  marginChange.fundingPayment = event.params.fundingPayment;
  marginChange.leverage = position.leverage;
  marginChange.entryPrice = position.entryPrice;
  marginChange.underlyingPrice = ZERO_BI;

  if (amm) {
    position.underlyingPrice = amm.underlyingPrice;
    marginChange.underlyingPrice = amm.underlyingPrice;
  }

  marginChange.save();
  position.save();
}
