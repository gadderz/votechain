import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BallotBoxABI } from '../contracts/abis';
import { type Election, type VoteResult } from '../types';

interface ResultsProps {
  election: Election;
  provider: ethers.BrowserProvider | null;
}

const Results: React.FC<ResultsProps> = ({ election, provider }) => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadResults = async (): Promise<void> => {
    if (!provider || !election) return;
    
    setIsLoading(true);
    try {
      const signer = await provider.getSigner();
      const ballotBox = new ethers.Contract(
        election.ballotBoxAddress,
        BallotBoxABI,
        signer
      );
      
      const [candidateIds, votes] = await ballotBox.getResults();
      
      const resultsData: VoteResult[] = candidateIds.map((id: bigint, index: number) => ({
        candidateId: Number(id),
        votes: Number(votes[index])
      }));
      
      setResults(resultsData);
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (election && provider) {
      loadResults();
    }
  }, [election, provider]);

  if (!election) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Resultados Parciais</h2>
        <button
          onClick={loadResults}
          disabled={isLoading}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 mt-2">Carregando resultados...</p>
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={result.candidateId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 font-medium">#{index + 1}</span>
                <span className="font-medium text-gray-800">Candidato {result.candidateName}</span>
              </div>
              <span className="font-semibold text-indigo-600">{result.votes} votos</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6">Nenhum resultado disponível ainda.</p>
      )}
    </div>
  );
};

export default Results;