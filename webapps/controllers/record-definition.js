var recordTable = null;
var current_msg_id = null;
var MSG_FIELD_COUNT = 0;
var message_list = [];
var message_obj = {};
var jsEditor = null;



$(document).ready(function () {

    loadRecordDef();
    $('body').removeClass('bg-white')

    document.getElementById('importFile')
        .addEventListener('change', getImportFile)
});


function loadRecordDef() {


    if (recordTable) {
        recordTable.destroy();
        $("#recordTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Record Id'
        },
        {
            mData: 'name',
            sTitle: 'Record Name'
        },
        {
            mData: 'description',
            sTitle: 'Description',
            orderable : false,
        },
        {
            mData: 'fields',
            sTitle: 'Fields',
            orderable : false,
            mRender: function (data, type, row) {
                var str = '';
                for (var i = 0; i < data.length; i++) {
                    str = str + (i+1)+'] <b>'+data[i].name + '</b> : ' + data[i].dataType + '<br>';
                }
                return str;
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable : false,
            sWidth : '5%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openEditModal('+row['id']+')"><i class="icon-edit2"></i></button>'+
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openDeleteModal('+row['id']+')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];


    var tableOption = {
        responsive: true,
        paging: true,
        searching: true,
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        data: []
    };

    listRecordSpec(1000, null, null, function (status, data) {
        if (status && data.length > 0) {
            tableOption['data'] = data;
            $(".recordCount").html(data.length)
            message_list = data;
            createDownload();

        } else {
            $(".recordCount").html(0)
            message_list = [];

        }

        recordTable = $("#recordTable").DataTable(tableOption);
    })


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
            // data : _.pluck(records, '_source')
        }

        $(".deviceCount").html(totalRecords);


        return resultObj;

    } else {

        return resultObj;
    }

}



function openModal() {
    $(".modal-title").html("Define Record")
    MSG_FIELD_COUNT = 0;

    message_obj = {};

    $("#addMessageRule form")[0].reset();

    $("#msg_id").removeAttr('disabled');

    // $("#msg_id").attr('min',USER_OBJ.domain.startId)
    // $("#msg_id").attr('max',USER_OBJ.domain.startId+ID_RANGE_COUNT)

    $("#addMessageRule").modal({
        backdrop: 'static',
        keyboard: false
    });
    $(".msgFieldBody").html("");
    addMessageField();
}


function openEditModal(id) {
    $(".modal-title").html("Edit Record")
    MSG_FIELD_COUNT = 0;

    for(var i=0;i<message_list.length;i++){
        if(id === message_list[i].id){
            message_obj = message_list[i];
        }
    }

    $("#msg_id").val(message_obj.id)
    $("#msg_name").val(message_obj.name)
    $("#msg_desc").val(message_obj.description)

    // $("#msg_id").attr('min',USER_OBJ.domain.startId)
    // $("#msg_id").attr('max',USER_OBJ.domain.startId+ID_RANGE_COUNT)
    $("#msg_id").attr('disabled','disabled');

    $("#addMessageRule").modal({
        backdrop: 'static',
        keyboard: false
    });
    $(".msgFieldBody").html("");

    for (var i = 0; i < message_obj.fields.length; i++) {
        definedFields(message_obj.fields[i]);
    }
    addMessageField();

}

function deleteMessageField(id) {
    $("#msg_field_row_" + id).remove();
    MSG_FIELD_COUNT--;
}


function definedFields(obj) {

    var str = `<tr>
    <td>
        <label>`+obj.name+`</label>
    </td>
    <td>
     <label>`+obj.dataType+`</label>
    </td>
    <td>-</td>
  </tr>`;

    $(".msgFieldBody").append(str);


}

function addMessageField() {

    var id = MSG_FIELD_COUNT;

    var str = `<tr id="msg_field_row_` + id + `">
    <td>
        <input class="form-control input-sm" placeholder="Field Name" type="text"  id="msg_field_` + id + `" required>
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

    var flag = false;

    var fields = [];

    for (var i = 0; i < MSG_FIELD_COUNT; i++) {
        var json = {
            "dataType": $("#msg_datatype_" + i).val(),
            "format": "AS_IS",
            "label": "",
            "description": "",
            "name": $("#msg_field_" + i).val()
        }
        // if($("#msg_datatype_" + i).val() === 'GEO_SHAPE'){
        //     json['shape'] = {
        //         "tree": $("#msg_datatype_" + i+"_tree").val(),
        //         "precision": $("#msg_datatype_" + i+"_precision").val(),
        //         "distance_error_pct": Number($("#msg_datatype_" + i+"_distance").val()),
        //         "strategy": $("#msg_datatype_" + i+"_strategy").val(),
        //         "orientation": $("#msg_datatype_" + i+"_orientation").val()
        //     }
        // }
        fields.push(json);
    }


    for (var i = 0; i < fields.length; i++) {

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

    if(message_obj && message_obj.fields && message_obj.fields.length > 0){
        fields = _.union(message_obj.fields,fields);
    }



    var msgObj = {
        "id": Number($("#msg_id").val()),
        "name": $("#msg_name").val(),
        "label":  $("#msg_name").val(),
        "description":  $("#msg_desc").val(),
        "fields": fields
    }

    $(".btnSubmit").attr('disabled','disabled');

    if(message_obj && message_obj.id){
        createUpdateRecordDef(msgObj,function (status, data) {
            if(status){
                successMsg('Record Definition Updated Successfully');
                loadRecordDef();
                $("#addMessageRule").modal('hide');
            }else{
                errorMsg('Error in Define Record')
            }
            $(".btnSubmit").removeAttr('disabled');
        })

    }else{
        retreiveRecordDef(msgObj.id,function (status,data) {

            if(status){
                $(".btnSubmit").removeAttr('disabled');
                errorMsgBorder('Record ID already defined','msg_id');
            }else{
                createUpdateRecordDef(msgObj,function (status, data) {
                    if(status){
                        successMsg('Record Defined Successfully');
                        loadRecordDef();
                        $("#addMessageRule").modal('hide');
                    }else{
                        errorMsg('Error in Define Record')
                    }
                    $(".btnSubmit").removeAttr('disabled');
                })
            }
        })
    }




}

function openDeleteModal(id) {

    current_msg_id = id;
    $(".delete_rule_name").html('Record');
    $(".delete_rule_id").html(id);
    $("#deleteModal").modal('show');

}

function proceedDelete() {
    deleteRecordDef(current_msg_id,function (status,data) {
        if(status){
            successMsg('Record Deleted Successfully');
            loadRecordDef();
            $("#deleteModal").modal('hide');
        }else{
            errorMsg('Error in delete')
        }
    })
}

function createDownload() {


    saveAndDownload(JSON.stringify(message_list), 'record-definition-'+DOMAIN_KEY+'.json', 'application/json', 'exportMsg')

}



function importMsg() {
    $("#importModal form")[0].reset();

    // $(".btnSubmit").attr('disabled','disabled')
    $("#imported_content").val('')
    $("#importFile").val('')
    loadJsEditor('');
    $("#importModal").modal('show');
}


function loadJsEditor(code) {

    if (jsEditor) {
        jsEditor.destroy();
    }

    $("#jsEditor").html("");


    jsEditor = ace.edit("imported_content");
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


    jsEditor.setValue(code);
    jsEditor.clearSelection();
    jsEditor.focus();
    var session = jsEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    jsEditor.gotoLine(count, session.getLine(count - 1).length);

    $('#jsEditor').height(500+'px');

    jsEditor.resize();

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
        // target.value = content;
        jsEditor.setValue(js_beautify(content, {indent_size: 4})) // moves cursor to the start
    // var beautify = ace.require("ace/ext/beautify"); // get reference to extension
    //
    //
    // beautify.beautify(jsEditor.session);
    // $(".btnSubmit").removeAttr('disabled');
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

function importContent() {
    var val = jsEditor.getSession().getValue();

    if(val) {

            try {
                val = JSON.parse(val);


                $(".btnSubmit").attr('disabled', 'disabled');


            async.filter(val, function (obj, cbk) {

                checkAndInsert(obj, function (d) {
                    cbk(null, null)
                })

            }, function (err, result) {
                loadRecordDef();
                $(".btnSubmit").removeAttr('disabled');

            })


        }
        catch (e) {
            errorMsgBorder('Error in parsing. Invalid JSON', 'imported_content')
        }
    }else{
        errorMsg('Imported Content cannot be Empty')
    }

}

function checkAndInsert(obj, cbk) {

    retreiveRecordDef(obj.id, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsg(obj.id + ' - Record ID already defined');
            cbk(null)
        } else {
            createUpdateRecordDef(obj, function (status, data) {
                if (status) {
                    successMsg(obj.id + ' - Record Defined Successfully');

                } else {
                    errorMsg('Error in Define Record')
                }
                cbk(null)
            })
        }
    })

}