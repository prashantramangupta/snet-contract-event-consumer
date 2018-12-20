/**
 * Create a Model with the Entities in the Database
 * Service Endpoint Model 
 */

module.exports = (sequelize, DataTypes) => {
    var ServiceEndpointModel = sequelize.define('ServiceEndpointModel', {
        row_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        service_id: DataTypes.INTEGER,
        group_name: DataTypes.STRING,
        endpoint: DataTypes.STRING,
        row_created: DataTypes.STRING,
        row_updated: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        freezeTableName: true,
        timestamps: false,
        tableName: 'service_endpoint'
    });
    return ServiceEndpointModel;
}