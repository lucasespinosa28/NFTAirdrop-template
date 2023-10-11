import { NearAccount } from 'near-workspaces';
const STORAGE_BYTE_COST = '1.5 mN';
export async function registerUser(ft: NearAccount, user: NearAccount) {
    await user.call(
        ft,
        'storage_deposit',
        { account_id: user },
        { attachedDeposit: STORAGE_BYTE_COST }
    );
}
