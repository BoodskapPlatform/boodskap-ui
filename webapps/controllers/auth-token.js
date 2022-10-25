var tokenTable = null;
var token_list = [];
var current_token_id = null;
var TOKEN_TYPE = "";
var dashboardList = [];
var dashboardMobileList = [];

$(document).ready(function () {

    loadTokenList();
    $("body").removeClass('bg-white');
});

function loadTokenList() {

    TOKEN_TYPE = $("#authTokenTypes").val();

    if (tokenTable) {
        tokenTable.destroy();
        $("#tokenTable").html("");
    }

    var fields = [
        {
            mData: 'token',
            orderable: false,
            sTitle: 'Token',
            mRender: function (data, type, row) {
                setCopyToken(data);
                return  '<i class="icon-key2" style="color: #666666;"></i> '+data+' <a href="javascript:void(0)" class="apiToken'+data+'" style="text-decoration: none;color: #363636;" title="Click here to copy the token" data-clipboard-text="'+data+'">' +
                    '<i class="icon-copy2"></i>' +
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
                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(1,\'' + row['token'] + '\')" title="Expire Token"><i class="icon-unlink"></i></button>';
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
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        data: []
    };

    listAuthToken(TOKEN_TYPE, function (status, data) {
        if (status && data.length > 0) {
            tableOption['data'] = data;
            token_list = data;
            console.log(token_list)
            $(".totalCount").html(data.length)
        } else {
            $(".tokenCount").html(0)
            token_list = [];
        }

        tokenTable = $("#tokenTable").DataTable(tableOption);
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
        $("#expireTokenModal").modal('show');
    }
}

function addToken() {
    var userObj = {
        "firstName": $("#firstName").val(),
        "lastName": $("#lastName").val(),
        "primaryPhone": $("#mobileNo").val(),
        "email": $("#emailId").val(),
        "password": $("#password").val(),
        "roles": [$("#role").val()]
    }
    $(".btnSubmit").attr('disabled', 'disabled');
    retreiveUser(userObj.email, function (status, data) {
        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('User Email ID already exist', 'emailId');
        } else {
            upsertUser(userObj, function (status, data) {
                if (status) {
                    successMsg('User Created Successfully');
                    setTimeout(function () {
                        loadTokenList();
                    }, 700)
                    $("#addUser").modal('hide');
                } else {
                    errorMsg('Error in Creating User')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
}

function updateToken() {

    var userObj = {
        "firstName": $("#firstName").val(),
        "lastName": $("#lastName").val(),
        "primaryPhone": $("#mobileNo").val(),
        "email": $("#emailId").val(),
        "roles": [$("#role").val()]
    };

    if ($.trim($("#password").val()) === '') {
        userObj['password'] = ' ';
    } else {
        userObj['password'] = $.trim($("#password").val());
    }

    $(".btnSubmit").attr('disabled', 'disabled');

    upsertUser(userObj, function (status, data) {
        if (status) {
            successMsg('User Updated Successfully');
            setTimeout(function () {
                loadTokenList();
            }, 700)
            $("#addUser").modal('hide');
        } else {
            errorMsg('Error in Updating User')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
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