

var current_msgdef_obj = null;
var current_dev_obj = null;
var current_dev_token = null;
var message_obj = {};
var MSG_FIELD_COUNT = 0;
var TEMP_MSG_FIELD_COUNT = 0;
$(document).ready(function(){
    initialChecks();
    checkLicense();
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
        },
        function (err, results) {
            if(results["isMsgDefListEmpty"] && results["isDeviceListEmpty"]){
                openGetStartedModal(results);
            }
        });
}

function checkLicense(){
    getDomainLicense(function(status, data){
        if(status){
            let plan = "N/A";
            let plan_img =''
            switch (data.plan) {
                case 1:
                    plan = "Free" 
                    plan_img = 'images/plans/free-plan.png'
                    break;
              case 2:
                    plan = "Beginner" 
                    plan_img = 'images/plans/beginner-plan.png'
                    break;
              case 3:
                    plan = "Basic" 
                    plan_img = 'images/plans/basic-plan.png'
                    break;
              case 4:
                    plan = "Preferred" 
                    plan_img = 'images/plans/preferred-plan.png'
                    break;
             case 5:
                    plan = "Professional" 
                    plan_img = 'images/plans/professional-plan.png'
                    break;
                default:
                    break;
            }
            data.plan == 0 ? $("#userPlan").html("<span>Plan : </span><span class='pl-1 text-muted'>N/A</span>") : $("#userPlan").text("Plan : "+plan);
            $(".acc-id").text(data.accountId);
            $(".plan-id").text(data.planId);
            $(".acc-id-copy").attr("data-clipboard-text",data.accountId);
            $(".plan-id-copy").attr("data-clipboard-text",data.planId);

            if(data.apiHits < 500){
                $('#notificationCount').html(`<span class="label">1</span>`)
                $('#planDetails').html(`
                <div class="alert alert-warning  d-flex justify-content-between align-items-center" role="alert">
                <div id="" class="mb-0"><i class="fa fa-exclamation-triangle " aria-hidden="true"></i>
                Your <img src="`+plan_img+`" height="20" alt="free-plan"> <span class="font-bold ">`+ plan + ` plan</span>
                 have only  ` + data.apiHits + ` API Calls remaining. <a> Upgrade your plan</a>
                 <a href="https://devbilling.boodskap.io/" target="_blank" class="btn btn-warning "><i class="fa fa-shopping-cart" aria-hidden="true"></i> Upgrade</a>
                 </div>
                <div class="close-alert">
                <button type="button" class="close close-alert-btn" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
                </div>
                </div>
                `)
                $('.header-style').css('box-shadow','none')
            }else{
                 $("#planDetails").html("");
            }

        }else{
            $("#planDetails").html("");
            $("#userPlan").html("<span>Plan : </span><span class='pl-1 text-muted'>N/A</span>");
        }
    });
}

function openGetStartedModal() {
   message_obj = {};
   $("#getstartedmodal form")[0].reset();
    $("#msg_id").removeAttr('disabled');
    $(".msgFieldBody").html("");
    $("#msg_desc").css('height','90px');
    MSG_FIELD_COUNT =0;
    TEMP_MSG_FIELD_COUNT=0;
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
    //   MSG_FIELD_COUNT--;
     TEMP_MSG_FIELD_COUNT--;
     TEMP_MSG_FIELD_COUNT === 1 ? $(".minus").addClass('minus-none'):''  ;
}

function addMessageField() {

    var id = MSG_FIELD_COUNT;

    var str = `<tr class="fieldrow" id="msg_field_row_` + id + `">
    <td class="pr-4">
        <input class="form-control mesg-field input-sm " onkeyup="onlyAlphaNumericUs(this)" onkeydown="onlyAlphaNumericUs(this)" placeholder="Field Name" type="text"  id="msg_field_` + id + `" required>
        <span id="logmsg_field_` + id + `"></span>
        </td>
    <td>
    <select class="form-control mesg-type input-sm" required id="msg_datatype_` + id + `">
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
            var check = false;
           
            $.each($('.fieldrow'),function () {
                 if($(this).find('.mesg-field').val() === ""){ 
                    errorMsgBorder('Field Name is required', $(this).find('.mesg-field').attr('id'));
                    check = false;
                    return false;
                }else if($(this).find('.mesg-type').val() === ""){ 
                        errorMsgBorder('Field Name is required', $(this).find('.mesg-type').attr('id'));
                         check = false;
                        return false;
                    }
                    else{
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
     
    // console.log(fields.length);
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
                <input type="number" min='1' maxlength='50' class="form-control input-sm" id="` + id + `_` + index + `" required>
                <small style="color: #363636; font-size: 11px;">Datatype: ` + obj.dataType + `</small>
            </div>
        </div>
        `;
    }else{
        str = `
            <div class="col-md-6">
            <div class="form-group">
                <label class="inputLabel" style="text-transform: uppercase">` + obj.name + `</label>
                <input type="text" maxlength='50' class="form-control input-sm" id="` + id + `_` + index + `" required>
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
    simulateDeviceMessage(id, jsonObj,current_dev_token , function (status, data) {
        closeLoading();
        $(".btn-proceed").removeAttr('disabled');
        if(status){
            $(".msgDefCode").append('<p>'+new Date() +' | Message sent successfully</p>');
            
            $('.right-content').addClass('d-none');
            $('.active-step').addClass('d-none'); 
            $('.roadmap-info').text('Send the simulated message with inputs');  
            $('.video-title').text('Rules Engine - Message rule'); 
            $('.right-content.sec4').removeClass('d-none');
            $('.landmark.tab3').addClass('is-done active-dot'); 
            $('.landmark.tab4').addClass('active-dot'); 
            $('.active-step.tab4').removeClass('d-none'); 
            $('iframe').attr('src',"https://www.youtube.com/embed/A6gswxLTx_o");
        }else{
            $(".msgDefCode").append('<p>'+new Date() +' | Error in sent message</p>');
        }
    });
}