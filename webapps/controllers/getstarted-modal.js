var messageTable = null;
var current_msg_id = null;
var current_msgdef_obj = null;
var current_dev_obj = null;
var current_dev_token = null;
var deviceTable = null;
var device_list = [];
var device_model_list = [];

var MSG_FIELD_COUNT = 0;
var message_list = [];
var message_obj = {};
var current_device_id = {};
var cmdTimer = {};
var stepsWizard = null;
var isStepPass = false;

$(document).ready(function () {
    initialChecks();
    $('body').removeClass('bg-white');
});

function initialChecks(){

    async.series({
            isMsgDefListEmpty: function (mdcbk) {

                listMessageSpec(1000, null, null, function (status, data) {
                    if(status){
                        if(data.length === 0){
                            mdcbk(null, true);
                        } else {
                            if(data.length > 0){
                                current_msgdef_obj = data[0];
                            }
                            mdcbk(null, false);
                        }
                    }else{
                        mdcbk(null, false);
                    }
                });
            },
            isDeviceListEmpty: function (dcbk) {

                var queryParams = {
                    "method": "GET",
                    "extraPath": "",
                    "query": "{\"query\":{\"bool\":{\"must\":[{\"match\":{\"domainKey\":\""+DOMAIN_KEY+"\"}}],\"should\":[]}},\"sort\":[{\"reportedStamp\":{\"order\":\"desc\"}}],\"aggs\":{\"total_count\":{\"value_count\":{\"field\":\"reportedStamp\"}}},\"size\":10,\"from\":0}",
                    "params": [],
                    "type": "DEVICE"
                }

                searchDevice(queryParams, function (status, data) {
                    if(status){
                        var resultData = searchQueryFormatterNew(data).data;
                        if(resultData.data.length === 0){
                            dcbk(null, true);
                        } else {
                            if(resultData.data.length > 0){
                                current_dev_obj = resultData.data[0];
                            }
                            dcbk(null, false);
                        }
                    }else{
                        dcbk(null, false);
                    }
                });
            },
            /*isMessageListEmpty: function (msgcbk) {

                console.log(msgDefObj)

                    var queryParams = {
                        "method": "GET",
                        "extraPath": "",
                        "query": "{\"query\":{\"bool\":{\"must\":[{\"match\":{\"domainkey\":\""+DOMAIN_KEY+"\"}}]}},\"sort\":[{\"receivedstamp\":{\"order\":\"desc\"}}],\"aggs\":{\"total_count\":{\"value_count\":{\"field\":\"receivedstamp\"}},\"group_by_year\":{\"terms\":{\"field\":\"year\",\"size\":5},\"aggs\":{\"group_by_month\":{\"terms\":{\"field\":\"month\",\"size\":12},\"aggs\":{\"group_by_date\":{\"terms\":{\"field\":\"day\",\"size\":31},\"aggs\":{\"group_by_hour\":{\"terms\":{\"field\":\"hour\",\"size\":24},\"aggs\":{\"group_by_minute\":{\"terms\":{\"field\":\"min\",\"size\":60}}}}}}}}}}},\"size\":10,\"from\":0}",
                        "params": [],
                        "type": "MESSAGE",
                        "specId": Number(msgDefObj.id)
                    }
                    console.log(queryParams)

                    searchByQuery(queryParams.specId, queryParams.type, queryParams, function (status, data) {
                        if(status){

                            var resultData = searchQueryFormatterNew(data).data;
                            console.log("isMessageList---------------");
                            console.log(resultData.data.length);
                            if(resultData.data.length === 0){

                                msgcbk(null, true);
                            } else {
                                msgcbk(null, false);
                            }
                        }else{
                            msgcbk(null, false);
                        }
                    });
            }*/
        },
        function (err, results) {
            // results["isMessageListEmpty"] = true; //Todo: remove once the development done
            if(results["isMsgDefListEmpty"] || results["isDeviceListEmpty"]){
                openGetStartedModal(results);
            }
        });
}

function setMsgDefForm(){

}

function openGetStartedModal(results) {

    stepsWizard = $("#getStartedForm").steps({
        headerTag: "h3",
        bodyTag: "section",
        transitionEffect: "slideLeft",
        enableAllSteps: false,
        autoFocus: true,
        stepsOrientation: "vertical"
    });

    $("a[href$='next']").hide();
    $("a[href$='previous']").hide();
    $("a[href$='finish']").hide();

    message_obj = {};

    $("#getStartedModal form")[0].reset();
    $("#msg_id").removeAttr('disabled');
    $(".msgFieldBody").html("");
    addMessageField();

    $("#getStartedModal").modal({
        backdrop: 'static',
        keyboard: false
    });

    if(!results["isMsgDefListEmpty"]){
        isStepPass = true;
        stepsWizard.steps("next");
    }

    /*if(!results["isMsgDefListEmpty"] && !results["isDeviceListEmpty"]){
        isStepPass = true;
        stepsWizard.steps("next");
        $(".device-obj-id").html(current_dev_obj.id);
        $(".device-obj-name").html(current_dev_obj.name);
        $(".device-obj-version").html(current_dev_obj.version);
        $(".msg-def-msgid").html(current_msgdef_obj.id);
        renderSimulationDeviceSpecs();
    }*/
}

function proceedWizard(currentStep){

    switch (currentStep){
        case "step1": //Create Message Definition
            createMsgDef();
            break;

        case "step2": //Create Device
            createDevice();
            break;

        case "step3": //Create Device Token & Simulate
            deviceTokenCheck();
            break;

        case "finish": //Create Device Token & Simulate
            $("#getStartedModal").modal("hide");
            $("#greetingsModal").modal("show");
            break;
    }
}


//*********************************************
//Create Message Definition - Start
//*********************************************

function loadMessageDef() {
    listMessageSpec(1000, null, null, function (status, data) {
        message_list = data;
        if(status && data.length === 0){
            openGetStartedModal();
        }
    });
}

function definedFields(obj) {

    var str = `<tr>
    <td>
        <label>` + obj.name + `</label>
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
    MSG_FIELD_COUNT--;
}

function addMessageField() {

    var id = MSG_FIELD_COUNT;

    var str = `<tr id="msg_field_row_` + id + `">
    <td>
        <input class="form-control input-sm" onkeyup="onlyAlphaNumericUs(this)" onkeydown="onlyAlphaNumericUs(this)" placeholder="Field Name" type="text"  id="msg_field_` + id + `" required>
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
    <td style="text-align: center;vertical-align: middle;" class="addMsg"><img src="images/add1.png" onclick="addMessageField()" style="cursor: pointer" />` +
        (id > 0 ? '<img src="images/delete.png" style="margin-left:5px;cursor: pointer" onclick="deleteMessageField(' + id + ')"/>' : '')
        + ` </td>
  </tr>`;

    $(".msgFieldBody").append(str);
    MSG_FIELD_COUNT++;
}

function createMsgDef() {

    if($("#msg_id").val() === ""){

        errorMsgBorder('Message ID is required', 'msg_id');
        return false;

    }else if($("#msg_name").val() === ""){

        errorMsgBorder('Message name is required', 'msg_name');
        return false;

    }else if($("#msg_desc").val() === ""){

        errorMsgBorder('Message description is required', 'msg_desc');
        return false;

    }else{

        var fields = [];

        for (var i = 0; i < MSG_FIELD_COUNT; i++) {
            var json = {
                "dataType": $("#msg_datatype_" + i).val(),
                "format": "AS_IS",
                "label": "",
                "description": "",
                "name": $("#msg_field_" + i).val()
            };
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

        if (message_obj && message_obj.fields && message_obj.fields.length > 0) {
            fields = _.union(message_obj.fields, fields);
        }

        var msgObj = {
            "id": Number($("#msg_id").val()),
            "name": $("#msg_name").val(),
            "label": $("#msg_name").val(),
            "description": $("#msg_desc").val(),
            "fields": fields
        };

        $(".btnSubmit").attr('disabled', 'disabled');
        loading('Please wait');

        retreiveMessageDef(msgObj.id, function (status, data) {
            if (status) {
                closeLoading();
                current_msgdef_obj = msgObj;
                $(".btnSubmit").removeAttr('disabled');
                errorMsgBorder('Message ID already defined', 'msg_id');
            } else {
                createUpdateMessageDef(msgObj, function (status, data) {
                    closeLoading();
                    $(".btnSubmit").removeAttr('disabled');
                    if (status) {
                        current_msgdef_obj = msgObj;
                        successMsg('Message Defined Successfully');
                        $("a[href$='next']").click();
                    } else {
                        errorMsg('Error in Define Message');
                    }
                })
            }
        })
    }
}

function createDevice() {

    if($("#device_id").val() === ""){

        errorMsgBorder('Device ID is required', 'device_id');
        return false;

    }else if($("#device_name").val() === ""){

        errorMsgBorder('Device name is required', 'device_name');
        return false;

    }else if($("#device_model").val() === ""){

        errorMsgBorder('Device model is required', 'device_model');
        return false;

    }else if($("#device_version").val() === ""){

        errorMsgBorder('Device version is required', 'device_version');
        return false;

    }else if($("#device_desc").val() === ""){

        errorMsgBorder('Device description is required', 'device_desc');
        return false;
       
    }else{

        var deviceObj = {
            "id": $("#device_id").val(),
            "name": $("#device_name").val(),
            "modelId": $("#device_model").val(),
            "version": $("#device_version").val(),
        }

        $(".btnSubmit").attr('disabled', 'disabled');
        loading('Please wait');

        retreiveDevice(deviceObj.id, function (status1, data1) {

            var deviceModelObj = {
                "id": $("#device_model").val(),
                "description": $("#device_desc").val(),
                "version": $("#device_version").val()
            };

            current_dev_obj = deviceObj;

            if (status1) {
                closeLoading();
                $(".btnSubmit").removeAttr('disabled');
                errorMsgBorder('Device ID already exist', 'device_id');
            } else {
                addDeviceModel(deviceModelObj, function (status2, data2) {
                    if(status2){
                        upsertDevice(deviceObj,function (status3, data3) {
                            $(".btnSubmit").removeAttr('disabled');
                            if (status3) {
                                closeLoading();
                                successMsg('Device Created Successfully');

                                $("a[href$='next']").click();
                                createDeviceToken();
                                renderSimulationDeviceSpecs();
                            } else {
                                errorMsg('Error in Creating Device');
                            }
                        });
                    }else{
                        closeLoading();
                        $(".btnSubmit").removeAttr('disabled');
                        errorMsg('Error in Creating Device Model');
                    }
                });
            }
        });
    }
}

function addDeviceModel(deviceModelObj, cbk) {

    retreiveDeviceModel(deviceModelObj.id, function (status1, data1) {

        if (status1) {
            errorMsgBorder('Device Model ID already exist', 'device_id');
            cbk(true,'Device Model ID Exist');
        } else {
            upsertDeviceModel(deviceModelObj,function (status2, data2) {
                if (status2) {
                    cbk(true,'Device Model Created Successfully');
                } else {
                    errorMsg('Error in Creating Device Model');
                    cbk(false,'Error in Creating Device Model');
                }
            })
        }
    })
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}

function checkAndInsert(obj, cbk) {

    retreiveMessageDef(obj.id, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsg(obj.id + ' - Message ID already defined');
            cbk(null)
        } else {
            createUpdateMessageDef(obj, function (status, data) {
                if (status) {
                    successMsg(obj.id + ' - Message Defined Successfully');

                } else {
                    errorMsg('Error in Define Message')
                }
                cbk(null)
            })
        }
    })

}

//*********************************************
//Create Message Definition - End
//*********************************************



//*********************************************
//Create Device - Start
//*********************************************

function getMessageList(cbk){

    var queryParams = {
        "method": "GET",
        "extraPath": "",
        "query": "{\"query\":{\"bool\":{\"must\":[{\"match\":{\"domainkey\":\""+DOMAIN_KEY+"\"}}]}},\"sort\":[{\"receivedstamp\":{\"order\":\"desc\"}}],\"aggs\":{\"total_count\":{\"value_count\":{\"field\":\"receivedstamp\"}},\"group_by_year\":{\"terms\":{\"field\":\"year\",\"size\":5},\"aggs\":{\"group_by_month\":{\"terms\":{\"field\":\"month\",\"size\":12},\"aggs\":{\"group_by_date\":{\"terms\":{\"field\":\"day\",\"size\":31},\"aggs\":{\"group_by_hour\":{\"terms\":{\"field\":\"hour\",\"size\":24},\"aggs\":{\"group_by_minute\":{\"terms\":{\"field\":\"min\",\"size\":60}}}}}}}}}}},\"size\":10,\"from\":0}",
        "params": [],
        "type": "MESSAGE",
        "specId": Number($("#msg_id").val())
    }

    searchByQuery(queryParams.specId, queryParams.type, queryParams, function (status, data) {
        if(status){
            var resultData = searchQueryFormatterNew(data).data;
            if(resultData.data.length === 0){
                cbk(true);
            } else {
                cbk(false); //Device Message List
            }
        }else{
            cbk(false);
        }
    });
}

//*********************************************
//Create Device - End
//*********************************************



//*********************************************
//Device Simulate Message - Start
//*********************************************

function renderSimulationDeviceSpecs() {

    $(".device-obj-id").html(current_dev_obj.id);
    $(".device-obj-version").html(current_dev_obj.modelId+"/"+current_dev_obj.version);
    $(".msg-def-msgid").html(current_msgdef_obj.id);
    $(".device-obj-name").html(current_dev_obj.name);

    $(".msgFieldBlock").html('');

    for(var j=0; j<current_msgdef_obj.fields.length; j++){
        $(".msgFieldBlock").append(renderHtml(current_msgdef_obj.id,j,current_msgdef_obj.fields[j]))
    }
}

function deviceTokenCheck(){
    if(current_dev_token != null){
        simulateMessage();
    }else{
        createDeviceToken();
    }
}

function simulateMessage() {

    var obj = current_msgdef_obj;
    var id = obj.id;

    var jsonObj = {};

    for(var i=0;i<obj.fields.length;i++){
        var dataType = obj.fields[i].dataType.toUpperCase();
        if(dataType === 'BOOLEAN'){
            jsonObj[obj.fields[i].name] = $("#"+id+"_"+i).val() === 'true' ? true : false;
        }
        else if(dataType === 'INTEGER' || dataType === 'FLOAT' || dataType === 'DOUBLE' || dataType === 'BIGINT' || dataType === 'TIMESTAMP'){
            jsonObj[obj.fields[i].name] = $("#"+id+"_"+i).val() !== '' ? Number($("#"+id+"_"+i).val()) : '';
        }
        else if(dataType === 'DATE'){
            jsonObj[obj.fields[i].name] = $("#"+id+"_"+i).val() !== '' ? new Date($("#"+id+"_"+i).val()) : '';
        }else{
            jsonObj[obj.fields[i].name] = $("#"+id+"_"+i).val()
        }
    }

    $(".msgDefCode").append('<p>'+new Date() +' | '+JSON.stringify(jsonObj)+'</p>');
    $(".btnSubmit").attr('disabled', 'disabled');

    loading('Please wait');
    simulateDeviceMessage(id, jsonObj, DEVICE_API_TOKEN, function (status, data) {
        closeLoading();
        $(".btnSubmit").removeAttr('disabled');
        if(status){
            $(".msgDefCode").append('<p>'+new Date() +' | Message sent successfully</p>');
        }else{
            $(".msgDefCode").append('<p>'+new Date() +' | Error in sent message</p>');
        }
    });
}

function renderHtml(id, index, obj) {

    var str = '';
    var dataType = obj.dataType.toUpperCase();

    if(dataType === 'BOOLEAN') {
        str = `
          <div class="col-md-6">
            <div class="form-group">
                <label class="inputLabel" style="text-transform: uppercase">` + obj.name + `</label>
                <select class="form-control input-sm" id="` + id + `_` + index + `" required>
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
                <small style="color: #363636; font-size: 11px;">Datatype: ` + obj.dataType + `</small>
            </div>
        </div>
        `;
    }else if(dataType === 'INTEGER'){
        str = `
          <div class="col-md-6">
            <div class="form-group">
                <label class="inputLabel" style="text-transform: uppercase">` + obj.name + `</label>
                <input type="number" class="form-control input-sm" id="` + id + `_` + index + `" required>
                <small style="color: #363636; font-size: 11px;">Datatype: ` + obj.dataType + `</small>
            </div>
        </div>
        `;
    }else{
        str = `
          <div class="col-md-6">
            <div class="form-group">
                <label class="inputLabel" style="text-transform: uppercase">` + obj.name + `</label>
                <input type="text" class="form-control input-sm" id="` + id + `_` + index + `" required>
                <small style="color: #363636; font-size: 11px;">Datatype: ` + obj.dataType + `</small>
            </div>
        </div>
        `;
    }
    return str;
}

function createDeviceToken(){

    if(current_dev_obj.id){
        var obj = {
            "type": "DEVICE",
            "entity": current_dev_obj.id
        }

        createToken(obj, function (status, data) {
            if (status) {
                current_dev_token = data.token;
            } else {
                errorMsg('Error in device token create');
            }
        });
    }else{

    }
}

//*********************************************
//Device Simulate Message - End
//*********************************************
