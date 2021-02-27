// Smart contracts
const _ = require('lodash');
const getConfig = require('../config');
const { getNetwork, EMPTY_ADDRESS, toUnits } = require('./utils');
const EFINV2Router02 = artifacts.require("EFINV2Router02.sol");
const IEFINV2Factory = artifacts.require("IEFINV2Factory.sol");
const IEFINV2Pair = artifacts.require("IEFINV2Pair.sol");
const TestToken = artifacts.require("TestToken.sol");

// Util classes
const assert = require('assert');

/** Process parameters: */

module.exports = async (callback) => {
    try {
        const network = getNetwork();
        console.log(`Script will be executed in network ${network}.`)
        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");
        
        const networkConfiguration = getConfig(network);

        console.log(`EFIN Router Address:   ${networkConfiguration.router}`);
        const router = await EFINV2Router02.at(networkConfiguration.router);
        assert(router, "Router is undefined.");
        const factoryAddress = await router.factory();

        console.log(`EFIN Factory address: ${factoryAddress}`);

        assert(factoryAddress !== EMPTY_ADDRESS, 'Factory address must be defined.');
        const factory = await IEFINV2Factory.at(factoryAddress);
        const allPairsLength = await factory.allPairsLength();
        console.log(`Total Markets: ${allPairsLength.toString()}`);
        console.log();
        console.log();
        for (const index of _.range(0, allPairsLength)) {
            const pairAddress = await factory.allPairs(index);
            console.log(`Market #${(index+1)} = ${pairAddress}`);
            console.group();
            const pair = await IEFINV2Pair.at(pairAddress);
            const name = await pair.name();
            const symbol = await pair.symbol();
            const domainSeparator = await pair.DOMAIN_SEPARATOR();
            const permitHash = await pair.PERMIT_TYPEHASH();
            const token0Address = await pair.token0();
            const token1Address = await pair.token1();
            const reserves = await pair.getReserves();

            const token0 = await TestToken.at(token0Address);
            const token1 = await TestToken.at(token1Address);

            console.log(`Name / Symbol:     ${name} / ${symbol}`);
            console.log(`Token 0 Address / Symbol:   ${token0Address} / ${(await token0.symbol())}`);
            console.log(`Token 1 Address / Symbol:   ${token1Address} / ${(await token1.symbol())}`);
            console.log(`Reserves:`);
            console.group();
            console.log(`Token0:    ${reserves.reserve0.toString()} = ${toUnits(reserves.reserve0.toString(), 18)}`);
            console.log(`Token1:    ${reserves.reserve1.toString()} = ${toUnits(reserves.reserve1.toString(), 18)}`);
            const millis = parseInt(reserves.blockTimestampLast.toString()) * 1000;
            console.log(`Timestamp: ${millis} / ${new Date(millis).toDateString()}`);
            console.groupEnd();

            console.log(`Hashes:`);
            console.group();
            console.log(`Domain Separator:  ${domainSeparator.toString()}`);
            console.log(`Permit Hash:       ${permitHash.toString()}`);
            console.groupEnd();
            console.log();
        }

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};