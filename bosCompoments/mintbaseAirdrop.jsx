let user_account = context.accountId;
const data = {
  factory: "mintairdrop.testnet",
  contract: "dogknight.mintspace2.testnet",
  name: "Dog knight",
  airdrop: "dogknight.mintairdrop.testnet",
  reward: "get 100000 🐶Dog token per nft",
  description:
    "Dog Knights” is a game set in a Dog Kingdom. In this kingdom, there is a bountiful Fruit Tree that bears fruits which grant extraordinary powers to whoever eats them.",
};
State.init({
  page: 1,
  end: "",
});

const graphOwner = JSON.stringify({
  query: `query MyQuery {\r\n  mb_views_nft_owned_tokens(\r\n    limit: 1000\r\n    offset: 0\r\n    where: {\r\n      nft_contract_id: {_eq: "${data.contract}"}\r\n    	owner:{_eq:"${user_account}"}\r\n    }\r\n  ) {\r\n    title\r\n    media\r\n    token_id\r\n    description\r\n  }\r\n}\r\n`,
  variables: {},
});

const graphNFT = JSON.stringify({
  query: `query MyQuery {\r\n  mb_views_nft_owned_tokens(\r\n    limit: 1000\r\n    offset: 0\r\n    where: {\r\n      nft_contract_id: {_eq: "${data.contract}"}\r\n    }\r\n  ) {\r\n    title\r\n    media\r\n    token_id\r\n  owner\r\  description\r\n  price\r\n }\r\n}\r\n`,
  variables: {},
});

const requestOptions = {
  method: "POST",
  headers: {
    "mb-api-key": "anon",
    "Content-Type": "application/json",
  },
  body: state.page == 1 ? graphOwner : graphNFT,
  redirect: "follow",
};

function resquet() {
  const res = fetch("https://graph.mintbase.xyz/testnet", requestOptions);
  return res;
}

function statusNft(tokenId) {
  return Near.view(data.airdrop, "status", {
    tokenId: tokenId,
  });
}

function buyNow(tokenId) {
  Near.call(
    "market-v2-beta.mintspace2.testnet",
    "buy",
    {
      nft_contract_id: data.contract,
      token_id: tokenId,
      referrer_id: null,
    },
    "300000000000000",
    "1000000000000000000000000"
  );
}

function timerView() {
  const timer = Near.view(data.airdrop, "Timer");
  timer.startAt = new Date(timer.startAt / 1000000);
  timer.endAt = new Date(timer.endAt / 1000000);
  const states = state;
  states.end = `${timer.endAt}`;
  State.update(states);
  return timer;
}

function approveCall(tokenId) {
  Near.call(
    data.airdrop,
    "query_nft_token",
    { tokenId: tokenId },
    "200000000000000"
  );
}
function receiveCall(tokenId) {
  Near.call(
    data.airdrop,
    "transfer_tokens",
    {
      tokenId: tokenId,
    },
    "200000000000000",
    "1"
  );
}
const ownedNft = () => {
  return resquet().body.data.mb_views_nft_owned_tokens.map((item, index) => {
    const status = statusNft(item.token_id);
    console.log(status);
    return (
      <div class="w-50" key={item.token_id}>
        <div class="card m-1">
          <img class="card-img-top" src={item.media} alt={item.description} />
          <h5 class="m-2  text-center">{item.title.replace(/ /g, "\n")}</h5>
          {status == null && (
            <button
              class="btn btn-primary mx-1"
              onClick={() => {
                approveCall(item.token_id);
              }}
            >
              Approve
            </button>
          )}
          {status.claimed == false && (
            <button
              class="btn btn-primary mx-1"
              onClick={() => {
                receiveCall(item.token_id);
              }}
            >
              Receive
            </button>
          )}
          {status.claimed == true && (
            <button
              type="button"
              class="btn btn-outline-secondary  mx-1"
              disabled
            >
              Claimed!!
            </button>
          )}
        </div>
      </div>
    );
  });
};
const galleryNFT = () => {
  return resquet().body.data.mb_views_nft_owned_tokens.map((item, index) => {
    const price =
      `${item.price}`.length > 0
        ? `Near ${item.price}`.replace("e+24", ".00")
        : "Not for sale";
    const status = statusNft(item.token_id);
    console.log(item.owner);
    {
      return (
        status == null &&
        user_account != item.owner && (
          <div class="w-50" key={item.token_id}>
            <div class="card m-3">
              <img
                class="card-img-top"
                src={item.media}
                alt={item.description}
              />
              <h5 class="card-title">{item.title}</h5>
              <h6 class="card-subtitle mb-2 text-body-secondary">{price}</h6>
              <a
                class="link-opacity-100"
                href={`https://testnet.mintbase.xyz/contract/${data.contract}/nfts/all/0`}
              >
                Buy on mintbase
              </a>
              {`${item.price}`.length > 0 && (
                <button
                  class="btn btn-primary mt-2"
                  onClick={() => {
                    buyNow(item.token_id);
                  }}
                >
                  Buy now
                </button>
              )}
            </div>
          </div>
        )
      );
    }
  });
};
const airdrop = (
  <div>
    <div class="row align-items-start ">{ownedNft()}</div>
  </div>
);

const gallery = (
  <div>
    <div class="row align-items-start">{galleryNFT()}</div>
  </div>
);
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
return (
  <div class="container text-center">
    <h1>Welcome to {data.name}</h1>
    <h2>{data.reward}</h2>
    <p>{data.description}</p>
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
      {timerView().activated == true ? (
        <h1>Airdrop end at {state.end.split(":00 ")[0]}</h1>
      ) : (
        <h1>Airdrop not started </h1>
      )}
      {state.page == 1 ? airdrop : gallery}
      <a class="link-opacity-100" href="#">
        Create your own airdrops
      </a>
    </div>
  </div>
);
