var query_id = null;
var query_name = null;
var query_list = [];
var queryEditor = null;
var resultEditor = null;


var defaultQuery = {
    'MODEL' : '{"query":{"bool":{"must":[{"match":{"domainKey":"' + DOMAIN_KEY + '"}}]}},"from":0,"size":10}',
    'MESSAGE' : '{"from":0,"size":10}',
    'RECORD' : '{"from":0,"size":10}'
}

$(document).ready(function () {

    defaultQuery = Cookies.get('bdskap_elk') ? JSON.parse(Cookies.get('bdskap_elk')) : defaultQuery;


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

    var str = defaultQuery[query_name]

    queryEditor.setValue(js_beautify(str, {indent_size: 4}));
    queryEditor.clearSelection();
    queryEditor.focus();

}

function loadMessageDef() {

    $(".actionName").html('Message Id');

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

            $("#idList").append('<option  value="' + data[i]['id'] + '">' + data[i]['id'] + ' - ' + data[i]['name'] + '</option>')
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
      if(query_name !== 'MODEL') {

          for (var i = 0; i < query_list.length; i++) {
              if (Number($("#idList").val()) === query_list[i].id || $("#idList").val() === query_list[i].id) {
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

      }
    var str = defaultQuery[query_name]

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
    // var langTools = ace.require("ace/ext/language_tools");


    ace.config.loadModule("ace/ext/language_tools", function() {
        queryEditor.setOptions({
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false
        });

        var snippetManager = ace.require("ace/snippets").snippetManager;
        var config = ace.require("ace/config");

        ace.config.loadModule("ace/snippets/json", function(m) {
            if (m) {
                m.snippets = ELASTIC_SNIPPET.sort();
                snippetManager.register(m.snippets, m.scope);
            }
        });

    });

    var str = defaultQuery[query_name];

    queryEditor.setValue(js_beautify(str, {indent_size: 4}));
    queryEditor.clearSelection();
    queryEditor.focus();


    $('#queryEditor').css('height',$(window).height()-335);

    $('#messageData').css('height',$(window).height()-230).resize();
    $('#sideBorder').css('height',$(window).height()-230).resize();

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

    var getText = queryEditor.getSession().getValue();

    var json = queryEditor.getSelectedText()

    defaultQuery[query_name]=getText;

    Cookies.set('bdskap_elk',defaultQuery)


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

                        resultEditor.setValue(js_beautify(data.result, {indent_size: 4})) // moves cursor to the start

                    } else {
                        errorMsg('Error in Execution')

                    }

                } else {
                    errorMsg('Error in Execution')
                    resultEditor.setValue(js_beautify(data.responseText, {indent_size: 4})) // moves cursor to the start
                }

                $(".loadingText").html('processed in <b>' + (new Date().getTime() - startTime) + 'ms</b>');

            });

        } else {
            errorMsg(style="background-color"+'Invalid JSON Query');
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
   
   
    resultEditor.resize();

}


var ELASTIC_SNIPPET = [
    {
        name: 'query sort',
        tabTrigger: 'es-sort',
        content: '{"sort":[{"${1:fieldName}" : {"order": "${2:value}"}}],"from":0,"size":10}'
    },
    {
        name: 'query term',
        tabTrigger: 'es-term',
        content: '{"term:"{"${1:fieldName}:"${2:value}"}'
    },
    {
        name: 'query terms',
        tabTrigger: 'es-terms',
        content: '{"terms:"{"${1:fieldName}:"[$2,"$3]"}'
    },
    {
        name: 'query range',
        tabTrigger: 'es-range',
        content: '{"range:"{"${1:fieldName}:"{"gt:"$2,"lt:"$3"}}'
    },
    {
        name: 'query exists',
        tabTrigger: 'es-exists',
        content: '{"exists:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'query prefix',
        tabTrigger: 'es-prefix',
        content: '{"prefix:"{"${1:fieldName}:"${2:value}"}}'
    },
    {
        name: 'query prefix advanced',
        tabTrigger: 'es-prefix-adv',
        content: '{"prefix:"{"${1:fieldName}:"{"value:"${2:fieldValue},"boost:"${3:2.0}"}}'
    },
    {
        name: 'query wildcard',
        tabTrigger: 'es-wildcard',
        content: '{"wildcard:"{"${1:fieldName}:"${2:value}"}}'
    },
    {
        name: 'query wildcard advanced',
        tabTrigger: 'es-wildcard-adv',
        content: '{"wildcard:"{"${1:fieldName}:"{"value:"${2:fieldValue},"boost:"${3:2.0}"}}'
    },
    {
        name: 'query regexp',
        tabTrigger: 'es-regexp',
        content: '{"regexp:"{"${1:fieldName}:"${2:value}"}}'
    },
    {
        name: 'query regexp advanced',
        tabTrigger: 'es-regexp-adv',
        content: '{"regexp:"{"${1:fieldName}:"{"value:"${2:fieldValue},"boost:"${3:2.0},"flags:"${4:ALL}"}}'
    },
    {
        name: 'query fuzzy',
        tabTrigger: 'es-fuzzy',
        content: '{"fuzzy:"{"${1:fieldName}:"${2:value}"}}'
    },
    {
        name: 'query fuzzy advanced',
        tabTrigger: 'es-fuzzy-adv',
        content: '{"fuzzy:"{"${1:fieldName}:"{"value:"${2:fieldValue},"boost:"${3:2.0},"fuzziness:"${4:2}"}}'
    },
    {
        name: 'query type',
        tabTrigger: 'es-type',
        content: '{"type:"{"value:"${1:mappingType}"}}'
    },
    {
        name: 'query ids',
        tabTrigger: 'es-ids',
        content: '{"ids:"{"type:"${1:mappingType},"values:"[$2,"$3]"}}'
    },
    {
        name: 'aggregations children',
        tabTrigger: 'es-agg-children',
        content: '{"children:"{"type:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations date histogram',
        tabTrigger: 'es-agg-date-histogram',
        content: '"{"date_histogram:"{"field:"${1:fieldName},"interval:"${2:month},"format:"${3:yyyy-MM-dd}"}"}'
    },
    {
        name: 'aggregations date range',
        tabTrigger: 'es-agg-date-range',
        content: '"{"date_range:"{"field:"${1:fieldName},"format:"${2:yyyy-MM-dd},"ranges:"["{"from:"${3:now-10M/M}"},"{"to:"${4:now-10M/M}"},"]"}"}'
    },
    {
        name: 'aggregations diversified sampler',
        tabTrigger: 'es-agg-div-sampler',
        content: '{"diversified_sampler:"{"type:"${1:fieldName},"shard_size:"${2:200}"}}'
    },
    {
        name: 'aggregations geo distance',
        tabTrigger: 'es-agg-geodistance',
        content: '"{"geo_distance:"{"field:"${1:fieldName},"origin:"${2:52.3760,"4.894},"ranges:"["{"from:"${3:100}"},"{"to:"${4:200}"},"]"}"}'
    },
    {
        name: 'aggregations geohash grid',
        tabTrigger: 'es-agg-geohash-grid',
        content: '{"geohash_grid:"{"field:"${1:fieldName},"precision:"${2:3}"}}'
    },
    {
        name: 'aggregations global',
        tabTrigger: 'es-agg-global',
        content: '{"global:"{}}'
    },
    {
        name: 'aggregations histogram',
        tabTrigger: 'es-agg-histogram',
        content: '{"histogram:"{"field:"${1:fieldName},"interval:"${2:50}"}}'
    },
    {
        name: 'aggregations IP range',
        tabTrigger: 'es-agg-iprange',
        content: '"{"ip_range:"{"field:"${1:fieldName},"ranges:"["{"from:"${2:10.0.0.5}"},"{"to:"${3:10.0.0.5}"},"]"}"}'
    },
    {
        name: 'aggregations missing',
        tabTrigger: 'es-agg-missing',
        content: '{"missing:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations nested',
        tabTrigger: 'es-agg-nested',
        content: '{"nested:"{"path:"${1:path}"}}'
    },
    {
        name: 'aggregations range',
        tabTrigger: 'es-agg-range',
        content: '"{"range:"{"field:"${1:fieldName},"ranges:"["{"from:"${2:50}"},"{"from:"${3:50},"to:"${4:100}"},"{"to:"${5:100}"},"]"}"}'
    },
    {
        name: 'aggregations reverse nested',
        tabTrigger: 'es-agg-reverse-nested',
        content: '{"reverse_nested:"{}}'
    },
    {
        name: 'aggregations significant terms',
        tabTrigger: 'es-agg-sig-terms',
        content: '{"significant_terms:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations terms',
        tabTrigger: 'es-agg-terms',
        content: '{"terms:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations average',
        tabTrigger: 'es-agg-avg',
        content: '{"avg:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations cardinality',
        tabTrigger: 'es-agg-cardinality',
        content: '{"cardinality:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations extended stats',
        tabTrigger: 'es-agg-extstats',
        content: '{"extended_stats:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations geo bounds',
        tabTrigger: 'es-agg-geobounds',
        content: '{"geo_bounds:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations geo centroid',
        tabTrigger: 'es-agg-geocentroid',
        content: '{"geo_centroid:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations max',
        tabTrigger: 'es-agg-max',
        content: '{"max:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations min',
        tabTrigger: 'es-agg-min',
        content: '{"min:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations percentiles',
        tabTrigger: 'es-agg-percentiles',
        content: '{"percentiles:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations percentiles ranks',
        tabTrigger: 'es-agg-percentiles-rank',
        content: '{"percentile_ranks:"{"field:"${1:fieldName},"values:"[${2}]"}}'
    },
    {
        name: 'aggregations scripted metric',
        tabTrigger: 'es-agg-scripted-metric',
        content: '"{"scripted_metric:"{"init_script:"${1:initScript},"map_script:"${2:mapScript},"combine_script:"${3:combineScript},"reduce_script:"${4:reduceScript}"}"}'
    },
    {
        name: 'aggregations stats',
        tabTrigger: 'es-agg-stats',
        content: '{"stats:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations sum',
        tabTrigger: 'es-agg-sum',
        content: '{"sum:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'aggregations top hits',
        tabTrigger: 'es-agg-top-hits',
        content: '"{"top_hits:"{"sort:"[{"${1:fieldName}:"{"order:"${2:desc}"}],"size:"${3:1}"}"}'
    },
    {
        name: 'aggregations value count',
        tabTrigger: 'es-agg-value-count',
        content: '{"value_count:"{"field:"${1:fieldName}"}}'
    },
    {
        name: 'script inline',
        tabTrigger: 'es-script-inline',
        content: '{"script:"{"inline:"$1,"lang:"${2:painless}"}}'
    }
]
