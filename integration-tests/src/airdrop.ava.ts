import { Worker, NearAccount, captureError, NEAR, BN } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';

const TGAS = new BN("200000000000000");

export interface NFT {
    token_id: string
    owner_id: string
    metadata: Metadata
    approved_account_ids: ApprovedAccountIds
}

export interface Metadata {
    title: string
    description: string
    media: any
    media_hash: any
    copies: number
    issued_at: any
    expires_at: any
    starts_at: any
    updated_at: any
    extra: any
    reference: any
    reference_hash: any
}

export interface ApprovedAccountIds { }

const test = anyTest as TestFn<{
    worker: Worker;
    accounts: Record<string, NearAccount>;
}>;

const INITIAL_SUPPLY = "10000";
const STORAGE_BYTE_COST = '1.5 mN';

async function registerUser(ft: NearAccount, user: NearAccount) {
    await user.call(
        ft,
        'storage_deposit',
        { account_id: user },
        // Deposit pulled from ported sim test
        { attachedDeposit: STORAGE_BYTE_COST },
    );
}

test.beforeEach(async t => {
    const worker = await Worker.init();
    const root = worker.rootAccount;

    const token = await root.devDeploy(
        "build/fungible_token.wasm",
        {
            initialBalance: NEAR.parse('100 N').toJSON(),
            method: "new_default_meta",
            args: {
                owner_id: root,
                total_supply: INITIAL_SUPPLY,
            }
        },
    );

    const nft = await root.devDeploy(
        "build/non_fungible_token.wasm",
        {
            initialBalance: NEAR.parse('100 N').toJSON(),
            method: "new_default_meta",
            args: { owner_id: root }
        },
    );
    // await root.call(
    //     nft,
    //     "nft_mint",
    //     {
    //         token_id: "0",
    //         receiver_id: root,
    //         token_metadata: {
    //             title: "Olympus Mons",
    //             description: "The tallest mountain in the charted solar system",
    //             media: null,
    //             media_hash: null,
    //             copies: 10000,
    //             issued_at: null,
    //             expires_at: null,
    //             starts_at: null,
    //             updated_at: null,
    //             extra: null,
    //             reference: null,
    //             reference_hash: null,
    //         }
    //     },
    //     { attachedDeposit: '7000000000000000000000' }
    // );

    const airdrop = await root.devDeploy("build/airdrops.wasm", { initialBalance: NEAR.parse('100 N').toJSON(),method: "init", args: { tokenAddress: token.accountId } })
    //const airdrop = await root.createSubAccount('airdrop', { initialBalance: NEAR.parse('1 N').toJSON() })
    t.context.worker = worker;
    t.context.accounts = { root, token, airdrop, nft };

    await registerUser(token, airdrop);
})
test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test("Airdrop", async t => {
    const { airdrop, root, token } = t.context.accounts;
    const transferAmount = new BN('100');
    await root.call(
        token,
        'ft_transfer',
        {
            receiver_id: airdrop.accountId,
            amount: transferAmount,
        },
        { attachedDeposit: '1' },
    );

    const result = await root.call(airdrop, "query_balance", {}, { gas: TGAS });
    t.is(result, "100")
    const balance = await airdrop.view("get_balance", {});
    t.is(balance as string, "100")

    const transfer = await root.call(airdrop, "transfer_tokens", {
        receiverId: root.accountId,
        amount: new BN("1"),
    },{attachedDeposit: '1' });
    const final = await root.call(airdrop, "query_balance", {}, { gas: TGAS });
    t.is(final, "99")
})

// test('Total supply', async t => {
//     const { token } = t.context.accounts;
//     const totalSupply: string = await token.view('ft_total_supply');
//     t.is(totalSupply, INITIAL_SUPPLY);
// });
// test('Total balance from ampty account', async t => {
//     const { token, airdrop } = t.context.accounts;
//     const balance = await token.view('ft_balance_of', { account_id: airdrop.accountId })
//     t.is(balance, "0")
// });
// test('Initial balance from root', async t => {
//     const { token, root } = t.context.accounts;
//     const balance = await token.view('ft_balance_of', { account_id: root.accountId })
//     t.is(balance, INITIAL_SUPPLY)
// });
// test('Simple transfer', async t => {
//     const { token, root, airdrop } = t.context.accounts;
//     const transferAmount = new BN('100');

//     const oldbalance = await token.view('ft_balance_of', { account_id: root.accountId })

//     await root.call(
//         token,
//         'ft_transfer',
//         {
//             receiver_id: airdrop.accountId,
//             amount: transferAmount,
//         },
//         { attachedDeposit: '1' },
//     );

//     const newbalance = await token.view('ft_balance_of', { account_id: root.accountId })
//     const airdropbalance = await token.view('ft_balance_of', { account_id: airdrop.accountId })
//     t.notDeepEqual(oldbalance, newbalance);
//     t.is(airdropbalance, "100")
// })

// test("Transfer using contract", async t => {
//     const { token, root, airdrop } = t.context.accounts;
//     const transferAmount = new BN('100');

//     await root.call(
//         token,
//         'ft_transfer',
//         {
//             receiver_id: airdrop.accountId,
//             amount: transferAmount,
//         },
//         { attachedDeposit: '1' },
//     );
//     const initial = await token.view('ft_balance_of', { account_id: airdrop.accountId })
//     t.is(initial, transferAmount.toString())
//     await root.call(
//         token,
//         'transferTokens',
//         {
//             account_: token.accountId,
//             receiver_: root.accountId,
//             amount_: transferAmount,
//         },
//         { attachedDeposit: '1' },
//     );
//     const latest = await token.view('ft_balance_of', { account_id: airdrop.accountId })
//     t.is(latest, transferAmount.toString())

// })

// test("NFT total supply", async t => {
//     const { root, nft } = t.context.accounts;
//     await root.call(
//         nft,
//         "nft_mint",
//         {
//             token_id: "0",
//             receiver_id: root,
//             token_metadata: {
//                 title: "Olympus Mons",
//                 description: "The tallest mountain in the charted solar system",
//                 media: null,
//                 media_hash: null,
//                 copies: 10000,
//                 issued_at: null,
//                 expires_at: null,
//                 starts_at: null,
//                 updated_at: null,
//                 extra: null,
//                 reference: null,
//                 reference_hash: null,
//             }
//         },
//         { attachedDeposit: '7000000000000000000000' }
//     );
//     const totalSupply = await nft.view('nft_total_supply')
//     t.is(totalSupply, "1")
// })

// test("NFT token", async t => {
//     const { root, nft } = t.context.accounts;
//     await root.call(
//         nft,
//         "nft_mint",
//         {
//             token_id: "0",
//             receiver_id: root,
//             token_metadata: {
//                 title: "Olympus Mons",
//                 description: "The tallest mountain in the charted solar system",
//                 media: null,
//                 media_hash: null,
//                 copies: 10000,
//                 issued_at: null,
//                 expires_at: null,
//                 starts_at: null,
//                 updated_at: null,
//                 extra: null,
//                 reference: null,
//                 reference_hash: null,
//             }
//         },
//         { attachedDeposit: '7000000000000000000000' }
//     );
//     const token = await nft.view('nft_token', { token_id: "0" }) as NFT
//     t.is(token.owner_id, root.accountId)
// })



// test("NFT fetch multiples tokens", async t => {
//     const { root, nft, airdrop } = t.context.accounts;
//     for (let index = 0; index < 10; index++) {
//         await root.call(
//             nft,
//             "nft_mint",
//             {
//                 token_id: `${index}`,
//                 receiver_id: index % 2?root:airdrop,
//                 token_metadata: {
//                     title: "Olympus Mons",
//                     description: "The tallest mountain in the charted solar system",
//                     media: null,
//                     media_hash: null,
//                     copies: 10000,
//                     issued_at: null,
//                     expires_at: null,
//                     starts_at: null,
//                     updated_at: null,
//                     extra: null,
//                     reference: null,
//                     reference_hash: null,
//                 }
//             },
//             { attachedDeposit: '7000000000000000000000' }
//         );
//     }
//     const supply = await nft.view('nft_supply_for_owner',{account_id:root.accountId})
//     t.is(supply,"")
// })