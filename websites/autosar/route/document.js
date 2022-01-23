const Router = require('koa-router');
var router = new Router();


router.get('/', async (ctx)=>{
    await ctx.render('websites/autosar/view/document.html'); 
});

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
    if (req.title && req.no)
        ret = await DocumentCtrl.edit(ctx, docid, req.title, req.no, status, part_of_standard, part_of_release, intro);

    if (ret > 0)  ctx.body = {'error':  0, 'message': ret};
    else          ctx.body = {'error': -1, 'message': '文档编辑失败，请联系管理员！'};
});

module.exports = router;