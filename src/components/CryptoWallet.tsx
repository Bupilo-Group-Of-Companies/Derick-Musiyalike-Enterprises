import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw, ExternalLink, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CryptoWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

const CryptoWallet: React.FC<CryptoWalletProps> = ({ isOpen, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    // Check if window.ethereum exists
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      setIsConnecting(false);
      setError("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);

      // Get chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);

      // Get balance
      const balanceHex = await ethereum.request({ 
        method: 'eth_getBalance', 
        params: [account, 'latest'] 
      });
      
      // Convert wei to eth (rough approximation for display)
      const balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
      setBalance(balanceEth);

      // Listen for account changes
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setBalance(null);
        }
      });

      // Listen for chain changes
      ethereum.on('chainChanged', (_chainId: string) => {
        window.location.reload();
      });

    } catch (err: any) {
      console.error("Failed to connect to MetaMask", err);
      setError(err.message || "Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      alert("Address copied to clipboard!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Crypto Wallet</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Connection Failed</h3>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              {!(window as any).ethereum && (
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-800 mt-2 hover:underline"
                >
                  Install MetaMask <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ) : null}

        {!account ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Connect your Wallet</h3>
              <p className="text-gray-500 text-sm mt-2">Link your MetaMask wallet to access crypto features, view balances, and make secure transactions.</p>
            </div>
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect MetaMask
                  <ExternalLink className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold tracking-wider">CONNECTED</span>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-8 h-8 opacity-80" />
              </div>
              
              <div className="space-y-1">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Total Balance</p>
                <h3 className="text-3xl font-black tracking-tight">{balance || '0.0000'} <span className="text-lg font-bold text-gray-500">ETH</span></h3>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">Wallet Address</p>
                  <p className="text-xs font-mono text-gray-300 truncate w-32">{account.slice(0, 6)}...{account.slice(-4)}</p>
                </div>
                <button 
                  onClick={copyAddress}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-5 h-5 text-gray-600 group-hover:text-orange-500" />
                </div>
                <p className="text-xs font-bold text-gray-900">Swap Tokens</p>
              </button>
              <button className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-orange-500" />
                </div>
                <p className="text-xs font-bold text-gray-900">Send Crypto</p>
              </button>
            </div>

            <button 
              onClick={() => {
                setAccount(null);
                setBalance(null);
              }}
              className="w-full py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CryptoWallet;
