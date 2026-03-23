"use client";

import React, { useState, useEffect } from "react";
import { isConnected, requestAccess, getAddress, signTransaction } from "@stellar/freighter-api";
import {
  server,
  networkPassphrase,
  buyTicketTx,
  drawWinnerTx,
  claimPrizeTx,
  createLotteryTx,
  getLotteryInfo,
  getLotteryCount,
} from "@/lib/stellar";
import { Transaction } from "@stellar/stellar-sdk";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Users, Ticket, Coins, Sparkles, Loader2, Plus, LogIn, ExternalLink, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentLotteryId, setCurrentLotteryId] = useState<number>(0);
  const [lotteryInfo, setLotteryInfo] = useState<any>(null);
  const [nowTs, setNowTs] = useState<number>(Math.floor(Date.now() / 1000));
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lotteryHistory, setLotteryHistory] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTs(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLotteryInfo = async () => {
    try {
      const count = await getLotteryCount();
      if (count > 0) {
        setCurrentLotteryId(count);
        const info = await getLotteryInfo(count);
        setLotteryInfo(info);

        // Fetch history (last 5 rounds)
        const history = [];
        for (let i = count - 1; i > Math.max(0, count - 6); i--) {
          const pastInfo = await getLotteryInfo(i);
          if (pastInfo) {
            history.push({ id: i, ...pastInfo });
          }
        }
        setLotteryHistory(history);
      } else {
        setLotteryInfo(null);
        setLotteryHistory([]);
      }
    } catch (e) {
      console.error("Failed to fetch lottery info", e);
      setLotteryInfo(null);
    }
  };

  useEffect(() => {
    fetchLotteryInfo();
    const interval = setInterval(fetchLotteryInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    try {
      if (await isConnected()) {
        await requestAccess();
        const address = await getAddress();
        setWalletAddress(address.address);
      } else {
        alert("Freighter wallet not installed!");
      }
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  const executeTxInfo = async (
    actionName: string,
    txBuilderCall: () => Promise<any>,
    successMessage: string
  ) => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    setActionLoading(actionName);
    setStatus(`Preparing ${actionName}...`);

    try {
      const tx = await txBuilderCall();
      setStatus("Waiting for Freighter signature...");
      const signResult = await signTransaction(tx.toXDR(), { networkPassphrase });
      const signedXdr = typeof signResult === "string" ? signResult : signResult.signedTxXdr;

      setStatus(`Executing ${actionName} on Soroban...`);
      const txToSubmit = new Transaction(signedXdr, networkPassphrase);
      const result = await server.sendTransaction(txToSubmit);

      if (result.status !== "ERROR") {
        alert(successMessage);
        setStatus("Waiting for ledger sync...");
        setTimeout(fetchLotteryInfo, 3000);
      } else {
        throw new Error("Transaction execution returned ERROR");
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error during ${actionName}: ${e.message || String(e)}`);
    } finally {
      setActionLoading(null);
      setStatus(null);
    }
  };

  const handleCreateLottery = () => {
    setIsDeploying(true);
    executeTxInfo(
      "Create Pool",
      async () => {
        const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
        const ticketPrice = BigInt(100000000); // 10 XLM
        const duration = BigInt(120); // 120s
        return await createLotteryTx(walletAddress!, XLM_SAC, ticketPrice, duration);
      },
      "Success! New lottery pool created. Discovering pool ID..."
    ).finally(() => setIsDeploying(false));
  };

  const handleBuyTicket = () => {
    executeTxInfo(
      "Buy Ticket",
      async () => {
        const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
        return await buyTicketTx(walletAddress!, currentLotteryId, XLM_SAC, BigInt(100000000));
      },
      "Ticket purchased successfully! Good luck!"
    );
  };

  const handleDrawWinner = (id?: number) => {
    const targetId = typeof id === 'number' ? id : currentLotteryId;
    executeTxInfo(
      "Draw Winner",
      async () => await drawWinnerTx(walletAddress!, targetId),
      "Winner drawn successfully!"
    );
  };

  const handleClaimPrize = (id?: number) => {
    const targetId = typeof id === 'number' ? id : currentLotteryId;
    executeTxInfo(
      "Claim Prize",
      async () => await claimPrizeTx(walletAddress!, targetId),
      "Prize claimed successfully!"
    );
  };

  const selectLottery = async (id: number) => {
    setCurrentLotteryId(id);
    const info = await getLotteryInfo(id);
    setLotteryInfo(info);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // State calculations
  let isActive = false;
  let isClaimed = false;
  let isDrawn = false;
  let winnerAddr: string | null = null;
  let timeLeftStr = "Loading...";
  let participantCount = 0;
  let ticketPriceStr = "10";
  let poolSizeStr = "0";
  let canDraw = false;

  if (lotteryInfo) {
    isActive = lotteryInfo.active;
    isClaimed = lotteryInfo.prize_claimed;
    winnerAddr = lotteryInfo.winner ? String(lotteryInfo.winner) : null;
    isDrawn = !isActive && winnerAddr !== null;

    const end = Number(lotteryInfo.end_time);
    if (end > nowTs) {
      const diff = end - nowTs;
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      timeLeftStr = `${m}m ${s.toString().padStart(2, "0")}s`;
    } else {
      timeLeftStr = "Ended";
      if (isActive) canDraw = true;
    }

    participantCount = lotteryInfo.participants ? lotteryInfo.participants.length : 0;
    const tpStr = lotteryInfo.ticket_price ? lotteryInfo.ticket_price.toString() : "0";
    const tp = Number(tpStr) / 10000000;
    ticketPriceStr = tp.toString();
    poolSizeStr = (tp * participantCount).toString();
  }

  return (
    <div className="flex flex-col gap-12 pb-20 w-full animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span>Stellar Testnet Live</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          Nexus
          <br />
          <span className="text-gradient">Lottery.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl"
        >
          Participate in trustless prize pools powered by Soroban smart contracts. No middlemen, verifiable randomness.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-6"
        >
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-semibold text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <LogIn className="w-5 h-5" />
              Connect Freighter
            </button>
          ) : (
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-sm">
                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}
        </motion.div>
      </section>

      {/* Main App Grid */}
      {walletAddress && (
        <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10 w-full">
          
          {/* Active Pool Card (Left Column) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-brand-400" /> Current Pool
              </h2>
              {currentLotteryId > 0 && (
                <span className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-mono border border-white/5 text-zinc-400">
                  ID: #{currentLotteryId}
                </span>
              )}
            </div>

            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
              {/* Background glow for card */}
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none" />
              
              {!lotteryInfo ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  <p>Discovering active pools...</p>
                </div>
              ) : (
                <div className="relative z-10 space-y-10">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="text-zinc-400 text-sm flex items-center gap-2">
                        <Coins className="w-4 h-4" /> Prize Pool
                      </div>
                      <div className="text-3xl font-bold tracking-tight text-white">{poolSizeStr} <span className="text-lg text-brand-400">XLM</span></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-zinc-400 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" /> Entries
                      </div>
                      <div className="text-3xl font-bold tracking-tight text-white">{participantCount}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-zinc-400 text-sm flex items-center gap-2">
                        <Ticket className="w-4 h-4" /> Ticket Price
                      </div>
                      <div className="text-3xl font-bold tracking-tight text-white">{ticketPriceStr} <span className="text-lg text-zinc-500">XLM</span></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-zinc-400 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Status
                      </div>
                      <div className="text-3xl font-bold tracking-tight text-white">
                        {isActive ? (
                          <span className="text-emerald-400 font-mono">{timeLeftStr}</span>
                        ) : isClaimed ? (
                          <span className="text-zinc-500 text-xl">Completed</span>
                        ) : isDrawn ? (
                          <span className="text-accent-400 text-xl animate-pulse">Pending Claim</span>
                        ) : (
                          <span className="text-amber-400 text-xl">Draw Ready</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Actions Area */}
                  <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-white/5">
                    {/* STATE 1: Timer still running → Buy Ticket */}
                    {isActive && !canDraw ? (
                      <div className="text-center space-y-6 w-full max-w-md">
                        <button
                          onClick={handleBuyTicket}
                          disabled={actionLoading !== null}
                          className="w-full py-4 text-center rounded-xl font-bold text-lg bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 disabled:scale-100 transform active:scale-95"
                        >
                          {actionLoading === "Buy Ticket" ? (
                            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Processing...</span>
                          ) : (
                            `Buy Ticket (${ticketPriceStr} XLM)`
                          )}
                        </button>
                        <p className="text-xs text-zinc-500">Requires Freighter. Testnet XLM only.</p>
                      </div>

                    /* STATE 2: Timer ended, active=true, no winner yet → Execute Draw */
                    ) : canDraw ? (
                      <div className="text-center space-y-4 w-full">
                        <h3 className="text-xl font-semibold text-amber-400 flex items-center justify-center gap-2">
                          <AlertCircle className="w-5 h-5"/> Lottery Ended — Ready to Draw
                        </h3>
                        <button
                          onClick={() => handleDrawWinner()}
                          disabled={actionLoading !== null}
                          className="w-full max-w-sm mx-auto py-4 text-center rounded-xl font-bold text-lg bg-white text-black hover:bg-zinc-200 transition-all disabled:opacity-50"
                        >
                          {actionLoading === "Draw Winner" ? (
                            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Generating Randomness...</span>
                          ) : "Execute Random Draw"}
                        </button>
                      </div>

                    /* STATE 3: Draw done, winner selected → Show winner + Claim */
                    ) : isDrawn ? (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className={`space-y-6 p-8 rounded-3xl border w-full ${walletAddress === winnerAddr ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-accent-500/30 bg-accent-500/10'}`}
                      >
                        <Trophy className={`w-16 h-16 mx-auto ${walletAddress === winnerAddr ? 'text-emerald-400' : 'text-accent-400'}`} />
                        
                        <div className="space-y-2 text-center">
                          {walletAddress === winnerAddr ? (
                            <h3 className="text-2xl font-bold text-emerald-400">🎉 YOU WON THE LOTTERY! 🎉</h3>
                          ) : (
                            <div className="text-accent-400 font-bold tracking-widest uppercase">CONGRATULATIONS TO THE WINNER</div>
                          )}
                          
                          <div className="font-mono text-xs sm:text-base text-white/90 bg-black/40 p-4 rounded-xl break-all border border-white/5">
                            {winnerAddr}
                          </div>
                        </div>
                        
                        {!isClaimed ? (
                          <div className="space-y-4">
                            <button
                              onClick={() => handleClaimPrize()}
                              disabled={actionLoading !== null}
                              className={`w-full max-w-sm mx-auto py-4 text-center rounded-xl font-bold text-lg transition-all disabled:opacity-50 ${
                                walletAddress === winnerAddr 
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                                : 'bg-white text-black hover:bg-zinc-200'
                              }`}
                            >
                              {actionLoading === "Claim Prize" ? (
                                <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Finalizing Transfer...</span>
                              ) : (
                                walletAddress === winnerAddr ? "Claim Your Winnings Now!" : "Distribute Prize to Winner"
                              )}
                            </button>
                            {walletAddress !== winnerAddr && (
                              <p className="text-xs text-zinc-500 italic">Anyone can trigger the Prize Distribution to the winner&apos;s wallet.</p>
                            )}
                          </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-lg px-6 py-3 bg-emerald-400/10 rounded-full border border-emerald-400/20 shadow-lg shadow-emerald-400/10">
                              <CheckCircle2 className="w-6 h-6" /> Prize Successfully Distributed
                            </div>
                        )}
                      </motion.div>

                    /* STATE 4: Fallback — lottery ended, no winner set, not active */
                    ) : (
                      <div className="text-center space-y-4 w-full">
                        <h3 className="text-xl font-semibold text-amber-400 flex items-center justify-center gap-2">
                          <AlertCircle className="w-5 h-5"/> Lottery Ended
                        </h3>
                        <button
                          onClick={() => handleDrawWinner()}
                          disabled={actionLoading !== null}
                          className="w-full max-w-sm mx-auto py-4 text-center rounded-xl font-bold text-lg bg-white text-black hover:bg-zinc-200 transition-all disabled:opacity-50"
                        >
                          {actionLoading === "Draw Winner" ? (
                            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Generating Randomness...</span>
                          ) : "Execute Random Draw"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-semibold opacity-0 select-none hidden lg:block">Panel</h2>
            
            {/* Status Window */}
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 border-brand-500/30 bg-brand-500/5 relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 to-accent-500 animate-pulse" />
                <div className="flex items-center gap-3 text-sm font-medium text-brand-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {status}
                </div>
              </motion.div>
            )}

            {/* Admin/Creator Panel */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-400" /> Start New Pool
              </h3>
              <p className="text-sm text-zinc-400">
                Deploy a brand new permissionless lottery instance on the Stellar network.
              </p>
              
              <button
                onClick={handleCreateLottery}
                disabled={isDeploying || (isActive && currentLotteryId > 0)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors disabled:opacity-50 border border-white/5"
              >
                {isDeploying ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isDeploying ? "Deploying..." : "Launch New Pool (10 XLM)"}
              </button>
              {isActive && (
                <p className="text-xs text-amber-500/80 text-center">Cannot create while current pool is active.</p>
              )}
            </div>

            {/* Info Card */}
            <div className="rounded-3xl p-6 bg-zinc-900/50 border border-white/5 space-y-4 text-sm text-zinc-400">
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-400" /> Contract managed natively via Soroban PRNG algorithm.
              </p>
              <a href="https://stellar.expert" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" /> View Ledger Explorer
              </a>
            </div>
          </div>

          {/* History Section (Full Width Below) */}
          <div className="lg:col-span-12 space-y-6 mt-8">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Clock className="w-6 h-6 text-zinc-400" /> Draw History
            </h2>
            <div className="glass-card rounded-3xl overflow-hidden border-white/5 bg-zinc-900/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Winner</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Prize Pool</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {lotteryHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No past draws found.</td>
                      </tr>
                    ) : (
                      lotteryHistory.map((item) => {
                        const tp = Number(item.ticket_price || 0) / 10000000;
                        const pool = tp * (item.participants?.length || 0);
                        const winAddr = item.winner ? String(item.winner) : "TBD";
                        const shortAddr = winAddr !== "TBD" ? `...${winAddr.slice(-4)}` : "TBD";
                        const isPastActive = item.active;
                        const isPastEnd = Number(item.end_time) <= nowTs;
                        
                        return (
                          <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-mono text-zinc-400">#{item.id}</td>
                            <td className="px-6 py-4">
                              <span 
                                onClick={() => winAddr !== "TBD" && alert(`Full Winner Address: ${winAddr}`)}
                                className={`px-2 py-1 rounded-md text-sm font-mono cursor-help ${item.winner ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'text-zinc-600 italic'}`}
                              >
                                {shortAddr}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-zinc-300">{pool} XLM</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  {item.prize_claimed ? (
                                    <span className="text-emerald-500 text-sm flex items-center gap-1">
                                      <CheckCircle2 className="w-4 h-4" /> Distributed
                                    </span>
                                  ) : item.winner ? (
                                    <span className="text-amber-500 text-sm flex items-center gap-1">
                                      <Trophy className="w-4 h-4" /> Draw Done
                                    </span>
                                  ) : isPastActive && isPastEnd ? (
                                    <span className="text-amber-400 text-sm italic">Ended</span>
                                  ) : (
                                    <span className="text-zinc-500 text-sm">Active</span>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => selectLottery(item.id)}
                                    className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 transition-colors"
                                  >
                                    View
                                  </button>
                                  {(!item.winner && isPastActive && isPastEnd) && (
                                    <button 
                                      onClick={() => handleDrawWinner(item.id)}
                                      className="px-3 py-1 text-xs bg-white text-black hover:bg-zinc-200 rounded-md transition-colors"
                                    >
                                      Draw
                                    </button>
                                  )}
                                  {(!item.prize_claimed && item.winner) && (
                                    <button 
                                      onClick={() => handleClaimPrize(item.id)}
                                      className="px-3 py-1 text-xs bg-accent-600/20 hover:bg-accent-600/40 text-accent-400 rounded-md transition-colors border border-accent-600/30"
                                    >
                                      Claim
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

