exports.link = async (models)=>{
    // 目录 - 文档
    models['category/category'].belongsToMany(models['document/document'], {through: 'CategoryDocument'});
    models['document/document'].belongsToMany(models['category/category'], {through: 'CategoryDocument'});

    // 目录 - 文件
    models['category/category'].belongsToMany(models['file/file'], {through: 'CategoryFile'});
    models['file/file'].belongsToMany(models['category/category'], {through: 'CategoryFile'});    
}