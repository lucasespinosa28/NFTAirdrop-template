const balance = Near.view("fruittoken.testnet", "ft_balance_of", {
    account_id: "sub.airdropfactorybeta.testnet",
  });
  
  console.log(balance);
  
  const nft = Near.view(
    "fruitknightstore.mintspace2.testnet",
    "nft_total_supply"
  );
  
  console.log(nft);
  const timer = Near.view("sub.airdropfactorybeta.testnet", "Timer");

  console.log(timer);
   
const register =  Near.call(
    ft,
    'storage_deposit',
    { account_id: user },
    "200000000000000",
    "1.5 mN"
);

const status =  Near.view("sub.airdropfactorybeta.testnet","status", { tokenId: "1" })
//fruitknightstore.mintspace2.testnet
const buyNow = Near.call(props.contract,"buy",{
    "nft_contract_id": "fruitknightstore.mintspace2.testnet",
    "token_id": "6",
    "referrer_id": null
  },
  "8.90 Tgas",
  "1000000000000000000000000")