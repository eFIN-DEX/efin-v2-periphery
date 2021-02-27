// Smart contracts
// const { toUnits } = require('./utils');
const BigNumber = require('bignumber.js');
const TestToken = artifacts.require("TestToken.sol");

const toUnits = (amount, decimals) => {
    return new BigNumber(amount).div(new BigNumber(10).pow(decimals));
};

// Util classes
const assert = require('assert');

/** Process parameters: */
const tokenName = 'Token_B';
const tokenSymbol = 'TKN_B';
const tokenDecimals = 18;
const deployerIndex = 0;

/**
Testnet:

Token deployed at: 0x9CA5b58C4533Eb017e7a5138EEC0B6bBf2F73846
Token Name / Symbol / Decimals: Token_A / TKN_A / 18

Token deployed at: 0x6e155AFb2770eB3cf3084dAc1994f88C070CbB8B
Token Name / Symbol / Decimals: Token_B / TKN_B / 18
*/

module.exports = async (callback) => {
    try {
        // const network = getNetwork();
        // console.log(`Script will be executed in network ${network}.`)
        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");
        const deployer = accounts[deployerIndex];
        
        const token = await TestToken.new(tokenName, tokenSymbol, tokenDecimals, { from: deployer });

        console.log(`Token deployed at: ${token.address}`);

        const balanceDeployer = await token.balanceOf(deployer);
        const totalSupply = await token.totalSupply();

        console.log(`Token Name / Symbol / Decimals: ${tokenName} / ${tokenSymbol} / ${tokenDecimals}`);
        console.log(`Total Supply: ${toUnits(totalSupply, tokenDecimals)} ${tokenSymbol}`);
        console.log(`Deployer Balance: ${toUnits(balanceDeployer, tokenDecimals)} ${tokenSymbol}`);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};