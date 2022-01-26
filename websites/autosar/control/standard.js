

exports.edit = async (ctx, stdid, docid, title, description, type, rationale, usecase, 
                        applies_to, supporting_material) =>
{
    const Standard = ctx.models['autosar/autosar_standard'];
    let ins;

    //console.log(stdid, docid, title, description, type, rationale, usecase, applies_to, supporting_material);
    ins = await Standard.findOne({logging: false, where: {'id':stdid} });
    if (ins)
    {
        await ins.update({
            'docid': docid, 'title':title, 'description':description, 'type':type, 'rationale':rationale,
            'usecase':usecase, 'applies_to':applies_to, 'supporting_material':supporting_material
            }, {logging:false});
    } else {
        ins = await Standard.create(
            {'id':stdid, 'docid': docid, 'title':title, 'description':description, 'type':type, 'rationale':rationale,
             'usecase':usecase, 'applies_to':applies_to, 'supporting_material':supporting_material}, 
            {logging:false});
    }

    return ins.get({plain: true}).id;
}

exports.setDependencies = async (ctx, stdid, dependencies) =>
{
    const Document = ctx.models['autosar/autosar_document'];
    const Standard = ctx.models['autosar/autosar_standard'];
    const StandardDependency = ctx.models['autosar/autosar_standard_dependency'];

    /* 获取标准信息 */
    let std = await Standard.findOne({'where': {'id':stdid}, 'raw':true, logging:false});
    if (!std) return;

    /* 根据标准信息，获取文档信息（.part_of_release） */
    let doc = await Document.findOne({'where': {'id':std.docid}, 'raw':true, logging:false});
    /* 清除之前的关联信息（part_of_release, id） */
    await StandardDependency.destroy({where: {'id': stdid, 'part_of_release':doc.part_of_release}, logging:false});

    /* 添加关联信息 */
    if (dependencies)
    {
        let arr = dependencies.replace(/\s*/g,"").split(',');
        let objs = arr.map((x)=>{ return {'part_of_release':doc.part_of_release, 'id':stdid, 'dependency':x}});

        await StandardDependency.bulkCreate(objs); // , {logging: false}
    }
}

exports.query = async (ctx, size, id) =>
{
    const Standard = ctx.models['autosar/autosar_standard'];
    vsize = parseInt(size) ? parseInt(size) : 20;
    let cond = {'raw': true, 'logging': false, 'offset':0, 'limit': vsize,
                'order':[['createdAt', 'DESC']], 'where': {}};

    if (id)
        cond['where']['id'] = {[Op.like]: '%'+id+'%'};

    var total = await Standard.count(cond);
    var list = await Standard.findAll(cond);

    return {'total':total, 'list':list};
}

exports.info = async (ctx, stdid) =>
{
    const Standard = ctx.models['autosar/autosar_standard'];
    const StandardDependency = ctx.models['autosar/autosar_standard_dependency'];

    let ret = await Standard.findOne({where: {'id':stdid}, raw:true, logging: false});
    if (ret) {
        ret['title'] = ret.title.toString();
        ret['description'] = ret.description.toString();
        ret['rationale'] = ret.rationale.toString();
        ret['usecase'] = ret.usecase.toString();
    }

    /* 获取关联信息 */
    let dependencies = await StandardDependency.findAll({where:{'id':stdid}, raw:true, logging:false});
    let str = '';
    dependencies.map((x)=>{ str += x.dependency + ',';});
    ret['dependencies'] = str.substr(0, str.length-1);

    return ret;
}

exports.delete = async(ctx, stdid)=>{
    const Standard = ctx.models['autosar/autosar_standard'];

    // 文件有效， 且创建者为当前用户
    await Standard.destroy({logging: false, 'where': {'id': stdid}});
}