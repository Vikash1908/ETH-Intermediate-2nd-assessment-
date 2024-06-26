# Simple ATM dApp

This example demonstrates a basic Ethereum dApp with a simple ATM functionality using Solidity for the smart contract and React with ethers.js for the frontend. The purpose of this example is to provide a starting point for developing decentralized applications (dApps) on the Ethereum blockchain.

## Description

This project consists of a smart contract written in Solidity and a frontend developed using React and ethers.js. The smart contract provides basic ATM functionalities such as deposit, withdraw, and transfer of Ether. The frontend allows users to interact with the smart contract through a web interface.

## Getting Started

### Prerequisites

- Node.js and npm installed
- MetaMask extension installed in your browser
- A test Ethereum network (like Rinkeby or Hardhat local network)

### Smart Contract

The smart contract `Assessment.sol` provides functionalities to deposit, withdraw, and transfer Ether. It also keeps track of the transaction history.

-// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Transfer(address indexed recipient, uint256 amount);

    struct Transaction {
        address from;
        address to;
        uint256 amount;
        string transactionType;
        uint256 timestamp;
    }

    Transaction[] public transactions;

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // record transaction
        transactions.push(Transaction({
            from: msg.sender,
            to: address(this),
            amount: _amount,
            transactionType: "Deposit",
            timestamp: block.timestamp
        }));

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // record transaction
        transactions.push(Transaction({
            from: address(this),
            to: msg.sender,
            amount: _withdrawAmount,
            transactionType: "Withdraw",
            timestamp: block.timestamp
        }));

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function getTransactionHistory() public view returns (Transaction[] memory) {
        return transactions;
    }

    function transferOneEth(address payable _to) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        require(address(this).balance >= 1 ether, "Insufficient balance in the contract");

        // transfer 1 ETH
        _to.transfer(1 ether);
        
        // record transaction
        transactions.push(Transaction({
            from: address(this),
            to: _to,
            amount: 1 ether,
            transactionType: "Transfer",
            timestamp: block.timestamp
        }));

        // emit the event
        emit Transfer(_to, 1 ether);
    }
}

### Deploying the Smart Contract

To deploy the smart contract, you can use Hardhat, a development environment for Ethereum software.

-const hre = require("hardhat");

async function main() {
  const initBalance = 1;
  const Assessment = await hre.ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy(initBalance);
  await assessment.deployed();

  console.log(`A contract with balance of ${initBalance} eth deployed to ${assessment.address}`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

### Frontend

The frontend allows users to interact with the smart contract. It provides functionalities to connect a wallet, deposit, withdraw, and transfer Ether.

-import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [recipient, setRecipient] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account[0]);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const getTransactionHistory = async() => {
    if (atm) {
      const history = await atm.getTransactionHistory();
      setTransactionHistory(history);
    }
  }

  const deposit = async() => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
      getTransactionHistory();
    }
  }

  const withdraw = async() => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
      getTransactionHistory();
    }
  }

  const transferOneEth = async() => {
    if (atm && recipient) {
      let tx = await atm.transferOneEth(recipient, { value: ethers.utils.parseEther("1.0") });
      await tx.wait();
      getBalance();
      getTransactionHistory();
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance === undefined) {
      getBalance();
    }

    if (transactionHistory.length === 0) {
      getTransactionHistory();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <button onClick={transferOneEth}>Transfer 1 ETH</button>
        </div>
        <h3>Transaction History:</h3>
        <ul>
          {transactionHistory.map((tx, index) => (
            <li key={index}>
              {tx.transactionType} of {ethers.utils.formatEther(tx.amount)} ETH from {tx.from} to {tx.to} at {new Date(tx.timestamp * 1000).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}

### Running the Frontend

1. **Install the required dependencies:**
   ```bash
   npm i
