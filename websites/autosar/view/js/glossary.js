angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

/* 点击列表中的title编辑/删除，鼠标停留title显示简介 */
function indexCtrl($scope, $http) 
{
    $scope.info = {};
    $scope.tips = tips = {'definition':'[定义/Definition]', 'comment':'[注释/Comment]', 
        'further_explanation':'[进一步解释/Further Explanation]', 'example':'[示例/Example]'};

    $('.glossary_item').notebook();


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
            $('.definition').html(ret.definition ? ret.definition : tips.definition);
            $('.further_explanation').html(ret.further_explanation ? ret.further_explanation : tips.further_explanation);
            $('.comment').html(ret.comment ? ret.comment : tips.comment);
            $('.example').html(ret.example ? ret.example : tips.example);
        })
    }

    $scope.submit = () =>
    {
        let info = $scope.info;

        let definition = $('.definition').html();
        if (definition.indexOf(tips.definition) == 0)
            definition = definition.substr(tips.definition.length);
        info['definition'] = definition;

        let further_explanation = $('.further_explanation').html();
        if (further_explanation.indexOf(tips.further_explanation) == 0)
            further_explanation = further_explanation.substr(tips.further_explanation.length);
        info['further_explanation'] = further_explanation;

        let comment = $('.comment').html();
        if (comment.indexOf(tips.comment) == 0)
            comment = comment.substr(tips.comment.length);
        info['comment'] = comment;

        let example = $('.example').html();
        if (example.indexOf(tips.example) == 0)
            example = example.substr(tips.example.length);
        info['example'] = example;
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

    $scope.reset = reset;
    function reset()
    {
        $scope.info = {};
        $('.definition').html(tips.definition);
        $('.further_explanation').html(tips.further_explanation);
        $('.comment').html(tips.comment);
        $('.example').html(tips.example);
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