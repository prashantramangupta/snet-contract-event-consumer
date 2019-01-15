/**
 * Create a Model with the Entities in the Database
 * MPEEventsRaw Model 
 */

module.exports = (sequelize, DataTypes) => {
    var MPEEventsRawModel = sequelize.define('MPEEventsRawModel', {
        row_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        block_no: DataTypes.INTEGER,
        event: DataTypes.TEXT,
        transactionHash: DataTypes.STRING,
        logIndex: DataTypes.INTEGER,        
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
        tableName: 'mpe_events_raw'
    });
    return MPEEventsRawModel;
}