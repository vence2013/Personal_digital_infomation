const Router = require('koa-router');
var router = new Router();


router.get('/', async (ctx)=>{
    await ctx.render('website/autosar/view/index.html'); 
});


module.exports = router;