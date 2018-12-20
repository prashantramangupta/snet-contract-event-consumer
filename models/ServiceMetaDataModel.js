/**
 * Create a Model with the Entities in the Database
 * Service MetaData Model 
 */

module.exports = (sequelize, DataTypes) => {
    var ServiceMetaDataModel = sequelize.define('ServiceMetaDataModel', {
        row_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        service_id: DataTypes.INTEGER,
        price_model: DataTypes.STRING,
        price: DataTypes.STRING,
        display_name: DataTypes.STRING,
        model_ipfs_hash: DataTypes.STRING,
        encoding: DataTypes.STRING,
        type: DataTypes.STRING,
        mpe_address: DataTypes.STRING,
        row_created: DataTypes.STRING,
        row_updated: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        freezeTableName: true,
        timestamps: false,
        tableName: 'service_metadata'
    });
    return ServiceMetaDataModel;
}