import { store } from "@graphprotocol/graph-ts";

import { AmmAdded, AmmRemoved } from "../../generated/InsuranceFund/InsuranceFund";
import { Amm as AmmContract } from "../../generated/InsuranceFund/Amm";
import { Amm } from "../../generated/schema";

export function handleAmmAdded(event: AmmAdded): void {
  let amm = new Amm(event.params.amm.toHex());
  let ammContract = AmmContract.bind(event.params.amm);

  amm.quoteAsset = ammContract.quoteAsset();
  amm.fundingPeriod = ammContract.fundingPeriod().toI32();
  amm.priceFeedKey = ammContract.priceFeedKey().toString();

  amm.save();
}

export function handleAmmRemoved(event: AmmRemoved): void {
  store.remove("Amm", event.params.amm.toHex());
}
