var userObj = Cookies.get('user_details');
var counter = 1;
var sliderCtrl = null;
$(document).ready(function () {

    if(userObj){

        userObj = JSON.parse(userObj);

        if(Cookies.get('partDomain') !== 'false') {

            if (USER_ROLE.indexOf('user') !== -1) {
                document.location = BASE_PATH+'/dashboard';
            } else {
                document.location = BASE_PATH+'/home';
            }
        }else{
            loadPartDomain()
        }


    }

    $(".currentYear").html(moment().format('YYYY'));
    $(".leftContent").css('height',$(window).height());
    $(".right-content").css('height',$(window).height());


    $(".col").hide();
    $(".col1").show();
    textSlider();

    $( ".col" ).mouseover(function() {
        clearInterval(sliderCtrl)
    });

    $( ".col" ).mouseout(function() {
        textSlider();
    });




});


function textSlider() {

    sliderCtrl = setInterval(function(){
        counter++;
        if(counter === 14){
            counter = 1;
        }

        $('.col').hide();
        $('.col'+counter).toggle('slide');
    }, 2500);
}


function login(){

    var emailId = $.trim($("#username").val());
    var password = $.trim($("#password").val());

    if(emailId == ""){
        errorMsgBorder('Username cannot be empty','username');
        return false;
    }

    if(password == ""){
        errorMsgBorder('Password cannot be empty','password');
        return false;
    }

    $("#submitButton").attr('disabled','disabled');
    loading('Please wait');



    loginCall(emailId.toLowerCase(), password,function (status, data) {
        closeLoading();
        $("#submitButton").removeAttr('disabled');
        if(status){

            userObj = data;

            var roles = data.user.roles;

            if(roles.indexOf('user') === -1 && roles.indexOf('developer') === -1 && roles.indexOf('domainadmin') === -1 && roles.indexOf('admin') === -1) {
                data.user.roles = ['user'];
                roles = ['user'];
            }
            Cookies.set('user_details', data);

            if (data.partDomains && data.partDomains.length > 1) {
                Cookies.set('partDomain', false);
                loadPartDomain();
            } else {

                if (roles.indexOf('user') !== -1) {
                    document.location = BASE_PATH+'/dashboard';
                } else {
                    document.location = BASE_PATH+'/home';
                }
            }

        }else{
            errorMsg('Authentication Failed. Incorrect Username/Password')
        }
    })
}

function loadPartDomain() {
    $('body').removeClass('bg-white')
    $("body").css('background-color','#fac300 !important')
    $("#page-container").html($("#partDomain").html());
    $(".domain_logo").attr('src', DEFAULT_LOGIN_LOGO_PATH);

    for(var i=0;i<userObj.partDomains.length;i++){
        var domain = userObj.partDomains[i];
        $(".partDomainList").append('<li onclick="switchDomain(\''+domain.domainKey+'\',\''+userObj.token+'\')"><span>'+(domain.label ? domain.label : domain.domainKey) + '</span><br><small>'+domain.domainKey+'</small>'+
            '<i class="fa fa-arrow-right pull-right" style="font-size:16px"></i></li>')
    }
}

function switchDomain(dkey,token) {
    switchDomainCall(dkey,token,function (status, data) {
        if(status){

            Cookies.set('user_details', data);

            Cookies.set('partDomain',true);

            userObj = data;

            var roles = userObj.user.roles;

            if(roles.indexOf('user') !== -1){
                document.location = BASE_PATH+'/dashboard';
            }else{
                document.location = BASE_PATH+'/home';
            }

        }else{
            errorMsg('Something went wrong!')
        }
    })
}

function logout() {
    loginOutCall(function (status,data) {
        Cookies.remove('user_details');
        Cookies.remove('domain_logo');
        Cookies.remove('user_picture');
        Cookies.remove('greetings');
        Cookies.remove('platform_theme');
        Cookies.remove('partDomain');
        Cookies.remove(PRIVACY_POLICY);
        if(Cookies.get('domain')){
            var domainKey = Cookies.get('domain');
            Cookies.remove('domain');
            document.location=BASE_PATH+'/'+domainKey;
        }else{
            document.location=BASE_PATH+'/login';
        }

    });


}

function register(){

    var firstname = $.trim($("#firstname").val());
    var lastname = $.trim($("#lastname").val());
    var email = $.trim($("#email").val());
    var password = $("#password").val();
    var confirmpassword = $("#confirmpassword").val();

    if(firstname == ""){
        errorMsgBorder('First Name cannot be empty','firstname');
        return false;
    }

    if(lastname === ""){
        errorMsgBorder('Last Name cannot be empty','lastname');
        return false;
    }

    if(email) {
        if (email === "") {
            errorMsgBorder('Email ID cannot be empty', 'email');
            return false;
        }else{
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            var eFlag = regex.test(email);

            if(!eFlag){
                errorMsgBorder('Invalid Email ID', 'email');
                return false;
            }

        }
    }

    if(password === ""){
        errorMsgBorder('Password cannot be empty','password');
        return false;
    }

    if(password !== confirmpassword){
        errorMsgBorder('Password & Confirm Password should be same','password');
        return false;
    }

    $("#submitButton").attr('disabled','disabled');
    loading('Please wait');

    var data = {
        email: email.toLowerCase(),
        password: password,
        firstName: firstname,
        lastName: lastname
    };


    registerCall(data,function (status, data) {
        closeLoading();
        $("#submitButton").removeAttr('disabled');
        if(status){
            $('#registerForm')[0].reset();
            successMsg('Account Successfully created. Please check your email to activate your account!')

            if(Cookies.get('domain')){
                var domainKey = Cookies.get('domain');
                document.location=BASE_PATH+'/'+domainKey;
            }else{
                document.location=BASE_PATH+'/login';
            }
        }else{
            console.log(data)
            if(data.message === 'USER_EXISTS'){
                errorMsg('User already exists!')
            }else{
                errorMsg('Something went wrong!')
            }

        }
    })
}

function resetPasswordModal(){
    $("#forgotModal").modal('show');
}

function forgetPassword() {
    var emailId = $.trim($("#emailId").val());

    if(emailId == ""){
        errorMsgBorder('Email ID cannot be empty','emailId');
        return false;
    }

    $("#passwordButton").attr('disabled','disabled');


    resetPasswordCall(emailId.toLowerCase(),function (status, data) {
        $("#passwordButton").removeAttr('disabled');
        $("#forgotModal").modal('hide');
        successMsg('Password reset successfully. Please check your Registered Email!');
    });
}

function toggleBox(){

    if($("#password").attr('type') === 'password'){
        $(".passwordIcon").removeClass('fa-eye')
        $(".passwordIcon").addClass('fa-eye-slash')
        $("#password").attr('type','text')
    }else{
        $(".passwordIcon").removeClass('fa-eye-slash')
        $(".passwordIcon").addClass('fa-eye')
        $("#password").attr('type','password')
    }
}
