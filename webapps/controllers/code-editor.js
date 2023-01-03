var groovy_class_list = [];
var jar_class_list = [];
var tabbar_list = [];

var codeEditor = null;
var CURRENT_ID = null;
var CURRENT_TYPE = null;
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

$(".barMenu").removeClass('active');
$(".menuEditor").addClass('active');
$(".mainwindow").css('min-height', $(window).height() - 90 + 'px');


$(document).ready(function () {

    boodskapEditor = true;


    setTimeout(function () {
        $(".loaderBlock").remove();
        $(".mainwindow").css('display', 'block');
        docLayout = $('.mainwindow').layout({
            applyDefaultStyles: true,
            north: {
                resizable: true
            },
            south: {
                size: 250,
                resizable: true,
                onclose_start: function () {
                },
                onclose_end: function () {
                    setTimeout(function () {
                        $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');
                        $(".classFolder").css('height', $(".rightSide").height() - 125)
                        codeEditor.resize();
                    }, 500);

                    // $(".consoleBox").height(($(".ui-layout-south").height()) + 'px')
                },
                onresize_end: function () {
                    setTimeout(function () {
                        $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');
                        $(".classFolder").css('height', $(".rightSide").height() - 125)

                        codeEditor.resize();
                    }, 500);
                    // $(".consoleBox").height(($(".ui-layout-south").height()) + 'px')
                }

            },
            east: {
                resizable: true,
                size: 300
            }
        });
        docLayout
            .bindButton('#consoleMax', 'toggle', 'east')
            .bindButton('#btnMax', 'toggle', 'east')
            .bindButton('#btnMax', 'toggle', 'south');

        setTimeout(function () {
            $(".loaderBlock").css('display', 'none');
            $(".classFolder").css('height', $(".rightSide").height() - 125)
            loadCodeType();
            loadDefaultTab();

        }, 500);


    }, 100);


});


function loadTabbar(id, type) {

    var str = '';

    console.log("id =>", id)
    console.log("type =>", type)

    if (_.indexOf(tabbar_list, id) === -1) {
        if (type === 1) {

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
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',1)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }
        else if (type === 2) {

            var obj = {};
            for (var i = 0; i < jar_class_list.length; i++) {
                if (id === jar_class_list[i]._id) {
                    obj = jar_class_list[i];
                }
            }

            str = '<li role="presentation" class="jarTab tabbar jarTab_' + id + '"  >' +
                '<a href="javascript:void(0)" aria-controls="home" role="tab" data-toggle="tab" onclick=loadJarClass(\'' + id + '\')>' + obj.packageName + ' ' +
                '<span style="display: inline-block;margin-left: 10px;cursor: pointer" onclick="deleteTab(\'' + id + '\',2)" title="close"><i class="fa fa-close"></i></span></a>' +
                '</li>';
        }

        tabbar_list.push(id);
        $(".editorBar").append(str);

    }

    $(".groovyTab").removeClass('active');
    $(".jarTab").removeClass('active');
    $(".domainTab").removeClass('active');

    var obj = {};

    if (type === 1) {
        loadGroovyClass(id);
        $(".groovyTab_" + id).addClass('active');
    }
    else if (type === 2) {
        loadJarClass(id);
        $(".jarTab_" + id).addClass('active');
    }

    $('[data-toggle="tooltip"]').tooltip()

}

function deleteTab(id, type) {
    if (type === 1) {
        $(".groovyTab_" + id).remove();
    } else if (type === 2) {
        $(".jarTab_" + id).remove();
    }

    var temp = [];

    for (var i = 0; i < tabbar_list.length; i++) {

        if (id !== tabbar_list[i]) {
            temp.push(tabbar_list[i])
        }
    }

    tabbar_list = temp;
    console.log(temp)
    setTimeout(function () {
        $(".groovyTab").removeClass('active')
        $(".jarTab").removeClass('active')
        loadDefaultTab();
    }, 200);


}


function loadDefaultTab() {


    $("#editorContent").html('<div id="codeEditor"></div>');
    $("#codeEditor").html('');

    var str = CHANGED_DEFAULT_TEXT ? CHANGED_DEFAULT_TEXT : '//Welcome to Boodskap IoT Platform IDE\n\n//Keyboard Shortcuts\n \n//CTRL+S - Save the Code\n//CTRL+I - Compile the Code' +
        '\n\n//Copy & Paste your groovy code here';

    loadEdtior(str);
    CURRENT_ID = null;
    CURRENT_TYPE = 0;


}

function loadGroovyClass(id) {
    // mqttCancelSubscribe();

    $("#editorContent").html('<div id="codeEditor"></div>');
    $("#codeEditor").html('');

    var obj = {};
    for (var i = 0; i < groovy_class_list.length; i++) {
        for (var j = 0; j < groovy_class_list[i].classes.length; j++) {
            if (id === groovy_class_list[i].classes[j]._id) {
                obj = groovy_class_list[i].classes[j];
            }
        }
    }

    loadEdtior(obj.code, obj.isPublic);
    CURRENT_ID = id;
    CURRENT_TYPE = 1;


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

    loadEdtior(obj.code);
    CURRENT_ID = id;
    CURRENT_TYPE = 2;


}

function loadEdtior(code, isPublic) {

    editorChange = false;

    if (codeEditor) {
        codeEditor.destroy();
    }

    $("#codeEditor").html("");

    codeEditor = ace.edit("codeEditor");


    codeEditor.setTheme("ace/theme/monokai");
    // codeEditor.setTheme("ace/theme/solarized_light");
    // codeEditor.setTheme("ace/theme/eclipse");
    // codeEditor.setTheme("ace/theme/tomorrow_night");
    codeEditor.session.setMode("ace/mode/groovy");
    codeEditor.getSession().setUseWrapMode(true);
    codeEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    if (isPublic && !ADMIN_ACCESS) {

        codeEditor.setOptions({
            readOnly: true,
            highlightActiveLine: false,
            highlightGutterLine: false
        });


    } else {
        codeEditor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
        });
    }


    langTools.setCompleters([langTools.snippetCompleter])


    code ? codeEditor.setValue(code) : '';

    codeEditor.clearSelection();

    codeEditor.focus();
    var session = codeEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    codeEditor.gotoLine(count, session.getLine(count - 1).length);


    $('#codeEditor').height(($(".ui-layout-center").height() - 40) + 'px');

    codeEditor.resize();

    codeEditor.on("change", function (obj) {
        editorChange = true;
    });


    codeEditor.on("blur", function (obj) {
        if (editorChange) {
            editorChange = false;


            CHANGED_ID = CURRENT_ID;
            CHANGED_TYPE = CURRENT_TYPE;
            CHANGED_TEXT = codeEditor.getSession().getValue();


            if (CURRENT_TYPE === 0) {
                CHANGED_DEFAULT_TEXT = CHANGED_TEXT;
            }

            if (CURRENT_TYPE === 1) {

                var obj = {};
                for (var i = 0; i < groovy_class_list.length; i++) {
                    for (var j = 0; j < groovy_class_list[i].classes.length; j++) {
                        if (id === groovy_class_list[i].classes[j]._id) {
                            groovy_class_list[i].classes[j].code = CHANGED_TEXT;
                        }
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

            // console.log(codeEditor.getSession().getValue())

            var consoleText = codeEditor.getSession().getValue();


            if (CURRENT_TYPE === 0 || CURRENT_TYPE === 1) {

                var codeObj = {
                    content: consoleText
                };

                if (CURRENT_TYPE === 0) {

                    var fileType = $("input[name='fileType']:checked").val() === 'PUBLIC_GROOVY' ? true : false;

                    if(fileType){

                        if(ADMIN_ACCESS){
                            uploadGroovyScript(fileType, false, codeObj, function (status, data) {
                                if (status) {
                                    successMsg('Code Saved Successfully!')
                                    loadCodeType();
                                } else {
                                    successMsg('Error in saving code')
                                }
                            })
                        }else{
                            errorMsg("Public file can't be update / save");
                        }


                    }else{
                        uploadGroovyScript(fileType, false, codeObj, function (status, data) {
                            if (status) {
                                successMsg('Code Saved Successfully!')
                                loadCodeType();
                            } else {
                                successMsg('Error in saving code')
                            }
                        })
                    }


                } else {

                    uploadGroovyScript(isPublic, false, codeObj, function (status, data) {
                        if (status) {
                            successMsg('Code Saved Successfully!')
                            loadCodeType();
                        } else {
                            successMsg('Error in saving code')
                        }
                    })

                }


            } else {


            }
        }
    });

    codeEditor.commands.addCommand({
        name: 'compileFile',
        bindKey: {
            win: 'Ctrl-I',
            mac: 'Command-I',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {


            var consoleText = codeEditor.getSession().getValue();

            if (CURRENT_TYPE === 0 || CURRENT_TYPE === 1) {


                var codeObj = {
                    content: consoleText
                }

                groovyCompile(false, false, codeObj, function (status, data) {
                    if (status) {
                        successMsg('Compiled Successfully!')
                        $(".consoleOutput").append("<span style='color: #ffffff9c;font-family: monospace;font-size: 11px;display: block;margin: 5px 0px'> " +
                            "<span class='label label-success'>SUCCESS</span> | " + new Date() + " | Compilation Success </span>")

                        if (data.content) {
                            var outData = JSON.parse(data.content);
                            var displayData = {
                                packagename: outData.packageName,
                                code: outData.code,
                            };
                            $(".consoleOutput").append("<code style='display: block'>" + JSON.stringify(displayData) + "</code>")

                            $('.bottomSide').animate({
                                scrollTop: $(".consoleOutput").height()
                            }, 1000);
                        }

                    } else {
                        $(".consoleOutput").append("<span style='color: #ffffff9c;font-family: monospace;font-size: 11px;display: block;margin: 5px 0px'> " +
                            "<span class='label label-danger'>ERROR</span> | " + new Date() + " | Compilation Error </span>")

                        if (data.code && data.code === 'SERVER_ERROR') {
                            $(".consoleOutput").append("<code style='display: block'>" + data.message + "</code>")
                        } else {
                            $(".consoleOutput").append("<code style='display: block'>" + JSON.stringify(data) + "</code>")
                        }

                        $('.bottomSide').animate({
                            scrollTop: $(".consoleOutput").height()
                        }, 1000);

                        // $(".errorCode").html('');
                        // successMsg('Error in compilation');
                        // $(".errorCode").html(JSON.stringify(data));
                        // $("#errorModal").modal('show')


                    }
                })


            } else {


            }
        }
    });
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
        url = API_BASE_PATH + "/groovy/upload/script/file/" + API_TOKEN_ALT + "/" + ispublic + "/" + isopen;
    } else {
        url = API_BASE_PATH + "/groovy/upload/jar/" + API_TOKEN_ALT + "/" + ispublic + "/" + jarname;
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

    var typeFlag = searchType === 'GROOVY' ? false : true;


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
                        dataList[i].classes[j]['isPublic'] = typeFlag;
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

                    for (var j = 0; j < obj.length; j++) {
                        for (var k = 0; k < obj[j].classes.length; k++) {
                            classes.push(obj[j].classes[k])
                        }
                    }

                    resList.push({domainKey:obj[i].domainKey,packageName: dpList[i], classes: classes, _id: guid()});

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

