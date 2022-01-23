
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