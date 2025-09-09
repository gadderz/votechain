// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VoteToken is ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    Counters.Counter private _tokenIdCounter;
    mapping(address => bool) private _hasVoted;
    
    constructor() ERC721("VotaChain Token", "VOTE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function mint(address to) external onlyRole(MINTER_ROLE) {
        require(balanceOf(to) == 0, "Already has voting token");
        require(!_hasVoted[to], "Already voted");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
    }
    
    function burn(uint256 tokenId) external onlyRole(BURNER_ROLE) {
        //require(_exists(tokenId), "Token does not exist");
        address owner = ownerOf(tokenId);
        _hasVoted[owner] = true;
        _burn(tokenId);
    }
    
    function hasVoted(address voter) external view returns (bool) {
        return _hasVoted[voter];
    }
    
    // Override transfer functions to make token soulbound (non-transferable)
    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("VoteToken: non-transferable");
    }
    
    //function safeTransferFrom(address, address, uint256) public pure override {
    //    revert("VoteToken: non-transferable");
    //}
    
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert("VoteToken: non-transferable");
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}