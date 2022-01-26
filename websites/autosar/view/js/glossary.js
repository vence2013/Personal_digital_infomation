angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

/* 点击列表中的title编辑/删除，鼠标停留title显示简介 */
function indexCtrl($scope, $http) 
{
    $scope.info = {};

    $scope.reset = reset;
    function reset()
    {
        $scope.info = {};
        $('.glossary_item').html('');
        $('.definition').notebook({placeholder:'定义/Definition'});
        $('.further_explanation').notebook({placeholder:'注释/Comment'});
        $('.comment').notebook({placeholder:'进一步解释/Further Explanation'});
        $('.example').notebook({placeholder:'示例/Example'});
    }
    reset();


    $scope.opts = opts = {'size':10, 'term':''};
    $scope.$watch("opts", query, true);
    function query()
    {
        var opts = $scope.opts;

        $http.get('/autosar/glossary/query', {params: opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.total = ret.total;
            $scope.termlist = ret.list;
        })
    }

    $scope.edit = (id) =>
    {
        $http.get('/autosar/glossary/info/'+id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.info = ret;
            $('.definition').html(ret.definition);
            $('.further_explanation').html(ret.further_explanation);
            $('.comment').html(ret.comment);
            $('.example').html(ret.example);
        })
    }

    $scope.submit = () =>
    {
        let info = $scope.info;

        info['definition'] = $('.definition').html();
        info['further_explanation'] = $('.further_explanation').html();
        info['comment'] = $('.comment').html();
        info['example'] = $('.example').html();

        if (!info.term || !info.definition || !/^\d+$/.test(info.docid))
            return toastr.warning('请输入有效词汇，定义和文档ID！');

        let termid = info.id ? info.id : 0;
        $http.post('/autosar/glossary/'+termid, info).then((res)=>{
            if (errorCheck(res)) return ;

            query();
            // 显示更新成功后，刷新该页面
            toastr.success("操作成功！");
        });
    }

    $scope.delete = (id) => 
    {
        $http.delete('/autosar/glossary/'+id).then((res)=>{
            if (errorCheck(res)) return ;

            reset();
            query();
            toastr.success("删除成功，即将返回首页！");
        });
    }
}