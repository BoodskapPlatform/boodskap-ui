var OTA_STATES = [ {id:'CREATING', name:'Creating'}, {id:'CREATED', name:'Created'}, {id:'RUNNING', name:'In Progress'}, {id:'CANCELLED', name:'Cancelled'},
    {id:'FAILED', name:'Failed'}, {id:'PARTIAL_COMPLETE', name:'Partial Complete'}, {id:'COMPLETE', name:'Complete'} ];
var otaTable = null;
var ota_data_list = [];
var STATES_COLOR = {
    'CREATING' :'text-secondary',
    'CREATED' :'text-info',
    'RUNNING' :'text-warning',
    'CANCELLED' :'text-dark',
    'FAILED' :'text-info',
    'PARTIAL_COMPLETE' :'text-success',
    'COMPLETE' :'text-success'
};

var OTA_TYPE = 1;
var PAGE_SIZE = 1000;


$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        return $("#otaState").val();
    }
);



$(document).ready(function () {


    loadOTA();

    $('body').removeClass('bg-white');

});



function loadOTA() {

    OTA_TYPE = Number($("#otaType").val());

    var sortIndex = 5;

    if (otaTable) {
        otaTable.destroy();
        $("#otaTable").html("");
    }

    var fields = [
        {
            mData: 'name',
            sTitle: 'Name',
            "class": "details-control",
            "orderable": true,
            mRender: function (data, type, row) {

                var str = data +(row['expireAt'] ? '<br><small>'+moment(row['expireAt']).format('MM/DD/YYYY hh:mm a')+'</small>' : '');

                return str;
            }
        },
        {
            mData: 'message',
            sTitle: 'Message',
            "class": "details-control",
            "orderable": false,
        },
        {
            mData: 'state',
            sTitle: 'Status',
            "class": "details-control",
            orderable: true,
            mRender: function (data, type, row) {

                var str = data +(row['finishedAt'] ? '<br><small>'+moment(row['finishedAt']).format('MM/DD/YYYY hh:mm a')+'</small>' : '');

                return str;
            }
        },
        {
            mData: 'toModel',
            sTitle: 'To Model',
            "class": "details-control",
            orderable: true,
        },
        {
            mData: 'toVersion',
            sTitle: 'To Version',
            "class": "details-control",
            orderable: true,
        }

    ];

    if(OTA_TYPE === 2){
        fields.push( {
            mData: 'fromModel',
            sTitle: 'From Model',
            "class": "details-control",
            orderable: true,
        });
        fields.push( {
            mData: 'fromVersion',
            sTitle: 'From Version',
            "class": "details-control",
            orderable: true,
        });
        sortIndex = 7;
    }


    fields.push({
        mData: 'createdAt',
        sTitle: 'Created Time',
        "class": "details-control",
        orderable: true,
        mRender: function (data, type, row) {


            return moment(data).format('MM/DD/YYYY hh:mm a');
        }
    });

    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        aaSorting: [[sortIndex, 'desc']],
        searching: true,
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        dom: '<"bskp-search-left" f> lrtip',
        language: {
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search by Name",
            "emptyTable":"No data available",


            loadingRecords: '',
            paginate: {
                previous: ' Previous',
                next: 'Next '
            }
        },
     aoColumns: fields,
        data: []
    };

   loadOTAData(function (data) {
        ota_data_list = data;
        $(".otaBatchCount").html(data.length)

        otaTable = $("#otaTable").DataTable(tableOption);
        // Array to track the ids of the details displayed rows
        var detailRows = [];

        $('#otaTable tbody').on('click', '.details-control', function () {

            $(".eventRow").hide();
            var tr = $(this).closest('tr');
            var row = otaTable.row(tr);
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

      /* $('#otaState').onchange( function() {
           otaTable.draw();
       } );*/

    })


}

function formatRow(obj) {
    var htmlStr = ''
    return htmlStr;

}




function loadOTAData(cbk) {

    var type = OTA_TYPE === 1 ? 'dota' : 'mota';


    $.ajax({
        url: API_BASE_PATH + "/"+type+"/list/" + API_TOKEN + "/" + PAGE_SIZE,
        type: 'GET',
        success: function (data) {
            //called when successful
            if(data.length > 0) {
                cbk(data);
            }else{
                cbk([]);
            }
        },
        error: function (e) {
            //called when there is an error
            //console.log(e.message);
            cbk([]);
        }
    });
}
