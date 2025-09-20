import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ElectionManagerABI, VoteTokenABI, BallotBoxABI } from '../contracts/abis';
import { type Election, type Candidate, type VoterStatus } from '../types';

interface VotingSectionProps {
  election: Election;
  provider: ethers.BrowserProvider | null;
  account: string;
}

type VoterStatusType = 'not-registered' | 'registered' | 'voted';

const VotingSection: React.FC<VotingSectionProps> = ({ 
  election, 
  provider, 
  account 
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [voterHash, setVoterHash] = useState<string>('');
  const [voterStatus, setVoterStatus] = useState<VoterStatusType>('not-registered');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Verificar status do eleitor
  const checkVoterStatus = async (): Promise<void> => {
    if (!provider || !election) return;
    
    try {
      const signer = await provider.getSigner();
      const voteToken = new ethers.Contract(
        election.voteTokenAddress,
        VoteTokenABI,
        signer
      );
      
      const hasVoted = await voteToken.hasVoted(account);
      
      if (hasVoted) {
        setVoterStatus('voted');
        return;
      }
      
      const balance = await voteToken.balanceOf(account);
      
      if (balance > 0) {
        setVoterStatus('registered');
      } else {
        setVoterStatus('not-registered');
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    }
  };

  const loadCandidates = async (): Promise<void> => {
    const mockCandidates: Candidate[] = [
      { id: 1, name: "Candidato A", number: 123, party: "PARTIDO A" },
      { id: 2, name: "Candidato B", number: 456, party: "PARTIDO B" },
      { id: 3, name: "Candidato C", number: 789, party: "PARTIDO C" },
    ];
    setCandidates(mockCandidates);
  };

  // Registrar eleitor
  const registerVoter = async (): Promise<void> => {
    if (!voterHash) {
      alert("Por favor, informe o hash do seu título de eleitor");
      return;
    }
    
    if (!provider) return;
    
    setIsVoting(true);
    try {
      const signer = await provider.getSigner();
      const electionManager = new ethers.Contract(
        election.electionManagerAddress,
        ElectionManagerABI,
        signer
      );
      
      const tx = await electionManager.registerVoter(
        election.id,
        [],
        ethers.keccak256(ethers.toUtf8Bytes(voterHash))
      );
      
      await tx.wait();
      setVoterStatus('registered');
      alert("Registro realizado com sucesso! Agora você pode votar.");
    } catch (error) {
      console.error("Erro no registro:", error);
      alert("Erro no registro. Verifique se você está apto a votar nesta eleição.");
    } finally {
      setIsVoting(false);
    }
  };

  // Votar
  const vote = async (): Promise<void> => {
    if (!selectedCandidate) {
      alert("Por favor, selecione um candidato");
      return;
    }
    
    if (!provider) return;
    
    setIsVoting(true);
    try {
      const signer = await provider.getSigner();
      const ballotBox = new ethers.Contract(
        election.ballotBoxAddress,
        BallotBoxABI,
        signer
      );
      
      const secret = ethers.hexlify(ethers.randomBytes(32));
      
      const tx = await ballotBox.voteBasic(selectedCandidate, secret);
      await tx.wait();
      
      setVoterStatus('voted');
      alert("Voto registrado com sucesso!");
    } catch (error) {
      console.error("Erro ao votar:", error);
      alert("Erro ao registrar voto. Tente novamente.");
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    if (election && provider) {
      checkVoterStatus();
      loadCandidates();
    }
  }, [election, provider]);

  if (!election) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Votação</h2>
      
      {voterStatus === 'not-registered' && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Registro para votação</h3>
          <p className="text-sm text-gray-600 mb-3">
            Para votar nesta eleição, primeiro você precisa se registrar com seu título de eleitor.
          </p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={voterHash}
              onChange={(e) => setVoterHash(e.target.value)}
              placeholder="Hash do seu título de eleitor"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
            <button
              onClick={registerVoter}
              disabled={isVoting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isVoting ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </div>
      )}
      
      {voterStatus === 'registered' && (
        <div>
          <h3 className="font-medium text-gray-700 mb-4">Selecione seu candidato:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {candidates.map(candidate => (
              <div
                key={candidate.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCandidate === candidate.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-800 font-bold">{candidate.number}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{candidate.name}</h4>
                    <p className="text-sm text-gray-600">{candidate.party}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={vote}
            disabled={isVoting || !selectedCandidate}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isVoting ? "Registrando voto..." : "Confirmar Voto"}
          </button>
        </div>
      )}
      
      {voterStatus === 'voted' && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-800 mb-2">Você já votou nesta eleição</h3>
          <p className="text-gray-600">Obrigado por participar do processo democrático!</p>
        </div>
      )}
    </div>
  );
};

export default VotingSection;