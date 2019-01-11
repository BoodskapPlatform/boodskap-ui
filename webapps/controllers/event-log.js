var logTable = null;
var DOMAIN_LOGS_FOR = ['EMAIL', 'SMS', 'VOICE', 'FCM','COMMAND', 'RULES'];

$(document).ready(function () {

    for(var i=0;i<DOMAIN_LOGS_FOR.length;i++){
        $("#logType").append('<option value="'+DOMAIN_LOGS_FOR[i]+'">'+DOMAIN_LOGS_FOR[i]+'</option>');
    }

    loadLogs();

    $("body").removeClass('bg-white');

});



var logFields = {
    VOICE : {
        fields : [
            {
                mData: 'id',
                sTitle: 'ID',
                orderable: false,
            },
            {
                mData: 'toAddress',
                sTitle: 'To Address',
                orderable: false,
            },
            {
                mData: 'content',
                sTitle: 'Content',
                orderable: false,
            },
            {
                mData: 'queuedAt',
                sTitle: 'Queued Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'sentAt',
                sTitle: 'Sent Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'sid',
                sTitle: 'SID',
                orderable: false,
            },
            {
                mData: 'price',
                sTitle: 'Cost',
                orderable: false,
                mRender: function (data, type, row) {
                    var str= row['resp'] ? (row['resp']['price']*-1) + ' <small>'+row['resp']['price_unit']+'</small>' : "-";
                    return '<h5 class="text-danger">'+str+'</h5>';
                }
            },
            {
                mData: 'status',
                sTitle: 'Status',
                orderable: false,
            },
            {
                mData: 'providerStatus',
                sTitle: 'Provider Status',
                orderable: false,
                mRender: function (data, type, row) {

                    if(data) {

                        data = data.toUpperCase();
                    }else{
                        data = '';
                    }


                    return data;
                }
            },
            {
                mData: 'resp',
                sTitle: 'Response',
                orderable: false,
                mRender: function (data, type, row) {

                    if(data) {

                        data = '<pre style="white-space: pre-wrap">'+JSON.stringify(data)+'</pre>';
                    }else{
                        data = '<pre style="white-space: pre-wrap">'+row['response']+'</pre>';
                    }


                    return data;
                }
            }

        ],
        sort : [[3, 'desc']]
    },
    SMS : {
        fields : [
            {
                mData: 'content',
                sTitle: 'Content',
                orderable: false,
            },
            {
                mData: 'receipent',
                sTitle: 'Receipent',
                orderable: false,
            },
            {
                mData: 'queuedAt',
                sTitle: 'Queued Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'sentAt',
                sTitle: 'Sent Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'sendor',
                sTitle: 'Sender',
                orderable: false,
            },
            {
                mData: 'price',
                sTitle: 'Cost',
                orderable: false,
                mRender: function (data, type, row) {
                    var str= row['resp'] ? (row['resp']['price']*-1) + ' <small>'+row['resp']['price_unit']+'</small>' : "-";
                    return '<h5 class="text-danger">'+str+'</h5>';
                }
            },
            {
                mData: 'status',
                sTitle: 'Status',
                orderable: false,
                mRender: function (data, type, row) {

                    return data ? data : '-'
                }
            },
            {
                mData: 'providerStatus',
                sTitle: 'Provider Status',
                orderable: false,
                mRender: function (data, type, row) {

                    if(data) {

                        data = data.toUpperCase();
                    }else{
                        data = '';
                    }


                    return data;
                }
            },
            {
                mData: 'resp',
                sTitle: 'Response',
                orderable: false,
                mRender: function (data, type, row) {

                    if(data) {

                        data = '<pre style="white-space: pre-wrap">'+JSON.stringify(data)+'</pre>';
                    }else{
                        data = '<pre style="white-space: pre-wrap">'+row['response']+'</pre>';
                    }


                    return data;
                }
            }

        ],
        sort : [[2, 'desc']]
    },
    EMAIL : {
        fields : [
            {
                mData: 'receipents',
                sTitle: 'Receipents',
                orderable: false,
            },
            {
                mData: 'subject',
                sTitle: 'Subject',
                orderable: false,
            },
            {
                mData: 'queuedAt',
                sTitle: 'Queued Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'sentAt',
                sTitle: 'Sent Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },

            {
                mData: 'sendor',
                sTitle: 'Sender',
                orderable: false,
            },
            {
                mData: 'status',
                sTitle: 'Status',
                orderable: false,
            },
            {
                mData: 'response',
                sTitle: 'Response',
                orderable: false,
            },
            {
                mData: 'content',
                sTitle: 'Content',
                orderable: false,
            },
            {
                mData: 'htmlContent',
                sTitle: 'HTML',
                orderable: false,
                mRender: function (data, type, row) {

                    if(data) {

                        data = data.replace(/&/g, "&amp");
                        data = data.replace(/</g, "&lt");
                        data = data.replace(/>/g, "&gt");
                    }else{
                        data = '';
                    }


                    return '<div style="width:'+($(window).width()-100)+'px;">' +
                        '<pre style="white-space: pre-wrap">' + (data) + '</pre></div>';
                }
            },
        ],
        sort : [[2, 'desc']]
    },
    FCM : {
        fields : [
            {
                mData: 'subject',
                sTitle: 'Subject',
                orderable: false,
            },
            {
                mData: 'content',
                sTitle: 'Content',
                orderable: false,
            },
            {
                mData: 'data',
                sTitle: 'Data',
                orderable: false,
            },
            {
                mData: 'deviceId',
                sTitle: 'Device ID',
                orderable: false,
            },
            {
                mData: 'id',
                sTitle: 'ID',
                orderable: false,
            },
            {
                mData: 'queuedAt',
                sTitle: 'Queued Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'sentAt',
                sTitle: 'Sent Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'status',
                sTitle: 'status',
                orderable: false,
            },

            {
                mData: 'notification',
                sTitle: 'Notification',
                orderable: false,
            },
            {
                mData: 'response',
                sTitle: 'Response',
                orderable: false,
            },

            {
                mData: 'fcmToken',
                sTitle: 'FCM Token',
                orderable: false,
            },
        ],
        sort : [[6, 'desc']]
    },
    COMMAND : {
        fields : [
            {
                mData: 'correlationId',
                sTitle: 'Correlation ID',
                orderable: false,
            },
            {
                mData: 'channel',
                sTitle: 'Channel',
                orderable: false,
            },
            {
                mData: 'type',
                sTitle: 'Type',
                orderable: false,
            },
            {
                mData: 'deviceId',
                sTitle: 'Device ID',
                orderable: false,
            },
            {
                mData: 'data',
                sTitle: 'Data',
                orderable: false,
                mRender: function (data, type, row) {
                    try {
                        var res = data ? atob(data) : data;
                        return res;
                    }catch(e){
                        return data;
                    }
                }

            },
            {
                mData: 'description',
                sTitle: 'Description',
                orderable: false,
            },
            {
                mData: 'status',
                sTitle: 'Status',
                orderable: false,
            },
            {
                mData: 'createdStamp',
                sTitle: 'Created Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'queuedStamp',
                sTitle: 'Queued Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'sentStamp',
                sTitle: 'Sent Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'ackedStamp',
                sTitle: 'Acked Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },

            {
                mData: 'nackCode',
                sTitle: 'Nack Code',
                orderable: false,
            },
            {
                mData: 'nodeId',
                sTitle: 'Node ID',
                orderable: false,
            },
            {
                mData: 'nodeUid',
                sTitle: 'Node UID',
                orderable: false,
            },
            {
                mData: 'reportedIp',
                sTitle: 'Reported IP',
                orderable: false,
            }
        ],
        sort : [[7, 'desc']]
    },
    RULES : {
        fields : [
            {
                mData: 'messageId',
                sTitle: 'ID',
                orderable: false,
                mRender: function (data, type, row) {
                    return data ? data : "-";
                }
            },
            {
                mData: 'namedRule',
                sTitle: 'Named Rule',
                orderable: false,
                mRender: function (data, type, row) {
                    return data ? data : "-";
                }
            },
            {
                mData: 'ruleType',
                sTitle: 'Rule Type',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? data : "-";
                }
            },
            {
                mData: 'occuredAt',
                sTitle: 'Occured Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'message',
                sTitle: 'Response',
                orderable: false,
                sWidth:'50%',
                mRender: function (data, type, row) {

                    if(data) {
                        data = '<pre style="white-space: pre-wrap">'+data+'</pre>';
                    }else{
                        data = '-';
                    }

                    return data;
                }
            }

        ],
        sort : [[3, 'desc']]
    }
}


function loadLogs() {


    if (logTable) {
        logTable.destroy();
        $("#logTable").html("");
    }

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [{"createdStamp": {"order": "desc"}}];
    var queryParams = {
        query: {
            "bool": {
                "must": []
            }
        },
        sort: [defaultSorting]
    };

    var type = $("#logType").val();

    $(".eventType").html(type);
    var fields = logFields[type].fields;
    var sortOrder = logFields[type].sort;

    if(type === 'RULES'){
        type = 'RULE_FAILURE';
        $(".eventType").html('FAILURE RULES');
    }


    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        aoColumns: fields,
        searching: true,
        aaSorting: sortOrder,
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

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


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : type
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;
                    console.log(resultData)

                    $(".totalCount").html(resultData.recordsFiltered);
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    logTable = $("#logTable").DataTable(tableOption);


}


