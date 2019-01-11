var query_id = null;
var query_name = null;
var query_list = [];
var queryEditor = null;
var resultEditor = null;


$(document).ready(function () {

    $('body').removeClass('bg-white');
    query_name = 'MESSAGE';
    loadMessageDef();
    loadqueryEditor();
    loadresultEditor('');

});

function loadIdList(id) {

    if (id === '1') {
        query_name = 'MESSAGE';
        loadMessageDef();
    }
    else if (id === '2')  {
        query_name = 'RECORD';
        loadRecordDef();
    }else{
        query_name = 'MODEL';
        loadModels();
    }

    $(".fields").html('')
    var keyName = query_name === 'MESSAGE' ? 'domainkey' : 'domainKey';

    var str = '';
    if(query_name !== 'MODEL'){
        str = '{"from":0,"size":10}'
    }else{
        str = '{"query":{"bool":{"must":[{"match":{"' + keyName + '":"' + DOMAIN_KEY + '"}}]}},"from":0,"size":10}'

    }

    queryEditor.setValue(js_beautify(str, {indent_size: 4}));
    queryEditor.clearSelection();
    queryEditor.focus();

}

function loadMessageDef() {

    $(".actionName").html('Message ID');

    $("#idList").html('<option value="">--- Choose ---</option>')

    listMessageSpec(1000, null, null, function (status, data) {

        query_list = data;

        for (var i = 0; i < data.length; i++) {


            $("#idList").append('<option value="' + data[i]['id'] + '">' + data[i]['id'] + ' - ' + data[i]['name'] + '</option>')
        }

    })


}


function loadRecordDef() {

    $(".actionName").html('Record ID');

    $("#idList").html('<option value="">--- Choose ---</option>')
    listRecordSpec(1000, null, null, function (status, data) {

        query_list = data;

        for (var i = 0; i < data.length; i++) {

            $("#idList").append('<option value="' + data[i]['id'] + '">' + data[i]['id'] + ' - ' + data[i]['name'] + '</option>')
        }


    })


}

function loadModels() {
    $(".actionName").html('Model');
    $("#idList").html('<option value="">--- Choose ---</option>')

    for (var i = 0; i < INDEX_MODELS.length; i++) {

        $("#idList").append('<option value="' + INDEX_MODELS[i] + '">' + INDEX_MODELS[i] + '</option>')
    }


}

function selectChange() {
    var tmpObj = {};
    $(".fields").html('');
    var str = '';
    var keyName = query_name === 'MESSAGE' ? 'domainkey' : 'domainKey';

    if(query_name !== 'MODEL') {

        for (var i = 0; i < query_list.length; i++) {
            if (Number($("#idList").val()) === query_list[i].id) {
                tmpObj = query_list[i];
            }
        }


        $(".fields").html('<hr><label style="color:#666;text-decoration: underline">' + tmpObj.id + ' - ' + tmpObj.name + '</label>');

        var str = '<ul style="list-style: none;margin: 0px;padding: 0px;">'

        for (var i = 0; i < tmpObj.fields.length; i++) {
            str = str + '<li style="padding:10px 0px;border-bottom: 1px dashed #eee"><label>' + tmpObj.fields[i].name + '</label> - <small>' + tmpObj.fields[i].dataType + '</small></li>';
        }

        str = str + '</ul>';

        $(".fields").append(str);

        str = '{"from":0,"size":10}'

    }else{


        str = '{"query":{"bool":{"must":[{"match":{"' + keyName + '":"' + DOMAIN_KEY + '"}}]}},"from":0,"size":10}'

    }



    queryEditor.setValue(js_beautify(str, {indent_size: 4}));
    queryEditor.clearSelection();
    queryEditor.focus();

}


function loadqueryEditor() {

    if (queryEditor) {
        queryEditor.destroy();
        // return false;
    }


    $("#queryEditor").html("");

    queryEditor = ace.edit("queryEditor");
    queryEditor.setTheme("ace/theme/eclipse");
    queryEditor.session.setMode("ace/mode/json");
    queryEditor.getSession().setUseWrapMode(true);

    queryEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    queryEditor.setOptions({
        enableBasicAutocompletion: false,
        enableSnippets: false,
        enableLiveAutocompletion: false,
    });

    var keyName = query_name === 'MESSAGE' ? 'domainkey' : 'domainKey';
    var str = '';
    if(query_name !== 'MODEL'){
        str = '{"from":0,"size":10}'
    }else{
        str = '{"query":{"bool":{"must":[{"match":{"' + keyName + '":"' + DOMAIN_KEY + '"}}]}},"from":0,"size":10}'

    }


    queryEditor.setValue(js_beautify(str, {indent_size: 4}));
    queryEditor.clearSelection();
    queryEditor.focus();


    $('#queryEditor').css('height',$(window).height()-350);


    queryEditor.resize();


    queryEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-Enter',
            mac: 'Command-Enter',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {



            executeQuery()
        }
    });


}

function executeQuery() {

    var json = queryEditor.getSession().getValue();


    if ($.trim(json) && $("#idList").val()) {


        if (isJSON(json)) {

            var startTime = new Date().getTime();

            $(".loadingText").html('<i class="fa fa-spinner fa-spin"></i> processing...');

            var searchQuery = {
                "method": 'GET',
                "extraPath": "",
                "query": json,
                "params": []
            };

            var id = query_name === 'MODEL' ? '' : $("#idList").val();
            var type = query_name === 'MODEL' ? $("#idList").val() : query_name;

            searchByQuery(id, type, searchQuery, function (status, data) {

                if (status) {

                    if (data.httpCode === 200) {

                        // var arrayData = JSON.parse(data.result);

                        resultEditor.setValue(js_beautify(data.result, {indent_size: 4})) // moves cursor to the start


                    } else {
                        errorMsg('Error in Execution')

                    }


                } else {
                    console.log(data)
                    errorMsg('Error in Execution')
                    resultEditor.setValue(js_beautify(data.responseText, {indent_size: 4})) // moves cursor to the start
                }

                $(".loadingText").html('processed in <b>' + (new Date().getTime() - startTime) + 'ms</b>');

            });


        } else {
            errorMsg('Invalid JSON Query');


        }

    } else {
        errorMsg('Required Fields cannot be empty')
    }
}


function loadresultEditor(code) {

    if (resultEditor) {
        resultEditor.destroy();
    }

    $("#resultEditor").html("");

    resultEditor = ace.edit("resultEditor");
    resultEditor.setTheme("ace/theme/eclipse");
    resultEditor.session.setMode("ace/mode/json");
    resultEditor.getSession().setUseWrapMode(true);

    resultEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    resultEditor.setOptions({
        enableBasicAutocompletion: false,
        enableSnippets: false,
        enableLiveAutocompletion: false,
    });
    resultEditor.setReadOnly(true);  // false to make it editable

    resultEditor.setValue(code);
    resultEditor.clearSelection();


    $('#resultEditor').height(($(window).height() - 250) + 'px');
    $('.fields').height(($(window).height() - 250) + 'px');

    resultEditor.resize();

}