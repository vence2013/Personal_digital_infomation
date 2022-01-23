angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

function indexCtrl($scope, $http) 
{
    $scope.info = {};
    $scope.editor_placeholder = "请编辑文档简介";

    $('#intro_editor').notebook();

    $scope.submit = () => 
    {
        let content = $('#intro_editor').html();
        let info = $scope.info;
        let docid = info.id ? info.id : 0;

        if (!info.title || !info.no)
            return toastr.warning('请输入有效标题和编号！');

        if (content != $scope.editor_placeholder)
            info['intro'] = content;
        console.log(info);

        $http.post('/autosar/document/'+docid, info).then((res)=>{
            if (errorCheck(res)) return ;

            ret = res.data.message;
            console.log(ret)
            // 显示更新成功后，刷新该页面
            toastr.success("操作成功！");
            window.setTimeout(()=>{ window.location.href = '/autosar/document'; }, 1000);
        });
    }
}