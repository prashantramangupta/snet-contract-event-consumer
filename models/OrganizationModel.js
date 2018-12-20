/**
 * Create a Model with the Entities in the Database
 * Organization Model 
 */

module.exports = (sequelize, DataTypes) => {
    var OrganizationModel = sequelize.define('OrganizationModel', {
        row_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        org_id: DataTypes.STRING,
        organization_name: DataTypes.STRING,
        owner_address: DataTypes.STRING,
        row_created: 'TIMESTAMP',
        row_updated: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        freezeTableName: true,
        timestamps: false,
        tableName: 'organization'
    });
    return OrganizationModel;
}