import { NearBindgen, initialize, call, near, bytes, NearPromise, view } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
import { json } from "stream/consumers";


const FIVE_TGAS = BigInt("50000000000000");
const NO_DEPOSIT = BigInt(0);
const NO_ARGS = JSON.stringify({});
const GAS_FOR_NFT_TRANSFER = 15_000_000_000_000;
@NearBindgen({})
class airdropContract {
    tokenAddress: AccountId = "hello-nearverse.testnet";
    balance: string = "0"

    @initialize({})
    init({ tokenAddress }: { tokenAddress: AccountId }) {
        this.tokenAddress = tokenAddress;
    }
    @view({})
    get_balance(): string {
        return this.balance;
    }

    @call({ payableFunction: true })
    transfer_tokens({ receiverId, amount }: { receiverId: AccountId, amount: string }): void {
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
    query_balance(): NearPromise {
        const promise = NearPromise.new(this.tokenAddress)
            .functionCall("ft_balance_of", JSON.stringify({ account_id: near.currentAccountId() }), NO_DEPOSIT, FIVE_TGAS)
            .then(NearPromise.new(near.currentAccountId())
                .functionCall("query_balance_callback", NO_ARGS, NO_DEPOSIT, FIVE_TGAS))
        return promise.asReturn();
    }

    @call({ privateFunction: true })
    query_balance_callback(): string {
        let { result, success } = promiseResult();
        if (success) {
            this.balance = result.substring(1, result.length - 1);;
            return result.substring(1, result.length - 1);
        } else {
            near.log("Promise failed...")
            return "";
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