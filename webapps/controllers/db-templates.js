var templateTable = null;
var template_list = [];
var current_template_name = null;

$(document).ready(function () {


    loadTemplates();

    $("body").removeClass('bg-white');

});



function loadTemplates() {


    if (templateTable) {
        templateTable.destroy();
        $("#templateTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Template Name',
            sWidth: '25%',
            mRender: function (data, type, row) {

                var str = '<button style="float: right" class="btn btn-sm btn-icon btn-default" onclick="openModal(6,\'' + row["id"] + '\')"><i class="icon-play"></i></button>';
                return data + str;
            }

        },
        {
            mData: 'query',
            sTitle: 'Template Query',
            orderable: false,
            sWidth: '55%',
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

                var str = '<button class="btn bskp-trash-btn " onclick="openModal(4,\'' + row['id'] + '\')" title="Delete"><img src="images/trash2.SVG" alt=""></button>'

                return '<button class="btn bskp-edit-btn mr-2 " onclick="openModal(5,\'' + row["id"] + '\')" title="Edit"><img src="images/edit.SVG" alt=""></button>' +
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
        paging: true,
        aoColumns: fields,
        searching: true,
        // aaSorting: sortOrder,
        "ordering": false,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        dom: '<"bskp-search-left" f> lrtip',
            language: {
                "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
             "searchPlaceholder": "Search by Template Name",
              "emptyTable":"No data available",
                loadingRecords: '',
                paginate: {
                    previous: '< Prev',
                    next: 'Next >'
                },

            },
        // "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
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
                queryParams.query['bool']['should'].push({"wildcard" : { "query" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']["minimum_should_match"]=1;

            }
                queryParams.query['bool']['must'] = [domainKeyJson];


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : 'DB_TEMPLATE'
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




}

function openModal(type, id) {
    if (type === 1) {
        $("#addTemplate").modal({
            backdrop: 'static',
            keyboard: false
        });
        $("#template_name").removeAttr('readonly');
        $(".templateAction").html('Create');
        $("#addTemplate form")[0].reset();
        $("#addTemplate").modal('show');
        $("#template_code").css('height','90px');
        $("#addTemplate form").attr('onsubmit', 'addTemplate()')
        
        
    }
    else if (type === 4) {
        $("#deleteModal").modal({
            backdrop: 'static',
            keyboard: false
        });
        current_template_name = id;
        $(".templateName").html(id)
        $("#deleteModal").modal('show');
    } else if (type === 5) {
        $("#addTemplate").modal({
            backdrop: 'static',
            keyboard: false
        });
        $("#addTemplate form")[0].reset();
        $(".templateAction").html('Update');
        var obj = {};
        current_template_name = id;

        for (var i = 0; i < template_list.length; i++) {
            if (id === template_list[i].id) {
                obj = template_list[i];
            }
        }
        $("#template_name").attr('readonly', 'readonly');

        $("#template_name").val(obj.id);
        $("#template_code").val(obj.query);
        $("#addTemplate").modal('show');
        $("#addTemplate form").attr('onsubmit', 'updateTemplate()')
        
    }else if (type === 6) {

        var obj = {};
        current_template_name = id;

        for (var i = 0; i < template_list.length; i++) {
            if (id === template_list[i].id) {
                obj = template_list[i];
            }
        }

        loadConnectionpool();

        $(".template_code").html(obj.query);

        $("#execTemplate").modal({
            backdrop: 'static',
            keyboard: false
        });
        
    }
}


function addTemplate() {

   
    if($("#template_name").val() === ""){
        errorMsgBorder('Template Name cannot be empty', 'template_name')
        return false;
    }
    if($("#template_code").val() === ""){
        errorMsgBorder('Template Query cannot be empty', 'template_code')
        return false;
    }else {
    var tempObj = {
        "id": $("#template_name").val(),
        "query": $("#template_code").val(),
        domainKey: DOMAIN_KEY
    }

        // console.log(tempObj);
        $(".btnSubmit").attr('disabled', 'disabled');
    

        retreiveDBTemplate(tempObj.id, function (status, data) {

            if (status) {
                $(".btnSubmit").removeAttr('disabled');
                errorMsgBorder('Template name already exist', 'template_name');
            } else {
                upsertDBTemplate(tempObj, function (status, data) {
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
    }
}


function updateTemplate() {

    var tempObj = {
        "id": $("#template_name").val(),
        "query": $("#template_code").val(),
        domainKey: DOMAIN_KEY
    }


        $(".btnSubmit").attr('disabled', 'disabled');


        upsertDBTemplate(tempObj, function (status, data) {
            if (status) {
                successMsg('Template Updated Successfully');
                loadTemplates();
                $("#addTemplate").modal('hide');
            } else {
                errorMsg('Error in Updating Template')
            }
            $(".btnSubmit").removeAttr('disabled');
        })
}


function proceedDelete() {
    deleteDBTemplate(current_template_name, function (status, data) {
        console.log(status)
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

    if($("#pool_name").val() === ""){
        errorMsgBorder('Connection Pool cannot be empty', 'pool_name')
        return false
    }

    if($("#temp_param").val()){
    var query = {
        id : current_template_name,
        pool : $("#pool_name").val(),
        arguments : $("#temp_param").val()
    }

    executeDBTemplateQuery(query,function (status, data) {
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

function loadConnectionpool() {


    var queryParams = {
        "query": {
            "bool": {
                "must": [
                    {
                        match: {domainKey: DOMAIN_KEY}
                    }
                ]
            }
        },
        "size": 100

    };

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    var verticalStr = '';

    searchByQuery('', 'CONNECTION_POOL', searchQuery, function (status, data) {
       if(status){
           var result = QueryFormatter(data).data;
           var resultData = result.data;
           $("#pool_name").html('<option value="">Choose Connection Pool</option>')
           for(var i=0;i<resultData.length;i++){
               $("#pool_name").append('<option value="'+resultData[i].id+'">'+resultData[i].id+' ['+resultData[i].type+']</option>')

           }

       }
    });
}