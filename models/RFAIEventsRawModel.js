/**
 * Create a Model with the Entities in the Database
 * RFAIEventsRaw Model 
 */

module.exports = (sequelize, DataTypes) => {
    var RFAIEventsRawModel = sequelize.define('RFAIEventsRawModel', {
        row_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        block_no: DataTypes.INTEGER,
        event: DataTypes.TEXT,
        json_str: DataTypes.TEXT,
        processed: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            allowNull: false
            
        },
        row_updated: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        row_created: DataTypes.STRING
    }, {
        freezeTableName: true,
        timestamps: false,
        tableName: 'rfai_events_raw'
    });
    return RFAIEventsRawModel;
}