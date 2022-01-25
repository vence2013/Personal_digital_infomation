const Router = require('koa-router');
var router = new Router();


router.get('/', async (ctx)=>{
    await ctx.render('websites/autosar/view/standard.html'); 
});

module.exports = router;