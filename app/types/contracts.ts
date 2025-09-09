export interface Election {
  id: number;
  position: string;
  region: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  voterRollRoot: string;
  voteTokenAddress: string;
  ballotBoxAddress: string;
  electionManagerAddress: string;
}

export interface Candidate {
  id: number;
  name: string;
  number: number;
  party: string;
}

export interface VoteResult {
  candidateId: number;
  candidateName?: string;
  candidateNumber?: number;
  votes: number;
}

export interface VoterStatus {
  isRegistered: boolean;
  hasVoted: boolean;
  voteTokenBalance: number;
}

export interface ElectionCreationParams {
  position: string;
  region: string;
  startTime: number; // timestamp
  endTime: number;   // timestamp
}

export interface CandidateRegistrationParams {
  electionId: number;
  name: string;
  number: number;
  party: string;
}

export interface VoteParams {
  electionId: number;
  candidateId: number;
  secret: string;
}

export interface ZKProof {
  proof: any;
  publicSignals: any[];
}

export interface MerkleProof {
  proof: string[];
  root: string;
  leaf: string;
}