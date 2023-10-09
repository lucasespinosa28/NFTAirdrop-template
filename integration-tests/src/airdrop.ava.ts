import { Worker, NearAccount, NEAR } from 'near-workspaces';
import { MockContracts } from './MockContracts';
import { test } from './test';
import { startAirdrop } from './startAirdrop';

export interface NFT {
    token_id: string
    owner_id: string
    metadata: object
    approved_account_ids: object
}
interface NFTOwnership {
    owner: string;
    claimed: boolean;
}

const STORAGE_BYTE_COST = '1.5 mN';

async function registerUser(ft: NearAccount, user: NearAccount) {
    await user.call(
        ft,
        'storage_deposit',
        { account_id: user },
        { attachedDeposit: STORAGE_BYTE_COST },
    );
}
test.beforeEach(async t => {
    const worker = await Worker.init();
    const root = worker.rootAccount;
    const { token, nft } = await MockContracts(root);


    const airdrop = await root.devDeploy("../../../contract/build/airdrops.wasm",
        {
            initialBalance: NEAR.parse('100 N').toJSON(),
            method: "init", args: {
                tokenAddress: token.accountId,
                nftAddress: nft.accountId,
            }
        })
 
    t.context.accounts = { root, token, airdrop, nft };
    t.context.worker = worker;

    await registerUser(token, airdrop);
})
test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});
test("query a not existing nft token", async t => {
    const { airdrop, root } = t.context.accounts;
    const error = await t.throwsAsync(
        root.call(airdrop, "query_nft_token", { tokenId: "10" }, { gas: "200000000000000" }) 
    ) as Error;
    t.is(error.name, "Error");
});
test("withdraw", async t => {
    const { airdrop, root, token } = t.context.accounts;
    await root.call(
        token,
        'ft_transfer',
        {
            receiver_id: airdrop.accountId,
            amount: "100",
        },
        { attachedDeposit: '1' },
    );
    t.is(
        await token.view('ft_balance_of', { account_id: airdrop.accountId }), "100"
    )
    await root.call(airdrop, "withdraw", {
        receiverId: root.accountId,
        amount: "100",
    }, { attachedDeposit: '1' });
    t.is(
        await token.view('ft_balance_of', { account_id: airdrop.accountId }), "0"
    )
});
// test("Airdrop balance", async t => {
//     const { airdrop, root, nft, token } = t.context.accounts;
//     await startAirdrop(root,
//         airdrop,
//         new Date().setDate(new Date().getDate() - 1) * 1000000,
//         new Date().setDate(new Date().getDate() + 1) * 1000000
//     );
//     await root.call(
//         token,
//         'ft_transfer',
//         {
//             receiver_id: airdrop.accountId,
//             amount: "100",
//         },
//         { attachedDeposit: '1' },
//     );
//     await mintNFTs(root, nft,0);

//     const result = await root.call(airdrop, "query_nft_token", { tokenId: "0" }, { gas: "200000000000000" }) as NFT;
//     let status = await airdrop.view("status", { tokenId: "0" }) as NFTOwnership;
//     const id = root.accountId
//     t.is(result.owner_id, id)
//     t.is(result.token_id, "0")

//     await root.call(airdrop, "transfer_tokens", {
//         tokenId: "0",
//     }, { attachedDeposit: '1' });
//     status = await airdrop.view("status", { tokenId: "0" }) as NFTOwnership;
//     t.is(await token.view('ft_balance_of', { account_id: root.accountId }), "9950")
//     t.is(status.claimed, true)

// })

async function mintNFTs(root: NearAccount, nft: NearAccount, amount:number) {
    for (let index = 0; index < amount; index++) {
        await root.call(
            nft,
            "nft_mint",
            {
                token_id: "0",
                receiver_id: root.accountId,
                token_metadata: {
                    title: "Olympus Mons",
                    description: "The tallest mountain in the charted solar system",
                    media: null,
                    media_hash: null,
                    copies: 10000,
                    issued_at: null,
                    expires_at: null,
                    starts_at: null,
                    updated_at: null,
                    extra: null,
                    reference: null,
                    reference_hash: null,
                }
            },
            { attachedDeposit: '7000000000000000000000' }
        );
    }
}