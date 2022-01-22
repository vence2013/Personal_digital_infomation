#!/bin/bash
# 基于Docker安装网页服务器

# 配置
Cfg_file="Cfg_setup"
Docker_image_node="node:16.13.2-buster"
Docker_image_mysql="mysql:5.5"


# 全局数据
export Root_dir="$( cd "$( dirname "$0" )/../../" && pwd  )"
export Data_dir=$Root_dir/Datas

# 软件：docker-ce(>18.x), docker-compose(at least v2)
CheckSoftware()
{
    echo "检查依赖软件的安装..."

    v_docker=$(docker -v 2>&1)
    v_docker1=$(echo $v_docker | sed 's/[^0-9]*\([0-9\.]*\).*/\1/' | cut -d \. -f 1)
    if [[ ${v_docker:0:6} != "Docker" ]] || [[ ${v_docker1} -lt 17 ]]; then
        echo "错误：请安装18.x以上版本的Docker！"
        exit
    fi

    v_dc=$(docker-compose -v 2>&1)
    v_dc1=$(echo $v_dc | sed 's/[^0-9]*\([0-9\.]*\).*/\1/')
    v_dcmajor=`echo ${v_dc1}|cut -d \. -f 1`
    v_dcmimor=`echo ${v_dc1}|cut -d \. -f 2`

    if [[ ${v_dcmajor} -lt 1 ]] && [[ ${v_dcmimor} -lt 12 ]]; then
        echo "错误：请安装1.12.x版本以上的Docker-Compose！"
        exit
    fi
}

# 检查docker镜像是否存在，不存在则下载
CheckDockerImage()
{
    mysql_check=$(docker images --format "{{.Repository}}:{{.Tag}}"|grep -o "$Docker_image_mysql")
    if [ -z "$mysql_check" ]; then 
        docker pull $Docker_image_mysql; 
    fi

    node_check=$(docker images --format "{{.Repository}}:{{.Tag}}"|grep -o "$Docker_image_node")
    if [ -z "$node_check" ]; then 
        docker pull $Docker_image_node
    fi
}

# Prepare files and directories needed for runtime
CreateRuntimeEnvironment()
{
    echo "检查运行文件及目录..."

    if [ ! -f $Cfg_file ]; then
        echo "错误：安装文件（$Cfg_file）缺失！可以从Runtime/Templates复制模板后修改使用。"
        exit
    fi

    # 2. 如果没有数据目录，则创建
    if [ ! -d $Data_dir ]; then 
        mkdir -pv $Data_dir
    fi
    # 2. 准备上传文件的目录
    if [ ! -d "$Data_dir/upload" ]; then 
        mkdir -pv $Data_dir/upload 
    fi
}


Requests=("debug" "install" "uninstall")
[ $# -eq 1 ] && [[ "${Requests[@]}" =~ $1 ]] && Mode=$1 || echo $0" debug|install|uninstall";
if [ "$Mode" = "" ]; then
    exit
fi
echo "运行模式："$Mode

CheckSoftware
CheckDockerImage
CreateRuntimeEnvironment

# 复制docker-compose脚本，准备处理容器
cp -fv Runtime/Script/docker_compose_pc.yml  docker-compose.yml

. $Cfg_file
export Project=${TITLE//$'\r'}-v${VERSION_MAJOR//$'\r'}.${VERSION_MINOR//$'\r'}

if [ "$Mode" == "uninstall" ]; then
    echo "开始卸载..."
    docker-compose -p "web-mysql" --env-file $Cfg_file down
    rm -fv index.js
    echo "卸载完成！"
else
    echo "开始安装..."
    # 1. 重新构建容器（删除后重建）
    docker-compose -p "web-mysql" --env-file $Cfg_file down
    docker-compose -p "web-mysql" --env-file $Cfg_file up -d
    echo "重新构建容器完成。"

    # 2. 更新入口文件：index.js
    if [ "$Mode" == "debug" ]; then
        cp -fv Runtime/Template/index.js index.js
    else
        cp -fv app.js index.js
    fi

    # 3. 重启容器：web & mysql
    docker restart "${Project}_mysql"
    docker restart "${Project}"
    echo "重启容器完成"

    # 4. 安装NPM&bower软件包
    docker exec ${Project} /usr/local/bin/npm install
    docker exec ${Project} /usr/local/bin/npm install -g bower
    docker exec ${Project} /usr/local/bin/bower install --allow-root
    echo "安装完成！"
fi

rm -fv docker-compose.yml
exit
