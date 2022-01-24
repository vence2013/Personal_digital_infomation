const Router = require('koa-router');
var router = new Router();


router.get('/', async (ctx)=>{
    await ctx.render('websites/autosar/view/document.html'); 
});

router.get('/query', async (ctx)=>{
    const DocumentCtrl = ctx.controls['autosar/document'];
    
    /* 提取有效参数 */
    var req2  = ctx.query;
    let title = req2.title ? req2.title : '';
    let identification_no = req2.identification_no ? req2.identification_no : '';
    let status = req2.status ? req2.status : '';
    let part_of_standard = req2.part_of_standard ? req2.part_of_standard : '';
    let part_of_release = req2.part_of_release ? req2.part_of_release : '';

    var res = await DocumentCtrl.query(ctx, req2.size, title, identification_no, status, part_of_standard, part_of_release);
    ctx.body = {'error': 0, 'message': res};
})

/* 查询额外的信息：status, part_of_standard, part_of_release */
router.get('/extquery', async (ctx)=>{
    const DocumentCtrl = ctx.controls['autosar/document'];

    var res = await DocumentCtrl.extquery(ctx);
    ctx.body = {'error': 0, 'message': res};
})

router.get('/info/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['autosar/document'];
    
    /* 提取有效参数 */
    let req2= ctx.params;
    let docid= parseInt(req2.docid);

    let res = await DocumentCtrl.info(ctx, docid);

    ctx.body = {'error': 0, 'message': res};
})

router.post('/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['autosar/document'];

    /* 提取有效参数 */
    var req = ctx.request.body;
    var req2= ctx.params;
    var docid= parseInt(req2.docid);

    /* 获取有效参数 */
    let status = req.status ? req.status : '';
    let part_of_standard = req.part_of_standard ? req.part_of_standard : '';
    let part_of_release = req.part_of_release ? req.part_of_release : '';
    let intro = req.intro ? req.intro : '';

    let ret = 0;
    if (req.title && req.identification_no)
        ret = await DocumentCtrl.edit(ctx, docid, req.title, req.identification_no, status, part_of_standard, part_of_release, intro);

    if (ret > 0)  ctx.body = {'error':  0, 'message': ret};
    else          ctx.body = {'error': -1, 'message': '文档编辑失败，请联系管理员！'};
});

router.delete('/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['autosar/document'];

    var req2 = ctx.params;
    var docid = parseInt(req2.docid);
    
    await DocumentCtrl.delete(ctx, docid);

    ctx.body = {'error': 0, 'message': 'SUCCESS'};
});

module.exports = router;