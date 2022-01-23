# install

## 创建项目
以上准备就绪后，还要进行一些准备工作，否则无法安装完整。

1. 初始化npm，并安装koa测试
~~~
npm i koa
~~~

2. 执行下列脚本安装调试版本
~~~
./Runtime/Script/install-pc.sh debug
~~~

3. 安装完成后，进入docker容器
~~~
docker exec -it Personal_Digital_Information-v1.0  /bin/bash
docker restart Personal_Digital_Information-v1.0
~~~

### 安装软件
软件的安装有3种方式：
1. 需要使用-g标志的npm软件包，在install-pc.sh中安装。比如bower
~~~
npm install -g bower
~~~
> 使用-g的无法通过npm install安装！
> 引用全局模块时，需要设置NODE_PATH全局变量

2. npm软件包。在安装时使用--save标志，将会存储到package.json中。
然后在容器安装时，通过install-pc.sh中的npm install一起安装
3. bower软件包。在安装时使用--save标志，将会存储到bower.json中。
类似package.json


使用--save参数，会将软件包存储到bower.json的dependencies中。然后可以使用`bower install`安装这些软件包。
~~~
bower install --save angular
~~~

#### NPM报错 Error: EPERM: operation not permitted, unlink......的解决办法
~~~
npm cache clean --force
~~~

#### 改善访问github
更改配置
~~~
git config --global url."https://github.com.cnpmjs.org/".insteadOf "https://github.com/"
~~~
