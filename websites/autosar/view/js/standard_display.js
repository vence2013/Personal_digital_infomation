angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

function indexCtrl($scope, $http) 
{
    let wnd_height = $(window).height() - 70;
    $(".column").css({height:wnd_height});
    $(".column>div:nth-child(2)").css({height:wnd_height-60});
    $(".column2").css({height:wnd_height/5});
    $(".column3").css({height:wnd_height/5*4 - 6});

    $scope.document_str = '';
    $scope.$watch("document_str", doc_query);
    function doc_query()
    {
        let str = $scope.document_str;
        let opts = {'size':20};

        if (/^\d+$/.test(str)) 
            opts['identification_no'] = str;
        else
            opts['title'] = str;

        $http.get('/autosar/document/query', {params: opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.total = ret.total;
            $scope.doclist = ret.list;
            std_query();
        })
    }

    $scope.standard_str = '';
    $scope.$watch("standard_str", std_query);
    $scope.std_query = std_query;
    function std_query(docid)
    {
        if (!$scope.doclist) return;
    
        let str = $scope.standard_str;
        if (!docid)
        {
            let tmp = locals_read('/standard/document_sel');
            docid = tmp ? tmp : $scope.doclist[0]['id'];
        }
        locals_write('/standard/document_sel', docid);
        $(".standard_sel[docid]").removeClass('standard_sel');        

        let opts = {'size':80, 'str':str, 'docid':docid}; // id, title, desc

        $http.get('/autosar/standard/query_or', {params: opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            $("a[docid='"+docid+"']").addClass('standard_sel');

            var ret = res.data.message;
            $scope.total = ret.total;
            console.log(ret.list);
            let list = [];
            for (let i = 0; i < ret.list.length; i++)
            {
                let e = ret.list[i];
                let title = e['title'].replace(/^[^>]*>([^<]+)<.*/, "$1");
                list[i] = {'id':e['id'], 'title':title};
            }
            console.log(list);

            $scope.stdlist = list;
        })
    }
}