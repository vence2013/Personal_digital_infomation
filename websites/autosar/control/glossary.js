
exports.edit = async (ctx, termid, docid, term, definition, initiator, 
                        further_explanation, comment, example, reference) =>
{
    const Glossary = ctx.models['autosar/autosar_glossary'];
    let ins;

    //console.log(termid, docid, term, definition, initiator, further_explanation, comment, example, reference);
    if (termid) {
        ins = await Glossary.findOne({logging: false, 
            where: {'id':termid}
        });
        if (!ins) 
            return -1; // 无效文档

        await ins.update({
            'docid': docid, 'term':term, 'definition':definition, 'initiator':initiator, 'further_explanation':further_explanation,
            'comment':comment, 'example':example, 'reference':reference
        }, {logging:false});
    } else {
        [ins, created] = await Glossary.findOrCreate({
            where: {'docid':docid, 'term':term}, 
            defaults:{
                'definition':definition, 'initiator':initiator, 'further_explanation':further_explanation,
                'comment':comment, 'example':example, 'reference':reference
            }, logging:false
        });
        termid = ins.get({plain: true}).id;
    }

    return termid;
}

exports.query = async (ctx, size, term) =>
{
    const Glossary = ctx.models['autosar/autosar_glossary'];
    vsize = parseInt(size) ? parseInt(size) : 20;
    let cond = {'raw': true, 'logging': false, 'offset':0, 'limit': vsize,
                'order':[['createdAt', 'DESC']], 'where': {}};

    if (term)
        cond['where']['term'] = {[Op.like]: '%'+term+'%'};

    var total = await Glossary.count(cond);
    var list = await Glossary.findAll(cond);

    return {'total':total, 'list':list};
}

exports.info = async (ctx, termid) =>
{
    const Glossary = ctx.models['autosar/autosar_glossary'];

    let ret = await Glossary.findOne({'where': {'id':termid}, 'logging': false});
    if (ret) {
        ret['definition'] = ret.definition.toString();
        ret['further_explanation'] = ret.further_explanation.toString();
        ret['comment'] = ret.comment.toString();
        ret['example'] = ret.example.toString();
    }

    return ret;
}

exports.delete = async(ctx, termid)=>{
    const Glossary = ctx.models['autosar/autosar_glossary'];

    // 文件有效， 且创建者为当前用户
    await Glossary.destroy({logging: false, 'where': {'id': termid}});
}