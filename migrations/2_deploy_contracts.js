const getConfig = require('./../config');
const EFINV2Router01 = artifacts.require("EFINV2Router01.sol");

module.exports = async function (deployer, network, accounts) {
  const owner = accounts[0];
  const networkConfig = getConfig(network);
  console.log(`Using network: ${network}`);
  console.log(`Using account: ${owner}`);
  console.log(`Using network configuration: ${JSON.stringify(networkConfig)}`);

  const factoryAddress = networkConfig.factory;
  const wethAddress = networkConfig.weth;
  const efinPairHashCode = networkConfig.efinPairHashCode;

  console.log(`Using EFINV2Factory contract deployed at:  ${factoryAddress}`);
  console.log(`Using WETH/BNB contract deployed at:       ${wethAddress}`);
  console.log(`EFINPair hash code: ${efinPairHashCode}`);

  await deployer.deploy(
    EFINV2Router01,
    factoryAddress,
    wethAddress,
    { from: owner, gas: networkConfig.gasLimit}
  );

  const router = await EFINV2Router01.deployed();
  console.log(`EFINV2Router01 contract deployed at: ${router.address}`);
};
