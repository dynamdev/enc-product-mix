// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract EnchantmintProductMixNft is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, Ownable, ERC721Burnable {
    uint256 private _nextTokenId;

    // Mapping from token ID to mint date
    mapping(uint256 => uint256) private _mintDates;
    mapping(uint256 => string) private _tokenVideoCids; // tokenId -> videoCid
    mapping(string => uint256) private _videoCidTokens; // videoCid -> tokenId

    constructor(address initialOwner)
    ERC721("EnchantmintProductMixNft", "EPM")
    Ownable(initialOwner)
    {
        _nextTokenId++;  // Start the counter at 1
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(string memory videoCid, string memory uri) public onlyOwner {
        require(_videoCidTokens[videoCid] == 0, "Video CID already used");

        uint256 tokenId = _nextTokenId++;
        _safeMint(owner(), tokenId);
        _setTokenURI(tokenId, uri);

        _mintDates[tokenId] = block.timestamp;  // Store the mint date
        _tokenVideoCids[tokenId] = videoCid;    // Store the videoCid for the tokenId
        _videoCidTokens[videoCid] = tokenId;    // Store the tokenId for the videoCid
    }

    function getMintDateByTokenId(uint256 tokenId) public view returns (uint256) {
        uint256 mintDate = _mintDates[tokenId];
        require(mintDate != 0, "Token not found");
        return mintDate;
    }

    function getMintDateByVideoCid(string memory videoCid) public view returns (uint256) {
        uint256 tokenId = _videoCidTokens[videoCid];
        require(tokenId != 0, "Video CID not found");

        uint256 mintDate = _mintDates[tokenId];
        require(mintDate != 0, "Token not found for the given Video CID");

        return mintDate;
    }


    function getTokenIdByVideoCid(string memory videoCid) public view returns (uint256) {
        uint256 tokenId = _videoCidTokens[videoCid];
        require(tokenId != 0, "Video CID not found");
        return tokenId;
    }

    function getVideoCidByTokenId(uint256 tokenId) public view returns (string memory) {
        string memory videoCid = _tokenVideoCids[tokenId];
        require(bytes(videoCid).length > 0, "Token ID not found");
        return videoCid;
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
    internal
    override(ERC721, ERC721Enumerable, ERC721Pausable)
    returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
    internal
    override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Enumerable, ERC721URIStorage)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
