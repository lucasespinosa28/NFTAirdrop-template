var graphOwner = JSON.stringify({
    query:
      'query MyQuery {\r\n  mb_views_nft_owned_tokens(\r\n    limit: 1000\r\n    offset: 0\r\n    where: {\r\n      nft_contract_id: {_eq: "fruitknightstore.mintspace2.testnet"}\r\n    	owner:{_eq:"lukcy91.testnet"}\r\n    }\r\n  ) {\r\n    title\r\n    media\r\n    token_id\r\n    description\r\n  }\r\n}\r\n',
    variables: {},
  });
  
  var graphNFT = JSON.stringify({
    query:
      'query MyQuery {\r\n  mb_views_nft_owned_tokens(\r\n    limit: 1000\r\n    offset: 0\r\n    where: {\r\n      nft_contract_id: {_eq: "fruitknightstore.mintspace2.testnet"}\r\n    }\r\n  ) {\r\n    title\r\n    media\r\n    token_id\r\n    description\r\n  price\r\n }\r\n}\r\n',
    variables: {},
  });
  
  var requestOptions = {
    method: "POST",
    headers: {
      "mb-api-key": "anon",
      "Content-Type": "application/json",
    },
    body: state.page == 2 ? graphNFT : graphOwner,
    redirect: "follow",
  };
  
  function resquet() {
    const res = fetch("https://graph.mintbase.xyz/testnet", requestOptions);
    return res;
  }
  
  State.init({
    page: 1,
  });
  
  const ownedNft = resquet().body.data.mb_views_nft_owned_tokens.map(
    (item, index) => {
      return (
        <div class="col" key={item.token_id}>
          <div class="card w-100 m-3">
            <img class="card-img-top" src={item.media} alt={item.description} />
            <h5 class="m-2  text-center">{item.title}</h5>
            <button class="btn btn-primary mx-1" onClick={onBtnClick}>
              1 - Approve NFT
            </button>
            <button class="btn btn-primary mx-1" onClick={onBtnClick}>
              2 - Receive tokens
            </button>
          </div>
        </div>
      );
    }
  );
  
  const galleryNFT = resquet().body.data.mb_views_nft_owned_tokens.map(
    (item, index) => {
      const price = item.price ? item.price : "Not for sale";
      return (
        <div class="col" key={item.token_id}>
          <div class="card w-100 m-3">
            <img class="card-img-top" src={item.media} alt={item.description} />
            <h5 class="card-title">{item.title}</h5>
            <h6 class="card-subtitle mb-2 text-body-secondary">{price}</h6>
            <a class="link-opacity-100" href="#">
              Link opacity 100
            </a>
            <button class="btn btn-primary mt-2" onClick={onBtnClick}>
              Buy now
            </button>
            <button class="btn btn-primary mt-2" onClick={onBtnClick}>
              claimed airdrop
            </button>
          </div>
        </div>
      );
    }
  );
  
  const airdrop = (
    <div>
      <h1>Airdrop</h1>
      <h2>End time</h2>
      <h2>Nao esta dispinivel</h2>
      <h2>Começa em</h2>
      <p>Description</p>
      <p>you have 1 of 4 nft dispoveil for airdrop</p>
      <div class="row align-items-start">{ownedNft}</div>
    </div>
  );
  
  const gallery = (
    <div>
      <h1>Find NFT</h1>
      <p>Descriptiom</p>
      <div class="row align-items-start">{galleryNFT}</div>
      <span>Name</span>
      <span>Image imamge</span>
      <button class="btn btn-primary mt-2" onClick={onBtnClick}>
        Buyr now 1near
      </button>
    </div>
  );
  
  return (
    <div class="container text-center">
      <h1>Welcome to xxx airdropt</h1>
      <div class="btn-group" role="group" aria-label="Basic example">
        <button
          class="btn btn-dark mt-2"
          onClick={() => State.update({ page: 1 })}
        >
          Home
        </button>
        <button
          class="btn btn-dark mt-2"
          onClick={() => State.update({ page: 2 })}
        >
          Find eleginabel NFTs
        </button>
      </div>
      <div class="container text-center">
        {state.page == 1 ? airdrop : gallery}
        <a class="link-opacity-100" href="#">
          Create your own airdrops
        </a>
      </div>
    </div>
  );
  