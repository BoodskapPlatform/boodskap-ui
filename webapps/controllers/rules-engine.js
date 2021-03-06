var rules_page_size = 100;
var rules_direction = null;
var rules_id = null;
var message_rules_list = [];
var message_spec_list = [];
var schedule_rules_list = [];
var named_rules_list = [];
var binary_rules_list = [];
var file_rules_list = [];
var job_rules_list = [];
var process_rules_list = [];
var sftp_rules_list = [];
var mqtt_rules_list = [];
var udp_rules_list = [];
var tcp_rules_list = [];
var email_rules_list = [];
var groovy_class_list = [];
var jar_class_list = [];
var tabbar_list = [];
var domain_rule_obj = {};
var codeEditor = null;
var CURRENT_ID = null;
var CURRENT_TYPE = null;
var editorToggle = false;

var current_msg_id = null;
var current_msg_obj = null;
var current_namedrule_obj = null;
var current_binaryrule_obj = null;
var current_filerule_obj = null;
var current_processrule_obj = null;
var current_sftprule_obj = null;
var simulatorModal = {};
var simulator = {};
var scriptTerminal = null;

var editorChange = false;
var CHANGED_ID = null;
var CHANGED_TYPE = null;
var CHANGED_TEXT = null;
var CHANGED_DEFAULT_TEXT = null;

var logLevels = {
    trace: 'default',
    debug: 'primary',
    info: 'info',
    warn: 'warning',
    error: 'danger',
    fatal: 'success',
    off: 'default',
    all: 'default'
};

var docLayout = null;
var mqttTimer = null;

$(".barMenu").removeClass('active');
$(".menuEditor").addClass('active');
$(".mainwindow").css('min-height', $(window).height() - 90 + 'px');


$(document).ready(function () {
    loadContextList()
    $(".contextBody").css('height',$(window).height()-350)
    $(".elasticBody").css('height',$(window).height()-250)

    $('#helpModal .modal-dialog').draggable({
        handle: "#helpModal .modal-header"
    });

    $('#pfTag').val(Cookies.get('pfTag') ? Cookies.get('pfTag') : '')

    if(USER_OBJ.globalAccess){
        $("#pType").append('<option value="GLOBAL">Global</option>')
    }

    if(USER_OBJ.systemAccess){
        $("#pType").append('<option value="SYSTEM">System</option>')
    }

    loadProcessRulesListAggs()



    mqttConnect();

    if(Cookies.get('fatal')){
        $(".fatal").prop("checked", Cookies.get('fatal') === 'true' ? true : false)
    }
    if(Cookies.get('error')){
        $(".error").prop("checked", Cookies.get('error') === 'true' ? true : false)
    }
    if(Cookies.get('warn')){
        $(".warn").prop("checked", Cookies.get('warn') === 'true' ? true : false)
    }
    if(Cookies.get('info')){
        $(".info").prop("checked", Cookies.get('info') === 'true' ? true : false)
    }
    if(Cookies.get('debug')){
        $(".debug").prop("checked", Cookies.get('debug') === 'true' ? true : false)
    }
    if(Cookies.get('trace')){
        $(".trace").prop("checked", Cookies.get('trace') === 'true' ? true : false)
    }

    document.getElementById('importFile')
        .addEventListener('change', getImportFile)

    setTimeout(function () {
        $(".loaderBlock").remove();
        $(".mainwindow").css('display', 'block');
        docLayout = $('.mainwindow').layout({
            applyDefaultStyles: true,
            north: {
                resizable: true
            },
            south: {
                size: 200,
                resizable: true
                // size: true
                //	CALLBACK TESTING...
                // ,	onhide_start:			function () { return confirm("START South pane hide \n\n onhide_start callback \n\n Allow pane to hide?"); }
                // ,	onhide_end:				function () { alert("END South pane hide \n\n onhide_end callback"); }
                // ,	onshow_start:			function () { return confirm("START South pane show \n\n onshow_start callback \n\n Allow pane to show?"); }
                // ,	onshow_end:				function () { alert("END South pane show \n\n onshow_end callback"); }
                // ,	onopen_start:			function () { return confirm("START South pane open \n\n onopen_start callback \n\n Allow pane to open?"); }
                // ,	onopen_end:				function () { alert("END South pane open \n\n onopen_end callback"); }
                , onclose_start: function () {
                }
                , onclose_end: function () {
                    setTimeout(function () {
                        $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');

                        codeEditor.resize();
                    }, 500);

                    $(".consoleBox").height(($(".ui-layout-south").height()-20) + 'px')

                }
                , onresize_end: function () {
                    setTimeout(function () {
                        $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');
                        codeEditor.resize();
                    }, 500);
                    $(".consoleBox").height(($(".ui-layout-south").height()-20) + 'px')
                }

            },
            east: {
                resizable: true,
                size: 250,

            },
            west: {
                resizable: false,
            }
        });
        docLayout
            .bindButton('#consoleMax', 'toggle', 'west')
            .bindButton('#consoleMax', 'toggle', 'east')

            .bindButton('#btnMax', 'toggle', 'south')
            .bindButton('#btnMax', 'toggle', 'west')
            .bindButton('#btnMax', 'toggle', 'east');
        //initial load functions

        if(qs('ruletype')){
            $("#rulesType").val(2);
            loadRules(2);
        }else{
            loadRules(1);
        }

        // preLoading('Loading Editor')
        setTimeout(function () {
            $(".listHeight").css('height', $(".leftSide").height() - 150)
            loadDomainCode();
            // closePreLoading();
            $(".loaderBlock").css('display', 'none');
            $(".classFolder").css('height', $(".rightSide").height() - 150)
            $(".consoleBox").height(($(".ui-layout-south").height()-20) + 'px')
            loadCodeType();


        }, 500);




    }, 100);


});


function mqttListen() {

    if (MQTT_STATUS) {

        console.log(new Date + ' | MQTT Started to Subscribe');

        mqttSubscribe("/" + USER_OBJ.domainKey + "/log/#", 0);

        mqttSubscribe("/global/#", 0);

        if(ADMIN_ACCESS){
            mqttSubscribe("/system/#", 0);
        }


        mqtt_client.onMessageArrived = function (message) {

            // console.log(new Date + ' | MQTT Message Received :', message);

            var parsedData = JSON.parse(message.payloadString);
            var topicName = message.destinationName;

            var nodeClass = new Date().getTime();
            var color = 'default';

            // console.log('Log Enabled :',$(".allLogs").is(":checked"))
            // console.log('parsedData :',parsedData)
            // console.log(CURRENT_TYPE ,"====",topicName);

            if ($(".allLogs").is(":checked")) {

                mqttDomainRule(topicName, parsedData);
                mqttMesageRule(topicName, parsedData);
                mqttNamedRule(topicName, parsedData);
                mqttScheduleRule(topicName, parsedData);
                mqttBinaryRule(topicName, parsedData);
                mqttJobRule(topicName, parsedData);
                mqttFileRule(topicName, parsedData);
                mqttProcessRule(topicName, parsedData);
                mqttSftpRule(topicName, parsedData);
                mqttMqttRule(topicName, parsedData);
                mqttUdpRule(topicName, parsedData);
                mqttTcpRule(topicName, parsedData);
                mqttEmailRule(topicName, parsedData);

            } else {
                if (CURRENT_TYPE === 0) {
                    mqttDomainRule(topicName, parsedData);

                } else if (CURRENT_TYPE === 1) {
                    mqttMesageRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 2) {
                    mqttNamedRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 3) {
                    mqttScheduleRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 6) {
                    mqttBinaryRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 7) {
                    mqttJobRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 8) {
                    mqttFileRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 9) {
                    mqttProcessRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 10) {
                    mqttSftpRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 11) {
                    mqttMqttRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 12) {
                    mqttUdpRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 13) {
                    mqttTcpRule(topicName, parsedData);
                }
                else if (CURRENT_TYPE === 14) {
                    mqttEmailRule(topicName, parsedData);
                }

            }


            /*if(topicName.includes("/log/incoming")){

                var mId = parsedData.mid;

                // console.log("Parsed Data =>",parsedData)

                $(".deviceHtml").append("<div class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-success'" +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>"+parsedData.mid+"</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>"+parsedData.did+"</span></div>");

                $('.consoleBox').animate({
                    scrollTop: $(".deviceHtml").height()
                }, 1000);
            }*/


        };

    }

}

function mqttDomainRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("DOMAIN =>", topicName)

    if (topicName.includes("/log/drule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            var level = parsedData.level;



            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }
                var rName = topicName.split("/")[3];
                $(".loggerHtml").append("<div title='Domain Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields+
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}

function mqttMesageRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    // console.log("MESSAGE =>", topicName)

    if (topicName.includes("/log/mrule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='Message Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}

function mqttNamedRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    // console.log("NAMED =>", topicName)

    if (topicName.includes("/log/nrule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='Named Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}

function mqttFileRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    // console.log("NAMED =>", topicName)

    if (topicName.includes("/log/frule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='File Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}

function mqttScheduleRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    // console.log("SCHEDULE =>", topicName)

    if (topicName.includes("/log/srule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='Schedule Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}


function mqttBinaryRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("BINARY =>", topicName)

    if (topicName.includes("/log/brule")) {

        if (parsedData.data !== '__ALL_DONE__') {
            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='Binary Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}

function mqttProcessRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("JOB =>", topicName)

    if (topicName.includes("/proc/")) {

        if (parsedData.data !== '__ALL_DONE__') {
            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='Process Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}

function mqttJobRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("JOB =>", topicName)

    if (topicName.includes("/log/job")) {

        if (parsedData.data !== '__ALL_DONE__') {
            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='Job Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}

function mqttSftpRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("SFTP =>", topicName)

    if (topicName.includes("/log/sftp")) {

        if (parsedData.data !== '__ALL_DONE__') {
            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='SFTP Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}
function mqttMqttRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("MQTT =>", topicName)

    if (topicName.includes("/log/mqtt")) {

        if (parsedData.data !== '__ALL_DONE__') {
            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='MQTT Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}
function mqttUdpRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("UDP =>", topicName)

    if (topicName.includes("/log/udp")) {

        if (parsedData.data !== '__ALL_DONE__') {
            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='UDP Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}
function mqttTcpRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("TCP =>", topicName)

    if (topicName.includes("/log/tcp")) {

        if (parsedData.data !== '__ALL_DONE__') {
            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='TCP Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}
function mqttEmailRule(topicName, parsedData) {
    var nodeClass = new Date().getTime();
    var color = 'default';

    console.log("EMAIL =>", topicName)

    if (topicName.includes("/log/email")) {

        if (parsedData.data !== '__ALL_DONE__') {
            var level = parsedData.level;

            if($("."+level.toLowerCase()).is(":checked")) {

                var fields = '';

                if($(".node").is(":checked")){
                    fields+= ' ['+parsedData.node+'] '
                }
                if($(".session").is(":checked")){
                    fields+= ' ['+parsedData.session+'] '
                }

                var rName = topicName.split("/")[4];
                $(".loggerHtml").append("<div title='Email Rule: "+rName+"' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " + fields +
                    "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></div>");
            }

        }
        if (parsedData.data === '__ALL_DONE__') {
            $('.consoleBox').animate({
                scrollTop: $(".loggerHtml").height()
            }, 100);
        }
    }
}


function mqttCancelSubscribe(id) {

    if (!id) {
        id = CURRENT_ID;
    }

    try {

        mqttUnsubscribe("/" + USER_OBJ.domainKey + "/log/#");
        if(ADMIN_ACCESS){
            mqttUnsubscribe("/system/#");
        }
        mqttUnsubscribe("/global/#");

    }
    catch (e) {
    }

}

function enableLogs() {

}

function debugEnable(obj) {

    // var status = $("input[name='debugStatus']:checked").val();
    //
    //
    // if (status === 'false') {
    //     mqttCancelSubscribe();
    //     // $(obj).removeClass('active');
    //     feedback('Debugging Disabled!')
    // } else {
    //     mqttListen();
    //     // $(obj).addClass('active');
    //     feedback('Debugging Enabled!')
    // }
}

function clearLogs() {
    $(".loggerHtml").html("");
    feedback('Success!')

}

function loadRules(id) {
    id = id * 1;
    // $(".messageTab").remove();
    // $(".scheduleTab").remove();
    // $(".namedTab").remove();
    $(".pOption").css('display','none')
    $(".detailsBlock").css('display', 'block')
    if (id === 1) {
        loadMessageRulesList();
    } else if (id === 2) {
        loadNamedRulesList();
    } else if (id === 3) {
        loadScheduleRulesList();
    } else if (id === 4) {
        $(".detailsBlock").css('display', 'none')
        loadGroovyClasses();
    } else if (id === 5) {
        $(".detailsBlock").css('display', 'none')
        loadJarClasses();
    } else if (id === 6) {
        // $(".detailsBlock").css('display', 'none')
        loadBinaryRulesList();
    }
    else if (id === 7) {
        loadJobRulesList();
    }
    else if (id === 8) {
        loadFileRulesList();
    }
    else if (id === 9) {
        $(".pOption").css('display','block')
        loadProcessRulesList();
    }
    else if (id === 10) {
        loadSftpRulesList();
    }
    else if (id === 11) {
        loadMqttRulesList();
    }
    else if (id === 12) {
        loadUdpRulesList();
    }
    else if (id === 13) {
        loadTcpRulesList();
    }
    else if (id === 14) {
        loadEmailRulesList();
    }
}

function searchFunction() {
    // Declare variables
    var input, filter, ul, li, a, i;
    input = $.trim($('#searchInput').val());
    filter = input.toUpperCase();
    li = $(".rulesListli");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        var str = li[i].innerText;
        if (str.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "block";
        } else {
            li[i].style.display = "none";
        }
    }
}

function loadMessageSpecList() {
    listMessageSpec(rules_page_size, null, null, function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadMessageRulesList()" title="click here to reload"  style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Message Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()


        if (status && data.length > 0) {
            message_spec_list = data;

            for (var i = 0; i < data.length; i++) {

                var flag = true;

                for (var j = 0; j < message_rules_list.length; j++) {

                    if (data[i].id === message_rules_list[j].messageId) {
                        data[i].ruleObj = message_rules_list[j];
                        flag = false;
                    }
                }

                if(flag){
                    var obj = {domainKey: null, lang: "GROOVY", code: "", messageId: data[i].id, messageName: ''};
                    message_rules_list.push(obj);
                }

                var str = '<li  class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(' + data[i].id + ',1)">' +
                    '<img src="images/file.png" /> <b>' + data[i].id + '</b>  <br> <small>' + data[i].name + '</small></li>';
                $(".rulesList").append(str);

            }
        } else {

            errorMsg('No Messages Defined so far!')

        }
    })
}

function loadMessageRulesList() {
    listMessageRules(rules_page_size, rules_direction, rules_id, function (status, data) {
        if (status) {

            message_rules_list = data;

            loadMessageSpecList();

        } else {
            loadMessageSpecList();
        }
    })
}


function loadNamedRulesList() {
    listNamedRules(rules_page_size, null, null, function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadNamedRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Named Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            named_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].name + '" data-id="' + data[i].name + '" onclick="loadTabbar(\'' + data[i].name + '\',2)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No Named Rules Found!')
        }
    })
}


function loadBinaryRulesList() {
    listBinaryRules(rules_page_size, null, null, function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadBinaryRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Binary Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            binary_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].type + '" data-id="' + data[i].type + '" onclick="loadTabbar(\'' + data[i].type + '\',6)">' +
                    '<img src="images/file.png" /> <b>' + data[i].type + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No Binary Rules Found!')
        }
    })
}


function loadFileRulesList() {
    listFileRules(rules_page_size, null, null, function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadBinaryRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Fine Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            file_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].type + '" data-id="' + data[i].type + '" onclick="loadTabbar(\'' + data[i].type + '\',8)">' +
                    '<img src="images/file.png" /> <b>' + data[i].type + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No File Rules Found!')
        }
    })
}

function loadProcessRulesListAggs(){

    var query = {
        query:{
            bool : {
                must:[{match:{domainKey:DOMAIN_KEY}}],
                should:[]
            }
        },
        from:0,
        size:0,
        aggs:{
            group:{
                terms:{
                    field:'group',
                    size:1000
                }
            }
        }
    }
    var pType = 'PROCESS';

    if($("#pType").val() === 'GLOBAL'){
        pType = 'GLOBAL_PROCESS';
    }
    if($("#pType").val() === 'SYSTEM'){
        pType = 'SYSTEM_PROCESS';
    }

    listProcessRules(query,pType, function (status, data) {
        if(status) {

            var resultData = QueryFormatter(data);

            $("#pfGroup").html('<option value="">All Groups</option>')
            var aggs = resultData.aggregations.group.buckets;

            for (var i = 0; i < aggs.length; i++) {
                if(aggs[i].key){
                    $("#pfGroup").append('<option value="' + aggs[i].key + '">' + aggs[i].key + ' (' + aggs[i].doc_count + ')</option>')
                }

            }

            $("#pfGroup").val(Cookies.get('pfGroup'))

            $("#pfGroup").select2()
        }
    });
}

function loadProcessRulesList() {
    var query = {
        query:{
            bool : {
                must:[{match:{domainKey:DOMAIN_KEY}}],
                should:[]
            }
        },
        from:0,
        size:9999,
        aggs:{
            group:{
                terms:{
                    field:'group',
                    size:1000
                }
            }
        }
    }
    var pType = 'PROCESS';

    if($("#pType").val() === 'GLOBAL'){
        pType = 'GLOBAL_PROCESS';
        query['query'] = {}
    }
    if($("#pType").val() === 'SYSTEM'){
        pType = 'SYSTEM_PROCESS';
        query['query'] = {}
    }
    if($("#pfGroup").val()){
        Cookies.set('pfGroup',$('#pfGroup').val())
        query.query['bool']['must'].push({ "match": { "group": $('#pfGroup').val() } });

    }else{
        Cookies.set('pfGroup','')
    }

    if($('#pfTag').val()){
        Cookies.set('pfTag',$('#pfTag').val())
        query.query['bool']['should'].push({ "wildcard": { "tags": "*" + $('#pfTag').val() + "*" } });
        query.query['bool']['should'].push({ "wildcard": { "tags": "*" + $('#pfTag').val().toLowerCase() + "*" } });
        query.query['bool']['should'].push({ "wildcard": { "tags": "*" + $('#pfTag').val().toUpperCase() + "*" } });
        query.query['bool']['should'].push({ "wildcard": { "tags": "*" + capitalizeFLetter($('#pfTag').val()) + "*" } })
        query.query.bool.should.push({
            "match_phrase": {
                "tags": $('#pfTag').val()
            }
        })
        query.query.bool.should.push({
            "match": {
                "tags": $('#pfTag').val()
            }
        })
        query.query['bool']["minimum_should_match"] = 1;
    }else{
        Cookies.set('pfTag','')
    }

    $(".rulesList").html("");
    listProcessRules(query,pType, function (status, data) {

        $(".rulesList").append('<li class="" onclick="loadProcessRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Process Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if(status){

            var resultData = QueryFormatter(data);

            data = resultData.data.data;

            process_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',9)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }


        } else {
            errorMsg('No Process Rules Found!')
        }
    })
}


function loadJobRulesList() {
    listJobRules(function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadJobRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Job Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            job_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',7)">' +
                    '<img src="images/file.png" /> <b>' + data[i].id + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No Job Rules Found!')
        }
    })
}

function loadSftpRulesList() {
    listInputRules("SFTP_INPUT",function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadSftpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> SFTP Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status) {


            var resultData = QueryFormatter(data);

            data = resultData.data.data;

            sftp_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',10)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No SFTP Rules Found!')
        }
    })
}
function loadMqttRulesList() {
    listInputRules("MQTT_INPUT",function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadMqttRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> MQTT Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            mqtt_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',11)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No MQTT Rules Found!')
        }
    })
}
function loadUdpRulesList() {
    listInputRules("UDP_INPUT",function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadUdpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> UDP Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            udp_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',12)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No UDP Rules Found!')
        }
    })
}
function loadTcpRulesList() {
    listInputRules("TCP_INPUT",function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadTcpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> TCP Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            tcp_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',13)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No TCP Rules Found!')
        }
    })
}
function loadEmailRulesList() {
    listInputRules("EMAIL_INPUT",function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" onclick="loadTcpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> EMAIL Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            email_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',14)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            errorMsg('No EMAIL Rules Found!')
        }
    })
}

function loadScheduleRulesList() {
    listScheduleRules(rules_page_size, null, null, function (status, data) {
        $(".rulesList").html("");

        $(".rulesList").append('<li class="" title="click here to reload" onclick="loadScheduleRulesList()" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Schedule Rules</b> <span class="loaderSpin"></span></li>');

        $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

        setTimeout(function () {
            $(".loaderSpin").html('');
        }, 1000);

        $('[data-toggle="tooltip"]').tooltip()


        if (status && data.length > 0) {
            schedule_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                var str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(' + data[i].id + ',3)">' +
                    '<img src="images/file.png" /> <b>' + data[i].id + '</b><br><small>' + data[i].pattern + '</small></li>';
                $(".rulesList").append(str);


            }
        } else {
            errorMsg('No Schedule Messages Found!')
        }
    })

}

function loadGroovyClasses() {
    $(".rulesList").html("");

    $(".rulesList").append('<li class="" title="click here to reload" onclick="loadGroovyClasses()" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
        '<img src="images/folder.png" /> <b> Groovy Class</b> <span class="loaderSpin"></span></li>');

    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    setTimeout(function () {
        $(".loaderSpin").html('');
    }, 1000);


    var data = groovy_class_list;
    for (var i = 0; i < groovy_class_list.length; i++) {
        var str = '<li class="rulesListli rule_' + data[i]._id + '" data-id="' + data[i]._id + '" onclick="loadTabbar(\'' + data[i]._id + '\',4)">' +
            '<img src="images/code.png" /> <b>' + data[i].packageName + '</b></li>';
        $(".rulesList").append(str);
    }

}

function loadJarClasses() {
    $(".rulesList").html("");

    $(".rulesList").append('<li class="" title="click here to reload" onclick="loadJarClasses()" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
        '<img src="images/folder.png" /> <b> JAR Class</b> <span class="loaderSpin"></span></li>');

    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    setTimeout(function () {
        $(".loaderSpin").html('');
    }, 1000);

    var data = groovy_class_list;
    for (var i = 0; i < jar_class_list.length; i++) {
        var str = '<li class="rulesListli rule_' + data[i]._id + '" data-id="' + data[i]._id + '" onclick="loadTabbar(\'' + data[i]._id + '\',4)">' +
            '<img src="images/code.png" /> <b>' + data[i].packageName + '</b></li>';
        $(".rulesList").append(str);
    }

}


function loadTabbar(id, type) {

    var str = '';
    $(".deleteBtn").css('display', 'none');
    $(".detailsBlock").css('display', 'none')
    $(".messageFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".processBlock").css('display', 'none');
    $(".inputBlock").css('display', 'none');


    if (_.indexOf(tabbar_list, id) < 0) {
        if (type === 1) {

            str = '<li role="presentation" class="messageTab tabbar messageTab_' + id + '" >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadMessageRule(' + id + ')>' + id + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(' + id + ',1)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';

        } else if (type === 2) {
            str = '<li role="presentation" class="namedTab tabbar namedTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadNamedRule(\'' + id + '\')>' + id + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',2)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        } else if (type === 3) {
            str = '<li role="presentation" class="scheduleTab tabbar scheduleTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadScheduleRule(' + id + ')>' + id + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(' + id + ',3)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        } else if (type === 4) {

            var obj = {};
            for (var i = 0; i < groovy_class_list.length; i++) {
                for (var j = 0; j < groovy_class_list[i].classes.length; j++) {
                    if (id === groovy_class_list[i].classes[j]._id) {
                        obj = groovy_class_list[i].classes[j];
                    }
                }
            }

            str = '<li role="presentation" class="groovyTab tabbar groovyTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadGroovyClass(\'' + id + '\')>' + obj.name + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',4)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        } else if (type === 5) {

            var obj = {};
            for (var i = 0; i < jar_class_list.length; i++) {
                if (id === jar_class_list[i]._id) {
                    obj = jar_class_list[i];
                }
            }

            str = '<li role="presentation" class="jarTab tabbar jarTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadJarClass(\'' + id + '\')>' + obj.packageName + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',5)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }

        else if (type === 6) {

            var obj = {};
            for (var i = 0; i < binary_rules_list.length; i++) {
                if (id === binary_rules_list[i].type) {
                    obj = binary_rules_list[i];
                }
            }

            str = '<li role="presentation" class="binaryTab tabbar binaryTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadBinaryRule(\'' + id + '\')>' + obj.type + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',6)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }

        else if (type === 7) {

            var obj = {};
            for (var i = 0; i < job_rules_list.length; i++) {
                if (id === job_rules_list[i].id) {
                    obj = job_rules_list[i];
                }
            }

            str = '<li role="presentation" class="jobTab tabbar jobTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadJobRule(\'' + id + '\')>' + obj.id + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',7)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }

        else if (type === 8) {

            var obj = {};
            for (var i = 0; i < file_rules_list.length; i++) {
                if (id === file_rules_list[i].type) {
                    obj = file_rules_list[i];
                }
            }

            str = '<li role="presentation" class="fileTab tabbar fileTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadFileRule(\'' + id + '\')>' + obj.type + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',8)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }

        else if (type === 9) {

            var obj = {};
            for (var i = 0; i < process_rules_list.length; i++) {
                if (id === process_rules_list[i].id) {
                    obj = process_rules_list[i];
                }
            }

            str = '<li role="presentation" class="processTab tabbar processTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadProcessRule(\'' + id + '\')>' + obj.name + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',9)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }
        else if (type === 10) {

            var obj = {};
            for (var i = 0; i < sftp_rules_list.length; i++) {
                if (id === sftp_rules_list[i].id) {
                    obj = sftp_rules_list[i];
                }
            }

            str = '<li role="presentation" class="sftpTab tabbar sftpTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadSftpRule(\'' + id + '\')>' + obj.name + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',10)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }
        else if (type === 11) {

            var obj = {};
            for (var i = 0; i < mqtt_rules_list.length; i++) {
                if (id === mqtt_rules_list[i].id) {
                    obj = mqtt_rules_list[i];
                }
            }

            str = '<li role="presentation" class="mqttTab tabbar mqttTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadMqttRule(\'' + id + '\')>' + obj.name + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',11)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }
        else if (type === 12) {

            var obj = {};
            for (var i = 0; i < udp_rules_list.length; i++) {
                if (id === udp_rules_list[i].id) {
                    obj = udp_rules_list[i];
                }
            }

            str = '<li role="presentation" class="udpTab tabbar udpTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadUdpRule(\'' + id + '\')>' + obj.name + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',12)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }
        else if (type === 13) {

            var obj = {};
            for (var i = 0; i < tcp_rules_list.length; i++) {
                if (id === tcp_rules_list[i].id) {
                    obj = tcp_rules_list[i];
                }
            }

            str = '<li role="presentation" class="tcpTab tabbar tcpTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadTcpRule(\'' + id + '\')>' + obj.name + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',13)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }
        else if (type === 14) {

            var obj = {};
            for (var i = 0; i < email_rules_list.length; i++) {
                if (id === email_rules_list[i].id) {
                    obj = email_rules_list[i];
                }
            }

            str = '<li role="presentation" class="emailTab tabbar emailTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadEmailRule(\'' + id + '\')>' + obj.name + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',14)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }

        tabbar_list.push(id);
        $(".editorBar").append(str);

    }
    $(".domainTab").removeClass('active')
    $(".messageTab").removeClass('active')
    $(".namedTab").removeClass('active')
    $(".binaryTab").removeClass('active')
    $(".scheduleTab").removeClass('active');
    $(".groovyTab").removeClass('active');
    $(".jobTab").removeClass('active');
    $(".jarTab").removeClass('active');
    $(".fileTab").removeClass('active');
    $(".processTab").removeClass('active');
    $(".sftpTab").removeClass('active');
    $(".udpTab").removeClass('active');
    $(".mqttTab").removeClass('active');
    $(".tcpTab").removeClass('active');
    $(".emailTab").removeClass('active');

    var obj = {};

    if (type === 1) {
        loadMessageRule(id);
        $(".messageTab_" + id).addClass('active');



        for (var i = 0; i < message_spec_list.length; i++) {

            if (id === message_spec_list[i].id) {
                obj = message_spec_list[i];
            }
        }
        $(".ruleType").html('Message Rule');
        $(".ruleName").html(obj.id + ' - <small style="color:#333;font-weight: normal">' + obj.name + '</small>');
        $(".detailsBlock").css('display', 'block')
        $(".messageFields").css('display', 'block');
        $(".defaultFields").css('display', 'block');

        $(".exportBtn").attr('onclick','exportRule(2)')
        $(".messageFields tbody").html("");
        for (var i = 0; i < obj.fields.length; i++) {
            $(".messageFields tbody").append('<tr><td>' + obj.fields[i].name + '</td><td><label class="label label-default">' + obj.fields[i].dataType + '</label></td></tr>')
        }


        $(".simulateBtn").attr('onclick','openSimulateModal(\''+id+'\',1)');


    }
    else if (type === 2) {
        loadNamedRule(id);
        $(".namedTab_" + id).addClass('active');

        for (var i = 0; i < named_rules_list.length; i++) {
            if (id === named_rules_list[i].name) {
                obj = named_rules_list[i];
            }
        }
        $(".detailsBlock").css('display', 'block')
        $(".ruleType").html('Named Rule');
        $(".ruleName").html(obj.name);

        $(".exportBtn").attr('onclick','exportRule(3)')

        $(".simulateBtn").attr('onclick','openSimulateModal(\''+id+'\',2)');
    }
    else if (type === 3) {
        loadScheduleRule(id);
        $(".scheduleTab_" + id).addClass('active');

        for (var i = 0; i < schedule_rules_list.length; i++) {
            if (id === schedule_rules_list[i].id) {
                obj = schedule_rules_list[i];
            }
        }
        $(".detailsBlock").css('display', 'block')
        $(".ruleType").html('Schedule Rule');
        $(".ruleName").html(obj.id);

        $(".exportBtn").attr('onclick','exportRule(4)')
    }
    else if (type === 4) {
        loadGroovyClass(id);
        $(".groovyTab_" + id).addClass('active');
        $(".detailsBlock").css('display', 'none')
    }
    else if (type === 5) {
        loadJarClass(id);
        $(".jarTab_" + id).addClass('active');
        $(".detailsBlock").css('display', 'none')
    }
    else if (type === 6) {
        loadBinaryRule(id);
        $(".binaryTab_" + id).addClass('active');

        for (var i = 0; i < binary_rules_list.length; i++) {
            if (id === binary_rules_list[i].type) {
                obj = binary_rules_list[i];
            }
        }
        $(".detailsBlock").css('display', 'block')
        $(".ruleType").html('Binary Rule');
        $(".ruleName").html(obj.type);

        $(".exportBtn").attr('onclick','exportRule(6)')
        $(".simulateBtn").attr('onclick','openSimulateModal(\''+id+'\',3)');
    }
    else if (type === 8) {
        loadFileRule(id);
        $(".fileTab_" + id).addClass('active');

        for (var i = 0; i < file_rules_list.length; i++) {
            if (id === file_rules_list[i].type) {
                obj = file_rules_list[i];
            }
        }
        $(".detailsBlock").css('display', 'block')
        $(".ruleType").html('File Rule');
        $(".ruleName").html(obj.type+(obj.rootPath ? '<br><small>Rooth Path: '+obj.rootPath+'</small>' : ''));

        $(".exportBtn").attr('onclick','exportRule(8)')
        $(".simulateBtn").attr('onclick','openSimulateModal(\''+id+'\',4)');
    }
    else if (type === 7) {
        loadJobRule(id);
        $(".jobTab_" + id).addClass('active');

        for (var i = 0; i < job_rules_list.length; i++) {
            if (id === job_rules_list[i].id) {
                obj = job_rules_list[i];
            }
        }

        loadJobDetails(id,obj);

        $(".detailsBlock").css('display', 'block')
        $(".jobFields").css('display', 'block')
        $(".ruleType").html('Job Rule');
        $(".ruleName").html(obj.type);

        $(".exportBtn").attr('onclick','exportRule(7)')
    }
    else if (type === 9) {
        loadProcessRule(id);
        $(".processTab_" + id).addClass('active');

        for (var i = 0; i < process_rules_list.length; i++) {
            if (id === process_rules_list[i].id) {
                obj = process_rules_list[i];
            }
        }

        loadProcessDetails(id,obj);

        $(".processBlock").css('display', 'block')
        $(".ruleType").html('Process Rule');
        $(".ruleName").html(obj.name);
        $(".exportBtn").attr('onclick','exportRule(9)')
    }
    else if (type === 10) {
        loadSftpRule(id);
        $(".sftpTab_" + id).addClass('active');

        for (var i = 0; i < sftp_rules_list.length; i++) {
            if (id === sftp_rules_list[i].id) {
                obj = sftp_rules_list[i];
            }
        }

        loadSftpDetails(id,obj);

        $(".detailsBlock").css('display', 'block')
        $(".inputBlock").css('display', 'block')
        $(".ruleType").html('SFTP Rule');
        $(".ruleName").html(obj.name);

        $(".exportBtn").attr('onclick','exportRule(10)')
    }
    else if (type === 11) {
        loadMqttRule(id);
        $(".mqttTab_" + id).addClass('active');

        for (var i = 0; i < mqtt_rules_list.length; i++) {
            if (id === mqtt_rules_list[i].id) {
                obj = mqtt_rules_list[i];
            }
        }

        loadMqttDetails(id,obj);

        $(".detailsBlock").css('display', 'block')
        $(".inputBlock").css('display', 'block')
        $(".ruleType").html('MQTT Rule');
        $(".ruleName").html(obj.name);

        $(".exportBtn").attr('onclick','exportRule(11)')
    }
    else if (type === 12) {
        loadUdpRule(id);
        $(".udpTab_" + id).addClass('active');

        for (var i = 0; i < udp_rules_list.length; i++) {
            if (id === udp_rules_list[i].id) {
                obj = udp_rules_list[i];
            }
        }

        loadUdpDetails(id,obj);

        $(".detailsBlock").css('display', 'block')
        $(".inputBlock").css('display', 'block')
        $(".ruleType").html('UDP Rule');
        $(".ruleName").html(obj.name);

        $(".exportBtn").attr('onclick','exportRule(12)')
    }
    else if (type === 13) {
        loadTcpRule(id);
        $(".tcpTab_" + id).addClass('active');

        for (var i = 0; i < tcp_rules_list.length; i++) {
            if (id === tcp_rules_list[i].id) {
                obj = tcp_rules_list[i];
            }
        }

        loadTcpDetails(id,obj);

        $(".detailsBlock").css('display', 'block')
        $(".inputBlock").css('display', 'block')
        $(".ruleType").html('TCP Rule');
        $(".ruleName").html(obj.name);

        $(".exportBtn").attr('onclick','exportRule(13)')
    }
    else if (type === 14) {
        loadEmailRule(id);
        $(".emailTab_" + id).addClass('active');

        for (var i = 0; i < email_rules_list.length; i++) {
            if (id === email_rules_list[i].id) {
                obj = email_rules_list[i];
            }
        }

        loadEmailDetails(id,obj);

        $(".detailsBlock").css('display', 'block')
        $(".inputBlock").css('display', 'block')
        $(".ruleType").html('Email Rule');
        $(".ruleName").html(obj.name);

        $(".exportBtn").attr('onclick','exportRule(14)')
    }


    $(".ruleLanguage").html('GROOVY')
    $('[data-toggle="tooltip"]').tooltip()

}

function loadProcessDetails(id,obj) {
    var output = '';
    var input = '';

    for(var k in obj.output){
        output+= '<tr><td>'+k+'</td><td>'+obj.output[k]+'</td></tr>'
    }
    if(obj.input) {
        for (var k in obj.input) {
            input += '<tr><td>' + k + '</td><td>' + obj.input[k] + '</td></tr>'
        }
    }

    $(".pBody").html('<p><strong><br>Process ID <span style="height:12px;width:12px;display:inline-block;background-color: '+obj.properties.color+'"></span></strong>' +
        '<label style="    width: 100%;">'+id+' </label>' +
        '<img src="'+obj.properties.logo+'" style="width:48px;height:48px;">'+

        '</p>' +
        '<strong>Output</strong><br>\n' +
    '<table class="table table-bordered table-striped">' +
        // '<thead><tr><th>Keyname</th><th>Datatype</th></tr></thead>' +
        '<tbody>' +output+
    '</tbody></table>\n' +
        (input ? '<strong>Input</strong><br>\n' +
        '<table class="table table-bordered table-striped">' +
        // '<thead><tr><th>Keyname</th><th>Datatype</th></tr></thead>' +
        '<tbody>' +input+
        '</tbody></table>\n' : '')+
    '<p>\n' +
    '<strong>Group</strong><br>\n' +
    '<label>'+(obj.group ? obj.group : '-')+'</label>\n' +
    '</p>\n' +
    '<p>\n' +
    '<strong>Tags</strong><br>\n' +
        '<label>'+(obj.tags ? obj.tags : '-')+'</label>\n' +
    '</p>\n' +
    '<p>\n' +
    '<strong>Description</strong><br>\n' +
        '<label>'+(obj.description ? obj.description : '-')+'</label>\n' +
    '</p>'+
    '<p>\n' +
    '<strong>Updated By</strong><br>\n' +
    '<label>'+(obj.updatedBy ? obj.updatedBy : '-')+'</label>\n' +
    '</p>'+
    '<p>\n' +
    '<strong>Updated Time</strong><br>\n' +
    '<label>'+(obj.updatedTime ? moment(obj.updatedTime).format('MM/DD/YYYY hh:mm a') : '-')+'</label>\n' +
    '</p>'+
    '<p>\n' +
    '<strong>Created By</strong><br>\n' +
        '<label>'+(obj.createdBy ? obj.createdBy : '-')+'</label>\n' +
    '</p>'+
    '<p>\n' +
    '<strong>Created Time</strong><br>\n' +
    '<label>'+(obj.createdTime ? moment(obj.createdTime).format('MM/DD/YYYY hh:mm a') : '-')+'</label>\n' +
    '</p>'
    );
}

function loadSftpDetails(id,obj) {
    $(".inputBlock tbody").html("");

    $(".inputBlock tbody").append('<tr><td>Implementation</td><td>'+(obj.implementation ? obj.implementation : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Instance Type</td><td>'+obj.instanceType+ (obj.instances ? '<br>('+obj.instances+' instances)' : '')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Start on Reboot</td><td>'+(obj.startAtBoot ? 'Yes' : 'No')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td colspan="1">Instance Action' +
        '<button style="display:none" class="btn btn-xs stBtn btn-primary" onclick="executeInputAction(\''+id+'\',\''+'START'+'\',\''+'SFTP'+'\')"><i class="fa fa-play"></i> Start</button>'+
        '<button style="display:none" class="btn btn-xs stpBtn mb-2 btn-danger" onclick="executeInputAction(\''+id+'\',\''+'STOP'+'\',\''+'SFTP'+'\')"><i class="fa fa-stop"></i> Stop</button>'+
        '<button style="display:none" class="btn btn-xs resBtn btn-warning" onclick="executeInputAction(\''+id+'\',\''+'RESTART'+'\',\''+'SFTP'+'\')"><i class="fa fa-redo"></i> Restart</button>'+
        '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Remote Host</td><td>'+(obj.remoteHost ? obj.remoteHost : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Port</td><td>'+(obj.remotePort ? obj.remotePort : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Username</td><td>'+(obj.userName ? obj.userName : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Password</td><td>'+(obj.password ? obj.password : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Remote Paths</td><td>'+(obj.remotePaths ? obj.remotePaths : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Poll Interval</td><td>'+(obj.pollInterval ? obj.pollInterval : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>List Pattern</td><td>'+(obj.listPattern ? obj.listPattern : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>List Dir. Pattern</td><td>'+(obj.listDirPattern ? obj.listDirPattern : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>key Files Built In</td><td>'+(obj.keyFilesBuiltIn ? 'Yes' : 'No')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Connection TimeOut</td><td>'+(obj.connectTimeOut ? obj.connectTimeOut : '-')+'</td></tr>')
    $(".inputBlock tbody").append('<tr><td>List Recursive</td><td>'+(obj.listRecursive ? obj.listRecursive : '-')+'</td></tr>')

    getInputRunning('SFTP',id);

}

function getInputRunning(type,id) {

    id = id ? id : CURRENT_ID;

    $(".iCount").html(0);
    inputActions(type,id,'COUNT', function (status,data) {
        if(status){
            $(".iCount").html(data.total);
            if(data.total > 0){
                $(".stBtn").css('display','none')
                $(".stpBtn").css('display','block')
                $(".resBtn").css('display','block')
            }else{
                $(".stBtn").css('display','block')
                $(".stpBtn").css('display','none')
                $(".resBtn").css('display','none')
            }
        }
    })
}

function executeInputAction(id, action, type) {

    inputActions(type,id, action, function (status, data) {
        if (status) {
            successMsg('Successfully executed')
            if(type === 'SFTP'){
                setTimeout(function(){
                    loadSftpRulesList();
                    getInputRunning('SFTP',id);
                },500)

            }
            //TODO

        } else {
            errorMsg("Error in executing action")
        }
    })
}


function loadJobDetails(id,obj) {
    $(".jobFields tbody").html("");
    if(obj.systemJob)
        $(".jobFields tbody").append('<tr><td>System Job</td><td>Yes</td></tr>')

    $(".jobFields tbody").append('<tr><td>Job Type</td><td>'+obj.jobType+ (obj.instances ? '<br>('+obj.instances+' instances)' : '')+'</td></tr>')
    $(".jobFields tbody").append('<tr><td>Start on Reboot</td><td>'+(obj.startOnBoot ? 'Yes' : 'No')+'</td></tr>')
    $(".jobFields tbody").append('<tr><td>Restart on Change</td><td>'+(obj.resartOnChange ? 'Yes' : 'No')+'</td></tr>')
    $(".jobFields tbody").append('<tr><td>Job State</td>' +
        '<td>' +
        '<label><input type="radio" name="jobState" value="ENABLED" onclick="updateJobState(\''+id+'\',\''+'ENABLED'+'\')"> Enabled</label><br>' +
        '<label><input type="radio" name="jobState" value="DISABLED" onclick="updateJobState(\''+id+'\',\''+'DISABLED'+'\')"> Disabled</label>' +
        '</td></tr>')
    $(".jobFields tbody").append('<tr><td>Job Action</td>' +
        '<td>' +
        ((obj.jobType === 'SCALABLE' || obj.jobType === 'DISTRIBUTED')  ?
            '<input class="" style="width: 50px;border:1px solid #ccc;padding: 2px 5px;" type="number" min="1" value="'+(obj.instances ? obj.instances : 1)+'" id="iCount"> ' : '' )+
        '<button class="btn btn-xs btn-primary mb-2 mt-1" onclick="executeAction(\''+id+'\',\''+'start'+'\')"><i class="fa fa-play"></i> Start</button>'+
        '<button class="btn btn-xs btn-danger" onclick="executeAction(\''+id+'\',\''+'stop'+'\')"><i class="fa fa-stop"></i> Stop <span class="iCount">0</span> Instances</button>'+
        '</td></tr>')
    $('input[name="jobState"][value="' + obj.jobState + '"]').prop('checked', true);

    loadRunningCount(id);

}

function updateJobState(id,state) {

    setJobRuleState(id, state, function (status, data) {
        if(status){
            successMsg('Successfully update the job state')
            loadJobRulesList();
        }else{
            errorMsg("Error in updating job state")
        }
    })
}

function loadRunningCount(id) {

    id = id ? id : CURRENT_ID;

    $(".iCount").html(0);
    getJobRunningList(id, function (status,data) {
        if(status){
            $(".iCount").html(data.length);
        }
    })
}

function executeAction(id, executeAction) {

        var count = 0;

        if($("#iCount").val()){
            count = Number($("#iCount").val())
        }

        performJobAction(id, executeAction,count, function (status, data) {
            if (status) {
                successMsg('Successfully job executed')
                loadJobRulesList();
                loadRunningCount(id);
            } else {
                errorMsg("Error in executing job action")
            }
        })
}


function deleteTab(id, type) {
    if (type === 1) {
        $(".messageTab_" + id).remove();
    } else if (type === 2) {
        $(".namedTab_" + id).remove();
    } else if (type === 3) {
        $(".scheduleTab_" + id).remove();
    } else if (type === 4) {
        $(".groovyTab_" + id).remove();
    } else if (type === 5) {
        $(".jarTab_" + id).remove();
    } else if (type === 6) {
        $(".binaryTab_" + id).remove();
    }
    else if (type === 7) {
        $(".jobTab_" + id).remove();
    }
    else if (type === 8) {
        $(".fileTab_" + id).remove();
    }
    else if (type === 9) {
        $(".processTab_" + id).remove();
    }
    else if (type === 10) {
        $(".sftpTab_" + id).remove();
    }
    else if (type === 11) {
        $(".mqttTab_" + id).remove();
    }
    else if (type === 12) {
        $(".udpTab_" + id).remove();
    }
    else if (type === 13) {
        $(".tcpTab_" + id).remove();
    }
    else if (type === 14) {
        $(".emailpTab_" + id).remove();
    }

    var temp = [];

    for (var i = 0; i < tabbar_list.length; i++) {
        if (id !== tabbar_list[i]) {
            temp.push(tabbar_list[i])
        }
    }

    tabbar_list = temp;
    setTimeout(function () {
        $(".messageTab").removeClass('active')
        $(".namedTab").removeClass('active')
        $(".scheduleTab").removeClass('active')
        $(".groovyTab").removeClass('active')
        $(".jarTab").removeClass('active')
        $(".binaryTab").removeClass('active')
        $(".jobTab").removeClass('active')
        $(".fileTab").removeClass('active')
        $(".processTab").removeClass('active')
        $(".sftpTab").removeClass('active')
        $(".mqttTab").removeClass('active')
        $(".udpTab").removeClass('active')
        $(".tcpTab").removeClass('active')
        $(".emailTab").removeClass('active')
        $(".domainTab").addClass('active')
        loadDomainRule();
        // $("#codeEditor").remove();
        // $("#editorContent").html('<div id="codeEditor"></div>');
        // $("#codeEditor").html('');
        // loadEditor("");
    }, 200);


}

function loadDomainCode() {

    $(".detailsBlock").css('display', 'block')

    $(".ruleName").html('Domain Rule')
    $(".ruleType").html('Domain Rule')
    $(".ruleLanguage").html('GROOVY')


    getDomainrule(function (status, data) {
        if (status) {
            domain_rule_obj = data;
        }
        loadDomainRule();
    });

    $(".defaultFields tbody").html("");
    for (var i = 0; i < DEFAULT_FIELDS.length; i++) {
        $(".defaultFields tbody").append('<tr><td>' + DEFAULT_FIELDS[i].name + '</td><td><label class="label label-default">' + DEFAULT_FIELDS[i].dataType + '</label></td></tr>')
    }
}

function returnObj(id, type) {
    var data = null;
    if (type === 1) {
        for (var i = 0; i < message_rules_list.length; i++) {
            if (id === message_rules_list[i].messageId) {
                return message_rules_list[i];
            }
        }
    }
    else if (type === 2) {
        for (var i = 0; i < named_rules_list.length; i++) {
            if (id === named_rules_list[i].name) {
                return named_rules_list[i];
            }
        }
    }
    else if (type === 3) {
        for (var i = 0; i < schedule_rules_list.length; i++) {
            if (id === schedule_rules_list[i].id) {
                return schedule_rules_list[i];
            }
        }
    }
    else if (type === 6) {
        for (var i = 0; i < binary_rules_list.length; i++) {
            if (id === binary_rules_list[i].type) {
                return binary_rules_list[i];
            }
        }
    }
    else if (type === 7) {
        for (var i = 0; i < job_rules_list.length; i++) {
            if (id === job_rules_list[i].id) {
                return job_rules_list[i];
            }
        }
    }
    else if (type === 8) {
        for (var i = 0; i < file_rules_list.length; i++) {
            if (id === file_rules_list[i].type) {
                return file_rules_list[i];
            }
        }
    }
    else if (type === 9) {
        for (var i = 0; i < process_rules_list.length; i++) {
            if (id === process_rules_list[i].id) {
                return process_rules_list[i];
            }
        }
    }
    else if (type === 10) {
        for (var i = 0; i < sftp_rules_list.length; i++) {
            if (id === sftp_rules_list[i].id) {
                return sftp_rules_list[i];
            }
        }
    }
    else if (type === 11) {
        for (var i = 0; i < mqtt_rules_list.length; i++) {
            if (id === mqtt_rules_list[i].id) {
                return mqtt_rules_list[i];
            }
        }
    }
    else if (type === 12) {
        for (var i = 0; i < udp_rules_list.length; i++) {
            if (id === udp_rules_list[i].id) {
                return udp_rules_list[i];
            }
        }
    }
    else if (type === 13) {
        for (var i = 0; i < tcp_rules_list.length; i++) {
            if (id === tcp_rules_list[i].id) {
                return tcp_rules_list[i];
            }
        }
    }
    else if (type === 14) {
        for (var i = 0; i < email_rules_list.length; i++) {
            if (id === email_rules_list[i].id) {
                return email_rules_list[i];
            }
        }
    }

}

function reloadRules() {
    $(".btnRefresh").html('<i class="fa fa-refresh fa-spin"></i>');
    loadRules($("#rulesType").val());
    setTimeout(function () {
        $(".btnRefresh").html('<i class="fa fa-refresh"></i>');
    }, 1000)
}


function loadDomainRule() {

    // mqttCancelSubscribe();

    $(".simulateBtn").css('display','none');

    $("#editorContent").html('<div id="codeEditor"></div>');
    $("#codeEditor").html('');
    loadEditor(CHANGED_DEFAULT_TEXT ? CHANGED_DEFAULT_TEXT : domain_rule_obj.code, 'domainTab');
    CURRENT_ID = null;
    CURRENT_TYPE = 0;

    $(".ruleName").html('Domain Rule')
    $(".ruleType").html('Domain Rule')
    $(".ruleLanguage").html('GROOVY')

    exportRule(1);

    $(".detailsBlock").css('display', 'block');
    $(".inputBlock").css('display', 'none');
    $(".messageFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".deleteBtn").css('display', 'none');

    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);

}

function loadGroovyClass(id) {
    // mqttCancelSubscribe();

    $("#editorContent").html('<div id="codeEditor"></div>');
    $("#codeEditor").html('');

    var obj = {};
    for (var i = 0; i < groovy_class_list.length; i++) {
        if (id === groovy_class_list[i]._id) {
            obj = groovy_class_list[i];
        }
    }

    loadEditor(obj.code, 'groovyTab_'+id);
    CURRENT_ID = id;
    CURRENT_TYPE = 4;


    $(".detailsBlock").css('display', 'none');
    $(".messageFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".deleteBtn").css('display', 'none');



}

function loadJarClass(id) {
    // mqttCancelSubscribe();

    $("#editorContent").html('<div id="codeEditor"></div>');
    $("#codeEditor").html('');

    var obj = {};
    for (var i = 0; i < jar_class_list.length; i++) {
        if (id === jar_class_list[i]._id) {
            obj = jar_class_list[i];
        }
    }

    loadEditor(obj.code,'jarTab_'+id);
    CURRENT_ID = id;
    CURRENT_TYPE = 5;


    $(".detailsBlock").css('display', 'none');
    $(".messageFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".deleteBtn").css('display', 'none');



}

function loadMessageRule(id) {
    $(".simulateBtn").css('display','block');

    // mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    var data = returnObj(id, 1);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'messageTab_'+id);
    CURRENT_ID = id;
    CURRENT_TYPE = 1;

    exportRule(2)

    var obj = {};
    for (var i = 0; i < message_spec_list.length; i++) {
        if (id === message_spec_list[i].id) {
            obj = message_spec_list[i];
        }
    }
    $(".ruleType").html('Message Rule');
    $(".ruleName").html(obj.id + ' - <small style="color:#333;font-weight: normal">' + obj.name + '</small>');

    $(".detailsBlock").css('display', 'block');
    $(".messageFields").css('display', 'block');
    $(".defaultFields").css('display', 'block');
    $(".jobFields").css('display', 'none');
    $(".deleteBtn").css('display', 'block');


    $(".messageFields tbody").html("");
    for (var i = 0; i < obj.fields.length; i++) {
        $(".messageFields tbody").append('<tr><td>' + obj.fields[i].name + '</td><td><label class="label label-default">' + obj.fields[i].dataType + '</label></td></tr>')
    }


    $(".simulateBtn").attr('onclick','openSimulateModal(\''+id+'\',1)');

    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);
}

function loadNamedRule(id) {
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    var data = returnObj(id, 2);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'namedTab_'+id);
    CURRENT_ID = id;
    CURRENT_TYPE = 2;

    exportRule(3)

    var obj = {};
    for (var i = 0; i < named_rules_list.length; i++) {
        if (id === named_rules_list[i].name) {
            obj = named_rules_list[i];
        }
    }
    $(".ruleType").html('Named Rule');
    $(".ruleName").html(obj.name);

    $(".detailsBlock").css('display', 'block');
    $(".messageFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".deleteBtn").css('display', 'block');

    $(".simulateBtn").css('display', 'block');
    $(".simulateBtn").attr('onclick','openSimulateModal(\''+id+'\',2)');

    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);
}


function loadBinaryRule(id) {
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    var data = returnObj(id, 6);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'binaryTab_'+id);
    CURRENT_ID = id;
    CURRENT_TYPE = 6;

    exportRule(6)

    var obj = {};
    for (var i = 0; i < binary_rules_list.length; i++) {
        if (id === binary_rules_list[i].type) {
            obj = binary_rules_list[i];
        }
    }
    $(".ruleType").html('Binary Rule');
    $(".ruleName").html(obj.type);

    $(".detailsBlock").css('display', 'block');
    $(".messageFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".deleteBtn").css('display', 'block');

    $(".simulateBtn").css('display', 'block');
    $(".simulateBtn").attr('onclick','openSimulateModal(\''+id+'\',3)');

    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);
}


function loadFileRule(id) {
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    var data = returnObj(id, 8);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'fileTab_'+id);
    CURRENT_ID = id;
    CURRENT_TYPE = 8;

    exportRule(8)

    var obj = {};
    for (var i = 0; i < file_rules_list.length; i++) {
        if (id === file_rules_list[i].type) {
            obj = file_rules_list[i];
        }
    }
    $(".ruleType").html('File Rule');
    $(".ruleName").html(obj.type);

    $(".detailsBlock").css('display', 'block');
    $(".messageFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".deleteBtn").css('display', 'block');

    $(".simulateBtn").css('display', 'block');
    $(".simulateBtn").attr('onclick','openSimulateModal(\''+id+'\',3)');

    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);
}

function loadJobRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    var data = returnObj(id, 7);
    $("#codeEditor").html('');

    loadEditor(data.jobCode ? data.jobCode : '', 'jobTab_'+id);

        CURRENT_ID = id;
        CURRENT_TYPE = 7;

        exportRule(7)

        $(".ruleType").html('Job Rule');
        $(".ruleName").html(data.id);

        $(".detailsBlock").css('display', 'block');
        $(".messageFields").css('display', 'none');
        $(".defaultFields").css('display', 'none');
        $(".deleteBtn").css('display', 'block');
    $(".jobFields").css('display', 'block');

    loadJobDetails(id,data)


    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);
}

function loadSftpRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    var data = returnObj(id, 10);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'sftpTab_'+id);

    CURRENT_ID = id;
    CURRENT_TYPE = 10;

    exportRule(10)

    $(".ruleType").html('SFTP Rule');
    $(".ruleName").html(data.name);

    $(".detailsBlock").css('display', 'block');
    $(".messageFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".deleteBtn").css('display', 'block');
    $(".inputBlock").css('display', 'block');

    loadSftpDetails(id,data)


    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);
}

function loadProcessRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    var data = returnObj(id, 9);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'processTab_'+id);

    CURRENT_ID = id;
    CURRENT_TYPE = 9;

    exportRule(9)

    $(".ruleType").html('Process Rule');
    $(".ruleName").html(data.id);

    $(".detailsBlock").css('display', 'block');
    $(".messageFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".deleteBtn").css('display', 'block');
    $(".jobFields").css('display', 'none');
    $(".processBlock").css('display', 'block');

    loadProcessDetails(id,data)


    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);
}

function loadScheduleRule(id) {
    $(".simulateBtn").css('display', 'none');
    // mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    var data = returnObj(id, 3);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'scheduleTab_'+id);
    CURRENT_ID = id;
    CURRENT_TYPE = 3;

    var obj = {};
    for (var i = 0; i < schedule_rules_list.length; i++) {
        if (id === schedule_rules_list[i].id) {
            obj = schedule_rules_list[i];
        }
    }
    $(".ruleType").html('Schedule Rule');
    $(".ruleName").html(obj.id);

    $(".detailsBlock").css('display', 'block');
    $(".deleteBtn").css('display', 'block');
    $(".messageFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".jobFields").css('display', 'none');

    exportRule(4)

    // setTimeout(function () {
    //     mqttListen();
    // }, 1000);
}

var editorLine = {};

function loadEditor(code, tabid) {

    editorChange = false;

    if (codeEditor) {
        codeEditor.destroy();
    }

    $("#codeEditor").html("");

    codeEditor = ace.edit("codeEditor");


    // codeEditor.setTheme("ace/theme/monokai");
    // codeEditor.setTheme("ace/theme/solarized_light");
    codeEditor.setTheme("ace/theme/eclipse");
    // codeEditor.setTheme("ace/theme/tomorrow_night");
    codeEditor.session.setMode("ace/mode/groovy");
    codeEditor.getSession().setUseWrapMode(true);
    codeEditor.setShowPrintMargin(false);

    var platfromSnippet = loadPlatformSnippet();


    ace.config.loadModule("ace/ext/language_tools", function() {


        codeEditor.setOptions({
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false
        });

        var snippetManager = ace.require("ace/snippets").snippetManager;
        var config = ace.require("ace/config");

        ace.config.loadModule("ace/snippets/groovy", function(m) {
            if (m) {
                m.snippets = platfromSnippet;
                snippetManager.register(m.snippets, m.scope);
            }
        });

    });

    // var langTools = ace.require("ace/ext/language_tools");
    //
    // // codeEditor.setOptions({
    // //     enableBasicAutocompletion: true,
    // //     enableSnippets: true,
    // //     enableLiveAutocompletion: true,
    // // });
    // langTools.setCompleters([langTools.snippetCompleter])


    code ? codeEditor.setValue(code) : '';

    codeEditor.clearSelection();

    codeEditor.focus();
    var session = codeEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line

    if(editorLine[tabid]){
        codeEditor.gotoLine(editorLine[tabid]['row'], editorLine[tabid]['column']);
    }else{
        codeEditor.gotoLine(count, session.getLine(count - 1).length);
    }


    $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');

    codeEditor.resize();



    codeEditor.on("change", function (obj) {
        editorChange = true;
        $("#context").css('display','none')
    });


    codeEditor.on("blur", function (obj) {

        editorLine[tabid] = codeEditor.getCursorPosition();
        editorLine[tabid]['row']++;

        if (editorChange) {
            editorChange = false;


            CHANGED_ID = CURRENT_ID;
            CHANGED_TYPE = CURRENT_TYPE;
            CHANGED_TEXT = codeEditor.getSession().getValue();


            if (CURRENT_TYPE === 0) {
                CHANGED_DEFAULT_TEXT = CHANGED_TEXT;
            }

            if (CURRENT_TYPE === 1) {

                for (var i = 0; i < message_rules_list.length; i++) {
                    if (CHANGED_ID === message_rules_list[i].messageId) {
                        message_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }
            if (CURRENT_TYPE === 2) {
                for (var i = 0; i < named_rules_list.length; i++) {
                    if (CHANGED_ID === named_rules_list[i].name) {
                        named_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }
            if (CURRENT_TYPE === 3) {
                for (var i = 0; i < schedule_rules_list.length; i++) {
                    if (CHANGED_ID === schedule_rules_list[i].id) {
                        schedule_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 6) {
                for (var i = 0; i < binary_rules_list.length; i++) {
                    if (CHANGED_ID === binary_rules_list[i].type) {
                        binary_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 7) {

                for (var i = 0; i < job_rules_list.length; i++) {
                    if (CHANGED_ID === job_rules_list[i].id) {
                        job_rules_list[i].jobCode = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 8) {

                for (var i = 0; i < file_rules_list.length; i++) {
                    if (CHANGED_ID === file_rules_list[i].type) {
                        file_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 9) {

                for (var i = 0; i < process_rules_list.length; i++) {
                    if (CHANGED_ID === process_rules_list[i].id) {
                        process_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 10) {

                for (var i = 0; i < sftp_rules_list.length; i++) {
                    if (CHANGED_ID === sftp_rules_list[i].id) {
                        sftp_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }


        }
    });

    // codeEditor.commands.addCommand({
    //     name: 'contextSearch',
    //     bindKey: {
    //         win: 'Ctrl-Space',
    //         mac: 'Ctrl-Space',
    //         sender: 'editor|cli'
    //     },
    //     exec: function (env, args, request) {
    //         $("#context").css('display','block')
    //     }
    // });

    codeEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {

            // console.log(codeEditor.getSession().getValue())

            var consoleText = codeEditor.getSession().getValue();


            if (CURRENT_TYPE === 0) {

                var data = {
                    lang: 'GROOVY',
                    code: consoleText
                }

                updateDomainRuleCode(data, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        domain_rule_obj = data;
                    } else {
                        errorMsg('Error in saving!')
                    }
                })

            } else if (CURRENT_TYPE === 1) {


                var data = {
                    lang: 'GROOVY',
                    code: consoleText,
                    messageId: CURRENT_ID
                }
                updateMessageRuleCode(data, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        loadMessageRulesList();
                    } else {
                        errorMsg('Error in saving!')
                    }
                })

            } else if (CURRENT_TYPE === 2) {

                var data = {
                    lang: 'GROOVY',
                    code: consoleText,
                    name: CURRENT_ID
                }
                updateNamedRuleCode(data, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        loadNamedRulesList();
                    } else {
                        errorMsg('Error in saving!')
                    }
                })

            } else if (CURRENT_TYPE === 3) {

                var obj = returnObj(CURRENT_ID, 3);

                var data = {
                    lang: 'GROOVY',
                    code: consoleText,
                    id: CURRENT_ID,
                    pattern: obj.pattern
                }
                updateScheduleRuleCode(data, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        loadScheduleRulesList();
                    } else {
                        errorMsg('Error in saving!')
                    }
                })
            }
            else if (CURRENT_TYPE === 6) {

                var obj = returnObj(CURRENT_ID, 6);

                var data = {
                    lang: 'GROOVY',
                    code: consoleText,
                    type: CURRENT_ID,
                }
                updateBinaryRuleCode(data, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        loadBinaryRulesList();
                    } else {
                        errorMsg('Error in saving!')
                    }
                })
            }
            else if (CURRENT_TYPE === 8) {

                var obj = returnObj(CURRENT_ID, 8);

                var data = {
                    lang: 'GROOVY',
                    code: consoleText,
                    type: CURRENT_ID,
                }
                updateFileRuleCode(data, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        loadFileRulesList();
                    } else {
                        errorMsg('Error in saving!')
                    }
                })
            }
            else if (CURRENT_TYPE === 7) {

                var obj = returnObj(CURRENT_ID, 7);

                var data = {
                    "domainKey": DOMAIN_KEY,
                    "id": CURRENT_ID,
                    "name": "",
                    "jobType": obj.jobType,
                    "jobState": obj.jobState,
                    "jobLanguage": obj.jobLanguage,
                    "jobCode": consoleText,
                    "instances": obj.instances,
                    "startOnBoot": obj.startOnBoot,
                    "systemJob": obj.systemJob,
                    "resartOnChange": obj.resartOnChange,
                }
                updateJobRuleCode(data, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        loadJobRulesList();
                    } else {
                        errorMsg('Error in saving!')
                    }
                })
            }
            else if (CURRENT_TYPE === 9) {

                var obj = returnObj(CURRENT_ID, 9);

                obj['code'] = consoleText;

                delete obj._id;

                updateProcessRuleCode(obj, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        loadProcessRulesList();
                    } else {
                        errorMsg('Error in saving!')
                    }
                })
            }
            else if (CURRENT_TYPE === 10) {

                var obj = returnObj(CURRENT_ID, 10);

                obj['code'] = consoleText;
                delete obj._id;

                updateInputRuleCode('SFTP',obj, function (status, data) {
                    if (status) {
                        successMsg('Successfully saved!');
                        // loadSftpRulesList();
                        setTimeout(function () {
                            // loadTabbar(dataObj.id, 10);
                            loadSftpRulesList();

                        },500)
                    } else {
                        errorMsg('Error in saving!')
                    }
                })
            }
        }
    });
}


function resizeEditor() {
    // if(!editorToggle){
    //
    //     $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');
    // }else{
    //     $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');
    // }
    // setTimeout(function () {
    //     codeEditor.resize();
    // },1000)

}

var MSG_FIELD_COUNT = 0;
var CRON_JOB = null;

function openModal(e) {
    var id = e ? e : $("#rulesType").val() * 1

    if (id === 1) {

        MSG_FIELD_COUNT = 0;

        $("#addMessageRule form")[0].reset();

        // $("#msg_id").attr('min', USER_OBJ.domain.startId)
        // $("#msg_id").attr('max', USER_OBJ.domain.startId + ID_RANGE_COUNT)
        $(".msgFieldBody").html("");
        $("#addMessageRule").modal('show');

        addMessageField();
    } else if (id === 2) {
        $("#addNamedRule form")[0].reset();
        $("#addNamedRule").modal('show');
    } else if (id === 3) {

        if(ADMIN_ACCESS) {
            $("#addScheduleRule form")[0].reset();
            $('#pattren_desc').html("");
            // $("#sch_id").attr('min', USER_OBJ.domain.startId)
            // $("#sch_id").attr('max', USER_OBJ.domain.startId + ID_RANGE_COUNT)
            $("#addScheduleRule").modal('show');
        }else{
            errorMsg('Access Denied!')
        }
    } else if (id === 4) {
        $("#addGroovyClass").modal('show');
    } else if (id === 5) {
        $("#addJarClass").modal('show');
    }else if (id === 6) {
        $("#addBinaryRule form")[0].reset();
        $("#addBinaryRule").modal('show');
    }else if (id === 8) {
        $("#addFileRule form")[0].reset();
        $("#addFileRule").modal('show');
    }
    else if (id === 9) {
        $(".tempAction").html('Add');
        $("#processName").removeAttr('disabled')

        $("#addProcessRule form")[0].reset();

        $("#processId").html('')
        uploadImage = 'images/generate_claim.svg';
        $(".process_img").attr('src', uploadImage);
        $("#processColor").spectrum({
            showPaletteOnly: true,
            togglePaletteOnly: true,
            togglePaletteMoreText: 'more',
            togglePaletteLessText: 'less',
            showInput: true,
            color: 'blanchedalmond',
            palette: [
                ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
                ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
                ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
                ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
                ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
                ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
                ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
                ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
            ]
        });
        $("#processColor").spectrum("set", '#ccc');

        $("#addProcessRule form").attr('onsubmit','addProcessRule()')

        $("#addProcessRule").modal('show');
    }
    else if (id === 7) {

        if(ADMIN_ACCESS){
            $(".systemTemplate").css('display','block')
            $("#job_system").val('1')
        }else{
            $(".systemTemplate").css('display','none')
            $("#job_system").val('0')
        }
        $(".jAction").html('Add');
        $("#job_rule").removeAttr('disabled')

        $("#addJobRule form").attr("onsubmit","addJobRule()");
        $("#addJobRule form")[0].reset();
        $("#addJobRule").modal('show');
        checkJobInstance()
    }
    else if (id === 10) {

        $("#sftp_name").removeAttr('disabled')



        $(".sftp_privateKeyFilePath").css('display','none')
        $(".sftp_publicKeyFilePath").css('display','none')
        $("#sftp_privateKeyFilePath").removeAttr('required')

        $("#addSftpInputRule form").attr("onsubmit","addSftpRule()");
        $("#addSftpInputRule form")[0].reset();

        $("#sftp_connectTimeOut").val(30000)
        $("#sftp_listRecursive").val(-1)
        $("#sftp_pollInterval").val(30000)
        $("#addSftpInputRule").modal('show');

    }
}

function editJobModal() {
    $("#job_rule").attr('disabled','disabled')

    var obj = {};
    for (var i = 0; i < job_rules_list.length; i++) {
        if (CURRENT_ID === job_rules_list[i].id) {
            obj = job_rules_list[i];
        }
    }

    $("#addJobRule form")[0].reset();

    $("#job_rule").val(CURRENT_ID)
    $("#job_lang").val(obj.jobLanguage)
    $("#job_type").val(obj.jobType)
    $("#job_instance").val(obj.instances)
    $("#job_state").val(obj.jobState)
    $("#job_system").val(obj.systemJob ? "1" : "0")
    $("#job_boot").val(obj.startOnBoot ? "1" : "0")
    $("#job_restart").val(obj.resartOnChange ? "1" : "0")

    if(obj.jobType === 'ATOMIC'){
        $("#job_boot").attr('disabled','disabled');
    }else{
        $("#job_boot").removeAttr('disabled')
    }

    if(ADMIN_ACCESS){
        $(".systemTemplate").css('display','block')

        if(obj.jobType === 'ATOMIC'){
            $("#job_system").attr('disabled','disabled')
        }else{
            $("#job_system").removeAttr('disabled')
        }
    }else{
        $(".systemTemplate").css('display','none')
    }
    $(".jAction").html('Edit');
    $("#addJobRule form").attr("onsubmit","addJobRule(1)");
    $("#addJobRule").modal('show');
}

function editInputModal(){
    if(CURRENT_TYPE == 10){
        editSftpModal()
    }
}

function editSftpModal() {
    $("#sftp_rule_nam").attr('disabled','disabled')

    var obj = {};
    for (var i = 0; i < sftp_rules_list.length; i++) {
        if (CURRENT_ID === sftp_rules_list[i].id) {
            obj = sftp_rules_list[i];
        }
    }

    $("#addSftpInputRule form")[0].reset();
    $("#sftp_id").val(obj.id)
    $("#sftp_name").val(obj.name)
    $("#sftp_instances").val(obj.instances ? obj.instances : '')
    $("#sftp_instanceType").val(obj.instanceType ? obj.instanceType : '')
    $("#sftp_remoteHost").val(obj.remoteHost ? obj.remoteHost : '')
    $("#sftp_remotePort").val(obj.remotePort ? obj.remotePort : '')
    $("#sftp_userName").val(obj.userName ? obj.userName : '')
    $("#sftp_password").val(obj.password ? obj.password : '')
    $("#sftp_implementation").val(obj.implementation ? obj.implementation : '')
    $("#sftp_remotePaths").val(obj.remotePaths ? obj.remotePaths.join(",") : '')
    $("#sftp_pollInterval").val(obj.pollInterval ? obj.pollInterval : '')
    $("#sftp_listPattern").val(obj.listPattern ? obj.listPattern : '')
    $("#sftp_listDirPattern").val(obj.listDirPattern ? obj.listDirPattern : '')
    $("#sftp_privateKeyFilePath").val(obj.privateKeyFilePath ? obj.privateKeyFilePath : '')
    $("#sftp_publicKeyFilePath").val(obj.publicKeyFilePath ? obj.publicKeyFilePath : '')
    $("#sftp_connectTimeOut").val(obj.connectTimeOut ? obj.connectTimeOut : '')
    $("#sftp_listRecursive").val(obj.listRecursive ? obj.listRecursive : '')

    $("#sftp_startAtBoot").val(obj.startAtBoot ? "1" : "0")
    $("#sftp_keyFilesBuiltIn").val(obj.keyFilesBuiltIn ? "1" : "0")

    checkKeyFile($("#sftp_keyFilesBuiltIn").val())

    $("#addSftpInputRule form").attr("onsubmit","addSftpRule(1)");
    $("#addSftpInputRule").modal('show');
}

function openDeleteModal() {

    if (CURRENT_TYPE > 0) {
        if (CURRENT_TYPE === 1) {
            $(".delete_rule_name").html('Message');
            $(".delete_rule_id").html(CURRENT_ID);
        } else if (CURRENT_TYPE === 2) {
            $(".delete_rule_name").html('Named');
            $(".delete_rule_id").html(CURRENT_ID);
        } else if (CURRENT_TYPE === 3) {
            $(".delete_rule_name").html('Schedule');
            $(".delete_rule_id").html(CURRENT_ID);
        }
        else if (CURRENT_TYPE === 6) {
            $(".delete_rule_name").html('Binary');
            $(".delete_rule_id").html(CURRENT_ID);
        }
        else if (CURRENT_TYPE === 8) {
            $(".delete_rule_name").html('File');
            $(".delete_rule_id").html(CURRENT_ID);
        }
        else if (CURRENT_TYPE === 7) {
            $(".delete_rule_name").html('Job');
            $(".delete_rule_id").html(CURRENT_ID);
        }
        else if (CURRENT_TYPE === 9) {
            $(".delete_rule_name").html('Process');
            $(".delete_rule_id").html(CURRENT_ID);
        }
        else if (CURRENT_TYPE === 10) {
            $(".delete_rule_name").html('SFTP');
            $(".delete_rule_id").html(CURRENT_ID);
        }
        $("#deleteModal").modal('show');
    } else {
        errorMsg('You cannot delete Domain Rule.')
    }

}

function openModalClasses() {
    $(".logResult").html("");
    $("#class_type").val("");
    loadClassTemplate("");
    $("#addClass").modal({
        backdrop: 'static',
        keyboard: false
    });
}


function proceedDelete() {
    if (CURRENT_TYPE === 1) {
        deleteMessageDef(CURRENT_ID, function (status, data) {
            if (status) {
                deleteTab(CURRENT_ID, CURRENT_TYPE);
                deleteMessagRule(CURRENT_ID, function (status, data) {
                    successMsg('Successfully deleted');
                });
                setTimeout(function (){
                    loadMessageRulesList();
                },500)

                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })
    } else if (CURRENT_TYPE === 2) {

        deleteNamedRule(CURRENT_ID, function (status, data) {
            if (status) {
                deleteTab(CURRENT_ID, CURRENT_TYPE);
                successMsg('Successfully deleted');
                setTimeout(function (){
                    loadNamedRulesList();
                },500)

                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })

    } else if (CURRENT_TYPE === 3) {

        deleteScheduleRule(CURRENT_ID, function (status, data) {
            if (status) {
                deleteTab(CURRENT_ID, CURRENT_TYPE);
                successMsg('Successfully deleted');

                setTimeout(function (){
                    loadScheduleRulesList();
                },500)
                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })
    } else if (CURRENT_TYPE === 6) {

        deleteBinaryRule(CURRENT_ID, function (status, data) {
            if (status) {
                deleteTab(CURRENT_ID, CURRENT_TYPE);
                successMsg('Successfully deleted');

                setTimeout(function (){
                    loadBinaryRulesList();
                },500)
                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })
    }
    else if (CURRENT_TYPE === 8) {

        deleteFileRule(CURRENT_ID, function (status, data) {
            if (status) {
                deleteTab(CURRENT_ID, CURRENT_TYPE);
                successMsg('Successfully deleted');
                setTimeout(function (){
                    loadFileRulesList();
                },500)

                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })
    }
    else if (CURRENT_TYPE === 7) {

        deleteJobRule(CURRENT_ID, function (status, data) {
            if (status) {
                deleteTab(CURRENT_ID, CURRENT_TYPE);
                successMsg('Successfully deleted');

                setTimeout(function (){
                    loadJobRulesList();
                },500)
                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })
    }
    else if (CURRENT_TYPE === 9) {

        deleteProcessRule(CURRENT_ID, function (status, data) {
            if (status) {
                deleteTab(CURRENT_ID, CURRENT_TYPE);
                successMsg('Successfully deleted');

                setTimeout(function (){
                    Cookies.set('pfGroup','')
                    loadProcessRulesListAggs();
                    loadProcessRulesList();
                },500)
                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })
    }
    else if (CURRENT_TYPE === 10) {

        deleteInputRule('SFTP',CURRENT_ID, function (status, data) {
            if (status) {
                deleteTab(CURRENT_ID, CURRENT_TYPE);
                successMsg('Successfully deleted');

                setTimeout(function (){
                    loadSftpRulesList();
                },500)
                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })
    }
}


function deleteMessageField(id) {
    $("#msg_field_row_" + id).remove();
    MSG_FIELD_COUNT--;
}

function addMessageField() {

    var id = MSG_FIELD_COUNT;

    var str = `<tr id="msg_field_row_` + id + `">
    <td>
        <input class="form-control input-sm" placeholder="Field Name" type="text"  id="msg_field_` + id + `" required>
    </td>
    <td>
    <select class="form-control input-sm" required id="msg_datatype_` + id + `">
      <option value="" >Choose Data Type</option>
      <option value="INTEGER" >INTEGER</option>
      <option value="FLOAT" >FLOAT</option>
      <option value="DOUBLE" >DOUBLE</option>
      <option value="BIGINT" >BIGINT</option>
      <option value="BOOLEAN" >BOOLEAN</option>
      <option value="GEO_SHAPE" >GEO_SHAPE</option>
      <option value="GEO_POINT" >GEO_POINT</option>
      <option value="KEYWORD" >KEYWORD</option>
<!--      <option value="ASCII" >ASCII</option>-->
      <option value="TEXT" >TEXT</option>
<!--      <option value="VARCHAR" >VARCHAR</option>-->
      <option value="BLOB:AS_IS" >BLOB : AS_IS</option>
      <option value="BLOB:HEX" >BLOB : HEX</option>
      <option value="BLOB:BASE64" >BLOB : BASE64</option>
      <option value="BLOB:JSON" >BLOB : JSON</option>
      <option value="UUID" >UUID</option>
      <option value="DATE" >DATE</option>
      <option value="TIMESTAMP" >TIMESTAMP</option>
    </select>
    </td>
    <td style="text-align: center;vertical-align: middle"><img src="images/add1.png" onclick="addMessageField()" style="cursor: pointer" />` +
        (id > 0 ? '<img src="images/delete.png" style="margin-left:5px;cursor: pointer" onclick="deleteMessageField(' + id + ')"/>' : '')
        + ` </td>
  </tr>`;

    $(".msgFieldBody").append(str);
    MSG_FIELD_COUNT++;
}

function addMessageRule() {

    var flag = false;

    var fields = [];

    for (var i = 0; i < MSG_FIELD_COUNT; i++) {
        var json = {
            "dataType": $("#msg_datatype_" + i).val(),
            "format": "AS_IS",
            "label": "",
            "description": "",
            "name": $("#msg_field_" + i).val()
        }
        fields.push(json);
    }

    for (var i = 0; i < fields.length; i++) {

        if (RESERVED_FIELDS.indexOf(fields[i].name) !== -1) {
            errorMsgBorder('Reserved Fields cannot be used as a field name', 'msg_field_' + i);
            return false;
        }

        if (DATABASE_KEYWORDS.indexOf(fields[i].name) !== -1) {
            errorMsgBorder('Database keywords cannot be used as a field name', 'msg_field_' + i);
            return false;
        }

        if (fields[i].dataType.includes('BLOB')) {
            fields[i].format = fields[i].dataType.split(":")[1];
            fields[i].dataType = 'BLOB';
        }
    }


    var msgObj = {
        "id": Number($("#msg_id").val()),
        "name": $("#msg_name").val(),
        "label": $("#msg_name").val(),
        "description": $("#msg_desc").val(),
        "fields": fields
    }

    $(".btnSubmit").attr('disabled', 'disabled');

    retreiveMessageDef(msgObj.id, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('Message ID already defined', 'msg_id');
        } else {
            createUpdateMessageDef(msgObj, function (status, data) {
                if (status) {
                    successMsg('Message Defined Successfully');
                    loadMessageRulesList();
                    setTimeout(function () {
                        loadTabbar(msgObj.id, 1);
                    }, 500);

                    $("#addMessageRule").modal('hide');
                } else {
                    errorMsg('Error in Define Message')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })


}

function addNamedRule() {
    var dataObj = {
        lang: $("#rule_language").val(),
        code: "",
        name: $("#rule_id").val()
    };

    /* retreiveNamedRule(dataObj.name, function (status, data) {
         if(status){

         }
         else{

         }

     });
     */
    updateNamedRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadNamedRulesList();
            setTimeout(function () {
                loadTabbar(dataObj.name, 2);
            },500)

            $("#addNamedRule").modal('hide');
        } else {
            errorMsg('Error in saving!')
        }
    })

}


function addBinaryRule() {
    var dataObj = {
        lang: $("#binary_lang").val(),
        code: "",
        type: $("#binary_rule").val()
    };

    updateBinaryRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadBinaryRulesList();
            setTimeout(function () {
                loadTabbar(dataObj.type, 6);
            },500)

            $("#addBinaryRule").modal('hide');
        } else {
            errorMsg('Error in saving!')
        }
    })

}
function addFileRule() {
    var dataObj = {
        lang: $("#file_lang").val(),
        code: "",
        type: $("#file_rule").val()
    };

    updateFileRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadFileRulesList();
            setTimeout(function () {
                loadTabbar(dataObj.type, 8);
            },500)

            $("#addFileRule").modal('hide');
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addProcessRule() {

    var defaultCode = '//Return function should be always Map\n\nreturn [_chain:false,_next:-1,_invoke:""];'

    var data = {
        "output": {
        },
        "input": {
        },
        "code": defaultCode,
        "name": $("#processName").val(),
        "description": $("#description").val(),
        "language": "GROOVY",
        "id": $.trim($("#processName").val()).toUpperCase().replace(/\s/g, '_'),
        "properties": {
            "color": $("#processColor").spectrum("get").toHexString(),
            "logo": uploadImage
        },
        "domainKey": DOMAIN_KEY,
        "group": $("#pGroup").val(),
        "tags": $("#pGroup").val()
    }

    var input = {};

    var inputKey= $(".sftp_key").map(function() {
        return $(this).val();
    }).get();
    var inputValue= $(".sftp_value").map(function() {
        return $(this).val();
    }).get();

    for(var i=0;i<inputKey.length;i++){

        if(inputKey[i]){
            input[inputKey[i]] =  inputValue[i];
        }

    };

    data['input'] = input;

    var output = {};

    var outputKey= $(".output_key").map(function() {
        return $(this).val();
    }).get();

    if(outputKey.length === 0){
        errorMsg('Output is mandatory to get the process response')
        return false;
    }

    $(".pBtn").attr('disabled','disabled')
    $(".pBtn").html('<i class="fa fa-spinner fa-spin"></i> Processing...')

    var outputValue= $(".output_value").map(function() {
        return $(this).val();
    }).get();

    for(var i=0;i<outputKey.length;i++){

        if(outputKey[i]){
            output[outputKey[i]] =  outputValue[i];
        }

    };

    data['output'] = output;


    updateProcessRuleCode(data, function (status, result) {
        $(".pBtn").removeAttr('disabled')
        $(".pBtn").html('Save Changes')
        if (status) {
            successMsg('Successfully saved!');
            Cookies.set('pfGroup','')
            loadProcessRulesListAggs();

            loadProcessRulesList();
            setTimeout(function () {
                loadTabbar(data.id, 9);
            },500)

            $("#addProcessRule").modal('hide');
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function updateProcessRule(id) {


    var obj = {};

    for (var i = 0; i < process_rules_list.length; i++) {
        if (id === process_rules_list[i].id) {
            obj = process_rules_list[i];
        }
    }

    var defaultCode = '//Return function should be always Map\n\nreturn [_chain:false,_next:-1,_invoke:""];'

    var data = {
        "output": {
        },
        "input": {
        },
        "code": codeEditor.getSession().getValue(),
        "name": $("#processName").val(),
        "description": $("#description").val(),
        "language": "GROOVY",
        "id": $.trim($("#processName").val()).toUpperCase().replace(/\s/g, '_'),
        "properties": {
            "color": $("#processColor").spectrum("get").toHexString(),
            "logo": uploadImage
        },
        "domainKey": DOMAIN_KEY,
        "group": $("#pGroup").val(),
        "tags": $("#pGroup").val(),
        createdBy: obj.createdBy,
        createdTime: obj.createdTime
    }

    var input = {};

    var inputKey= $(".sftp_key").map(function() {
        return $(this).val();
    }).get();
    var inputValue= $(".sftp_value").map(function() {
        return $(this).val();
    }).get();

    for(var i=0;i<inputKey.length;i++){

        if(inputKey[i]){
            input[inputKey[i]] =  inputValue[i];
        }

    };

    data['input'] = input;

    var output = {};

    var outputKey= $(".output_key").map(function() {
        return $(this).val();
    }).get();

    if(outputKey.length === 0){
        errorMsg('Output is mandatory to get the process response')
        return false;
    }

    $(".pBtn").attr('disabled','disabled')
    $(".pBtn").html('<i class="fa fa-spinner fa-spin"></i> Processing...')

    var outputValue= $(".output_value").map(function() {
        return $(this).val();
    }).get();

    for(var i=0;i<outputKey.length;i++){

        if(outputKey[i]){
            output[outputKey[i]] =  outputValue[i];
        }

    };

    data['output'] = output;


    updateProcessRuleCode(data, function (status, result) {
        $(".pBtn").removeAttr('disabled')
        $(".pBtn").html('Save Changes')
        if (status) {
            successMsg('Successfully saved!');
            loadProcessRulesList();
            setTimeout(function () {
                loadTabbar(data.id, 9);
            },500)

            $("#addProcessRule").modal('hide');
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addJobRule(code) {
    var dataObj = {
        "domainKey": DOMAIN_KEY,
        "id": $("#job_rule").val(),
        "name": "",
        "jobType": $("#job_type").val(),
        "jobState": $("#job_state").val(),
        "jobLanguage": $("#job_lang").val(),
        "jobCode": code ? codeEditor.getSession().getValue() : "",
        "instances": Number($("#job_instance").val() ? $("#job_instance").val() : 0),
        "startOnBoot": $("#job_boot").val() === "1" ? true : false,
        "systemJob": ADMIN_ACCESS ?  ($("#job_system").val() === "1" ? true : false) : false,
        "resartOnChange": $("#job_restart").val() === "1" ? true : false,
    };

    updateJobRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadJobRulesList();
            setTimeout(function () {
                loadTabbar(dataObj.id, 7);
            },500)

            $("#addJobRule").modal('hide');
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addSftpRule(code) {
    var dataObj = {
        "domainKey": DOMAIN_KEY,
        "id": $("#sftp_id").val(),
        "name": $("#sftp_name").val(),
        "code": code ? codeEditor.getSession().getValue() : "",
        "description":"",
        instances: Number($("#sftp_instances").val()),
        instanceType: $("#sftp_instanceType").val(),
        lang: 'GROOVY',
        "startAtBoot": $("#sftp_startAtBoot").val() === "1" ? true : false,
        remoteHost: $("#sftp_remoteHost").val(),
        remotePort: Number($("#sftp_remotePort").val()),
        userName: $("#sftp_userName").val(),
        password: $("#sftp_password").val(),
        remotePaths : $("#sftp_remotePaths").val().split(","),
        implementation: $("#sftp_implementation").val(),
        pollInterval: $("#sftp_pollInterval").val() ? Number($("#sftp_pollInterval").val()) : null,
        listPattern: $("#sftp_listPattern").val(),
        listDirPattern: $("#sftp_listDirPattern").val(),
        "keyFilesBuiltIn": $("#sftp_keyFilesBuiltIn").val() === "1" ? true : false,
        privateKeyFilePath: $("#sftp_privateKeyFilePath").val(),
        publicKeyFilePath: $("#sftp_publicKeyFilePath").val(),
        keyPassPhrase: $("#sftp_keyPassPhrase").val(),
        connectTimeOut: $("#sftp_connectTimeOut").val() ? Number($("#sftp_connectTimeOut").val()) : null,
        listRecursive: $("#sftp_listRecursive").val() ? Number($("#sftp_listRecursive").val()) : $("#sftp_listRecursive").val(),

    };



    updateInputRuleCode('SFTP',dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            setTimeout(function(){
                loadSftpRulesList();
            },500)
            setTimeout(function () {
                if(code){
                    loadTabbar(dataObj.id, 10);
                }
            },1000)

            $("#addSftpInputRule").modal('hide');
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addScheduleRule() {
    var dataObj = {
        lang: $("#sch_language").val(),
        code: "",
        "pattern": $("#sch_pattern").val(),
        id: Number($("#sch_id").val())
    };
    if (validateCron()) {

        /* retreiveScheduleRule(dataObj.id, function (status, data) {
             if(status){

             }
             else{

             }
         });*/

        updateScheduleRuleCode(dataObj, function (status, data) {
            if (status) {
                successMsg('Successfully saved!');
                loadScheduleRulesList();
                setTimeout(function () {
                    loadTabbar(dataObj.id, 3);
                },500)

                $("#addScheduleRule").modal('hide');
            } else {
                errorMsg('Error in saving!')
            }
        })


    } else {
        errorMsgBorder('Invalid Cron Expression', 'sch_pattern');
    }

}

function loadClassTemplate(id) {
    var template = "";
    $(".logResult").html("");
    if (id === 'GROOVY') {
        template = `
                    <!-- <div  class="col-md-6">
                        <div  class="form-group">
                            <label  class="inputLabel">
                                <input type="checkbox" id="class_public" /> Is Public
                            </label> <br>
                            <label  class="inputLabel">
                                <input type="checkbox" id="class_opensource"/> Is OpenSource
                            </label>
                        </div>
                    </div> -->
                    <div  class="col-md-6">
                        <div  class="form-group">
                            <label  class="inputLabel">Choose File</label>
                            <input type="file" class="form-control input-sm" id="class_file" required />
                        </div>
                    </div>`;


    } else if (id === 'JAR') {
        template = `<div  class="col-md-6">
                        <div  class="form-group">
                            <label  class="inputLabel">Name</label>
                            <input type="text" class="form-control input-sm" id="class_name" required />
                        </div>
                       <!-- <div  class="form-group">
                            <label  class="inputLabel">
                                <input type="checkbox" id="class_public" /> Is Public
                            </label>
                        </div> -->
                    </div>
                    <div  class="col-md-6">
                        <div  class="form-group">
                            <label  class="inputLabel">Choose File</label>
                            <input type="file" class="form-control input-sm" id="class_file" required />
                        </div>
                    </div>`;
    }

    $(".classTemplate").html(template);
}

function uploadClassFile() {
    $(".logResult").html("");

    var type = $("#class_type").val();
    if (type === 'GROOVY') {
        var isPublic = false; // $("#class_public").is(":checked");
        var isOpen = false; // $("#class_opensource").is(":checked");

        if(ADMIN_ACCESS){
            isPublic = $("input[name='fileType']:checked").val() === 'PUBLIC_GROOVY' ? true : false;

        }

        uploadClass(1, isPublic, isOpen, null);
    } else {
        var isPublic = false; //$("#class_public").is(":checked");
        var jarName = $("#class_name").val();

        uploadClass(2, isPublic, null, jarName);
    }
}

function uploadClass(type, ispublic, isopen, jarname) {

    var url = "";
    if (type === 1) {
        url = API_BASE_PATH + "/groovy/upload/script/file/" + API_TOKEN + "/" + ispublic + "/" + isopen;
    } else {
        url = API_BASE_PATH + "/groovy/upload/jar/" + API_TOKEN + "/" + ispublic + "/" + jarname;
    }

    var file = document.getElementById('class_file').files[0]; //$("#class_file")
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('progress', function (e) {
        var done = e.position || e.loaded, total = e.totalSize || e.total;
        console.log('xhr progress: ' + (Math.floor(done / total * 1000) / 10) + '%');
    }, false);
    if (xhr.upload) {
        xhr.upload.onprogress = function (e) {
            var done = e.position || e.loaded, total = e.totalSize || e.total;
            console.log('xhr.upload progress: ' + done + ' / ' + total + ' = ' + (Math.floor(done / total * 1000) / 10) + '%');
        };
    }
    xhr.onreadystatechange = function (e) {

        if (4 == this.readyState) {

            if (this.status === 200) {
                successMsg('Successfully uploaded');
                loadCodeType();
                $("#addClass").modal('hide');
            }
            else {
                errorMsg('Error in Uploading')
                var jsonResponse = JSON.parse(this.response);
                if (jsonResponse) {
                    if (jsonResponse.code === 'SERVER_ERROR') {
                        $(".logResult").html('<label class="label label-danger">ERROR</label>' +
                            '<pre style="height: 200px;overflow: auto;margin-top:10px;overflow-x: hidden;word-wrap: break-word;white-space: pre-line;">' +
                            jsonResponse.message + "</pre>")
                    }
                }
            }


        }
    };
    xhr.open('POST', url, true);

    // xhr.setRequestHeader("Content-Type","multipart/form-data");

    var formData = new FormData();
    if (type === 1) {
        formData.append("scriptFile", file, file.name);
    } else {
        formData.append("jarFile", file, file.name);
    }
    xhr.send(formData);

}


function loadCodeType() {

    var codeType = $("#codeType").val()

    var searchText = $.trim($("#searchText").val());


    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        "query": {
            "bool": {
                "must": []
            }
        },
        "size": 1000
    };

    if (searchText !== '') {
        var searchJson = {
            "multi_match": {
                "query": '*' + searchText + '*',
                "type": "phrase_prefix",
                "fields": ['_all']
            }
        };
        queryParams.query['bool']['must'] = [searchJson];

    } else {
        queryParams.query['bool']['must'] = [];
    }

    var searchType = $("input[name='fileType']:checked").val();

    if(searchType === 'GROOVY'){
        queryParams.query['bool']['must'].push({match:{isPublic: false}})
        queryParams.query['bool']['must'].push(domainKeyJson)
    }else{
        queryParams.query['bool']['must'].push({match:{isPublic: true}})
    }


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    if(codeType === 'JAR'){
        if(searchType === 'GROOVY'){
            searchType = 'GROOVY_JAR';
        }else{
            searchType = 'PUBLIC_GROOVY_JAR';
        }
    }


    searchByQuery('', searchType, searchQuery, function (status, res) {

        var dataList = [];
        if (status) {

            var resultData = QueryFormatter(res).data;
            dataList = resultData['data'];
        }

        if (dataList.length > 0) {
            if (codeType === 'CLASS') {

                for(var i=0;i<dataList.length;i++){
                    console.log(dataList[i])
                    for(var j=0;j<dataList[i].classes.length;j++){
                        dataList[i].classes[j]['code'] = dataList[i].code;
                        dataList[i].classes[j]['_id'] = dataList[i]._id;
                        dataList[i].classes[j]['packageName'] = dataList[i].packageName;
                    }
                }

                var pList = _.groupBy(dataList, 'packageName');

                var dpList = _.pluck(dataList, 'packageName');

                dpList = _.uniq(dpList);


                var resList = [];

                for(var i=0;i<dpList.length;i++){

                    var obj = pList[dpList[i]];

                    var classes = [];

                    for(var j=0;j<obj.length;j++){
                        for(var k=0;k<obj[j].classes.length;k++){
                            classes.push(obj[j].classes[k])
                        }
                    }

                    resList.push({packageName:dpList[i], classes:classes, _id:guid()});

                }
                // console.log(resList)
                groovy_class_list = resList;


                $(".classFolder").html('<div id="groovy_tree" style=""></div>');
                loadGroovyTreeMenu(resList);
            } else {
                $(".classFolder").html('<div id="jar_tree" style=""></div>');
                loadJarTreeMenu(dataList);
            }
        } else {
            $(".classFolder").html('<p><small>No Data Found!</small></p>');
        }


    })


}


function openSimulateModal(id,type) {

    if(type === 1){

        var str = '<div id="simulatorModal_'+id+'">' +
            '<div data-role="body">\n' +
            '<div class="row msgFieldBlock_'+id+'"></div>' +
            '<div class="row">' +
            '<div class="col-md-12">' +
            '<button class="btn btn-sm btn-success pull-right btn_'+id+'" onclick="simulateMessage(\''+id+'\','+type+')">Send Message</button>' +
            '<button class="btn btn-sm btn-default pull-right" onclick="closeSimulator(\''+id+'\')" style="margin-right: 10px;">Close</button>' +
            '</div> ' +
            '<div class="col-md-12" style="clear:both;max-height: 200px;overflow: auto;overflow-x: hidden">' +
            '<code class="code_'+id+'" ></code>' +
            '</div>' +
            '</div></div>' +
            '</div>'


        for(var i=0;i<message_spec_list.length;i++){
            if(Number(id) === message_spec_list[i]['id']){
                current_msg_obj = message_spec_list[i]
            }
        }

        simulator[id] = current_msg_obj;


        if(!simulatorModal[id]){

            $(".simulatorModal").append(str);

            $(".msgFieldBlock_"+id).html('');

            for(var i=0;i<current_msg_obj.fields.length;i++){
                $(".msgFieldBlock_"+id).append(renderHtml(id,i,current_msg_obj.fields[i]))
            }
            simulatorModal[id] = $("#simulatorModal_"+id).dialog({
                resizable: true,
                open: function(){
                    var closeBtn = $('.ui-dialog-titlebar-close');
                    closeBtn.html('X');
                },
                // minWidth: 200,
                // maxWidth: 600,
                // minHeight: 200,
                // maxHeight: 450,
                // width: 450,
                // height: 300,
                modal: false,
                closeText: "x",
                close: function( event, ui ) {
                    closeSimulator(id);
                },

                title: "Simulate -"+ id + ' ['+current_msg_obj.name+']',

                /*buttons: {
                    Close: function() {
                        $( this ).dialog( "close" );
                        simulatorModal[id] = null;
                        $("#simulatorModal_"+id).remove();
                    }


                }*/
            });

        }

    }
    else if(type === 2){

        var placeholder='{\n"key":"value",\n"key":"value",\n"key":"value",\n"key":"value"\n}';

        var str = '<div id="simulatorModal_'+id+'">' +
            '<div data-role="body">\n' +
            '<div class="row>' +
            '<div class="col-md-12">' +
            '<p class="mb-0">Named Rule Arguments - <small>JSON value</small></p><textarea class="form-control form-control-sm mb-2" style="width:100%;height:200px" id="simulatorInput_'+id+'"' +
            "placeholder='"+placeholder+"'></textarea></div>" +
            '</div>' +
            '<div class="row">' +
            '<div class="col-md-12">' +
            '<button class="btn btn-sm btn-success pull-right btn_'+id+'" onclick="simulateMessage(\''+id+'\','+type+')">Invoke NamedRule</button>' +
            '<button class="btn btn-sm btn-default pull-right" onclick="closeSimulator(\''+id+'\')" style="margin-right: 10px;">Close</button>' +
            '</div> ' +
            '<div class="col-md-12" style="clear:both;max-height: 200px;overflow: auto;overflow-x: hidden">' +
            '<code class="code_'+id+'" ></code>' +
            '</div>' +
            '</div></div>' +
            '</div>'

        for(var i=0;i<named_rules_list.length;i++){
            if(id === named_rules_list[i]['name']){
                current_namedrule_obj = named_rules_list[i]
            }
        }

        simulator[id] = current_namedrule_obj;


        if(!simulatorModal[id]){

            $(".simulatorModal").append(str);

            simulatorModal[id] = $("#simulatorModal_"+id).dialog({
                resizable: true,
                open: function(){
                    var closeBtn = $('.ui-dialog-titlebar-close');
                    closeBtn.html('X');
                },
                // minWidth: 200,
                // maxWidth: 600,
                // minHeight: 200,
                // maxHeight: 450,
                // width: 450,
                // height: 300,
                modal: false,
                closeText: "x",
                close: function( event, ui ) {
                    closeSimulator(id);
                },

                title: 'Simulate - '+current_namedrule_obj.name,

                /*buttons: {
                    Close: function() {
                        $( this ).dialog( "close" );
                        simulatorModal[id] = null;
                        $("#simulatorModal_"+id).remove();
                    }


                }*/
            });

        }

    }
    else if(type === 3){

        var str = '<div id="simulatorModal_'+id+'">' +
            '<div data-role="body">\n' +
            '<div class="row>' +
            '<div class="col-md-12">' +
            '<p class="mb-0"><label>Upload Binary File</label></p>' +
            '<input type="file" class="form-control pb-3 mb-2" style="" id="simulatorInput_'+id+'"/></div>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-md-12">' +
            '<button class="btn btn-sm btn-success pull-right btn_'+id+'" onclick="simulateMessage(\''+id+'\','+type+')">Upload File</button>' +
            '<button class="btn btn-sm btn-default pull-right" onclick="closeSimulator(\''+id+'\')" style="margin-right: 10px;">Close</button>' +
            '</div> ' +
            '<div class="col-md-12" style="clear:both;max-height: 200px;overflow: auto;overflow-x: hidden">' +
            '<code class="code_'+id+'" ></code>' +
            '</div>' +
            '</div></div>' +
            '</div>'

        for(var i=0;i<binary_rules_list.length;i++){
            if(id === binary_rules_list[i]['type']){
                current_binaryrule_obj = binary_rules_list[i]
            }
        }

        simulator[id] = current_binaryrule_obj;


        if(!simulatorModal[id]){

            $(".simulatorModal").append(str);

            simulatorModal[id] = $("#simulatorModal_"+id).dialog({
                resizable: true,
                open: function(){
                    var closeBtn = $('.ui-dialog-titlebar-close');
                    closeBtn.html('X');
                },
                // minWidth: 200,
                // maxWidth: 600,
                // minHeight: 200,
                // maxHeight: 450,
                // width: 450,
                // height: 300,
                modal: false,
                closeText: "x",
                close: function( event, ui ) {
                    closeSimulator(id);
                },

                title: 'Simulate - '+current_binaryrule_obj.type,

                /*buttons: {
                    Close: function() {
                        $( this ).dialog( "close" );
                        simulatorModal[id] = null;
                        $("#simulatorModal_"+id).remove();
                    }


                }*/
            });

        }
    }
    else if(type === 4){

        var str = '<div id="simulatorModal_'+id+'">' +
            '<div data-role="body">\n' +
            '<div class="row>' +
            '<div class="col-md-12">' +
            '<p class="mb-0"><label>Upload File File</label></p>' +
            '<input type="file" class="form-control pb-3 mb-2" style="" id="simulatorInput_'+id+'"/></div>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-md-12">' +
            '<button class="btn btn-sm btn-success pull-right btn_'+id+'" onclick="simulateMessage(\''+id+'\','+type+')">Upload File</button>' +
            '<button class="btn btn-sm btn-default pull-right" onclick="closeSimulator(\''+id+'\')" style="margin-right: 10px;">Close</button>' +
            '</div> ' +
            '<div class="col-md-12" style="clear:both;max-height: 200px;overflow: auto;overflow-x: hidden">' +
            '<code class="code_'+id+'" ></code>' +
            '</div>' +
            '</div></div>' +
            '</div>'

        for(var i=0;i<file_rules_list.length;i++){
            if(id === file_rules_list[i]['type']){
                current_filerule_obj = file_rules_list[i]
            }
        }

        simulator[id] = current_filerule_obj;


        if(!simulatorModal[id]){

            $(".simulatorModal").append(str);

            simulatorModal[id] = $("#simulatorModal_"+id).dialog({
                resizable: true,
                open: function(){
                    var closeBtn = $('.ui-dialog-titlebar-close');
                    closeBtn.html('X');
                },
                // minWidth: 200,
                // maxWidth: 600,
                // minHeight: 200,
                // maxHeight: 450,
                // width: 450,
                // height: 300,
                modal: false,
                closeText: "x",
                close: function( event, ui ) {
                    closeSimulator(id);
                },

                title: 'Simulate - '+current_filerule_obj.type,

                /*buttons: {
                    Close: function() {
                        $( this ).dialog( "close" );
                        simulatorModal[id] = null;
                        $("#simulatorModal_"+id).remove();
                    }


                }*/
            });

        }
    }





}

function simulateMessage(id,type) {

    if(type === 1){
        var obj = simulator[id];

        var jsonObj = {};

        for(var i=0;i<obj.fields.length;i++){
            var dataType = obj.fields[i].dataType.toUpperCase();
            if(dataType === 'BOOLEAN'){
                jsonObj[obj.fields[i].name] = $("#"+id+"_"+i).val() === 'true' ? true : false;
            }
            else if(dataType === 'INTEGER' || dataType === 'FLOAT' || dataType === 'DOUBLE' || dataType === 'BIGINT' || dataType === 'TIMESTAMP'){
                jsonObj[obj.fields[i].name] = $("#"+id+"_"+i).val() !== '' ? Number($("#"+id+"_"+i).val()) : '';
            }
            else if(dataType === 'DATE'){
                jsonObj[obj.fields[i].name] = $("#"+id+"_"+i).val() !== '' ? new Date($("#"+id+"_"+i).val()) : '';
            }else{
                jsonObj[obj.fields[i].name] = $("#"+id+"_"+i).val()
            }

        }

        $(".code_"+id).append('<p>'+new Date() +' | '+JSON.stringify(jsonObj)+'</p>');

        $(".btn_"+id).attr('disabled', 'disabled');


        simulateDeviceMessage(id, jsonObj, function (status, data) {

            $(".btn_"+id).removeAttr('disabled');
            if(status){
                $(".code_"+id).append('<p>'+new Date() +' | Message sent successfully</p>');
            }else{
                $(".code_"+id).append('<p>'+new Date() +' | Error in sent message</p>');
            }

        });
    }
    else if(type === 2){

        var inputObj= $("#simulatorInput_"+id).val();
        if(inputObj && isValidJson(inputObj)){
            $(".btn_"+id).attr('disabled', 'disabled');
            $(".code_"+id).append('<p>'+new Date() +' | '+inputObj+'</p>');

            simulateNamedRule(id, inputObj, function (status, data) {

                $(".btn_"+id).removeAttr('disabled');
                if(status){
                    $(".code_"+id).append('<p>'+new Date() +' | Named Rule invoked successfully</p>');
                    $(".code_"+id).append('<p>'+new Date() +' | Result => '+JSON.stringify(data)+'</p>');
                }else{
                    $(".code_"+id).append('<p>'+new Date() +' | Error in invoking named rule</p>');
                }

            });

        }else{
            errorMsgBorder("Empty JSON (or) Invalid JSON","simulatorInput_"+id)
        }

    }
    else if(type === 3){


        var fileInput = document.getElementById("simulatorInput_"+id);

        var files = fileInput.files;

        if (files.length === 0) {
            errorMsgBorder('File not found. select a file to start upload',"simulatorInput_"+id);
            return false;
        }
        $(".btn_"+id).attr('disabled', 'disabled');
        uploadBinaryFile(files[0],id);

    }
    else if(type === 4){


        var fileInput = document.getElementById("simulatorInput_"+id);

        var files = fileInput.files;

        if (files.length === 0) {
            errorMsgBorder('File not found. select a file to start upload',"simulatorInput_"+id);
            return false;
        }
        $(".btn_"+id).attr('disabled', 'disabled');
        uploadFileRule(files[0],id);

    }

}
function uploadBinaryFile(file,id) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            $(".btn_"+id).removeAttr('disabled');
            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);

                $(".code_"+id).append('<p>'+new Date() +' | File upload successfully!</p>');
                $(".code_"+id).append('<p>'+new Date() +' | Result => '+xhr.response+'</p>');

            } else {
                $(".code_"+id).append('<p>'+new Date() +' | Error in binary file upload!</p>');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/push/bin/file/' + DOMAIN_KEY+'/'+API_KEY+"/SIMULATOR/WEB/1.0/"+id, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    xhr.send(formData);
}

function uploadFileRule(file,id) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            $(".btn_"+id).removeAttr('disabled');
            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);

                $(".code_"+id).append('<p>'+new Date() +' | File upload successfully!</p>');
                $(".code_"+id).append('<p>'+new Date() +' | Result => '+xhr.response+'</p>');

            } else {
                $(".code_"+id).append('<p>'+new Date() +' | Error in file rule upload!</p>');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/push/file/' + DOMAIN_KEY+'/'+API_KEY+"/SIMULATOR/WEB/1.0/"+id, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    xhr.send(formData);
}

function closeSimulator(id) {

    $('#simulatorModal_'+id).dialog( "close" );
    simulatorModal[id] = null;
    $("#simulatorModal_"+id).remove();

}

function renderHtml(id, index, obj) {

    var str = '';
    var dataType = obj.dataType.toUpperCase();

    if(dataType === 'BOOLEAN') {
        str = `
          <div class="col-md-6">
            <div class="form-group">
                <label class="inputLabel" style="text-transform: uppercase">` + obj.name + `</label>
                <select class="form-control input-sm" id="` + id + `_` + index + `" required>
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
                <small style="color:#ccc">Datatype: ` + obj.dataType + `</small>
            </div>
        </div>
        `;
    }else if(dataType === 'INTEGER'){
        str = `
          <div class="col-md-6">
            <div class="form-group">
                <label class="inputLabel" style="text-transform: uppercase">` + obj.name + `</label>
                <input type="number" class="form-control input-sm" id="` + id + `_` + index + `" required>
                <small style="color:#ccc">Datatype: ` + obj.dataType + `</small>
            </div>
        </div>
        `;
    }else{
        str = `
          <div class="col-md-6">
            <div class="form-group">
                <label class="inputLabel" style="text-transform: uppercase">` + obj.name + `</label>
                <input type="text" class="form-control input-sm" id="` + id + `_` + index + `" required>
                <small style="color:#ccc">Datatype: ` + obj.dataType + `</small>
            </div>
        </div>
        `;
    }
    return str;
}

function sendTestMsg() {
    
}

function exportRule(type) {

    var consoleText = codeEditor.getSession().getValue();

    var data = {};
    var rule_name = '';

    if(type === 1){
        console.log('Domain Rule...!');
        rule_name = 'domain-rule';
        data = {
            lang: 'GROOVY',
            code: consoleText
        }


    }else if(type === 2){
        console.log('Message Rule...!');
        rule_name = 'message-rule-'+CURRENT_ID;
        data = {
            lang: 'GROOVY',
            code: consoleText,
            messageId: CURRENT_ID
        }


    }else if(type === 3){
        console.log('Named Rule...!');
        rule_name = 'named-rule-'+CURRENT_ID;
        data = {
            lang: 'GROOVY',
            code: consoleText,
            name: CURRENT_ID
        }


    }else if(type === 4){
        console.log('Schedule Rule...!');
        rule_name = 'schedule-rule-'+CURRENT_ID;
        var obj = returnObj(CURRENT_ID, 3);

        data = {
            lang: 'GROOVY',
            code: consoleText,
            id: CURRENT_ID,
            pattern: obj.pattern
        }

    }

    else if(type === 6){
        console.log('Binary Rule...!');
        rule_name = 'binary-rule-'+CURRENT_ID;
        var obj = returnObj(CURRENT_ID, 6);

        data = {
            lang: 'GROOVY',
            code: consoleText,
            type: CURRENT_ID,
        }

    }

    else if(type === 8){
        console.log('File Rule...!');
        rule_name = 'file-rule-'+CURRENT_ID;
        var obj = returnObj(CURRENT_ID, 8);

        data = {
            lang: 'GROOVY',
            code: consoleText,
            type: CURRENT_ID,
            rootPath: obj.rootPath ? obj.rootPath: '',
        }

    }
    else if(type === 9){
        console.log('Process Rule...!');
        rule_name = 'process-rule-'+CURRENT_ID;
        var obj = returnObj(CURRENT_ID, 9);

        delete obj._id;
        obj['code'] = consoleText;

        data = obj;

    }

    else if(type === 7){
        console.log('Job Rule...!');
        rule_name = 'job-rule-'+CURRENT_ID;
        var obj = returnObj(CURRENT_ID, 7);

         data = {
            "domainKey": DOMAIN_KEY,
            "id": CURRENT_ID,
            "name": "",
            "jobType": obj.jobType,
            "jobState": obj.jobState,
            "jobLanguage": obj.jobLanguage,
            "jobCode": consoleText,
            "instances": obj.instances,
            "startOnBoot": obj.startOnBoot,
            "systemJob": obj.systemJob,
            "resartOnChange": obj.resartOnChange,
        }

    }
    else if(type === 10){
        console.log('SFTP Rule...!');
        rule_name = 'sftp-rule-'+CURRENT_ID;
        var obj = returnObj(CURRENT_ID, 10);
        delete obj._id;

        data = obj;


    }

    var dObj = {
        type : type,
        data : data
    }

    createDownload(dObj, rule_name);



}


function createDownload(obj,name) {

    saveAndDownload(JSON.stringify(obj), name+'-'+DOMAIN_KEY+'.json', 'application/json', 'exportMsg')

}

function uploadRuleModal() {
    $("#importModal form")[0].reset();
    $("#importFile").val('')
    $("#importModal").modal('show');
}

function uploadRuleType(type, data) {

    if (type === 1) {

        updateDomainRuleCode(data, function (status, resdata) {
            if (status) {
                successMsg('Domain Rule Successfully Uploaded!');
                domain_rule_obj = data;
                loadDomainCode();
                $("#importModal").modal('hide');
            } else {
                errorMsg('Error in saving!')
            }

        })

    } else if (type === 2) {

        updateMessageRuleCode(data, function (status, resdata) {
            if (status) {
                successMsg('Message Rule Successfully Uploaded!');
                loadMessageRulesList();
                setTimeout(function () {
                    loadTabbar(data.messageId,1)
                    $("#importModal").modal('hide');
                },1000)

            } else {
                errorMsg('Error in saving!')
            }

        })

    } else if (type === 3) {

        updateNamedRuleCode(data, function (status, resdata) {
            if (status) {
                successMsg('Named Rule Successfully Uploaded!');
                loadNamedRulesList();

                setTimeout(function () {
                    loadTabbar(data.name,2)
                    $("#importModal").modal('hide');
                },1000)
            } else {
                errorMsg('Error in saving!')
            }
            $("#importModal").modal('hide');
        })

    } else if (type === 4) {

        updateScheduleRuleCode(data, function (status, resdata) {
            if (status) {
                successMsg('Schedule Rule Successfully Uploaded!');
                loadScheduleRulesList();
                setTimeout(function () {
                    loadTabbar(data.id,3)
                    $("#importModal").modal('hide');
                },1000)

            } else {
                errorMsg('Error in saving!')
            }
            $("#importModal").modal('hide');
        })
    }
    else if (type === 6) {

        updateBinaryRuleCode(data, function (status, resdata) {
            if (status) {
                successMsg('Binary Rule Successfully Uploaded!');
                loadBinaryRulesList();
                setTimeout(function () {
                    loadTabbar(data.type,6)
                    $("#importModal").modal('hide');
                },1000)

            } else {
                errorMsg('Error in saving!')
            }
            $("#importModal").modal('hide');
        })
    }
    else if (type === 8) {

        updateFileRuleCode(data, function (status, resdata) {
            if (status) {
                successMsg('File Rule Successfully Uploaded!');
                loadFileRulesList();
                setTimeout(function () {
                    loadTabbar(data.type,8)
                    $("#importModal").modal('hide');
                },1000)

            } else {
                errorMsg('Error in saving!')
            }
            $("#importModal").modal('hide');
        })
    }
    else if (type === 9) {

        updateProcessRuleCode(data, function (status, resdata) {
            if (status) {
                successMsg('Process Rule Successfully Uploaded!');
                loadProcessRulesList();
                setTimeout(function () {
                    loadTabbar(data.type,9)
                    $("#importModal").modal('hide');
                },1000)

            } else {
                errorMsg('Error in saving!')
            }
            $("#importModal").modal('hide');
        })
    }
    else if (type === 7) {

        updateJobRuleCode(data, function (status, resdata) {
            if (status) {
                successMsg('Job Rule Successfully Uploaded!');
                loadJobRulesList()();
                setTimeout(function () {
                    loadTabbar(data.id,7)
                    $("#importModal").modal('hide');
                },1000)

            } else {
                errorMsg('Error in saving!')
            }
            $("#importModal").modal('hide');
        })
    }
    else if (type === 10) {

        updateInputRuleCode('SFTP',data, function (status, resdata) {
            if (status) {
                successMsg('SFTP Rule Successfully Uploaded!');

                setTimeout(function () {
                    loadSftpRulesList();
                    // loadTabbar(data.id,10)
                    $("#importModal").modal('hide');
                },500)

            } else {
                errorMsg('Error in saving!')
            }
            $("#importModal").modal('hide');
        })
    }

}




function getImportFile(event) {
    const input = event.target;
    if (input && input.files.length > 0) {
        placeFileContent(
            document.getElementById('imported_content'),
            input.files[0]);

    }
}

function placeFileContent(target, file) {
    readFileContent(file).then(content => {

        var resultObj = JSON.parse(content);
        uploadRuleType(resultObj.type, resultObj.data)


    }).catch(error => console.log(error))
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
})
}


function checkJobInstance() {
  var jType = $("#job_type").val();

  if(jType === 'SCALABLE' || jType === 'DISTRIBUTED'){
      $("#job_instance").removeAttr('disabled')
      $("#job_instance").val(1);
  }else{
      $("#job_instance").attr('disabled','disabled');
      $("#job_instance").val(1);
  }

    if(ADMIN_ACCESS){

        if(jType === 'ATOMIC'){
            $("#job_system").attr('disabled','disabled')
        }else{
            $("#job_system").removeAttr('disabled')
        }
    }

    if(jType === 'ATOMIC'){
        $("#job_boot").attr('disabled','disabled');
    }else{
        $("#job_boot").removeAttr('disabled')
    }
}
var context_list = []

function loadContextList() {
    $.ajax({
        url: API_BASE_PATH + "/global/context/list",
        type: 'GET',
        success: function (data) {
           if(data){
               $(".contextList").html('');
               var result = data.classes;

               context_list = result.length > 0 ? result : [];

               renderContext();

               for(var i=0;i<result.length;i++){

                   var methods = result[i].methods;

                   $(".contextList").append('<p style="text-transform: uppercase"><b>'+result[i].name+'</b></p>');

                   for(var j=0;j<methods.length;j++) {

                       $(".contextList").append('<p class="codeText" onclick="addContextMethod(\''+result[i].name+'\',\''+methods[j].signature+'\',\''+methods[j].help+'\')"><code>' + methods[j].signature + '</code><br>' +
                           '<small>'+methods[j].help+'</small></p>');
                   }
               }
           }
        },
        error: function (e) {
           errorMsg('Error in fetching context list')

        }
    });
}

function addContextMethod(nam, method,help) {

    var text = '\n//Context Name: '+nam+'\n//Method: '+method+'\n//Description: '+help
    codeEditor.session.insert(codeEditor.getCursorPosition(), text)


}

function filterContext() {
    // Declare variables
    var input = $('#contextSearch').val().toLowerCase();
    var p = $(".contextList").children();

    // Loop through all list items, and hide those who don't match the search query
    for (var i = 0; i < p.length; i++) {

        var txtValue = $(p[i]).html().toLowerCase();;
        if (txtValue.includes(input)) {
            $(p[i]).css('display','block')
        } else {
            $(p[i]).css('display','none')
        }
    }
}



function openHelpModal() {

    // loadElasticHelp();
    $("#helpModal").modal({
        backdrop: false,
        keyboard: false

    })
}



function renderContext(search,id) {

    if(search || id){
        $(".contextBody").html('');
    }
    $(".cBody").html('')

    for (var i = 0; i < context_list.length; i++) {

        var val = context_list[i];

        $(".cBody").append('<li class="ml-1 mr-1 mt-1 mb-1 '+(id== val.name ? 'bg-light' :'')+'" style="border: 1px solid #eee;padding: 10px 15px">' +
            '<a class="" style="" href="javascript:void(0)" onclick="renderContext(\''+''+'\',\''+val.name+'\')">'+val.name+'</a></li>')

        var str = '';

        var flg = false;

        for (var j = 0; j < val.methods.length; j++) {
            var methods = val.methods[j];
            if(search){

                if(val.name.toLowerCase().includes(search.toLowerCase())
                    || methods.help.toLowerCase().includes(search.toLowerCase())
                    || methods.signature.toLowerCase().includes(search.toLowerCase())){
                    flg=true
                    str += '<p class="mt-2 "><code>'+val.name+'</code> '+methods.help+'</p><pre class="bg-violet-light-5 mb-2"><xmp style="font-size: 14px">'+methods.signature+'</xmp></pre>'
                }
            }else{
                str += '<p class="mt-2"><code>'+val.name+'</code> '+methods.help+'</p><pre class="bg-violet-light-5 mb-2"><xmp style="font-size: 14px">'+methods.signature+'</xmp></pre>'
            }
            if(methods.examples && methods.examples.length > 0) {

                str += '<div style="padding-left: 25px"><h6>Examples:</h6>'

                for (var k = 0; k < methods.examples.length; k++) {

                    str += '<pre class="mb-2"><xmp style="font-size: 12px">'+methods.examples[k]+'</xmp></pre>'

                }
                str += '</div><hr>'
            }


        }
        if(id){

            if(id == val.name){
                console.log('print')
                if(search){
                    if(flg){
                        $(".contextBody").append('<div class="col-md-12 mt-1 mb-2 c_'+val.name+'">' +
                            '<hr><h5 style="text-transform: capitalize">' + val.name + '</h5>' +
                            str +
                            '</div>');

                    }
                }else{
                    $(".contextBody").append('<div class="col-md-12 mt-1 mb-2 c_'+val.name+'">' +
                        '<hr><h5 style="text-transform: capitalize">' + val.name + '</h5>' +
                        str +
                        '</div>');

                }
            }
        }else{
            if(search){
                if(flg){
                    $(".contextBody").append('<div class="col-md-12 mt-1 mb-2 c_'+val.name+'">' +
                        '<hr><h5 style="text-transform: capitalize">' + val.name + '</h5>' +
                        str +
                        '</div>');

                }
            }else{
                $(".contextBody").append('<div class="col-md-12 mt-1 mb-2 c_'+val.name+'">' +
                    '<hr><h5 style="text-transform: capitalize">' + val.name + '</h5>' +
                    str +
                    '</div>');

            }
        }



    }
}

function loadElasticHelp() {
    $(".elasticBody").html();
    for (var j = 0; j < ELASTIC_QUERY.length; j++) {
        var val = ELASTIC_QUERY[j];
        var str = '<p class="mt-2">' + val.description + '</p><pre class="bg-violet-light-5 mb-2">' +
            '<xmp style="font-size: 14px">' + val.code + '' +
            '</xmp>' +
            '</pre>'

        $(".elasticBody").append('<div class="col-md-12 mt-1 mb-2">' +
            '<h6 style="text-transform: capitalize">' + val.name + '</h6>' +
            str +
            '</div>');
    }
}


function changeId(val) {
    $("#processId").html($.trim($("#processName").val()).toUpperCase().replace(/\s/g, '_'))
}


function inputId(source,target) {
    $("."+target).html($.trim($("#"+source).val()).toUpperCase().replace(/\s/g, '_'))
    $("#"+target).val($.trim($("#"+source).val()).toUpperCase().replace(/\s/g, '_'))
}

function addBlock() {
    if($(".tclass.active").hasClass('outClass')){
        $(".outputBody").append($("#outputHtml").html());
    }else{
        $(".inputBody").append($("#inputHtml").html());
    }

}

function checkKeyFile(val){


    if(val == "1"){
        $(".sftp_privateKeyFilePath").css('display','block')
        $("#sftp_privateKeyFilePath").attr('required','required')
        $(".sftp_publicKeyFilePath").css('display','block')
        // $("#sftp_publicKeyFilePath").attr('required','required')
    }else{
        $(".sftp_privateKeyFilePath").css('display','none')
        $(".sftp_publicKeyFilePath").css('display','none')
        $("#sftp_privateKeyFilePath").removeAttr('required')
        // $("#sftp_publicKeyFilePath").removeAttr('required')
    }
}

var uploadImage = 'images/generate_claim.svg';


function uploadProcessFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                uploadImage = API_BASE_PATH + '/files/public/download/' + result.id;
                $(".process_img").attr('src', API_BASE_PATH + '/files/public/download/' + result.id+ '?' + new Date().getTime());
            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/files/upload/' + API_TOKEN+'?ispublic=true', true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    formData.append("tags", 'process Picture');
    formData.append("description", '');
    xhr.send(formData);
}

function uploadProcessImage() {

    var fileInput = document.getElementById("processIcon");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    uploadProcessFile(files[0]);

}
var pemFileId = null;
function checkPemFile(id){
    pemFileId=id;
    $("#pemFile").click()

}


function uploadPemFile() {

    var fileInput = document.getElementById("pemFile");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    uploadPem(files[0]);

}


function uploadPem(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                $("#"+pemFileId).val(result.id)
            } else {
                errorMsg('Error in key file upload!');
            }
        }
    };

    $("."+pemFileId+"_name").html(file.name)

    xhr.open('POST', API_BASE_PATH + '/files/upload/' + API_TOKEN, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    formData.append("tags", 'pem file');
    formData.append("description", '');
    xhr.send(formData);
}
