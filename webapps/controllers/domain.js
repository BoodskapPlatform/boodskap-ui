var logoPathId = '';
var selectedId = null;
let dom_lic_obj = null;
let active_plan_obj = null;
let elastic_config_obj = null;
let all_host_list=[];

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
            getLicenseDetails();
            break;

        case 'elastic-config' :
            loadTemplate = $("#elasticConfig").html();
            title = 'Elastic Config';
            getElasticConfig();
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


    } else if (selectedId === 'elastic-config') {

        let domainObj = {};

        domainObj["authenticate"] = Boolean($("#elasticConfigCheck:checked").val());
        domainObj["user"] = $("#elasticAuthUser").val();
        domainObj["password"] = $("#elasticAuthPwd").val();
        domainObj["hosts"] = [];
    
        for(let i=0;i<all_host_list.length;i++){
            let id = all_host_list[i];
            let hostObj = {
                "host" : $("#elasticAuthHost_"+id).val(),
                "port" : $("#elasticAuthPort_"+id).val(),
                "protocol" : $("#elasticAuthProtocol_"+id).val()
            }
            domainObj.hosts.push(hostObj);
        }

        var data = {
            name: ELASTIC_CONFIG_PROPERTY,
            value: JSON.stringify(domainObj)
        };

        upsertDomainProperty(data, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
                $("#domainModal").modal('hide');
            } else {
                errorMsg('Error in elastic config update')
            }

            $(".btnModal").attr('disabled',false);
        }) 
    }

    $(".btnModal").attr('disabled',true);
}

function getElasticConfig() {
    getDomainProperty(ELASTIC_CONFIG_PROPERTY, function (status, data) {
        if (status) {
            elastic_config_obj = JSON.parse(data.value);
            $('#elasticConfigCheck').prop('checked', elastic_config_obj.authenticate);
            $("#elasticAuthUser").val(elastic_config_obj.user);
            $("#elasticAuthPwd").val(elastic_config_obj.password);

            let hostList = elastic_config_obj.hosts;
            $("#addMoreHostForm").html("");
            if(hostList.length > 0){
                all_host_list = [];
                for(let i=0;i<hostList.length;i++){
                    let id = guid();
                    all_host_list.push(id);
                    renderHostList(hostList[i], id);
                }
            }else{
                addMoreHost();
            }
        } else {
            elastic_config_obj = null;
            addMoreHost();
        }

        switchElasticAuth();
    });
}

function switchElasticAuth(){

    let flag = Boolean($("#elasticConfigCheck:checked").val());
    if(flag){
        $("#elasticConfigAuthView").show();
        $("#elasticAuthUser").attr("required", true);
        $("#elasticAuthPwd").attr("required", true);
    }else{
        $("#elasticConfigAuthView").hide();
        $("#elasticAuthUser").removeAttr("required");
        $("#elasticAuthPwd").removeAttr("required");
    }
}

function renderHostList(hostObj, id){

    const addHtml = `<div class="row m-5 add-more-host" id="addMoreHost_${id}">
            <div class="form-group">
                <label class="mb-2" for="elasticAuthProtocol_${id}">Protocol</label>
                <select class="form-control input-sm" id="elasticAuthProtocol_${id}">
                    <option value="https">https://</option>
                    <option value="http">http://</option>
                </select>
            </div>

            <div class="form-group" style="margin-left:10px;">
                <label class="mb-2" for="elasticAuthHost_${id}">Host <span class="text-danger">*</span></label>
                <input type="text" id="elasticAuthHost_${id}" maxlength="100" class="form-control input-sm" required autocomplete="off" placeholder="0.0.0.0"  />
            </div>
            
            <div class="form-group" style="margin-left:10px;">
                <label class="mb-2" for="elasticAuthPort_${id}">Port <span class="text-danger">*</span>
                    </label>
                <input type="text" id="elasticAuthPort_${id}" maxlength="100" class="form-control input-sm" required autocomplete="off" placeholder="9200" />
            </div>

            <a href="javascript:void(0);" href="javascript:void(0);" onclick="addMoreHost('`+id+`')" style="margin-top: 32px; margin-left: 20px;text-decoration: none;">
                <i class="fas fa-plus-circle" style="font-size: 20px; "></i>
            </a>

            <a href="javascript:void(0);" class="host-remove-btn" href="javascript:void(0);" onclick="removeHost('`+id+`')" style="margin-top: 32px; margin-left: 10px;text-decoration: none;">
                <i class="fas fa-minus-circle" style="font-size: 20px; "></i>
            </a>
        </div>`;

        $("#addMoreHostForm").append(addHtml);

        $("#elasticAuthProtocol_"+id).val(hostObj.protocol ? hostObj.protocol : "");
        $("#elasticAuthHost_"+id).val(hostObj.host ? hostObj.host : "");
        $("#elasticAuthPort_"+id).val(hostObj.port ? hostObj.port :"");

        if(all_host_list.length == 1){
            $(".host-remove-btn").hide();
        }else{
            $(".host-remove-btn").show();
        }
}

function addMoreHost(){

    let id= guid();
    // let id= $(".add-more-host").length + 1;
    const addHtml = `<div class="row m-5 add-more-host" id="addMoreHost_${id}">
                        <div class="form-group">
                            <label class="mb-2" for="elasticAuthProtocol_${id}">Protocol</label>
                            <select class="form-control input-sm" id="elasticAuthProtocol_${id}">
                                <option selected value="https">https://</option>
                                <option value="http">http://</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-left:10px;">
                            <label class="mb-2" for="elasticAuthHost_${id}">Host <span class="text-danger">*</span></label>
                            <input type="text" id="elasticAuthHost_${id}" maxlength="100" class="form-control input-sm" required autocomplete="off" placeholder="0.0.0.0"  />
                        </div>
                        
                        <div class="form-group" style="margin-left:10px;">
                            <label class="mb-2" for="elasticAuthPort_${id}">Port <span class="text-danger">*</span>
                               </label>
                            <input type="text" id="elasticAuthPort_${id}" maxlength="100" class="form-control input-sm" required autocomplete="off" placeholder="9200" />
                        </div>

                        <a href="javascript:void(0);" onclick="addMoreHost('`+id+`')" style="margin-top: 32px; margin-left: 20px;text-decoration: none;">
                            <i class="fas fa-plus-circle" style="font-size: 20px; "></i>
                        </a>

                        <a class="host-remove-btn" href="javascript:void(0);" onclick="removeHost('`+id+`')" style="margin-top: 32px; margin-left: 10px;text-decoration: none;">
                            <i class="fas fa-minus-circle" style="font-size: 20px; "></i>
                        </a>
                    </div>`;

    all_host_list.push(id);
    $("#addMoreHostForm").append(addHtml);
    $(".host-remove-btn").show();
}

function removeHost(id){
    $("#addMoreHost_"+id).remove();
     all_host_list = all_host_list.filter(value => value !== id);

    if(all_host_list.length == 1){
        $(".host-remove-btn").hide();
    }else{
        $(".host-remove-btn").show();
    }
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

function getLicenseDetails(){
    getDomainLicense(function(status, data){
        if(status){
            dom_lic_obj = data;
            active_plan_obj = PLANS_LIST[dom_lic_obj.plan];
            renderPlanCard(active_plan_obj);
            getPlanUsage(dom_lic_obj);
        }
    });
}

function renderPlanCard(obj){

    let plan = obj.details;
    let plan_name = obj.plan_title.toLowerCase();
    let loadHtml = ``;

    loadHtml = `<div class="ds-disp">
    <div style="text-align: center;">
      <div class="ds-plan-header-box `+plan_name+`Price">
        <b><i class="fa fa-check-circle"></i> Active Plan</b>
      </div>
    </div>
    <div class="ds-plan-box `+plan_name+`UlBorder">
      <div class="ds-plan-heading `+plan_name+`-plan-heading">
       <span id="currentPlanTitle">
            <span>
                <img src="images/plans/`+plan_name+`-plan.png" style="height: 30px;">
                <b style="text-transform:capitalize">`+plan_name+` Plan</b> 
                <span class="ds-plan-price">$`+obj.price+`</span>
            </span>
       </span>
       <span>
          <button onclick="gotoBilling()" type="button" class="btn btn-primary upgrade-btn `+plan_name+`-plan-btn"><i class="fa fa-shopping-cart" aria-hidden="true"></i> Upgrade</button>
       </span>
      </div>
      <ol class="plan-items p-0 plan-features">
        <li class="`+plan_name+`_evenBg">Data points</li>
        <li>API Hits</li>
        <li class="`+plan_name+`_evenBg">Devices</li>
        <li>Connected Devices</li>
        <li class="`+plan_name+`_evenBg">Tenants (Domains)</li>
        <li>Add-On Subscription</li>
        <li class="`+plan_name+`_evenBg"> Data Retentions</li>
        <li>Support</li>
      </ol>
      
      <ol class="plan-items plan-qty rates p-0">
        <li id="dataPoints" class="`+plan_name+`_evenBg m-0">`+plan.data_points+`</li>
        <li id="apiHits" class="m-0">`+plan.api_hits+`</li>
        <li id="devicesLimit" class="`+plan_name+`_evenBg m-0">`+plan.devices+`</li>
        <li id="connectedDevices" class="m-0">`+plan.connected_devices+`</li>
        <li id="tenantsLimit" class="`+plan_name+`_evenBg m-0">`+plan.tenants+`</li>
        <li id="addOnSubs" class="m-0">`+(plan.add_on_subscription ? "Yes" : "No")+`</li>
        <li id="dataRententions" class="`+plan_name+`_evenBg m-0">`+plan.data_retentions+`</li>
        <li id="support" style="text-transform: capitalize;" class="m-0">`+plan.support+`</li>
      </ol>
    </div>
  </div>`

  $("#currentPlanTemplateLoader").html(loadHtml);
}

function getPlanUsage(){

    let data = {
        "accountId" : dom_lic_obj.accountId,
        "planId" : dom_lic_obj.planId
    };

    getClusterMonthlyUsagePlan(data, function(status, res){
        if(status){
            current_plan_usage = res;
            chartTemplateLoader();
        }
    });
}

function chartTemplateLoader(){

    let charts = [
        {
            chartId : 'apiHitsChart',
            chartTitle : ((active_plan_obj.details.api_hits - current_plan_usage.apiHits) < 1) ? `<i class='fa fa-circle' style="color:red"></i> API Hits` : `<i class='fa fa-circle' style="color:#4caf50"></i> API Hits`,
            chartData : [
                { value: (active_plan_obj.details.api_hits - current_plan_usage.apiHits), name: 'Remaining' },
                { value: current_plan_usage.apiHits, name: 'Used' }
            ],
            subTitle: current_plan_usage.apiHits + `/ <i class='fa fa-cogs'></i> ` + active_plan_obj.details.api_hits,
            title: "Api Hits"
        },
        {
            chartId : 'dataPointsCountChart',
            chartTitle : ((active_plan_obj.details.data_points - current_plan_usage.dataPoints) < 1) ? `<i class='fa fa-circle' style="color:red"></i>` : `<i class='fa fa-circle' style="color:#4caf50"></i>`+` Data Points`,
            chartData : [
                { value: (active_plan_obj.details.data_points - current_plan_usage.dataPoints), name: 'Remaining' },
                { value: current_plan_usage.dataPoints, name: 'Used' }
              ],
            subTitle: current_plan_usage.dataPoints + `/ <i class='fa fa-database'></i> ` + active_plan_obj.details.data_points,
            title: "Data Points"
        },
        {
            chartId : 'domainsCountChart',
            chartTitle : ((active_plan_obj.details.tenants - current_plan_usage.domains) < 1) ? `<i class='fa fa-circle' style="color:red"></i>` : `<i class='fa fa-circle' style="color:#4caf50"></i>`+` Domains`,
            chartData : [
                { value: (active_plan_obj.details.tenants - current_plan_usage.domains), name: 'Remaining' },
                { value: current_plan_usage.domains, name: 'Used' }
              ],
            subTitle: current_plan_usage.domains + `/ <i class='fa fa-globe'></i> ` + active_plan_obj.details.tenants,
            title: "Domains"
        },
        {
            chartId : 'devicesCountChart',
            chartTitle: ((active_plan_obj.details.devices - current_plan_usage.devices) < 1) ? `<i class='fa fa-circle' style="color:red"></i> Devices` : `<i class='fa fa-circle' style="color:#4caf50"></i>`+` Devices`,
            chartData : [
                { value: (active_plan_obj.details.devices - current_plan_usage.devices), name: 'Remaining' },
                { value: current_plan_usage.devices, name: 'Used' }
              ],
            subTitle: current_plan_usage.devices + `/ <i class='fa fa-hdd'></i> ` + active_plan_obj.details.devices,
            title: "Devices"

        },
        {
            chartId : 'connectedDevicesCountChart',
            chartTitle : ((active_plan_obj.details.connected_devices - current_plan_usage.connectedDevices) < 1) ? `<i class='fa fa-circle' style="color:red"></i> ` : `<i class='fa fa-circle' style="color:#4caf50"></i>`+` Connected Devices`,
            chartData : [
                { value: (active_plan_obj.details.connected_devices - current_plan_usage.connectedDevices), name: 'Remaining' },
                { value: current_plan_usage.connectedDevices, name: 'Used' }
              ],
            subTitle: current_plan_usage.connectedDevices + `/ <i class='fa fa-wifi'></i> ` + active_plan_obj.details.connected_devices,
            title: "Connected Devices"

        }
    ];

    $("#usageChartLoader").html("");

    for(let i=0;i<charts.length;i++){
       renderUsageCharts(charts[i], current_plan_usage);
    }
}

function renderUsageCharts(chartObj, planUsage){

    let chartId = chartObj.chartId;
    let chartTitle = chartObj.chartTitle;
    let subTitle = chartObj.subTitle;

    return new Promise(function(resolve) {

       $("#usageChartLoader").append(`
                    <div class="col-lg-4">
                        <div class="ds-disp">
                            <div class="ds-chart-box" id="`+chartId+`" ></div>
                            <p class="ds-chart-title">`+chartTitle+`</p>
                            <p class="ds-chart-title-sm">`+subTitle+`</p>
                        </div>
                    </div>`);

        let dom = document.getElementById(chartId);
        let myChart = echarts.init(dom, null, {
            renderer: "canvas",
            useDirtyRect: false,
        });
    
        let option;
        let total = 0;
        let chartData = chartObj.chartData;
          chartData.forEach(function(item) {
            total += item.value;
        });
    
        option = {
            tooltip: {
              trigger: 'item'
            },
            series: [
              {
                name: chartObj.title,
                type: 'pie',
                color: ["#4caf50","#cccccc"],
                radius: ['62%', '80%'],
                avoidLabelOverlap: true,
                tooltip: {
                    position: function (point, params, dom, rect, size) {
                        return [point[0] < size.viewSize[0] ? 'left' : 'right', point[1] < size.viewSize[1] ? 'bottom' : 'top'];
                    }
                },
                itemStyle: {
                  borderRadius: 0,
                  borderColor: '#ffffff',
                  borderWidth: 3
                },
                label: {
                    show: true,
                    emphasis: {
                        show: true,
                    },
                    position: 'center',
                    formatter: function (data) {
                        var percentage = (data.value / total * 100).toFixed(1);
                        return '\n{boldValue|' + percentage + '%}'+ '\n\n' +data.name;
                    },
                    textStyle: {
                        fontSize: 12,
                        rich: {
                            boldValue: {
                                fontWeight: 'bold',
                                fontSize: 19
                            }
                        }
                    }
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }
                },
                labelLine: {
                  show: false
                },
                data: chartData
              }
            ]
          };
    
        if (option && typeof option === "object") {
            myChart.setOption(option);
          }
        
          window.addEventListener("resize", myChart.resize);

          resolve();
    });
}


function gotoBilling(){
    var pathapi = $("#billingApi").val();
    $.ajax({
        url: pathapi,
        data: JSON.stringify(USER_OBJ),
        contentType: "application/json",
        type: 'POST',
        success: function (res) {
            
        },
        error: function (e) {
            
        }
    });
}

/* getProperty = (pty) => {
    return prop.get(pty);
} */