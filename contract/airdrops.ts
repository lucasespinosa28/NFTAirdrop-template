import { NearBindgen, initialize, call, near, bytes, NearPromise, view, Vector, UnorderedMap, assert } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
import { json } from "stream/consumers";
// assert(near.blockTimestamp === token.owner_id, "Predecessor must be the token owner");

const FIVE_TGAS = BigInt("50000000000000");
const NO_DEPOSIT = BigInt(0);
const NO_ARGS = JSON.stringify({});
const GAS_FOR_NFT_TRANSFER = 15_000_000_000_000;
interface Init {
    tokenAddress: AccountId;
    nftAddress: AccountId;
    from: number;
    limit: number;
    startAt: bigint;
    endAt: bigint;
    blockList: string[];
    owner: AccountId[];
}
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
class airdropContract {
    controller: UnorderedMap<boolean> = new UnorderedMap<boolean>('controller-map');
    tokenAddress: AccountId = "";
    nftAddress: AccountId = "";
    balance: string = "0";
    from: number = 0;
    reward: string = "";
    limit:bigint = 1n;
    rewarded:bigint = 0n;
    startAt: bigint = near.blockTimestamp();
    endAt: bigint = near.blockTimestamp();
    blockList: Vector<string> = new Vector<string>('banned-nfts');
    claimed: UnorderedMap<boolean> = new UnorderedMap<boolean>('claimed-nfts');
    nftOwner: UnorderedMap<NFTOwnership> = new UnorderedMap<NFTOwnership>('NFT-owner');



    @initialize({})
    init({ owner, tokenAddress, nftAddress, blockList }: Init) {
        owner.forEach(id => this.controller.set(id, true));
        this.tokenAddress = tokenAddress;
        this.nftAddress = nftAddress;

        blockList.forEach(id => this.blockList.push(id))
    }
    @call({})
    startAirdrop({ start, end, amount,limit }: { start: bigint, end: bigint,amount:bigint,limit:bigint }): void {
        this.notAllowed();
        this.startAt = start;
        this.endAt = end;
        this.limit = limit;
        this.reward = (amount / limit).toString();
    }
    @call({ privateFunction: true })
    query_balance_callback(): string {
        let { result, success } = promiseResult();
        if (success) {
            near.log(result)
            this.balance = result.substring(1, result.length - 1);;
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
    @call({})
    set_timer({ start, end }: { start: bigint, end: bigint }): void {
        this.notAllowed();
        this.startAt = start;
        this.endAt = end;
    }

    @view({})
    Timer(): Timepiece {
        let started = false;
        if (near.blockTimestamp() > this.startAt) {
            started = true;
        }
        if (near.blockTimestamp() > this.endAt) {
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
        const nft = this.nftOwner.get(tokenId);
        if (nft?.owner === near.signerAccountId() && nft?.claimed === false && this.rewarded <= this.limit) {
            const promise = near.promiseBatchCreate(this.tokenAddress)
            near.promiseBatchActionFunctionCall(promise, "ft_transfer", JSON.stringify({
                receiver_id: nft?.owner,
                amount: this.reward
            }), 1, GAS_FOR_NFT_TRANSFER)
            this.nftOwner.set(tokenId, { owner: nft.owner, claimed: true });
            this.rewarded = this.rewarded + 1n;
            return near.promiseReturn(promise);
        }
    }
    @call({ payableFunction: true })
    withdraw({ receiverId, amount }: { receiverId: AccountId, amount: string }): void {
        this.notAllowed();
        const promise = near.promiseBatchCreate(this.tokenAddress)
        near.promiseBatchActionFunctionCall(promise, "ft_transfer", JSON.stringify({
            receiver_id: receiverId,
            amount: amount
        }), 1, GAS_FOR_NFT_TRANSFER)
        return near.promiseReturn(promise);
    }
    @call({ privateFunction: true })
    transfer_tokens_callback(): boolean {
        let { result, success } = promiseResult()
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
    query_nft_totalSupply(): void {
        const promise = NearPromise.new(this.nftAddress)
            .functionCall("nft_total_supply", "", NO_DEPOSIT, FIVE_TGAS)
            .then(NearPromise.new(near.currentAccountId())
                .functionCall("nft_total_supply_callback", NO_ARGS, NO_DEPOSIT, FIVE_TGAS))
        return promise.onReturn();
    }
    @call({ privateFunction: true })
    nft_total_supply_callback(): number|unknown {
        let { result, success } = promiseResult()
        if (success) {
            near.log(result as any * 10)
            return result as unknown
        } else {
            near.log("Promise failed...")
            return 0;
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
        let { result, success } = promiseResult();
        if (success) {
            let json = JSON.parse(result)
            this.nftOwner.set(json.token_id, { owner: json.owner_id, claimed: false })
            return json
        } else {
            near.log("Promise failed...")
            return "";
        }
    }

    notAllowed(): void {
        const allowed = this.controller.get(near.signerAccountId());
        if (allowed !== true) {
            throw new Error(`Not allow to change time`);
        }
    }
}

function promiseResult(): { result: string, success: boolean } {
    let result, success;
    const data: any = 0;
    try { result = near.promiseResult(data); success = true }
    catch { result = undefined; success = false }

    return { result, success }
}

