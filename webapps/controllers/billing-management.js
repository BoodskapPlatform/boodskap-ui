var domainTable = null;
var page_from = 0;
var page_size = 10;
var billing_list = [];

$(document).ready(function () {
    loadDomains();
});

function loadMore() {
    page_from = page_from + page_size;
    loadDomains();
}

function searchText() {
    $(".domainList").html('');
    page_from = 0;
    loadDomains();
}


function loadDomains() {

    var queryParams = {
        "query": {
            "bool": {
                "must": []
            }
        },
        "size": $("#pageSize").val() ? Number($("#pageSize").val()) : page_size,
        from: page_from

    };

    var search = $("#searchText").val();

    if (search) {

        var searchJson = {
            "multi_match": {
                "query": '*' + search + '*',
                "type": "phrase_prefix",
                "fields": ['domainKey', 'email']
            }
        };


        queryParams.query['bool']['must'] = [searchJson];

    }

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    searchByQuery('', 'DOMAIN', searchQuery, function (status, data) {
        if (status) {

            var result = QueryFormatter(data)
            $(".domainsCount").html(result.total);

            if (result.total > page_size) {
                $(".loadMore").removeClass('hide');
            } else {
                $(".loadMore").addClass('hide');
            }

            var resultData = result.data.data;
            for (var i = 0; i < resultData.length; i++) {
                renderDomain(resultData[i]);
            }

            if (result.total === 0) {
                $(".domainList").html('<div class="alert alert-warning"><p class="text-center">No data found!</p></div>');
                page_from = 0;
            }


        } else {
            errorMsg('Error in fetching domain')
        }
    })
}

function renderDomain(obj) {

    var str = ` <div class="card" >
                    <div class="card-header pointer-cursor collapsed" data-toggle="collapse" data-target="#a_` + obj.domainKey + `" aria-expanded="false" onclick="loadDomainBilling('` + obj.domainKey + `')">
                        
                    <button class="btn btn-xs btn-outline-dark pull-right ml-3" onclick="addBilling('` + obj.domainKey + `')"><i class="icon-dollar"></i> Add Billing</button>
                   

                       <span class="text-dark">` + obj.domainKey + `</span>   
                          <br> <small>` + obj.email + `</small>
                        
                        
                    </div>
                    <div id="a_` + obj.domainKey + `" class="collapse" data-parent="#accordion" style="">
                        <div class="card-body">
                        
                            <div class="row">
                            <div class="col-md-12 bg-white" style="padding: 10px;border:1px solid #eee">
                               <span class="pull-right">Total Billing Configured: <strong class="billCount_` + obj.domainKey + `">0</strong></span>
                               <button class="btn btn-default btn-sm pull-right mr-2" onclick="loadDomainBilling('` + obj.domainKey + `')"><i class="fa fa-refresh"></i> Refresh</button>
                            
                                 <table class="table table-bordered responsive no-wrap" id="` + obj.domainKey + `"  cellspacing="0" width="100%">
    
                                </table>
                            </div>
                            </div>
                            
                        </div>
                    </div>
                </div>`;
    $(".domainList").append(str);
}

var selectedDomainKey = '';
var selectedTable = {};

function loadDomainBilling(dk) {
    selectedDomainKey = dk;

    if (selectedTable[dk]) {
        selectedTable[dk].destroy();
        $("#" + dk).html("");
    }

    var domainKeyJson = {"match": {"targetdomain": dk}};

    var queryParams = {
        query: {
            "bool": {
                "must": [],
            }
        },
    };


    var fields = [
        {
            mData: 'invoicename',
            sTitle: 'Invoice Name',
            orderable: false,
            mRender: function (data, type, row) {
                var str = '<hr>';

                if(row['startdate']){
                    str += '<small><b>Start Date (GMT):</b> '+moment(row['startdate']).toISOString()+'</small>';
                }
                if(row['enddate']){
                    str += '<br><small><b>End Date (GMT):</b> '+moment(row['enddate']).toISOString()+'</small><br>'
                }

                str += '<br><small><b>Created On:</b> '+moment(row['createdtime']).format('MM/DD/YYYY hh:mm A')+'</small><br>'
                return data+str;
            }
        },
        {
            mData: 'companyname',
            sTitle: 'Company Name',
            orderable: false,
            mRender: function (data, type, row) {
                var img = '';

                var obj = JSON.parse(row['obj']);


                var company = obj['biller'];

                if (company.logo) {
                    var imgPath = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + company.logo;
                    img = '<img src="' + imgPath + '" style="height:30px;" /><br>';
                }

                var details = '';

                if (company['department']) {
                    details += '<br><small>Department: ' + company['department'] + '</small>'
                }

                if (company['email']) {
                    details += '<br><small><i class="icon-envelope"></i> ' + company['email'] + '</small>'
                }
                if (company['contact']) {
                    details += '<br><small><i class="icon-phone"></i> ' + company['contact'] + '</small>'
                }
                if (company['address']) {
                    details += ' <small style=""><br>' + company['address'] + ',</small>'
                }
                if (company['city']) {
                    details += ' <small style=""><br>' + company['city'] + ',</small>'
                }
                if (company['state']) {
                    details += ' <small style="">' + company['state'] + ',</small>'
                }
                if (company['country']) {
                    details += ' <small style=""><br>' + company['country'] + '</small>'
                }

                if (company['zipcode']) {
                    details += ' <small style=""> - ' + company['zipcode'] + '</small>'
                }


                return img + '<b>' + data + '</b>' + details;
            }
        },
        {
            mData: 'payername',
            sTitle: 'Payer Name',
            orderable: false,
            mRender: function (data, type, row) {

                var img = '';

                var obj = JSON.parse(row['obj']);

                var company = obj['payer'];

                if (company.logo) {
                    var imgPath = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + company.logo;
                    img = '<img src="' + imgPath + '" style="height:30px;" /><br>';
                }

                var details = '';

                if (company['department']) {
                    details += '<br><small>Department: ' + company['department'] + '</small>'
                }

                if (company['email']) {
                    details += '<br><small><i class="icon-envelope"></i> ' + company['email'] + '</small>'
                }
                if (company['contact']) {
                    details += '<br><small><i class="icon-phone"></i> ' + company['contact'] + '</small>'
                }
                if (company['address']) {
                    details += ' <small style=""><br>' + company['address'] + ',</small>'
                }
                if (company['city']) {
                    details += ' <small style=""><br>' + company['city'] + ',</small>'
                }
                if (company['state']) {
                    details += ' <small style="">' + company['state'] + ',</small>'
                }
                if (company['country']) {
                    details += ' <small style=""><br>' + company['country'] + '</small>'
                }

                if (company['zipcode']) {
                    details += ' <small style=""> - ' + company['zipcode'] + '</small>'
                }


                return img + '<b>' + data + '</b>' + details;
            }
        },
        {
            mData: 'frequency',
            sTitle: 'Frequency',
            orderable: true,
            mRender: function (data, type, row) {

                var str = '';

                if(data === 'adhoc'){
                    str = row['executed'] ? '<span class="label label-success">EXECUTED</span>' : '<span class="label label-primary"><i class="fa fa-spinner fa-spin"></i> Waiting</span>'
                }

                return BILLING_FREQUENCY[data]+'<br>'+str;
            }
        },
        {
            mData: 'tax',
            sTitle: 'Invoice & Tax',
            orderable: false,
            mRender: function (data, type, row) {

                var curr = '<small><a href="javascript:void(0)" onclick="viewInvoice(\'' + row['_id'] + '\')">View Invoice Details</a></small>'
                return curr;
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {
                var str = '';
                if(row['frequency'] === 'adhoc' && row['executed']){
                    str += '<button class="btn btn-xs btn-default" onclick="executeBilling(\'' + row['_id'] + '\')" title="Re-Execute">' +
                        '<i class="fa fa-redo"></i></button> ';
                }
                str += '<button class="btn btn-xs btn-default" onclick="editBilling(\'' + row['_id'] + '\')">' +
                    '<i class="icon-edit"></i></button> ' +
                    '<button class="btn btn-xs btn-default" onclick="deleteBilling(\'' + row['_id'] + '\')">' +
                    '<i class="icon-trash"></i></button>';
                return str;
            }
        }

    ];


    var tableOption = {
        responsive: true,
        paging: true,
        searching: true,
        aaSorting: [[5, 'desc']],
        "ordering": true,
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
                        "fields": ['_all']
                    }
                };

                queryParams.query['bool']['must'] = [searchJson, domainKeyJson];

            } else {
                queryParams.query['bool']['must'] = [domainKeyJson];
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type: 'BILLING',
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;
                    resultData['draw'] = oSettings.iDraw;
                    billing_list = resultData.data;
                    $(".billCount_" + dk).html(resultData.recordsTotal);

                    fnCallback(resultData);
                }
            });
        }

    };

    selectedTable[dk] = $("#" + dk).DataTable(tableOption);

}

function addBilling(dk) {

    selectedDomainKey = dk;

    $("#billingConfig form")[0].reset();
    selected_billing_item=[];
    loadBillingItems(BILLING_ITEMS);

    $(".billerLogo").attr('src','');
    $(".payerLogo").attr('src','');

    billerLogoPath = ''
    payerLogoPath= ''
    selected_id=null;
    selected_obj={};
    toggleTextField('company', false);
    toggleTextField('payer', false);

    $('#invoiceStartDate').datetimepicker();
    $('#invoiceStartDate').on('dp.change', function(e){  $('.invoiceStartDate').html('Server Time (GMT) - '+moment(e.date).toISOString()); })

    $('#invoiceEndDate').datetimepicker();
    $('#invoiceEndDate').on('dp.change', function(e){  $('.invoiceEndDate').html('Server Time (GMT) - '+moment(e.date).toISOString()); })

    $('.invoiceStartDate').html('');
    $('.invoiceEndDate').html('');

    $(".btnModal").attr('onclick', 'saveBillingConfig()')

    $(".modal-title").html('Add Billing Configuration')
    $("#billingConfig").modal({
        backdrop: 'static',
        keyboard: false
    });
}

function showTab(id) {
    $(".show-grid").removeClass('inactive').removeClass('active').addClass('inactive')
    $(".tab" + id).removeClass('inactive');
    $(".tab" + id).addClass('active');

    $(".tabcontents").removeClass('hide').removeClass('active').addClass('hide')
    $(".tabcontent" + id).removeClass('hide');
    $(".tabcontent" + id).addClass('active');

}


var totalItem = 0;
var selected_billing_item = [];

function loadBillingItems(data) {

    $(".billingItems").html('');


    for (var i = 0; i < data.length; i++) {


        $(".billingItems").append('<tr class="row_' + i + '">' +
            '<td>' + data[i].name +
            '<input type="hidden" id="item_name_' + i + '" class="input-sm form-control form-control-sm" value="' + data[i].name + '" /></td>' +
            '<td>' + data[i].quantity + '</td>' +
            '<td><input type="number" id="aprice_' + i + '" class="input-sm form-control form-control-sm" value="' + data[i].aprice + '" onkeyup="checkTotal('+i+')" min="0"/></td>' +
            '<td><input type="number" id="pprice_' + i + '" class="input-sm form-control form-control-sm" value="' + data[i].pprice + '"  onkeyup="checkTotal('+i+')" min="0"/></td>' +
            '<td><input type="number" readonly id="price_' + i + '" class="input-sm form-control form-control-sm" value="' + data[i].price + '"  min="0"/></td>' +
            '<td><input type="number" id="tax_' + i + '" class="input-sm form-control form-control-sm" value="' + data[i].tax + '" onkeyup="checkTotal('+i+')" min="0"/></td>' +
            '<td><input type="number" readonly id="total_' + i + '" class="input-sm form-control form-control-sm" value="' + data[i].total + '"  min="0"/></td>' +

            '<td><button class="btn btn-sm btn-default" type="button" onclick="removeItemRecord('+i+')"><i class="fa fa-trash"></i></button></td>'+
            '</tr>');
        totalItem = i;
        selected_billing_item.push(i);
    }
    totalItem++;

    addItemRecord()
}

function addItemRecord() {
    $(".billingItems").append('<tr class="row_' + totalItem + '">' +
        '<td><select id="item_name_' + totalItem + '" class="input-sm form-control form-control-sm" onchange="checkItem(this.value,'+totalItem+')"></select></td>' +
        '<td>1</td>' +
        '<td><input type="number" id="aprice_' + totalItem + '" class="input-sm form-control form-control-sm" value="" onkeyup="checkTotal('+totalItem+')" min="0"/></td>' +
        '<td><input type="number" id="pprice_' + totalItem + '" class="input-sm form-control form-control-sm" value="" onkeyup="checkTotal('+totalItem+')" min="0"/></td>' +
        '<td><input type="number" readonly id="price_' + totalItem + '" class="input-sm form-control form-control-sm" value=""  placeholder="Price"  min="0"/></td>' +
        '<td><input type="number" id="tax_' + totalItem + '" class="input-sm form-control form-control-sm" value="" placeholder="Tax" onkeyup="checkTotal('+totalItem+')"  min="0"/></td>' +
        '<td><input type="number" readonly id="total_' + totalItem + '" class="input-sm form-control form-control-sm" value=""  min="0"/></td>' +
        '<td><button class="btn btn-sm btn-default" type="button" onclick="removeItemRecord('+totalItem+')"><i class="fa fa-trash"></i></button></td>'+
        '</tr>');
    selected_billing_item.push(totalItem);
    loadItemsList(totalItem)
    totalItem++;
}


function checkItem(val,id) {

    for(var i=0;i<BILLING_ITEMS.length;i++){
        if(val === BILLING_ITEMS[i].code){
            $("#price_"+id).val(BILLING_ITEMS[i].price)
            $("#tax_"+id).val(BILLING_ITEMS[i].tax)
        }
    }



}

function loadItemsList(id) {

    $("#item_name_"+id).html('<option value=""></option>')
    for(var i=0;i<BILLING_ITEMS.length;i++){
        $("#item_name_"+id).append('<option value="'+BILLING_ITEMS[i]['code']+'">'+BILLING_ITEMS[i]['name']+'</option>')
    }

    $("#item_name_"+id).select2({
        dropdownParent: $('#billingConfig'),
        tags: true
    })
}

function removeItemRecord(id) {

    if(selected_billing_item.length > 1) {

        $(".row_" + id).remove();

        var temp = [];
        for (var i = 0; i < selected_billing_item.length; i++) {
            if (selected_billing_item[i] !== id) {
                temp.push(selected_billing_item[i])
            }
        }

        selected_billing_item = temp;
    }


}


function uploadFile(file, id) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);

                if (id === 'billerLogo') {
                    billerLogoPath = result.id;
                } else {
                    payerLogoPath = result.id;
                }

                $("." + id).attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + result.id + '?' + new Date().getTime());

            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    formData.append("tags", id);
    formData.append("description", '');
    xhr.send(formData);
}

function uploadImage(id) {

    var fileInput = document.getElementById(id);

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    uploadFile(files[0], id);

}

function getItemName(code) {

    var str = code;

    for(var i=0;i<BILLING_ITEMS.length;i++){
        if(code === BILLING_ITEMS[i].code){
            str=BILLING_ITEMS[i].name
        }
    }

    return str;
}

var selected_obj = {};
var selected_id = '';
var billerLogoPath = '';
var payerLogoPath = '';

function saveBillingConfig() {

    if ($("#invoiceName").val() === '') {
        errorMsgBorder('Invoice billing name cannot be empty', 'invoiceName')
        return false;
    }

    if ($("#invoiceCode").val() === '') {
        errorMsgBorder('Invoice code cannot be empty', 'invoiceCode')
        return false;
    }

    if ($("#cmpyName").val() === '') {
        errorMsgBorder('Company name cannot be empty', 'cmpyName')
        return false;
    }

    if ($("#payName").val() === '') {
        errorMsgBorder('Payer name cannot be empty', 'payName')
        return false;
    }
    if ($("#invoiceStartDate").val() === '') {
        errorMsgBorder('Invoice Start Date cannot be empty', 'invoiceStartDate')
        return false;
    }

    if($("#frequency").val() === 'adhoc'){
        if ($("#invoiceEndDate").val() === '') {
            errorMsgBorder('Invoice End Date cannot be empty', 'invoiceEndDate')
            return false;
        }
    }


    var items = [];

    for (var i = 0; i < selected_billing_item.length; i++) {

        var id = selected_billing_item[i];

        if ($("#item_name_" + id).val()) {
            var obj = {
                name: getItemName($("#item_name_" + id).val()),
                quantity: 1,
                price: Number($("#price_" + id).val()),
                tax: Number($("#tax_" + id).val()),
                code: $("#item_name_" + id).val(),
                aprice: Number($("#aprice_" + i).val()),
                pprice: Number($("#pprice_" + i).val()),
                total: Number($("#total_" + i).val())
            }
            items.push(obj)
        }
    }

    var json = {
        invoice: items,
        biller: {
            logo: billerLogoPath,
            email: $("#cmpyEmail").val(),
            contact: $("#cmpyContact").val(),
            address: $("#cmpyAddress").val(),
            city: $("#cmpyCity").val(),
            state: $("#cmpyState").val(),
            country: $("#cmpyCountry").val(),
            zipcode: $("#cmpyZipcode").val(),
            department: $("#cmpyDepartment").val(),
        },
        payer: {
            logo: payerLogoPath,
            email: $("#payEmail").val(),
            contact: $("#payContact").val(),
            address: $("#payAddress").val(),
            city: $("#payCity").val(),
            state: $("#payState").val(),
            country: $("#payCountry").val(),
            zipcode: $("#payZipcode").val(),
            department: $("#payDepartment").val(),
            description: $("#payNote").val(),
        }
    }


    var obj = {

        invoicename: $("#invoiceName").val(),
        invoicecode: $("#invoiceCode").val(),

        companyname: $("#cmpyName").val(),
        payername: $("#payName").val(),
        targetdomain: selectedDomainKey,
        currency: $("#currency").val(),
        enabled: true,
        frequency: $("#frequency").val(),
        discounteditems: $("#discountedInvoice").is(":checked"),

        startdate : new Date(moment($("#invoiceStartDate").val(),"MM/DD/YYYY hh:mm A")).getTime(),
        enddate : $("#invoiceEndDate").val() ? new Date(moment($("#invoiceEndDate").val(),"MM/DD/YYYY hh:mm A")).getTime() : 0,
        executed : false,
        startevery : '',
        weekday : 0,

        createdtime: new Date().getTime(),
        updatedtime: new Date().getTime(),

        obj : JSON.stringify(json)

    };

    $(".btnModal").attr('disabled', 'disabled');

    upsertBillingRecord(obj, function (status, data) {
        if (status) {
            successMsg('Billing Configuration Created Successfully');
            loadDomainBilling(selectedDomainKey);

            var company = json.biller;
            company['type'] = 'company';
            company['name'] = obj.companyname;
            company['createdtime'] = new Date().getTime();
            company['updatedtime'] = new Date().getTime();

            upsertContactRecord(company, function (status, data) {
                var payer = json.payer;
                payer['type'] = 'payer';
                payer['name'] = obj.payername;
                payer['createdtime'] = new Date().getTime();
                payer['updatedtime'] = new Date().getTime();
                upsertContactRecord(payer, function (status, data) {
                });
            });

            $("#billingConfig").modal('hide');

        } else {
            errorMsg('Error in Creating Billing Configuration')
        }
        $(".btnModal").removeAttr('disabled');

    })


}

function editBilling(id) {
    $("#billingConfig form")[0].reset();
    selected_billing_item=[];

    $(".billerLogo").attr('src','');
    $(".payerLogo").attr('src','');

    toggleTextField('company', false);
    toggleTextField('payer', false);

    selected_id = id;

    for (var i = 0; i < billing_list.length; i++) {
        if (billing_list[i]._id === id) {
            selected_obj = billing_list[i]
        }
    }

    var obj = JSON.parse(selected_obj.obj)

    $("#invoiceName").val(selected_obj.invoicename)
    $("#invoiceCode").val(selected_obj.invoicecode)
    $("#frequency").val(selected_obj.frequency)
    $("#currency").val(selected_obj.currency)

    $("#invoiceStartDate").val(moment(selected_obj.startdate).format('MM/DD/YYYY hh:mm A'))
    $("#invoiceEndDate").val(selected_obj.enddate ? moment(selected_obj.enddate).format('MM/DD/YYYY hh:mm A') : '')

    $('.invoiceStartDate').html('Server Time (GMT) - '+moment(selected_obj.startdate).toISOString());
    selected_obj.enddate ? $('.invoiceEndDate').html('Server Time (GMT) - '+moment(selected_obj.enddate).toISOString()) : '';

    $('#invoiceStartDate').datetimepicker();
    $('#invoiceStartDate').on('dp.change', function(e){  $('.invoiceStartDate').html('Server Time (GMT) - '+moment(e.date).toISOString()); })

    $('#invoiceEndDate').datetimepicker();
    $('#invoiceEndDate').on('dp.change', function(e){  $('.invoiceEndDate').html('Server Time (GMT) - '+moment(e.date).toISOString()); })




    $("#discountedInvoice").prop("checked", selected_obj.discounteditems);

    var companyDetails = obj.biller;
    $("#cmpyName").val(selected_obj.companyname)
    $("#cmpyEmail").val(companyDetails.email)
    $("#cmpyContact").val(companyDetails.contact)
    $("#cmpyAddress").val(companyDetails.address)
    $("#cmpyCity").val(companyDetails.city)
    $("#cmpyState").val(companyDetails.state)
    $("#cmpyCountry").val(companyDetails.country)
    $("#cmpyZipcode").val(companyDetails.zipcode)
    $("#cmpyDepartment").val(companyDetails.department)

    var payerDetails = obj.payer;
    $("#payName").val(selected_obj.payername)
    $("#payEmail").val(payerDetails.email)
    $("#payContact").val(payerDetails.contact)
    $("#payAddress").val(payerDetails.address)
    $("#payCity").val(payerDetails.city)
    $("#payState").val(payerDetails.state)
    $("#payCountry").val(payerDetails.country)
    $("#payZipcode").val(payerDetails.zipcode)
    $("#payDepartment").val(payerDetails.department)
    $("#payNote").val(payerDetails.description)

    if (companyDetails.logo) {
        billerLogoPath = companyDetails.logo
        $(".billerLogo").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + billerLogoPath + '?' + new Date().getTime());
    } else {
        billerLogoPath = ''
    }

    if (payerDetails.logo) {
        payerLogoPath = payerDetails.logo;
        $(".payerLogo").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + payerLogoPath + '?' + new Date().getTime());
    } else {
        payerLogoPath = ''
    }



    loadBillingItems(obj.invoice)

    checkFrequency()

    $(".btnModal").attr('onclick', 'updateBilling()')

    $(".modal-title").html('Edit Billing Configuration')
    $("#billingConfig").modal({
        backdrop: 'static',
        keyboard: false
    });
}


function updateBilling() {

    if ($("#invoiceName").val() === '') {
        errorMsgBorder('Invoice billing name cannot be empty', 'invoiceName')
        return false;
    }

    if ($("#invoiceCode").val() === '') {
        errorMsgBorder('Invoice code cannot be empty', 'invoiceCode')
        return false;
    }

    if ($("#cmpyName").val() === '') {
        errorMsgBorder('Company name cannot be empty', 'cmpyName')
        return false;
    }

    if ($("#payName").val() === '') {
        errorMsgBorder('Payer name cannot be empty', 'payName')
        return false;
    }

    if ($("#invoiceStartDate").val() === '') {
        errorMsgBorder('Invoice Start Date cannot be empty', 'invoiceStartDate')
        return false;
    }

    if($("#frequency").val() === 'adhoc'){
        if ($("#invoiceEndDate").val() === '') {
            errorMsgBorder('Invoice End Date cannot be empty', 'invoiceEndDate')
            return false;
        }
    }


    var items = [];

    for (var i = 0; i < selected_billing_item.length; i++) {

        var id = selected_billing_item[i];

        if ($("#item_name_" + id).val()) {
            var obj = {
                name: getItemName($("#item_name_" + id).val()),
                quantity: 1,
                price: Number($("#price_" + id).val()),
                tax: Number($("#tax_" + id).val()),
                code: $("#item_name_" + id).val(),
                aprice: Number($("#aprice_" + i).val()),
                pprice: Number($("#pprice_" + i).val()),
                total: Number($("#total_" + i).val())
            }
            items.push(obj)
        }
    }

    var json = {
        invoice: items,
        biller: {
            logo: billerLogoPath,
            email: $("#cmpyEmail").val(),
            contact: $("#cmpyContact").val(),
            address: $("#cmpyAddress").val(),
            city: $("#cmpyCity").val(),
            state: $("#cmpyState").val(),
            country: $("#cmpyCountry").val(),
            zipcode: $("#cmpyZipcode").val(),
            department: $("#cmpyDepartment").val(),
        },
        payer: {
            logo: payerLogoPath,
            email: $("#payEmail").val(),
            contact: $("#payContact").val(),
            address: $("#payAddress").val(),
            city: $("#payCity").val(),
            state: $("#payState").val(),
            country: $("#payCountry").val(),
            zipcode: $("#payZipcode").val(),
            department: $("#payDepartment").val(),
            description: $("#payNote").val(),
        }
    }

    var obj = {
        id: selected_id,
        invoicename: $("#invoiceName").val(),
        invoicecode: $("#invoiceCode").val(),

        companyname: $("#cmpyName").val(),
        payername: $("#payName").val(),
        targetdomain: selectedDomainKey,
        currency: $("#currency").val(),
        enabled: true,
        frequency: $("#frequency").val(),
        discounteditems: $("#discountedInvoice").is(":checked"),

        startdate : new Date(moment($("#invoiceStartDate").val(),"MM/DD/YYYY hh:mm A")).getTime(),
        enddate : $("#invoiceEndDate").val() ? new Date(moment($("#invoiceEndDate").val(),"MM/DD/YYYY hh:mm A")).getTime() : 0,
        executed : selected_obj['executed'],
        startevery : '',
        weekday : 0,

        updatedtime: new Date().getTime(),

        obj : JSON.stringify(json)

    };


    obj['createdtime'] = selected_obj.createdtime ? selected_obj.createdtime : new Date().getTime();


    $(".btnModal").attr('disabled', 'disabled');

    upsertBillingRecord(obj, function (status, data) {
        if (status) {
            successMsg('Billing Configuration Updated Successfully');
            loadDomainBilling(selectedDomainKey);
            $("#billingConfig").modal('hide');

           /* var company = json.biller;
            company['type'] = 'company';
            company['name'] = obj.companyname;
            company['createdtime'] = new Date().getTime();
            company['updatedtime'] = new Date().getTime();

            upsertContactRecord(company, function (status, data) {
                var payer = json.payer;
                payer['type'] = 'payer';
                payer['name'] = obj.payername;
                payer['createdtime'] = new Date().getTime();
                payer['updatedtime'] = new Date().getTime();
                upsertContactRecord(payer, function (status, data) {
                });
            });*/

        } else {
            errorMsg('Error in Updating Billing Configuration')
        }
        $(".btnModal").removeAttr('disabled');
    })
}

function deleteBilling(id) {
    selected_id = id;
    $("#deleteModal").modal('show');
}

function executeBilling(id) {

    selected_id = id;

    for (var i = 0; i < billing_list.length; i++) {
        if (billing_list[i]._id === id) {
            selected_obj = billing_list[i]
        }
    }

    selected_obj['executed'] = false;
    selected_obj['updatedtime'] = new Date().getTime()

    upsertBillingRecord(selected_obj, function (status, data) {
        if (status) {
            successMsg('AdHoc Re-Initiated Successfully');
            loadDomainBilling(selectedDomainKey);

        } else {
            errorMsg('Error in initiate AdHoc')
        }
    })
}


function proceedDelete() {
    deleteBillingRecord(selected_id, function (status, data) {
        if (status) {
            successMsg('Billing Configuration Deleted Successfully');
            loadDomainBilling(selectedDomainKey);
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in Patient Delete')
        }
    })
}


function viewInvoice(id) {

    var obj = {};

    for (var i = 0; i < billing_list.length; i++) {
        if (billing_list[i]._id === id) {
            obj = billing_list[i];
        }
    }

    var dataObj = JSON.parse(obj.obj)

    var data = dataObj.invoice;


    $(".billingItemsView").html('');

    for (var i = 0; i < data.length; i++) {

            $(".billingItemsView").append('<tr>' +
                '<td>' + data[i].name + '</td>' +
                '<td>' + data[i].quantity + '</td>' +
                '<td><b>' + obj.currency + ' ' + data[i].aprice + '</b></td>' +
                '<td><b>' + obj.currency + ' ' + data[i].pprice + '</b></td>' +
                '<td><b>' + obj.currency + ' ' + data[i].price + '</b></td>' +
                '<td><b>' + obj.currency + ' ' + data[i].tax + '</b></td>' +
                '<td><b>' + obj.currency + ' ' + data[i].total + '</b></td>' +
                '</tr>');
    }

    $(".billingItemsView").append('<tr>' +
        '<td colspan="8">' +
        '<p>' + (obj.discounteditems ? '* Discounted items in the invoice' : '') + '</p>' +
        '</td>' +
        '</tr>');

    $("#viewInvoice").modal('show');
}


var master_list = {};

function loadMasterList(searchText, type) {

    var typeJson = {"match": {"type": type}};

    var queryParams = {
        "query": {
            "bool": {
                "must": []
            }
        },
        "size": 25,
        "sort": [{"updatedtime": {"order": "desc"}}]
    };

    searchText = (type === 'company') ? $("#cmpyName").val() : $("#payName").val();

    if (searchText) {

        var searchJson = {
            "multi_match": {
                "query": '*' + searchText + '*',
                "type": "phrase_prefix",
                "fields": ['_all']
            }
        };
        queryParams.query['bool']['must'] = [typeJson, searchJson];

    } else {
        queryParams.query['bool']['must'] = [typeJson];
    }


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };



    searchByQuery('', 'CONTACT', searchQuery, function (status, result) {
        if (status) {

            var resultData = QueryFormatter(result).data;
            master_list[type] = resultData['data'];
            $("."+type+'List').html(searchText ? '<li class="deviceListLi first_'+type+'" onclick="setMasterId(\''+''+'\',\''+type+'\')"><i class="fa fa-plus"></i> Create <b>'+searchText+'</b> as new Contact</li>' : '');
            if(resultData['data'].length > 0) {
                $("." + type + 'List').addClass('show');

                for (var i = 0; i < resultData['data'].length; i++) {
                    var data = resultData['data'][i];
                    $("." + type + 'List').append('<li class="deviceListLi" onclick="setMasterId(\'' + data._id + '\',\'' + type + '\')">' +
                        data.name + (data.city ? ", " + data.city : '') + (data.state ? ", " + data.state : '') + (data.country ? ", " + data.country : '') +
                        '</b></li>');
                }
            }else{
                $("." + type + 'List').addClass('show');
                master_list[type] = [];
                toggleTextField(type, false);
                clearTextField();
            }
        } else {
            master_list[type] = [];
            toggleTextField(type, false);
        }


    })


}

function setMasterId(id,type) {

    var obj = {};

    for(var i=0;i<master_list[type].length;i++){
        if(master_list[type][i]['_id'] === id){
            obj = master_list[type][i];
        }
    }

    if(type === 'company'){
        $("#cmpyName").val(obj.name ? obj.name : $("#cmpyName").val())
        $("#cmpyEmail").val(obj.email ? obj.email : '')
        $("#cmpyContact").val(obj.contact ? obj.contact : '')
        $("#cmpyAddress").val(obj.address ? obj.address :'')
        $("#cmpyCity").val(obj.city ? obj.city : '')
        $("#cmpyState").val(obj.state ? obj.state : '')
        $("#cmpyCountry").val(obj.country ? obj.country : '')
        $("#cmpyZipcode").val(obj.zipcode ? obj.zipcode : '')

        if (obj.logo) {
            billerLogoPath = obj.logo
            $(".billerLogo").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + billerLogoPath + '?' + new Date().getTime());
        } else {
            billerLogoPath = ''
        }

    }else{
        $("#payName").val(obj.name ? obj.name : $("#payName").val())
        $("#payEmail").val(obj.email ? obj.email : '')
        $("#payContact").val(obj.contact ? obj.contact : '')
        $("#payAddress").val(obj.address ? obj.address :'')
        $("#payCity").val(obj.city ? obj.city : '')
        $("#payState").val(obj.state ? obj.state : '')
        $("#payCountry").val(obj.country ? obj.country : '')
        $("#payZipcode").val(obj.zipcode ? obj.zipcode : '')


        if (obj.logo) {
            payerLogoPath = obj.logo;
            $(".payerLogo").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + payerLogoPath + '?' + new Date().getTime());
        } else {
            payerLogoPath = ''
        }


    }

    if(id){
        toggleTextField(type, true);
    }else{
        toggleTextField(type, false);
        clearTextField(type)
    }

    $("." + type + 'List').removeClass('show');

}


function toggleTextField(type, flag) {

    if(type === 'company') {
        $("#cmpyEmail").prop('disabled', flag)
        $("#cmpyContact").prop('disabled', flag)
        $("#cmpyAddress").prop('disabled', flag)
        $("#cmpyCity").prop('disabled', flag)
        $("#cmpyState").prop('disabled', flag)
        $("#cmpyCountry").prop('disabled', flag)
        $("#cmpyZipcode").prop('disabled', flag)
        $("#billerLogo").prop('disabled', flag)
    }else{
        $("#payEmail").prop('disabled',flag)
        $("#payContact").prop('disabled',flag)
        $("#payAddress").prop('disabled',flag)
        $("#payCity").prop('disabled',flag)
        $("#payState").prop('disabled',flag)
        $("#payCountry").prop('disabled',flag)
        $("#payZipcode").prop('disabled',flag)
        $("#payerLogo").prop('disabled',flag)
    }


}


function clearTextField(type) {

    if(type === 'company') {
        $("#cmpyEmail").val('')
        $("#cmpyContact").val('')
        $("#cmpyAddress").val('')
        $("#cmpyCity").val('')
        $("#cmpyState").val('')
        $("#cmpyCountry").val('')
        $("#cmpyZipcode").val('')
        $("#billerLogo").val('')

        $(".billerLogo").attr('src','')
        billerLogoPath=''
    }else{
        $("#payEmail").val('')
        $("#payContact").val('')
        $("#payAddress").val('')
        $("#payCity").val('')
        $("#payState").val('')
        $("#payCountry").val('')
        $("#payZipcode").val('')
        $("#payerLogo").val('')

        $(".payerLogo").attr('src','')
        payerLogoPath=''
    }


}


function checkFrequency() {

    var freq = $("#frequency").val();

    if(freq === 'adhoc'){
        $(".btnInvoice").html('<i class="icon-file-pdf"></i> Generate')
        $(".freqOpt").html('<span class="text-danger">*</span>')
    }else{
        $(".btnInvoice").html('<i class="icon-save"></i> Save')
        $(".freqOpt").html('(optional)')
    }

}

function checkTotal(id) {

    var actualPrice = $("#aprice_"+id).val() ? Number($("#aprice_"+id).val()) : 0;
    var platformPrice = $("#pprice_"+id).val() ? Number($("#pprice_"+id).val()) : 0;
    var tax = $("#tax_"+id).val() ? Number($("#tax_"+id).val()) : 0;

    tax = tax/100;

    var price = actualPrice + platformPrice;

    $("#price_"+id).val(price)
    $("#total_"+id).val(price+(price * tax))

}