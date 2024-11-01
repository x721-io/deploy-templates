import {Item, TransferHistory, User} from "../generated/schema";
import {TransferBatch, TransferSingle, URC1155} from "../generated/NFTItem/URC1155";
import {ContractAddressConst, DEAD, ZERO} from "./const";
import { fetchOrCreatenft, fetchOrCreateNFTOwnerBalance } from "./utils";
import { log } from "@graphprotocol/graph-ts";

export function tokenTransfer(event: TransferSingle): void {
  if (event.params.to.toHexString() == ContractAddressConst.erc1155marketplace) {
    return;
  }
  let nft = fetchOrCreatenft(event.params.id.toString(), event.block.timestamp);
  let nftOwnerBalanceFrom = fetchOrCreateNFTOwnerBalance(event.params.id.toString(), event.params.from.toHexString(), event.block.timestamp);
  let nftOwnerBalanceTo = fetchOrCreateNFTOwnerBalance(event.params.id.toString(), event.params.to.toHexString(), event.block.timestamp);

  if (event.params.from == event.params.to) {
    return;
  }
  
  if (event.params.from.toHexString() != ZERO) {
    log.info('balance: {} , address {} ', [nftOwnerBalanceTo.balance.toString(), nftOwnerBalanceTo.owner]);
    if (event.params.to.toHexString() == DEAD) {
      nftOwnerBalanceFrom.burnQuantity = nftOwnerBalanceFrom.burnQuantity.plus(event.params.value);
      nftOwnerBalanceFrom.balance = nftOwnerBalanceFrom.balance.minus(event.params.value);
    } else {
      nftOwnerBalanceFrom.owner = event.params.from.toHexString();
      nftOwnerBalanceTo.owner = event.params.to.toHexString();
      nftOwnerBalanceFrom.balance = nftOwnerBalanceFrom.balance.minus(event.params.value);
      nftOwnerBalanceTo.balance = nftOwnerBalanceTo.balance.plus(event.params.value);
    }
    
    nftOwnerBalanceFrom.save();
    nftOwnerBalanceTo.save();
  } else {
    nftOwnerBalanceTo.owner = event.params.to.toHexString();
    nftOwnerBalanceTo.balance = nftOwnerBalanceTo.balance.plus(event.params.value);
    nft.balance = nft.balance.plus(event.params.value);
    const nftContract = URC1155.bind(event.address);
    let tokenURIResult = nftContract.try_uri(event.params.id);
    if (!tokenURIResult.reverted) {
      nft.tokenURI = tokenURIResult.value;
    }
    nft.save();
    nftOwnerBalanceTo.save();
  }

  // Store transfer as history
  let transferHistoryID = event.transaction.hash.toHexString().concat("-" + event.transactionLogIndex.toString())
  let transferHistory = TransferHistory.load(transferHistoryID)
  if (!transferHistory){
    // Should be here always
    transferHistory = new TransferHistory(transferHistoryID)
    transferHistory.from = event.params.from.toHexString()
    transferHistory.txHash = event.transaction.hash.toHexString()
    transferHistory.to = event.params.to.toHexString()
    log.info('token id: ', [event.params.id.toString()])
    transferHistory.tokenID = event.params.id
    transferHistory.transferAt = event.block.timestamp
    transferHistory.quantity = event.params.value
    transferHistory.save();
  }
}
export function tokenTransferBatch(event: TransferBatch): void {
  for (let i = 0; i < event.params.ids.length; i++) {
    let nft = fetchOrCreatenft(event.params.ids[i].toString(), event.block.timestamp);

  let nftOwnerBalanceFrom = fetchOrCreateNFTOwnerBalance(event.params.ids[i].toString(), event.params.from.toHexString(), event.block.timestamp);
  let nftOwnerBalanceTo = fetchOrCreateNFTOwnerBalance(event.params.ids[i].toString(), event.params.to.toHexString(), event.block.timestamp);

  if (event.params.from == event.params.to) {
    return;
  }
  
  if (event.params.from.toHexString() != ZERO) {
    log.info('balance: {} , address {} ', [nftOwnerBalanceTo.balance.toString(), nftOwnerBalanceTo.owner]);
    if (event.params.to.toHexString() == DEAD) {
      nftOwnerBalanceFrom.burnQuantity = nftOwnerBalanceFrom.burnQuantity.plus(event.params.values[i]);
    } else {
      nftOwnerBalanceFrom.owner = event.params.from.toHexString();
      nftOwnerBalanceTo.owner = event.params.to.toHexString();
      nftOwnerBalanceFrom.balance = nftOwnerBalanceFrom.balance.minus(event.params.values[i]);
      nftOwnerBalanceTo.balance = nftOwnerBalanceTo.balance.plus(event.params.values[i]);
    }
    
    nftOwnerBalanceFrom.save();
    nftOwnerBalanceTo.save();
  } else {
    nftOwnerBalanceTo.owner = event.params.to.toHexString();
    nftOwnerBalanceTo.balance = nftOwnerBalanceTo.balance.plus(event.params.values[i]);
    nft.balance = nft.balance.plus(event.params.values[i]);
    const nftContract = URC1155.bind(event.address);
    let tokenURIResult = nftContract.try_uri(event.params.ids[i]);
    if (!tokenURIResult.reverted) {
      nft.tokenURI = tokenURIResult.value;
    }
    nft.save();
    nftOwnerBalanceTo.save();
  }

  // Store transfer as history
  let transferHistoryID = event.transaction.hash.toHexString().concat("-" + event.transactionLogIndex.toString())
  let transferHistory = TransferHistory.load(transferHistoryID)
  if (!transferHistory){
    // Should be here always
    transferHistory = new TransferHistory(transferHistoryID)
    transferHistory.from = event.params.from.toHexString()
    transferHistory.txHash = event.transaction.hash.toHexString()
    transferHistory.to = event.params.to.toHexString()
    log.info('token id: ', [event.params.ids[i].toString()])
    transferHistory.tokenID = event.params.ids[i]
    transferHistory.transferAt = event.block.timestamp
    transferHistory.quantity = event.params.values[i]
    transferHistory.save();
  }
  }
}