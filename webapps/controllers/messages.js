var messageTable = null;
var messageList = [];
var LIVE_UPDATE = Cookies.get('live_update') ? Cookies.get('live_update') : 'OFF';

var liveInterval = null;
var msgAggData = {};

var startDate = moment().subtract(29, 'days');
var endDate = moment();
var chartView = false;


$(document).ready(function () {
    // mqttConnectGlobal(); //TODO: v5 platform not allowing 2nd time connection
    // $("#header").remove();
    loadMsgSpec();
    $("body").removeClass('bg-white');


    if(LIVE_UPDATE === 'ON'){
       $("#liveUpdate").prop('checked', true);
    }else{
        $("#liveUpdate").prop('checked', false);
    }

    $('#reportrange').daterangepicker({
        startDate: startDate,
        endDate: endDate,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            'Last 3 Months': [moment().subtract(3, 'month'), moment().subtract(1, 'month')],
            'Last 6 Months': [moment().subtract(6, 'month'), moment()]
        }
    }, setDate);

    setDate(startDate, endDate);
});


function setDate(start, end) {
    startDate = start.startOf('day');
    endDate = end.endOf('day');

    loadMessages();

    if(chartView) {
        loadProcessedMsgData();
    }

    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
}

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
        searching: true,
        "ordering": true,
        aaSorting:  [[indexLength+2, 'desc']],
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100,250,500,1000], [10, 50, 100,250,500,1000]],
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

        $(".msgCount").html(totalRecords);


        return resultObj;

    } else {

        return resultObj;
    }

}

function switchTable(id) {
    if(id === 1){
        $("#messageTable").addClass('compactTable')
    }else{
        $("#messageTable").removeClass('compactTable')
    }
}


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


function toggleTable() {

    chartView = chartView ? false : true;
    $(".tableDiv").toggle();
    $(".chartDiv").toggle();

    if(chartView){
        buildChartData()
        loadProcessedMsgData();

    }
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
