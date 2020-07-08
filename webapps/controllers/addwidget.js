var editorHeight = $(window).height()-130;
var widgetID = null;
var widgetImageID = null;
var widgetScreenID = null;
var codeID = null;
var widgetScreenshot = [];
var htmlEditor = null;
var jsEditor = null;
var cssEditor = null;
var jsList = [];
var cssList = [];
var widgetObj = {};
var asset_list = [];
var record_list = [];
var device_list = [];
var message_list = [];
var current_device_id = '';
var createdBy = (USER_OBJ.user.firstName ? USER_OBJ.user.firstName : 'Boodskap Admin') + (USER_OBJ.user.lastName ? ' ' + USER_OBJ.user.lastName : '');
var createdByEmail = USER_OBJ.user.email;
$(document).ready(function () {

    $("body").removeClass('bg-white');
    $(".resourceTab").css('height',editorHeight+'px');



    // $('#widgetCategory').html('<option value=""></option>');
    for (var i = 0; i < WIDGET_CATEGORY.length; i++) {
        $('#widgetCategory').append('<option value="' + WIDGET_CATEGORY[i] + '">' + WIDGET_CATEGORY[i] + '</option>');

    }

    $("#widgetCategory").select2({
        tags: true
    });

    if($.trim($("#widgetID").val()) === ""){
        widgetID = guid();
        $(".widgetVersion").html("1.0.0");
        $(".createdBy").html('<span><i class="icon-user"></i> ' + createdBy +
            '</span><br><span><i class="icon-envelop"></i> ' + createdByEmail + '</span>');
        $("#widgetVersion").val("1.0.0");
        $(".pageAction").html('Create');
    }else{
        widgetID = $.trim($("#widgetID").val());
        loadWidget();
        $(".pageAction").html('Edit');
    }

    $('#widgetTags').tagsinput({
        confirmKeys: [188]
    });

});


function loadWidget() {

    var queryParams = {
        query: {
            "bool": {
                "must": [{"match": {"domainKey": DOMAIN_KEY}}, {"match": {"widgetid": widgetID}}],
            }
        },
        size:1
    };

    var ajaxObj = {
        "method": "GET",
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    searchByQuery('','WIDGET',ajaxObj,function (status, data) {
        if(status){
            var result = QueryFormatter(data).data;
            widgetObj =result.data[0];
            if(DOMAIN_KEY !== widgetObj.domainKey){
                document.location = BASE_PATH+'/marketplace/addwidget'
            }
            loadWidgetPreview();
        }else{
            widgetID = guid();
            $(".widgetVersion").html("1.0.0");
            $(".createdBy").html('<span><i class="icon-user"></i> ' + createdBy +
                '</span><br><span><i class="icon-envelop"></i> ' + createdByEmail + '</span>');
            $("#widgetVersion").val("1.0.0");
        }
    })

    /*findByID(widgetID,type,function (status, data) {

        if(status){
            var result = QueryFormatter(data).data;
            data = result['_source'];
            data['_id'] = result['_id'];
            widgetObj = data;
            if(DOMAIN_KEY !== widgetObj.domainKey){
                document.location = BASE_PATH+'/marketplace/addwidget'
            }

            loadWidgetPreview();
        }else{
            widgetID = guid();
            $(".widgetVersion").html("1.0.0");
            $(".createdBy").html('<span><i class="icon-user"></i> ' + createdBy +
                '</span><br><span><i class="icon-envelop"></i> ' + createdByEmail + '</span>');
            $("#widgetVersion").val("1.0.0");
        }
    });*/
}



function loadWidgetPreview() {
    $("#widgetName").val(widgetObj.widgetname);
    $("#widgetCategory").val(widgetObj.category).trigger('change');
    $("#widgetDesc").val(widgetObj.description);
    $("#widgetVersion").val(widgetObj.version);

    createdBy = widgetObj.createdby;
    createdByEmail = widgetObj.createdbyemail;
    $(".createdBy").html('<span><i class="icon-user"></i> ' + createdBy +
        '</span><br><span><i class="icon-envelop"></i> ' + createdByEmail + '</span>');

    $(".createdTime").html(moment(widgetObj.createdtime).format('MM/DD/YYYY hh:mm a'))
    $(".updatedTime").html(moment(widgetObj.updatedtime).format('MM/DD/YYYY hh:mm a'))

    codeID = widgetObj.code;

    $(".widgetImage").attr('src', API_BASE_PATH + '/files/public/download/' + widgetObj.widgetimage);
    widgetImageID = widgetObj.widgetimage;

    for(var i=0;i<widgetObj.widgetscreens.length;i++){
        $(".widgetScreen" + (i+1)).attr('src', API_BASE_PATH + '/files/public/download/'+ widgetObj.widgetscreens[i])
    }

    widgetScreenshot = widgetObj.widgetscreens;

    var tags = widgetObj.tags.split(",");

    for(var i=0;i<tags.length;i++){
        $('#widgetTags').tagsinput('add',tags[i]);
    }

    $('input:radio[name="publishStatus"][value="'+widgetObj.published+'"]').prop('checked', true);

    var config = JSON.parse(widgetObj.config);
    $("#widgetAsset").prop('checked',config.asset.flag)
    $("#widgetDevice").prop('checked',config.device.flag)
    $("#widgetMessage").prop('checked',config.message.flag)

    if(config.device.flag){
        current_device_id = config.device.id;
        $("#deviceID").val(config.device.id)
    }


}



function uploadFile(file, type) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                if (type === 'image') {
                    widgetImageID = result.id;
                    $(".widgetImage").attr('src', API_BASE_PATH + '/files/public/download/' + widgetImageID)
                } else {
                    widgetScreenshot[widgetScreenID-1] = result.id;
                    $(".widgetScreen" + widgetScreenID).attr('src', API_BASE_PATH + '/files/public/download/' + result.id)
                    $(".widgetScreenshot" + widgetScreenID + " label").remove();
                }


            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token+'?ispublic=true', true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    xhr.send(formData);
}

function uploadImage() {

    var fileInput = document.getElementById("widgetImage");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    uploadFile(files[0], 'image');

}


function uploadScreenshot(id) {

    widgetScreenID = id;
    $("#widgetScreen").click();

}


function uploadScreen() {

    var fileInput = document.getElementById("widgetScreen");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    uploadFile(files[0], 'screen');

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


    $('#htmlEditor').height(editorHeight+'px');

    htmlEditor.resize();

    htmlEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {

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
            '// WIDGET_ID - to get current widget id\n' +
            '// USER_ID - to get user id (In public share this will be empty)\n\n' +
            '$(document).ready(function () {\n' +
            '//To start realtime time update\n' +
            'startLiveUpdate()\n' +
            '\n});\n\n' +
            '// for realtime update, call the initial method inside this function too\n' +
            'function liveUpdate(){ \n' +
            '\n\n}\n'+
            '';
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
        exec: function (env, args, request) {

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
        exec: function (env, args, request) {

            // console.log(cssEditor.getSession().getValue())

            var consoleText = cssEditor.getSession().getValue();

            codeLivePreview();

        }
    });
}

function openEditorModal() {

    $(".messageFields").html('');
    $(".recordFields").html('');

    $(".modal-content").css('width', $(window).width());
    $("#editorModal").modal({
        backdrop: 'static',
        keyboard: false
    });


    if($("#widgetName").val()){
        $(".widgetLiveTitle").html($("#widgetName").val())
    }else{
        $(".widgetLiveTitle").html('Untiled Widget')
    }

    $("#livePanel").css('height',(editorHeight+15)+'px')
    $("#livePanel").html('<h4 style="text-align: center;margin-top: 25%"><i class="fa fa-spinner fa-spin"></i> Loading...</h4>');


    $(".defaultJs").html('');
    for(var i=0;i<jsLink.length;i++){
        $(".defaultJs").append('<label><input type="checkbox" class="jsFiles" name=jsFiles[] value="'+jsLink[i]+'" checked> '+jsLink[i]+'</label><br>');
    }

    $(".defaultCss").html('');
    for(var i=0;i<cssLink.length;i++){
        $(".defaultCss").append('<label><input type="checkbox" class="cssFiles" name=cssFiles[] value="'+cssLink[i]+'" checked> '+cssLink[i]+'</label><br>');
    }

    if(codeID) {

        getGlobalProperty(codeID, function (status, data) {
            if(status){

                var resultData = JSON.parse(data.data);


                $("#jsResource").val(resultData.jsfiles.join("\n"));
                $("#cssResource").val(resultData.cssfiles.join("\n"));
                // $('input:radio[name="inbuildcss"][value="'+resultData.inbuildcss+'"]').prop('checked', true);
                // $('input:radio[name="inbuildjs"][value="'+resultData.inbuildjs+'"]').prop('checked', true);


                loadHtmlEditor(resultData.html);
                loadJsEditor(resultData.js);
                loadCssEditor(resultData.css);

                $('.jsFiles:checked').each(function () {
                    var val = $(this).val();
                    if(resultData.defaultjs.indexOf(val) !== -1){
                        $(this).attr('checked',true)
                    }else{
                        $(this).removeAttr('checked')
                    }
                });

                $('.cssFiles:checked').each(function () {
                    var val = $(this).val();
                    if(resultData.defaultcss.indexOf(val) !== -1){
                        $(this).prop('checked','checked')
                    }else{
                        $(this).removeAttr('checked')
                    }
                });


            }else{
                loadHtmlEditor('');
                loadJsEditor('');
                loadCssEditor('');
            }

            loadAssetList();
            loadMessageList();
            loadDeviceList('');
            loadRecordList();

            setTimeout(function () {
                codeLivePreview();
            },2000)
        })


    }else{
        jsList=[];
        cssList=[];

        $("#widgetAsset").prop('checked',false)
        $("#widgetDevice").prop('checked',true)
        $("#widgetMessage").prop('checked',true)
        $("#widgetRecord").prop('checked',false)

        $("#assetList").val('');
        current_device_id ='';
        $("#deviceID").val('')
        $("#messageList").val('');
        $("#recordList").val('');

        loadHtmlEditor('');
        loadJsEditor('');
        loadCssEditor('');

        loadAssetList();
        loadMessageList();
        loadDeviceList('');
        loadRecordList();

        setTimeout(function () {
            codeLivePreview();
        },2000)

    }


    // $(".defaultJs").html(jsLink.join("\n"))
    // $(".defaultCss").html(cssLink.join("\n"))


}

function loadRecordList() {
    $("#recordList").html("");
    listRecordSpec(1000,'','', function (status, data) {
        if (status && data.length > 0) {
            record_list = data;
            $("#recordList").html('<option value=""></option>');
            for (var i = 0; i < record_list.length; i++) {
                $("#recordList").append('<option value="' + record_list[i].id + '">' + record_list[i].id + ' | ' + record_list[i].name + '</option>');
            }

            $("#recordList").select2({
                dropdownParent: $("#editorModal")
            });

            if(widgetObj && widgetObj.config) {
                var config = typeof widgetObj.config === 'string' ? JSON.parse(widgetObj.config) : widgetObj.config;
                if (config.record) {
                    $("#widgetRecord").prop('checked', config.record.flag)
                    if (config.record.flag) {
                        $("#recordList").val(config.record.id).trigger('change');
                    }
                }
            }


        } else {
            record_list = [];
        }
    })
}

function loadAssetList() {
    $("#assetList").html("");
    getAssetList(1000, function (status, data) {
        if (status && data.length > 0) {
            asset_list = data;
            $("#assetList").html('<option value=""></option>');
            for (var i = 0; i < asset_list.length; i++) {
                $("#assetList").append('<option value="' + asset_list[i].id + '">' + asset_list[i].id + ' | ' + asset_list[i].name + '</option>');
            }

            $("#assetList").select2({
                dropdownParent: $("#editorModal")
            });
            if(widgetObj && widgetObj.config) {
                var config = typeof widgetObj.config === 'string' ? JSON.parse(widgetObj.config) : widgetObj.config;
                if (config.asset) {
                    $("#widgetAsset").prop('checked', config.asset.flag)
                    if (config.asset.flag) {
                        $("#assetList").val(config.asset.id).trigger('change');
                    }
                }
            }



        } else {
            asset_list = [];
        }
    })
}

function loadMessageList() {
    $("#messageList").html("");
    listMessageSpec(1000, null, null, function (status, data) {
        if (status && data.length > 0) {
            message_list = data;
            $("#messageList").html('<option value=""></option>');
            for (var i = 0; i < message_list.length; i++) {
                $("#messageList").append('<option value="' + message_list[i].id + '">' + message_list[i].id + ' | ' + message_list[i].name + '</option>');
            }

            $("#messageList").select2({
                dropdownParent: $("#editorModal")
            });

            if(widgetObj && widgetObj.config) {
                var config = typeof widgetObj.config === 'string' ? JSON.parse(widgetObj.config) : widgetObj.config;
                console.log(config)
                if (config.message) {
                    $("#widgetMessage").prop('checked', config.message.flag)
                    if (config.message.flag) {
                        $("#messageList").val(config.message.id).trigger('change');
                    }

                }
            }



        } else {
            message_list = [];
        }

    })
}

function loadDeviceList(searchText) {

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        "query": {
            "bool": {
                "must": []
            }
        },
        "size": 25,
        "sort": [{"reportedStamp": {"order": "desc"}}]
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

    searchDevice(searchQuery, function (status, res) {
        if (status) {

            var resultData = searchQueryFormatterNew(res).data;
            device_list = resultData['data'];

            for (var i = 0; i < device_list.length; i++) {
                $(".deviceListUl").append('<li class="deviceListLi" onclick="setDeviceId(\'' + device_list[i].id + '\')">' +
                    (device_list[i].name ? device_list[i].name : device_list[i].id) + ' | ' + device_list[i].modelId + ' | <b>' +
                    device_list[i].version +
                    '</b></li>');
            }

            if(!searchText) {
                if (widgetObj && widgetObj.config) {
                    var config = typeof widgetObj.config === 'string' ? JSON.parse(widgetObj.config) : widgetObj.config;
                    if (config.device) {
                        $("#widgetDevice").prop('checked', config.device.flag);
                        if (config.device.flag) {
                            current_device_id = config.device.id;
                            $("#deviceID").val(config.device.id);
                        }
                    }
                }
            }

        } else {
            device_list = []
        }


    })


}

function setDeviceId(id) {
    current_device_id = id;
    $("#deviceID").val(id)
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
        }

        return resultObj;

    } else {

        return resultObj;
    }

}


function codeLivePreview() {

    $("#livePanel").html('<iframe id="previewCode" style="width: 100%;height: 100%;border:0px;"></iframe>');

    var iframe = document.getElementById('previewCode');
    var iframedocument = iframe['contentWindow'].document;
    var head = iframedocument.getElementsByTagName("head")[0];


    var meta = document.createElement('meta');
    meta.httpEquiv = "X-UA-Compatible";
    meta.content = "IE=edge";
    head.appendChild(meta);

    var meta=document.createElement('meta');
    meta.name='viewport';
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.setAttribute('charset',"utf-8");
    head.appendChild(meta);

    var body = $("#previewCode").contents().find("body");

    var jsResource = $("#jsResource").val().split('\n');
    var cssResource = $("#cssResource").val().split('\n');

    var htmlStr = '';

    var inbuildcss = $("input[name='inbuildcss']:checked").val();
    var inbuildjs = $("input[name='inbuildjs']:checked").val();

    inbuildcss = inbuildcss === 'true' ? true : false;
    inbuildjs = inbuildjs === 'true' ? true : false;

    // console.log("inbuildcss =>",inbuildcss)
    // console.log("inbuildjs =>",inbuildjs)
    var widgetid = widgetObj ? widgetObj.widgetid : "W_"+new Date().getTime();
    var resultData =
        "var API_BASE_PATH='" + API_BASE_PATH + "';\n" +
        "var RECORD_ID='" + ($("#recordList").val() ? $("#recordList").val() : '') + "';\n" +
        "var DOMAIN_KEY='" + USER_OBJ.domainKey + "';\n" +
        "var API_KEY='" + USER_OBJ.apiKey + "';\n" +
        "var API_TOKEN='" + USER_OBJ.token + "';\n" +
        "var USER_ID='" + USER_OBJ.user.email + "';\n" +
        "var DEVICE_ID='" + (current_device_id ? current_device_id : '') + "';\n" +
        "var MESSAGE_ID='" + ($("#messageList").val() ? $("#messageList").val() : '') + "';\n" +
        "var ASSET_ID='" + ($("#assetList").val() ? $("#assetList").val() : '') + "';\n"+
        "var MQTT_CLIENT_ID='" + MQTT_CLIENT_ID + "';\n" +
        "var WIDGET_ID='"+widgetid+"';\n" +
        "var MQTT_CONFIG='" + JSON.stringify(MQTT_CONFIG) + "';\n";

    var cssCode = cssEditor.getSession().getValue();
    var htmlCode = htmlEditor.getSession().getValue();
    var jsCode = jsEditor.getSession().getValue();

    body.html('<style>' + cssCode + '</style><div>' + htmlCode + '</div><script>' + resultData + '</script>');

    var mqtt_file = 'js/boodskap.ws.js';
    var mqtt_adapter = 'resources/js/bdskp-live-adapter.js';

    jsResource.push(mqtt_file);
    jsResource.push(mqtt_adapter);

    var jsFiles = [];
    var cssFiles = [];
    var i = 0;
    $('.jsFiles:checked').each(function () {
        jsFiles[i++] = $(this).val();
    });

    var j = 0;
    $('.cssFiles:checked').each(function () {
        cssFiles[j++] = $(this).val();
    });

    jsFiles = _.compact(jsFiles);
    cssFiles = _.compact(cssFiles);



    async.mapSeries(cssFiles, function (file, callback) {

        // console.log('Enter FILE =>',file)

        if(inbuildcss) {
            var cssFile = iframedocument.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.setAttribute('href', CDN_PATH+'/css/' + file);
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
                };
            } else {  //Others
                cssFile.onload = function () {
                    // console.log('FILE =>',file)
                    callback(null, null);
                };
            }
        }else{
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
                    if (cssFile.readyState){  //IE
                        cssFile.onreadystatechange = function(){
                            if (s.readyState == "loaded" ||
                                s.readyState == "complete"){
                                s.onreadystatechange = null;
                                callback1(null,null);
                            }else{
                                callback1(null,null);
                            }
                        };
                    } else {  //Others
                        cssFile.onload = function(){

                            callback1(null,null);
                        };
                    }
            } else {
                callback1(null,null);
            }

        }, function (err, result) {

            async.mapSeries(jsFiles, function (file, callback2) {
                // console.log('Enter FILE =>',file)

                if(inbuildjs) {
                    var jsFile = iframedocument.createElement('script');
                    jsFile.setAttribute('type', 'text/javascript');
                    jsFile.setAttribute('src', CDN_PATH+'/js/' + file);
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
                }else{
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

                            if (jsFile.readyState){  //IE
                                jsFile.onreadystatechange = function(){
                                    if (s.readyState == "loaded" ||
                                        s.readyState == "complete"){
                                        s.onreadystatechange = null;
                                        callback3();
                                    }else{
                                        callback3();
                                    }
                                };
                            } else {  //Others
                                jsFile.onload = function(){
                                    callback3();
                                };
                            }

                    }
                    else {
                        callback3(null,null);
                    }
                }, function (err, result) {


                    body.append('<script>' + resultData + '</script><script>' + jsCode + '</script>');


                });

            });

        });
    });


}

function insertScript(doc, target, src, callback) {
    var s = doc.createElement("script");
    s.type = "text/javascript";
    if(callback) {
        if (s.readyState){  //IE
            s.onreadystatechange = function(){
                if (s.readyState == "loaded" ||
                    s.readyState == "complete"){
                    s.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            s.onload = function(){
                callback();
            };
        }
    }
    s.src = src;
    target.appendChild(s);
}



function saveCode() {
    var iframe = document.getElementById('previewCode');
    var finalHtml = $(iframe).contents().find("html").html();

    var cssCode = cssEditor.getSession().getValue();
    var htmlCode = htmlEditor.getSession().getValue();
    var jsCode = jsEditor.getSession().getValue();

    var jsFiles = [];
    var cssFiles = [];
    var i = 0;
    $('.jsFiles:checked').each(function () {
        jsFiles[i++] = $(this).val();
    });

    var j = 0;
    $('.cssFiles:checked').each(function () {
        cssFiles[j++] = $(this).val();
    });

    jsFiles = _.compact(jsFiles);
    cssFiles = _.compact(cssFiles);

    var obj = {
        html: htmlCode,
        js: jsCode,
        css: cssCode,
        code: finalHtml,
        defaultjs:jsFiles,
        defaultcss:cssFiles,
        jsfiles:$("#jsResource").val().split('\n'),
        cssfiles:$("#cssResource").val().split('\n'),
        inbuildcss:$("input[name='inbuildcss']:checked").val(),
        inbuildjs:$("input[name='inbuildjs']:checked").val()
    };

    var data = {
        data: JSON.stringify(obj)
    };

    if(codeID){
        updateGlobalProperty(data, codeID, function (status, data) {
            if(status){
                successMsg('Successfully Saved');
                $("#editorModal").modal('hide');
            }else{
                errorMsg('Error')
            }
        })
    }else{
        insertGlobalProperty(data, function (status, data) {
            if(status){
                codeID = data.id;
                successMsg('Successfully Saved');
                $("#editorModal").modal('hide');
            }else{
                errorMsg('Error')
            }
        })
    }


}


function createWidget() {

    widgetObj = {
        domainKey : DOMAIN_KEY,
        category: $("#widgetCategory").val(),
        tags: $("#widgetTags").val(),
        widgetid: widgetID,
        widgetname: $("#widgetName").val(),
        widgetimage: widgetImageID,
        widgetscreens: widgetScreenshot,
        version: $("#widgetVersion").val(),
        enabled: true,
        published: $("input[name='publishStatus']:checked").val() === 'true' ? true : false,
        code: widgetObj.code ? widgetObj.code : codeID,
        description : $("#widgetDesc").val(),
        createdby: createdBy,
        createdbyemail: createdByEmail,
        createdtime: widgetObj.createdtime ? widgetObj.createdtime : new Date().getTime(),
        updatedtime: new Date().getTime(),
        config : JSON.stringify({
            asset : {
                flag : $('#widgetAsset').is(':checked'),
                id : $("#assetList").val()
            },
            device : {
                flag : $('#widgetDevice').is(':checked'),
                id : $("#deviceID").val()
            },
            message : {
                flag : $('#widgetMessage').is(':checked'),
                id : $("#messageList").val()
            },
            record : {
                flag : $('#widgetRecord').is(':checked'),
                id : $("#recordList").val()
            }
        })

    };

    upsertWidget(widgetObj, function (status, data) {
        if(status){
            successMsg('Widget created/updated successfully!');
            // setTimeout(function () {
            //     document.location='BASE_PATH+/marketplace/widgets'
            // },2000)
        }else{
            errorMsg('Error in Widget Creation!')
        }
    });


}

function deleteWidget() {
   /* widgetObj['published'] = true;
    upsertWidget(widgetObj, function (status, data) {
        if(status){
            $(".publishStatus").html('<label class="label label-success">Published</label>')
            successMsg('Widget published successfully!')
        }else{
            $(".publishStatus").html('<label class="label label-danger">Not Published</label>')
            errorMsg('Error in Widget publish!')
        }
    });*/
}


function loadMsgFields() {
    var messageId = $('#messageList').val();

    for(var i=0;i<message_list.length;i++){
        if(Number(messageId) === message_list[i].id){
            var obj = [];
            for(var j=0;j<message_list[i].fields.length>0;j++){
                obj.push({fieldname:message_list[i].fields[j].name, type:message_list[i].fields[j].dataType})
            }
            $(".messageFields").html(JSON.stringify(obj))
        }
    }
}

function loadRecFields() {
    var recId = $('#recordList').val();

    for(var i=0;i<record_list.length;i++){
        if(Number(recId) === record_list[i].id){
            var obj = [];
            for(var j=0;j<record_list[i].fields.length>0;j++){
                obj.push({fieldname:record_list[i].fields[j].name, type:record_list[i].fields[j].dataType})
            }
            $(".recordFields").html(JSON.stringify(obj))
        }
    }
}