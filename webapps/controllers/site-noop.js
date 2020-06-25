var siteTable = null;
var current_site_id = null;
var website_list = []

$(document).ready(function () {


    loadPage();

    $("body").removeClass('bg-white');

});

function loadPage() {


    if (siteTable) {
        siteTable.destroy();
        $("#siteTable").html("");
    }

    var fields = [
        {
            mData: 'label',
            sTitle: 'Website',
            orderable: false,
            mRender: function (data, type, row) {
                return data+'<br><a href="' + row['url'] + '" target="_blank">' + row['url'] + '</a>'
            }
        },
        {
            mData: 'method',
            sTitle: 'Method',
            orderable: false,
        },
        {
            mData: 'emails',
            sTitle: 'Email',
            orderable: false,
            mRender: function (data, type, row) {
                return data.join(", ")
            }
        },
        {
            mData: 'phones',
            sTitle: 'Phone',
            orderable: false,
            mRender: function (data, type, row) {
                return data.join(", ")
            }
        },
        {
            mData: 'last_update_ts',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
            }
        },
        {
            mData: 'create_ts',
            sTitle: 'Created Time',
            mRender: function (data, type, row) {
                return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                var str = '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,\'' + row['_id'] + '\')"><i class="icon-trash-o"></i></button>'


                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(2,\'' + row["_id"] + '\')"><i class="icon-edit2"></i></button>' +
                    str;
            }
        }


    ];


    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        query: {
            "bool": {
                "must": [],
            }
        },
        sort: []
    };

    var tableOption = {
        responsive: true,
        paging: true,
        aaSorting: [[4, 'desc']],
        searching: true,
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            queryParams.query['bool']['must'] = []
            queryParams.query['bool']['should'] = []
            delete queryParams.query['bool'].minimum_should_match;

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {

                queryParams.query['bool']['should'].push({"wildcard": {"url": "*" + searchText.toLowerCase() + "*"}})
                queryParams.query['bool']['should'].push({"wildcard": {"emails": "*" + searchText + "*"}})
                queryParams.query['bool']['should'].push({"wildcard": {"phones": "*" + searchText + "*"}})

                queryParams.query['bool'].minimum_should_match = 1;

            }

            var ajaxObj = {
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                specId: SITE_NOOP,
                type: 'RECORD'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;
                    website_list = resultData.data;
                    $(".actionCount").html(resultData.recordsFiltered)
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    siteTable = $("#siteTable").DataTable(tableOption);


}


function openModal(type, id) {
    current_site_id = id;


    if (type === 1) {
        renderModalContent('p');
        renderModalContent('h');
        renderModalContent('q');
        renderModalContent('f');
        $("#websiteModal form")[0].reset();
        $("#websiteModal .templateTitle").html('Add')
        $("#websiteModal form").attr('onsubmit','addWebsite()')
        $("#websiteModal").modal({
            backdrop: 'static',
            keyboard: false
        });

    } else if (type === 2) {

        $(".headerBody").html('')
        $(".pathBody").html('')
        $(".queryBody").html('')
        $(".formBody").html('')

        var obj = {};

        for (var i = 0; i < website_list.length; i++) {
            if (id === website_list[i]._id) {
                obj = website_list[i];
            }
        }

        $("#websiteModal form")[0].reset();

        $("#websiteModal .templateTitle").html('Update');
        $("#websiteModal form").attr('onsubmit','updateWebsite()')

        $("#website_name").val(obj.label);
        $("#website_url").val(obj.url);
        $("#url_method").val(obj.method);
        $("#basic_username").val(obj.basicAuth.name)
        $("#basic_password").val(obj.basicAuth.value)
        $("#bodyParams").val(obj.body)

        $("#email_id").val(obj.emails.join(","))
        $("#phone_no").val(obj.phones.join(","))
        $("#status_code").val(obj.statusCode)
        $("#response_should").val(obj.pattern)
        $("#response_contains").val(obj.contains)

        if(obj.routeParams.length === 0){
            renderModalContent('p');
        }
        if(obj.headers.length === 0){
            renderModalContent('h');
        }
        if(obj.queryStrings.length === 0){
            renderModalContent('q');
        }
        if(obj.fields.length === 0){
            renderModalContent('f');
        }


        for(var i=0;i<obj.routeParams.length;i++){
            addTableRow('p',obj.routeParams[i])
        }
        for(var i=0;i<obj.headers.length;i++){
            addTableRow('h',obj.headers[i])
        }
        for(var i=0;i<obj.queryStrings.length;i++){
            addTableRow('q',obj.queryStrings[i])
        }
        for(var i=0;i<obj.fields.length;i++){
            addTableRow('f',obj.fields[i])
        }


        $("#websiteModal").modal({
            backdrop: 'static',
            keyboard: false
        });

    } else if (type === 3) {

        var obj = {};

        for (var i = 0; i < website_list.length; i++) {
            if (id === website_list[i]._id) {
                obj = website_list[i];
            }
        }

        swal({
            title: "Are you sure?",
            text: "Website URL will be removed from the application",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        })
            .then(function (result) {
                if (result.value) {

                    $.ajax({
                        url: API_BASE_PATH + '/record/delete/' + API_TOKEN +'/'+SITE_NOOP +'/'+current_site_id,
                        type: 'DELETE',
                        success: function (result) {

                            console.log(result)
                            if (result.code === 'SUCCESS') {

                                successMsg("Website URL has been removed from the application.")

                            } else {
                                errorMsg('Error in removing website url')
                            }
                        },
                        error: function (e) {
                            errorMsg('Something went wrong! Please try again later.')

                        }
                    });

                }
            });



    }
}


function renderModalContent(type) {

    if (type === 'h') {
        $(".headerBody").html('<tr class="h_0">' +
            '<td><input type="text" class="form-control h_key" /> </td>' +
            '<td><input type="text" class="form-control h_value" /> </td>' +
            '<td><button class="btn btn-sm btn-default" type="button" onclick="addTableRow(\'' + 'h' + '\')"><i class="fa fa-plus"></i></button></td>' +
            '</tr>')
    }
    else if (type === 'p') {
        $(".pathBody").html('<tr class="p_0">' +
            '<td><input type="text" class="form-control p_key" /> </td>' +
            '<td><input type="text" class="form-control p_value" /> </td>' +
            '<td><button class="btn btn-sm btn-default" type="button" onclick="addTableRow(\'' + 'p' + '\')"><i class="fa fa-plus"></i></button></td>' +
            '</tr>')
    }
    else if (type === 'q') {
        $(".queryBody").html('<tr class="q_0">' +
            '<td><input type="text" class="form-control q_key" /> </td>' +
            '<td><input type="text" class="form-control q_value" /> </td>' +
            '<td><button class="btn btn-sm btn-default" type="button" onclick="addTableRow(\'' + 'q' + '\')"><i class="fa fa-plus"></i></button></td>' +
            '</tr>')
    }
    else if (type === 'f') {
        $(".formBody").html('<tr class="f_0">' +
            '<td><input type="text" class="form-control f_key" /> </td>' +
            '<td><select class="form-control f_type">' +
            '<option value="TEXT">TEXT</option>' +
            '<option value="NUMBER">NUMBER</option>' +
            '<option value="BOOLEAN">BOOLEAN</option>' +
            '</select></td>' +
            '<td><input type="text" class="form-control f_value" /> </td>' +
            '<td><button class="btn btn-sm btn-default" type="button" onclick="addTableRow(\'' + 'f' + '\')"><i class="fa fa-plus"></i></button></td>' +
            '</tr>')
    }






}

function addTableRow(type, obj) {

    var id = guid()


    if (type === 'h') {
        $(".headerBody").append('<tr class="h_' + id + '">' +
            '<td><input type="text" class="form-control h_key" value="' + (obj ? obj.name : '') + '" /> </td>' +
            '<td><input type="text" class="form-control h_value" value="' + (obj ? obj.value : '') + '" /> </td>' +
            '<td>' +
            '<button class="btn mr-2 btn-sm btn-default" type="button" onclick="addTableRow(\'' + 'h' + '\')"><i class="fa fa-plus"></i></button>' +
            '<button class="btn btn-sm btn-default" type="button" onclick="deleteTableRow(\'' + 'h' + '\',\'' + 'h_' + id + '\')"><i class="fa fa-trash"></i></button>' +
            '</td>' +
            '</tr>')
    }
    else if (type === 'p') {
        $(".pathBody").append('<tr class="p_' + id + '">' +
            '<td><input type="text" class="form-control p_key"  value="' + (obj ? obj.name : '') + '"/> </td>' +
            '<td><input type="text" class="form-control p_value"  value="' + (obj ? obj.value : '') + '"/> </td>' +
            '<td>' +
            '<button class="btn mr-2 btn-sm btn-default" type="button" onclick="addTableRow(\'' + 'p' + '\')"><i class="fa fa-plus"></i></button>' +
            '<button class="btn btn-sm btn-default" type="button" onclick="deleteTableRow(\'' + 'p' + '\',\'' + 'p_' + id + '\')"><i class="fa fa-trash"></i></button>' +
            '</td>' +
            '</tr>')
    }
    else if (type === 'q') {
        $(".queryBody").append('<tr class="q_' + id + '">' +
            '<td><input type="text" class="form-control q_key" value="' + (obj ? obj.name : '') + '" /> </td>' +
            '<td><input type="text" class="form-control q_value" value="' + (obj ? obj.value : '') + '" /> </td>' +
            '<td>' +
            '<button class="btn mr-2 btn-sm btn-default" type="button" onclick="addTableRow(\'' + 'q' + '\')"><i class="fa fa-plus"></i></button>' +
            '<button class="btn btn-sm btn-default" type="button" onclick="deleteTableRow(\'' + 'q' + '\',\'' + 'q_' + id + '\')"><i class="fa fa-trash"></i></button>' +
            '</td>' +
            '</tr>')
    }
    else if (type === 'f') {

        var str = '<option value="TEXT">TEXT</option>' +
            '<option value="NUMBER">NUMBER</option>' +
            '<option value="BOOLEAN">BOOLEAN</option>';

        if (obj) {
            var val = obj.value;
            str = '';
            if (!_.isNaN(val * 1)) {
                str = '<option value="TEXT">TEXT</option>' +
                    '<option value="NUMBER" selected>NUMBER</option>' +
                    '<option value="BOOLEAN">BOOLEAN</option>';
            } else if (val === 'true' || val === 'false') {
                str = '<option value="TEXT">TEXT</option>' +
                    '<option value="NUMBER">NUMBER</option>' +
                    '<option value="BOOLEAN" selected>BOOLEAN</option>';
            } else {
                str = '<option value="TEXT" selected>TEXT</option>' +
                    '<option value="NUMBER">NUMBER</option>' +
                    '<option value="BOOLEAN">BOOLEAN</option>';
            }
        }

        $(".formBody").append('<tr class="f_' + id + '">' +
            '<td><input type="text" class="form-control f_key"  value="' + (obj ? obj.name : '') + '"/> </td>' +
            '<td><select class="form-control f_type">' +
            str +
            '</select></td>' +
            '<td><input type="text" class="form-control f_value"  value="' + (obj ? obj.value : '') + '" /> </td><td>' +
            '<button class="btn mr-2 btn-sm btn-default" type="button" onclick="addTableRow(\'' + 'f' + '\')"><i class="fa fa-plus"></i></button>' +
            '<button class="btn btn-sm btn-default" type="button" onclick="deleteTableRow(\'' + 'f' + '\',\'' + 'f_' + id + '\')"><i class="fa fa-trash"></i></button>' +
            '</td>' +
            '</tr>')
    }
}

function deleteTableRow(type, id) {

    $("." + id).remove();
}


function addWebsite() {

    var trClasses = [];
    $(".tab-content table tr").each(function () {
        trClasses.push($(this).attr('class'));
    });


    var insertObj = {
        "label": $("#website_name").val(),
        "url": $("#website_url").val(),
        "method": $("#url_method").val(),
        "basicAuth": {
            "name": $("#basic_username").val(),
            "value": $("#basic_password").val()
        },
        body: $("#bodyParams").val(),
        "routeParams": [],
        "headers": [],
        "queryStrings": [],
        "fields": [],
        "emails": $("#email_id").val().split(","),
        "phones": $("#phone_no").val().split(","),
        "statusCode": $("#status_code").val(),
        "pattern": $("#response_should").val(),
        "contains": $("#response_contains").val(),
        create_ts: new Date().getTime(),
        last_update_ts: new Date().getTime()
    }

    for (var i = 0; i < trClasses.length; i++) {
        if (trClasses[i]) {
            var val = trClasses[i];
            if (val.includes("h_")) {
                if ($("." + val + " .h_value").val()) {
                    insertObj.headers.push({
                        name: $("." + val + " .h_key").val(),
                        value: $("." + val + " .h_value").val()
                    })
                }
            }
            if (val.includes("q_")) {
                if ($("." + val + " .q_value").val()) {
                    insertObj.queryStrings.push({
                        name: $("." + val + " .q_key").val(),
                        value: $("." + val + " .q_value").val()
                    })
                }
            }
            if (val.includes("p_")) {
                if ($("." + val + " .p_value").val()) {
                    insertObj.routeParams.push({
                        name: $("." + val + " .p_key").val(),
                        value: $("." + val + " .p_value").val()
                    })
                }
            }
            if (val.includes("f_")) {
                var ftype = $("." + val + " .f_type").val();
                var fvalue = $("." + val + " .f_value").val();
                if (fvalue) {
                    if (ftype === 'NUMBER') {
                        fvalue = _.isNaN(fvalue * 1) ? 0 : fvalue * 1
                    }
                    if (ftype === 'BOOLEAN') {
                        fvalue = fvalue === 'true' ? true : false
                    }

                    insertObj.fields.push({
                        name: $("." + val + " .f_key").val(),
                        value: fvalue
                    })
                }

            }

        }
    }


    $(".btnSubmit").attr('disabled', 'disabled');

    $.ajax({
        url: API_BASE_PATH +'/record/insert/dynamic/' + API_TOKEN +'/'+SITE_NOOP ,
        data:  JSON.stringify(insertObj),
        contentType: "text/plain",
        type: 'POST',
        success: function (data) {
            $(".btnSubmit").removeAttr('disabled');

            if(data.rkey){
                successMsg('Website added successfully');
                $("#websiteModal").modal('hide');
                loadPage();
            }else{
               errorMsg('Error in adding website')
            }

        },
        error: function (e) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsg('Something went wrong!')
        }
    });
}
function updateWebsite() {

    var obj = {};

    for (var i = 0; i < website_list.length; i++) {
        if (current_site_id === website_list[i]._id) {
            obj = website_list[i];
        }
    }

    var trClasses = [];
    $(".tab-content table tr").each(function () {
        trClasses.push($(this).attr('class'));
    });


    var insertObj = {
        "label": $("#website_name").val(),
        "url": $("#website_url").val(),
        "method": $("#url_method").val(),
        "basicAuth": {
            "name": $("#basic_username").val(),
            "value": $("#basic_password").val()
        },
        body: $("#bodyParams").val(),
        "routeParams": [],
        "headers": [],
        "queryStrings": [],
        "fields": [],
        "emails": $("#email_id").val().split(","),
        "phones": $("#phone_no").val().split(","),
        "statusCode": $("#status_code").val(),
        "pattern": $("#response_should").val(),
        "contains": $("#response_contains").val(),
        create_ts: obj.create_ts,
        last_update_ts: new Date().getTime()
    }

    for (var i = 0; i < trClasses.length; i++) {
        if (trClasses[i]) {
            var val = trClasses[i];
            if (val.includes("h_")) {
                if ($("." + val + " .h_value").val()) {
                    insertObj.headers.push({
                        name: $("." + val + " .h_key").val(),
                        value: $("." + val + " .h_value").val()
                    })
                }
            }
            if (val.includes("q_")) {
                if ($("." + val + " .q_value").val()) {
                    insertObj.queryStrings.push({
                        name: $("." + val + " .q_key").val(),
                        value: $("." + val + " .q_value").val()
                    })
                }
            }
            if (val.includes("p_")) {
                if ($("." + val + " .p_value").val()) {
                    insertObj.routeParams.push({
                        name: $("." + val + " .p_key").val(),
                        value: $("." + val + " .p_value").val()
                    })
                }
            }
            if (val.includes("f_")) {
                var ftype = $("." + val + " .f_type").val();
                var fvalue = $("." + val + " .f_value").val();
                if (fvalue) {
                    if (ftype === 'NUMBER') {
                        fvalue = _.isNaN(fvalue * 1) ? 0 : fvalue * 1
                    }
                    if (ftype === 'BOOLEAN') {
                        fvalue = fvalue === 'true' ? true : false
                    }

                    insertObj.fields.push({
                        name: $("." + val + " .f_key").val(),
                        value: fvalue
                    })
                }

            }

        }
    }


    $(".btnSubmit").attr('disabled', 'disabled');

    $.ajax({
        url: API_BASE_PATH +'/record/insert/static/' + API_TOKEN +'/'+SITE_NOOP+'/'+current_site_id ,
        data:  JSON.stringify(insertObj),
        contentType: "text/plain",
        type: 'POST',
        success: function (data) {
            $(".btnSubmit").removeAttr('disabled');

            if(data.rkey){
                successMsg('Website updated successfully');
                $("#websiteModal").modal('hide');
                loadPage();
            }else{
               errorMsg('Error in updating website')
            }

        },
        error: function (e) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsg('Something went wrong!')
        }
    });
}



