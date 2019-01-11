var simTable = null;
var current_device_model_id = null;
var sim_list = [
    {imei: '504358391043364', provider: 'AIRTEL', device:'', status:true, updatedtime: new Date(moment().subtract(5,'hours')).getTime()},
    {imei: '449406883768424', provider: 'VODAFONE', device:'', status:false, updatedtime: new Date(moment().subtract(3,'hours')).getTime()},
    {imei: '339486293540228', provider: 'AT&T', device:'', status:true, updatedtime: new Date(moment().subtract(1,'hours')).getTime()}];


$(document).ready(function () {

    loadSimList();

    $("body").removeClass('bg-white');

});


function loadSimList() {


    if (simTable) {
        simTable.destroy();
        $("#simTable").html("");
    }

    var fields = [
        {
            mData: 'checkbox',
            sTitle: '<input type="checkbox" name="tableCheck[]" value="" />',
            orderable: false,
            sWidth:'2%',
            mRender: function (data, type, row) {
                return '<input type="checkbox" name="tableCheck[]" value="" />';
            }
        },
        {
            mData: 'imei',
            sTitle: 'IMEI',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>'+data+'</b>' : '-';
            }
        },
        {
            mData: 'provider',
            sTitle: 'Network Provider',
            orderable: true,
        },
        {
            mData: 'device',
            sTitle: 'Device Id',
            orderable: true,
            mRender: function (data, type, row) {
               return data ? data : '<small><i>No Device Associated</i></small><br><a href="javascript:void(0)" style="color:#333;"><i class="icon-hdd-o"></i> Associate Device</a>';
            }
        },
        {
            mData: 'status',
            sTitle: 'Provisioned',
            orderable: false,
            mRender: function (data, type, row) {
                if(data){
                    return '<span class="label label-success">PROVISIONED</span>'
                }else{
                    return '<span class="label label-default">NOT PROVISIONED</span>'
                }
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Updated Time',
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

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')" title="Settings"><i class="icon-cog"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
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
        aaSorting: [[3, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        data: sim_list
    };

    $(".simCount").html(sim_list.length)
    simTable = $("#simTable").DataTable(tableOption);


}


function openModal(type, id) {
    current_device_model_id = id;
    if (type === 1) {
        $("#device_id").removeAttr('readonly');
        $(".templateAction").html('Create');
        $("#addDevice form")[0].reset();
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit', 'addDevice()')
    } else if (type === 2) {
        $(".templateAction").html('Update');
        var obj = {};
        for (var i = 0; i < sim_list.length; i++) {
            if (id === sim_list[i].id) {
                obj = sim_list[i];
            }
        }
        $("#device_id").attr('readonly', 'readonly');
        $("#device_id").val(obj.id);
        $("#device_desc").val(obj.description);
        $("#device_version").val(obj.version);
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit', 'updateDevice()')
    } else if (type === 3) {
        $(".deviceId").html(id)
        $("#deleteModal").modal('show');
    } else if (type === 4) {

        retrieveDeviceModelProperty(id, DEVICE_PROPERTY_NAME['device'], function (status, data) {
            if (status) {
                $("#board_config").val(data.value);
            } else {
                $("#board_config").val("");
            }
            $("#deviceSettings").modal('show');
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
            upsertDeviceModel(deviceObj, function (status, data) {
                if (status) {
                    successMsg('Device Model Created Successfully');
                    loadSimList();
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
            loadSimList();
            $("#addDevice").modal('hide');
        } else {
            errorMsg('Error in Updating Device Model')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    deleteDeviceModel(current_device_model_id, function (status, data) {
        if (status) {
            successMsg('Device Model Deleted Successfully');
            loadSimList();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}


function saveSettings() {
    if ($.trim($("#board_config").val()) === "") {
        errorMsgBorder('Configuration cannot be empty', 'board_config');
        return false;
    }

    var propObj = {
        "name": DEVICE_PROPERTY_NAME['device'],
        "value": $.trim($("#board_config").val()),
        "deviceModelId": current_device_model_id
    }
    $(".btnSubmit").attr('disabled', 'disabled');

    upsertDeviceModelProperty(propObj, function (status, data) {
        if (status) {
            successMsg('Device Model Configuration Saved Successfully');
            $("#deviceSettings").modal('hide');
        } else {
            errorMsg('Error in saving Device Model Configuration')
        }
        $(".btnSubmit").removeAttr('disabled');

    });

}