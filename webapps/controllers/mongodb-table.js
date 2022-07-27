var poolTable = null;
var pool_list = [];
var current_pool_name = null;
var current_pool_obj = null;

$(document).ready(function () {


    loadDBPool();

    $("body").removeClass('bg-white');

});


function loadDBPool() {


    if (poolTable) {
        poolTable.destroy();
        $("#poolTable").html("");
    }

    var fields = [
        {
            mData: 'name',
            sTitle: 'Pool Name',
            orderable: false,
            mRender: function (data, type, row) {

                return '<span style="font-weight: bold">' + data + '</span>';
            }

        },
        {
            mData: 'url',
            sTitle: 'Connection URL',
            orderable: false,
            sWidth: '40%',
            mRender: function (data, type, row) {

                return data ? data : '-';
            }
        },
        {
            mData: 'database',
            sTitle: 'Database',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'useSessions',
            sTitle: 'Use Sessions',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? "True" : "False";
            }
        },
        {
            mData: 'updatedStamp',
            sTitle: 'updatedStamp',
            orderable: true,
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm A');
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                var str = '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(2,\'' + row['name'] + '\')"><i class="icon-trash-o"></i></button>'

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,\'' + row["name"] + '\')"><i class="icon-edit2"></i></button>' +
                    str;
            }
        }

    ];

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [{"updatedStamp": {"order": "desc"}}];
    var queryParams = {
        query: {
            "bool": {
                "must": []
            }
        },
        sort: [defaultSorting]
    };

    var tableOption = {
        responsive: true,
        paging: true,
        aoColumns: fields,
        searching: true,
        aaSorting: [[4, 'desc']],
        "ordering": false,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            queryParams.query['bool']['must'] = [];
            queryParams.query['bool']['should'] = [];
            delete queryParams.query['bool']["minimum_should_match"];

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {

                queryParams.query['bool']['should'].push({"wildcard" : { "name" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "url" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "database" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']["minimum_should_match"]=1;

            }
            queryParams.query['bool']['must'] = [domainKeyJson];


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type: 'MONGODB'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;

                    pool_list = resultData['data'];
                    $(".poolCount").html(resultData.recordsFiltered)

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    poolTable = $("#poolTable").DataTable(tableOption);


}

function openModal(type, id) {
    current_pool_obj = {}
    current_pool_name = ''
    if (type === 1) {
        $("#pool_name").removeAttr('readonly');
        $(".templateAction").html('Create');

        $("#addPool form")[0].reset();
        $("#addPool").modal('show');
        $("#addPool form").attr('onsubmit', 'addPool()')
    }
    else if (type === 2) {
        current_pool_name = id;
        $(".templateName").html(id)
        $("#deleteModal").modal('show');
    } else if (type === 3) {
        $("#addPool form")[0].reset();
        $(".templateAction").html('Update');
        var obj = {};
        current_pool_name = id;

        for (var i = 0; i < pool_list.length; i++) {
            if (id === pool_list[i].name) {
                obj = pool_list[i];
            }
        }

        current_pool_obj = obj;

        $("#conn_name").attr('readonly', 'readonly');
        $("#conn_name").val(obj.name)
        $("#db_url").val(obj.url);
        $("#db_name").val(obj.database);
        $("#useSession").val(obj.useSessions ? '1' : '0');

        $("#addPool").modal('show');
        $("#addPool form").attr('onsubmit', 'updatePool()')
    }
    else if (type === 4) {

        var obj = {};
        current_pool_name = id;

        for (var i = 0; i < pool_list.length; i++) {
            if (id === pool_list[i].name) {
                obj = pool_list[i];
            }
        }


        $("#syncModal").modal('show');

    }
    else if (type === 5) {

        var obj = {};
        current_pool_name = id;

        for (var i = 0; i < pool_list.length; i++) {
            if (id === pool_list[i].id) {
                obj = pool_list[i];
            }
        }

        // loadDBTable();

        $(".poolName").html(obj.id);

        $("#viewTable").modal('show');


    }
}


function addPool() {
    var tempObj = {
        name : $("#conn_name").val(),
        url : $("#db_url").val(),
        database : $("#db_name").val(),
        useSessions : $("#useSession").val() == '0' ? false : true,
        updatedStamp: new Date().getTime(),
        createdStamp: new Date().getTime()
    }

    $(".btnSubmit").attr('disabled', 'disabled');


    retreiveMongoDBPool(tempObj.name, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('Mongo DB Connection Pool name already exist', 'conn_name');
        } else {
            upsertMongoDBPool(tempObj, function (status, data) {
                if (status) {
                    successMsg('Mongo DB Connection Pool Created Successfully');
                    loadDBPool();
                    $("#addPool").modal('hide');
                } else {
                    errorMsg('Error in Creating Mongo DB Connection Pool')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
}


function updatePool() {

    var tempObj = {
        name : $("#conn_name").val(),
        url : $("#db_url").val(),
        database : $("#db_name").val(),
        useSessions : $("#useSession").val() == '0' ? false : true,
        updatedStamp: new Date().getTime(),
        createdStamp: current_pool_obj.createdStamp
    }
    $(".btnSubmit").attr('disabled', 'disabled');

    upsertMongoDBPool(tempObj, function (status, data) {
        if (status) {
            successMsg('Mongo DB Connection Pool Updated Successfully');
            loadDBPool();
            $("#addPool").modal('hide');
        } else {
            errorMsg('Error in Updating DB Connection Pool')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    $(".btnModal").attr('disabled', 'disabled');

    deleteMongoDBPool(current_pool_name, function (status, data) {
        if (status) {
            successMsg('Mongo DB Connection Pool Deleted Successfully');
            loadDBPool();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
        $(".btnModal").removeAttr('disabled');

    })
}
