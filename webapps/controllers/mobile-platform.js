var DASHBOARD_LIST = [];
var CURRENT_DASHBOARD = {};
var CURRENT_DASHBOARD_ID = null;
var DEFAULT_DASHBOARD = {
    name: 'Untitled Dashboard',
    id: new Date().getTime(),
    property: 'mobile.dashboard.1',
    icon: 'icon-dashboard',
};
var CURRENT_DOMAIN = {};
var DASHBOARD_WIDGETS = [];
var GRID_STACK = null;
var GS_ARRAY = {};
var clicked_dashboard_icon = null;
var WIDGETS_LIST = [];
var mobThemeProp = {};

var editorHeight = $(window).height() - 150;
var delete_widget_id = null;
var added_widgets_list = [];
var imported_widget_list = [];
var current_widget_id = null;
var current_widget_obj = null;
var htmlEditor = null;
var jsEditor = null;
var cssEditor = null;
var asset_list = [];
var device_list = [];
var message_list = [];
var imageID = null;
var splashUrl = '';
$(document).ready(function() {
    $(".resourceTab").css('height', editorHeight + 'px');

    $(".dashboardContent").css('height', $(window).height() - 245);
    $(".widgetBody").css('height', $(window).height() - 220);
    $(".widgetBody .widgets-loader").css('height', $(window).height() - 210);
    $(".widgetBody .dashboard-loader").css('height', $(window).height() - 210);
    $(".dashboardListBody").css('height', $(window).height() - 220);
    $("body").removeClass('bg-white');
    $(".dashboardBody").css('height', $(window).height() - 135);
    $("#demo-device-ios").css('height', $(window).height() - 80);
    $("#splashIOS").css('height', $(window).height() - 80);
    $('#logoPosition').val('25%');
    $('.panel').hover(function() {
        $(this).find('.panel-footer').slideDown(250);
    }, function() {
        $(this).find('.panel-footer').slideUp(250); //.fadeOut(205)
    });


    $('#searchText').on("keydown", function(e) {
        if (e.keyCode === 13) {
            loadImportedWidgets();
            return false; // prevent the button click from happening
        }
    });

    var options = {
        animate: true,
        cellHeight: 100,
        float: false,
        verticalMargin: 10,
        resizable: {
            handles: 's'
        }
    };
    $('.grid-stack').gridstack(options);

    loadDashboardlist();
    loadImportedWidgets();
    addIconList();
    getMobileTheme();
    loadImageList();
    getMobileAppSplash();

});

function mqttListen() {

}

function loadDashboardlist() {
    getDomainProperty(MOBILE_DASHBOARD_LIST_PROPERTY, function(status, data) {
        if (status) {

            DASHBOARD_LIST = JSON.parse(data.value);
            var dboardListHtml = "";
            $(".dashboardList").html("");

            if (DASHBOARD_LIST.length > 0) {

                for (var i = 0; i < DASHBOARD_LIST.length; i++) {

                    var iconStr = '';

                    if (DASHBOARD_LIST[i].isimage) {
                        iconStr = '<img src="' + DASHBOARD_LIST[i].imgpath + '" style="height: 28px;" />';
                    } else {

                        iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
                    }

                    var dashId = DASHBOARD_LIST[i].id;

                    dboardListHtml =
                        '<li class="dashboardLi dashboard_' + DASHBOARD_LIST[i].id + '" title="' + DASHBOARD_LIST[i].name + '">' +
                        '<span title="Remove Dashboard" class="d-delete" onclick="openDashboardModal(\'' + 3 + '\',\'' + dashId + '\')"><i class="icon-trash-o"></i> </span>' +
                        '<span onclick="loadSingleDashboardWidgets(\'' + encodeURIComponent(JSON.stringify(DASHBOARD_LIST[i])) + '\')">     ' +
                        '<p>' + iconStr + '</p>' +
                        '    <div class="d-name">' + DASHBOARD_LIST[i].name + '</div></span>' +
                        '</li>';

                    $(".dashboardList").append(dboardListHtml);
                }
                loadDashboard(DASHBOARD_LIST[0]);
                $(".dashboards-count").html('(' + DASHBOARD_LIST.length + ')');

            } else {

                $(".info-tutorial").show();
                $("#dashboardCreateTutorial").show();
                $("#addWidgetBtn").hide();
                $("#editWidgetBtn").hide();
                $("#noDashboards").show();
                $("#noWidgets").hide();

                $(".dashboards-count").html('(0)');
                $(".dashboardContent").css('background-color', DEFAULT_DASHBOARD_BG);
                $(".dashboardName").html("Widgets");
            }


        } else {
            DASHBOARD_LIST = [];
            $(".dashboardList").html("");
            $(".info-tutorial").show();
            $("#dashboardCreateTutorial").show();
            $("#addWidgetBtn").hide();
            $("#editWidgetBtn").hide();
            $("#noDashboards").show();
            $("#noWidgets").hide();

            $(".dashboards-count").html('(0)');
            $(".dashboardContent").css('background-color', DEFAULT_DASHBOARD_BG);
            $(".dashboardName").html("Widgets");
        }
    });
}

function loadSingleDashboardWidgets(obj) {

    CURRENT_DASHBOARD = JSON.parse(decodeURIComponent(obj));
    CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;

    $(".dashboardLi").removeClass('active');
    $(".dashboard_" + CURRENT_DASHBOARD.id).addClass('active');
    $(".dashboardContent").css('background-color', CURRENT_DASHBOARD.bgcolor ? "#" + CURRENT_DASHBOARD.bgcolor : DEFAULT_DASHBOARD_BG);

    $(".dashboardName").html(CURRENT_DASHBOARD.name ? CURRENT_DASHBOARD.name : "Widgets");
    $(".dashboardIcon").html('<i class="' + CURRENT_DASHBOARD.icon + '"></i>');
    loadWidgets(CURRENT_DASHBOARD);
}

function addWidgetModal(obj) {
    // CURRENT_DASHBOARD  = JSON.parse(decodeURIComponent(obj));
    // CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;
    $("#addWidgetModal").modal();
}

function addDashboardToMobile(dashboardId) {

    // dashboardId
    var iframe = document.getElementById('demo-ios');
    var iframedocument = iframe['contentWindow'].document;
    var gridStack = iframedocument.getElementById("openSideMenu");
    iframedocument.getElementById("ADD_DASHBOARD").value = dashboardId;
    gridStack.click();
}

function loadDashboardContent(id) {

    for (var i = 0; i < DASHBOARD_LIST.length; i++) {
        if (id === DASHBOARD_LIST[i].id) {
            loadDashboard(DASHBOARD_LIST[i]);
        }
    }
}

function loadWidgets(obj) {
    if (GRID_STACK) GRID_STACK.removeAll();

    getDomainProperty(CURRENT_DASHBOARD.property, function(status, data) {
        if (status) {
            WIDGETS_LIST = JSON.parse(data.value);
            for (var i = 0; i < WIDGETS_LIST.length; i++) {
                var widget = WIDGETS_LIST[i];


                var imgPath = 'images/menu/widget.png'

                if(widget.widgetimage){
                    imgPath = API_BASE_PATH+`/files/public/download/`+widget.widgetimage
                }
                if(widget.marketplace){
                    if(widget.widgetimage) {
                        imgPath = MARKETPLACE_API_URL + `/files/public/download/` + widget.widgetimage
                    }
                }

                added_widgets_list.push(widget);

                if (!GRID_STACK) GRID_STACK = $('.grid-stack').data('gridstack');
                var id = widget['id'];
                // data-gs-no-resize="false"
                var widgetHtml = '<div><div class="grid-stack-item-content ' + id + '" data-gs-id="' + id + '">' +
                    '<h5 style="color:#666;margin-top: 20px;">' + widget.widgetname + '</h5>' +
                    '<img src="' + imgPath + '" alt="" />' +
                    '<div style="margin-top: 10px;"><a href="javascript:void(0)" onclick="widgetSettings(\'' + id + '\')" style="margin-top: 10px;text-decoration: none;color:#333" class="text-warning">' +
                    '<i class="icon-cog"></i> Settings</a></div>' +
                    '<small style="display: block">' + widget.category + ' v' + widget.version + '</small>' +
                    '<div style="margin-top: 10px;"><a href="javascript:void(0)" onclick="removeWidget(\'' + id + '\')" style="text-decoration: none;color:#333;">' +
                    '<i class="icon-trash4"></i> Remove</a></div>' +
                    '</div></div>';

                // GRID_STACK.movable($(widgetHtml), true);
                // GRID_STACK.resizable($(widgetHtml), true);
                GRID_STACK.addWidget($(widgetHtml), widget.x, widget.y, widget.width, widget.height, true, 1, 100, 1, 100, id);

            }

            if (WIDGETS_LIST.length === 0) {
                $(".info-tutorial").show();
                $("#addWidgetBtn").show();
                $("#editWidgetBtn").show();
                $("#noWidgets").show();
            } else {
                $(".info-tutorial").hide();
                $("#noWidgets").hide();
                $("#dashboardCreateTutorial").hide();
                $(".widgets-count").html('(' + WIDGETS_LIST.length + ')');
            }

        } else {
            $(".info-tutorial").show();
            $("#addWidgetBtn").show();
            $("#editWidgetBtn").show();
            $("#noWidgets").show();

            errorMsg('No widgets added');
        }
    });

}

function loadWidgetIFrame(obj) {

    console.log(obj)

    var code = obj.snippet;
    var config = obj.config;


    var iframe = document.getElementById('f_' + obj.id);
    iframe.height = '100%'; //$("." + obj.id).height() + 'px'

    var iframedocument = iframe['contentWindow'].document;
    var head = iframedocument.getElementsByTagName("head")[0];



    var meta = document.createElement('meta');
    meta.httpEquiv = "X-UA-Compatible";
    meta.content = "IE=edge";
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.setAttribute('charset', "utf-8");
    head.appendChild(meta);



    var body = $('#f_' + obj.id).contents().find("body");



    var jsResource = code.jsfiles;
    var cssResource = code.cssfiles;

    var htmlStr = '';

    var inbuildcss = code.inbuildcss;
    var inbuildjs = code.inbuildjs;

    inbuildcss = inbuildcss === 'true' ? true : false;
    inbuildjs = inbuildjs === 'true' ? true : false;

    var w_device_id = config.device.deviceid ? config.device.deviceid : '',
        w_message_id = config.message.messageid ? config.message.messageid : '',
        w_asset_id = config.asset.assetid ? config.asset.assetid : '';

    var resultData =
        "var API_BASE_PATH='" + API_BASE_PATH + "';\n" +
        "var DOMAIN_KEY='" + USER_OBJ.domainKey + "';\n" +
        "var API_KEY='" + USER_OBJ.apiKey + "';\n" +
        "var API_TOKEN='" + USER_OBJ.token + "';\n" +
        "var DEVICE_ID='" + (w_device_id) + "';\n" +
        "var MESSAGE_ID='" + (w_message_id) + "';\n" +
        "var ASSET_ID='" + (w_asset_id) + "';\n";


    var cssCode = code.css;
    var htmlCode = code.html;
    var jsCode = code.js;

    body.html('<style>body{overflow: hidden;padding:3px;}' + cssCode + '</style><div>' + htmlCode + '</div>');

    var mqtt_file = 'js/boodskap.ws.js';
    var mqtt_adapter = 'resources/js/bdskp-live-adapter.js';

    jsResource.push(mqtt_file);
    jsResource.push(mqtt_adapter);



    async.mapSeries(code.defaultcss, function(file, callback) {

        // console.log('Enter FILE =>',file)

        if (inbuildcss) {
            var cssFile = iframedocument.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.setAttribute('href', CDN_PATH + '/css/' + file);
            head.appendChild(cssFile);

            if (cssFile.readyState) { //IE
                cssFile.onreadystatechange = function() {
                    if (s.readyState == "loaded" ||
                        s.readyState == "complete") {
                        s.onreadystatechange = null;
                        callback(null, null);
                    } else {
                        callback(null, null);
                    }
                    callback(null, null);
                };
            } else { //Others
                cssFile.onload = function() {
                    // console.log('FILE =>',file)
                    callback(null, null);
                };
            }
        } else {
            callback(null, null);
        }


    }, function(err, result) {

        async.mapSeries(cssResource, function(file, callback1) {
            // console.log('Enter FILE =>',file)
            if ($.trim(file)) {
                var cssFile = iframedocument.createElement('link');
                cssFile.setAttribute('type', 'text/css');
                cssFile.setAttribute('rel', 'stylesheet');
                cssFile.setAttribute('href', file);
                head.appendChild(cssFile);
                if (cssFile.readyState) { //IE
                    cssFile.onreadystatechange = function() {
                        if (s.readyState == "loaded" ||
                            s.readyState == "complete") {
                            s.onreadystatechange = null;
                            callback1(null, null);
                        } else {
                            callback1(null, null);
                        }
                    };
                } else { //Others
                    cssFile.onload = function() {

                        callback1(null, null);
                    };
                }
            } else {
                callback1(null, null);
            }

        }, function(err, result) {


            async.mapSeries(code.defaultjs, function(file, callback2) {
                // console.log('Enter FILE =>',file)

                if (inbuildjs) {
                    var jsFile = iframedocument.createElement('script');
                    jsFile.setAttribute('type', 'text/javascript');
                    jsFile.setAttribute('src', CDN_PATH + '/js/' + file);
                    head.appendChild(jsFile);


                    if (jsFile.readyState) { //IE

                        jsFile.onreadystatechange = function() {
                            if (s.readyState == "loaded" ||
                                s.readyState == "complete") {
                                s.onreadystatechange = null;
                                callback2(null, null);
                            } else {
                                callback2(null, null);
                            }
                        };
                    } else { //Others
                        jsFile.onload = function() {
                            // console.log('FILE =>',file)
                            callback2(null, null);
                        };
                    }
                } else {
                    callback2(null, null);
                }
            }, function(err, result) {

                async.mapSeries(jsResource, function(file, callback3) {
                    // console.log('Enter FILE =>',file)
                    if (file) {
                        var jsFile = iframedocument.createElement('script');
                        jsFile.setAttribute('type', 'text/javascript');
                        jsFile.setAttribute('src', file);
                        head.appendChild(jsFile);

                        if (jsFile.readyState) { //IE
                            jsFile.onreadystatechange = function() {
                                if (s.readyState == "loaded" ||
                                    s.readyState == "complete") {
                                    s.onreadystatechange = null;
                                    callback3(null, null);
                                } else {
                                    callback3(null, null);
                                }
                            };
                        } else { //Others
                            jsFile.onload = function() {
                                callback3(null, null);
                            };
                        }

                    } else {
                        callback3(null, null);
                    }
                }, function(err, result) {
                    body.append('<script>' + resultData + '</script><script>' + jsCode + '</script>');


                });

            });

        });
    });

}

function loadDashboard(obj) {

    $(".info-tutorial").hide();
    $("#dashboardCreateTutorial").hide();
    $("#addWidgetBtn").show();
    $("#editWidgetBtn").show();
    $("#noDashboards").hide();
    $("#noWidgets").hide();

    $(".dashboardLi").removeClass('active');
    $(".dashboard_" + obj.id).addClass('active');
    $(".dashboardContent").css('background-color', obj.bgcolor ? obj.bgcolor : DEFAULT_DASHBOARD_BG)

    CURRENT_DASHBOARD = obj;

    CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;

    $(".dashboardName").html(CURRENT_DASHBOARD.name ? CURRENT_DASHBOARD.name : "Widgets");
    $(".dashboardIcon").html('<i class="' + CURRENT_DASHBOARD.icon + '"></i>');
    loadWidgets(obj);
}

function triggerAddWidget() {
    var iframe = document.getElementById('demo-ios');
    var iframedocument = iframe['contentWindow'].document;
    var gridStack = iframedocument.getElementById("sampleClick");
    gridStack.click();
}

function widgetSettings(id) {
    current_widget_id = id;
    current_widget_obj = {};

    for (var i = 0; i < added_widgets_list.length; i++) {
        if (id === added_widgets_list[i]['id']) {
            current_widget_obj = Object.assign({}, added_widgets_list[i]);

        }
    }

    if (typeof current_widget_obj.config === 'string') {
        current_widget_obj.config = JSON.parse(current_widget_obj.config);
    }

    if (current_widget_obj.snippet && current_widget_obj.snippet.code) {
        current_widget_obj.snippet = current_widget_obj.snippet;
    } else {
        current_widget_obj.snippet = {
            html: '',
            js: '',
            css: '',
            code: '',
            defaultjs: jsLink,
            defaultcss: cssLink,
            jsfiles: [],
            cssfiles: [],
            inbuildcss: true,
            inbuildjs: true
        };
    }

    $('#widgetTitle').val(current_widget_obj.widgetTitle ? current_widget_obj.widgetTitle : '')
    openEditorModal();
}

function openEditorModal() {
    $(".idBox").hide();
    $(".messageFields").html('');
    $(".recordFields").html('');
    $(".widgetTitle").html('Untitled Widget')
    $("#editorModal .modal-content").css('width', $(window).width());
    $("#editorModal").modal({
        backdrop: 'static',
        keyboard: false
    });

    $("#livePanel").css('height', (editorHeight + 35) + 'px');
    $("#livePanel").html('<h4 class="mob-preparing"><i class="fa fa-spinner fa-spin"></i> Preparing...</h4>');

    var config = current_widget_obj.config;
    if (config.asset && config.asset.flag) {
        loadAssetList();
        $(".assetBox").show();
    }
    if (config.device && config.device.flag) {
        loadDeviceList();
        $(".deviceBox").show();
    }
    if (config.message && config.message.flag) {
        loadMessageList();
        $(".messageBox").show();
    }

    if (config.record && config.record.flag) {
        loadRecordList();
        $(".recordBox").show();
    }

    var code = Object.assign({}, current_widget_obj.snippet);


    loadHtmlEditor(code.html);
    loadJsEditor(code.js);
    loadCssEditor(code.css);

    try {
        $('#widget_bg').colorpicker('destroy');
        $('#widget_text').colorpicker('destroy');
    } catch (e) {}

    $('#widget_bg').colorpicker({
        color: current_widget_obj.widgetBgColor ? current_widget_obj.widgetBgColor : DEFAULT_THEME.panelHeaderBg,
        format: 'hex'
    });
    $('#widget_text').colorpicker({
        color: current_widget_obj.widgetTextColor ? current_widget_obj.widgetTextColor : "#fff",
        format: 'hex'
    });

    if (current_widget_obj.widgetTitle) {
        $(".widgetLiveTitle").html(current_widget_obj.widgetTitle)
    }

    $("#jsResource").val(code.jsfiles.join("\n"))
    $("#cssResource").val(code.cssfiles.join("\n"))


    $(".defaultJs").html(code.defaultjs.join("\n"))
    $(".defaultCss").html(code.defaultcss.join("\n"))

    $('input:radio[name="inbuildcss"][value="' + code.inbuildcss + '"]').prop('checked', true);
    $('input:radio[name="inbuildjs"][value="' + code.inbuildjs + '"]').prop('checked', true);

    setTimeout(function() {
        codeLivePreview();
    }, 2000);
}

function loadAssetList() {
    $("#assetList").html("");
    getAssetList(1000, function(status, data) {
        if (status && data.length > 0) {
            asset_list = data;
            $("#assetList").html('<option value=""></option>');
            for (var i = 0; i < asset_list.length; i++) {
                $("#assetList").append('<option value="' + asset_list[i].id + '">' + asset_list[i].id + ' | ' + asset_list[i].name + '</option>');
            }

            $("#assetList").select2({
                dropdownParent: $("#editorModal")
            });

            $("#assetList").val(current_widget_obj.config.asset.assetid ? current_widget_obj.config.asset.assetid : '').trigger('change');

        } else {
            asset_list = [];
        }
    })
}

function loadMessageList() {
    $("#messageList").html("");
    listMessageSpec(1000, null, null, function(status, data) {
        if (status && data.length > 0) {
            message_list = data;
            $("#messageList").html('<option value=""></option>');
            for (var i = 0; i < message_list.length; i++) {
                $("#messageList").append('<option value="' + message_list[i].id + '">' + message_list[i].id + ' | ' + message_list[i].name + '</option>');
            }

            $("#messageList").select2({
                dropdownParent: $("#editorModal")
            });

            $("#messageList").val(current_widget_obj.config.message.messageid ? current_widget_obj.config.message.messageid : '').trigger('change');
            loadMsgFields();
        } else {
            message_list = [];
        }

    })
}



function loadRecordList() {
    $("#recordList").html("");
    listRecordSpec(1000, '', '', function(status, data) {
        if (status && data.length > 0) {
            record_list = data;
            $("#recordList").html('<option value=""></option>');
            for (var i = 0; i < record_list.length; i++) {
                $("#recordList").append('<option value="' + record_list[i].id + '">' + record_list[i].id + ' | ' + record_list[i].name + '</option>');
            }

            $("#recordList").select2({
                dropdownParent: $("#editorModal")
            });

            $("#recordList").val(current_widget_obj.config.record.recordid ? current_widget_obj.config.record.recordid : '').trigger('change');


        } else {
            record_list = [];
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

    searchDevice(searchQuery, function(status, res) {
        if (status) {

            var resultData = searchQueryFormatterNew(res).data;
            device_list = resultData['data'];

            for (var i = 0; i < device_list.length; i++) {
                $(".deviceListUl").append('<li class="deviceListLi" onclick="setDeviceId(\'' + device_list[i].id + '\')">' +
                    (device_list[i].name ? device_list[i].name : device_list[i].id) + ' | ' + device_list[i].modelId + ' | <b>' +
                    device_list[i].version +
                    '</b></li>');
            }
            if (!searchText) {
                $("#deviceID").val(current_widget_obj.config.device.deviceid ? current_widget_obj.config.device.deviceid : '');
            }

        } else {
            device_list = []
        }


    })


}

function setDeviceId(id) {
    $("#deviceID").val(id)
}

function loadHtmlEditor(code) {

    if (htmlEditor) {
        htmlEditor.destroy();
    }

    $("#htmlEditor").html("");

    htmlEditor = ace.edit("htmlEditor");
    htmlEditor.setTheme("ace/theme/monokai");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.getSession().setUseWrapMode(true);
    htmlEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    htmlEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });

    langTools.setCompleters([langTools.snippetCompleter])

    htmlEditor.setValue(code);
    htmlEditor.clearSelection();
    htmlEditor.focus();
    var session = htmlEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    htmlEditor.gotoLine(count, session.getLine(count - 1).length);


    $('#htmlEditor').height(editorHeight + 'px');

    htmlEditor.resize();

    htmlEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function(env, args, request) {

            // console.log(htmlEditor.getSession().getValue())

            var consoleText = htmlEditor.getSession().getValue();
            codeLivePreview();


        }
    });
}

function loadJsEditor(code) {

    if (jsEditor) {
        jsEditor.destroy();
    }

    $("#jsEditor").html("");

    jsEditor = ace.edit("jsEditor");
    jsEditor.setTheme("ace/theme/monokai");
    jsEditor.session.setMode("ace/mode/javascript");
    jsEditor.getSession().setUseWrapMode(true);
    jsEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    jsEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });

    langTools.setCompleters([langTools.snippetCompleter])

    if (code === '') {
        code =
            '/********************************************\n' +
            ' Pre Defined variables to access in the widget \n' +
            '********************************************/\n\n' +
            '// API_BASE_PATH - to get boodskap api base path\n' +
            '// DOMAIN_KEY - to get domain key\n' +
            '// API_KEY - to get api key\n' +
            '// API_TOKEN - to get api token\n' +
            '// MESSAGE_ID - to get message id\n' +
            '// DEVICE_ID - to get device id\n' +
            '// ASSET_ID - to get asset id\n' +
            '// RECORD_ID - to get record id\n' +
            '// WIDGET_ID - to get widget id\n' +
            '// USER_ID - to get user id (In public share this will be empty)\n\n' +
            '$(document).ready(function () {\n\n});'
    }

    jsEditor.setValue(code);
    jsEditor.clearSelection();
    jsEditor.focus();
    var session = jsEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    jsEditor.gotoLine(count, session.getLine(count - 1).length);


    $('#jsEditor').height(editorHeight + 'px');

    jsEditor.resize();

    jsEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function(env, args, request) {

            // console.log(jsEditor.getSession().getValue())

            var consoleText = jsEditor.getSession().getValue();

            codeLivePreview();

        }
    });
}

function loadCssEditor(code) {

    if (cssEditor) {
        cssEditor.destroy();
    }

    $("#cssEditor").html("");

    cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");
    cssEditor.getSession().setUseWrapMode(true);
    cssEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    cssEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });

    langTools.setCompleters([langTools.snippetCompleter])

    cssEditor.setValue(code);
    cssEditor.clearSelection();
    cssEditor.focus();
    var session = cssEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    cssEditor.gotoLine(count, session.getLine(count - 1).length);


    $('#cssEditor').height(editorHeight + 'px');

    cssEditor.resize();

    cssEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function(env, args, request) {

            // console.log(cssEditor.getSession().getValue())

            var consoleText = cssEditor.getSession().getValue();

            codeLivePreview();

        }
    });
}

function codeLivePreview() {


    $(".widgetLiveTitle").html($("#widgetTitle").val() ? $("#widgetTitle").val() : 'Untitled Widget');

    $(".widgetLiveHeader").css('background-color', $("#widget_bg").colorpicker('getValue'));
    $(".widgetLiveTitle").css('color', $("#widget_text").colorpicker('getValue'));
    // $("#widget_bg").colorpicker('getValue');
    // $("#widget_text").colorpicker('getValue');

    $("#livePanel").html('<iframe id="previewCode"></iframe>');


    // $("#livePanel").html('<iframe id="previewCode" style="width: 100%;height: ' + (editorHeight+25) + 'px;border:0px;"></iframe>');

    var iframe = document.getElementById('previewCode');
    var iframedocument = iframe['contentWindow'].document;
    var head = iframedocument.getElementsByTagName("head")[0];

    var meta = document.createElement('meta');
    meta.httpEquiv = "X-UA-Compatible";
    meta.content = "IE=edge";
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.setAttribute('charset', "utf-8");
    head.appendChild(meta);


    var body = $("#previewCode").contents().find("body");

    var jsResource = $("#jsResource").val().split('\n');
    var cssResource = $("#cssResource").val().split('\n');

    var htmlStr = '';

    var inbuildcss = $("input[name='inbuildcss']:checked").val();
    var inbuildjs = $("input[name='inbuildjs']:checked").val();

    inbuildcss = inbuildcss === 'true' ? true : false;
    inbuildjs = inbuildjs === 'true' ? true : false;

    // console.log("inbuildcss =>", inbuildcss)
    // console.log("inbuildjs =>", inbuildjs)

    if (inbuildcss || inbuildjs) {
        $(".inbuildContent").css('display', 'block');
    } else {
        $(".inbuildContent").css('display', 'none');
    }

    var resultData =
        "var API_BASE_PATH='" + API_BASE_PATH + "';\n" +
        "var DOMAIN_KEY='" + USER_OBJ.domainKey + "';\n" +
        "var API_KEY='" + USER_OBJ.apiKey + "';\n" +
        "var API_TOKEN='" + USER_OBJ.token + "';\n" +
        "var USER_ID='" + USER_OBJ.user.email + "';\n" +
        "var DEVICE_ID='" + ($("#deviceID").val() ? $("#deviceID").val() : '') + "';\n" +
        "var RECORD_ID='" + ($("#recordList").val() ? $("#recordList").val() : '') + "';\n" +
        "var MESSAGE_ID='" + ($("#messageList").val() ? $("#messageList").val() : '') + "';\n" +
        "var ASSET_ID='" + ($("#assetList").val() ? $("#assetList").val() : '') + "';\n" +
        "var MQTT_CLIENT_ID='" + MQTT_CLIENT_ID + "';\n" +
        "var WIDGET_ID='" + current_widget_obj.id + "';\n" +
        "var MQTT_CONFIG='" + JSON.stringify(MQTT_CONFIG) + "';\n";


    var code = current_widget_obj.snippet;


    var cssCode = cssEditor.getSession().getValue();
    var htmlCode = htmlEditor.getSession().getValue();
    var jsCode = jsEditor.getSession().getValue();

    body.html('<style>' + cssCode + '</style><div style="padding: 10px;' +
        '        text-align: center;' +
        '        background: orange;' +
        '        color: #fff;' +
        '        font-weight: 800;' +
        '        box-shadow: 0.5px 0.5px 4px #aaaaaa;">' +
        '<span style="float: left;"><i class="fa fa-chevron-left" style="font-size: 18px;cursor: pointer;"></i></span> ' +
        '<span>' + CURRENT_DASHBOARD.name + '</span>' +
        '<span style="float: right;"><i class="fa fa-refresh" style="font-size: 18px;cursor: pointer;"></i></span></div>' +
        '<div>' + htmlCode + '</div><script>' + resultData + '</script>');

    var mqtt_file = 'js/boodskap.ws.js';
    var mqtt_adapter = 'resources/js/bdskp-live-adapter.js';

    jsResource.push(mqtt_file);
    jsResource.push(mqtt_adapter);

    async.mapSeries(code.defaultcss, function(file, callback) {

        // console.log('Enter FILE =>',file)

        if (inbuildcss) {
            var cssFile = iframedocument.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.setAttribute('href', CDN_PATH + '/css/' + file);
            head.appendChild(cssFile);

            if (cssFile.readyState) { //IE
                cssFile.onreadystatechange = function() {
                    if (s.readyState == "loaded" ||
                        s.readyState == "complete") {
                        s.onreadystatechange = null;
                        callback(null, null);
                    } else {
                        callback(null, null);
                    }
                };
            } else { //Others
                cssFile.onload = function() {
                    // console.log('FILE =>',file)
                    callback(null, null);
                };
            }
        } else {
            callback(null, null);
        }


    }, function(err, result) {

        async.mapSeries(cssResource, function(file, callback1) {
            // console.log('Enter FILE =>',file)
            if ($.trim(file)) {
                var cssFile = iframedocument.createElement('link');
                cssFile.setAttribute('type', 'text/css');
                cssFile.setAttribute('rel', 'stylesheet');
                cssFile.setAttribute('href', file);
                head.appendChild(cssFile);
                if (cssFile.readyState) { //IE
                    cssFile.onreadystatechange = function() {
                        if (s.readyState == "loaded" ||
                            s.readyState == "complete") {
                            s.onreadystatechange = null;
                            callback1(null, null);
                        } else {
                            callback1(null, null);
                        }
                    };
                } else { //Others
                    cssFile.onload = function() {

                        callback1(null, null);
                    };
                }
            } else {
                callback1(null, null);
            }

        }, function(err, result) {

            async.mapSeries(code.defaultjs, function(file, callback2) {
                // console.log('Enter FILE =>',file)

                if (inbuildjs) {
                    var jsFile = iframedocument.createElement('script');
                    jsFile.setAttribute('type', 'text/javascript');
                    jsFile.setAttribute('src', CDN_PATH + '/js/' + file);
                    head.appendChild(jsFile);

                    if (jsFile.readyState) { //IE
                        jsFile.onreadystatechange = function() {
                            if (s.readyState == "loaded" ||
                                s.readyState == "complete") {
                                s.onreadystatechange = null;
                                callback2(null, null);
                            } else {
                                callback2(null, null);
                            }
                        };
                    } else { //Others
                        jsFile.onload = function() {
                            // console.log('FILE =>',file)
                            callback2(null, null);
                        };
                    }
                } else {
                    callback2(null, null);
                }
            }, function(err, result) {


                async.mapSeries(jsResource, function(file, callback3) {
                    // console.log('Enter FILE =>',file)
                    if (file) {
                        var jsFile = iframedocument.createElement('script');
                        jsFile.setAttribute('type', 'text/javascript');
                        jsFile.setAttribute('src', file);
                        head.appendChild(jsFile);

                        if (jsFile.readyState) { //IE
                            jsFile.onreadystatechange = function() {
                                if (s.readyState == "loaded" ||
                                    s.readyState == "complete") {
                                    s.onreadystatechange = null;
                                    callback3();
                                } else {
                                    callback3();
                                }
                            };
                        } else { //Others
                            jsFile.onload = function() {
                                callback3();
                            };
                        }

                    } else {
                        callback3(null, null);
                    }
                }, function(err, result) {


                    body.append('<script>' + resultData + '</script><script>' + jsCode + '</script>');

                    // saveCode();

                });

            });

        });
    });


}

function deleteImportedWidget() {
    deleteImportWidget(delete_widget_id, function(status, data) {
        if (status) {
            loadImportedWidgets();
            $("#deleteWidgetModal").modal('hide');
            successMsg('Widgets successfully removed from the domain')
        } else {
            errorMsg('Error in widget removal')
        }
    })
}

/*function saveCode() {
    var iframe = document.getElementById('previewCode');
    var finalHtml = $(iframe).contents().find("html").html();

    var cssCode = cssEditor.getSession().getValue();
    var htmlCode = htmlEditor.getSession().getValue();
    var jsCode = jsEditor.getSession().getValue();

    var config = Object.assign({}, current_widget_obj.config);
    var tempObj = Object.assign({}, current_widget_obj);



    var snippet = {
        html: htmlCode,
        js: jsCode,
        css: cssCode,
        code: finalHtml,
        defaultjs: jsLink,
        defaultcss: cssLink,
        jsfiles: $("#jsResource").val().split('\n'),
        cssfiles: $("#cssResource").val().split('\n'),
        inbuildcss: $("input[name='inbuildcss']:checked").val(),
        inbuildjs: $("input[name='inbuildjs']:checked").val()
    };




    /!*if ($.trim($('#widgetTitle').val()) === '') {
        errorMsg('Please enter the widget title')
        return false;
    }*!/
    if (config.asset && config.asset.flag) {
        config.asset['assetid'] = $("#assetList").val();
        if ($("#assetList").val() === '') {
            errorMsg('Please choose Asset ID')
            return false;
        }
    }
    if (config.device && config.device.flag) {
        config.device['deviceid'] = $("#deviceID").val();
        if ($("#deviecID").val() === '') {
            errorMsg('Please choose Device ID')
            return false;
        }
    }
    if (config.message && config.message.flag) {
        config.message['messageid'] = $("#messageList").val();
        if ($("#messageList").val() === '') {
            errorMsg('Please choose Message ID')
            return false;
        }
    }
    if (config.record && config.record.flag) {
        config.record['recordid'] = $("#recordList").val();
        if ($("#recordList").val() === '') {
            errorMsg('Please choose Record ID')
            return false;
        }
    }

    tempObj['snippet'] = snippet;
    tempObj['config'] = config;

    tempObj['widgetTitle'] = $.trim($('#widgetTitle').val());

    current_widget_obj = tempObj;


    saveDashboard();
    $("#editorModal").modal('hide');
}*/


function saveCode() {
    var iframe = document.getElementById('previewCode');
    var finalHtml = $(iframe).contents().find("html").html();

    var cssCode = cssEditor.getSession().getValue();
    var htmlCode = htmlEditor.getSession().getValue();
    var jsCode = jsEditor.getSession().getValue();

    var config = Object.assign({}, current_widget_obj.config);
    var tempObj = Object.assign({}, current_widget_obj);


    var code = current_widget_obj.snippet;

    var snippet = {
        html: htmlCode,
        js: jsCode,
        css: cssCode,
        code: finalHtml,
        defaultjs: code.defaultjs,
        defaultcss: code.defaultcss,
        jsfiles: $("#jsResource").val().split('\n'),
        cssfiles: $("#cssResource").val().split('\n'),
        inbuildcss: $("input[name='inbuildcss']:checked").val(),
        inbuildjs: $("input[name='inbuildjs']:checked").val()
    };




    /*if ($.trim($('#widgetTitle').val()) === '') {
        errorMsg('Please enter the widget title')
        return false;
    }*/
    if (config.asset && config.asset.flag) {
        config.asset['assetid'] = $("#assetList").val();
        if ($("#assetList").val() === '') {
            errorMsg('Please choose Asset ID')
            return false;
        }
    }
    if (config.device && config.device.flag) {
        config.device['deviceid'] = $("#deviceID").val();
        if ($("#deviecID").val() === '') {
            errorMsg('Please choose Device ID')
            return false;
        }
    }
    if (config.message && config.message.flag) {
        config.message['messageid'] = $("#messageList").val();
        if ($("#messageList").val() === '') {
            errorMsg('Please choose Message ID')
            return false;
        }
    }
    if (config.record && config.record.flag) {
        config.record['recordid'] = $("#recordList").val();
        if ($("#recordList").val() === '') {
            errorMsg('Please choose Record ID')
            return false;
        }
    }

    tempObj['snippet'] = snippet;
    tempObj['config'] = config;

    tempObj['widgetTitle'] = $.trim($('#widgetTitle').val());
    tempObj['widgetBgColor'] = $("#widget_bg").colorpicker('getValue');
    tempObj['widgetTextColor'] = $("#widget_text").colorpicker('getValue');

    current_widget_obj = tempObj;


    saveDashboard();
    $("#editorModal").modal('hide');
}

function addWidget(id) {
    var snippetCode = {};

    async.filter(imported_widget_list, function(data, cbk) {
        if (id === data['_id']) {
            getDomainGlobalProperty(data.code, data.domainKey, function(status, result) {
                if (status) {

                    var resultData = JSON.parse(result.data);
                    snippetCode = resultData;
                    cbk(null)
                } else {
                    cbk(null)
                }

            })
        } else {
            cbk(null)
        }
    }, function(resultData) {
        addWidgetToDashboard(id, snippetCode);
    })

}


function addWidgetToDashboard(id, code) {

    // WIDGETS_LIST.push
    var obj = {};


    for (var i = 0; i < imported_widget_list.length; i++) {
        if (id === imported_widget_list[i]['_id']) {
            obj = Object.assign({}, imported_widget_list[i]);

        }
    }

    var objId = 'w_' + new Date().getTime();
    obj.id = objId;
    obj.snippet = code;

    added_widgets_list.push(obj);

    var imgPath = 'images/menu/widget.png'

    if(obj.widgetimage){
        imgPath = API_BASE_PATH+`/files/public/download/`+obj.widgetimage
    }
    if(obj.marketplace){
        if(obj.widgetimage) {
            imgPath = MARKETPLACE_API_URL + `/files/public/download/` + obj.widgetimage
        }
    }

    if (!GRID_STACK) GRID_STACK = $('.grid-stack').data('gridstack');
    var widgetHtml = '<div><div class="grid-stack-item-content ' + objId + '" data-gs-id="' + objId + '">' +
        '<h5 style="color:#666;margin-top: 20px;">' + obj.widgetname + '</h5>' +
        '<img src="' + imgPath + '" alt="" />' +
        '<a href="javascript:void(0)" onclick="widgetSettings(\'' + objId + '\')" style="display: block;margin-top: 10px;text-decoration: none;color:#333" class="text-warning">' +
        '<i class="icon-cog"></i> Configure Widget</a>' +
        '<a href="javascript:void(0)" onclick="removeWidget(\'' + objId + '\')" style="display: block;margin-top: 10px;text-decoration: none;color:#333">' +
        '<i class="icon-trash4"></i> Remove Widget</a>' +
        '</div></div>';

    GRID_STACK.addWidget($(widgetHtml), 0, 0, "100%", 2, true, 1, 100, 1, 100, objId);
    afterWidgetAdded();

}

function afterWidgetAdded() {

    $(".info-tutorial").hide();
    $("#addWidgetModal").modal('hide');
    saveDashboard();
}

function afterWidgetRemoved() {


    if (GRID_STACK.grid.nodes.length === 0) {
        $(".info-tutorial").show();
        $("#addWidgetBtn").show();
        $("#editWidgetBtn").show();
        $("#noWidgets").show();
    }
    saveDashboard();
}

function removeWidget(id) {

    var el = null;

    for (var i = 0; i < GRID_STACK.grid.nodes.length; i++) {
        if (id === GRID_STACK.grid.nodes[i].id) {
            el = GRID_STACK.grid.nodes[i].el;
        }
    }

    GRID_STACK.removeWidget(el, id);

    afterWidgetRemoved();
}

function previewDashboard() {
    window.open('/dashboard/' + CURRENT_DASHBOARD_ID + '/preview', "window", "height=" + $(window).height() + ", width=" + $(window).width() + ",directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no");
}


function saveDashboard() {

    console.log("current_widget_obj =>", current_widget_obj)

    WIDGETS_LIST = [];

    var nodesList = GRID_STACK.grid.nodes;

    for (var i = 0; i < nodesList.length; i++) {
        var node = nodesList[i];
        var obj = {};

        for (var j = 0; j < added_widgets_list.length; j++) {
            if (node.id === added_widgets_list[j]['id']) {
                obj = added_widgets_list[j];
            }
        }

        obj['x'] = node.x;
        obj['y'] = node.y;
        obj['width'] = node.width;
        obj['height'] = node.height;
        obj['config'] = typeof obj.config === 'string' ? JSON.parse(obj.config) : obj.config

        if (current_widget_obj && current_widget_obj.id === obj.id) {
            current_widget_obj['x'] = node.x;
            current_widget_obj['y'] = node.y;
            current_widget_obj['width'] = node.width;
            current_widget_obj['height'] = node.height;
            WIDGETS_LIST.push(current_widget_obj);
        } else {
            WIDGETS_LIST.push(obj)
        }


    }

    var data = {
        name: CURRENT_DASHBOARD.property,
        value: JSON.stringify(WIDGETS_LIST)
    };
    added_widgets_list = WIDGETS_LIST;

    upsertDomainProperty(data, function(status, data) {
        if (status) {
            successMsg('Successfully Saved');

            loadWidgets(CURRENT_DASHBOARD.property);

        } else {
            errorMsg('Error')
        }
    })

}

/*function saveDashboard() {

    WIDGETS_LIST = [];

    var nodesList = GRID_STACK.grid.nodes;

    for (var i = 0; i < nodesList.length; i++) {
        var node = nodesList[i];
        var obj = {};

        for (var j = 0; j < added_widgets_list.length; j++) {
            if (node.id === added_widgets_list[j]['id']) {
                obj = added_widgets_list[j];
            }
        }

        obj['x'] = node.x;
        obj['y'] = node.y;
        obj['width'] = node.width;
        obj['height'] = node.height;
        obj['config'] = typeof obj.config === 'string' ? JSON.parse(obj.config) : obj.config

        if (current_widget_obj && current_widget_obj.id === obj.id) {
            WIDGETS_LIST.push(current_widget_obj);
            current_widget_obj = {};
        } else {
            WIDGETS_LIST.push(obj)
        }


    }

    var data = {
        name: CURRENT_DASHBOARD.property,
        value: JSON.stringify(WIDGETS_LIST)
    };

    upsertDomainProperty(data, function (status, data) {
        if (status) {
            successMsg('Dashboard Widgets Saved successfully');
            loadWidgets(CURRENT_DASHBOARD)

        } else {
            errorMsg('Error in saving dashboard')
        }
    })

}*/

function addIconList() {
    $(".iconList").html('');
    for (var i = 0; i < ICONS.length; i++) {
        $(".iconList").append('<a class="custom-dropdown-item" style="" onclick="setIconClass(\'' + ICONS[i] + '\')"><i class="' + ICONS[i] + '"></i></a>')
    }
}

function setIconClass(icon) {
    clicked_dashboard_icon = icon;
    $("#dashboard_icon").html('<i class="' + icon + '"></i>');
}

function editDashboardModal() {
    openDashboardModal(2, CURRENT_DASHBOARD_ID)
}

function openDashboardModal(type, id) {


    $(".imageHtml").html('');
    imageID = null;

    if (type === 1) {
        $(".dashboardAction").html('Create');
        $("#addDashboard form")[0].reset();
        /*$("#dashboard_bg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
        });
        $("#dashboard_bg").spectrum("set", DEFAULT_DASHBOARD_BG);*/

        try {
            $('#dashboard_bg').colorpicker('destroy');
        } catch (e) {}

        $('#dashboard_bg').colorpicker({
            color: DEFAULT_DASHBOARD_BG,
            format: 'hex'
        });


        clicked_dashboard_icon = 'icon-dashboard';
        $("#dashboard_icon").html('<i class="icon-dashboard"></i>');
        $("#addDashboard form").attr('onsubmit', 'addDashboard()');
        $("#addDashboard").modal('show');
    } else if (type === 2) {

        $(".dashboardAction").html('Update');

        var obj = {};
        for (var i = 0; i < DASHBOARD_LIST.length; i++) {
            if (id === DASHBOARD_LIST[i].id) {
                obj = DASHBOARD_LIST[i];
            }
        }

        if (obj.isimage) {
            setImageId(obj.imgpath);
        }

        /*$("#dashboard_bg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true
        });
        $("#dashboard_bg").spectrum("set",  obj.bgcolor ? obj.bgcolor : DEFAULT_DASHBOARD_BG);*/

        try {
            $('#dashboard_bg').colorpicker('destroy');
        } catch (e) {}

        $('#dashboard_bg').colorpicker({
            color: obj.bgcolor ? obj.bgcolor : DEFAULT_DASHBOARD_BG,
            format: 'hex'
        });


        $("#dashboard_name").val(obj.name);
        clicked_dashboard_icon = obj.icon;
        $("#dashboard_icon").html('<i class="' + obj.icon + '"></i>');

        $("#addDashboard form").attr('onsubmit', 'updateDashboard()');
        $("#addDashboard").modal('show');

    } else if (parseInt(type) === 3) {

        var obj = {};
        for (var i = 0; i < DASHBOARD_LIST.length; i++) {
            if (id === DASHBOARD_LIST[i].id) {
                obj = DASHBOARD_LIST[i];
            }
        }

        CURRENT_DASHBOARD_ID = id;
        $(".dashboardDeleteName").html(obj.name)
        $("#deleteModal").modal('show');

    }
}

function addDashboard() {
    var obj = {
        name: $("#dashboard_name").val(),
        id: 'dashboard' + new Date().getTime(),
        property: 'mobile.dashboard.' + new Date().getTime(),
        icon: clicked_dashboard_icon,
        isimage: true,
        imgpath: imageID,
        // bgcolor: $("#dashboard_bg").spectrum("get").toHexString()
        bgcolor: $("#dashboard_bg").colorpicker('getValue')
    };

    DASHBOARD_LIST.push(obj);

    var data = {
        name: MOBILE_DASHBOARD_LIST_PROPERTY,
        value: JSON.stringify(DASHBOARD_LIST)
    };

    upsertDomainProperty(data, function(status, data) {
        if (status) {
            successMsg('Dashboard added successfully');

            /*          var dboardListHtml = '<div id="accordion_'+obj.id+'">' +
'                                           <div class="card">' +
'                                                 <div class="card-header" id="headingOne" style="padding: 0;">' +
'                                                            <h5 class="mb-0">' +
'                                                                <button class="btn btn-link" data-toggle="collapse" data-target="#collapseOne_'+obj.id+'" aria-expanded="true" aria-controls="collapseOne_'+obj.id+'"><i class="' + obj.icon + '"></i> '+obj.name+'</button>' +
'                                                                   <a class="pull-right" style="padding: 7px 10px;" href="javascript:void(0)" onclick="deleteDashboard(\''+obj.id+'\')"><i class="fa fa-trash-o"></i> Delete</a>' +
'                                                            </h5>' +
'                                                        </div>' +
'                                                        <div id="collapseOne_'+obj.id+'" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion_'+obj.id+'">' +
'                                                                <div style="display: inline-block;vertical-align: top;" id="loadWidgets_'+obj.id+'"></div>' +
'                                                                <div class="widget-style" style="border: 1px dashed #999;background: #f6f6f6;">' +
'                                                                    <img src="/images/widgets/widget.png" style="height:26px;margin-top:15px;"><br>' +
'                                                                    <span style="font-size: 11px;">Add Widget</span>' +
'                                                                </div>' +
'                                                         <div class="grid-stack" style=""></div>' +
'                                                  </div>' +
'                                           </div>' +
'                                   </div>';
*/

            var iconStr = '';

            if (obj.isimage) {
                iconStr = '<img src="' + obj.imgpath + '" style="height: 28px;" />';
            } else {

                iconStr = '<i class="' + obj.icon + '"></i> ';
            }

            var dboardListHtml =
                '<li onclick="loadSingleDashboardWidgets(\'' + encodeURIComponent(JSON.stringify(obj)) + '\')">' +
                '<span title="Remove Dashboard" class="d-delete" onclick="openDashboardModal(\'' + 3 + ',' + obj.id + '\')"><i class="icon-trash-o"></i> </span>' +
                '     <p>' + iconStr + '</p>' +
                '    <div class="d-name">' + obj.name + '</div>' +
                '</li>';

            $(".dashboardList").append(dboardListHtml);


            /*$(".dashboardList").append('<li class="dashboardLi dashboard_' + obj.id + '" onclick="loadDashboardContent(\'' + obj.id + '\')">' +
                '<input type="checkbox" > <a href="javascript:void(0)" onclick="loadDashboardContent(\'' + obj.id + '\')">' +
                '<i class="' + obj.icon + '"></i> ' +
                '<span class="">' + obj.name + '</span></a> ' +
                '</li>');*/

            loadDashboardContent(obj.id);
            $("#addDashboard").modal('hide');

            var iframe = document.getElementById('demo-ios');
            var iframedocument = iframe['contentWindow'].document;
            var refreshDashboardClick = iframedocument.getElementById("refreshDashboardClick");
            refreshDashboardClick.click();

        } else {
            errorMsg('Error in adding new dashboard')
        }
    })
}

function updateDashboard() {
    var obj = {};
    for (var i = 0; i < DASHBOARD_LIST.length; i++) {
        if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
            obj = DASHBOARD_LIST[i];
        }
    }


    var tempObj = {
        name: $("#dashboard_name").val(),
        id: obj.id,
        property: obj.property,
        icon: clicked_dashboard_icon,
        isimage: true,
        imgpath: imageID,
        bgcolor: $("#dashboard_bg").colorpicker('getValue')
    }


    for (var i = 0; i < DASHBOARD_LIST.length; i++) {

        if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
            DASHBOARD_LIST[i] = tempObj;
        }
    }


    var data = {
        name: MOBILE_DASHBOARD_LIST_PROPERTY,
        value: JSON.stringify(DASHBOARD_LIST)
    };


    upsertDomainProperty(data, function(status, data) {
        if (status) {
            successMsg('Dashboard updated successfully');

            loadDashboardlist();
            // loadDashboardContent(obj.id);

            $("#addDashboard").modal('hide');

        } else {
            errorMsg('Error in updating dashboard')
        }
    })
}


function openDashboard(obj) {
    var data = JSON.parse(decodeURIComponent(obj));
    loadDashboard(data);
}

function deleteDashboard() {

    var temp_list = [];

    for (var i = 0; i < DASHBOARD_LIST.length; i++) {

        if (CURRENT_DASHBOARD_ID !== DASHBOARD_LIST[i].id) {
            temp_list.push(DASHBOARD_LIST[i]);
        }
    }


    DASHBOARD_LIST = temp_list;

    var data = {
        name: MOBILE_DASHBOARD_LIST_PROPERTY,
        value: JSON.stringify(DASHBOARD_LIST)
    };

    upsertDomainProperty(data, function(status, data) {
        if (status) {
            successMsg('Dashboard deleted successfully');
            loadDashboardlist();
            $("#deleteModal").modal('hide');

        } else {
            errorMsg('Error in deleting new dashboard')
        }
    })
}

function loadImportedWidgets() {

    var searchText = $.trim($("#searchText").val());

    var searchJson = {
        "multi_match": {
            "query": '*' + searchText + '*',
            "type": "phrase_prefix",
            "fields": ['_all']
        }
    };

    var clientDomainKey = {
        match: { clientDomainKey: DOMAIN_KEY }
    };

    var queryParams = {
        "query": {
            "bool": {
                "must": [clientDomainKey]
            }
        },
        "size": 10,
        "sort": [{ "createdtime": { "order": "desc" } }]
    };

    if (searchText !== '') {
        queryParams['query']['bool']['must'] = [clientDomainKey, searchJson]
    }


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    searchByQuery('', 'WIDGET_IMPORTED', searchQuery, function(status, data) {

        $(".importedWidgets").html('')
        if (status) {

            var result = searchQueryFormatterNew(data)['data']['data'];
            $(".importedWidgets").html('');

            imported_widget_list = result;

            if (result.length === 0) {
                $(".importedWidgets").html('<div class="col-lg-12"><p class="text-center"><i class="icon-info-circle" style="font-size: 60px;color: #ccc;"></i></p><p class="text-center">No Widgets Found!</p></div>')
            } else {
                for (var i = 0; i < result.length; i++) {
                    renderImportedWidget(result[i]);
                }
            }



        } else {
            errorMsg('No Widgets Found')
        }
    })
}

/*function loadImportedWidgets() {

    var queryParams = {
        "query": {
            "bool": {
                "must": [{
                    match: {clientDomainKey: DOMAIN_KEY}
                }]
            }
        },
        "size": 10,
        "sort": [{"createdtime": {"order": "desc"}}]
    };


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    searchByQuery('', 'WIDGET_IMPORTED', searchQuery, function (status, data) {

        if (status) {

            var result = searchQueryFormatterNew(data)['data']['data'];
            $(".importedWidgets").html('');

            imported_widget_list = result;

            if(result.length > 0){

                for (var i = 0; i < result.length; i++) {
                    renderImportedWidget(result[i]);
                }
            }else{
                $(".importedWidgets").html('<div style="margin: 0;\n' +
                    '    background: #f6f6f6;\n' +
                    '    padding: 10px;\n' +
                    '    border-radius: 3px;"><p style="text-align: center;"><i class="icon-exclamation-triangle"></i> No Widgets Added</p>' +
                    '                                                                <ul class="widget-steps" style="list-style: none;">\n' +
                    '                                                                    <li>\n' +
                    '                                                                        <div class="step-circle">1</div> <a href="<%= basepath %>/widgets" style="text-decoration: none;">Goto Marketplace</a>\n' +
                    '                                                                    </li>\n' +
                    '                                                                    <li>\n' +
                    '                                                                        <div class="step-circle">2</div> <span>Create (or) Buy widgets</span>\n' +
                    '                                                                    </li>\n' +
                    '                                                                    <li>\n' +
                    '                                                                        <div class="step-circle">3</div> <span>Then Add widgets to dashboard</span>\n' +
                    '                                                                    </li>\n' +
                    '                                                                </ul>\n' +
                    '                                                            </div>' );
            }

        } else {

            $(".importedWidgets").html('<div style="    margin: 0;\n' +
                '    background: #f6f6f6;\n' +
                '    padding: 10px;\n' +
                '    border-radius: 3px;"><p style="text-align: center;"><i class="icon-exclamation-triangle"></i> No Widgets Added</p>' +
                '                                                                <ul class="widget-steps" style="list-style: none;">\n' +
                '                                                                    <li>\n' +
                '                                                                        <div class="step-circle">1</div> <a href="<%= basepath %>/widgets" style="text-decoration: none;">Goto Marketplace</a>\n' +
                '                                                                    </li>\n' +
                '                                                                    <li>\n' +
                '                                                                        <div class="step-circle">2</div> <span>Create (or) Buy widgets</span>\n' +
                '                                                                    </li>\n' +
                '                                                                    <li>\n' +
                '                                                                        <div class="step-circle">3</div> <span>Then Add widgets to dashboard</span>\n' +
                '                                                                    </li>\n' +
                '                                                                </ul>\n' +
                '                                                            </div>' );
            errorMsg('No Widgets Found')
        }
    })
}*/

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


        return resultObj;

    } else {

        return resultObj;
    }

}

function deleteImportWidgetModal(id) {
    delete_widget_id = id;
    var obj = {};
    for (var i = 0; i < imported_widget_list.length; i++) {
        if (id === imported_widget_list[i]['widgetid']) {
            obj = Object.assign({}, imported_widget_list[i]);

        }
    }

    $(".widgetImportName").html(obj.widgetname);
    $(".modal").modal('hide');
    $("#deleteWidgetModal").modal('show');
}

function loadImageList(searchText) {

    if(abortQuery){
        abortQuery.abort();
    }

    var domainKeyJson = { "match": { "domainKey": DOMAIN_KEY } };
    var ispublicJson = { "match": { "isPublic": true } };
    var isprivateJson = { "match": { "isPublic": false } };

    var queryParams = {
        "query": {
            "bool": {
                "must": [],
                "should": []
            }
        },
        "size": 75
    };

    if (searchText) {


        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + searchText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + searchText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + searchText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + capitalizeFLetter(searchText) + "*" } })
        queryParams.query['bool']['minimum_should_match']=1


        queryParams.query['bool']['must'] = [ispublicJson,{ "wildcard": { "mediaType": "*image*" } }];

    } else {
        queryParams.query['bool']['must'] = [ispublicJson,{ "wildcard": { "mediaType": "*image*" } }];
    }

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    $(".imageListUl").html('');

    searchByAbortQuery('', 'FILE_PUBLIC', searchQuery, function(status, res) {
        if (status) {

            var resultData = searchQueryFormatterNew(res).data;
            image_list = resultData['data'];

            for (var i = 0; i < image_list.length; i++) {

                var srcPath = '';
                var fileType = '';

                if (image_list[i].isPublic) {
                    srcPath = API_BASE_PATH + '/files/public/download/' + image_list[i].id;
                    fileType = '<span class="label label-success"><i class="icon-unlock"></i> Public</span>'
                } else {
                    srcPath = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + image_list[i].id;
                    fileType = '<span class="label label-danger"><i class="icon-lock2"></i> Private</span>'
                }

                $(".imageListUl").append('<li class="imageListLi" onclick="setImageId(\'' + srcPath + '\')">' +
                    '<img src="' + srcPath + '" />' +
                    '<small>' + fileType + '</small></li>');
            }


        } else {
            image_list = []
        }


    })


}

function setImageId(id) {
    imageID = id;
    $(".imageHtml").html('<img src="' + id + '" style="width: 48px;height:48px;" />')

}

function renderImportedWidget(obj) {

    var imgPath = 'images/menu/widget.png'

    if(obj.widgetimage){
        imgPath = API_BASE_PATH+`/files/public/download/`+obj.widgetimage
    }
    if(obj.marketplace){
        if(obj.widgetimage) {
            imgPath = MARKETPLACE_API_URL + `/files/public/download/` + obj.widgetimage
        }
    }

    var str =
        `<div class="col-lg-3" style="display: inline-block;">
            <div class="widgetsBox">
                <label>` + obj.widgetname + ` <a href="javascript:void(0)" onclick="deleteImportWidgetModal('` + obj.widgetid + `')" class="pull-right btn btn-icon btn-default btn-xs"
                    title="Delete the widget from domain"><i class="icon-close"></i></a></label>
                  <img src="` + imgPath + `" alt="" />
                  <small style="display: block">` + obj.category + `</small>
                   <button class="btn btn-default btn-outline btn-xs btn-block" type="button" onclick="addWidget('` + obj._id + `')"><i class="icon-plus"></i> Add</button>
           </div>
        </div>`;
    $(".importedWidgets").append(str);
}
//Mobile Theme

function proceedMobileThemeSave() {


    var obj = {
        toolBar: $("#toolBar").spectrum("get").toHexString(),
        toolBarText: $("#toolBarText").spectrum("get").toHexString(),
        sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
        sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
        sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
        dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
        dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
        dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString()
    };

    var data = {
        name: MOBILE_DOMAIN_THEME_PROPERTY,
        value: JSON.stringify(obj)
    };

    upsertDomainProperty(data, function(status, data) {
        if (status) {
            successMsg('Successfully updated')
            $("#domainModal").modal('hide');

            // Cookies.set('platform_theme', obj);
            // rollThemeProp(obj);

        } else {
            errorMsg('Error in updating theme')
        }
    })
}

function getMobileTheme() {
    getDomainProperty(MOBILE_DOMAIN_THEME_PROPERTY, function(status, data) {

        if (status) {

            mobThemeProp = JSON.parse(data.value);

            $(".MOBtoolBar").css('background-color', mobThemeProp.toolBar);
            $(".MOBtoolBarText").css('background-color', mobThemeProp.toolBarText);
            $(".MOBpanelHeaderBg").css('background-color', mobThemeProp.panelHeaderBg);
            $(".MOBbodyBg").css('background-color', mobThemeProp.bodyBg);

            $(".MOBtoolBar").css('color', mobThemeProp.textColor);
            $(".MOBtoolBarText").css('color', mobThemeProp.textColor);

        }

        $("#bodyLayout").val(mobThemeProp.layout ? mobThemeProp.layout : MOBILE_DEFAULT_THEME.layout);


        if ($("#bodyLayout").val() === 'container') {
            $(".divPanel").css('width', '50%')
        } else {
            $(".divPanel").css('width', '100%')
        }

        $("#toolBar").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");

                var obj = {
                    toolBar: livecolor,
                    toolBarText: $("#toolBarText").spectrum("get").toHexString(),
                    sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
                    sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
                    sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
                    dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
                    dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
                    dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString(),
                    dashboardBg: $("#dashboardBg").spectrum("get").toHexString()
                };

                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#toolBar").spectrum("set", mobThemeProp.toolBar ? mobThemeProp.toolBar : MOBILE_DEFAULT_THEME.toolBar);

        $("#toolBarText").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");

                var obj = {
                    toolBar: $("#toolBar").spectrum("get").toHexString(),
                    toolBarText: livecolor,
                    sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
                    sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
                    sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
                    dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
                    dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
                    dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString(),
                    dashboardBg: $("#dashboardBg").spectrum("get").toHexString()
                };

                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#toolBarText").spectrum("set", mobThemeProp.toolBarText ? mobThemeProp.toolBarText : MOBILE_DEFAULT_THEME.toolBarText);

        $("#sideMenuProfile").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");
                var openSideMenu = iframedocument.getElementById("openSideMenu");

                var obj = {
                    toolBar: $("#toolBar").spectrum("get").toHexString(),
                    toolBarText: $("#toolBarText").spectrum("get").toHexString(),
                    sideMenuProfileBg: livecolor,
                    sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
                    sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
                    dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
                    dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
                    dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString(),
                    dashboardBg: $("#dashboardBg").spectrum("get").toHexString()
                };

                openSideMenu.click();
                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#sideMenuProfile").spectrum("set", mobThemeProp.toolBar ? mobThemeProp.toolBar : MOBILE_DEFAULT_THEME.toolBar);

        $("#sideMenuProfileBgText").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");
                var openSideMenu = iframedocument.getElementById("openSideMenu");

                var obj = {
                    toolBar: $("#toolBar").spectrum("get").toHexString(),
                    toolBarText: $("#toolBarText").spectrum("get").toHexString(),
                    sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
                    sideMenuProfileBgText: livecolor,
                    sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
                    dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
                    dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
                    dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString(),
                    dashboardBg: $("#dashboardBg").spectrum("get").toHexString()
                };

                openSideMenu.click();
                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#sideMenuProfileBgText").spectrum("set", mobThemeProp.sideMenuProfileBgText ? mobThemeProp.sideMenuProfileBgText : MOBILE_DEFAULT_THEME.toolBarText);

        $("#sideMenuListText").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");
                var openSideMenu = iframedocument.getElementById("openSideMenu");
                var obj = {
                    toolBar: $("#toolBar").spectrum("get").toHexString(),
                    toolBarText: $("#toolBarText").spectrum("get").toHexString(),
                    sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
                    sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
                    sideMenuListText: livecolor,
                    dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
                    dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
                    dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString(),
                    dashboardBg: $("#dashboardBg").spectrum("get").toHexString()
                };
                openSideMenu.click();
                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#sideMenuListText").spectrum("set", mobThemeProp.sideMenuListText ? mobThemeProp.sideMenuListText : MOBILE_DEFAULT_THEME.sideMenuListText);

        $("#dashboardIconsAndText").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");
                var openSideMenu = iframedocument.getElementById("openSideMenu");

                var obj = {
                    toolBar: $("#toolBar").spectrum("get").toHexString(),
                    toolBarText: $("#toolBarText").spectrum("get").toHexString(),
                    sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
                    sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
                    sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
                    dashboardIconsAndText: livecolor,
                    dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
                    dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString(),
                    dashboardBg: $("#dashboardBg").spectrum("get").toHexString()
                };
                // openSideMenu.click();
                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#dashboardIconsAndText").spectrum("set", mobThemeProp.dashboardIconsAndText ? mobThemeProp.dashboardIconsAndText : MOBILE_DEFAULT_THEME.dashboardIconsAndText);

        $("#dashboardMenuBg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");
                var openSideMenu = iframedocument.getElementById("openSideMenu");

                var obj = {
                    toolBar: $("#toolBar").spectrum("get").toHexString(),
                    toolBarText: $("#toolBarText").spectrum("get").toHexString(),
                    sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
                    sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
                    sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
                    dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
                    dashboardMenuBg: livecolor,
                    dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString(),
                    dashboardBg: $("#dashboardBg").spectrum("get").toHexString()
                };
                // openSideMenu.click();
                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#dashboardMenuBg").spectrum("set", mobThemeProp.dashboardMenuBg ? mobThemeProp.dashboardMenuBg : MOBILE_DEFAULT_THEME.dashboardMenuBg);

        $("#dashboardBg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");
                var openSideMenu = iframedocument.getElementById("openSideMenu");

                var obj = {
                    toolBar: $("#toolBar").spectrum("get").toHexString(),
                    toolBarText: $("#toolBarText").spectrum("get").toHexString(),
                    sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
                    sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
                    sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
                    dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
                    dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
                    dashboardMenuBorder: $("#dashboardMenuBorder").spectrum("get").toHexString(),
                    dashboardBg: livecolor
                };
                // openSideMenu.click();
                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#dashboardBg").spectrum("set", mobThemeProp.dashboardBg ? mobThemeProp.dashboardBg : MOBILE_DEFAULT_THEME.dashboardBg);

        $("#dashboardMenuBorder").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
            move: function(color) {
                var livecolor = color.toHexString();

                var iframe = document.getElementById('demo-ios');
                var iframedocument = iframe['contentWindow'].document;
                var themeChangesClick = iframedocument.getElementById("themeChangesClick");
                var openSideMenu = iframedocument.getElementById("openSideMenu");

                var obj = {
                    toolBar: $("#toolBar").spectrum("get").toHexString(),
                    toolBarText: $("#toolBarText").spectrum("get").toHexString(),
                    sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
                    sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString(),
                    sideMenuListText: $("#sideMenuListText").spectrum("get").toHexString(),
                    dashboardIconsAndText: $("#dashboardIconsAndText").spectrum("get").toHexString(),
                    dashboardMenuBg: $("#dashboardMenuBg").spectrum("get").toHexString(),
                    dashboardMenuBorder: livecolor,
                    dashboardBg: $("#dashboardMenuBorder").spectrum("get").toHexString()
                };
                // openSideMenu.click();
                iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
                themeChangesClick.click();
            }
        });
        $("#dashboardMenuBorder").spectrum("set", mobThemeProp.dashboardMenuBorder ? mobThemeProp.dashboardMenuBorder : MOBILE_DEFAULT_THEME.dashboardMenuBorder);

    });
}

function mobThemeReset() {

    $("#toolBar").spectrum("set", MOBILE_DEFAULT_THEME.toolBar);
    $("#toolBarText").spectrum("set", MOBILE_DEFAULT_THEME.toolBarText);

    $(".MOBSideMenuProfile").css('background-color', MOBILE_DEFAULT_THEME.toolBar)
    $(".MOBSideMenuProfileText").css('background-color', MOBILE_DEFAULT_THEME.toolBarText)


    $(".divPanel").css('width', '100%');

}

function mobThemePreview(THEME_CHANGES_FIELD) {

    /*$(".MOBtoolBar").css('background-color',$("#toolBar").spectrum("get").toHexString())
    $(".MOBtoolBarText").css('background-color',$("#sMOBubHeaderBg").spectrum("get").toHexString())
    $(".MOBpanelHeaderBg").css('background-color',$("#panelHeaderBg").spectrum("get").toHexString())
    $(".MOBbodyBg").css('background-color',$("#bodyBg").spectrum("get").toHexString())

    $(".MOBtoolBar").css('color',$("#textColor").spectrum("get").toHexString())
    $(".MOBtoolBarText").css('color',$("#textColor").spectrum("get").toHexString())*/

    // dashboardId
    var iframe = document.getElementById('demo-ios');
    var iframedocument = iframe['contentWindow'].document;
    var themeChangesClick = iframedocument.getElementById("themeChangesClick");

    var obj = {
        toolBar: $("#toolBar").spectrum("get").toHexString(),
        toolBarText: $("#toolBarText").spectrum("get").toHexString(),
        sideMenuProfileBg: $("#sideMenuProfile").spectrum("get").toHexString(),
        sideMenuProfileBgText: $("#sideMenuProfileBgText").spectrum("get").toHexString()
    };

    iframedocument.getElementById("THEME_CHANGES_VALUE").value = JSON.stringify(obj);
    themeChangesClick.click();

}

///////////////// mobile splash started ///////////////////


function mobsplashLogoUploadImage() {

    var fileInput = document.getElementById("mobSplashLogoFile");

    var splashFiles = fileInput.files;

    if (splashFiles.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    mobSplashLogoUploadFile(splashFiles[0]);

}


function mobSplashLogoUploadFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                splashUrl = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + result.id;
                $(".mob_splash_domain_logo_m").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + result.id);
                $("#splashSrc").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + result.id);
            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    xhr.send(formData);
}

function mobileSplashSettings(){
}

function splashScreenPreview(){

    var splashTitle = '';
    var splashPoweredBy = '';
    var isplashframe = document.getElementById('demo-splash-ios');

    if ($('#splashTitle').val() != '' && $('#splashTitle').val() != null && $('#splashTitle').val() != undefined) {
        splashTitle = "<h4 style='color:" + $("#titleColor").spectrum("get").toHexString() + " !important'>" + $('#splashTitle').val() + "</h4>"
    }
    if ($('#splashPoweredBy').val() != '' && $('#splashPoweredBy').val() != null && $('#splashPoweredBy').val() != undefined) {
        splashPoweredBy = "<small style='color:" + $("#poweredByColor").spectrum("get").toHexString() + " !important'>Powered by " + $('#splashPoweredBy').val() + "</small>"
    }

    var splashHtml = "<div class='container' style='position:relative;'> <div class='img' style='width: 100%;height: 400px;opacity: 0.3;color: white'> </div><div style='position: absolute;left: 0;top:" + $('#logoPosition').val() + "; width: 100%;text-align: center;font-size: 18px;'><img height='60' id='splashSrc' src=" + splashUrl + ">" + splashTitle + splashPoweredBy + "</div> </div>";
    $("#demo-splash-ios").html(splashHtml);
    $("#demo-splash-ios").css({"background": $("#splashBackground").spectrum("get").toHexString()});
}

function changeTheme(theme) {
    var isplashframe = document.getElementById('demo-splash-ios');
    var splashTitle = '';
    var splashPoweredBy = '';
    if (theme == 'strawberry') {
        document.getElementById('demo-splash-ios').contentWindow.location.reload(true);
        document.getElementById('demo-splash-ios').style.backgroundColor = "rgb(253, 99, 164)";
        if ($('#splashTitle').val() != '' && $('#splashTitle').val() != null && $('#splashTitle').val() != undefined) {
            splashTitle = "<h4 style='color: white !important'>" + $('#splashTitle').val() + "</h4>"
        }
        if ($('#splashPoweredBy').val() != '' && $('#splashPoweredBy').val() != null && $('#splashPoweredBy').val() != undefined) {
            splashPoweredBy = "<small style='color:white !important'>Powered by " + $('#splashPoweredBy').val() + "</small>"
        }
        isplashframe.contentDocument.write("<div class='container' style='position:relative;'> <div class='img' style='width: 100%;height: 400px;opacity: 0.3;color: white'> </div><div style='position: absolute;left: 0;top:" + $('#logoPosition').val() + "; width: 100%;text-align: center;font-size: 18px;'><img height='60' id='splashSrc' src=" + splashUrl + ">" + splashTitle + splashPoweredBy + "</div> </div>");

        $("#splashBackground").spectrum({
            color: "rgb(253, 99, 164)",
            showInput: true
        });
        $("#titleColor").spectrum({
            color: "white",
            showInput: true
        });
        $("#poweredByColor").spectrum({
            color: "white",
            showInput: true
        });
    } else if (theme == 'jasmine') {
        if ($('#splashTitle').val() != '' && $('#splashTitle').val() != null && $('#splashTitle').val() != undefined) {
            splashTitle = "<h4 style='color: #619465 !important'>" + $('#splashTitle').val() + "</h4> "
        }
        if ($('#splashPoweredBy').val() != '' && $('#splashPoweredBy').val() != null && $('#splashPoweredBy').val() != undefined) {
            splashPoweredBy = "<small style='color:#619465 !important'>Powered by " + $('#splashPoweredBy').val() + "</small>"
        }
        document.getElementById('demo-splash-ios').contentWindow.location.reload(true);
        document.getElementById('demo-splash-ios').style.backgroundColor = "#fff";
        isplashframe.contentDocument.write("<div class='container' style='position:relative;'> <div class='img' style='width: 100%;height: 400px;opacity: 0.3;color: white'> </div><div style='position: absolute;left: 0;top:" + $('#logoPosition').val() + "; width: 100%;text-align: center;font-size: 18px;'><img height='60' id='splashSrc' src=" + splashUrl + ">" + splashTitle + splashPoweredBy + "</div> </div>");
        $("#splashBackground").spectrum({
            color: "#fff",
            showInput: true
        });
        $("#titleColor").spectrum({
            color: "#619465",
            showInput: true
        });
        $("#poweredByColor").spectrum({
            color: "#619465",
            showInput: true
        });
    } else if (theme == 'skyblue') {
        if ($('#splashTitle').val() != '' && $('#splashTitle').val() != null && $('#splashTitle').val() != undefined) {
            splashTitle = "<h4 style='color: #515451  !important'>" + $('#splashTitle').val() + "</h4>"
        }
        if ($('#splashPoweredBy').val() != '' && $('#splashPoweredBy').val() != null && $('#splashPoweredBy').val() != undefined) {
            splashPoweredBy = "<small style='color:#515451  !important'>Powered by " + $('#splashPoweredBy').val() + "</small>"
        }
        document.getElementById('demo-splash-ios').contentWindow.location.reload(true);
        document.getElementById('demo-splash-ios').style.backgroundColor = "rgb(98, 212, 255)";
        isplashframe.contentDocument.write("<div class='container' style='position:relative;'> <div class='img' style='width: 100%;height: 400px;opacity: 0.3;color: white'> </div><div style='position: absolute;left: 0;top:" + $('#logoPosition').val() + "; width: 100%;text-align: center;font-size: 18px;'><img height='60' id='splashSrc' src=" + splashUrl + ">" + splashTitle + splashPoweredBy + "</div> </div>");
        $("#splashBackground").spectrum({
            color: "rgb(98, 212, 255)",
            showInput: true
        });
        $("#titleColor").spectrum({
            color: "#515451",
            showInput: true
        });
        $("#poweredByColor").spectrum({
            color: "#515451",
            showInput: true
        });
    } else if (theme == 'orange') {
        if ($('#splashTitle').val() != '' && $('#splashTitle').val() != null && $('#splashTitle').val() != undefined) {
            splashTitle = "<h4 style='color: white  !important'>" + $('#splashTitle').val() + "</h4>"
        }
        if ($('#splashPoweredBy').val() != '' && $('#splashPoweredBy').val() != null && $('#splashPoweredBy').val() != undefined) {
            splashPoweredBy = "<small style='color:white  !important'>Powered by " + $('#splashPoweredBy').val() + "</small>"
        }
        document.getElementById('demo-splash-ios').contentWindow.location.reload(true);
        document.getElementById('demo-splash-ios').style.backgroundColor = "orange";
        isplashframe.contentDocument.write("<div class='container' style='position:relative;'> <div class='img' style='width: 100%;height: 400px;opacity: 0.3;color: white'> </div><div style='position: absolute;left: 0;top:" + $('#logoPosition').val() + "; width: 100%;text-align: center;font-size: 18px;'><img height='60' id='splashSrc' src=" + splashUrl + ">" + splashTitle + splashPoweredBy + "</div> </div>");
        $("#splashBackground").spectrum({
            color: "orange",
            showInput: true
        });
        $("#titleColor").spectrum({
            color: "white",
            showInput: true
        });
        $("#poweredByColor").spectrum({
            color: "white",
            showInput: true
        });
    } else if (theme == 'banana') {
        if ($('#splashTitle').val() != '' && $('#splashTitle').val() != null && $('#splashTitle').val() != undefined) {
            splashTitle = "<h4 style='color: #bf6a6a   !important'>" + $('#splashTitle').val() + "</h4>"
        }
        if ($('#splashPoweredBy').val() != '' && $('#splashPoweredBy').val() != null && $('#splashPoweredBy').val() != undefined) {
            splashPoweredBy = "<small style='color:#bf6a6a   !important'>Powered by " + $('#splashPoweredBy').val() + "</small>"
        }
        document.getElementById('demo-splash-ios').contentWindow.location.reload(true);
        document.getElementById('demo-splash-ios').style.backgroundColor = "rgb(223, 223, 156)";
        isplashframe.contentDocument.write("<div class='container' style='position:relative;'> <div class='img' style='width: 100%;height: 400px;opacity: 0.3;color: white'> </div><div style='position: absolute;left: 0;top:" + $('#logoPosition').val() + "; width: 100%;text-align: center;font-size: 18px;'><img height='60' id='splashSrc' src=" + splashUrl + ">" + splashTitle + splashPoweredBy + "</div> </div>");
        $("#splashBackground").spectrum({
            color: "rgb(223, 223, 156)",
            showInput: true
        });
        $("#titleColor").spectrum({
            color: "#bf6a6a",
            showInput: true
        });
        $("#poweredByColor").spectrum({
            color: "#bf6a6a",
            showInput: true
        });
    } else if (theme == 'kiwi') {
        if ($('#splashTitle').val() != '' && $('#splashTitle').val() != null && $('#splashTitle').val() != undefined) {
            splashTitle = "<h4 style='color: #b87c7c  !important'>" + $('#splashTitle').val() + "</h4>"
        }
        if ($('#splashPoweredBy').val() != '' && $('#splashPoweredBy').val() != null && $('#splashPoweredBy').val() != undefined) {
            splashPoweredBy = "<small style='color:#b87c7c  !important'>Powered by " + $('#splashPoweredBy').val() + "</small>"
        }
        document.getElementById('demo-splash-ios').contentWindow.location.reload(true);
        document.getElementById('demo-splash-ios').style.backgroundColor = "rgb(213, 246, 166)";
        isplashframe.contentDocument.write("<div class='container' style='position:relative;'> <div class='img' style='width: 100%;height: 400px;opacity: 0.3;color: white'> </div><div style='position: absolute;left: 0;top:" + $('#logoPosition').val() + "; width: 100%;text-align: center;font-size: 18px;'><img height='60' id='splashSrc' src=" + splashUrl + ">" + splashTitle + splashPoweredBy + "</div> </div>");
        $("#splashBackground").spectrum({
            color: "rgb(213, 246, 166)",
            showInput: true
        });
        $("#titleColor").spectrum({
            color: "#b87c7c",
            showInput: true
        });
        $("#poweredByColor").spectrum({
            color: "#b87c7c",
            showInput: true
        });
    }else{  //Custome Colors

    }
}

function getMobileAppSplash() {
    getDomainProperty(MOBILE_APP_DOMAIN_SPLASH_PROPERTY, function(status, data) {
        if (status) {
            var splashResult = JSON.parse(data.value);
            console.log(splashResult);
            splashUrl = splashResult.splashUrl;
            $(".mob_splash_domain_logo_m").attr('src', splashResult.splashUrl);
            $('#splashPoweredBy').val(splashResult.splashPoweredBy);
            $('#splashTitle').val(splashResult.splashTitle);
            var isplashframe = document.getElementById('demo-splash-ios');
            // document.getElementById('demo-splash-ios').contentWindow.location.reload(true);
            // document.getElementById('demo-splash-ios').style.backgroundColor = splashResult.splashBackground ? splashResult.splashBackground : "#fff";
            $("#demo-splash-ios").css({"background": splashResult.splashBackground ? splashResult.splashBackground : "#fff"});
            $("#demo-splash-ios").html(splashResult.splashTag);
            // isplashframe.contentDocument.write(splashResult.splashTag);
            $("#splashBackground").spectrum({
                color: splashResult.splashBackground ? splashResult.splashBackground : "#fff",
                showInput: true,
                move: function(color) {
                    $("#demo-splash-ios").css({"background": $("#splashBackground").spectrum("get").toHexString()});
                }
            });
            $("#titleColor").spectrum({
                color: splashResult.titleColor ? splashResult.titleColor : "black",
                showInput: true,
                move: function(color) {
                    $("#demo-splash-ios h4").css({"color": $("#titleColor").spectrum("get").toHexString()});
                }
            });
            $("#poweredByColor").spectrum({
                color: splashResult.poweredByColor ? splashResult.poweredByColor : "black",
                showInput: true,
                move: function(color) {
                    $("#demo-splash-ios small").css({"color": $("#poweredByColor").spectrum("get").toHexString()});
                }
            });

        }
    })

}



function mobSplashLogoUpdate() {
    var splashTitle = '';
    var splashPoweredBy = '';
    if ($('#splashTitle').val() != '' && $('#splashTitle').val() != null && $('#splashTitle').val() != undefined) {
        splashTitle = "<h4 style='color:" + $("#titleColor").spectrum("get").toHexString() + " !important'>" + $('#splashTitle').val() + "</h4>"
    }
    if ($('#splashPoweredBy').val() != '' && $('#splashPoweredBy').val() != null && $('#splashPoweredBy').val() != undefined) {
        splashPoweredBy = "<small style='color:" + $("#poweredByColor").spectrum("get").toHexString() + " !important'>Powered by " + $('#splashPoweredBy').val() + "</small>"
    }
    var obj = {
        splashTitle: $('#splashTitle').val(),
        splashPoweredBy: $('#splashPoweredBy').val(),
        splashBackground: $("#splashBackground").spectrum("get").toHexString(),
        splashUrl: splashUrl,
        position: $('#logoPosition').val(),
        titleColor: $("#titleColor").spectrum("get").toHexString(),
        poweredByColor: $("#poweredByColor").spectrum("get").toHexString(),
        splashTag: "<div class='container' style='position:relative;'> <div class='img' style='width: 100%;height: 400px;opacity: 0.3;color: white'> </div><div style='position: absolute;left: 0;top:" + $('#logoPosition').val() + "; width: 100%;text-align: center;font-size: 18px;'><img height='60' id='splashSrc' src=" + splashUrl + ">" + splashTitle + splashPoweredBy + "</div> </div>",
    };

    var data = {
        name: MOBILE_APP_DOMAIN_SPLASH_PROPERTY,
        value: JSON.stringify(obj)
    };

    upsertDomainProperty(data, function(status, data) {
        if (status) {
            successMsg('Successfully updated');
            getMobileAppSplash()
        } else {
            errorMsg('Error in logo branding')
        }
    })
}




///////////////// mobile splash ended ////////////////////

function mobBrandingLogoUploadImage() {

    var fileInput = document.getElementById("mobLogoFile");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    mobBrandingLogoUploadFile(files[0]);

}


function mobBrandingLogoUploadFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                logoPathId = result.id;
                $(".mob_domain_logo_m").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + logoPathId);
                mobBrandingLogoUpdate()
            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    xhr.send(formData);
}

function getMobileAppDomainBranding() {
    getDomainProperty(MOBILE_APP_DOMAIN_BRANDING_PROPERTY, function(status, data) {
        if (status) {
            var src = JSON.parse(data.value);
            $(".mob_domain_logo_m").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + src.webLogo);
        } else {
            $(".mob_domain_logo_m").attr('src', "images/bdskap-logo.png");
        }
    })
}


function mobBrandingLogoUpdate() {

    var obj = {
        webLogo: logoPathId,
        mobileLogo: logoPathId
    };

    var data = {
        name: MOBILE_APP_DOMAIN_BRANDING_PROPERTY,
        value: JSON.stringify(obj)
    };

    upsertDomainProperty(data, function(status, data) {
        if (status) {
            $(".mob_domain_logo_m").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + logoPathId)
            Cookies.set('domain_logo', logoPathId);
            successMsg('Successfully updated');
            // mobBrandingChangedClick

            var iframe = document.getElementById('demo-ios');
            var iframedocument = iframe['contentWindow'].document;
            iframedocument.getElementById("mobBrandingChangedClick").click();

        } else {
            errorMsg('Error in logo branding')
        }
    })
}

function mobilePlatformSettings() {

    getGatewaySettings('fcm');
    getMobileAppDomainBranding();
}


function loadMsgFields() {
    var messageId = $('#messageList').val();

    for (var i = 0; i < message_list.length; i++) {
        if (Number(messageId) === message_list[i].id) {
            var obj = [];
            for (var j = 0; j < message_list[i].fields.length > 0; j++) {
                obj.push({ fieldname: message_list[i].fields[j].name, type: message_list[i].fields[j].dataType })
            }
            $(".messageFields").html(JSON.stringify(obj))
        }
    }
}

function loadRecFields() {
    var recId = $('#recordList').val();

    for (var i = 0; i < record_list.length; i++) {
        if (Number(recId) === record_list[i].id) {
            var obj = [];
            for (var j = 0; j < record_list[i].fields.length > 0; j++) {
                obj.push({ fieldname: record_list[i].fields[j].name, type: record_list[i].fields[j].dataType })
            }
            $(".recordFields").html(JSON.stringify(obj))
        }
    }
}
