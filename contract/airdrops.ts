import { NearBindgen, initialize, call, near, NearPromise, view, Vector, UnorderedMap } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
// assert(near.blockTimestamp === token.owner_id, "Predecessor must be the token owner");

const FIVE_TGAS = BigInt("50000000000000");
const NO_DEPOSIT = BigInt(0);
const NO_ARGS = JSON.stringify({});
const GAS_FOR_NFT_TRANSFER = 15_000_000_000_000;
interface Timepiece {
    activated: boolean,
    startAt: bigint;
    endAt: bigint;
}

interface NFTOwnership {
    owner: AccountId;
    claimed: boolean;
}

@NearBindgen({})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AirdropContract {
    owner: UnorderedMap<boolean> = new UnorderedMap<boolean>('owner-map');
    tokenAddress: AccountId = "";
    nftAddress: AccountId = "";
    balance: string = "0";
    from: number = 0;
    reward: string = "";
    limit: bigint = BigInt(1);
    rewarded: bigint = near.blockTimestamp();
    startAt: bigint =  near.blockTimestamp();
    endAt: bigint =  BigInt(0);
    blockList: Vector<string> = new Vector<string>('banned-nfts');
    claimed: UnorderedMap<boolean> = new UnorderedMap<boolean>('claimed-nfts');
    nftOwner: UnorderedMap<NFTOwnership> = new UnorderedMap<NFTOwnership>('NFT-owner');



    @initialize({})
    init({ tokenAddress, nftAddress }: { tokenAddress: AccountId, nftAddress: AccountId }) {
        const signer = near.signerAccountId();
        this.owner.set(signer, true);
        this.tokenAddress = tokenAddress;
        this.nftAddress = nftAddress;
        near.log(`{"signer":"${signer}","tokenAddress":"${tokenAddress}","nftAddress":"${nftAddress}"}`)
    }
    @call({})
    update_owners({ids}:{ids:AccountId[]}){
        ids.forEach(id => this.owner.set(id,true));     
    }
    @call({})
    startAirdrop({ startAt, endAt, amount, limit, blockList }: { startAt: bigint, endAt: bigint, amount: bigint, limit: bigint, blockList: string[] }): void {
        this.notAllowed();
        if (startAt >= endAt) {
            throw new Error(`End time need to be greater that start time`);
        }
        this.startAt = startAt;
        this.endAt = endAt;
        this.limit = limit;
        this.reward = (amount / limit).toString();
        blockList.forEach(id => this.blockList.push(id))
    }
    @call({ privateFunction: true })
    query_balance_callback(): string {
        const { result, success } = promiseResult();
        if (success) {
            near.log(result)
            this.balance = result.substring(1, result.length - 1);
            return result.substring(1, result.length - 1);
        } else {
            near.log("Promise failed...")
            return "";
        }
    }
    @view({})
    get_balance(): string {
        return this.balance;
    }
    @view({})
    Timer(): Timepiece {  
        let started = false;
        if (near.blockTimestamp() > this.startAt) {
            started = true;
        }
        if (near.blockTimestamp() >= this.endAt) {
            started = false;
        }
        if(this.endAt === this.startAt){
            started = false;
        }
        return { activated: started, startAt: this.startAt, endAt: this.endAt }

    }
    @view({})
    status({ tokenId }: { tokenId: string }): NFTOwnership | null {
        return this.nftOwner.get(tokenId)
    }
    @call({ payableFunction: true })
    transfer_tokens({ tokenId }: { tokenId: string, receiverId: AccountId, amount: string }): void {
        this.actived()
        const nft = this.nftOwner.get(tokenId);
        if (nft?.owner === near.signerAccountId() && nft?.claimed === false && this.rewarded <= this.limit) {
            const promise = near.promiseBatchCreate(this.tokenAddress)
            near.promiseBatchActionFunctionCall(promise, "ft_transfer", JSON.stringify({
                receiver_id: nft?.owner,
                amount: this.reward
            }), 1, GAS_FOR_NFT_TRANSFER)
            this.nftOwner.set(tokenId, { owner: nft.owner, claimed: true });
            this.rewarded = this.rewarded + BigInt(1);
            return near.promiseReturn(promise);
        }
    }
    @call({ payableFunction: true })
    withdraw({ receiverId, amount }: { receiverId: AccountId, amount: string }): void {
        this.notAllowed();
        if(near.blockTimestamp() > this.endAt){
            const promise = near.promiseBatchCreate(this.tokenAddress)
            near.promiseBatchActionFunctionCall(promise, "ft_transfer", JSON.stringify({
                receiver_id: receiverId,
                amount: amount
            }), 1, GAS_FOR_NFT_TRANSFER)
            return near.promiseReturn(promise);
        }
    }
    @call({ privateFunction: true })
    transfer_tokens_callback(): boolean {
        const { result, success } = promiseResult()
        near.log(result)
        if (success) {
            near.log(`Success!`)
            return true
        } else {
            near.log("Promise failed...")
            return false
        }
    }
    @call({})
    query_nft_token({ tokenId }: { tokenId: AccountId }): void {
        const promise = NearPromise.new(this.nftAddress)
            .functionCall("nft_token", JSON.stringify({ token_id: tokenId }), NO_DEPOSIT, FIVE_TGAS)
            .then(NearPromise.new(near.currentAccountId())
                .functionCall("query_query_nft_token_callback", NO_ARGS, NO_DEPOSIT, FIVE_TGAS))
        return promise.onReturn();
    }

    @call({ privateFunction: true })
    query_query_nft_token_callback(): string {
        const { result, success } = promiseResult();
        if (success) {
            const json = JSON.parse(result)
            this.nftOwner.set(json.token_id, { owner: json.owner_id, claimed: false })
            return json
        } else {
            near.log("Promise failed...")
            return "";
        }
    }

    notAllowed(): void {
        if (this.owner.get(near.signerAccountId()) !== true) {
            throw new Error(`You are not authorized to perform this action.`);
        }
    }
    actived() {
        if (this.Timer().activated !== true) {
            throw new Error(`Outside the airdrop deadline.`);
        }
    }
}

function promiseResult(): { result: string, success: boolean } {
    let result, success;
    try { result = near.promiseResult("0" as never); success = true }
    catch { result = undefined; success = false }

    return { result, success }
}

