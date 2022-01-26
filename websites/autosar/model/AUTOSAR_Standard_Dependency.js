module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AUTOSAR_Standards_Dependency', 
    {
        part_of_release: {
            type: DataTypes.STRING(255),
            primaryKey:true,
            allowNull:false,
        }, 
        id: {
            type: DataTypes.STRING(255),
            primaryKey:true,
            allowNull:false,
        },
        dependency: {
            type: DataTypes.STRING(255),
            primaryKey:true,
            allowNull:false
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}