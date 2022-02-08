angular
.module('indexApp', [])
.controller('indexCtrl', indexCtrl);

function indexCtrl($scope, $http) 
{
    let wnd_height = $(window).height() - 70;
    $(".column").css({height:wnd_height});
    $(".column>div:nth-child(2)").css({height:wnd_height-60});
    $(".column2").css({height:60});
    $(".column3").css({height:wnd_height - 66});

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

            let sel_exist = false;
            let stdid = locals_read('/standard/standard_sel');

            let list = [];
            for (let i = 0; i < ret.list.length; i++)
            {
                let e = ret.list[i];
                let title = e['title'].replace(/^[^>]*>([^<]+)<.*/, "$1");
                list[i] = {'id':e['id'], 'title':title};

                if (stdid == list[i]['id']) sel_exist = true;
            }
            $scope.stdlist = list;
            if (sel_exist) std_detail(stdid);
        })
    }

    var std_sel;
    $scope.std_select = std_select;
    function std_select(stdid)
    {
        let sel = std_sel;
        std_sel = undefined;

        $(".standard_sel[stdid]").removeClass('standard_sel');   
        if (stdid == sel) return;

        std_detail(stdid);
        std_sel = stdid;
        locals_write('/standard/standard_sel', stdid);
        
        $("a[stdid='"+stdid+"']").addClass('standard_sel');
    }

    $scope.std_detail = std_detail;
    function std_detail(stdid)
    {
        if (std_sel) return;

        $http.get('/autosar/standard/info/'+stdid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.standard_info = ret;
            $(".standard_info_title").html(ret.title);
            $(".standard_info_description").html(ret.description);
            $(".standard_info_rationale").html(ret.rationale);
            $(".standard_info_usecase").html(ret.usecase);
        })
    }
}