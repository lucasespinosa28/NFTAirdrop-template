import { NearAccount } from 'near-workspaces';

export async function startAirdrop(root: NearAccount, airdrop: NearAccount, startAt: number, endAt: number) {
    await root.call(airdrop, "startAirdrop", {
        startAt,
        endAt,
        amount: 100,
        limit: 2,
        blockList: [""]
    });
}
