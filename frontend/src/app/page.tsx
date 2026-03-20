"use client";

import React, { useState, useEffect } from 'react';
import { isAllowed, setAllowed, getAddress } from '@stellar/freighter-api';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (await isAllowed()) {
        const pk = await getAddress();
        if (pk.address) setWalletAddress(pk.address);
      } else {
        await setAllowed();
        const pk = await getAddress();
        if (pk.address) setWalletAddress(pk.address);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect Freighter. Is it installed?");
    }
  };

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
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Active Lottery Card */}
          <div className="glass-panel p-10 rounded-3xl flex flex-col justify-between transform transition duration-500 hover:scale-[1.02] border-t border-l border-white/20 relative z-10">
            <div>
              <div className="flex justify-between items-center mb-8">
                <span className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  ACTIVE
                </span>
                <span className="text-slate-300 text-sm font-medium bg-slate-800/50 px-4 py-1.5 rounded-full">
                  Time left: <span className="text-white font-bold ml-1">12h 45m</span>
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Main Prize Pool</h2>
              <div className="flex items-baseline space-x-3 my-8">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  5,000
                </span>
                <span className="text-2xl text-violet-400 uppercase font-black tracking-widest">XLM</span>
              </div>
              <div className="space-y-3 mb-10 bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Ticket Price</span>
                  <span className="text-white font-bold">10 XLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Participants</span>
                  <span className="text-white font-bold">124 Players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Contract</span>
                  <span className="text-violet-400 font-mono text-sm tracking-tighter">CD6Y...WSJJ</span>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-lg py-5 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all transform active:scale-95 duration-200 cursor-pointer">
              Buy Ticket Now
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
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors w-full text-white cursor-pointer hover:shadow-lg">
                Launch New Pool
              </button>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col justify-center items-center text-center group border-orange-500/10 hover:border-orange-500/30 transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl mb-6 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-1.3 2.6c-.2.4-.1.9.2 1.2L7 14l-3 3-1-1-2 2 4 4 2-2-1-1 3-3 3.5 4.3c.3.4.8.5 1.2.2l2.6-1.3c.4-.2.7-.6.5-1.1z"/></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Draw Winner</h3>
              <p className="text-slate-400 mb-8 max-w-sm relative z-10">Conclude an ended lottery using Soroban's native PRNG. Anyone can execute this.</p>
              <button className="px-8 py-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-200 border border-orange-500/30 rounded-xl font-bold transition-colors w-full relative z-10 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] cursor-pointer">
                Execute Random Draw
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
