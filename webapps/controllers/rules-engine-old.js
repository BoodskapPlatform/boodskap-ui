let rules_page_size = 100;
let rules_direction = null;
let rules_id = null;
let message_rules_list = [];
let message_spec_list = [];
let schedule_rules_list = [];
let named_rules_list = [];
let binary_rules_list = [];
let file_rules_list = [];
let job_rules_list = [];
let process_rules_list = [];
let sftp_rules_list = [];
let mqtt_rules_list = [];
let udp_rules_list = [];
let tcp_rules_list = [];
let email_rules_list = [];
let micro_rules_list = [];
let groovy_class_list = [];
let jar_class_list = [];
let tabbar_list = [];
let domain_rule_obj = {};
let codeEditor = null;
let CURRENT_ID = null;
let CURRENT_TYPE = null;
let editorToggle = false;

let current_msg_id = null;
let current_msg_obj = null;
let current_namedrule_obj = null;
let current_binaryrule_obj = null;
let current_filerule_obj = null;
let current_processrule_obj = null;
let current_sftprule_obj = null;
let current_mqttrule_obj = null;
let current_udprule_obj = null;
let current_tcprule_obj = null;
let current_emailrule_obj = null;
let current_microrule_obj = null;
let simulatorModal = {};
let simulator = {};
let scriptTerminal = null;

let editorChange = false;
let CHANGED_ID = null;
let CHANGED_TYPE = null;
let CHANGED_TEXT = null;
let CHANGED_DEFAULT_TEXT = null;

let DEVICE_LIST = [];

let logLevels = {
    trace: 'default',
    debug: 'primary',
    info: 'info',
    warn: 'warning',
    error: 'danger',
    fatal: 'success',
    off: 'default',
    all: 'default'
};

let rule_types = {
    "domain": "domain_rule.groovy",
    "1": "message_rule.groovy",
    "2": "named_rule.groovy",
    "3": "scheduled_rule.groovy",
    "4": "groovy_class.groovy",
    "5": "jar_class.groovy",
    "6": "binary_rule.groovy",
    "7": "job_rule.groovy",
    "8": "file_rule.groovy",
    "9": "process_rule.groovy",
    "10": "sftp_rule.groovy",
    "11": "mqtt_rule.groovy",
    "12": "udp_rule.groovy",
    "13": "tcp_rule.groovy",
    "14": "email_rule.groovy",
    "15": "micro_api_rule.groovy",
};

let docLayout = null;
let mqttTimer = null;

$(".barMenu").removeClass('active');
$(".menuEditor").addClass('active');
$(".mainwindow").css('min-height', $(window).height() - 90 + 'px');


$(document).ready(function () {
    loadContextList()
    $(".contextBody").css('height', $(window).height() - 350)
    $(".elasticBody").css('height', $(window).height() - 250)

    $('#helpModal .modal-dialog').draggable({
        handle: "#helpModal .modal-header"
    });

    $('#pfTag').val(Cookies.get('pfTag') ? Cookies.get('pfTag') : '')

    if (USER_OBJ.globalAccess) {
        $("#pType").append('<option value="GLOBAL">Global</option>')
    }

    if (USER_OBJ.systemAccess) {
        $("#pType").append('<option value="SYSTEM">System</option>')
    }

    loadProcessRulesListAggs()



    mqttConnect();

    if (Cookies.get('fatal')) {
        $(".fatal").prop("checked", Cookies.get('fatal') === 'true' ? true : false)
    }
    if (Cookies.get('error')) {
        $(".error").prop("checked", Cookies.get('error') === 'true' ? true : false)
    }
    if (Cookies.get('warn')) {
        $(".warn").prop("checked", Cookies.get('warn') === 'true' ? true : false)
    }
    if (Cookies.get('info')) {
        $(".info").prop("checked", Cookies.get('info') === 'true' ? true : false)
    }
    if (Cookies.get('debug')) {
        $(".debug").prop("checked", Cookies.get('debug') === 'true' ? true : false)
    }
    if (Cookies.get('trace')) {
        $(".trace").prop("checked", Cookies.get('trace') === 'true' ? true : false)
    }

    document.getElementById('importFile')
        .addEventListener('change', getImportFile)

        $(".mainwindow").css('display', 'block');
        docLayout = $('.mainwindow').layout({
            applyDefaultStyles: true,
            north: {
                resizable: true
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

        if (qs('ruletype')) {
            $("#rulesType").val(2);
            loadRules(2);
        } else {
            loadRules(1);
        }

            $(".listHeight").css('height', $(".leftSide").height() - 150)
            loadDomainCode();
            $(".loaderBlock").remove();
            $(".classFolder").css('height', $(".rightSide").height() - 150)

            loadCodeType();


    $(window).resize(function () {
        $(".mainwindow").css('min-height', $(window).height() - 90 + 'px');
        $('#codeEditor').height($(window).height() - 170 + 'px');
    });
    
});

function mqttListen() {

    if (MQTT_STATUS) {

        console.log(new Date + ' | MQTT Started to Subscribe');

        mqttSubscribe("/" + USER_OBJ.domainKey + "/log/#", 0);

        mqttSubscribe("/global/#", 0);

        if (ADMIN_ACCESS) {
            mqttSubscribe("/system/#", 0);
        }


        mqtt_client.onMessageArrived = function (message) {


            let parsedData = JSON.parse(message.payloadString);
            let topicName = message.destinationName;


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
                mqttMicroRule(topicName, parsedData);

            } else {
                switch (CURRENT_TYPE) {
                    case 0:
                        mqttDomainRule(topicName, parsedData);
                        break;
                    case 1:
                        mqttMesageRule(topicName, parsedData);
                        break;
                    case 2:
                        mqttNamedRule(topicName, parsedData);
                        break;
                    case 3:
                        mqttScheduleRule(topicName, parsedData);
                        break;
                    case 6:
                        mqttBinaryRule(topicName, parsedData);
                        break;
                    case 7:
                        mqttJobRule(topicName, parsedData);
                        break;
                    case 8:
                        mqttFileRule(topicName, parsedData);
                        break;
                    case 9:
                        mqttProcessRule(topicName, parsedData);
                        break;
                    case 10:
                        mqttSftpRule(topicName, parsedData);
                        break;
                    case 11:
                        mqttMqttRule(topicName, parsedData);
                        break;
                    case 12:
                        mqttUdpRule(topicName, parsedData);
                        break;
                    case 13:
                        mqttTcpRule(topicName, parsedData);
                        break;
                    case 14:
                        mqttEmailRule(topicName, parsedData);
                        break;
                    case 15:
                        mqttMicroRule(topicName, parsedData);
                        break;
                }
            }


        };

    }
}

function mqttDomainRule(topicName, parsedData) {
    let nodeClass = new Date().getTime();
    let color = 'default';


    if (topicName.includes("/log/drule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            let level = parsedData.level;



            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }
                let rName = topicName.split("/")[3];
                $(".loggerHtml").append("<div title='Domain Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Domain Rule: " + rName + "]</span>" +
                    fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';


    if (topicName.includes("/log/mrule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='Message Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Message Rule: " + rName + "]</span>" +
                    fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';


    if (topicName.includes("/log/nrule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='Named Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Named Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';


    if (topicName.includes("/log/frule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='File Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[File Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';


    if (topicName.includes("/log/srule")) {

        if (parsedData.data !== '__ALL_DONE__') {

            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='Schedule Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Schedule Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';


    if (topicName.includes("/log/brule")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='Binary Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Binary Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';

    console.log("JOB =>", topicName)

    if (topicName.includes("/proc/")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);
                $(".loggerHtml").append("<div title='Process Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Process Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';

    console.log("JOB =>", topicName)

    if (topicName.includes("/log/job")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='Job Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Job Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';

    console.log("SFTP =>", topicName)
    topicName = topicName.toLowerCase();

    if (topicName.includes("/log/input/sftp")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='SFTP Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[SFTP Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';

    console.log("MQTT =>", topicName)
    topicName = topicName.toLowerCase();

    if (topicName.includes("/log/input/mqtt")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='MQTT Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[MQTT Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';

    console.log("UDP =>", topicName)
    topicName = topicName.toLowerCase();
    if (topicName.includes("/log/input/udp")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='UDP Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[UDP Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';

    console.log("TCP =>", topicName)
    topicName = topicName.toLowerCase();

    if (topicName.includes("/log/input/tcp")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='TCP Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[UDP Rule: " + rName + "]</span>" + fields +
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
    let nodeClass = new Date().getTime();
    let color = 'default';

    console.log("EMAIL =>", topicName)
    topicName = topicName.toLowerCase();

    if (topicName.includes("/log/input/email")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='Email Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Email Rule: " + rName + "]</span>" + fields +
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
function mqttMicroRule(topicName, parsedData) {
    let nodeClass = new Date().getTime();
    let color = 'default';

    console.log("MICRO =>", topicName)
    topicName = topicName.toLowerCase();

    if (topicName.includes("/log/svc")) {

        if (parsedData.data !== '__ALL_DONE__') {
            let level = parsedData.level;

            if ($("." + level.toLowerCase()).is(":checked")) {

                let fields = '';

                if ($(".node").is(":checked")) {
                    fields += ' [' + parsedData.node + '] '
                }
                if ($(".session").is(":checked")) {
                    fields += ' [' + parsedData.session + '] '
                }

                let rName = getLastItem(topicName);

                $(".loggerHtml").append("<div title='Micro Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #9e9e9e8a'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                    "<span>[Micro API Rule: " + rName + "]</span>" + fields +
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
        if (ADMIN_ACCESS) {
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

    // let status = $("input[name='debugStatus']:checked").val();
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
    $(".pOption").css('display', 'none')
    $(".detailsBlock").css('display', 'block')

    switch (id) {
        case 1:
            loadMessageRulesList();
            break;
        case 2:
            loadNamedRulesList();
            break;
        case 3:
            loadScheduleRulesList();
            break;
        case 6:
            loadBinaryRulesList();
            break;
        case 7:
            loadJobRulesList();
            break;
        case 8:
            loadFileRulesList();
            break;
        case 9:
            loadProcessRulesList();
            $(".pOption").css('display', 'block')
            break;
        case 10:
            loadSftpRulesList();
            break;
        case 11:
            loadMqttRulesList();
            break;
        case 12:
            loadUdpRulesList();
            break;
        case 13:
            loadTcpRulesList();
            break;
        case 14:
            loadEmailRulesList();
            break;
        case 15:
            loadMicroRulesList();
            break;
    }
}

function searchFunction() {
    // Declare variables
    let input, filter, ul, li, a, i;
    input = $.trim($('#searchInput').val());
    filter = input.toUpperCase();
    li = $(".rulesListli");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        let str = li[i].innerText;
        if (str.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "block";
        } else {
            li[i].style.display = "none";
        }
    }
}

function loadMessageRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');
    listMessageRules(rules_page_size, rules_direction, rules_id, function (status, data) {
        if (status) {
            message_rules_list = data;
        }
    })

    listMessageSpec(rules_page_size, null, null, function (status, data) {
        $(".rulesList").html('<li class="" onclick="loadMessageRulesList()" title="click here to reload"  style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Message Rules</b> <span class="loaderSpin"></span></li>');

        $('[data-toggle="tooltip"]').tooltip()


        if (status && data.length > 0) {
            message_spec_list = data;

            for (let i = 0; i < data.length; i++) {

                let flag = true;

                for (let j = 0; j < message_rules_list.length; j++) {

                    if (data[i].id === message_rules_list[j].messageId) {
                        data[i].ruleObj = message_rules_list[j];
                        flag = false;
                    }
                }

                if (flag) {
                    let obj = { domainKey: null, lang: "GROOVY", code: "", messageId: data[i].id, messageName: '' };
                    message_rules_list.push(obj);
                }

                let str = '<li  class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(' + data[i].id + ',1)">' +
                    '<img src="images/file.png" /> <b>' + data[i].id + '</b>  <br> <small>' + data[i].name + '</small></li>';
                $(".rulesList").append(str);

            }

            if (lbk) lbk(true)
        } else {
            message_spec_list = []
            if (lbk) lbk(false)
            errorMsg('No Messages Defined so far!')
        }
        $(".loaderSpin").html('');

        
    })

}


function loadNamedRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');
    listNamedRules(rules_page_size, null, null, function (status, data) {
        $(".rulesList").html('<li class="" onclick="loadNamedRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Named Rules</b> <span class="loaderSpin"></span></li>');


        $('[data-toggle="tooltip"]').tooltip()

        if (status) {
            named_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].name + '" data-id="' + data[i].name + '" onclick="loadTabbar(\'' + data[i].name + '\',2)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            named_rules_list = []
            errorMsg('No Named Rules Found!')
        }

        if (lbk) lbk(true)
        $(".loaderSpin").html('');

    })
}


function loadBinaryRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');
    listBinaryRules(rules_page_size, null, null, function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadBinaryRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Binary Rules</b> <span class="loaderSpin"></span></li>');



        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            binary_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].type + '" data-id="' + data[i].type + '" onclick="loadTabbar(\'' + data[i].type + '\',6)">' +
                    '<img src="images/file.png" /> <b>' + data[i].type + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            binary_rules_list = []
            errorMsg('No Binary Rules Found!')
        }
        if(lbk) lbk(true)
        $(".loaderSpin").html('');

    })
}


function loadFileRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');
    listFileRules(rules_page_size, null, null, function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadBinaryRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> File Rules</b> <span class="loaderSpin"></span></li>');


        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            file_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].type + '" data-id="' + data[i].type + '" onclick="loadTabbar(\'' + data[i].type + '\',8)">' +
                    '<img src="images/file.png" /> <b>' + data[i].type + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            file_rules_list = []
            errorMsg('No File Rules Found!')
        }
        if(lbk) lbk(true)
        $(".loaderSpin").html('');

    })
}

function loadProcessRulesListAggs() {

    let query = {
        query: {
            bool: {
                must: [{ match: { domainKey: DOMAIN_KEY } }],
                should: []
            }
        },
        from: 0,
        size: 9999,
        aggs: {
            group: {
                terms: {
                    field: 'group',
                    size: 1000
                }
            }
        }
    }
    let pType = 'PROCESS';

    if ($("#pType").val() === 'GLOBAL') {
        pType = 'GLOBAL_PROCESS';
    }
    if ($("#pType").val() === 'SYSTEM') {
        pType = 'SYSTEM_PROCESS';
    }
    listProcessRules(query, pType, function (status, data) {
        if (status) {

            let resultData = QueryFormatter(data);

            $("#pfGroup").html('<option value="">All Groups</option>')
            let aggs = resultData.aggregations.group.buckets;

            for (let i = 0; i < aggs.length; i++) {
                if (aggs[i].key) {
                    $("#pfGroup").append('<option value="' + aggs[i].key + '">' + aggs[i].key + ' (' + aggs[i].doc_count + ')</option>')
                }

            }

            $("#pfGroup").val(Cookies.get('pfGroup'))

            $("#pfGroup").select2()
        }
    });
}

function loadProcessRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    let query = {
        query: {
            bool: {
                must: [{ match: { domainKey: DOMAIN_KEY } }],
                should: []
            }
        },
        from: 0,
        size: 9999,
        aggs: {
            group: {
                terms: {
                    field: 'group',
                    size: 1000
                }
            }
        }
    }
    let pType = 'PROCESS';

    if ($("#pType").val() === 'GLOBAL') {
        pType = 'GLOBAL_PROCESS';
        query['query'] = {}
    }
    if ($("#pType").val() === 'SYSTEM') {
        pType = 'SYSTEM_PROCESS';
        query['query'] = {}
    }
    if ($("#pfGroup").val()) {
        Cookies.set('pfGroup', $('#pfGroup').val())
        query.query['bool']['must'].push({ "match": { "group": $('#pfGroup').val() } });

    } else {
        Cookies.set('pfGroup', '')
    }

    if ($('#pfTag').val()) {
        Cookies.set('pfTag', $('#pfTag').val())
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
    } else {
        Cookies.set('pfTag', '')
    }

    listProcessRules(query, pType, function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadProcessRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Process Rules</b> <span class="loaderSpin"></span></li>');



        $('[data-toggle="tooltip"]').tooltip()

        if (status) {

            let resultData = QueryFormatter(data);
            data = resultData.data.data;
            process_rules_list = data;
           
            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',9)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
            if (lbk) lbk()

        } else {
            process_rules_list =[]
            errorMsg('No Process Rules Found!')
        }
        $(".loaderSpin").html('');

    })
}


function loadJobRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    listJobRules(function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadJobRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Job Rules</b> <span class="loaderSpin"></span></li>');


        $('[data-toggle="tooltip"]').tooltip()

        if (status && data.length > 0) {
            job_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',7)">' +
                    '<img src="images/file.png" /> <b>' + data[i].id + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            job_rules_list = []
            errorMsg('No Job Rules Found!')
        }
        if(lbk) lbk(true)
        $(".loaderSpin").html('');
    })
}

function loadSftpRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    listInputRules("SFTP_INPUT", function (status, data) {
        $(".rulesList").html('<li class="" onclick="loadSftpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> SFTP Rules</b> <span class="loaderSpin"></span></li>');


      
        $('[data-toggle="tooltip"]').tooltip()

        if (status) {

            let resultData = QueryFormatter(data);

            data = resultData.data.data;

            sftp_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',10)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            sftp_rules_list = []
            errorMsg('No SFTP Rules Found!')
        }
        if(lbk) lbk(true)
        $(".loaderSpin").html('');

    })
}
function loadMqttRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    listInputRules("MQTT_INPUT", function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadMqttRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> MQTT Rules</b> <span class="loaderSpin"></span></li>');


     
        $('[data-toggle="tooltip"]').tooltip()

        if (status) {

            let resultData = QueryFormatter(data);

            data = resultData.data.data;

            mqtt_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',11)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            mqtt_rules_list = []
            errorMsg('No MQTT Rules Found!')
        }
        if (lbk) lbk(true)
        $(".loaderSpin").html('');

    })
}
function loadUdpRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    listInputRules("UDP_INPUT", function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadUdpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> UDP Rules</b> <span class="loaderSpin"></span></li>');


        
        $('[data-toggle="tooltip"]').tooltip()

        if (status) {

            let resultData = QueryFormatter(data);

            data = resultData.data.data;
            udp_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',12)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            udp_rules_list = []
            errorMsg('No UDP Rules Found!')
        }
        if (lbk) lbk(true)
        $(".loaderSpin").html('');

    })
}
function loadTcpRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    listInputRules("TCP_INPUT", function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadTcpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> TCP Rules</b> <span class="loaderSpin"></span></li>');


        $('[data-toggle="tooltip"]').tooltip()

        if (status) {

            let resultData = QueryFormatter(data);

            data = resultData.data.data;
            tcp_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',13)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            tcp_rules_list = []
            errorMsg('No TCP Rules Found!')
        }
        if (lbk) lbk(true)
        $(".loaderSpin").html('');

    })
}
function loadEmailRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    listInputRules("EMAIL_INPUT", function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadTcpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> EMAIL Rules</b> <span class="loaderSpin"></span></li>');


        $('[data-toggle="tooltip"]').tooltip()

        if (status) {

            let resultData = QueryFormatter(data);

            data = resultData.data.data;
            email_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(\'' + data[i].id + '\',14)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            email_rules_list = []
            errorMsg('No EMAIL Rules Found!')
        }
        if (lbk) lbk(true)
        $(".loaderSpin").html('');

    })
}

function loadMicroRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    listInputRules("MICRO_API", function (status, data) {

        $(".rulesList").html('<li class="" onclick="loadTcpRulesList()" title="click here to reload" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Micro API Rules</b> <span class="loaderSpin"></span></li>');


        
        $('[data-toggle="tooltip"]').tooltip()

        if (status) {

            let resultData = QueryFormatter(data);

            data = resultData.data.data;
            micro_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].name + '" data-id="' + data[i].name + '" onclick="loadTabbar(\'' + data[i].name + '\',15)">' +
                    '<img src="images/file.png" /> <b>' + data[i].name + '</b></li>';
                $(".rulesList").append(str);

            }
        } else {
            micro_rules_list = []
            errorMsg('No Micro API Rules Found!')
        }
        if (lbk) lbk(true)
        $(".loaderSpin").html('');
    })
}

function loadScheduleRulesList(lbk) {
    $(".loaderSpin").html('<i class="fa fa-spinner fa-spin"></i>');

    listScheduleRules(rules_page_size, null, null, function (status, data) {

        $(".rulesList").html('<li class="" title="click here to reload" onclick="loadScheduleRulesList()" style="color:#333; padding: 5px;cursor:pointer;border-bottom: 1px dotted #ccc;">' +
            '<img src="images/folder.png" /> <b> Schedule Rules</b> <span class="loaderSpin"></span></li>');


        $('[data-toggle="tooltip"]').tooltip()


        if (status && data.length > 0) {
            schedule_rules_list = data;

            for (let i = 0; i < data.length; i++) {

                let str = '<li class="rulesListli rule_' + data[i].id + '" data-id="' + data[i].id + '" onclick="loadTabbar(' + data[i].id + ',3)">' +
                    '<img src="images/file.png" /> <b>' + data[i].id + '</b><br><small>' + data[i].pattern + '</small></li>';
                $(".rulesList").append(str);


            }
        } else {
            schedule_rules_list = []
            errorMsg('No Schedule Messages Found!')
        }
        if (lbk) lbk(true)
        $(".loaderSpin").html('');

    })

}

function loadHelpTab() {
    $(".helpTab").remove();
    let str = '<li role="presentation" class="helpTab tabbar helpTabBar active" >' +
        '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadHelpTab()><i class="fa fa-question-circle"></i> Help' +
        '<span style="display: inline-block;margin-left: 20px;cursor: pointer;z-index:1" onclick="deleteHelpTab(event)" title="close"><i class="fa fa-close"></i></span></a>' +
        '</li>'

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
    $(".microTab").removeClass('active');

    $(".editorBar").append(str);
    loadHelpDetails();

}

function deleteHelpTab(event) {
    event.stopPropagation()
    $(".helpTab").remove();
    $(".domainTab").addClass('active')
    loadDomainRule()
}

function loadHelpDetails() {
    $("#editorContent").html('<div id="codeEditor" style="overflow: hidden;background-color: #fff"></div>');

    $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');

    let str = `
<div class="row mt-2">
    <div class="col-md-3 ">
            <h5 class="ml-3">Platform Contexts</h5>
            <div class="contextContent" style="overflow: auto;overflow-x: hidden">
                 <ul class="cBody" style="padding-left: 10px">
    
                </ul>
            </div>
          
    </div>    
    <div class="col-md-9">
        <div class="row helpContent" >
            <div class="col-md-12 mt-2">
                <form autoComplete="off">
                    <input type="text" class="form-control" placeholder="Search contexts by name"
                               onKeyUp="renderContext(this.value)"/>
                 </form>
            </div>
            <div class="col-md-12">
                <div class="contextBody mt-2" style="overflow: auto"></div>
            </div>
        </div>
    
         
    </div>    
</div>
    `

    $("#codeEditor").html(str);
    $(".contextBody").css('height', $("#codeEditor").height() - 80)
    $(".contextContent").css('height', $("#codeEditor").height() - 50)

    renderContext();
}

function loadTabbar(id, type) {
    toggleHeading(id)
    $(".deleteBtn").css('display', 'none');
    if (_.indexOf(tabbar_list, id) < 0) {
        
        let name=""
        const $editorBar = $(".editorBar")
        switch (type) { // navbar

            case 1:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="messageTab tabbar messageTab_' + id + '" >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadMessageRule(' + id + ')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(' + id + ',1,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 2:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="namedTab tabbar namedTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadNamedRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',2,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 3:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="scheduleTab tabbar scheduleTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadScheduleRule(' + id + ')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(' + id + ',3,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 6:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="binaryTab tabbar binaryTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadBinaryRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',6,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 7:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="jobTab tabbar jobTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadJobRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',7,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 8:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="fileTab tabbar fileTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadFileRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',8,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 9:
                for (const iterator of process_rules_list) {
                    if (id === iterator.id) {
                        name = iterator.name;
                        break
                    }
                }
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="processTab tabbar processTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadProcessRule(\'' + id + '\')>' + name + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',9,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 10:
                for (const iterator of sftp_rules_list) {
                    if (id === iterator.id) {
                        name = iterator.name;
                        break
                    }
                }
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="sftpTab tabbar sftpTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadSftpRule(\'' + id + '\')>' + name + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',10,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                $(".sftpTab_" + id).addClass('active');
                break;

            case 11:
                for (const iterator of mqtt_rules_list) {
                    if (id === iterator.id) {
                        name = iterator.name;
                        break
                    }
                }
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="mqttTab tabbar mqttTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadMqttRule(\'' + id + '\')>' + name + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',11,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')

                break;

            case 12:
                for (const iterator of udp_rules_list) {
                    if (id === iterator.id) {
                        name = iterator.name;
                        break
                    }
                }
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="udpTab tabbar udpTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadUdpRule(\'' + id + '\')>' + name + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',12,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 13:
                for (const iterator of tcp_rules_list) {
                    if (id === iterator.id) {
                        name = iterator.name;
                        break
                    }
                }
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="tcpTab tabbar tcpTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadTcpRule(\'' + id + '\')>' + name + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',13,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                break;

            case 14:
                for (const iterator of email_rules_list) {
                    if (id === iterator.id) {
                        name = iterator.name;
                        break
                    }
                }
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="emailTab tabbar emailTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadEmailRule(\'' + id + '\')>' + name + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',14,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
               
                break;

            case 15:
                for (const iterator of micro_rules_list) {
                    if (id === iterator.name) {
                        name = iterator.name;
                        break
                    }
                }
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="microTab tabbar microTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadMicroRule(\'' + name + '\')>' + name + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',15,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                
                break;
        }

        tabbar_list.push(id);
    }
    $(".domainTab").removeClass('active')
    $(".editorBar li.tabbar").removeClass('active')
    $(".ruleLanguage").html('GROOVY')

    let obj = {};

    switch (type) {

        case 1:
            loadMessageRule(id);
            $(".messageTab_" + id).addClass('active');
            for (const iterator of message_spec_list) {
                if (id === iterator.id) {
                    obj = iterator;
                    break
                }
            }


            $(".ruleType").html('Message Rule');
            $(".ruleName").html(id + ' - <small style="color:#333;font-weight: normal">' + obj.name + '</small>');
            $(".exportBtn").attr('onclick', 'exportRule(2)')
            $(".messageFields tbody").html("");
            for (let i = 0; i < obj.fields.length; i++) {
                $(".messageFields tbody").append('<tr><td>' + obj.fields[i].name + '</td><td><label class="label label-default">' + obj.fields[i].dataType + '</label></td></tr>')
            }
            $(".simulateBtn").attr('onclick', 'checkSimulateDevices(\'' + id + '\',1)');
            break;

        case 2:
            loadNamedRule(id);
            $(".namedTab_" + id).addClass('active');
            $(".ruleType").html('Named Rule');
            $(".ruleName").html(id);
            $(".exportBtn").attr('onclick', 'exportRule(3)')
            $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',2)');
            break;

        case 3:
            loadScheduleRule(id);
            $(".scheduleTab_" + id).addClass('active');
            $(".ruleType").html('Schedule Rule');
            $(".ruleName").html(id);
            $(".exportBtn").attr('onclick', 'exportRule(4)')
            break;

        case 6:
            loadBinaryRule(id);
            $(".binaryTab_" + id).addClass('active');
            $(".ruleType").html('Binary Rule');
            $(".ruleName").html(id);
            $(".exportBtn").attr('onclick', 'exportRule(6)')
            $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',3)');
            break;

        case 7:
            $(".jobTab_" + id).addClass('active');
            for (const iterator of job_rules_list) {
                if (id === iterator.id) {
                    obj = iterator;
                    break
                }
            }
            loadJobRule(id);
            loadJobDetails(id, obj);

            $(".ruleType").html('Job Rule');
            $(".ruleName").html(obj.type);

            $(".exportBtn").attr('onclick', 'exportRule(7)')

            break;

        case 8:
            for (const iterator of file_rules_list) {
                if (id === iterator.type) {
                    obj = iterator;
                    break
                }
            }
            loadFileRule(id);
            $(".fileTab_" + id).addClass('active');
            $(".ruleType").html('File Rule');
            $(".ruleName").html(id + (obj.rootPath ? '<br><small>Rooth Path: ' + obj.rootPath + '</small>' : ''));

            $(".exportBtn").attr('onclick', 'exportRule(8)')
            $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',4)');

            break;

        case 9:
            $(".processTab_" + id).addClass('active');

            for (const iterator of process_rules_list) {
                if (id === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadProcessRule(id);
            loadProcessDetails(id, obj);
            $(".ruleType").html('Process Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(9)')

            break;

        case 10:
            $(".sftpTab_" + id).addClass('active');

            for (const iterator of sftp_rules_list) {
                if (id === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadSftpRule(id);
            loadSftpDetails(id, obj);

            $(".ruleType").html('SFTP Rule');
            $(".ruleName").html(obj.name);

            $(".exportBtn").attr('onclick', 'exportRule(10)')

            break;

        case 11:
            $(".mqttTab_" + id).addClass('active');

            for (const iterator of mqtt_rules_list) {
                if (id === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadMqttRule(id);
            loadMqttDetails(id, obj);
            $(".ruleType").html('MQTT Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(11)')

            break;

        case 12:
            $(".udpTab_" + id).addClass('active');
            for (const iterator of udp_rules_list) {
                if (id === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadUdpRule(id);
            loadUdpDetails(id, obj);
            rightPanelDetails(".detailsBlock,.inputBlock")
            $(".ruleType").html('UDP Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(12)')

            break;

        case 13:
            $(".tcpTab_" + id).addClass('active');

            for (const iterator of tcp_rules_list) {
                if (id === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadTcpRule(id);
            loadTcpDetails(id, obj);
            $(".ruleType").html('TCP Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(13)')

            break;

        case 14:
            $(".emailTab_" + id).addClass('active');

            for (const iterator of email_rules_list) {
                if (id === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadEmailRule(id);
            loadEmailDetails(id, obj);
            $(".ruleType").html('Email Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(14)');

            break;

        case 15:
            $(".microTab_" + id).addClass('active');

            for (const iterator of micro_rules_list) {
                if (id === iterator.name) {
                    obj = iterator;
                    break
                }
            }

            loadMicroRule(id);
            loadMicroDetails(id, obj);
            $(".ruleType").html('Micro API Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(15)')

            break;
    }
    
    $('[data-toggle="tooltip"]').tooltip()

}

function loadProcessDetails(id, obj) {
    let output = '';
    let input = '';

    for (let k in obj.output) {
        output += '<tr><td>' + k + '</td><td>' + obj.output[k] + '</td></tr>'
    }
    if (obj.input) {
        for (let k in obj.input) {
            input += '<tr><td>' + k + '</td><td>' + obj.input[k] + '</td></tr>'
        }
    }

    $(".pBody").html('<p><strong><br>Process ID <span style="height:12px;width:12px;display:inline-block;background-color: ' + obj.properties.color + '"></span></strong>' +
        '<label style="    width: 100%;">' + id + ' </label>' +
        '<img src="' + obj.properties.logo + '" style="width:48px;height:48px;">' +

        '</p>' +
        '<strong>Output</strong><br>\n' +
        '<table class="table table-bordered table-striped">' +
        // '<thead><tr><th>Keyname</th><th>Datatype</th></tr></thead>' +
        '<tbody>' + output +
        '</tbody></table>\n' +
        (input ? '<strong>Input</strong><br>\n' +
            '<table class="table table-bordered table-striped">' +
            // '<thead><tr><th>Keyname</th><th>Datatype</th></tr></thead>' +
            '<tbody>' + input +
            '</tbody></table>\n' : '') +
        '<p>\n' +
        '<strong>Group</strong><br>\n' +
        '<label>' + (obj.group ? obj.group : '-') + '</label>\n' +
        '</p>\n' +
        '<p>\n' +
        '<strong>Tags</strong><br>\n' +
        '<label>' + (obj.tags ? obj.tags : '-') + '</label>\n' +
        '</p>\n' +
        '<p>\n' +
        '<strong>Description</strong><br>\n' +
        '<label>' + (obj.description ? obj.description : '-') + '</label>\n' +
        '</p>' +
        '<p>\n' +
        '<strong>Updated By</strong><br>\n' +
        '<label>' + (obj.updatedBy ? obj.updatedBy : '-') + '</label>\n' +
        '</p>' +
        '<p>\n' +
        '<strong>Updated Time</strong><br>\n' +
        '<label>' + (obj.updatedTime ? moment(obj.updatedTime).format('MM/DD/YYYY hh:mm a') : '-') + '</label>\n' +
        '</p>' +
        '<p>\n' +
        '<strong>Created By</strong><br>\n' +
        '<label>' + (obj.createdBy ? obj.createdBy : '-') + '</label>\n' +
        '</p>' +
        '<p>\n' +
        '<strong>Created Time</strong><br>\n' +
        '<label>' + (obj.createdTime ? moment(obj.createdTime).format('MM/DD/YYYY hh:mm a') : '-') + '</label>\n' +
        '</p>'
    );
}

function loadSftpDetails(id, obj) {
    $(".inputBlock tbody").html("");

    $(".inputBlock tbody").append('<tr><td>Implementation</td><td>' + (obj.implementation ? obj.implementation : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Instance Type</td><td>' + obj.instanceType + (obj.instances ? '<br>(' + obj.instances + ' instances)' : '') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Start at Reboot</td><td>' + (obj.startAtBoot ? 'Yes' : 'No') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td colspan="1">Instance Action' +
        '<button style="display:none" class="btn btn-xs stBtn btn-primary" onclick="executeInputAction(\'' + id + '\',\'' + 'START' + '\',\'' + 'SFTP' + '\')"><i class="fa fa-play"></i> Start</button>' +
        '<button style="display:none" class="btn btn-xs stpBtn mb-2 btn-danger" onclick="executeInputAction(\'' + id + '\',\'' + 'STOP' + '\',\'' + 'SFTP' + '\')"><i class="fa fa-stop"></i> Stop</button>' +
        '<button style="display:none" class="btn btn-xs resBtn btn-warning" onclick="executeInputAction(\'' + id + '\',\'' + 'RESTART' + '\',\'' + 'SFTP' + '\')"><i class="fa fa-redo"></i> Restart</button>' +
        '</td></tr>')

    let configs = ''
    if (obj.config) {
        for (let i = 0; i < obj.config.length; i++) {
            configs += obj.config[i].name + ':' + obj.config[i].value + "<br>";
        }
    }

    $(".inputBlock tbody").append('<tr><td>Configs</td><td>' + configs + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Properties</td><td>' + (obj.properties ? JSON.stringify(obj.properties) : '') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Remote Host</td><td>' + (obj.remoteHost ? obj.remoteHost : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Port</td><td>' + (obj.remotePort ? obj.remotePort : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Username</td><td>' + (obj.userName ? obj.userName : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Password</td><td>' + (obj.password ? obj.password : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Remote Paths</td><td>' + (obj.remotePaths ? obj.remotePaths.join(",") : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Poll Interval</td><td>' + (obj.pollInterval ? obj.pollInterval : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>List Pattern</td><td>' + (obj.listPattern ? obj.listPattern : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>List Dir. Pattern</td><td>' + (obj.listDirPattern ? obj.listDirPattern : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>key Files Built In</td><td>' + (obj.keyFilesBuiltIn ? 'Yes' : 'No') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Connection TimeOut</td><td>' + (obj.connectTimeOut ? obj.connectTimeOut : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>List Recursive</td><td>' + (obj.listRecursive ? obj.listRecursive : '-') + '</td></tr>')

    getInputRunning('SFTP', id);

}

function loadMqttDetails(id, obj) {
    $(".inputBlock tbody").html("");

    $(".inputBlock tbody").append('<tr><td>Instance Type</td><td>' + obj.instanceType + (obj.instances ? '<br>(' + obj.instances + ' instances)' : '') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Start at Reboot</td><td>' + (obj.startAtBoot ? 'Yes' : 'No') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td colspan="1">Instance Action' +
        '<button style="display:none" class="btn btn-xs stBtn btn-primary" onclick="executeInputAction(\'' + id + '\',\'' + 'START' + '\',\'' + 'MQTT' + '\')"><i class="fa fa-play"></i> Start</button>' +
        '<button style="display:none" class="btn btn-xs stpBtn mb-2 btn-danger" onclick="executeInputAction(\'' + id + '\',\'' + 'STOP' + '\',\'' + 'MQTT' + '\')"><i class="fa fa-stop"></i> Stop</button>' +
        '<button style="display:none" class="btn btn-xs resBtn btn-warning" onclick="executeInputAction(\'' + id + '\',\'' + 'RESTART' + '\',\'' + 'MQTT' + '\')"><i class="fa fa-redo"></i> Restart</button>' +
        '</td></tr>')
    let configs = ''
    if (obj.config) {
        for (let i = 0; i < obj.config.length; i++) {
            configs += obj.config[i].name + ':' + obj.config[i].value + "<br>";
        }
    }

    $(".inputBlock tbody").append('<tr><td>Configs</td><td>' + configs + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Properties</td><td>' + (obj.properties ? JSON.stringify(obj.properties) : '') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Server Urls</td><td>' + (obj.serverUrls ? obj.serverUrls.join(", ") : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Username</td><td>' + (obj.userName ? obj.userName : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Password</td><td style="word-break: break-all;">' + (obj.password ? obj.password : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Client Id</td><td>' + (obj.clientId ? obj.clientId : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Clean Session</td><td>' + (obj.cleanSession ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Connection TimeOut</td><td>' + (obj.connectTimeOut ? obj.connectTimeOut : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Keep Alive Interval</td><td>' + (obj.keepAliveInterval ? obj.keepAliveInterval : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>MQTT Version</td><td>' + (obj.mqttVersion ? obj.mqttVersion : '-') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>SSL</td><td>' + (obj.ssl ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>SSL Store Build In</td><td>' + (obj.sslStoreBuiltIn ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>SSL Skip HostName Verification</td><td>' + (obj.sslSkipHostNameVerification ? 'True' : 'False') + '</td></tr>')


    let subs = ''
    if (obj.subscriptions) {
        for (let i = 0; i < obj.subscriptions.length; i++) {
            subs += "Pattern:" + obj.subscriptions[i].pattern + ', Qos: ' + obj.subscriptions[i].qos + "<br>";
        }
    }

    $(".inputBlock tbody").append('<tr><td>Subscriptions</td><td>' + (obj.subs ? obj.subs : '-') + '</td></tr>')


    getInputRunning('MQTT', id);

}

function loadUdpDetails(id, obj) {
    $(".inputBlock tbody").html("");

    $(".inputBlock tbody").append('<tr><td>Instance Type</td><td>' + obj.instanceType + (obj.instances ? '<br>(' + obj.instances + ' instances)' : '') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Start at Reboot</td><td>' + (obj.startAtBoot ? 'Yes' : 'No') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td colspan="1">Instance Action' +
        '<button style="display:none" class="btn btn-xs stBtn btn-primary" onclick="executeInputAction(\'' + id + '\',\'' + 'START' + '\',\'' + 'UDP' + '\')"><i class="fa fa-play"></i> Start</button>' +
        '<button style="display:none" class="btn btn-xs stpBtn mb-2 btn-danger" onclick="executeInputAction(\'' + id + '\',\'' + 'STOP' + '\',\'' + 'UDP' + '\')"><i class="fa fa-stop"></i> Stop</button>' +
        '<button style="display:none" class="btn btn-xs resBtn btn-warning" onclick="executeInputAction(\'' + id + '\',\'' + 'RESTART' + '\',\'' + 'UDP' + '\')"><i class="fa fa-redo"></i> Restart</button>' +
        '</td></tr>')
    let configs = ''
    if (obj.config) {
        for (let i = 0; i < obj.config.length; i++) {
            configs += obj.config[i].name + ':' + obj.config[i].value + "<br>";
        }
    }

    $(".inputBlock tbody").append('<tr><td>Configs</td><td>' + configs + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Properties</td><td>' + (obj.properties ? JSON.stringify(obj.properties) : '') + '</td></tr>')


    $(".inputBlock tbody").append('<tr><td>Listen Host</td><td>' + (obj.listenHost ? obj.listenHost : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Listen Port</td><td>' + (obj.listenPort ? obj.listenPort : '-') + '</td></tr>')



    $(".inputBlock tbody").append('<tr><td>Receive BufferSize</td><td>' + (obj.receiveBufferSize ? obj.receiveBufferSize : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Send BufferSize</td><td>' + (obj.sendBufferSize ? obj.sendBufferSize : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>So Timeout</td><td>' + (obj.soTimeout ? obj.soTimeout : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>TTL</td><td>' + (obj.timeToLive ? obj.timeToLive : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Traffice Class</td><td>' + (obj.trafficeClass ? obj.trafficeClass : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Reuse Address</td><td>' + (obj.reuseAddress ? 'Yes' : 'No') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Multicast</td><td>' + (obj.multicast ? 'Yes' : 'No') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Multicast Group</td><td>' + (obj.multicastGroup ? obj.multicastGroup : '-') + '</td></tr>')


    getInputRunning('UDP', id);

}

function loadTcpDetails(id, obj) {
    $(".inputBlock tbody").html("");

    $(".inputBlock tbody").append('<tr><td>Instance Type</td><td>' + obj.instanceType + (obj.instances ? '<br>(' + obj.instances + ' instances)' : '') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Start at Reboot</td><td>' + (obj.startAtBoot ? 'Yes' : 'No') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td colspan="1">Instance Action' +
        '<button style="display:none" class="btn btn-xs stBtn btn-primary" onclick="executeInputAction(\'' + id + '\',\'' + 'START' + '\',\'' + 'TCP' + '\')"><i class="fa fa-play"></i> Start</button>' +
        '<button style="display:none" class="btn btn-xs stpBtn mb-2 btn-danger" onclick="executeInputAction(\'' + id + '\',\'' + 'STOP' + '\',\'' + 'TCP' + '\')"><i class="fa fa-stop"></i> Stop</button>' +
        '<button style="display:none" class="btn btn-xs resBtn btn-warning" onclick="executeInputAction(\'' + id + '\',\'' + 'RESTART' + '\',\'' + 'TCP' + '\')"><i class="fa fa-redo"></i> Restart</button>' +
        '</td></tr>')
    let configs = ''
    if (obj.config) {
        for (let i = 0; i < obj.config.length; i++) {
            configs += obj.config[i].name + ':' + obj.config[i].value + "<br>";
        }
    }


    $(".inputBlock tbody").append('<tr><td>Configs</td><td>' + configs + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Properties</td><td>' + (obj.properties ? JSON.stringify(obj.properties) : '') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Listen Host</td><td>' + (obj.listenHost ? obj.listenHost : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Listen Port</td><td>' + (obj.listenPort ? obj.listenPort : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>SSL</td><td>' + (obj.ssl ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>SSL Store Build In</td><td>' + (obj.sslStoreBuiltIn ? 'True' : 'False') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>TLS Version</td><td>' + (obj.tlsVersion ? obj.tlsVersion : '-') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Keep Alive</td><td>' + (obj.keepAlive ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>So Linger On</td><td>' + (obj.soLingerOn ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>So Timeout</td><td>' + (obj.soTimeout ? obj.soTimeout : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>So Linger</td><td>' + (obj.soLinger ? obj.soLinger : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>OOB Line</td><td>' + (obj.oobLine ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Receive BufferSize</td><td>' + (obj.receiveBufferSize ? obj.receiveBufferSize : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Send BufferSize</td><td>' + (obj.sendBufferSize ? obj.sendBufferSize : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>TCP No Delay</td><td>' + (obj.tcpNoDelay ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Traffice Class</td><td>' + (obj.trafficeClass ? obj.trafficeClass : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Reuse Address</td><td>' + (obj.reuseAddress ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Execute</td><td>' + (obj.execute ? obj.execute : '-') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Execute Partial Buffered</td><td>' + (obj.executePartialBuffered ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Fixed BufferSize</td><td>' + (obj.fixedBufferSize ? obj.fixedBufferSize : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Read Timeout</td><td>' + (obj.readTimeout ? obj.readTimeout : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Close OnRead Timeout</td><td>' + (obj.closeOnReadTimeout ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Delimeter</td><td>' + (obj.delimiter ? obj.delimiter : '-') + '</td></tr>')

    getInputRunning('TCP', id);

}

function loadEmailDetails(id, obj) {
    $(".inputBlock tbody").html("");

    $(".inputBlock tbody").append('<tr><td>Instance Type</td><td>' + obj.instanceType + (obj.instances ? '<br>(' + obj.instances + ' instances)' : '') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Start at Reboot</td><td>' + (obj.startAtBoot ? 'Yes' : 'No') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td colspan="1">Instance Action' +
        '<button style="display:none" class="btn btn-xs stBtn btn-primary" onclick="executeInputAction(\'' + id + '\',\'' + 'START' + '\',\'' + 'EMAIL' + '\')"><i class="fa fa-play"></i> Start</button>' +
        '<button style="display:none" class="btn btn-xs stpBtn mb-2 btn-danger" onclick="executeInputAction(\'' + id + '\',\'' + 'STOP' + '\',\'' + 'EMAIL' + '\')"><i class="fa fa-stop"></i> Stop</button>' +
        '<button style="display:none" class="btn btn-xs resBtn btn-warning" onclick="executeInputAction(\'' + id + '\',\'' + 'RESTART' + '\',\'' + 'EMAIL' + '\')"><i class="fa fa-redo"></i> Restart</button>' +
        '</td></tr>')
    let configs = ''
    if (obj.config) {
        for (let i = 0; i < obj.config.length; i++) {
            configs += obj.config[i].name + ' : ' + obj.config[i].value + "<br>";
        }
    }


    $(".inputBlock tbody").append('<tr><td>Configs</td><td>' + configs + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Properties</td><td>' + (obj.properties ? JSON.stringify(obj.properties) : '') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Type</td><td>' + (obj.type ? obj.type : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Secured</td><td>' + (obj.secured ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Implicit</td><td>' + (obj.implicit ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Protocol</td><td>' + (obj.protocol ? obj.protocol : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Remote Host</td><td>' + (obj.remoteHost ? obj.remoteHost : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Remote Port</td><td>' + (obj.remotePort ? obj.remotePort : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Local Port</td><td>' + (obj.localPort ? obj.localPort : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Connect Timeout</td><td>' + (obj.connectTimeout ? obj.connectTimeout : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Read Timeout</td><td>' + (obj.readTimeout ? obj.readTimeout : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Keep Alive</td><td>' + (obj.keepAlive ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>TCP No Delay</td><td>' + (obj.tcpNoDelay ? 'True' : 'False') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Username</td><td>' + (obj.userName ? obj.userName : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Password</td><td style="word-break: break-all;">' + (obj.password ? obj.password : '-') + '</td></tr>')

    //
    $(".inputBlock tbody").append('<tr><td>Subject Patterns</td><td>' + (obj.subjectPatterns ? obj.subjectPatterns.join(",") : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Allowed Content <br>Types</td><td>' + (obj.allowedContentTypes ? obj.allowedContentTypes.join(",") : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Allowed Attachment<br> File Extensions</td><td>' + (obj.allowedAttachmentFileExtensions ? obj.allowedContentTypes.join(",") : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>Process Only <br>Attachments</td><td>' + (obj.processOnlyAttachments ? 'True' : 'False') + '</td></tr>')

    let folders = '<b>Folders</b><table class="table table-bordered">';
    if (obj.folders) {
        for (let i = 0; i < obj.folders.length; i++) {
            folders += '<tr>' +
                '<td>' +
                'Name:<br>' +
                'Mark MessageAfter Processing:<br>' +
                'Proccess OnlyFlags:<br>' +
                'To MovedFolder:<br>' +
                '</td>' +
                '<td>' +
                obj.folders[i].name + "<br>" +
                obj.folders[i].markMessageAfterProcessing + "<br>" +
                obj.folders[i].proccessOnlyFlags + "<br>" +
                obj.folders[i].toMovedFolder + "<br>" +
                '</td>' +
                '</tr>'
        }
    }
    folders += '</table>'

    $(".inputBlock tbody").append('<tr><td colspan="2" style="overflow:scroll;word-break: unset;overflow-y: hidden"><div>' + folders + '</div></td></tr>')

    getInputRunning('EMAIL', id);

}

function loadMicroDetails(id, obj) {
    $(".inputBlock tbody").html("");
    $(".inputBlock tbody").append('<tr><td>Properties</td><td>' + (obj.properties ? JSON.stringify(obj.properties) : '') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Auth Type</td><td>' + (obj.authType ? obj.authType : '-') + '</td></tr>')
    $(".inputBlock tbody").append('<tr><td>API Key</td><td>' + (obj.apiKey ? obj.apiKey : '-') + '</td></tr>')

    $(".inputBlock tbody").append('<tr><td>Method</td><td>' + (obj.allowedMethods ? obj.allowedMethods.split(",") : '-') + '</td></tr>')

    let str = '<div class="row mt-2">' +
        '<div class="col-md-8"><label>Method Name</label></div>' +
        '<div class="col-md-4"><label>Action</label></div>';

    for (let i = 0; i < obj.methods.length; i++) {
        str += '<div class="col-md-8 mb-1"><span>' + obj.methods[i].name + '</span></div>' +
            '<div class="col-md-4 mb-1"><button class="btn btn-default btn-xs" onclick="openAPIModal(\'' + obj.methods[i].name + '\')"><i class="fa fa-play"></i></button></div>'
    }
    str += '</div>'


    $(".inputBlock tbody").append('<tr><td colspan="2"><button class="btn btn-warning btn-block btn-sm mt-2" onclick="openAPIModal()">Simulate API</button>' +
        str + '</td></tr>')

}



function getInputRunning(type, id) {

    id = id ? id : CURRENT_ID;

    $(".iCount").html(0);
    inputActions(type, id, 'COUNT', function (status, data) {
        if (status) {
            $(".iCount").html(data.total);
            if (data.total > 0) {
                $(".stBtn").css('display', 'none')
                $(".stpBtn").css('display', 'block')
                $(".resBtn").css('display', 'block')
            } else {
                $(".stBtn").css('display', 'block')
                $(".stpBtn").css('display', 'none')
                $(".resBtn").css('display', 'none')
            }
        }
    })
}

function executeInputAction(id, action, type) {

    inputActions(type, id, action, function (status, data) {
        if (status) {
            successMsg('Successfully executed')

            switch (type) {
                case "SFTP":
                    loadSftpRulesList();
                    getInputRunning('SFTP', id);
                    break;
                case "MQTT":
                    loadMqttRulesList();
                    getInputRunning('MQTT', id);
                    break;
                case "UDP":
                    loadUdpRulesList();
                    getInputRunning('UDP', id);
                    break;
                case "TCP":
                    loadTcpRulesList();
                    getInputRunning('TCP', id);
                    break;
                case "EMAIL":
                    loadEmailRulesList();
                    getInputRunning('EMAIL', id);
                    break;
            }

        } else {
            errorMsg("Error in executing action")
        }
    })
}


function loadJobDetails(id, obj) {
    $(".jobFields tbody").html("");
    if (obj.systemJob)
        $(".jobFields tbody").append('<tr><td>System Job</td><td>Yes</td></tr>')

    $(".jobFields tbody").append('<tr><td>Job Type</td><td>' + obj.jobType + (obj.instances ? '<br>(' + obj.instances + ' instances)' : '') + '</td></tr>')
    $(".jobFields tbody").append('<tr><td>Start on Reboot</td><td>' + (obj.startOnBoot ? 'Yes' : 'No') + '</td></tr>')
    $(".jobFields tbody").append('<tr><td>Restart on Change</td><td>' + (obj.resartOnChange ? 'Yes' : 'No') + '</td></tr>')
    $(".jobFields tbody").append('<tr><td>Job State</td>' +
        '<td>' +
        '<label><input type="radio" name="jobState" value="ENABLED" onclick="updateJobState(\'' + id + '\',\'' + 'ENABLED' + '\')"> Enabled</label><br>' +
        '<label><input type="radio" name="jobState" value="DISABLED" onclick="updateJobState(\'' + id + '\',\'' + 'DISABLED' + '\')"> Disabled</label>' +
        '</td></tr>')
    $(".jobFields tbody").append('<tr><td>Job Action</td>' +
        '<td>' +
        ((obj.jobType === 'SCALABLE' || obj.jobType === 'DISTRIBUTED') ?
            '<input class="" style="width: 50px;border:1px solid #ccc;padding: 2px 5px;" type="number" min="1" value="' + (obj.instances ? obj.instances : 1) + '" id="iCount"> ' : '') +
        '<button class="btn btn-xs btn-primary mb-2 mt-1" onclick="executeAction(\'' + id + '\',\'' + 'start' + '\')"><i class="fa fa-play"></i> Start</button>' +
        '<button class="btn btn-xs btn-danger" onclick="executeAction(\'' + id + '\',\'' + 'stop' + '\')"><i class="fa fa-stop"></i> Stop <span class="iCount">0</span> Instances</button>' +
        '</td></tr>')
    $('input[name="jobState"][value="' + obj.jobState + '"]').prop('checked', true);

    loadRunningCount(id);

}

function updateJobState(id, state) {

    setJobRuleState(id, state, function (status, data) {
        if (status) {
            successMsg('Successfully update the job state')
            loadJobRulesList();
        } else {
            errorMsg("Error in updating job state")
        }
    })
}

function loadRunningCount(id) {

    id = id ? id : CURRENT_ID;

    $(".iCount").html(0);
    getJobRunningList(id, function (status, data) {
        if (status) {
            $(".iCount").html(data.length);
        }
    })
}

function executeAction(id, executeAction) {

    let count = 0;

    if ($("#iCount").val()) {
        count = Number($("#iCount").val())
    }

    performJobAction(id, executeAction, count, function (status, data) {
        if (status) {
            successMsg('Successfully job executed')
            loadJobRulesList();
            loadRunningCount(id);
        } else {
            errorMsg("Error in executing job action")
        }
    })
}


function deleteTab(id, type, obj, event) {
    if (event) event.stopPropagation()
    var prevmenu = "";;
    var splitValue = "";
    if (typeof (obj) == "undefined") {
        prevmenu = $("." + $(".viewId").val()).prev().attr("class");
    } else {
        prevmenu = $(obj).parent().parent().prev().attr("class");
    }
    if (prevmenu == "domainTab") {
        splitValue = prevmenu
    } else {
        splitValue = prevmenu.split(" ")[2];
    }
    $(".rulesListli").removeClass("rules-list-active");
    switch (type) {
        case 1:
            $(".messageTab_" + id).remove();
            break;
        case 2:
            $(".namedTab_" + id).remove();
            break;
        case 3:
            $(".scheduleTab_" + id).remove();
            break;
        case 6:
            $(".binaryTab_" + id).remove();
            break;
        case 7:
            $(".jobTab_" + id).remove();
            break;
        case 8:
            $(".fileTab_" + id).remove();
            break;
        case 9:
            $(".processTab_" + id).remove();
            break;
        case 10:
            $(".sftpTab_" + id).remove();
            break;
        case 11:
            $(".mqttTab_" + id).remove();
            break;
        case 12:
            $(".udpTab_" + id).remove();
            break;
        case 13:
            $(".tcpTab_" + id).remove();
            break;
        case 14:
            $(".emailTab_" + id).remove();
            break;
        case 15:
            $(".microTab_" + id).remove();
            break;
    }

    let temp = [];

    for (const element of tabbar_list) {
        if (id !== element) {
            temp.push(element)
        }
    }

    tabbar_list = temp;
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
        $(".microTab").removeClass('active')
        $(".domainTab").removeClass('active')
        $("." + splitValue).addClass('active')
        $("." + splitValue).children("a").trigger("click");
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
    for (let i = 0; i < DEFAULT_FIELDS.length; i++) {
        $(".defaultFields tbody").append('<tr><td>' + DEFAULT_FIELDS[i].name + '</td><td><label class="label label-default">' + DEFAULT_FIELDS[i].dataType + '</label></td></tr>')
    }
}

function returnObj(id, type) {
    switch (type) {
        case 1:
            for (let i = 0; i < message_rules_list.length; i++) {
                if (id === message_rules_list[i].messageId) {
                    return message_rules_list[i];
                }
            }
            break;
        case 2:
            for (let i = 0; i < named_rules_list.length; i++) {
                if (id === named_rules_list[i].name) {
                    return named_rules_list[i];
                }
            }
            break;
        case 3:
            for (let i = 0; i < schedule_rules_list.length; i++) {
                if (id === schedule_rules_list[i].id) {
                    return schedule_rules_list[i];
                }
            }
            break;

        case 6:
            for (let i = 0; i < binary_rules_list.length; i++) {
                if (id === binary_rules_list[i].type) {
                    return binary_rules_list[i];
                }
            }
            break;
        case 7:
            for (let i = 0; i < job_rules_list.length; i++) {
                if (id === job_rules_list[i].id) {
                    return job_rules_list[i];
                }
            }
            break;
        case 8:
            for (let i = 0; i < file_rules_list.length; i++) {
                if (id === file_rules_list[i].type) {
                    return file_rules_list[i];
                }
            }
            break;
        case 9:
            for (let i = 0; i < process_rules_list.length; i++) {
                if (id === process_rules_list[i].id) {
                    return process_rules_list[i];
                }
            }
            break;
        case 10:
            for (let i = 0; i < sftp_rules_list.length; i++) {
                if (id === sftp_rules_list[i].id) {
                    return sftp_rules_list[i];
                }
            }
            break;
        case 11:
            for (let i = 0; i < mqtt_rules_list.length; i++) {
                if (id === mqtt_rules_list[i].id) {
                    return mqtt_rules_list[i];
                }
            }
            break;
        case 12:
            for (let i = 0; i < udp_rules_list.length; i++) {
                if (id === udp_rules_list[i].id) {
                    return udp_rules_list[i];
                }
            }
            break;
        case 13:
            for (let i = 0; i < tcp_rules_list.length; i++) {
                if (id === tcp_rules_list[i].id) {
                    return tcp_rules_list[i];
                }
            }
            break;
        case 14:
            for (let i = 0; i < email_rules_list.length; i++) {
                if (id === email_rules_list[i].id) {
                    return email_rules_list[i];
                }
            }
            break;
        case 15:
            for (let i = 0; i < micro_rules_list.length; i++) {
                if (id === micro_rules_list[i].name) {
                    return micro_rules_list[i];
                }
            }
            break;
    }

}

function reloadRules() {
    $(".btnRefresh").html('<i class="fa fa-redo fa-spin"></i>');
    loadRules($("#rulesType").val());
    setTimeout(function () {
        $(".btnRefresh").html('<i class="fa fa-redo"></i>');
    }, 1000)
}


function loadDomainRule() {

    // mqttCancelSubscribe();

    $(".simulateBtn").css('display', 'none');
    $(".rulesListli").removeClass("rules-list-active");
    $("#editorContent").html('<div id="codeEditor"></div>');
    $("#codeEditor").html('');
    loadEditor(CHANGED_DEFAULT_TEXT ? CHANGED_DEFAULT_TEXT : domain_rule_obj.code, 'domainTab');
    CURRENT_ID = null;
    CURRENT_TYPE = 0;

    $(".ruleName").html('Domain Rule')
    $(".ruleType").html('Domain Rule')
    $(".ruleLanguage").html('GROOVY')

    $("#exportMsg").attr("onclick","exportRule(1)")
    exportRule(1);

    $(".detailsBlock").css('display', 'block');
    $(".inputBlock").css('display', 'none');
    $(".messageFields").css('display', 'none');
    $(".jobFields").css('display', 'none');
    $(".defaultFields").css('display', 'none');
    $(".deleteBtn").css('display', 'none');

}

function loadMessageRule(id) {
    $(".simulateBtn").css('display', 'block');
    // mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    const data = returnObj(id, 1);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'messageTab_' + id);
    CURRENT_ID = id;
    CURRENT_TYPE = 1;
    $("#exportMsg").attr("onclick", "exportRule(2)")

    exportRule(2)

    let obj = {};
    for (let i = 0; i < message_spec_list.length; i++) {
        if (id === message_spec_list[i].id) {
            obj = message_spec_list[i];
        }
    }
    $(".ruleType").html('Message Rule');
    $(".ruleName").html(obj.id + ' - <small style="color:#333;font-weight: normal">' + obj.name + '</small>');

    $(".deleteBtn").css('display', 'block');

    toggleHeading(id)


    $(".messageFields tbody").html("");
    for (let i = 0; i < obj.fields.length; i++) {
        $(".messageFields tbody").append('<tr><td>' + obj.fields[i].name + '</td><td><label class="label label-default">' + obj.fields[i].dataType + '</label></td></tr>')
    }


    $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',1)');
    rightPanelDetails(".detailsBlock,.messageFields,.defaultFields")

}

function loadNamedRule(id) {
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 2);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'namedTab_' + id);
    CURRENT_ID = id;
    CURRENT_TYPE = 2;
    $("#exportMsg").attr("onclick", "exportRule(3)")

    exportRule(3)

    let obj = {};
    for (let i = 0; i < named_rules_list.length; i++) {
        if (id === named_rules_list[i].name) {
            obj = named_rules_list[i];
        }
    }
    $(".ruleType").html('Named Rule');
    $(".ruleName").html(obj.name);

  
    $(".deleteBtn").css('display', 'block');

    $(".simulateBtn").css('display', 'block');
    $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',2)');
    toggleHeading(id)
    rightPanelDetails(".detailsBlock")
}


function loadBinaryRule(id) {
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 6);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'binaryTab_' + id);
    CURRENT_ID = id;
    CURRENT_TYPE = 6;
    $("#exportMsg").attr("onclick", "exportRule(6)")

    exportRule(6)

    let obj = {};
    for (let i = 0; i < binary_rules_list.length; i++) {
        if (id === binary_rules_list[i].type) {
            obj = binary_rules_list[i];
        }
    }
    $(".ruleType").html('Binary Rule');
    $(".ruleName").html(obj.type);

    $(".deleteBtn").css('display', 'block');

    $(".simulateBtn").css('display', 'block');
    $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',3)');
    toggleHeading(id)

    rightPanelDetails(".detailsBlock")
}


function loadFileRule(id) {
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 8);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'fileTab_' + id);
    CURRENT_ID = id;
    CURRENT_TYPE = 8;
    $("#exportMsg").attr("onclick", "exportRule(8)")

    exportRule(8)

    let obj = {};
    for (let i = 0; i < file_rules_list.length; i++) {
        if (id === file_rules_list[i].type) {
            obj = file_rules_list[i];
        }
    }
    $(".ruleType").html('File Rule');
    $(".ruleName").html(obj.type);

    $(".deleteBtn").css('display', 'block');

    $(".simulateBtn").css('display', 'block');
    $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',3)');
    toggleHeading(id)

    rightPanelDetails(".detailsBlock")
}

function loadJobRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 7);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'jobTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 7;
    $("#exportMsg").attr("onclick", "exportRule(7)")

    exportRule(7)

    $(".ruleType").html('Job Rule');
    $(".ruleName").html(data.id);

   
    $(".deleteBtn").css('display', 'block');

    loadJobDetails(id, data)
    toggleHeading(id)

    rightPanelDetails(".detailsBlock,.jobFields")
}

function loadSftpRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 10);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'sftpTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 10;
    $("#exportMsg").attr("onclick", "exportRule(10)")

    exportRule(10)

    $(".ruleType").html('SFTP Rule');
    $(".ruleName").html(data.name);

    $(".deleteBtn").css('display', 'block');

    loadSftpDetails(id, data)

    toggleHeading(id)


    rightPanelDetails(".detailsBlock,.inputBlock")

}

function loadMqttRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 11);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'mqttTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 11;
    $("#exportMsg").attr("onclick", "exportRule(11)")

    exportRule(11)

    $(".ruleType").html('MQTT Rule');
    $(".ruleName").html(data.name);

    $(".deleteBtn").css('display', 'block');

    loadMqttDetails(id, data)
    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.inputBlock")

}

function loadUdpRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 12);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'udpTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 12;
    $("#exportMsg").attr("onclick", "exportRule(12)")

    exportRule(12)

    $(".ruleType").html('UDP Rule');
    $(".ruleName").html(data.name);

   
    $(".deleteBtn").css('display', 'block');

    loadUdpDetails(id, data)
    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.inputBlock")

}

function loadTcpRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 13);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'tcpTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 13;
    $("#exportMsg").attr("onclick", "exportRule(13)")

    exportRule(13)

    $(".ruleType").html('TCP Rule');
    $(".ruleName").html(data.name);

   
    $(".deleteBtn").css('display', 'block');

    loadTcpDetails(id, data)
    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.inputBlock")

}

function loadEmailRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 14);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'emailTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 14;
    $("#exportMsg").attr("onclick", "exportRule(14)")

    exportRule(14)

    $(".ruleType").html('EMAIL Rule');
    $(".ruleName").html(data.name);

   
    $(".deleteBtn").css('display', 'block');

    loadEmailDetails(id, data)

    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.inputBlock")

}

function loadMicroRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 15);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'microTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 15;
    $("#exportMsg").attr("onclick", "exportRule(15)")

    exportRule(15)

    $(".ruleType").html('Micro API Rule');
    $(".ruleName").html(data.name);

  
    $(".deleteBtn").css('display', 'block');

    loadMicroDetails(id, data)
    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.inputBlock")

}

function loadProcessRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 9);
    $("#codeEditor").html('');
    loadEditor(data.code ? data.code : '', 'processTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 9;
    $("#exportMsg").attr("onclick", "exportRule(9)")

    exportRule(9)

    $(".ruleType").html('Process Rule');
    $(".ruleName").html(data.id);

   
    $(".deleteBtn").css('display', 'block');

    loadProcessDetails(id, data)

    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.processBlock")

    
}

function loadScheduleRule(id) {
    $(".simulateBtn").css('display', 'none');
    // mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 3);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'scheduleTab_' + id);
    CURRENT_ID = id;
    CURRENT_TYPE = 3;

    let obj = {};
    for (let i = 0; i < schedule_rules_list.length; i++) {
        if (id === schedule_rules_list[i].id) {
            obj = schedule_rules_list[i];
        }
    }
    $(".ruleType").html('Schedule Rule');
    $(".ruleName").html(obj.id);

    $(".deleteBtn").css('display', 'block');
    $("#exportMsg").attr("onclick", "exportRule(4)")


    exportRule(4)
    toggleHeading(id)

    rightPanelDetails(".detailsBlock")
}

let editorLine = {};

async function loadEditor(code, tabid) {
    editorChange = false;

    if (codeEditor) {
        codeEditor.destroy();
    }

    $("#codeEditor").html("");

    codeEditor = ace.edit("codeEditor");


    codeEditor.setTheme("ace/theme/eclipse");
    codeEditor.session.setMode("ace/mode/groovy");
    codeEditor.getSession().setUseWrapMode(true);
    codeEditor.setShowPrintMargin(false);

    let platfromSnippet = loadPlatformSnippet();


    ace.config.loadModule("ace/ext/language_tools", function () {


        codeEditor.setOptions({
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false
        });

        let snippetManager = ace.require("ace/snippets").snippetManager;
        let config = ace.require("ace/config");

        ace.config.loadModule("ace/snippets/groovy", function (m) {
            if (m) {
                m.snippets = platfromSnippet;
                snippetManager.register(m.snippets, m.scope);
            }
        });

    });

    let codeFormat = '';

    if (code) {
        codeEditor.setValue(code);
    } else {
        let currentRuleType = $("." + tabid).data("ruletype");
        await $.get('controllers/rules_code_templates/' + rule_types[currentRuleType], function (data) {
            codeFormat = data;
        });
        codeEditor.setValue(codeFormat);
    }

    codeEditor.clearSelection();

    codeEditor.focus();
    let session = codeEditor.getSession();
    //Get the number of lines
    let count = session.getLength();
    //Go to end of the last line

    if (editorLine[tabid]) {
        codeEditor.gotoLine(editorLine[tabid]['row'], editorLine[tabid]['column']);
    } else {
        codeEditor.gotoLine(count, session.getLine(count - 1).length);
    }


    $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');

    codeEditor.resize();



    codeEditor.on("change", function (obj) {
        editorChange = true;
        $("#context").css('display', 'none')
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

                for (let i = 0; i < message_rules_list.length; i++) {
                    if (CHANGED_ID === message_rules_list[i].messageId) {
                        message_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }
            if (CURRENT_TYPE === 2) {
                for (let i = 0; i < named_rules_list.length; i++) {
                    if (CHANGED_ID === named_rules_list[i].name) {
                        named_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }
            if (CURRENT_TYPE === 3) {
                for (let i = 0; i < schedule_rules_list.length; i++) {
                    if (CHANGED_ID === schedule_rules_list[i].id) {
                        schedule_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 6) {
                for (let i = 0; i < binary_rules_list.length; i++) {
                    if (CHANGED_ID === binary_rules_list[i].type) {
                        binary_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 7) {

                for (let i = 0; i < job_rules_list.length; i++) {
                    if (CHANGED_ID === job_rules_list[i].id) {
                        job_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 8) {

                for (let i = 0; i < file_rules_list.length; i++) {
                    if (CHANGED_ID === file_rules_list[i].type) {
                        file_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 9) {

                for (let i = 0; i < process_rules_list.length; i++) {
                    if (CHANGED_ID === process_rules_list[i].id) {
                        process_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 10) {

                for (let i = 0; i < sftp_rules_list.length; i++) {
                    if (CHANGED_ID === sftp_rules_list[i].id) {
                        sftp_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 11) {

                for (let i = 0; i < mqtt_rules_list.length; i++) {
                    if (CHANGED_ID === mqtt_rules_list[i].id) {
                        mqtt_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 12) {

                for (let i = 0; i < udp_rules_list.length; i++) {
                    if (CHANGED_ID === udp_rules_list[i].id) {
                        udp_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 13) {

                for (let i = 0; i < tcp_rules_list.length; i++) {
                    if (CHANGED_ID === tcp_rules_list[i].id) {
                        tcp_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 14) {

                for (let i = 0; i < email_rules_list.length; i++) {
                    if (CHANGED_ID === email_rules_list[i].id) {
                        email_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }

            if (CURRENT_TYPE === 15) {

                for (let i = 0; i < micro_rules_list.length; i++) {
                    if (CHANGED_ID === micro_rules_list[i].name) {
                        micro_rules_list[i].code = CHANGED_TEXT;
                    }
                }

            }


        }
    });

    codeEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {

            let consoleText = codeEditor.getSession().getValue();
            let obj = {}
            let data = {
                lang: 'GROOVY',
                code: consoleText
            }
            switch (CURRENT_TYPE) {
                case 0:
                    updateDomainRuleCode(data, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            domain_rule_obj = data;
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;

                case 1:
                    data["messageId"] = CURRENT_ID

                    updateMessageRuleCode(data, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadMessageRulesList();
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })

                    break;

                case 2:
                    data["name"] = CURRENT_ID

                    updateNamedRuleCode(data, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadNamedRulesList();
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })

                    break;
                case 3:
                    obj = returnObj(CURRENT_ID, 3);

                    data['id'] = CURRENT_ID,
                    data['pattern'] = obj.pattern
                    updateScheduleRuleCode(data, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadScheduleRulesList();
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 6:
                    data["type"] = CURRENT_ID

                    updateBinaryRuleCode(data, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadBinaryRulesList();
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 7:

                    obj = returnObj(CURRENT_ID, 7);

                    let dataJobObj = {
                        "domainKey": DOMAIN_KEY,
                        "id": CURRENT_ID,
                        "name": "",
                        "jobType": obj.jobType,
                        "jobState": obj.jobState,
                        "jobLanguage": obj.jobLanguage,
                        "code": consoleText,
                        "instances": obj.instances,
                        "startOnBoot": obj.startOnBoot,
                        "systemJob": obj.systemJob,
                        "resartOnChange": obj.resartOnChange,
                    }
                    updateJobRuleCode(dataJobObj, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadJobRulesList();
                            loadJobDetails(CURRENT_ID, obj)
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 8:

                    data["type"] = CURRENT_ID
                    updateFileRuleCode(data, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadFileRulesList();
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;

                case 9:

                    obj = returnObj(CURRENT_ID, 9);
                    obj['code'] = consoleText;

                    delete obj._id;

                    updateProcessRuleCode(obj, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadProcessRulesList();
                            loadProcessDetails(CURRENT_ID, obj)
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 10:

                    obj = returnObj(CURRENT_ID, 10);
                    obj['code'] = consoleText;
                    delete obj._id;

                    updateInputRuleCode('SFTP', obj, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadSftpRulesList();
                            loadSftpDetails(CURRENT_ID, obj)

                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 11:

                    obj = returnObj(CURRENT_ID, 11);
                    obj['code'] = consoleText;
                    delete obj._id;

                    updateInputRuleCode('MQTT', obj, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadMqttRulesList();
                            loadMqttDetails(CURRENT_ID, obj)
                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 12:

                    obj = returnObj(CURRENT_ID, 12);
                    obj['code'] = consoleText;
                    delete obj._id;

                    updateInputRuleCode('UDP', obj, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadUdpRulesList();
                            loadUdpDetails(CURRENT_ID, obj)

                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 13:

                    obj = returnObj(CURRENT_ID, 13);
                    obj['code'] = consoleText;
                    delete obj._id;

                    updateInputRuleCode('TCP', obj, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadTcpRulesList();
                            loadTcpDetails(CURRENT_ID, obj)

                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 14:

                    obj = returnObj(CURRENT_ID, 14);
                    obj['code'] = consoleText;
                    delete obj._id;

                    updateInputRuleCode('EMAIL', obj, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadEmailRulesList();
                            loadEmailDetails(CURRENT_ID, obj)

                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
                case 15:

                    obj = returnObj(CURRENT_ID, 15);

                    let dataMicroObj = {
                        name: obj.name,
                        code: consoleText,
                        authType: obj.authType,
                        apiKey: obj.apiKey ? obj.apiKey : null,
                        props: obj.props,
                    }
                    updateMicroRuleCode(dataMicroObj, function (status, data) {
                        if (status) {
                            successMsg('Successfully saved!');
                            loadMicroRulesList();
                            loadMicroDetails(CURRENT_ID, obj)

                        } else {
                            errorMsg('Error in saving!')
                        }
                    })
                    break;
            }
        }
    });
}


let MSG_FIELD_COUNT = 0;
let CRON_JOB = null;

function openModal(e) {
    let id = e ? e : $("#rulesType").val() * 1
    switch (id) {
        case 1:

            MSG_FIELD_COUNT = 0;

            $("#addMessageRule form")[0].reset();

            $(".msgFieldBody").html("");
            if (LicenseDetails.maxMessageSpecs <= message_spec_list.length) {
                warningMsg('Your plan have ' + LicenseDetails.maxMessageSpecs + ' message rule.')
                return
            } else {
                $("#addMessageRule").modal('show');
            }
            addMessageField();
            break;
        case 2:
            $("#addNamedRule form")[0].reset();
            $("#addNamedRule").modal('show');
            break;
        case 3:

            $("#addScheduleRule form")[0].reset();
            $('#pattren_desc').html("");
            $("#addScheduleRule").modal('show');
            break;
        case 6:
            $("#addBinaryRule form")[0].reset();
            $("#addBinaryRule").modal('show');
            break;
        case 7:

            if (ADMIN_ACCESS) {
                $(".systemTemplate").css('display', 'block')
                $("#job_system").val('1')
            } else {
                $(".systemTemplate").css('display', 'none')
                $("#job_system").val('0')
            }
            $(".jAction").html('Add');
            $("#job_rule").removeAttr('disabled')

            $("#addJobRule form").attr("onsubmit", "addJobRule()");
            $("#addJobRule form")[0].reset();
            $("#addJobRule").modal('show');
            checkJobInstance()
            break;
        case 8:
            $("#addFileRule form")[0].reset();
            $("#addFileRule").modal('show');
            break;
        case 9:
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
                    ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
                    ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                    ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                    ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                    ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                    ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                    ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                    ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                ]
            });
            $("#processColor").spectrum("set", '#ccc');

            $("#addProcessRule form").attr('onsubmit', 'addProcessRule()')

            $("#addProcessRule").modal('show');
            break;
        case 10:

            $("#sftp_name").removeAttr('disabled')

            $(".sftp_privateKeyFilePath").css('display', 'none')
            $(".sftp_publicKeyFilePath").css('display', 'none')
            $("#sftp_privateKeyFilePath").removeAttr('required')

            $("#addSftpInputRule form").attr("onsubmit", "addSftpRule()");
            $("#addSftpInputRule form")[0].reset();

            $("#sftp_connectTimeOut").val(30000)
            $("#sftp_listRecursive").val(-1)
            $("#sftp_pollInterval").val(30000)
            $(".configBody").html('')
            $("#addSftpInputRule").modal('show');



            break;
        case 11:

            $("#mqtt_name").removeAttr('disabled')
            $(".mqtt_ssl_block").css('display', 'none')
            $(".mqtt_ssl").css('display', 'none')

            $(".configBody").html('')
            $(".mqttBody").html('')

            $("#addMqttInputRule form").attr("onsubmit", "addMqttRule()");
            $("#addMqttInputRule form")[0].reset();
            $("#addMqttInputRule").modal('show');

            break;
        case 12:

            $("#udp_name").removeAttr('disabled')

            $(".configBody").html('')
            $("#addUdpInputRule form").attr("onsubmit", "addUdpRule()");
            $("#addUdpInputRule form")[0].reset();
            $("#addUdpInputRule").modal('show');

            break;
        case 13:

            $("#tcp_name").removeAttr('disabled')

            $(".configBody").html('')
            $(".tcp_ssl_block").css('display', 'none')
            $(".tcp_ssl").css('display', 'none')
            $("#addTcpInputRule form").attr("onsubmit", "addTcpRule()");
            $("#addTcpInputRule form")[0].reset();
            $("#addTcpInputRule").modal('show');

            break;
        case 14:

            $("#email_name").removeAttr('disabled')

            $(".configBody").html('')
            $(".folderBody").html('')

            $("#addEmailInputRule form").attr("onsubmit", "addEmailRule()");
            $("#addEmailInputRule form")[0].reset();
            $("#addEmailInputRule").modal('show');

            break;
        case 15:

            $("#addMicroRule form")[0].reset();
            $("#micro_id").removeAttr('disabled')

            $("#methodGet").prop('checked', true)
            $("#methodPost").prop('checked', true)
            $("#methodDelete").prop('checked', true)
            $("#methodPut").prop('checked', true)
            $("#methodUpload").prop('checked', true)

            $(".micro_apiKey").css('display', 'none')
            $("#addMicroRule").modal('show');

            break;

    }
}

function editJobModal() {
    $("#job_rule").attr('disabled', 'disabled')

    let obj = {};
    for (let i = 0; i < job_rules_list.length; i++) {
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

    if (obj.jobType === 'ATOMIC') {
        $("#job_boot").attr('disabled', 'disabled');
    } else {
        $("#job_boot").removeAttr('disabled')
    }

    if (ADMIN_ACCESS) {
        $(".systemTemplate").css('display', 'block')

        if (obj.jobType === 'ATOMIC') {
            $("#job_system").attr('disabled', 'disabled')
        } else {
            $("#job_system").removeAttr('disabled')
        }
    } else {
        $(".systemTemplate").css('display', 'none')
    }
    $(".jAction").html('Edit');
    $("#addJobRule form").attr("onsubmit", "addJobRule(1)");
    $("#addJobRule").modal('show');
}

function editInputModal() {

    switch (CURRENT_TYPE) {
        case 10:
        editSftpModal()    
            break;
        case 11:
        editMqttModal()    
            break;
        case 12:
        editUdpModal()    
            break;
        case 13:
        editTcpModal()    
            break;
        case 14:
        editEmailModal()    
            break;
        case 15:
        editMicroModal()    
            break;
    
    }
}

function editSftpModal() {
    $("#sftp_name").attr('disabled', 'disabled')

    let obj = {};
    for (let i = 0; i < sftp_rules_list.length; i++) {
        if (CURRENT_ID === sftp_rules_list[i].id) {
            obj = sftp_rules_list[i];
        }
    }

    $("#addSftpInputRule form")[0].reset();
    $("#sftp_id").val(obj.id)
    $(".sftp_id").html(obj.id)
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
    $("#sftp_properties").val(obj.properties ? JSON.stringify(obj.properties) : '{}')

    $("#sftp_startAtBoot").val(obj.startAtBoot ? "1" : "0")
    $("#sftp_keyFilesBuiltIn").val(obj.keyFilesBuiltIn ? "1" : "0")

    checkKeyFile($("#sftp_keyFilesBuiltIn").val())

    $(".configBody").html('')
    for (let i = 0; i < obj.config.length; i++) {
        let t = new Date().getTime()
        $(".configBody").append('<tr class="' + t + '">' +
            '<td><input type="text" value="' + obj.config[i].name + '" required class="conf_name form-control input-sm"></td>' +
            '<td><input type="text" value="' + obj.config[i].value + '" class="conf_value form-control input-sm"></td>' +
            '<td><button class="btn btn-sm" type="button" onclick="removeConfigBody(\'' + t + '\')">' +
            '<i class="fa fa-trash"></i></button></td>' +
            '</tr>')

    }

    $("#addSftpInputRule form").attr("onsubmit", "addSftpRule(1)");
    $("#addSftpInputRule").modal('show');




}

function editMqttModal() {

    $("#mqtt_name").attr('disabled', 'disabled')

    let obj = {};
    for (let i = 0; i < mqtt_rules_list.length; i++) {
        if (CURRENT_ID === mqtt_rules_list[i].id) {
            obj = mqtt_rules_list[i];
        }
    }

    $("#addMqttInputRule form")[0].reset();

    $("#mqtt_id").val(obj.id)
    $(".mqtt_id").html(obj.id)
    $("#mqtt_name").val(obj.name)
    $("#mqtt_instances").val(obj.instances ? obj.instances : '')
    $("#mqtt_instanceType").val(obj.instanceType ? obj.instanceType : '')
    $("#mqtt_properties").val(obj.properties ? JSON.stringify(obj.properties) : '{}')
    $("#mqtt_startAtBoot").val(obj.startAtBoot ? "1" : "0")

    $("#mqtt_serverUrls").val(obj.serverUrls ? obj.serverUrls.join(",") : '')

    $("#mqtt_userName").val(obj.userName ? obj.userName : '')
    $("#mqtt_password").val(obj.password ? obj.password : '')
    $("#mqtt_clientId").val(obj.clientId ? obj.clientId : '')

    $("#mqtt_cleanSession").val(obj.cleanSession ? "1" : "0")
    $("#mqtt_connectionTimeout").val(obj.connectionTimeout ? obj.connectionTimeout : '')
    $("#mqtt_keepAliveInterval").val(obj.keepAliveInterval ? obj.keepAliveInterval : '')
    $("#mqtt_mqttVersion").val(obj.mqttVersion ? obj.mqttVersion : '')

    $("#mqtt_ssl").val(obj.ssl ? "1" : "0")
    $("#mqtt_sslSkipHostNameVerification").val(obj.sslSkipHostNameVerification ? "1" : "0")
    $("#mqtt_sslStoreBuiltIn").val(obj.sslStoreBuiltIn ? "1" : "0")


    $("#mqtt_sslKeyStorePath").val(obj.sslKeyStorePath ? obj.sslKeyStorePath : '')
    $("#mqtt_sslKeyStorePassword").val(obj.sslKeyStorePassword ? obj.sslKeyStorePassword : '')

    $("#mqtt_sslTrustStorePath").val(obj.sslTrustStorePath ? obj.sslTrustStorePath : '')
    $("#mqtt_sslTrustStorePassword").val(obj.sslTrustStorePassword ? obj.sslTrustStorePassword : '')


    checkMqttKeyFile($("#mqtt_sslStoreBuiltIn").val())
    checkMqttSSL($("#mqtt_ssl").val())


    $(".mqttBody").html('')
    for (let i = 0; i < obj.subscriptions.length; i++) {
        let t = new Date().getTime()
        $(".mqttBody").append('<tr class="' + t + '">' +
            '<td><input type="text" value="' + obj.subscriptions[i].pattern + '" required class="mqtt_pattern form-control input-sm"></td>' +
            '<td><input type="number" min="0" value="' + obj.subscriptions[i].qos + '" required class="mqtt_qos form-control input-sm"></td>' +
            '<td><button class="btn btn-sm" type="button" onclick="removeMqttBody(\'' + t + '\')">' +
            '<i class="fa fa-trash"></i></button></td>' +
            '</tr>')

    }


    $(".configBody").html('')
    for (let i = 0; i < obj.config.length; i++) {
        let t = new Date().getTime()
        $(".configBody").append('<tr class="' + t + '">' +
            '<td><input type="text" value="' + obj.config[i].name + '" required class="conf_name form-control input-sm"></td>' +
            '<td><input type="text" value="' + obj.config[i].value + '" class="conf_value form-control input-sm"></td>' +
            '<td><button class="btn btn-sm" type="button" onclick="removeConfigBody(\'' + t + '\')">' +
            '<i class="fa fa-trash"></i></button></td>' +
            '</tr>')

    }


    $("#addMqttInputRule form").attr("onsubmit", "addMqttRule(1)");
    $("#addMqttInputRule").modal('show');
}

function editUdpModal() {

    $("#udp_name").attr('disabled', 'disabled')

    let obj = {};
    for (let i = 0; i < udp_rules_list.length; i++) {
        if (CURRENT_ID === udp_rules_list[i].id) {
            obj = udp_rules_list[i];
        }
    }

    $("#addUdpInputRule form")[0].reset();

    $("#udp_id").val(obj.id)
    $(".udp_id").html(obj.id)

    $("#udp_name").val(obj.name)
    $("#udp_instances").val(obj.instances ? obj.instances : '')
    $("#udp_instanceType").val(obj.instanceType ? obj.instanceType : '')
    $("#udp_startAtBoot").val(obj.startAtBoot ? "1" : "0")
    $("#udp_properties").val(obj.properties ? JSON.stringify(obj.properties) : '{}')

    $("#udp_listenHost").val(obj.listenHost ? obj.listenHost : '')
    $("#udp_listenPort").val(obj.listenPort ? obj.listenPort : '')
    $("#udp_receiveBufferSize").val(obj.receiveBufferSize ? obj.receiveBufferSize : '')
    $("#udp_sendBufferSize").val(obj.sendBufferSize ? obj.sendBufferSize : '')
    $("#udp_soTimeout").val(obj.soTimeout ? obj.soTimeout : '')
    $("#udp_timeToLive").val(obj.timeToLive ? obj.timeToLive : '')
    $("#udp_trafficeClass").val(obj.trafficeClass ? obj.trafficeClass : '')

    $("#udp_reuseAddress").val(obj.reuseAddress ? "1" : "0")
    $("#udp_multicast").val(obj.multicast ? "1" : "0")

    $("#udp_multicastGroup").val(obj.multicastGroup ? obj.multicastGroup : '')


    $(".configBody").html('')
    for (let i = 0; i < obj.config.length; i++) {
        let t = new Date().getTime()
        $(".configBody").append('<tr class="' + t + '">' +
            '<td><input type="text" value="' + obj.config[i].name + '" required class="conf_name form-control input-sm"></td>' +
            '<td><input type="text" value="' + obj.config[i].value + '" class="conf_value form-control input-sm"></td>' +
            '<td><button class="btn btn-sm" type="button" onclick="removeConfigBody(\'' + t + '\')">' +
            '<i class="fa fa-trash"></i></button></td>' +
            '</tr>')

    }


    $("#addUdpInputRule form").attr("onsubmit", "addUdpRule(1)");
    $("#addUdpInputRule").modal('show');
}

function editTcpModal() {

    $("#tcp_name").attr('disabled', 'disabled')

    let obj = {};
    for (let i = 0; i < tcp_rules_list.length; i++) {
        if (CURRENT_ID === tcp_rules_list[i].id) {
            obj = tcp_rules_list[i];
        }
    }

    $("#addTcpInputRule form")[0].reset();

    $("#tcp_id").val(obj.id)
    $(".tcp_id").html(obj.id)
    $("#tcp_name").val(obj.name)
    $("#tcp_instances").val(obj.instances ? obj.instances : '')
    $("#tcp_instanceType").val(obj.instanceType ? obj.instanceType : '')
    $("#tcp_startAtBoot").val(obj.startAtBoot ? "1" : "0")
    $("#tcp_properties").val(obj.properties ? JSON.stringify(obj.properties) : '{}')

    $("#tcp_listenHost").val(obj.listenHost ? obj.listenHost : '')
    $("#tcp_listenPort").val(obj.listenPort ? obj.listenPort : '')

    $("#tcp_ssl").val(obj.ssl ? "1" : "0")
    $("#tcp_ssslStoresBuiltIn").val(obj.sslStoresBuiltIn ? "1" : "0")
    $("#tlsVersion").val(obj.tlsVersion ? obj.tlsVersion : '')

    $("#tcp_trustStorePath").val(obj.trustStorePath ? obj.trustStorePath : '')
    $("#tcp_trustStorePassword").val(obj.trustStorePassword ? obj.trustStorePassword : '')
    $("#tcp_keyStorePath").val(obj.keyStorePath ? obj.keyStorePath : '')
    $("#tcp_keyStorePassword").val(obj.keyStorePassword ? obj.keyStorePassword : '')

    $("#tcp_keepAlive").val(obj.keepAlive ? "1" : "0")
    $("#tcp_soLingerOn").val(obj.soLingerOn ? "1" : "0")
    $("#tcp_oobLine").val(obj.oobLine ? "1" : "0")

    $("#tcp_tcpNoDelay").val(obj.tcpNoDelay ? "1" : "0")
    $("#tcp_reuseAddress").val(obj.reuseAddress ? "1" : "0")

    $("#tcp_executePartialBuffered").val(obj.executePartialBuffered ? "1" : "0")
    $("#tcp_closeOnReadTimeout").val(obj.closeOnReadTimeout ? "1" : "0")

    $("#tcp_soTimeout").val(obj.soTimeout ? obj.soTimeout : '')
    $("#tcp_trafficeClass").val(obj.trafficeClass ? obj.trafficeClass : '')
    $("#tcp_soLinger").val(obj.soLinger ? obj.soLinger : '')
    $("#tcp_receiveBufferSize").val(obj.receiveBufferSize ? obj.receiveBufferSize : '')
    $("#tcp_sendBufferSize").val(obj.sendBufferSize ? obj.sendBufferSize : '')
    $("#tcp_fixedBufferSize").val(obj.fixedBufferSize ? obj.fixedBufferSize : '')
    $("#tcp_readTimeout").val(obj.readTimeout ? obj.readTimeout : '')

    $("#tcp_delimiter").val(obj.delimiter ? obj.delimiter : '')
    $("#tcp_execute").val(obj.execute ? obj.execute : '')





    checkTcpSSL($("#tcp_ssl").val())
    checkTcpKeyFile($("#tcp_ssslStoresBuiltIn").val())

    $(".configBody").html('')
    for (let i = 0; i < obj.config.length; i++) {
        let t = new Date().getTime()
        $(".configBody").append('<tr class="' + t + '">' +
            '<td><input type="text" value="' + obj.config[i].name + '" required class="conf_name form-control input-sm"></td>' +
            '<td><input type="text" value="' + obj.config[i].value + '" class="conf_value form-control input-sm"></td>' +
            '<td><button class="btn btn-sm" type="button" onclick="removeConfigBody(\'' + t + '\')">' +
            '<i class="fa fa-trash"></i></button></td>' +
            '</tr>')

    }


    $("#addTcpInputRule form").attr("onsubmit", "addTcpRule(1)");
    $("#addTcpInputRule").modal('show');
}

function editEmailModal() {

    $("#email_name").attr('disabled', 'disabled')

    let obj = {};
    for (let i = 0; i < email_rules_list.length; i++) {
        if (CURRENT_ID === email_rules_list[i].id) {
            obj = email_rules_list[i];
        }
    }

    $("#addUdpInputRule form")[0].reset();

    $("#email_id").val(obj.id)
    $(".email_id").html(obj.id)
    $("#email_name").val(obj.name)
    $("#email_instances").val(obj.instances ? obj.instances : '')
    $("#email_instanceType").val(obj.instanceType ? obj.instanceType : '')
    $("#email_startAtBoot").val(obj.startAtBoot ? "1" : "0")


    $("#email_properties").val(obj.properties ? JSON.stringify(obj.properties) : '{}')

    $("#email_subjectPatterns").val(obj.subjectPatterns ? obj.subjectPatterns.join(",") : '')
    $("#email_allowedContentTypes").val(obj.allowedContentTypes ? obj.allowedContentTypes.join(",") : '')
    $("#email_allowedAttachmentFileExtensions").val(obj.allowedAttachmentFileExtensions ? obj.allowedAttachmentFileExtensions.join(",") : '')


    $("#email_type").val(obj.type ? obj.type : '')
    $("#email_protocol").val(obj.protocol ? obj.protocol : '')
    $("#email_secured").val(obj.secured ? "1" : "0")
    $("#email_implicit").val(obj.implicit ? "1" : "0")
    $("#email_keepAlive").val(obj.keepAlive ? "1" : "0")
    $("#email_tcpNoDelay").val(obj.tcpNoDelay ? "1" : "0")
    $("#email_processOnlyAttachments").val(obj.processOnlyAttachments ? "1" : "0")

    $("#email_localPort").val(obj.localPort ? obj.localPort : '')
    $("#email_connectTimeout").val(obj.connectTimeout ? obj.connectTimeout : '')
    $("#email_readTimeout").val(obj.readTimeout ? obj.readTimeout : '')


    $("#email_remoteHost").val(obj.remoteHost ? obj.remoteHost : '')
    $("#email_remotePort").val(obj.remotePort ? obj.remotePort : '')
    $("#email_userName").val(obj.userName ? obj.userName : '')
    $("#email_password").val(obj.password ? obj.password : '')

    $(".configBody").html('')
    for (let i = 0; i < obj.config.length; i++) {
        let t = new Date().getTime()
        $(".configBody").append('<tr class="' + t + '">' +
            '<td><input type="text" value="' + obj.config[i].name + '" required class="conf_name form-control input-sm"></td>' +
            '<td><input type="text" value="' + obj.config[i].value + '" class="conf_value form-control input-sm"></td>' +
            '<td><button class="btn btn-sm" type="button" onclick="addConfigBody()">' +
            '<i class="fa fa-plus"></i></button>' +
            '<button class="btn btn-sm" type="button" onclick="removeConfigBody(\'' + t + '\')">' +
            '<i class="fa fa-trash"></i></button></td>' +
            '</tr>')

    }



    $(".folderBody").html('')
    for (let i = 0; i < obj.folders.length; i++) {
        let t = new Date().getTime()
        $(".folderBody").append('<tr class="' + t + '">' +
            '<td><input type="text" value="' + obj.folders[i].name + '" required class="folder_name form-control input-sm"></td>' +

            '<td><select class="folder_markMessageAfterProcessing form-control input-sm">' +
            '<option value="NONE">NONE</option>' +
            '<option value="ANSWERED">ANSWERED</option>' +
            '<option value="DELETED">DELETED</option>' +
            '<option value="DRAFT">DRAFT</option>' +
            '<option value="SEEN">SEEN</option>' +
            '<option value="MOVE">MOVE</option>' +
            '</select></td>' +
            '<td><select class="folder_proccessOnlyFlags form-control input-sm" multiple>' +
            '<option value="ANSWERED">ANSWERED</option>' +
            '<option value="DRAFT">DRAFT</option>' +
            '<option value="SEEN">SEEN</option>' +
            '<option value="RECENT">RECENT</option>' +
            '</select></td>' +

            '<td><input type="text" value="' + obj.folders[i].toMovedFolder + '" class="folder_toMovedFolder form-control input-sm"></td>' +
            '<td class="text-center"><button class="btn btn-sm" type="button" onclick="removeFolderBody(\'' + t + '\')">' +
            '<i class="fa fa-trash"></i></button></td>' +
            '</tr>')

        $("." + t + " .folder_markMessageAfterProcessing").val(obj.folders[i].markMessageAfterProcessing)
        $("." + t + " .folder_proccessOnlyFlags").val(obj.folders[i].proccessOnlyFlags)
    }


    $("#addEmailInputRule form").attr("onsubmit", "addEmailRule(1)");
    $("#addEmailInputRule").modal('show');
}

function editMicroModal() {

    $("#micro_id").attr('disabled', 'disabled');

    let obj = {};
    for (let i = 0; i < micro_rules_list.length; i++) {
        if (CURRENT_ID === micro_rules_list[i].name) {
            obj = micro_rules_list[i];
        }
    }

    $("#micro_id").val(obj.name);
    $("#micro_authType").val(obj.authType);
    $("#micro_apiKey").val(obj.apiKey ? obj.apiKey : '');


    if (obj.allowedMethods) {
        $("#methodGet").prop('checked', false)
        $("#methodPost").prop('checked', false)
        $("#methodDelete").prop('checked', false)
        $("#methodPut").prop('checked', false)
        $("#methodUpload").prop('checked', false)

        for (let i = 0; i < obj.allowedMethods.length; i++) {
            if (obj.allowedMethods[i].toLowercase() == 'get') {
                $("#methodGet").prop('checked', true)
            }
            if (obj.allowedMethods[i].toLowercase() == 'post') {
                $("#methodPost").prop('checked', true)
            }
            if (obj.allowedMethods[i].toLowercase() == 'delete') {
                $("#methodDelete").prop('checked', true)
            }
            if (obj.allowedMethods[i].toLowercase() == 'put') {
                $("#methodPut").prop('checked', true)
            }
            if (obj.allowedMethods[i].toLowercase() == 'upload') {
                $("#methodUpload").prop('checked', true)
            }
        }
    } else {
        $("#methodGet").prop('checked', true)
        $("#methodPost").prop('checked', true)
        $("#methodDelete").prop('checked', true)
        $("#methodPut").prop('checked', true)
        $("#methodUpload").prop('checked', true)
    }


    $("#micro_properties").val(obj.properties ? JSON.stringify(obj.properties) : '{}')


    $("#addMicroRule form").attr("onsubmit", "addMicroRule(1)");
    $("#addMicroRule").modal('show');

}

function openDeleteModal() {

    if (CURRENT_TYPE > 0) {
        switch (CURRENT_TYPE) {
            case 1:
                $(".delete_rule_name").html('Message');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("messageTab_" + CURRENT_ID);
                break;
            case 2:
                $(".delete_rule_name").html('Named');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("namedTab_" + CURRENT_ID);
                break;
            case 3:
                $(".delete_rule_name").html('Schedule');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("scheduleTab_" + CURRENT_ID);
                break;
            case 6:
                $(".delete_rule_name").html('Binary');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("binaryTab_" + CURRENT_ID);
                break;
            case 7:
                $(".delete_rule_name").html('Job');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("jobTab_" + CURRENT_ID);
                break;
            case 8:
                $(".delete_rule_name").html('File');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("fileTab_" + CURRENT_ID);
                break;
            case 9:
                $(".delete_rule_name").html('Process');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("processTab_" + CURRENT_ID);
                break;
            case 10:
                $(".delete_rule_name").html('SFTP');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("sftpTab_" + CURRENT_ID);
                break;
            case 11:
                $(".delete_rule_name").html('MQTT');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("mqttTab_" + CURRENT_ID);
                break;
            case 12:
                $(".delete_rule_name").html('UDP');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("udpTab_" + CURRENT_ID);
                break;
            case 13:
                $(".delete_rule_name").html('TCP');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("tcpTab_" + CURRENT_ID);
                break;
            case 14:
                $(".delete_rule_name").html('EMAIL');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("emailTab_" + CURRENT_ID);
                break;
            case 15:
                $(".delete_rule_name").html('Micro API');
                $(".delete_rule_id").html(CURRENT_ID);
                $(".viewId").val("microTab_" + CURRENT_ID);
                break;
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
    switch (CURRENT_TYPE) {
        case 1:
            deleteMessageDef(CURRENT_ID, function (status, data) {
                if (status) {
                    deleteMessagRule(CURRENT_ID, function (status, data) {
                        deleteTab(CURRENT_ID, CURRENT_TYPE);
                            successMsg('Successfully deleted');
                            loadMessageRulesList();
                            $("#deleteModal").modal('hide');
                    });

                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 2:
            deleteNamedRule(CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadNamedRulesList();

                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 3:
            deleteScheduleRule(CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadScheduleRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 6:
            deleteBinaryRule(CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadBinaryRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 7:
            deleteJobRule(CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadJobRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 8:
            deleteFileRule(CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadFileRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 9:
            deleteProcessRule(CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    Cookies.set('pfGroup', '')
                    loadProcessRulesListAggs();
                    loadProcessRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 10:
            deleteInputRule('SFTP', CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadSftpRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 11:
            deleteInputRule('MQTT', CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadMqttRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 12:
            deleteInputRule('UDP', CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadUdpRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 13:
            deleteInputRule('TCP', CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadTcpRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 14:
            deleteInputRule('EMAIL', CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadEmailRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
        case 15:
            deleteMicroRule(CURRENT_ID, function (status, data) {
                if (status) {
                    deleteTab(CURRENT_ID, CURRENT_TYPE);
                    successMsg('Successfully deleted');
                    loadMicroRulesList();
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
            break;
    }
   
}


function deleteMessageField(id) {
    $("#msg_field_row_" + id).remove();
    MSG_FIELD_COUNT--;
}

function addMessageField() {

    let id = MSG_FIELD_COUNT;

    let str = `<tr id="msg_field_row_` + id + `">
    <td>
        <input class="form-control input-sm" placeholder="Field Name" onkeyup="onlyAlphaNumericUs(this)" onkeydown="onlyAlphaNumericUs(this)" type="text"  id="msg_field_` + id + `" required>
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

    if ($("#msg_id").val().length < 3) {
        errorMsg('Message ID minimum 3 digits required')
        return
    }

    let fields = [];

    for (let i = 0; i < MSG_FIELD_COUNT; i++) {
        let json = {
            "dataType": $("#msg_datatype_" + i).val(),
            "format": "AS_IS",
            "label": "",
            "description": "",
            "name": $("#msg_field_" + i).val()
        }
        fields.push(json);
    }

    for (let i = 0; i < fields.length; i++) {

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


    let msgObj = {
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
                    loadMessageRulesList(function (status) {
                        if (status) {
                            loadTabbar(msgObj.id, 1);
                            $("#addMessageRule").modal('hide');
                        }
                    });
                } else {
                    errorMsg('Error in Define Message')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })


}

function addNamedRule() {
    let dataObj = {
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
            loadNamedRulesList(function () {
                loadTabbar(dataObj.name, 2);
                $("#addNamedRule").modal('hide');
            });
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addBinaryRule() {
    let dataObj = {
        lang: $("#binary_lang").val(),
        code: "",
        type: $("#binary_rule").val()
    };

    updateBinaryRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadBinaryRulesList(function () {
                loadTabbar(dataObj.type, 6);
                $("#addBinaryRule").modal('hide');
            })
        } else {
            errorMsg('Error in saving!')
        }
    })

}
function addFileRule() {
    let dataObj = {
        lang: $("#file_lang").val(),
        code: "",
        type: $("#file_rule").val()
    };

    updateFileRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadFileRulesList(function () {
                loadTabbar(dataObj.type, 8);
                $("#addFileRule").modal('hide');
            })
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addProcessRule() {

    let defaultCode = '//Return function should be always Map\n\nreturn [_chain:false,_next:-1,_invoke:""];'

    let data = {
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
        "tags": $("#pTags").val()
    }

    let input = {};

    let inputKey = $(".sftp_key").map(function () {
        return $(this).val();
    }).get();
    let inputValue = $(".sftp_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < inputKey.length; i++) {

        if (inputKey[i]) {
            input[inputKey[i]] = inputValue[i];
        }

    };

    data['input'] = input;

    let output = {};

    let outputKey = $(".output_key").map(function () {
        return $(this).val();
    }).get();

    if (outputKey.length === 0) {
        errorMsg('Output is mandatory to get the process response')
        return false;
    }

    $(".pBtn").attr('disabled', 'disabled')
    $(".pBtn").html('<i class="fa fa-spinner fa-spin"></i> Processing...')

    let outputValue = $(".output_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < outputKey.length; i++) {

        if (outputKey[i]) {
            output[outputKey[i]] = outputValue[i];
        }

    };

    data['output'] = output;

    updateProcessRuleCode(data, function (status, result) {
        $(".pBtn").removeAttr('disabled')
        $(".pBtn").html('Save Changes')
        if (status) {
            successMsg('Successfully saved!');
            Cookies.set('pfGroup', '')
            loadProcessRulesList(function () {
                loadProcessRulesListAggs()
                loadTabbar(data.id, 9);
                $("#addProcessRule").modal('hide');
            });
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function updateProcessRule(id) {


    let obj = {};

    for (let i = 0; i < process_rules_list.length; i++) {
        if (id === process_rules_list[i].id) {
            obj = process_rules_list[i];
        }
    }

    let defaultCode = '//Return function should be always Map\n\nreturn [_chain:false,_next:-1,_invoke:""];'

    let data = {
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

    let input = {};

    let inputKey = $(".sftp_key").map(function () {
        return $(this).val();
    }).get();
    let inputValue = $(".sftp_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < inputKey.length; i++) {

        if (inputKey[i]) {
            input[inputKey[i]] = inputValue[i];
        }

    };

    data['input'] = input;

    let output = {};

    let outputKey = $(".output_key").map(function () {
        return $(this).val();
    }).get();

    if (outputKey.length === 0) {
        errorMsg('Output is mandatory to get the process response')
        return false;
    }

    $(".pBtn").attr('disabled', 'disabled')
    $(".pBtn").html('<i class="fa fa-spinner fa-spin"></i> Processing...')

    let outputValue = $(".output_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < outputKey.length; i++) {

        if (outputKey[i]) {
            output[outputKey[i]] = outputValue[i];
        }

    };

    data['output'] = output;


    updateProcessRuleCode(data, function (status, result) {
        $(".pBtn").removeAttr('disabled')
        $(".pBtn").html('Save Changes')
        if (status) {
            successMsg('Successfully saved!');
            loadProcessRulesList(function () {
                loadTabbar(data.id, 9);
                $("#addProcessRule").modal('hide');
            })

        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addJobRule(code) {
    let dataObj = {
        "domainKey": DOMAIN_KEY,
        "id": $("#job_rule").val(),
        "name": "",
        "jobType": $("#job_type").val(),
        "jobState": $("#job_state").val(),
        "jobLanguage": $("#job_lang").val(),
        "code": code ? codeEditor.getSession().getValue() : "",
        "instances": Number($("#job_instance").val() ? $("#job_instance").val() : 0),
        "startOnBoot": $("#job_boot").val() === "1" ? true : false,
        "systemJob": ADMIN_ACCESS ? ($("#job_system").val() === "1" ? true : false) : false,
        "resartOnChange": $("#job_restart").val() === "1" ? true : false,
    };

    updateJobRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadJobRulesList(function () {
                loadTabbar(dataObj.id, 7);
                $("#addJobRule").modal('hide');
            })

        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addSftpRule(code) {

    let configObj = [];

    let cKey = $(".conf_name").map(function () {
        return $(this).val();
    }).get();
    let cValue = $(".conf_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < cKey.length; i++) {
        if (cKey[i]) {
            configObj.push({
                name: cKey[i],
                value: cValue[i],
            })
        }
    };

    let dataObj = {
        "domainKey": DOMAIN_KEY,
        "id": $("#sftp_id").val(),
        "name": $("#sftp_name").val(),
        "code": code ? codeEditor.getSession().getValue() : "",
        "description": "",
        instances: Number($("#sftp_instances").val()),
        instanceType: $("#sftp_instanceType").val(),
        lang: 'GROOVY',
        "startAtBoot": $("#sftp_startAtBoot").val() === "1" ? true : false,
        remoteHost: $("#sftp_remoteHost").val(),
        remotePort: $("#sftp_remotePort").val() ? Number($("#sftp_remotePort").val()) : null,
        userName: $("#sftp_userName").val() ? $("#sftp_userName").val() : null,
        password: $("#sftp_password").val() ? $("#sftp_password").val() : null,
        remotePaths: $("#sftp_remotePaths").val() ? $("#sftp_remotePaths").val().split(",") : [],
        implementation: $("#sftp_implementation").val(),
        pollInterval: $("#sftp_pollInterval").val() ? Number($("#sftp_pollInterval").val()) : null,
        listPattern: $("#sftp_listPattern").val() ? $("#sftp_listPattern").val() : null,
        listDirPattern: $("#sftp_listDirPattern").val() ? $("#sftp_listDirPattern").val() : null,
        "keyFilesBuiltIn": $("#sftp_keyFilesBuiltIn").val() === "1" ? true : false,
        privateKeyFilePath: $("#sftp_privateKeyFilePath").val() ? $("#sftp_privateKeyFilePath").val() : null,
        publicKeyFilePath: $("#sftp_publicKeyFilePath").val() ? $("#sftp_publicKeyFilePath").val() : null,
        keyPassPhrase: $("#sftp_keyPassPhrase").val() ? $("#sftp_keyPassPhrase").val() : null,
        connectTimeOut: $("#sftp_connectTimeOut").val() ? Number($("#sftp_connectTimeOut").val()) : null,
        listRecursive: $("#sftp_listRecursive").val() ? Number($("#sftp_listRecursive").val()) : $("#sftp_listRecursive").val(),
        config: configObj,
        properties: $("#sftp_properties").val() ? JSON.parse($("#sftp_properties").val()) : {}

    };



    updateInputRuleCode('SFTP', dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');

                loadSftpRulesList(function () {
                    if (code) {
                        loadTabbar(dataObj.id, 10);
                    }
                    $("#addSftpInputRule").modal('hide');
                })

        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addMqttRule(code) {

    let configObj = []

    let cKey = $(".conf_name").map(function () {
        return $(this).val();
    }).get();
    let cValue = $(".conf_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < cKey.length; i++) {
        if (cKey[i]) {
            configObj.push({
                name: cKey[i],
                value: cValue[i],
            })
        }
    };


    let subsObj = []

    let sKey = $(".mqtt_pattern").map(function () {
        return $(this).val();
    }).get();
    let sValue = $(".mqtt_qos").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < sKey.length; i++) {
        if (sKey[i]) {
            subsObj.push({
                pattern: sKey[i],
                qos: Number(sValue[i]),
            })
        }
    };



    let dataObj = {
        "domainKey": DOMAIN_KEY,
        "id": $("#mqtt_id").val(),
        "name": $("#mqtt_name").val(),
        "code": code ? codeEditor.getSession().getValue() : "",
        "description": "",
        instances: Number($("#mqtt_instances").val()),
        instanceType: $("#mqtt_instanceType").val(),

        lang: 'GROOVY',
        "startAtBoot": $("#mqtt_startAtBoot").val() === "1" ? true : false,
        userName: $("#mqtt_userName").val() ? $("#mqtt_userName").val() : null,
        password: $("#mqtt_password").val() ? $("#mqtt_password").val() : null,
        clientId: $("#mqtt_clientId").val() ? $("#mqtt_clientId").val() : null,

        serverUrls: $("#mqtt_serverUrls").val() ? $("#mqtt_serverUrls").val().split(",") : [],
        cleanSession: $("#mqtt_cleanSession").val() === "1" ? true : false,
        connectionTimeout: $("#mqtt_connectionTimeout").val() ? Number($("#mqtt_connectionTimeout").val()) : null,
        keepAliveInterval: $("#mqtt_keepAliveInterval").val() ? Number($("#mqtt_keepAliveInterval").val()) : null,
        mqttVersion: $("#mqtt_mqttVersion").val() ? $("#mqtt_mqttVersion").val() : null,
        ssl: $("#mqtt_ssl").val() === "1" ? true : false,
        sslSkipHostNameVerification: $("#mqtt_sslSkipHostNameVerification").val() === "1" ? true : false,
        sslStoreBuiltIn: $("#mqtt_sslStoreBuiltIn").val() === "1" ? true : false,

        sslKeyStorePath: $("#mqtt_sslKeyStorePath").val() ? $("#mqtt_sslKeyStorePath").val() : null,
        sslKeyStorePassword: $("#mqtt_sslKeyStorePassword").val() ? $("#mqtt_sslKeyStorePassword").val() : null,
        sslTrustStorePath: $("#mqtt_sslTrustStorePath").val() ? $("#mqtt_sslTrustStorePath").val() : null,
        sslTrustStorePassword: $("#mqtt_sslTrustStorePassword").val() ? $("#mqtt_sslTrustStorePassword").val() : null,
        config: configObj,
        subscriptions: subsObj,
        properties: $("#mqtt_properties").val() ? JSON.parse($("#mqtt_properties").val()) : {}

    };

    updateInputRuleCode('MQTT', dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');

                loadMqttRulesList(function () {
                    if (code) {
                        loadTabbar(dataObj.id, 11);
                    }
                    $("#addMqttInputRule").modal('hide');
                })


        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addUdpRule(code) {

    let configObj = []

    let cKey = $(".conf_name").map(function () {
        return $(this).val();
    }).get();
    let cValue = $(".conf_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < cKey.length; i++) {
        if (cKey[i]) {
            configObj.push({
                name: cKey[i],
                value: cValue[i],
            })
        }

    };


    let dataObj = {
        "domainKey": DOMAIN_KEY,
        "id": $("#udp_id").val(),
        "name": $("#udp_name").val(),
        "code": code ? codeEditor.getSession().getValue() : "",
        "description": "",
        instances: Number($("#udp_instances").val()),
        instanceType: $("#udp_instanceType").val(),
        lang: 'GROOVY',
        "startAtBoot": $("#udp_startAtBoot").val() === "1" ? true : false,

        listenHost: $("#udp_listenHost").val(),
        listenPort: Number($("#udp_listenPort").val()),

        receiveBufferSize: $("#udp_receiveBufferSize").val() ? Number($("#udp_receiveBufferSize").val()) : null,
        sendBufferSize: $("#udp_sendBufferSize").val() ? Number($("#udp_sendBufferSize").val()) : null,
        soTimeout: $("#udp_soTimeout").val() ? Number($("#udp_soTimeout").val()) : null,
        timeToLive: $("#udp_timeToLive").val() ? Number($("#udp_timeToLive").val()) : null,
        trafficeClass: $("#udp_trafficeClass").val() ? Number($("#udp_trafficeClass").val()) : null,

        "reuseAddress": $("#udp_reuseAddress").val() === "1" ? true : false,
        "multicast": $("#udp_multicast").val() === "1" ? true : false,

        config: configObj,
        properties: $("#udp_properties").val() ? JSON.parse($("#udp_properties").val()) : {}


    };

    updateInputRuleCode('UDP', dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
                loadUdpRulesList(function () {
                    if (code) {
                        loadTabbar(dataObj.id, 12);
                    }
                    $("#addUdpInputRule").modal('hide');
                })

        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addTcpRule(code) {

    let configObj = []

    let cKey = $(".conf_name").map(function () {
        return $(this).val();
    }).get();
    let cValue = $(".conf_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < cKey.length; i++) {
        if (cKey[i]) {
            configObj.push({
                name: cKey[i],
                value: cValue[i],
            })
        }
    };


    let dataObj = {
        "domainKey": DOMAIN_KEY,
        "id": $("#tcp_id").val(),
        "name": $("#tcp_name").val(),
        "code": code ? codeEditor.getSession().getValue() : "",
        "description": "",
        instances: Number($("#tcp_instances").val()),
        instanceType: $("#tcp_instanceType").val(),
        lang: 'GROOVY',
        "startAtBoot": $("#tcp_startAtBoot").val() === "1" ? true : false,
        listenHost: $("#tcp_listenHost").val(),
        listenPort: $("#tcp_listenPort").val() ? Number($("#tcp_listenPort").val()) : null,
        ssl: $("#tcp_ssl").val() === "1" ? true : false,
        sslStoresBuiltIn: $("#tcp_sslStoresBuiltIn").val() === "1" ? true : false,
        tlsVersion: $("#tcp_tlsVersion").val() ? $("#tcp_tlsVersion").val() : null,
        trustStorePath: $("#tcp_trustStorePath").val() ? $("#tcp_trustStorePath").val() : null,
        trustStorePassword: $("#tcp_trustStorePassword").val() ? $("#tcp_trustStorePassword").val() : null,
        keyStorePath: $("#tcp_keyStorePath").val() ? $("#tcp_keyStorePath").val() : null,
        keyStorePassword: $("#tcp_keyStorePassword").val() ? $("#tcp_keyStorePassword").val() : null,

        keepAlive: $("#tcp_keepAlive").val() === "1" ? true : false,
        soLingerOn: $("#tcp_soLingerOn").val() === "1" ? true : false,
        oobLine: $("#tcp_oobLine").val() === "1" ? true : false,
        tcpNoDelay: $("#tcp_tcpNoDelay").val() === "1" ? true : false,
        reuseAddress: $("#tcp_reuseAddress").val() === "1" ? true : false,
        executePartialBuffered: $("#tcp_executePartialBuffered").val() === "1" ? true : false,
        closeOnReadTimeout: $("#tcp_closeOnReadTimeout").val() === "1" ? true : false,

        soTimeout: $("#tcp_soTimeout").val() ? Number($("#tcp_soTimeout").val()) : null,
        soLinger: $("#tcp_soLinger").val() ? Number($("#tcp_soLinger").val()) : null,
        receiveBufferSize: $("#tcp_receiveBufferSize").val() ? Number($("#tcp_receiveBufferSize").val()) : null,
        sendBufferSize: $("#tcp_sendBufferSize").val() ? Number($("#tcp_sendBufferSize").val()) : null,
        fixedBufferSize: $("#tcp_fixedBufferSize").val() ? Number($("#tcp_fixedBufferSize").val()) : null,
        trafficeClass: $("#tcp_trafficeClass").val() ? Number($("#tcp_trafficeClass").val()) : null,
        tcp_treadTimeout: $("#tcp_treadTimeout").val() ? Number($("#tcp_treadTimeout").val()) : null,
        execute: $("#tcp_execute").val() ? $("#tcp_execute").val() : null,
        delimiter: $("#tcp_delimiter").val() ? $("#tcp_delimiter").val() : null,
        config: configObj,
        properties: $("#tcp_properties").val() ? JSON.parse($("#tcp_properties").val()) : {}

    };

    updateInputRuleCode('TCP', dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
                loadTcpRulesList(function () {
                    if (code) {
                        loadTabbar(dataObj.id, 13);
                    }
                    $("#addTcpInputRule").modal('hide');
                })


        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addEmailRule(code) {

    let configObj = []

    let cKey = $(".conf_name").map(function () {
        return $(this).val();
    }).get();
    let cValue = $(".conf_value").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < cKey.length; i++) {
        if (cKey[i]) {
            configObj.push({
                name: cKey[i],
                value: cValue[i],
            })
        }
    };

    let folderObj = []

    let fKey = $(".folder_name").map(function () {
        return $(this).val();
    }).get();
    let fVal1 = $(".folder_markMessageAfterProcessing").map(function () {
        return $(this).val();
    }).get();
    let fVal2 = $(".folder_proccessOnlyFlags").map(function () {
        return $(this).val() ? [$(this).val()] : [];
    }).get();
    let fVal3 = $(".folder_toMovedFolder").map(function () {
        return $(this).val();
    }).get();

    for (let i = 0; i < fKey.length; i++) {
        if (fKey[i]) {
            folderObj.push({
                name: fKey[i],
                markMessageAfterProcessing: fVal1[i],
                proccessOnlyFlags: fVal2[i] ? fVal2[i] : [],
                toMovedFolder: fVal3[i] ? fVal3[i] : null,
            })
        }

    };


    let dataObj = {
        "domainKey": DOMAIN_KEY,
        "id": $("#email_id").val(),
        "name": $("#email_name").val(),
        "code": code ? codeEditor.getSession().getValue() : "",
        "description": "",
        instances: Number($("#email_instances").val()),
        instanceType: $("#email_instanceType").val(),
        lang: 'GROOVY',
        "startAtBoot": $("#email_startAtBoot").val() === "1" ? true : false,
        type: $("#email_type").val(),
        "secured": $("#email_secured").val() === "1" ? true : false,
        "implicit": $("#email_implicit").val() === "1" ? true : false,

        protocol: $("#email_protocol").val() ? $("#email_protocol").val() : null,
        remoteHost: $("#email_remoteHost").val(),
        remotePort: $("#email_remotePort").val() ? Number($("#email_remotePort").val()) : null,
        localPort: $("#email_localPort").val() ? Number($("#email_localPort").val()) : null,
        connectTimeout: $("#email_connectTimeout").val() ? Number($("#email_connectTimeout").val()) : null,
        readTimeout: $("#email_readTimeout").val() ? Number($("#email_readTimeout").val()) : null,

        "keepAlive": $("#email_keepAlive").val() === "1" ? true : false,
        "tcpNoDelay": $("#email_tcpNoDelay").val() === "1" ? true : false,
        "processOnlyAttachments": $("#email_processOnlyAttachments").val() === "1" ? true : false,

        userName: $("#email_userName").val() ? $("#email_userName").val() : null,
        password: $("#email_password").val() ? $("#email_password").val() : null,

        subjectPatterns: $("#email_subjectPatterns").val() ? $("#email_subjectPatterns").val().split(",") : [],
        allowedContentTypes: $("#email_allowedContentTypes").val() ? $("#email_allowedContentTypes").val().split(",") : [],
        allowedAttachmentFileExtensions: $("#email_allowedAttachmentFileExtensions").val() ? $("#email_allowedAttachmentFileExtensions").val().split(",") : [],

        config: configObj,
        folders: folderObj,
        properties: $("#email_properties").val() ? JSON.parse($("#email_properties").val()) : {}

    };


    updateInputRuleCode('EMAIL', dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
                loadEmailRulesList(function () {
                    if (code) {
                        loadTabbar(dataObj.id, 14);
                    }
                    $("#addEmailInputRule").modal('hide');
                })
        } else {
            errorMsg('Error in saving!')
        }
    })

}

function addMicroRule(code) {
    let sampleCode = `
import io.boodskap.iot.MicroApi;
        
@MicroApi(
          desc = "My API method description",
          params = [],
          types = [], // if declared, make sure it matches the params[]
          required = [],
          roles = [], // domain roles, empty roles for open access
          slug = "" // optional short name for REST API access
)
def myApiMethod(def args) {

    def results = [:];
    
    return results;
}

`;

    let methods = [];

    if ($("#methodGet").prop('checked')) {
        methods.push('GET')
    }
    if ($("#methodPost").prop('checked')) {
        methods.push('POST')
    }
    if ($("#methodDelete").prop('checked')) {
        methods.push('DELETE')
    }
    if ($("#methodPut").prop('checked')) {
        methods.push('PUT')
    }
    if ($("#methodUpload").prop('checked')) {
        methods.push('UPLOAD')
    }

    let dataObj = {
        // lang: $("#micro_language").val(),
        "code": code ? codeEditor.getSession().getValue() : sampleCode,
        name: $("#micro_id").val(),
        authType: $("#micro_authType").val(),
        apiKey: $("#micro_apiKey").val() ? $("#micro_apiKey").val() : null,
        props: $("#micro_properties").val() ? JSON.parse($("#micro_properties").val()) : {},
        allowedMethods: methods
    };
    updateMicroRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadMicroRulesList(function () {
                if (code) {
                    loadTabbar(dataObj.id, 15);
                }
                $("#addMicroRule").modal('hide');
            })
        } else {
            errorMsg('Error in saving!')
        }
    })


}

function addScheduleRule() {
    let dataObj = {
        lang: $("#sch_language").val(),
        code: "",
        "pattern": $("#sch_pattern").val(),
        id: Number($("#sch_id").val())
    };
    // if (validateCron()) {

    /* retreiveScheduleRule(dataObj.id, function (status, data) {
         if(status){

         }
         else{

         }
     });*/

    updateScheduleRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadScheduleRulesList(function () {
                loadTabbar(dataObj.id, 3);
                $("#addScheduleRule").modal('hide');
            })

        } else {
            errorMsg('Error in saving!')
        }
    })

    //
    // } else {
    //     errorMsgBorder('Invalid Cron Expression', 'sch_pattern');
    // }

}

function loadClassTemplate(id) {
    let template = "";
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

    let type = $("#class_type").val();
    if (type === 'GROOVY') {
        let isPublic = false; // $("#class_public").is(":checked");
        let isOpen = false; // $("#class_opensource").is(":checked");

        if (ADMIN_ACCESS) {
            isPublic = $("input[name='fileType']:checked").val() === 'PUBLIC_GROOVY' ? true : false;

        }

        uploadClass(1, isPublic, isOpen, null);
    } else {
        let isPublic = false; //$("#class_public").is(":checked");
        let jarName = $("#class_name").val();

        uploadClass(2, isPublic, null, jarName);
    }
}

function uploadClass(type, ispublic, isopen, jarname) {

    let url = "";
    if (type === 1) {
        url = API_BASE_PATH + "/groovy/upload/script/file/" + API_TOKEN_ALT + "/" + ispublic + "/" + isopen;
    } else {
        url = API_BASE_PATH + "/groovy/upload/jar/" + API_TOKEN_ALT + "/" + ispublic + "/" + jarname;
    }

    let file = document.getElementById('class_file').files[0]; //$("#class_file")
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('progress', function (e) {
        let done = e.position || e.loaded, total = e.totalSize || e.total;
        console.log('xhr progress: ' + (Math.floor(done / total * 1000) / 10) + '%');
    }, false);
    if (xhr.upload) {
        xhr.upload.onprogress = function (e) {
            let done = e.position || e.loaded, total = e.totalSize || e.total;
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
                let jsonResponse = JSON.parse(this.response);
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

    let formData = new FormData();
    if (type === 1) {
        formData.append("scriptFile", file, file.name);
    } else {
        formData.append("jarFile", file, file.name);
    }
    xhr.send(formData);

}


function loadCodeType() {

    let codeType = $("#codeType").val()

    let searchText = $.trim($("#searchText").val());


    let domainKeyJson = { "match": { "domainKey": DOMAIN_KEY } };

    let queryParams = {
        "query": {
            "bool": {
                "must": []
            }
        },
        "size": 1000
    };

    if (searchText !== '') {
        let searchJson = {
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

    let searchType = $("input[name='fileType']:checked").val();

    if (searchType === 'GROOVY') {
        queryParams.query['bool']['must'].push({ match: { isPublic: false } })
        queryParams.query['bool']['must'].push(domainKeyJson)
    } else {
        queryParams.query['bool']['must'].push({ match: { isPublic: true } })
    }


    let searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    if (codeType === 'JAR') {
        if (searchType === 'GROOVY') {
            searchType = 'GROOVY_JAR';
        } else {
            searchType = 'PUBLIC_GROOVY_JAR';
        }
    }


    searchByQuery('', searchType, searchQuery, function (status, res) {

        let dataList = [];
        if (status) {

            let resultData = QueryFormatter(res).data;
            dataList = resultData['data'];
        }

        if (dataList.length > 0) {
            if (codeType === 'CLASS') {

                for (let i = 0; i < dataList.length; i++) {
                    for (let j = 0; j < dataList[i].classes.length; j++) {
                        dataList[i].classes[j]['code'] = dataList[i].code;
                        dataList[i].classes[j]['_id'] = dataList[i]._id;
                        dataList[i].classes[j]['packageName'] = dataList[i].packageName;
                        dataList[i].classes[j]['domainKey'] = dataList[i].domainKey;

                    }
                }

                let pList = _.groupBy(dataList, 'packageName');

                let dpList = _.pluck(dataList, 'packageName');

                dpList = _.uniq(dpList);


                let resList = [];

                for (let i = 0; i < dpList.length; i++) {

                    let obj = pList[dpList[i]];

                    let classes = [];

                    for (let j = 0; j < obj.length; j++) {
                        for (let k = 0; k < obj[j].classes.length; k++) {
                            classes.push(obj[j].classes[k])
                        }
                    }

                    resList.push({ domainKey: obj[i].domainKey, packageName: dpList[i], classes: classes, _id: guid() });

                }
                groovy_class_list = resList;


                $(".classFolder").html('<div id="groovy_tree" ></div>');
                loadGroovyTreeMenu(resList);
            } else {
                $(".classFolder").html('<div id="jar_tree" ></div>');
                loadJarTreeMenu(dataList);
            }
        } else {
            $(".classFolder").html('<p><small>No Data Found!</small></p>');
        }


    })


}


function openSimulateModal(id, type) {
    let str=""
    switch (type) {
        case 1:
            str = '<div id="simulatorModal_' + id + '" class="w-100">' +
                '<div data-role="body">\n' +
                '<div class="row"><div class="col-md-12"><div class="form-group">' +
                '<label class="inputLabel">Select Device</label>' +
                '<select id="simulatorDeviceList_' + id + '" class="form-control input-sm col-12"><option>No Devices Found</option></select>' +
                '</div></div></div>' +
                '<div class="row msgFieldBlock_' + id + '"></div>' +
                '<div class="row">' +
                '<div class="col-md-12">' +
                '<button class="btn btn-sm btn-success pull-right btn_' + id + '" onclick="simulateMessage(\'' + id + '\',' + type + ')">Send Message</button>' +
                '<button class="btn btn-sm btn-default pull-right" onclick="closeSimulator(\'' + id + '\')" style="margin-right: 10px;">Close</button>' +
                '</div> ' +
                '<div class="col-md-12" style="clear:both;max-height: 200px;">' +//overflow: auto;overflow-x: hidden
                '<code class="code_' + id + '" ></code>' +
                '</div>' +
                '</div></div>' +
                '</div>'
            

            for (const iterator of message_spec_list) {
                if (Number(id) === iterator['id']) {
                    current_msg_obj = iterator
                    break
                }
            }

            simulator[id] = current_msg_obj;
            if (!simulatorModal[id]) {
                $(".simulatorModal").addClass('d-none');
            $(".simulatorModal").append(str);
            fetchDeviceList(id, function (status, data) {

                    $(".msgFieldBlock_" + id).html('');

                    for (let i = 0; i < current_msg_obj.fields.length; i++) {
                        $(".msgFieldBlock_" + id).append(renderHtml(id, i, current_msg_obj.fields[i]))
                    }
                    simulatorModal[id] = $("#simulatorModal_" + id).dialog({
                        resizable: true,
                        open: function () {
                            let closeBtn = $('.ui-dialog-titlebar-close');
                            closeBtn.html('X');
                        },
                        modal: false,
                        closeText: "x",
                        close: function (event, ui) {
                            closeSimulator(id);
                        },

                        title: "Simulate -" + id + ' [' + current_msg_obj.name + ']',
                    });
                $(".simulateBtn").prop("disabled", false)
                })
            } else {
                $(".simulateBtn").prop("disabled", false)
            }

            break;
    
        case 2:
            let placeholder = '{\n"key":"value",\n"key":"value",\n"key":"value",\n"key":"value"\n}';

            str = '<div id="simulatorModal_' + id + '" class="w-100">' +
                '<div data-role="body">\n' +
                '<div class="row>' +
                '<div class="col-md-12">' +
                '<p class="mb-0">Named Rule Arguments - <small>JSON value</small></p><textarea class="form-control form-control-sm mb-2" style="width:100%;height:200px" id="simulatorInput_' + id + '"' +
                "placeholder='" + placeholder + "'></textarea></div>" +
                '</div>' +
                '<div class="row">' +
                '<div class="col-md-12">' +
                '<button class="btn btn-sm btn-success pull-right btn_' + id + '" onclick="simulateMessage(\'' + id + '\',' + type + ')">Invoke NamedRule</button>' +
                '<button class="btn btn-sm btn-default pull-right" onclick="closeSimulator(\'' + id + '\')" style="margin-right: 10px;">Close</button>' +
                '</div> ' +
                '<div class="col-md-12" style="clear:both;max-height: 200px;">' +//overflow: auto;overflow-x: hidden
                '<code class="code_' + id + '" ></code>' +
                '</div>' +
                '</div></div>' +
                '</div>'
            
            for (const iterator of named_rules_list) {
                if (id === iterator['name']) {
                    current_namedrule_obj = iterator
                    break
                }
            }

            simulator[id] = current_namedrule_obj;


            if (!simulatorModal[id]) {
                $(".simulatorModal").addClass('d-none');
                $(".simulatorModal").append(str);

                simulatorModal[id] = $("#simulatorModal_" + id).dialog({
                    resizable: true,
                    open: function () {
                        let closeBtn = $('.ui-dialog-titlebar-close');
                        closeBtn.html('X');
                    },
                    modal: false,
                    closeText: "x",
                    close: function (event, ui) {
                        closeSimulator(id);
                    },

                    title: 'Simulate - ' + current_namedrule_obj.name,
                });
                $(".simulateBtn").prop("disabled", false)
            } else {
                $(".simulateBtn").prop("disabled", false)
            }

            break;
    
        case 3:
            str = '<div id="simulatorModal_' + id + '" class="w-100">' +
                '<div data-role="body">\n' +
                '<div class="row"><div class="col-md-12"><div class="form-group">' +
                '<label class="inputLabel">Select Device</label>' +
                '<select id="simulatorDeviceList_' + id + '" class="form-control input-sm col-12"><option>No Devices Found</option></select>' +
                '</div></div></div>' +
                '<div class="row>' +
                '<div class="col-md-12">' +
                '<p class="mb-0"><label>Upload Binary File</label></p>' +
                '<input type="file" class="form-control pb-3 mb-2"  id="simulatorInput_' + id + '"/>' +
                '</div></div>' +
                '<div class="row">' +
                '<div class="col-md-12">' +
                '<button class="btn btn-sm btn-success pull-right btn_' + id + '" onclick="simulateMessage(\'' + id + '\',' + type + ')">Upload File</button>' +
                '<button class="btn btn-sm btn-default pull-right" onclick="closeSimulator(\'' + id + '\')" style="margin-right: 10px;">Close</button>' +
                '</div> ' +
                '<div class="col-md-12" style="clear:both;max-height: 200px;">' +//overflow: auto;overflow-x: hidden
                '<code class="code_' + id + '" ></code>' +
                '</div>' +
                '</div></div>' +
                '</div>'


            for (const iterator of binary_rules_list) {
                if (id === iterator['type']) {
                    current_binaryrule_obj = iterator
                    break
                }
            }


            simulator[id] = current_binaryrule_obj;

            if (!simulatorModal[id]) {
                $(".simulatorModal").addClass('d-none');
            $(".simulatorModal").append(str);
            fetchDeviceList(id, function (status, data) {

                    simulatorModal[id] = $("#simulatorModal_" + id).dialog({
                        resizable: true,
                        open: function () {
                            let closeBtn = $('.ui-dialog-titlebar-close');
                            closeBtn.html('X');
                        },
                       
                        modal: false,
                        closeText: "x",
                        close: function (event, ui) {
                            closeSimulator(id);
                        },

                        title: 'Simulate - ' + current_binaryrule_obj.type,

                    });
                $(".simulateBtn").prop("disabled", false)
                })
            } else {
                $(".simulateBtn").prop("disabled", false)
            }
            break;
    
        case 4:
            str = '<div id="simulatorModal_' + id + '" class="w-100">' +
                '<div data-role="body">\n' +
                '<div class="row"><div class="col-md-12"><div class="form-group">' +
                '<label class="inputLabel">Select Device</label>' +
                '<select id="simulatorDeviceList_' + id + '" class="form-control input-sm col-12"><option>No Devices Found</option></select>' +
                '</div></div></div>' +
                '<div class="row>' +
                '<div class="col-md-12">' +
                '<p class="mb-0"><label>Upload File File</label></p>' +
                '<input type="file" class="form-control pb-3 mb-2"  id="simulatorInput_' + id + '"/></div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-md-12">' +
                '<button class="btn btn-sm btn-success pull-right btn_' + id + '" onclick="simulateMessage(\'' + id + '\',' + type + ')">Upload File</button>' +
                '<button class="btn btn-sm btn-default pull-right" onclick="closeSimulator(\'' + id + '\')" style="margin-right: 10px;">Close</button>' +
                '</div> ' +
                '<div class="col-md-12" style="clear:both;max-height: 200px;">' +//overflow: auto;overflow-x: hidden
                '<code class="code_' + id + '" ></code>' +
                '</div>' +
                '</div></div>' +
                '</div>'

            for (const iterator of file_rules_list) {
                if (id === iterator['type']) {
                    current_filerule_obj = iterator
                    break
                }
            }

            simulator[id] = current_filerule_obj;

            if (!simulatorModal[id]) {
                $(".simulatorModal").addClass('d-none');
            $(".simulatorModal").append(str);
            fetchDeviceList(id, function (status, data) {

                    simulatorModal[id] = $("#simulatorModal_" + id).dialog({
                        resizable: true,
                        open: function () {
                            let closeBtn = $('.ui-dialog-titlebar-close');
                            closeBtn.html('X');
                        },
                       
                        modal: false,
                        closeText: "x",
                        close: function (event, ui) {
                            closeSimulator(id);
                        },

                        title: 'Simulate - ' + current_filerule_obj.type,

                    });
                $(".simulateBtn").prop("disabled", false)
                })
            } else {
                $(".simulateBtn").prop("disabled", false)
            }
            break;
    }
}


function fetchDeviceList(id, fbk) {

    var queryParams = {
        "method": "GET",
        "extraPath": "",
        "query": "{\"query\":{\"bool\":{\"must\":[{\"match\":{\"domainKey\":\"" + DOMAIN_KEY + "\"}}],\"should\":[]}},\"sort\":[{\"reportedStamp\":{\"order\":\"desc\"}}],\"aggs\":{\"total_count\":{\"value_count\":{\"field\":\"reportedStamp\"}}},\"size\":100,\"from\":0}",
        "params": [],
        "type": "DEVICE"
    }

    async.waterfall([
        async function (cbk) {
            listAuthToken("DEVICE", function (status, data) {
                if (status) {
                    cbk(null, data);
                } else {
                    cbk(null, data);
                }
            });

        },
        async function (deviceData, mcbk) {
            searchDevice(queryParams, function (status, data) {
                if (status) {
                    var resultData = searchQueryFormatterNew(data).data;
                    if (resultData.data.length === 0) {
                        errorMsg('No device list found!');
                        mcbk(null, null);
                        fbk(true, null)
                        return
                    } 
                        $("#simulatorDeviceList_" + id).html("");
                        var deviceOptionUI = "";
                        resultData.data.forEach(e => {
                            if (e.name != null) {
                                deviceData.forEach(element => {
                                    if (element.entity == e.id) {
                                        deviceOptionUI += "<option value=" + e.id + " token=" + element.token + ">" + e.name + "</option>";
                                    }
                                });
                            }
                        });
                        $("#simulatorDeviceList_" + id).append(deviceOptionUI);
                        mcbk(null, null);
                        fbk(true, null)
                    
                } else {
                    errorMsg('Error in fetching device list!')
                    mcbk(null, null);
                }
            });
        }
    ]);
}

function simulateMessage(id, type) {

    if (type === 1) {
        let obj = simulator[id];

        let jsonObj = {};

        for (let i = 0; i < obj.fields.length; i++) {
            let dataType = obj.fields[i].dataType.toUpperCase();
            if (dataType === 'BOOLEAN') {
                jsonObj[obj.fields[i].name] = $("#" + id + "_" + i).val() === 'true' ? true : false;
            }
            else if (dataType === 'INTEGER' || dataType === 'FLOAT' || dataType === 'DOUBLE' || dataType === 'BIGINT' || dataType === 'TIMESTAMP') {
                jsonObj[obj.fields[i].name] = $("#" + id + "_" + i).val() !== '' ? Number($("#" + id + "_" + i).val()) : '';
            }
            else if (dataType === 'DATE') {
                jsonObj[obj.fields[i].name] = $("#" + id + "_" + i).val() !== '' ? new Date($("#" + id + "_" + i).val()) : '';
            } else {
                jsonObj[obj.fields[i].name] = $("#" + id + "_" + i).val()
            }

        }

        let devToken = $("#simulatorDeviceList_" + id + " option:selected").attr("token");

        $(".code_" + id).append('<p>' + new Date() + ' | ' + JSON.stringify(jsonObj) + '</p>');

        $(".btn_" + id).attr('disabled', 'disabled');


        simulateDeviceMessage(id, jsonObj, devToken, function (status, data) {
            $(".btn_" + id).removeAttr('disabled');
            if (status) {
                $(".code_" + id).append('<p>' + new Date() + ' | Message sent successfully</p>');
            } else {
                $(".code_" + id).append('<p>' + new Date() + ' | Error in sent message</p>');
            }

        });
    }
    else if (type === 2) {

        let inputObj = $("#simulatorInput_" + id).val();
        if (inputObj && isValidJson(inputObj)) {
            $(".btn_" + id).attr('disabled', 'disabled');
            $(".code_" + id).append('<p>' + new Date() + ' | ' + inputObj + '</p>');

            simulateNamedRule(id, inputObj, function (status, data) {

                $(".btn_" + id).removeAttr('disabled');
                if (status) {
                    $(".code_" + id).append('<p>' + new Date() + ' | Named Rule invoked successfully</p>');
                    $(".code_" + id).append('<p>' + new Date() + ' | Result => ' + JSON.stringify(data) + '</p>');
                } else {
                    $(".code_" + id).append('<p>' + new Date() + ' | Error in invoking named rule</p>');
                }

            });

        } else {
            errorMsgBorder("Empty JSON (or) Invalid JSON", "simulatorInput_" + id)
        }

    }
    else if (type === 3) {


        let fileInput = document.getElementById("simulatorInput_" + id);

        let files = fileInput.files;

        if (files.length === 0) {
            errorMsgBorder('File not found. select a file to start upload', "simulatorInput_" + id);
            return false;
        }
        $(".btn_" + id).attr('disabled', 'disabled');
        uploadBinaryFile(files[0], id);

    }
    else if (type === 4) {


        let fileInput = document.getElementById("simulatorInput_" + id);

        let files = fileInput.files;

        if (files.length === 0) {
            errorMsgBorder('File not found. select a file to start upload', "simulatorInput_" + id);
            return false;
        }
        $(".btn_" + id).attr('disabled', 'disabled');
        uploadFileRule(files[0], id);

    }

}
function uploadBinaryFile(file, id) {

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            $(".btn_" + id).removeAttr('disabled');
            if (xhr.status === 200) {
                let result = JSON.parse(xhr.response);

                $(".code_" + id).append('<p>' + new Date() + ' | File upload successfully!</p>');
                $(".code_" + id).append('<p>' + new Date() + ' | Result => ' + xhr.response + '</p>');

            } else {
                $(".code_" + id).append('<p>' + new Date() + ' | Error in binary file upload!</p>');
            }
        }
    };
    // xhr.open('POST', API_BASE_PATH + '/push/bin/file/' + DOMAIN_KEY + '/' + API_KEY + "/SIMULATOR/WEB/1.0/" + id, true);
    xhr.open('POST', API_BASE_PATH + '/push/file/' + id);
    let formData = new FormData();
    let devToken = $("#simulatorDeviceList_" + id + " option:selected").attr("token");

    formData.append("file", file, file.name);
    xhr.setRequestHeader('token', devToken);
    xhr.send(formData);
}

function uploadFileRule(file, id) {

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            $(".btn_" + id).removeAttr('disabled');
            if (xhr.status === 200) {
                let result = JSON.parse(xhr.response);

                $(".code_" + id).append('<p>' + new Date() + ' | File upload successfully!</p>');
                $(".code_" + id).append('<p>' + new Date() + ' | Result => ' + xhr.response + '</p>');

            } else {
                $(".code_" + id).append('<p>' + new Date() + ' | Error in file rule upload!</p>');
            }
        }
    };
    // xhr.open('POST', API_BASE_PATH + '/push/file/' + DOMAIN_KEY + '/' + API_KEY + "/SIMULATOR/WEB/1.0/" + id, true);
    xhr.open('POST', API_BASE_PATH + '/push/file/rule/' + id);
    let formData = new FormData();
    formData.append("file", file, file.name);
    let devToken = $("#simulatorDeviceList_" + id + " option:selected").attr("token");

    xhr.setRequestHeader('token', devToken);
    xhr.send(formData);
}

function closeSimulator(id) {

    $('#simulatorModal_' + id).dialog("close");
    simulatorModal[id] = null;
    $("#simulatorModal_" + id).remove();

}

function renderHtml(id, index, obj) {

    let str = '';
    let dataType = obj.dataType.toUpperCase();

    if (dataType === 'BOOLEAN') {
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
    } else if (dataType === 'INTEGER') {
        str = `
          <div class="col-md-6">
            <div class="form-group">
                <label class="inputLabel" style="text-transform: uppercase">` + obj.name + `</label>
                <input type="number" class="form-control input-sm" id="` + id + `_` + index + `" required>
                <small style="color:#ccc">Datatype: ` + obj.dataType + `</small>
            </div>
        </div>
        `;
    } else {
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

function exportRule(type) {

    let consoleText = codeEditor.getSession().getValue();

    let data = {};
    let rule_name = '';
    let obj ={}
    switch (type) {

        case 1:
            console.log('Domain Rule...!');
            rule_name = 'domain-rule';
            data = {
                lang: 'GROOVY',
                code: consoleText
            }

            break;

        case 2:
            console.log('Message Rule...!');
            rule_name = 'message-rule-' + CURRENT_ID;
            data = {
                lang: 'GROOVY',
                code: consoleText,
                messageId: CURRENT_ID
            }


            break;
        case 3:
            console.log('Named Rule...!');
            rule_name = 'named-rule-' + CURRENT_ID;
            data = {
                lang: 'GROOVY',
                code: consoleText,
                name: CURRENT_ID
            }


            break;
        case 4:
            console.log('Schedule Rule...!');
            rule_name = 'schedule-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 3);

            data = {
                lang: 'GROOVY',
                code: consoleText,
                id: CURRENT_ID,
                pattern: obj.pattern
            }

            break;
        case 6:
            console.log('Binary Rule...!');
            rule_name = 'binary-rule-' + CURRENT_ID;

            data = {
                lang: 'GROOVY',
                code: consoleText,
                type: CURRENT_ID,
            }

            break;
        case 7:
            console.log('Job Rule...!');
            rule_name = 'job-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 7);

            data = {
                "domainKey": DOMAIN_KEY,
                "id": CURRENT_ID,
                "name": "",
                "jobType": obj.jobType,
                "jobState": obj.jobState,
                "jobLanguage": obj.jobLanguage,
                "code": consoleText,
                "instances": obj.instances,
                "startOnBoot": obj.startOnBoot,
                "systemJob": obj.systemJob,
                "resartOnChange": obj.resartOnChange,
            }

            break;
        case 8:
            console.log('File Rule...!');
            rule_name = 'file-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 8);

            data = {
                lang: 'GROOVY',
                code: consoleText,
                type: CURRENT_ID,
                rootPath: obj.rootPath ? obj.rootPath : '',
            }

            break;
        case 9:
            console.log('Process Rule...!');
            rule_name = 'process-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 9);

            delete obj._id;
            obj['code'] = consoleText;

            data = obj;

            break;
     
        case 10:
            console.log('SFTP Rule...!');
            rule_name = 'sftp-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 10);
            delete obj._id;

            data = obj;
            break;
        case 11:
            console.log('MQTT Rule...!');
            rule_name = 'mqtt-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 11);
            delete obj._id;

            data = obj;
            break;
        case 12:
            console.log('UDP Rule...!');
            rule_name = 'udp-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 12);
            delete obj._id;

            data = obj;
            break;
        case 13:
            console.log('TCP Rule...!');
            rule_name = 'tcp-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 13);
            delete obj._id;
            data = obj;

            break;
        case 14:
            console.log('EMAIL Rule...!');
            rule_name = 'email-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 14);
            delete obj._id;

            data = obj;


            break;
        case 15:
            console.log('Micro API Rule...!');
            rule_name = 'micro-rule-' + CURRENT_ID;
            obj = returnObj(CURRENT_ID, 15);
            delete obj._id;

            data = obj;

            break;
    }


    let dObj = {
        type: type,
        data: data
    }

    createDownload(dObj, rule_name);



}


function createDownload(obj, name) {

    saveAndDownload(JSON.stringify(obj), name + '-' + DOMAIN_KEY + '.json', 'application/json', 'exportMsg')

}

function uploadRuleModal() {
    $("#importModal form")[0].reset();
    $("#importFile").val('')
    $("#importModal").modal('show');
}

function uploadRuleType(type, data) {


    switch (type) {
        case 1:
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
            break;
    
        case 2:
            updateMessageRuleCode(data, function (status, resdata) {
                if (status) {
                    loadMessageRulesList(function (status) {
                        if (status) {
                            successMsg('Message Rule Successfully Uploaded!');
                            loadTabbar(data.messageId, 1)
                            $("#importModal").modal('hide');
                        }
                    });
                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }

            })
            break;
        
        case 3:
            updateNamedRuleCode(data, function (status, resdata) {
                if (status) {
                    loadNamedRulesList(function () {
                        successMsg('Named Rule Successfully Uploaded!');
                        loadTabbar(data.name, 2)
                        $("#importModal").modal('hide');
                    });

                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        
        case 4:
            updateScheduleRuleCode(data, function (status, resdata) {
                if (status) {
                    loadScheduleRulesList(function () {
                        successMsg('Schedule Rule Successfully Uploaded!');
                        loadTabbar(data.id, 3)
                        $("#importModal").modal('hide');
                    });
                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        
        case 6:
            updateBinaryRuleCode(data, function (status, resdata) {
                if (status) {
                    loadBinaryRulesList(function () {
                        successMsg('Binary Rule Successfully Uploaded!');
                        loadTabbar(data.type, 6)
                        $("#importModal").modal('hide');
                    });
                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 7:
            updateJobRuleCode(data, function (status, resdata) {
                if (status) {
                    loadJobRulesList(function () {
                        successMsg('Job Rule Successfully Uploaded!');
                        loadTabbar(data.id, 7)
                        $("#importModal").modal('hide');
                    });

                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 8:
            updateFileRuleCode(data, function (status, resdata) {
                if (status) {
                    loadFileRulesList(function () {
                        successMsg('File Rule Successfully Uploaded!');
                        loadTabbar(data.type, 8)
                        $("#importModal").modal('hide');
                    });
                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 9:
            updateProcessRuleCode(data, function (status, resdata) {
                if (status) {
                    loadProcessRulesList(function () {
                        successMsg('Process Rule Successfully Uploaded!');
                        loadTabbar(data.type, 9)
                        $("#importModal").modal('hide');
                    });

                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 10:
            updateInputRuleCode('SFTP', data, function (status, resdata) {
                if (status) {
                    loadSftpRulesList(function () {
                        successMsg('SFTP Rule Successfully Uploaded!');
                        loadTabbar(data.id, 10)
                        $("#importModal").modal('hide');
                    });
                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 11:
            updateInputRuleCode('MQTT', data, function (status, resdata) {
                if (status) {
                    loadMqttRulesList(function () {
                        successMsg('MQTT Rule Successfully Uploaded!');
                        loadTabbar(data.id, 11)
                        $("#importModal").modal('hide');
                    });

                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 12:
            updateInputRuleCode('UDP', data, function (status, resdata) {
                if (status) {
                    loadUdpRulesList(function () {
                        successMsg('UDP Rule Successfully Uploaded!');
                        loadTabbar(data.id, 12)
                        $("#importModal").modal('hide');
                    });

                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 13:
            updateInputRuleCode('TCP', data, function (status, resdata) {
                if (status) {
                    loadTcpRulesList(function () {
                        successMsg('TCP Rule Successfully Uploaded!');
                        loadTabbar(data.id, 13)
                        $("#importModal").modal('hide');
                    });

                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 14:
            updateInputRuleCode('EMAIL', data, function (status, resdata) {
                if (status) {
                    loadEmailRulesList(function () {
                        successMsg('EMAIL Rule Successfully Uploaded!');
                        loadTabbar(data.id, 14)
                        $("#importModal").modal('hide');
                    });

                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
        case 15:
            updateMicroRuleCode(data, function (status, resdata) {
                if (status) {
                    loadMicroRulesList(function () {
                        successMsg('Micro API Rule Successfully Uploaded!');
                        loadTabbar(data.name, 5)
                        $("#importModal").modal('hide');
                    });
                } else {
                    errorMsg('Error in saving!')
                    $("#importModal").modal('hide');
                }
            })
            break;
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

        let resultObj = JSON.parse(content);
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
    let jType = $("#job_type").val();

    if (jType === 'SCALABLE' || jType === 'DISTRIBUTED') {
        $("#job_instance").removeAttr('disabled')
        $("#job_instance").val(1);
    } else {
        $("#job_instance").attr('disabled', 'disabled');
        $("#job_instance").val(1);
    }

    if (ADMIN_ACCESS) {

        if (jType === 'ATOMIC') {
            $("#job_system").attr('disabled', 'disabled')
        } else {
            $("#job_system").removeAttr('disabled')
        }
    }

    if (jType === 'ATOMIC') {
        $("#job_boot").attr('disabled', 'disabled');
    } else {
        $("#job_boot").removeAttr('disabled')
    }
}
let context_list = []

function loadContextList() {
    $.ajax({
        url: API_BASE_PATH + "/global/context/list",
        type: 'GET',
        success: function (data) {
            if (data) {
                $(".contextList").html('');
                let result = data.classes;

                context_list = result.length > 0 ? result : [];

                renderContext();

                for (let i = 0; i < result.length; i++) {

                    let methods = result[i].methods;

                    $(".contextList").append('<p style="text-transform: uppercase"><b>' + result[i].name + '</b></p>');

                    for (let j = 0; j < methods.length; j++) {

                        $(".contextList").append('<p class="codeText" onclick="addContextMethod(\'' + result[i].name + '\',\'' + methods[j].signature + '\',\'' + methods[j].help + '\')"><code>' + methods[j].signature + '</code><br>' +
                            '<small>' + methods[j].help + '</small></p>');
                    }
                }
            }
        },
        error: function (e) {
            errorMsg('Error in fetching context list')

        }
    });
}

function addContextMethod(nam, method, help) {

    let text = '\n//Context Name: ' + nam + '\n//Method: ' + method + '\n//Description: ' + help
    codeEditor.session.insert(codeEditor.getCursorPosition(), text)


}

function filterContext() {
    // Declare variables
    let input = $('#contextSearch').val().toLowerCase();
    let p = $(".contextList").children();

    // Loop through all list items, and hide those who don't match the search query
    for (let i = 0; i < p.length; i++) {

        let txtValue = $(p[i]).html().toLowerCase();;
        if (txtValue.includes(input)) {
            $(p[i]).css('display', 'block')
        } else {
            $(p[i]).css('display', 'none')
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



function renderContext(search, id) {

    if (search || id) {
        $(".contextBody").html('');
    }
    $(".cBody").html('')

    for (let i = 0; i < context_list.length; i++) {

        let val = context_list[i];

        $(".cBody").append('<li class="ml-1 mr-1 ' + (id == val.name ? 'helpHighlight' : '') + '" style="border: 1px solid #eee;padding: 10px 15px">' +
            '<a class="text-dark"  href="javascript:void(0)" onclick="renderContext(\'' + '' + '\',\'' + val.name + '\')">' + val.name + '</a></li>')

        let str = '';

        let flg = false;

        for (let j = 0; j < val.methods.length; j++) {

            let cn = j % 2 == 0 ? 'alternateRow2' : 'alternateRow1'

            let methods = val.methods[j];
            if (search) {

                if (val.name.toLowerCase().includes(search.toLowerCase())
                    || methods.help.toLowerCase().includes(search.toLowerCase())
                    || methods.signature.toLowerCase().includes(search.toLowerCase())) {
                    flg = true
                    str += '<p class="mt-2 "><code>' + val.name + '</code> ' + methods.help + '</p><pre class="' + cn + ' mb-2"><xmp style="font-size: 14px">' + methods.signature + '</xmp></pre>'
                }
            } else {
                str += '<p class="mt-2"><code>' + val.name + '</code> ' + methods.help + '</p><pre class="' + cn + ' mb-2"><xmp style="font-size: 14px">' + methods.signature + '</xmp></pre>'
            }
            if (methods.examples && methods.examples.length > 0) {

                str += '<div style="padding-left: 25px"><h6>Examples:</h6>'

                for (let k = 0; k < methods.examples.length; k++) {

                    str += '<pre class="mb-2"><xmp style="font-size: 12px">' + methods.examples[k] + '</xmp></pre>'

                }
                str += '</div><hr>'
            }


        }
        if (id) {

            if (id == val.name) {
                if (search) {
                    if (flg) {
                        $(".contextBody").append('<div class="col-md-12 mt-1 mb-2 c_' + val.name + '">' +
                            '<hr><h5 style="text-transform: capitalize">' + val.name + '</h5>' +
                            str +
                            '</div>');

                    }
                } else {
                    $(".contextBody").append('<div class="col-md-12 mt-1 mb-2 c_' + val.name + '">' +
                        '<hr><h5 style="text-transform: capitalize">' + val.name + '</h5>' +
                        str +
                        '</div>');

                }
            }
        } else {
            if (search) {
                if (flg) {
                    $(".contextBody").append('<div class="col-md-12 mt-1 mb-2 c_' + val.name + '">' +
                        '<hr><h5 style="text-transform: capitalize">' + val.name + '</h5>' +
                        str +
                        '</div>');

                }
            } else {
                $(".contextBody").append('<div class="col-md-12 mt-1 mb-2 c_' + val.name + '">' +
                    '<hr><h5 style="text-transform: capitalize">' + val.name + '</h5>' +
                    str +
                    '</div>');

            }
        }



    }
}

function loadElasticHelp() {
    $(".elasticBody").html();
    for (let j = 0; j < ELASTIC_QUERY.length; j++) {
        let val = ELASTIC_QUERY[j];
        let str = '<p class="mt-2">' + val.description + '</p><pre class="bg-violet-light-5 mb-2">' +
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


function inputId(source, target) {
    $("." + target).html($.trim($("#" + source).val()).toUpperCase().replace(/\s/g, '_'))
    $("#" + target).val($.trim($("#" + source).val()).toUpperCase().replace(/\s/g, '_'))
}

function addBlock() {
    if ($(".tclass.active").hasClass('outClass')) {
        $(".outputBody").append($("#outputHtml").html());
    } else {
        $(".inputBody").append($("#inputHtml").html());
    }

}

function checkKeyFile(val) {


    if (val == "1") {
        $(".sftp_privateKeyFilePath").css('display', 'block')
        $("#sftp_privateKeyFilePath").attr('required', 'required')
        $(".sftp_publicKeyFilePath").css('display', 'block')
    } else {
        $(".sftp_privateKeyFilePath").css('display', 'none')
        $(".sftp_publicKeyFilePath").css('display', 'none')
        $("#sftp_privateKeyFilePath").removeAttr('required')
    }
}

function checkTcpKeyFile(val) {

    if (val == "1") {
        $(".tcp_ssl").css('display', 'block')
    } else {
        $(".tcp_ssl").css('display', 'none')
    }
}


function checkMqttKeyFile(val) {


    if (val == "1") {
        $(".mqtt_ssl").css('display', 'block')
    } else {
        $(".mqtt_ssl").css('display', 'none')
    }
}

function checkTcpKeyFile(val) {


    if (val == "1") {
        $(".tcp_ssl").css('display', 'block')
    } else {
        $(".tcp_ssl").css('display', 'none')
    }
}
function checkMqttSSL(val) {


    if (val == "1") {
        $(".mqtt_ssl_block").css('display', 'block')
    } else {
        $(".mqtt_ssl_block").css('display', 'none')
    }
}

function checkTcpSSL(val) {


    if (val == "1") {
        $(".tcp_ssl_block").css('display', 'block')
    } else {
        $(".tcp_ssl_block").css('display', 'none')
    }
}

let uploadImage = 'images/generate_claim.svg';


function uploadProcessFile(file) {

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                let result = JSON.parse(xhr.response);
                uploadImage = API_BASE_PATH + '/files/public/download/' + result.id;
                $(".process_img").attr('src', API_BASE_PATH + '/files/public/download/' + result.id + '?' + new Date().getTime());
            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/files/upload/' + API_TOKEN_ALT + '?ispublic=true', true);
    let formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    formData.append("tags", 'process Picture');
    formData.append("description", '');
    xhr.send(formData);
}

function uploadProcessImage() {

    let fileInput = document.getElementById("processIcon");

    let files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    uploadProcessFile(files[0]);

}
let pemFileId = null;
function checkPemFile(id) {
    pemFileId = id;
    $("#pemFile").click()

}


function uploadPemFile() {

    let fileInput = document.getElementById("pemFile");

    let files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    uploadPem(files[0]);

}


function uploadPem(file) {

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                let result = JSON.parse(xhr.response);
                $("#" + pemFileId).val(result.id)
            } else {
                errorMsg('Error in key file upload!');
            }
        }
    };

    $("." + pemFileId + "_name").html(file.name)

    xhr.open('POST', API_BASE_PATH + '/files/upload/' + API_TOKEN_ALT, true);
    let formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    formData.append("tags", 'pem file');
    formData.append("description", '');
    xhr.send(formData);
}



function addConfigBody() {
    let t = new Date().getTime();
    $(".configBody").append('<tr class="' + t + '">' +
        '<td><input type="text" required class="conf_name form-control input-sm"></td>' +
        '<td><input type="text" class="conf_value form-control input-sm"></td>' +
        '<td><button class="btn btn-xs" type="button" onclick="removeConfigBody(\'' + t + '\')">' +
        '<i class="fa fa-trash"></i></button></td>' +
        '</tr>')
}

function removeConfigBody(id) {
    $("." + id).remove();
}

function addMqttBody() {
    let t = new Date().getTime();
    $(".mqttBody").append('<tr class="' + t + '">' +
        '<td><input type="text" required class="mqtt_pattern form-control input-sm"></td>' +
        '<td><input type="number" min="0" required class="mqtt_qos form-control input-sm"></td>' +
        '<td><button class="btn btn-xs" type="button" onclick="removeMqttBody(\'' + t + '\')">' +
        '<i class="fa fa-trash"></i></button></td>' +
        '</tr>')
}

function removeMqttBody(id) {
    $("." + id).remove();
}



function addFolderBody() {
    let t = new Date().getTime();
    $(".folderBody").append('<tr class="' + t + '">' +
        '<td><input type="text" required class="folder_name form-control input-sm"></td>' +
        '<td><select class="folder_markMessageAfterProcessing form-control input-sm">' +
        '<option value="NONE">NONE</option>' +
        '<option value="ANSWERED">ANSWERED</option>' +
        '<option value="DELETED">DELETED</option>' +
        '<option value="DRAFT">DRAFT</option>' +
        '<option value="SEEN">SEEN</option>' +
        '<option value="MOVE">MOVE</option>' +
        '</select></td>' +
        '<td><select class="folder_proccessOnlyFlags form-control input-sm" multiple>' +
        '<option value="ANSWERED">ANSWERED</option>' +
        '<option value="DRAFT">DRAFT</option>' +
        '<option value="SEEN">SEEN</option>' +
        '<option value="RECENT">RECENT</option>' +
        '</select></td>' +
        '<td><input type="text" class="folder_toMovedFolder form-control input-sm"></td>' +
        '<td class="text-center"><button class="btn btn-xs" type="button" onclick="removeFolderBody(\'' + t + '\')">' +
        '<i class="fa fa-trash"></i></button></td>' +
        '</tr>')
}

function removeFolderBody(id) {
    $("." + id).remove();
}

function checkAPI(val) {
    $(".micro_apiKey").css('display', 'none')
    if (val === 'KEY') {
        $(".micro_apiKey").css('display', 'block')
    }
}

let slugId = null;
let methodName = null;
function openAPIModal(mn) {

    methodName = mn ? mn : null;

    $(".micro_apiPath").html(API_BASE_PATH + "/micro/service/call/[METHOD]/")
    $(".microRuleName").html(CURRENT_ID)

    $(".apiBody").html('');

    let microBaseUrl = API_BASE_PATH + "/micro/service/";

    getMicroAPISlug(function (status, data) {
        if (status) {
            $("#micro_apiSlug").val(data)
            slugId = data;
            microBaseUrl += slugId + "/";
        } else {
            $("#micro_apiSlug").val(DOMAIN_KEY)
            microBaseUrl += DOMAIN_KEY + "/";
            slugId = DOMAIN_KEY;
        }
        renderAPIBody(microBaseUrl)

        $("#microAPIModal").modal('show');
    })


}

function renderAPIBody(microBaseUrl) {
    $(".apiBody").html('');
    let obj = {};

    for (let i = 0; i < micro_rules_list.length; i++) {
        if (CURRENT_ID === micro_rules_list[i].name) {
            obj = micro_rules_list[i];
        }
    }

    let methods = obj.methods;

    let methodStr = ''

    if (obj.allowedMethods) {



        for (let i = 0; i < obj.allowedMethods.length; i++) {

            if (obj.allowedMethods[i].toLowercase() == 'get') {
                methodStr += '<option value="get">GET</option>';
            }
            if (obj.allowedMethods[i].toLowercase() == 'post') {
                methodStr += '<option value="post">POST</option>';
            }
            if (obj.allowedMethods[i].toLowercase() == 'delete') {
                methodStr += '<option value="del">DELETE</option>';
            }
            if (obj.allowedMethods[i].toLowercase() == 'put') {
                methodStr += '<option value="put">PUT</option>';
            }
            if (obj.allowedMethods[i].toLowercase() == 'upload') {
                methodStr += '<option value="upload">UPLOAD</option>';
            }
        }
    } else {
        methodStr = '<option value="post">POST</option>' +
            '<option value="get">GET</option>' +
            '<option value="put">PUT</option>' +
            '<option value="del">DELETE</option>' +
            '<option value="upload">UPLOAD</option>';
    }

    for (let i = 0; i < methods.length; i++) {

        let bodyParams = {};

        for (let j = 0; j < methods[i].params.length; j++) {
            bodyParams[methods[i].params[j].name] = methods[i].params[j].type;
        }

        let str = '<form action="javascript:void(0)" onSubmit="simulateAPI(\'' + methods[i].name + '\')"><div class="row mb-2" style="border: 1px solid #eee;padding-bottom: 10px;background-color: #eee"><div class="col-md-12 pt-2 alert alert-warning">' +
            '<select class="' + methods[i].slug + '" onchange="methodChange(\'' + methods[i].slug + '\')">' + methodStr + '</select> <label class="ml-2">' +
            '/' + CURRENT_ID + "/" + methods[i].slug + '</label>' +
            '<input type="file" id="f_' + methods[i].slug + '" style="float:right;display:none" /> ' +
            '</div>' +
            (obj.authType == 'TOKEN' ? '<div class="col-md-3">' +
                '<strong>TOKEN</strong><br><small>String (Header)</small>' +
                '</div>' +
                '<div class="col-md-6">' +
                ' <input class="form-control form-control-sm" onkeyup="avoidSpaces(this)" placeholder=""' +
                'type="text" id="m_' + methods[i].name + '_token" required value="' + API_TOKEN + '">' +
                '</div>' : '') +
            (obj.authType == 'KEY' ? '<div class="col-md-3 mt-1">' +
                '<strong>KEY</strong><br><small>String (Header)</small>' +
                '</div>' +
                '<div class="col-md-6">' +
                ' <input class="form-control form-control-sm" onkeyup="avoidSpaces(this)" placeholder=""' +
                'type="text" id="m_' + methods[i].name + '_key" required value="' + (obj.apiKey ? obj.apiKey : API_KEY) + '">' +
                '</div>' : '') +
            '<div class="col-md-12 mt-1"><div style="display:none" class="mt_' + methods[i].name + '"><strong>Body Params:</strong><small></small>' +
            '<textarea class="form-control form-control-sm" required  id="m_' + methods[i].name + '_params">' + JSON.stringify(bodyParams) + '</textarea>' +
            '<small>Content-Type: <label>application/json</label></small> </div>' +
            '<button type="submit" class="btn btn-sm btn-danger pull-right mt-2">Try It Out</button></div>' +
            '<div class="col-md-12 mt-2 m_' + methods[i].name + '_result"></div> ' +
            '</div></form>'

        if (methodName) {
            if (methodName == methods[i].name) {
                $(".apiBody").append(str);
                methodChange(methods[i].name)
            }
        } else {
            $(".apiBody").append(str);
            methodChange(methods[i].name)
        }

    }
}

function methodChange(nam) {

    let meth = $("." + nam).val();
    $(".m_" + nam + "_result").html('')
    if (meth === 'upload') {
        $("#f_" + nam).css('display', 'block')
        $(".mt_" + nam).css('display', 'none')
    } else if (meth === 'get') {
        $("#f_" + nam).css('display', 'none')
        $(".mt_" + nam).css('display', 'none')
    } else {
        $("#f_" + nam).css('display', 'none')
        $(".mt_" + nam).css('display', 'block')
    }
}

function simulateAPI(nam) {

    let obj = {};

    for (let i = 0; i < micro_rules_list.length; i++) {
        if (CURRENT_ID === micro_rules_list[i].name) {
            obj = micro_rules_list[i];
        }
    }

    let methods = {};


    for (let j = 0; j < obj.methods.length; j++) {
        if (nam === obj.methods[j].name) {
            methods = obj.methods[j];
        }
    }

    let dataObj = JSON.parse($("#m_" + nam + "_params").val())

    executeMicroAPI(slugId, obj.name, methods.slug, dataObj, $("#m_" + nam + "_key").val(), $("#m_" + nam + "_token").val(), obj, function (status, result) {

        $(".m_" + nam + "_result").html("<label>Response: </label><p class='break-word'>" + JSON.stringify(result) + "</p>")
    })

}

function updateAPISlug() {
    let microBaseUrl = API_BASE_PATH + "/micro/service/call/[METHOD]/";
    setMicroAPISlug($("#micro_apiSlug").val(), function (status, data) {
        if (status) {
            successMsg('Successfully updated')
            slugId = $("#micro_apiSlug").val();
            microBaseUrl += slugId + "/";
            renderAPIBody(microBaseUrl)
        } else {
            errorMsg('Error in update')
        }
    })
}


function resetAPISlug() {
    let microBaseUrl = API_BASE_PATH + "/micro/service/call/[METHOD]/";
    deleteMicroAPISlug(slugId, function (status, data) {
        if (status) {
            successMsg('Successfully updated')
            $("#micro_apiSlug").val(DOMAIN_KEY)
            microBaseUrl += DOMAIN_KEY + "/";
            renderAPIBody(microBaseUrl)
        } else {
            errorMsg('Error in update')
        }
    })
}


function toggleHandle(id) {
    if (id === 1) {
        $(".liveBlocks").css('display', 'none')
        $(".bottomBar").css('height', 0)
        $(".btnHandle").html('Live Logs <i class="icon-chevron-up"></i>')
        $(".btnHandle").attr('onclick', 'toggleHandle(2)')
    } else {

        $(".btnHandle").html('Live Logs <i class="icon-chevron-down"></i>')
        $(".liveBlocks").css('display', 'block')
        $(".bottomBar").css('height', 175)
        $(".btnHandle").attr('onclick', 'toggleHandle(1)')
    }

}

function checkSimulateDevices(id, place) {
    $(".simulateBtn").prop("disabled", true)
    var queryParams = {
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "domainKey": DOMAIN_KEY
                        }
                    }
                ],
                "should": []
            }
        },
        "sort": [
            {
                "registeredStamp": {
                    "order": "desc"
                }
            }
        ],
        "size": 100,
        "from": 0
    }
    var ajaxObj = {
        "method": "GET",
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": [],
        "type": 'DEVICE'
    };
    $.ajax({
        "dataType": 'json',
        "contentType": 'application/json',
        "type": "POST",
        "url": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN_ALT,
        "data": JSON.stringify(ajaxObj),
        success: function (data) {
            var resData = searchQueryFormatterNew(data);
            var resultData = resData.data;
            DEVICE_LIST = resultData.data;
            if (DEVICE_LIST.length == 0) {

                $("#addDevice").modal({
                    backdrop: 'static',
                    keyboard: false
                });
                $("#device_id").removeAttr('readonly');
                $("#addDevice form")[0].reset();
                loadDeviceModels('');
                $("#addDevice").modal('show');
                $("#device_desc").css("height", "90");
                $("#addDevice form").attr('onsubmit', 'addDevice(' + id + ')');
                errorMsg('No Devices Added so far!')
                $(".simulateBtn").prop("disabled", false)
            } else {
                openSimulateModal(id, place);
            }
        }
    });

}

function addDevice(id) {
    var device_model = "";
    if (choosemodel) {
        device_model = $.trim($("#device_model").val());
    } else {
        device_model = $.trim($("#new_device_model").val());
    }

    var device_id = $.trim($("#device_id").val());
    var device_name = $.trim($("#device_name").val());
    var device_version = $.trim($("#device_version").val());
    var device_desc = $.trim($("#device_desc").val());

    if (device_id === "") {
        errorMsgBorder('Device ID is required', 'device_id');
        return false;

    } else if (device_name === "") {

        errorMsgBorder('Device Name is required', 'device_name');
        return false;

    } else if (device_model === "") {

        errorMsgBorder('Device Model is required', 'new_device_model');
        return false;

    } else if (device_version === "") {

        errorMsgBorder('Device Version is required', 'device_version');
        return false;


    } else if (device_desc === "") {

        errorMsgBorder('Device Description is required', 'device_desc');
        return false;

    } else {

        let modelstatus = true;
        let modeltext;

        var modelObj = {
            "id": device_model,
            "version": $("#device_version").val(),
            "description": $("#device_desc").val(),
        }

        $(".add-device-proceed").html("<div class='d-flex'><i class='fa fa-spinner fa-spin'></i><p class='pl-2 m-0'>Processing</p></div>").attr("disabled", true);

        async.series({
            SameModelID: function (rmdcbk) {
                if (modelmode === 'new') {
                    retreiveDeviceModel(modelObj.id, function (status, data) {
                        if (status) {
                            modelstatus = false;
                            $(".btnSubmit").removeAttr('disabled');
                            errorMsgBorder('Device Model ID already exist', 'new_device_model');
                            rmdcbk(null, true);
                        } else {
                            modelstatus = true;
                            rmdcbk(null, false);
                        }
                    })
                } else {
                    rmdcbk(null, false);
                }
            },
            TriggerModelCreate: function (mdcbk) {
                // Allow if is not choose - Create Device Model  
                if (modelmode !== 'choose' && modelstatus) {
                    upsertDeviceModel(modelObj, function (status, data) {
                        if (modelmode === 'new') {
                            modeltext = 'Creat'
                        }
                        else {
                            modeltext = 'Updat'
                        }
                        if (status) {
                            successMsg('Device Model ' + modeltext + 'ed Successfully');
                            modelstatus = true;
                            mdcbk(null, true);
                        } else {
                            errorMsg('Error in ' + modeltext + 'ing Device Model')
                            modelstatus = false;
                            mdcbk(null, false);
                        }
                        $(".btnSubmit").removeAttr('disabled');
                    })
                } else {
                    mdcbk(null, false);
                }
            },
            CreateDevice: function (Dcbk) {
                // Device Create  
                if (modelstatus) {
                    var deviceObj = {
                        "id": $("#device_id").val(),
                        "name": $("#device_name").val(),
                        "modelId": device_model,
                        "version": $("#device_version").val(),
                        "description": $("#device_desc").val(),
                    }
                    retreiveDevice(deviceObj.id, function (status, data) {
                        if (status) {
                            $(".btnSubmit").removeAttr('disabled');
                            errorMsgBorder('Device ID already exist', 'device_id');
                            $(".add-device-proceed").html("Proceed").attr("disabled", false);
                            Dcbk(null, false);
                        } else {
                            upsertDevice(deviceObj, function (status, data) {
                                if (status) {
                                    successMsg('Device Created Successfully');
                                    //loadDeviceList();
                                    $("#addDevice").modal('hide');
                                    openSimulateModal(id, 1);
                                    $(".add-device-proceed").html("Proceed").attr("disabled", false);
                                    Dcbk(null, true);
                                } else {

                                    errorMsg('Error in Creating Device')
                                    Dcbk(null, false);
                                }
                                $(".btnSubmit").removeAttr('disabled');
                            })
                        }
                    })
                } else {
                    $(".add-device-proceed").html("Proceed").attr("disabled", false);
                    Dcbk(null, false);
                }
            }

        })
    }

}

function loadDeviceModels(check) {
    $("#device_model").html("");
    let devmodel;
    getDeviceModel(1000, function (status, data) {
        if (status && data.length > 0) {
            device_model_list = data;

            check === 'update' ? '' : $("#device_model").append('<option value="newmodel">- Create New Model</option>');
            for (var i = 0; i < data.length; i++) {
                $("#device_model").append('<option value="' + data[i].id + '">' + data[i].id + '</option>');
                if ($("#device_model").val() === data[i].id) {
                    $("#device_version").html(data[i].description)
                    $("#device_desc").html(data[i].description)
                }
            }

            if ($("#device_model").val() === 'newmodel' && check !== 'update') {
                togglemodel('newmodel');
            } else {
                togglemodel('edit');
            }

        } else {
            device_model_list = [];
        }
    })
}

function toggleHeading(id) {
    $(".rulesListli").removeClass("rules-list-active");
    $(".rule_" + id).addClass("rules-list-active")
}

function rightPanelDetails(clsName) {
    $(".detailsBlock,.processBlock,.inputBlock,.jobFields,.messageFields,.defaultFields").css('display', 'none')
    if (clsName) $(clsName).css('display','block')
}

rightPanelDetails(".detailsBlock")