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
    $('.definition').trumbowyg({btns:trumbowyg_btns});
    $('.further_explanation').trumbowyg({btns:trumbowyg_btns});
    $('.comment').trumbowyg({btns:trumbowyg_btns});
    $('.example').trumbowyg({btns:trumbowyg_btns});

    $scope.info = {};

    $scope.reset = reset;
    function reset()
    {
        $scope.info = {};
        $('.definition').trumbowyg('empty');
        $('.further_explanation').trumbowyg('empty');
        $('.comment').trumbowyg('empty');
        $('.example').trumbowyg('empty');
    }
    reset();


    $scope.opts = opts = {'size':36, 'term':''};
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
            $('.definition').trumbowyg('html', ret.definition);
            $('.further_explanation').trumbowyg('html', ret.further_explanation);
            $('.comment').trumbowyg('html', ret.comment);
            $('.example').trumbowyg('html', ret.example);
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

            $scope.info['term'] = '';
            $scope.info['reference'] = '';
            $scope.info['initiator'] = '';
            $('.definition').trumbowyg('empty');
            $('.further_explanation').trumbowyg('empty');
            $('.comment').trumbowyg('empty');
            $('.example').trumbowyg('empty');
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