var deviceTable = null;device_list
var device_list = [];
var device_model_list = [];
var current_device_id = {};
var cmdTimer = {};


$(document).ready(function () {
    loadDeviceList();
    $("body").removeClass('bg-white');

});

function loadDeviceList() {


    if (deviceTable) {
        deviceTable.destroy();
        $("#deviceTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Device ID',
            sWidth: '10%',
            mRender: function (data, type, row) {

               return data + '<br><small class="text-grey">'+(row['name'] ? ''+row['name'] : '')+'</small>'
            }
        },
        {
            mData: 'modelId',
            sTitle: 'Device Model',
            sWidth: '10%',
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
            sWidth: '7%',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'reportedStamp',
            sTitle: 'Last Reported Time',
            sWidth: '12%',
            mRender: function (data, type, row) {
                return data ? moment(data).format('MM/DD/YYYY hh:mm a') : '-';
            }
        },
        {
            mData: 'registeredStamp',
            sTitle: 'Created Time',
            sWidth: '12%',
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

                return  '<button class="btn bskp-edit-btn mr-2" onclick="openModal(4,\'' + row["id"] + '\')" title="Board Configuration"> <img src="images/settings.svg" alt="">  </button>' +
                '<button class="btn bskp-edit-btn mr-2" onclick="openModal(2,\'' + row["id"] + '\')" title="Edit"><img src="images/edit_icon.svg" alt="">  </button>' +
                    '<button class="btn bskp-trash-btn" onclick="openModal(3,\'' + row['id'] + '\')"  title="Delete"> <img src="images/delete.svg" alt="">  </button>';
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
            aaSorting: [[6, 'desc']],
            "ordering": true,
            scrollY: '100px',
            scrollCollapse: true,
            iDisplayLength: 10,
            lengthMenu: [[10, 50, 100], [10, 50, 100]],
            dom: '<"bskp-search-left" f> lrtip',
            language: {
                "emptyTable": "No data available",
                "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
                "searchPlaceholder": "Search by Device ID",
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

                        var resData = searchQueryFormatterNew(data);
                        console.log(resData);
                        var resultData = resData.data;
                        device_list =resultData.data;     
                        console.log(device_list);
                        resultData['draw'] = oSettings.iDraw;

                        // $(".deviceCount").html(resData.aggregations.total_count.value);
                        $(".deviceCount").html(resData.total);

                        fnCallback(resultData);
                    }
                });
            }

        };

    deviceTable = $("#deviceTable").DataTable(tableOption);
    $('.dataTables_filter input').attr('maxlength', 100)
    $(".dataTables_scrollBody").removeAttr("style").css({"min-height":"calc(100vh - 425px)","position":"relative","width":"100%"});

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

function loadDeviceModels(check) {
    $("#device_model").html("");
    let devmodel;
    getDeviceModel(1000,function (status, data) {
        if(status && data.length > 0){
            device_model_list = data;

        //    check === 'update' ? '' : $("#device_model").append('<option value="newmodel">- Create New Model</option>') ;
            for(var i=0;i<data.length;i++){
               $("#device_model").append('<option value="'+data[i].id+'">'+data[i].id+'</option>');  
                if($("#device_model").val() === data[i].id){
                $("#device_version").html(data[i].description)
                $("#device_desc").html(data[i].description)
                }           
            }
            $("#device_model").select2({
                placeholder: '- Create New Model',
            });
            $("#device_model").val('').trigger('change')
            if($("#device_model").val() === 'newmodel' &&   check !== 'update'){
                togglemodel('newmodel');      
            }else{
                togglemodel('edit');
            }
            
        }else{
            device_model_list = [];
        }
    })
}






function openModal(type,id) {
    if (type === 1) {
        loadDeviceModels('');
        $(".new-model").removeClass('d-none');
        $(".new_device_model").val('');
        $("#addDevice").modal({
            backdrop: 'static',
            keyboard: false
        });
        $("#device_id").removeAttr('readonly');
        $("#device_model").removeAttr('readonly');
        $(".templateAction").html('Add');
        $("#addDevice form")[0].reset();
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit','addDevice()')
        
    }else if (type === 2) {
        $("#device_version").removeAttr('readonly');       
        $(".new-model").addClass('d-none');
        $("#device_model").removeAttr('disabled');
        $("#device_desc").removeAttr('readonly');
        $("#device_id").attr('readonly','readonly');
        loadDeviceModels('update');
        $(".templateAction").html('Update');
        var obj ={};
        current_device_id = id;
     
        $("#addDevice").modal({
            backdrop: 'static',
            keyboard: false
        });

        for(var i=0;i<device_list.length;i++){
            if(id === device_list[i].id){
                obj = device_list[i];
            }
        }
        setTimeout(() => {
            $("#device_id").val(obj.id);
            $("#device_name").val(obj.name);
             $("#device_model").val(obj.modelId);
            $("#device_version").val(obj.version);
            $("#device_desc").val(obj.description);
            $("#addDevice").modal('show');
            $("#addDevice form").attr('onsubmit','updateDevice()') 
        }, 440);
        
        
    }else if (type === 3) {
        current_device_id = id;
        $("#deleteModal").modal({
            backdrop: 'static',
            keyboard: false
        });
        $(".deviceId").html(id)
        $("#deleteModal").modal('show');
        
    }else if (type === 4) {
        current_device_id = id;
        retrieveDeviceProperty(id, DEVICE_PROPERTY_NAME[$("input[name='configType']:checked").val()],function (status, data) {
            if (status) {
                $("#board_config").val(data.value);
            }else{
                $("#board_config").val("");
                $("#board_config").css('height','90px');
            }
            $("#deviceSettings").modal('show');
        });
        $("#deviceSettings").modal({
            backdrop: 'static',
            keyboard: false
        });
    }
}

function saveSettings() {
    if($.trim($("#board_config").val()) === ""){
        errorMsgBorder('Board Configuration is required', 'board_config');
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
  if(choosemodel){
    var device_model =$.trim($("#device_model").val() );
  }else{
    var device_model =$.trim($("#new_device_model").val() );
  }
    var device_id =$.trim($("#device_id").val() );
    var device_name =$.trim($("#device_name").val() );
    var device_version =$.trim($("#device_version").val() );
    var device_desc =$.trim($("#device_desc").val() );

     if(!device_id){
        showFeedback('Device ID is required', 'device_id','logdevice_id');
        return false;
       
    }else if(!device_name){
   
        showFeedback('Device Name is required', 'device_name','logdevice_name');
        return false;
       
    }else if(!$("#device_model").val()){
        showSelectFeedback('Device Model is required', 'device_model','logdevice_model');
        return false;
    }else if(!device_model){
   
        showFeedback('Device Model is required', 'new_device_model','lognew_device_model');
        return false;
       
    }else if(!device_version){
   
        showFeedback('Device Version is required', 'device_version','logdevice_version');
        return false;
       
    
    }else if(!device_desc){
        showFeedback('Device Description is required', 'device_desc','logdevice_desc');
        return false;
       
    }else{    
  
        let modelstatus = true;
        let modeltext;
       // Device Model Create (or) Update

       var modelObj = {
            "id": device_model,
            "version": $("#device_version").val(),
            "description": $("#device_desc").val(),
        }
    console.log(modelmode);
    console.log(modelstatus);
    async.series({
        SameModelID: function (rmdcbk) {
            console.log("same");
        if( modelmode === 'new'){
         retreiveDeviceModel(modelObj.id, function (status, data) {
            if (status) {
                modelstatus =false;
                console.log("revif");
                $(".btnSubmit").removeAttr('disabled');
                errorMsgBorder('Device Model ID already exist', 'new_device_model');
                rmdcbk(null, true);
            }else{
                console.log("revelse");
                modelstatus =true;
                rmdcbk(null, false);
            }
         }) 
        }else{
            rmdcbk(null, false); 
        }
        },
        TriggerModelCreate: function (mdcbk){
            console.log(modelmode);
            console.log(modelstatus);
              // Allow if is not choose - Create Device Model  
          if(modelmode !== 'choose' && modelstatus){
            upsertDeviceModel(modelObj,function (status, data) {
              if(modelmode === 'new'){
                  modeltext = 'Creat'
               }
               else{
                  modeltext = 'Updat'
               }           
              if (status) {
                  successMsg('Device Model '+modeltext+'ed Successfully');
                  modelstatus =true;
                  mdcbk(null, true);
              } else {
                  errorMsg('Error in '+modeltext+'ing Device Model')
                  modelstatus =false;
                  mdcbk(null, false);
               }
              $(".btnSubmit").removeAttr('disabled');
             })
           }else{
            mdcbk(null, false);
           }
        },
        CreateDevice: function(Dcbk){
              // Device Create  
              if(modelstatus){
                console.log("dev creat");
                var deviceObj = {
                    "id": $("#device_id").val(),
                    "name": $("#device_name").val(),
                    "modelId": device_model,
                    "version": $("#device_version").val(),
                    "description": $("#device_desc").val(),
                    }
                    retreiveDevice(deviceObj.id, function (status, data) {
                    if (status) {
                        $(".btnSubmit").removeAttr('disabled');
                        errorMsgBorder('Device ID already exist', 'device_id');
                        Dcbk(null, false);
                    } else {
                        upsertDevice(deviceObj,function (status, data) {
                            if (status) {
                                successMsg('Device Created Successfully');
                                setTimeout(() => {
                                     loadDeviceList();
                                }, 1500);
                                $("#addDevice").modal('hide');
                                Dcbk(null, true);
                            } else {
                                errorMsg('Error in Creating Device')
                                Dcbk(null, false);
                            }
                            $(".btnSubmit").removeAttr('disabled');
                        })
                    }
                    })
                }else{
                    Dcbk(null, false);
                }
        }

    })    
        }  
     
}


function updateDevice() {
    $("#device_desc").css('height','90px');   
    var device_name =$.trim($("#device_name").val() );
    var device_version =$.trim($("#device_version").val() );    
    var device_desc =$.trim($("#device_desc").val() );
    var device_model =$.trim($("#device_model").val() );
    // var device_version =$.trim($("#device_version").val() );

    if(device_name === "" ){
         errorMsgBorder('Device ID is required', 'device_id');
        return false;  
    }else if(device_model === "" ){
         errorMsgBorder('Device Model is required', 'device_model');
        return false;
       
    }else if(device_version === "" ){
        errorMsgBorder('Device Version is required', 'device_version');
       return false;
      
   }else if(device_desc === "" ){
        errorMsgBorder('Description is required', 'device_desc');
       return false;
      
   }else{
        async.series({
        isModelUpdated: function (mdcbk) {
           if(modelmode === 'edit'){
            var deviceObj = {
                "id": $("#device_model").val(),
                "version": $("#device_version").val(),
                "decription": $("#device_desc").val(),
            }
        
            upsertDeviceModel(deviceObj, function (status, data) {
                if (status) {
                    successMsg('Device Model Updated Successfully');
                    mdcbk(null, true);
                    $("#addDevice").modal('hide');
                } else {
                    errorMsg('Error in Updating Device Model')
                    mdcbk(null, false);
                }
                $(".btnSubmit").removeAttr('disabled');
            })
           }else{
            mdcbk(null, false);
           }
        },
        isDeviceUpdated: function (dcbk) {
        var deviceObj = {
        "id": $("#device_id").val(),
        "name": $("#device_name").val(),
        "modelId": $("#device_model").val(),
        "version": $("#device_version").val(),
        "modeldecrip": $("#device_desc").val(),
        }               

        $(".btnSubmit").attr('disabled','disabled');

        upsertDevice(deviceObj, function (status, data) {
        if (status) {
            successMsg('Device Updated Successfully');
            dcbk(null, true);
            setTimeout(function () {
                loadDeviceList();
            },1500)
            
            $("#addDevice").modal('hide');
        } else {
            errorMsg('Error in Updating Device')
            dcbk(null, false);
        }
        $(".btnSubmit").removeAttr('disabled');
        })
        } 
    })
}
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
