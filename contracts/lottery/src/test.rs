#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, IntoVal};
use soroban_sdk::token::{Client as TokenClient, StellarAssetClient};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let contract_address = env.register_stellar_asset_contract(admin.clone());
    (
        TokenClient::new(env, &contract_address),
        StellarAssetClient::new(env, &contract_address),
    )
}

#[test]
fn test_permissionless_lottery() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, LotteryContract);
    let client = LotteryContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let buyer1 = Address::generate(&env);
    let buyer2 = Address::generate(&env);
    
    let (token, token_admin) = create_token_contract(&env, &admin);
    
    // Mint tokens
    token_admin.mint(&buyer1, &100);
    token_admin.mint(&buyer2, &100);
    
    // Setup time
    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });
    
    // Permissionless create
    let duration = 500;
    let ticket_price = 10;
    
    let lottery_id = client.create_lottery(&creator, &token.address, &ticket_price, &duration);
    assert_eq!(lottery_id, 1);
    
    // Permissionless buy_ticket
    client.buy_ticket(&lottery_id, &buyer1);
    assert_eq!(token.balance(&buyer1), 90);
    assert_eq!(token.balance(&contract_id), 10);
    
    client.buy_ticket(&lottery_id, &buyer2);
    assert_eq!(token.balance(&buyer2), 90);
    assert_eq!(token.balance(&contract_id), 20);
    
    // Move time past duration to allow draw
    env.ledger().with_mut(|li| {
        li.timestamp = 2000;
    });
    
    // Permissionless draw_winner
    client.draw_winner(&lottery_id);
    
    // Contract balance should be 0 now (except if it was randomly chosen, but here participants are buyer1 and buyer2 plus possibly the initially pushed "env" ? Wait, in lib.rs it pushes `&env` address ? No `&env` address doesn't exist, we pushed the contract address as first.)
    // Let's check who won. One of them got 20 tokens.
    let bal1 = token.balance(&buyer1);
    let bal2 = token.balance(&buyer2);
    assert!(bal1 == 110 || bal2 == 110);
    assert_eq!(token.balance(&contract_id), 0);
}
