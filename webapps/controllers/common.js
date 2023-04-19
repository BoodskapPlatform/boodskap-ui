
var themeProp = {};
$(document).ready(function () {
    // getDomainTheme()
    setTimeout(() => {
        $(".VIpgJd-ZVi9od-xl07Ob-lTBxed").attr("href","javascript:void(0);")
       }, 0);
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
        //$("#domainModal").modal('show');

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

function assignVersion() {
    //$("#device_model").val() === '' ? $("#device_version").val('') && $("#device_desc").val('') : '' ;
    for(var i=0;i<device_model_list.length;i++){
        if($("#device_model").val() === device_model_list[i].id){
            $("#device_version").val(device_model_list[i].version);
            $("#device_desc").val(device_model_list[i].description);
        }     
        
    }
    if($("#device_model").val() === 'newmodel'){
        togglemodel('newmodel');
        $("#new_device_model").val("");
    }else if($("#device_model").val() === null){
        togglemodel('newmodel')     
    }else{
        togglemodel('choose')  
    }
}

var choosemodel= false;
var modelmode = 'new';
function togglemodel(check) {
    if(check === 'edit'){      
       choosemodel=true;  
       modelmode = 'edit'   
       $(".new-model").addClass('d-none');
       $(".togeditmodel").removeClass('d-none');
       $("#device_version").removeAttr('disabled','disabled');  
       $("#device_desc").removeAttr('disabled','disabled');
   }else if(check === 'newmodel'){
       choosemodel=false;  
       modelmode = 'new';               
       $(".togeditmodel").addClass('d-none');
       $(".new-model").removeClass('d-none');
       $("#device_version").removeAttr('disabled');
       $("#device_desc").removeAttr('disabled');
       $("#device_version").val('');
       $("#device_desc").val('');
   }
   else{
       choosemodel=true; 
       modelmode = 'choose';
       $(".new-model").addClass('d-none');
       $(".togeditmodel").removeClass('d-none');
       $("#device_version").attr('disabled','disabled');  
       $("#device_desc").attr('disabled','disabled');
    } 
 
}

function enableFn(id){
    $('#'+id).attr('disabled',false)
}
function disableFn(id){
    $('#'+id).attr('disabled',true)
}

//  Modal Backdrop when it Expand
var isExpand = false;

$('a[data-click=panel-expand]').on('click', function() {
    isExpand = !isExpand 
    isExpand? $('.modal').addClass('mdbg') : $('.modal').removeClass('mdbg')
  });

  function addBG(){
    isExpand = !isExpand 
    isExpand? $('.modal').addClass('mdbg') : $('.modal').removeClass('mdbg')
 
   }