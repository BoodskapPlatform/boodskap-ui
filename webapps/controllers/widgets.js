var widgetsTable = null;
var widgetId = null;
var moreTag = null;
$(document).ready(function () {

    $("body").removeClass('bg-white')
    loadWidgetsCategory();
    loadWidgets();
});


function loadWidgetsCategory() {

    $("#widgetCategories").html('<option value="">--- select ----</option>');

    for (var i = 0; i < WIDGET_CATEGORY.length; i++) {
        $("#widgetCategories").append('<option value="' + WIDGET_CATEGORY[i] + '">' + WIDGET_CATEGORY[i] + '</option>');
    }

    if (getUrlVars()['category']) {
        $("#widgetCategories").val(decodeURIComponent(getUrlVars()['category']))
    }
}
var scrollId= null;
var ajaxCall = null;
var tCount = 0;

function loadWidgets(){
    tCount = 0;
    if(ajaxCall){
        ajaxCall.abort()
    }

    var widgetStatus = $("#widgetStatus").val();

    var type = 'WIDGET';
    if (widgetStatus === 'true') {
        type = 'WIDGET_PUBLISHED';
    } else {
        type = 'WIDGET';
    }
    scrollId= null;

    var sorting = {};

    sorting[$("#widgetSort").val()] = {order : $("#widgetSortOrder").val()}



    var queryParams = {
        query: {
            "bool": {
                "should": [],
                 "must":[]
            }
        },
        sort: [sorting],
        size:10
    };

    if ($("#widgetCategories").val() !== '') {
        queryParams.query.bool.must.push({
            "match": {
                "category": $("#widgetCategories").val()
            }
        })
    }

    if ($("#widgetStatus") !== '') {
        queryParams.query.bool.must.push({
            "match": {
                "published": widgetStatus === 'true' ? true : false
            }
        })

        if(widgetStatus != 'true'){
            queryParams.query.bool.must.push({
                "match": {
                    "domainKey": DOMAIN_KEY
                }
            })
        }

    }

    var sText = $.trim($("#searchBox").val());

    if (sText !== '') {

        queryParams.query.bool['minimum_should_match']=1;

        queryParams.query['bool']['should'].push({ "wildcard": { "widgetname": "*" + sText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "widgetname": "*" + sText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "widgetname": "*" + sText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "widgetname": "*" + capitalizeFLetter(sText) + "*" } })
        queryParams.query.bool.should.push({
            "match_phrase": {
                "widgetname": sText
            }
        })
        queryParams.query['bool']['should'].push({
            "match_phrase_prefix": {
                "widgetname": {
                    "query": "*" + sText + "*"
                }
            }
        })

        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + sText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + sText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + sText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "tags": "*" + capitalizeFLetter(sText) + "*" } })
        queryParams.query.bool.should.push({
            "match_phrase": {
                "tags": sText
            }
        })
       

        queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + sText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + sText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + sText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "description": "*" + capitalizeFLetter(sText) + "*" } })
        queryParams.query.bool.should.push({
            "match_phrase": {
                "description": sText
            }
        })
       

        queryParams.query['bool']['should'].push({ "wildcard": { "category": "*" + sText + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "category": "*" + sText.toLowerCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "category": "*" + sText.toUpperCase() + "*" } });
        queryParams.query['bool']['should'].push({ "wildcard": { "category": "*" + capitalizeFLetter(sText) + "*" } })
        queryParams.query.bool.should.push({
            "match_phrase": {
                "category": sText
            }
        })
      
    }


    var ajaxObj = {
        "method": "GET",
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": [ {
            "name": "scroll",
            "value": "1m"
        }],
        type : type

    };

    $(".widgetBody").html('<div class="col-md-12"><h5><i class="fa fa-spinner fa-spin"></i> Loading widgets....</h5></div>');
    $(".paginationBody").html('')

    ajaxCall = $.ajax({
        url: API_BASE_PATH + "/elastic/search/query/" + API_TOKEN_ALT,
        data: JSON.stringify(ajaxObj),
        contentType: "application/json",
        type: 'POST',
        success: function (data) {
            //called when successful
            var resultData = searchQueryFormatterNew(data);

            if(resultData.total > 0){
                $(".widgetBody").html('');
                scrollId =   resultData.scroll_id;
                for(var i=0;i<resultData.data.data.length;i++){
                    renderWidgetDiv(resultData.data.data[i]);
                }
                tCount+=resultData.data.data.length;

                $(".widgetsCount").html(resultData.total)

                if(resultData.total > tCount){
                    $(".paginationBody").html('<button class="btn btn-default btn-block" onclick="loadMore(\''+scrollId+'\')">Load More</button>')
                }
                if(resultData.total == tCount){
                    $(".paginationBody").html('');
                }

            }else{
                scrollId = null;
                $(".widgetBody").html('<div class="col-md-12"><h5>No Widgets Found!</h5></div>')
                errorMsg('No widgets found!')
                $(".widgetsCount").html(0)
            }
        },
        error: function (e) {
            //called when there is an error
            if(e.statusText != 'abort'){
                $(".widgetBody").html('<div class="col-md-12"><h5>No Widgets Found!</h5></div>')
                errorMsg('No widgets found!')
                $(".widgetsCount").html(0)
            }

        }
    });


}

function loadMore(id){

    $(".paginationBody").html('<button class="btn btn-default btn-block" ><i class="fa fa-spinner fa-spin"></i> Loading...</button>')

    scrollNextQuery(id,function (status,result){
        if(status){
            var resultData = searchQueryFormatterNew(result);

            if(resultData.total > 0){
                scrollId =   resultData.scroll_id;
                for(var i=0;i<resultData.data.data.length;i++){
                    renderWidgetDiv(resultData.data.data[i]);
                }
                tCount+=resultData.data.data.length;

                $(".paginationBody").html('<button class="btn btn-default btn-block" onclick="loadMore(\''+scrollId+'\')">Load More</button>')

                if(resultData.total == tCount){
                    $(".paginationBody").html('');
                }

            }else{
                $(".paginationBody").html('');
            }

        }else{
            $(".paginationBody").html('');
        }
    })
}

function renderWidgetDiv(obj){

    var tags ='';

    var tagObj = obj.tags.split(",");

    for(var i=0;i<tagObj.length;i++){
        if(tagObj.length>3){
            if(i<=2){
                tags+= '<i class="label label-default mr-2">'+tagObj[i]+'</i>'
                moreTag ='<span class="tagEllipseMargin">...</span>'
            }
        }
        else{
            moreTag ="";
            tags+= '<i class="label label-default mr-2">'+tagObj[i]+'</i>'    
        }
     
        
    }
    var imgPath = 'images/menu/widget.png'
    if(obj.widgetimage){
        imgPath = API_BASE_PATH+`/files/public/download/`+obj.widgetimage
    }
    if(obj.marketplace){
        if(obj.widgetimage) {
            imgPath = MARKETPLACE_API_URL + `/files/public/download/` + obj.widgetimage
        }
    }

    var editAction = '';
    if(obj.createdbyemail === USER_OBJ.user.email || ADMIN_ACCESS || (obj.domainKey === DOMAIN_KEY && DOMAIN_ADMIN_ACCESS)){
        editAction = '<a class="text-dark mt-2" href="'+WEB_BASE_PATH+'/widget/editwidget/'+obj.widgetid+'"><i class="icon-edit2"></i> Edit</a>'
    }

    var str = `
        <div class="col-xl-3 col-lg-3 col-md-4 col-sm-12 mb-3">
                    <div class="widgetDiv" title="`+(obj.description ? obj.description : '')+`">
                        <div class="row">
                            <div class="col-lg-4 col-md-4 col-sm-12" style="">
                                <div class="text-center">
                                <img src="`+imgPath+`"  style="width:75px "/><br>
                                `+editAction+`
                                </div>
                            </div>
                            <div class="col-lg-8 col-md-8 col-sm-12 pl-2">
                                <a href="javascript:;" class="pull-right text-danger" onclick="deleteWid('`+obj.widgetid+`','`+obj.widgetname+`')"><i class="fa fa-close"></i></a>
                                <h5 class="pull-left" style="width:100%;white-space: nowrap;text-overflow: ellipsis;  overflow: hidden;" title="`+obj.widgetname+`">`+obj.widgetname+`</h5>
                                <small class="mr-2">v`+obj.version+`</small> <small><i class="fa fa-folder"></i> `+obj.category+`</small> <br>
                                <p class="" style="margin-top: 3px" title="`+obj.tags+`"><i class="fa fa-tags"></i>
                                    `+tags+moreTag+`
                                </p>
                                <small class="mr-2"><i class="fa fa-user"></i> `+obj.createdby+`</small>
                                
                                 <br><small><i class="fa fa-clock-o"></i> `+moment(obj.updatedtime).format('MM/DD/YYYY hh:mm a')+`</small><br>
                                
                                <div class="btn-`+obj.widgetid+`">
                                    <button class="btn mt-2 btn-warning btn-sm action hide" onclick="importModal('`+obj.widgetid+`','`+obj.widgetname+`')"><i class="icon-plus-square"></i> <span class="hidden-xs">Add to Domain</span></button>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
    `;
    checkWidget(obj.widgetid,obj.widgetname);
    $(".widgetBody").append(str);
// <p class="description" title="`+obj.description+`">
//                                     `+obj.description+`
//                                 </p>
}
//
function deleteWid(id,nam){
    swal({
        title: "Are you sure?",
        text: nam+" - widget will be removed from your widget library",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, Remove it!",
    })
        .then(function (result) {
            if (result.value) {
                deleteWidget(id,function (status,rest){
                    if(status){
                        successMsg('Successfully Widget removed from library!')
                        loadWidgets();
                    }else{
                        errorMsg('Error in removing widget')
                    }
                })

            }
        });
}

function checkWidget(id,nam){
    var queryParams = {
        query: {
            "bool": {
                "must": [{match:{'clientDomainKey':DOMAIN_KEY}},{match:{'widgetid':id}}]
            }
        },
        size:1
    };


    var ajaxObj = {
        "method": "GET",
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        type : 'WIDGET_IMPORTED'

    };
    searchByQuery(null,'WIDGET_IMPORTED',ajaxObj,function (status,data){
        if(status){
            var resultData = searchQueryFormatterNew(data);

            if(resultData.total > 0){
                // $(".btn-"+id+" .action").removeClass('hide').removeClass('btn-warning').addClass('btn-default');
                // $(".btn-"+id+" .action").removeAttr('onclick')
                // $(".btn-"+id+" .action").attr('disabled','disabled')
                // $(".btn-"+id+" .action").html('<i class="fa fa-check"></i> Already Added')


                $(".btn-"+id).append('<button class="mt-2 btn btn-outline-danger btn-sm delBtn" onclick="deleteImpWidget(\''+id+'\',\''+nam+'\')"><i class="fa fa-trash"></i> Uninstall</button>')

            }else{
                $(".btn-"+id+" .action").removeClass('hide')
            }
        }else{
            $(".btn-"+id+" .action").removeClass('hide')
        }
    })
}


function deleteImpWidget(id, name) {
    swal({
        title: "Are you sure?",
        text: name+", widget will be removed from your domain",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, Remove it!",
    })
        .then(function (result) {
            if (result.value) {
                deleteImportedWidget(id,function (status,rest){
                    if(status){
                        successMsg('Widget removed from domain successfully!')

                        $(".btn-"+id+" .action").removeClass('btn-default').addClass('btn-warning');
                        $(".btn-"+id+" .action").removeAttr('disabled')
                        $(".btn-"+id+" .action").attr('onclick','importModal("'+id+'","'+name+'")')
                        $(".btn-"+id+" .action").html('<i class="icon-plus-square"></i> <span class="hidden-xs">Add to Domain</span>')


                        $(".btn-"+id+" .delBtn").remove();

                    }else{
                        errorMsg('Error in removing widget')
                    }
                })

            }
        });
}


function deleteModal(id, name) {
    widgetId = id;
    $(".widgetName").html(name);
    $("#deleteModal").modal('show');
}

function proceedDelete() {
    $(".btnModal").removeAttr('disabled');
    $(".btnModal").html('Proceed')

    deleteWidget(widgetId, function (status, data) {
        $(".btnModal").removeAttr('disabled');
        $(".btnModal").html('Proceed')
        if (status) {
            setTimeout(function () {
                loadWidgets();
                $("#deleteModal").modal('hide');
                successMsg('Widget successfully deleted')
            },500);
        } else {
            errorMsg('Error in widget delete')
        }
    })
}

function importModal(id, name) {
    widgetId = id;
    // $(".widgetName").html(name);
    // $("#importModal").modal('show');

    swal({
        title: "Are you sure?",
        text: name + " - Widget will be added to your domain",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-success",
        confirmButtonText: "Yes, Add it!",
    })
        .then(function (result) {
            if (result.value) {
                importWidget(id, function (status, data) {
                    $(".btnModal").removeAttr('disabled');
                    $(".btnModal").html('Proceed')
                    if (status) {
                        $("#importModal").modal('hide');
                        successMsg('Widget successfully imported to your domain')
                    } else {
                        errorMsg('Error in adding widget')
                    }
                })

            }
        });
}

function proceedImport() {
    $(".btnModal").removeAttr('disabled');
    $(".btnModal").html('Proceed')

    // findByID('WIDGET_IMPORTED', widgetId, function (status, data) {
    //     if(status){
    //
    //         errorMsg('Widget already imported to your domain')
    //     }else{
    importWidget(widgetId, function (status, data) {
        $(".btnModal").removeAttr('disabled');
        $(".btnModal").html('Proceed')
        if (status) {
            $("#importModal").modal('hide');
            successMsg('Widget successfully imported to your domain')
        } else {
            errorMsg('Error in adding widget')
        }
    })
    //     }
    // });
}
