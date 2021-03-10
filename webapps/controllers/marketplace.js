var widgets_list = [];

$(document).ready(function () {
    // $(".bodyContainer").css('height', $(window).height() - 165)
    $("body").removeClass('bg-white');
    $("body").css('background-color', '#fff !important');

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

    scrollId= null;

    var queryObj = {
        pageSize : 10,
        sortBy : $("#widgetSort").val(),
        sortOrder : $("#widgetSortOrder").val(),
        category : $("#widgetCategories").val(),
        searchText : $.trim($("#searchBox").val())
    };

    $(".widgetBody").html('<div class="col-md-12"><h5><i class="fa fa-spinner fa-spin"></i> Loading widgets....</h5></div>');
    $(".paginationBody").html('')

    ajaxCall = $.ajax({
        url: MARKETPLACE_URL + "/widgets/list",
        data: queryObj,
        contentType: "application/json",
        type: 'GET',
        success: function (data) {
            //called when successful

            if(data.status && data.result.total > 0){
                var resultData = data.result;
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
    var queryObj = {
        scrollId: id
    }
    $.ajax({
        url: MARKETPLACE_URL + "/widget/list",
        data: queryObj,
        contentType: "application/json",
        type: 'GET',
        success: function (data) {

            if(data.status && data.result.total > 0){
                var resultData = data.result;
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
        },
        error: function (e) {
            //called when there is an error
            $(".paginationBody").html('');

        }
    });
}

function renderWidgetDiv(obj){

    var tags ='';

    var tagObj = obj.tags.split(",");

    for(var i=0;i<tagObj.length;i++){
        tags+= '<i class="label label-default mr-2">'+tagObj[i]+'</i>'
    }
    var imgPath = 'images/menu/widget.png'
    if(obj.widgetimage){
        imgPath = MARKETPLACE_API_URL+`/files/public/download/`+obj.widgetimage
    }
  /*  if(obj.market){
        if(obj.widgetimage) {
            imgPath = MARKETPLACE_API_URL + `/files/public/download/` + obj.widgetimage
        }
    }*/

    var str = `
        <div class="col-xl-3 col-lg-3 col-md-4 col-sm-12 mb-3">
                    <div class="widgetDiv" title="`+(obj.description ? obj.description : '')+`">
                        <div class="row">
                            <div class="col-lg-4 col-md-4 col-sm-12" style="">
                                <div class="text-center">
                                <img src="`+imgPath+`"  style="width:75px "/>
                                </div>
                            </div>
                            <div class="col-lg-8 col-md-8 col-sm-12 pl-2">
                                <h5 class="" style="width:100%;white-space: nowrap;text-overflow: ellipsis;  overflow: hidden;" title="`+obj.widgetname+`">`+obj.widgetname+`</h5>
                                <small class="mr-2">v`+obj.version+`</small> <small><i class="fa fa-folder"></i> `+obj.category+`</small> <br>
                                <p class="" style="margin-top: 3px"><i class="fa fa-tags"></i>
                                    `+tags+`
                                </p>
                                <small class="mr-2"><i class="fa fa-user"></i> `+obj.createdby+`</small>
                                
                                 <br><small><i class="fa fa-clock-o"></i> `+moment(obj.updatedtime).format('MM/DD/YYYY hh:mm a')+`</small><br>
                                
                                <div class="btn-`+obj.widgetid+`">
                                    <button class="btn mt-2 btn-green btn-sm action" onclick="installWidget('`+obj.widgetid+`','`+obj.widgetname+`')"><i class="icon-download"></i> <span class="hidden-xs">Install Widget</span></button>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
    `;
    $(".widgetBody").append(str);
// <p class="description" title="`+obj.description+`">
//                                     `+obj.description+`
//                                 </p>
}

function installWidget(wid,wnam){


    swal({
        title: "Are you sure?",
        text: wnam + " - Widget will be installed to your domain",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-green",
        confirmButtonText: "Yes, Install it!",
    })
        .then(function (result) {
            if (result.value) {

                var id = wid;

                $(".btn-"+id+" .action").attr('disabled','disabled')
                $(".btn-"+id+" .action").html('<i class="fa fa-spinner fa-spin"></i> Installing widget')


                getWidgetFromMarketplace(wid, function (status, result) {
                    if (status) {
                        if (result.status && result.result) {
                            var widgetObj = result.result;

                            widgetObj.clientDomainKey = DOMAIN_KEY;
                            widgetObj.domainKey = DOMAIN_KEY;
                            delete widgetObj._id;

                            widgetObj['marketplace'] = 'yes';

                            upsertWidget(widgetObj, function (status, data) {
                                if (status) {

                                    if (codeID) {
                                        var codeID = widgetObj.code;

                                        //importing code
                                        var data = {
                                            data: widgetObj.code_obj
                                        };

                                        insertGlobalProperty(data, function (status, data) {
                                            $(".btn-"+id+" .action").removeAttr('disabled')
                                            $(".btn-"+id+" .action").html('<i class="icon-download"></i> Install Widget')
                                            if (status) {
                                                successMsg('Widget installed successfully!');
                                            } else {
                                                errorMsg('Error in installing widget code!')
                                            }
                                        })
                                    }else{
                                        $(".btn-"+id+" .action").removeAttr('disabled')
                                        $(".btn-"+id+" .action").html('<i class="icon-download"></i> Install Widget')
                                        successMsg('Widget installed successfully!');
                                    }

                                } else {
                                    $(".btn-"+id+" .action").removeAttr('disabled')
                                    $(".btn-"+id+" .action").html('<i class="icon-download"></i> Install Widget')
                                    errorMsg('Error in Widget Installation!')
                                }
                            });

                        }else{
                            $(".btn-"+id+" .action").removeAttr('disabled')
                            $(".btn-"+id+" .action").html('<i class="icon-download"></i> Install Widget')
                            errorMsg('Error in Widget Installation!')
                        }

                    }
                    else{
                        $(".btn-"+id+" .action").removeAttr('disabled')
                        $(".btn-"+id+" .action").html('<i class="icon-download"></i> Install Widget')
                        errorMsg('Error in Widget Installation!')
                    }
                })
            }
        });

}
