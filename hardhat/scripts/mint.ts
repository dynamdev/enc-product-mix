import { ethers } from 'hardhat';

async function main() {
  const EnchantmintProductMixNft = await ethers.getContractFactory(
    'EnchantmintProductMixNft',
  );

  const enchantmintProductMixNftInstance =
    await EnchantmintProductMixNft.deploy();

  const address = await enchantmintProductMixNftInstance.getAddress();

  console.log('EnchantmintProductMixNft is deployed to:' + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
