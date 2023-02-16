var assetTable = null;
var asset_list = [];
var device_list = [];
var current_asset_id = null;

$(document).ready(function () {

    loadAssetList();
    $('.dataTables_filter input').attr('maxlength', 50);
    $("body").removeClass('bg-white');

});


function loadAssetList() {


    if (assetTable) {
        assetTable.destroy();
        $("#assetTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Asset ID',
            sWidth: '15%',
            orderable: true,
            mRender: function (data, type, row) {

                return data + '<button class="btn bskp-edit-btn mr-2 bskp-greyicon pull-right" onclick="openModal(4,\'' + row["id"] + '\')" title="Link Device">' +
                    '<em class="icon-eye2"></em></button>';
            }
        },
        {
            mData: 'name',
            sTitle: 'Asset Name',
            sWidth: '20%',
            orderable: true,
        },
        {
            mData: 'description',
            sTitle: 'Description',
            sWidth: '35%',
            orderable: false,
        },
        {
            mData: 'registeredStamp',
            sTitle: 'Created Time',
            orderable: true,
            sWidth: '20%',
            mRender: function (data, type, row) {
                return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn bskp-edit-btn mr-2" onclick="openModal(2,\'' + row["id"] + '\')" title="Edit"> <img src="images/edit.svg" alt=""> </button>' +
                    '<button class="btn bskp-trash-btn" onclick="openModal(3,\'' + row['id'] + '\')" title="Delete">  <img src="images/delete.svg" alt=""> </button>';
            }
        }

    ];

    let data = 1000
    var tableOption = {
        responsive: false,
        autoWidth: false,
        paging: true,
        aoColumns: fields,
        searchable: true,
        aaSorting: [[3, 'desc']],
        "ordering": true,
        scrollY: '100px',
        scrollCollapse: true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
                       dom: '<"bskp-search-left" f> lrtip',
            language: {
                "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
             "searchPlaceholder": "Search here",
             "zeroRecords": "No data available",
             "emptyTable":"No data available",
                loadingRecords: '',
                paginate: {
                    previous: '< Prev',
                    next: 'Next >'
                },

            },
        "bServerSide": false,
        "bProcessing": true,
        "sAjaxSource": API_BASE_PATH + "/asset/list/" + API_TOKEN_ALT + '/' + data,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {
           

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};



            oSettings.jqXHR = $.ajax({
                "type": "GET",
                "url": sSource,
                success: function (data) {
                    if (data.length > 0) {
                        $(".assetCount").html(data.length)
                        asset_list = data;
                    } else {
                        $(".assetCount").html(0);
                        asset_list = [];
                    }
                    let resultData = {
                        "recordsTotal": asset_list.length,
                        "recordsFiltered": asset_list.length,
                        "data": asset_list
                    }
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };
    assetTable = $("#assetTable").DataTable(tableOption);
    $('.dataTables_filter input').attr('maxlength', 100);
    $(".dataTables_scrollBody").removeAttr("style").css({"min-height":"calc(100vh - 425px)","position":"relative","width":"100%"});
    $('.dataTables_filter input').on('keyup', function () {
        console.log('hh')
        assetTable.search( this.value ).draw();
    } );
    // getAssetList(1000, function (status, data) {
    //     if (status && data.length > 0) {
    //         tableOption['data'] = data;
    //         $(".assetCount").html(data.length)
    //         asset_list = data;
    //     } else {
    //         $(".assetCount").html(0);
    //         asset_list = [];
    //     }

    //     assetTable = $("#assetTable").DataTable(tableOption);
    //     $('.dataTables_filter input').attr('maxlength', 100)
    // })


}


function openModal(type, id) {
    if (type === 1) {
        $("#asset_id").removeAttr('readonly');
        $(".templateAction").html('Add New');
        $("#addAsset form")[0].reset();
        $("#addAsset").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show'
        );
        $("#addAsset form").attr('onsubmit', 'addAsset()')
        $("#asset_desc").css('height','90px');
        
    } else if (type === 2) {
        $(".templateAction").html('Edit');
        var obj = {};
        current_asset_id = id;

        for (var i = 0; i < asset_list.length; i++) {
            if (id === asset_list[i].id) {
                obj = asset_list[i];
            }
        }
        $("#asset_id").attr('readonly', 'readonly');
        $("#asset_id").val(obj.id);
        $("#asset_name").val(obj.name);
        $("#asset_desc").val(obj.description);
        $("#addAsset").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show'
        );
        $("#addAsset form").attr('onsubmit', 'updateAsset()')
        $("#asset_desc").css('height','90px');

    } else if (type === 3) {
        current_asset_id = id;
        $(".assetId").html(id)
        $("#deleteModal").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show'
        );
    } else if (type === 4) {
        current_asset_id = id;
        $(".assetId").html(id);
        loadDeviceList();
        loadLinkedDevices(id);
        $("#linkModal").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show'
        );


    }
}

function linkDevice() {
    if(!$("#deviceID").val()){
        errorMsgBorder('Device Id cannot be empty','dropdownMenu1')
    }else{
        $("#linkDeviceBtn").html('<i class="fa fa-spinner fa-spin"></i> Processing..').attr('disabled','disabled')
        assetLink(current_asset_id, $("#deviceID").val(), function (status, data) {
        if (status) {
            successMsg('Device Linked Successfully');
            loadLinkedDevices(current_asset_id);
        } else {
            errorMsg('Error in Linking Device')
        }
        $("#linkDeviceBtn").html('Link Device').attr('disabled',false)
        });
      }
}

function unlinkDevice() {
    assetUnLink(current_asset_id, $("#deviceID").val(), function (status, data) {
        if (status) {
            successMsg('Device UnLinked Successfully');
            loadLinkedDevices(current_asset_id);
        } else {
            errorMsg('Error in UnLinking Device')
        }
    });
}

function loadLinkedDevices(id) {
    getAssetLinkedDevices(id, function (status, data) {
        if (status) {
            device_list = data;
            $("#linkedTable tbody").html("");
            for (var i = 0; i < device_list.length; i++) {
                $("#linkedTable tbody").append('<tr>' +
                    '<td>' + device_list[i].id + '</td>' +
                    '<td>' + device_list[i].modelId + '</td>' +
                    '<td>' + device_list[i].version + '</td>' +
                    '<td><button class="btn bskp-edit-btn  bskp-greyicon mr-2" onclick="unlinkDevice(\'' + device_list[i].id + '\')"><em class="icon-unlink"></em></button> </td>' +
                    '</tr>');
            }
        } else {
            device_list = [];
        }
    });
}


function addAsset() {
    var asset_id = $.trim($("#asset_id").val());
    var asset_name = $.trim($("#asset_name").val());
    var asset_desc = $.trim($("#asset_desc").val());
    
    if(asset_id == ""){
        errorMsgBorder('Asset ID is required','asset_id');
        return false;
    }else if(asset_name == ""){
        errorMsgBorder('Asset Name is required','asset_name');
        return false;
    } else if(asset_desc == ""){
        errorMsgBorder('Description is required','asset_desc');
        return false;
    }
    var assetObj = {
        "id": asset_id,
        "name": asset_name,
        "description": asset_desc,
    }

    $(".btnSubmit").attr('disabled', 'disabled');

    retreiveAsset(assetObj.id, function (status, data) {
        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('Asset ID already exist', 'asset_id');
        } else {
            upsertAsset(assetObj, function (status, data) {
                if (status) {
                    successMsg('Asset Created Successfully');
                    loadAssetList();
                    $("#addAsset").modal('hide');
                } else {
                    errorMsg('Error in Creating Asset')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
}


function updateAsset() {

    var assetObj = {
        "id": $("#asset_id").val(),
        "name": $("#asset_name").val(),
        "description": $("#asset_desc").val(),
    }

    $(".btnSubmit").attr('disabled', 'disabled');

    upsertAsset(assetObj, function (status, data) {
        if (status) {
            successMsg('Asset Updated Successfully');
            loadAssetList();
            $("#addAsset").modal('hide');
        } else {
            errorMsg('Error in Updating Asset')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    deleteAsset(current_asset_id, function (status, data) {
        if (status) {
            successMsg('Asset Deleted Successfully');
            loadAssetList();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}


function loadDeviceList(searchText) {

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        "query": {
            "bool": {
                "must": [],
                "should":[]
            }
        },
        "size": 25,
        "sort": [{"reportedStamp": {"order": "desc"}}]
    };

    if (searchText) {
        queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + searchText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + searchText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + searchText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + capitalizeFLetter(searchText) + "*" } })
        queryParams.query['bool']["minimum_should_match"] = 1;
        queryParams.query['bool']['should'].push({
            "match_phrase": {
                "name": "*" + searchText + "*"
            }
        })
        queryParams.query['bool']['should'].push({ "wildcard": { "modelId": "*" + searchText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "modelId": "*" + searchText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "modelId": "*" + searchText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "modelId": "*" + capitalizeFLetter(searchText) + "*" } })
        queryParams.query['bool']["minimum_should_match"] = 1;
        queryParams.query['bool']['should'].push({
            "match_phrase": {
                "modelId": "*" + searchText + "*"
            }
        })
        queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + searchText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + searchText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + searchText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + capitalizeFLetter(searchText) + "*" } })
        queryParams.query['bool']["minimum_should_match"] = 1;
        queryParams.query['bool']['should'].push({
            "match_phrase": {
                "version": "*" + searchText + "*"
            }
        })
        queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + capitalizeFLetter(searchText) + "*" } })
        queryParams.query['bool']["minimum_should_match"] = 1;
        queryParams.query['bool']['should'].push({
            "match_phrase": {
                "id": "*" + searchText + "*"
            }
        })
        queryParams.query['bool']['must'] = [domainKeyJson];
    } else {
        queryParams.query['bool']['must'] = [domainKeyJson];
    }


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    $(".deviceListUl").html('');

    searchDevice(searchQuery, function (status, res) {
        if (status) {

            var resultData = searchQueryFormatterNew(res).data;
            device_list = resultData['data'];
            $(".deviceListUl").html('');
            if(device_list.length > 0){
                for (const element of device_list) {
                    $(".deviceListUl").append('<li class="deviceListLi" onclick="setDeviceId(\'' + element.id + '\')">' +
                        (element.name ? element.name : element.id) + ' | ' + element.modelId + ' | <b>' +
                        element.version +
                        '</b></li>');
                }
            }else{
                $('.deviceListUl').html(`<li class="deviceListLi" >No data found</li>`)
            }
         
        } else {
            device_list = []
            $('.deviceListUl').html(`<li class="deviceListLi" >No data found</li>`)
        }


    })


}

function setDeviceId(id) {
    current_device_id = id;
    $("#deviceID").val(id)
}

function searchQueryFormatter(data) {

    var resultObj = {
        total: 0,
        data: {},
        aggregations: {}
    }

    if (data.httpCode === 200) {

        var arrayData = JSON.parse(data.result);

        var totalRecords = arrayData.hits.total ? arrayData.hits.total.value : 0;
        var records = arrayData.hits.hits;

        var aggregations = arrayData.aggregations ? arrayData.aggregations : {};


        for (var i = 0; i < records.length; i++) {
            records[i]['_source']['_id'] = records[i]['_id'];
        }

        resultObj = {
            "total": totalRecords,
            "data": {
                "recordsTotal": totalRecords,
                "recordsFiltered": totalRecords,
                "data": _.pluck(records, '_source')
            },
            aggregations: aggregations
        }

        return resultObj;

    } else {

        return resultObj;
    }

}
