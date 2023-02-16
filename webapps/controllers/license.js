$(document).ready(function () {


    $(".currentYear").html(moment().format('YYYY'));



});


function applyLicense(type){

    $("#licenseData").attr('disabled','disabled');
    $("#licenseData").css({"border":"1px solid #dddddd"});
    $("#showFeedback").hide();

    if(type === "cluster-license"){
        $.ajax({
            url: WEB_BASE_PATH+"/apply/cluster-license",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({data:$("#licenseData").val()}),
            success: function (data) {
                //called when successful
                var resObj = JSON.parse(data["result"]);

                if(data["status"]){
                    successMsg('Activation Successful!');
                    window.location.reload();
                }else{
                    $("#showFeedback").show().html('<i class="fa fa-exclamation-triangle"></i> '+resObj["message"]);
                    $("#licenseData").css({"border":"1px solid red"});
                    errorMsg(resObj["message"]);
                }
                setTimeout(function (){
                    $("#licenseData").removeAttr('disabled')
                },1500);
            },
            error: function (e) {
                //called when there is an error
                //console.log(e.message);
                successMsg('Error in license activation!')
                $("#licenseData").removeAttr('disabled')
            }
        });
    }else if(type === "account-license"){
        $.ajax({
            url: WEB_BASE_PATH+"/apply/account-license",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({data:$("#licenseData").val()}),
            success: function (data) {
                //called when successful
                var resObj = JSON.parse(data["result"]);

                if(data["status"]){
                    successMsg('Activation Successful!');
                    window.location.reload();
                }else{
                    $("#showFeedback").show().html('<i class="fa fa-exclamation-triangle"></i> '+resObj["message"]);
                    $("#licenseData").css({"border":"1px solid red"});
                    errorMsg(resObj["message"]);
                }
                setTimeout(function (){
                    $("#licenseData").removeAttr('disabled')
                },1500);
            },
            error: function (e) {
                //called when there is an error
                //console.log(e.message);
                successMsg('Error in license activation!')
                $("#licenseData").removeAttr('disabled')
            }
        });
    }else if(type === "domain-license"){
        $.ajax({
            url: WEB_BASE_PATH+"/apply/domain-license",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({data:$("#licenseData").val()}),
            success: function (data) {
                //called when successful
                var resObj = JSON.parse(data["result"]);

                if(data["status"]){
                    successMsg('Activation Successful!');
                    window.location.reload();
                }else{
                    $("#showFeedback").show().html('<i class="fa fa-exclamation-triangle"></i> '+resObj["message"]);
                    $("#licenseData").css({"border":"1px solid red"});
                    errorMsg(resObj["message"]);
                }
                setTimeout(function (){
                    $("#licenseData").removeAttr('disabled');
                },1500);
            },
            error: function (e) {
                //called when there is an error
                //console.log(e.message);
                successMsg('Error in license activation!')
                $("#licenseData").removeAttr('disabled')
            }
        });
    }
}