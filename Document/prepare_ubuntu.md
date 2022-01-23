# Prepare Ubuntu
更新国内源
1. 备份原来的/etc/apt/sources.list，并替换为下面的内容
~~~
deb http://mirrors.163.com/ubuntu/ xenial main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ xenial-security main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ xenial-updates main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ xenial-proposed main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ xenial-backports main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ xenial main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ xenial-security main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ xenial-updates main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ xenial-proposed main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ xenial-backports main restricted universe multiverse
~~~

2. 更新系统
~~~
sudo apt-get update
~~~

## 基础软件
### 1. 安装ssh & git
安装并开启ssh服务
~~~
sudo apt-get install openssh-server git 
sudo systemctl enable ssh.service
~~~

### 2. 安装samba
数据主要存放在ubuntu中，由ubuntu进行提交。在windows编辑开发。

1. 安装samba软件
~~~
sudo apt-get install openssh-server
~~~

2. 在配置文件/etc/samba/smb.conf添加以下内容
~~~
[samba]
    path=/home/wxb/samba
    create mask = 077
    directory mask = 077
    valid users = wxb
    force user = nobody
    force group = nogroup
    public = yes
    writable = yes
~~~

3. 创建samba共享目录/home/wxb/samba，并更新权限
4. 设置samba账户密码（使用一个ubuntu账户）
~~~
sudo smbpasswd -a wxb
~~~
5. 重启samba服务后测试
~~~
sudo systemctl restart smbd.service
~~~

### 3. 克隆代码
本地生成ssh-key，并添加到github中


## 专用软件
需要使用的基础软件包括curl。

为了初始化nodejs/npm命令，需要在虚拟机安装nodejs
~~~
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
~~~
> [Ubuntu20.04 通过 apt 方式（命令行）安装nodeJs](https://www.jianshu.com/p/0bc90bef3a2a)，官网参考：[NodeSource Node.js Binary Distributions](https://github.com/nodesource/distributions/blob/master/README.md#debinstall)

在下载软件时，IPV6导致网络卡死。所以需要禁用IPV6。将下列信息添加到/etc/sysctl.conf中。
~~~
net.ipv6.conf.all.disable_ipv6=1
net.ipv6.conf.default.disable_ipv6=1
net.ipv6.conf.lo.disable_ipv6=1
~~~
要使设置生效，请使用：
~~~
sudo sysctl -p
~~~


### docker & docker-compose
1. 使用脚本安装Docker：修改用户组后，登出后重新登录生效。
~~~
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker wxb
~~~
> [Install Docker Engine on Ubuntu > Install using the convenience script](https://docs.docker.com/engine/install/ubuntu/)

2. 安装docker-compose：由于curl下面很慢，直接从网页下载后复制到指定目录。
~~~
sudo cp docker-compose-linux-x86_64 /usr/bin/docker-compose
sudo chmod +x /usr/bin/docker-compose
docker-compose --version
~~~
> [Install Compose on Linux systems](https://docs.docker.com/compose/install/)

3. 使用dockerhub国内源。
    * 新建配置文件：/etc/docker/daemon.json，加入以下内容：
~~~
{
    "registry-mirrors": ["http://hub-mirror.c.163.com"]
}
~~~
    * 配置好后，重启docker
~~~
sudo systemctl daemon-reload
sudo systemctl restart docker
~~~
> [docker使用国内仓库](https://blog.csdn.net/luoqinglong850102/article/details/108438248)