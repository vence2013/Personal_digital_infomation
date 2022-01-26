module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AUTOSAR_Standard', 
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        }, 
        docid: {
            type: DataTypes.STRING(255),
            primaryKey: true,            
            allowNull: false,
        },
        title: {
            type: DataTypes.BLOB,
            allowNull: false
        }, 
        description: {
            type: DataTypes.BLOB,
        }, 
        type: {
            type: DataTypes.STRING(255),
        }, 
        rationale: {
            type: DataTypes.BLOB,
        }, 
        usecase: {
            type: DataTypes.BLOB,
        }, 
        applies_to: {
            type: DataTypes.STRING(255), 
        },
        supporting_material: {
            type: DataTypes.STRING(255), 
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}