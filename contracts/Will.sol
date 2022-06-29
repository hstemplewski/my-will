// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

contract Will {
    uint256 public DEPLOY_TIME;
    uint256 public amount;
    uint256 public amountToGive;
    address public executor;
    address public owner;
    mapping(address => uint256) public beneficiaries;
    enum State {
        LOCKED,
        UNLOCKED
    }
    State public state = State.LOCKED;

    constructor(address _executor, address _owner) {
        DEPLOY_TIME = block.timestamp;
        executor = _executor;
        require(_owner == msg.sender, "Owner should deploy contract");
        owner = msg.sender;
    }

    function chargeContract() public payable onlyBy(owner) {
        amount += msg.value;
        amountToGive += msg.value;
    }

    function addBeneficiary(address _beneficiary, uint256 _amount)
        public
        onlyBy(owner)
    {
        require(_beneficiary != msg.sender, "You can not add yourself");
        require(_amount <= amountToGive, "You can not set more than you have");
        beneficiaries[_beneficiary] = _amount; // amount should be in WEI
        amountToGive -= _amount;
    }

    function claim() public payable onlyUnlocked {
        require(beneficiaries[msg.sender] > 0, "You have nothing to claim");
        bool isSent = payable(msg.sender).send(beneficiaries[msg.sender]);
        require(isSent, "Failed to send");
        amount -= beneficiaries[msg.sender];
        beneficiaries[msg.sender] = 0;
    }

    function checkBalance(address _beneficiary) public view returns (uint256) {
        return beneficiaries[_beneficiary];
    }

    function unlock() public onlyBy(executor) onlyLocked {
        state = State.UNLOCKED;
    }

    function lock() public onlyBy(executor) onlyUnlocked {
        state = State.LOCKED;
    }

    function emergencyReturn() public onlyBy(owner) {
        selfdestruct(payable(msg.sender));
    }

    modifier onlyBy(address candidate) {
        require(candidate == msg.sender, "You can not call this method");
        _;
    }
    modifier onlyUnlocked() {
        require(
            state == State.UNLOCKED,
            "This method is availabie only when contract is unlocked"
        );
        _;
    }
    modifier onlyLocked() {
        require(
            state == State.LOCKED,
            "This method is availabie only when contract is locked"
        );
        _;
    }
}
