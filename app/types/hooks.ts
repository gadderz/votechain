import { type Election, type Candidate, type VoteResult, type VoterStatus } from './contracts';

export interface UseElectionsReturn {
  elections: Election[];
  isLoading: boolean;
  error: string | null;
  refreshElections: () => Promise<void>;
}

export interface UseCandidatesReturn {
  candidates: Candidate[];
  isLoading: boolean;
  error: string | null;
  refreshCandidates: (electionId: number) => Promise<void>;
}

export interface UseVotingReturn {
  voterStatus: VoterStatus;
  isLoading: boolean;
  error: string | null;
  registerVoter: (voterHash: string) => Promise<void>;
  vote: (candidateId: number, secret?: string) => Promise<void>;
  checkVoterStatus: () => Promise<void>;
}

export interface UseResultsReturn {
  results: VoteResult[];
  isLoading: boolean;
  error: string | null;
  refreshResults: () => Promise<void>;
}

export interface UseWeb3Return {
  account: string | null;
  provider: any | null;
  isConnected: boolean;
  isAdmin: boolean;
  connect: (providerType: 'metamask' | 'walletconnect') => Promise<void>;
  disconnect: () => void;
  checkIsAdmin: () => Promise<boolean>;
}