import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import wavePortalAbi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [transactionStatus, setTransactionStatus] = React.useState({});
  const [currentMessage, setCurrentMessage] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);

  const contractAddress = "0xEd84ceDDF111AbFb7bF5E182855a3b98a6F5537b"; // Goerli
  const contractABI = wavePortalAbi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Download metamask");
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found authorized account: ", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function connectWallet() {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask");
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const wave = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(currentMessage);
        alert(`Submitted message: ${ currentMessage }`);
        console.log("Mining...", waveTxn.hash);
        setCurrentMessage("");
        setTransactionStatus(prevStatus => ({
          ...prevStatus,
          [waveTxn.hash]: "loading",
        }));

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setTransactionStatus(prevStatus => ({
          ...prevStatus,
          [waveTxn.hash]: "mined",
        }));

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getAllWaves = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        console.log("getAllWaves", waves);

        let wavesCleaned = waves.map((wave) => ({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        }));

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am vish. I'm working on new web3 projects. Getting started with some solidity experience here. Connect your Ethereum wallet!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={ connectWallet }>
            Connect Wallet
          </button>
        )}

        {
          Object.entries(transactionStatus).map(([key, value]) => (
            <div key={ key }>
              <strong>{ key }</strong>
              <p>{ value }</p>
            </div>
          ))
        }

        <input
          type="text"
          placeholder="Message..."
          value={ currentMessage }
          onChange={ (e) => setCurrentMessage(e.target.value) }
        />
        {
          allWaves.map((wave, index) => (
            <div
              key={ index.toString() }
              style={{ backgroundColor: "grey", marginTop: "16px", padding: "8px" }}
            >
                <div>Address: { wave.address }</div>
                <div>Time: { wave.timestamp.toString() }</div>
                <div>Messages: { wave.message }</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
