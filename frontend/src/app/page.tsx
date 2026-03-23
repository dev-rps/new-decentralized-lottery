"use client";

import React, { useState, useEffect } from 'react';
import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';
import { server, networkPassphrase, buyTicketTx, drawWinnerTx, createLotteryTx, getLotteryInfo } from '@/lib/stellar';
import { Transaction } from '@stellar/stellar-sdk';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [lotteryInfo, setLotteryInfo] = useState<any>(null);

  const fetchLotteryInfo = async () => {
    try {
      const info = await getLotteryInfo(1);
      setLotteryInfo(info);
    } catch (e) {
      console.error("Failed to fetch lottery info", e);
      setLotteryInfo(null);
    }
  };

  useEffect(() => {
    fetchLotteryInfo();
    const interval = setInterval(fetchLotteryInfo, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    try {
      const installed = await isConnected();
      if (!installed) {
        alert("Freighter wallet is not installed. Please install the extension.");
        return;
      }
      
      const access = await requestAccess();
      if (typeof access === 'string') {
        setWalletAddress(access);
      } else {
        const pk = await getAddress();
        if (pk.address) setWalletAddress(pk.address);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect Freighter. Did you open the extension?");
    }
  };

  const handleBuyTicket = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsDeploying(true);
    setStatus("Preparing transaction...");

    try {
      // For demo purposes, we use a fixed token address (SAC XLM on Testnet)
      const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75YJBMKBA2VZ7B6976666666666666666666";
      const tx = await buyTicketTx(walletAddress, 1, XLM_SAC, BigInt(100000000));
      
      setStatus("Waiting for Freighter signature...");
      const signResult = await signTransaction(tx.toXDR(), { networkPassphrase });
      const signedXdr = typeof signResult === 'string' ? signResult : signResult.signedTxXdr;
      
      setStatus("Submitting to Stellar Testnet...");
      const txToSubmit = new Transaction(signedXdr, networkPassphrase);
      const result = await server.sendTransaction(txToSubmit);
      
      if (result.status !== "ERROR") {
        alert("Success! Transaction submitted to the network.");
        fetchLotteryInfo();
      } else {
        alert("Transaction failed. Check console.");
        console.error(result);
      }
    } catch (e: any) {
      console.error(e);
      alert("Error buying ticket: " + (e.message || String(e)));
    } finally {
      setIsDeploying(false);
      setStatus(null);
    }
  };

  const handleDrawWinner = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsDeploying(true);
    setStatus("Preparing draw transaction...");

    try {
      const tx = await drawWinnerTx(walletAddress, 1);
      
      setStatus("Waiting for Freighter signature...");
      const signResult = await signTransaction(tx.toXDR(), { networkPassphrase });
      const signedXdr = typeof signResult === 'string' ? signResult : signResult.signedTxXdr;
      
      setStatus("Executing Draw on Soroban...");
      const txToSubmit = new Transaction(signedXdr, networkPassphrase);
      const result = await server.sendTransaction(txToSubmit);
      
      if (result.status !== "ERROR") {
        alert("Success! Draw transaction submitted to the network.");
        fetchLotteryInfo();
      } else {
        alert("Draw failed. Ensure the lottery duration has passed.");
        console.error(result);
      }
    } catch (e: any) {
      console.error(e);
      alert("Error drawing winner: " + (e.message || String(e)));
    } finally {
      setIsDeploying(false);
      setStatus(null);
    }
  };

  const handleCreateLottery = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsDeploying(true);
    setStatus("Creating new prize pool...");

    try {
      const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75YJBMKBA2VZ7B6976666666666666666666";
      const ticketPrice = BigInt(100000000);
      const duration = BigInt(3600); // 1 hour duration for testing
      
      const tx = await createLotteryTx(walletAddress, XLM_SAC, ticketPrice, duration);
      
      setStatus("Waiting for Freighter signature...");
      const signResult = await signTransaction(tx.toXDR(), { networkPassphrase });
      const signedXdr = typeof signResult === 'string' ? signResult : signResult.signedTxXdr;
      
      setStatus("Deploying Lottery to Soroban...");
      const txToSubmit = new Transaction(signedXdr, networkPassphrase);
      const result = await server.sendTransaction(txToSubmit);
      
      if (result.status !== "ERROR") {
        alert("Success! New lottery created. You can now buy tickets for ID 1 (if this is the first).");
        fetchLotteryInfo();
      } else {
        alert("Creation failed. Check console.");
        console.error(result);
      }
    } catch (e: any) {
      console.error(e);
      alert("Error creating lottery: " + (e.message || String(e)));
    } finally {
      setIsDeploying(false);
      setStatus(null);
    }
  };

  let isActive = false;
  let timeLeftStr = "N/A";
  let poolSize = "0";
  let participantCount = 0;
  let ticketPriceStr = "10";
  
  if (lotteryInfo) {
      isActive = lotteryInfo.active;
      const now = Math.floor(Date.now() / 1000);
      const end = Number(lotteryInfo.end_time);
      if (end > now) {
          const diff = end - now;
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          timeLeftStr = `${h}h ${m}m`;
      } else {
          timeLeftStr = "Ended";
      }
      
      participantCount = lotteryInfo.participants ? lotteryInfo.participants.length : 0;
      const tpStr = lotteryInfo.ticket_price ? lotteryInfo.ticket_price.toString() : "0";
      const tp = Number(tpStr) / 100000000;
      ticketPriceStr = tp.toString();
      poolSize = (tp * participantCount).toString();
  }

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50"></div>

      <div className="absolute top-6 right-8 z-20">
        <button 
          onClick={connectWallet}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-medium transition-all backdrop-blur-md shadow-lg cursor-pointer"
        >
          {walletAddress 
            ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}` 
            : "Connect Freighter"}
        </button>
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center space-y-16">
        <header className="text-center space-y-6 mt-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium text-sm mb-4">
            Built on Soroban
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Decentralized <span className="gradient-text">Lottery</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            100% Permissionless. Transparent. Secure. Play and win autonomously on the Stellar network.
          </p>
          {status && (
            <div className="animate-pulse text-violet-400 font-bold tracking-widest uppercase text-sm mt-4">
              {status}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Active Lottery Card */}
          <div className="glass-panel p-10 rounded-3xl flex flex-col justify-between transform transition duration-500 hover:scale-[1.02] border-t border-l border-white/20 relative z-10">
            <div className={isDeploying ? "opacity-50 pointer-events-none" : ""}>
              <div className="flex justify-between items-center mb-8">
                {lotteryInfo ? (
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border shadow-[0_0_15px_rgba(34,197,94,0.3)] ${isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {isActive ? "ACTIVE" : "ENDED"}
                  </span>
                ) : (
                  <span className="bg-slate-500/20 text-slate-400 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border border-slate-500/30 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                    NO POOL
                  </span>
                )}
                <span className="text-slate-300 text-sm font-medium bg-slate-800/50 px-4 py-1.5 rounded-full">
                  Time left: <span className="text-white font-bold ml-1">{timeLeftStr}</span>
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Main Prize Pool</h2>
              <div className="flex items-baseline space-x-3 my-8">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  {poolSize}
                </span>
                <span className="text-2xl text-violet-400 uppercase font-black tracking-widest">XLM</span>
              </div>
              <div className="space-y-3 mb-10 bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Ticket Price</span>
                  <span className="text-white font-bold">{ticketPriceStr} XLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Participants</span>
                  <span className="text-white font-bold">{participantCount} Players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Contract</span>
                  <span className="text-violet-400 font-mono text-sm tracking-tighter">CD6Y...WSJJ</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleBuyTicket}
              disabled={isDeploying || !lotteryInfo || !isActive}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-lg py-5 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all transform active:scale-95 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? "Processing..." : (!lotteryInfo ? "Create Pool First" : "Buy Ticket Now")}
            </button>
          </div>

          {/* Manage / Permissionless Interactions */}
          <div className="flex flex-col gap-6 relative z-10">
            <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col justify-center items-center text-center group border-white/5 hover:border-violet-500/30 transition-colors">
              <div className="w-16 h-16 bg-violet-500/20 rounded-2xl mb-6 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Create New Lottery</h3>
              <p className="text-slate-400 mb-8 max-w-sm">Permissionlessly start a new prize pool. You define the ticket price and duration.</p>
              <button 
                onClick={handleCreateLottery}
                disabled={isDeploying}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors w-full text-white cursor-pointer hover:shadow-lg disabled:opacity-50"
              >
                {isDeploying ? "Initializing..." : "Launch New Pool"}
              </button>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col justify-center items-center text-center group border-orange-500/10 hover:border-orange-500/30 transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl mb-6 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-1.3 2.6c-.2.4-.1.9.2 1.2L7 14l-3 3-1-1-2 2 4 4 2-2-1-1 3-3 3.5 4.3c.3.4.8.5 1.2.2l2.6-1.3c.4-.2.7-.6.5-1.1z"/></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Draw Winner</h3>
              <p className="text-slate-400 mb-8 max-w-sm relative z-10">Conclude an ended lottery using Soroban's native PRNG. Anyone can execute this.</p>
              <button 
                onClick={handleDrawWinner}
                disabled={isDeploying}
                className="px-8 py-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-200 border border-orange-500/30 rounded-xl font-bold transition-colors w-full relative z-10 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] cursor-pointer disabled:opacity-50"
              >
                {isDeploying ? "Drawing..." : "Execute Random Draw"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
