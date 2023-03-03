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
var privateFile = [];

$(document).ready(function () {
    $(".loadMore").hide();
    loadFiles();
    $("body").removeClass('bg-white');
});


function loadFiles(fileType) {
    var searchText = $("#searchText").val();

    $("#grid-btn").css({ "background-color": "#2C2F79", "color": "white" });
    $("#list-btn").css({ "background-color": "white", "color": "black", "border": "none" });
    $("#grid-img").css("filter", "brightness(4.5)");
    $("#list-img").removeAttr("style", "filter");
    getId = [];
    deleteId = [];
    bulkId = [];

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

        // var fileData = fileType.toString();
        var fileTypeJson = { "match": { "isPublic": (fileType === 'true' ? true : false) } };
        // var fileTypePrivate = { "match": { "isPublic": "false" } };

        queryParams.query['bool']['must'].push(fileTypeJson);

        // if(fileData === 'false'){
        queryParams.query['bool']['must'].push(domainKeyJson);
        // }


    } else {
        queryParams.query['bool']['must'].push(domainKeyJson);
    }
    $(".fileList").html('');

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "type":"FILE_PUBLIC",
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
                $(".fileList").html('');
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
        actStr = `<a class="btn btn-default btn-xs" title="Edit" onclick="openModal(2,'` + obj.id + `','` + obj.mediaType +`')" style="background-color:white;font-size:15px;padding-top:7px;margin-top: 1px;margin-right: 0px;font-size: 17px;border: none;border-left: 1px solid #d3d3d380;border-radius: 0px;"><img id="edit-img" style="filter: brightness(0.8);" src="images/edit_icon.svg" alt=""></a>
        <a class="btn btn-default btn-xs" title="Delete" onclick="openModal(3,'` + obj.id + `')" style="background-color:white;font-size:15px;padding-top:9px;margin-top: 0px;margin-left: 10px;font-size: 18px;border: none;border-left: 1px solid #d3d3d380;border-radius: 0px;"><img id="delete-img" style="width: 29px;height: 30px;margin-top: -1px;filter: brightness(0.8);" src="images/Delete2.svg" alt="">
        </a>`;
    }

    var imgTag = '';

    if (obj.mediaType && obj.mediaType.split('/')[0] !== 'image') {

    let title = obj.description;
    let sName;
    let splitTitle = title.split(".");
    let fName = splitTitle[0];
    let lName = splitTitle.splice(-1);
    let upperCase = lName.toString();
    let file = upperCase.toUpperCase();

        imgTag = '<i class="icon-file-text-o" style="font-size: 2rem;position: absolute;top: 37%;left: 45%;"></i><p id="obj-desc" style="margin-top: 36%;font-size:16px;margin-right:0px">' + file + '</p>'
    } else {
        
        imgTag = '<img data-enlargable class="img-fluid" id="" onclick="getFullSize(this.src)" src="' + srcPath + '" title="' + (obj.tags ? obj.tags : '') + '" style="margin-top:25px;padding-top: 25px;padding-right: 10px;height:150px;cursor:pointer;" />'
    }

    var mediaTag = obj.mediaType ? '<small class="' + obj.id + ' hide" style="position: absolute;left:10px;bottom: 0px;background-color: #3333339c;color: #fff;">' + obj.mediaType + '</small>' : '';

    let title = obj.description;
    let sName;
    let splitTitle = title.split(".");
    let fName = splitTitle[0];
    let lName = splitTitle.splice(-1);

    if(fName.length > 15){
      var subName =  fName.substring(0, 15);
        sName = subName;
    }
    else{
        sName = fName;
    }
    let fileName = sName + "." + lName;


    var str = `
            <div class="col-sm-12 col-md-6 col-lg-3" style="margin-top:15px;margin-bottom: 35px;" id="card-data">
                <span id="img-name" title=`+ obj.description +` style = "font-size:18px;margin-top:5px;margin-left:32px;font-weight: 600;color:black;">`+ fileName + `</span> <input id="check-box" onchange="checkboxes('` + obj.id + `',this)" style="position: absolute;right: 9%;top: 12%;height: 17px;width: 17px;" type="checkbox">
                <div class="colBase" onclick="toggleBtn(1,'`+ obj.id + `')" style="height: 113%;border-radius: 15px;box-shadow: 0px 0px 3px 3px #ededed;">
                        `+ fileType + `
                       `+ imgTag + `

                </div>
              
              <p class="btn-group btn-group-justified `+ obj.id + ` " style="top:86%;left:24%;position:absolute;" id="action-buttons">
              <a class="btn btn-default btn-xs" id="download-btn" title="Download" onclick="downloadFile('` + obj.id + `','`+ obj.isPublic +`')" data-clipboard-text="` + srcPath + `" style="font-size:15px;background-color:white;border: none;font-size: 16px;padding-right: 9px;margin-top: 6px;"><img id="download-img" style="width: 27px;height: 27px;filter: brightness(0.5);" src="images/Download2.svg" alt=""></a> 
               <a class="btn btn-default btn-xs cpyBtn" id="copy-btn" title="Copy Link" data-clipboard-text="`+ srcPath + `" style="font-size:15px;background-color:white;margin-right: 8px;font-size: 18px;border: none;border-left: 1px solid #d3d3d380;border-radius: 0px;padding-left: 9px;margin-top: 6px;"><img id="copy-img" style="width: 27px;height: 27px;filter: brightness(0.5);" src="images/Copy.svg" alt=""></a>
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

function openModal(type, id, mediaType) {
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
        
        var fileTypeModal = mediaType.split("/");
        var getType = fileTypeModal[0];
        
        $(".fileAction").html('Update');
        $("#uploadBtn").html("Update File");

        var obj = {};
        current_file_id = id;

        if(getType == "image"){
             $(".imgBlock").html('<img class="imgFile"  style="width: 75px;height:75px" />')
        }
        else{
            $(".imgBlock").html('<i class="icon-file-text-o" style="font-size: 55px;"></i>');
        }

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
        // $("#file_desc").val(obj.description + '?' + new Date().getTime());
        $("#file_desc").val(obj.description);
        $("#file_type").val(obj.isPublic.toString());
        $("#addFile").modal('show');
        $("#addFile form").attr('onsubmit', 'updateFile()');



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

    var fileInput = document.getElementById("uploadFile");
    var files = fileInput.files;

    if(files.length == 0){
        errorMsg('File not found. select a file to start upload');
    }
    else{
    uploadFile();
    loadFiles();
    }
}


function updateFile() {

    var fileInput = document.getElementById("uploadFile");
    var files = fileInput.files;

    if(files.length == 0){
        errorMsg('Please choose a file to Update');
    }
    else{
        uploadFile();
    }
    // $(".btnSubmit").attr('disabled', 'disabled');
    

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
    else if (deleteId.length == 0 && bulkId.length > 0) {
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
                    $("#checked-count").html(document.querySelectorAll('input[type="checkbox"]:checked').length);
                    $("#selected-files").css("display", "none");
                    $("#select-all").css("border", "none");
                    $("#select-all").removeClass("active");
                    
                } else {
                    errorMsg('Error in delete')
                }
            })
        })

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
                $("#uploadFile").val('');
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

    var uploadFileType = files[0].name.split(".");
    var myFileType = uploadFileType[1];

    var sizes =  document.getElementById('uploadFile').files[0].size;
    var sizeInKB = sizes/1024;

  if(myFileType == 'gif'|| 'png'||'jpg'||'jpeg'||'doc'||'pdf'||'xlsx'||'json'||'webp'||'svg'){
    if(sizeInKB > 1024){
        errorMsg('Please Choose file less than 1 MB');
        return false
    }
    else{
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

  }
  else{
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
        $('html').css('overflow', 'visible');
        $("#modalExpand").css('border-radius', '25px');
        $("#breadcrumb").css("display", "block");
        $(".panel-inverse").css("border", "1px solid #2c2f7980");
    }
    else if ($("#modalExpand").not('.panel-expand')) {
        $("#header").css("display", "none");
        $('html').css('overflow', 'hidden');
        $("#modalExpand").css('border-radius', '0px');
        $("#modalExpand").css("border", "1px solid #2c2f7980");
        $("#breadcrumb").css("display", "none");
    }

}

function checkboxes(objid, obj) {


    if (document.querySelectorAll('input[type="checkbox"]:checked').length > 0) {
        $("#selected-files").css("display", "block");
        $("#checked-count").html(document.querySelectorAll('input[type="checkbox"]:checked').length);
        $(obj).parent().children(".colBase").css("border", "1px solid #167EE6");
        $(obj).parent().children().children().children("#download-img").css("filter", "invert(165%) sepia(124%) saturate(1176%) hue-rotate(562deg) brightness(85%) contrast(159%)");
        $(obj).parent().children().children().children("#copy-img").css("filter", "invert(165%) sepia(124%) saturate(1176%) hue-rotate(562deg) brightness(85%) contrast(159%)");
        $(obj).parent().children().children().children("#edit-img").css("filter", "invert(100%) sepia(100%) saturate(1176%) hue-rotate(575deg) brightness(122%) contrast(159%)");
        $(obj).parent().children().children().children("#delete-img").css("filter", "invert(13%) sepia(94%) saturate(7466%) hue-rotate(0deg) brightness(94%) contrast(115%)");

        if (bulkId.includes(objid)) {
            bulkId.pop(objid);
        }
        else {
            bulkId.push(objid);
        }

        var del = deleteId;
        const index = del.indexOf(objid);
            if (index > -1) { 
            del.splice(index, 1); 
            deleteId = del;
        }
    }
    else {
             bulkId = [];
            $("#selected-files").css("display", "none");
            $("#select-all").css({"border":"none","text-decoration": "none"});
            $("#select-all").removeClass("active");
            $(".colBase").css("border","");
            $('[id="download-img"]').css("filter", "brightness(0.5)");
            $('[id="copy-img"]').css("filter", "brightness(0.5)");
            $('[id="edit-img"]').css("filter", "brightness(0.8)");
            $('[id="delete-img"]').css("filter", "brightness(0.8)");
            loadFiles();
    }


}

function selectAll(event) {
    var classValue = event.target.attributes.class.value;

    deleteId = [];
    bulkId = [];

    let uniqueChars = [...new Set(getId)];
    
    if (classValue == "") {
        event.target.attributes.class.value = "active"
        
            $(".colBase").css("border","1px solid #167EE6");
            $('[id="check-box"]').attr('checked', 'checked');
            $("#checked-count").html(document.querySelectorAll('input[type="checkbox"]:checked').length);
            $("#selected-files").css("display","block");
            $("#select-all").css("border","1px solid #61629A");
            $('[id="download-img"]').css("filter", "invert(165%) sepia(124%) saturate(1176%) hue-rotate(562deg) brightness(85%) contrast(159%)");
            $('[id="copy-img"]').css("filter", "invert(165%) sepia(124%) saturate(1176%) hue-rotate(562deg) brightness(85%) contrast(159%)");
            $('[id="edit-img"]').css("filter", "invert(100%) sepia(100%) saturate(1176%) hue-rotate(575deg) brightness(122%) contrast(159%)");
            $('[id="delete-img"]').css("filter", "invert(13%) sepia(94%) saturate(7466%) hue-rotate(0deg) brightness(94%) contrast(115%)");
  
            uniqueChars.forEach((id)=>{
            deleteId.push(id);
         })         
        
    }
    else {
        event.target.attributes.class.value = ""

     $("#selected-files").css("display","none");
        $("#select-all").css("border","none");
        $('[class="colBase"]').css("border","");
        $('[id="download-img"]').css("filter", "brightness(0.5)");
        $('[id="copy-img"]').css("filter", "brightness(0.5)");
        $('[id="edit-img"]').css("filter", "brightness(0.8)");
        $('[id="delete-img"]').css("filter", "brightness(0.8)");
        $('[id="check-box"]').removeAttr('checked');
        $("#checked-count").html(document.querySelectorAll('input[type="checkbox"]:checked').length);
        deleteId.splice(0, deleteId.length);    
    }

}

function listView() {

    $('[id="action-buttons"]').removeAttr('style');
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
        "left":"1%",
        "width": "17px",
        "height": "17px",
        "top": "40%",
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
        "padding-right": "7px",
        "padding-left": "2px",
    })
    $('[id="list-img"]').css({
        "width": "24px",
        "height": "20px",
        "padding": "1px",
        "padding-right": "7px",
        "padding-left": "2px",
        "filter": "invert(100%) sepia(100%) saturate(0%) hue-rotate(282deg) brightness(142%) contrast(102%)",
    })
    $('[class="icon-file-text-o"]').css({
        "top": "20%",
        "left": "7%"
    })
    $('[id="obj-desc"]').css({
        "margin-top": "3.5%",
        "margin-right": "86%"
    })
}

function gridView() {

    event.preventDefault();
    $("#grid-btn").css({ "background-color": "#2C2F79", "color": "white" });
    $("#list-btn").css({ "background-color": "white", "color": "black", "border": "none" });
    $("#grid-img").css("filter", "invert(100%) sepia(100%) saturate(0%) hue-rotate(282deg) brightness(142%) contrast(102%);");
    $("#list-img").removeAttr("style", "filter");
    $('[id="download-btn"]').css("display", "block");
    $('[class="cpyBtn"]').css("border-left", "1px solid #d3d3d380;");



    $('[id="card-data"]').removeClass("col-12");
    $('[id="card-data"]').addClass("col-sm-12 col-md-6 col-lg-3");
    $('[id="card-data"]').css({"margin-top": "15px","margin-bottom": "35px","height": "186px"})
    $('[id="check-box"]').removeAttr('style');
    $('[class="img-fluid"]').removeAttr('style');

    $('[id="check-box"]').css({
        "position": "absolute","right": "9%", "top": "12%","height": "17px", "width": "17px"
    });

    $('[id="img-name"]').css({
        "font-size":"18px","margin-top":"5px","margin-left":"32px","font-weight": "600","color":"black"
    });

    $('[class="img-fluid"]').css({
        "margin-top":"25px","padding-top": "25px","padding-right": "10px","height":"150px"
    });

    $('[id="action-buttons"]').css({
        "top":"86%","left":"24%","position":"absolute"
    })
    $("#grid-img").css({
        "width": "23px",
        "height": "20px",
        "filter": "invert(100%) sepia(100%) saturate(0%) hue-rotate(282deg) brightness(142%) contrast(102%)",
        "padding": "1px",
        "padding-right": "7px",
        "padding-left": "2px"
    })
    $("#list-img").css({
        "width": "23px",
        "height": "20px",
        "padding": "1px",
        "padding-right": "7px",
        "padding-left": "2px",
    })
    $('[class="icon-file-text-o"]').css({
        "font-size": "2rem","position": "absolute","top": "40%","left": "45%"
    })
    $('[id="obj-desc"]').css({
        "margin-top": "38%","font-size":"16px","margin-right":"0px"
    })

}

function downloadFile(id, type) {

    var x = $('[id="download-btn"]').attr({
        target: '_blank',
        href: API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + id + '?' + 'ispublic=' + type
        
    })
    
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

function getFullSize(obj){

        $('<div><span style="font-size: 42px;margin-top: 5px;margin-right: 4px;color: white;font-weight: bolder;" class="close">&times;</span>').css({
            background: 'RGBA(0,0,0,.5) url('+obj+') no-repeat center',
            backgroundSize: '600px 600px',
            width:'100%', height:'100%',
            position:'fixed',
            zIndex:'10000',
            top:'0', left:'0',
            cursor: 'zoom-out'
        }).click(function(){
            $(this).remove();
        }).appendTo('body');

}
