var messageTable = null;
var current_msg_id = null;
var MSG_FIELD_COUNT = 0;
var message_list = [];
var message_obj = {};
var jsEditor = null;
var TEMP_MSG_FIELD_COUNT = 0;

$(document).ready(function () {
   loadMessageDef();
    $('body').removeClass('bg-white');
   
  
    //document.getElementById('importFile').addEventListener('change', getImportFile)
});


function loadMessageDef() {


    if (messageTable) {
        messageTable.destroy();
        $("#messageTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Message ID',

        },
        {
            mData: 'name',
            sTitle: 'Message Name'
        },
        {
            mData: 'description',
            orderable: false,
            sTitle: 'Description',
            mRender: function (data, type, row) {

                var desc = data;

                return '<div style="max-width: 500px;" class="text-truncate" title="'+data+'">'+data+'</div>';

            }
            
        },
        {
            mData: 'fields',
            sTitle: 'Fields',
            orderable: false,
            mRender: function (data, type, row) {
                var str = '';
                for (var i = 0; i < data.length; i++) {
                    str = str + (i + 1) + '] <b>' + data[i].name + '</b> : ' + data[i].dataType + '<br>';
                }
                return str;
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn bskp-edit-btn mr-2" onclick="openEditModal(' + row['id'] + ')"> <img src="images/edit_icon.svg" alt="">  </button>' +
                    '<button class="btn bskp-trash-btn" onclick="openDeleteModal(' + row['id'] + ')"> <img src="images/delete.svg" alt=""> </button>';
            }
        }

    ];


    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        searching: true,
        dom: '<"bskp-search-left" f> lrtip',
        language: {
            "emptyTable": "No data available",
            "zeroRecords": "No data available",
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search here",
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        data: []
    };

    listMessageSpec(1000, null, null, function (status, data) {
        if (status && data.length > 0) {
            tableOption['data'] = data;
            message_list = data;
            createDownload();
            $(".messageCount").html(data.length)
        } else {
            $(".messageCount").html(0)
            message_list = [];
        }

        messageTable = $("#messageTable").DataTable(tableOption);
      
        $('.dataTables_filter input').attr('maxlength', 100)
    })    


}


function loadRowClicks() {

    var self = this;

    $(".deviceSettings").click(function () {
        var obj = JSON.parse($(this).attr('data'));

    });
    $(".editDevice").click(function () {
        var obj = JSON.parse($(this).attr('data'));
    });
    $(".deleteDevice").click(function () {
        var obj = JSON.parse($(this).attr('data'));
    });
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
    $(".modal-title").html("Define Message")
    MSG_FIELD_COUNT = 0;
    TEMP_MSG_FIELD_COUNT=0;
    message_obj = {};

    $("#addMessageRule form")[0].reset();

    $("#msg_id").removeAttr('disabled');
    $("#msg_desc").css('height','90px');
    // $("#msg_id").attr('min', USER_OBJ.domain.startId)
    // $("#msg_id").attr('max', USER_OBJ.domain.startId + ID_RANGE_COUNT)

    $("#addMessageRule").modal({
        backdrop: 'static',
        keyboard: false
    }
    ,'show'
    );
    
    $(".msgFieldBody").html("");

    addMessageField();  
    $("#addMessageRule form").attr("onsubmit","addMessageRule()")
}


function openEditModal(id) {
    $(".modal-title").html("Edit Message")
    $("#msg_desc").css('height','90px');
    MSG_FIELD_COUNT = 0;
   TEMP_MSG_FIELD_COUNT=0;
    for (var i = 0; i < message_list.length; i++) {
        if (id === message_list[i].id) {
            message_obj = message_list[i];
        }
    }

    $("#msg_id").val(message_obj.id)
    $("#msg_name").val(message_obj.name)
    $("#msg_desc").val(message_obj.description)

    // $("#msg_id").attr('min', USER_OBJ.domain.startId)
    // $("#msg_id").attr('max', USER_OBJ.domain.startId + ID_RANGE_COUNT)
    $("#msg_id").attr('disabled', 'disabled');

    $("#addMessageRule").modal({
        backdrop: 'static',
        keyboard: false,
    }
   
    );
    $(".msgFieldBody").html("");

    for (var i = 0; i < message_obj.fields.length; i++) {
        definedFields(message_obj.fields[i]);
    }
    addMessageField();
    $("#addMessageRule form").attr("onsubmit","addMessageRule('edit')")
}

function definedFields(obj) {

    var str = `<tr>
    <td>
        <label class='field-name'>` + obj.name + `</label>
    </td>
    <td>
     <label>` + obj.dataType + `</label>
    </td>
    <td>-</td>
  </tr>`;

    $(".msgFieldBody").append(str);


}


function deleteMessageField(id) {
    $("#msg_field_row_" + id).remove();
    // MSG_FIELD_COUNT--;
    TEMP_MSG_FIELD_COUNT--;
    TEMP_MSG_FIELD_COUNT === 1 ? $(".minus").addClass('minus-none'):''  ;
}

function addMessageField() {

    var id = MSG_FIELD_COUNT;

    var str = `<tr class="fieldrow" id="msg_field_row_` + id + `">
    <td>
        <input class="form-control input-sm mesg-field"  maxlength="100" onkeyup="onlyAlphaNumericUs(this)" onkeydown="onlyAlphaNumericUs(this)" placeholder="Field Name" autocomplete="off" type="text"  id="msg_field_` + id + `" required>
        <span id="logmsg_field_` + id + `"></span>
        </td>
    <td>
    <select class="form-control  mesg-type input-sm" required id="msg_datatype_` + id + `">
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
    <span id="logmsg_datatype_`+ id +`"></span>
    </td>
    <td style="text-align: center;" class="addMsg"><img class="bskp-add add" src="images/menu/plus1.svg"  onclick="addMessageField()" style="cursor: pointer" alt="add">` +
        (id > 0 ? '<img class="bskp-minus minus" src="images/menu/minus1.svg"  style="margin-left:5px;cursor: pointer" onclick="deleteMessageField(' + id + ')" aria-hidden="true"> ' : '<img class="bskp-minus minus  minus-none" src="images/menu/minus1.svg"  style="margin-left:5px;cursor: pointer" onclick="deleteMessageField(' + id + ')" aria-hidden="true"> ')
        + ` </td>
  </tr>`;
  id > 0 ? $(".minus").removeClass('minus-none'):'';
    $(".msgFieldBody").append(str);
    MSG_FIELD_COUNT++;
    TEMP_MSG_FIELD_COUNT ++;
}

function addMessageRule(place) {

    var msg_id =$.trim($("#msg_id").val() )
    var msg_name =$.trim($("#msg_name").val() )
    var msg_desc =$.trim($("#msg_desc").val() )
        
    if(msg_id === "" ){
   
        errorMsgBorder('Message ID is required', 'msg_id');
        return false;
       
    }
    // else if( parseInt($("#msg_id").val()) <= 1 &&  $("#msg_id").val().length < 3){
    //     errorMsgBorder('Message ID must have atleast 3 digit and greater than 999', 'msg_id');
    //     return false;
   // }
    else if(msg_name === ""){

        errorMsgBorder('Message name is required', 'msg_name');
        return false;

    }else if(msg_desc === ""){

        errorMsgBorder('Message description is required', 'msg_desc');
        return false;

    }else{
            var fields = []; 
            var fieldValArr = [];
            var check = false;
            console.log(place);
            if (place!="edit"){
                
                $.each($('.fieldrow'),function () {
                    
                    if($(this).find('.mesg-field').val() === ""){ 
                        errorMsgBorder('Field Name is required', $(this).find('.mesg-field').attr('id'));
                        check = false;
                        return false;
                    }else if($(this).find('.mesg-type').val() === ""){ 
                        errorMsgBorder('Data Type is required', $(this).find('.mesg-type').attr('id'));
                        check = false;
                        return false;
                    }else if(fieldValArr.includes($(this).find(".mesg-field").val()) == true){
                        errorMsgBorder('Field Name cannot be duplicated', $(this).find('.mesg-field').attr('id'));
                        check = false;
                        return false;
                    }else{
                            fieldValArr.push($(this).find(".mesg-field").val());
                            var json = {
                                "dataType":$(this).find('.mesg-type').val(),
                                "format": "AS_IS",
                                "label": "",
                                "description": "",
                                "name": $(this).find('.mesg-field').val()
                            }
                            fields.push(json);
                            check = true;
                            return true;
                    }
                })
            }else{
                $.each($(".field-name"),function (){
                    fieldValArr.push($(this).text());
                })
                $.each($('.fieldrow'),function () {
                    if(fieldValArr.includes($(this).find(".mesg-field").val()) == true){
                        errorMsgBorder('Field Name cannot be duplicated', $(this).find('.mesg-field').attr('id'));
                        check = false;
                        return false;
                    }
                    if($(this).find('.mesg-field').val() != "" && $(this).find('.mesg-type').val() == ""){ 
                            errorMsgBorder('Data Type is required', $(this).find('.mesg-type').attr('id'));
                            check = false;
                            return false;
                    }else if($(this).find('.mesg-field').val() != "" && $(this).find('.mesg-type').val() != ""){
                            fieldValArr.push($(this).find(".mesg-field").val());

                            var json = {
                                "dataType":$(this).find('.mesg-type').val(),
                                "format": "AS_IS",
                                "label": "",
                                "description": "",
                                "name": $(this).find('.mesg-field').val()
                            }
                            fields.push(json);
                            check = true;
                            return true;
                    }else{
                        check = true;
                    }
                })
            }        

    // for (var i = 0; i < fields.length; i++) {

    //     if (RESERVED_FIELDS.indexOf(fields[i].name) !== -1) {
    //         errorMsgBorder('Reserved Fields cannot be used as a field name', 'msg_field_' + i);
    //         return false;
    //     }

    //     if (DATABASE_KEYWORDS.indexOf(fields[i].name) !== -1) {
    //         errorMsgBorder('Database keywords cannot be used as a field name', 'msg_field_' + i);
    //         return false;
    //     }

    //     if (fields[i].dataType.includes('BLOB')) {
    //         fields[i].format = fields[i].dataType.split(":")[1];
    //         fields[i].dataType = 'BLOB';
    //     }
    // }

    if(check){
    if (message_obj && message_obj.fields && message_obj.fields.length > 0) {
        fields = _.union(message_obj.fields, fields);
    }


    var msgObj = {
        "id": Number(msg_id),
        "name": msg_name,
        "label": msg_name,
        "description":msg_desc,
        "fields": fields
    };


    $(".btnSubmit").attr('disabled', 'disabled');

    if (message_obj && message_obj.id) {
        createUpdateMessageDef(msgObj, function (status, data) {
            if (status) {
                successMsg('Message Definition Updated Successfully');
                loadMessageDef();
                $("#addMessageRule").modal('hide');
            } else {
                errorMsg('Error in Define Message')
            }
            $(".btnSubmit").removeAttr('disabled');
        })

    } else {
        retreiveMessageDef(msgObj.id, function (status, data) {

            if (status) {
                $(".btnSubmit").removeAttr('disabled');
                errorMsgBorder('Message ID already defined', 'msg_id');
            } else {
                createUpdateMessageDef(msgObj, function (status, data) {
                    if (status) {
                        successMsg('Message Defined Successfully');
                        loadMessageDef();
                        $("#addMessageRule").modal('hide');
                    } else {
                        if(typeof(data)!="undefined"){
                            if(data.message){
                                var errmessage = data.message.replaceAll("_"," ")
                                if(errmessage == "INVALID MESSAGE ID"){
                                    errmessage = "Message ID minimum 3 digits required";
                                }
                                errorMsg(errmessage);
                            }else{
                                errorMsg('Error in Define Message');
                            }
                        }else{
                            errorMsg('Error in Define Message');
                        }
                        
                        
                        
                    }
                    $(".btnSubmit").removeAttr('disabled');
                })
            }
        })
    }
    }

}
}

function openDeleteModal(id) {
    $(".modal-title").html("Delete Message")
    current_msg_id = id;
    $(".delete_rule_name").html('Message');
    $(".delete_rule_id").html(id);
    $("#deleteModal").modal({
        backdrop: 'static',
        keyboard: false
    }
    ,'show'
    );

}

function proceedDelete() {
    deleteMessageDef(current_msg_id, function (status, data) {
        if (status) {
            successMsg('Message Deleted Successfully');
            loadMessageDef();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}


function startTour() {
    // Instance the tour
    platformTour = new Tour({
        backdrop: true,
        backdropContainer: 'body',
        backdropPadding: 3,
        storage: false,
        smartPlacement: true,
        template: `
        
        <div class='popover tour'>
          <div class='arrow'></div>
          <h3 class='popover-title' style="background-color: #FF9800;border-bottom: 1px solid #FF9800;color: #fff;"></h3>
          <div class='popover-content'></div>
          <div class='popover-navigation'>
            <button class='btn btn-default btn-xs' data-role='prev'>« Prev</button>
            <button class='btn btn-default btn-xs' data-role='next'>Next »</button>
            <button class='btn btn-danger btn-xs' data-role='end'>End tour</button>
          </div>
        </div>
        
        `,
        steps: [
            {
                element: "#messageTable_wrapper",
                title: "Message Definition List",
                content: "All your defined message specification will be listed here in grid view."
            },
            {
                element: ".btnDefine",
                title: "Define Message Specification",
                content: "Click here to start define your message specification",
                placement: "left",
                onHide: function (tour) {
                    openModal();
                    setTimeout(function () {
                        tour.goTo(2);
                    }, 500)

                },
            },
            {
                element: ".msg_id",
                title: "Message ID",
                content: "Each message should be defined with unique id, your domain id's range mentioned below",
                placement: "right",
            },
            {
                element: ".msg_name",
                title: "Message name",
                content: "Provide message relevant name, this could be displayed application wide",
                placement: "right",
            },
            {
                element: ".msg_desc",
                title: "Message Description",
                content: "Describe message relevant description, it would be helpful to understand what type of message it is",
                placement: "top",
            },
            {
                element: "#msg_field_0",
                title: "Field Name",
                content: "Describe message relevant description, it would be helpful to understand what type of message it is",
                placement: "right",
                onHide: function (tour) {
                    $("#msg_datatype_0").click();
                    setTimeout(function () {
                        tour.goTo(6);
                    }, 500)

                },
            },
            {
                element: "#msg_datatype_0",
                title: "Field Data Type",
                content: "Choose the field data type",
                placement: "right",

            },
            {
                element: ".addMsg",
                title: "Add Fields",
                content: "Click here to add multi fields",
                placement: "left",

            },
            {
                element: ".btnSubmit",
                title: "Save Message Definition",
                content: "Finally save all your defined fields for the message specification",
                placement: "top",

            },


        ],
        onEnd: function (tour) {
            $("#addMessageRule").modal('hide');
        },

    });

// Initialize the tour
    platformTour.init();

// Start the tour
    platformTour.start();


}

function createDownload() {


    saveAndDownload(JSON.stringify(message_list), 'message-definition-'+DOMAIN_KEY+'.json', 'application/json', 'exportMsg')

}


function importMsg() {
    $("#importModal form")[0].reset();
    
    $(".modal-title").html("Import Definition")
    // $(".btnSubmit").attr('disabled','disabled')
    $("#imported_content").val('')
    $("#importFile").val('')
    loadJsEditor('');
    $("#importModal").modal(
        {
            backdrop: 'static',
            keyboard: false
        }
        ,'show')
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


function getImportFile(input,event) {
    //const input = event.target;
    if(input.value.length ){
        var file = input.files[0];
        var type= input.value.split(".");
        type = type[type.length - 1]
        var filename = file.name;

        if(type == "json" || type == "JSON"){
            if (input && input.files.length > 0) {
                placeFileContent(
                    document.getElementById('imported_content'),
                    input.files[0]);

            }
        }else{
            $("#imported_content").val("")
            $("#importFile").val("")
            loadJsEditor("");
            errorMsg('Please import valid json file!');
        }
    }else{
        $("#imported_content").val("")
        $("#importFile").val("")
        loadJsEditor("");
    }       
}

function placeFileContent(target, file) {
    readFileContent(file).then(content => {
        // target.value = content;
        jsEditor.setValue(js_beautify(content, {indent_size: 4})) // moves cursor to the start

    //     jsEditor.setValue(content, -1) // moves cursor to the start
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


var duplicateIds = [];
var newIds = [];
function importContent() {
    var val = jsEditor.getSession().getValue();

    if(val) {

        try {
            val = JSON.parse(val);

            $(".btnSubmit").attr('disabled', 'disabled');

            duplicateIds = [];
            newIds = [];
            async.filter(val, function (obj, cbk) {

                checkAndInsert(obj, function (d) {
                    cbk(null, null)
                })

            }, function (err, result) {
                ///show alert for all duplicate msg id

                loadMessageDef();
                $(".btnSubmit").removeAttr('disabled');
                $('#importModal').modal('hide');
                if(duplicateIds.length){
                    var dupIds = "";
                    duplicateIds.forEach(element => {
                        dupIds = element+",";
                    });
                    dupIds=dupIds.substring(0,dupIds.length-1);
                    var text = dupIds + " Id's are duplicated"
                    errorMsg(text);

                }
                
                if(duplicateIds.length){
                    setTimeout(() => {
                        if(newIds.length){
                            var newAddIds = "";
                            newIds.forEach(element => {
                                newAddIds = element+",";
                            });
                            newAddIds=newAddIds.substring(0,newAddIds.length-1);
                            var text = newAddIds + " Id's are Defined Successfully"
                            successMsg(text);
                        }
                    }, 2000);
                }else{
                    if(newIds.length){
                        var newAddIds = "";
                        newIds.forEach(element => {
                            newAddIds = element+",";
                        });
                        newAddIds=newAddIds.substring(0,newAddIds.length-1);
                        var text = newAddIds + " Id's are Defined Successfully"
                        successMsg(text);
                    }
                }
                

            })


        }
        catch (e) {
            errorMsg('Error in parsing. Invalid JSON')
        }
    }else{
        errorMsg('Imported Content cannot be Empty')
    }
}

function checkAndInsert(obj, cbk) {

    retreiveMessageDef(obj.id, function (status, data) {
        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            duplicateIds.push(obj.id);
            //errorMsg(obj.id + ' - Message ID already defined');
            cbk(null)
        } else {
            createUpdateMessageDef(obj, function (status, data) {
                if (status) {
                    successMsg(obj.id + ' - Message Defined Successfully');
                    newIds.push(obj.id)
                } else {
                    if(typeof(data)!="undefined"){
                        if(data.message){
                            var errmessage = data.message.replaceAll("_"," ")
                            errorMsg(errmessage);
                        }else{
                            errorMsg('Error in Define Message');
                        }
                    }else{
                        errorMsg('Error in Define Message');
                    }
                    
                }
                cbk(null)
            })
        }
    })

}