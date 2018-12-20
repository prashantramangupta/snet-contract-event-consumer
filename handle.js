var sequelize = require('./models/index.js').sequelize
var Web3 = require('web3'),
    abi = require("./utils.js"),
    Organization = require('./models/index.js').Organization,
    Service = require('./models/index.js').Service,
    MPEEventsRaw = require('./models/index.js').MPEEventsRaw,
    RegistryEventsRaw = require('./models/index.js').RegistryEventsRaw,
    Channel = require('./models/index.js').Channel,
    SyncService = require('./sync_service'),
    block_number = 0

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function hexToBase64(hexString) {
    var stripped = hexString.substring(2, hexString.length)
    var byteSig = Buffer.from(stripped, 'hex');
    let buff = new Buffer(byteSig);
    let base64String = buff.toString('base64');
    return base64String;
}

function createOrUpdateOrg(data) {
    let orgId = data.id
    let owner = data.owner;
    let orgName = data.name;
    Organization.findOrCreate({
            where: {
                org_id: orgId
            },
            defaults: {
                owner_address: owner,
                organization_name: orgName,
                row_created: sequelize.literal('CURRENT_TIMESTAMP')
            }
        })
        .spread((organization, created) => {
            console.log("new Organization: " + created)
        });
}

function deleteService(orgId, serviceId) {
    Service.findOne({
            where: {
                org_id: orgId,
                service_id: serviceId
            }
        })
        .then(service => {
            Service.destroy({
                where: {
                    row_id: service.row_id
                }
            });
        });
        console.log('service deleted for serviceId: ', serviceId, '|orgId: ', orgId)
}

function deleteOrg(orgId) {
    Organization.destroy({
        where: {
            org_id: orgId
        }
    }).then(() => {
        Service.destroy({
            where: {
                org_id: orgId
            }
        });
    });
    console.log('organization deleted for orgId: ', orgId)
}

function createChannel(channelId, sender, recipient, groupId, value, nonce, expiration, signer) {
    console.log('updateChannel::args: ', channelId, sender, recipient, groupId, value, nonce, expiration, signer)
    Channel.findOrCreate({
            where: {
                channel_id: channelId
            },
            defaults: {
                sender: sender,
                recipient: recipient,
                groupId: groupId,
                balance: value,
                pending: 0,
                nonce: nonce,
                expiration: expiration,
                signer: signer
            }
        })
        .spread((channel, created) => {
            console.log("new Channel Id: " + channel.channel_id + ":: created: " + created);
            if (!created) {
                updateChannel(channelId, sender, recipient, groupId, value, nonce, expiration, signer)
            }
        });
}

function updateChannel(channelId, sender, recipient, groupId, value, nonce, expiration, signer) {
    console.log('updateChannel::args: ', channelId, sender, recipient, groupId, value, nonce, expiration, signer)
    Channel.findOne({
            where: {
                channel_id: channelId
            }
        })
        .then(channel => {
            console.log("channel found: " + channel);
            if (channel) {
                Channel.update({
                    sender: sender,
                    recipient: recipient,
                    groupId: groupId,
                    balance: value,
                    pending: 0,
                    nonce: nonce,
                    expiration: expiration,
                    signer: signer
                }, {
                    where: {
                        channel_id: channelId
                    }
                });
            } else {
                Channel.create({
                    channel_id: channelId,
                    sender: sender,
                    recipient: recipient,
                    groupId: groupId,
                    balance: value,
                    pending: 0,
                    nonce: nonce,
                    expiration: expiration,
                    signer: signer
                });
            }
        }).catch(function (err) {
            console.log("Error while executing the query: " + err);
        });
}

async function processServiceEvent(web3, result, orgId, serviceId, hash) {
    console.log('processServiceEvent::result: ', result)
    tags = result.tags;
    if (tags == undefined) {
        tags = []
    }
    for (var i = 0; i < tags.length; i++) {
        tags[i] = web3.utils.hexToString(tags[i]);
    }
    console.log('org: ' + orgId, '|serviceId: ' + serviceId + '|hash: ' + hash + 'tags:', tags)
    await SyncService.sync_service(orgId, serviceId, hash, tags);
}

async function handleEvents(result) {
    console.log('handleEvents::result: ', result)

    var netId = process.argv.slice(2)[0]
    var web3Provider = require('./config.js').NETWORKS[netId]['infura_ws'];
    var orgIdHex, serviceIdHex, typeRepoIdHex, orgId, serviceId, typeRepoId, event,
        event = result.event,
        instanceContract = null,
        web3 = new Web3(new Web3.providers.WebsocketProvider(web3Provider));

    web3.eth.abi.decodeParameters = function (outputs, bytes) {
        if (bytes === '0x') bytes = '0x00'
        return web3.eth.abi.__proto__.decodeParameters(outputs, bytes)
    }

    console.log('netId: ', netId, '|web3Provider: ', web3Provider, '|event', event)
    if (event == "ChannelOpen" || event == "ChannelClaim" || event == "ChannelSenderClaim" ||
        event == "ChannelExtend" || event == "ChannelAddFunds") {
        var decimals = 8;
        var mpeDetails = abi.getMPEDetails(netId),
            abiMPE = mpeDetails.abiMPE,
            contractAddrForMPE = mpeDetails.contractAddrForMPE;
        instanceContract = new web3.eth.Contract(abiMPE, contractAddrForMPE);

    } else if (event == 'OrganizationCreated' || event == 'OrganizationModified' ||
        event == 'OrganizationDeleted' || event == 'ServiceCreated' ||
        event == 'ServiceMetadataModified' || event == 'ServiceTagsModified' ||
        event == 'ServiceDeleted') {
        var regDetails = abi.getRegDetails(netId),
            abiRegistry = regDetails.abiRegistry,
            contractAddrForRegistry = regDetails.contractAddrForRegistry;
        instanceContract = new web3.eth.Contract(abiRegistry, contractAddrForRegistry);
        orgIdHex = result.returnValues.orgId;
        orgId = web3.utils.hexToString(orgIdHex);
        console.log('orgId: ', orgId, '|orgIdHex: ', orgIdHex)
    }

    switch (event) {
        case "OrganizationCreated":
        case "OrganizationModified":
            var value = instanceContract.methods.getOrganizationById(orgIdHex);
            await value.call().then(async(data) => await createOrUpdateOrg(data));
            break;
        case "OrganizationDeleted":
            await deleteOrg(orgId);
            break;
        case "ServiceCreated":
        case "ServiceMetadataModified":
        case "ServiceTagsModified":
            serviceIdHex = result.returnValues.serviceId;
            serviceId = web3.utils.hexToString(serviceIdHex);
            metadataURI = web3.utils.hexToString(result.returnValues.metadataURI);
            hash = metadataURI.substring(7, metadataURI.length)
            console.log('serviceIdHex: ', serviceIdHex, 'serviceId: ', serviceId, 'metadataURI: ', metadataURI,
                'hash: ', hash)
            var value = instanceContract.methods.getServiceRegistrationById(orgIdHex, serviceIdHex);
            await value.call().then(async(data) => await processServiceEvent(web3, data, orgId, serviceId, hash));
            break;
        case "ServiceDeleted":
            serviceIdHex = result.returnValues.serviceId;
            serviceId = web3.utils.hexToString(serviceIdHex);
            await deleteService(orgId, serviceId);
            break;
        case "ChannelOpen":
            var channelId = result.returnValues.channelId,
                sender = result.returnValues.sender,
                recipient = result.returnValues.recipient,
                groupId = hexToBase64(result.returnValues.groupId),
                amount = result.returnValues.amount,
                amount = (web3.utils.fromWei(amount)) * (10 ** (18 - decimals)),
                nonce = 0,
                expiration = result.returnValues.expiration,
                signer = result.returnValues.signer;
            console.log('createChannel::args: ', channelId, sender, recipient, groupId, amount, nonce, expiration, signer);
            createChannel(channelId, sender, recipient, groupId, amount, nonce, expiration, signer);
            break;
        case "ChannelClaim":
        case "ChannelSenderClaim":
        case "ChannelExtend":
        case "ChannelAddFunds":
            var channelId = result.returnValues.channelId;
            instanceContract.methods.channels(channelId).call((err, channel) => {
                if (err) {
                    console.log("Error in fetching channel data for channelId: " + channelId + "|err: " + err);
                    return;
                }
                var sender = channel[0],
                    recipient = channel[1],
                    groupId = hexToBase64(channel[2]),
                    value = channel[3],
                    nonce = channel[4],
                    expiration = channel[5],
                    signer = channel[6];
                value = (web3.utils.fromWei(value)) * (10 ** (18 - decimals));
                console.log("updateChannel::args: ", channelId, sender, recipient, groupId, value, nonce, expiration, signer);
                updateChannel(channelId, sender, recipient, groupId, value, nonce, expiration, signer);
            });
            break;
        default:
    }
}

async function update_srvc_sync(modelObj) {
    await modelObj.update({
        'processed': 1
    }, {
        where: {
            'block_no': block_number
        }
    })
}

async function processEvent(tableName, modelObj) {
    console.log('processEvent::', tableName, '|', modelObj)

    let query = 'select * from ' + tableName + ' where block_no = (select min(block_no) from ' + tableName + ' where processed = 0 ) limit 1;'
    console.log('query: ', query)
    valuesPromise = sequelize.query(query, {
        model: modelObj
    })

    await valuesPromise.then(async function process(values) {
        console.log('values:len ', values.length)
        if (values.length == 1) {
            block_number = values[0].dataValues.block_no
            obj = JSON.parse(values[0].dataValues.json_str)
            await handleEvents(obj);
            await update_srvc_sync(modelObj);
            console.log("processed and updated", block_number);
        } else {
            await sleep(30000);
        }
    }).catch((err) => {
        console.log('Error in processEvent:: ', block_number, err)
    });
}

async function processMPE() {
    while (true) {
        await processEvent('mpe_events_raw', MPEEventsRaw);
        console.log("Processed MPE Events");
    }
}

async function processRegistry() {
    while (true) {
        await processEvent('registry_events_raw', RegistryEventsRaw);
        console.log("Processed Registry Events");
    }
}

async function main() {
    processMPE();
    processRegistry();
}

main();