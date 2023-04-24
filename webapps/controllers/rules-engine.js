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
var commandsList = [];
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
let rulesTree = null;
let treeData = []
var startDate = moment().subtract(6, 'days').startOf('day')
var endDate = moment().endOf('day');
var live_msg_count = 0;
var debugger_count = 0;
var scriptEditor = null;
var otherHeight;
var fullScreenEnable = true 

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

    $(".listHeight").css('height', $(".leftSide").height() - 150)
    $(".loaderBlock").remove();
    $(".classFolder").css('height', $(".rightSide").height() - 150)

    loadCodeType();

    loadRulesEngineTree()

    $('#rules_tree').on('ready.jstree', function () {
        $("#rules_tree").jstree("close_all");
    });

    $(window).resize(function () {
        $(".mainwindow").css('min-height', $(window).height() - 90 + 'px');
        setTimeout(() => {
            $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');
            $('#scriptEditor').height('calc(100vh  - ' + otherHeight + ' + px');
            scriptEditor.resize();
        }, 300);
    });

    footerStsBar()
    otherHeight = $("#header").outerHeight() + $("#header-tab-div").outerHeight() + $("#statusBar").outerHeight() + $(".footer").outerHeight()

});

function loadRulesEngineTree(type) {
    mrData = []
    message_rules_list = [];
    message_spec_list = [];
    schedule_rules_list = [];
    named_rules_list = [];
    binary_rules_list = [];
    job_rules_list = [];
    sftp_rules_list = [];
    mqtt_rules_list = [];
    process_rules_list = [];
    file_rules_list = [];
    treeData = [
        {
            id: "MSG_RULE", // will be autogenerated if omitted
            text: "Message Rule", // node text
            icon: "fa fa-folder text-warning", // string for custom
            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "NAMED_RULE", // will be autogenerated if omitted
            text: "Named Rule", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "SCHEDULE_RULE", // will be autogenerated if omitted
            text: "Schedule Rule", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "BINARY_RULE", // will be autogenerated if omitted
            text: "Binary Rule", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "JOB_RULE", // will be autogenerated if omitted
            text: "Job Rule", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "FILE_RULE", // will be autogenerated if omitted
            text: "File Rule", // node text
            icon: "fa fa-folder text-warning", // string for custom
            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "PROCESS_RULE", // will be autogenerated if omitted
            text: "Process Rule", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "SFTP_INPUT", // will be autogenerated if omitted
            text: "SFTP Input", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "MQTT_INPUT", // will be autogenerated if omitted
            text: "MQTT Input", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "UDP_INPUT", // will be autogenerated if omitted
            text: "UDP Input", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "TCP_INPUT", // will be autogenerated if omitted
            text: "TCP Input", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "EMAIL_INPUT", // will be autogenerated if omitted
            text: "Email Input", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        },
        {
            id: "MICRO_API_Rule", // will be autogenerated if omitted
            text: "Micro Api Rule", // node text
            icon: "fa fa-folder text-warning", // string for custom

            state: {
                opened: true, // is the node open
                disabled: false, // is the node disabled
                selected: false, // is the node selected
            },
            children: [], // array of strings or objects
            li_attr: {}, // attributes for the generated LI node
            a_attr: {}, // attributes for the generated A node
        }
    ]

    loadDomainCode(function () {
        current_tab_id = "domainrule";
        if (rulesTree) {
            $("#rules_tree").jstree("destroy");
        }
        rulesTree = $("#rules_tree").jstree({
            core: {
                check_callback: true,
                data: treeData,
            },
            plugins: ["contextmenu"],
            contextmenu: {
                items: customTreeMenu,
            },
        });

        if (type === 'expand') {
            $('#rules_tree').on('ready.jstree', function () {
                $("#rules_tree").jstree("open_all");
            });
        } else {
            $('#rules_tree').on('ready.jstree', function () {
                $("#rules_tree").jstree("close_all");
            });
        }
        $("#rules_tree").on("activate_node.jstree", function (e, data) {
            if (
                data == undefined ||
                data.node == undefined ||
                data.node.id == undefined ||
                data.node.original == undefined
            )
                return;
            clickedObj = data.node;
            if (data.node.li_attr && data.node.li_attr.type) {
                const megname = data.node.original.messageName
                    ? data.node.original.messageName
                    : "";
                loadTabbar( // gtab name and code
                    data.node.text,
                    data.node.li_attr.type,
                    data.node.id,
                );
            }
        });
        setTimeout(() => {
            allRulesCalled()
        }, 1000);
    })

    $("#rules_tree").bind("hover_node.jstree", function (e, data) {
        if (data && data.node && data.node.id) {
            $('#' + data.node.id).attr('title', data.node.text)
        }
    })
}

function customTreeMenu(node) {
    var menuItem = {};
    return menuItem;

    if (node["li_attr"]["type"]) {
        menuItem = {
            copyItem: {
                label: "Copy",
                icon: "images/copy.png",
                action: function () {
                    var type = clickedObj.li_attr.type;
                    var uid = clickedObj.id;
                    var id = type + "_" + uid;
                    clipboard.data = rulesEditor[id].getSession().getValue();
                    if (window.clipboardData) {
                        window.clipboardData.setData("Text", clipboard.data);
                    } else {
                        clipboard.intercept = true;
                        document.execCommand("copy");
                    }
                    successMsg("Code copied successfully");
                },
            },
        };
        if (clickedObj.li_attr.type == 2) {
            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "images/edit.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });
                        var msgfileName = clickedObj.id.split("_")
                        $("#renderBlock").html($("#messageRule").html());
                        $("#msg_id").attr("disabled", "disabled");
                        $("#msg_id").val(msgfileName[1])
                        $('.templateAction').html('<span class="cursor-pointer" title="Back" onclick="openModal()"><i class="fa fa-arrow-left"></i></span> Update Message Rule - ' + msgfileName[1])
                        $('#assign_wf').html('')
                        for (var i = 0; i < CREATE_TYPE.length; i++) {
                            $("#msg_type").append(
                                '<option value="' + CREATE_TYPE[i] + '">' + CREATE_TYPE[i] + "</option"
                            );
                        }
                        $("#msgruleForm").removeAttr('onsubmit')
                        $("#msgruleForm").attr("onsubmit", "updateMsgModule()")

                        for (var w = 0; w < workflow_list.length; w++) {

                            $('#assign_wf').append('<option value="' + workflow_list[w].id + '">' + workflow_list[w].name + '</option>')

                        }
                        setTimeout(() => {
                            $('#assign_wf').select2({
                                dropdownParent: $('#addRule'),
                                "placeholder": "Choose Workflow"
                            })
                        }, 100);



                        updatemsgDetails(msgfileName[1]);
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#msgcloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_message_id').val('')
                        $('#new_message_name').val('')
                        $('#new_message_id').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })
                        $('#new_message_name').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })
                        $('.clone_msg_name').html(clickedObj.text)

                        $('.msgcloneWork').attr('onclick', 'msgcloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (clickedObj.li_attr.type == 14) {
            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "images/edit.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });
                        var msgfileName = clickedObj.id.split("_")
                        $("#renderBlock").html($("#microapi_rule").html());
                        loadmicroresultEditor('')
                        $("#micro_rule").attr("disabled", "disabled");
                        $("#micro_rule").val(msgfileName[1])
                        $('.templateAction').html('<span class="cursor-pointer" title="Back" onclick="openModal()"><i class="fa fa-arrow-left"></i></span> Update Micor Api Rule - ' + msgfileName[1])

                        $("#microruleform").removeAttr('onsubmit')
                        $("#microruleform").attr("onsubmit", "updatemicroRuleModule()")



                        updatemicroRuleDetails(msgfileName[1]);
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#microapicloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_microapi_id').val('')
                        $('#new_microapi_id').css({
                            "border-bottom": "1px solid #ccc"
                        })

                        $('.clone_microapi_name').html(clickedObj.text)

                        $('.microcloneWork').attr('onclick', 'microcloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (clickedObj.li_attr.type == 10) {
            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "images/edit.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });
                        var fileName = clickedObj.id.split("-")
                        $("#renderBlock").html($("#fileRule").html());
                        $("#fileruleId").attr("disabled", "disabled");
                        $("#fileruleId").val(fileName[1])
                        $('.templateAction').html('<span class="cursor-pointer" title="Back" onclick="openModal()"><i class="fa fa-arrow-left"></i></span> Update File Rule - ' + fileName[1])
                        $('#assign_wf').html('')

                        $("#fileRuleForm").removeAttr('onsubmit')
                        $("#fileRuleForm").attr("onsubmit", "updateFileModule()")

                        for (var w = 0; w < workflow_list.length; w++) {

                            $('#assign_wf').append('<option value="' + workflow_list[w].id + '">' + workflow_list[w].name + '</option>')

                        }
                        setTimeout(() => {
                            $('#assign_wf').select2({
                                dropdownParent: $('#addRule'),
                                "placeholder": "Choose Workflow"
                            })
                        }, 100);



                        updateFileDetails(fileName[1]);
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#FilecloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_file_name').val('')
                        $('#new_file_name').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })

                        $('.clone_file_name').html(clickedObj.text)

                        $('.filecloneWork').attr('onclick', 'filecloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (clickedObj.li_attr.type == 5) {
            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "images/edit.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });
                        var binaryfileName = clickedObj.id.split("_")
                        $("#renderBlock").html($("#binaryRule").html());
                        $("#binary_rule").attr("disabled", "disabled");
                        $("#binary_rule").val(binaryfileName[1])
                        $('.templateAction').html('<span class="cursor-pointer" title="Back" onclick="openModal()"><i class="fa fa-arrow-left"></i></span> Update Binary Rule - ' + binaryfileName[1])
                        $('#assign_wf').html('')

                        $("#binaryRuleform").removeAttr('onsubmit')
                        $("#binaryRuleform").attr("onsubmit", "updateBinaryModule()")

                        for (var w = 0; w < workflow_list.length; w++) {

                            $('#assign_wf').append('<option value="' + workflow_list[w].id + '">' + workflow_list[w].name + '</option>')

                        }
                        setTimeout(() => {
                            $('#assign_wf').select2({
                                dropdownParent: $('#addRule'),
                                "placeholder": "Choose Workflow"
                            })
                        }, 100);



                        updateBinaryDetails();
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#BinarycloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_binary_name').val('')
                        $('#new_binary_name').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })
                        clonechangeId(null)
                        $('.clone_binary_name').html(clickedObj.text)

                        $('.binarycloneWork').attr('onclick', 'BianrycloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (clickedObj.li_attr.type == 7) {
            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "images/edit.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });

                        $("#renderBlock").html($("#sftpInput").html());
                        $(".configAdderPlus").removeAttr('onclick');
                        $(".configAdderPlus").attr("onclick", "addBlock(1)")
                        $(".configAdder").removeAttr('onclick');
                        $(".configAdder").attr("onclick", "addBlock(1)")
                        $("#sftp_input_name").attr("disabled", "disabled");

                        $('#assign_wf').html('')

                        for (var w = 0; w < workflow_list.length; w++) {

                            $('#assign_wf').append('<option value="' + workflow_list[w].id + '">' + workflow_list[w].name + '</option>')

                        }
                        setTimeout(() => {
                            $('#assign_wf').select2({
                                dropdownParent: $('#addRule'),
                                "placeholder": "Choose Workflow"
                            })
                        }, 100);

                        $("#sftp-wizard-holder").steps({
                            headerTag: "h3",
                            bodyTag: "section",
                            transitionEffect: "slideLeft",
                            autoFocus: true,
                            enableCancelButton: true,
                            // enableAllSteps: true,
                            onStepChanging: function (event, currentIndex, newIndex) {
                                $(".input-sm")
                                    .addClass("input-border-default")
                                    .removeClass("input-border-err");

                                if (currentIndex == 0) {

                                    var configData = $("#addRule .config_key").map(function () {
                                        if ($(this).val()) {
                                            return $(this).val();
                                        }
                                    })
                                        .get();
                                    var dupdata2 = getDistinctArray(configData);


                                    if ($("#sftp_input_name").val() === "") {

                                        showFeedback('sftp_input_name', 'Input name is required!', 're_feedbackDiv');
                                        $('#sftp_input_name').keyup(function (e) {
                                            if ($("#sftp_input_name").val() != "") {
                                                defaultStyle('re_feedbackDiv')
                                            }

                                        })
                                        return false;
                                    } else if (dupdata2.length > 0) {
                                        showFeedback('config_key', 'Config key is duplicated!', 're_feedbackDiv');
                                        $('.config_key').keyup(function (e) {
                                            if ($(".config_key").val() != "") {
                                                defaultStyle('re_feedbackDiv')
                                            }

                                        })
                                        return false;

                                    } else {
                                        if ($('#sftp_instance_type').val() == "SCALABLE" && $("#sftp_input_instance").val() == 0) {
                                            simpleFeedback(
                                                "centerswitch1",
                                                "Scalable instance should not be Zero",
                                                "error"
                                            );
                                            $("#sftp_input_instance")
                                                .focus()
                                                .css("border-color", "#ed1622");
                                            return false;
                                        } else if ($('#sftp_instance_type').val() == "DISTRIBUTED" && $("#sftp_input_instance").val() == 0) {
                                            simpleFeedback(
                                                "centerswitch1",
                                                "Distributed instance should not be Zero",
                                                "error"
                                            );
                                            $("#sftp_input_instance")
                                                .focus()
                                                .css("border-color", "#ed1622");
                                            return false;
                                        }
                                        else {

                                            $(".content").scrollTop(0);

                                            return true;
                                        }
                                    }
                                } else if (currentIndex == 1) {
                                    if (!(newIndex == 0)) {
                                        var remote_pathData = $(".path_value").map(function () {
                                            if ($(this).val()) {
                                                return $(this).val();
                                            }
                                        })
                                            .get();
                                        var dupdata_remote = getDistinctArray(remote_pathData);

                                        if (
                                            $("#sftp_input_remote_host").val() === "" ||
                                            $("#userName").val() === "" || ($('#assignwf_check').is(':checked') && (($('#assign_wf').val() == null) || ($('#assign_wf').val() == "")))
                                        ) {
                                            if ($("#sftp_input_remote_host").val() === "") {
                                                showFeedback('sftp_input_remote_host', 'Remote host is required!', 're_feedbackDiv');
                                                $('#sftp_input_remote_host').keyup(function (e) {
                                                    if ($("#sftp_input_remote_host").val() != "") {
                                                        defaultStyle('re_feedbackDiv')
                                                    }

                                                })
                                                return false;
                                            } else if ($("#userName").val() === "") {

                                                showFeedback('userName', 'User name is required!', 're_feedbackDiv');
                                                $('#userName').keyup(function (e) {
                                                    if ($("#userName").val() != "") {
                                                        defaultStyle('re_feedbackDiv')
                                                    }
                                                })
                                                return false;
                                            } else {
                                                showFeedback('assign_wf', 'Workflow needs to be assigned!', 're_feedbackDiv');
                                                $('#assign_wf').change(function (e) {
                                                    if ($("#assign_wf").val() != "") {
                                                        defaultStyle('re_feedbackDiv')
                                                    }
                                                })
                                            }
                                            return false;
                                        } else if (dupdata_remote.length > 0) {
                                            showFeedback("path_value", "Remote Path Name Duplicated", "re_feedbackDiv");
                                            return false;
                                        } else {
                                            defaultStyle('re_feedbackDiv')

                                            return true;
                                        }
                                    } else {
                                        return true;

                                    }
                                } else {
                                    defaultStyle('re_feedbackDiv')

                                    return true;
                                }
                            },
                            onFinishing: function (event, currentIndex) {
                                if (event.currentTarget.id === "sftp-wizard-holder") {

                                    updateSFTPInput();
                                }
                            },
                        });
                        $("#assignwf_check").removeAttr('onchange');
                        $("#assignwf_check").attr("onchange", "assigncheckChange()");
                        $("#pri_exist_file_true").prop("checked", false);
                        $("#pub_exist_file_true").prop("checked", false);
                        $("#privateFile_existing")
                            .removeClass("d-none")
                            .addClass("d-block");
                        $("#publicFile_existing").removeClass("d-none").addClass("d-block");
                        $("#privateFile").removeClass("d-block").addClass("d-none");
                        $("#publicFile").removeClass("d-block").addClass("d-none");
                        chooseExistingFile(1, "sftp");
                        chooseExistingFile(2, "sftp");
                        // $("#SFTP_INPUT_Update").steps({
                        //     headerTag: "h3",
                        //     bodyTag: "section",
                        //     transitionEffect: "slideLeft",
                        //     autoFocus: true,
                        //     enableAllSteps: true,
                        // });

                        updateSftpDetails();
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#cloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_sftp_name').val('')
                        $('#new_sftp_name').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })
                        clonechangeId(null)
                        $('.clone_sftp_name').html(clickedObj.text)

                        $('.cloneWork').attr('onclick', 'cloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (clickedObj.li_attr.type == 8) {

            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "fa fa-pencil",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        // var uid = clickedObj.id;
                        // var id = type + '_' + uid;
                        current_tab_id = clickedObj.id;

                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });
                        $("#renderBlock").html($("#mqttInput").html());
                        $("#mqtt_input_name").addClass("disabled");
                        $(".configAdderPlus").removeAttr('onclick');
                        $(".configAdderPlus").attr("onclick", "updateBlockmqtt(1)")
                        $(".configAdder").removeAttr('onclick');
                        $(".configAdder").attr("onclick", "updateBlockmqtt(1)")
                        $("#mqtt_wf").prop("checked", false);

                        $(".sharesub").removeAttr('onclick');
                        $(".sharesub").attr("onclick", "addsubmqttwfUp(2)")

                        $(".staticsub").removeAttr('onclick');
                        $(".staticsub").attr("onclick", "addsubmqttUp(1)")

                        $(".defaultsub").removeAttr('onclick');
                        $(".defaultsub").attr("onclick", "adddefaultsubUp(1)")

                        $('#selectwf').html('')
                        if ($("#mqtt_wf").prop("checked") == false) {
                            $(' .append-default').addClass('d-block').removeClass('d-none')
                        }
                        // $(".remPathAdderPlus").removeAttr('onclick');
                        // $(".remPathAdderPlus").attr("onclick","addsubmqttwf(2)")
                        for (var w = 0; w < workflow_list.length; w++) {

                            $(' #selectwf').append('<option value="' + workflow_list[w].id + '">' + workflow_list[w].name + '</option>')

                        }
                        setTimeout(() => {
                            $(' #selectwf').select2({
                                dropdownParent: $('')
                            })
                        }, 100);

                        $("#mqtt_wf").removeAttr('onchange');
                        $("#mqtt_wf").attr("onchange", "mqtt_assignUp(2)")
                        $("#staticType_mqtt").removeAttr('onchange');
                        $("#staticType_mqtt").attr("onchange", "typeChangemqtt1(3)")
                        $("#sharedType_mqtt").removeAttr('onchange');
                        $("#sharedType_mqtt").attr("onchange", "typeChangemqtt1(4)")

                        $("#mqtt_ssl").removeAttr('onchange');
                        $("#mqtt_ssl").attr("onchange", "ssl_mqttUp()")

                        $("#mqtt_sslStore_buildin").removeAttr('onchange');
                        $("#mqtt_sslStore_buildin").attr("onchange", "sslStoreBuiltIn_mqttUp()")


                        $("#mqtt-wizard").steps({
                            headerTag: "h3",
                            bodyTag: "section",
                            transitionEffect: "slideLeft",
                            autoFocus: true,
                            enableCancelButton: true,

                            // enableAllSteps: true,
                            onStepChanging: function (event, currentIndex, newIndex) {
                                $(".input-sm")
                                    .addClass("input-border-default")
                                    .removeClass("input-border-err");
                                var configData = $(".config_key_mqtt").map(function () {
                                    if ($(this).val()) {
                                        return $(this).val();
                                    }
                                })
                                    .get();
                                var dupdata2 = getDistinctArray(configData);

                                if ($("#mqtt_input_name").val() === "") {

                                    showFeedback('mqtt_input_name', 'Input Name is required!', 'mqttfeedbackDiv');
                                    $('#mqtt_input_name').keyup(function (e) {
                                        if ($("#mqtt_input_name").val() != "") {
                                            defaultStyle('mqttfeedbackDiv')
                                        }

                                    })
                                    return false;
                                } else if (dupdata2.length > 0) {
                                    showFeedback('config_key_mqtt', 'Config key name is duplicated', 'mqttfeedbackDiv');
                                    $('.config_key_mqtt').keyup(function (e) {
                                        if ($(".config_key_mqtt").val() != "") {
                                            defaultStyle('mqttfeedbackDiv')
                                        }

                                    })
                                    return false;

                                } else {
                                    if ($('#mqtt_instance_type').val() == "SCALABLE" && $("#mqtt_input_instance").val() == 0) {

                                        showFeedback('mqtt_input_instance', 'Scalable instance should not be Zero!', 'mqttfeedbackDiv');
                                        $('#mqtt_input_instance').keyup(function (e) {
                                            if ($("#mqtt_input_instance").val() != "") {
                                                defaultStyle('mqttfeedbackDiv')
                                            }

                                        })
                                        return false;
                                    } else if ($('#mqtt_instance_type').val() == "DISTRIBUTED" && $("#mqtt_input_instance").val() == 0) {

                                        showFeedback('mqtt_input_instance', 'Distributed instance should not be Zero!', 'mqttfeedbackDiv');
                                        $('#mqtt_input_instance').keyup(function (e) {
                                            if ($("#mqtt_input_instance").val() != "") {
                                                defaultStyle('mqttfeedbackDiv')
                                            }

                                        })
                                        return false;
                                    } else {
                                        $(".content").scrollTop(0);

                                        return true;
                                    }
                                }
                            },
                            onFinishing: function (event, currentIndex) {
                                if ($('#mqtt_wf').is(':checked')) {
                                    if ($('#selectwf').val() == "" || $('#selectwf').val() == null) {
                                        showFeedback('selectwf', 'Workflow needs to be assigned!', 'mqttfeedbackDiv');
                                        $('#selectwf').change(function (e) {
                                            if ($("#selectwf").val() != "") {
                                                defaultStyle('mqttfeedbackDiv')
                                            }

                                        })
                                        return false;
                                    }
                                }
                                updatemqttInput();
                            },
                        });
                        $("#ssl_pri_exist_file_true").prop("checked", false);
                        $("#ssl_pub_exist_file_true").prop("checked", false);
                        $("#ssl_privateFile_existing")
                            .removeClass("d-none")
                            .addClass("d-block");
                        $("#ssl_publicFile_existing")
                            .removeClass("d-none")
                            .addClass("d-block");
                        $("#ssl_privateFile").removeClass("d-block").addClass("d-none");
                        $("#ssl_publicFile").removeClass("d-block").addClass("d-none");
                        chooseExistingFile(1, "mqtt");
                        chooseExistingFile(2, "mqtt");

                        updatemqttDetails();
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#mqttcloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_mqtt_name').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })
                        $('#new_mqtt_name').val('')
                        mqttclonechangeId(null)
                        $('.clone_mqtt_name').html(clickedObj.text)

                        $('.mqttcloneWork').attr('onclick', 'mqttcloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (clickedObj.li_attr.type == 9) {
            menuItem["updateItem"] = {
                label: "Edit",
                icon: "fa fa-pencil",
                action: function () {
                    current_tab_id = clickedObj.id;

                    $("#addRule").modal({
                        backdrop: "static",
                        keyboard: false,
                    });
                    $("#ProcessfooterBody").html("");
                    $("#renderBlock").html($("#formHtml").html());
                    $("#ProcessfooterBody").html($("#ProcessfooterHtml").html())
                    $('.templateAction').html('Update Process - "' + clickedObj.id + '"')
                    processAppend(clickedObj.id)
                }
            }
        }
        if (clickedObj.li_attr.type == 6) {
            menuItem["updateItem"] = {
                label: "Edit",
                icon: "images/edit.png",
                action: function () {
                    // var type = clickedObj.li_attr.type;
                    current_tab_id = clickedObj.id;
                    // var id = type + '_' + uid;
                    var selectedId = current_tab_id.split('_')
                    selectedId = selectedId[1]
                    $("#addRule").modal({
                        backdrop: "static",
                        keyboard: false,
                    });
                    $(".templateAction").html(
                        'Update Job Rule'
                    );
                    $("#renderBlock").html($("#jobRule").html());
                    $("#render_footer").html("");
                    jobruleObj = {};
                    for (var m = 0; m < job_rules_list.length; m++) {
                        if (selectedId === job_rules_list[m].id) {
                            jobruleObj = job_rules_list[m]
                            $('#job_rule').val(jobruleObj.id).attr('disabled', 'disabled')
                            $('#job_type').val(jobruleObj.jobType)
                            $('#job_lang').val(jobruleObj.jobLanguage)
                            $('#job_instance').val(jobruleObj.instances)
                            $('#job_state').val(jobruleObj.jobState)
                            if (jobruleObj.startOnBoot) {
                                $('#job_boot').val("1")
                            } else {
                                $('#job_boot').val("0")
                            }
                            if (jobruleObj.resartOnChange) {
                                $('#job_restart').val("1")
                            } else {
                                $('#job_restart').val("0")
                            }
                            $("#jobruleForm").removeAttr('onsubmit')
                            $("#jobruleForm").attr("onsubmit", "updateJobModule()")



                        }
                    }

                },
            };
        }
        if (clickedObj.li_attr.type == 11) {
            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "images/edit.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });

                        $("#renderBlock").html($("#udpInput").html());
                        $(".configAdderPlus").removeAttr('onclick');
                        $(".configAdderPlus").attr("onclick", "addBlock(1)")
                        $(".configAdder").removeAttr('onclick');
                        $(".configAdder").attr("onclick", "addBlock(1)")
                        $("#udp_input_name").attr("disabled", "disabled");

                        $('#assign_wf').html('')

                        for (var w = 0; w < workflow_list.length; w++) {

                            $('#assign_wf').append('<option value="' + workflow_list[w].id + '">' + workflow_list[w].name + '</option>')

                        }
                        setTimeout(() => {
                            $('#assign_wf').select2({
                                dropdownParent: $('#addRule'),
                                "placeholder": "Choose Workflow"
                            })
                        }, 100);

                        $("#udp-wizard-holder").steps({
                            headerTag: "h3",
                            bodyTag: "section",
                            transitionEffect: "slideLeft",
                            autoFocus: true,
                            enableCancelButton: true,
                            // enableAllSteps: true,
                            onStepChanging: function (event, currentIndex, newIndex) {
                                $(".input-sm")
                                    .addClass("input-border-default")
                                    .removeClass("input-border-err");

                                if (currentIndex == 0) {

                                    var configData = $("#addRule .config_key").map(function () {
                                        if ($(this).val()) {
                                            return $(this).val();
                                        }
                                    })
                                        .get();
                                    var dupdata2 = getDistinctArray(configData);


                                    if ($("#udp_input_name").val() === "") {

                                        showFeedback('config_key', 'Config key name is Duplicated!', 're_feedbackDiv_udp');
                                        $('.config_key').keyup(function (e) {
                                            if ($(".config_key").val() != "") {
                                                defaultStyle('re_feedbackDiv_udp')
                                            }

                                        })
                                        return false;
                                    } else if (dupdata2.length > 0) {
                                        showFeedback('config_key', 'Config key is duplicated!', 're_feedbackDiv_udp');
                                        $('.config_key').keyup(function (e) {
                                            if ($(".config_key").val() != "") {
                                                defaultStyle('re_feedbackDiv_udp')
                                            }

                                        })
                                        return false;

                                    } else {
                                        if ($('#udp_instance_type').val() == "SCALABLE" && $("#udp_instance_type").val() == 0) {
                                            simpleFeedback(
                                                "centerswitch1",
                                                "Scalable instance should not be Zero",
                                                "error"
                                            );
                                            $("#udp_input_instance")
                                                .focus()
                                                .css("border-color", "#ed1622");
                                            return false;
                                        } else if ($('#udp_instance_type').val() == "DISTRIBUTED" && $("#udp_instance_type").val() == 0) {
                                            simpleFeedback(
                                                "centerswitch1",
                                                "Distributed instance should not be Zero",
                                                "error"
                                            );
                                            $("#udp_input_instance")
                                                .focus()
                                                .css("border-color", "#ed1622");
                                            return false;
                                        }
                                        else {

                                            $(".content").scrollTop(0);

                                            return true;
                                        }
                                    }
                                } else if (currentIndex == 1) {

                                    if (!(newIndex == 0)) {

                                        if (
                                            $("#udp_rules_listen_host").val() === "" ||
                                            $("#udp_input_remote_port").val() === ""
                                        ) {
                                            if ($("#udp_rules_listen_host").val() === "") {

                                                showFeedback('udp_rules_listen_host', 'Listen host is required!', 're_feedbackDiv_udp');
                                                $('#udp_rules_listen_host').keyup(function (e) {
                                                    if ($("#udp_rules_listen_host").val() != "") {
                                                        defaultStyle('re_feedbackDiv_udp')
                                                    }

                                                })
                                            } else {

                                                showFeedback('udp_input_remote_port', 'Remote Port is required!', 're_feedbackDiv_udp');
                                                $('#udp_input_remote_port').keyup(function (e) {
                                                    if ($("#udp_input_remote_port").val() != "") {
                                                        defaultStyle('re_feedbackDiv_udp')
                                                    }

                                                });
                                                return false;
                                            }
                                        } else if (($("#udp_assignwf_check").prop("checked"))) {
                                            if ($("#udp_assign_wf").val()) {
                                                defaultStyle('re_feedbackDiv_udp')

                                                return true;
                                            } else {
                                                showFeedback('udp_assign_wf', ' Workflow needs to be assigned!', 're_feedbackDiv_udp');
                                                $('#udp_assign_wf').change(function (e) {
                                                    if ($("#udp_assign_wf").val() != "") {
                                                        defaultStyle('re_feedbackDiv_udp')
                                                    }

                                                })
                                                return false;

                                            }
                                        }





                                        else {
                                            defaultStyle('re_feedbackDiv_udp')

                                            return true;
                                        }
                                    } else {
                                        return true;

                                    }
                                } else {
                                    defaultStyle('re_feedbackDiv_udp')

                                    return true;
                                }
                            },
                            onFinishing: function (event, currentIndex) {
                                if (event.currentTarget.id === "udp-wizard-holder") {

                                    updateUDPInput();
                                }
                            },
                        });
                        $("#assignwf_check").removeAttr('onchange');
                        $("#assignwf_check").attr("onchange", "assigncheckChange()");



                        updateUdpDetails();
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#udpcloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_udp_name').val('')
                        $('#new_udp_name').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })
                        udpclonechangeId(null)
                        $('.clone_udp_name').html(clickedObj.text)

                        $('.udpcloneWork').attr('onclick', 'udpcloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (clickedObj.li_attr.type == 12) {
            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "images/edit.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });

                        $("#renderBlock").html($("#tcpInput").html());
                        $(".configAdderPlus").removeAttr('onclick');
                        $(".configAdderPlus").attr("onclick", "addBlock(1)")
                        $(".configAdder").removeAttr('onclick');
                        $(".configAdder").attr("onclick", "addBlock(1)")
                        $("#tcp_input_name").attr("disabled", "disabled");

                        $('#assign_wf').html('')

                        for (var w = 0; w < workflow_list.length; w++) {

                            $('#assign_wf').append('<option value="' + workflow_list[w].id + '">' + workflow_list[w].name + '</option>')

                        }
                        setTimeout(() => {
                            $('#assign_wf').select2({
                                dropdownParent: $('#addRule'),
                                "placeholder": "Choose Workflow"
                            })
                        }, 100);

                        $("#tcp-wizard-holder").steps({
                            headerTag: "h3",
                            bodyTag: "section",
                            transitionEffect: "slideLeft",
                            autoFocus: true,
                            enableCancelButton: true,
                            // enableAllSteps: true,
                            onStepChanging: function (event, currentIndex, newIndex) {
                                $(".input-sm")
                                    .addClass("input-border-default")
                                    .removeClass("input-border-err");

                                if (currentIndex == 0) {

                                    var configData = $("#addRule .config_key").map(function () {
                                        if ($(this).val()) {
                                            return $(this).val();
                                        }
                                    })
                                        .get();
                                    var dupdata2 = getDistinctArray(configData);


                                    if ($("#tcp_input_name").val() === "") {

                                        showFeedback('config_key', 'Config key name is Duplicated!', 're_feedbackDiv_tcp');
                                        $('.config_key').keyup(function (e) {
                                            if ($(".config_key").val() != "") {
                                                defaultStyle('re_feedbackDiv_tcp')
                                            }

                                        })
                                        return false;
                                    } else if (dupdata2.length > 0) {
                                        showFeedback('config_key', 'Config key is duplicated!', 're_feedbackDiv_tcp');
                                        $('.config_key').keyup(function (e) {
                                            if ($(".config_key").val() != "") {
                                                defaultStyle('re_feedbackDiv_tcp')
                                            }

                                        })
                                        return false;

                                    } else {
                                        if ($('#tcp_instance_type').val() == "SCALABLE" && $("#tcp_instance_type").val() == 0) {
                                            simpleFeedback(
                                                "centerswitch1",
                                                "Scalable instance should not be Zero",
                                                "error"
                                            );
                                            $("#tcp_input_instance")
                                                .focus()
                                                .css("border-color", "#ed1622");
                                            return false;
                                        } else if ($('#tcp_instance_type').val() == "DISTRIBUTED" && $("#tcp_instance_type").val() == 0) {
                                            simpleFeedback(
                                                "centerswitch1",
                                                "Distributed instance should not be Zero",
                                                "error"
                                            );
                                            $("#tcp_input_instance")
                                                .focus()
                                                .css("border-color", "#ed1622");
                                            return false;
                                        }
                                        else {

                                            $(".content").scrollTop(0);

                                            return true;
                                        }
                                    }
                                } else if (currentIndex == 1) {

                                    if (!(newIndex == 0)) {
                                        if (
                                            $("#tcp_rules_listen_host").val() === "" ||
                                            $("#tcp_rules_listen_port").val() === ""
                                        ) {
                                            if ($("#tcp_rules_listen_host").val() === "") {

                                                showFeedback('tcp_rules_listen_host', 'Listen host is required!', 're_feedbackDiv_tcp');
                                                $('#tcp_rules_listen_host').keyup(function (e) {
                                                    if ($("#tcp_rules_listen_host").val() != "") {
                                                        defaultStyle('re_feedbackDiv_tcp')
                                                    }

                                                })
                                            } else {

                                                showFeedback('tcp_rules_listen_port', 'Listen Port is required!', 're_feedbackDiv_tcp');
                                                $('#tcp_rules_listen_port').keyup(function (e) {
                                                    if ($("#tcp_rules_listen_port").val() != "") {
                                                        defaultStyle('re_feedbackDiv_tcp')
                                                    }

                                                })
                                            }
                                            return false;
                                        } else {
                                            defaultStyle('re_feedbackDiv_tcp')

                                            return true;
                                        }
                                    } else {
                                        return true;

                                    }
                                } else {
                                    defaultStyle('re_feedbackDiv_tcp')

                                    return true;
                                }
                            },
                            onFinishing: function (event, currentIndex) {
                                if (event.currentTarget.id === "tcp-wizard-holder") {
                                    if ($('#tcp_assignwf_check').is(':checked')) {
                                        if ($('#tcp_assign_wf').val() === "" || $('#tcp_assign_wf').val() === null) {
                                            showFeedback('tcp_assign_wf', 'Workflow needs to be assigned!', 're_feedbackDiv_tcp');
                                            $('#tcp_assign_wf').change(function (e) {
                                                if ($("#tcp_assign_wf").val() != "") {
                                                    defaultStyle('re_feedbackDiv_tcp')
                                                }
                                            })
                                            return false;
                                        }
                                    }
                                    updateTCPInput();
                                }
                            },
                        });
                        $("#assignwf_check").removeAttr('onchange');
                        $("#assignwf_check").attr("onchange", "assigncheckChange()");



                        updateTCPDetails();
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#tcpcloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_tcp_name').val('')
                        $('#new_tcp_name').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })
                        tcpclonechangeId(null)
                        $('.clone_tcp_name').html(clickedObj.text)

                        $('.tcpcloneWork').attr('onclick', 'tcpcloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (clickedObj.li_attr.type == 13) {
            if (ROLEJSON.rules_engine.actions.single_rule_view) {
                menuItem["updateItem"] = {
                    label: "Edit",
                    icon: "images/edit.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $("#addRule").modal({
                            backdrop: "static",
                            keyboard: false,
                        });

                        $("#renderBlock").html($("#emailInput").html());
                        $(".configAdderPlus").removeAttr('onclick');
                        $(".configAdderPlus").attr("onclick", "addBlock(1)")
                        $(".configAdder").removeAttr('onclick');
                        $(".configAdder").attr("onclick", "addBlock(1)")

                        $(".folderAdderBtn").removeAttr('onclick');
                        $(".folderAdderBtn").attr("onclick", "foldersAddBlock()")
                        $(".patternAddBtn").removeAttr('onclick');
                        $(".patternAddBtn").attr("onclick", "patternaddBlock(1)")
                        $(".contentTypeAdd").removeAttr('onclick');
                        $(".contentTypeAdd").attr("onclick", "contentTypeaddBlock(1)")
                        $(".fileExtensionAdd").removeAttr('onclick');
                        $(".fileExtensionAdd").attr("onclick", "extensionaddBlock(1)")

                        $("#email_input_name").attr("disabled", "disabled");

                        $('#email_assign_wf').html('')

                        for (var w = 0; w < workflow_list.length; w++) {

                            $('#email_assign_wf').append('<option value="' + workflow_list[w].id + '">' + workflow_list[w].name + '</option>')

                        }
                        setTimeout(() => {
                            $('#email_assign_wf').select2({
                                dropdownParent: $('#addRule'),
                                "placeholder": "Choose Workflow"
                            })
                        }, 100);

                        $("#email-wizard-holder").steps({
                            headerTag: "h3",
                            bodyTag: "section",
                            transitionEffect: "slideLeft",
                            autoFocus: true,
                            enableCancelButton: true,
                            // enableAllSteps: true,
                            onStepChanging: function (event, currentIndex, newIndex) {
                                $(".input-sm")
                                    .addClass("input-border-default")
                                    .removeClass("input-border-err");

                                if (currentIndex == 0) {

                                    var configData = $("#addRule .config_key").map(function () {
                                        if ($(this).val()) {
                                            return $(this).val();
                                        }
                                    })
                                        .get();
                                    var dupdata2 = getDistinctArray(configData);


                                    if ($("#email_input_name").val() === "") {

                                        showFeedback('config_key', 'Config key name is Duplicated!', 're_feedbackDiv_email');
                                        $('.config_key').keyup(function (e) {
                                            if ($(".config_key").val() != "") {
                                                defaultStyle('re_feedbackDiv_email')
                                            }

                                        })
                                        return false;
                                    } else if (dupdata2.length > 0) {
                                        showFeedback('config_key', 'Config key is duplicated!', 're_feedbackDiv_email');
                                        $('.config_key').keyup(function (e) {
                                            if ($(".config_key").val() != "") {
                                                defaultStyle('re_feedbackDiv_email')
                                            }

                                        })
                                        return false;

                                    } else {
                                        if ($('#email_instance_type').val() == "SCALABLE" && $("#email_instance_type").val() == 0) {
                                            simpleFeedback(
                                                "centerswitch1",
                                                "Scalable instance should not be Zero",
                                                "error"
                                            );
                                            $("#email_input_instance")
                                                .focus()
                                                .css("border-color", "#ed1622");
                                            return false;
                                        } else if ($('#email_instance_type').val() == "DISTRIBUTED" && $("#email_instance_type").val() == 0) {
                                            simpleFeedback(
                                                "centerswitch1",
                                                "Distributed instance should not be Zero",
                                                "error"
                                            );
                                            $("#email_input_instance")
                                                .focus()
                                                .css("border-color", "#ed1622");
                                            return false;
                                        }
                                        else {

                                            $(".content").scrollTop(0);

                                            return true;
                                        }
                                    }
                                } else if (currentIndex == 1) {

                                    if (!(newIndex == 0)) {
                                        if (
                                            $("#email_input_remote_host").val() === "" ||
                                            $("#email_input_user_name").val() === ""
                                        ) {
                                            if ($("#email_input_remote_host").val() === "") {
                                                showFeedback('email_input_remote_host', 'Remote host is required!', 're_feedbackDiv_email');
                                                $('#email_input_remote_host').keyup(function (e) {
                                                    if ($("#email_input_remote_host").val() != "") {
                                                        defaultStyle('re_feedbackDiv_email')
                                                    }

                                                })
                                            } else {

                                                showFeedback('email_input_user_name', 'Remote Port is required!', 're_feedbackDiv_email');
                                                $('#email_input_user_name').keyup(function (e) {
                                                    if ($("#email_input_user_name").val() != "") {
                                                        defaultStyle('re_feedbackDiv_email')
                                                    }

                                                })
                                            }
                                            return false;
                                        } else {
                                            defaultStyle('re_feedbackDiv_email')

                                            return true;
                                        }
                                    } else {
                                        return true;

                                    }
                                } else {
                                    defaultStyle('re_feedbackDiv_email')

                                    return true;
                                }
                            },
                            onFinishing: function (event, currentIndex) {
                                if (event.currentTarget.id === "email-wizard-holder") {
                                    if ($('#email_assignwf_check').is(':checked')) {
                                        if ($('#email_assign_wf').val() === "" || $('#email_assign_wf').val() === null) {
                                            showFeedback('email_assign_wf', 'Workflow needs to be assigned!', 're_feedbackDiv_email');
                                            $('#email_assign_wf').change(function (e) {
                                                if ($("#email_assign_wf").val() != "") {
                                                    defaultStyle('re_feedbackDiv_email')
                                                }

                                            })
                                            return false;
                                        }
                                    }
                                    updateEmailInput();
                                }
                            },
                        });
                        $("#email_assignwf_check").removeAttr('onchange');
                        $("#email_assignwf_check").attr("onchange", "emailassigncheckChange()");



                        updateEmailDetails();
                    },
                };
                menuItem["cloneItem"] = {
                    label: "Clone",
                    icon: "images/clone.png",
                    action: function () {
                        // var type = clickedObj.li_attr.type;
                        current_tab_id = clickedObj.id;
                        // var id = type + '_' + uid;
                        $('#emailcloneModal').modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        $('#new_email_name').val('')
                        $('#new_email_name').css({
                            "border": 0,
                            "border-bottom": "1px solid #ccc"
                        })
                        emailclonechangeId(null)
                        $('.clone_email_name').html(clickedObj.text)

                        $('.emailcloneWork').attr('onclick', 'emailcloningFn(\'' + clickedObj.text + '\')')

                    },
                };
            }
        }
        if (ROLEJSON.rules_engine.actions.single_rule_export) {
            menuItem["exportItem"] = {
                label: "Export",
                icon: "images/export.png",
                action: function () {
                    var type = clickedObj.li_attr.type;
                    var uid = clickedObj.id;
                    var id = type + "_" + uid;
                    var obj = ""
                    if (node["li_attr"]["type"] == 2) {
                        for (i = 0; i < message_rules_list.length; i++) {
                            if (uid === "M_" + message_rules_list[i].messageId) {
                                obj = message_rules_list[i]
                                exportIndualRule("MSG_RULE", JSON.stringify(obj), message_rules_list[i].messageId);

                            }
                        }

                    } else if (node["li_attr"]["type"] == 3) {
                        for (i = 0; i < schedule_rules_list.length; i++) {
                            if (uid === "S_" + schedule_rules_list[i].id) {
                                obj = schedule_rules_list[i]
                                exportIndualRule("SCHEDULE_RULE", JSON.stringify(obj), schedule_rules_list[i].id);

                            }
                        }

                    } else if (node["li_attr"]["type"] == 4) {
                        for (i = 0; i < named_rules_list.length; i++) {
                            if (uid === "N-" + named_rules_list[i].name) {
                                obj = named_rules_list[i]
                                exportIndualRule("NAMED_RULE", JSON.stringify(obj), named_rules_list[i].name);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 5) {

                        for (i = 0; i < binary_rules_list.length; i++) {
                            if (uid === "B_" + binary_rules_list[i].type) {
                                obj = binary_rules_list[i]
                                exportIndualRule("BINARY_RULE", JSON.stringify(obj), binary_rules_list[i].type);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 6) {

                        for (i = 0; i < job_rules_list.length; i++) {
                            if (uid === "J_" + job_rules_list[i].id) {
                                obj = job_rules_list[i]
                                exportIndualRule("JOB_RULE", JSON.stringify(obj), job_rules_list[i].id);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 7) {

                        for (i = 0; i < sftp_rules_list.length; i++) {
                            if (uid === "sftp-" + sftp_rules_list[i].id) {
                                obj = sftp_rules_list[i]
                                exportIndualRule("SFTP_INPUT", JSON.stringify(obj), sftp_rules_list[i].id);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 8) {

                        for (i = 0; i < mqtt_rules_list.length; i++) {
                            if (uid === "mqtt-" + mqtt_rules_list[i].id) {
                                obj = mqtt_rules_list[i]
                                exportIndualRule("MQTT_INPUT", JSON.stringify(obj), mqtt_rules_list[i].id);

                            }
                        }
                    }
                    else if (node["li_attr"]["type"] == 9) {

                        for (i = 0; i < process_rules_list.length; i++) {
                            if (uid === "P-" + process_rules_list[i].id) {
                                obj = process_rules_list[i]
                                exportIndualRule("PROCESS_RULE", JSON.stringify(obj), process_rules_list[i].id);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 10) {

                        for (i = 0; i < file_rules_list.length; i++) {
                            if (uid === "F-" + file_rules_list[i].type) {
                                obj = file_rules_list[i]
                                exportIndualRule("FILE_RULE", JSON.stringify(obj), file_rules_list[i].type);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 11) {

                        for (i = 0; i < udp_rules_list.length; i++) {
                            if (uid === "udp-" + udp_rules_list[i].id) {
                                obj = udp_rules_list[i]
                                exportIndualRule("UDP_INPUT", JSON.stringify(obj), udp_rules_list[i].id);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 12) {

                        for (i = 0; i < tcp_rules_list.length; i++) {
                            if (uid === "tcp-" + tcp_rules_list[i].id) {
                                obj = tcp_rules_list[i]
                                exportIndualRule("TCP_INPUT", JSON.stringify(obj), tcp_rules_list[i].id);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 13) {

                        for (i = 0; i < email_rules_list.length; i++) {
                            if (uid === "email-" + email_rules_list[i].id) {
                                obj = email_rules_list[i]
                                exportIndualRule("EMAIL_INPUT", JSON.stringify(obj), email_rules_list[i].id);

                            }
                        }
                    } else if (node["li_attr"]["type"] == 14) {

                        for (i = 0; i < micro_rules_list.length; i++) {
                            if (uid === "micro_" + micro_rules_list[i].name) {
                                obj = micro_rules_list[i]
                                exportIndualRule("MICRO_API", JSON.stringify(obj), micro_rules_list[i].name);

                            }
                        }
                    }
                },
            };
        }
        if (ROLEJSON.rules_engine.actions.single_rule_delete) {
            menuItem["deleteItem"] = {
                label: "Delete",
                icon: "images/trash-bin.png",
                action: function (o, node) {
                    var data = clickedObj.li_attr.id.split("_");
                    var data2 = clickedObj.li_attr.id.split("-");
                    var data2s = data2[1]

                    data2 = data2[0]
                    var data1 = data[1];
                    data = data[0];

                    var ruleName = "";
                    if (data == "J") {
                        ruleName = "Job rule";
                    } else if (data == "S") {
                        ruleName = "Schedule rule";
                    } else if (data2 == "P") {
                        ruleName = "Process rule";
                        data1 = data2s;

                    } else if (data == "M") {
                        ruleName = "Message rule";
                    } else if (data === "N") {
                        ruleName = "Name rule";
                    } else if (data === "D") {
                        ruleName = "Domain rule";
                    } else if (data === "B") {
                        ruleName = "Binary rule";
                    } else if (data2 === "F") {
                        ruleName = "File rule";
                        data1 = data2s;
                    } else if (data === "_SFTP_") {
                        ruleName = "SFTP Input";
                        data1 = clickedObj.li_attr.id;
                    } else if (data === "micro") {
                        ruleName = "Micro API Rule";
                        data1 = clickedObj.li_attr.id;
                    } else if (data === "_UDP_" || data2 === "udp") {
                        ruleName = "UDP Input";
                        data1 = clickedObj.li_attr.id;
                    } else if (data === "_TCP_" || data2 === "tcp") {
                        ruleName = "TCP Input";
                        data1 = clickedObj.li_attr.id;
                    } else if (data === "_EMAIL_" || data2 === "email") {
                        ruleName = "Email Input";
                        data1 = clickedObj.li_attr.id;
                    } else {
                        var data = data.split("-");
                        var data = data[0]

                        if (data === "sftp") {
                            ruleName = "SFTP Input";
                            data1 = clickedObj.li_attr.id;
                        } else if (data === 'mqtt') {

                            ruleName = "MQTT Input";
                            data1 = clickedObj.li_attr.id;
                        } else {
                            ruleName = "MQTT Input";
                            data1 = clickedObj.li_attr.id;
                        }
                    }

                    swal({
                        title: "Are you sure?",
                        text:
                            ruleName +
                            '-"' +
                            data1 +
                            '" will be removed from the rules engine',
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#2C2C78",
                        confirmButtonText: "Yes, delete it!",
                    }).then(function (result) {
                        if (result.value) {
                            // $("#processingStatus").html(
                            //   '<div class="processing-txt"><i class="fa fa-spinner fa-spin mr-1"></i>Processing</div>'
                            // );
                            proceedRulesDelete();
                        }
                    });
                },
            };
        }
    } else {
        menuItem = {};
        menuItem["addItem"] = {
            label: "Add",
            icon: "images/plus.png",
            action: function (param) {

                if (node["li_attr"]["id"] == "MSG_RULE") {
                    openModal(1);
                } else if (node["li_attr"]["id"] == "NAMED_RULE") {
                    openModal(2);
                } else if (node["li_attr"]["id"] == "SCHEDULE_RULE") {
                    openModal(3);
                } else if (node["li_attr"]["id"] == "BINARY_RULE") {
                    openModal(6);
                } else if (node["li_attr"]["id"] == "JOB_RULE") {
                    openModal(7);
                } else if (node["li_attr"]["id"] == "FILE_RULE") {
                    openModal(8);
                } else if (node["li_attr"]["id"] == "PROCESS_RULE") {
                    openModal(9);
                } else if (node["li_attr"]["id"] == "SFTP_INPUT") {
                    openModal(10);
                } else if (node["li_attr"]["id"] == "MQTT_INPUT") {
                    openModal(11);
                } else if (node["li_attr"]["id"] == "UDP_INPUT") {
                    openModal(12);
                } else if (node["li_attr"]["id"] == "TCP_INPUT") {
                    openModal(13);
                } else if (node["li_attr"]["id"] == "EMAIL_INPUT") {
                    openModal(14);
                } else if (node["li_attr"]["id"] == "MICRO_API_Rule") {
                    openModal(15);
                }
            },
        };
        menuItem["importItem"] = {
            label: "Import",
            icon: "images/rules-engine/import.png",
            action: function () {
                $('#importModal').modal({
                    backdrop: 'static',
                    keyboard: false
                })
                importInitialProcess()
                $('.importBtn').removeAttr('onclick')

                if (node["li_attr"]["id"] == "MSG_RULE") {

                    $('.import_file_name').html('Message Rule')
                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'MSG_RULE' + '\')')

                } else if (node["li_attr"]["id"] == "SCHEDULE_RULE") {


                    $('.import_file_name').html('Schedule Rule')
                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'SCHEDULE_RULE' + '\')')

                } else if (node["li_attr"]["id"] == "NAMED_RULE") {


                    $('.import_file_name').html('Name Rule')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'NAMED_RULE' + '\')')

                } else if (node["li_attr"]["id"] == "BINARY_RULE") {


                    $('.import_file_name').html('Binary Rule')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'BINARY_RULE' + '\')')

                } else if (node["li_attr"]["id"] == "JOB_RULE") {


                    $('.import_file_name').html('Job Rule')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'JOB_RULE' + '\')')

                } else if (node["li_attr"]["id"] == "PROCESS_RULE") {

                    $('.import_file_name').html('Process Rule')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'PROCESS_RULE' + '\')')

                } else if (node["li_attr"]["id"] == "MQTT_INPUT") {

                    $('.import_file_name').html('MQTT Input')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'MQTT_INPUT' + '\')')

                } else if (node["li_attr"]["id"] == "SFTP_INPUT") {

                    $('.import_file_name').html('SFTP Input')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'SFTP_INPUT' + '\')')

                } else if (node["li_attr"]["id"] == "FILE_RULE") {

                    $('.import_file_name').html('File Rule')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'FILE_RULE' + '\')')

                } else if (node["li_attr"]["id"] == "UDP_INPUT") {

                    $('.import_file_name').html('UDP Input')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'UDP_INPUT' + '\')')

                } else if (node["li_attr"]["id"] == "TCP_INPUT") {

                    $('.import_file_name').html('TCP Input')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'TCP_INPUT' + '\')')

                } else if (node["li_attr"]["id"] == "EMAIL_INPUT") {

                    $('.import_file_name').html('Email Input')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'EMAIL_INPUT' + '\')')

                } else if (node["li_attr"]["id"] == "MICRO_API_Rule") {

                    $('.import_file_name').html('Micro API Rule')

                    $('.importBtn').attr('onclick', 'folderImport(\'' + 'MICRO_API' + '\')')

                }

            },
        };
        menuItem["exportItem"] = {
            label: "Export",
            icon: "images/rules-engine/export.png",
            action: function () {
                if (node["li_attr"]["id"] == "MSG_RULE") {

                    exportRule('MSG_RULE')

                } else if (node["li_attr"]["id"] == "SCHEDULE_RULE") {
                    exportRule('SCHEDULE_RULE')

                } else if (node["li_attr"]["id"] == "NAMED_RULE") {
                    exportRule('NAMED_RULE')

                } else if (node["li_attr"]["id"] == "BINARY_RULE") {
                    exportRule('BINARY_RULE')

                } else if (node["li_attr"]["id"] == "JOB_RULE") {
                    exportRule('JOB_RULE')

                } else if (node["li_attr"]["id"] == "PROCESS_RULE") {
                    exportRule('PROCESS_RULE')

                } else if (node["li_attr"]["id"] == "MQTT_INPUT") {
                    exportRule('MQTT_INPUT')

                } else if (node["li_attr"]["id"] == "SFTP_INPUT") {
                    exportRule('SFTP_INPUT')

                } else if (node["li_attr"]["id"] == "FILE_RULE") {
                    exportRule('FILE_RULE')

                } else if (node["li_attr"]["id"] == "UDP_INPUT") {
                    exportRule('UDP_INPUT')

                } else if (node["li_attr"]["id"] == "TCP_INPUT") {
                    exportRule('TCP_INPUT')

                } else if (node["li_attr"]["id"] == "EMAIL_INPUT") {
                    exportRule('EMAIL_INPUT')

                } else if (node["li_attr"]["id"] == "MICRO_API_Rule") {
                    exportRule('MICRO_API')

                }

            },
        };

    }
    return menuItem;
}

function allRulesCalled() {
    let $transpernetProcessing = $('.transpernetProcessing')
    if (message_rules_list.length === 0) {
        $("#MSG_RULE").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadMessageRulesList()
        });
    }
    if (named_rules_list.length === 0) {
        $("#NAMED_RULE").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadNamedRulesList()
        });
    }
    if (schedule_rules_list.length === 0) {
        $("#SCHEDULE_RULE").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadScheduleRulesList()
        });
    }
    if (binary_rules_list.length === 0) {
        $("#BINARY_RULE").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadBinaryRulesList()
        });
    }
    if (job_rules_list.length === 0) {
        $("#JOB_RULE").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadJobRulesList()
        });
    }
    if (file_rules_list.length === 0) {
        $("#FILE_RULE").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadFileRulesList()
        });
    }
    if (process_rules_list.length === 0) {
        $("#PROCESS_RULE").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadProcessRulesList()
        });
    }
    if (sftp_rules_list.length === 0) {
        $("#SFTP_INPUT").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadSftpRulesList()
        });
    }
    if (mqtt_rules_list.length === 0) {
        $("#MQTT_INPUT").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadMqttRulesList()
        });
    }
    if (udp_rules_list.length === 0) {
        $("#UDP_INPUT").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadUdpRulesList()
        });
    }
    if (tcp_rules_list.length === 0) {
        $("#TCP_INPUT").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadTcpRulesList()
        });
    }
    if (email_rules_list.length === 0) {
        $("#EMAIL_INPUT").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadEmailRulesList()
        });
    }
    if (micro_rules_list.length === 0) {
        $("#MICRO_API_Rule").on("click", function () {
            $transpernetProcessing.removeClass('hide')
            loadMicroRulesList()
        });
    }

}

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


            // if ($(".allLogs").is(":checked")) {

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

            // } else {
            //     switch (CURRENT_TYPE) {
            //         case 0:
            //             mqttDomainRule(topicName, parsedData);
            //             break;
            //         case 1:
            //             mqttMesageRule(topicName, parsedData);
            //             break;
            //         case 2:
            //             mqttNamedRule(topicName, parsedData);
            //             break;
            //         case 3:
            //             mqttScheduleRule(topicName, parsedData);
            //             break;
            //         case 6:
            //             mqttBinaryRule(topicName, parsedData);
            //             break;
            //         case 7:
            //             mqttJobRule(topicName, parsedData);
            //             break;
            //         case 8:
            //             mqttFileRule(topicName, parsedData);
            //             break;
            //         case 9:
            //             mqttProcessRule(topicName, parsedData);
            //             break;
            //         case 10:
            //             mqttSftpRule(topicName, parsedData);
            //             break;
            //         case 11:
            //             mqttMqttRule(topicName, parsedData);
            //             break;
            //         case 12:
            //             mqttUdpRule(topicName, parsedData);
            //             break;
            //         case 13:
            //             mqttTcpRule(topicName, parsedData);
            //             break;
            //         case 14:
            //             mqttEmailRule(topicName, parsedData);
            //             break;
            //         case 15:
            //             mqttMicroRule(topicName, parsedData);
            //             break;
            //     }
            // }

            commandConsoleResponse(parsedData);
            liveMessageResponse(topicName, parsedData)
            debugMessageResponse(topicName, parsedData)
        };

    }
}

function commandConsoleResponse(parsedData) {
    var color = 'default';

    if (parsedData.data === '__ALL_DONE__') {

        $(".console_loader_" + parsedData.session).remove();

    } else {
        if (parsedData.level === 'help') {
            var objData = JSON.parse(parsedData.data);

            var htmlStr = '';

            if (objData.examples) {

                var examples = objData.examples;

                if (typeof objData.examples === 'string') {
                    examples = JSON.parse(objData.examples);
                }

                for (var i = 0; i < examples.length; i++) {
                    htmlStr = htmlStr + "<pre style='margin:5px 0px;padding: 5px 0px;'><div class='codeText'>" + examples[i] + "</div></pre>"
                }
            }


            $(".console_" + parsedData.session).append("<h5 class='font-small-2 titleText'>" + (objData.title ? objData.title : "") + "</h5> " +
                "<span style='white-space: pre-wrap;display: block;'>/***************************************</span>" +
                "<span style='white-space: pre-wrap;display: block;line-height:20px;margin:5px 0px;'>" + objData.help + "</span>" +
                "<span style='white-space: pre-wrap;display: block;'>***************************************/</span>" +
                "<h6 class='subTitleText'>" + (objData.signature ? objData.signature : "") + "</h6>" +
                htmlStr);

            $('#scriptTerminal').animate({
                scrollTop: $(".terminal-wrapper").height()
            }, 1);

        } else {
            $(".console_" + parsedData.session).append("<span class='badge badge-" + (parsedData.level ? LOG_LEVELS[parsedData.level] : color) + "' " +
                "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                "<b>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> | " +
                "<span style='white-space: pre-wrap;display: inline-block;border-left: 1px solid #eeeeee38;padding-left: 3px;'>" + parsedData.data + "</span><br>");

            $('#scriptTerminal').animate({
                scrollTop: $(".tab_5").height()
            }, 1);

        }
    }
}

function liveMessageResponse(topicName, parsedData) {
    if (topicName.includes("/" + DOMAIN_KEY + "/log/incoming") || topicName.includes("/" + DOMAIN_KEY + "/device")) {
        var tmp = {}
        if (topicName.includes("/" + DOMAIN_KEY + "/device")) {
            tmp.data = JSON.stringify(parsedData);
            tmp.did = topicName.split("/")[3]
            tmp.mid = topicName.split("/")[7]
            tmp.stamp = moment().format('MM/DD/YYYY hh:mm:ss A')
            parsedData = tmp;
        }

        if (live_msg_count >= 100) {
            $(".liveMessages").html('');
            live_msg_count = 0;
        }

        var str = `
            <li class="mb-1" style="font-size: 12px;border-bottom: 1px solid #716d6d;color:#b3b0b0">
                <span class="" style="display: inline-block;width: 180px" ><i class="fa fa-clock-o"></i> ` + moment(new Date(parsedData.stamp).getTime()).format('MM/DD/YYYY hh:mm:ss A') + ` </span>
                [<strong>` + parsedData.mid + `</strong>] [<strong>` + parsedData.did + `</strong>] 
            ` + $.trim(parsedData.data) + `
            </li>
            `;
        $(".liveMessages").prepend(str);
        live_msg_count++
        previousMsg = parsedData.stamp;

        $('.tab_2').animate({
            scrollTop: $(".tab_2").height()
        }, 1);
    }
}

function debugMessageResponse(topicName, parsedData) {
    if (topicName.includes("cstatus")) {

        var str = '';

        try {
            var id = DOMAIN_KEY + "_" + parsedData.deviceid + "_" + parsedData.corrid;
            if (id) {
                str = '<a href="javascript:void(0)" style="color:#FF9800" onclick="openCorrID(\'' + id + '\')">' + parsedData.corrid + '</a>';
            } else {
                str = parsedData.corrid;
            }

        } catch (e) {
        }


        $(".debugMessages").append("<li class='" + nodeClass + " mt-1 mb-1' style='font-size: 12px;border-bottom:1px solid #676869;padding:2px 10px;'><span class='label label-yellow' style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>COMMAND</span>" +
            "<b style='color: #fff'>" + moment().format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
            (parsedData.node ? "<span style='font-weight: bold;display: inline-block;margin-left: 5px;color:#ffeb3bf0'> " + parsedData.node + "</span> " : '') +
            "<span style='white-space: pre-wrap;padding-left: 10px;'> [Device Id: " + parsedData.deviceid + "] [Correlation Id: " + str + "] " +
            "[Status : " + parsedData.status + "] [Reason : " + (parsedData.reason ? parsedData.reason : '-') + "]" +
            "</span><br></li>");

    } else if (topicName.includes("incoming")) {

        $(".debugMessages").append("<li class='" + nodeClass + " mt-1 mb-1' style='font-size: 12px;border-bottom:1px solid #676869;padding:2px 10px;'><span class='label label-grey' style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>MESSAGE</span>  " +
            "<b style='color: #fff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
            (parsedData.node ? "<span style='font-weight: bold;display: inline-block;margin-left: 5px;color:#ffeb3bf0' > " + parsedData.node + "</span> " : '') +
            "<span style='white-space: pre-wrap;padding-left: 10px;'> [Device Id: " + parsedData.did + "] [Message Id: " + parsedData.mid + "] " +
            "[Data : " + JSON.stringify(parsedData.data) + "] " +
            "</span><br></li>");

    } else {
        if (($('.logLevelList').val() === "ALL") || $('.logLevelList').val() == parsedData.level) {

            if (parsedData && parsedData.data !== '__ALL_DONE__' && parsedData.level) {

                var ruleName = '';
                var flag = false;

                if (topicName.includes("/log/drule")) {
                    ruleName = 'Domain Rule ';
                    flag = true;
                }
                if (topicName.includes("/log/mrule")) {
                    ruleName = 'Message Rule: ' + topicName.split("/")[4];
                    flag = true;
                }
                if (topicName.includes("/log/nrule")) {
                    ruleName = 'Named Rule: ' + topicName.split("/")[4];
                    flag = true;
                }
                if (topicName.includes("/log/srule")) {
                    ruleName = 'Schedule Rule: ' + topicName.split("/")[4];
                    flag = true;
                }
                if (topicName.includes("/log/brule")) {
                    ruleName = 'Binary Rule: ' + topicName.split("/")[4];
                    flag = true;
                }
                if (topicName.includes("/log/job")) {
                    ruleName = 'Job Rule: ' + topicName.split("/")[4];
                    flag = true;
                } if (topicName.includes("/log/proc")) {
                    ruleName = 'Process Rule: ' + topicName.split("/")[4];
                    flag = true;
                } if (topicName.includes("/log/input/SFTP")) {
                    ruleName = 'SFTP Input: ' + topicName.split("/")[5];
                    flag = true;
                } if (topicName.includes("/log/input/MQTT")) {
                    ruleName = 'MQTT Input: ' + topicName.split("/")[5];
                    flag = true;
                } if (topicName.includes("/log/input/UDP")) {
                    ruleName = 'UDP Input: ' + topicName.split("/")[5];
                    flag = true;
                } if (topicName.includes("/log/input/TCP")) {
                    ruleName = 'TCP Input: ' + topicName.split("/")[5];
                    flag = true;
                } if (topicName.includes("/log/input/EMAIL")) {
                    ruleName = 'Email Input: ' + topicName.split("/")[5];
                    flag = true;
                } if (topicName.includes("micro")) {
                    ruleName = 'Micro API: ' + topicName.split("/")[4];
                    flag = true;
                }

                if (flag) {

                    if (debugger_count >= 100) {
                        $(".debugMessages").html('');
                        debugger_count = 0;
                    }

                    var level = parsedData.level;

                    if ($("." + level.toLowerCase()).is(":checked")) {

                        var nodeClass = new Date().getTime();
                        var color = 'default';

                        var fields = ruleName ? ' [' + ruleName + ']' : '';

                        if ($(".node").is(":checked")) {
                            fields += ' [' + parsedData.node + '] '
                        }
                        if ($(".session").is(":checked")) {
                            fields += ' [' + parsedData.session + '] '
                        }


                        $(".debugMessages").append("<li class='" + nodeClass + " mt-1 mb-1' style='font-size: 12px;border-bottom:1px solid #676869;padding:2px 10px;'>" +
                            "<span class='badge badge-" + (parsedData.level ? LOG_LEVELS[parsedData.level] : color) + "' " +
                            "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                            "<span style='display: inline-block;margin-right: 5px;'><i class='fa fa-clock-o'></i> " + moment(new Date(parsedData.stamp).getTime()).format('MM/DD/YYYY hh:mm:ss a') + "</span> " + fields +
                            "<span style='white-space: pre-wrap;padding-left: 10px;'>" + parsedData.data + "</span></li>");
                        debugger_count++;

                        $('.tab_2').animate({
                            scrollTop: $(".tab_2").height()
                        }, 1);
                    }
                }
            }
        }
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
                $(".loggerHtml").append("<div title='Domain Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='Message Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='Named Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='File Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='Schedule Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='Binary Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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
                $(".loggerHtml").append("<div title='Process Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='Job Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='SFTP Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='MQTT Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='UDP Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='TCP Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='Email Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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

                $(".loggerHtml").append("<div title='Micro Rule: " + rName + "' class='" + nodeClass + "' style='font-size: 12px;color:#fff;border-bottom: 1px solid #7f7c7c;'>" +
                    "<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                    "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                    "<b style='color: #ffffff'>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
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
    feedback('Logs cleared successfully')

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

function loadMessageRulesList(simulator, lbk) {
    if (!simulator) {
        $('#MSG_RULE .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
        $('.transpernetProcessing').removeClass('hide')
    }
    listMessageRules(rules_page_size, rules_direction, rules_id, function (status, data) {
        if (status) {
            message_rules_list = data;
            listMessageSpec(rules_page_size, null, null, function (status, data) {
                if (status && data.length > 0) {
                    message_spec_list = data;
                    if (simulator) {
                        lbk()
                        return
                    }
                    message_spec_list.forEach(specList => {
                        let flag = true;
                        message_rules_list.forEach(ruleList => {
                            if (specList.id === ruleList.messageId) {
                                specList.ruleObj = ruleList;
                                flag = false;
                            }
                        })

                        if (flag) {
                            message_rules_list.push({
                                domainKey: null,
                                lang: "GROOVY",
                                code: "",
                                messageId: specList.id,
                                messageName: ''
                            });
                        }
                    })

                    let mrData = [];
                    message_spec_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.id, // node text
                            messageName: iterator.name,
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 1 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.forEach(iterator => {
                        if (iterator.id === 'MSG_RULE') {
                            iterator.children = mrData
                            $('#MSG_RULE .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')
                            $('#rules_tree').jstree(true).settings.core.data = treeData;
                            $('#rules_tree').jstree(true).refresh(true);
                            setTimeout(() => {
                                $("#rules_tree").jstree("close_all");
                                $('#MSG_RULE .jstree-ocl').first().click()
                                $('.transpernetProcessing').addClass('hide')

                            }, 50);
                            setTimeout(() => {
                                allRulesCalled()
                            }, 600);
                        }
                    })

                    if (lbk) lbk(true)
                } else {
                    message_spec_list = []
                    treeData.forEach(iterator => {
                        if (iterator.id === 'MSG_RULE') {
                            iterator.children = []
                            $('#MSG_RULE .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')
                            $('#rules_tree').jstree(true).settings.core.data = treeData;
                            $('#rules_tree').jstree(true).refresh(true);
                            setTimeout(() => {
                                $("#rules_tree").jstree("close_all");
                                $('#MSG_RULE .jstree-ocl').first().click()
                                $('.transpernetProcessing').addClass('hide')

                            }, 50);
                            setTimeout(() => {
                                allRulesCalled()
                            }, 600);
                        }
                    })
                    if (!simulator) {
                        errorMsg('No Messages Defined so far!')
                    }
                    if (lbk) lbk(false)
                }

            })
        }
    })
}


function loadNamedRulesList(simulator, lbk) {
    if (!simulator) {
        $('#NAMED_RULE .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
        $('.transpernetProcessing').removeClass('hide')
    }
        listNamedRules(rules_page_size, null, null, function (status, data) {
        if (status && data.length > 0) {
            named_rules_list = data;
        } else {
            named_rules_list = []
            errorMsg('No Named Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }
        if (simulator) {
            lbk()
            return
        }

        let mrData = [];
        named_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.name, // will be autogenerated if omitted
                text: iterator.name, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 2 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'NAMED_RULE') {
                iterator.children = mrData
                $('#NAMED_RULE .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#NAMED_RULE .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                }, 600);

            }
        })

        if (lbk) lbk(true)
    })
}

function loadScheduleRulesList(objid, lbk) {
    $('#SCHEDULE_RULE .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

    listScheduleRules(rules_page_size, null, null, function (status, data) {

        if (status && data.length > 0) {
            schedule_rules_list = data;
        } else {
            schedule_rules_list = []
            errorMsg('No Schedule Messages Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        schedule_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.id, // will be autogenerated if omitted
                text: iterator.id, // node text
                pattern: iterator.pattern,
                icon: "images/file.png", // string for custom
                li_attr: { type: 3 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'SCHEDULE_RULE') {
                iterator.children = mrData
                $('#SCHEDULE_RULE .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#SCHEDULE_RULE .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })

        if (lbk) lbk(true)
    })

}

function loadBinaryRulesList(simulator, lbk) {
    if (!simulator) {
        $('#BINARY_RULE .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
        $('.transpernetProcessing').removeClass('hide')
    }
    listBinaryRules(rules_page_size, null, null, function (status, data) {
        if (status && data.length > 0) {
            binary_rules_list = data;
            console.log(binary_rules_list);
        } else {
            binary_rules_list = []
            errorMsg('No Binary Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }
        if (simulator) {
            lbk()
            return
        }

        let mrData = [];
        binary_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.type, // will be autogenerated if omitted
                text: iterator.type, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 6 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'BINARY_RULE') {
                iterator.children = mrData
                $('#BINARY_RULE .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#BINARY_RULE .jstree-ocl').first().click()

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    $('.transpernetProcessing').addClass('hide')
                }, 600);
            }
        })
        if (lbk) lbk(true)
    })
}

function loadJobRulesList(objid, lbk) {
    $('#JOB_RULE .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

    listJobRules(function (status, data) {

        if (status && data.length > 0) {
            job_rules_list = data;
        } else {
            job_rules_list = []
            errorMsg('No Job Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        job_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.id, // will be autogenerated if omitted
                text: iterator.id, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 7 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'JOB_RULE') {
                iterator.children = mrData
                $('#JOB_RULE .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#JOB_RULE .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })

        if (lbk) lbk(true)
    })
}

function loadFileRulesList(simulator, lbk) {
    if (!simulator) {
        $('#FILE_RULE .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
        $('.transpernetProcessing').removeClass('hide')
    }
    listFileRules(rules_page_size, null, null, function (status, data) {

        if (status && data.length > 0) {
            file_rules_list = data;
        } else {
            file_rules_list = []
            errorMsg('No File Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }
        if (simulator) {
            lbk()
            return
        }

        let mrData = [];
        file_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.type, // will be autogenerated if omitted
                text: iterator.type, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 8 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'FILE_RULE') {
                iterator.children = mrData
                $('#FILE_RULE .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#FILE_RULE .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                }, 600);
            }
        })

        if (lbk) lbk(true)

    })
}

function loadProcessRulesList(objid, lbk) {
    $('#PROCESS_RULE .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

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

        if (status) {
            let resultData = QueryFormatter(data);
            process_rules_list = resultData.data.data;
            if (process_rules_list.length === 0) {
                errorMsg('No Process Rules Found!')
                $('.transpernetProcessing').addClass('hide')
            }
        } else {
            process_rules_list = []
            errorMsg('No Process Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        process_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.id, // will be autogenerated if omitted
                text: iterator.name, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 9 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'PROCESS_RULE') {
                iterator.children = mrData
                $('#PROCESS_RULE .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#PROCESS_RULE .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })

        if (lbk) lbk()

    })
}

function loadSftpRulesList(objid, lbk) {
    $('#SFTP_INPUT .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

    listInputRules("SFTP_INPUT", function (status, data) {

        if (status) {

            let resultData = QueryFormatter(data);

            sftp_rules_list = resultData.data.data;

            if (sftp_rules_list.length === 0) {
                errorMsg('No SFTP Rules Found!')
                $('.transpernetProcessing').addClass('hide')
            }
        } else {
            sftp_rules_list = []
            errorMsg('No SFTP Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        sftp_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.id, // will be autogenerated if omitted
                text: iterator.name, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 10 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'SFTP_INPUT') {
                iterator.children = mrData
                $('#SFTP_INPUT .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#SFTP_INPUT .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })
        if (lbk) lbk(true)

    })
}

function loadMqttRulesList(objid, lbk) {
    $('#MQTT_INPUT .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

    listInputRules("MQTT_INPUT", function (status, data) {

        if (status) {

            let resultData = QueryFormatter(data);

            mqtt_rules_list = resultData.data.data;

            if (mqtt_rules_list.length === 0) {
                errorMsg('No MQTT Rules Found!')
                $('.transpernetProcessing').addClass('hide')
            }
        } else {
            mqtt_rules_list = []
            errorMsg('No MQTT Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        mqtt_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.id, // will be autogenerated if omitted
                text: iterator.name, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 11 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'MQTT_INPUT') {
                iterator.children = mrData
                $('#MQTT_INPUT .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#MQTT_INPUT .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })

        if (lbk) lbk(true)
    })
}

function loadUdpRulesList(objid, lbk) {
    $('#UDP_INPUT .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

    listInputRules("UDP_INPUT", function (status, data) {

        if (status) {

            let resultData = QueryFormatter(data);

            udp_rules_list = resultData.data.data;

            if (udp_rules_list.length === 0) {
                errorMsg('No UDP Rules Found!')
                $('.transpernetProcessing').addClass('hide')
            }

        } else {
            udp_rules_list = []
            errorMsg('No UDP Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        udp_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.id, // will be autogenerated if omitted
                text: iterator.name, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 12 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'UDP_INPUT') {
                iterator.children = mrData
                $('#UDP_INPUT .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#UDP_INPUT .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })

        if (lbk) lbk(true)
    })
}

function loadTcpRulesList(objid, lbk) {
    $('#TCP_INPUT .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

    listInputRules("TCP_INPUT", function (status, data) {

        if (status) {
            let resultData = QueryFormatter(data);
            tcp_rules_list = resultData.data.data;

            if (tcp_rules_list.length === 0) {
                errorMsg('No TCP Rules Found!')
                $('.transpernetProcessing').addClass('hide')
            }
        } else {
            tcp_rules_list = []
            errorMsg('No TCP Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        tcp_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.id, // will be autogenerated if omitted
                text: iterator.name, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 13 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'TCP_INPUT') {
                iterator.children = mrData
                $('#TCP_INPUT .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#TCP_INPUT .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })
        if (lbk) lbk(true)

    })
}

function loadEmailRulesList(objid, lbk) {
    $('#EMAIL_INPUT .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

    listInputRules("EMAIL_INPUT", function (status, data) {

        if (status) {

            let resultData = QueryFormatter(data);

            email_rules_list = resultData.data.data;
            if (email_rules_list.length === 0) {
                errorMsg('No EMAIL Rules Found!')
                $('.transpernetProcessing').addClass('hide')
            }
        } else {
            email_rules_list = []
            errorMsg('No EMAIL Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        email_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.id, // will be autogenerated if omitted
                text: iterator.name, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 14 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'EMAIL_INPUT') {
                iterator.children = mrData
                $('#EMAIL_INPUT .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#EMAIL_INPUT .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })

        if (lbk) lbk(true)

    })
}

function loadMicroRulesList(objid, lbk) {
    $('#MICRO_API_Rule .jstree-ocl').first().removeClass('jstree-icon').addClass('spinadjust fa fa-spin fa-spinner')
    $('.transpernetProcessing').removeClass('hide')

    listInputRules("MICRO_API", function (status, data) {

        if (status) {

            let resultData = QueryFormatter(data);

            micro_rules_list = resultData.data.data;
            if (micro_rules_list.length === 0) {
                errorMsg('No Micro API Rules Found!')
                $('.transpernetProcessing').addClass('hide')
            }
        } else {
            micro_rules_list = []
            errorMsg('No Micro API Rules Found!')
            $('.transpernetProcessing').addClass('hide')
        }

        let mrData = [];
        micro_rules_list.forEach(iterator => {
            mrData.push({
                id: iterator.name, // will be autogenerated if omitted
                text: iterator.name, // node text
                icon: "images/file.png", // string for custom
                li_attr: { type: 15 }, // attributes for the generated LI node
                a_attr: {}, // attributes for the generated A node
            });
        })
        treeData.forEach(iterator => {
            if (iterator.id === 'MICRO_API_Rule') {
                iterator.children = mrData
                $('#MICRO_API_Rule .jstree-ocl').first().addClass('jstree-icon').removeClass('fa fa-spin fa-spinner spinadjust')

                $('#rules_tree').jstree(true).settings.core.data = treeData;
                $('#rules_tree').jstree(true).refresh(true);
                setTimeout(() => {
                    $("#rules_tree").jstree("close_all");
                    $('#MICRO_API_Rule .jstree-ocl').first().click()
                    $('.transpernetProcessing').addClass('hide')

                }, 50);
                setTimeout(() => {
                    allRulesCalled()
                    if (objid) $('#' + objid + '_anchor').click()
                }, 600);
            }
        })
        if (lbk) lbk(true)
    })
}

function footerSimulator() { // dropdown change
    let idName = $(".rulesList ul li").first().attr("data-name");
    let value = Number($("#rulesType").val())
    fetchDeviceList()
    listRulesId(value);
    changeRuleTab(idName, value);
}


function listRulesId(value, changeruleId) {
    if (value == 1) {
        loadMessageRulesList(true, function (status, data) {
            if (changeruleId) 
                changeRuleResult(message_spec_list, value,changeruleId)
            else 
                simulatorList(message_spec_list, value)
        });
    } else if (value == 2) {
        loadNamedRulesList(true, function (status, data) {
            if (changeruleId)
                changeRuleResult(named_rules_list, value,changeruleId)
            else 
                simulatorList(named_rules_list, value)
        });
    } else if (value == 6) {
        loadBinaryRulesList(true, function (status, data) {
            if (changeruleId)
                changeRuleResult(binary_rules_list, value,changeruleId)
            else 
                simulatorList(binary_rules_list, value)
        });
    } else if (value == 10) {
        loadFileRulesList(true, function (status, data) {
            if (changeruleId)
                changeRuleResult(file_rules_list, value,changeruleId)
            else 
                simulatorList(file_rules_list, value)
        });
    }
}


function simulatorList(resultData, type) {
    $("#rulesList").html("");
    if (resultData.length > 0) {
        $(".emptyRuleSimulator").addClass("hide");
        $(".emptyRuleSimulator").removeClass("show");
        $(".dataSimulator").removeClass("hide");
        $(".dataSimulator").addClass("show");
        for (var i = 0; i < resultData.length; i++) {
            if (type == 1) {
                $("#rulesList").append('<li class="rules-style rulesListli rulesLi' + resultData[i].id + ' mb-1" data-name="' + resultData[i].id + '" data-id="' + resultData[i].id + '" onclick="changeRuleTab('+resultData[i].id + "," + type + ')">' + '<i class="glyphicon glyphicon-envelope"></i> <b>' + resultData[i].id +
                '</b> <i class="fa fa-chevron-right pull-right" style="margin-top:4px"></i></li>'
                );
                if (i === 0) changeRuleTab(resultData[i].id, type);
            }
            else if (type == 2) {
                if (i === 0) {
                    changeRuleTab(resultData[i].name, type);
                }
                $("#rulesList").append(
                    '<li class="rules-style rulesListli rulesLi' +
                    resultData[i].name +
                    ' mb-1" data-name="' +
                    resultData[i].name +
                    '" onclick="changeRuleTab(\'' +
                    resultData[i].name +
                    "'," +
                    type +
                    ');">' +
                    '<i class="glyphicon glyphicon-file"></i> <b>' +
                    resultData[i].name +
                    '</b> <i class="fa fa-chevron-right pull-right" style="margin-top:4px"></i></li>'
                );
            } else if (type == 6) {
                if (i === 0) {
                    changeRuleTab(resultData[i].type, type);
                }
                $("#rulesList").append(
                    '<li class="rules-style rulesListli rulesLi' +
                    resultData[i].type +
                    ' mb-1" data-name="' +
                    resultData[i].type +
                    '" onclick="changeRuleTab(\'' +
                    resultData[i].type +
                    "'," +
                    type +
                    ');">' +
                    '<i class="glyphicon glyphicon-file"></i> <b>' +
                    resultData[i].type +
                    '</b> <i class="fa fa-chevron-right pull-right" style="margin-top:4px"></i></li>'
                );
            } else if (type == 10) {
                if (i === 0) {
                    changeRuleTab(resultData[i].type, type);
                }
                $("#rulesList").append(
                    '<li class="rules-style rulesListli rulesLi' +
                    resultData[i].type +
                    ' mb-1" data-name="' +
                    resultData[i].type +
                    '" onclick="changeRuleTab(\'' +
                    resultData[i].type +
                    "'," +
                    type +
                    ');">' +
                    '<i class="glyphicon glyphicon-file"></i> <b>' +
                    resultData[i].type +
                    '</b> <i class="fa fa-chevron-right pull-right" style="margin-top:4px"></i></li>'
                );
            }
        }
        $(".rulesList ul li").first().click();
        $("#rulesList").val("").trigger("change");
    } else {
        $("#rulesList").html(
            '<li style="text-align:center">No Data Found</li>'
        );
        $(".emptyRuleSimulator").removeClass("hide");
        $(".emptyRuleSimulator").addClass("show");
        $(".dataSimulator").addClass("hide");
        $(".dataSimulator").removeClass("show");
        $("#msgTab").html(
            '<div class="emptyRuleSimulator">No Data Found</div>'
        );
    }
}

function changeRuleTab(id, type) { // rule list change
    $(".msgFieldBlock").html("");
    $(".rules-style").removeClass("active");
    $(".rulesLi" + id).addClass("active");
    listRulesId(type, id)
}

function changeRuleResult(resultData, type,id){
    if (resultData.length === 0) {
        $("#msgTab").html('<div class="emptyRuleSimulator">No Data Found</div>');
    }
    var str = "";
    str =
        '<div class="tab-pane  active show " id="list-message-list" role="tabpanel" aria-labelledby="list-message-list">' +
        '<div class="dataSimulator">' +
        '<div class="row">' +
        '<div class="col-md-12 p-0">' +
        '<div class="d-block mb-2">' +
        '<ol class="breadcrumb head-text-rules">' +
        '<li class="breadcrumb-item"><a href="javascript:void(0)"><span><i class="fa fa-home " aria-hidden="true"></i> Simulator</span></a></li>' +
        '<li class="breadcrumb-item "><a href="javascript:void(0)"><span> Rule</span></a></li>' +
        '<li class="breadcrumb-item "><a href="javascript:void(0)"><span>' +
        id +
        "</span></a></li>" +
        "</ol>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="row msgFieldBlock" ><p class="pt-4 pb-4 pl-4"><i class="fa fa-spinner fa-spin"></i> Loading...</p>' +
        "</div>" +
        '<div class="row">' +
        '  <div class="col-md-12">';
    if (type == 1) {
        str +=
            '<button class="btn bdskp-secondary-btn font-12 btn_' +id +'" onclick="rulesSimulate(\'' + id + '\', '+ type +')"><i class="fa fa-paper-plane" aria-hidden="true"></i> Send Message</button>';
    } else if (type == 2) {
        str +=
            '<button class="btn bdskp-secondary-btn font-12 btn_' + id + '" onclick="rulesSimulate(\'' + id + '\', ' + type +')"><i class="fa fa-paper-plane" aria-hidden="true"></i> Invoke Named Rule</button>';
    } else if (type == 6) {
        str +=
            '<button class="btn bdskp-secondary-btn font-12 btn_' +
            id +
            '" onclick="rulesSimulate(\'' +
            id +
            "','" +
            type +
            '\')"><i class="fa fa-paper-plane" aria-hidden="true"></i> Upload Binary File</button>';
    } else if (type == 10) {
        str +=
            '<button class="btn bdskp-secondary-btn font-12 btn_' +
            id +
            '" onclick="rulesSimulate(\'' +
            id +
            "','" +
            type +
            '\')"><i class="fa fa-paper-plane" aria-hidden="true"></i> Upload File File</button>';
    }
    str +=
        "  </div>" +
        "</div>" +
        "</div>" +
        '<div class="hide emptyRuleSimulator">No data Found</div>' +
        "</div>";
    $("#msgTab").html(str);

    for (var i = 0; i < resultData.length; i++) {
        var ruleStr = "";
        if (type == 1) {

            if (id == resultData[i].id) {
                var dataResultObj = resultData[i];
                for (j = 0; j < dataResultObj.fields.length; j++) {
                    var field_type = "text";
                    if (dataResultObj.fields[j].dataType === "INTEGER") {
                        field_type = "number";
                    }
                    ruleStr =
                        ruleStr +
                        '<div class="col-md-2">' +
                        '    <div class="form-group">' +
                        '        <label class="inputLabel" style="text-transform: uppercase">' +
                        dataResultObj.fields[j].name +
                        "</label>" +
                        '        <input type="' +
                        field_type +
                        '" class="form-control input-sm msg-values" maxlength="10"  oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" id="msgList_' +
                        j +
                        '" required="">' +
                        '        <small style="color:#ccc">Datatype: ' +
                        dataResultObj.fields[j].dataType +
                        "</small>" +
                        "    </div>" +
                        "  </div>";
                }
                $(".msgFieldBlock").html(ruleStr);
            }
        } else if (type == 2) {

            if (id == resultData[i].name) {
                    var placeholder =
                        "{\n'key':'value',\n'key':'value',\n'key':'value',\n'key':'value'\n}";
                    ruleStr =
                        ruleStr +
                        '<p class="mb-0 col-md-12"><label>Named Rule Arguments - JSON value</label></p>' +
                        '<div class="col-md-3">' +
                        '<textarea class="form-control form-control-sm mb-2 json-input" style="width:100%;height:200px" id="simulatorInput_' +
                        id +
                        '" ' +
                        'placeholder="' +
                        placeholder +
                        '"></textarea>' +
                        "</div>";
                    $(".msgFieldBlock").html(ruleStr);
                }
        } else if (type == 6) {

            ruleStr =
                ruleStr +
                '<div class=" col-md-4">' +
                '<div id="fileuploadFeedback" class=""></div>' +
                '<label class="inputLabel">Select Device</label>' +
                '<select id="simulatorDeviceList_' + id + '" class="form-control input-sm col-12"><option>No Devices Found</option></select>' +
                "<label class='mt-2'>Upload Binary File</label>" +
                "</p>" +
                '<input type="file" class="form-control pb-3 mb-2" required  id="simulatorInput_' +
                id +
                '">' +
                "</div>";
            $(".msgFieldBlock").html(ruleStr);
        } else if (type == 10) {

            ruleStr =
                ruleStr +
                '<div class=" col-md-4">' +
                '<div id="fileuploadFeedback" class=""></div>' +
                "<label>Upload File File</label>" +
                "</p>" +
                '<input type="file" class="form-control pb-3 mb-2" required  id="simulatorInput_' +
                id +
                '">' +
                "</div>";
            $(".msgFieldBlock").html(ruleStr);
        }
    }

    
}

function rulesSimulate(id, type) {
    if (type == 1) {
        var obj = {};
        var jsonObj = {};
        if (message_spec_list.length > 0) {
            for (j = 0; j < message_spec_list.length; j++) {
                simulator = message_spec_list[j];
                obj = simulator;
                if (id == simulator.id) {
                    for (var i = 0; i < obj.fields.length; i++) {
                        var dataType = obj.fields[i].dataType.toUpperCase();
                        if (dataType === "BOOLEAN") {
                            jsonObj[obj.fields[i].name] =
                                $("#msgList_" + i).val() === "true" ? true : false;
                        } else if (
                            dataType === "INTEGER" ||
                            dataType === "FLOAT" ||
                            dataType === "DOUBLE" ||
                            dataType === "BIGINT" ||
                            dataType === "TIMESTAMP"
                        ) {
                            jsonObj[obj.fields[i].name] =
                                $("#msgList_" + i).val() !== ""
                                    ? Number($("#msgList_" + i).val())
                                    : "";
                        } else if (dataType === "DATE") {
                            jsonObj[obj.fields[i].name] =
                                $("#msgList_" + i).val() !== ""
                                    ? new Date($("#msgList_" + i).val())
                                    : "";
                        } else {
                            jsonObj[obj.fields[i].name] = $("#msgList_" + i).val();
                        }
                    }
                }
            }
            $(".code_" + id).append(
                "<p>" + new Date() + " | " + JSON.stringify(jsonObj) + "</p>"
            );
            $(".btn_" + id).attr("disabled", "disabled");
            simulateDeviceMessage(id, jsonObj, function (status, data) {
                $(".btn_" + id).removeAttr("disabled");
                if (data.status) {
                    $(".msg-values").val("");
                    simpleFeedback("r_switch", "Message sent successfully", "success");
                    // $(".code_"+id).append('<p>'+new Date() +' | Message sent successfully</p>');
                } else {
                    errorMsg("Error in sent message");
                    // $(".code_"+id).append('<p>'+new Date() +' | Error in sent message</p>');
                }
            });
        }

    } else if (type == 2) {
        var inputObj = $("#simulatorInput_" + id).val();
        if (inputObj && isValidJson(inputObj)) {
            $(".btn_" + id).attr("disabled", "disabled");
            simulateMessage(id, type, function (status, data) {
                $(".btn_" + id).removeAttr("disabled");
                if (status) {
                    successMsg("Name Rule invoked successfully");
                    $(".json-input").val("");
                } else {
                    errorMsg("Error in invoking named rule");
                }
            });
        } else {
            errorMsg("Error in invoking named rule");
            errorMsgBorder(null, "simulatorInput_" + id);
        }
    } else if (type == 6) {
        var fileInput = document.getElementById("simulatorInput_" + id);
        var files = fileInput.files;
        if (files.length == 0) {
            errorMsg("File not found. select a file to start upload",);
            return false;
        }
        $(".btn_" + id).attr("disabled", "disabled");
        uploadBinaryFile(files[0], id);
    } else if (type == 10) {
        var fileInput = document.getElementById("simulatorInput_" + id);
        var files = fileInput.files;
        if (files.length == 0) {
            simpleFeedback(
                "fileuploadFeedback",
                "File not found. select a file to start upload",
                "error"
            );
            // errorMsgTriangle('File not found. select a file to start upload',"simulatorInput_"+id);
            return false;
        }
        $(".btn_" + id).attr("disabled", "disabled");
        uploadFileFile(files[0], id);
    }
}

function loadHelpTab() {
    $(".helpTab").remove();
    let str = '<li role="presentation" class="helpTab tabbar helpTabBar active" >' +
        '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadHelpTab()><i class="fa fa-question-circle"></i> Help' +
        '<span style="display: inline-block;margin-left: 20px;cursor: pointer;z-index:1" onclick="deleteHelpTab(event)" title="close"><i class="fa fa-close"></i></span></a>' +
        '</li>'

    $(".domainTab").removeClass('active')
    $(".editorBar li.tabbar").removeClass('active')
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

function loadTabbar(id, type, uniqId) {
    toggleHeading(id)
    $(".deleteBtn").css('display', 'none');
    let check = id
    if (type === 9 || type === 10 || type === 11 || type === 12 || type === 13 || type === 14) {
        check = uniqId
    }
    if (_.indexOf(tabbar_list, check) < 0) {
        const $editorBar = $(".editorBar")
        switch (type) { // navbar

            case 1:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="messageTab tabbar messageTab_' + id + '" >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadMessageRule(' + id + ')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(' + id + ',1,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(id);
                break;

            case 2:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="namedTab tabbar namedTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadNamedRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',2,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(id);
                break;

            case 3:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="scheduleTab tabbar scheduleTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadScheduleRule(' + id + ')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(' + id + ',3,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(id);
                break;

            case 6:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="binaryTab tabbar binaryTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadBinaryRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',6,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(id);
                break;

            case 7:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="jobTab tabbar jobTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadJobRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',7,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(id);
                break;

            case 8:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="fileTab tabbar fileTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadFileRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',8,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(id);
                break;

            case 9:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="processTab tabbar processTab_' + uniqId + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadProcessRule(\'' + uniqId + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + uniqId + '\',9,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(uniqId);
                break;

            case 10:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="sftpTab tabbar sftpTab_' + uniqId + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadSftpRule(\'' + uniqId + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + uniqId + '\',10,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                $(".sftpTab_" + id).addClass('active');
                tabbar_list.push(uniqId);
                break;

            case 11:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="mqttTab tabbar mqttTab_' + uniqId + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadMqttRule(\'' + uniqId + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + uniqId + '\',11,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(uniqId);
                break;

            case 12:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="udpTab tabbar udpTab_' + uniqId + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadUdpRule(\'' + uniqId + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + uniqId + '\',12,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(uniqId);
                break;

            case 13:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="tcpTab tabbar tcpTab_' + uniqId + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadTcpRule(\'' + uniqId + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + uniqId + '\',13,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(uniqId);
                break;

            case 14:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="emailTab tabbar emailTab_' + uniqId + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadEmailRule(\'' + uniqId + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + uniqId + '\',14,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(uniqId);
                break;

            case 15:
                $editorBar.append('<li role="presentation" data-ruleType="' + type + '" class="microTab tabbar microTab_' + id + '"  >' +
                    '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadMicroRule(\'' + id + '\')>' + id + ' ' +
                    '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',15,this,event)" title="close"><i class="fa fa-close"></i></span></a>' +
                    '</li>')
                tabbar_list.push(id);
                break;
        }


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
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')
            $(".messageFields tbody").html("");
            for (let i = 0; i < obj.fields.length; i++) {
                $(".messageFields tbody").append('<tr><td>' + obj.fields[i].name + '</td><td><label class="label label-default">' + obj.fields[i].dataType + '</label></td></tr>')
            }
            $(".simulateBtn").attr('onclick', 'checkSimulateDevices(\'' + id + '\',' + type + ')');
            break;

        case 2:
            loadNamedRule(id);
            $(".namedTab_" + id).addClass('active');
            $(".ruleType").html('Named Rule');
            $(".ruleName").html(id);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')
            $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',' + type + ')');
            break;

        case 3:
            loadScheduleRule(id);
            $(".scheduleTab_" + id).addClass('active');
            $(".ruleType").html('Schedule Rule');
            $(".ruleName").html(id);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')
            break;

        case 6:
            loadBinaryRule(id);
            $(".binaryTab_" + id).addClass('active');
            $(".ruleType").html('Binary Rule');
            $(".ruleName").html(id);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')
            $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',' + type + ')');
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

            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')

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

            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')
            $(".simulateBtn").attr('onclick', 'openSimulateModal(\'' + id + '\',' + type + ')');

            break;

        case 9:
            $(".processTab_" + uniqId).addClass('active');

            for (const iterator of process_rules_list) {
                if (uniqId === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadProcessRule(uniqId);
            loadProcessDetails(uniqId, obj);
            $(".ruleType").html('Process Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')

            break;

        case 10:
            $(".sftpTab_" + uniqId).addClass('active');

            for (const iterator of sftp_rules_list) {
                if (uniqId === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadSftpRule(uniqId);
            loadSftpDetails(uniqId, obj);
            $(".ruleType").html('SFTP Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')

            break;

        case 11:
            $(".mqttTab_" + uniqId).addClass('active');

            for (const iterator of mqtt_rules_list) {
                if (uniqId === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadMqttRule(uniqId);
            loadMqttDetails(uniqId, obj);
            $(".ruleType").html('MQTT Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')

            break;

        case 12:
            $(".udpTab_" + uniqId).addClass('active');
            for (const iterator of udp_rules_list) {
                if (uniqId === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadUdpRule(uniqId);
            loadUdpDetails(uniqId, obj);
            rightPanelDetails(".detailsBlock,.inputBlock")
            $(".ruleType").html('UDP Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')

            break;

        case 13:
            $(".tcpTab_" + uniqId).addClass('active');

            for (const iterator of tcp_rules_list) {
                if (uniqId === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadTcpRule(uniqId);
            loadTcpDetails(uniqId, obj);
            $(".ruleType").html('TCP Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')

            break;

        case 14:
            $(".emailTab_" + uniqId).addClass('active');

            for (const iterator of email_rules_list) {
                if (uniqId === iterator.id) {
                    obj = iterator;
                    break
                }
            }

            loadEmailRule(uniqId);
            loadEmailDetails(uniqId, obj);
            $(".ruleType").html('Email Rule');
            $(".ruleName").html(obj.name);
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')');

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
            $(".exportBtn").attr('onclick', 'exportRule(' + type + ')')

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
    $(".editorBar li.tabbar").removeClass('active')
    $(".domainTab").removeClass('active')
    $("." + splitValue).addClass('active')
    $("." + splitValue).children("a").trigger("click");
}

function loadDomainCode(cbk) {

    $(".detailsBlock").css('display', 'block')

    $(".ruleName").html('Domain Rule')
    $(".ruleType").html('Domain Rule')
    $(".ruleLanguage").html('GROOVY')


    getDomainrule(function (status, data) {
        if (status) {
            domain_rule_obj = data;
        }
        loadDomainRule();
        if (cbk) cbk()
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
    $('.transpernetProcessing').removeClass('hide')
    $(".btnRefresh").html('<i class="fa fa-refresh fa-spin"></i>');
    clickedObj = null;
    let treeData = [];

    async.series(
        {
            domainRule: function (dCbk) {
                loadDomainCode(function () {
                    dCbk(null, null)
                })
            },
            messageRule: function (mCbk) {
                if (message_rules_list.length > 0) {
                    message_spec_list.forEach(specList => {
                        let flag = true;
                        message_rules_list.forEach(ruleList => {
                            if (specList.id === ruleList.messageId) {
                                specList.ruleObj = ruleList;
                                flag = false;
                            }
                        })

                        if (flag) {
                            message_rules_list.push({
                                domainKey: null,
                                lang: "GROOVY",
                                code: "",
                                messageId: specList.id,
                                messageName: ''
                            });
                        }
                    })

                    let mrData = [];

                    message_spec_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.id, // node text
                            messageName: iterator.name,
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 1 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })

                    treeData.push({
                        id: "MSG_RULE", // will be autogenerated if omitted
                        text: "Message Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });

                    mCbk(null, null);
                } else {
                    treeData.push({
                        id: "MSG_RULE", // will be autogenerated if omitted
                        text: "Message Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadMessageRulesList(null, function () {
                        mCbk(null, null);
                    })
                }
            },
            namedRule: function (nrCbk) {
                if (named_rules_list.length > 0) {
                    let mrData = []
                    named_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.name, // will be autogenerated if omitted
                            text: iterator.name, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 2 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "NAMED_RULE", // will be autogenerated if omitted
                        text: "Named Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    nrCbk(null, null);
                } else {
                    treeData.push({
                        id: "NAMED_RULE", // will be autogenerated if omitted
                        text: "Named Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadNamedRulesList(null, function () {
                        nrCbk(null, null);
                    })
                }
            },
            scheduleRule: function (srCbk) {
                if (schedule_rules_list.length > 0) {
                    let mrData = []
                    schedule_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.id, // node text
                            pattern: iterator.pattern,
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 3 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "SCHEDULE_RULE", // will be autogenerated if omitted
                        text: "Schedule Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    srCbk(null, null);
                } else {
                    treeData.push({
                        id: "SCHEDULE_RULE", // will be autogenerated if omitted
                        text: "Schedule Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadScheduleRulesList(null, function () {
                        srCbk(null, null);
                    })
                }
            },
            binaryRule: function (brCbk) {
                if (binary_rules_list.length > 0) {
                    let mrData = []
                    binary_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.type, // will be autogenerated if omitted
                            text: iterator.type, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 6 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "BINARY_RULE", // will be autogenerated if omitted
                        text: "Binary Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    brCbk(null, null);
                } else {
                    treeData.push({
                        id: "BINARY_RULE", // will be autogenerated if omitted
                        text: "Binary Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadBinaryRulesList(null, function () {
                        brCbk(null, null);
                    })
                }

            },
            jobRule: function (jrCbk) {
                if (job_rules_list.length > 0) {
                    mrData = []
                    job_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.id, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 7 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "JOB_RULE", // will be autogenerated if omitted
                        text: "Job Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    jrCbk(null, null);
                } else {
                    treeData.push({
                        id: "JOB_RULE", // will be autogenerated if omitted
                        text: "Job Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadJobRulesList(null, function () {
                        jrCbk(null, null);
                    })
                }
            },
            fileRule: function (frCbk) {
                if (file_rules_list.length > 0) {
                    mrData = []
                    file_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.type, // will be autogenerated if omitted
                            text: iterator.type, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 8 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "FILE_RULE", // will be autogenerated if omitted
                        text: "File Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    frCbk(null, null);
                } else {
                    treeData.push({
                        id: "FILE_RULE", // will be autogenerated if omitted
                        text: "File Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadFileRulesList(null, function () {
                        frCbk(null, null);
                    })
                }

            },
            processRule: function (brCbk) {
                if (process_rules_list.length > 0) {
                    mrData = []
                    process_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.name, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 9 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "PROCESS_RULE", // will be autogenerated if omitted
                        text: "Process Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    brCbk(null, null);
                } else {
                    treeData.push({
                        id: "PROCESS_RULE", // will be autogenerated if omitted
                        text: "Process Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadProcessRulesList(null, function () {
                        brCbk(null, null);
                    })
                }
            },
            sftpInput: function (brCbk) {
                if (sftp_rules_list.length > 0) {
                    mrData = []
                    sftp_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.name, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 10 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "SFTP_INPUT", // will be autogenerated if omitted
                        text: "SFTP Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    brCbk(null, null);
                } else {
                    treeData.push({
                        id: "SFTP_INPUT", // will be autogenerated if omitted
                        text: "SFTP Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom
                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadSftpRulesList(null, function () {
                        brCbk(null, null);
                    })
                }
            },
            mqttInput: function (brCbk) {
                if (mqtt_rules_list.length > 0) {
                    mrData = []
                    mqtt_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.name, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 11 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "MQTT_INPUT", // will be autogenerated if omitted
                        text: "MQTT Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    brCbk(null, null);
                } else {
                    treeData.push({
                        id: "MQTT_INPUT", // will be autogenerated if omitted
                        text: "MQTT Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadMqttRulesList(null, function () {
                        brCbk(null, null)
                    })
                }
            },
            udpInput: function (brCbk) {
                if (udp_rules_list.length > 0) {
                    mrData = []
                    udp_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.name, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 12 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "UDP_INPUT", // will be autogenerated if omitted
                        text: "UDP Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    brCbk(null, null);
                } else {
                    treeData.push({
                        id: "UDP_INPUT", // will be autogenerated if omitted
                        text: "UDP Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadUdpRulesList(null, function () {
                        brCbk(null, null);
                    })
                }
            },
            tcpInput: function (brCbk) {
                if (tcp_rules_list.length > 0) {
                    mrData = []
                    tcp_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.id, // will be autogenerated if omitted
                            text: iterator.name, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 13 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "TCP_INPUT", // will be autogenerated if omitted
                        text: "TCP Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    brCbk(null, null);
                } else {
                    treeData.push({
                        id: "TCP_INPUT", // will be autogenerated if omitted
                        text: "TCP Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadTcpRulesList(null, function () {
                        brCbk(null, null);
                    })
                }
            },
            emailInput: function (brCbk) {
                if (email_rules_list.length > 0) {
                    mrData = []

                    treeData.push({
                        id: "EMAIL_INPUT", // will be autogenerated if omitted
                        text: "Email Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    brCbk(null, null);
                } else {
                    treeData.push({
                        id: "EMAIL_INPUT", // will be autogenerated if omitted
                        text: "Email Input", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadEmailRulesList(null, function () {
                        brCbk(null, null);
                    })
                }
            },
            microapirules: function (mrCbk) {
                if (micro_rules_list.length > 0) {
                    mrData = []
                    micro_rules_list.forEach(iterator => {
                        mrData.push({
                            id: iterator.name, // will be autogenerated if omitted
                            text: iterator.name, // node text
                            icon: "images/file.png", // string for custom
                            li_attr: { type: 15 }, // attributes for the generated LI node
                            a_attr: {}, // attributes for the generated A node
                        });
                    })
                    treeData.push({
                        id: "MICRO_API_Rule", // will be autogenerated if omitted
                        text: "Micro Api Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: mrData, // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    brCbk(null, null);
                } else {
                    treeData.push({
                        id: "MICRO_API_Rule", // will be autogenerated if omitted
                        text: "Micro Api Rule", // node text
                        icon: "fa fa-folder text-warning", // string for custom

                        state: {
                            opened: true, // is the node open
                            disabled: false, // is the node disabled
                            selected: false, // is the node selected
                        },
                        children: [], // array of strings or objects
                        li_attr: {}, // attributes for the generated LI node
                        a_attr: {}, // attributes for the generated A node
                    });
                    loadMicroRulesList(null, function () {
                        mrCbk(null, null);
                    })
                }
            }
        },
        function (err, results) {
            if (rulesTree) {
                $("#rules_tree").jstree("destroy");
            }
            rulesTree = $("#rules_tree").jstree({
                core: {
                    check_callback: true,
                    data: treeData,
                },
                plugins: ["contextmenu"],
                contextmenu: {
                    items: customTreeMenu,
                },
            });
            $('#rules_tree').on('ready.jstree', function () {
                $("#rules_tree").jstree("close_all");
            });
            $("#rules_tree").on("activate_node.jstree", function (e, data) {
                if (
                    data == undefined ||
                    data.node == undefined ||
                    data.node.id == undefined ||
                    data.node.original == undefined
                )
                    return;
                clickedObj = data.node;
                if (data.node.li_attr && data.node.li_attr.type) {
                    const megname = data.node.original.messageName
                        ? data.node.original.messageName
                        : "";
                    loadTabbar(
                        data.node.text,
                        data.node.li_attr.type,
                        data.node.id,
                    );
                }
            });
            setTimeout(() => {
                allRulesCalled()
                $('.transpernetProcessing').addClass('hide')
                $(".btnRefresh").html('<i class="fa fa-refresh"></i>');
            }, 500);

        });

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
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE +")")
    exportRule(CURRENT_TYPE);

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
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")
    exportRule(CURRENT_TYPE)

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
    $("#editorContent").html('<div id="codeEditor"></div>')
    let data = returnObj(id, 2);
    // $("#editorContent").html(`<div class="d-flex align-items-center">
    // <img src="images/rules-engine/folder-outline.png" width="15"><b class="mx-1">Named Rule</b> > <img src="images/rules-engine/file-outline.png" width="15" class="mx-1"> 
    // <span>`+ data.name +`</span>
    // <div class="btn btn-outline-primary ml-auto"><i class="fa fa-save "></i> Save</div></div>
    // <div id="codeEditor"></div>`);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'namedTab_' + id);
    CURRENT_ID = id;
    CURRENT_TYPE = 2;
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

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

    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)
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
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

    let obj = {};
    for (let i = 0; i < binary_rules_list.length; i++) {
        if (id === binary_rules_list[i].type) {
            obj = binary_rules_list[i];
            break
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


function loadJobRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 7);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'jobTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 7;
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

    $(".ruleType").html('Job Rule');
    $(".ruleName").html(data.id);


    $(".deleteBtn").css('display', 'block');

    loadJobDetails(id, data)
    toggleHeading(id)

    rightPanelDetails(".detailsBlock,.jobFields")
}

function loadFileRule(id) {
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 8);
    $("#codeEditor").html('');
    loadEditor(data ? data.code : '', 'fileTab_' + id);
    CURRENT_ID = id;
    CURRENT_TYPE = 8;
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

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


function loadProcessRule(id) {
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 9);
    $("#codeEditor").html('');
    loadEditor(data.code ? data.code : '', 'processTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 9;
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

    $(".ruleType").html('Process Rule');
    $(".ruleName").html(data.id);


    $(".deleteBtn").css('display', 'block');

    loadProcessDetails(id, data)

    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.processBlock")


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
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

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
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

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
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

    $(".ruleType").html('UDP Rule');
    $(".ruleName").html(data.name);


    $(".deleteBtn").css('display', 'block');

    loadUdpDetails(id, data)
    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.inputBlock")

}

function loadTcpRule(id) {
    // id ='TCPRALE'
    $(".simulateBtn").css('display', 'none');
    //  mqttCancelSubscribe(CURRENT_ID);
    $("#editorContent").html('<div id="codeEditor"></div>');
    let data = returnObj(id, 13);
    $("#codeEditor").html('');

    loadEditor(data.code ? data.code : '', 'tcpTab_' + id);

    CURRENT_ID = id;
    CURRENT_TYPE = 13;
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

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
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

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
    $("#exportMsg").attr("onclick", "exportRule(" + CURRENT_TYPE + ")")

    exportRule(CURRENT_TYPE)

    $(".ruleType").html('Micro API Rule');
    $(".ruleName").html(data.name);


    $(".deleteBtn").css('display', 'block');

    loadMicroDetails(id, data)
    toggleHeading(id)
    rightPanelDetails(".detailsBlock,.inputBlock")

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

function openModal(id) {
    if (id) {
        $("#addRule").modal('hide');
        setTimeout(() => {
            switch (id) {
                case 1:
                    if (message_spec_list.length === 0) {
                        loadMessageRulesList(true, function (status) {
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
                        })
                        return
                    }
                     
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
        }, 350);
    } else {
        $("#addRule").modal('show');
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
                    setTimeout(() => {
                        loadMqttRulesList();
                        $("#deleteModal").modal('hide');
                    }, 500);
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
                    loadMessageRulesList(null, function (status) {
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

    updateNamedRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadNamedRulesList(null, function () {
                loadTabbar(dataObj.name, 2);
                $("#addNamedRule").modal('hide');
            });
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

    updateScheduleRuleCode(dataObj, function (status, data) {
        if (status) {
            successMsg('Successfully saved!');
            loadScheduleRulesList(null, function () {
                loadTabbar(dataObj.id, 3);
                $("#addScheduleRule").modal('hide');
            })

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
            loadBinaryRulesList(null, function () {
                loadTabbar(dataObj.type, 6);
                $("#addBinaryRule").modal('hide');
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
            loadJobRulesList(null, function () {
                loadTabbar(dataObj.id, 7);
                $("#addJobRule").modal('hide');
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
            loadFileRulesList(null, function () {
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
            loadProcessRulesList(null, function () {
                loadTabbar(data.name, 9, data.id);
                $("#addProcessRule").modal('hide');
            });
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

            loadSftpRulesList(null, function () {
                loadTabbar(dataObj.name, 10, dataObj.id);
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

            loadMqttRulesList(null, function () {
                loadTabbar(dataObj.name, 11, dataObj.id);
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
            loadUdpRulesList(null, function () {
                loadTabbar(dataObj.name, 12, dataObj.id);
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
            loadTcpRulesList(null, function () {
                loadTabbar(dataObj.name, 13, dataObj.id);
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
            loadEmailRulesList(null, function () {
                loadTabbar(dataObj.name, 14, dataObj.id);
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
            loadMicroRulesList(null, function () {
                loadTabbar(dataObj.name, 15, dataObj.id);
                $("#addMicroRule").modal('hide');
            })
        } else {
            errorMsg('Error in saving!')
        }
    })


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
    let str = ""
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

        case 6:
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

        case 8:
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
                    fbk(false, null)
                }
            });
        }
    ]);
}

function simulateMessage(id, type ,sbk) {
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
                if (sbk) {
                    sbk(true)
                    return
                }
                $(".code_" + id).append('<p>' + new Date() + ' | Message sent successfully</p>');
            } else {
                if (sbk) {
                    sbk(false)
                    return
                }
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
                    if (sbk) {
                        sbk(true)
                        return
                    }
                    $(".code_" + id).append('<p>' + new Date() + ' | Named Rule invoked successfully</p>');
                    $(".code_" + id).append('<p>' + new Date() + ' | Result => ' + JSON.stringify(data) + '</p>');
                } else {
                    if (sbk) {
                        sbk(false)
                        return
                    }
                    $(".code_" + id).append('<p>' + new Date() + ' | Error in invoking named rule</p>');
                }

            });

        } else {
            errorMsgBorder("Empty JSON (or) Invalid JSON", "simulatorInput_" + id)
        }

    }
    else if (type === 6) {


        let fileInput = document.getElementById("simulatorInput_" + id);

        let files = fileInput.files;

        if (files.length === 0) {
            errorMsgBorder('File not found. select a file to start upload', "simulatorInput_" + id);
            return false;
        }
        $(".btn_" + id).attr('disabled', 'disabled');
        uploadBinaryFile(files[0], id);

    }
    else if (type === 8) {


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

        case 0:
            console.log('Domain Rule...!');
            rule_name = 'domain-rule';
            data = {
                lang: 'GROOVY',
                code: consoleText
            }

            break;

        case 1:
            console.log('Message Rule...!');
            rule_name = 'message-rule-' + CURRENT_ID;
            data = {
                lang: 'GROOVY',
                code: consoleText,
                messageId: CURRENT_ID
            }


            break;
        case 2:
            console.log('Named Rule...!');
            rule_name = 'named-rule-' + CURRENT_ID;
            data = {
                lang: 'GROOVY',
                code: consoleText,
                name: CURRENT_ID
            }


            break;
        case 3:
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
        
        default:
            // export all
            // $.ajax({
            //     url: "/domain-rule/export-all",
            //     contentType: "application/json",
            //     type: 'POST',
            //     data: JSON.stringify({
            //         type: 'ALL'
            //     }),

            //     success: function (response) {
            //         if (response.status) {
            //             $("#processingStatus").html("")
            //             $('.exportall').removeClass('disabled')
            //             var report = API_BASE_PATH + '/files/download/' + SESSION_OBJ.token + '/' + response.result.id;
            //             window.location = report;
            //             simpleFeedback("centerswitch", "Rules Exported successfully", "success");

            //         } else {
            //             $("#processingStatus").html("")
            //             $('.exportall').removeClass('disabled')
            //             simpleFeedback("centerswitch", response.message, "error");

            //         }
            //         //called when successful
            //     },
            //     error: function (e) {
            //         if (e.status == 401) {
            //             commonErrornotice()

            //         } else {
            //             $("#processingStatus").html("")
            //             $('.exportall').removeClass('disabled')
            //             simpleFeedback("centerswitch", "Something went wrong", "error");
            //         }

            //     }
            // });
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
                    loadMessageRulesList(null, function (status) {
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
                    loadNamedRulesList(null, function () {
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
                    loadScheduleRulesList(null, function () {
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
                    loadBinaryRulesList(null, function () {
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
                    loadJobRulesList(null, function () {
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
                    loadFileRulesList(null, function () {
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
                    loadProcessRulesList(null, function () {
                        successMsg('Process Rule Successfully Uploaded!');
                        loadTabbar(data.name, 9, data.id)
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
                    loadSftpRulesList(null, function () {
                        successMsg('SFTP Rule Successfully Uploaded!');
                        loadTabbar(data.name, 10, data.id)
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
                    loadMqttRulesList(null, function () {
                        successMsg('MQTT Rule Successfully Uploaded!');
                        loadTabbar(data.name, 11, data.id)
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
                    loadUdpRulesList(null, function () {
                        successMsg('UDP Rule Successfully Uploaded!');
                        loadTabbar(data.name, 12, data.id)
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
                    loadTcpRulesList(null, function () {
                        successMsg('TCP Rule Successfully Uploaded!');
                        loadTabbar(data.name, 13, data.id)
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
                    loadEmailRulesList(null, function () {
                        successMsg('EMAIL Rule Successfully Uploaded!');
                        loadTabbar(data.name, 14, data.id)
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
                    loadMicroRulesList(null, function () {
                        successMsg('Micro API Rule Successfully Uploaded!');
                        loadTabbar(data.name, 15, data.id)
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
                initiateEditor();

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
    $(".simulateBtn").prop("disabled",true)
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
    if (clsName) $(clsName).css('display', 'block')
}

rightPanelDetails(".detailsBlock")

var prevOpenId = null;
function openBottomWindow(id) {
    $("#statusBar ul li").removeClass('highlightFooterBtn')
    $("#statusBar ul li a").removeClass('highlightFooterBtn')
    $(".fs_" + id).addClass('highlightFooterBtn')

    $(".fs_" + id).parent().addClass('highlightFooterBtn')
    $('#failiurelogsOptions').html('')

    if (prevOpenId == id) {
        $("#statusContent").addClass('d-none')
        $("#statusContent").slideUp();
        prevOpenId = null
    } else {
        $("#statusContent").removeClass('d-none')
        $("#statusContent").slideDown();
        prevOpenId = id;
    }
    $(".bottomTab").removeClass('hide').addClass('hide');
    if (id == 1) {
        listRulesId(Number($('#rulesType').val())) // simulator click
        $("#statusContent .title").html('<i class="fa fa-chevron-right"></i><i class="fa fa-window-minimize"></i> Simulator')
        var str = '<a href="javascript:void(0)" title="Full screen" class="ml-2 mr-2 expandscreenOption" fullScreen="false" onclick="loadErrorLogsFullScreen()"><img src="images/fullscreen.svg" alt="img" width="12"> </a>'
        $('#failiurelogsOptions').html(str)
    }
    else if (id == 2) {
        $("#statusContent .title").html('<i class="zmdi zmdi-comment-text"></i> Live Messages')
        var str = '<a href="javascript:void(0)" title="Full screen" class="ml-2 mr-2 expandscreenOption" fullScreen="false" onclick="loadErrorLogsFullScreen()"><img src="images/fullscreen.svg" alt="img" width="12"> </a>'
        $('#failiurelogsOptions').html(str)
    }
    else if (id == 3) {
        $("#statusContent .title").html('<i class="fa fa-bug"></i> Rules Engine Console')
        var str = '<a href="javascript:void(0)" title="Full screen" class="ml-2 mr-2 expandscreenOption" fullScreen="false" onclick="loadErrorLogsFullScreen()"><img src="images/fullscreen.svg" alt="img" width="12"> </a>'
        $('#failiurelogsOptions').html(str)
    }
    else if (id == 4) {
        $("#statusContent .title").html('<i class="fa fa-file" style="font-size: 13px;"></i> Failure Logs<span class="failiureLogCount"></span>')
        var str = '<a href="javascript:void(0)" title="Full screen" class="ml-2 mr-2 expandscreenOption" fullScreen="false" onclick="loadErrorLogsFullScreen()"><img src="images/fullscreen.svg" alt="img" width="12"> </a><a href="javascript:void(0)"  title="Refresh" class="ml-2 mr-2" onclick="loadErrorLogs()"><img src="images/refresh.svg" alt="img" width="15"> </a>'
        var str1 = ' <div class="d-inline-flex mr-2"><div id="eventhistoryrange" class="datepicker-style cursor-pointer">' +
            '<img src="images/calender.svg" alt="img" width="12">&nbsp;' +
            '<span></span> <i class="fa fa-caret-down pull-right mt-1"></i>' +
            '</div></div>'

        $('#failiurelogsOptions').html(str1 + str)
        loadFooterDateRanges()

    }
    else if (id == 5) {
        $("#statusContent .title").html('<i class="fa fa-angle-right"></i> Command Console')
        var str = '<a href="javascript:void(0)" title="Full screen" class="ml-2 mr-2 expandscreenOption" fullScreen="false" onclick="loadErrorLogsFullScreen()"><img src="images/fullscreen.svg" alt="img" width="12"> </a>'
        $('#failiurelogsOptions').html(str)
        $('.tchange').css('height', '219px')
    }
    else if (id == 6) {
        $("#statusContent .title").html('<i class="fa fa-code"></i> Script Executor')
        var str = '<a href="javascript:void(0)" title="Full screen" class="ml-2 mr-2 expandscreenOption" fullScreen="false" onclick="loadErrorLogsFullScreen()"><img src="images/fullscreen.svg" alt="img" width="12"> </a>'
        $('#failiurelogsOptions').html(str)
    }
    else if (id == 7) {
        $("#statusContent .title").html('<i class="fa fa-file-text" style="font-size: 13px;"></i> Live Logs')
        var str = '<a href="javascript:void(0)" title="Full screen" class="ml-2 mr-2 expandscreenOption" fullScreen="false" onclick="loadErrorLogsFullScreen()"><img src="images/fullscreen.svg" alt="img" width="12"> </a>'
        var str1 = '<a href="javascript:void(0)" title="Clear" class="ml-2 mr-2" onclick="clearLogs()"><img src="images/delete.svg" alt="img" width="15"></a>'

        $('#failiurelogsOptions').html(str1 + str)
    }
    $(".tab_" + id).removeClass('hide')

}

function loadFooterDateRanges() {
    var selected_startdate = parseInt($("#single_app_startdate").val())
    var selected_enddate = parseInt($("#single_app_end_date").val())
    if (selected_startdate && selected_enddate) {
        startDate = moment(new Date(selected_startdate));
        endDate = moment(new Date(selected_enddate));
    }
    function cb(start, end, label) {
        var title = '';
        var range = '';

        startDate = start;
        endDate = end;

        if (new Date(start).getTime() === new Date(moment().startOf('day')).getTime()) {
            title = 'Today:';
            range = start.format('MMM D, YYYY');
        } else if (new Date(start).getTime() === new Date(moment().subtract(1, 'day').startOf('day')).getTime() && new Date(end).getTime() === new Date(moment().subtract(1, 'day').endOf('day')).getTime()) {
            title = 'Yesterday:';
            range = start.format('MMM D, YYYY');
        } else {
            range = start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY');
        }

        $('#eventhistoryrange span').html(title + ' ' + range).css('font-size', '13px');
        loadErrorLogs();

    }

    $('#eventhistoryrange').daterangepicker({
        opens: 'left',
        startDate: startDate,
        endDate: endDate,
        ranges: {
            'Today': [moment().startOf('day'), moment().endOf('day')],
            'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
            'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
            'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(startDate, endDate);
}

function footerStsBar() {
    loadTerminal();
    loadErrorLogs();
}

function loadTerminal() {
    scriptTerminal = $("#scriptTerminal").terminal(
        function (command, term) {
            if (command !== "") {
                if (command) {
                    if (
                        command.toUpperCase() === "CLR" ||
                        command.toUpperCase() === "CLEAR"
                    ) {
                        commandsList = [];
                    } else {
                        commandsList.push(command);
                    }
                }
            } else {
                this.echo("");
            }
        },
        {
            greetings:
                "&nbsp;&nbsp;&nbsp;&nbsp;(           (         )\n" +
                "&nbsp;( )/          )/ )   ( /(    )\n" +
                "&nbsp;)((_) (   (  (()/((  )/())( /( `  )   \n" +
                "((_)_  )/  )/  ((_))/((_)/ )(_))/(/(   \n" +
                "| _ )((_)((_) _| |(_) |(_)(_)_((_)_/  \n" +
                "| _ / _ / _ / _` (_-< / // _` | `_  ) \n" +
                "|___/___/___/__,_/__/_/_//__,_| .__/  \n" +
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|_|    \n" +
                "Welcome To https://Boodskap.io Terminal",
            name: "Workflow Studio Terminal",
            resize: function (e, ui) { },
            height: $(".tab_5").height() - 30,
            prompt: "> ",
            memory: false,
            keydown: function (event, term) {
                var self = this;
                if (event.ctrlKey && event.keyCode === 86) {
                }
                if (event.ctrlKey && event.keyCode === 13) {
                    if (commandsList.length > 0) {
                        var id = guid();
                        var cmdObj = {
                            code: commandsList.join("\n"),
                            sessionId: id,
                        };
                        commandsList = [];
                        if (cmdObj.code.includes('boodskap install')) {
                            this.echo('<div class="log_' + id + '">' + moment().format("MM/DD/YYYY hh:mm a") +
                                " | widget installation request initiated </div><div class='console_" + id + "'></div><div class='console_loader_" + id + " text-info'>" +
                                '<i class="fa fa-spinner fa-spin"></i> waiting for response</div>', { raw: true });
                            var wid = cmdObj.code.split(" ")[3];


                            getWidgetFromMarketplace(wid, function (status, result) {
                                if (result.status && result.result) {
                                    var widgetObj = result.result;
                                    $(".console_loader_" + id).html('<i class="fa fa-spinner fa-spin"></i> Importing widget data...')
                                    widgetObj.clientDomainKey = DOMAIN_KEY;
                                    widgetObj.domainKey = DOMAIN_KEY;
                                    delete widgetObj._id;
                                    widgetObj['marketplace'] = 'yes';
                                    //importing code
                                    var data = {
                                        data: widgetObj.code_obj
                                    };
                                    widgetinsertGlobalProperty(data, function (status, data) {
                                        $(".console_loader_" + id).html('<i class="fa fa-spinner fa-spin></i> "+Installing widget data...')
                                        if (data.status) {
                                            widgetObj.code = data.result.id;
                                            var inputObject = {
                                                data: widgetObj
                                            }
                                            upsertWidget(inputObject, function (status, data) {
                                                if (data.status) {
                                                    $(".console_loader_" + id).html('Widget installed successfully!')
                                                    // successMsg('Widget installed successfully!');
                                                } else {
                                                    $(".console_loader_" + id).removeClass('text-info')
                                                    $(".console_loader_" + id).addClass('text-danger')
                                                    $(".console_loader_" + id).html('Error in Widget Installation')
                                                    // errorMsg('Error in Widget Installation!')
                                                }
                                            });
                                        } else {
                                            $(".console_loader_" + id).removeClass('text-info')
                                            $(".console_loader_" + id).addClass('text-danger')
                                            $(".console_loader_" + id).html('Error in installing widget code')
                                            errorMsg('Error in installing widget code!')
                                        }
                                    })

                                } else {
                                    $(".console_loader_" + id).removeClass('text-info')
                                    $(".console_loader_" + id).addClass('text-danger')
                                    $(".console_loader_" + id).html('Widget not found (or) invalid widget id!')
                                }
                            })
                        } else {
                            this.echo(
                                '<div class="log_' +
                                id +
                                '">' +
                                moment().format("MM/DD/YYYY hh:mm a") +
                                " | Command executed successfully </div><div class='console_" +
                                id +
                                "'></div><div class='console_loader_" +
                                id +
                                " text-info'>" +
                                '<i class="fa fa-spinner fa-spin"></i> waiting for command response</div>',
                                { raw: true }
                            );
                            executeConsoleScript(cmdObj, function (status, data) {
                                if (status) {
                                } else {
                                    self.echo(
                                        "<span class='red'>" +
                                        moment().format("MM/DD/YYYY hh:mm a") +
                                        " | Error in command execution</span>"
                                    );
                                }
                            });
                        }
                    } else {
                        this.echo("no commands to execute");
                    }
                }
            },
        }
    );
}

function loadErrorLogs(searchText) {
    $(".failure_lastlog").html('')
    $('.failiurelogProcess').removeClass('hide')
    var query = {
        query: {
            "bool": {
                "must": [{ "match": { "domainKey": DOMAIN_KEY } }],
                "filter": {
                    "range": {
                        "occuredAt": {
                            "gte": new Date(startDate).getTime(),
                            "lte": new Date(endDate).getTime()
                        }
                    }
                },
                should: []
            }
        },
        "aggs": {
            "groups": {
                "terms": { "field": "ruleType" }
            }

        },
        from: 0,
        size: 1000,
        sort: [{ "occuredAt": { "order": "desc" } }]
    }

    if (searchText) {
        query.query['bool']['should'].push({ "wildcard": { "message": "*" + searchText.toLowerCase() + "*" } })
        query.query['bool']['should'].push({ "wildcard": { "stackTrace": "*" + searchText.toLowerCase() + "*" } })
        query.query['bool']['should'].push({ "wildcard": { "namedRule": "*" + searchText.toLowerCase() + "*" } })
        query.query['bool']['should'].push({ "wildcard": { "binaryRule": "*" + searchText.toLowerCase() + "*" } })
        query.query['bool']['should'].push({ "wildcard": { "ruleType": "*" + searchText.toLowerCase() + "*" } })
        query.query['bool']["minimum_should_match"] = 1;
    }

    var obj = {
        "type": "RULE_FAILURE",
        query: JSON.stringify(query),
    }
    $(".errorLogs").html('')
    failiureLogs(obj, function (status, result) {
        if (status && result.httpCode === 200) {
            var resultData = searchQueryFormatterNew(result).data;
            $('.failiurelogProcess').addClass('hide')
            if (resultData.recordsTotal > 0) {
                var data = resultData.data;

                $(".errorLogs").html('')
                for (var i = 0; i < data.length; i++) {
                    $(".errorLogs").append('<li class="mb-2" style="color:#fff;border-bottom: 1px solid #403d3d;padding: 10px 10px;font-size: 12px">' +
                        '<span class=""><i class="fa fa-clock-o"></i> ' + moment(data[i].occuredAt).format('MM/DD/YYYY hh:mm:ss a') + '</span> | ' +
                        (data[i].messageId ? '[Message Id: <strong>' + data[i].messageId + '</strong>]' : '') +
                        (data[i].namedRule ? '[Named Rule: <strong>' + data[i].namedRule + '</strong>]' : '') +
                        (data[i].binaryRule ? '[Binary Rule: <strong>' + data[i].binaryRule + '</strong>]' : '') +
                        (data[i].ruleType ? '[Rule Type: <strong>' + data[i].ruleType + '</strong>]' : '') +
                        '<br>' +
                        (data[i].message ? '<pre style="white-space: pre-wrap;color:#b3b0b0;background:#000;border:0;padding:0">' + data[i].message + '</pre>' : '') +
                        (data[i].stackTrace ? '<p class="font-weight-bold mt-2">Stack Trace</p><pre style="white-space: pre-wrap;color:#b3b0b0">' + data[i].stackTrace + '</pre>' : '') +
                        '</li>')
                }

            } else {
                $(".errorLogs").html('<li style="color: #fff;text-align: center;margin-top: 51px;">No logs available</li>')
            }

        } else {
            $('.failiurelogProcess').addClass('hide')

            $(".errorLogs").html('<li style="color: #fff;text-align: center;margin-top: 51px;">No logs available</li>')

        }
    })
}

function failiureLogs(obj, cbk) {
    $.ajax({
        url: API_BASE_PATH + "/elastic/search/query/" + API_TOKEN_ALT,
        data: JSON.stringify(obj),
        contentType: "application/json",
        type: 'POST',
        "headers": {
            "TOKEN": API_TOKEN
        },
        success: function (data) {
            cbk(true, data);
        },
        error: function (e) {
            cbk(false, e);
        }
    });
}

function initiateEditor() {
    if (scriptEditor) {
        scriptEditor.destroy();
    }

    $("#scriptEditor").html("");

    scriptEditor = ace.edit("scriptEditor");


    scriptEditor.setTheme("ace/theme/monokai");
    scriptEditor.session.setMode("ace/mode/groovy");
    scriptEditor.getSession().setUseWrapMode(true);
    scriptEditor.setShowPrintMargin(false);

    var platfromSnippet = loadPlatformSnippet();

    ace.config.loadModule("ace/ext/language_tools", function () {
        scriptEditor.setOptions({
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false
        });

        var snippetManager = ace.require("ace/snippets").snippetManager;
        var config = ace.require("ace/config");

        ace.config.loadModule("ace/snippets/groovy", function (m) {
            if (m) {
                m.snippets = platfromSnippet;
                snippetManager.register(m.snippets, m.scope);
            }
        });

    });

    scriptEditor.setValue('');
    scriptEditor.clearSelection();
    $('#scriptEditor').height('calc(100vh  - '+otherHeight+' + px');

    scriptEditor.resize();


    scriptEditor.commands.addCommand({
        name: 'executeCommand',
        bindKey: {
            win: 'Ctrl-Enter',
            mac: 'Command-Enter',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {
            executeScript()
        }
    });

}


function executeScript() {
    $(".scriptResult").html('')
    var id = guid();
    var consoleText = scriptEditor.getSession().getValue();

    if (consoleText.trim() !== '') {

        var cmdObj = {
            code: consoleText,
            sessionId: id
        };

        $(".scriptResult").html('<div class="log_' + id + '">' +
            "</div><div class='console_" + id + "'></div><div class='console_loader_" + id + "'>" +
            '<i class="fa fa-spinner fa-spin"></i> waiting for script response</div>', { raw: true });

        executeConsoleScript(cmdObj, function (status, data) {
            if (status) {

            } else {
                $(".scriptResult").html("<span class='text-danger'>" + moment().format("MM/DD/YYYY hh:mm a") + " | Error in script execution</span>");
            }

        });
    }
}

function loadErrorLogsFullScreen() {

    if (fullScreenEnable) {
        fullScreenEnable = false
        $('.expandscreenOption').attr('fullScreen', "true")
        $('.hchange').css("height", "100vh")
        $('.cdebug').css("height", "100vh")
        $('.tchange').css("height", "100vh")
        $('#consoleBox').css("height", "100vh")
        $('#statusContent').css('height', '100vh').addClass('full-screen')
        $('#scriptEditor').height('100vh');
        $('.expandscreenOption img').attr('src', 'images/fitzoom.svg')
        $('.liveMessages').css('height', '100vh')
        $('.errorLogs').css('height', '100vh')
        $("#livelogsec").css('height', '100vh')
    } else {
        fullScreenEnable = true
        $('.expandscreenOption').attr('fullScreen', "false")
        $('.errorLogs').css('height', '250px')
        $("#livelogsec").css('height', '250px')
        $('.hchange').css("height", "250px")
        $('.cdebug').css("height", "170px")
        $('.tchange').css("height", "215px")
        $('#consoleBox').css("height", "250px")
        $('.expandscreenOption img').attr('src', 'images/fullscreen.svg')
        $('#statusContent').css('height', '290px').removeClass('full-screen')
        $('.liveMessages').css('height', '215px')
        $('#scriptEditor').height('calc(100vh  - ' + otherHeight + ' + px');
    }
    // $('#statusContent').toggleFullScreen()
    // $('#statusContent').bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function (e) {
    //     var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    // });
}

function closeFooter() {
    if ($(".expandscreenOption").attr("fullScreen") === "true") {
        $('.expandscreenOption').attr('fullScreen', "false")
        $('.errorLogs').css('height', '250px')
        $("#livelogsec").css('height', '250px')
        $('.hchange').css("height", "250px")
        $('.cdebug').css("height", "170px")
        $('.tchange').css("height", "215px")
        $('#consoleBox').css("height", "250px")
        $('.expandscreenOption img').attr('src', 'images/fullscreen.svg')
        $('#statusContent').css('height', '290px')
        $('.liveMessages').css('height', '215px')
        $('#scriptEditor').height('calc(100vh  - ' + otherHeight + ' + px');
        $('#statusContent').toggleFullScreen()
    }
    $('#statusContent').slideUp();
    prevOpenId = null;
    $("#statusBar li,#statusBar li > a").removeClass("highlightFooterBtn")
}


function clearLogs1() {
    $(".debugMessages").html("");
    successMsg('Logs cleared successfully');
}

function footerToggleFunction(type) {
    if (type === "hide") {
        $('#statusContent').slideUp();
        prevOpenId = null;
        $("#statusBar").removeClass("d-md-block");
        $("#statusBar").addClass("d-none");
        $("#footerOpen").removeClass("d-none");
    } else {
        $("#statusBar").addClass("d-md-block");
        $("#statusBar").removeClass("d-none");
        $("#footerOpen").addClass("d-none");
    }
}