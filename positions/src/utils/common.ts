import { BigInt } from "@graphprotocol/graph-ts";

export let ZERO_BI = BigInt.fromI32(0);
export namespace decimal {
  export function div(a: BigInt, b: BigInt): BigInt {
    return a.times(BigInt.fromI32(10).pow(18)).div(b);
  }
}
