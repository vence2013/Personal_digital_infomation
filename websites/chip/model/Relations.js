exports.link = async (models)=>{
    // 芯片/模块/寄存器/位组的关系
/*
    models['ChipModule'].belongsTo(models['Chip'], {onDelete: 'CASCADE'});
    models['ChipRegister'].belongsTo(models['ChipModule'], {onDelete: 'CASCADE'});    
    models['ChipBitgroup'].belongsTo(models['ChipRegister'], {onDelete: 'CASCADE'}); 
    */
}
