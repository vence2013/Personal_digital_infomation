# install
1. 为了方便开发，在windows环境开发，在linux环境运行。
    * 安装vbox虚拟机，并设置共享文件（自动挂载，并设置挂载点/home/w/shares）。
    * 更新使用国内的源
    * 在ubuntu上安装ssh服务器，并启动。方便通过windows的ssh工具控制

2. 安装docker，
使用脚本安装：[Install Docker Engine on Ubuntu > Install using the convenience script](https://docs.docker.com/engine/install/ubuntu/)
~~~
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker wxb
~~~
退出后重新登录。

3. 安装docker-compose
[Install Compose on Linux systems](https://docs.docker.com/compose/install/)
~~~
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
docker-compose --version
~~~

如果无法直接下载，可以从github下载文件后复制到指定目录
~~~
sudo cp docker-compose-linux-x86_64 /usr/bin/docker-compose
sudo chmod +x /usr/bin/docker-compose
~~~

4. 使用dockerhub国内源。
[docker使用国内仓库](https://blog.csdn.net/luoqinglong850102/article/details/108438248)
    * 新建配置文件：/etc/docker/daemon.json，加入以下内容：
    ~~~
    {
        "registry-mirrors": ["http://hub-mirror.c.163.com"]
    }
    ~~~
    * 配置好后，重启docker
    ~~~
    systemctl daemon-reload
    systemctl restart docker
    ~~~

5. 为了初始化npm，需要在虚拟机安装nodejs
[Ubuntu20.04 通过 apt 方式（命令行）安装nodeJs](https://www.jianshu.com/p/0bc90bef3a2a)，官网参考：[NodeSource Node.js Binary Distributions](https://github.com/nodesource/distributions/blob/master/README.md#debinstall)
~~~
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
~~~

### 临时禁止IPV6
~~~
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
sudo sysctl -w net.ipv6.conf.lo.disable_ipv6=1
~~~

## 安装
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
node modules
~~~
npm cache clean --force
~~~

#### 改善访问github
更改配置
~~~
git config --global url."https://github.com.cnpmjs.org/".insteadOf "https://github.com/"
~~~
