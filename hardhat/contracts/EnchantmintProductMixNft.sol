// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EnchantmintProductMixNft is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to mint date
    mapping(uint256 => uint256) private _mintDates;
    mapping(uint256 => string) private _tokenVideoCids; // tokenId -> videoCid
    mapping(string => uint256) private _videoCidTokens; // videoCid -> tokenId

    constructor() ERC721("EnchantmintProductMix", "EPM") {}

    function safeMint(string memory videoCid, string memory uri) public onlyOwner {
        require(_videoCidTokens[videoCid] == 0, "Video CID already used");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
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

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
    internal
    override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
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
