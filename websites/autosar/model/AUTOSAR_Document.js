module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AUTOSAR_Document', 
    {
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        }, 
        identification_no: {
            type: DataTypes.INTEGER(10),
            allowNull: false
        }, 
        status: {
            type: DataTypes.STRING(255),
        }, 
        part_of_standard: {
            type: DataTypes.STRING(255),
        }, 
        part_of_release: {
            type: DataTypes.STRING(255),
        }, 
        introduce: {
            type: DataTypes.BLOB, 
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}