import React from 'react';
import { type Election } from '../types';

interface ElectionListProps {
  elections: Election[];
  onSelectElection: (election: Election) => void;
  selectedElection: Election | null;
}

interface ElectionStatus {
  text: string;
  color: string;
}

const ElectionList: React.FC<ElectionListProps> = ({ 
  elections, 
  onSelectElection, 
  selectedElection 
}) => {
  const isElectionActive = (election: Election): boolean => {
    const now = new Date();
    return now >= election.startTime && now <= election.endTime && election.isActive;
  };

  const getElectionStatus = (election: Election): ElectionStatus => {
    const now = new Date();
    if (now < election.startTime) return { text: "Em breve", color: "bg-blue-100 text-blue-800" };
    if (now > election.endTime) return { text: "Encerrada", color: "bg-gray-100 text-gray-800" };
    if (!election.isActive) return { text: "Inativa", color: "bg-gray-100 text-gray-800" };
    return { text: "Ativa", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Eleições Disponíveis</h2>
      
      {elections.length === 0 ? (
        <p className="text-gray-500">Nenhuma eleição disponível no momento.</p>
      ) : (
        <div className="space-y-3">
          {elections.map(election => {
            const status = getElectionStatus(election);
            
            return (
              <div 
                key={election.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedElection?.id === election.id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
                onClick={() => onSelectElection(election)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{election.position}</h3>
                    <p className="text-sm text-gray-600">{election.region}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {election.startTime.toLocaleDateString()} - {election.endTime.toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-medium py-1 px-2 rounded-full ${status.color}`}>
                    {status.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ElectionList;