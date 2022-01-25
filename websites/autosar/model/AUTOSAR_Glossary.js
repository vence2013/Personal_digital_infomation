module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AUTOSAR_Glossary', 
    {
        docid: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        term: {
            type: DataTypes.STRING(255),
            allowNull: false
        }, 
        definition: {
            type: DataTypes.BLOB,
            allowNull: false
        }, 
        initiator: {
            type: DataTypes.STRING(255),
        }, 
        further_explanation: {
            type: DataTypes.BLOB,
        }, 
        comment: {
            type: DataTypes.BLOB,
        }, 
        example: {
            type: DataTypes.BLOB, 
        },
        reference: {
            type: DataTypes.STRING(255), 
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}