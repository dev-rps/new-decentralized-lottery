#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, Vec, token};

#[contracttype]
pub enum DataKey {
    Lottery(u32),
    Counter,
}

#[contracttype]
#[derive(Clone)]
pub struct LotteryInfo {
    pub creator: Address,
    pub token: Address,
    pub ticket_price: i128,
    pub end_time: u64,
    pub participants: Vec<Address>,
    pub winner: Option<Address>,
    pub active: bool,
}

#[contract]
pub struct LotteryContract;

#[contractimpl]
impl LotteryContract {
    /// Anyone can create a new lottery by providing the parameters.
    pub fn create_lottery(env: Env, creator: Address, token: Address, ticket_price: i128, duration: u64) -> u32 {
        creator.require_auth();
        
        let mut counter: u32 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        counter += 1;
        
        let end_time = env.ledger().timestamp().saturating_add(duration);
        let info = LotteryInfo {
            creator,
            token,
            ticket_price,
            end_time,
            participants: vec![&env],
            winner: None,
            active: true,
        };
        
        env.storage().persistent().set(&DataKey::Lottery(counter), &info);
        env.storage().instance().set(&DataKey::Counter, &counter);
        
        counter
    }
    
    /// Anyone can buy a ticket for an active lottery.
    pub fn buy_ticket(env: Env, lottery_id: u32, buyer: Address) {
        buyer.require_auth();
        
        let mut info: LotteryInfo = env.storage().persistent().get(&DataKey::Lottery(lottery_id))
            .expect("Lottery ID not found. Ensure you created a pool first.");
        
        assert!(info.active, "Lottery is not active");
        assert!(env.ledger().timestamp() < info.end_time, "Lottery has ended");
        
        // Transfer tokens from buyer to contract
        let token_client = token::Client::new(&env, &info.token);
        token_client.transfer(&buyer, &env.current_contract_address(), &info.ticket_price);
        
        info.participants.push_back(buyer);
        env.storage().instance().set(&DataKey::Lottery(lottery_id), &info);
    }
    
    /// Permissionless draw function: anyone can trigger it after the deadline.
    pub fn draw_winner(env: Env, lottery_id: u32) {
        let mut info: LotteryInfo = env.storage().persistent().get(&DataKey::Lottery(lottery_id))
            .expect("Lottery not found");
        
        assert!(info.active, "Lottery already drawn");
        assert!(env.ledger().timestamp() >= info.end_time, "Lottery still ongoing");
        
        let participants_len = info.participants.len();
        if participants_len == 0 {
            info.active = false;
            env.storage().instance().set(&DataKey::Lottery(lottery_id), &info);
            return;
        }
        
        // prng is available in soroban-sdk v20+ for secure on-chain randomness.
        let winner_index = env.prng().gen_range::<u64>(0u64..(participants_len as u64)) as u32;
        let winner = info.participants.get(winner_index).unwrap();
        
        let total_prize = info.ticket_price.saturating_mul(participants_len as i128);
        
        let token_client = token::Client::new(&env, &info.token);
        token_client.transfer(&env.current_contract_address(), &winner, &total_prize);
        
        info.winner = Some(winner);
        info.active = false;
        
        env.storage().instance().set(&DataKey::Lottery(lottery_id), &info);
    }
    
    /// View function to get lottery information.
    pub fn get_lottery(env: Env, lottery_id: u32) -> LotteryInfo {
        env.storage().persistent().get(&DataKey::Lottery(lottery_id))
            .expect("Lottery not found")
    }
}
