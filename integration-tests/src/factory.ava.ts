import { Worker } from "near-workspaces";
import { test } from './test';

test.beforeEach(async (t) => {
  const worker = await Worker.init();

  const root = worker.rootAccount;

  const factory = await root.createSubAccount("factory");

  await factory.deploy("../factory/target/wasm32-unknown-unknown/release/contract.wasm");

 
  
  t.context.worker = worker;
  t.context.accounts = {
    factory,
    root,
  };
});

test.afterEach(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

test("factory contract deploy", async (t) => {
  const { factory, root } = t.context.accounts;
 await root.call(
    factory,
    "create_factory_subaccount_and_deploy",
    {
      name:"sub",
      controller: root.accountId,
      tokenAddress: root.accountId,
      nftAddress: root.accountId,
    },
    { gas: "300000000000000", attachedDeposit: "10400000000000000000000000" }
  );
  const timer = await root.getAccount("sub.factory.test.near").view("Timer") as {activated:boolean,endAt:bigint,startAt:bigint}
  t.is(timer.activated, false);
});