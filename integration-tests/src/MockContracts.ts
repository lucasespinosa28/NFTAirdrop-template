import { NearAccount, NEAR } from 'near-workspaces';
const INITIAL_SUPPLY = "10000";

export async function MockContracts(root: NearAccount) {
    const token = await root.devDeploy(
        "build/fungible_token.wasm",
        {
            initialBalance: NEAR.parse('100 N').toJSON(),
            method: "new_default_meta",
            args: {
                owner_id: root,
                total_supply: INITIAL_SUPPLY,
            }
        }
    );

    const nft = await root.devDeploy(
        "build/non_fungible_token.wasm",
        {
            initialBalance: NEAR.parse('100 N').toJSON(),
            method: "new_default_meta",
            args: { owner_id: root }
        }
    );
    return { token, nft };
}
