var fs = require('fs'),
    path = require('path'),
    exports = module.exports = {};

function getContractsDirectory() {
    return path.join(__dirname, '.', 'node_modules', 'singularitynet-platform-contracts')
}
exports.getRegDetails = (netId) => {
    var regAddrPath = path.join(getContractsDirectory(), 'networks', 'Registry.json'),
        registryPath = path.join(getContractsDirectory(), 'abi', 'Registry.json'),
        addr_str = fs.readFileSync(regAddrPath, 'utf8'),
        reg_str = fs.readFileSync(registryPath, 'utf8'),
        regAddr = JSON.parse(addr_str),
        abiRegistry = JSON.parse(reg_str),
        contractAddrForRegistry = regAddr[netId].address;
    return {
        abiRegistry: abiRegistry,
        contractAddrForRegistry: contractAddrForRegistry
    }
}

exports.getMPEDetails = (netId) => {
    var mpeAddrPath = path.join(getContractsDirectory(), 'networks', 'MultiPartyEscrow.json'),
        mpePath = path.join(getContractsDirectory(), 'abi', 'MultiPartyEscrow.json'),
        addr_str = fs.readFileSync(mpeAddrPath, 'utf8'),
        mpe_str = fs.readFileSync(mpePath, 'utf8'),
        abiMPE = JSON.parse(mpe_str),
        mpeAddr = JSON.parse(addr_str),
        contractAddrForMPE = mpeAddr[netId].address;
    return {
        abiMPE: abiMPE,
        contractAddrForMPE: contractAddrForMPE
    }
}

exports.getRFAIDetails = (netId) => {
    var rfaiAddrPath = path.join(getContractsDirectory(), 'networks', 'RFAI.json'),
        rfaiPath = path.join(getContractsDirectory(), 'abi', 'RFAI.json'),
        addr_str = fs.readFileSync(rfaiAddrPath, 'utf8'),
        rfai_str = fs.readFileSync(rfaiPath, 'utf8'),
        abiRFAI = JSON.parse(rfai_str),
        rfaiAddr = JSON.parse(addr_str),
        contractAddrForRFAI = rfaiAddr[netId].address;
    return {
        abiRFAI: abiRFAI,
        contractAddrForRFAI: contractAddrForRFAI
    }
}