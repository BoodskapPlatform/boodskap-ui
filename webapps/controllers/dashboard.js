if ($.trim($('#isPublic').val()) === 'true') {

    USER_OBJ = {
        apiKey: $.trim($('#token').val()),
        domainKey: $.trim($('#domainkey').val()),
        token: $.trim($('#token').val())
    };

    API_KEY = USER_OBJ.apiKey;
    DOMAIN_KEY = USER_OBJ.domainKey;
    API_TOKEN = USER_OBJ.token;

    MQTT_CLIENT_ID = 'GBL';
}


var DASHBOARD_LIST = [];
var CURRENT_DASHBOARD = {};
var CURRENT_DASHBOARD_ID = null;
//var LINKED_DOMAINS = LINKED_DOMAINS ? LINKED_DOMAINS : []; ///USER_OBJ.linkedDomains ? USER_OBJ.linkedDomains : [];
var DEFAULT_DOMAIN = {
    apiKey: USER_OBJ.apiKey,
    domainKey: USER_OBJ.domainKey,
    label: 'My Domain',
    token: USER_OBJ.token
};
var DEFAULT_DASHBOARD = {
    name: 'Untitled Dashboard',
    id: 'dashboard.1',
    property: 'dashboard.1',
    icon: 'icon-dashboard',
};
var CURRENT_DOMAIN = {};
var DASHBOARD_WIDGETS = [];
var GRID_STACK = null;


$(document).ready(function () {

    $("body").removeClass('bg-white');

    var options = {
        animate: true,
        cellHeight: 100,
        float: false,
        verticalMargin: 10,
        disableDrag: true,
        disableResize: true
    };
    $('.grid-stack').gridstack(options);

    // mqttConnect();
    // remove mqtt after fix

    if(qs('vertical')){
        $(".btnDash").remove();
    }

    if ($.trim($('#dashboardID').val()) !== '') {

        if ($.trim($('#isPublic').val()) === 'true') {
            $("#header").remove()
            $(".panel-heading").remove();

            // if(mobileOrWeb()) {
            //     $(".dashboardBody").css('height', $(window).height() - 50);
            // }


            loadDashboardlist();

        }
        else {


            loadDomain('default');


            var cFlag = true;
            for (var i = 0; i < USER_ROLE.length; i++) {
                if (USER_ROLE[i] === 'admin' || USER_ROLE[i] === 'domainadmin' || USER_ROLE[i] === 'developer') {
                    cFlag = false;
                }
            }

            if (cFlag) {
                $(".dashmenuicon").remove()
                $(".btnDash").remove()
                // $(".panel-heading").remove();
                // if(mobileOrWeb()) {
                    $(".dashboardBody").css('min-height', $(window).height() - 140);
                // }
            } else {
                // if(mobileOrWeb()) {
                    $(".dashboardBody").css('min-height', $(window).height() - 140);
                // }
            }


            $(".domainList").html("");
            if (LINKED_DOMAINS && LINKED_DOMAINS.length > 0) {
                for (var i = 0; i < LINKED_DOMAINS.length; i++) {
                    $(".domainList").append('<li><a href="javascript:void(0)" onclick="loadDomain(\'' + LINKED_DOMAINS[i].domainKey + '\')" ><i class="icon-globe"></i> ' +
                        '<span class="">' + LINKED_DOMAINS[i].label + '</span></a></li>');
                }
                $(".domainList").append('<li role="separator" class="divider"></li>' +
                    '<li><a href="javascript:void(0)" onclick=loadDomain("default")><i class="icon-globe"></i> My Domain ' +
                    '<small style="font-size:70%">(Default)</small></a></li>');
            }
        }

    } else {


        if ($.trim($('#isPublic').val()) === 'true') {

            $("#header").remove();
            $(".footer").remove();
            $(".panel-heading").remove();
            // if(mobileOrWeb()) {
            //     $(".dashboardBody").css('height', $(window).height() - 30);
            // }
            $(".dashboardDIV").append(qs('p')==1 || qs('p') == '1' ? '' : '<a href="https://boodskap.io" target="_blank" style="position: absolute;right:0px;bottom: 0px">' +
                '<img src="images/powered-by-boodskap.png" class="powered-by pull-right" style="height: 30px;"/></a>');


            getGlobalProperty(USER_OBJ.token, function (status, data) {
                if (status) {

                    var resultData = JSON.parse(data.data);

                    CURRENT_DASHBOARD = resultData;
                    loadDashboard('current');

                }
            })


        } else {
            if(qs('domainKey')){
                loadDomain(qs('domainKey'));
                $("#header").remove();
                $(".btnDash").remove();
                // if(mobileOrWeb()) {
                    $(".dashboardBody").css('min-height', $(window).height() - 140);
                // }
            }else{
                loadDomain('default');
                // if(mobileOrWeb()) {
                    $(".dashboardBody").css('min-height', $(window).height() - 140);
                // }
            }



            $(".domainList").html("");
            if (LINKED_DOMAINS && LINKED_DOMAINS.length > 0) {
                for (var i = 0; i < LINKED_DOMAINS.length; i++) {
                    $(".domainList").append('<li><a href="javascript:void(0)" onclick="loadDomain(\'' + LINKED_DOMAINS[i].domainKey + '\')" ><i class="icon-globe"></i> ' +
                        '<span class="">' + LINKED_DOMAINS[i].label + '</span></a></li>');
                }
                $(".domainList").append('<li role="separator" class="divider"></li>' +
                    '<li><a href="javascript:void(0)" onclick=loadDomain("default")><i class="icon-globe"></i> My Domain ' +
                    '<small style="font-size:70%">(Default)</small></a></li>');
            }


        }


    }

});

function mqttListen() {
    console.log(new Date + ' | MQTT Started to Subscribe');

    // mqttSubscribeGlobal("/" + USER_OBJ.domainKey + "/log/incoming", 0);

    mqtt_client.onMessageArrived = function (message) {

        console.log(new Date + ' | MQTT Message Received :', message);

        var parsedData = JSON.parse(message.payloadString);
        var topicName = message.destinationName;

        console.log(parsedData);

    };
}


function loadDomain(id) {

        if (id === 'default') {
            API_TOKEN = USER_OBJ.token;
            DOMAIN_KEY = USER_OBJ.domainKey;
            API_KEY = USER_OBJ.apiKey;
            CURRENT_DOMAIN = DEFAULT_DOMAIN;
        } else {
            for (var i = 0; i < LINKED_DOMAINS.length; i++) {
                if (id === LINKED_DOMAINS[i].domainKey) {
                    CURRENT_DOMAIN = LINKED_DOMAINS[i];
                }
            }


            API_TOKEN = CURRENT_DOMAIN.token;
            DOMAIN_KEY = CURRENT_DOMAIN.domainKey;
            API_KEY = CURRENT_DOMAIN.apiKey;

        }

            loadDashboardlist();


        $(".currentDomain").html(CURRENT_DOMAIN.label)


}
var dashExist = false;

function loadDashboardlist() {
    // console.log("API_TOKEN =>",API_TOKEN)
    // console.log("DOMAIN_KEY =>",DOMAIN_KEY)
    // console.log("API_KEY =>",API_KEY)

    getDomainProperty(DASHBOARD_LIST_PROPERTY, function (status, data) {
        if (status) {
            dashExist = true;
            DASHBOARD_LIST = JSON.parse(data.value);


            if ($.trim($('#dashboardID').val()) !== '') {

                var flag = false;

                for (var i = 0; i < DASHBOARD_LIST.length; i++) {

                    var iconStr = '';

                    if(DASHBOARD_LIST[i].isimage && DASHBOARD_LIST[i].imgpath){
                        iconStr = '<img src="'+DASHBOARD_LIST[i].imgpath+'" style="height: 24px;" /> '
                    }else{
                        iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
                    }


                    $(".dashboardList").append('<li><a href="javascript:void(0)" onclick="loadDashboard(\'' + DASHBOARD_LIST[i].id + '\')" >' +
                        iconStr +
                        '<span class="">' + DASHBOARD_LIST[i].name + '</span></a></li>');

                    if ($.trim($('#dashboardID').val()) + '' === DASHBOARD_LIST[i].id + '') {
                        CURRENT_DASHBOARD = DASHBOARD_LIST[i];
                        flag = true;
                    }
                }


                if (flag) {
                    loadDashboard('current');
                }
                else {
                    var queryParam = qs('query');
                    if (queryParam) {
                        CURRENT_DASHBOARD = JSON.parse(queryParam);
                        loadDashboard('current');
                    } else {
                        document.location = BASE_PATH+'/404';
                    }
                }


            }
            else {

                $(".dashboardList").html("");
                for (var i = 0; i < DASHBOARD_LIST.length; i++) {

                    var iconStr = '';

                    if(DASHBOARD_LIST[i].isimage && DASHBOARD_LIST[i].imgpath){
                        iconStr = '<img src="'+DASHBOARD_LIST[i].imgpath+'" style="height: 24px;" /> '
                    }else{
                        iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
                    }

                    $(".dashboardList").append('<li><a href="javascript:void(0)" onclick="loadDashboard(\'' + DASHBOARD_LIST[i].id + '\')" >' +
                        iconStr +
                        '<span class="">' + DASHBOARD_LIST[i].name + '</span></a></li>');
                }
                if (DASHBOARD_LIST[0]) {
                    CURRENT_DASHBOARD = DASHBOARD_LIST[0];
                    loadDashboard('other');
                }
            }


        }
        else {
            DASHBOARD_LIST = [];
            $(".dashboardList").html("");

            var queryParam = qs('query');
            if (queryParam) {
                CURRENT_DASHBOARD = JSON.parse(queryParam);
                loadDashboard('current');
            } else {
                loadDashboard('default');
            }

        }

        loadDashboardMenu();
    });
}

function refreshDashboard() {
    DASHBOARD_LIST = [];
    getDomainProperty(DASHBOARD_LIST_PROPERTY, function (status, data) {
        if (status) {

            DASHBOARD_LIST = JSON.parse(data.value);
            $(".dashboardList").html("");
            for (var i = 0; i < DASHBOARD_LIST.length; i++) {


                var iconStr = '';

                if(DASHBOARD_LIST[i].isimage && DASHBOARD_LIST[i].imgpath){
                    iconStr = '<img src="'+DASHBOARD_LIST[i].imgpath+'" style="height: 24px;" /> '
                }else{
                    iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
                }

                $(".dashboardList").append('<li><a href="javascript:void(0)" onclick="loadDashboard(\'' + DASHBOARD_LIST[i].id + '\')" >' +
                    iconStr +
                    '<span class="">' + DASHBOARD_LIST[i].name + '</span></a></li>');

                if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
                    CURRENT_DASHBOARD = DASHBOARD_LIST[i];
                }
            }

            loadDashboard('current');


        } else {
            DASHBOARD_LIST = [];
            $(".dashboardList").html("");
        }
    });

}
var lFlag = false;
function loadDashboard(id, flag) {

    console.log("id =>",id)


    if (id === 'default') {

        CURRENT_DASHBOARD = DEFAULT_DASHBOARD;

    } else if (id === 'current') {

    }
    else {
        /*if (USER_ROLE.indexOf('user') === -1) {
            if (id !== 'other' && id !== 'current') {
                console.log('toggle')
                toggleDashboardMenu();
            }
        }*/

            if (lFlag) {
                if (USER_ROLE.indexOf('user') !== -1) {
                    openNav();
                } else {
                    toggleDashboardMenu();
                }
            }
            lFlag = true;


            for (var i = 0; i < DASHBOARD_LIST.length; i++) {
                if (id + '' === DASHBOARD_LIST[i].id + '') {
                    CURRENT_DASHBOARD = DASHBOARD_LIST[i];
                }
            }
    }

    CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;

    $(".dashboardMenu .nav-menu").removeClass('active');
    $(".dashboardMenu .d_"+CURRENT_DASHBOARD_ID).addClass('active');


    $(".dashboardName").html(CURRENT_DASHBOARD.name);


    var iconStr =  '';

    if(CURRENT_DASHBOARD.isimage && CURRENT_DASHBOARD.imgpath){
        iconStr = '<img src="'+CURRENT_DASHBOARD.imgpath+'" style="height: 24px;" /> '
    }else{
        iconStr = '<i class="' + CURRENT_DASHBOARD.icon + '"></i> ';
    }

    $(".dashboardIcon").html(iconStr);
    $(".dashboardBody").css('background-color', CURRENT_DASHBOARD.bgcolor ? CURRENT_DASHBOARD.bgcolor : DEFAULT_DASHBOARD_BG + " !important");

    $(".panel-heading").css('background-color', (CURRENT_DASHBOARD.titlebgcolor ? CURRENT_DASHBOARD.titlebgcolor : DEFAULT_THEME.panelHeaderBg) +' !important');
    $(".dashmenuicon").css('background-color',(CURRENT_DASHBOARD.titlebgcolor ? CURRENT_DASHBOARD.titlebgcolor : '#6c757d') +' !important');
    $(".dashmenuicon").css('color',(CURRENT_DASHBOARD.titletxtcolor ? CURRENT_DASHBOARD.titletxtcolor : '#fff') +' !important');
    $(".panel-title").css('color', (CURRENT_DASHBOARD.titletxtcolor ? CURRENT_DASHBOARD.titletxtcolor : '#fff') +' !important');




    loadWidgets(CURRENT_DASHBOARD.property);

}

function loadWidgets(id) {

    if (GRID_STACK) GRID_STACK.removeAll();

    getDomainProperty(id, function (status, data) {
        if (status) {

            DASHBOARD_WIDGETS = JSON.parse(data.value);
// console.log("dashboard",DASHBOARD_WIDGETS);
            for (var i = 0; i < DASHBOARD_WIDGETS.length; i++) {

                var widget = DASHBOARD_WIDGETS[i];


                if (!GRID_STACK) GRID_STACK = $('.grid-stack').data('gridstack');

                var id = widget.id;


                var htmlStr = `
                        <iframe id="f_` + id + `" style="width:100%;border:0px;height: 100%;overflow: hidden" ></iframe>
                `;

                var widgetHeight = (widget.height * 100)-20;
                var bgColor = widget.widgetBgColor ? widget.widgetBgColor : DEFAULT_THEME.panelHeaderBg;
                var txtColor = widget.widgetTextColor ? widget.widgetTextColor : '#fff';


                if(widget.widgetTitle){
                    htmlStr = '<div class="panel panel-inverse col-lg-12" style="padding:0px;margin:0px;">' +
                        '<div class="panel-heading" style="background-color: '+bgColor+';">' +
                        '<h4 class="panel-title" style="color:'+txtColor+'">'+widget.widgetTitle+'</h4>' +
                        '</div>' +
                        '<div class="panel-body" style="padding:0px;border: 1px solid #6d6d6d57;overflow: hidden;overflow-x: hidden;height:'+widgetHeight+'px">' +
                        htmlStr+
                        '</div>' +
                        '</div>';
                }


                var widgetHtml = '<div><div class="grid-stack-item-content ' + id + '" data-gs-id="' + id + '" style="overflow:hidden;">' +
                    htmlStr +
                    '</div></div>';


                /*if (grid.willItFit(newNode.x, newNode.y, newNode.width, newNode.height, true)) {
                    grid.addWidget(newNode.el, newNode.x, newNode.y, newNode.width, newNode.height, true);
                }
                else {
                    alert('Not enough free space to place the widget');
                }*/

                GRID_STACK.addWidget($(widgetHtml), widget.x, widget.y, widget.width, widget.height, false, 1, 100, 1, 100, id);


                loadWidgetIFrame(widget);
            }


        }
    });

}

function showHeader(id) {
    // $(".widgetTitle_"+id).css('display','block');
}

function hideHeader(id) {
    // $(".widgetTitle_"+id).css('display','none');
}

function loadWidgetIFrame(obj) {


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
        w_asset_id = config.asset.assetid ? config.asset.assetid : '',
        w_record_id = config.record && config.record.recordid ? config.record.recordid : '';

    var resultData =
        "var API_BASE_PATH='" + API_BASE_PATH + "';\n" +
        "var DOMAIN_KEY='" + DOMAIN_KEY + "';\n" +
        "var API_KEY='" + API_KEY + "';\n" +
        "var API_TOKEN='" + API_TOKEN + "';\n" +
        "var USER_ID='" + (USER_OBJ && USER_OBJ.user ? USER_OBJ.user.email : '') + "';\n" +
        "var DEVICE_ID='" + (w_device_id) + "';\n" +
        "var RECORD_ID='" + (w_record_id) + "';\n" +
        "var MESSAGE_ID='" + (w_message_id) + "';\n" +
        "var ASSET_ID='" + (w_asset_id) + "';\n" +
        "var WIDGET_ID='" + (obj.id) + "';\n" +
        "var MQTT_CLIENT_ID='" + MQTT_CLIENT_ID + "';\n" +
        "var MQTT_CONFIG='" + JSON.stringify(MQTT_CONFIG) + "';\n";


    var cssCode = code.css;
    var htmlCode = code.html;
    var jsCode = code.js;
    // if(mobileOrWeb()) {
    //     body.html('<style>body{overflow-x: hidden}' + cssCode + '</style><div>' + htmlCode + '</div><script>' + resultData + '</script>');
    // }else{


        body.html('<style>body{overflow: hidden !important;}' + cssCode + '</style>' +
            '<div style="position: absolute;width:100%;height:100%;background-color:#6d6d6d;z-index:999;color:#fff;text-align: center;' +
            'font-size:12px;padding-top: 15%;font-weight: bold" ' +
            'id="loader">Loading Widget...</div>' +
            '<div>' + htmlCode + '</div><script>' + resultData + '</script>');


    // }

    var mqtt_file = 'js/boodskap.ws.js';
    var mqtt_adapter = 'resources/js/bdskp-live-adapter.js';

    jsResource.push(mqtt_file);
    jsResource.push(mqtt_adapter);


    async.mapSeries(code.defaultcss, function (file, callback) {

        // console.log('Enter FILE =>',file)

        if (inbuildcss) {
            var cssFile = iframedocument.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.setAttribute('href', CDN_PATH + '/css/' + file);
            head.appendChild(cssFile);

            if (cssFile.readyState) {  //IE
                cssFile.onreadystatechange = function () {
                    if (s.readyState == "loaded" ||
                        s.readyState == "complete") {
                        s.onreadystatechange = null;
                        callback(null, null);
                    } else {
                        callback(null, null);
                    }
                    callback(null, null);
                };
            } else {  //Others
                cssFile.onload = function () {
                    // console.log('FILE =>',file)
                    callback(null, null);
                };
            }
        } else {
            callback(null, null);
        }


    }, function (err, result) {

        async.mapSeries(cssResource, function (file, callback1) {
            // console.log('Enter FILE =>',file)
            if ($.trim(file)) {
                var cssFile = iframedocument.createElement('link');
                cssFile.setAttribute('type', 'text/css');
                cssFile.setAttribute('rel', 'stylesheet');
                cssFile.setAttribute('href', file);
                head.appendChild(cssFile);
                if (cssFile.readyState) {  //IE
                    cssFile.onreadystatechange = function () {
                        if (s.readyState == "loaded" ||
                            s.readyState == "complete") {
                            s.onreadystatechange = null;
                            callback1(null, null);
                        } else {
                            callback1(null, null);
                        }
                    };
                } else {  //Others
                    cssFile.onload = function () {

                        callback1(null, null);
                    };
                }
            } else {
                callback1(null, null);
            }

        }, function (err, result) {

            body.append('<script>var elem = document.getElementById(\'loader\');\n' +
                ' elem.parentNode.removeChild(elem);</script>');


            async.mapSeries(code.defaultjs, function (file, callback2) {
                // console.log('Enter FILE =>',file)

                if (inbuildjs) {
                    var jsFile = iframedocument.createElement('script');
                    jsFile.setAttribute('type', 'text/javascript');
                    jsFile.setAttribute('src', CDN_PATH + '/js/' + file);
                    head.appendChild(jsFile);


                    if (jsFile.readyState) {  //IE

                        jsFile.onreadystatechange = function () {
                            if (s.readyState == "loaded" ||
                                s.readyState == "complete") {
                                s.onreadystatechange = null;
                                callback2(null, null);
                            } else {
                                callback2(null, null);
                            }
                        };
                    } else {  //Others
                        jsFile.onload = function () {
                            // console.log('FILE =>',file)
                            callback2(null, null);
                        };
                    }
                } else {
                    callback2(null, null);
                }
            }, function (err, result) {

                async.mapSeries(jsResource, function (file, callback3) {
                    // console.log('Enter FILE =>',file)
                    if (file) {
                        var jsFile = iframedocument.createElement('script');
                        jsFile.setAttribute('type', 'text/javascript');
                        jsFile.setAttribute('src', file);
                        head.appendChild(jsFile);

                        if (jsFile.readyState) {  //IE
                            jsFile.onreadystatechange = function () {
                                if (s.readyState == "loaded" ||
                                    s.readyState == "complete") {
                                    s.onreadystatechange = null;
                                    callback3(null, null);
                                } else {
                                    callback3(null, null);
                                }
                            };
                        } else {  //Others
                            jsFile.onload = function () {
                                callback3(null, null);
                            };
                        }

                    }
                    else {
                        callback3(null, null);
                    }
                }, function (err, result) {
                    body.append('<script>' + jsCode + '</script>');


                });

            });

        });
    });

}


function shareModal() {


    if (CURRENT_DASHBOARD.tokenId) {
        var url = WEB_BASE_PATH + '/public/dashboard/' + DOMAIN_KEY + '/' + CURRENT_DASHBOARD.tokenId;
        $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
            '<small style="font-size:11px;">This url can be embed in iframe.</small>');
        $("#enableBtn").prop("checked", true);
    } else {
        $("#disableBtn").prop("checked", true);
    }

    $("#shareModal").modal('show')
}

function shareDashboard() {
    if ($("input[name='shareBtn']:checked").val() === 'enable') {

        if (CURRENT_DASHBOARD.tokenId) {
            var url = WEB_BASE_PATH + '/public/dashboard/' + DOMAIN_KEY + '/' + CURRENT_DASHBOARD.tokenId;
            $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                '<small style="font-size:11px;">This url can be embed in iframe.</small>');

        } else {
            var data = {
                data: JSON.stringify(CURRENT_DASHBOARD)
            };

            insertGlobalProperty(data, function (status, data) {
                if (status) {
                    CURRENT_DASHBOARD['tokenId'] = data.id;
                    var url = WEB_BASE_PATH + '/public/dashboard/' + DOMAIN_KEY + '/' + CURRENT_DASHBOARD.tokenId;
                    $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                        '<small style="font-size:11px;">This url can be embed in iframe.</small>');
                    updateDashboard();
                } else {
                    errorMsg('Error in share')
                }
            })
        }

    } else {
        if (CURRENT_DASHBOARD.tokenId) {
            deleteGlobalProperty(CURRENT_DASHBOARD.tokenId, function (status, data) {
                if (status) {
                    CURRENT_DASHBOARD['tokenId'] = '';
                    $(".shareLink").html('');
                    updateDashboard();
                } else {
                    errorMsg('Error in disabling share')
                }
            })
        }

    }
}


function updateDashboard() {


    for (var i = 0; i < DASHBOARD_LIST.length; i++) {

        if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
            DASHBOARD_LIST[i] = CURRENT_DASHBOARD;
        }
    }


    var data = {
        name: DASHBOARD_LIST_PROPERTY,
        value: JSON.stringify(DASHBOARD_LIST)
    };

    upsertDomainProperty(data, function (status, data) {
        if (status) {


        } else {
            errorMsg('Error in updating dashboard')
        }
    })
}

function toggleDashboardMenu() {
    if ($(".dashboardMenu").hasClass('barwidth')) {
        $(".dashmenuicon").html('<i class="icon-bars"></i>')
        $(".dashboardMenu").removeClass('barwidth');
    } else {
        $(".dashmenuicon").html('<i class="icon-close2"></i>')
        $(".dashboardMenu").addClass('barwidth')
    }
}


function loadDashboardMenu() {

    if(USER_ROLE.indexOf('user') !== -1) {

        setTimeout(function () {
            loadDashboardUserMenu();
        },500)

    }else{

        if(qs('domainKey')) {
            $(".dashboardMenu ul").html('');
        }else{
            $(".dashboardMenu ul").html('<li class="nav-header" style="background-color:#eeeeee6e">' +
                '<a href="'+WEB_BASE_PATH+'/dashboard" style="padding-left: 0px;"><i class="icon-home"></i> Dashboard</a></li>');
        }

        var dashboardStr = '';

        if (DASHBOARD_LIST.length > 0) {

            dashboardStr = dashboardStr +' <li class="nav-header">Domain Dashboard\'s</li>';

            for (var i = 0; i < DASHBOARD_LIST.length; i++) {


                var iconStr =  '';

                if(DASHBOARD_LIST[i].isimage && DASHBOARD_LIST[i].imgpath){
                    iconStr = '<img src="'+DASHBOARD_LIST[i].imgpath+'" style="height: 18px;" />'
                }else{
                    iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
                }


                dashboardStr = dashboardStr + ' <li class="nav-menu d_' + DASHBOARD_LIST[i].id + '"><a href="javascript:void(0)" onclick="loadDashboard(\'' + DASHBOARD_LIST[i].id + '\')">' +
                    iconStr +
                    '<span>' + DASHBOARD_LIST[i].name + '</span></a></li>';
            }


            if (CURRENT_DASHBOARD_ID) {
                $(".dashboardMenu .nav-menu").removeClass('active');
                $(".dashboardMenu .d_" + CURRENT_DASHBOARD_ID).addClass('active');

            }

        }

        if(qs('vertical')) {

            var queryParams = {
                "query": {
                    "bool": {
                        "must": [
                            {
                                match: {clientDomainKey: DOMAIN_KEY}
                            },
                            {
                                match: {verticalid: qs('vertical')}
                            }
                        ]
                    }
                },
                "size": 1

            };

            var searchQuery = {
                "method": 'GET',
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": []
            };

            searchByQuery('', 'VERTICAL_IMPORTED', searchQuery, function (status, data) {
                if (status) {

                    var result = QueryFormatter(data)['data'];
                    var vertical_list = result.data;


                    if(vertical_list.length > 0){


                        var verticalObj = vertical_list[0];


                        getVerticalPermission(verticalObj.verticalid, function (vdata) {

                            var sFlag = true;

                            for(var i=0; i<USER_ROLE.length;i++){
                                if(USER_ROLE[i] === 'admin' || USER_ROLE[i] === 'domainadmin' ){
                                    sFlag = false;
                                }
                            }

                            if (sFlag && vdata.length > 0) {

                                var vflag = false;
                                var verticalStr = '';

                                DASHBOARD_LIST = [];

                                async.filter(vdata, function (vd, vcbk) {

                                    if(vd.groupid === 'ALL'){
                                        vflag = true;

                                        var dashStatus = checkDashboadExist(vd, verticalObj);
                                        if(dashStatus) {
                                            DASHBOARD_LIST.push(vd);

                                            var iconStr = '';
                                            if (vd.isimage) {
                                                iconStr = '<img src="' + vd.imgpath + '" style="height: 18px;" />'
                                            } else {
                                                iconStr = '<i class="' + vd.icon + '"></i> ';
                                            }
                                            verticalStr = verticalStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                                '<a href="javascript:void(0)" onclick="loadDashboard(\'' + vd.id + '\')">' + iconStr +
                                                '<span> ' + vd.name + '</span></a></li>';
                                        }
                                        vcbk(null, null);
                                    }
                                    else {
                                        checkUserExist(vd.groupid, USER_OBJ.user.email, function (status) {
                                            var iconStr = '';
                                            if (vd.isimage) {
                                                iconStr = '<img src="' + vd.imgpath + '" style="height: 18px;" />'
                                            } else {
                                                iconStr = '<i class="' + vd.icon + '"></i> ';
                                            }

                                            if (status) {

                                                var dashStatus = checkDashboadExist(vd, verticalObj);
                                                if(dashStatus) {
                                                    DASHBOARD_LIST.push(vd);
                                                    vflag = true;

                                                    verticalStr = verticalStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                                        '<a href="javascript:void(0)" onclick="loadDashboard(\'' + vd.id + '\')">' + iconStr +
                                                        '<span> ' + vd.name + '</span></a></li>';
                                                }
                                            }
                                            vcbk(null, null);

                                        });
                                    }

                                }, function (err, result) {
                                    if (vflag) {
                                        $(".dashboardMenu ul").append(' <li class="nav-header"  style="color:#f79802">' + verticalObj.verticalname + ' <small>' + verticalObj.version + '</small></li>')
                                        $(".dashboardMenu ul").append(verticalStr);
                                    }

                                    if (CURRENT_DASHBOARD_ID) {
                                        $(".dashboardMenu .nav-menu").removeClass('active');
                                        $(".dashboardMenu .d_" + CURRENT_DASHBOARD_ID).addClass('active');

                                    }

                                    if($.trim($('#dashboardID').val()) !== '') {
                                        !dashExist ? loadDashboard($.trim($('#dashboardID').val()), false) : ''
                                    }
                                });


                            }else{



                                var verticalStr = '';

                                DASHBOARD_LIST = [];

                                console.log("verticalObj =>",verticalObj)


                                for(var i=0;i<verticalObj.dashboards.length;i++){
                                    var vd = verticalObj.dashboards[i];
                                    DASHBOARD_LIST.push(vd);
                                    var iconStr =  '';


                                    if(vd.isimage){
                                        iconStr = '<img src="'+vd.imgpath+'" style="height: 18px;" />'
                                    }else{
                                        iconStr = '<i class="' + vd.icon + '"></i> ';
                                    }

                                    verticalStr = verticalStr + ' <li class="nav-menu d_' + vd.id + '">' +
                                        '<a  href="javascript:void(0)" onclick="loadDashboard(\'' + vd.id + '\')">' +iconStr+
                                        '<span>' + vd.name + '</span></a></li>';
                                }


                                $(".dashboardMenu ul").append(' <li class="nav-header"  style="color:#f79802">' + verticalObj.verticalname + ' <small>' + verticalObj.version + '</small></li>')
                                $(".dashboardMenu ul").append(verticalStr);

                                if (CURRENT_DASHBOARD_ID) {
                                    $(".dashboardMenu .nav-menu").removeClass('active');
                                    $(".dashboardMenu .d_" + CURRENT_DASHBOARD_ID).addClass('active');

                                }
                                if($.trim($('#dashboardID').val()) !== '') {
                                    !dashExist ? loadDashboard($.trim($('#dashboardID').val()), false) : ''                                }
                            }

                        });



                    }

                    // $(".dashboardMenu ul").append(verticalStr);

                }
            })
        }else{
            $(".dashboardMenu ul").append(dashboardStr);
        }
    }

}

function checkDashboadExist(vd, obj) {
    var flag = false;

    for(var i=0;i<obj.dashboards.length;i++){
        if(vd.id === obj.dashboards[i].id){
            flag = true
        }
    }

    return flag;
}

function loadDashboardUserMenu() {


    $(".sidenav ul").html('<li class="has-sub active sideMain homeMenu">'+
        '<a href="'+WEB_BASE_PATH+'/dashboard">'+
        '<i class="fa fa-home"></i>'+
        '<span>Home</span>'+
        '</a>'+
        '</li>'+userEventMenu);

    var dashboardStr = '';

    if(DASHBOARD_LIST.length > 0) {

        dashboardStr = dashboardStr +'<li class="nav-header" style="color:#f79802">Domain Dashboard\'s</li>';

        for (var i = 0; i < DASHBOARD_LIST.length; i++) {

            var iconStr =  '';

            if(DASHBOARD_LIST[i].isimage && DASHBOARD_LIST[i].imgpath){
                iconStr = '<img src="'+DASHBOARD_LIST[i].imgpath+'" style="height: 18px;" />'
            }else{
                iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
            }


            dashboardStr = dashboardStr +'<li class="has-sub sideMain msgDefMenu"><a href="javascript:void(0)" onclick="loadDashboard(\'' + DASHBOARD_LIST[i].id +'\')">' +
                iconStr +
                '<span>'+DASHBOARD_LIST[i].name+'</span></a></li>';
        }


        if(CURRENT_DASHBOARD_ID){
            $(".dashboardMenu .nav-menu").removeClass('active');
            $(".dashboardMenu .d_"+CURRENT_DASHBOARD_ID).addClass('active');

        }

        /*if($.trim($('#dashboardID').val()) !== '') {
            loadDashboard($.trim($('#dashboardID').val()), false)
        }*/
    }


    if(qs('vertical')) {


        var queryParams = {
            "query": {
                "bool": {
                    "must": [
                        {
                            match: {clientDomainKey: DOMAIN_KEY}
                        },
                        {
                            match: {verticalid: qs('vertical')}
                        }
                    ]
                }
            },
            "size": 1

        };



        var searchQuery = {
            "method": 'GET',
            "extraPath": "",
            "query": JSON.stringify(queryParams),
            "params": []
        };

        var verticalStr = '';

        searchByQuery('', 'VERTICAL_IMPORTED', searchQuery, function (status, data) {
            if (status) {

                var result = QueryFormatter(data)['data'];
                var vertical_list = result.data;

                if(vertical_list.length > 0){

                    var verticalObj = vertical_list[0];

                    getVerticalPermission(verticalObj.verticalid, function (vdata) {

                        console.log("%%%%%%%%%%%")
                        console.log(vdata)

                        if (vdata.length > 0) {

                            var vflag = false;
                            var verticalStr = '';
                            var verticalStrFalse = '';

                            async.filter(vdata, function (vd, vcbk) {

                                if(vd.groupid === 'ALL'){
                                    var dashStatus = checkDashboadExist(vd, verticalObj);
                                    if(dashStatus) {
                                        DASHBOARD_LIST.push(vd);
                                        vflag = true;

                                        var iconStr = '';
                                        if (vd.isimage) {
                                            iconStr = '<img src="' + vd.imgpath + '" style="height: 18px;" />'
                                        } else {
                                            iconStr = '<i class="' + vd.icon + '"></i> ';
                                        }
                                        verticalStr = verticalStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                            '<a href="javascript:void(0)" onclick="loadDashboard(\'' + vd.id + '\')">' + iconStr +
                                            '<span> ' + vd.name + '</span></a></li>';
                                    }
                                    vcbk(null, null);
                                }
                                else {
                                    checkUserExist(vd.groupid, USER_OBJ.user.email, function (status) {
                                        var iconStr = '';
                                        if (vd.isimage) {
                                            iconStr = '<img src="' + vd.imgpath + '" style="height: 18px;" />'
                                        } else {
                                            iconStr = '<i class="' + vd.icon + '"></i> ';
                                        }

                                        if (status) {

                                            var dashStatus = checkDashboadExist(vd, verticalObj);
                                            if(dashStatus) {
                                                DASHBOARD_LIST.push(vd);
                                                vflag = true;

                                                verticalStr = verticalStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                                    '<a href="javascript:void(0)" onclick="loadDashboard(\'' + vd.id + '\')">' + iconStr +
                                                    '<span> ' + vd.name + '</span></a></li>';
                                            }
                                        }


                                        vcbk(null, null);

                                    });
                                }

                            }, function (err, result) {
                                if (vflag) {
                                    $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + verticalObj.verticalname + ' <small>' + verticalObj.version + '</small></li>')
                                    $(".sidenav ul").append(verticalStr);
                                }else{
                                    $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + verticalObj.verticalname + ' <small>' + verticalObj.version + '</small></li>')
                                    $(".sidenav ul").append(verticalStrFalse);
                                }

                                if($.trim($('#dashboardID').val()) !== '') {
                                    !dashExist ? loadDashboard($.trim($('#dashboardID').val()), false) : ''                                }

                            });


                        }else{
                            var liStr = '';

                            for(var i=0;i<verticalObj.dashboards.length;i++){
                                DASHBOARD_LIST.push(verticalObj.dashboards[i]);

                                var iconStr =  '';

                                if(verticalObj.dashboards[i].isimage){
                                    iconStr = '<img src="'+verticalObj.dashboards[i].imgpath+'" style="height: 18px;" />'
                                }else{
                                    iconStr = '<i class="' + verticalObj.dashboards[i].icon + '"></i> ';
                                }

                                liStr= liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                    '<a href="javascript:void(0)" onclick="loadDashboard(\'' + verticalObj.dashboards[i].id + '\')">'+iconStr +
                                    '<span> ' + verticalObj.dashboards[i].name + '</span></a></li>';
                            }

                            if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {
                                $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + verticalObj.verticalname + ' <small>' + verticalObj.version + '</small></li>')
                                $(".sidenav ul").append(liStr);
                            }

                            if($.trim($('#dashboardID').val()) !== '') {
                                !dashExist ? loadDashboard($.trim($('#dashboardID').val()), false) : ''                            }
                        }

                    });



                }

                /*for (var i = 0; i < vertical_list.length; i++) {


                    if (vertical_list[i].verticalid === qs('vertical')) {


                        verticalStr = verticalStr +' <li class="nav-header" style="color:#f79802">' + vertical_list[i].verticalname + ' <small>' + vertical_list[i].version + '</small></li>';

                        /!*for (var j = 0; j < vertical_list[i].dashboards.length; j++) {
                            var dash = vertical_list[i].dashboards[j];

                            DASHBOARD_LIST.push(dash);

                            verticalStr= verticalStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                '<a href="javascript:void(0)" onclick="loadDashboard(\'' + dash.id + '\')"><i class="' + dash.icon + '"></i>' +
                                '<span>' + dash.name + '</span></a></li>';
                        }*!/


                    }

                }

                $(".sidenav ul").append(verticalStr);
                */

            }
        })
    }else{
        $(".sidenav ul").append(dashboardStr);
    }



}

function loadEditor() {

    document.location = BASE_PATH+'/dashboard-editor?id='+CURRENT_DASHBOARD_ID

}

function getScreenshot(){
    // console.log(document.body)
    html2canvas(document.getElementById('page-container')).then(function(canvas) {
        var element = document.createElement('a');
        var dataURL = canvas.toDataURL("image/png");
        element.setAttribute('href', dataURL);
        element.setAttribute('download', 'screenshot-'+moment().format('MMDDYYYYHHmm'));
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });
}
