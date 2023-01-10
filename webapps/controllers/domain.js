var logoPathId = '';
var selectedId = null;

$(document).ready(function () {
    $("body").removeClass('bg-white');
    openModal("license-status",$(".d-menu-active"));
    $(".upload-image").on('click', function() {
        $(".file-upload").click();
      });
});

function openUpgrade() {
    //   document.getElementById("myslide").style.width = "860px";
    $("#slide", ).css({
      "width": "860px"
    })
    $("#content", ).css({
      "filter": "blur(8px)"
    })
    $("#blur_header").css({
      "filter": "blur(8px)"
    })
    $("#blur_inside").css({
      "filter": "blur(8px)"
    })
    $("#blur_inside_two").css({
      "filter": "blur(8px)"
    })
    $("#header_main").css({
      "filter": "blur(8px)"
    })
    $("#menu").css({
      "border": "none"
    })
    $("body").css({
      "overflow": "hidden"
    })
  }

  function closeNav() {
    $("#slide").css({
      "width": "0px"
    })
    $("#content").css({
      "filter": "blur(0px)"
    })
    $("#blur_header").css({
      "filter": "blur(0px)"
    })
    $("#blur_inside").css({
      "filter": "blur(0px)"
    })
    $("#blur_inside_two").css({
      "filter": "blur(0px)"
    })
    $("#header_main").css({
      "filter": "blur(0px)"
    })
    $("#menu").css({
      "border": "2px solid #cdd6e3"
    })
    $("body").css({
      "overflow": ""
    })
  }

  function Submit() {
    $(".btnModal").attr('disabled', false);
    $(".btn-proceed").on('click', function() {
      $(".btnModal").attr('disabled', false);
    });
  }

  function BegginerPlan() {
    $("#inside_slide", ).css({
      "width": "450px"
    })
    $("#plan_type").text("Beginner").addClass("plan_type_beginner")
    $("#plan_price").text("$10").addClass("plan_type_beginner")
  }

  function BasicPlan() {
    $("#inside_slide", ).css({
      "width": "450px"
    })
    $("#plan_type").text("Basic").addClass("plan_type_basic")
    $("#plan_price").text("$ 49").addClass("plan_type_basic")
  }

  function PreferredPlan() {
    $("#inside_slide", ).css({
      "width": "450px"
    })
    console.log();
    $("#plan_type").text("Preferred").addClass("plan_type_Preferred")
    $("#plan_price").text("$ 99").addClass("plan_type_Preferred")
  }

  function ProfessionalPlan() {
    $("#inside_slide", ).css({
      "width": "450px"
    })
    $("#plan_type").text("Professional").addClass("plan_type_Professional")
    $("#plan_price").text("$ 149").addClass("plan_type_Professional")
  }

  function CloseBegginerPlan() {
    $("#inside_slide").css({
      "width": "0px"
    })
  }

function getDomainBranding() {

    if(ADMIN_ACCESS){
        getGlobalProperty(ADMIN_DOMAIN_BRANDING_PROPERTY, function (status, data) {
            if (status) {
                var src = data.data;
                $(".domain_logo_m").attr('src', API_BASE_PATH + '/files/public/download/' + src);
                logoPathId = src;
            } else {
                $(".domain_logo_m").attr('src', "/images/boodskap-logo.png");
            }
            //  $("#domainModal").modal('show');

        })
    }else{
        getDomainProperty(DOMAIN_BRANDING_PROPERTY, function (status, data) {
            if (status) {
                var src = JSON.parse(data.value);
                $(".domain_logo_m").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + src.webLogo);
                logoPathId = src.webLogo;
            } else {
                $(".domain_logo_m").attr('src', "/images/boodskap-logo.png");
            }
            // $("#domainModal").modal('show');

        })
    }

}

function getGoogleMapApiKey() {
    getDomainProperty(GOOGLE_API_PROPERTY, function (status, data) {
        if (status) {
            var obj = JSON.parse(data.value);

            $(".apiKey").attr('data-clipboard-text', obj.apiKey);
            var apiKey = new ClipboardJS('.apiKey', {
                container: document.getElementById('domainmodal')
            });
            apiKey.on('success', function (e) {
                successMsg('Google Map API Key Copied Successfully')
                
            });

            $("#apiKey").val(obj.apiKey);
        } else {

        }
        $("#domainModal").modal('show');


    })
    
    
}

function getOpenMapApiKey() {
    getDomainProperty(OPENWEATHER_API_PROPERTY, function (status, data) {
        if (status) {
            var obj = JSON.parse(data.value);

            $(".apiKey").attr('data-clipboard-text', obj.apiKey);
            var apiKey = new ClipboardJS('.apiKey', {
                container: document.getElementById('domainmodal')
            });
            apiKey.on('success', function (e) {
                successMsg('Open Weather Map API Key Copied Successfully')
            });

            $("#apiKey").val(obj.apiKey);
        } else {

        }
        $("#domainModal").modal('show');

    })
}

function getDarkSkyApiKey() {
    getDomainProperty(DARKSKY_API_PROPERTY, function (status, data) {
        if (status) {
            var obj = JSON.parse(data.value);

            $(".apiKey").attr('data-clipboard-text', obj.apiKey);
            var apiKey = new ClipboardJS('.apiKey', {
                container: document.getElementById('domainmodal')
            });
            apiKey.on('success', function (e) {
                successMsg('Dark Sky API Key Copied Successfully')
            });

            $("#apiKey").val(obj.apiKey);
        } else {

        }
        $("#domainModal").modal('show');

    })
}

function getGatewaySettings(id, cbk) {
    getDomainSettings(id, function (status, data) {
        if (status) {
            if (id === 'email') {

                $(".emailpwd").attr('data-clipboard-text', data.password);
                var emailpwd = new ClipboardJS('.emailpwd', {
                    container: document.getElementById('domainmodal')
                });
                emailpwd.on('success', function (e) {
                    successMsg('Email Password Copied Successfully')
                });

                $("#hostName").val(data.host);
                $("#portNo").val(data.port);
                $("#euserName").val(data.user);
                $("#epassword").val(data.password);
                $("#primaryEmail").val(data.primaryEmail);
                $("#bounceEmail").val(data.bounceEmail);
                data.ssl ? $("#ssl").attr('checked', 'checked') : '';
                data.tls ? $("#tls").attr('checked', 'checked') : '';
                data.debug ? $("#debug").attr('checked', 'checked') : '';

            }
            else if (id === 'twilio') {

                $(".tokenKey").attr('data-clipboard-text', data.token);
                var tokenKey = new ClipboardJS('.tokenKey', {
                    container: document.getElementById('domainmodal')
                });
                tokenKey.on('success', function (e) {
                    successMsg('Twilio Token Copied Successfully')
                });

                $("#sid").val(data.sid);
                $("#token").val(data.token);
                $("#primaryPhone").val(data.primaryPhone);
                data.debug ? $("#debug").attr('checked', 'checked') : '';

            }
            else if (id === 'fcm') {

                $(".fcmKey").attr('data-clipboard-text', data.apiKey);
                var fcmKey = new ClipboardJS('.fcmKey', {
                    container: document.getElementById('domainmodal')
                });
                fcmKey.on('success', function (e) {
                    successMsg('FCM API Key Copied Successfully')
                });

                $("#apiKey").val(data.apiKey);
                data.debug ? $("#debug").attr('checked', 'checked') : '';
            }
            else if (id === 'udp') {

                $("#decoderCode").val(data.decoderCode);
                $("#portNo").val(data.port);
                $("#threads").val(data.threads);

            }
        }

        $("#domainModal").modal('show');
    })
}

function getLoginLogo() {

    $('#leftBg').colorpicker({
        format: 'hex'
    });
    $('#leftBottomBg').colorpicker({
        format: 'hex'
    });
    $('#textColor').colorpicker({
        format: 'hex'
    });
    $('#buttonColor').colorpicker({
        format: 'hex'
    });

    getGlobalProperty(DOMAIN_UUID, function (status, data) {

        var resultData = {};


        if (status) {

            resultData = JSON.parse(data.data);
            logoPathId = resultData.logoid;

            if(logoPathId)
                $(".domain_logo_m").attr('src', API_BASE_PATH + '/files/public/download/' + resultData.logoid);
            else
                $(".domain_logo_m").attr('src', DEFAULT_LOGO_PATH);


            $("#customHtml").val(resultData.customHtml);



            $('#leftBg').colorpicker('setValue',resultData.leftBg);
            $('#leftBottomBg').colorpicker('setValue',resultData.leftBottomBg);
            $('#textColor').colorpicker('setValue',resultData.textColor);
            $('#buttonColor').colorpicker('setValue',resultData.buttonColor);
    
            

            $("#titleName").val(resultData.titleName ? resultData.titleName : '');
            $("#sloganText").val(resultData.sloganText ? resultData.sloganText : '');
        }else{

            setCustomLoginDefault()

        }



        // $("#leftBg").val(resultData.leftBg ? resultData.leftBg : DEFAULT_LOGIN_THEME.leftBg);
        // $("#leftBottomBg").val(resultData.leftBottomBg ? resultData.leftBottomBg : DEFAULT_LOGIN_THEME.leftBottomBg);
        // $("#textColor").val(resultData.textColor ? resultData.textColor : DEFAULT_LOGIN_THEME.textColor);
        // $("#buttonColor").val(resultData.buttonColor ? resultData.buttonColor : DEFAULT_LOGIN_THEME.buttonColor);

        $(".domainURL").html(WEB_BASE_PATH + '/' + DOMAIN_KEY);

        $(".redirectURL").attr('data-clipboard-text', WEB_BASE_PATH + '/' + DOMAIN_KEY);
        var redirectURL = new ClipboardJS('.redirectURL', {
            container: document.getElementById('domainmodal')
        });
        redirectURL.on('success', function (e) {
            successMsg('URL Address Copied Successfully')
        });

        $("#domainModal").modal('show');
    });
}

function getCustomURL() {
    $(".domainURL").html(WEB_BASE_PATH);
    $(".redirectURL").attr('data-clipboard-text', WEB_BASE_PATH);
    var redirectURL = new ClipboardJS('.redirectURL', {
        container: document.getElementById('domainmodal')
    });
    redirectURL.on('success', function (e) {
        successMsg('URL Address Copied Successfully')
    });
    $("#domainModal").modal('show');
}


function openModal(block,$dom) {

    $(".domain-list").removeClass("d-menu-active");
    $($dom).addClass("d-menu-active");
    $(".modalBody").html('');

    selectedId = block;
    let loadTemplate = '';
    let title = '';

    switch(block){

        case 'license-status' :
            loadTemplate = $("#licenseStatus").html();
            title = 'License Status';
            break;

        case 'billing-overview' :
            title = 'Billing Overview';
            loadTemplate = $("#billingOverview").html();
            // getBillingConfig();
            break;

        case 'theme-layout' :
            title = 'Theme & Layout';
            loadTemplate = $("#themeAndLayout").html();
            getDomainBranding();
            getDomainTheme();
            break;

        case 'email-gateway' :
            title = 'Email Gateway';
            loadTemplate = $("#emailGateway").html();
            getGatewaySettings('email');
            break;

        case 'twilio-gateway' :
            title = 'Twilio Gateway';
            loadTemplate = $("#twilioGateway").html();
            getGatewaySettings('twilio');
            break;

        case 'fcm-gateway' :
            title = 'FCM Gateway';
            loadTemplate = $("#fcmGateway").html();
            getGatewaySettings('fcm');
            break;

        case 'udp-gateway' :
            title = 'UDP Gateway';
            loadTemplate = $("#udpGateway").html();
            getGatewaySettings('udp');
            break;

        case 'custom-url' :
            title = 'Custom URL';
            loadTemplate = $("#customUrl").html();
            getCustomURL();
            break;

        case 'custom-login' :
            title = 'Custom Login';
            loadTemplate = $("#loginUITheme").html();
            getLoginLogo();
            break;

        case 'google-map' :
            title = 'Google Map';
            loadTemplate = $("#googleMap").html();
            getGoogleMapApiKey();
            break;

        case 'open-weather-map' :
            title = 'Open Weather Map';
            loadTemplate = $("#openWeatherMap").html();
            getOpenMapApiKey();
            break;

        case 'dark-sky' :
            title = 'DarkSky';
            loadTemplate = $("#darkSkyMap").html();
            getDarkSkyApiKey();
            break;
    }

    $(".modal-title").html(title);
    $(".modalBody").html(loadTemplate);
}

function proceedSave() {

    if (selectedId === 'branding-logo') {
        if(ADMIN_ACCESS){
            var data = {
                data: logoPathId
            };

            insertGlobalPropertyWithId(data, ADMIN_DOMAIN_BRANDING_PROPERTY, function (status, data) {
                if(status){

                    $(".domain_logo").attr('src', API_BASE_PATH + '/files/public/download/' + logoPathId + '?' + new Date().getTime())
                    Cookies.set('domain_logo', logoPathId);
                    successMsg('Successfully updated')
                    // $("#domainModal").modal('hide')

                } else {
                    errorMsg('Error in logo branding')
                }
            })

        }else {

            var obj = {
                webLogo: logoPathId,
                mobileLogo: logoPathId,
            };

            var data = {
                name: DOMAIN_BRANDING_PROPERTY,
                value: JSON.stringify(obj)
            };

            upsertDomainProperty(data, function (status, data) {
                if (status) {
                    $(".domain_logo").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + logoPathId + '?' + new Date().getTime())
                    Cookies.set('domain_logo', logoPathId);
                    successMsg('Successfully updated')
                    $("#domainModal").modal('hide')

                } else {
                    errorMsg('Error in logo branding')
                }
            })
        }
    }else if (selectedId === 'email-gateway') {
    
        var obj = {
            "host": $.trim($("#hostName").val()),
            "port": Number($("#portNo").val()),
            "user": $.trim($("#euserName").val()),
            "password": $("#epassword").val(),
            "primaryEmail": $.trim($("#primaryEmail").val()),
            "bounceEmail": $.trim($("#bounceEmail").val()),
            "ssl": $("#ssl").is(':checked'),
            "tls": $("#tls").is(':checked'),
            "debug": $("#debug").is(':checked')
        };

        setDomainSettings('email', obj, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide')

            } else {
                errorMsg('Error in updation')
            }
        });


    }
    else if (selectedId === 'twilio-gateway') {

        var obj = {
            "sid": $.trim($("#sid").val()),
            "token": $("#token").val(),
            "primaryPhone": $.trim($("#primaryPhone").val()),
            "debug": $("#debug").is(':checked')
        };

        setDomainSettings('twilio', obj, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide')

            } else {
                errorMsg('Error in updation')
            }
        });

    }
    else if (selectedId === 'fcm-gateway') {

        var obj = {
            "apiKey": $.trim($("#apiKey").val()),
            "debug": $("#debug").is(':checked')
        };

        setDomainSettings('fcm', obj, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide')

            } else {
                errorMsg('Error in updation')
            }
        });
    }
    else if (selectedId === 'udp-gateway') {

        var obj = {
            "decoderCode": $("#decoderCode").val(),
            "port": Number($("#portNo").val()),
            "threads": Number($("#threads").val())
        };

        setDomainSettings('udp', obj, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide')

            } else {
                errorMsg('Error in updation')
            }
        });


    }
    else if (selectedId === 'theme-layout') {

        var obj = {
            headerBg: $("#headerBg").colorpicker('getValue'),
            subHeaderBg: $("#subHeaderBg").colorpicker('getValue'),
            panelHeaderBg: $("#panelHeaderBg").colorpicker('getValue'),
            textColor: $("#textColor").colorpicker('getValue'),
            bodyBg: $("#bodyBg").colorpicker('getValue'),
            layout: $("#bodyLayout").val(),
        };

        var data = {
            name: DOMAIN_THEME_PROPERTY,
            value: JSON.stringify(obj)
        };

        upsertDomainProperty(data, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide');

                Cookies.set('platform_theme', obj);
                rollThemeProp(obj);

            } else {
                errorMsg('Error in updating theme')
            }
        })

    } else if (selectedId === 'custom-login') {

        var obj = {
            logoid: logoPathId,
            customHtml: $("#customHtml").val(),
            leftBg: $("#leftBg").colorpicker('getValue'),
            leftBottomBg: $("#leftBottomBg").colorpicker('getValue'),
            textColor: $("#textColor").colorpicker('getValue'),
            buttonColor: $("#buttonColor").colorpicker('getValue'),
            titleName: $("#titleName").val(),
            sloganText: $("#sloganText").val()
        };

        var data = {
            data: JSON.stringify(obj)
        };

        $.ajax({
            url: API_BASE_PATH + "/global/data/insert/" + API_TOKEN_ALT + '?id=' + DOMAIN_UUID,
            data: JSON.stringify(data),
            contentType: "application/json",
            type: 'POST',
            success: function (res) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide');
            },
            error: function (e) {
                errorMsg('Error in update')
            }
        });

    } else if (selectedId === 'google-map') {

        var obj = {
            apiKey: $("#apiKey").val()
        };

        var data = {
            name: GOOGLE_API_PROPERTY,
            value: JSON.stringify(obj)
        };

        upsertDomainProperty(data, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide')
            } else {
                errorMsg('Error in google map api update')
            }
        })


    } else if (selectedId === 'open-weather-map') {

        var obj = {
            apiKey: $("#apiKey").val()
        };

        var data = {
            name: OPENWEATHER_API_PROPERTY,
            value: JSON.stringify(obj)
        };

        upsertDomainProperty(data, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide')
            } else {
                errorMsg('Error in open weather map api update')
            }
        })


    } else if (selectedId === 'dark-sky') {

        var obj = {
            apiKey: $("#apiKey").val()
        };

        var data = {
            name: DARKSKY_API_PROPERTY,
            value: JSON.stringify(obj)
        };

        upsertDomainProperty(data, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide')
            } else {
                errorMsg('Error in dark sky api update')
            }
        })


    }

    $(".btnModal").attr('disabled',true);
}


function uploadFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                logoPathId = result.id;

                    if (selectedId === 'theme-layout') {
                        $(".domain_logo_m").attr('src', API_BASE_PATH + '/files/public/download/' + logoPathId);
                    } else {
                        if(ADMIN_ACCESS){
                            $(".domain_logo_m").attr('src', API_BASE_PATH + '/files/public/download/'+ logoPathId+'?'+new Date().getTime());

                        }else{
                            $(".domain_logo_m").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + logoPathId+'?'+new Date().getTime());

                        }
                    }


            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    if (selectedId === 'theme-layout') {
        xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token + '?ispublic=true', true);
    } else {
        if(ADMIN_ACCESS){
            xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token + '?ispublic=true', true);
        }else{
            xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token + '?id=' + BRANDING_LOGO_ID, true);
        }
    }

    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    formData.append("tags", 'Logo');
    formData.append("description", '');
    xhr.send(formData);
}

function uploadImage() {

    var fileInput = document.getElementById("logoFile");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    $(".domain_logo_m").attr('src',WEB_BASE_PATH+'/images/loader.png');

    uploadFile(files[0]);

}

function toggleBox(id, obj) {
    if ($(obj).hasClass('shown')) {
        $(obj).removeClass('shown');
        $(obj).html('<i class="icon-eye4"></i>');
        $("#" + id).attr('type', 'password')
    } else {
        $(obj).addClass('shown');
        $(obj).html('<i class="icon-eye-slash"></i>');
        $("#" + id).attr('type', 'text')
    }
}

function toggleArea(id, text, obj) {
    if ($(obj).hasClass('shown')) {
        $(obj).removeClass('shown');
        $(obj).html('<i class="icon-eye4"></i>');
        $("#" + id).hide();
        $("#" + text).show();
    } else {
        $(obj).addClass('shown');
        $(obj).html('<i class="icon-eye-slash"></i>');
        $("#" + id).show();
        $("#" + text).hide();
    }
}

function customLoginReset() {

}

function resetDefault() {

    $("#headerBg").colorpicker('setValue', DEFAULT_THEME.headerBg);
    $("#subHeaderBg").colorpicker('setValue', DEFAULT_THEME.subHeaderBg);
    $("#panelHeaderBg").colorpicker('setValue', DEFAULT_THEME.panelHeaderBg);
    $("#textColor").colorpicker('setValue', DEFAULT_THEME.textColor);
    $("#bodyBg").colorpicker('setValue', DEFAULT_THEME.bodyBg);
    $("#bodyLayout").val(DEFAULT_THEME.layout);

    $(".headerBg").css('background-color', DEFAULT_THEME.headerBg)
    $(".subHeaderBg").css('background-color', DEFAULT_THEME.subHeaderBg)
    $(".panelHeaderBg").css('background-color', DEFAULT_THEME.panelHeaderBg)
    $(".bodyBg").css('background-color', DEFAULT_THEME.bodyBg)

    $(".headerBg").css('color', DEFAULT_THEME.textColor)
    $(".subHeaderBg").css('color', DEFAULT_THEME.textColor)

    $(".divPanel").css('width', '100%');

}

function previewTheme() {

    $(".headerBg").css('background-color', $("#headerBg").colorpicker('getValue'))
    $(".subHeaderBg").css('background-color', $("#subHeaderBg").colorpicker('getValue'))
    $(".panelHeaderBg").css('background-color', $("#panelHeaderBg").colorpicker('getValue'))
    $(".bodyBg").css('background-color', $("#bodyBg").colorpicker('getValue'))

    $(".headerBg").css('color', $("#textColor").colorpicker('getValue'))
    $(".subHeaderBg").css('color', $("#textColor").colorpicker('getValue'))

    if ($("#bodyLayout").val() === 'container') {
        $(".divPanel").css('width', '50%')
    } else {
        $(".divPanel").css('width', '100%')
    }

}

function changeLayout(val) {
    if (val === 'container') {
        $(".divPanel").css('width', '50%')

    } else {
        $(".divPanel").css('width', '100%')

    }
}

function setCustomLoginDefault(){

    logoPathId = null;

    $(".domain_logo_m").attr('src', DEFAULT_LOGO_PATH);

    $('#leftBg').colorpicker('setValue',DEFAULT_LOGIN_THEME.leftBg);
    $('#leftBottomBg').colorpicker('setValue',DEFAULT_LOGIN_THEME.leftBottomBg);
    $('#textColor').colorpicker('setValue',DEFAULT_LOGIN_THEME.textColor);
    $('#buttonColor').colorpicker('setValue',DEFAULT_LOGIN_THEME.buttonColor);



    $("#titleName").val(DEFAULT_LOGIN_THEME.titleName);
    $("#sloganText").val(DEFAULT_LOGIN_THEME.sloganText);
}



