import { WillInstance } from "../types/truffle-contracts";

const Will = artifacts.require("Will");
const FUNDS_VALUE = web3.utils.toWei("0.000000005", "ether");
const LOCKED_STATE = 0;
const UNLOCKED_STATE = 1;

contract("Will", (accounts) => {
  let contract: WillInstance;
  let owner = accounts[0];
  let executor = accounts[1];
  let beneficiary1 = accounts[2];

  beforeEach("setup contract for each test", async function () {
    contract = await Will.new(executor, owner, {
      from: accounts[0],
    });
  });

  async function chargeContractAndCheckAmount() {
    // Given
    await contract.chargeContract({
      value: FUNDS_VALUE,
      from: owner,
    });
    // When
    const amount = await contract
      .amount()
      .then((amount) => web3.utils.fromWei(amount, "wei"));
    const amountToGive = await contract
      .amountToGive()
      .then((amount) => web3.utils.fromWei(amount, "wei"));
    // Then
    assert.equal(
      FUNDS_VALUE,
      amount,
      "Amount in contract is not equal to funds value"
    );
    assert.equal(
      FUNDS_VALUE,
      amountToGive,
      "Amount to give in contract is not equal to funds value"
    );
  }

  it("Contract creation", async () => {
    // Given
    const contractOwner = await contract.owner();
    const contractExecutor = await contract.executor();
    const contractState = await contract.state();
    // When

    // Then
    assert.equal(
      contractState.valueOf(),
      LOCKED_STATE,
      "Contract in not locked by default"
    );
    assert.equal(
      contractOwner,
      owner,
      "Owner in contract is not equal to owner in tests"
    );

    assert.equal(
      contractExecutor,
      executor,
      "Executor in contract is not equal to executor in tests"
    );
  });
  it("Store funds in contract", async () => {
    await chargeContractAndCheckAmount();
  });
  it("Add beneficiary", async () => {
    // Given
    await chargeContractAndCheckAmount();
    // When
    await contract.addBeneficiary(beneficiary1, FUNDS_VALUE, {
      from: owner,
    });
    const beneficiaryBalance = await contract
      .checkBalance(beneficiary1)
      .then((balance) => web3.utils.fromWei(balance, "wei"));
    // Then
    assert.equal(
      FUNDS_VALUE,
      beneficiaryBalance,
      "Balance in contract is not equal to set amount"
    );
  });
  it("Claim ether", async () => {
    // Given
    await chargeContractAndCheckAmount();

    // When
    await contract.addBeneficiary(beneficiary1, FUNDS_VALUE, { from: owner });

    await contract.unlock({ from: executor });
    const state = await contract.state();
    const balanceBefore = await web3.eth.getBalance(beneficiary1);
    await contract.claim({ from: beneficiary1 });

    const balanceAfter = await web3.eth.getBalance(beneficiary1);
    const beneficiaryBalanceAfterClaim = await contract
      .checkBalance(beneficiary1)
      .then((balance) => web3.utils.fromWei(balance, "wei"));
    const amountAfterClaim = await contract
      .amount()
      .then((amount) => web3.utils.fromWei(amount, "wei"));

    // Then
    assert.equal(state.valueOf(), UNLOCKED_STATE, "Contract in not unlocked");
    assert.equal(
      "0",
      beneficiaryBalanceAfterClaim,
      "Balance in contract is not equal to set amount"
    );
    assert.isAbove(
      Number(balanceBefore),
      Number(balanceAfter),
      "Balance after is not greater than before"
    );
    assert.equal(
      "0",
      amountAfterClaim,
      "Amount in contract after claim is not equal to 0"
    );
  });
});
