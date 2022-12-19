var sqlTable = null;

var queryEditor = null;
var resultEditor = null;


$(document).ready(function () {

    $('body').removeClass('bg-white');
    loadqueryEditor();
    loadresultEditor('');
    loadSqlQuery();
    loadSQLTable();

});

function loadSqlQuery() {

    $("#sqlQuery").html('');

    for(var i=0;i<SQL_QUERY.length;i++){
        $("#sqlQuery").append('<option value="'+SQL_QUERY[i]+'">'+SQL_QUERY[i]+'</option>');

    }
}


function loadqueryEditor() {

    if (queryEditor) {
        queryEditor.destroy();
        // return false;
    }


    $("#queryEditor").html("");

    queryEditor = ace.edit("queryEditor");
    queryEditor.setTheme("ace/theme/eclipse");
    queryEditor.session.setMode("ace/mode/sql");
    queryEditor.getSession().setUseWrapMode(true);

    queryEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    queryEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });


    var str = ''

    queryEditor.setValue(str);
    queryEditor.clearSelection();
    queryEditor.focus();


    $('#queryEditor').height(($(window).height() - 250) + 'px');
    $('.sqlTable').height(($(window).height() - 250) + 'px');

    queryEditor.resize();


    queryEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-Enter',
            mac: 'Command-Enter',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {



            executeQuery()
        }
    });


}

function executeQuery() {

    var query = queryEditor.getSession().getValue();


    if ($.trim(query)) {

        var q = query.toLowerCase();

        // var queryType = $("#sqlQuery").val().toLowerCase()

        // if (q.startsWith(queryType)) {

            var startTime = new Date().getTime();

            $(".loadingText").html('<i class="fa fa-spinner fa-spin"></i> processing...');

            var searchQuery = {
                "type": "",
                "query": query
            };
            executeSQLQuery(searchQuery, function (status, data) {

                if (status) {

                    resultEditor.setValue(js_beautify(JSON.stringify(data), {indent_size: 4})) // moves cursor to the start


                } else {
                    var error = data.responseJSON;


                    if(error && error.code === "SQL_ACCESS_DENIED"){
                        errorMsg('No SQL Access for this Domain. Contact Boodskap Support')
                    }else{
                        errorMsg('Error in Execution')
                    }

                    resultEditor.setValue(js_beautify(data.responseText, {indent_size: 4})) // moves cursor to the start

                }

                $(".loadingText").html('processed in <b>' + (new Date().getTime() - startTime) + 'ms</b>');

            });


        // } else {
        //     errorMsg('Invalid SQL '+$("#sqlQuery").val()+' Query.')
        // }

    } else {
        errorMsg('Required Fields cannot be empty')
    }
}


function loadresultEditor(code) {

    if (resultEditor) {
        resultEditor.destroy();
    }

    $("#resultEditor").html("");

    resultEditor = ace.edit("resultEditor");
    resultEditor.setTheme("ace/theme/eclipse");
    resultEditor.session.setMode("ace/mode/json");
    resultEditor.getSession().setUseWrapMode(true);

    resultEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    resultEditor.setOptions({
        enableBasicAutocompletion: false,
        enableSnippets: false,
        enableLiveAutocompletion: false,
    });
    resultEditor.setReadOnly(true);  // false to make it editable

    resultEditor.setValue(code);
    resultEditor.clearSelection();


    $('#resultEditor').height(($(window).height() - 250) + 'px');

    resultEditor.resize();

}


function loadSQLTable() {


    if (sqlTable) {
        sqlTable.destroy();
        $("#sqlTable").html("");
    }

    var fields = [
        {
            mData: 'name',
            sTitle: 'Table Name',
            orderable: false,

        },
        {
            mData: 'fields',
            sTitle: 'Fields',
            orderable: false,
            mRender: function (data, type, row) {
                var str = '<ul style="margin: 0px;padding: 0px;list-style: none">'
                for(var i=0;i<data.length;i++){

                    var pstr = '';
                    var istr = '';
                    var astr = '';

                    for(var j=0;j<row['primaryKeyFields'].length;j++){
                        if(data[i].name === row['primaryKeyFields'][j]){
                            pstr = '<i class="icon-square" style="color:red;opacity: 0.6" title="Primary Field"></i>';
                        }
                    }

                    for(var j=0;j<row['indexFields'].length;j++){
                        if(data[i].name === row['indexFields'][j]){
                            istr = '<i class="icon-square" style="color:forestgreen;opacity: 0.6" title="Indexed Field"></i>';

                        }
                    }

                    if(data[i].name === row['affinityField']){
                        astr = '<i class="icon-square" style="color:yellow;opacity: 0.6" title="Affinity Field"></i>'
                    }

                    str= str+'<li style="border-bottom: 1px solid #eee">'+(i+1)+'] '+pstr+' '+istr+' '+astr+' <strong>'+data[i].name+'</strong> ' +
                        '<small>'+data[i].type+'</small> </li>'
                }


                return str;
            }
        }


    ];

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [{"createdStamp": {"order": "desc"}}];
    var queryParams = {
        query: {
            "bool": {
                "must": []
            }
        },
        // sort: [defaultSorting]
    };

    var tableOption = {
        // fixedHeader: {
        //     header: true,
        //     headerOffset: -5
        // },
        responsive: true,
        paging: true,
        pagingType: 'simple',
        aoColumns: fields,
        searching: true,
        dom: '<"bskp-search-left" f> rtp',
        language: {
            "emptyTable": "No data available",
            "zeroRecords": "No data available",
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search by Table Name",
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        // aaSorting: sortOrder,
        "ordering": false,
        iDisplayLength: 5,
        lengthMenu: [[5, 10, 50, 100], [5, 10, 50, 100]],
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            // var keyName = fields[oSettings.aaSorting[0][0]]
            //
            // var sortingJson = {};
            // sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            // queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {
                var searchJson = {
                    "multi_match": {
                        "query": '*' + searchText + '*',
                        "type": "phrase_prefix",
                        "fields": ['_all']
                    }
                };

                queryParams.query['bool']['must'] = [domainKeyJson, searchJson];

            } else {
                queryParams.query['bool']['must'] = [domainKeyJson];
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : 'SQL_TABLE'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;

                    table_list = resultData['data'];
                    $(".tableCount").html(resultData.recordsFiltered)

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    sqlTable = $("#sqlTable").DataTable(tableOption);
    $('.dataTables_filter input').attr('maxlength', 100)
}
