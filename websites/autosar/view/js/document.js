angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

/* 点击列表中的title编辑/删除，鼠标停留title显示简介 */
function indexCtrl($scope, $http) 
{
    const trumbowyg_btns = [
        ['formatting', 'unorderedList', 'orderedList'], 
        ['strong', 'em', 'del'],         
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
        ['link', 'insertImage', 'viewHTML'],
        ['fullscreen']
    ];
    $('.intro').trumbowyg({btns:trumbowyg_btns});

    $scope.info = {};

    $scope.reset = reset;
    function reset()
    {
        $scope.info = {};
        $('.intro').trumbowyg('empty');
    }
    reset();

    function extquery()
    {
        $http.get('/autosar/document/extquery')
        .then((res)=>{
            if (errorCheck(res)) return ;

            let ret = res.data.message;
            $scope.supported_status = [];
            for (let i = 0; i < ret.status.length; i++) 
                if (ret.status[i]) $scope.supported_status.push(ret.status[i]);
            $scope.supported_part_of_standard = [];
            for (let i = 0; i < ret.part_of_standard.length; i++) 
                if (ret.part_of_standard[i]) $scope.supported_part_of_standard.push(ret.part_of_standard[i]);
            $scope.supported_part_of_release = [];
            for (let i = 0; i < ret.part_of_release.length; i++) 
                if (ret.part_of_release[i]) $scope.supported_part_of_release.push(ret.part_of_release[i]);
        })
    }
    extquery();

    $scope.opts = opts = {'size':10, 'title':'', 'identification_no':'', 'status':'', 'part_of_standard':'', 'part_of_release':''};
    $scope.$watch("opts", query, true);

    function query()
    {
        var opts = $scope.opts;

        $http.get('/autosar/document/query', {params: opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.total = ret.total;
            $scope.doclist = ret.list;
        })
    }    

    $scope.edit = (id) =>
    {
        $http.get('/autosar/document/info/'+id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.info = ret;
            $('.intro').trumbowyg('html', ret.introduce);
        })
    }

    $scope.submit = () => 
    {
        let info = $scope.info;

        if (!info.title || !info.identification_no)
            return toastr.warning('请输入有效标题和编号！');

        info['intro'] = $('.intro').trumbowyg('html');

        let docid = info.id ? info.id : 0;
        $http.post('/autosar/document/'+docid, info).then((res)=>{
            if (errorCheck(res)) return ;

            query();
            // 显示更新成功后，刷新该页面
            toastr.success("操作成功！");
        });
    }

    $scope.delete = (id) => 
    {
        $http.delete('/autosar/document/'+id).then((res)=>{
            if (errorCheck(res)) return ;

            query();
            toastr.success("删除成功，即将返回首页！");
        });
    }
}