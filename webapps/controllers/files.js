var fileTable = null;
var file_list = [];
var current_file_id = null;
var current_file_obj = {};
// var page_size = 50;
var page_size = 50;
var page_from = 0;
var totalCount = 0;
var tCount = 0;
var bulkId = [];
var getId = [];
var deleteId = [];

$(document).ready(function () {
    $(".loadMore").hide();
    loadFiles();
    $("body").removeClass('bg-white');
});


function loadFiles(fileType) {
    var searchText = $("#searchText").val();


    var queryParams = {
        query: {
            "bool": {
                "must": [],
                "should": [],
            }
        },
        from: page_from,
        size: page_size
    };

    var domainKeyJson = { "match": { "domainKey": DOMAIN_KEY } };

    delete queryParams.query['bool']["minimum_should_match"];

    if (searchText) {

        queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + searchText.toLowerCase() + "*" } })
        queryParams.query['bool']['should'].push({ "wildcard": { "mediaType": "*" + searchText.toLowerCase() + "*" } })
        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + searchText.toLowerCase() + "*" } })
        queryParams.query['bool']["minimum_should_match"] = 1;

    }
    if (fileType) {

        var fileData = fileType.toString();
        var fileTypeJson = { "match": { "isPublic": fileData } };

        queryParams.query['bool']['must'].push(fileTypeJson);

        // if(fileType === 'false'){
        queryParams.query['bool']['must'].push(domainKeyJson);
        // }


    } else {
        queryParams.query['bool']['must'].push(domainKeyJson);
    }
    $(".fileList").html('');

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    searchByQuery('', 'FILE_PUBLIC', searchQuery, function (status, res) {
        if (status) {
            var resultData = QueryFormatter(res).data;
            totalCount = resultData.recordsTotal;
            file_list = resultData['data'];
            file_list.forEach((datas) => {
                var ids = datas._id;
                getId.push(ids);
            })
            $(".filesCount").html(resultData.recordsFiltered)
            // $(".filesCount").html( file_list.length)
            $(".loadingButton").hide();
            tCount += file_list.length;
            if (file_list.length > 0) {

                $(".loadMore").show();
                for (var i = 0; i < file_list.length; i++) {
                    $(".fileList").append(renderHtml(file_list[i]));
                }
            } else {

                $(".fileList").html('<div class="col-md-12" style="text-align: center"><label>No Files Found!</label></div>');
                $(".loadMore").hide();

            }

            // condition to display load more

            if (totalCount > tCount) {
                $(".loadMore").show();
            }
            else {
                $(".loadMore").hide();
            }
            var clipboard = new ClipboardJS('.cpyBtn');

            clipboard.on('success', function (e) {
                successMsg('Link copied successfuly')
                e.clearSelection();
            });

            clipboard.on('error', function (e) {
                errorMsg('Error in copying link')
            });


        } else {
            if (!flag) {
                $(".loadMore").hide();
                file_list = [];
                $(".fileList").html('<div class="col-md-12" style="text-align: center"><label>No Files Found!</label></div>');
            }
        }
    })
}

function loadMorePage() {
    $(".loadingButton").show();
    $(".loadingButton").removeClass('d-none');
    $(".loadMoreButton").hide();
    page_from = page_from + page_size;
    loadFiles(true);
}

function renderHtml(obj) {
    var srcPath = '';
    var fileType = '';

    if (obj.isPublic) {
        srcPath = API_BASE_PATH + '/files/public/download/' + obj.id + '?' + new Date().getTime();
        // fileType = '<span class="label label-success" title="Public - Open to the World"><i class="icon-unlock"></i></span>'
    } else {
        srcPath = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + obj.id + '?' + new Date().getTime();
        // fileType = '<span class="label label-danger" title="Private"><i class="icon-lock2"></i></span>'
    }

    var actStr = '';


    if (obj.domainKey === DOMAIN_KEY) {
        actStr = `<a class="btn btn-default btn-xs" title="Edit" onclick="openModal(2,'` + obj.id + `')" style="background-color:white;font-size:15px;padding-top:7px;margin-top: 1px;margin-right: 0px;font-size: 17px;border: none;border-left: 1px solid #d3d3d380;border-radius: 0px;"><img id="edit-img" style="filter: brightness(0.8);" src="../webapps/images/edit_icon.svg" alt=""></a>
        <a class="btn btn-default btn-xs" title="Delete" onclick="openModal(3,'` + obj.id + `')" style="background-color:white;font-size:15px;padding-top:9px;margin-top: 0px;margin-left: 10px;font-size: 18px;border: none;border-left: 1px solid #d3d3d380;border-radius: 0px;"><img id="delete-img" style="width: 29px;height: 30px;margin-top: -1px;filter: brightness(0.8);" src="../webapps/images/Delete2.svg" alt="">
        </a>`;
    }

    var imgTag = '';

    if (obj.mediaType && obj.mediaType.split('/')[0] !== 'image') {
        imgTag = '<i class="icon-file-text-o" style="font-size: 2rem;"></i><p>' + obj.description + '</p>'
    } else {
        imgTag = '<img class="img-fluid" src="' + srcPath + '" title="' + (obj.tags ? obj.tags : '') + '" style="margin-top:25px;padding-top: 25px;padding-right: 10px;" />'
    }

    var mediaTag = obj.mediaType ? '<small class="' + obj.id + ' hide" style="position: absolute;left:10px;bottom: 0px;background-color: #3333339c;color: #fff;">' + obj.mediaType + '</small>' : '';


    var str = `
            <div class="col-sm-12 col-md-6 col-lg-3" style="margin-top:15px;margin-bottom: 35px;" id="card-data">
                <span id="img-name" style = "font-size:18px;margin-top:5px;margin-left:32px;padding-top: 12px;font-weight: 600;color:black;">`+ obj.description + `</span> <label class="container"><input id="check-box" onchange="checkboxes('` + obj.id + `',this)" type="checkbox"><span class="checkmark"></span>
              </label>
                <div class="colBase" onclick="toggleBtn(1,'`+ obj.id + `')" style="height: 106%;border-radius: 15px;box-shadow: 0px 0px 3px 3px #ededed;">
                        `+ fileType + `
                       `+ imgTag + `

                </div>
              
              <p class="btn-group btn-group-justified `+ obj.id + ` " style="top:89%;left:24%;position:absolute;" id="action-buttons">
              <a class="btn btn-default btn-xs" id="download-btn" title="Download" onclick="downloadFile('` + obj.id + `')" data-clipboard-text="` + srcPath + `" style="font-size:15px;background-color:white;border: none;font-size: 16px;padding-right: 9px;margin-top: 6px;"><img id="download-img" style="width: 27px;height: 27px;filter: brightness(0.5);" src="../webapps/images/Download2.svg" alt=""></a> 
               <a class="btn btn-default btn-xs cpyBtn" id="copy-btn" title="Copy Link" data-clipboard-text="`+ srcPath + `" style="font-size:15px;background-color:white;margin-right: 8px;font-size: 18px;border: none;border-left: 1px solid #d3d3d380;border-radius: 0px;padding-left: 9px;margin-top: 6px;"><img id="copy-img" style="width: 27px;height: 27px;filter: brightness(0.5);" src="../webapps/images/Copy.svg" alt=""></a>
             `+ actStr + `
          </p>
            </div>
               `;

    /*var str = `<div class="col-md-3" style="margin-bottom: 5px;">
                   <div style="" class="fileBlock">
                   ` + fileType + `
                       <div class="btn-group btn-group-justified" style="position: absolute;right:10px;top:0px">
                           <a class="btn btn-default btn-xs" onclick="openModal(2,'` + obj.id + `')"><i class="icon-edit2"></i></a>
                           <a class="btn btn-default btn-xs" onclick="openModal(3,'` + obj.id + `')"><i class="icon-trash4"></i></a>
                       </div>
                       <img src="` + srcPath + `" style=""/>
                       <div style="height:90px;">
                           ` + (obj.tags ? '<label>'+obj.tags+'</label><br>' : '') + `
                           <small>` + obj.description + ` ` + (obj.mediaType ? '('+obj.mediaType+')' : '') + `</small><br>
                           <a href="` + srcPath + `" target="_blank" style="font-size: 10px;word-break: break-word;color:#333">` + srcPath + `</a>
                       </div>
                   </div>
               </div>
   `;*/
    return str;
}


function toggleBtn(type, id) {
    if (type === 1) {
        $("." + id).removeClass('hide')
    } else {
        $("." + id).addClass('hide')
    }

}

function openModal(type, id) {
    current_file_obj = {};
    if (type === 1) {

        current_file_id = null;

        $("#uploadFile").prop('required', true);

        $("#uploadBtn").html("Upload File");

        $(".fileAction").html('Add');
        $(".imgBlock").html('')
        $("#addFile form")[0].reset();
        $("#addFile").modal('show');
        $("#addFile form").attr('onsubmit', 'addFile()')

    }
    else if (type === 2) {

        $(".fileAction").html('Update');
        $("#uploadBtn").html("Update File");
        // $('#uploadFile').attr('placeholder','No file chosen');
        var obj = {};
        current_file_id = id;
        $(".imgBlock").html('<img class="imgFile" style="width: 75px;height:75px" />')

        for (var i = 0; i < file_list.length; i++) {
            if (id === file_list[i].id) {
                obj = file_list[i];
            }
        }

        current_file_obj = obj;

        var srcPath = '';

        if (obj.isPublic) {
            srcPath = API_BASE_PATH + '/files/public/download/' + obj.id + '?' + new Date().getTime();
        } else {
            srcPath = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + obj.id + '?' + new Date().getTime();
        }

        $(".imgFile").attr('src', srcPath)

        $("#uploadFile").removeAttr('required')


        $("#file_tags").val(obj.tags);
        $("#file_desc").val(obj.description + '?' + new Date().getTime());
        $("#file_type").val(obj.isPublic.toString());
        $("#addFile").modal('show');
        $("#addFile form").attr('onsubmit', 'updateFile()')

    }
    else if (type === 3) {
        current_file_id = id;
        for (var i = 0; i < file_list.length; i++) {
            if (id === file_list[i]._id) {
                current_file_obj = file_list[i];
            }
        }

        $("#deleteModal").modal('show');

    }
}


function addFile() {
    uploadFile();
    loadFiles();
}


function updateFile() {

    $(".btnSubmit").attr('disabled', 'disabled');
    uploadFile();

}


function proceedDelete() {

    if (current_file_id) {
        deleteFile(current_file_id, current_file_obj.isPublic, function (status, data) {
            if (status) {
                successMsg('File Deleted Successfully');
                setTimeout(function () {
                    loadFiles();
                }, 1000)
                $("#deleteModal").modal('hide');
            } else {
                errorMsg('Error in delete')
            }
        })
    }
    else if (bulkId.length > 0) {
        bulkId.forEach((data) => {
            deleteFile(data, current_file_obj.isPublic, function (status, data) {
                if (status) {
                    successMsg('File Deleted Successfully');
                    setTimeout(function () {
                        loadFiles();
                    }, 1000)
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
        })
        $("#checked-count").html(document.querySelectorAll('input[type="checkbox"]:checked').length);
        $("#selected-files").css("display", "none");


    }
    else {
        deleteId.forEach((datas) => {
            deleteFile(datas, current_file_obj.isPublic, function (status, data) {
                if (status) {
                    successMsg('File Deleted Successfully');
                    setTimeout(function () {
                        loadFiles();
                    }, 1000)
                    $("#deleteModal").modal('hide');
                } else {
                    errorMsg('Error in delete')
                }
            })
        })
        $("#checked-count").html(document.querySelectorAll('input[type="checkbox"]:checked').length);
        $("#selected-files").css("display", "none");
        $("#select-all").css("border", "none");
    }
}

function uploadFileData(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            $(".btnSubmit").removeAttr('disabled');
            $(".btnSubmit").html('Save');

            if (xhr.status === 200) {
                $("#addFile").modal('hide');
                setTimeout(function () {
                    loadFiles();
                }, 500)
                successMsg('File uploaded successfully!');
                loadFiles();
            } else {
                errorMsg('Error in file upload!');
            }

        }
    };

    var queryParams = 'ispublic=' + $("#file_type").val();

    if (current_file_obj && current_file_obj.id) {
        queryParams = queryParams + '&id=' + current_file_obj.id
    }

    xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token + "?" + queryParams, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    if ($.trim($("#file_tags").val()) !== '') {
        formData.append("tags", $("#file_tags").val());
    }

    formData.append("description", $("#file_desc").val());


    xhr.send(formData);
}

function uploadFile() {

    var fileInput = document.getElementById("uploadFile");


    var files = fileInput.files;

    if (files.length === 0) {

        if (current_file_obj && current_file_obj.id) {
            $(".btnSubmit").attr('disabled', 'disabled');

            var obj = {
                ispublic: $("#file_type").val() === "true" ? true : false,
                tags: $("#file_tags").val(),
                description: $("#file_desc").val()
            };

            updateFileInfo(current_file_id, obj, function (status, data) {
                if (status) {
                    $("#addFile").modal('hide');
                    setTimeout(function () {
                        loadFiles();
                    }, 500)
                    successMsg('Successfully updated');
                } else {
                    errorMsg('Error in file update');
                    $(".btnSubmit").removeAttr('disabled', 'disabled');
                    return false;
                }
            })

        } else {
            errorMsg('File not found. select a file to start upload');
            $("#uploadBtn").removeAttr("disabled", "disable")
            return false;
        }

    } else {
        uploadFileData(files[0]);
        $(".btnSubmit").attr('disabled', 'disabled');
        $(".btnSubmit").html('<i class="icon-spinner icon-spin"></i> Uploading in progress');

    }



}

function fade() {

    if ($("#modalExpand").is(".panel-expand")) {
        $(".platformBody").fadeTo(1000, 0.9);
        $("#header").css("display", "none");
    }
    else if ($("#modalExpand").not('.panel-expand')) {
        $("#header").css("display", "block");
    }
}

function expand() {
    if ($("#modalExpand").is(".panel-expand")) {
        $("#header").css("display", "block");
        $("#modalExpand").css('border-radius', '25px');
        $("#breadcrumb").css("display", "block");
        $(".panel-inverse").css("border", "1px solid #2c2f7980");
    }
    else if ($("#modalExpand").not('.panel-expand')) {
        $("#header").css("display", "none");
        // $(".panel-body").css("padding","15px");
        $("#modalExpand").css('border-radius', '0px');
        $("#modalExpand").css("border", "1px solid #2c2f7980");
        $("#breadcrumb").css("display", "none");
    }

}

function checkboxes(objid, obj) {


    // $(obj).parent().parent().children(".colBase").css("border","1px solid #2C2F79");
    // $(obj).parent().parent().children().children("#delete-img").css({ "filter": "invert(13%) sepia(94%) saturate(7466%) hue-rotate(0deg) brightness(94%) contrast(115%)"});




    if (document.querySelectorAll('input[type="checkbox"]:checked').length > 0) {
        $("#selected-files").css("display", "block");
        $("#checked-count").html(document.querySelectorAll('input[type="checkbox"]:checked').length);
        $(obj).parent().parent().children(".colBase").css("border", "1px solid #2C2F79");

        if (bulkId.includes(objid)) {
            bulkId.pop(objid);
        }
        else {
            bulkId.push(objid);
        }

    }
    else {
        bulkId = [];
        $("#selected-files").css("display", "none");
        $(obj).parent().parent().children(".colBase").css("border", "none");
    }


}

function selectAll(event) {

    var t = event.target.attributes.class.value;
    if (t == "") {
        event.target.attributes.class.value = "active"
  
          $(".colBase").css("border","1px solid #2C2F79");
      var elements = document.querySelectorAll('input[type="checkbox"]');
  
      for(var i=0; i<elements.length; i++){  
          if(elements[i].type=='checkbox')  
          elements[i].checked=true;  
      }  
      var number = parseInt(document.querySelectorAll('input[type="checkbox"]:checked').length);
      var numbers = number - 1;
      $("#checked-count").html(numbers);
  
       if(document.querySelectorAll('input[type="checkbox"]:checked').length > 1){
          $("#selected-files").css("display","block");
          $("#select-all").css("border","1px solid #61629A");
       }
       else if(document.querySelectorAll('input[type="checkbox"]:checked').length < 2){
          $("#selected-files").css("display","none");
          $("#select-all").css("border","none");
       }
  
       getId.forEach((id)=>{
          deleteId.push(id);
       })
        
    }
    else {
        event.target.attributes.class.value = ""

     $("#selected-files").css("display","none");
        $("#select-all").css("border","none");
        $(".colBase").css("border","");
        var elements = document.querySelectorAll('input[type="checkbox"]');
  
        for(var i=0; i<elements.length; i++){  
            if(elements[i].type=='checkbox')  
            elements[i].checked=false;  
        } 
        
    }
}

function listView() {

    $('[id="action-buttons"]').removeAttr('style');
    $('[class="container"]').removeAttr('style');
    $("#grid-btn").css({ "background-color": "white", "color": "black", "border": "none" });
    $("#list-btn").css({ "background-color": "#2C2F79", "color": "white" });
    $("#grid-img").css("filter", "brightness(0.5)");
    $("#list-img").css("filter", "invert(100%) sepia(100%) saturate(0%) hue-rotate(282deg) brightness(142%) contrast(102%);");
    $('[id="download-btn"]').css("display", "none");


    event.preventDefault();
    $('[id="card-data"]').removeClass("col-sm-12 col-md-6 col-lg-3");
    $('[id="card-data"]').addClass("col-12");
    $('[id="card-data"]').css({ "height": "74px", "margin-bottom": "25px" });
    $('[id="copy-btn"]').css("border-left", "none");



    $('[id="check-box"]').css({
        "float": "left",
        "width": "20px",
        "height": "20px",
        "margin-top": "41px",
        "margin-right": "0px",
        "margin-left": "16px",
    });
    $('[id="img-name"]').css({
        "font-size": "15px",
        "margin-top": "17px",
        "margin-left": "14%",
        "padding-top": "0px",
    });
    $('[class="img-fluid"]').css({
        "margin-top": "13px",
        "padding-top": "0px",
        "width": "68px",
        "height": "105px",
        "margin-right": "84%",
    });
    $('[id="action-buttons"]').css({
        "position": "absolute",
        "top": "21%",
        "right": "2%",
    })
    $('[id="grid-img"]').css({
        "width": "24px",
        "height": "20px",
        "padding": "1px",
        "padding-right": "4px"
    })
    $('[id="list-img"]').css({
        "width": "24px",
        "height": "20px",
        "padding": "1px",
        "padding-right": "4px",
        "filter": "invert(100%) sepia(100%) saturate(0%) hue-rotate(282deg) brightness(142%) contrast(102%)",
    })
    $('[class="container"]').css({
        "display": "block",
        "position": "absolute",
        // "cursor": "pointer",
        // "-webkit-user-select": "none",
        // "-moz-user-select": "none",
        // "-ms-user-select": "none",
        "user-select": "none",
        "top": "22%",
        "left": "2%"
    })
    // $('[class="colBase"]').css({"height":"65%"})
}

function gridView() {

    loadFiles();
    event.preventDefault();
    $("#grid-btn").css({ "background-color": "#2C2F79", "color": "white" });
    $("#list-btn").css({ "background-color": "white", "color": "black", "border": "none" });
    $("#grid-img").css("filter", "invert(100%) sepia(100%) saturate(0%) hue-rotate(282deg) brightness(142%) contrast(102%);");
    $("#list-img").removeAttr("style", "filter");
    $('[id="download-btn"]').css("display", "block");
    $('[class="cpyBtn"]').css("border-left", "1px solid #d3d3d380;");



    $('[id="card-data"]').removeClass("col-12");
    $('[id="card-data"]').addClass("col-sm-12 col-md-6 col-lg-3");

    $('[id="check-box"]').css({
        "float": "right",
        "width": "20px",
        "height": "20px",
        "margin-top": "10px",
        "margin-right": "20px"
    });

    $('[id="img-name"]').css({
        "font-size": "18px",
        "margin-top": "5px",
        "margin-left": "25px",
        "padding-top": "12px",
    });

    $('[class="img-fluid"]').css({
        "margin-top": "25px",
        // "width": "100px",
        // "margin-right": "50%",
    });

    $('[id="action-buttons"]').css({
        "margin-top": "-37px",
        "margin-left": "95px",
    })
    $("#grid-img").css({
        "width": "24px",
        "height": "20px",
        "padding": "1px",
        "padding-right": "4px",
        "filter": "invert(100%) sepia(100%) saturate(0%) hue-rotate(282deg) brightness(142%) contrast(102%)",
    })
    $("#list-img").css({
        "width": "24px",
        "height": "20px",
        "padding": "1px",
        "padding-right": "4px"
    })

}

function downloadFile(id) {

    var x = $('[id="download-btn"]').attr({
        target: '_blank',
        href: API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + id
    });
}

function color(param) {
    if (param == 'all') {
        $("#all-btn").css({ "background-color": "#2C2F79", "color": "white" });
        $("#public-btn").css({ "background-color": "white", "color": "black" });
        $("#private-btn").css({ "background-color": "white", "color": "black" });
    }
    else if (param == 'public') {
        $("#public-btn").css({ "background-color": "#2C2F79", "color": "white" });
        $("#all-btn").css({ "background-color": "white", "color": "black" });
        $("#private-btn").css({ "background-color": "white", "color": "black" });
    }
    else {
        $("#private-btn").css({ "background-color": "#2C2F79", "color": "white" });
        $("#all-btn").css({ "background-color": "white", "color": "black" });
        $("#public-btn").css({ "background-color": "white", "color": "black" });
    }
}

// function deleteAll(){
//     current_file_id = id;
//     for (var i = 0; i < file_list.length; i++) {
//         if (id === file_list[i]._id) {
//             current_file_obj = file_list[i];
//         }
//     }

//     $("#deleteModal").modal('show');
// }