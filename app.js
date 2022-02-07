/* Native Package */
const fs    = require('fs');
const path  = require('path');
const https = require('https');

/* KOA framework & components */
const Koa     = require('koa'); // koa网页服务器框架
const Body    = require('koa-body');  // 表单数据接收
const Views   = require('koa-views'); // 显示模板引擎
const Errors  = require('koa-error');   // 错误处理
const Logger  = require('koa-logger');  // 终端日志
const Session = require('koa-session'); // 会话处理
const StaticServer = require('koa-static-server'); // 静态文件服务
/* Middleware combination */
const glob      = require('glob'); 
const compose   = require('koa-compose');
/* Database, Object Relational Mapping */
const { Sequelize, Model, DataTypes } = require('sequelize');


const certs_dir="Runtime/Certificate/";
const certs = {
    key : fs.readFileSync(certs_dir+'server-key.pem'),
    ca  : fs.readFileSync(certs_dir+'ca-cert.pem'),
    cert: fs.readFileSync(certs_dir+'server-cert.pem')
}

global.envfile = 'Cfg_setup';
global.cfg = require('dotenv').config({ path: envfile }).parsed;

const frmdir = path.join(__dirname, 'framework');
const webdir = path.join(__dirname, 'websites');


/* ---------------------------- 基础功能函数 ------------------------------------- */

function load_database(sequelize)
{
    let modeldirs   = [];

    glob.sync(webdir+"/*/").map(async (dir)=>{
        if (fs.existsSync(path.join(dir,'model')))
            modeldirs.push(path.join(dir,'model'));
    });

    app.context.models = models = [];
    /* 加载数据模型(model/ *)， 分为2步执行：
     * 1. 加载所有子网站的数据模型， 除了表示模型关系的Relations.js的所有文件。
     * 2. 加载所有子网站的模型关系
     */
    for (var i=0; i<modeldirs.length; i++) {
        fs.readdirSync(modeldirs[i])
        .filter((x)=>{ return x!='Relations.js'; })
        .forEach(async (e, idx)=>{
            let file = path.join(modeldirs[i], e);
            /* /web/websites/tag/model/Tag.js -> tag/Tag */
            let key = file.replace(/.*\/([^\/]+)\/model\/([^.]+).js/, "$1/$2").toLocaleLowerCase();

            if (fs.statSync(file).isFile())
                models[ key ] = require(file)(sequelize, DataTypes);
        })
    }

    // 导入数据模型的关系
    for (var i=0; i<modeldirs.length; i++) {
        let file = modeldirs[i]+'/Relations.js';
        if (fs.existsSync(file))
            require(file).link(models, sequelize);
    }
    //console.log(models);

    // 同步到数据库
    sequelize.sync({logging: false}); 
}

/* 连接数据库 */
function connect_database()
{
    // 数据库连接
    var sequelize = new Sequelize(cfg.TITLE, 'pi', "12345678", 
        { host: "localhost", dialect: 'mysql', pool: { max: 5, min: 0, acquire: 30000, idle: 10000 } }
    );
    app.context.sequelize = sequelize;
    //console.log('aa', sequelize);

    // 数据库连接测试
    sequelize.authenticate()
    .then(async () => {
        load_database( sequelize );
        console.log('^_^ Successfully connected to the database.');
    })
    .catch(err => {
        console.error('^~^ Unable to connect to the database:', err);
    }); 

    return async function(ctx, next) { await next(); }
}

/* 加载子网站 */
function load_websites()
{
    var routedirs   = [ path.join(frmdir, 'route') ],
        controldirs = [ path.join(frmdir, 'control') ];        

    /* 加载固定静态资源 */
    app
    .use(StaticServer({ rootDir: '/data', rootPath: '/data'}))
    .use(StaticServer({ rootDir: "framework/view", rootPath: '/view'}))
    .use(StaticServer({ rootDir: 'node_modules', rootPath: '/node_modules'}))
    .use(StaticServer({ rootDir: 'bower_components', rootPath: '/bower_components'}))

    glob.sync(webdir+"/*/").map(async (dir)=>{
        // 加载静态资源(view/ *)
        if (fs.existsSync(path.join(dir, 'view')))
            app.use(StaticServer({ rootDir: path.join(dir, 'view'), rootPath: '/'+path.parse(dir).base+'/view' }))

        /* 搜集route, control的目录 */
        if (fs.existsSync(path.join(dir,'route')))
            routedirs.push(path.join(dir,'route'));
        if (fs.existsSync(path.join(dir,'control')))
            controldirs.push(path.join(dir,'control'));
    });

    /* 加载控制文件(control/ *)，包括根目录的控制文件和子网站的控制文件 */
    app.context.controls = controls = [];
    for (var i=0; i<controldirs.length; i++) {
        glob.sync(controldirs[i]+"/*.js").map((file)=>{
            let key = file.replace(/.*\/([^\/]+)\/control\/([^.]+).js/, "$1/$2").toLocaleLowerCase();
            controls[ key ] = require(file);
        });
    }
    
    /* 加载路由(route/ *)  */
    var routers = [];
    for (var i=0; i<routedirs.length; i++) {
        glob.sync(routedirs[i]+"/*.js").map((file)=>{
            /* /web/framework/route/backup.js -> /backup;
             * /web/websites/category/route/edit.js -> category/edit
             */
            let url_prefix = file.replace(/.*\/([^\/]+)\/route\/([^.]+).js/, 
                    (file.indexOf(frmdir) != -1) ? "/$2" : "/$1/$2");
            /* /category/index -> /category */
            url_prefix = url_prefix.replace(/(.*\/)index$/, "$1");

            let router = require(file).prefix(url_prefix);
            routers.push(router.routes());
            routers.push(router.allowedMethods());
        });
    }

    return compose(routers);
}


/* --------------------- 启动服务器 --------------------------------------------- */

var app = new Koa({ keys: ['cookie sign random: 802566 338402 994741 227937 868228']});

app
.use(Body({ multipart: true, formidable: { maxFileSize: 1024*1024*1024 } /* 单个文件小于1GB */ }))
.use(Views(__dirname, { map: {html: 'underscore'} }))
.use(Errors({ engine: 'underscore', template: 'framework/view/errors.html' }))
.use(Logger())
.use(Session({ 
  key: 'koa:sess', maxAge: 3600000/* cookie过期时间， 毫秒*/, overwrite: true, rolling: true, 
  httpOnly: true/* 只有服务器端可以获取cookie */, signed: true/* 签名 */, renew: false
}, app))
.use(connect_database())
.use(load_websites());

https.createServer(certs, app.callback()).listen(443);
console.log('The Server is starting!');