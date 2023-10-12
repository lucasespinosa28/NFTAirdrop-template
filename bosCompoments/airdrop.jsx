function store() {
  Storage.set("lastBlockHeight", notifications[0].blockHeight);
  Storage.get("lastBlockHeight");
}
State.init({
  contract: {
    subContract,
    token,
    NFT,
    airdrop,
    amount,
    number,
    start,
    end,
  },
});

function createAirdrop() {
  const data = state.contract;
  if (
    data.subContract.length > 0 &&
    data.token.length > 0 &&
    data.NFT.length > 0
  ) {
    console.log(
      `subContract:${state.contract.subContract} token:${state.contract.token} NFT:${state.contract.NFT}`
    );
  }
}

function NFTTotalSupply() {
  const contract = state.contract.NFT;
  return Near.view(contract, "nft_total_supply", `{}`);
}

function accountBalance() {
  const contract = state.contract.airdrop;
  return Near.view(
    contract,
    "ft_balance_of",
    `{"account_id":"${contract[3]}"}`
  );
}

return (
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
        value={contract[1]}
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
          contract.NFT = target.value;
          State.update({ contract });
        }}
        class="form-control"
      />
    </div>
    <button class="btn btn-primary mt-2" onClick={createAirdrop}>
      Create
    </button>
    <div class="alert alert-primary mt-2">
      Please deposit token after creating airdrop
    </div>
    <hr />
    <h1>Set air drop contract</h1>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Airdrop contract id
      </span>
      <input
        type="text"
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
    <button
      class="btn btn-primary mt-2"
      onClick={() => {
        function NFTTotalSupply() {
          const contract = state.contract;
          return Near.view(contract[2], "nft_total_supply", `{}`);
        }
      }}
    >
      Find Airdrop
    </button>
    <p>Airdrop account balance</p>
    <p>NFT total supply</p>
    <div class="input-group mb-3">
      <input
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.amount = target.value;
          State.update({ contract });
        }}
        placeholder="amount of tokens for airdrop"
        class="form-control"
      />
      <input
        type="text"
        onChange={({ target }) => {
          const contract = state.contract;
          contract.number = target.value;
          State.update({ contract });
        }}
        placeholder="number of nft will be reciver airdrop"
        class="form-control"
      />
      <span class="input-group-text" id="basic-addon2">
        tokens per nfts: 1
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
          contract.start = target.value;
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
          contract.end = target.value;
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
        onChange={onInputChange}
        class="form-control"
        placeholder="ex: 1,2,3"
      />
    </div>
    <button class="btn btn-primary mt-2" onClick={onBtnClick}>
      Start
    </button>
  </div>
);
