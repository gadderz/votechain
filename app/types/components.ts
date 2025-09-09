import { type ReactNode } from 'react';
import { type Election, type Candidate, type VoteResult, type VoterStatus } from './contracts';

export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
}

export interface HeaderProps {
  account: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export interface ElectionListProps {
  elections: Election[];
  selectedElection: Election | null;
  onSelectElection: (election: Election) => void;
  isLoading?: boolean;
}

export interface ElectionCardProps {
  election: Election;
  isSelected: boolean;
  onClick: () => void;
}

export interface VotingSectionProps {
  election: Election;
  candidates: Candidate[];
  voterStatus: VoterStatus;
  onRegisterVoter: (voterHash: string) => Promise<void>;
  onVote: (candidateId: number, secret?: string) => Promise<void>;
  isLoading?: boolean;
}

export interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
  showVoteButton?: boolean;
}

export interface ResultsProps {
  election: Election;
  results: VoteResult[];
  onRefreshResults: () => Promise<void>;
  isLoading?: boolean;
}

export interface AdminPanelProps {
  isAdmin: boolean;
  onCreateElection: (params: {
    position: string;
    region: string;
    startTime: number;
    endTime: number;
  }) => Promise<void>;
  onAddCandidate: (params: {
    electionId: number;
    name: string;
    number: number;
    party: string;
  }) => Promise<void>;
  onSetVoterRoll: (electionId: number, root: string) => Promise<void>;
  isLoading?: boolean;
}

export interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (providerType: 'metamask' | 'walletconnect') => void;
}

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number;
}