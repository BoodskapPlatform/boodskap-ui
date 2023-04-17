var assetTable = null;
var asset_list = [];
var device_list = [];
var current_asset_id = null;

$(document).ready(function () {

    loadAssetList();
    $('.dataTables_filter input').attr('maxlength', 50);
    $("body").removeClass('bg-white');
    $('.help-url').attr('href',HELP_URL+"upsertasset");

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

                return '<div class="d-flex justify-content-between"><div style="max-width: 200px;" class="text-truncate" title="'+data+'">'+data+'</div><button class="btn bskp-edit-btn mr-2 ml-2 bskp-greyicon pull-right" onclick="openModal(4,\'' + row["id"] + '\')" title="Link Device">' +
                '<em class="icon-eye2"></em></button></div>';
            }
        },
        {
            mData: 'name',
            sTitle: 'Asset Name',
            sWidth: '20%',
            orderable: false,
            mRender: function (data, type, row) {
                return '<div style="max-width: 200px;" class="text-truncate" title="'+data+'">'+data+'</div>';
            }
        },
        {
            mData: 'description',
            sTitle: 'Description',
            sWidth: '35%',
            orderable: false,
            mRender: function (data, type, row) {

                data = data.replace(/&/g, "&amp");
                data = data.replace(/</g, "&lt");
                data = data.replace(/>/g, "&gt");

                return '<div style="max-width: 500px;" class="text-truncate" title="'+data+'">'+data+'</div>';

            }
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

    var queryParams = {
        query: {
            "bool": {
                "must": [],
                "should":[]
            }
        },
        sort: []
    };
    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

        var tableOption = {
        responsive: false,
        autoWidth: false,
        paging: true,
        aaSorting: [[3, 'desc']],
        aoColumns: fields,
        searchable: true,
        "ordering": true,
        // scrollY: '100px',
        scrollCollapse: true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
                       dom: '<"bskp-search-left" f> lrtip',
            language: {
                "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
             "searchPlaceholder": "Search Asset ID",
             "zeroRecords": "No data available",
             "emptyTable":"No data available",
                loadingRecords: '',
                paginate: {
                    previous: '< Prev',
                    next: 'Next >'
                },

            },
        "bServerSide": true,
        "bProcessing": true,
        "sAjaxSource": API_BASE_PATH + "/elastic/search/query/" + API_TOKEN_ALT ,
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
                queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query.bool.should.push({
                    "match_phrase": {
                        "id": searchText
                    }
                })

                queryParams.query['bool']["minimum_should_match"]=1;

            } 
            queryParams.query['bool']['must'] = [domainKeyJson];

            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : 'ASSET'
            };
            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {
                    let resultData
                    if (data.httpCode == 200) {
                    let finalData = searchQueryFormatterNew(data)
                     resultData = finalData.data;
                        $(".assetCount").html(finalData.total)
                        asset_list = resultData.data;
                    } else {
                        $(".assetCount").html(0);
                        asset_list = [];
                    }
                   
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };
    assetTable = $("#assetTable").DataTable(tableOption);
    $('.dataTables_filter input').attr('maxlength', 100);
    // $(".dataTables_scrollBody").removeAttr("style").css({"min-height":"calc(100vh - 425px)","position":"relative","width":"100%"});
}


function openModal(type, id) {
    defaultStyle()
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

        for (const element of asset_list) {
            if (id === element.id) {
                obj = element;
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
        $('#deviceID').val('')
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
        errorMsgBorder('Device ID is required','dropdownMenu1')
    }else{
        $("#linkDeviceBtn").html('<i class="fa fa-spinner fa-spin"></i> Processing..').attr('disabled','disabled')
        assetLink(current_asset_id, $("#deviceID").val(), function (status, data) {
        if (status) {
            successMsg('Device Linked Successfully');
            loadLinkedDevices(current_asset_id);
        } else {
            console.log(data.responseJSON.message)
            if(data.responseJSON.message == 'device:'+$("#deviceID").val()+' is already linked'){
                errorMsg('Device ID already linked')
            }else{
                errorMsg('Error in Linking Device')
            }
        }
        $('#deviceID').val('')
        $("#linkDeviceBtn").html('Link Device').attr('disabled',false)
        });
      }
}

function unlinkDevice(id) {
    assetUnLink(current_asset_id, id, function (status, data) {
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
            if(device_list.length > 0){
                for (const element of device_list) {
                    $("#linkedTable tbody").append('<tr>' +
                        '<td>' + element.id + '<br><small class="text-grey">'+element.name+'</small></td>' +
                        '<td>' + element.modelId + '</td>' +
                        '<td>' + element.version + '</td>' +
                        '<td><button class="btn bskp-edit-btn  bskp-greyicon mr-2" title="Unlink device" onclick="unlinkDevice(\'' + element.id + '\',\''+id+'\')"><em class="icon-unlink"></em></button> </td>' +
                        '</tr>');
                }
            }else{
                $("#linkedTable tbody").append('<tr><td colspan=4 class="text-center">No data available </td></tr>')

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
        showFeedback('Asset ID is required','asset_id','logasset_id');
        return false;
    }else if(asset_name == ""){
        showFeedback('Asset Name is required','asset_name','logasset_name');
        return false;
    } else if(asset_desc == ""){
        showFeedback('Description is required','asset_desc','logasset_desc');
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
            showFeedback('Asset ID already exist', 'asset_id','logasset_id');
        } else {
            upsertAsset(assetObj, function (status, data) {
                if (status) {
                    successMsg('Asset Created Successfully');
                    setTimeout(() => {
                     loadAssetList();
                    }, 1500);
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


