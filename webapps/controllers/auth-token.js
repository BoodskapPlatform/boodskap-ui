var tokenTable = null;
var token_list = [];
var current_token_id = null;
var TOKEN_TYPE = "";
var dashboardList = [];
var dashboardMobileList = [];

$(document).ready(function () {

    loadTokenList('all');
    $("body").removeClass('bg-white');

 
});

function loadTokenList(type) {

    if (tokenTable) {
        tokenTable.destroy();
        $("#tokenTable").html("");
    }
    if(type!="" && typeof(type)!="undefined"){
        TOKEN_TYPE = "";
        $("#authTokenTypes option[value='']").prop("selected", true);
    }else{
        TOKEN_TYPE = $("#authTokenTypes option:selected").val();
    }
    
    var fields = [
        {
            mData: 'token',
            orderable: false,
            sTitle: 'Token',
            mRender: function (data, type, row) {
                setCopyToken(data);
                return  '<i class="icon-key2 pr-1" style="color: #666666;"></i> '+data+' <a href="javascript:void(0)" class="apiToken'+data+'" style="text-decoration: none;color: #363636;" title="Click here to copy the token" data-clipboard-text="'+data+'">' +
                    '<i class="pl-1 icon-copy2"></i>' +
                    '</a>';
            }
        },
        {
            mData: 'type',
            sTitle: 'Token Type'
        },
        {
            mData: 'entity',
            sTitle: 'Entity',
        },
        {
            mData: 'mode',
            sTitle: 'Mode'
        },
        {
            mData: 'accesses',
            sTitle: 'Accesses',
            orderable: false,
            mRender: function (data, type, row) {
                var str = '';
                for (var i = 0; i < data.length; i++) {
                    str = str + (i + 1) + '] <b><i class="icon-check-circle" style="color: #0cb30c; font-size: 13px;"></i> ' + data[i] + '</b>  <br>';
                }
                return str;
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '5%',
            mRender: function (data, type, row) {
                return '<button class="btn bskp-edit-btn mr-2" onclick="openModal(1,\'' + row['token'] + '\')" title="Expire Token"> <em class="icon-unlink"></em> </button>';
                    // +'<button class="btn btn-sm btn-icon btn-default" onclick="openDeleteModal(' + row['id'] + ')"><i class="icon-trash-o"></i></button>';
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
        scrollY: '100px',
        scrollCollapse: true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        dom: '<"bskp-search-left" f> lrtip',
        language: {
            "emptyTable": "No data available",
            "zeroRecords": "No data available",
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search here",
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        aoColumns: fields,
        data: []
    };

    listAuthToken(TOKEN_TYPE, function (status, data) {
        if (status && data.length > 0) {
            tableOption['data'] = data;
            token_list = data;
            $(".totalCount").html(data.length)
        } else {
            $(".tokenCount").html(0)
            token_list = [];
        }

        tokenTable = $("#tokenTable").DataTable(tableOption);
        $("#tokenTable_filter").hide();
        $('.dataTables_filter input').attr('maxlength', 100);
        if(type!="all"){
            $("#tokenTable_filter").show();
        }else{
            setTimeout(() => {
                $('.dataTables_filter input').attr('maxlength', 100).attr("autocomplete","off").attr("type","text").val("");
                $("#tokenTable_filter").show();
            }, 1000);
        }
        $(".dataTables_scrollBody").removeAttr("style").css({"min-height":"calc(100vh - 425px)","position":"relative","width":"100%","border-bottom":"0px"});
        
        
        //$("#tokenTable_filter").find("input").attr("autocomplete","off").val("");
    });
}

function setCopyToken(row_id){
    var tkey = new ClipboardJS('.apiToken'+row_id);
    tkey.on('success', function (e) {
        successMsg('Token Copied Successfully')
    });
}

function openModal(type, id) {
    if (type === 1) {   //Expire Token Confirmation
        current_token_id = id;
        $("#expireTokenId").html(current_token_id);
        $("#expireTokenModal").modal({
            backdrop: 'static',
            keyboard: false
        },'show');
    }else if(type == 2){
        $('#afterCreate').addClass('d-none')
        $('.confirmation').removeClass('d-none')
        $("#AuthToken").modal({
            backdrop: 'static',
            keyboard: false
        },'show');
       
     ;
    }
}

function proceedExpire() {

    expireToken(current_token_id, function (status, data) {
        if (status) {
            successMsg('Token Expired Successfully');
            setTimeout(function () {
                loadTokenList();
            }, 700)
            $("#expireTokenModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    });
}

function format(obj) {

    var id = obj.email.replace("@", '').replace(".", '');

    var str = '<div class="row">' +
        '<div class="col-md-12 mt-2 mb-2"> ' +
        '<ul class="nav nav-tabs" id="myTab" role="tablist">\n' +
        '  <li class="nav-item">\n' +
        '    <a class="nav-link active" id="home-tab-' + id + '" data-toggle="tab" href="#home-' + id + '" role="tab" aria-controls="home-' + id + '" aria-selected="true">Web Dashboard</a>\n' +
        '  </li>\n' +
        '  <li class="nav-item">\n' +
        '    <a class="nav-link" id="profile-tab-' + id + '" data-toggle="tab" href="#profile-' + id + '" role="tab" aria-controls="profile-' + id + '" aria-selected="false">Mobile Dashboard</a>\n' +
        '  </li>\n' +
        '</ul>\n' +
        '<div class="tab-content" >\n' +
        '  <div class="tab-pane fade show active" id="home-' + id + '" role="tabpanel" aria-labelledby="home-tab-' + id + '">' +
        '<p>Give access to the dashboard</p>' +
        '<ul class="list-group" id="user_web_' + id + '">' +

        '</ul>' +
        '<p class="msg_web_' + id + '"></p>' +
        '</div> ' +
        '  <div class="tab-pane fade" id="profile-' + id + '" role="tabpanel" aria-labelledby="profile-tab-' + id + '">' +
        '<p>Give access to the dashboard</p>' +
        '<ul class="list-group" id="user_mobile_' + id + '">' +

        '</ul>' +
        '<p class="msg_mobile_' + id + '"></p>' +
        '</div> ' +
        '</div>';
    '</div>\n' +
        '</div>';

    return str;
}

function loadTokenProperties(obj) {
    dashboardList = [];
    var id = obj.email.replace("@", '').replace(".", '');
    $("#user_web_" + id).html('');

    getUserPropertyEmail('user.dashboard.list', obj.email, function (status, data) {

        var userDasboard = [];

        if (status) {

            var dat = JSON.parse(data.value);
            userDasboard = _.pluck(dat, 'property');

        }

        getDomainProperty('domain.dashboard.list', function (status, result) {
            if (status) {

                var data = JSON.parse(result.value);

                dashboardList = JSON.parse(result.value);

                if (data && data.length > 0) {

                    for (var i = 0; i < data.length; i++) {

                        var flag = userDasboard.includes(data[i].property) ? 'checked' : '';

                        var disabled = data[i].tokenId ? '' : 'disabled';

                        $("#user_web_" + id).append('<li style="" class="list-group-item">' +
                            '<label style="display: block"><input type="checkbox" ' + disabled + ' ' + flag + ' onchange="updateUserProp(\'' + obj.email + '\',\'' + data[i].property + '\',this)" /> ' + data[i].name + '</label>' +
                            '</li>')
                    }



                }
            }
        })
    })


}

function updateTokenProp(id, property, e) {

    // console.log("status =>",$(e).is(':checked'))
    // console.log("Id =>",id)
    // console.log("property =>",property)


    var classId = id.replace("@", '').replace(".", '');

    // $("#user_"+classId+" input").attr('disabled','disabled');
    $(".msg_web_" + classId).html('<i class="fa fa-spinner fa-spin"></i> processing....')

    getUserPropertyEmail('user.dashboard.list', id, function (status, data) {
        var result = [];
        if (status) {

            result = JSON.parse(data.value);
            result = _.pluck(result, 'property');

        }


        if ($(e).is(':checked')) {
            result.push(property)

        } else {
            var tmp = [];
            for (var j = 0; j < result.length; j++) {
                if (property != result[j]) {
                    tmp.push(result[j])
                }
            }
            result = tmp;
        }

        // console.log(result)

        result = _.uniq(result);

        // console.log("uniq =>",result)

        var rObj = [];
        for (var i = 0; i < dashboardList.length; i++) {
            if (result.includes(dashboardList[i].property)) {
                rObj.push(dashboardList[i])
            }
        }

        // console.log("uniq =>",rObj)

        var obj = {
            name: 'user.dashboard.list',
            userId: id,
            value: JSON.stringify(rObj)
        }

        upsertUserProperty(obj, function (status, result) {
            if (status) {
            } else {
                errorMsg('Error in giving dashboard access')
            }
            $(".msg_web_" + classId).html('');

        })
    });
}

function createAPIToken(){
    $('#AuthToken').modal({
        backdrop: 'static',
        keyboard: false
    })

    let requestObj ={
        type : 'API',
        entity : ''
    }
    createToken(requestObj, function(status, data){
        if (status) {
            $('.confirmation').addClass('d-none')
            $('#afterCreate').removeClass('d-none')
          
            var tkey = new ClipboardJS('.apiToken'+data.token,{ 
                container: document.getElementById('AuthToken')
        });
         tkey.on('success', function (e) {
             successMsg('Token Copied Successfully')
         });
            $('#copyAPI').html('<i class="icon-key2 pr-1" style="color: #666666;"></i> <code>'+data.token+'</code> <a href="javascript:void(0)" class="apiToken'+data.token+'" style="text-decoration: none;color: #363636;" title="Click here to copy the token" data-clipboard-text="'+data.token+'">' +
            '<i class="pl-1 icon-copy2"></i>' +
            '</a>')
            setTimeout(() => {
                loadTokenList()
            }, 1500);
        } else {
            errorMsg('Error in device token create');
        }
    })
}