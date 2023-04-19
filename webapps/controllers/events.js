var eventTable = null;
var event_list = [];
var fcm_list = [];
var cuurent_event_obj = {};
var current_event_id = null;
var current_event_channel = null;
var current_event_address = null;


$(document).ready(function () {

    loadEvents();
    $('.help-url').attr('href',HELP_URL+"upsertevent");

    $("body").removeClass('bg-white');

});




function loadEvents() {


    if (eventTable) {
        eventTable.destroy();
        $("#eventTable").html("");
    }

    var fields = [
        // {
        //     sTitle: '',
        //     "class": "details-expand",
        //     "defaultContent": "",
        //     orderable: false,
        //     sWidth: '5%',
        //     mRender: function (data, type, row) {
        //         return '<h4 style="text-align: center;color:#666"><i class="icon-caret-right"></i></h4>';
        //     }
        // },
        {
            mData: 'id',
            sTitle: 'Event ID',
            "class": "details-expand text-truncate",
            "orderable": true,
            sWidth: '10%',
        },
        {
            mData: 'name',
            sTitle: 'Event  Name',
            "class": "details-expand text-truncate",
            "orderable": false,
        },
        {
            mData: 'subject',
            sTitle: 'Subject',
            "class": "details-expand text-truncate",
            orderable: false,
            mRender: function (data, type, row) {
                return '<div class="text-truncate" title="' + data + '">' + data + '</div>';

            }
        },
        {
            mData: 'content',
            sTitle: 'Content',
            "class": "details-expand text-truncate",
            orderable: false,
            mRender: function (data, type, row) {

                data = data.replace(/&/g, "&amp");
                data = data.replace(/</g, "&lt");
                data = data.replace(/>/g, "&gt");

                return '<div class="text-truncate" title="'+data+'">'+data+'</div>';

            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {


                return '<button class="btn bskp-edit-btn mr-2" title="Edit" onclick="openModal(2,' + row["id"] + ')"><img src="images/edit.svg" alt=""></button>' +
                    '<button class="btn bskp-trash-btn" title="Delete" onclick="openModal(3,' + row['id'] + ')"><img src="images/delete.svg" alt=""></button>';
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
    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};    var tableOption = {
        responsive: false,
        autoWidth: false,
        paging: true,
        aoColumns: fields,
        searching: true,
        aaSorting: [[0, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
                       dom: '<"bskp-search-left" f> lrtip',
            language: {
                "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
             "searchPlaceholder": "Search by Event ID",
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
        "sAjaxSource": API_BASE_PATH + "/elastic/search/query/" + API_TOKEN_ALT,
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
                type : 'EVENT'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {
                    var resultData
                    if (data.httpCode == 200) {
                        let finalData = searchQueryFormatterNew(data)
                        resultData = finalData.data;
                        event_list = resultData.data;;
                        $(".eventsCount").html(finalData.total)
                    } else {
                        $(".eventsCount").html(0);
                        event_list = [];
                    }
                   
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };
    eventTable = $("#eventTable").DataTable(tableOption);
    $('.dataTables_filter input').attr('maxlength', 100);

    // Array to track the ids of the details displayed rows
    var detailRows = [];

    $('#eventTable tbody').on('click', '.details-expand', function () {

        $(".eventRow").parent().hide();
        var tr = $(this).closest('tr');
        var row = eventTable.row(tr);
        var idx = $.inArray(tr.attr('id'), detailRows);

        if (row.child.isShown()) {
            tr.removeClass('details');
            row.child.hide();

            // Remove from the 'open' array
            detailRows.splice(idx, 1);
        }
        else {
            tr.addClass('details');
            row.child(formatRow(row.data())).show();

            // Add to the 'open' array
            if (idx === -1) {
                detailRows.push(tr.attr('id'));
            }
        }
    });

}




function formatRow(d) {
    cuurent_event_obj = d;
    current_event_id = d.id;
    var htmlStr = '<div class="event_' + d.id + ' eventRow"><h4 style="text-align: center"><i class="fa fa-spinner fa-spin"></i> <Loading></Loading></h4></div>';

    async.series({
        email: function (ecbk) {
            listNotificationApi(d.id, 'EMAIL', 10000, null, null, function (status, data) {
                if (status && data.length > 0) {
                    ecbk(null, data);
                } else {
                    ecbk(null, []);
                }
            });
        },
        sms: function (dcbk) {
            listNotificationApi(d.id, 'SMS', 10000, null, null, function (status, data) {
                if (status && data.length > 0) {
                    dcbk(null, data);
                } else {
                    dcbk(null, []);
                }
            });

        },
        call: function (ccbk) {
            listNotificationApi(d.id, 'VOICE', 10000, null, null, function (status, data) {
                if (status && data.length > 0) {
                    ccbk(null, data);
                } else {
                    ccbk(null, []);
                }
            });
        },
        fcm: function (fcbk) {
            listNotificationApi(d.id, 'FCM', 10000, null, null, function (status, data) {
                if (status && data.length > 0) {
                    fcbk(null, data);
                } else {
                    fcbk(null, []);
                }
            });
        }
    },
        function (err, results) {

        var str = '<div style="max-height: 400px;overflow: auto;overflow-x: hidden">' +
            '<table class="table table-bordered"><tr>' +
            '<th>EMAIL <a class="btn btn-xs btn-icon btn-default pull-right" onclick="openModal(4,\'' + 'EMAIL' + '\')" href="javascript:void(0)" title="Register Event"><i class="icon-plus"></i></a></th>' +
            '<th>SMS <a class="btn btn-xs btn-icon btn-default pull-right" onclick="openModal(4,\'' + 'SMS' + '\')" href="javascript:void(0)" title="Register Event"><i class="icon-plus"></i></a></th>' +
            '<th>VOICE <a class="btn btn-xs btn-icon btn-default pull-right" onclick="openModal(4,\'' + 'VOICE' + '\')" href="javascript:void(0)" title="Register Event"><i class="icon-plus"></i></a></th>' +
            '<th>FCM <a class="btn btn-xs btn-icon btn-default pull-right" onclick="openModal(4,\'' + 'FCM' + '\')" href="javascript:void(0)" title="Register Event"><i class="icon-plus"></i></a></th>' +
            '</tr>';
        var totalCount = results.email.length + results.call.length + results.sms.length + results.fcm.length;
        var maxValue = _.max([results.email.length, results.call.length, results.sms.length, results.fcm.length]);

        /*
                <div class="eventLink">
                    <a class="black" href="javascript:void(0)" title="Unregister Channel"><i class="icon-unlink"></i></a>
                    <a class="black" href="javascript:void(0)" title="Test Message"><i class="icon-play-circle"></i></a>
                    </div>
        */

        if (totalCount > 0) {

            for (var i = 0; i < maxValue; i++) {

                str = str + '<tr>' +
                    '<td style="width: 25%"><span class="">' + (results.email[i] ? results.email[i].address : "") + '</span>' +
                    (results.email[i] ? '<a class="text-success pull-right" onclick="openModal(5,\''+results.email[i].address+ '\',\'' + 'EMAIL' + '\')" href="javascript:void(0)" title="Unregister Channel"><i class="icon-unlink"></i></a>' +
                        '<a class="text-success pull-right mr-2" href="javascript:void(0)" title="Test Message"><i class="icon-play-circle"></i></a>' : "") +
                    '</td>' +
                    '<td style="width: 25%"><span class="">' + (results.sms[i] ? results.sms[i].address : "") + '</span>' +
                    (results.sms[i] ? '<a class="text-success pull-right" onclick="openModal(5,\''+results.sms[i].address+ '\',\'' + 'SMS' + '\')" '+
                        'href="javascript:void(0)" title="Unregister Channel"><i class="icon-unlink"></i></a>' +
                        '<a class="text-success pull-right mr-2" href="javascript:void(0)" title="Test Message"><i class="icon-play-circle"></i></a>' : "") +
                    '</td>' +
                    '<td style="width: 25%"><span class="">' + (results.call[i] ? results.call[i].address : "") + '</span>' +
                    (results.call[i] ? '<a class="text-success pull-right" onclick="openModal(5,\''+results.call[i].address+ '\',\'' + 'VOICE' + '\')" '+
                        'href="javascript:void(0)" title="Unregister Channel"><i class="icon-unlink"></i></a>' +
                        '<a class="text-success pull-right mr-2" href="javascript:void(0)" title="Test Message"><i class="icon-play-circle"></i></a>' : "") +
                    '</td>' +
                    '<td style="width: 25%"><span class="">' + (results.fcm[i] ? results.fcm[i].address : "") + '</span>' +
                    (results.fcm[i] ? '<a class="text-success pull-right"  onclick="openModal(5,\''+results.fcm[i].address+ '\',\'' + 'FCM' + '\')" '+
                        'href="javascript:void(0)" title="Unregister Channel"><i class="icon-unlink"></i></a>' +
                        '<a class="text-success pull-right mr-2" href="javascript:void(0)" title="Test Message"><i class="icon-play-circle"></i></a>' : "") +
                    '</td>' +
                    '</tr>'
            }


            $(".event_" + d.id).html(str + '</table></div>');
        } else {
            $(".event_" + d.id).html(str + '<tr><td colspan="4" style="text-align: center"><p>No Channels Registered!</p></td></tr></table></div>');
        }


    });
    return htmlStr;

}


function openModal(type, id, channel) {
    defaultStyle()
    if (type === 1) {
        $("#event_id").removeAttr('readonly');
        $("#event_content").css('height','100px')
        $(".eventAction").html('New');
        $("#addEvent form")[0].reset();
        $("#addEvent").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show');


        // $("#event_id").attr('min',USER_OBJ.domain.startId)
        // $("#event_id").attr('max',USER_OBJ.domain.startId+ID_RANGE_COUNT)
        $("#event_id").attr('disabled',false);

        $("#addEvent form").attr('onsubmit', 'addEvent()')
    } else if (type === 2) {
        $(".eventAction").html('Update');
        $("#event_content").css('height','100px')
        var obj = {};
        current_event_id = id;

        for (var i = 0; i < event_list.length; i++) {
            if (Number(id) === Number(event_list[i].id)) {
                obj = event_list[i];
            }
        }
        // $("#event_id").attr('readonly', 'readonly');

        // $("#event_id").attr('min',USER_OBJ.domain.startId)
        // $("#event_id").attr('max',USER_OBJ.domain.startId+ID_RANGE_COUNT)

        $("#event_id").val(obj.id);
        $("#event_id").attr('disabled','disabled');

        $("#event_name").val(obj.name);
        $("#event_subject").val(obj.subject);
        $("#event_content").val(obj.content);
        $("#addEvent").modal('show');
        $("#addEvent form").attr('onsubmit', 'updateEvent()')
    } else if (type === 3) {
        current_event_id = id;
        $(".delete_event_id").html(id)
        $("#deleteModal").modal({
            backdrop: 'static',
            keyboard: false
        }
        ,'show');
    } else if (type === 4) {

        $("#addChannel form")[0].reset();

        $(".eventAddress").hide();

        if( id === 'FCM'){
            $(".n_event_adddress").removeAttr('required');
            $(".n_event_adddress_fcm").attr('required','required');
            loadFCMDeviceList();
            $(".fcmdevice").show();
        }else{
            $(".n_event_adddress").attr('required','required');
            $(".n_event_adddress_fcm").removeAttr('required');
            $(".nonfcmdevice").show();
        }

        $("#n_event_id").val(current_event_id);
        $("#n_event_channel").val(id);
        $("#addChannel").modal('show');
    } else if (type === 5) {
        $(".n_event_address").html(id);
        $(".n_event_channel").html(channel);
        current_event_address = id;
        current_event_channel = channel;
        $("#deleteChannel").modal('show');
    }
}

function checkChannel() {
    $(".eventAddress").hide();
    if($("#n_event_channel").val() === 'FCM'){
        $(".n_event_adddress").removeAttr('required');
        $(".n_event_adddress_fcm").attr('required','required');
        loadFCMDeviceList();
        $(".fcmdevice").show();
    }else{
        $(".n_event_adddress").attr('required','required');
        $(".n_event_adddress_fcm").removeAttr('required');
        $(".nonfcmdevice").show();
    }
}


function addChannel() {

    var eventObj = {
        "eid": $("#n_event_id").val(),
        "channel": $("#n_event_channel").val(),
        "address": $("#n_event_adddress").val(),
    }

    if($("#n_event_channel").val() === 'FCM'){
        eventObj.address = $("#n_event_adddress_fcm").val();
    }
    if(!eventObj.address){
        if(eventObj.channel == 'FCM'){
         showFeedback('FCM device is required','n_event_adddress_fcm','n_event_adddress_fcmAlert')
        }else{
            showFeedback('Notification address is required','n_event_adddress','n_event_adddressAlert')
        }
    }else{
        registerEvent(eventObj.eid, eventObj.channel, eventObj.address, function (status, data) {
            if (status) {
                successMsg('Event Registered Successfully');
                setTimeout(() => {
                    loadEvents();
                }, 1500);
                $("#addChannel").modal('hide');
            } else {
                if(data.responseJSON.message === "ALREADY_REGISTERED"){
                    errorMsgBorder(eventObj.channel + ' already exists.', 'n_event_adddress')
                }else{
                    errorMsg('Error in registering event')
                }
    
            }
            $(".btnSubmit").removeAttr('disabled');
        })
    }
  
}

function removeChannel() {

    var eventObj = {
        "eid": current_event_id,
        "channel": current_event_channel,
        "address": current_event_address,
    }

    $(".btnSubmit").attr('disabled','disabled');

    unregisterEvent(eventObj.eid, eventObj.channel, eventObj.address, function (status, data) {
        if (status) {
            successMsg('Event Un-Registered Successfully');
            setTimeout(() => {
                loadEvents();
            }, 1500);
            $("#deleteChannel").modal('hide');
        } else {
            errorMsg('Error in un-registering event')

        }
        $(".btnSubmit").removeAttr('disabled');
    })
}

function addEvent() {
    var event_id = $.trim($("#event_id").val());
    var event_name=$.trim($("#event_name").val());
    var event_subject= $.trim($("#event_subject").val());
    var event_content= $.trim($("#event_content").val());
    
    if(event_id == ""){
        showFeedback('Event ID is required','event_id','logevent_id');
        return false;
    }else if(event_name == ""){
        showFeedback('Event Name is required','event_name','logevent_name');
        return false;
    }else if(event_subject == ""){
        showFeedback('Event Subject is required','event_subject','logevent_subject');
        return false;
    } else if(event_content == ""){
        showFeedback('Content is required','event_content','logevent_content');
        return false;
    }
    var eventObj = {
        "id":event_id,
        "name": event_name,
        "subject": event_subject,
        "content": event_content,
    }

    $(".btnSubmit").attr('disabled','disabled');


    retreiveEvent(eventObj.id, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('Event ID already exist', 'event_id');
        } else {
            upsertEvent(eventObj, function (status, data) {
                if (status) {
                    successMsg('Event Created Successfully');
                    setTimeout(() => {
                        loadEvents();
                    }, 1500);
                    $("#addEvent").modal('hide');
                } else {
                    errorMsg('Error in Creating Event')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
}

function updateEvent() {


    var event_id = $.trim($("#event_id").val());
    var event_name = $.trim($("#event_name").val());
    var event_subject = $.trim($("#event_subject").val());
    var event_content = $.trim($("#event_content").val());

    if (event_id == "") {
        showFeedback('Event ID is required', 'event_id', 'logevent_id');
        return false;
    } else if (event_name == "") {
        showFeedback('Event Name is required', 'event_name', 'logevent_name');
        return false;
    } else if (event_subject == "") {
        showFeedback('Event Subject is required', 'event_subject', 'logevent_subject');
        return false;
    } else if (event_content == "") {
        showFeedback('Content is required', 'event_content', 'logevent_content');
        return false;
    }
    var eventObj = {
        "id": event_id,
        "name": event_name,
        "subject": event_subject,
        "content": event_content,
    }
   
    $(".btnSubmit").attr('disabled', 'disabled');

    upsertEvent(eventObj, function (status, data) {
        if (status) {
            setTimeout(() => {
                successMsg('Event Updated Successfully');
                loadEvents();
                $("#addEvent").modal('hide');
            }, 1500);
        } else {
            errorMsg('Error in Updating Event')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    deleteEvent(current_event_id, function (status, data) {
        if (status) {
            successMsg('Event Deleted Successfully');
            setTimeout(() => {
                loadEvents();
            }, 1500);
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}

function loadFCMDeviceList() {

    $("#n_event_adddress_fcm").html("");

    listFCMDeviceApi(1000, function (status, data) {
        if (status && data.length > 0) {

            for(var i=0;i<data.length;i++){
                $("#n_event_adddress_fcm").append('<option value="'+data[i].id+'">'+data[i].id+' | '+data[i].modelId+'</option>')
            }
        }

    })
}