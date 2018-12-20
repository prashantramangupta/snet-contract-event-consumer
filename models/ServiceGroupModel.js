/**
 * Create a Model with the Entities in the Database
 * Service Group Model 
 */

module.exports = (sequelize, DataTypes) => {
    var ServiceGroupModel = sequelize.define('ServiceGroupModel', {
        row_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        service_id: DataTypes.INTEGER,
        group_name: DataTypes.STRING,
        group_id: DataTypes.INTEGER,
        payment_address: DataTypes.STRING,
        row_created: DataTypes.STRING,
        row_updated: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        freezeTableName: true,
        timestamps: false,
        tableName: 'service_group'
    });
    return ServiceGroupModel;
}