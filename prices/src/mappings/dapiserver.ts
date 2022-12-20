import {
  UpdatedBeaconWithPsp,
  UpdatedBeaconWithSignedData,
} from "../../generated/DapiServer/DapiServer";
import { PriceFeed, PriceUpdate } from "../../generated/schema";
import { ZERO_BI } from "../utils/common";

function getPriceFeed(id: string): PriceFeed {
  let feed = PriceFeed.load(id);

  if (!feed) {
    feed = new PriceFeed(id);

    feed.timestamp = 0;
    feed.price = ZERO_BI;

    feed.save();
  }

  return feed;
}

export function handleUpdatedBeaconWithSignedData(event: UpdatedBeaconWithSignedData): void {
  let timestamp = event.block.timestamp.toI32();
  let feed = getPriceFeed(event.params.beaconId.toHex());
  let update = new PriceUpdate(event.transaction.hash.toHex() + "-" + event.logIndex.toString());

  feed.timestamp = timestamp;
  feed.price = event.params.value;

  update.priceFeed = feed.id;
  update.timestamp = timestamp;
  update.price = event.params.value;

  update.save();
  feed.save();
}

export function handleUpdatedBeaconWithPsp(event: UpdatedBeaconWithPsp): void {
  let timestamp = event.block.timestamp.toI32();
  let feed = getPriceFeed(event.params.beaconId.toHex());
  let update = new PriceUpdate(event.transaction.hash.toHex() + "-" + event.logIndex.toString());

  feed.timestamp = timestamp;
  feed.price = event.params.value;

  update.priceFeed = feed.id;
  update.timestamp = timestamp;
  update.price = event.params.value;

  update.save();
  feed.save();
}
