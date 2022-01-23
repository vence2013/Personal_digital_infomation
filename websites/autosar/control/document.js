
exports.edit = async (ctx, docid, title, no, status, part_of_standard, part_of_release, intro)=>{
    const Document = ctx.models['autosar/autosar_document'];

    console.log(docid, title, no);
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

exports.query = async (ctx, info) =>
{
    const Document = ctx.models['autosar/autosar_document'];
    let size = parseInt(info.size) ? parseInt(info.size) : 20;
    let cond = {'raw': true, 'logging': false, 'offset':0, 'limit': size,
                'order':[['createdAt', 'DESC']], 'where': {}};

    if (info.title)
        cond['where']['title'] = {[Op.like]: '%'+info.title+'%'};
    if (info.no)
        cond['where']['identification_no'] = info.no;
    if (info.status)
        cond['where']['status'] = info.status;
    if (info.part_of_standard)
        cond['where']['part_of_standard'] = info.part_of_standard;
    if (info.part_of_release)
        cond['where']['part_of_release'] = info.part_of_release;

    var total = await Document.count(cond);
    var list = await Document.findAll(cond);

    return {'total':total, 'list':list};
}