var deviceModelTable = null;
var current_device_model_id = null;
var device_model_list = [];


$(document).ready(function () {

    loadDeviceModelList();

    $("body").removeClass('bg-white');

});



function loadDeviceModelList() {


    if (deviceModelTable) {
        deviceModelTable.destroy();
        $("#deviceModelTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Model Id',
            orderable: true,
        },
        {
            mData: 'version',
            sTitle: 'Version',
            orderable: true,
        },
        {
            mData: 'description',
            sTitle: 'Description',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'registeredStamp',
            sTitle: 'Created Time',
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
                    '<button class="btn bskp-edit-btn mr-2" onclick="openModal(2,\'' + row["id"] + '\')"> <img src="images/edit.svg" alt=""> </button>' +
                    '<button class="btn bskp-trash-btn" onclick="openModal(3,\'' + row['id'] + '\')">  <img src="images/trash2.svg" alt=""> </button>';
            }
        }

    ];



    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        searching: true,
        dom: '<"bskp-search-left" f> lrtip',
        language: {
            "emptyTable": "No data available",
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search by Model Id",
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        aaSorting: [[3, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        data : []
    };

    getDeviceModel(1000,function (status, data) {
        if(status && data.length > 0){
            tableOption['data'] = data;
            device_model_list = data;
            $(".deviceModelCount").html(data.length)
        }else{
            $(".deviceModelCount").html(0)
        }

        deviceModelTable = $("#deviceModelTable").DataTable(tableOption);
    })





}



function openModal(type,id) {
    current_device_model_id = id;
    if (type === 1) {
        $("#addDevice").modal({
            backdrop: 'static',
            keyboard: false
        });
        $("#device_id").removeAttr('readonly');
        $(".templateAction").html('Add');
        $("#addDevice form")[0].reset();
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit','addDevice()')
        
    }else if (type === 2) {
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


function updateDevice() {

    var deviceObj = {
        "id": $("#device_id").val(),
        "description": $("#device_desc").val(),
        "version": $("#device_version").val(),
    }

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
        errorMsgBorder('Configuration cannot be empty', 'board_config');
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