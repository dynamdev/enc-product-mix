import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('EnchantmintProductMixNft', function () {
  let EnchantmintProductMixNft: any;
  let enchantmintProductMixNft: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    // Deploying contract
    EnchantmintProductMixNft = await ethers.getContractFactory(
      'EnchantmintProductMixNft',
    );
    enchantmintProductMixNft = await EnchantmintProductMixNft.deploy();
    await enchantmintProductMixNft.getAddress();
    [owner, addr1] = await ethers.getSigners();
  });

  describe('Minting', function () {
    it('Should allow owner to mint', async function () {
      const videoCid: string = 'Qm...';
      const uri: string = 'https://example.com/uri';
      await enchantmintProductMixNft.safeMint(videoCid, uri);
      expect(await enchantmintProductMixNft.totalSupply()).to.equal(1);
    });

    it('Should not allow non-owner to mint', async function () {
      const videoCid: string = 'Qm...';
      const uri: string = 'https://example.com/uri';
      await expect(
        enchantmintProductMixNft.connect(addr1).safeMint(videoCid, uri),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should not allow minting with the same videoCid', async function () {
      const videoCid: string = 'Qm...';
      const uri: string = 'https://example.com/uri';
      await expect(
        await enchantmintProductMixNft.safeMint(videoCid, uri),
      ).to.be.revertedWith('Video CID already used');
    });
  });

  // describe('Queries', function () {
  //   const videoCid: string = 'Qm...';
  //   const uri: string = 'https://example.com/uri';
  //
  //   beforeEach(async function () {
  //     await enchantmintProductMixNft.safeMint(videoCid, uri);
  //   });
  //
  //   it('Should get mintDate by token ID', async function () {
  //     const mintDate: any = await enchantmintProductMixNft.getMintDateByTokenId(
  //       0,
  //     );
  //     expect(mintDate).to.be.within(
  //       Math.floor(Date.now() / 1000) - 10,
  //       Math.floor(Date.now() / 1000),
  //     );
  //   });
  //
  //   it('Should get mintDate by videoCid', async function () {
  //     const mintDate: any =
  //       await enchantmintProductMixNft.getMintDateByVideoCid(videoCid);
  //     expect(mintDate).to.be.within(
  //       Math.floor(Date.now() / 1000) - 10,
  //       Math.floor(Date.now() / 1000),
  //     );
  //   });
  //
  //   it('Should get token ID by videoCid', async function () {
  //     expect(
  //       await enchantmintProductMixNft.getTokenIdByVideoCid(videoCid),
  //     ).to.equal(0);
  //   });
  //
  //   it('Should get videoCid by token ID', async function () {
  //     expect(await enchantmintProductMixNft.getVideoCidByTokenId(0)).to.equal(
  //       videoCid,
  //     );
  //   });
  // });
});
