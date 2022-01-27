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
    $('.title').trumbowyg({btns:trumbowyg_btns});
    $('.description').trumbowyg({btns:trumbowyg_btns});
    $('.rationale').trumbowyg({btns:trumbowyg_btns});
    $('.usecase').trumbowyg({btns:trumbowyg_btns});

    $scope.info = {};

    $scope.reset = reset;
    function reset()
    {
        $scope.info = {};
        $('.title').trumbowyg('empty');
        $('.description').trumbowyg('empty');
        $('.rationale').trumbowyg('empty');
        $('.usecase').trumbowyg('empty');
    }

    $scope.opts = opts = {'size':10, 'id':''};
    $scope.$watch("opts", query, true);
    function query()
    {
        var opts = $scope.opts;

        $http.get('/autosar/standard/query', {params: opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.total = ret.total;
            $scope.stdlist = ret.list;
        })
    }

    $scope.edit = (id) =>
    {
        $http.get('/autosar/standard/info/'+id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.info = ret;
            $('.title').trumbowyg('html', ret.title);
            $('.description').trumbowyg('html', ret.description);
            $('.rationale').trumbowyg('html', ret.rationale);
            $('.usecase').trumbowyg('html', ret.usecase);
        })
    }

    $scope.submit = () =>
    {
        let info = $scope.info;

        info['title'] = $('.title').trumbowyg('html');
        info['description'] = $('.description').trumbowyg('html');
        info['rationale'] = $('.rationale').trumbowyg('html');
        info['usecase'] = $('.usecase').trumbowyg('html');

        if (!info.id || !info.title || !info.description || !/^\d+$/.test(info.docid))
            return toastr.warning('请输入有效的标识，标题，描述和所属文档！');

        let stdid = info.id ? info.id : 0;
        $http.post('/autosar/standard/'+stdid, info).then((res)=>{
            if (errorCheck(res)) return ;

            query();
            $scope.info['id'] = '';
            $('.title').trumbowyg('empty');
            $('.description').trumbowyg('empty');
            $('.rationale').trumbowyg('empty');
            $('.usecase').trumbowyg('empty');

            // 显示更新成功后，刷新该页面
            toastr.success("操作成功！");
        });
    }

    $scope.delete = (id) => 
    {
        $http.delete('/autosar/standard/'+id).then((res)=>{
            if (errorCheck(res)) return ;

            reset();
            query();
            toastr.success("删除成功，即将返回首页！");
        });
    }
}