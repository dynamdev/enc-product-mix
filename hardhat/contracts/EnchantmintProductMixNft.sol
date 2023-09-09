// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnchantmintProductMixNft is ERC1155, Ownable {
    // Mapping to store the timestamp of the initial mint for each token ID
    mapping(uint256 => uint256) public mintTimestamps;

    // Mapping to store individual URIs for each token ID
    mapping(uint256 => string) private _tokenURIs;

    // Counter for the latest token ID
    uint256 private _currentTokenId = 0;

    constructor() ERC1155("https://www.enchantmint.xyz/") {}

    /**
     * @dev Allows the owner to mint a new token with a specific artwork URI.
     *      The owner automatically becomes the recipient.
     * @param artworkURI The URI for the artwork of the token
     */
    function ownerMint(string memory artworkURI) public onlyOwner {
        require(balanceOf(owner(), _currentTokenId) == 0, "Owner can only have 1 copy of the NFT");

        // Set the token metadata uri
        _tokenURIs[_currentTokenId] = artworkURI;

        _mint(owner(), _currentTokenId, 1, ""); // Amount is set to 1 and the owner is the recipient

        // Record the timestamp of the initial mint
        mintTimestamps[_currentTokenId] = block.timestamp;

        // Increment the token ID
        _currentTokenId++;
    }

    /**
     * @dev Returns an array of minted NFT URLs and their mint dates.
     * @return urls An array of NFT URLs.
     * @return dates An array of mint dates.
     */
    function getMintedNFTDetails() public view returns (string[] memory urls, uint256[] memory dates) {
        uint256 length = _currentTokenId;
        urls = new string[](length);
        dates = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            urls[i] = uri(i);
            dates[i] = mintTimestamps[i];
        }

        return (urls, dates);
    }

    /**
     * @dev Returns the URI for a given token ID.
     * @param tokenId The ID of the token whose URI to retrieve.
     * @return A string representing the token's URI.
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC1155: URI query for nonexistent token");

        return _tokenURIs[tokenId];
    }

    /**
     * @dev Check if a token exists
     * @param tokenId The token ID to check
     * @return A boolean representing the token's existence.
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return mintTimestamps[tokenId] != 0;
    }
}
