var templateTable = null;
var template_list = [];
var current_template_name = null;

$(document).ready(function () {


    loadTemplates();
    $(".dataTables_filter input").attr('maxlength','100')
   
    loadSqlQuery();
    $("body").removeClass('bg-white');

});


function loadSqlQuery() {

    $("#template_lang").html('');

    for (var i = 0; i < SQL_QUERY.length; i++) {
        $("#template_lang").append('<option value="' + SQL_QUERY[i] + '">' + SQL_QUERY[i] + '</option>');

    }
}


function loadTemplates() {

    
    if (templateTable) {
        templateTable.destroy();
        $("#templateTable").html("");
    }
   
    var fields = [
        {
            mData: 'id',
            sTitle: 'Template Name',
            sWidth: '15%',
            mRender: function (data, type, row) {

                var str = '<button style="float: right" class="btn btn-sm btn-icon btn-default" onclick="openModal(6,\'' + row["id"] + '\')"><i class="icon-play"></i></button>';
                return data + str;
            }

        },
        {
            mData: 'type',
            sTitle: 'Query Type',
            sWidth: '13%',
        },
        {
            mData: 'query',
            sTitle: 'Template Query',
            orderable: false,
            sWidth: '62%',
            mRender: function (data, type, row) {

                return '<code>' + (data) + '</code>';
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '15%',
            mRender: function (data, type, row) {

                var str = '<button class="btn bskp-trash-btn mr-2" onclick="openModal(4,\'' + row['id'] + '\')"><img src="images/delete.svg" alt=""></button>'

                return '<button class="btn bskp-edit-btn mr-2" onclick="openModal(5,\'' + row["id"] + '\')"><img src="images/edit_icon.svg" alt=""></button>' +
                    str;
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
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
      
        aoColumns: fields,
        searching: true,
        dom: '<"bskp-search-left" f> lrtip',
        paging: true,
        language: {
            "emptyTable": "No data available",
            "zeroRecords": "No data available",
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search by Template Name",
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        // aaSorting: sortOrder,
        "ordering": false,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN_ALT,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            queryParams.query['bool']['must'] = [];
            queryParams.query['bool']['should'] = [];
            delete queryParams.query['bool']["minimum_should_match"];

            // var keyName = fields[oSettings.aaSorting[0][0]]
            //
            // var sortingJson = {};
            // sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            // queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {

                queryParams.query['bool']['should'].push({"wildcard" : { "id" : "*"+searchText.toLowerCase()+"*" }})
                // queryParams.query['bool']['should'].push({"wildcard" : { "query" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']["minimum_should_match"]=1;

            }
                queryParams.query['bool']['must'] = [domainKeyJson];


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : 'SQL_TEMPLATE'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;

                    template_list = resultData['data'];
                    $(".templateCount").html(resultData.recordsFiltered)

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };
    templateTable = $("#templateTable").DataTable(tableOption);
    $('.dataTables_filter input').attr('maxlength', 100)

    /* var tableOption = {
         fixedHeader: {
             header: true,
             headerOffset: -5
         },
         responsive: true,
         paging: true,
         searching: true,
         "ordering": true,
         iDisplayLength: 10,
         lengthMenu: [[10, 50, 100], [10, 50, 100]],
         aoColumns: fields,
         data: []
     };

     listSQLTemplates(1000, function (status, data) {
         if (status && data.length > 0) {
             tableOption['data'] = data;
             template_list = data;
             $(".templateCount").html(data.length)
         } else {
             $(".templateCount").html(0)
         }

         templateTable = $("#templateTable").DataTable(tableOption);
     })*/


}

function openModal(type, id) {
    loadSqlQuery();
    if (type === 1) {
        $("#template_name").removeAttr('readonly');
        $(".templateAction").html('Add');
        $("#addTemplate form")[0].reset();
        $("#addTemplate").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show'
        );
        $("#addTemplate form").attr('onsubmit', 'addTemplate()')
        $("#template_code").css('height','100px');
    }
    else if (type === 4) {
        current_template_name = id;
        $(".templateName").html(id)
        $("#deleteModal").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show'
        );
    } else if (type === 5) {
        $("#addTemplate form")[0].reset();
        $(".templateAction").html('Edit');
        $("#template_code").css('height','100px');
        var obj = {};
        current_template_name = id;

        for (var i = 0; i < template_list.length; i++) {
            if (id === template_list[i].id) {
                obj = template_list[i];
            }
        }
        $("#template_name").attr('readonly', 'readonly');

        $("#template_name").val(obj.id);
        $("#template_lang").val(obj.type);
        $("#template_code").val(obj.query);
        $("#addTemplate").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show'
        );
        $("#addTemplate form").attr('onsubmit', 'updateTemplate()')
    }else if (type === 6) {

        var obj = {};
        current_template_name = id;

        for (var i = 0; i < template_list.length; i++) {
            if (id === template_list[i].id) {
                obj = template_list[i];
            }
        }

        $(".template_code").html(obj.query);

        $("#execTemplate").modal({
            backdrop: 'static',
            keyboard: false
        });
    }
}


function addTemplate() {
    var template_name = $.trim($("#template_name").val());
   var template_lang = $.trim($("#template_lang").val());
    var template_code = $.trim($("#template_code").val());
    if(template_name === ""){
        errorMsgBorder('Template Name cannot be empty','template_name');
        return false;
    }else if(template_code === ""){
        errorMsgBorder('Template Code cannot be empty','template_code');
        return false;
    }else{
        var tempObj = {
            "id": template_name,
            "type": template_lang,
            "query":template_code,
            domainKey: DOMAIN_KEY
        }
    
    
        var q = $("#template_code").val().toLowerCase();
    
        var queryType = $("#template_lang").val().toLowerCase()
    
        if (q.startsWith(queryType)) {
    
            $(".btnSubmit").attr('disabled', 'disabled');
    
    
            retreiveSQLTemplate(tempObj.id, function (status, data) {
    
                if (status) {
                    $(".btnSubmit").removeAttr('disabled');
                    errorMsgBorder('Template name already exist', 'template_name');
                } else {
                    upsertSQLTemplate(tempObj, function (status, data) {
                        if (status) {
                            successMsg('Template Created Successfully');
                            loadTemplates();
                            $("#addTemplate").modal('hide');
                        } else {
                            errorMsg('Error in Creating Template')
                        }
                        $(".btnSubmit").removeAttr('disabled');
                    })
                }
            })
        } else {
            errorMsg('Invalid SQL ' + $("#template_lang").val() + ' Query.')
    
        }
    }  
    


}


function updateTemplate() {

    var tempObj = {
        "id": $("#template_name").val(),
        "type": $("#template_lang").val(),
        "query": $("#template_code").val(),
        domainKey: DOMAIN_KEY
    }

    var q = $("#template_code").val().toLowerCase();

    var queryType = $("#template_lang").val().toLowerCase()

    if (q.startsWith(queryType)) {

        $(".btnSubmit").attr('disabled', 'disabled');


        upsertSQLTemplate(tempObj, function (status, data) {
            if (status) {
                successMsg('Template Updated Successfully');
                loadTemplates();
                $("#addTemplate").modal('hide');
            } else {
                errorMsg('Error in Updating Template')
            }
            $(".btnSubmit").removeAttr('disabled');
        })
    } else {
        errorMsg('Invalid SQL ' + $("#template_lang").val() + ' Query.')

    }
}


function proceedDelete() {
    deleteSQLTemplate(current_template_name, function (status, data) {
        if (status) {
            successMsg('Template Deleted Successfully');
            loadTemplates();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}


function executeTempQuery() {

    if($("#temp_param").val()){
    var query = {
        id : current_template_name,
        arguments : $("#temp_param").val()
    }

    executeSQLTemplateQuery(query,function (status, data) {
        if (status) {

            $("#result_data").html('<code>'+js_beautify(JSON.stringify(data), {indent_size: 4})+'</code>')

        } else {
            $("#result_data").html('<code>PARAMETER MISSING / MISPELLED IN JSON.</code>')
            errorMsg('Error in execution')
        }
    })
    }else{
        errorMsgBorder('Parameter JSON cannot be empty', 'temp_param')
    }
}