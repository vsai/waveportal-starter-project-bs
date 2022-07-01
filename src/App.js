import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import wavePortalAbi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState("");

  const contractAddress = "0x4323394ba3808f0Fc4F56A217cda84b869B5408F"; // Goerli
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

        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
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
      </div>
    </div>
  );
}
