angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

/* 点击列表中的title编辑/删除，鼠标停留title显示简介 */
function indexCtrl($scope, $http) 
{
    $scope.info = {};
    $scope.opts = {'size':10};
    $scope.editor_placeholder = "请编辑文档简介";

    $('#intro_editor').notebook();

    function query()
    {
        let opts = $scope.opts;
        $http.get('/autosar/document/query', {params: opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.total = ret.total;
            $scope.doclist = ret.list;
        })
    }
    query();

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
        });
    }
}