// Smart contracts
const getConfig = require('../config');
const { getNetwork, getCurrentTimestampInSecondsAndSum, EMPTY_ADDRESS, areAddressesEqual } = require('./utils');
const EFINV2Router02 = artifacts.require("EFINV2Router02.sol");
const IEFINV2Pair = artifacts.require("IEFINV2Pair.sol");
const IEFINV2Factory = artifacts.require("IEFINV2Factory.sol");

// Util classes
const assert = require('assert');
const BigNumber = require('bignumber.js');

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
const tokenBAddress = '0x6e155AFb2770eB3cf3084dAc1994f88C070CbB8B'
const deployerSenderIndex = 0;
const slippage = 0.95;

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
        const factoryAddress = await router.factory();

        console.log(`Factory address: ${factoryAddress}`);

        assert(factoryAddress !== EMPTY_ADDRESS, 'Factory address must be defined.');
        const factory = await IEFINV2Factory.at(factoryAddress);
        const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
        const pairAddress2 = await factory.getPair(tokenBAddress, tokenAAddress);
        assert(pairAddress !== EMPTY_ADDRESS || pairAddress2 !== EMPTY_ADDRESS, 'Pair address must be defined.');
        
        console.log(`Pair Address:    ${pairAddress}`);
        const lpToken = await IEFINV2Pair.at(pairAddress);

        const [lpBalance, totalSupply, reserves, token0Address, token1Address] = await Promise.all([
            lpToken.balanceOf(deployerSender),
            lpToken.totalSupply(),
            lpToken.getReserves(),
            lpToken.token0(),
            lpToken.token1(),
        ]);
        console.log(`LP Token Balance:  ${lpBalance.toString()}`);
        console.log(`LP Total Supply:   ${totalSupply.toString()}`);
        console.log(`LP Reserves:`);
        console.group();
        console.log(`Token0:    ${reserves.reserve0.toString()}`);
        console.log(`Token1:    ${reserves.reserve1.toString()}`);
        const millis = parseInt(reserves.blockTimestampLast.toString()) * 1000;
        console.log(`Timestamp: ${millis} / ${new Date(millis).toDateString()}`);
        console.groupEnd();

        const liquidityTokensAmount = BigNumber(lpBalance.toString());
        const token0Balance = liquidityTokensAmount
            .times(reserves.reserve0)
            .div(totalSupply);
        const token1Balance = liquidityTokensAmount
            .times(reserves.reserve1)
            .div(totalSupply);

        console.log(`Token Balances for Account ${deployerSender}`);
        console.group();
        console.log(`Token 0/A:         ${token0Address} / ${tokenAAddress}`);
        console.log(`Token 1/B:         ${token1Address} / ${tokenBAddress}`);

        let minAmountToken0;
        let minAmountToken1;
        if(areAddressesEqual(token0Address, tokenAAddress)) {
            minAmountToken0 = token0Balance.times(slippage).toFixed(0);
            minAmountToken1 = token1Balance.times(slippage).toFixed(0);
        } else {
            minAmountToken0 = token1Balance.times(slippage).toFixed(0);
            minAmountToken1 = token0Balance.times(slippage).toFixed(0);
        }

        console.log(`Token0 Balance:    ${token0Balance.toFixed(0)}`);
        console.log(`Token1 Balance:    ${token1Balance.toFixed(0)}`);
        console.groupEnd();

        console.log(`Slippage:              ${slippage}`);
        console.log(`Min Amount Token 0:    ${minAmountToken0}`);
        console.log(`Min Amount Token 1:    ${minAmountToken1}`);

        const deadline = await getCurrentTimestampInSecondsAndSum(web3, 500);
        
        console.log(`Approving LP tokens: LP address: ${lpToken.address} - router: ${router.address} - amount: ${lpBalance.toString()}`);
        await lpToken.approve(router.address, lpBalance.toString());
        console.log(`Removing liquidity: tokenA: ${tokenAAddress} - tokenB: ${tokenBAddress}`);
        const removeLiquidityResult = await router.removeLiquidity(
            tokenAAddress,
            tokenBAddress,
            lpBalance.toString(), //Liquidity
            minAmountToken0,
            minAmountToken1,
            deployerSender,
            deadline,
            {
                from: deployerSender,
                gas: networkConfiguration.gasLimit,
                gasPrice: '15000000000' // 15 gwei
            }
        );

        console.log(removeLiquidityResult);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};