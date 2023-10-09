use near_sdk::serde::Serialize;
use near_sdk::{env, log, near_bindgen, AccountId, Balance, Promise, PromiseError, PublicKey};

use crate::{Contract, ContractExt, NEAR_PER_STORAGE, NO_DEPOSIT, TGAS};
const INITIAL_BALANCE: Balance = 3_000_000_000_000_000_000_000_000; // 3e24yN, 3N

#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
struct airdropsInitArgs {
    tokenAddress: AccountId,
    nftAddress: AccountId,
}

const CODE: &[u8] = include_bytes!("../../contract/build/airdrops.wasm");
#[near_bindgen]
impl Contract {
    #[payable]
    pub fn create_child_contract(
        tokenAddress: AccountId,
        nftAddress: AccountId,
    ) -> Promise {
        let subaccount_id = AccountId::new_unchecked(
          format!("factory.{}", env::current_account_id())
        );
        let attached = env::attached_deposit();
        let init_args = near_sdk::serde_json::to_vec(&airdropsInitArgs {
            tokenAddress,
            nftAddress,
        })
        .unwrap();
        Promise::new(subaccount_id)
            .create_account()
            .transfer(attached)
            .add_full_access_key(env::signer_account_pk())
            .deploy_contract(CODE.to_vec())
            .function_call("init".to_owned(), init_args, NO_DEPOSIT, TGAS * 10)
    }
    #[payable]
    pub fn create_factory_subaccount_and_deploy(
        &mut self,
        name: String,
        tokenAddress: AccountId,
        nftAddress: AccountId,
        public_key: Option<PublicKey>,
    ) -> Promise {
        // Assert the sub-account is valid
        let current_account = env::current_account_id().to_string();
        let subaccount: AccountId = format!("{name}.{current_account}").parse().unwrap();
        assert!(
            env::is_valid_account_id(subaccount.as_bytes()),
            "Invalid subaccount"
        );

        // Assert enough money is attached to create the account and deploy the contract
        let attached = env::attached_deposit();

        let code = self.code.get().unwrap();
        let contract_bytes = code.len() as u128;
        let minimum_needed = NEAR_PER_STORAGE * contract_bytes;
        assert!(
            attached >= minimum_needed,
            "Attach at least {minimum_needed} yⓃ"
        );

        let init_args = near_sdk::serde_json::to_vec(&airdropsInitArgs {
            tokenAddress,
            nftAddress,
        })
        .unwrap();

        let mut promise = Promise::new(subaccount.clone())
            .create_account()
            .transfer(attached)
            .deploy_contract(code)
            .function_call("init".to_owned(), init_args, NO_DEPOSIT, TGAS * 10);

        // Add full access key is the user passes one
        if let Some(pk) = public_key {
            promise = promise.add_full_access_key(pk);
        }

        // Add callback
        // Add callback
        promise.then(
            Self::ext(env::current_account_id()).create_factory_subaccount_and_deploy_callback(
                subaccount,
                env::predecessor_account_id(),
                attached,
            ),
        )
    }

    #[private]
    pub fn create_factory_subaccount_and_deploy_callback(
        &mut self,
        account: AccountId,
        user: AccountId,
        attached: Balance,
        #[callback_result] create_deploy_result: Result<(), PromiseError>,
    ) -> bool {
        if let Ok(_result) = create_deploy_result {
            log!(format!("Correctly created and deployed to {account}"));
            return true;
        };

        log!(format!(
            "Error creating {account}, returning {attached}yⓃ to {user}"
        ));
        Promise::new(user).transfer(attached);
        false
    }
}
