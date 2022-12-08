var fr_page_count = 50;
var fr_label_page_count = 50;
var fr_img_page_count = 500;
var frModelList = [];
var frModelCount = [];
var selectedID = '';
var resultDataHeight  = null;
var tempAttr = [];
var labelsList = [];


$(document).ready(function () {

    loadMLFRList();

    $('body').removeClass('bg-white')

});


function loadMLFRList(){
    $(".modelList").html('');
    $(".labelsList" ).html('');
    getMachineLearningFRList(fr_page_count, function (status, data) {
        if(status && data && data.total > 0){

            frModelCount = data.total;
            $(".modelCount").html(frModelCount)

            for(var i=0;i<data.names.length;i++){
                frModelList.push(data.names[i]);
                renderModel(data.names[i])
            }

        }else{
            $(".modelCount").html(0)
        }
    })
}


function renderModel(obj) {
    var str = `
     <div class="card" style="border: 1px solid #6d6d6d3d;">
        <div class="card-header pointer-cursor"
         style="text-transform: capitalize">
        
         <a href="javascript:void(0)" style="text-decoration: none;color:#333"   onclick="loadModelData('`+obj.name+`')" 
          data-toggle="collapse" data-target="#collapse`+obj.name+`"><i class="icon-eye"></i>
        `+obj.name+`
         </a>
         
         
            <div class="btn-group btn-group-sm btn-group-justified pull-right" >
                <a class="btn btn-default btn-xs" onclick="openModal(1,'`+obj.name+`')"><i class="icon-plus"></i> <span class="hidden-xs">Add Label & Image</span></a>
                <a class="btn btn-default btn-xs" onclick="openModal(2,'`+obj.name+`')"><i class="icon-repeat"></i> <span class="hidden-xs">Train/Re-Train</span></a>
                <a class="btn btn-default btn-xs" onclick="openModal(3,'`+obj.name+`')"><i class="icon-trash4"></i> <span class="hidden-xs">Delete</span></a>
            </div>
         
          <span class="label label-default">Total Labels: `+obj.labels+`</span> 
            
        
        </div>
        <div id="collapse`+obj.name+`" class="collapse" data-parent="#accordion">
            <div class="card-body" style="padding:10px;">
                <div class="row">
                     <div class="col-lg-4">
                        <div class="form-group">
                            <label>Algorthim</label>
                            <p class="alg_`+obj.name+`"></p>
                        </div>
                    </div>
                     <div class="col-lg-4">
                        <div class="form-group">
                            <label>Image Width (px)</label>
                            <p class="imgw_`+obj.name+`"></p>
                        </div>
                    </div>
                     <div class="col-lg-4">
                        <div class="form-group">
                            <label>Image Height (px)</label>
                            <p class="imgh_`+obj.name+`"></p>
                        </div>
                    </div>
                    
                </div>
                
                <div class="row labelsList labelsList_`+obj.name+`" style="max-height: 300px;overflow:auto;overflow-x: hidden;">
                    
                </div>
           
            
    
            </div>
        </div>
    </div>
    `;
    $(".modelList").append(str);


}


function loadModelData(id) {

    selectedID = id;
    fr_label_page_count = 50;
    labelsList = [];
    loadModelLabels(id, null);

    getMachineLearningFRModel(id, function (status, data) {
        if(status){
            $(".alg_"+id).html(data.algorithm)
            $(".imgw_"+id).html(data.imageWidth)
            $(".imgh_"+id).html(data.imageHeight)
        }
    });

}

function loadModelLabels(id, lastId) {
    getMachineLearningFRLabelsList(id, fr_label_page_count, lastId, function (status, data) {
        if(status){
            for(var i=0;i<data.labels.length;i++){
                renderLabelsList(id,data.labels[i]);
                labelsList.push(data.labels[i]);
            }
        }
    });

}

function renderLabelsList(id,obj) {
    var str = `
    <div class="col-lg-12 mt-1 mb-1" style="min-height: 50px;">
        <div  style="border:1px solid #eee;padding:10px;">
         <p><label>`+obj.label+`</label> <a class="btn btn-sm btn-icon" onclick="viewImages('`+id+`','`+obj.label+`',null)"><i class="icon-image"></i></a>
            <label class="label label-default pull-right">Total Images: `+obj.count+`</label>
         </p>
         <div class="img_`+id+`_`+obj.label+`"></div>
        </div>
       
    </div>
    `;
    $(".labelsList_"+id).append(str);
}

function viewImages(id, label,lastId) {
    $(".img_"+id+"_"+label).html("");
    getMachineLearningFRLabelsImageList(id, label, fr_img_page_count, lastId, function (status, data) {
        if(status){
            for(var i=0;i<data.urls.length;i++){
                $(".img_"+id+"_"+label).append('<img src="'+API_BASE_PATH+''+data.urls[i]+'" width="'+$(".imgw_"+id).html()+'"' +
                    'height="'+$(".imgh_"+id).html()+'" style="margin:5px;border:2px solid #eee"/>');
            }


        }
    });
}


function openModal(type,id) {
    if(id){
        selectedID = id;
    }
    $(".modelName").html(id);
    if(type === 1){
        $("#addDataModal form")[0].reset();
        $("#addDataModal").modal('show');
    }else  if(type === 2){
        $("#trainDataModal").modal('show');
    }else  if(type === 3){
        $("#deleteDataModal").modal('show');
    }else  if(type === 4){

        $("#createModal form")[0].reset();
        $("#createModal").modal('show');
    }
}


function uploadFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            /*if (xhr.status === 200) {
                $("#createModal").modal('hide');
                loadModelLabels(selectedID);
                successMsg('Image uploaded successfully!');
            } else {
                errorMsg('Error in image upload!');
            }*/
            $("#createModal").modal('hide');
            loadMLFRList();
            successMsg('Image uploaded successfully!');
            $("#addDataModal").modal('hide');
            $(".btnSubmit").removeAttr('disabled');
            $(".btnSubmit").html('Proceed');
        }
    };
    xhr.open('POST', API_BASE_PATH + '/mservice/upload/fr/images?domainKey='+DOMAIN_KEY+'&name='+selectedID+'&label='+$("#labelName").val(), true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    xhr.send(formData);
}

function addDataModel() {
    var fileInput = document.getElementById("imageFile");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return this.system;
    }

    uploadFile(files[0]);
    $(".btnSubmit").attr('disabled', 'disabled');
    $(".btnSubmit").html('<i class="icon-spinner icon-spin"></i> Uploading in progress');

}

function trainModel() {
    trainMLFRData(selectedID, function (status, data) {
        if(status){
            $("#trainDataModal").modal('hide');
            successMsg('Training initiated successfully')
        }else{
            errorMsg('Error in initiating training')
        }
    })
}

function deleteModel() {
    deleteFRModel(selectedID, function (status, data) {
        if(status){
            $("#deleteDataModal").modal('hide');
            loadMLFRList();
            successMsg('FR Model deleted successfully')
        }else{
            errorMsg('Error in deleting FR model')
        }
    })
}

function createModel() {
    var resultObj = {
        "trainEvery":100,
        "trainedAt":0,
        "algorithm": $("#algorithm").val(),
        "name": $("#modelName").val(),
        "imageWidth":Number( $("#imgWidth").val()),
        "imageHeight":Number( $("#imgHeight").val())
    };

    upsertFRModel(resultObj, function (status, data) {
        if(status){
            loadMLFRList();
            $("#createModal").modal('hide');
            successMsg('Face Recognition Model created successfully')
        }else{
            errorMsg('Error in creating FR model')
        }
    })
}
