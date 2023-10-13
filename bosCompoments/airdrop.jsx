let user_account = context.accountId;

State.init({
  contract: {
    subContract:"",
    token:"",
    nft:"",
    airdrop:"",
    amount: 0,
    number: 0,
    start:0,
    end:0,
    banned: [""],
    tokenBalance: 0,
    nftBalance: 0,
    rewards: 0,
  },
});

function createAirdrop() {
  const data = state.contract;
  if (
    data.subContract.length > 0 &&
    data.token.length > 0 &&
    data.NFT.length > 0
  ) {
    Near.call(
      "airdropfactorybeta.testnet",
      "create_factory_subaccount_and_deploy",
      {
        name: data.subContract,
        controller: user_account,
        tokenAddress: data.token,
        nftAddress: data.NFT,
      },
      "300000000000000",
      "10400000000000000000000000"
    );
  }
}

const create = (
  <div>
    <h1>Create air drop contract</h1>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Contract name
      </span>
      <input
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.subContract = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
      <span class="input-group-text" id="basic-addon2">
        .airdropfactorybeta.testnet
      </span>
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Token contract id
      </span>
      <input
        value={state.contract.token}
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.token = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        NFT contract Id
      </span>
      <input
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.nft = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
    </div>
    <button class="btn btn-primary mt-2" onClick={createAirdrop}>
      Create
    </button>
    <hr />
  </div>
);

function registerCall() {
  Near.call(
    state.contract.token,
    "storage_deposit",
    { account_id: `${state.contract.airdrop}` },
    "200000000000000",
    "1500000000000000000000"
  );
}
const register = (
  <div>
    <h1>Register airdrop to use the token</h1>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Airdrop contract id
      </span>
      <input
        type="text"
        value={state.contract.airdrop}
        onChange={({ target }) => {
          const contract = state.contract;
          contract.airdrop = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Token contract id
      </span>
      <input
        value={state.contract.token}
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.token = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
    </div>
    <button class="btn btn-primary mt-2" onClick={registerCall}>
      Register
    </button>
    <div class="alert alert-primary mt-2">
      Please deposit token after creating airdrop contract and register
    </div>
    <hr />
  </div>
);

function NFTTotalSupply() {
  console.log(state.contract);
  const supply = Near.view(state.contract.nft, "nft_total_supply");
  const contract = state.contract;
  contract.nftBalance = supply;
  State.update({ contract });
}

function accountBalance() {
  const contract = state.contract;
  const balance = Near.view(contract.token, "ft_balance_of", {
    account_id: state.contract.airdrop,
  });
  console.log(balance);
  contract.tokenBalance = balance;
  State.update({ contract });
}

function findAirdrop() {
  NFTTotalSupply();
  accountBalance();
}

function startCall() {
  const contract = state.contract;
  if(contract.airdrop.length > 0 && contract.start > 0 && contract.end > 0){
    Near.call(contract.airdrop, "startAirdrop", {
      startAt:contract.start,
      endAt:contract.end,
      amount:contract.amount,
      limit:contract.number,
      bannedList:contract.banned
  });
  }  
}

const setAirdrop = (
  <div>
    <h1>Set air drop contract</h1>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Airdrop contract id
      </span>
      <input
        type="text"
        value={state.contract.airdrop}
        onChange={({ target }) => {
          const contract = state.contract;
          console.log(contract.airdrop);
          contract.airdrop = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Token contract id
      </span>
      <input
        type="text"
        value={contract[1]}
        onChange={({ target }) => {
          const contract = state.contract;
          contract.token = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        NFT contract id
      </span>
      <input
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.nft = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
    </div>
    <button class="btn btn-primary mt-2" onClick={findAirdrop}>
      Find Airdrop
    </button>
    <p>Airdrop account balance:{state.contract.tokenBalance}</p>
    <p>NFT total supply:{state.contract.nftBalance}</p>
    <div class="input-group mb-3">
      <input
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.amount = target.value;
          if (contract.number != 0 && contract.amount != 0) {
            contract.rewards = contract.amount / contract.number;
            State.update({ contract });
          }
        }}
        placeholder="amount of tokens for airdrop"
        class="form-control"
      />
      <input
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.number = target.value;
          if (contract.number != 0 && contract.amount != 0) {
            contract.rewards = contract.amount / contract.number;
            State.update({ contract });
          }
        }}
        placeholder="number of nft will be reciver airdrop"
        class="form-control"
      />
      <span class="input-group-text" id="basic-addon2">
        tokens per nfts: {state.contract.rewards}
      </span>
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Start time
      </span>
      <input
        type="date"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.start = new Date(target.value).getTime() * 1000000;
          State.update({ contract });
        }}
        class="form-control"
        placeholder="Username"
      />
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        End time
      </span>
      <input
        type="date"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.end = new Date(target.value).getTime() * 1000000;
          State.update({ contract });
        }}
        class="form-control"
        placeholder="Username"
      />
    </div>
    <p>list of need banned to airdrops</p>
    <div class="input-group mb-3">
      <input
        type="text"
        onChange={({ target }) => {
          console.log();
          const contract = state.contract;
          contract.banned = target.value.split(",");
          State.update({ contract });
        }}
        class="form-control"
        placeholder="ex: 1,2,3"
      />
    </div>
    <button class="btn btn-primary mt-2" onClick={startCall}>
      Start
    </button>
    <hr></hr>
  </div>
);

function withdrawCall() {
  if (state.contract.tokenBalance > 0) {
    Near.call(`${state.contract.airdrop}`, "withdraw", {
      receiverId: `${user_account}`,
      amount: `${state.contract.tokenBalance}`,
    }, "200000000000000",
      "1");
  }

}
const withdraw = <div>
  <h1>withdraw balance</h1>
  <div class="alert alert-warning" role="alert">
    only contract owner is able to withdraw and if airdrop time ended
  </div>
  <button class="btn btn-primary mt-2" onClick={withdrawCall}>
    withdraw
  </button>
</div>;

return (
  <div>
    {create}
    {register}
    {setAirdrop}
    {withdraw}
  </div>
);
