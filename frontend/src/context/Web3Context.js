import React, { createContext, useContext, useState, useCallback } from "react";
import { ethers } from "ethers";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount]   = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId]   = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed. Please install MetaMask to continue.");
    }
    setConnecting(true);
    try {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await ethProvider.send("eth_requestAccounts", []);
      const network = await ethProvider.getNetwork();

      setProvider(ethProvider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      // Listen for account/chain changes
      window.ethereum.on("accountsChanged", (accs) => {
        setAccount(accs[0] || null);
      });
      window.ethereum.on("chainChanged", (id) => {
        setChainId(parseInt(id, 16));
      });

      return accounts[0];
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
  }, []);

  const getContract = useCallback(
    async (abi, address) => {
      if (!provider) throw new Error("Wallet not connected");
      const signer = await provider.getSigner();
      return new ethers.Contract(address, abi, signer);
    },
    [provider]
  );

  return (
    <Web3Context.Provider
      value={{ account, provider, chainId, connecting, connectWallet, disconnectWallet, getContract }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
