var verticalTable = null;
var verticalId = null;
var vertical_list = [];
var page_from = 0;
$(document).ready(function () {

    $("body").removeClass('bg-white')
    loadVerticalsCategory();
    loadVerticals();
});


function loadVerticalsCategory() {

    $("#verticalCategories").html('<option value="">--- select ----</option>');

    for(var i=0;i<VERTICAL_CATEGORY.length;i++){
        $("#verticalCategories").append('<option value="'+VERTICAL_CATEGORY[i]+'">'+VERTICAL_CATEGORY[i]+'</option>');
    }


}





function loadVerticals() {

    if (verticalTable) {
        verticalTable.destroy();
        $("#verticalTable").html("");
    }

    var fields = [
        {
            mData: 'verticalname',
            sTitle: 'Vertical Name',
            "class": "details-control",
            "orderable": false,
            mRender: function (data, type, row) {

                var img = '<img src="'+API_BASE_PATH+'/files/public/download/'+row.verticalimage+'" alt="" style="width:50px;margin-right:5px" class="pull-left"/>';

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

                var str = '<label style="display:block;text-align: left">'+data+'</label>'+
                    '<small>'+row['createdbyemail']+'</small>';
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



    var verticalCategories = $("#verticalCategories").val();
    var verticalStatus = $("#verticalStatus").val();

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};


    var queryParams = {
        query: {
            "bool": {
                "must": [],
            }
        },
        sort: [{"updatedtime": {"order": "desc"}}],
    };

    var wCat = {};
    var wStat = {};
    if(verticalCategories !== ''){
        wCat = {
            "match": {
                "category": verticalCategories
            }
        }
    }



    if(verticalStatus !== ''){
        wStat = {
            "match": {
                "published": verticalStatus === 'true' ? true : false
            }
        }
    }
    var type = 'VERTICAL';
    if(verticalStatus === 'true'){
        type = 'VERTICAL_PUBLISHED';
    }else{
        type = 'VERTICAL';
    }


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


            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {
                var searchJson = {
                    "multi_match": {
                        "query": '*' + searchText + '*',
                        "type": "phrase_prefix",
                        "fields": ['tags','verticalname','description','category','createdby']
                    }
                };


                queryParams.query['bool']['must'] = [searchJson];

            } else {
                queryParams.query['bool']['must'] = [];
            }

            if(verticalCategories !== ''){
                queryParams.query['bool']['must'].push(wCat);
            }
            if(verticalStatus !== ''){
                queryParams.query['bool']['must'].push(wStat);
            }

            if (verticalStatus === 'false') {

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

                    var resultData = searchQueryFormatter(data).data;
                    vertical_list =resultData.data;
                    $(".verticalsCount").html(resultData.recordsTotal);

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    verticalTable = $("#verticalTable").DataTable(tableOption)

    var detailRows = [];

    $('#verticalTable tbody').on('click', '.details-control', function () {

        $(".eventRow").hide();
        var tr = $(this).closest('tr');
        var row = verticalTable.row(tr);
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
            <a href="/marketplace/addvertical/`+obj.verticalid+`" class="btn btn-outline-secondary btn-xs" title="Edit Vertical"><i class="icon-edit2"></i> Edit</a>
        <button class="btn btn-outline-danger btn-xs" title="Delete Vertical" onclick="deleteModal('`+obj._id+`','`+obj.verticalname+`')">
        <i class="icon-trash4"></i> Delete</button>
        </div>`;
    }else{
        addDomain = `<button class="btn btn-warning pull-right mr-2" onclick="importModal('`+obj._id+`','`+obj.verticalname+`')"><i class="icon-plus-square"></i> <span class="hidden-xs">Add to Domain</span></button>`;
    }

    if(!obj.enabled){
        addDomain = '';
    }


    var str= `<div class="row">
        <div class="col-lg-12">
            <div class="verticalBox">
               <div class="row">
                    <div class="col-lg-4" style="text-align: center;background-color: #eeeeee78;padding: 5px;">
                        <img src="`+API_BASE_PATH+`/files/public/download/`+obj.verticalimage+`" alt="" style="max-width: 100%;"/>
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
                
             <div class="row mt-1 version_`+obj.verticalid+`">
             
                
             
             </div>
               
                 
            </div>
        </div>
        </div>
    `;
    // loadVerticalVersion(obj.verticalid, obj._id);
    return str;
}

function loadVerticalVersion(vid, id) {
    var queryParams = {
        query: {
            "bool": {
                "must": [{"match": {"domainKey": DOMAIN_KEY}}, {"match": {"verticalid": vid}}],
            }
        },
        size: 100
    };


    var ajaxObj = {
        "method": "GET",
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    searchByQuery('', 'VERTICAL_VERSION', ajaxObj, function (status, data) {
        if (status) {

            var result = searchQueryFormatter(data).data;


        }else{

        }
    });
}


function searchQueryFormatter(data) {

    var resultObj = {
        total: 0,
        data: {},
        aggregations: {}
    }

    if (data.httpCode === 200) {

        var arrayData = JSON.parse(data.result);

        var totalRecords = arrayData.hits.total;
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
        }



        return resultObj;

    } else {

        return resultObj;
    }

}

function deleteModal(id, name) {
    verticalId = id;
    $(".verticalName").html(name);
    $("#deleteModal").modal('show');
}

function proceedDelete() {
    $(".btnModal").attr('disabled','disabled')
    $(".btnModal").html('processing please wait')

    deleteVertical(verticalId, function (status, data) {
        $(".btnModal").removeAttr('disabled');
        $(".btnModal").html('Proceed')
        if(status){
            setTimeout(function () {
                loadVerticals();
                $("#deleteModal").modal('hide');
                successMsg('Vertical successfully deleted')
            },500);
        }else{
            errorMsg('Error in vertical delete')
        }
    })
}

function importModal(id, name) {
    verticalId = id;
    $(".verticalName").html(name);
    $("#importModal").modal('show');
}

function proceedImport() {

    $(".btnModal").attr('disabled','disabled')
    $(".btnModal").html('processing please wait')

    // findByID('WIDGET_IMPORTED', verticalId, function (status, data) {
    //     if(status){
    //
    //         errorMsg('Widget already imported to your domain')
    //     }else{
    importVertical(verticalId, function (status, data) {
        $(".btnModal").removeAttr('disabled');
        $(".btnModal").html('Proceed')
        if(status){
            $("#importModal").modal('hide');
            successMsg('Vertical successfully imported to your domain')
        }else{
            errorMsg('Error in adding vertical')
        }
    })
    //     }
    // });
}