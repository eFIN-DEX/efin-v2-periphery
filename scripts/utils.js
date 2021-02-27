const BigNumber = require('bignumber.js');

const getNetwork = () => {
    const params = process.argv;
    const indexOf = params.indexOf('--network');
    if(params.length > indexOf) {
        return params[indexOf + 1];
    }
    throw new Error(`Network param not provided.`);
};

const toDecimals = (amount, decimals) => {
    return new BigNumber(amount).times(new BigNumber(10).pow(decimals));
};

const toUnits = (amount, decimals) => {
    return new BigNumber(amount).div(new BigNumber(10).pow(decimals));
};

const getLatestBlock = async (web3) => {
    const block = await web3.eth.getBlock('latest');
    return block;
}

const getCurrentTimestampInSeconds = async (web3) => {
    const { timestamp } = await getLatestBlock(web3);
    return parseInt(timestamp.toString());
}

const getCurrentTimestampInSecondsAndSum = async (web3, seconds) => {
    const timestamp = await getCurrentTimestampInSeconds(web3);
    return timestamp.toString() + parseInt(seconds.toString());
}

const areAddressesEqual = (addressA, addressB) => {
    return addressA.toString().toLowerCase() === addressB.toString().toLowerCase();
}

module.exports = {
    areAddressesEqual,
    EMPTY_ADDRESS: '0x0000000000000000000000000000000000000000',
    getNetwork,
    toDecimals,
    toUnits,
    getLatestBlock,
    getCurrentTimestampInSeconds,
    getCurrentTimestampInSecondsAndSum,
};