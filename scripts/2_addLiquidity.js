// Smart contracts
const getConfig = require('../config');
const { getNetwork, getCurrentTimestampInSecondsAndSum, toDecimals } = require('./utils');
const EFINV2Router02 = artifacts.require("EFINV2Router02.sol");
const TestToken = artifacts.require("TestToken.sol");

// Util classes
const assert = require('assert');

/** Process parameters: */
/*
Testnet:
Token deployed at: 0x9CA5b58C4533Eb017e7a5138EEC0B6bBf2F73846
Token Name / Symbol / Decimals: Token_A / TKN_A / 18
*/
const tokenAAddress = '0x9CA5b58C4533Eb017e7a5138EEC0B6bBf2F73846';

/*
Testnet:
Token deployed at: 0x6e155AFb2770eB3cf3084dAc1994f88C070CbB8B
Token Name / Symbol / Decimals: Token_B / TKN_B / 18
*/
const tokenBAddress = '0x6e155AFb2770eB3cf3084dAc1994f88C070CbB8B';

const deployerSenderIndex = 0;
// truffle exec ./script/addLiquidity.js --network testnet
module.exports = async (callback) => {
    try {
        const network = getNetwork();
        console.log(`Script will be executed in network ${network}.`)
        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");
        const deployerSender = accounts[deployerSenderIndex];
        console.log(`Using account: ${deployerSender}`);
        
        const networkConfiguration = getConfig(network);

        const router = await EFINV2Router02.at(networkConfiguration.router);
        assert(router, "Router is undefined.");

        const tokenA = await TestToken.at(tokenAAddress);
        const tokenB = await TestToken.at(tokenBAddress);
        const deadline = await getCurrentTimestampInSecondsAndSum(web3, 500);
        const amountADesired = toDecimals(10000, (await tokenA.decimals()));
        const amountBDesired = toDecimals(10000, (await tokenB.decimals()));
        const amountAMin = amountADesired;
        const amountBMin = amountBDesired;

        console.log(`Approving token A: spender: ${router.address} - amount: ${amountADesired}`);
        await tokenA.approve(router.address, amountADesired);

        console.log(`Approving token B: spender: ${router.address} - amount: ${amountBDesired}`);
        await tokenB.approve(router.address, amountBDesired);

        console.log(`Adding liquidity: tokenA: ${tokenA.address} - tokenB: ${tokenB.address} - amountADesired: ${amountADesired} - amountBDesired: ${amountBDesired}`);
        const addLiquidityResult = await router.addLiquidity(
            tokenA.address,
            tokenB.address,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            deployerSender,
            deadline,
            {
                from: deployerSender,
                gas: networkConfiguration.gasLimit,
            }
        );

        console.log(addLiquidityResult);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};