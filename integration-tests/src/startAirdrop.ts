import { NearAccount } from 'near-workspaces';

export async function startAirdrop(root: NearAccount, airdrop: NearAccount, startAt: number, endAt: number, amount?:number,limit?:number,bannedList :string[] = [""]) {
    
    await root.call(airdrop, "startAirdrop", {
        startAt,
        endAt,
        amount,
        limit,
        bannedList
    });
}
