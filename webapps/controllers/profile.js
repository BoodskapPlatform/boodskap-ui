var profilePathId = '';
var locationPath = window.location.href;
var responseObj = {};
var primaryDomainID =  'primary.domain'
var countryCode = 0;
var country = '';
$(document).ready(function () {

    // if(locationPath.split("#")[1]){
    //     locationPath = locationPath.split("#")[1];
    //     var resStr = locationPath.split("&");
    //     for(var i=0;i<resStr.length;i++){
    //         if(resStr[i].split("=")[0] === 'scope'){
    //             responseObj[resStr[i].split("=")[0]] = resStr[i].split("=")[1].split("+");
    //         }else{
    //             responseObj[resStr[i].split("=")[0]] = resStr[i].split("=")[1];
    //         }
    //     }
    //     updateResponse();
    // }else{
    //     getFitbitBand();
    // }
     var input = document.querySelector("#mobileNo");
    var iti = window.intlTelInput(input, {
      initialCountry: "auto",
      separateDialCode:true,
      nationalMode: true, // Set nationalMode option to true
    //   nationalMode: false,
      autoInsertDialCode:false,
      geoIpLookup: function(success, failure) {
        $.get("https://ipinfo.io", function() {}, "jsonp").always(function(resp) {
            var Code = (resp && resp.country) ? resp.country : "";
            console.log(Code);
           // Set the country flag based on the user's location
           console.log(USER_OBJ.user.country,Code);
           iti.setCountry(USER_OBJ.user.country);    
            success(Code); 
        });
    },
    
      preferredCountries: ["in","us", "gb", "ca", "au"],
    //   utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.1.3/js/utils.js"
    });
   input.addEventListener("countrychange", function() {   
      var countryData = iti.getSelectedCountryData();   
      countryCode = countryData.dialCode; 
      country = countryData.iso2;   
      console.log(countryData.dialCode,countryData);   
    //  var phoneNum = iti.getNumber(intlTelInputUtils);
     console.log(USER_OBJ);
      $('#mobileNo').val(USER_OBJ.user.primaryPhone);
    });

    loadProfile();
    getPrimaryDomain();


    
    $(".upload-image").on('click', function() {
        $(".file-upload").click();
     });

});


function updateResponse() {

    responseObj['expires_in'] = Number(responseObj['expires_in']);
    responseObj['expireOn'] = new Date(moment().add(responseObj['expires_in'],'seconds')).getTime();
    var data = {
        name: FITBIT_BAND_PROPERTY,
        userId : USER_OBJ.user.email,
        value: JSON.stringify(responseObj)
    };

    upsertUserProperty(data, function (status, data) {
        if (status) {
            $(".fitbitBtn").html('<i class="icon-check-circle"></i> Linked');
            $(".fitbitBtn").addClass('btn-success');
            $(".fitbitBtn").css('color','#fff !important');
            if(new Date().getTime() > responseObj['expireOn']){
                $(".fitbitBtn").html('Link your fitbit band');
                $(".fitbitTime").html('Authenticated session expired');
            }else{

                $(".fitbitTime").html('Access granted till '+ moment(responseObj['expireOn']).format('MM/DD/YYYY hh:mm a'))
            }

        } else {
           errorMsg('Something went wrong!')
        }
    })
}

function loadProfile() {
       var user = USER_OBJ.user;
    $("#firstName").val(user.firstName)
    $("#lastName").val(user.lastName ? user.lastName : '')
    $("#emailId").val(user.email)
    $(".fullName").html(user.firstName+" "+ user.lastName)
    $(".fullName").attr("title",user.firstName+" "+ user.lastName)   
    $(".fullName").css({"font-weight":"bolder","font-size":"16px"})
    $(".emailId").html(user.email)
    $("#password").val('')
    $("#conf_password").val('')
   try {
    grecaptcha.reset();
   } catch (error) {
   }
    $(".passwordIcon").removeClass('fa-eye-slash')
    $(".passwordIcon").addClass('fa-eye')
    $("#password").attr('type','password')
    $(".conf_passwordIcon").removeClass('fa-eye-slash')
    $(".conf_passwordIcon").addClass('fa-eye')
    $("#conf_password").attr('type','password')
    $("#mobileNo").val(user.primaryPhone ? user.primaryPhone : '')
    $("#primaryDomain").val(Cookies.get('domain_name'))
}

function onlyNumeric(event) {
        let regex = new RegExp("^[0-9]");
        let keyCode = event.keyCode || event.which;
        console.log(event.keyCode, event.which);
        let key = String.fromCharCode(keyCode);
        if (!regex.test(key)) {
        event.preventDefault();
        return false;
        }
   
} 

function onlyNumber(obj) {
    console.log(obj,obj.value);
    var regex = /^[0-9]+$/;
    if (regex.test(obj.value) !== true) {
        obj.value = obj.value.replace(/[^0-9]+/, '');
    }  
}

function proceedUpdate() {
    var obj = USER_OBJ.user;
    let firstName =$.trim($("#firstName").val() );
    let lastName =$.trim($("#lastName").val() );
    let mobileNo =$.trim($("#mobileNo").val() );
    if(firstName===""){
        errorMsgBorder('First Name is required', 'firstName');
        return false;
    } else if(lastName===""){
        errorMsgBorder('Last Name is required', 'lastName');
        return false;
    }
    if(mobileNo!=""){  console.log(mobileNo.length);
        if(mobileNo.length <= 9 ||mobileNo=="0" || mobileNo=="00" || mobileNo=="000" || mobileNo=="0000" || mobileNo=="00000" || mobileNo=="000000" || mobileNo=="0000000" || mobileNo=="00000000"
    || mobileNo=="000000000" || mobileNo=="0000000000" || mobileNo=="000000000000" || mobileNo=="000000000000" || mobileNo=="0000000000000" || mobileNo=="000000000000000" || mobileNo=="000000000000000"){
        errorMsgBorder('Invalid Mobile Number', 'mobileNo');
        return false;
    }
}

    obj['firstName'] =  $("#firstName").val();
    obj['lastName'] =  $("#lastName").val();
    obj['primaryPhone'] = $("#mobileNo").val();
    obj['country'] = country;
    obj['countryCode'] = countryCode;
    updateProfile(obj);
    }


function updatePassword() {  
    var password = $.trim($("#password").val());
    var conf_password = $.trim($("#conf_password").val());
    var captchaStatus = grecaptcha.getResponse();

    var obj = USER_OBJ.user;

    if(password == ""){
        errorMsgBorder('New Password is required','password');
        return false;
    }
    if(conf_password == ""){
        errorMsgBorder('Confirm Password is required','conf_password');
        return false;
    }

    if (captchaStatus === "") {  
        $("#captchaFeedback").css('border', '1px solid red')
        $("#logcaptchaFeedback").html("<i class='fa fa-exclamation-triangle'></i> Please verify the captcha!").css({ "color": "red", "font-weight": "600" ,"display": "block" });
        setTimeout(function () { 
            $("#captchaFeedback").removeAttr('style')
            $("#logcaptchaFeedback").css({ "display": "none" });
        },3000)
        return false;
    }
    if(password!=conf_password){
        errorMsgBorder('Password and Confirm Password do not match','conf_password');
        return false;
    }else{

    obj['password'] = $("#password").val();
    try {
        grecaptcha.reset();
       } catch (error) {
       }
    updateProfile(obj);
    // $('.changePassword')[0].reset();
    }
}

function updateProfile(obj) {
    // console.log(obj)
    upsertUser(obj,function (status, data) {
        if(status){
            delete obj.password;
            USER_OBJ.user = obj;
            Cookies.set('user_details', USER_OBJ);
            $(".user_profile_name").html((USER_OBJ.user.firstName ? USER_OBJ.user.firstName : 'Admin') + ' ' + (USER_OBJ.user.lastName ? USER_OBJ.user.lastName : ""));
            setTimeout(() => {
                $("#password,#conf_password").val("")
                successMsg('Successfully updated');
                // location.reload(true);
            },500);
              
        }else{
           errorMsg('Error in update')
        }

    })
    
}

function updateProfilePicture() {
    var obj = {
        picture : profilePathId
    };

    var data = {
        name: PROFILE_PICTURE_PROPERTY,
        userId : USER_OBJ.user.email,
        value: JSON.stringify(obj)
    };

    upsertUserProperty(data, function (status, data) {
        if (status) {
            successMsg('Successfully updated')

        } else {
            errorMsg('Error in updating photo')
        }
    })
}



function getPrimaryDomain() {
    
    getUserProperty(primaryDomainID, function (status, data) {
        if (status) {

            var domainKey = data.value;

            $("#primaryDomain").val(domainKey)
        }

    })
}


// function updatePrimaryDomain() {
    
//     var primaryDomain = $.trim($("#primaryDomain").val());
//     if(primaryDomain == ""){
//         errorMsgBorder('Primary Domain cannot be empty','primaryDomain');
//         return false;
//     }

//     var data = {
//         name: primaryDomainID,
//         userId : USER_OBJ.user.email,
//         value: $("#primaryDomain").val()
//     };

//     upsertUserProperty(data, function (status, data) {
//         if (status) {
//             successMsg('Successfully updated')

//         } else {
//             errorMsg('Error in updating photo')
//         }
//     })
// }
function updatePrimaryDomain() {
    var data = {
        name: DOMAIN_UUID,
        value: $("#primaryDomain").val()
    };

    upsertDomainProperty(data, function (status, data) {
        if (status) {
            Cookies.set('domain_name', $("#primaryDomain").val());
            successMsg('Successfully updated');
            // $(".primary_domain").html($("#primaryDomain").val());
            // $("#domainNameModal").modal('hide');
        }else{
            errorMsg('Error Occurred! Please try again!')
        }
    })

}



function uploadFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                profilePathId = result.id;
                $(".user_profile_picture").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + profilePathId+'?'+new Date().getTime());
                Cookies.set('user_picture', profilePathId);
                updateProfilePicture();

            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token +'?id='+PROFILE_PIC_ID, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    formData.append("tags", 'Profile Picture');
    formData.append("description", '');
    xhr.send(formData);
}

function uploadImage() {

    var fileInput = document.getElementById("profileFile");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

     $(".user_profile_picture").attr('src',WEB_BASE_PATH+'/images/loader/loader-lg.gif');

    // $(".user_profile_picture").html('<img src="images/loader/loader.png" style="margin-top:-2px;" border="0" alt=""> &nbsp;Loading...');
    uploadFile(files[0]);

}


function getFitbitBand() {


    var queryParams = 'response_type=token&client_id='+FITBIT_CONFIG.clientId+'&' +
        'redirect_uri='+encodeURIComponent(FITBIT_CONFIG.callbackUrl)+'&scope='+encodeURIComponent(FITBIT_CONFIG.scopes.join(" "))+'&expires_in='+FITBIT_CONFIG.expire;

    var fitbitUrl = FITBIT_CONFIG.oAuthAuthorizationURL + '?' +queryParams;

    $(".fitbitBtn").attr('href',fitbitUrl)

    getUserProperty(FITBIT_BAND_PROPERTY, function (status, data) {
        if (status) {
            var res = JSON.parse(data.value);

            $(".fitbitBtn").html('<i class="icon-check-circle"></i> Linked');
            $(".fitbitBtn").addClass('btn-success');
            $(".fitbitBtn").css('color','#fff !important');

            if(new Date().getTime() >res['expireOn']){
                $(".fitbitBtn").html('Link your fitbit band');
                $(".fitbitTime").html('Authenticated session expired');
            }else{

                $(".fitbitTime").html('Access granted till '+ moment(res['expireOn']).format('MM/DD/YYYY hh:mm a'))
            }
        }

    })
}
function toggleBox(){

    if($("#password").attr('type') === 'password'){
        $(".passwordIcon").removeClass('fa-eye')
        $(".passwordIcon").addClass('fa-eye-slash')
        $("#password").attr('type','text')
    }else {
        $(".passwordIcon").removeClass('fa-eye-slash')
        $(".passwordIcon").addClass('fa-eye')
        $("#password").attr('type','password')
    }
}
function toggles(){
    if($("#conf_password").attr('type') === 'password'){
        $(".conf_passwordIcon").removeClass('fa-eye')
        $(".conf_passwordIcon").addClass('fa-eye-slash')
        $("#conf_password").attr('type','text')
    }else{
        
        $(".conf_passwordIcon").removeClass('fa-eye-slash')
        $(".conf_passwordIcon").addClass('fa-eye')
        $("#conf_password").attr('type','password')
    }
}