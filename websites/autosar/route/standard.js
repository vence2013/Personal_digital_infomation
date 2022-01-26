const Router = require('koa-router');
var router = new Router();


router.get('/', async (ctx)=>{
    await ctx.render('websites/autosar/view/standard.html'); 
});

router.get('/query', async (ctx)=>{
    const StandardCtrl = ctx.controls['autosar/standard'];
    
    /* 提取有效参数 */
    var req2  = ctx.query;
    let id = req2.id ? req2.id : '';

    var res = await StandardCtrl.query(ctx, req2.size, id);
    ctx.body = {'error': 0, 'message': res};
})

router.get('/info/:stdid', async (ctx)=>{
    const StandardCtrl = ctx.controls['autosar/standard'];
    
    /* 提取有效参数 */
    let req2= ctx.params;
    let stdid= req2.stdid;

    let res = await StandardCtrl.info(ctx, stdid);

    ctx.body = {'error': 0, 'message': res};
})


router.post('/:stdid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['autosar/document'];
    const StandardCtrl = ctx.controls['autosar/standard'];
    let ret, msg = '文档编辑失败，请联系管理员！';

    /* 提取有效参数 */
    var req = ctx.request.body;
    var req2= ctx.params;
    let stdid= req2.stdid ? req2.stdid : 0;

    /* 获取有效参数 */
    let docid = /^\d+$/.test(req.docid) ? parseInt(req.docid) : 0;
    let type = req.type ? req.type : '';
    let rationale = req.rationale ? req.rationale : '';
    let usecase = req.usecase ? req.usecase : '';
    let applies_to = req.applies_to ? req.applies_to : '';
    let supporting_material = req.supporting_material ? req.supporting_material : '';
    let dependencies = req.dependencies ? req.dependencies : '';
    //console.log('route', stdid, docid, req.title, req.description, type, rationale, usecase, applies_to, supporting_material, dependencies);

    /* 检查documnetid是否有效 */
    let docIns, docid2 = 0;
    if (docid)
        docIns = await DocumentCtrl.info(ctx, docid);
    if (docIns)
        docid2 = docIns.get({plain:true}).id;
    else
        msg = '文档ID无效！';

    if (docid2 && stdid && req.title && req.description)
    {
        ret = await StandardCtrl.edit(ctx, stdid, docid2, req.title, req.description, 
            type, rationale, usecase, applies_to, supporting_material, dependencies);
        /* 添加关联 */
        await StandardCtrl.setDependencies(ctx, ret, dependencies);
    }

    ctx.body = {'error': ret ? 0 : -1, 'message': msg};
});

router.delete('/:stdid', async (ctx) =>
{
    const StandardCtrl = ctx.controls['autosar/standard'];

    var req2 = ctx.params;
    var stdid = req2.stdid;
    
    await StandardCtrl.delete(ctx, stdid);

    ctx.body = {'error': 0, 'message': 'SUCCESS'};
});


module.exports = router;