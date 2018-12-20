const Sequelize = require('sequelize');
var config = require("../config.js");

/* create a connection string from the config file */
const sequelize = new Sequelize(config.databaseOptions.database, config.databaseOptions.username, config.databaseOptions.password, {
  host: config.databaseOptions.host,
  port: config.databaseOptions.port,
  dialect: config.databaseOptions.dialect,
  operatorsAliases: config.databaseOptions.operatorsAliases,
  pool: config.databaseOptions.pool
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
  'Organization',
  'Service',
  'ServiceTags',
  'Channel',
  'ServiceEndpoint',
  'ServiceGroup',
  'ServiceMetaData',
  'RegistryEventsRaw',
  'MPEEventsRaw'
];

models.forEach(function (model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model + 'Model');
});

/* describe relationships */
(function (m) {
  m.Service.hasMany(m.ServiceTags, {
    allowNull: false
  });
})(module.exports);

module.exports.sequelize = sequelize;
