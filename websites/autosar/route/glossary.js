const Router = require('koa-router');
var router = new Router();


router.get('/', async (ctx)=>{
    await ctx.render('websites/autosar/view/glossary.html'); 
});

router.get('/query', async (ctx)=>{
    const GlossaryCtrl = ctx.controls['autosar/glossary'];
    
    /* 提取有效参数 */
    var req2  = ctx.query;
    let term = req2.term ? req2.term : '';

    var res = await GlossaryCtrl.query(ctx, req2.size, term);
    ctx.body = {'error': 0, 'message': res};
})

router.get('/info/:termid', async (ctx)=>{
    const GlossaryCtrl = ctx.controls['autosar/glossary'];
    
    /* 提取有效参数 */
    let req2= ctx.params;
    let termid= parseInt(req2.termid);

    let res = await GlossaryCtrl.info(ctx, termid);

    ctx.body = {'error': 0, 'message': res};
})

router.post('/:termid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['autosar/document'];
    const GlossaryCtrl = ctx.controls['autosar/glossary'];
    let ret, msg = '文档编辑失败，请联系管理员！';

    /* 提取有效参数 */
    var req = ctx.request.body;
    var req2= ctx.params;
    let termid= /^\d+$/.test(req2.termid) ? parseInt(req2.termid) : 0;

    /* 获取有效参数 */
    let docid = /^\d+$/.test(req.docid) ? parseInt(req.docid) : 0;
    let initiator = req.initiator ? req.initiator : '';
    let further_explanation = req.further_explanation ? req.further_explanation : '';
    let comment = req.comment ? req.comment : '';
    let example = req.example ? req.example : '';
    let reference = req.reference ? req.reference : '';

    /* 检查documnetid是否有效 */
    let docIns, docid2 = 0;
    if (req.docid)
        docIns = await DocumentCtrl.info(ctx, docid);
    if (docIns)
        docid2 = docIns.get({plain:true}).id;
    else
        msg = '文档ID无效！';
        
    if (req.term && req.definition && docid2)
        ret = await GlossaryCtrl.edit(ctx, termid, docid2, req.term, req.definition, 
            initiator, further_explanation, comment, example, reference);

    ctx.body = {'error': ret ? 0 : -1, 'message': msg};
});

router.delete('/:termid', async (ctx)=>{
    const GlossaryCtrl = ctx.controls['autosar/glossary'];

    var req2 = ctx.params;
    var termid = parseInt(req2.termid);
    
    await GlossaryCtrl.delete(ctx, termid);

    ctx.body = {'error': 0, 'message': 'SUCCESS'};
});


module.exports = router;