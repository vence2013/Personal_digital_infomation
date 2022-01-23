/* 直接重启容器太慢， 还是进入终端操作。
 * 创建一个无效的服务器来保持容器运行
 */
const http = require("http");

/* 只是让容器不会停止。该端口没有导出，并且还要与导出的端口不同，否则会冲突！ */
http.createServer().listen(80);
