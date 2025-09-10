// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./VoteToken.sol";
import "./BallotBox.sol";

contract ElectionManager is AccessControl {
    bytes32 public constant ELECTION_ADMIN = keccak256("ELECTION_ADMIN");
    
    struct Election {
        string position;
        string region;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bytes32 voterRollRoot;
        address voteTokenAddress;
        address ballotBoxAddress;
    }
    
    struct Candidate {
        string name;
        uint256 number;
        string party;
    }
    
    mapping(uint256 => Election) public elections;
    mapping(uint256 => Candidate[]) public electionCandidates;
    uint256 public electionCount;
    
    event ElectionCreated(uint256 indexed electionId, string position, string region);
    event CandidateAdded(uint256 indexed electionId, string name, uint256 number);
    event VoterRollRootSet(uint256 indexed electionId, bytes32 root);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ELECTION_ADMIN, msg.sender);
    }
    
    function createElection(
        string memory _position,
        string memory _region,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyRole(ELECTION_ADMIN) returns (uint256) {
        require(_startTime < _endTime, "Invalid election period");
        
        uint256 electionId = electionCount;
        elections[electionId] = Election({
            position: _position,
            region: _region,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            voterRollRoot: bytes32(0),
            voteTokenAddress: address(0),
            ballotBoxAddress: address(0)
        });
        
        // Deploy VoteToken contract
        VoteToken voteToken = new VoteToken();
        elections[electionId].voteTokenAddress = address(voteToken);
        
        // Deploy BallotBox contract
        BallotBox ballotBox = new BallotBox(address(voteToken), electionId);
        elections[electionId].ballotBoxAddress = address(ballotBox);
        
        electionCount++;
        
        emit ElectionCreated(electionId, _position, _region);
        return electionId;
    }
    
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        uint256 _number,
        string memory _party
    ) external onlyRole(ELECTION_ADMIN) {
        require(elections[_electionId].isActive, "Election not active");
        
        electionCandidates[_electionId].push(Candidate({
            name: _name,
            number: _number,
            party: _party
        }));
        
        emit CandidateAdded(_electionId, _name, _number);
    }
    
    function setVoterRollRoot(uint256 _electionId, bytes32 _root) 
        external onlyRole(ELECTION_ADMIN) 
    {
        require(elections[_electionId].isActive, "Election not active");
        elections[_electionId].voterRollRoot = _root;
        
        emit VoterRollRootSet(_electionId, _root);
    }
    
    function registerVoter(
        uint256 _electionId,
        bytes32[] calldata _proof,
        bytes32 _voterHash
    ) external {
        Election memory election = elections[_electionId];
        require(election.isActive, "Election not active");
        require(election.voterRollRoot != bytes32(0), "Voter roll not set");
        require(block.timestamp >= election.startTime, "Election not started");
        require(block.timestamp <= election.endTime, "Election ended");
        
        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(_voterHash));
        require(
            MerkleProof.verify(_proof, election.voterRollRoot, leaf),
            "Invalid proof"
        );
        
        VoteToken voteToken = VoteToken(election.voteTokenAddress);
        voteToken.mint(msg.sender);
    }
    
    function getCandidates(uint256 _electionId) 
        external view returns (Candidate[] memory) 
    {
        return electionCandidates[_electionId];
    }
    
    function getElectionDetails(uint256 _electionId)
        external view returns (Election memory)
    {
        return elections[_electionId];
    }
}