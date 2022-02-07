# Prepare Raspberry Pi
> RPI安装mariadb并配置，web使用docker容器。

## 安装raspios
1. 格式化SD卡
2. 安装os（2022-01-28-raspios-bullseye-armhf-lite），并扩展磁盘空间
[树莓派扩展磁盘空间](https://blog.csdn.net/xujgcn/article/details/79554915)
3. 配置系统并启动
配置wifi（/boot/wpa_supplicant.conf），ssh（/boot/ssh）
[无屏幕和键盘配置树莓派WiFi和SSH](https://shumeipai.nxez.com/2017/09/13/raspberry-pi-network-configuration-before-boot.html)

4. 更新国内源（保留原来的源，国内源可能不健全导致有些软件包无法安装，比如samba）
/etc/apt/sources.list
~~~
deb http://mirrors.aliyun.com/raspbian/raspbian/ bullseye main non-free contrib rpi
deb-src http://mirrors.aliyun.com/raspbian/raspbian/ bullseye main non-free contrib rpi
~~~
/etc/apt/sources.list.d/raspi.list
~~~
deb http://mirrors.aliyun.com/raspberrypi/ bullseye main
deb-src http://mirrors.aliyun.com/raspberrypi/ bullseye main
~~~
更新
~~~
sudo apt-get update
~~~
> 如果出错
> apt-get update 公钥问题：由于没有公钥，无法验证下列签名： NO_PUBKEY 9165938D90FDDD2E
> ~~~
> sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 9165938D90FDDD2E
> ~~~

4. 安装samba，参考prepare_ubuntu。
~~~
sudo apt-get install samba samba-common
~~~

## 安装基础软件
git, docker, docker-compose, 

### mariadb
1. 安装并配置mariadb：设置ROOT密码，不允许远程登录。
~~~
sudo apt-get install mariadb-server
sudo mysql_secure_installation
~~~
> [树莓派安装使用数据库MariaDB (MySQL)](https://blog.csdn.net/chentuo2000/article/details/108702880)

2. 修改配置，运行远程访问。配置文件/etc/mysql
~~~
$ sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
bind-address            = 0.0.0.0
$ sudo systemctl restart mysql
~~~
> [树莓派安装mariadb（mysql）后只能本机访问的解决方法，3306不能远程连接](https://blog.csdn.net/zrtchp/article/details/82356393)

3. 添加用户及数据库
~~~
mysql -uroot -p < Runtime/Copy/mariadb_init.sql
~~~
