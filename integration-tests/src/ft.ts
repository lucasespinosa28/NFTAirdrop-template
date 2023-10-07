/**
 * This tests the behavior of the standard FT contract at
 * https://github.com/near/near-sdk-rs/tree/master/examples/fungible-token
 *
 * Some advanced features of near-workspaces this shows off:
 *
 * - Cross-Contract Calls: the "defi" contract implements basic features that
 *   might be used by a marketplace contract. You can see its source code at the
 *   near-sdk-rs link above. Several FT methods make cross-contract calls, and
 *   these are tested below using this "defi" contract.
 *
 * - Complex transactions: to exercise certain edge cases of the FT standard,
 *   tests below initiate chains of transactions using near-workspaces's transaction
 *   builder. Search for `batch` below.
 */
import { Worker, NearAccount, captureError, NEAR, BN } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';

const STORAGE_BYTE_COST = '1.5 mN';
const INITIAL_SUPPLY = "10000";

async function registerUser(ft: NearAccount, user: NearAccount) {
    await user.call(
        ft,
        'storage_deposit',
        { account_id: user },
        // Deposit pulled from ported sim test
        { attachedDeposit: STORAGE_BYTE_COST },
    );
}

async function ft_balance_of(ft: NearAccount, user: NearAccount): Promise<BN> {
    return new BN(await ft.view('ft_balance_of', { account_id: user }));
}

const test = anyTest as TestFn<{
    worker: Worker;
    accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async t => {
    const worker = await Worker.init();
    const root = worker.rootAccount;
    const ft = await root.devDeploy(
        "../contracts/fungible_token.wasm",
        {
            initialBalance: NEAR.parse('100 N').toJSON(),
            method: "new_default_meta",
            args: {
                owner_id: root,
                total_supply: INITIAL_SUPPLY,
            }
        },
    );
    const ali = await root.createSubAccount('ali', { initialBalance: NEAR.parse('100 N').toJSON() });

    t.context.worker = worker;
    t.context.accounts = { root, ft, ali };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('Total supply', async t => {
    const { ft } = t.context.accounts;
    const totalSupply: string = await ft.view('ft_total_supply');
    t.is(totalSupply, INITIAL_SUPPLY);
});

test('Simple transfer', async t => {
    const { ft, ali, root } = t.context.accounts;
    const initialAmount = new BN(INITIAL_SUPPLY);
    const transferAmount = new BN('100');

    // Register by prepaying for storage.
    await registerUser(ft, ali);

    await root.call(
        ft,
        'ft_transfer',
        {
            receiver_id: ali,
            amount: transferAmount,
        },
        { attachedDeposit: '1' },
    );

    const rootBalance = await ft_balance_of(ft, root);
    const aliBalance = await ft_balance_of(ft, ali);

    t.deepEqual(new BN(rootBalance), initialAmount.sub(transferAmount));
    t.deepEqual(new BN(aliBalance), transferAmount);
});

test('Can close empty balance account', async t => {
    const { ft, ali } = t.context.accounts;

    await registerUser(ft, ali);

    const result = await ali.call(
        ft,
        'storage_unregister',
        {},
        { attachedDeposit: '1' },
    );

    t.is(result, true);
});

test('Can force close non-empty balance account', async t => {
    const { ft, root } = t.context.accounts;

    const errorString = await captureError(async () =>
        root.call(ft, 'storage_unregister', {}, { attachedDeposit: '1' }));
    t.regex(errorString, /Can't unregister the account with the positive balance without force/);

    const result = await root.callRaw(
        ft,
        'storage_unregister',
        { force: true },
        { attachedDeposit: '1' },
    );

    t.is(result.logs[0],
        `Closed @${root.accountId} with ${INITIAL_SUPPLY}`,
    );
});

