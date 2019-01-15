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
        infura_ws: 'wss://mainnet.infura.io/ws',
    },
    3: {
        name: "Ropsten",
        infura_ws: 'wss://ropsten.infura.io/ws',
    },
    42: {
        name: "Kovan",
        infura_ws: 'wss://kovan.infura.io/ws',
    }
};

module.exports = {
    DB: DB,
    NETWORKS: NETWORKS
};