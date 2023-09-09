import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('EnchantmintProductMixNft', function () {
  it('Should return the index of the minted NFT', async function () {
    const EnchantmintProductMixNft = await ethers.getContractFactory(
      'EnchantmintProductMixNft',
    );

    const enchantmintProductMixNftInstance =
      await EnchantmintProductMixNft.deploy();

    const address = await enchantmintProductMixNftInstance.getAddress();

    console.log('EnchantmintProductMixNft is deployed to:' + address);

    const [signer] = await ethers.getSigners();

    const nftdata = await enchantmintProductMixNftInstance.ownerMint(
      'https://ipfs.filebase.io/ipfs/QmXWVapU26kY1pA2UmZBAcVVrZuV8fhbfg2wAJ8CoSenya',
    );
    console.log(nftdata);
    expect(await nftdata.value).to.eq(0);
  });
});
