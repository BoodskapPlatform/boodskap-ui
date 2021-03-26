var deviceTable = null;
var device_list = [];
var device_model_list = [];
var current_device_id = {};
var cmdTimer = {};

$(document).ready(function () {

    loadDeviceList();

    $("body").removeClass('bg-white');

});




function loadDeviceList() {

    const self = this;


    if (deviceTable) {
        deviceTable.destroy();
        $("#deviceTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Device Id',
            mRender: function (data, type, row) {

               return data + '<br><small class="text-grey">'+(row['name'] ? ''+row['name'] : '')+'</small>'
            }
        },
        {
            mData: 'modelId',
            sTitle: 'Device Model',
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'version',
            sTitle: 'Version',
            sWidth: '5%',
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'channel',
            sTitle: 'Channel',
            sWidth: '5%',
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'nodeId',
            sTitle: 'Node Id',
            sWidth: '10%',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'reportedStamp',
            sTitle: 'Last Reported Time',
            sWidth: '15%',
            mRender: function (data, type, row) {
                return data ? moment(data).format('MM/DD/YYYY hh:mm a') : '-';
            }
        },
        {
            mData: 'registeredStamp',
            sTitle: 'Created Time',
            sWidth: '15%',
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(4,\'' + row["id"] + '\')" title="Board Configuration"><i class="icon-cog"></i></button>' +
                '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(2,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];


    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [{"reportedStamp": {"order": "desc"}}];

    var queryParams = {
        query: {
            "bool": {
                "must": [],
            }
        },
        sort: [],
    };


    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
            responsive: true,
            paging: true,
            searching: true,
            aaSorting: [[5, 'desc']],
            "ordering": true,
            iDisplayLength: 10,
            lengthMenu: [[10, 50, 100], [10, 50, 100]],
            aoColumns: fields,
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

                    queryParams.query['bool']['should'].push({"wildcard" : { "id" : "*"+searchText.toLowerCase()+"*" }})
                    queryParams.query['bool']['should'].push({"wildcard" : { "modelId" : "*"+searchText.toLowerCase()+"*" }})
                    queryParams.query['bool']['should'].push({"wildcard" : { "version" : "*"+searchText.toLowerCase()+"*" }})
                    queryParams.query['bool']['should'].push({"wildcard" : { "channel" : "*"+searchText.toLowerCase()+"*" }})
                    queryParams.query['bool']["minimum_should_match"]=1;

                }
                    queryParams.query['bool']['must'] = [domainKeyJson];


                var ajaxObj = {
                    "method": "GET",
                    "extraPath": "",
                    "query": JSON.stringify(queryParams),
                    "params": [],
                    type : 'DEVICE'
                };


                oSettings.jqXHR = $.ajax({
                    "dataType": 'json',
                    "contentType": 'application/json',
                    "type": "POST",
                    "url": sSource,
                    "data": JSON.stringify(ajaxObj),
                    success: function (data) {

                        var resultData = searchQueryFormatterNew(data).data;
                        device_list =resultData.data;
                        resultData['draw'] = oSettings.iDraw;
                        $(".deviceCount").html(resultData.recordsTotal);


                        fnCallback(resultData);
                    }
                });
            }

        };

    deviceTable = $("#deviceTable").DataTable(tableOption);
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
            // data : _.pluck(records, '_source')
        }


        return resultObj;

    } else {

        return resultObj;
    }

}

function loadDeviceModels() {
    $("#device_model").html("");
    getDeviceModel(1000,function (status, data) {
        if(status && data.length > 0){
            device_model_list = data;
            for(var i=0;i<data.length;i++){

                $("#device_model").append('<option value="'+data[i].id+'">'+data[i].id+'</option>')
            }
        }else{
            device_model_list = [];
        }
    })
}

function assignVersion() {
    for(var i=0;i<device_model_list.length;i++){
        if($("#device_model").val() === device_model_list[i].id){
            $("#device_version").val(device_model_list[i].version);
        }
    }
}

function openModal(type,id) {
    if (type === 1) {
        loadDeviceModels();
        $("#device_id").removeAttr('readonly');
        $(".templateAction").html('Create');
        $("#addDevice form")[0].reset();
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit','addDevice()')
    }else if (type === 2) {
        loadDeviceModels();
        $(".templateAction").html('Update');
        var obj ={};
        current_device_id = id;

        for(var i=0;i<device_list.length;i++){
            if(id === device_list[i].id){
                obj = device_list[i];
            }
        }
        $("#device_id").attr('readonly','readonly');
        $("#device_id").val(obj.id);
        $("#device_name").val(obj.name);
        $("#device_model").val(obj.modelId);
        $("#device_version").val(obj.version);
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit','updateDevice()')
    }else if (type === 3) {
        current_device_id = id;
        $(".deviceId").html(id)
        $("#deleteModal").modal('show');
    }else if (type === 4) {
        current_device_id = id;
        retrieveDeviceProperty(id, DEVICE_PROPERTY_NAME[$("input[name='configType']:checked").val()],function (status, data) {
            if (status) {
                $("#board_config").val(data.value);
            }else{
                $("#board_config").val("");
            }
            $("#deviceSettings").modal('show');
        });
    }
}

function saveSettings() {
    if($.trim($("#board_config").val()) === ""){
        errorMsgBorder('Configuration cannot be empty', 'board_config');
        return false;
    }

    var propObj = {
        "name": DEVICE_PROPERTY_NAME[$("input[name='configType']:checked").val()],
        "value": $.trim($("#board_config").val()),
        "deviceId": current_device_id
    }
    $(".btnSubmit").attr('disabled','disabled');

    upsertDeviceProperty(propObj, function (status, data) {
        if (status) {
            successMsg('Device Configuration Saved Successfully');
            $("#deviceSettings").modal('hide');
        }else{
            errorMsg('Error in saving Device Configuration')
        }
        $(".btnSubmit").removeAttr('disabled');

    });

}

function checkConfig() {
    retrieveDeviceProperty(current_device_id, DEVICE_PROPERTY_NAME[$("input[name='configType']:checked").val()],function (status, data) {
        if (status) {
            $("#board_config").val(data.value);
        }else{
            $("#board_config").val("");
        }
    });
}


function addDevice() {

    var deviceObj = {
        "id": $("#device_id").val(),
        "name": $("#device_name").val(),
        "modelId": $("#device_model").val(),
        "version": $("#device_version").val(),
    }

    $(".btnSubmit").attr('disabled','disabled');

    retreiveDevice(deviceObj.id, function (status, data) {
        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('Device ID already exist', 'device_id');
        } else {
            upsertDevice(deviceObj,function (status, data) {
                if (status) {
                    successMsg('Device Created Successfully');
                
                    setTimeout(function () {
                        loadDeviceList();
                    },500)
                    $("#addDevice").modal('hide');
                } else {
                    errorMsg('Error in Creating Device')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
}


function updateDevice() {

    var deviceObj = {
        "id": $("#device_id").val(),
        "name": $("#device_name").val(),
        "modelId": $("#device_model").val(),
        "version": $("#device_version").val(),
    }

    $(".btnSubmit").attr('disabled','disabled');

    upsertDevice(deviceObj, function (status, data) {
        if (status) {
            successMsg('Device Updated Successfully');
           
            setTimeout(function () {
                loadDeviceList();
            },500)
            
            $("#addDevice").modal('hide');
        } else {
            errorMsg('Error in Updating Device')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    deleteDevice(current_device_id,function (status, data) {
        if (status) {
            successMsg('Device Deleted Successfully');
            setTimeout(function () {
                loadDeviceList();
            },500)
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}

function uploadConfig() {
    var obj = {
        target: 'DEVICE',
        deviceId: current_device_id
    };
    var cid = $("input[name='configType']:checked").val() === 'device' ? 5 : 6;
    sendCommandProperty(current_device_id, cid, DEVICE_PROPERTY_NAME[$("input[name='configType']:checked").val()], obj,function (status, data) {
        if (status) {

            $(".timer_result").append('<p style="margin-bottom: 5px"><label>Upload Command:</label> '+moment().format('MM/DD/YYYY hh:mm:ss a')+' <span class="label label-warning">Message Queued</span></p>');

            cmdTimer['upload_'+data['corrId']] = setInterval(function () {
                checkCommandStatus(data['corrId'],1);
            },3000);
            checkCommandStatus(data['corrId'],1);

        } else {
            errorMsg('Error in uploading config');
        }
    })
}

function downloadConfig() {
    // var strObj = JSON.stringify({'_TYPE_': typeId})
    var typeId = $("input[name='configType']:checked").val() === 'device' ? 2 : 1;

    var strObj = JSON.stringify({'_TYPE_': typeId});
    var cid = 4;
    sendCommandTemplate(current_device_id, cid, TEMPLATES['CONFIG_CMD'], true, strObj,function (status, data) {
        if (status) {
            $(".timer_result").append('<p style="margin-bottom: 3px"><label>Download Command:</label> '+moment().format('MM/DD/YYYY hh:mm:ss a')+' <span class="label label-warning">Message Queued</span></p>');

            cmdTimer['download_'+data['corrId']] = setInterval(function () {
                checkCommandStatus(data['corrId'],2);
            },3000);
            checkCommandStatus(data['corrId'],2);
        } else {
            errorMsg('Error in downloading config');
        }
    })
}

function checkCommandStatus(corid, type) {

    $(".timer_result").css('height','100px');

    var objStatus = {
        'SENT': 'info',
        'FAILED': 'danger',
        'ACKED': 'success',
        'NACKED': 'danger',
        'TIMEDOUT': 'default',
        'QUEUED': 'warning',
    };

    var objNames = {
        'QUEUED': 'MESSAGE QUEUED',
        'SENT': 'MESSAGE SENT',
        'FAILED': 'FAILED',
        'ACKED': 'DELIVERED',
        'NACKED': 'UNKNOWN Action',
        'TIMEDOUT': 'TIMED OUT'
    };

    var cmd_type = type === 1 ? 'Upload Command' : 'Download Command';
    var cmd_timer = type === 1 ? 'upload_'+corid : 'download_'+corid;


    getCommandStatus(current_device_id,corid,function (status, res) {
        if (status) {

            var status = res.status.toString();
            var channel = res['dataChannel'].toString();


            if (channel === 'UDP' || channel === 'FCM') {
                if (res['sentStamp']) {
                    var now = moment();
                    var then = moment(res['sentStamp']);

                    var timeDiff = moment.duration(now.diff(then))._milliseconds;

                    if (timeDiff > 10000) {
                        status = 'TIMEDOUT';
                    }

                }
            }

            $(".timer_result").append('<p style="margin-bottom: 3px"><label>'+cmd_type+'</label>: '+moment().format('MM/DD/YYYY hh:mm:ss a')+' <span class="label label-' + objStatus[status] + '">' + objNames[status] + '</span></p>');

            if (status === "FAILED" || status === "ACKED" || status === "NACKED" || status === "TIMEDOUT") {

                clearInterval(cmdTimer[cmd_timer]);

            }

        } else {

            $(".timer_result").append('<p style="margin-bottom: 3px"><label>'+cmd_type+'</label>: '+moment().format('MM/DD/YYYY hh:mm:ss a')+' <span class="label label-default">TIMEDOUT</span></p>');

            clearInterval(cmdTimer[cmd_timer]);

        }
    });
}