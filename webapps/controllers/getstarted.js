var current_msgdef_obj = null;
var current_dev_obj = null;
var current_dev_token = null;
var message_obj = {};
var MSG_FIELD_COUNT = 0;
$(document).ready(function(){
    initialChecks();
  
})

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
            console.log("openGetStartedModal==============");
            console.log("isMsgDefListEmpty=>",results["isMsgDefListEmpty"]);
            console.log("isDeviceListEmpty=>",results["isDeviceListEmpty"]);
            // results["isMessageListEmpty"] = true; //Todo: remove once the development done
            if(results["isMsgDefListEmpty"] && results["isDeviceListEmpty"]){
                openGetStartedModal(results);
            }
        });
}

function openGetStartedModal(results) {
   message_obj = {};
   $("#getstartedmodal form")[0].reset();
    $("#msg_id").removeAttr('disabled');
    $(".msgFieldBody").html("");
    addMessageField();

 $("#getstartedmodal").modal({
        backdrop: 'static',
        keyboard: false ,
        }, 
        'show',$(".platformBody").addClass("blur"),
        $("#header").addClass("blur"),
        $("footer").addClass("blur")
   ); // model UI open

}

function closeGetStart() {
    $(".platformBody").removeClass("blur"),
    $("#header").removeClass("blur"),
        $("footer").removeClass("blur")
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
    <td class="pr-4">
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
function tabnavigate(d,navto){
     $(d).hasClass("active-dot") ? prevnavigate(navto):'';
  // prevnavigate(navto)
}

function prevnavigate(navto){
    $('.right-content').addClass('d-none');
    $('.active-step').addClass('d-none'); 

    switch(navto){        
        case 1:
            $('.roadmap-info').text('First things first! We shall start working by defining the messages.');  
            $('.video-title').text('Message Specification'); 
            $('.active-step.tab1').removeClass('d-none'); 
            $('.right-content.sec1').removeClass('d-none'); 
            $('iframe').attr('src',"https://www.youtube.com/embed/s8Zb6CIA2nU");
            break;
        case 2:
          
            $('.roadmap-info').text('If you do not have any device? No worries ! Create or add one');  
            $('.video-title').text('Device Management'); 
            $('.right-content.sec2').removeClass('d-none');
            $('.active-step.tab2').removeClass('d-none'); 
            $('iframe').attr('src',"https://www.youtube.com/embed/MF8I4w2BcIQ"); 
          break;
        case 3:
            $('.roadmap-info').text('Simulate the message defined by you!');  
            $('.video-title').text('Rules Engine - Message rule'); 
            $('.right-content.sec3').removeClass('d-none');
            $('.active-step.tab3').removeClass('d-none'); 
            $('iframe').attr('src',"https://www.youtube.com/embed/A6gswxLTx_o");
        break;
        case 4:
            $('.roadmap-info').text('Send the simulated message with inputs');  
            $('.video-title').text('Rules Engine - Message rule'); 
            $('.right-content.sec4').removeClass('d-none');
            $('.active-step.tab4').removeClass('d-none'); 
            $('iframe').attr('src',"https://www.youtube.com/embed/A6gswxLTx_o");
        break;
        }
}

function modalnavigate(currentStep){
    console.log("open");
    switch(currentStep){
    case 1:
        createMsgDef()
        break;
    case 2:
        createDevice();
      break;
    case 3:
        deviceTokenCheck();
    break;
    case 0:
        closeGetStart()
        $('#getstartedmodal').modal('hide')
    break;
    }
}

   
function createMsgDef() {
    if($("#msg_id").val() === "" ){
   
        errorMsgBorder('Message ID is required', 'msg_id');
        return false;
       
    }else if( parseInt($("#msg_id").val()) <= 1 &&  $("#msg_id").val().length < 3){

        errorMsgBorder('Message ID must have atleast 3 digit and greater than 999', 'msg_id');
        return false;

    }else if($("#msg_name").val() === ""){

        errorMsgBorder('Message name is required', 'msg_name');
        return false;

    }else if($("#msg_desc").val() === ""){

        errorMsgBorder('Message description is required', 'msg_desc');
        return false;

    }else{
        for (var i = 0; i < MSG_FIELD_COUNT; i++) {
            if( $("#msg_field_" + i).val() === ""){  
            errorMsgBorder('Field Name is required', 'msg_field_'+i);
            return false;
            }else if( $("#msg_datatype_" + i).val() === ""){
            errorMsgBorder('Data Type is required', 'msg_datatype_'+i);
            return false;
            }
        }
    
        console.log("check");
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
        console.log(fields);
    console.log(fields.length);
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

        $(".btn-proceed").attr('disabled', 'disabled');
        loading('Please wait');

        retreiveMessageDef(msgObj.id, function (status, data) {
            if (status) {
                closeLoading();
                current_msgdef_obj = msgObj;
                $(".btn-proceed").removeAttr('disabled');
                errorMsgBorder('Message ID already defined', 'msg_id');
            } else {
                createUpdateMessageDef(msgObj, function (status, data) {
                    closeLoading();
                    $(".btn-proceed").removeAttr('disabled');
                    if (status) {

                        current_msgdef_obj = msgObj;
                        successMsg('Message Defined Successfully');
                            console.log("mesg option");
                            $('.right-content').addClass('d-none');
                            $('.active-step').addClass('d-none'); 
                            $('.roadmap-info').text('If you do not have any device? No worries ! Create or add one');  
                            $('.video-title').text('Device Management'); 
                            $('.right-content.sec2').removeClass('d-none');
                            $('.landmark.tab1').addClass('is-done active-dot'); 
                            $('.landmark.tab2').addClass('active-dot'); 
                            $('.active-step.tab2').removeClass('d-none'); 
                            $('iframe').attr('src',"https://www.youtube.com/embed/MF8I4w2BcIQ"); 
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

    }else{

        var deviceObj = {
            "id": $("#device_id").val(),
            "name": $("#device_name").val(),
            "modelId": $("#device_model").val(),
            "version": $("#device_version").val(),
        }

        $(".btn-proceed").attr('disabled', 'disabled');
        loading('Please wait');

        retreiveDevice(deviceObj.id, function (status1, data1) {

            var deviceModelObj = {
                "id": $("#device_model").val(),
                "version": $("#device_version").val()
            };

            current_dev_obj = deviceObj;

            if (status1) {
                closeLoading();
                $(".btn-proceed").removeAttr('disabled');
                errorMsgBorder('Device ID already exist', 'device_id');
            } else {
                addDeviceModel(deviceModelObj, function (status2, data2) {
                    if(status2){
                        upsertDevice(deviceObj,function (status3, data3) {
                            $(".btn-proceed").removeAttr('disabled');
                            if (status3) {
                                closeLoading();
                                successMsg('Device Created Successfully');

                                $("a[href$='next']").click();
                                createDeviceToken();
                                renderSimulationDeviceSpecs();
                                $('.right-content').addClass('d-none');
                                $('.active-step').addClass('d-none'); 
                                $('.roadmap-info').text('Simulate the message defined by you!');  
                                $('.video-title').text('Rules Engine - Message rule'); 
                                $('.right-content.sec3').removeClass('d-none');
                                $('.landmark.tab2').addClass('is-done active-dot'); 
                                $('.landmark.tab3').addClass('active-dot'); 
                                $('.active-step.tab3').removeClass('d-none'); 
                                $('iframe').attr('src', "https://www.youtube.com/embed/A6gswxLTx_o");
                            } else {
                                errorMsg('Error in Creating Device');
                            }
                        });
                    }else{
                        closeLoading();
                        $(".btn-proceed").removeAttr('disabled');
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
    $(".btn-proceed").attr('disabled', 'disabled');

    loading('Please wait');
    simulateDeviceMessage(id, jsonObj, current_dev_token, function (status, data) {
        closeLoading();
        $(".btn-proceed").removeAttr('disabled');
        if(status){
            $(".msgDefCode").append('<p>'+new Date() +' | Message sent successfully</p>');
            
            $('.right-content').addClass('d-none');
            $('.active-step').addClass('d-none'); 
            $('.roadmap-info').text('Send the simulated message with inputs');  
            $('.video-title').text('Rules Engine - Message rule'); 
            $('.right-content.sec2').removeClass('d-none');
            $('.landmark.tab1').addClass('is-done active-dot'); 
            $('.landmark.tab2').addClass('active-dot'); 
            $('.active-step.tab2').removeClass('d-none'); 
            $('iframe').attr('src',"https://www.youtube.com/embed/A6gswxLTx_o");
        }else{
            $(".msgDefCode").append('<p>'+new Date() +' | Error in sent message</p>');
        }
    });
}