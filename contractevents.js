var sequelize = require('./models/index.js').sequelize,
    abiUtil = require("./utils.js"),
    Web3 = require('web3'),
    MPEEventsRaw = require('./models/index.js').MPEEventsRaw,
    RegistryEventsRaw = require('./models/index.js').RegistryEventsRaw,
    mpeClosed = false,
    registryClosed = false;

function close(web3, isRegistry, isMPE) {
    if (isRegistry) {
        console.log("Closing for registry");
        registryClosed = true;
    }

    if (isMPE) {
        console.log("Closing for MPE");
        mpeClosed = true;
    }

    if (registryClosed && mpeClosed) {
        console.log("Closing");
        sequelize.close().catch(err => console.error(err))
        web3.currentProvider.connection.close();

        mpeClosed = false;
        registryClosed = false;
    }
}

function main() {
    var netId = process.argv.slice(2)[0]
    var web3Provider = require('./config.js').NETWORKS[netId]['infura_ws'];
    console.log("main::netId:", netId, "|web3Provider:", web3Provider)
    var web3 = new Web3(new Web3.providers.WebsocketProvider(web3Provider));
    web3.eth.getBlockNumber().then(maxNetworkBlock => {
        RegistryEventsRaw.max('block_no').then(maxSeenBlock => {
            readEvents(web3, netId, maxSeenBlock, maxNetworkBlock, 'Registry');
        }).catch(err => {
            console.error("Error in crawling Registry " + err);
            close(web3, true, false);
        });

        MPEEventsRaw.max('block_no').then(maxSeenBlock => {
            readEvents(web3, netId, maxSeenBlock, maxNetworkBlock, 'MPE');
        }).catch(err => {
            console.error("Error in crawling MPE " + err);
            close(web3, false, true);
        });
    }).catch(err => {
        console.error(err);
        close(web3, true, true);
    });
}

function isNaN(x) {
    x = Number(x);
    return x != x;
}

function readEvents(web3, netId, maxSeenBlock, maxNetworkBlock, contract) {
    var contractDetails, abi, contractAddr;
    var isRegistry = false;
    if (contract == 'Registry') {
        contractDetails = abiUtil.getRegDetails(netId);
        abi = contractDetails.abiRegistry;
        contractAddr = contractDetails.contractAddrForRegistry;
        isRegistry = true;
    } else {
        contractDetails = abiUtil.getMPEDetails(netId);
        abi = contractDetails.abiMPE;
        contractAddr = contractDetails.contractAddrForMPE;
    }

    var contractInstance = new web3.eth.Contract(abi, contractAddr);
    /* for the bug in Web3js Beta 36 - fix to read events only when we have indexed parameters to events...  */
    web3.eth.abi.decodeParameters = function (outputs, bytes) {
        if (bytes === '0x') bytes = '0x00'
        return web3.eth.abi.__proto__.decodeParameters(outputs, bytes)
    }

    maxSeenBlock = isNaN(maxSeenBlock) ? 5453077 : (maxSeenBlock);
    var evt = contractInstance.getPastEvents("allEvents", {
        fromBlock: maxSeenBlock + 1,
        toBlock: maxNetworkBlock
    }, function (err, result) {
        if (err) {
            console.log("Error while watching for contract events => " + err);
        } else {
            var RawEvents = null;
            if (contract === 'MPE') {
                RawEvents = MPEEventsRaw
            } else {
                RawEvents = RegistryEventsRaw
            }
            var createPromises = result.map(function (item) {
                return RawEvents.create({
                        'block_no': item.blockNumber,
                        'json_str': JSON.stringify(item),
                        'row_created': sequelize.literal('CURRENT_TIMESTAMP')
                    })
                    .then(() => {
                        console.log('Success for block no. ', item.blockNumber)
                    })
                    .catch((err) => {
                        console.error('Error for block no. ', item.blockNumber, '|', err);
                    })
            });

            Promise.all(createPromises).then(() => {
                console.log("Completed crawling all events");
                close(web3, isRegistry, !isRegistry)
            });
        }
    }).catch(err => {
        console.error(err);
        close(web3, isRegistry, !isRegistry);
    });
}

main();
