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
export const CONTRACT_ID = "CDRTITFVPL7SMUBWKXGEHP3XUIX2A6KZ3RUMS6AIFEPOS7QGIERPG2AS";

/**
 * Fetch lottery info from the contract.
 */
export async function getLotteryInfo(lotteryId: number) {
  const contract = new Contract(CONTRACT_ID);
  


  try {
    const simRes = await server.simulateTransaction(
      new TransactionBuilder(
        await server.getAccount("GCKAVAXOGCUTPZQXSVZNAMA4GKVR5NOSAKXZFF2AX44NQ7UNRTC63GTB"),
        { fee: BASE_FEE, networkPassphrase }
      )
      .addOperation(contract.call("get_lottery", xdr.ScVal.scvU32(lotteryId)))
      .setTimeout(30)
      .build()
    );

    if (simRes && (simRes as any).result && (simRes as any).result.retval) {
      return scValToNative((simRes as any).result.retval);
    }
    console.log("Simulation contained no valid result:", simRes);
    return null;
  } catch (err) {
    console.log("Simulation threw an error cleanly:", err);
    return null;
  }
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

  return await server.prepareTransaction(tx) as any;
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

  return await server.prepareTransaction(tx) as any;
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
    new Address(creatorAddress).toScVal(),
    new Address(tokenAddress).toScVal(),
    nativeToScVal(ticketPrice, { type: "i128" }),
    nativeToScVal(duration, { type: "u64" })
  ))
  .setTimeout(30)
  .build();

  return await server.prepareTransaction(tx) as any;
}
