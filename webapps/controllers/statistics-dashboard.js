 // Message logs
var messageTable = '';
var messageList = [];
var LIVE_UPDATE = Cookies.get('live_update') ? Cookies.get('live_update') : 'OFF';
var msgAggData = {};
var chartView = false;

// Event logs
var logTable = null;
var DOMAIN_LOGS_FOR = ['RULES','EMAIL', 'SMS', 'VOICE', 'FCM','COMMAND'];

// Application logs
var idData = {};
$(".consoleBody").height($(window).height() - 50 + 'px')
var logLevels = {
    trace: 'default',
    debug: 'primary',
    info: 'info',
    warn: 'warning',
    error: 'danger',
    fatal: 'success',
    off: 'default',
    // all: 'default'
};
var nodesList = [];
var selectedNode = 'ALL';


$(document).ready(function () {
    device_linechart()  
    date()

    if(LIVE_UPDATE === 'ON'){
        $("#liveUpdate").prop('checked', true);
     }else{
         $("#liveUpdate").prop('checked', false);
     }

    // Message logs
    loadMsgSpec() 

    // Event logs
    for(var i=0;i<DOMAIN_LOGS_FOR.length;i++){
        $("#logType").append('<option value="'+DOMAIN_LOGS_FOR[i]+'">'+DOMAIN_LOGS_FOR[i]+'</option>');
    }
    loadLogs();
    
     // Application logs
     // mqttConnectGlobal(); //TODO: v5 platform not allowing 2nd time connection
     $(".logCard").css('height', ($(window).height() - 130) + 'px');

     $(".logLevelList").html('<option value="ALL">All Logs</option>')
     for(var key in logLevels){
         $(".logLevelList").append('<option value="'+key+'">'+key.toUpperCase()+'</option>')
     }
    
    // circle percentage progress
    const numbers = document.querySelectorAll('.number');
    const svgEl = document.querySelectorAll('svg circle');
    const counters = Array(numbers.length);
    const intervals = Array(counters.length);
    counters.fill(0);
    numbers.forEach((number, index) => {
        intervals[index] = setInterval(() => {
            // if(counters[index] === parseInt(number.dataset.num)){ 
            if (counters[index] === 1243) {
                clearInterval(counters[index]);
            } else {
                counters[index] += 1;
                number.innerHTML = counters[index];
                svgEl[index].style.strokeDashoffset = Math.floor(495 - 495 * parseFloat(number.dataset.num / 100));

            }
        }, 0);
    });
    // End - circle %

});

function toggleView() {
    chartView = chartView ? false : true;
    $('#tablePanel').toggle();
     $('#chartPanel').toggle();
     if(chartView){
        buildChartData()
        loadProcessedMsgData();
    }
}

function tableView(id) {
    if(id === 1){
        $("#messageTable").addClass('compactTable')
    }else{
        $("#messageTable").removeClass('compactTable')
    }
}

function device_linechart() {
    $("#deviceChart").html('<div id="deviceChartdiv"  style="height: 300px;margin:auto!important;"></div>');
    var chartDom = document.getElementById('deviceChartdiv');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: '#ffffff',
            formatter: '<div class="line-tip"> <h4 class="mb-0"> {c}</h4> <small>{b}</small> </div>'
        },
        xAxis: {
            type: 'category',
            data: ['11:00', '12:00', '01:00', '02:00', '03:00', '04:00', '05:00'], lineStyle: { color: 'yellow' },
            splitLine: {
                show: true
            },
            axisTick: {
                show: false
            },

            axisLabel: {
                color: 'orange'
            }
        },
        yAxis: {
            type: 'value',
            axisTick: {
                show: false
            },
            color: 'grey',
            splitLine: {
                show: false  // remove the value line axis
            },

        },

        grid: {
            top: 15,
            left: 50,
            bottom: 40,
            right: 20
        },

        series: [
            {
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                areaStyle: {},
                type: 'line',
                smooth: true,
                symbolSize: 8,
                color: "red",

                lineStyle: {
                    color: "red"
                },
            }
        ]
    };

    option && myChart.setOption(option);

}

function date() {
    startDate = moment().subtract(29, 'days').startOf('day');
    endDate = moment().endOf('days');
    $('#reportrange').daterangepicker({
        startDate: startDate,
        endDate: endDate,
        "opens": "left",
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
        }
    }, setDate);
 setDate(startDate, endDate);
}

function setDate(start, end) {
    var title = '';
    var range = '';
   
    startDate = start.startOf('day');
    endDate = end.endOf('day');

    loadMessages();

    if(chartView) {
        loadProcessedMsgData();
    }

    if (new Date(start).getTime() === new Date(moment().startOf('day')).getTime()) {
        title = 'Today:';
        range = start.format('MMMM D, YYYY');
    } else if (new Date(start).getTime() === new Date(moment().subtract(1, 'day').startOf('day')).getTime()) {
        title = 'Yesterday:';
        range = start.format('MMMM D, YYYY');
    }
    else {
        range = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');        
    }
    $('#reportrange span').html(title + ' ' + range);

}


function format(d) {

    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="margin-left:25px;">' +
        '<tr class="inner-row">' +
        '<th>NodeUId</th>' +
        '<th>NodeUId</th>' +
        '<th>Domain Key</th>' +
        '<th>Id</th>' +
        '</tr>' +
        '<tr>' +
        '<td>' + dataSet[0][10] + '</td>' +
        '<td>' + dataSet[0][11] + '</td>' +
        '<td>' + dataSet[0][12] + '</td>' +
        '<td>' + dataSet[0][13] + '</td>' +
        '</tr>' +
        '</table>';
}

function name(startMqtt) {
    switch (startMqtt) {
        case 'mesgLog':
            function mqttListen() {
                console.log(new Date + ' | MQTT Started to Subscribe');
            
                mqttSubscribeGlobal("/" + USER_OBJ.domainKey + "/log/#", 0);
            
                mqtt_client.onMessageArrived = function (message) {
            
                    // console.log(new Date + ' | MQTT Message Received :', message);
            
                    var parsedData = JSON.parse(message.payloadString);
                    var topicName = message.destinationName;
            
            
                    if (topicName.includes("/log/mrule/"+$(".msgList").val())) {
            
                        if(LIVE_UPDATE === 'ON') {
                            setTimeout(function (){
                                loadMessages(parsedData.mid);
                            },1500);
            
                        }
                    }
            
                    /*if(parsedData.mid === Number($(".msgList").val())){
            
            
                    }*/
                };
            }
            break;
        case 'appLog':
            function mqttListen() {
    
                if (MQTT_STATUS) {
            
                    console.log(new Date + ' | MQTT Started to Subscribe');
            
                    /*if (ADMIN_ACCESS) {
                        mqttSubscribeGlobal("/syslog/#", 0);
                    }else{
                        mqttSubscribeGlobal("/syslog/"+USER_OBJ.domainKey+"/#", 0);
            
                    }*/
            
                    setTimeout(function () {
                        mqttSubscribeGlobal("/" + USER_OBJ.domainKey + "/log/#", 0);
                    }, 500)
            
            
                    mqtt_client.onMessageArrived = function (message) {
            
                        var parsedData = JSON.parse(message.payloadString);
                        var topicName = message.destinationName;
            
                        // console.log("topicName => "+topicName, parsedData)
            
                        var nodeClass = new Date().getTime();
                        var color = 'default';
            
            
                        selectedNode = $(".nodesList").val();
                        var nodeClass = new Date().getTime();
                        if(parsedData.node) {
                            nodesList.push(parsedData.node);
                            nodesList = _.uniq(nodesList);
                        }
            
                        loadNodeList();
            
                        var logLevel = $(".logLevelList").val()
            
            
                        if ($(".nodesList").val() === 'ALL' || $(".nodesList").val() === parsedData.node) {
            
                            if (topicName.includes("cstatus")) {
            
                                var str = '';
            
                                try {
                                    var id = DOMAIN_KEY+"_"+parsedData.deviceid+"_"+parsedData.corrid;
                                    if (id) {
                                        str = '<a href="javascript:void(0)" style="color:#FF9800" onclick="openCorrID(\'' + id + '\')">' + parsedData.corrid + '</a>';
                                    } else {
                                        str = parsedData.corrid;
                                    }
            
                                }
                                catch (e) {
                                }
            
            
                                $(".logList").append("<li class='" + nodeClass + "' style='font-size: 12px;'><span class='label label-yellow' style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>COMMAND</span>" +
                                    "<b style='color: #9e9e9e8a'>" + moment().format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                                    (parsedData.node ? "<span style='font-weight: bold;display: inline-block;margin-left: 5px;color:#ffeb3bf0'> " + parsedData.node + "</span> " : '') +
                                    "<span style='white-space: pre-wrap;padding-left: 10px;'> [Device Id: " + parsedData.deviceid + "] [Correlation Id: "+ str +"] " +
                                    "[Status : "+parsedData.status+"] [Reason : "+(parsedData.reason ? parsedData.reason : '-')+"]" +
                                    "</span><br></li>");
            
                                $('.logCard').animate({
                                    scrollTop: $(".logList").height()
                                }, 1);
            
                            }
                            else if (topicName.includes("incoming")) {
            
                                $(".logList").append("<li class='" + nodeClass + "' style='font-size: 12px;'><span class='label label-grey' style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>MESSAGE</span>  " +
                                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                                    (parsedData.node ? "<span style='font-weight: bold;display: inline-block;margin-left: 5px;color:#ffeb3bf0' > " + parsedData.node + "</span> " : '') +
                                    "<span style='white-space: pre-wrap;padding-left: 10px;'> [Device Id: " + parsedData.did + "] [Message Id: "+ parsedData.mid +"] " +
                                    "[Data : "+JSON.stringify(parsedData.data)+"] "+
                                    "</span><br></li>");
            
                                $('.logCard').animate({
                                    scrollTop: $(".logList").height()
                                }, 1);
            
                            }
                            else {
                                if(parsedData.data !== '__ALL_DONE__') {
                                    var str = '';
            
                                    try {
                                        var id = parsedData.data.split(" ")[1].split(":")[1];
                                        if (id) {
                                            str = '<a href="javascript:void(0)" style="color:#FF9800" onclick="openID(\'' + id + '\')">' + id + '</a>';
                                        } else {
                                            str = id;
                                        }
            
                                        parsedData.data = parsedData.data.replace(id, str)
                                    }
                                    catch (e) {
                                    }
            
            
                                    if(logLevel === 'ALL' || logLevel === parsedData.level) {
            
            
                                        $(".logList").append("<li class='" + nodeClass + "' style='font-size: 12px;'>" +
                                            "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> "+
                                            " | <b style='color: #9e9e9e8a'>" + parsedData.domain + "</b> "+
                                            " | <b style='color: #9e9e9e8a'>" + parsedData.session + "</b> "+
                                            " | <b style='color: #9e9e9e8a'>" + parsedData.node + "</b> "+
                                            " | <b style='color: #9e9e9e8a'>" + parsedData.line + "</b> "+
                                            "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                                            "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                                            " <span style='white-space: pre-wrap;padding-left: 10px;' class='text-"+logLevels[parsedData.level]+"'>" + parsedData.data + "</span><br></li>");
            
            
                                        /*$(".logList").append("<li class='" + nodeClass + "' style='font-size: 12px;'><span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                                            "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                                            "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                                            (parsedData.node ? "<span style='font-weight: bold;display: inline-block;margin-left: 5px;color:#ffeb3bf0' > " + parsedData.node + "</span>" : '') +
                                            " <span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span><br></li>");*/
                                    }
            
                                    $('.logCard').animate({
                                        scrollTop: $(".logList").height()
                                    }, 1);
                                }
                            }
            
                        }
            
            
                    };
            
                }
            
            }
            break;
       
    }
}
// Start Message Logs

function liveUpdate(obj) {

    var flag = $(obj).is(':checked');

    if(flag){
        Cookies.set('live_update', 'ON');
        LIVE_UPDATE = 'ON'
    }else{
        Cookies.set('live_update', 'OFF');
        LIVE_UPDATE = 'OFF'
    }
}

function loadMsgSpec() {
    $(".msgList").html("");

    listMessageSpec(1000, null, null, function (status, data) {
        if (status && data.length > 0) {

            messageList = data;

            for(var i=0;i<messageList.length;i++){

                $(".msgList").append('<option value="'+messageList[i].id+'">'+messageList[i].name + ' ['+messageList[i].id+']</option>')

            }

            loadMessages(messageList[0].id);

        }
        $(".messageCount").html(0)

    })
}

function loadMessages(id) {

    if(!id){
        id = $(".msgList").val();
    }

    if (messageTable) {
        messageTable.destroy();
        $("#messageTable").html("");
    }

    var fields = [];


    var msgFields = [];

    for(var i=0;i<messageList.length;i++){
        if(Number(id) === Number(messageList[i].id)){
            msgFields = messageList[i].fields;
        }
    }

    var indexLength = msgFields.length;

    msgFields = _.union(msgFields,DEFAULT_FIELDS);


    for(var i=0;i<msgFields.length;i++){
        if(msgFields[i].dataType === 'TIMESTAMP'){
            if(msgFields[i].name !== 'deliveredstamp') {
                fields.push({
                    mData: msgFields[i].name,
                    sTitle: msgFields[i].name.toUpperCase(),
                    mRender: function (data, type, row) {
                        return moment(data).format('MM/DD/YYYY hh:mm:ss a')
                    },
                    orderable: true
                })
            }
        }else{
            fields.push({
                mData: msgFields[i].name,
                sTitle: msgFields[i].name.toUpperCase(),
                orderable: false,
                mRender: function (data, type, row) {
                    return data ? data : '-';
                },
            })
        }

    }
    var domainKeyJson = {"match": {"domainkey": DOMAIN_KEY}};


    var queryParams = {
        query: {
            "bool": {
                "must": [domainKeyJson],
                should : [],
                "filter":{"range":{"receivedstamp":{"gte":new Date(startDate).getTime(),"lte":new Date(endDate).getTime()}}}

            }
        },
        sort: [],
        "aggs": {
            "total_count": {
                "value_count": {
                    "field": "receivedstamp"
                }
            },
            "group_by_year": {
                "terms": {
                    "field": "year",
                    "size":5
                },
                "aggs":{
                    "group_by_month": {
                        "terms": {
                            "field": "month",
                            "size":12
                        },
                        "aggs": {
                            "group_by_date": {
                                "terms": {
                                    "field": "day",
                                    "size":31
                                },
                                "aggs" :{
                                    "group_by_hour": {
                                        "terms": {
                                            "field": "hour",
                                            "size":24
                                        },
                                        "aggs" :{
                                            "group_by_minute": {
                                                "terms": {
                                                    "field": "min",
                                                    "size":60
                                                },
                                                // "aggs" :{
                                                //     "group_by_second": {
                                                //         "terms": {
                                                //             "field": "sec",
                                                //             "size":60
                                                //         }
                                                //     }
                                                // }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }

    };

    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        dom: '<"search-left"f><"pull-left"l>rtip',
        searching: true,
        "ordering": true,
        aaSorting:  [[indexLength+2, 'desc']],
        iDisplayLength: 10,
        language: {
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> &nbsp;',
            "searchPlaceholder": "Search here...",
            "emptyTable": "No data found!",
            "processing": '<div class="p-2"><i class="fa fa-spinner fa-spin"></i> Processing</div>',
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        lengthMenu: [[10, 50, 100,250,500,1000], [10, 50, 100,250,500,1000]],
        "initComplete": function (settings, json) {
            $('#' + settings.nTable.id + '_filter input').wrap(`
          <div class="d-inline-flex"></div>
      `).after(`
          <button type="button" class="close d-none position-absolute" aria-label="Close" style="right: 42px; bottom:7px;font-size: 20px;">
            <span aria-hidden="true">&times;</span>
          </button>
          <button class="search-btn"> <i class="fa fa-search" aria-hidden="true"></i></button> 
      `).attr('required', 'required').attr('title', 'Search');

            // Click Event on Clear button
            $(document).on('click', '#' + settings.nTable.id + '_filter button', function () {
                $('#' + settings.nTable.id).DataTable({
                    "retrieve": true,
                }).search('').draw(); // reDraw table
            });
        },
        aoColumns: fields,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

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
                queryParams.query['bool']['should'].push({ "wildcard": { "deviceid": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "deviceid": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "deviceid": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "deviceid": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query.bool.should.push({
                    "match_phrase": {
                        "deviceid": searchText
                    }
                })
                // queryParams.query['bool']['should'].push({
                //     "match_phrase_prefix": {
                //         "deviceid": {
                //             "query": "*" + searchText + "*"
                //         }
                //     }
                // })

                queryParams.query['bool']["minimum_should_match"] = 1;

            }

            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : 'MESSAGE',
                specId : id

            };

            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resData = searchQueryFormatterNew(data);
                    msgAggData = resData.aggregations;

                    if(chartView){
                        buildChartData()
                        loadProcessedMsgData();
                    }

                    var resultData =resData.data;
                    resultData['draw'] = oSettings.iDraw;

                    $(".totalCount").html(msgAggData.total_count.value);


                    if(resultData.recordsFiltered >= 10000){
                        resultData.recordsFiltered = 10000;
                    }

                    fnCallback(resultData);
                },
            });
        }

    };

    messageTable = $("#messageTable").DataTable(tableOption);

}

function buildChartData() {

    var filterBy = $("#filterBy").val();

    // console.log(msgAggData)


    var yearBucket = msgAggData['group_by_year'].buckets;

    var chartData = [];

    console.log(yearBucket)

    if(filterBy === 'YEAR') {

        for (var i = 0; i < yearBucket.length; i++) {
            chartData.push({key: yearBucket[i].key + '', value: yearBucket[i]['doc_count']})
        }
    }

    if(filterBy === 'MONTH') {

        for (var i = 0; i < yearBucket.length; i++) {

            var monthBucket = yearBucket[i]['group_by_month'].buckets;



            for (var j = 0; j < monthBucket.length; j++) {
                chartData.push({key: monthBucket[j].key + '/'+yearBucket[i].key, value: monthBucket[j]['doc_count']})
            }
        }
    }

    if(filterBy === 'DATE') {

        for (var i = 0; i < yearBucket.length; i++) {

            var monthBucket = yearBucket[i]['group_by_month'].buckets;

            for (var j = 0; j < monthBucket.length; j++) {

                var dayBucket = monthBucket[j]['group_by_date'].buckets;

                for (var k = 0; k < dayBucket.length; k++) {
                    chartData.push({key: dayBucket[k].key+'/'+monthBucket[j].key + '/'+yearBucket[i].key, value: dayBucket[k]['doc_count']})
                }
            }
        }
    }

    if(filterBy === 'HOUR') {

        for (var i = 0; i < yearBucket.length; i++) {

            var monthBucket = yearBucket[i]['group_by_month'].buckets;

            for (var j = 0; j < monthBucket.length; j++) {

                var dayBucket = monthBucket[j]['group_by_date'].buckets;

                for (var k = 0; k < dayBucket.length; k++) {

                    var hourBucket = dayBucket[k]['group_by_hour'].buckets;

                    for (var l = 0; l < hourBucket.length; l++) {

                        var disText = moment(dayBucket[k].key+'/'+monthBucket[j].key + '/'+yearBucket[i].key +' '+hourBucket[l].key+":00","DD/MM/YYYY HH:mm")

                        console.log(new Date(disText))

                        chartData.push({key: dayBucket[k].key+'/'+monthBucket[j].key + '/'+yearBucket[i].key +' '+hourBucket[l].key+":00", value: hourBucket[l]['doc_count']})
                    }
                }
            }
        }
    }


    if(filterBy === 'MINUTE') {

        for (var i = 0; i < yearBucket.length; i++) {

            var monthBucket = yearBucket[i]['group_by_month'].buckets;

            for (var j = 0; j < monthBucket.length; j++) {

                var dayBucket = monthBucket[j]['group_by_date'].buckets;

                for (var k = 0; k < dayBucket.length; k++) {

                    var hourBucket = dayBucket[k]['group_by_hour'].buckets;

                    for (var l = 0; l < hourBucket.length; l++) {


                        var minBucket = hourBucket[l]['group_by_minute'].buckets;

                        for (var m = 0; m < minBucket.length; m++) {
                            chartData.push({key: dayBucket[k].key+'/'+monthBucket[j].key + '/'+yearBucket[i].key +' '+hourBucket[l].key+":"+minBucket[m].key,
                                value: minBucket[m]['doc_count']})
                        }
                    }
                }
            }
        }
    }

    if(filterBy === 'SECOND') {

        for (var i = 0; i < yearBucket.length; i++) {

            var monthBucket = yearBucket[i]['group_by_month'].buckets;

            for (var j = 0; j < monthBucket.length; j++) {

                var dayBucket = monthBucket[j]['group_by_date'].buckets;

                for (var k = 0; k < dayBucket.length; k++) {

                    var hourBucket = dayBucket[k]['group_by_hour'].buckets;

                    for (var l = 0; l < hourBucket.length; l++) {


                        var minBucket = hourBucket[l]['group_by_minute'].buckets;

                        for (var m = 0; m < minBucket.length; m++) {

                            var secBucket = minBucket[m]['group_by_second'].buckets;

                            for (var n = 0; n < secBucket.length; n++) {
                                chartData.push({key: dayBucket[k].key+'/'+monthBucket[j].key + '/'+yearBucket[i].key +' '+
                                hourBucket[l].key+":"+minBucket[m].key+":"+secBucket[n].key,
                                    value: secBucket[n]['doc_count']})
                            }

                        }
                    }
                }
            }
        }
    }


    var msgChart = echarts.init(document.getElementById('message_view'));
    msgChart.showLoading();




    loadMsgChart(chartData,msgChart);
}

function loadMsgChart(obj,myChart) {

    myChart.hideLoading();


    var chartOption =   {
        title: {
            text: 'Message Statistics',
            left: 'center',
            top: 0,
            textStyle: {
                color: '#666',
                fontSize:12
            }
        },
        toolbox: {
            feature: {
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true},
            },
            showTitle: false,

        },

        tooltip : {
            trigger: 'axis',
            // axisPointer : {
            //     type : 'shadow'
            // },
            formatter: "{b} <br> <b>{c}</b> Messages"
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : _.pluck(obj,'key'),
                axisTick: {
                    alignWithLabel: true
                }

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        dataZoom: [{
            type: 'inside',
            start: 75,
            end: 100
        }, {
            start: 0,
            end: 10,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }
        }],
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
            return idx * 5;
        },
        series : [
            {
                name:'Messages',
                type:'line',
                data:_.pluck(obj,'value'),
                markPoint: {
                    data: [
                        {type: 'max', name: 'Max'},
                        {type: 'min', name: 'Min'}
                    ]
                },
                markLine: {
                    data: [
                        {type: 'average', name: 'Average'}
                    ]
                },
                animationDelay: function (idx) {
                    return idx * 10;
                },
            }
        ]
    };


    myChart.setOption(chartOption);

}

function loadProcessedMsgData() {


    var myChart = echarts.init(document.getElementById('message_processed_view'));
    myChart.showLoading();

    var queryParams = {
        query: {
            "bool": {
                "must": [{"match": {"domainkey": DOMAIN_KEY}}],
                "filter": {
                    "range": {
                        "receivedstamp": {
                            "gte": new Date(startDate).getTime(),
                            "lte": new Date(endDate).getTime()
                        }
                    }
                }

            }
        },
        sort: [{receivedstamp: {order: 'desc'}}],
        size: 500,
        from: 0
    };

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    searchByQuery($(".msgList").val(), 'MESSAGE', searchQuery, function (status, data) {

        if (status) {
            var resultData = QueryFormatter(data).data;
            var resData = resultData.data;


            var chartData = [];

            for(var i=0;i<resData.length;i++){
                chartData.push({key:moment(resData[i].receivedstamp).format('MM/DD/YYYY hh:mm a'), value:resData[i].msec})
            }


            loadProcessedMsgChart(chartData, myChart)
        }

    });
}

function loadProcessedMsgChart(obj,myChart) {

    myChart.hideLoading();


    var chartOption =   {
        title: {
            text: 'Message Processed Statistics',
            left: 'center',
            top: 0,
            textStyle: {
                color: '#666',
                fontSize:12
            }
        },
        toolbox: {
            feature: {
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true},
            },
            showTitle: false,

        },

        tooltip : {
            trigger: 'axis',
            // axisPointer : {
            //     type : 'shadow'
            // },
            formatter: "{b} <br> <b>{c}</b> Milli Seconds"
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : _.pluck(obj,'key'),
                axisTick: {
                    alignWithLabel: true
                }

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        dataZoom: [{
            type: 'inside',
            start: 0,
            end: 25
        }, {
            start: 0,
            end: 10,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }
        }],
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
            return idx * 5;
        },
        series : [
            {
                name:'Milli Seconds',
                type:'line',
                data:_.pluck(obj,'value'),
                markPoint: {
                    data: [
                        {type: 'max', name: 'Max'},
                        {type: 'min', name: 'Min'}
                    ]
                },
                markLine: {
                    data: [
                        {type: 'average', name: 'Average'}
                    ]
                },
                animationDelay: function (idx) {
                    return idx * 10;
                },
            }
        ]
    };


    myChart.setOption(chartOption);

}
// End Message Logs


// Start event logs
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
                mData: 'ruleId',
                sTitle: 'Rule ID / Name',
                orderable: false,
                mRender: function (data, type, row) {
                    return row['messageId'] ? row['messageId'] : (data ? data : "-");
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
                sTitle: 'Occurred Time',
                orderable: true,
                mRender: function (data, type, row) {
                    return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
                }
            },
            {
                mData: 'message',
                sTitle: 'Response',
                orderable: false,
                sWidth:'60%',
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
        sort : [[2, 'desc']]
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
                "must": [domainKeyJson],
                "should": []
            }
        },
        sort: [defaultSorting]
    };

    var type = $("#logType").val();

    $(".eventType").html(type);

    if(type === 'RULES'){
        queryParams["aggs"] ={
            "total_count": {
                "value_count": {
                    "field": "occuredAt"
                }
            },
        }
    }
    else if(type === 'COMMAND'){
        queryParams["aggs"] ={
            "total_count": {
                "value_count": {
                    "field": "createdStamp"
                }
            },
        }
    }else{
        queryParams["aggs"] ={
            "total_count": {
                "value_count": {
                    "field": "queuedAt"
                }
            },
        }
    }

    var fields = logFields[type].fields;
    var sortOrder = logFields[type].sort;

    if(type === 'RULES'){
        type = 'RULE_FAILURE';
        $(".eventType").html('FAILURE RULES');
    }


    var tableOption = {
        responsive: true,
        paging: true,
        aoColumns: fields,
        dom: '<"search-left"f><"pull-left"l>rtip',
        searching: true,
        aaSorting: sortOrder,
        "ordering": true,
        iDisplayLength: 10,language: {
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> &nbsp;',
            "searchPlaceholder": "Search here...",
            "emptyTable": "No data found!",
            "processing": '<div class="p-2"><i class="fa fa-spinner fa-spin"></i> Processing</div>',
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        "initComplete": function (settings, json) {
            $('#' + settings.nTable.id + '_filter input').wrap(`
          <div class="d-inline-flex"></div>
      `).after(`
          <button type="button" class="close d-none position-absolute" aria-label="Close" style="right: 42px; bottom:7px;font-size: 20px;">
            <span aria-hidden="true">&times;</span>
          </button>
          <button class="search-btn"> <i class="fa fa-search" aria-hidden="true"></i></button> 
      `).attr('required', 'required').attr('title', 'Search');

            // Click Event on Clear button
            $(document).on('click', '#' + settings.nTable.id + '_filter button', function () {
                $('#' + settings.nTable.id).DataTable({
                    "retrieve": true,
                }).search('').draw(); // reDraw table
            });
        },
       
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {
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

                queryParams.query['bool']['should'].push({"wildcard" : { "message" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "ruleId" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "data" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "deviceId" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "receipents" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "receipent" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "content" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "toAddress" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']["minimum_should_match"]=1;
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

                    var resData = searchQueryFormatterNew(data);

                    var resultData = resData.data;

                    $(".event_totalCount").html(resData.aggregations.total_count.value);
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    logTable = $("#logTable").DataTable(tableOption);
}
// End event logs


// Start Application logs

function loadNodeList() {
    $(".nodesList").html('<option value="ALL">All Nodes</option>')
    for (var i = 0; i < nodesList.length; i++) {

        $(".nodesList").append('<option value="' + nodesList[i] + '">' + nodesList[i] + '</option>')

    }

    $(".nodesList").val(selectedNode);
}

function clearLogs() {
    $(".logList").html("");
}

function openID(id) {
    $(".idData").html('');
    getDeviceMessage(id, function (status, data) {
        if (status) {
            $(".idData").html(JSON.stringify(data));
            $("#idModal").modal('show');
        }
    })
}


function openCorrID(id) {
    $(".cmdData").html('');
    findByID(id,'COMMAND',function (status, data) {
        if (status) {
            var result = JSON.parse(data.result);
            console.log(result)
            $(".cmdData").html(JSON.stringify(result['_source']));
            $("#cmdModal").modal('show');
        }
    });
}
// End Application logs