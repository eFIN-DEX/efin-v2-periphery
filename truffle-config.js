const envConfig = require('./config/env')();
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

// Environment Configuration
const addressCountValue = envConfig.getAddressCount().getOrDefault();
const mnemonicKeyValue = envConfig.getMnemonic().get();
const defaultAddressIndex = envConfig.getDefaultAddressIndex().getOrDefault();
const bscscanApiKey = envConfig.getBscscanApiKey().getOrDefault();
module.exports = {
  web3: Web3,
  api_keys: {
		bscscan: bscscanApiKey,
  },
  plugins: [
		'truffle-plugin-verify',
	],
  mocha: {
    enableTimeouts: false,
  },
  compilers: {
    solc: {
      version: '0.6.6',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  networks: {
    // Block explorer: https://testnet.bscscan.com
    // RPCs: https://docs.binance.org/smart-chain/developer/rpc.html
    testnet: {
      provider: () => new HDWalletProvider(mnemonicKeyValue, `https://data-seed-prebsc-2-s1.binance.org:8545/`, defaultAddressIndex, addressCountValue),
      network_id: 0x61,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    bsc: {
      provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`, defaultAddressIndex, addressCountValue),
      network_id: 0x38,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  }
}
