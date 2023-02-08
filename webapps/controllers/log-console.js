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
    $("#header").remove();
    // mqttConnectGlobal(); //TODO: v5 platform not allowing 2nd time connection
    $(".logCard").css('height', ($(window).height() - 130) + 'px');

    $(".logLevelList").html('<option value="ALL">All Logs</option>')
    for(var key in logLevels){
        $(".logLevelList").append('<option value="'+key+'">'+key.toUpperCase()+'</option>')
    }
    mqttConnect()
});


function mqttListen() {

    if (MQTT_STATUS) {

        console.log(new Date + ' | MQTT Started to Subscribe');

        /*if (ADMIN_ACCESS) {
            mqttSubscribeGlobal("/syslog/#", 0);
        }else{
            mqttSubscribeGlobal("/syslog/"+USER_OBJ.domainKey+"/#", 0);

        }*/

        /* setTimeout(function () {
            mqttSubscribeGlobal("/" + USER_OBJ.domainKey + "/log/#", 0);
        }, 500) */

        mqttSubscribe("/" + USER_OBJ.domainKey + "/log/#", 0);

        mqttSubscribe("/global/#", 0);


        mqtt_client.onMessageArrived = function (message) {

            var parsedData = JSON.parse(message.payloadString);
            var topicName = message.destinationName;


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