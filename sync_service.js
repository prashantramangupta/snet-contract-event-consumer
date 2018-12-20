require('util')
require('sequelize');
const IPFS_API = require('ipfs-api'),
    IPFS_URL = require('./config.js').IPFS_URL;
var Web3 = require('web3'),
    sequelize = require('./models/index.js').sequelize,
    Service = require('./models/index.js').Service,
    ServiceMetaData = require('./models/index.js').ServiceMetaData,
    ServiceGroup = require('./models/index.js').ServiceGroup,
    ServiceEndpoint = require('./models/index.js').ServiceEndpoint,
    ServiceTags = require('./models/index.js').ServiceTags,
    ipfsDetails = {
        ipfs: IPFS_API(IPFS_URL.url, IPFS_URL.port, {
            protocol: IPFS_URL.protocol
        })
    },
    sId = '',
    serviceName = '',
    orgId = '',
    serviceId = '',
    srvcData = '',
    srvcTags = [],
    cnt = 0;

let delExistGrpEndpt = async (serviceId, trxn) => {
    await ServiceGroup.destroy({
        where: {
            'service_id': serviceId
        }
    }, {
        transaction: trxn
    }).then().catch((e) => {
        trxn.rollback()
    });
    await ServiceEndpoint.destroy({
        where: {
            'service_id': serviceId
        }
    }, {
        transaction: trxn
    }).then().catch((e) => {
        trxn.rollback()
    });
    await ServiceTags.destroy({
        where: {
            'service_id': serviceId
        }
    }, {
        transaction: trxn
    }).then().catch((e) => {
        trxn.rollback()
    });
};

let fetch_service_data = () => {
    console.log('serv', sId)
    return new Promise((resolve, reject) => {
        var srvcData = Service.findAll({
            where: {
                service_id: sId,
                org_id: orgId
            }
        }).then().catch((err) => {
            console.log("Error in fetching data from Service for service_id: ", sId, 'and org_id: ', orgId, ': ', err);
        })
        resolve(srvcData)
    })
}
let readIPFSNode = (ipfsHash) => {
    return new Promise((resolve, reject) => {
        ipfsDetails.ipfs.files.get(ipfsHash, (err, ipfsData) => {
            if (err) {
                console.error("error in fetching data from ipfs node for ipfs_hash: ", ipfsHash, ": ", err);
            } else {
                console.log('IPFS data read successfully.')
                resolve(ipfsData)
            }
        })
    })
}
let createSrvc = (trxn, count, rollback, ipfsHashCode) => {
    return new Promise((resolve, reject) => {
        if (count == 0) {
            var srvcQload = Service.create({
                    'service_id': sId,
                    'org_id': orgId,
                    'ipfs_hash': ipfsHashCode,
                    'service_path': '',
                    'is_curated': 0,
                    'row_created': sequelize.literal('CURRENT_TIMESTAMP')
                }, {
                    transaction: trxn
                })
                .then(async (values) => {
                    serviceId = values.row_id
                    console.log("serviceId: ", serviceId)
                    console.log("service create transaction successful")
                    if (rollback == false) {
                        await delExistGrpEndpt(serviceId, trxn)
                    }
                    resolve({
                        trasaction: trxn,
                        rollback: rollback
                    })
                })
                .catch((err) => {
                    rollback = true;
                    trxn.rollback();
                    console.error('service create transaction rollbacked: ', err);
                })
        } else {
            var srvcQload = Service.update({
                    'ipfs_hash': ipfsHashCode,
                    'service_path': '',
                    'is_curated': 0
                }, {
                    where: {
                        'service_id': sId,
                        'org_id': orgId

                    }
                }, {
                    transaction: trxn
                })
                .then(async () => {
                    console.log("service update successful")
                    if (rollback == false) {
                        await delExistGrpEndpt(serviceId, trxn)
                    }
                    resolve({
                        trasaction: trxn,
                        rollback: rollback
                    })
                })
                .catch((err) => {
                    rollback = true;
                    trxn.rollback();
                    console.error('service update transaction rollbacked: ', err);
                })
        }
    })
}
let dbUpdt = (trxn, rollback, ipfsNodeData) => {
    return new Promise((resolve, reject) => {
        if (rollback == false) {
            console.log("serviceId: ", serviceId)
            ipfsNodeData.forEach(record => {
                recData = JSON.parse(record.content.toString('utf8'))
                var srvcMetaDataQload = ServiceMetaData.upsert({
                        'type': recData.service_type,
                        'service_id': serviceId,
                        'price_model': recData.pricing.price_model,
                        'price': recData.pricing.price_in_cogs,
                        'mpe_address': recData.mpe_address,
                        'model_ipfs_hash': recData.model_ipfs_hash,
                        'encoding': recData.encoding,
                        'display_name': recData.display_name,
                        'row_created': sequelize.literal('CURRENT_TIMESTAMP')
                    }, {
                        transaction: trxn,
                        rollback: false
                    }).then((resolve, reject) => {
                        console.log('service_metadata pass' + serviceId);
                    })
                    .catch((err) => {
                        rollback = true
                        trxn.rollback
                        console.error('all transaction are rollbacked: ', err);
                    })

                var endPtsData = recData.endpoints;
                endPtsData.forEach(endPtData => {
                    if (rollback === false) {
                        var srvcEnptQload = ServiceEndpoint.create({
                                'service_id': serviceId,
                                'group_name': endPtData.group_name,
                                'endpoint': endPtData.endpoint,
                                'row_created': sequelize.literal('CURRENT_TIMESTAMP')
                            }, {
                                transaction: trxn,
                                rollback: false
                            }).then((reolve, reject) => {
                                console.log('service_endpoint pass' + serviceId);
                            })
                            .catch((err) => {
                                rollback = true
                                trxn.rollback
                                console.error('all transaction are rollbacked: ', err);
                            })
                    }
                })
                srvcTags.forEach(tag => {
                    if (rollback == false) {
                        var update_tag = ServiceTags.create({
                                'service_id': serviceId,
                                'tag_name': tag,
                                'row_created': sequelize.literal('CURRENT_TIMESTAMP')

                            }, {
                                transaction: trxn,
                                rollback: false
                            }).then((reolve, reject) => {
                                console.log('service_tags pass' + serviceId);
                            })
                            .catch((err) => {
                                rollback = true
                                trxn.rollback
                                console.error('all transaction are rollbacked: ', err);
                            })
                    }
                })
                var grps_data = recData.groups;
                var grp_len = grps_data.length
                var loop = 0
                grps_data.forEach(grp_data => {
                    if (rollback == false) {
                        loop = loop + 1
                        var srvcGrpQload = ServiceGroup.create({
                                'service_id': serviceId,
                                'group_name': grp_data.group_name,
                                'group_id': grp_data.group_id,
                                'payment_address': grp_data.payment_address,
                                'row_created': sequelize.literal('CURRENT_TIMESTAMP')
                            }, {
                                transaction: trxn,
                                rollback: false

                            }).then((resolve, reject) => {
                                console.log('service_group pass' + serviceId, loop)
                                if (loop == grp_len) {
                                    if (rollback == false) {
                                        var commitPromise = commitTrxn(trxn)
                                        commitPromise
                                            .then(() => {
                                                trxn.commit()
                                                console.log('all transaction are successful and committed' + serviceId)
                                            })
                                            .catch((err) => {
                                                trxn.rollback()
                                                console.error('all transaction are rollbacked: ', err)

                                            })
                                    }
                                    console.log('end--')

                                }

                            })
                            .catch((err) => {
                                rollback = true
                                trxn.rollback
                                console.error('all transaction are rollbacked: ', err);
                            })
                    }
                })
            });
        }
    });
}

let commitTrxn = (trxn) => {
    return new Promise((resolve, reject) => {
        resolve(trxn)
    })
}

var exports = module.exports = {};
exports.sync_service = (orgNm, srvcName, ipfsHCode, tags) => {
    cnt = cnt + 1
    sId = srvcName
    orgId = orgNm
    srvcTags = tags
    console.log("sync_service tags ...", cnt, sId)
    var fetchSrvcDataProm = fetch_service_data()
    var rdIPFSPromise = readIPFSNode(ipfsHCode);
    Promise.all([fetchSrvcDataProm, rdIPFSPromise])
        .then((val) => {
            var count = val[0].length
            var ipfsNodeData = val[1]
            console.log('ipfsData:' + ipfsNodeData + '|srvcDataCount:', count)
            if (count > 0) {
                srvcData = val[0][0].dataValues
                serviceId = srvcData.row_id
                console.log('serviceId:' + serviceId)

            }
            return sequelize.transaction().then((trxn, rollback = false) => {
                var getSrvcIdProm = createSrvc(trxn, count, rollback, ipfsHCode);
                getSrvcIdProm.then((val) => {
                    console.log('rollback', val.rollback)
                    console.log('serviceId', serviceId)
                    rollback = val.rollback
                    var dbUpdtProm = dbUpdt(trxn, rollback, ipfsNodeData)
                })

            });
        })
        .catch((err) => {
            console.log("promises are not resolved: ", err)

        })
}