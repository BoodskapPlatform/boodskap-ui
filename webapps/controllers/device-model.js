var deviceModelTable = null;
var current_device_model_id = {};
var device_model_list = [];


$(document).ready(function () {

    loadDeviceModelList();

    $("body").removeClass('bg-white');
    $('.help-url').attr('href',HELP_URL+"listdevices");
});

function loadDeviceModelList() {

    if (deviceModelTable) {
        deviceModelTable.destroy();
        $("#deviceModelTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Model ID',
            mRender: function (data, type, row) {

                var val = data ? data : '-';
                return "<div style='max-width: 150px;' class='text-truncate' title='"+val+"'>"+val+"</div>"
            }
        },
        {
            mData: 'version',
            sTitle: 'Version',
            orderable: false,
            mRender: function (data, type, row) {

                var val = data ? data : '-';
                return "<div style='max-width: 150px;' class='text-truncate' title='"+val+"'>"+val+"</div>"
            }
        },
        {
            mData: 'description',
            sTitle: 'Description',
            orderable: false,
            mRender: function (data, type, row) {

                var val = data ? data : '-';
                return "<div style='max-width: 150px;' class='text-truncate' title='"+val+"'>"+val+"</div>"
            }
            
        },
        {
            mData: 'registeredStamp',
            sTitle: 'Created Time',
            orderable: true,
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '12%',
            mRender: function (data, type, row) {

                return '<button class="btn bskp-edit-btn mr-2" onclick="openModal(4,\'' + row["id"] + '\')" title="Board Configuration">  <img src="images/settings.svg" alt=""> </button>' +
                    '<button class="btn bskp-edit-btn mr-2" onclick="openModal(2,\'' + row["id"] + '\')" title="Edit"> <img src="images/edit_icon.svg" alt=""> </button>' +
                    '<button class="btn bskp-trash-btn" onclick="openModal(3,\'' + row['id'] + '\')" title="Delete">  <img src="images/delete.svg" alt=""> </button>';
            }
        }

    ];

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [{"reportedStamp": {"order": "desc"}}];
    var queryParams = {
        query: {
            "bool": {
                "must": [],
                "should" : []
            }
        },
        sort: [],
        "aggs":{
            "total_count": {
                "value_count": {
                    "field": "reportedStamp"
                }
            },
        }
    };


    var tableOption = {
            responsive: true,
            paging: true,
            searching: true,
            aaSorting: [[3, 'asc']],
            "ordering": true,
            scrollY: '100px',
            scrollCollapse: true,   
            iDisplayLength: 10,
            lengthMenu: [[10, 50, 100], [10, 50, 100]],
            dom: '<"bskp-search-left" f> lrtip',
            language: {
                "emptyTable": "No data available",
                "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
                "searchPlaceholder": "Search here",
                loadingRecords: '',
                paginate: {
                    previous: '< Prev',
                    next: 'Next >'
                }
            },
            aoColumns: fields,
            "bProcessing": true,
            "bServerSide": true,
            "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN_ALT,
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
                    queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText.toLowerCase() + "*" } });
                    queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText.toUpperCase() + "*" } });
                    queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + capitalizeFLetter(searchText) + "*" } })
                    queryParams.query.bool.should.push({
                        "match_phrase": {
                            "id": searchText
                        }
                    })

                    queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + searchText.toLowerCase() + "*" } });
                    queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + searchText.toUpperCase() + "*" } });
                    queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + capitalizeFLetter(searchText) + "*" } })
                    queryParams.query.bool.should.push({
                        "match_phrase": {
                            "version": searchText
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
                    type : 'DEVICE_MODEL'
                };

                oSettings.jqXHR = $.ajax({
                    "dataType": 'json',
                    "contentType": 'application/json',
                    "type": "POST",
                    "url": sSource,
                    "data": JSON.stringify(ajaxObj),
                    success: function (data) {
                        var resData = searchQueryFormatterNew(data);
                        var resultData = resData.data;
                        device_model_list =resultData.data;     
                        resultData['draw'] = oSettings.iDraw;

                        // $(".deviceCount").html(resData.aggregations.total_count.value);
                        $(".deviceModelCount").html(resData.total);

                        fnCallback(resultData);
                    },
                    error: function(e){
                        //console.log("e------------->",e);
                    } 
                });
            }

        };
   
        deviceModelTable = $("#deviceModelTable").DataTable(tableOption);
        $('.dataTables_filter input').attr('maxlength', 100);
        $(".dataTables_scrollBody").removeAttr("style").css({"min-height":"calc(100vh - 425px)","position":"relative","width":"100%","border-bottom":"0px"});

}




function openModal(type,id) {
    current_device_model_id = id;
    if (type === 1) {
        $(".error-msg").html("");
        $("#addDevice").modal({
            backdrop: 'static',
            keyboard: false
        });
        $("#device_id").removeAttr('readonly');
        $(".templateAction").html('Add');
        $("#addDevice form")[0].reset();
        $("#addDevice").modal('show');
        $("#device_desc").css("height","90");
        $("#addDevice form").attr('onsubmit','addDevice()')
        $(".form-control").removeClass("error-box");
    }else if (type === 2) {
        $("#device_desc").css('height','90px');
        $(".error-msg").html("");
        $(".form-control").removeClass("error-box");
        $("#addDevice").modal({
            backdrop: 'static',
            keyboard: false
        });
        $(".templateAction").html('Update');
        var obj ={};
        for(var i=0;i<device_model_list.length;i++){
            if(id === device_model_list[i].id){
                obj = device_model_list[i];
            }
        }
        $("#device_id").attr('readonly','readonly');
        $("#device_id").val(obj.id);
        $("#device_desc").val(obj.description);
        $("#device_version").val(obj.version);
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit','updateDevice()')
        
    }else if (type === 3) {
        $("#deleteModal").modal({
            backdrop: 'static',
            keyboard: false
        });
        $(".deviceId").html(id)
        $("#deleteModal").modal('show');
        
    }else if (type === 4) {

        retrieveDeviceModelProperty(id, DEVICE_PROPERTY_NAME['device'],function (status, data) {
            if (status) {
                $("#board_config").val(data.value);
            }else{
                $("#board_config").val("");
                $("#board_config").css("height","90");
            }
            $("#deviceSettings").modal('show');
        });
        $("#deviceSettings").modal({
            backdrop: 'static',
            keyboard: false
        });
    }
}


function addDevice() {
    $("#device_desc").css('height','90px !important');
    var device_id =$.trim($("#device_id").val() );
    var device_version =$.trim($("#device_version").val() );
    var device_desc =$.trim($("#device_desc").val() );

    if(device_id === "" ){
   
        showFeedback('Model ID is required', 'device_id','logdevice_id');
        return false;
       
    }else if(device_version === "" ){
   
        showFeedback('Model Version is required', 'device_version','logdevice_version');
        return false;
       
    // }else if(device_desc === "" ){
   
    //     showFeedback('Description is required', 'device_desc','logdevice_desc');
    //     return false;
       
    } else {

    var deviceObj = {
        "id": $("#device_id").val(),
        "description": $("#device_desc").val(),
        "version": $("#device_version").val(),
    }

    retreiveDeviceModel(deviceObj.id, function (status, data) {
        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('Device Model ID already exist', 'device_id');
        } else {
            
            upsertDeviceModel(deviceObj,function (status, data) {
                if (status) {
                    successMsg('Device Model Created Successfully');
                    loadDeviceModelList();
                    $("#addDevice").modal('hide');
                } else {
                    errorMsg('Error in Creating Device Model')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
    }
}


function updateDevice() {
    var device_id =$.trim($("#device_id").val() );
    var device_version =$.trim($("#device_version").val() );
    var device_desc =$.trim($("#device_desc").val() );

    if(device_id === "" ){
   
        showFeedback('Model ID is required', 'device_id','logdevice_id');
        return false;
       
    }else if(device_version === "" ){
   
        showFeedback('Model Version is required', 'device_version','logdevice_version');
        return false;
       
    }else if(device_desc === "" ){
   
        showFeedback('Description is required', 'device_desc','logdevice_desc');
        return false;
       
    }else {
        var deviceObj = {
            "id": device_id,
            "description": device_desc,
            "version": device_version,
        }
        $(".btnSubmit").attr('disabled','disabled');
        upsertDeviceModel(deviceObj, function (status, data) {
            if (status) {
                successMsg('Device Model Updated Successfully');
                loadDeviceModelList();
                $("#addDevice").modal('hide');
            } else {
                errorMsg('Error in Updating Device Model')
            }
            $(".btnSubmit").removeAttr('disabled');
        })
    }    
}


function proceedDelete() {
    deleteDeviceModel(current_device_model_id,function (status, data) {
        if (status) {
            successMsg('Device Model Deleted Successfully');
            loadDeviceModelList();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}


function saveSettings() {
    if($.trim($("#board_config").val()) === ""){
        errorMsgBorder('Board Configuration is required', 'board_config');
        return false;
    }

    var propObj = {
        "name": DEVICE_PROPERTY_NAME['device'],
        "value": $.trim($("#board_config").val()),
        "deviceModelId": current_device_model_id
    }
    $(".btnSubmit").attr('disabled','disabled');

    upsertDeviceModelProperty(propObj, function (status, data) {
        if (status) {
            successMsg('Device Model Configuration Saved Successfully');
            $("#deviceSettings").modal('hide');
        }else{
            errorMsg('Error in saving Device Model Configuration')
        }
        $(".btnSubmit").removeAttr('disabled');

    });

}