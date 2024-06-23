// SPDX-License-Identifier: UNLICENSED
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
