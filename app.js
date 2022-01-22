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
const Sequelize = require('sequelize');


const certs_dir="Runtime/Certificate/";
const certs = {
    key : fs.readFileSync(certs_dir+'server-key.pem'),
    ca  : fs.readFileSync(certs_dir+'ca-cert.pem'),
    cert: fs.readFileSync(certs_dir+'server-cert.pem')
}

global.envfile = 'Cfg_setup';
const cfg = require('dotenv').config({ path: envfile }).parsed;
const Project = cfg.TITLE+'-v'+cfg.VERSION_MAJOR+'.'+cfg.VERSION_MINOR;
const Host_mysql = Project+'_mariadb';

/* ---------------------------- 基础功能函数 ------------------------------------- */

/* 连接数据库 */
function connect_database()
{
    // 数据库连接
    var sequelize = new Sequelize(Project, 'root', cfg.MYSQL_ROOT_PASSWORD, 
        { host: Host_mysql, dialect: 'mysql', pool: { max: 5, min: 0, acquire: 30000, idle: 10000 } }
    );
    app.context.sequelize = sequelize;

    // 数据库连接测试
    sequelize.authenticate()
    .then(async () => {
        console.log('^_^ Successfully connected to the database.');
    })
    .catch(err => {
        console.error('^~^ Unable to connect to the database:', err);
    }); 

    return async function(ctx, next) { await next(); }
}


/* --------------------- 启动服务器 --------------------------------------------- */

var app = new Koa({ keys: ['cookie sign random: 802566 338402 994741 227937 868228']});

app
.use(StaticServer({ rootDir: 'node_modules', rootPath: '/node_modules' }))
.use(StaticServer({ rootDir: 'view', rootPath: '/view' }))
.use(StaticServer({ rootDir: '/data',      rootPath: '/data' }))
.use(Body({ multipart: true, formidable: { maxFileSize: 1024*1024*1024 } /* 单个文件小于1GB */ }))
.use(Views(__dirname, { map: {html: 'underscore'} }))
.use(Errors({ engine: 'underscore', template: 'view/errors.html' }))
.use(Logger())
.use(Session({ 
  key: 'koa:sess', maxAge: 3600000/* cookie过期时间， 毫秒*/, overwrite: true, rolling: true, 
  httpOnly: true/* 只有服务器端可以获取cookie */, signed: true/* 签名 */, renew: false
}, app))
.use(connect_database())
//.use(load_subsite());

https.createServer(certs, app.callback()).listen(443);
console.log('The Server is starting!');