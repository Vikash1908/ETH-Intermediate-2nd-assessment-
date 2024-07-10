// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleContract {
    uint256 private data;
    string private name;
    address private owner;

    event DataChanged(uint256 newData);
    event NameChanged(string newName);
    event OwnerChanged(address newOwner);

    constructor() {
        owner = msg.sender;
    }

    function setData(uint256 _data) public {
        data = _data;
        emit DataChanged(_data);
    }

    function setName(string calldata _name) public {
        name = _name;
        emit NameChanged(_name);
    }

    function changeOwner(address _owner) public {
        require(msg.sender == owner, "Only the current owner can change the owner");
        require(_owner != address(0), "New owner address cannot be zero address");
        owner = _owner;
        emit OwnerChanged(_owner);
    }

    function getDetails() public view returns (uint256, string memory, address) {
        return (data, name, owner);
    }
}
