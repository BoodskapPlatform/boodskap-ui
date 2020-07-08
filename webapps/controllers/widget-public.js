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

var CURRENT_WIDGET = {};


$(document).ready(function () {

    $("body").removeClass('bg-white');

    $(".dashboardBody").css('height', $(window).height() - 30)


    $("#header").remove();
    $(".footer").remove();
    $(".panel-heading").remove();

    $(".dashboardDIV").append('<a href="https://boodskap.io" target="_blank" style="position: absolute;right:0px;bottom: 0px">' +
        '<img src="/images/powered-by-boodskap.png" class="powered-by pull-right" style="height: 30px;"/></a>');


    getGlobalProperty(USER_OBJ.token, function (status, data) {
        if (status) {

            var resultData = JSON.parse(data.data);

            CURRENT_WIDGET = resultData;

            loadWidget();

        }
    })


});


function loadWidget() {


    var id = CURRENT_WIDGET.id;


    var htmlStr = `
                <iframe id="f_` + id + `" style="width:100%;border:0px;height: 100%;overflow: hidden" onload="resizeIframe(this)"></iframe>
        `;

    var bgColor = CURRENT_WIDGET.widgetBgColor ? CURRENT_WIDGET.widgetBgColor : DEFAULT_THEME.panelHeaderBg;
    var txtColor = CURRENT_WIDGET.widgetTextColor ? CURRENT_WIDGET.widgetTextColor : '#fff';


    if (CURRENT_WIDGET.widgetTitle) {
        var widgetHeight = $(".dashboardBody").height() - 40;
        htmlStr = '<div class="panel panel-inverse col-lg-12" style="padding:0px;margin:0px;">' +
            '<div class="panel-heading" style="background-color: ' + bgColor + ';">' +
            '<h4 class="panel-title" style="color:' + txtColor + '">' + CURRENT_WIDGET.widgetTitle + '</h4>' +
            '</div>' +
            '<div class="panel-body" style="padding:3px;border: 1px solid #6d6d6d57;overflow: hidden;overflow-x: hidden;height:' + widgetHeight + 'px">' +
            htmlStr +
            '</div>' +
            '</div>';
    } else {
        var widgetHeight = $(".dashboardBody").height() - 5;
        htmlStr = '<div style="height:' + widgetHeight + 'px">' + htmlStr + '</div>'
    }


    $(".dashboardBody").html(htmlStr)


    loadWidgetIFrame(CURRENT_WIDGET);

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


    body.html('<style>body{overflow: auto}' + cssCode + '</style>' +
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

