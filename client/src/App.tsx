import React from "react";
import "./App.css";
import { useContract } from "./contract/context";
import { useConnection } from "./metamask/context";

function App() {
  const { connectionState, connect } = useConnection();
  const { contract } = useContract();

  const isError = connectionState.type === "METAMASK_ERROR";
  const isConnected = connectionState.type === "METAMASK_CONNECTED";

  const checkBalance = async () => {
    if (contract && isConnected) {
      const balance = await contract.checkBalance(
        connectionState.connection.myWalletAddress
      );
      console.log(balance.toNumber());
      alert(`Your balance is ${balance}`);
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
        <p>Your contract address: {contract?.address}</p>
        <button type="button" onClick={checkBalance}>
          Check balance
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
