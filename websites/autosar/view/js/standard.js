angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

/* 点击列表中的title编辑/删除，鼠标停留title显示简介 */
function indexCtrl($scope, $http) 
{
    $scope.info = {};
    $scope.tips = tips = {'title':'[标题/Title]', 'description':'[描述/Description]', 
        'rationale':'[工作原理/Rationale]', 'usecase':'[用例/Use Case]'};

    $('.standard_item').notebook();


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
            $('.title').html(ret.title ? ret.title : tips.title);
            $('.description').html(ret.description ? ret.description : tips.description);
            $('.rationale').html(ret.rationale ? ret.rationale : tips.rationale);
            $('.usecase').html(ret.usecase ? ret.usecase : tips.usecase);
        })
    }

    $scope.submit = () =>
    {
        let info = $scope.info;

        let title = $('.title').html();
        info['title'] = (title.indexOf(tips.title) == 0) ? title.substr(tips.title.length) : title;

        let description = $('.description').html();
        info['description'] = (description.indexOf(tips.description) == 0) ? description.substr(tips.description.length) : description;

        let rationale = $('.rationale').html();
        info['rationale'] = (rationale.indexOf(tips.rationale) == 0) ? rationale.substr(tips.rationale.length) : rationale;

        let usecase = $('.usecase').html();
        info['usecase'] = (usecase.indexOf(tips.usecase) == 0) ? usecase.substr(tips.usecase.length) : usecase;

        if (!info.id || !info.title || !info.description || !/^\d+$/.test(info.docid))
            return toastr.warning('请输入有效的标识，标题，描述和所属文档！');

        let stdid = info.id ? info.id : 0;
        $http.post('/autosar/standard/'+stdid, info).then((res)=>{
            if (errorCheck(res)) return ;

            query();
            // 显示更新成功后，刷新该页面
            toastr.success("操作成功！");
        });
    }

    $scope.reset = reset;
    function reset()
    {
        $scope.info = {};
        $('.title').html(tips.title);
        $('.description').html(tips.description);
        $('.rationale').html(tips.rationale);
        $('.usecase').html(tips.usecase);
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