const Sequelize = require('sequelize');
var config = require("../config.js");

/* create a connection string from the config file */
var netId = process.argv.slice(2)[0]
const dbParams = config.DB[netId]
const sequelize = new Sequelize(dbParams.database, dbParams.username, dbParams.password, {
  host: dbParams.host,
  port: dbParams.port,
  dialect: dbParams.dialect,
  operatorsAliases: dbParams.operatorsAliases,
  pool: dbParams.pool,
  logging: false
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

/* load models */
var models = [
  'RegistryEventsRaw',
  'MPEEventsRaw',
  'RFAIEventsRaw'
];

models.forEach(function (model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model + 'Model');
});

module.exports.sequelize = sequelize;
