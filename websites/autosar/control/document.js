const Op = require('sequelize').Op; 


exports.edit = async (ctx, docid, title, no, status, part_of_standard, part_of_release, intro)=>{
    const Document = ctx.models['autosar/autosar_document'];

    if (docid) {
        var docIns = await Document.findOne({logging: false, 
            where: {'id':docid}
        });
        if (!docIns) 
            return -1; // 无效文档

        await docIns.update({
            'title':title, 'identification_no':no, 'status':status, 'part_of_standard':part_of_standard,
            'part_of_release':part_of_release, 'introduce':intro
        }, {logging:false});
    } else {
        var [docIns, created] = await Document.findOrCreate({logging: false,
            where: {'title':title, 'identification_no':no, 'status':status, 'part_of_standard':part_of_standard,
                    'part_of_release':part_of_release, 'introduce':intro}
        });
        docid = docIns.get({plain: true}).id;
    }

    return docid;
}

exports.query = async (ctx, size, title, identification_no, status, part_of_standard, part_of_release) =>
{
    const Document = ctx.models['autosar/autosar_document'];
    vsize = parseInt(size) ? parseInt(size) : 20;
    let cond = {'raw': true, 'logging': false, 'offset':0, 'limit': vsize,
                'order':[['createdAt', 'DESC']], 'where': {}};

    if (title)
        cond['where']['title'] = {[Op.like]: '%'+title+'%'};
    if (identification_no)
        cond['where']['identification_no'] = identification_no;
    if (status)
        cond['where']['status'] = status;
    if (part_of_standard)
        cond['where']['part_of_standard'] = part_of_standard;
    if (part_of_release)
        cond['where']['part_of_release'] = part_of_release;

    var total = await Document.count(cond);
    var list = await Document.findAll(cond);

    return {'total':total, 'list':list};
}

/* all supported: status, part_of_standard, part_of_release */
exports.extquery = async (ctx) =>
{
    const Document = ctx.models['autosar/autosar_document'];
    let ret

    ret = await Document.findAll({'group':'status', 'attributes':['status'], 'logging':false, 'raw':true});
    let supported_status = ret.map((x)=>{ return x.status; });
    ret = await Document.findAll({'group':'part_of_standard', 'attributes':['part_of_standard'], 'logging':false, 'raw':true});
    let supported_part_of_standard = ret.map((x)=>{ return x.part_of_standard; });
    ret = await Document.findAll({'group':'part_of_release', 'attributes':['part_of_release'], 'logging':false, 'raw':true});
    let supported_part_of_release = ret.map((x)=>{ return x.part_of_release; });

    return {'status':supported_status, 'part_of_standard':supported_part_of_standard, 'part_of_release':supported_part_of_release};
}

exports.info = async (ctx, docid) =>
{
    const Document = ctx.models['autosar/autosar_document'];

    let ret = await Document.findOne({'where': {'id':docid}, 'logging': false});
    if (ret)
        ret['introduce'] = ret.introduce.toString();

    return ret;
}

exports.delete = async(ctx, docid)=>{
    const Document = ctx.models['autosar/autosar_document'];

    // 文件有效， 且创建者为当前用户
    await Document.destroy({logging: false, 'where': {'id': docid}});
}