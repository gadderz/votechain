import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ElectionManagerABI } from '../contracts/abis';

interface AdminPanelProps {
  provider: ethers.BrowserProvider | null;
  account: string;
  electionManagerAddress: string;
}

interface NewElectionForm {
  position: string;
  region: string;
  startTime: string;
  endTime: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  provider, 
  account, 
  electionManagerAddress 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newElection, setNewElection] = useState<NewElectionForm>({
    position: '',
    region: '',
    startTime: '',
    endTime: ''
  });

  const createElection = async (): Promise<void> => {
    if (!newElection.position || !newElection.region || !newElection.startTime || !newElection.endTime) {
      alert("Por favor, preencha todos os campos");
      return;
    }
    
    if (!provider) return;
    
    setIsLoading(true);
    try {
      const signer = await provider.getSigner();
      const electionManager = new ethers.Contract(
        electionManagerAddress,
        ElectionManagerABI,
        signer
      );
      
      const startTimestamp = Math.floor(new Date(newElection.startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(newElection.endTime).getTime() / 1000);
      
      const tx = await electionManager.createElection(
        newElection.position,
        newElection.region,
        startTimestamp,
        endTimestamp
      );
      
      await tx.wait();
      alert("Eleição criada com sucesso!");
      setNewElection({ position: '', region: '', startTime: '', endTime: '' });
    } catch (error) {
      console.error("Erro ao criar eleição:", error);
      alert("Erro ao criar eleição. Verifique o console para detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewElection(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Painel Administrativo</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
          <input
            type="text"
            name="position"
            value={newElection.position}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            placeholder="Ex: Governador"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Região</label>
          <input
            type="text"
            name="region"
            value={newElection.region}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            placeholder="Ex: São Paulo"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
            <input
              type="datetime-local"
              name="startTime"
              value={newElection.startTime}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
            <input
              type="datetime-local"
              name="endTime"
              value={newElection.endTime}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
          </div>
        </div>
        
        <button
          onClick={createElection}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? "Criando..." : "Criar Nova Eleição"}
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;