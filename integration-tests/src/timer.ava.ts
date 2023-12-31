import { Worker, NEAR } from 'near-workspaces';
import { MockContracts } from './MockContracts';
import { startAirdrop } from './startAirdrop';
import { test } from './test';

export interface NFT {
    token_id: string
    owner_id: string
    metadata: object
    approved_account_ids: object
}
interface Timepiece {
    activated: boolean,
    startAt: bigint;
    endAt: bigint;
}

export const INITIAL_SUPPLY = "10000";

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
    t.context.worker = worker;
    t.context.accounts = { root, token, airdrop, nft };
})
test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test("Not started", async t => {
    const { airdrop, root, } = t.context.accounts;
    console.log(`timer:${new Date().setDate(
        new Date().getDate() - 30) * 1000000}`)
        console.log(`timer:${new Date().setDate(
            new Date().getDate() + 30) * 1000000}`)
    await startAirdrop(
        root,
        airdrop,
        new Date().setDate(
            new Date().getDate() + 1) * 1000000,
        new Date().setDate(
            new Date().getDate() + 2) * 1000000,);
    const result = await airdrop.view("Timer") as Timepiece;
    t.is(result.activated, false)
});
test("Error from set time ", async t => {
    const { airdrop, token } = t.context.accounts;
    const error = await t.throwsAsync(
        token.call(
            airdrop,
            "startAirdrop",
            {
                startAt: new Date().setDate(new Date().getDate() + 1) * 1000000,
                endAt: new Date().setDate(new Date().getDate() + 2) * 1000000,
                amount: 100,
                limit: 2,
                blockList: [""]
            })
    ) as Error;
    t.is(error.name, "Error");
});

test("started ", async t => {
    const { airdrop, root } = t.context.accounts;
    await startAirdrop(root,
        airdrop,
        new Date().setDate(new Date().getDate() - 1) * 1000000,
        new Date().setDate(new Date().getDate() + 1) * 1000000
    );
    const result = await airdrop.view("Timer") as Timepiece;
    t.is(result.activated, true)
});


test("ended ", async t => {
    const { airdrop, root } = t.context.accounts;
    await startAirdrop(
        root,
        airdrop,
        new Date().setDate(new Date().getDate() - 2) * 1000000,
        new Date().setDate(new Date().getDate() - 1) * 1000000
    );
    const result = await airdrop.view("Timer") as Timepiece;
    t.is(result.activated, false)
});


