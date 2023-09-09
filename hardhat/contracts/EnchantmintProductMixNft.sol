// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnchantmintProductMixNft is ERC1155, Ownable {
    // Mapping to store the timestamp of the initial mint for each token ID
    mapping(uint256 => uint256) public mintTimestamps;

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
        _setURI(_currentTokenId, artworkURI);

        _mint(owner(), _currentTokenId, 1, ""); // Amount is set to 1 and the owner is the recipient

        // Record the timestamp of the initial mint
        mintTimestamps[_currentTokenId] = block.timestamp;

        // Increment the token ID
        _currentTokenId++;
    }

    /**
     * @dev Returns an array of minted NFT URLs and their mint dates.
     * @return A tuple containing two arrays: one for URLs and one for mint dates.
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
}
