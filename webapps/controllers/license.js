$(document).ready(function () {


    $(".currentYear").html(moment().format('YYYY'));



});


function applyLicense(){

    $("#licenseData").attr('disabled','disabled')


    $.ajax({
        url: WEB_BASE_PATH+"/apply-license",
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