var queryEditor = null;
var resultEditor = null;


var defaultQuery = {
    'FIND' : '{"filter":{}}',
    'AGG' : '{"pipeline":[{}]}',
    'COUNT' : '{"filter":{}}'
}

$(document).ready(function () {

    defaultQuery = Cookies.get('bdskap_mongo') ? JSON.parse(Cookies.get('bdskap_mongo')) : defaultQuery;


    $('body').removeClass('bg-white');
    loadqueryEditor();
    loadresultEditor('');
    loadConnectionpool()

});



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
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });


    var str = defaultQuery[ $("#query_type").val()]

    queryEditor.setValue(js_beautify(str, {indent_size: 4}));
    queryEditor.clearSelection();
    queryEditor.focus();


    $('#queryEditor').height(($(window).height() - 250) + 'px');
    $('.dbTable').height(($(window).height() - 250) + 'px');

    queryEditor.resize();


    queryEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-Enter',
            mac: 'Command-Enter',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {


            var getText = queryEditor.getSession().getValue();


            defaultQuery[$("#query_type").val()]=getText;

            Cookies.set('bdskap_mongo',defaultQuery)


            executeQuery()
        }
    });


}

function executeQuery() {

    var query = queryEditor.getSession().getValue();


    if($("#pool_name").val() === ""){
        errorMsgBorder('Connection Pool cannot be empty', 'pool_name')
        return false
    }

    if($("#dbName").val() === ""){
        errorMsgBorder('Database name cannot be empty', 'dbName')
        return false
    }

    if($("#col_name").val() === ""){
        errorMsgBorder('Collection name cannot be empty', 'col_name')
        return false
    }

    if ($.trim(query)) {

        var q = query.toLowerCase();

            var startTime = new Date().getTime();

            $(".loadingText").html('<i class="fa fa-spinner fa-spin"></i> processing...');

            var searchQuery = {
                "pool": $("#pool_name").val()+'.'+$("#dbName").val(),
                "type": $("#query_type").val(),
                "query": query,
                "collection": $("#col_name").val()
            };
            executeMongoQuery(searchQuery, function (status, data) {

                if (status) {

                    resultEditor.setValue(js_beautify(JSON.stringify(data), {indent_size: 4})) // moves cursor to the start


                } else {

                    var error = data.responseJSON;


                    if(error && error.code === "MONGO_ACCESS_DENIED"){
                        errorMsg('No Mongo DB Access for this Domain. Contact Boodskap Support')
                    }else{
                        errorMsg('Error in Execution')
                    }

                    resultEditor.setValue(js_beautify(data.responseText, {indent_size: 4})) // moves cursor to the start

                }

                $(".loadingText").html('processed in <b>' + (new Date().getTime() - startTime) + 'ms</b>');

            });



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

    resultEditor.resize();

}


function loadDBTable() {

    var queryParams = {
        "query": {
            "bool": {
                "must": [
                    {
                        match: {domainKey: DOMAIN_KEY}
                    },
                    {
                        "multi_match": {
                            "query": $("#pool_name").val(),
                            "type": "phrase_prefix",
                            "fields": ["id"]
                        }
                    }
                ]
            }
        },
        "size": 100

    };

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    var verticalStr = '';

    searchByQuery('', 'DB_METADATA', searchQuery, function (status, data) {
        if(status){
            var result = QueryFormatter(data).data;
            var resultData = result.data;

            if(resultData.length > 0) {
                var resultData = result.data[0];

                $(".dbMetadata").html('')


                for (var i = 0; i < resultData.tables.length; i++) {
                    var table =  resultData.tables[i];
                    var str = '<tr><td>'+table.name+'<br><small>scheme: '+table.schema+'</small></td>' +
                        '<td><code>'+js_beautify(JSON.stringify(table.fields), {indent_size: 4})+'</code></td></tr>';

                    $(".dbMetadata").append(str);

                }

            }else{
                $(".dbMetadata").html('<tr><td colspan="2"><p style="text-align: center">No data found!</p></td></tr>')
            }
        }
    });


}

var connectionList = [];

function loadConnectionpool() {

    $(".pool_url").html('')
    if($("#pool_name").val() === ""){
        errorMsgBorder('Connection Pool cannot be empty', 'pool_name')
        return false
    }


    var queryParams = {
        "query": {
            "bool": {
                "must": [
                    {
                        match: {domainKey: DOMAIN_KEY}
                    }
                ]
            }
        },
        "size": 100

    };

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    var verticalStr = '';
    connectionList=[]
    searchByQuery('', 'MONGODB', searchQuery, function (status, data) {
        if(status){
            var result = QueryFormatter(data).data;
            var resultData = result.data;
            connectionList = resultData;
            $("#pool_name").html('<option value="">Choose Connection Pool</option>')
            for(var i=0;i<resultData.length;i++){
                $("#pool_name").append('<option value="'+resultData[i].name+'">'+resultData[i].name+'</option>')

            }

        }else{
            connectionList = []
        }
    });
}

function setConnection(val){
    $("#dbName").val('')
    $("#pool_url").html('')
    for(var i=0;i<connectionList.length;i++){
        if(val == connectionList[i].name){
            $("#pool_url").html(connectionList[i].url);
            $("#dbName").val(connectionList[i].database);
        }
    }
    if(val){
        listCollections(val);
    }
}

function resetEditor(){
    queryEditor.setValue("");
    queryEditor.clearSelection();

    resultEditor.setValue("");
    resultEditor.clearSelection();
}

function loadQueryType(val){

    queryEditor.setValue(js_beautify(defaultQuery[val], {indent_size: 4}));
    queryEditor.clearSelection();
    queryEditor.focus();
}

function listCollections(url){

    $("#col_name").val('')
    $.ajax({
        url: API_BASE_PATH + "/mongo/list/collections/" + API_TOKEN+'/'+url+'.'+$("#dbName").val(),
        contentType: "application/json",
        type: 'GET',
        success: function (data) {
            //called when successful

            if(data && data.length > 0){

                for(var i=0;i<data.length;i++){
                    $("#col_name").append('<option value="'+data[i]+'">'+data[i]+'</option>')
                }
            }

        },
        error: function (e) {
            //called when there is an error
            //console.log(e.message);
            errorMsg('No Collections found!');
        }
    });
}