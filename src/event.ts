import {tokenTransfer, tokenTransferBatch} from "./transfer";
import { TransferBatch, TransferSingle, URI } from "../generated/NFTItem/URC1155";
import { Item } from "../generated/schema";
import { fetchOrCreateNFTOwnerBalance } from "./utils";
import { BigInt } from "@graphprotocol/graph-ts"

export function handleTransfer(event: TransferSingle): void {
  tokenTransfer(event);
}

export function handleTransferBatch(event: TransferBatch): void {
  tokenTransferBatch(event)
}

// export function handleUpdateMetadata(event: MetadataUpdate): void {
//   metadataUpdate(event);
// }

export function handleURI(event: URI): void {
  let uniceran = Item.load(event.params.id.toString());

  if (uniceran != null) {
    uniceran.tokenURI = event.params.value.toString();
    uniceran.save();
  }
  else {
      uniceran = new Item(event.params.id.toString());
      uniceran.tokenID = event.params.id
      uniceran.tokenURI = event.params.value;
      uniceran.balance = BigInt.fromString('0')
      uniceran.createdAt = event.block.timestamp;
      uniceran.save()
  }
}