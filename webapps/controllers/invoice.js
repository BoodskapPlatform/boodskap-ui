var invoiceTable = null;
var invoice_list = [];

var startDate = moment().startOf('day')
var endDate = moment().endOf('day');

$(document).ready(function () {


    $('#reportrange').daterangepicker({
        startDate: startDate,
        endDate: endDate,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            'Last 3 Months': [moment().subtract(3, 'month'), moment().subtract(1, 'month')],
            'Last 6 Months': [moment().subtract(6, 'month'), moment()]
        }
    }, setDate);

    setDate(startDate, endDate);

});


function setDate(start, end) {
    startDate = start.startOf('day');
    endDate = end.endOf('day');

    loadInvoice();

    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
}


function loadInvoice() {

    if (invoiceTable) {
        invoiceTable.destroy();
        $("#invoiceTable").html("");
    }

    var fields = [
        {
            mData: 'invoicename',
            sTitle: 'Invoice Name',
            orderable: false,
            mRender: function (data, type, row) {

                return data;
            }

        },
        {
            mData: 'invoiceno',
            sTitle: 'Invoice #',
            orderable: false,
            mRender: function (data, type, row) {

                var str = '<a href="javascript:void(0)" onclick="loadInvoiceFile(\''+row['file']+'\',\''+row['invoiceno']+'\')">'+data+'</a>'

                return str;
            }
        },
        {
            mData: 'frequency',
            sTitle: 'Billing Cycle',
            orderable: false,
            mRender: function (data, type, row) {

                var startdate = moment(row['startdate']).format('MM/DD/YYYY hh:mm A');
                var enddate = moment(row['enddate']).format('MM/DD/YYYY hh:mm A');

                var str = data.toUpperCase()+'<br>' +
                    '<small style="text-decoration: underline">'+startdate+'</small> to <small style="text-decoration: underline">'+enddate+'</small>';

                return str;
            }
        },
        {
            mData: 'grandtotal',
            sTitle: 'Billed Amount',
            orderable: true,
            mRender: function (data, type, row) {

                var currency = JSON.parse(row['obj']).currency;

                currency = currency ? currency : '$';

                return '<b>'+currency+''+data.toFixed(2)+'</b>';
            }
        },
        {
            mData: 'createdtime',
            sTitle: 'Generated Time',
            orderable: true,
            mRender: function (data, type, row) {

                return data ? moment(data).format('MM/DD/YYYY hh:mm A') : "-";
            }
        }
    ];

    if(ADMIN_ACCESS){
       fields.push(
           {
               mData: 'targetdomain',
               sTitle: 'Domain Key',
               orderable: false,
               mRender: function (data, type, row) {

                   return data ? data : "-";
               }
           }
       )
    }

    var domainKeyJson = {"match": {"targetdomain": DOMAIN_KEY}};
    var defaultSorting = [{"createdtime": {"order": "desc"}}];
    var queryParams = {
        query: {
            "bool": {
                "must": [],
                "filter":{"range":{"createdtime":{"gte":new Date(startDate).getTime(),"lte":new Date(endDate).getTime()}}}
            }
        },
        sort: defaultSorting
    };

    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        aoColumns: fields,
        searching: true,
        aaSorting: [[4, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            // var keyName = fields[oSettings.aaSorting[0][0]]
            //
            // var sortingJson = {};
            // sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            // queryParams.sort = [sortingJson];

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

                queryParams.query['bool']['must'] = [searchJson];

            }

            if(!ADMIN_ACCESS){
                queryParams.query['bool']['must'].push(domainKeyJson)
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : 'INVOICE'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;

                    invoice_list = resultData['data'];
                    $(".invoiceCount").html(resultData.recordsFiltered)

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    invoiceTable = $("#invoiceTable").DataTable(tableOption);
}

function loadInvoiceFile(id,name) {
    var url = API_BASE_PATH + '/files/public/download/' + id;

    var embedUrl = 'https://docs.google.com/viewer?url='+url+'&embedded=true'

    console.log(name)
    window.open(embedUrl, name,  "width=800,height=768")
}