type Network = "development" | "kovan" | "mainnet";

module.exports = (artifacts: Truffle.Artifacts, web3: Web3) => {
  return async (
    deployer: Truffle.Deployer,
    network: Network,
    accounts: string[]
  ) => {
    const Will = artifacts.require("Will");

    await deployer.deploy(Will, accounts[1], accounts[0]);

    const will = await Will.deployed();
    console.log(`Will deployed at ${will.address} in network: ${network}.`);
  };
};
