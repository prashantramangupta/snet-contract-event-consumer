const DB = {
    1: {
        database: '',
        username: '',
        password: '',
        host: '',
        port: 3306,
        dialect: 'mysql',
        operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    42: {
        database: '',
        username: '',
        password: '',
        host: '',
        port: 3306,
        dialect: 'mysql',
        operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    3: {
        database: '',
        username: '',
        password: '',
        host: '',
        port: 3306,
        dialect: 'mysql',
        operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }        
};
const NETWORKS = {
    1: {
        name: "mainnet",
        ws_provider: 'wss://mainnet.infura.io/ws',
    },
    3: {
        name: "ropsten",
        ws_provider: 'wss://ropsten.infura.io/ws',
    },
    42: {
        name: "kovan",
        ws_provider: 'wss://kovan.infura.io/ws',
    }
};

module.exports = {
    DB: DB,
    NETWORKS: NETWORKS
};