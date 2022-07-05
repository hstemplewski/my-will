import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { useContract } from "./contract/context";
import { useConnection } from "./metamask/context";

function App() {
  const { connectionState, connect } = useConnection();
  const { contract } = useContract();
  const [contractInfo, setContractInfo] = useState<any>();

  const isError = connectionState.type === "METAMASK_ERROR";
  const isConnected = connectionState.type === "METAMASK_CONNECTED";

  const fetchContractInfo = useCallback(async () => {
    if (contract && isConnected) {
      const amount = await contract.amount();
      const amountToGive = await contract.amountToGive();
      const executor = await contract.executor();
      const owner = await contract.owner();
      const state = await contract.state();

      console.log(amount, amountToGive, executor, owner, state);

      setContractInfo({
        amount: ethers.utils.formatEther(amount),
        amountToGive: ethers.utils.formatEther(amountToGive),
        executor,
        owner,
        state,
      });
    }
  }, [contract, isConnected]);

  useEffect(() => {
    fetchContractInfo();
  }, [fetchContractInfo]);

  const checkBalance = async () => {
    if (contract && isConnected) {
      const balance = await contract.checkBalance(
        connectionState.connection.myWalletAddress
      );
      console.log(balance.toNumber());
      alert(`Your balance is ${balance}`);
    }
  };

  const chargeContract = async () => {
    if (contract && isConnected) {
      try {
        // functions from contract returns the promise with transactions details
        const transaction = await contract.chargeContract({
          value: ethers.utils.parseUnits("1", "ether"),
        });
        console.log("🚀 transaction", transaction);
        // to wait until transaction ends ethers wraps the transaction with wait function
        // be careful with using it, in real network transactions could take even hours
        const receipt = await transaction.wait();
        console.log("🚀 receipt", receipt);
        await fetchContractInfo();
      } catch (error: any) {
        alert(
          `Message: ${error.message}, Reason: ${error?.data?.data?.reason}`
        );
      }
    }
  };

  if (isError) {
    return <h2>Error: {connectionState.error.message}</h2>;
  }

  if (isConnected) {
    return (
      <>
        <h2>Your Matamask wallet is connected!</h2>
        <p>Your wallet address: {connectionState.connection.myWalletAddress}</p>
        <p>Contract executor: {contractInfo?.executor}</p>
        <p>Contract owner: {contractInfo?.owner}</p>
        <p>Contract amount: {contractInfo?.amount}</p>
        <p>Contract amount left: {contractInfo?.amountToGive}</p>
        <p>
          Contract state: {contractInfo?.state === 0 ? "LOCKED" : "UNLOCKED"}
        </p>
        <p>Your contract address: {contract?.address}</p>
        <button type="button" onClick={checkBalance}>
          Check balance
        </button>
        <button type="button" onClick={chargeContract}>
          Charge contract with 1 ether
        </button>
      </>
    );
  }

  return (
    <button type="button" onClick={connect}>
      Connect Metamask
    </button>
  );
}

export default App;
