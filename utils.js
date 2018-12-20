var fs = require('fs'),
    path = require('path'),
    exports = module.exports = {};

exports.getRegDetails = (netId) => {
    var regAddrPath = path.join(__dirname, '..', 'SmartContractEvents', 'node_modules', 'singularitynet-platform-contracts', 'networks', 'Registry.json'),
        registryPath = path.join(__dirname, '..', 'SmartContractEvents', 'node_modules', 'singularitynet-platform-contracts', 'abi', 'Registry.json'),
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
    var mpeAddrPath = path.join(__dirname, '..', 'SmartContractEvents', 'node_modules', 'singularitynet-platform-contracts', 'networks', 'MultiPartyEscrow.json'),
        mpePath = path.join(__dirname, '..', 'SmartContractEvents', 'node_modules', 'singularitynet-platform-contracts', 'abi', 'MultiPartyEscrow.json'),
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