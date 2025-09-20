import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { ethers } from 'ethers';
import Header from '../components/Header';
import ElectionList from '../components/ElectionList';
import VotingSection from '../components/VotingSection';
import Results from '../components/Results';
import AdminPanel from '../components/AdminPanel';
import { ElectionManagerABI, VoteTokenABI, BallotBoxABI } from '../contracts/abis';
import { type Election, type AppState } from '../types';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "VoteChain - Home" },
    { name: "description", content: "Welcome to VoteChain!" },
  ];
}

const CONTRACT_ADDRESSES = {
  electionManager: import.meta.env.VITE_ELECTION_MANAGER_CONTRACT_ADDRESS
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    account: null,
    provider: null,
    isConnected: false,
    isAdmin: false,
    isLoading: false,
    error: null
  });

  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  // Conectar à carteira
  const connectWallet = async (): Promise<void> => {
    if (CONTRACT_ADDRESSES.electionManager === undefined || CONTRACT_ADDRESSES.electionManager === "") {
      alert("Endereço do contrato ElectionManager não definido. Verifique as variáveis de ambiente.");
      return;
    }

    if (window.ethereum) {
      try {
        setAppState(prev => ({ ...prev, isLoading: true }));
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAppState(prev => ({ 
          ...prev, 
          provider, 
          account: address, 
          isConnected: true,
          isLoading: false 
        }));
        
        await checkIfAdmin(signer);
        await loadElections(signer);

      } catch (error) {
        console.error("Erro ao conectar carteira:", error);
        setAppState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Erro ao conectar carteira" 
        }));
      }
    } else {
      alert("Por favor, instale o MetaMask!");
    }
  };

  const checkIfAdmin = async (signer: ethers.Signer): Promise<void> => {
    try {
      const electionManager = new ethers.Contract(
        CONTRACT_ADDRESSES.electionManager,
        ElectionManagerABI,
        signer
      );
      
      const hasRole = await electionManager.hasRole(
        ethers.keccak256(ethers.toUtf8Bytes("ELECTION_ADMIN")),
        await signer.getAddress()
      );
      
      setAppState(prev => ({ ...prev, isAdmin: hasRole }));
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
    }
  };

  const loadElections = async (signer: ethers.Signer): Promise<void> => {
    try {
      const electionManager = new ethers.Contract(
        CONTRACT_ADDRESSES.electionManager,
        ElectionManagerABI,
        signer
      );
      
      const electionCount = await electionManager.electionCount();
      const electionData: Election[] = [];
      
      for (let i = 0; i < electionCount; i++) {
        const election = await electionManager.getElectionDetails(i);
        electionData.push({
          id: i,
          position: election.position,
          region: election.region,
          startTime: new Date(Number(election.startTime) * 1000),
          endTime: new Date(Number(election.endTime) * 1000),
          isActive: election.isActive,
          voteTokenAddress: election.voteTokenAddress,
          ballotBoxAddress: election.ballotBoxAddress,
          electionManagerAddress: CONTRACT_ADDRESSES.electionManager,
          voterRollRoot: election.voterRollRoot
        });
      }
      
      setElections(electionData);
    } catch (error) {
      console.error("Erro ao carregar eleições:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAppState(prev => ({ ...prev, account: accounts[0] }));
        } else {
          setAppState(prev => ({ 
            ...prev, 
            account: null, 
            provider: null, 
            isConnected: false 
          }));
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        account={appState.account} 
        onConnectWallet={connectWallet} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {!appState.account ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Conecte sua carteira para acessar o VotaChain
            </h2>
            <button 
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              disabled={appState.isLoading}
            >
              {appState.isLoading ? "Conectando..." : "Conectar Carteira"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ElectionList 
                elections={elections} 
                onSelectElection={setSelectedElection}
                selectedElection={selectedElection}
              />
              
              {selectedElection && (
                <>
                  <VotingSection 
                    election={selectedElection} 
                    provider={appState.provider}
                    account={appState.account}
                  />
                  <Results 
                    election={selectedElection} 
                    provider={appState.provider}
                  />
                </>
              )}
            </div>
            
            <div>
              {appState.isAdmin && (
                <AdminPanel 
                  provider={appState.provider}
                  account={appState.account}
                  electionManagerAddress={CONTRACT_ADDRESSES.electionManager}
                />
              )}
              
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sua Carteira</h3>
                <p className="text-sm text-gray-600 break-all">{appState.account}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
