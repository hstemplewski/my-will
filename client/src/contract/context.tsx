import { Will } from "contract/types/ethers-contracts/Will";
import { ethers } from "ethers";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { handleError } from "../error/handleError";
import { connectContract } from "./connectContract";

export const ContractContext = createContext<ContractContextData | null>(null);

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider = (props: ContractProviderProps) => {
  const Contract = useProvideContract();

  return (
    <ContractContext.Provider value={Contract}>
      {props.children}
    </ContractContext.Provider>
  );
};

export const useProvideContract = () => {
  const [contract, setContract] = useState<Will | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  const connect = useCallback(() => {
    try {
      if (!provider) {
        throw new Error("No provider connected");
      }
      const contract = connectContract(provider);

      setContract(contract);
    } catch (e) {
      handleError(e);
    }
  }, [provider]);

  useEffect(() => {
    connect();
  }, [connect]);

  return {
    contract,
    setProvider,
  };
};

export type ContractContextData = ReturnType<typeof useProvideContract>;

export const useContract = () => {
  const Contract = useContext(ContractContext);

  if (!Contract) {
    throw new Error("useContract must be used inside ContractProvider");
  }

  return Contract;
};
