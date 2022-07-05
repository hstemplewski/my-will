import Contract from "contract/build/contracts/Will.json";
import { Will } from "contract/types/ethers-contracts/Will";
import { ethers } from "ethers";

export function connectContract(provider: ethers.providers.Web3Provider) {
  const contractAddress = "0xD681875bB18Bb166028Db8967Fdf4e4e3Ae27881"; // copy from terminal after deploying the contract

  // The provider also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, we need the account signer...
  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    contractAddress,
    Contract.abi,
    signer
  ) as Will;

  return contract;
}
