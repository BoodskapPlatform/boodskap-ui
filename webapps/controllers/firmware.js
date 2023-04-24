var firmwareTable = null;
var current_firmware_version = null;
var current_firmware_obj = null;
var current_device_id = null;
var firmware_list = []
var device_list = []


$(document).ready(function () {

    loadDeviceModels();
    //loadFirmwareList();


    $("body").removeClass('bg-white');
    $('.help-url').attr('href',HELP_URL+"uploadfirmware");

});


function loadDeviceModels() {
    $("#deviceModel").html('');
    $("#deviceModel").html('<option value="">All</option>');

    getDeviceModel(1000, function (status, data) {
        if (status && data.length > 0) {
            $("#f_device_model").html('<option value="" selected>Select Model</option>');

            for (var i = 0; i < data.length; i++) {
                $("#deviceModel").append('<option value="' + data[i].id + '">' + data[i].id + ' | ' + data[i].version + '</option>')
                $("#f_device_model").append('<option value="' + data[i].id + '">' + data[i].id + ' | ' + data[i].version + '</option>')
            }
            // $("#deviceModel").val(data[0].id);

        } else {
            $("#deviceModel").html('<option value="">No Device Linked</option>')
            $("#f_device_model").html('<option value="">No Model Found</option>')
        }

        loadFirmwareList();

    })
}

function loadFirmwareList() {


    if (firmwareTable) {
        firmwareTable.destroy();
        $("#firmwareTable").html("");
    }

    var fields = [
        {
            mData: 'fileName',
            orderable: false,
            sTitle: 'File Name',
            mRender: function (data, type, row) {
                return data +
                    '<button class=" btn bskp-edit-btn mr-3 pull-right" onclick="openModal(2,\'' + row["_id"] + '\')" ' +
                    'title="Upload to Device"><img src="images/menu/upload.svg" class="importimg" alt=""></button>';
            }
        },
        {
            mData: 'version',
            orderable: false,
            sTitle: 'Version'
        },
        {
            mData: 'deviceModel',
            orderable: false,
            sTitle: 'Device Model'
        },
        {
            mData: 'contentType',
            orderable: false,
            sTitle: 'Content Type'
        },
        {
            mData: 'description',
            orderable: false,
            sTitle: 'Description'
        },
        {
            mData: 'createdAt',
            sTitle: 'Created Time',
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
                return '' +
                    '<button class="btn bskp-edit-btn mr-2" onclick="openModal(3,\'' + row["_id"] + '\')" title="Download"><img src="images/menu/download.svg" class="downloadimg" alt=""></button>' +
                    '<button class="btn bskp-trash-btn" onclick="openModal(4,\'' + row['_id'] + '\')" title="Delete"><img src="images/delete.svg" alt=""></button>';
            }

        }

    ];

  
    /* var tableOption = {
        responsive: true,
        paging: true,
        searching: true,
        dom: '<"bskp-search-left" f> lrtip',
        language: {
            "emptyTable": "No data available",
            "zeroRecords": "No data available",
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search here",
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        "ordering": true,
        aaSorting: [[0, 'desc']],
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        data: []
    }; */


    var domainKeyJson = { "match": { "domainKey": DOMAIN_KEY } };

    var queryParams = {
        query: {
            "bool": {
                "must": [],
                "should": [],
            }
        },
        sort: []
    };

    var tableOption = {
        responsive: true,
        paging: true,
        searching: true,
        aaSorting: [[5, 'desc']],
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
            sortingJson[keyName['mData']] = { "order": oSettings.aaSorting[0][1] };
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {
                // var searchJson = {
                //     "multi_match": {
                //         "query": '*' + searchText + '*',
                //         "type": "phrase_prefix",
                //         "fields": ['_all']
                //     }
                // };
                queryParams.query.bool['minimum_should_match'] = 1;

                queryParams.query['bool']['should'].push({ "wildcard": { "fileName": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "fileName": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "fileName": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "fileName": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query.bool.should.push({
                    "match_phrase": {
                        "fileName": searchText
                    }
                })
                queryParams.query['bool']['should'].push({
                    "match_phrase_prefix": {
                        "fileName": {
                            "query": "*" + searchText + "*"
                        }
                    }
                })

                queryParams.query['bool']['should'].push({ "wildcard": { "contentType": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "contentType": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "contentType": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "contentType": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query.bool.should.push({
                    "match_phrase": {
                        "contentType": searchText
                    }
                })
                queryParams.query['bool']['should'].push({
                    "match_phrase_prefix": {
                        "contentType": {
                            "query": "*" + searchText + "*"
                        }
                    }
                })

                queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "version": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query.bool.should.push({
                    "match_phrase": {
                        "version": searchText
                    }
                })
                queryParams.query['bool']['should'].push({
                    "match_phrase_prefix": {
                        "version": {
                            "query": "*" + searchText + "*"
                        }
                    }
                })

                queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query.bool.should.push({
                    "match_phrase": {
                        "description": searchText
                    }
                })
                queryParams.query['bool']['should'].push({
                    "match_phrase_prefix": {
                        "description": {
                            "query": "*" + searchText + "*"
                        }
                    }
                })


                queryParams.query['bool']['must'] = [domainKeyJson];

            } else {
                queryParams.query['bool']['must'] = [domainKeyJson];
            }

            if ($("#deviceModel").val() !== '') {
                queryParams.query['bool']['must'].push({ match: { deviceModel: $("#deviceModel").val() } })
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type: 'FIRMWARE'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;
                    firmware_list = resultData.data;
                    $(".firmwareCount").html(resultData.recordsFiltered)
                    resultData['draw'] = oSettings.iDraw;
                    fnCallback(resultData);
                }
            });
        }

    };

    firmwareTable = $("#firmwareTable").DataTable(tableOption);
    $(".dataTables_scrollBody").removeAttr("style").css({"min-height":"calc(100vh - 510px)","position":"relative","width":"100%"});

    /* listFirmwareApi($("#deviceModel").val(), 1000, null, null, function (status, data) {
         if (status && data.length > 0) {
             tableOption['data'] = data;
             $(".firmwareCount").html(data.length)
             firmware_list = data;
         } else {
             $(".firmwareCount").html(0)
         }
 
         firmwareTable = $("#firmwareTable").DataTable(tableOption);
     });*/


}


function openModal(type, id) {

    current_firmware_obj = {};

    var obj = {};

    for (var i = 0; i < firmware_list.length; i++) {
        if (id === firmware_list[i]._id) {
            obj = firmware_list[i];
            current_firmware_obj = firmware_list[i];
        }
    }

    current_firmware_version = current_firmware_obj.version;


    if (type === 1) {
        $(".templateAction").html('Upload')
        $("#addFirmware form")[0].reset();
        $("#f_device_model").val($("#deviceModel").val());
        // $("#addFirmware").modal('show');
        $('#addFirmware').modal({ backdrop: 'static', keyboard: false })
    } else if (type === 2) {
        $(".templateAction").html('Upload to')
        $("#deviceID").val("")
        loadDeviceList();
        $(".modelId").html(current_firmware_obj.deviceModel);
        $(".firmwareVersion").html(current_firmware_version);
        $('#uploadDevice').modal({ backdrop: 'static', keyboard: false })

    } else if (type === 3) {

        downloadFirmware(current_firmware_obj.deviceModel, current_firmware_version, function (status, data) {

            if (status) {
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.id = "downloadFile"
                $("#downloadFile").css('display', 'none')

                var blob = new Blob([data], { type: obj.contentType }),
                    url = window.URL.createObjectURL(blob);
                // var url = 'data:'+obj.contentType+';charset=utf-8,' + encodeURIComponent(data);

                a.href = url;
                a.download = obj.fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                errorMsg('Error in download')
            }
        })


    } else if (type === 4) {
        $(".firmwareVersion").html(current_firmware_version)
        $('#deleteModal').modal({ backdrop: 'static', keyboard: false })

    }
}
function validation() {
    if ($(".select").val() == "") {
        $("#error").text("Please select an item in the list")
        $(".select").css('border-color', 'red')

        setTimeout(function () {
            $("#error").text("")
            $(".select").css('border-color', '')


        }, 2000);



    } else {


    }
    if ($(".filetwo").val() === "") {
        $("#file_error2").text("Please select a file")
        $(".filetwo").css('border-color', 'red')

        setTimeout(function () {
            $("#file_error2").text("")
            $(".filetwo").css('border-color', '')

        }, 2000);



    } else {



    }


    if ($(".text").val() === "") {
        $("#name_error").text("Please fill out this field")
        $(".text").css('border-color', 'red')

        setTimeout(function () {
            $("#name_error").text("")
            $(".text").css('border-color', '')

        }, 2000);



    } else {
    }


    if ($(".choose").val() === "") {
        $("#file1").text("Please select a file")
        $(".choose").css('border-color', 'red')

        setTimeout(function () {
            $("#file1").text("")
            $(".choose").css('border-color', '')

        }, 2000);


    } else {


    }






}



function addFirmware() {
    var fileInput = document.getElementById("firmwareFile");
    var files = fileInput.files;

    if ($("#f_device_model").val() === "") {
        $("#model-span").text("Please select Model Id")
        $("#f_device_model").css('border-color', 'red')

        setTimeout(function () {
            $("#model-span").text("")
            $("#f_device_model").css('border-color', '')

        }, 2000);
        return;
    }
    if ($("#firmware_version").val() === "") {
        $("#firmware-version-span").text("Please enter the Firmware Version")
        $("#firmware_version").css('border-color', 'red')

        setTimeout(function () {
            $("#firmware-version-span").text("")
            $("#firmware_version").css('border-color', '')

        }, 2000);
        return;
    }
    if ($("#firmwareFile").val() === "") {
        $("#choose-file-span").text("Please select the file")
        $("#firmwareFile").css('border-color', 'red')

        setTimeout(function () {
            $("#choose-file-span").text("")
            $("#firmwareFile").css('border-color', '')

        }, 2000);
        return;
    }
    if (files.length === 0) {
        // errorMsg('File not found. select a file to start upload');
        return;
    }

    uploadFile(files[0]);
    $(".btnSubmit").attr('disabled', 'disabled');
    $(".btnSubmit").html('<i class="icon-spinner icon-spin"></i> Uploading in progress');

}


function uploadFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                $("#addFirmware").modal('hide');

                setTimeout(function () {
                    loadFirmwareList();
                }, 1000)
                successMsg('New Firmware added successfully!');
            } else {
                errorMsg('Error in firmware upload!');
            }
            $(".btnSubmit").removeAttr('disabled');
            $(".btnSubmit").html('Proceed');
        }
    };
    xhr.open('POST', API_BASE_PATH + '/firmware/upload/' + USER_OBJ.token + "/" + $("#f_device_model").val() + "/" + $("#firmware_version").val(), true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("desc", $("#firmware_desc").val());
    xhr.send(formData);
}

function proceedDelete() {
    deleteFirmware(current_firmware_obj.deviceModel, current_firmware_version, function (status, data) {
        if (status) {
            successMsg('Firmware Deleted Successfully');
            setTimeout(function () {
                loadFirmwareList();
            }, 500)
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}


function loadDeviceList(searchText) {

    var domainKeyJson = { "match": { "domainKey": DOMAIN_KEY } };

    var queryParams = {
        "query": {
            "bool": {
                "must": []
            }
        },
        "size": 25,
        "sort": [{ "reportedStamp": { "order": "desc" } }]
    };

    if (searchText) {
        var searchJson = {
            "multi_match": {
                "query": '*' + searchText + '*',
                "type": "phrase_prefix",
                "fields": ['_all']
            }
        };
        queryParams.query['bool']['must'] = [domainKeyJson, searchJson];

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

            for (var i = 0; i < device_list.length; i++) {
                $(".deviceListUl").append('<li class="deviceListLi" onclick="setDeviceId(\'' + device_list[i].id + '\')">' +
                    (device_list[i].name ? device_list[i].name : device_list[i].id) + ' | ' + device_list[i].modelId + ' | <b>' +
                    device_list[i].version +
                    '</b></li>');
            }
        } else {
            device_list = []
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

function uploadDevice() {

    var strObj = JSON.stringify({ '_MODEL_': current_firmware_obj.deviceModel, '_VERSION_': current_firmware_version });
    var cid = 98;
    sendCommandTemplate(current_device_id, cid, TEMPLATES['DEVICE_OTA_CMD'], true, strObj, function (status, data) {
        if (status) {
            $(".timer_result").append('<p style="margin-bottom: 3px"><label>Command Status: </label> ' + moment().format('MM/DD/YYYY hh:mm:ss a') + ' <span class="label label-warning">Message Queued</span></p>');

            cmdTimer = setInterval(function () {
                checkCommandStatus(data['corrId'], 2);
            }, 3000);
            checkCommandStatus(data['corrId'], 2);
        } else {
            if(typeof(data)!="undefined"){
                if(data.message){
                    var errmessage = data.message.replaceAll("_"," ");
                    errorMsg(errmessage);
                }else{
                    errorMsg('Error in downloading config');
                }
            }else{
                errorMsg('Error in downloading config');
            }
        }
    })
}



function checkCommandStatus(corid) {

    $(".timer_result").css('height', '100px');

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


    getCommandStatus(current_device_id, corid, function (status, res) {
        if (status) {

            var status = res.status.toString();
            var channel = res['dataChannel'].toString();


            if (channel === 'UDP') {
                if (res['sentStamp']) {
                    var now = moment();
                    var then = moment(res['sentStamp']);

                    var timeDiff = moment.duration(now.diff(then))._milliseconds;

                    if (timeDiff > 10000) {
                        status = 'TIMEDOUT';
                    }

                }
            }

            if (channel === 'HTTP' || channel === 'FCM') {
                var now = moment();
                var then = moment(res['queuedStamp']);
                var timeDiff = moment.duration(now.diff(then))._milliseconds;
                if (timeDiff > 10000) {
                    status = 'TIMEDOUT';
                }
            }

            $(".timer_result").append('<p style="margin-bottom: 3px"><label>Command Status:</label> ' + moment().format('MM/DD/YYYY hh:mm:ss a') + ' <span class="label label-' + objStatus[status] + '">' + objNames[status] + '</span></p>');

            if (status === "FAILED" || status === "ACKED" || status === "NACKED" || status === "TIMEDOUT") {

                clearInterval(cmdTimer);

            }

        } else {

            $(".timer_result").append('<p style="margin-bottom: 3px"><label>Command Status:</label> ' + moment().format('MM/DD/YYYY hh:mm:ss a') + ' <span class="label label-default">TIMEDOUT</span></p>');

            clearInterval(cmdTimer);

        }
    });
}

function onclosebutton() {
    $("#firmware_desc").css('height', '10px');
}