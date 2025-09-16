import React from 'react';

interface HeaderProps {
  account: string | null;
  onConnectWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({ account, onConnectWallet }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">VoteChain</h1>
        </div>
        
        {account ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:block bg-green-100 text-green-800 text-sm font-medium py-1 px-3 rounded-full">
              Conectado
            </div>
            <div className="bg-gray-100 text-gray-600 text-sm font-medium py-1 px-3 rounded-full">
              {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
            </div>
          </div>
        ) : (
          <button 
            onClick={onConnectWallet}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Conectar Carteira
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;