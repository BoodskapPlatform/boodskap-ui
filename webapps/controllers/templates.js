var templateTable = null;
var template_list = [];
var current_template_name = null;

$(document).ready(function () {

    if (ADMIN_ACCESS) {
        $(".systemTemplate").css('display', 'block');
    } else {
        $(".systemTemplate").css('display', 'none');
    }
    loadTemplates();



    $("body").removeClass('bg-white');

});


function loadTemplates() {


    if (templateTable) {
        templateTable.destroy();
        $("#templateTable").html("");
    }

    var fields = [
        {
            mData: 'name',
            sTitle: 'Template Name',
            sWidth: '15%',
        },
        {
            mData: 'code',
            sTitle: 'Template Code',
            orderable: false,
            sWidth:'65%',
            mRender: function (data, type, row) {

                if(data) {

                    data = data.replace(/&/g, "&amp");
                    data = data.replace(/</g, "&lt");
                    data = data.replace(/>/g, "&gt");
                }else{
                    data = '';
                }

                return '<code style="white-space: pre-line;max-height: 200px;overflow: auto;    display: flex;">' + (data) + '</code>';
            }
        },
        {
            mData: 'lang',
            sTitle: 'Language',
            sWidth: '10%',
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '20%',
            mRender: function (data, type, row) {

                var str = '<button class="btn  bskp-trash-btn" onclick="openModal(4,\'' + row['name'] + '\')"> <img class="" src="images/trash2.SVG" alt=""> </button>'

                    if($("input[name='systemFlag']:checked").val() === true || $("input[name='systemFlag']:checked").val() === "true"){
                        str = "";
                    }

                return '<button class="btn bskp-edit-btn mr-2" onclick="openModal(5,\'' + row["name"] + '\')"><img class=""   src="images/edit.SVG"  alt=""></button>' +
                    str;
            }
        }

    ];


    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: false,
        scrollY: '350px',
            scrollCollapse: true,
        paging: true,
        searching: true,
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        dom: '<"bskp-search-left" f> lrtip',
        language: {
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
         "searchPlaceholder": "Search by Template Name",
         "zeroRecords": "No data available",
       
            loadingRecords: '',
            paginate: {
                previous: 'Previous',
                next: 'Next'
            },

        },
        aoColumns: fields,
        data: []
    };

    listTemplates(1000, $("input[name='systemFlag']:checked").val(), function (status, data) {
        if (status && data.length > 0) {
            tableOption['data'] = data;
            template_list = data;
            $(".templateCount").html(data.length)
        } else {
            $(".templateCount").html(0)
        }

        templateTable = $("#templateTable").DataTable(tableOption);
    })


}
var codeEditor = null;
function openModal(type,id) {

    if (codeEditor) {
        codeEditor.destroy();
    }

    $("#codeEditor").html("");

    codeEditor = ace.edit("codeEditor");
    codeEditor.setTheme("ace/theme/monokai");
    // codeEditor.setTheme("ace/theme/solarized_light");
    // codeEditor.setTheme("ace/theme/eclipse");
    // codeEditor.setTheme("ace/theme/tomorrow_night");
    codeEditor.session.setMode("ace/mode/groovy");
    codeEditor.getSession().setUseWrapMode(true);
    codeEditor.setShowPrintMargin(false);

    if (type === 1) {
        $("#template_name").removeAttr('readonly');
        $(".templateAction").html('Create');
        $("#addTemplate form")[0].reset();
        $("#addTemplate").modal({
            backdrop: 'static',
            keyboard: false
        });
        $("#addTemplate form").attr('onsubmit','addTemplate()')
    }else if (type === 2) {
        $("#uploadTemplate form")[0].reset();
      $('#uploadTemplate').modal({ backdrop: 'static', keyboard: false })

        $("#uploadTemplate").modal('show');
    }else if (type === 3) {
        downloadTemplates( $("input[name='systemFlag']:checked").val(), function (status, data) {

            if(status) {
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.id = "downloadFile"
                $("#downloadFile").css('display', 'none')

                // var blob = new Blob([data], {type: 'application/json'}),
                //   url = window.URL.createObjectURL(blob);
                var url = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);

                a.href = url;
                a.download = USER_OBJ.domainKey + "_templates.json";
                a.click();
                window.URL.revokeObjectURL(url);
            }else{
                errorMsg('Error in download')
            }
        })
        
    }else if (type === 4) {
     $('#deleteModal').modal({ backdrop: 'static', keyboard: false })

        current_template_name = id;
        $(".templateName").html(id)
        $("#deleteModal").modal('show');
        

        

    }else if (type === 5) {
        $(".templateAction").html('Update');
        var obj ={};
        current_template_name = id;

        for(var i=0;i<template_list.length;i++){
            if(id === template_list[i].name){
                obj = template_list[i];
            }
        }
        $("#template_name").attr('readonly','readonly');

        obj.code ? codeEditor.setValue(obj.code) : '';
        codeEditor.clearSelection();
        codeEditor.focus();

        $("#template_name").val(obj.name);
        $("#template_lang").val(obj.lang);
        $("#template_code").val(obj.code);
        $("#addTemplate").modal({
            backdrop: 'static',
            keyboard: false
        });
        $("#addTemplate form").attr('onsubmit','updateTemplate()')
    }

    
}


function addTemplate() {

    var tempObj = {
        "name": $("#template_name").val(),
        "lang": $("#template_lang").val(),
        "code": codeEditor.getSession().getValue(), //$("#template_code").val(),
    }

    $(".btnSubmit").attr('disabled','disabled');


    retreiveTemplate(tempObj.name, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('Template name already exist', 'template_name');

        }
        else if($("#template_name").val()==""){
            $("#template_error").text("Please fill out this field !")
            $("#template_name").css({"border-color":"red"})
    
            setTimeout(function(){
                $("#template_name").css({"border":""})
                $("#template_error").text("")
    
            },2000)
            $(".btnSubmit").removeAttr('disabled');}
            
            
        else {
            upsertTemplate(tempObj, $("input[name='systemFlag']:checked").val(), function (status, data) {
                if (status) {
                    successMsg('Template Created Successfully');
                    loadTemplates();
                 $("#addTemplate").modal('hide');
                } else {
                    errorMsg('Error in Creating Template')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
}


function updateTemplate() {

    var tempObj = {
        "name": $("#template_name").val(),
        "lang": $("#template_lang").val(),
        "code": codeEditor.getSession().getValue(), //$("#template_code").val(),
    }

    $(".btnSubmit").attr('disabled','disabled');


    upsertTemplate(tempObj, $("input[name='systemFlag']:checked").val(), function (status, data) {
        if (status) {
            successMsg('Template Updated Successfully');
            loadTemplates();
            $("#addTemplate").modal('hide');
        } else {
            errorMsg('Error in Updating Template')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    deleteTemplate(current_template_name, $("input[name='systemFlag']:checked").val(), function (status, data) {
        if (status) {
            successMsg('Template Deleted Successfully');
            loadTemplates();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}

function uploadFile(file, system){

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {

        if (xhr.status === 200) {
            $("#uploadTemplate").modal('hide');
            loadTemplates()
            successMsg('New Template uploaded successfully!');
        } else {
            errorMsg('Error in template upload!');
        }
        $("#uploadBtn").html('Upload Template');
    }
    };
    xhr.open('POST', API_BASE_PATH+'/templates/upload/'+USER_OBJ.token+"?system="+system, true);
    var formData = new FormData();
    formData.append("jsonfile", file, file.name);
    xhr.send(formData);
}

function uploadTemplate(){

    var fileInput = document.getElementById("templateFile");

    var files = fileInput.files;

    if(files.length === 0){
        // errorMsg('File not found. select a file to start upload');

        $("#file_error").text("File not found. select a file to start upload");
        $("#templateFile").css({"border-color":"red"})
        setTimeout(function(){
            $("#file_error").text("");
            $("#templateFile").css({"border-color":""})
        },2000)
        return false;
    }

    uploadFile(files[0], $("input[name='systemFlag']:checked").val());
    $("#uploadBtn").html('<i class="icon-spinner icon-spin"></i> Uploading in progress');


}