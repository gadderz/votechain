import { type Election, type Candidate, type VoteResult, type VoterStatus } from './contracts';

export interface AppState {
  account: string | null;
  provider: any | null;
  isConnected: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ElectionState {
  elections: Election[];
  selectedElection: Election | null;
  candidates: Record<number, Candidate[]>; // electionId -> candidates
  results: Record<number, VoteResult[]>;   // electionId -> results
  voterStatus: Record<number, VoterStatus>; // electionId -> voter status
}

export interface UIState {
  isWalletModalOpen: boolean;
  isAdminModalOpen: boolean;
  currentView: 'elections' | 'voting' | 'results' | 'admin';
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  };
}