import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../artifacts/contracts/SimpleContract.sol/SimpleContract.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [details, setDetails] = useState({ data: undefined, name: "", owner: "" });
  const [newOwner, setNewOwner] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const abi = contractABI.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    getContract();
  };

  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    setContract(contract);
  };

  const getDetails = async () => {
    try {
      if (contract) {
        const details = await contract.getDetails();
        setDetails({
          data: details[0].toNumber(),
          name: details[1],
          owner: details[2]
        });
      }
    } catch (error) {
      console.error("Error fetching details: ", error);
    }
  };

  const setData = async (data) => {
    try {
      if (contract) {
        let tx = await contract.setData(data);
        await tx.wait();
        getDetails();
      }
    } catch (error) {
      console.error("Error setting data: ", error);
    }
  };

  const setName = async (name) => {
    try {
      if (contract) {
        let tx = await contract.setName(name);
        await tx.wait();
        getDetails();
      }
    } catch (error) {
      console.error("Error setting name: ", error);
    }
  };

  const changeOwner = async () => {
    try {
      if (contract && newOwner) {
        let tx = await contract.changeOwner(newOwner);
        await tx.wait();
        getDetails();
      }
    } catch (error) {
      console.error("Error changing owner: ", error);
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this app.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (details.data === undefined) {
      getDetails();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Data: {details.data}</p>
        <p>Name: {details.name}</p>
        <p>Owner: {details.owner}</p>
        <button onClick={() => setData(42)}>Set Data to 42</button>
        <button onClick={() => setName("Vikash")}>Set Name to Vikash</button>
        <div>
          <input
            type="text"
            placeholder="New Owner Address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
          <button onClick={changeOwner}>Change Owner</button>
        </div>
      </div>
    );
  };

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to My Simple Contract!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}
      </style>
    </main>
  );
}
