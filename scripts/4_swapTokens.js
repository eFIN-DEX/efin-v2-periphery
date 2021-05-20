// Smart contracts
const getConfig = require('../config');
const { getNetwork, getCurrentTimestampInSecondsAndSum, toDecimals, toUnits } = require('./utils');
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
const outputAmount = 100;

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
        assert(router, "EFIN Router is undefined.");

        const tokenA = await TestToken.at(tokenAAddress);
        const tokenADecimals = await tokenA.decimals();
        const tokenASymbol = await tokenA.symbol();
        const tokenB = await TestToken.at(tokenBAddress);
        const tokenBDecimals = await tokenB.decimals();
        const tokenBSymbol = await tokenB.symbol();
        const deadline = await getCurrentTimestampInSecondsAndSum(web3, 500);
        const outputAmountWithDecimals = toDecimals(outputAmount, tokenBDecimals);
        const path = [tokenAAddress,tokenBAddress];

        const amountsIn = await router.getAmountsIn(
            outputAmountWithDecimals,
            path
        );
        console.log(amountsIn);
        const inputAmountWithDecimals = amountsIn[0];

        console.log(`Approving token A: spender: ${router.address} - amount: ${inputAmountWithDecimals}`);
        await tokenA.approve(router.address, inputAmountWithDecimals);

        console.log(`Swapping tokens: : ${toUnits(inputAmountWithDecimals, tokenADecimals)} ${tokenASymbol} for ${outputAmount} ${tokenBSymbol}`);

        const swapTokensForExactTokensResult = await router.swapTokensForExactTokens(
            outputAmountWithDecimals,
            inputAmountWithDecimals,
            path,
            deployerSender,
            deadline,
            {
                from: deployerSender,
                gas: networkConfiguration.gasLimit,
                gasPrice: '15000000000' // 15 gwei
            }
        );

        console.log(swapTokensForExactTokensResult);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};