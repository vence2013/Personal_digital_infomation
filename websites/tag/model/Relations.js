exports.link = async (models)=>{
    // 文档
    models['tag/tag'].belongsToMany(models['document/document'], {through: 'TagDocument'});
    models['document/document'].belongsToMany(models['tag/tag'], {through: 'TagDocument'});    

    // 文件
    models['tag/tag'].belongsToMany(models['file/file'], {through: 'TagFile'});
    models['file/file'].belongsToMany(models['tag/tag'], {through: 'TagFile'});    
}