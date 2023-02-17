var eventTable = null;
var event_list = [];
var fcm_list = [];
var cuurent_event_obj = {};
var current_event_id = null;
var current_event_channel = null;
var current_event_address = null;


$(document).ready(function () {

    loadEvents();

    $("body").removeClass('bg-white');

});




function loadEvents() {


    if (eventTable) {
        eventTable.destroy();
        $("#eventTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Event ID',
            "class": "details-control",
            "orderable": true,
            sWidth: '10%',
        },
        {
            mData: 'name',
            sTitle: 'Event  Name',
            "class": "details-control",
            "orderable": true,
        },
        {
            mData: 'subject',
            sTitle: 'Subject',
            "class": "details-control",
            orderable: false,
        },
        {
            mData: 'content',
            sTitle: 'Content',
            "class": "details-control",
            orderable: false,
            mRender: function (data, type, row) {

                data = data.replace(/&/g, "&amp");
                data = data.replace(/</g, "&lt");
                data = data.replace(/>/g, "&gt");

                return '<code>' + (data) + '</code>';
            }
        }

    ];

    let data = 10000
    var tableOption = {
        responsive: false,
        autoWidth: false,
        paging: true,
        aoColumns: fields,
        searchable: true,
        "ordering": true,
        scrollY: '100px',
        scrollCollapse: true,
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
        "bServerSide": false,
        "bProcessing": true,
        "sAjaxSource": API_BASE_PATH + "/event/list/" + API_TOKEN_ALT + '/' + data,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {
           

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};



            oSettings.jqXHR = $.ajax({
                "type": "GET",
                "url": sSource,
                success: function (data) {
                    if (data.length > 0) {
                        event_list = data;
                        $(".eventsCount").html(data.length)
                    } else {
                        $(".eventsCount").html(0);
                        event_list = [];
                    }
                    let resultData = {
                        "recordsTotal": event_list.length,
                        "recordsFiltered": event_list.length,
                        "data": event_list
                    }
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };
    eventTable = $("#eventTable").DataTable(tableOption);
    $(".dataTables_scrollBody").removeAttr("style").css({"min-height":"calc(100vh - 425px)","position":"relative","width":"100%"});
    var detailRows = [];
    $('#eventTable tbody').on('click', '.details-control', function () {
        $(".eventRow").hide();
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
    
    // listEventsApi(10000, null, null, function (status, data) {
    //     if (status && data.length > 0) {
    //         tableOption['data'] = data;
    //         event_list = data;
    //         $(".eventsCount").html(data.length)
    //     } else {
    //         $(".eventsCount").html(0)
    //     }

    //     eventTable = $("#eventTable").DataTable(tableOption);


    //     // Array to track the ids of the details displayed rows
    //     var detailRows = [];

    //     $('#eventTable tbody').on('click', '.details-control', function () {

    //         $(".eventRow").hide();
    //         var tr = $(this).closest('tr');
    //         var row = eventTable.row(tr);
    //         var idx = $.inArray(tr.attr('id'), detailRows);

    //         if (row.child.isShown()) {
    //             tr.removeClass('details');
    //             row.child.hide();

    //             // Remove from the 'open' array
    //             detailRows.splice(idx, 1);
    //         }
    //         else {
    //             tr.addClass('details');
    //             row.child(formatRow(row.data())).show();

    //             // Add to the 'open' array
    //             if (idx === -1) {
    //                 detailRows.push(tr.attr('id'));
    //             }
    //         }
    //     });

    // })


}

function formatRow(d) {
    cuurent_event_obj = d;
    current_event_id = d.id;
    var htmlStr = '<div class="event_' + d.id + ' eventRow"><h4 style="text-align: center"><i class="fa fa-spinner fa-spin"></i> <Loading></Loading></h4></div>';

    var strCnt = `

    <table>
        <tr>
        <td style="border: 0px"><i class="icon-envelop"></i> Do you want to subscribe for Email Notification? </td>
        <td style="border: 0px"> <label style="display: inline-block;"><input onclick="checkSub(`+d.id+`,'EMAIL',1)" type="radio" id="" name="m_e_`+d.id+`" value="yes" /> Yes</label>
                        <label style="display: inline-block;margin-left: 15px"><input onclick="checkSub(`+d.id+`,'EMAIL',2)" type="radio" name="m_e_`+d.id+`" value="no" checked/> No</label></td>
        </tr>
        <tr>
        <td style="border: 0px"><i class="icon-phone-hang-up"></i> Do you want to subscribe for Voice Call Notification? </td>
        <td style="border: 0px"> <label style="display: inline-block;"><input onclick="checkSub(`+d.id+`,'VOICE',1)" type="radio" name="v_e_`+d.id+`" value="yes" /> Yes</label>
                        <label style="display: inline-block;margin-left: 15px"><input onclick="checkSub(`+d.id+`,'VOICE',2)" type="radio" name="v_e_`+d.id+`" value="no" checked/> No</label></td>
        </tr>
        <tr>
        <td style="border: 0px"><i class="icon-mobile"></i> Do you want to subscribe for SMS Notification? </td>
        <td style="border: 0px"> <label style="display: inline-block;"><input onclick="checkSub(`+d.id+`,'SMS',1)" type="radio" name="s_e_`+d.id+`" value="yes" /> Yes</label>
                        <label style="display: inline-block;margin-left: 15px"><input onclick="checkSub(`+d.id+`,'SMS',2)" type="radio" name="s_e_`+d.id+`" value="no" checked/> No</label></td>
        </tr>
    </table>

    `;

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        query: {
            "bool": {
                "should": [domainKeyJson, {match:{id:d.id}},{match:{address:USER_OBJ.user.email}},{match:{address:USER_OBJ.user.primaryPhone}}],
                "minimum_should_match":3
            }
        },
        from: 0,
        size:10
    };

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    searchByQuery('', 'EVENT_REGISTRATION', searchQuery, function (status, data) {
        if (status) {
            $(".event_"+d.id).html(strCnt);
            var resData = QueryFormatter(data).data;

            if(resData.recordsTotal > 0){
                resData = resData.data;
                for(var i=0;i<resData.length;i++){
                    if(resData[i].channel === 'EMAIL'){
                        $("input[name=m_e_"+d.id+"][value='yes']").prop("checked",true);
                    }
                    if(resData[i].channel === 'VOICE'){
                        $("input[name=v_e_"+d.id+"][value='yes']").prop("checked",true);
                    }
                    if(resData[i].channel === 'SMS'){
                        $("input[name=s_e_"+d.id+"][value='yes']").prop("checked",true);
                    }
                }
            }

        }else{
            $(".event_"+d.id).html(strCnt);
        }
    });



    return htmlStr;

}

function checkSub(id, channel, type) {

    if(type === 1){
        if(channel === 'VOICE' || channel === 'SMS'){
            if(USER_OBJ.user.primaryPhone){
                addChannel(id, channel, USER_OBJ.user.primaryPhone)
            }else{
                errorMsg('Mobile Number not updated in your profile.')
            }
        }else {
            addChannel(id, channel, USER_OBJ.user.email)
        }
    }else{
        if(channel === 'VOICE' || channel === 'SMS'){
            removeChannel(id, channel, USER_OBJ.user.primaryPhone)
        }else {
            removeChannel(id, channel, USER_OBJ.user.email)
        }

    }

}

function addChannel(id, channel, addr) {

    var eventObj = {
        "eid": id,
        "channel": channel,
        "address": addr
    }


    registerEvent(eventObj.eid, eventObj.channel, eventObj.address, function (status, data) {
        if (status) {
            successMsg(channel +' Subscribed Successfully');
        }
    })
}

function removeChannel(id, channel, addr) {

    var eventObj = {
        "eid": id,
        "channel": channel,
        "address": addr
    }

    unregisterEvent(eventObj.eid, eventObj.channel, eventObj.address, function (status, data) {
        if (status) {
            successMsg(channel+' Un-Subscribed Successfully');
        }
    })
}
