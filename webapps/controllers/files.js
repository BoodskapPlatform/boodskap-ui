var fileTable = null;
var file_list = [];
var current_file_id = null;
var current_file_obj = {};
var page_size = 50;
var page_from = 0;

$(document).ready(function () {
    loadFiles();
    $("body").removeClass('bg-white');
});


function loadFiles(flag) {
    var searchText = $("#searchText").val();
    var fileType = $("#fileType").val();

    var queryParams = {
        query: {
            "bool": {
                "must": [],
                "should" : [],
            }
        },
        from: page_from,
        size:page_size
    };

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    delete queryParams.query['bool']["minimum_should_match"];

    if (searchText) {

        queryParams.query['bool']['should'].push({"wildcard": {"description": "*" + searchText.toLowerCase() + "*"}})
        queryParams.query['bool']['should'].push({"wildcard": {"mediaType": "*" + searchText.toLowerCase() + "*"}})
        queryParams.query['bool']['should'].push({"wildcard": {"tags": "*" + searchText.toLowerCase() + "*"}})
        queryParams.query['bool']["minimum_should_match"] = 1;

    }
    if (fileType) {

        var fileTypeJson = {"match": {"isPublic": (fileType === 'true' ? true : false)}};

        queryParams.query['bool']['must'].push(fileTypeJson);

        // if(fileType === 'false'){
            queryParams.query['bool']['must'].push(domainKeyJson);
        // }


    }else{
        queryParams.query['bool']['must'].push(domainKeyJson);
    }
    if(!flag) $(".fileList").html('');

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    searchByQuery('', 'FILE_PUBLIC', searchQuery, function (status, res) {
        if (status) {

            var resultData = QueryFormatter(res).data;
            file_list = resultData['data'];
            $(".filesCount").html(resultData.recordsFiltered)
            // $(".filesCount").html( file_list.length)
            
         

            if(file_list.length > 0){
                $(".loadMore").show();
                for (var i = 0; i < file_list.length; i++) {
                    $(".fileList").append(renderHtml(file_list[i]));
                }
            }else{
                if(!flag) {
                    $(".fileList").html('<div class="col-md-12" style="text-align: center"><label>No Files Found!</label></div>');
                    $(".loadMore").hide();
                }
            }

            var clipboard = new ClipboardJS('.cpyBtn');

            clipboard.on('success', function(e) {
               successMsg('Link copied successfuly')
                e.clearSelection();
            });

            clipboard.on('error', function(e) {
                errorMsg('Error in copying link')
            });


        } else {
            if(!flag) {
                $(".loadMore").hide();
                file_list = [];
                $(".fileList").html('<div class="col-md-12" style="text-align: center"><label>No Files Found!</label></div>');
            }
        }


    })


}

function loadMorePage() {
    page_from = page_from + page_size;
    loadFiles(true);
}

function renderHtml(obj) {

    var srcPath = '';
    var fileType = '';

    if (obj.isPublic) {
        srcPath = API_BASE_PATH + '/files/public/download/' + obj.id;
        fileType = '<span class="label label-success" title="Public - Open to the World"><i class="icon-unlock"></i></span>'
    } else {
        srcPath = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + obj.id;
        fileType = '<span class="label label-danger" title="Private"><i class="icon-lock2"></i></span>'
    }

    var actStr = '';


    if(obj.domainKey === DOMAIN_KEY){
        actStr =  `<a class="btn btn-default btn-xs" title="Edit" onclick="openModal(2,'` + obj.id + `')"><i class="icon-edit2"></i></a>
        <a class="btn btn-default btn-xs" title="Delete" onclick="openModal(3,'` + obj.id + `')"><i class="icon-trash4"></i></a>`;
    }

    var imgTag = '';

    if(obj.mediaType && obj.mediaType.split('/')[0] !== 'image'){
        imgTag = '<i class="icon-file-text-o" style="font-size: 2rem;"></i><p>'+obj.description+'</p>'
    }else{
        imgTag = '<img src="'+srcPath+'" title="'+(obj.tags ? obj.tags : '')+'" />'
    }

    var mediaTag = obj.mediaType ? '<small class="'+obj.id+' hide" style="position: absolute;left:10px;bottom: 0px;background-color: #3333339c;color: #fff;">'+obj.mediaType+'</small>' : '';


    var str = `
                <div class="col-md-2 colBase" onmouseover="toggleBtn(1,'`+obj.id+`')" onmouseout="toggleBtn(2,'`+obj.id+`')">
                    <div style="height: 100px">
                        `+fileType+`
                       `+imgTag+`
                    </div>
                    <p class="btn-group btn-group-justified `+obj.id+` hide" style="position: absolute;right:10px;bottom:0px;margin-bottom: 0px;">
                        <a class="btn btn-default btn-xs cpyBtn" title="Copy Link" data-clipboard-text="`+srcPath+`"><i class="icon-copy2"></i></a>
                       `+actStr+`
                    </p>
                    `+mediaTag+`
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
    if(type === 1){
        $("."+id).removeClass('hide')
    }else{
        $("."+id).addClass('hide')
    }
}

function openModal(type, id) {
    current_file_obj = {};
    if (type === 1) {

        current_file_id = null;

        $("#uploadFile").prop('required',true);


        $(".fileAction").html('Add');
        $(".imgBlock").html('')
        $("#addFile form")[0].reset();
        $("#addFile").modal('show');
        $("#addFile form").attr('onsubmit', 'addFile()')

    }
    else if (type === 2) {

        $(".fileAction").html('Update');
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
            srcPath = API_BASE_PATH + '/files/public/download/' + obj.id;
        } else {
            srcPath = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + obj.id;
        }

        $(".imgFile").attr('src',srcPath)

        $("#uploadFile").removeAttr('required')

        $("#file_tags").val(obj.tags);
        $("#file_desc").val(obj.description);
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
}


function updateFile() {

    $(".btnSubmit").attr('disabled', 'disabled');
    uploadFile();
}


function proceedDelete() {
    deleteFile(current_file_id, current_file_obj.isPublic,function (status, data) {
        if (status) {
            successMsg('File Deleted Successfully');
            loadFiles();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}

function uploadFileData(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            $(".btnSubmit").removeAttr('disabled');
            $(".btnSubmit").html('Save');

            if (xhr.status === 200) {
                $("#addFile").modal('hide');
                loadFiles()
                successMsg('File uploaded successfully!');
            } else {
                errorMsg('Error in file upload!');
            }

        }
    };

    var queryParams = 'ispublic='+$("#file_type").val();

    if(current_file_obj && current_file_obj.id){
        queryParams = queryParams + '&id='+current_file_obj.id
    }

    xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token + "?" + queryParams, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType",file.type);
    if($.trim($("#file_tags").val()) !== ''){
        formData.append("tags",$("#file_tags").val());
    }

    formData.append("description", $("#file_desc").val());


    xhr.send(formData);
}

function uploadFile() {

    var fileInput = document.getElementById("uploadFile");

    var files = fileInput.files;

    if (files.length === 0) {

        if(current_file_obj && current_file_obj.id){
            $(".btnSubmit").attr('disabled', 'disabled');

            var obj = {
                ispublic : $("#file_type").val() === "true" ? true : false,
                tags : $("#file_tags").val(),
                description : $("#file_desc").val()
            };

            updateFileInfo(current_file_id, obj, function (status, data) {
                if(status){
                    $("#addFile").modal('hide');
                    loadFiles()
                    successMsg('Successfully updated')

                }else{
                    errorMsg('Error in file update');
                    return false;
                }
            })

        }else{
            errorMsg('File not found. select a file to start upload');
            return false;
        }

    }else{
        uploadFileData(files[0]);
        $(".btnSubmit").attr('disabled','disabled');
        $(".btnSubmit").html('<i class="icon-spinner icon-spin"></i> Uploading in progress');

    }



}