import { Item, User, UserBalance } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts/index"

export function fetchOrCreateNFTOwnerBalance(tokenId: string, owner: string, timestamp: BigInt): UserBalance {
    let id = generateCombineKey([tokenId, owner]);
    let user = fetchOrCreateOwner(owner);
    let nftOwnerBalance = UserBalance.load(id);
    if (nftOwnerBalance == null) {
      nftOwnerBalance = new UserBalance(tokenId);
      nftOwnerBalance.id = id;
      nftOwnerBalance.owner = owner;
      nftOwnerBalance.balance = BigInt.fromI32(0);
      nftOwnerBalance.burnQuantity = BigInt.fromI32(0);
      nftOwnerBalance.stakedAmount = BigInt.fromI32(0);
      nftOwnerBalance.token = tokenId;
      nftOwnerBalance.lastUpdated = timestamp;
      user.save();
    }
    return nftOwnerBalance;
  }

  export function generateCombineKey(keys: string[]): string {
    return keys.join('-');
  }

  export function fetchOrCreatenft(tokenId: string, timestamp: BigInt): Item {
    let nft = Item.load(tokenId);
    if (nft == null) {
      nft = new Item(tokenId);
      nft.id = tokenId;
      nft.tokenID = BigInt.fromString(tokenId)
      nft.tokenURI = '';
      nft.balance = BigInt.fromString('0')
      nft.createdAt = timestamp
    }
    return nft;
  }

  export function fetchOrCreateOwner(address: string): User {
    let owner = User.load(address);
    if (owner == null) {
      owner = new User(address);
      owner.id = address;
    }
    return owner;
  }