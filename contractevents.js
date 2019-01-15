var sequelize = require('./models/index.js').sequelize,
    abiUtil = require("./utils.js"),
    Web3 = require('web3'),
    MPEEventsRaw = require('./models/index.js').MPEEventsRaw,
    RegistryEventsRaw = require('./models/index.js').RegistryEventsRaw,
    RFAIEventsRaw = require('./models/index.js').RFAIEventsRaw,
    mpeClosed = false,
    registryClosed = false;
    rfaiClosed = false;

function close(web3, isRegistry, isMPE, isRFAI) {
    if (isRegistry) {
        console.log("closing for Registry.");
        registryClosed = true;
    }
    if (isMPE) {
        console.log("closing for MPE.");
        mpeClosed = true;
    }
    if (isRFAI) {
        console.log("Closing for RFAI.");
        rfaiClosed = true;
    }

    if (registryClosed && mpeClosed && rfaiClosed) {
        console.log("closing..");
        sequelize.close().catch(err => console.error(err))
        web3.currentProvider.connection.close();
        mpeClosed = false;
        registryClosed = false;
        rfaiClosed = false;
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
            close(web3, true, false, false);
        });

        MPEEventsRaw.max('block_no').then(maxSeenBlock => {
            readEvents(web3, netId, maxSeenBlock, maxNetworkBlock, 'MPE');
        }).catch(err => {
            console.error("Error in crawling MPE " + err);
            close(web3, false, true, false);
        });

        RFAIEventsRaw.max('block_no').then(maxSeenBlock => {
            readEvents(web3, netId, maxSeenBlock, maxNetworkBlock, 'RFAI');
        }).catch(err => {
            console.error("Error in crawling RFAI " + err);
            close(web3, false, false, true);
        });

    }).catch(err => {
        console.error(err);
        close(web3, true, true, true);
    });
}

function isNaN(x) {
    x = Number(x);
    return x != x;
}

function createSQLStatements(RawEvents, result) {
    var createPromises = result.map(function (item) {
        return RawEvents.count({
            where: {
                block_no: item.blockNumber,
                transactionHash: item.transactionHash,
                logIndex: item.logIndex
            }
          }).then(c => 
            {
                if(c === 0) {
                    RawEvents.create({
                        'block_no': item.blockNumber,
                        'event':   item.event,
                        'transactionHash':item.transactionHash,
                        'logIndex': item.logIndex,
                        'json_str': JSON.stringify(item),
                        'row_created': sequelize.literal('CURRENT_TIMESTAMP')
                    })
                    .catch((err) => {
                        console.error('Error for block no. ', item.blockNumber, '|', err);
                    })                            
                }
                else {
                    console.log('Block seen' + JSON.stringify(item))
                }
            })
    });
    return createPromises;
}

function readEvents(web3, netId, maxSeenBlock, maxNetworkBlock, contract) {
    var contractDetails, abi=undefined, contractAddr=undefined;

    if (contract == 'Registry') {
        contractDetails = abiUtil.getRegDetails(netId);
        abi = contractDetails.abiRegistry;
        contractAddr = contractDetails.contractAddrForRegistry;
    } else if (contract == 'MPE') {
        contractDetails = abiUtil.getMPEDetails(netId);
        abi = contractDetails.abiMPE;
        contractAddr = contractDetails.contractAddrForMPE;
    }else if (contract == 'RFAI') {
        contractDetails = abiUtil.getRFAIDetails(netId);
        abi = contractDetails.abiRFAI;
        contractAddr = contractDetails.contractAddrForRFAI;
    } 

    var contractInstance = new web3.eth.Contract(abi, contractAddr);
    /* for the bug in Web3js Beta 36 - fix to read events only when we have indexed parameters to events...  */
    web3.eth.abi.decodeParameters = function (outputs, bytes) {
        if (bytes === '0x') bytes = '0x00'
        return web3.eth.abi.__proto__.decodeParameters(outputs, bytes)
    }
    
    maxSeenBlock = isNaN(maxSeenBlock) ? 7000000 : (maxSeenBlock);
    batchCompleted = false;
    console.log("Crawling from " + maxSeenBlock + " to " + maxNetworkBlock)
    var evt = contractInstance.getPastEvents("allEvents", {
        fromBlock: maxSeenBlock,
        toBlock: maxNetworkBlock
    }, function (err, result) {
        if (err) {
            console.log("error while watching for contract events: " + err);
        } else {
            var RawEvents = null;

            if (contract === 'MPE') {
                RawEvents = MPEEventsRaw
            }else if(contract === 'Registry') {
                RawEvents = RegistryEventsRaw
            }else if(contract === 'RFAI') {
                RawEvents = RFAIEventsRaw
            }
            
            let createPromises = createSQLStatements(RawEvents, result);
            Promise.all(createPromises).then(() => {
                console.log("Completed crawling from " + maxSeenBlock + " to " + maxNetworkBlock);                    
                close(web3, (contract == 'Registry'), (contract == 'MPE'), (contract == 'RFAI'));
            });                
        }
    }).catch(err => {
        console.error(err);
        close(web3, (contract == 'Registry'), (contract == 'MPE'), (contract == 'RFAI'));
        batchFailed = true;
    });
}

main();
