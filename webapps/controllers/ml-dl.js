var ml_page_count = 50;
var ml_data_page_count = 50;
var dlModelList = [];
var dlModelCount = [];
var selectedID = '';
var resultDataHeight  = null;
var tempAttr = [];
var lastId = null;


$(document).ready(function () {

    loadMLDlList();
    $('body').removeClass('bg-white')


});


function loadMLDlList(){
    $(".modelList").html('');
    getMachineLearningDLList(ml_page_count, function (status, data) {
        if(status && data && data.total > 0){

            dlModelCount = data.total;
            $(".modelCount").html(dlModelCount)

            for(var i=0;i<data.models.length;i++){
                dlModelList.push(data.models[i]);
                renderModel(data.models[i])
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
        
         <a href="javascript:void(0)" style="text-decoration: none;color:#333"   onclick="loadModelData('`+obj.relation+`')" 
          data-toggle="collapse" data-target="#collapse`+obj.relation+`"><i class="icon-eye"></i>
        `+obj.relation+` <small>(`+obj.classifier+` | `+obj.predictionType+`)</small>
         </a>
         
         
            <div class="btn-group btn-group-sm btn-group-justified pull-right" >
                <a class="btn btn-default btn-xs" onclick="openModal(1,'`+obj.relation+`')"><i class="icon-plus"></i> <span class="hidden-xs">Add Data</span></a>
                <a class="btn btn-default btn-xs" onclick="openModal(2,'`+obj.relation+`')"><i class="icon-repeat"></i> <span class="hidden-xs">Train/Re-Train</span></a>
                <a class="btn btn-default btn-xs" onclick="openModal(3,'`+obj.relation+`')"><i class="icon-trash4"></i> <span class="hidden-xs">Delete</span></a>
            </div>
         
          <span class="label label-default">Total Attributes: `+obj.records+`</span> 
            
        
        </div>
        <div id="collapse`+obj.relation+`" class="collapse" data-parent="#accordion">
            <div class="card-body" style="padding:10px;">
            
                <ul class="nav nav-tabs">
						<li class="nav-items">
							<a href="#tab-1-`+obj.relation+`" data-toggle="tab" class="nav-link active">
								<span class="d-sm-none">Attributes</span>
								<span class="d-sm-block d-none">Attributes</span>
							</a>
						</li>
						<li class="nav-items">
							<a href="#tab-2-`+obj.relation+`" data-toggle="tab" class="nav-link">
								<span class="d-sm-none">Training Summary</span>
								<span class="d-sm-block d-none">Training Summary</span>
							</a>
						</li>
						<li class="">
							<a href="#tab-3-`+obj.relation+`" data-toggle="tab" class="nav-link">
								<span class="d-sm-none">Cross Validation Results</span>
								<span class="d-sm-block d-none">Cross Validation Results</span>
							</a>
						</li>
						<li class="">
							<a href="#tab-4-`+obj.relation+`" data-toggle="tab" class="nav-link">
								<span class="d-sm-none">Data <label class="label label-default resultCount_`+obj.relation+`"></label></span>
								<span class="d-sm-block d-none">Data</span>
							</a>
						</li>
					</ul>
					<div class="tab-content">
						<div class="tab-pane fade active show" id="tab-1-`+obj.relation+`" style="overflow: auto">
						    <table class="table table-bordered" >
						        <thead>
						        <tr>
						            <th>Attribute Name</th><th>Attribute Type</th><th>Nominals</th>    
                                </tr>
                                </thead>
                                <tbody class="table_`+obj.relation+`">
                                </tbody>
                            </table>
						</div>
						<div class="tab-pane fade resultSummary" id="tab-2-`+obj.relation+`">
						
						</div>
						<div class="tab-pane fade resultSummary" id="tab-3-`+obj.relation+`">
						
						</div>
						<div class="tab-pane tabData fade" id="tab-4-`+obj.relation+`">
						    <table class="table table-bordered" >
                                <tbody class="table_data_`+obj.relation+`">
                                </tbody>
                            </table>
						</div>
					</div>
    
            </div>
        </div>
    </div>
    `;
    $(".modelList").append(str);
}

function loadModelData(id) {

    selectedID = id;
    ml_data_page_count = 50;

    $(".tabData" ).scroll(function() {

        console.log(selectedID)
        console.log("$('.tabData table tbody').offset().top =>",$('.tabData table tbody').offset().top)
        console.log("resultDataHeight =>",resultDataHeight)

        if($('.tabData table tbody').offset().top  === resultDataHeight){
            console.log('Triggerd')
            loadDataList(selectedID);
        }else{
            resultDataHeight = $('.tabData table tbody').offset().top-1;
        }


    });

    $(".table_data_"+id).html('');
    loadDataList(id);

    $("#tab-2-"+id).html("");
    loadTraningSummary(id);

    $("#tab-3-"+id).html("");
    loadResultSummary(id);

    getMachineLearningDLModel(id, function (status, data) {
        if(status){
            $(".table_"+id).html('');
            for(var i=0;i<data.attributes.length;i++){
                var attr = data.attributes[i];
                $(".table_"+id).append('<tr>' +
                    '<td>'+attr.name+'</td>' +
                    '<td>'+attr.type+'</td>' +
                    '<td>'+attr.nominals.join(',')+'</td>' +
                    '</tr>');
            }

        }
    });

}

function loadDataList(id) {
    getMachineLearningDLDataList(id,lastId,ml_data_page_count,function (status, data) {
        if(status){
            $(".resultCount_"+id).html(data.total);
            var resultdata = data.data;
            lastId = data.lastId;
            for(var i=0;i<resultdata.length;i++){
                $(".table_data_"+id).append('<tr>' +
                    '<td>'+resultdata[i]+'</td>' +
                    '</tr>');
            }

        }
    })
}

function loadTraningSummary(id) {
    var propName = 'machine.learning.'+id+'.tresult';
    getDomainProperty(propName, function (status, data) {
        if(status){


            $("#tab-2-"+id).html(data.value);
        }
    });
}

function loadResultSummary(id) {
    var propName = 'machine.learning.'+id+'.num_folds';
    getDomainProperty(propName, function (status, data) {
        if(status){

            var resultCount = Number(data.value);
            var resultSet = _.range(1,resultCount+1);
            console.log(resultSet)
            async.mapSeries(resultSet, function (result, cbk) {

                var propNameResult = 'machine.learning.'+id+'.cvresult_'+result;

                getDomainProperty(propNameResult, function (status, data) {
                    if(status){

                        $("#tab-3-"+id).append(data.value+'<hr>');
                    }
                    cbk(null,null);
                });

            },function (err,results) {

            });
        }
    });
}


function openModal(type,id) {
    if(id){
        selectedID = id;
    }

    $(".modelName").html(id);
    if(type === 1){
        $("#addDataModal").modal('show');
    }else  if(type === 2){
        $("#trainDataModal").modal('show');
    }else  if(type === 3){
        $("#deleteDataModal").modal('show');
    }else  if(type === 4){

        $("#createModal form")[0].reset();
        tempAttr = [];
        $(".addAttributes").html('');
        $("#classifier").html('');
        $("#predictionType").html('');
        for(var i=0;i<PREDICTION_TYPE.length;i++){
            $("#predictionType").append('<option value="'+PREDICTION_TYPE[i]+'">'+PREDICTION_TYPE[i]+'</option>');
        }
        for(var i=0;i<CLASSIFIER.length;i++){
            $("#classifier").append('<option value="'+CLASSIFIER[i]+'">'+CLASSIFIER[i]+'</option>');
        }
        $("#classifier").val('NaiveBayes');
        $("#createModal").modal('show');
    }
}


function addDataModel() {

    var data = $("#modelData").val();
    var sData = data.split("\n");

    insertMLData(selectedID, {items:sData}, function (status, data) {
        if(status){
            $(".table_data_"+selectedID).html('');
            loadDataList(selectedID);
            $("#addDataModal").modal('hide');
            successMsg('Data successfully inserted')
        }else{
            errorMsg('Error in inserting data')
        }
    })

}

function trainModel() {
    trainMLData(selectedID, function (status, data) {
        if(status){
            $("#trainDataModal").modal('hide');
            successMsg('Training initiated successfully')
        }else{
            errorMsg('Error in initiating training')
        }
    })
}

function deleteModel() {
    deleteMLDataModel(selectedID, function (status, data) {
        if(status){
            $("#deleteDataModal").modal('hide');
            loadMLDlList();
            successMsg('Data Model deleted successfully')
        }else{
            errorMsg('Error in deleting data model')
        }
    })
}

function createModel() {
    var resultObj = {
        "relation": $("#modelName").val(),
        "classifier": $("#classifier").val().toU,
        "predictionType": $("#predictionType").val(),
        "trainEvery": 0,
        "trainedAt": 0,
        "attributes": []
    };

    if(tempAttr.length < 2){
        errorMsg('Minimum two attributes needed to create model')
        return false;
    }


    for(var i=0;i<tempAttr.length;i++){
        console.log("tempAttr[i] =>",tempAttr[i])
        var attrObj = {
                "name": $("#name_"+tempAttr[i]).val(),
                "type": $("#type_"+tempAttr[i]).val(),
                "dateFormat": "",
                "nominals": []
            };

        if(getLastChar($("#type_"+tempAttr[i]).val())){
            attrObj['nominals'] = $("#nominals_"+tempAttr[i]).val().split(",");
        }

        resultObj.attributes.push(attrObj);
    }

    if(getLastChar($("#type_"+tempAttr[tempAttr.length-1]).val())){
        errorMsg('Last attribute should be nominal')
        return false;
    }

    upsertDataModel(resultObj, function (status, data) {
        if(status){
            loadMLDlList();
            $("#createModal").modal('hide');
            successMsg('Data Model created successfully')
        }else{
            errorMsg('Error in creating data model')
        }
    })
}

function addAttribute() {


    var id = "id_"+new Date().getTime();

    tempAttr.push(id);

    var str = `
    <div class="col-md-3 `+id+`">
        <div class="form-group">
        <label>Type</label>
            <select id="type_`+id+`" class="form-control input-sm" onchange="checkNominals('`+id+`',this.value)" required></select>
        </div>
    </div>
    <div class="col-md-4 `+id+`">
        <div class="form-group">
        <label>Attribute Name</label>
            <input type="text" class="form-control input-sm" id="name_`+id+`" required/>
        </div>
    </div>
    <div class="col-md-4 `+id+`">
    <div class="form-group">
        <label class="nominals_`+id+` hide">Nominals</label>
            <input class="form-control input-sm hide" id="nominals_`+id+`"/>
            <small class="nominals_`+id+` hide">multiple values with comma separator</small>
        </div>
    </div>
    <div class="col-md-1 `+id+`">
         <div class="form-group"><a href="javascript:void(0)" style="text-decoration: none;color:#333"
         onclick="deleteAttr('`+id+`')" class="btn btn-sm btn-icon"><i class="icon-close"></i></a> </div>
    </div>
    `;
    $(".addAttributes").append(str);

    $("#type_"+id).html('');
    for(var i=0;i<MLA_TYPE.length;i++){
        $("#type_"+id).append('<option value="'+MLA_TYPE[i]+'">'+MLA_TYPE[i]+'</option>');
    }
}

function deleteAttr(id) {
    var obj = [];
    for(var i=0;i<tempAttr.length;i++){
        if(tempAttr[i] !== id){
            obj.push(tempAttr[i])
        }
    }
    $("."+id).remove();
}

function checkNominals(id,val) {
    if(getLastChar(val)){
        $("#nominals_"+id).removeClass('hide')
        $(".nominals_"+id).removeClass('hide')
        $("#nominals_"+id).attr('required','required')
    }else{
        $("#nominals_"+id).addClass('hide')
        $(".nominals_"+id).addClass('hide')
        $("#nominals_"+id).removeAttr('required')
    }
}

function getLastChar(e) {
    return e.substr(-1) === 'S';
}