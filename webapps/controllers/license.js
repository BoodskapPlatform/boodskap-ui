$(document).ready(function () {


    $(".currentYear").html(moment().format('YYYY'));



});


function applyLicense(type){

    $("#licenseData").attr('disabled','disabled')

    if(type === "cluster-license"){
        $.ajax({
            // url: WEB_BASE_PATH+"/license/cluster/apply",
            url: WEB_BASE_PATH+"/apply/cluster-license",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({data:$("#licenseData").val()}),
            success: function (data) {
                //called when successful
                successMsg('Activation Successful!')
                setTimeout(function (){
                    $("#licenseData").removeAttr('disabled')
                    // document.location=WEB_BASE_PATH+"/login";
                },2000)
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
            // url: WEB_BASE_PATH+"/license/account/apply",
            url: WEB_BASE_PATH+"/apply/account-license",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({data:$("#licenseData").val()}),
            success: function (data) {
                //called when successful
                successMsg('Activation Successful!')
                setTimeout(function (){
                    $("#licenseData").removeAttr('disabled')
                    // document.location=WEB_BASE_PATH+"/login";
                },2000)
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
            // url: WEB_BASE_PATH+"/license/domain/apply",
            url: WEB_BASE_PATH+"/apply/domain-license",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({data:$("#licenseData").val()}),
            success: function (data) {
                //called when successful
                successMsg('Activation Successful!')
                setTimeout(function (){
                    $("#licenseData").removeAttr('disabled')
                    // document.location=WEB_BASE_PATH+"/login";
                },2000)
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