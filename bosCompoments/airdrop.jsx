function store() {
  Storage.set("lastBlockHeight", notifications[0].blockHeight);
  Storage.get("lastBlockHeight");
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
        onChange={onInputChange}
        class="form-control"
        placeholder="Username"
      />
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        Token contract
      </span>
      <input
        type="text"
        onChange={onInputChange}
        class="form-control"
        placeholder="Username"
      />
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">
        NFT contract
      </span>
      <input
        type="text"
        onChange={onInputChange}
        class="form-control"
        placeholder="Username"
      />
    </div>
    <button class="btn btn-primary mt-2" onClick={onBtnClick}>
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
        onChange={onInputChange}
        class="form-control"
        placeholder="Username"
      />
    </div>

    <p>Airdrop account balance</p>
    <p>NFT total supply</p>
    <div class="input-group mb-3">
      <input
        type="text"
        class="form-control"
        placeholder="Amount"
        aria-label="Amount"
      />
      <input
        type="text"
        class="form-control"
        placeholder="Limit of nft"
        aria-label="Limit of nft"
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
        onChange={onInputChange}
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
        onChange={onInputChange}
        class="form-control"
        placeholder="Username"
      />
    </div>
    <p>list of need banned to airdrops</p>
    <div class="alert alert-warning" role="alert">
      Use "," to create the list or live em white
    </div>
    <div class="input-group mb-3">
      <input
        type="text"
        onChange={onInputChange}
        class="form-control"
        placeholder="list of banned nfts"
      />
    </div>
    <button class="btn btn-primary mt-2" onClick={onBtnClick}>
      Start
    </button>
  </div>
);
