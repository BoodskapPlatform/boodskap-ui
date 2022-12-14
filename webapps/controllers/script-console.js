
$(".consoleBody").height($(window).height() - 70 + 'px')

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
var commandsList = [];
var scriptTerminal = null;

var codeEditor = null;


$(document).ready(function () {

    $(".rightSide").height($(window).height() + 'px')
    $(".classFolder").css('height', $(".rightSide").height() - 355)

    // $(".editorBlock").height($(window).height() + 'px')
    // initiateEditor();

    mqttConnect();
    loadTerminal();
    loadCodeType();
});

function mqttListen() {
    if (MQTT_STATUS) {
        console.log(new Date + ' | MQTT Started to Subscribe');
        mqttSubscribe("/" + USER_OBJ.domainKey + "/log/#", 0);
        mqtt_client.onMessageArrived = function (message) {

            console.log("mqtt_client ============> Connected!!!!!!!");
            console.log(message);

            var parsedData = JSON.parse(message.payloadString);
            var topicName = message.destinationName;

            var nodeClass = new Date().getTime();
            var color = 'default';

            // console.log("parsedData =>",parsedData)

            if (parsedData.data === '__ALL_DONE__') {

                // console.log("parsedData =>",parsedData)
                // console.log($(".terminal-wrapper").height())

                // $('#scriptTerminal').animate({
                //     scrollTop: $(".terminal-wrapper").height()
                // }, 100);

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


                    $(".console_" + parsedData.session).append("<h4 class='font-small-2 titleText'>" + (objData.title ? objData.title : "") + "</h4> " +
                        "<span style='white-space: pre-wrap;display: block;'>/***************************************</span>" +
                        "<span style='white-space: pre-wrap;display: block;line-height:20px;margin:5px 0px;'>" + objData.help + "</span>" +
                        "<span style='white-space: pre-wrap;display: block;'>***************************************/</span>" +
                        "<h4 class='font-small-2 subTitleText'>" + (objData.signature ? objData.signature : "") + "</h4>" +
                        htmlStr);

                    $('#scriptTerminal').animate({
                        scrollTop: $(".terminal-wrapper").height()
                    }, 1);

                } else {
                    $(".console_" + parsedData.session).append("<span class='label label-" + (parsedData.level ? logLevels[parsedData.level] : color) + "' " +
                        "style='display: inline-block;margin: 5px 0px;text-transform: uppercase;'>" + parsedData.level + "</span>  " +
                        "<b>" + moment(parsedData.stamp).format('MM/DD/YYYY hh:mm:ss a') + "</b> " +
                        "<span style='white-space: pre-wrap;display: block;border-left: 1px solid #eeeeee38;padding-left: 3px;'>" + parsedData.data + "</span><br>");

                    $('#scriptTerminal').animate({
                        scrollTop: $(".terminal-wrapper").height()
                    }, 1);

                }
            }


        };

    }

}


function loadTerminal() {


    scriptTerminal = $('#scriptTerminal').terminal(function (command, term) {
        if (command !== '') {

            if (command) {

                if (command.toUpperCase() === 'CLR' || command.toUpperCase() === 'CLEAR') {
                    commandsList = [];
                } else {

                    commandsList.push(command);
                }
            }

        } else {
            this.echo('');
        }
    }, {
        greetings: '&nbsp;&nbsp;&nbsp;&nbsp;(           (         )\n' +
            '&nbsp;( )/          )/ )   ( /(    )\n' +
            '&nbsp;)((_) (   (  (()/((  )/())( /( `  )   \n' +
            '((_)_  )/  )/  ((_))/((_)/ )(_))/(/(   \n' +
            '| _ )((_)((_) _| |(_) |(_)(_)_((_)_/  \n' +
            '| _ / _ / _ / _` (_-< / // _` | `_  ) \n' +
            '|___/___/___/__,_/__/_/_//__,_| .__/  \n' +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|_|    \n' +
            'Welcome To https://Boodskap.io Terminal',
        name: 'Boodskap Terminal',
        resize: function (e, ui) {

        },
        height: $(".consoleBody").height() - 30,
        prompt: '> ',
        memory: false,
        keydown: function (event, term) {

            var self = this;

            if (event.ctrlKey && event.keyCode === 86) {
                console.log(term)
            }


            if (event.ctrlKey && event.keyCode === 13) {

                console.log("commandsList--------------------1");    
                console.log(commandsList);    

                if (commandsList.length > 0) {
                    var id = guid();

                    var cmdObj = {
                        code: commandsList.join('\n'),
                        sessionId: id
                    };

                    // console.log("cmdObj =>",cmdObj);
                    /*
                    console.log('<div class="log_'+id+'">' + moment().format("MM/DD/YYYY hh:mm a") +
                        " | Command executed successfully </div><div class='console_loader_" + id + "'>" +
                        '<i class="fa fa-spinner fa-spin"></i> waiting for command response</div><div class="console_' + id + '"></div>')
                        */


                    commandsList = [];

                    if (cmdObj.code.includes('boodskap install')) {

                        if(API_BASE_PATH.includes(MARKETPLACE_API_URL)){
                            errorMsg('Widget already installed. Go to the widgets library.')
                            return false;
                        }

                        this.echo('<div class="log_' + id + '">' + moment().format("MM/DD/YYYY hh:mm a") +
                            " | widget installation request initiated </div><div class='console_" + id + "'></div><div class='console_loader_" + id + " text-info'>" +
                            '<i class="fa fa-spinner fa-spin"></i> waiting for response</div>', {raw: true});
                        var wid = cmdObj.code.split(" ")[3];

                        getWidgetFromMarketplace(wid, function (status, result) {
                            if (status) {
                                if (result.status && result.result) {
                                    var widgetObj = result.result;

                                    $(".console_loader_" + id).html('<i class="fa fa-spinner fa-spin"></i> Importing widget data...')

                                    widgetObj.clientDomainKey = DOMAIN_KEY;
                                    widgetObj.domainKey = DOMAIN_KEY;
                                    // widgetObj.code = guid();

                                    delete widgetObj._id;

                                    widgetObj['marketplace'] = 'yes';



                                    //importing code
                                    var data = {
                                        data: widgetObj.code_obj
                                    };

                                    insertGlobalProperty(data, function (status, data) {
                                        $(".console_loader_" + id).html('<i class="fa fa-spinner fa-spin></i> "+Installing widget data...')
                                        if (status) {
                                            widgetObj.code = data.id;

                                            upsertWidget(widgetObj, function (status, data) {
                                                if (status) {
                                                    $(".console_loader_" + id).html('Widget installed successfully!')

                                                    successMsg('Widget installed successfully!');

                                                } else {
                                                    $(".console_loader_" + id).removeClass('text-info')
                                                    $(".console_loader_" + id).addClass('text-danger')
                                                    $(".console_loader_" + id).html('Error in Widget Installation')
                                                    errorMsg('Error in Widget Installation!')
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

                            } else {
                                $(".console_loader_" + id).removeClass('text-info')
                                $(".console_loader_" + id).addClass('text-danger')
                                $(".console_loader_" + id).html('Widget not found (or) invalid widget id!')
                            }
                        })
                    } else {

                        console.log("cmdObj--------------------2");    
                        console.log(cmdObj);   

                        this.echo('<div class="log_' + id + '">' + moment().format("MM/DD/YYYY hh:mm a") +
                            " | Command executed successfully </div><div class='console_" + id + "'></div><div class='console_loader_" + id + " text-info'>" +
                            '<i class="fa fa-spinner fa-spin"></i> waiting for command response</div>', {raw: true});
                        executeConsoleScript(cmdObj, function (status, data) {

                            console.log("executeConsoleScript----------------res----3");    
                            console.log(status); 
                            console.log(data); 

                            if (status) {
                                // console.log(data)
                            } else {
                                self.echo("<span class='red'>" + moment().format("MM/DD/YYYY hh:mm a") + " | Error in command execution 1</span>");
                            }

                        });
                    }


                } else {
                    this.echo('no commands to execute');
                }
            }


        }
    });
}


function executeCommand() {
    if (commandsList.length > 0) {
        var id = guid();

        var cmdObj = {
            code: commandsList.join('\n'),
            sessionId: id
        };

        scriptTerminal.echo('<div class="log_' + id + '">' + moment().format("MM/DD/YYYY hh:mm a") +
            " | Command executed successfully </div><div class='console_" + id + "'></div><div class='console_loader_" + id + " text-info'>" +
            '<i class="fa fa-spinner fa-spin"></i> waiting for command response</div>', {raw: true});

        commandsList = [];
        executeConsoleScript(cmdObj, function (status, data) {
            if (status) {
                console.log(data)
            } else {
                scriptTerminal.echo("<span class='red'>" + moment().format("MM/DD/YYYY hh:mm a") + " | Error in command execution 2</span>");
            }

        });


    } else {
        scriptTerminal.echo('no commands to execute');
    }
}

//Dynamic UUID Generator
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}


function resizePanel() {
    if ($(".rightSide").hasClass('rshow')) {
        $(".rightSide").removeClass('rshow')
        $(".rightSide").css('width', '0px');
        $("#btnMax").html('<i class="icon-eye4"></i> Show Class')

        // $(".btnExec").css('width', '100%')
        $("#section").css('width', '96%')
        $("#codeEditor").css('width', '100%');
        codeEditor.resize();

        $("#consoleBox").css('width', '100%')
    } else {
        $(".rightSide").addClass('rshow')
        $(".rightSide").css('width', '25%')
        $("#btnMax").html('<i class="icon-eye-slash"></i> Hide Class')
       
        $("#codeEditor").css('width', '100%')
        $("#section").css('width', '75%')

        $("#consoleBox").css('width', '100%')
        codeEditor.resize();
        
        //  $(".btnExec").css('width', '10%')

       
    }
}


function showEditor() {
    if ($(".editorBlock").hasClass('rshow')) {
        $(".editorBlock").removeClass('rshow')
        $(".editorBlock").css('width', '0px');
        $("#btnEditor").html('<i class="icon-eye4"></i> Show Editor');
        $("#btnExec").show();
        
        

    } else {
        $(".editorBlock").addClass('rshow')
        $(".editorBlock").css('width', '100%')
        $("#btnEditor").html('<i class="icon-eye-slash"></i> Hide Editor');


        var consoleText = codeEditor ? codeEditor.getSession().getValue() : '';

        initiateEditor(consoleText)
        $("#btnExec").hide();
    }
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

    if (searchType === 'GROOVY') {
        queryParams.query['bool']['must'].push({match: {isPublic: false}})
        queryParams.query['bool']['must'].push(domainKeyJson)
    } else {
        queryParams.query['bool']['must'].push({match: {isPublic: true}})
    }


    var searchQuery = {
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

        var dataList = [];
        if (status) {

            var resultData = QueryFormatter(res).data;
            dataList = resultData['data'];
        }

        if (dataList.length > 0) {
            if (codeType === 'CLASS') {


                for (var i = 0; i < dataList.length; i++) {


                    for (var j = 0; j < dataList[i].classes.length; j++) {
                        dataList[i].classes[j]['code'] = dataList[i].code;
                        dataList[i].classes[j]['_id'] = dataList[i]._id;
                        dataList[i].classes[j]['packageName'] = dataList[i].packageName;
                        dataList[i].classes[j]['domainKey'] = dataList[i].domainKey;
                    }

                }


                var pList = _.groupBy(dataList, 'packageName');

                var dpList = _.pluck(dataList, 'packageName');

                dpList = _.uniq(dpList);


                var resList = [];

                for (var i = 0; i < dpList.length; i++) {


                    var obj = pList[dpList[i]];


                    var classes = [];
                    var deleteFlag = false;

                    for (var j = 0; j < obj.length; j++) {

                        for (var k = 0; k < obj[j].classes.length; k++) {
                            classes.push(obj[j].classes[k])
                        }
                    }

                    resList.push({domainKey:obj[i].domainKey, packageName: dpList[i], classes: classes, _id: guid(),flag:deleteFlag});

                }

                $(".classFolder").html('<div id="groovy_tree" style=""></div>');
                loadGroovyTreeMenu(resList);
            } else {
                $(".classFolder").html('<div id="jar_tree" style=""></div>');
                loadJarTreeMenu(dataList);
            }
        } else {
            $(".classFolder").html('<p><small>No Data Available!</small></p>');
        }


    })


}

function clearCmd() {
    $("#codeEditor").val('');
}


function initiateEditor(code) {
    if (codeEditor) {
        codeEditor.destroy();
    }

    $("#codeEditor").html("");

    codeEditor = ace.edit("codeEditor");


    // codeEditor.setTheme("ace/theme/monokai");
    codeEditor.setTheme("ace/theme/solarized_light");
    // codeEditor.setTheme("ace/theme/eclipse");
    // codeEditor.setTheme("ace/theme/tomorrow_night");
    codeEditor.session.setMode("ace/mode/groovy");
    codeEditor.getSession().setUseWrapMode(true);
    codeEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    codeEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });

    langTools.setCompleters([langTools.snippetCompleter])

    codeEditor.setValue(code);
    codeEditor.clearSelection();


    $('#codeEditor').height(Math.round($(window).height() - ($(window).height() /1.8)) + 'px');

    $("#consoleBox").css('height', Math.round($("#codeEditor").height() - ($("#codeEditor").height() /1.5)) + 'px')

    codeEditor.resize();
}


function executeScriptCommand() {
    var id = guid();

    var consoleText = codeEditor.getSession().getValue();

    if ($.trim(consoleText) !== '') {

        var cmdObj = {
            code: consoleText,
            sessionId: id
        };

        $("#consoleBox").html('<div class="log_' + id + '">' + moment().format("MM/DD/YYYY hh:mm a") +
            " | Command executed successfully </div><div class='console_" + id + "'></div><div class='console_loader_" + id + " text-info'>" +
            '<i class="fa fa-spinner fa-spin"></i> waiting for command response</div>', {raw: true});

        executeConsoleScript(cmdObj, function (status, data) {

            console.log("executeConsoleScript-----------------1");
            console.log(status);
            console.log(data);

            if (status) {
                console.log(data)
            } else {
                $("#consoleBox").html("<span class='red'>" + moment().format("MM/DD/YYYY hh:mm a") + " | Error in command execution 3</span>");
            }

        });
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
                            <input type="file" class="form-control input-sm choose" id="class_file />
                            <span style="color:red" id="ones"></span>
                            <span style="color:red;" id="file1"></span>
                            
                        </div>
                       
                    </div>`;


    } else if (id === 'JAR') {
        template = `<div  class="col-md-6">
                        <div  class="form-group">
                            <label  class="inputLabel">Name</label>
                            <input type="text" class="form-control input-sm text" id="class_name"  />
                            <span style="color:red" id="name_error"></span>
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
                            <input type="file" class="form-control input-sm filetwo" id="class_file" />
                            <span style="color:red" id="file_error2"></span>
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

        if (ADMIN_ACCESS) {
            isPublic = $("input[name='fileType']:checked").val() === 'PUBLIC_GROOVY' ? true : false;

        }

        uploadClass(1, isPublic, isOpen, null);
    } else {
        var isPublic = false; //$("#class_public").is(":checked");
        var jarName = $("#class_name").val();

        if (ADMIN_ACCESS) {
            isPublic = $("input[name='fileType']:checked").val() === 'PUBLIC_GROOVY' ? true : false;

        }


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


function validation(){
    if($(".select").val()==""){
        $("#error").text("Please select an item in the list")
        $(".select").css('border-color','red')
       
        setTimeout(function(){
            $("#error").text("")
            $(".select").css('border-color','')
        
          
        },2000);
        
       

    } else{
     
       
 }
 if($(".filetwo").val()===""){
    $("#file_error2").text("Please select a file")
        $(".filetwo").css('border-color','red')
       
        setTimeout(function(){
            $("#file_error2").text("")
        $(".filetwo").css('border-color','')
    
        },2000);
       


   }else{
    
 

   }


 if($(".text").val()===""){
    $("#name_error").text("Please fill out this field")
        $(".text").css('border-color','red')
       
        setTimeout(function(){
            $("#name_error").text("")
        $(".text").css('border-color','')
    
        },2000);
       


   }else{
   }

  
   if($(".choose").val()===""){
    $("#file1").text("Please select a file")
        $(".choose").css('border-color','red')
       
        setTimeout(function(){
            $("#file1").text("")
        $(".choose").css('border-color','')
    
        },2000);
      

   }else{
 

   }

  
 



}


