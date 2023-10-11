return (
    <div>
      <h1>Create air drop contract</h1>
      <p>contract sub name</p>
      <input onChange={onInputChange} />
      <p>token contract</p>
      <input onChange={onInputChange} />
      <p>NFT contract</p>
      <input onChange={onInputChange} />
  
      <button class="btn btn-primary mt-2" onClick={onBtnClick}>
        Create
      </button>
      <p>Plaea deposit tokens after create airdrop</p>
      <h1>Set air drop contract</h1>
      <p>Airdrop account balance</p>
      <p>NFT total supply</p>
      <p>Supply Airdrop/NFT</p>
      <p>Amount of tokes for airdrop</p>
      <input onChange={onInputChange} />
      <p>Number of that receive</p>
      <input onChange={onInputChange} />
      <p>Total of prize</p>
      <p>start time</p>
      <input type="date" onChange={onInputChange} />
      <p>end time</p>
      <input type="date" onChange={onInputChange} />
      <p>list of need banned to airdrops</p>
      <input type="" onChange={onInputChange} />
      <button class="btn btn-primary mt-2" onClick={onBtnClick}>
        Start
      </button>
    </div>
  );
  