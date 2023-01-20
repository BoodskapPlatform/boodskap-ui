
var themeProp = {};
$(document).ready(function () {
    getDomainTheme()
});

function getDomainTheme() {
    getDomainProperty(DOMAIN_THEME_PROPERTY, function (status, data) {
        if (status) {

            themeProp = JSON.parse(data.value);
            header 
 $("#header").css('background-color', themeProp.headerBg)
 
 
            $(".headerBg").css('background-color', themeProp.headerBg)
            $(".subHeaderBg").css('background-color', themeProp.subHeaderBg)
            $(".bskp-submenu2 li").css('background-color', themeProp.subHeaderBg)
             
            $(".panelHeaderBg").css('background-color', themeProp.panelHeaderBg)
            $(".bskp-page-topic").css('background-color', themeProp.panelHeaderBg)
            
            $(".bodyBg").css('background-color', themeProp.bodyBg)
            $("body").css('background-color', themeProp.bodyBg)

            $(".headerBg").css('color', themeProp.textColor)

            $(".user_profile_name, .bskp-submenu2 a, .menulink a, .goog-te-menu-value > span").css('color', themeProp.textColor)
            $(".subHeaderBg").css('color', themeProp.textColor)

        }

        $("#bodyLayout").val(themeProp.layout ? themeProp.layout : DEFAULT_THEME.layout);


        if ($("#bodyLayout").val() === 'container') {
            $(".divPanel").css('width', '50%')
        } else {
            $(".divPanel").css('width', '100%')
        }

        /* $('#headerBg').colorpicker({
            color: themeProp.headerBg ? themeProp.headerBg : DEFAULT_THEME.headerBg,
            format: 'hex'
        });
        $('#subHeaderBg').colorpicker({
            color: themeProp.subHeaderBg ? themeProp.subHeaderBg : DEFAULT_THEME.subHeaderBg,
            format: 'hex'
        });
        $('#panelHeaderBg').colorpicker({
            color: themeProp.panelHeaderBg ? themeProp.panelHeaderBg : DEFAULT_THEME.panelHeaderBg,
            format: 'hex'
        });
        $('#textColor').colorpicker({
            color: themeProp.textColor ? themeProp.textColor : DEFAULT_THEME.textColor,
            format: 'hex'
        });
        $('#bodyBg').colorpicker({
            color: themeProp.bodyBg ? themeProp.bodyBg : DEFAULT_THEME.bodyBg,
            format: 'hex'
        }); */

        /*$("#headerBg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true
        });
        $("#headerBg").spectrum("set", themeProp.headerBg ? themeProp.headerBg : DEFAULT_THEME.headerBg);
        $("#subHeaderBg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true
        });
        $("#subHeaderBg").spectrum("set", themeProp.subHeaderBg ? themeProp.subHeaderBg : DEFAULT_THEME.subHeaderBg);
        $("#panelHeaderBg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true
        });
        $("#panelHeaderBg").spectrum("set", themeProp.panelHeaderBg ? themeProp.panelHeaderBg : DEFAULT_THEME.panelHeaderBg);
        $("#textColor").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true
        });
        $("#textColor").spectrum("set", themeProp.textColor ? themeProp.textColor : DEFAULT_THEME.textColor);

        $("#bodyBg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true
        });
        $("#bodyBg").spectrum("set", themeProp.bodyBg ? themeProp.bodyBg : DEFAULT_THEME.bodyBg);*/
        $("#domainModal").modal('show');

    })
}

function IsAlphabet(e) {
    var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
    var ret = ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122));
    return ret;
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}