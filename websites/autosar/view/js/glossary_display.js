angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

function indexCtrl($scope, $http) 
{
    $('.glossary_display').css({top:55, width:'40%', height:$(window).height() - 80});

    $scope.list = [];

    let group_type = locals_read('/glossary/group_type');
    $scope.group_type = group_type ? group_type : 'alphabet';
    $scope.$watch("group_type", ()=>{
        locals_write('/glossary/group_type', $scope.group_type); 
        ($scope.group_type == 'alphabet') ? group_by_alphabet() : group_by_initaltor();
    });

    var list_org = [], list_view = [];

    $scope.query = query;
    function query()
    {
        $http.get('/autosar/glossary/query', {params: {'size':1000}})
        .then((res)=>{
            if (errorCheck(res)) return ;
    
            var ret = res.data.message;
            $scope.total = ret.total;
            list_view = list_org = ret.list;
            ($scope.group_type == 'alphabet') ? group_by_alphabet() : group_by_initaltor();
        })
    }
    query();

    $scope.$watch("str", search);
    function search()
    {
        let str = $scope.str;
        
        /* 搜索term中包含字符串的数据 */
        let res = [];
        list_org.map((x)=>{
            let term = x.term;
            if (term.toLocaleUpperCase().indexOf(str.toLocaleUpperCase()) != -1)
                res.push(x);
        });
        list_view = res;
        ($scope.group_type == 'alphabet') ? group_by_alphabet() : group_by_initaltor();
    }

    /* 根据term的字母排序分组 */
    function group_by_alphabet()
    {
        /* 获取term中的字母 */
        let list1 = list_view.map((x, idx)=>{
            let term = x.term;
            let str = (term.indexOf('/') == -1) ? term : term.replace(/[^\/]+\/ ?(.+)/, "$1");
            return {'term':str, 'idx':idx};
        });
        list1.sort((a, b)=> { return a.term.localeCompare(b.term); });

        let lastUpperChar = '';
        let cur, groups = [];
        for (let i = 0; i < list1.length; i++)
        {
            if (list1[i]['term'][0].toLocaleUpperCase() != lastUpperChar) {
                lastUpperChar = list1[i]['term'][0].toLocaleUpperCase();
                if (cur)
                    groups.push(cur);
                cur = new Array();
            }
            let idx = list1[i]['idx'];
            cur.push(list_view[idx]);
        }

        $scope.groups = groups;
    }

    function group_by_initaltor()
    {
        let groups = [];
        for (let i = 0; i < list_view.length; i++)
        {
            let initiator = list_view[i]['initiator'].replace(/^\s+|\s+$/, '');

            let founded = false;
            groups.map((x)=>{
                if (x.initiator == initiator) founded = true;
            });
            if (!founded) groups.push({'initiator':initiator, 'tmplist':[], 'list':[]});
            for (let j = 0; j < groups.length; j++)
            {
                if (initiator != groups[j]['initiator']) continue;

                let term = list_view[i]['term'];
                let str = (term.indexOf('/') == -1) ? term : term.replace(/[^\/]+\/ ?(.+)/, "$1");
                groups[j]['tmplist'].push({'term':str, 'idx':i});
            }
        }

        for (let i = 0; i < groups.length; i++)
        {
            /* 为tmplist按字母排序 */
            groups[i].tmplist.sort((a, b)=> { return a.term.localeCompare(b.term); });

            groups[i].tmplist.map((x)=>{
                let idx = x['idx'];
                groups[i]['list'].push(list_view[idx]);
            });
        }

        $scope.groups = groups;
    }

    let mouse_x = 0;
    $(document).mousemove((e)=>{ mouse_x = e.pageX; });

    $scope.detail = (id) =>
    {
        $('.glossary_display').css((mouse_x < $(window).width()/2)? 
            {'left':'', 'right':10} : {'left':10, 'right':''});

        $http
        .get('/autosar/glossary/info/'+id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.info = ret;
            $(".gd_definition").html(ret.definition);
            $(".gd_further_explanation").html(ret.further_explanation);
            $(".gd_comment").html(ret.comment);
            $(".gd_example").html(ret.example);
        })
    }

    $scope.detail_exit = () => {
        $scope.info = {};
    }
}