import { store } from "@graphprotocol/graph-ts";

import { AmmAdded, AmmRemoved } from "../../generated/InsuranceFund/InsuranceFund";
import { Amm as AmmContract } from "../../generated/InsuranceFund/Amm";
import { Amm as AmmTemplate } from "../../generated/templates";
import { Amm } from "../../generated/schema";
import { ZERO_BI } from "../utils/common";

export function handleAmmAdded(event: AmmAdded): void {
  let amm = new Amm(event.params.amm.toHex());
  let ammContract = AmmContract.bind(event.params.amm);

  amm.timestamp = event.block.timestamp.toI32();
  amm.quoteAsset = ammContract.quoteAsset();
  amm.priceFeedKey = ammContract.priceFeedKey().toString();
  amm.fundingPeriod = ammContract.fundingPeriod().toI32();
  amm.fundingRate = ammContract.fundingRate();
  amm.tradeLimitRatio = ammContract.tradeLimitRatio();
  amm.positionBalance = ZERO_BI;
  amm.tradingVolume = ZERO_BI;
  amm.quoteAssetReserve = ZERO_BI;
  amm.baseAssetReserve = ZERO_BI;
  amm.underlyingPrice = ammContract.getUnderlyingPrice()[0].toBigInt();

  AmmTemplate.create(event.params.amm);
  amm.save();
}

export function handleAmmRemoved(event: AmmRemoved): void {
  store.remove("Amm", event.params.amm.toHex());
}
