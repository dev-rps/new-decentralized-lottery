import { 
  rpc, 
  Address, 
  xdr, 
  scValToNative, 
  Contract, 
  TransactionBuilder, 
  Networks, 
  BASE_FEE,
  nativeToScVal
} from "@stellar/stellar-sdk";

export const rpcUrl = "https://soroban-testnet.stellar.org";
export const networkPassphrase = Networks.TESTNET;
export const server = new rpc.Server(rpcUrl);
export const CONTRACT_ID = "CD6YZWTTVLPVWB5CEH76IE7YVYQBY3V7VZFKMWTZ2ZDMD4XPYFYEWSJJ";

/**
 * Fetch lottery info from the contract.
 */
export async function getLotteryInfo(lotteryId: number) {
  const contract = new Contract(CONTRACT_ID);
  
  // Call the get_lottery function (view function)
  const response = await server.getEvents({
    startLedger: 0,
    filters: [], // Simplified for now
  });

  // Simulation is easier for view functions
  const simRes = await server.simulateTransaction(
    new TransactionBuilder(
      await server.getAccount("G...",), // Dummy account for simulation
      { fee: BASE_FEE, networkPassphrase }
    )
    .addOperation(contract.call("get_lottery", xdr.ScVal.scvU32(lotteryId)))
    .setTimeout(30)
    .build()
  );

  if (rpc.Api.isSimulationSuccess(simRes)) {
    return scValToNative(simRes.result!.retval);
  }
  return null;
}

/**
 * Build a transaction to buy a ticket.
 */
export async function buyTicketTx(buyerAddress: string, lotteryId: number, tokenAddress: string, amount: bigint) {
  const contract = new Contract(CONTRACT_ID);
  
  const tx = new TransactionBuilder(
    await server.getAccount(buyerAddress),
    { fee: BASE_FEE, networkPassphrase }
  )
  .addOperation(contract.call("buy_ticket", 
    xdr.ScVal.scvU32(lotteryId),
    new Address(buyerAddress).toScVal()
  ))
  .setTimeout(30)
  .build();

  return tx;
}

/**
 * Build a transaction to draw a winner.
 */
export async function drawWinnerTx(executorAddress: string, lotteryId: number) {
  const contract = new Contract(CONTRACT_ID);
  
  const tx = new TransactionBuilder(
    await server.getAccount(executorAddress),
    { fee: BASE_FEE, networkPassphrase }
  )
  .addOperation(contract.call("draw_winner", 
    xdr.ScVal.scvU32(lotteryId)
  ))
  .setTimeout(30)
  .build();

  return tx;
}

/**
 * Build a transaction to create a new lottery.
 */
export async function createLotteryTx(creatorAddress: string, tokenAddress: string, ticketPrice: bigint, duration: bigint) {
  const contract = new Contract(CONTRACT_ID);
  
  const tx = new TransactionBuilder(
    await server.getAccount(creatorAddress),
    { fee: BASE_FEE, networkPassphrase }
  )
  .addOperation(contract.call("create_lottery", 
    nativeToScVal(creatorAddress, { type: "address" }),
    nativeToScVal(tokenAddress, { type: "address" }),
    nativeToScVal(ticketPrice, { type: "i128" }),
    nativeToScVal(duration, { type: "u64" })
  ))
  .setTimeout(30)
  .build();

  return tx;
}
