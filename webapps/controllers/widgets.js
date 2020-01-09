var widgetsTable = null;
var widgetId = null;

$(document).ready(function () {

    $("body").removeClass('bg-white')
    console.log(getUrlVars()['category'])
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


function loadWidgets() {
    $(".widgetsList").html("");

    if (widgetsTable) {
        widgetsTable.destroy();
        $("#widgetsTable").html("");
    }


    var widgetCategories = $("#widgetCategories").val();
    var widgetStatus = $("#widgetStatus").val();

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        query: {
            "bool": {
                "must": [],
            }
        },
        sort: [{"updatedtime": {"order": 'desc'}}],
    };

    var wCat = {};
    var wStat = {};
    if (widgetCategories !== '') {
        wCat = {
            "match": {
                "category": widgetCategories
            }
        }
    }
    if (widgetStatus !== '') {
        wStat = {
            "match": {
                "published": widgetStatus === 'true' ? true : false
            }
        }
    }

    var type = 'WIDGET';
    if (widgetStatus === 'true') {
        type = 'WIDGET_PUBLISHED';
    } else {
        type = 'WIDGET';
    }

    var fields = [
        {
            mData: 'widgetname',
            sTitle: 'Widget Name',
            "class": "details-control",
            "orderable": false,
            mRender: function (data, type, row) {

                var img = '<img src="'+API_BASE_PATH+'/files/public/download/'+row.widgetimage+'" alt="" style="width:50px;margin-right:5px" class="pull-left"/>';

                var str = img+'<label style="display:block;text-align: left">' + data + '</label>' +
                    '<small>' + row['category'] + '</small>';
                return str;
            }
        },
        {
            mData: 'version',
            sTitle: 'Version',
            "class": "details-control",
            orderable: false,
        },
        {
            mData: 'createdby',
            sTitle: 'Developer',
            "class": "details-control",
            orderable: false,
            mRender: function (data, type, row) {

                var str = '<label style="display:block;text-align: left">' + data + '</label>' +
                    '<small>' + row['createdbyemail'] + '</small>';
                return str;
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Last Updated',
            "class": "details-control",
            orderable: true,
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'createdtime',
            sTitle: 'Creadted Time',
            "class": "details-control",
            orderable: true,
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        }

    ];


    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        searching: true,
        "ordering": true,
        aaSorting: [[3, 'desc']],
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {


            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {
                var searchJson = {
                    "multi_match": {
                        "query": '*' + searchText + '*',
                        "type": "phrase_prefix",
                        "fields": ['tags', 'widgetname', 'description', 'category', 'createdby']
                    }
                };


                queryParams.query['bool']['must'] = [searchJson];

            } else {
                queryParams.query['bool']['must'] = [];
            }

            if (widgetCategories !== '') {
                queryParams.query['bool']['must'].push(wCat);
            }
            if (widgetStatus !== '') {
                queryParams.query['bool']['must'].push(wStat);
            }

            if (widgetStatus === 'false') {

                queryParams.query['bool']['must'].push(domainKeyJson);
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : type

            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = searchQueryFormatterNew(data).data;
                    widgets_list = resultData.data;
                    resultData['draw'] = oSettings.iDraw;
                    $(".widgetsCount").html(resultData.recordsTotal);

                    fnCallback(resultData);
                }
            });
        }

    };

    widgetsTable = $("#widgetsTable").DataTable(tableOption);

    var detailRows = [];

    $('#widgetsTable tbody').on('click', '.details-control', function () {

        $(".eventRow").hide();
        var tr = $(this).closest('tr');
        var row = widgetsTable.row(tr);
        var idx = $.inArray(tr.attr('id'), detailRows);

        if (row.child.isShown()) {
            tr.removeClass('details');
            row.child.hide();

            // Remove from the 'open' array
            detailRows.splice(idx, 1);
        }
        else {
            tr.addClass('details');
            row.child(formatRow(row.data())).show();

            // Add to the 'open' array
            if (idx === -1) {
                detailRows.push(tr.attr('id'));
            }
        }
    });


}


function formatRow(obj) {

    var tags = obj.tags.split(",");
    var tagStr = ''
    for(var i=0;i<tags.length;i++){
        tagStr = tagStr + '<span class="mr-1 label label-default">'+tags[i]+'</span>'
    }

    var editButton = '';
    var addDomain = '';

    if(DOMAIN_KEY === obj.domainKey){
        editButton = `<div class="btn-group btn-group-justified pull-right">
            <a  href="/marketplace/addwidget/` + obj.widgetid + `" class="btn btn-outline-secondary btn-xs" title="Edit Widget"><i class="icon-edit2"></i> Edit</a>
        <button class="btn btn-outline-danger btn-xs" title="Delete Widget" onclick="deleteModal('`+obj._id+`','`+obj.widgetname+`')">
        <i class="icon-trash4"></i> Delete</button>
        </div>`;
    }else{
        addDomain = `<button class="btn btn-warning pull-right mr-2" onclick="importModal('`+obj._id+`','`+obj.widgetname+`')"><i class="icon-plus-square"></i> <span class="hidden-xs">Add to Domain</span></button>`;
    }

    var widgetScreens = '';

    for (var i = 0; i < obj.widgetscreens.length; i++) {
        widgetScreens = widgetScreens + '  <img src="' + API_BASE_PATH + '/files/public/download/' + obj.widgetscreens[i] + '" ' +
            'class="img-responsive mt-2 mr-2" style="border:2px solid #eee;padding:5px;" height="150"/>'
    }

    if(widgetScreens !== ''){
        widgetScreens = '<label style="display: block;text-align: left">Screenshots</label>' +widgetScreens
    }


    var basedOn = '';

    var widgedBased = JSON.parse(obj.config);

    if (widgedBased.asset.flag) {
        basedOn = basedOn + '{ Asset } ';
    }
    if (widgedBased.device.flag) {
        basedOn = basedOn + '{ Device } ';
    }
    if (widgedBased.message.flag) {
        basedOn = basedOn + ' { Message } ';
    }
    if (widgedBased.record && widgedBased.record.flag) {
        basedOn = basedOn + ' { Record } ';
    }

    if (basedOn !== '') {
        basedOn = '<p style="font-size:11px"><b>Widgets Based On:</b> ' + basedOn + '</p>';
    }


    var str= `<div class="row">
        <div class="col-lg-12">
            <div class="verticalBox">
               <div class="row">
                    <div class="col-lg-4" style="text-align: center;background-color: #eeeeee78;padding: 5px;">
                        <img src="`+API_BASE_PATH+`/files/public/download/`+obj.widgetimage+`" alt="" style="max-width: 100%;max-height: 300px;"/>
                    </div>
                    <div class="col-lg-8">
                     <div class="row mt-1 mb-2">
                         <div class="col-lg-12">
                            <label style="text-align: left;display: inline-block">`+obj.category+` `+tagStr+`</label>
                           `+addDomain+`
                           
                           `+editButton+`
                           </div>
                       </div>
                         <p style="white-space: pre-wrap;"> `+obj.description+`</p>
                         <p> `+basedOn+`</p>
                    </div>
                </div>
                   
               <div class="row">
                <div class="col-lg-12">
                `+widgetScreens+`
                </div>
                </div>  
               
               <div class="row mt-1">
                   <div class="col-lg-4" style="">
                            <label style="display: block">Author</label>
                            <p class="createdBy">`+obj.createdby+`<br><small>`+obj.createdbyemail+`</small></p>
                    
                    </div>
                   <div class="col-lg-4" style="">
                            <label style="display: block">Created</label>
                            <p class="createdDate">`+moment(obj.createdtime).format('MM/DD/YYYY hh:mm a')+`</p>
                    
                    </div>
                   <div class="col-lg-4" style="">
                            <label style="display: block">Last Update</label>
                            <p class="updatedDate">`+moment(obj.updatedtime).format('MM/DD/YYYY hh:mm a')+`</p>
                    </div>
                </div>
               
                 
            </div>
        </div>
        </div>
    `;
    return str;
}

function searchQueryFormatter(data) {

    var resultObj = {
        total: 0,
        data: {},
        aggregations: {}
    }

    if (data.httpCode === 200) {

        var arrayData = JSON.parse(data.result);

        var totalRecords = arrayData.hits.total ? arrayData.hits.total.value : 0;
        var records = arrayData.hits.hits;

        var aggregations = arrayData.aggregations ? arrayData.aggregations : {};


        for (var i = 0; i < records.length; i++) {
            records[i]['_source']['_id'] = records[i]['_id'];
        }

        resultObj = {
            "total": totalRecords,
            "data": {
                "recordsTotal": totalRecords,
                "recordsFiltered": totalRecords,
                "data": _.pluck(records, '_source')
            },
            aggregations: aggregations
            // data : _.pluck(records, '_source')
        }


        return resultObj;

    } else {

        return resultObj;
    }

}

function renderWidget(obj) {


    var tags = obj.tags.split(",");
    var tagStr = ''
    for (var i = 0; i < tags.length; i++) {
        tagStr = tagStr + '<span class="mr-1 label label-default">' + tags[i] + '</span>'
    }

    var widgetScreens = '';

    for (var i = 0; i < obj.widgetscreens.length; i++) {
        widgetScreens = widgetScreens + '  <img src="' + API_BASE_PATH + '/files/public/download/' + obj.widgetscreens[i] + '" ' +
            'class="img-responsive mt-2 mr-2" style="border:2px solid #eee;padding:5px;" height="150"/>'
    }

    var basedOn = '';

    var widgedBased = JSON.parse(obj.config);

    console.log(widgedBased)

    if (widgedBased.asset.flag) {
        basedOn = basedOn + '{ Asset } ';
    }
    if (widgedBased.device.flag) {
        basedOn = basedOn + '{ Device } ';
    }
    if (widgedBased.message.flag) {
        basedOn = basedOn + ' { Message } ';
    }
    if (widgedBased.record && widgedBased.record.flag) {
        basedOn = basedOn + ' { Record } ';
    }

    if (basedOn !== '') {
        basedOn = '<p style="font-size:11px"><b>Widgets Based On:</b> ' + basedOn + '</p>';
    }

    var liveStatus = '';

    if (obj.published) {
        liveStatus = '<label class="label label-success pull-left" style="background-color: #4caf50;margin-right: 5px;">LIVE</label>'
    }


    var editButton = '';
    var addDomain = '';
    if (DOMAIN_KEY === obj.domainKey) {
        editButton = '<a class="btn btn-outline-dark btn-block" href="/marketplace/addwidget/' + obj._id + '"><i class="icon-edit2"></i>Edit Widget</a>' +
            '<a class="btn btn-outline-danger btn-block" href="javascript:void(0)" onclick="deleteModal(\'' + obj._id + '\',\'' + obj.widgetname + '\')"><i class="icon-trash4"></i>Delete Widget</a>';
    } else {
        addDomain = '<button class="btn btn-outline-dark btn-block" onclick="importModal(\'' + obj._id + '\',\'' + obj.widgetname + '\')"><i class="icon-plus"></i> Add To Domain</button>';
    }


    var str = `
        <div class="row widgetContent" style="">
            <div class="col-lg-2 widgetPanel" style="">
                 <img src="` + API_BASE_PATH + `/files/public/download/` + obj.widgetimage + `" alt="" style="max-width: 100%"/>
            </div>
             <div class="col-lg-8" style="padding: 10px;background-color: #eeeeee42;border: 1px solid #eee;">
                 <h5 class="item-title">` + obj.widgetname + ` ` + liveStatus + `
                 
                    <label class="label label-warning pull-right" style="background-color: #f44336">Version: ` + obj.version + `</label>
                 
                    </h5>
                  <p class="item-desc">` + obj.category + `</p>
                  <p><small>` + obj.description + `</small></p>
                  <p class="mt-2">` + tagStr + `</p>
                  
                   ` + basedOn + `
                  
                   <div class="widgetScreens">` + widgetScreens + `
                      
                    </div>
                  
            </div>
             <div class="col-lg-2" style="padding: 10px;border: 1px solid #eee;text-align: left;">
             
                        <label style="display: block">Author</label>
                        <p class="createdBy">` + obj.createdby + `<br><small>` + obj.createdbyemail + `</small></p>
                        <label style="display: block">Created</label>
                        <p class="createdDate">` + moment(obj.createdtime).format('MM/DD/YYYY hh:mm a') + `</p>
                        <label style="display: block">Last Update</label>
                        <p class="updatedDate">` + moment(obj.updatedtime).format('MM/DD/YYYY hh:mm a') + `</p>
                        
                        ` + addDomain + `
                        
                        ` + editButton + `
                
            </div>
        </div>
    `;


    return str;

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
    $(".widgetName").html(name);
    $("#importModal").modal('show');
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