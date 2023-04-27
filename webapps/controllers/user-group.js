var userGroupTable = null;
var userTable = null;
var group_list = [];
var selected_user = [];
var current_group_obj = {};
var current_group_id = null;

var user_group_id = null;


$(document).ready(function () {

    loadUserGroup();

    $("body").removeClass('bg-white');

    $('.help-url').attr('href',HELP_URL+"upsertuser");

});




function loadUserGroup() {


    if (userGroupTable) {
        userGroupTable.destroy();
        $("#userGroupTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Group ID',
            "class": "details-control",
            "orderable": true,
            sWidth: '10%',
        },
        {
            mData: 'name',
            sTitle: 'Name',
            //"class": "details-control",
            "orderable": false,
        },
        {
            mData: 'email',
            sTitle: 'Email',
           // "class": "details-control",
            orderable: false,
        },
        {
            mData: 'primaryPhone',
            sTitle: 'Mobile No',
            //"class": "details-control",
            orderable: false
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(2,' + row["id"] + ')" title="Edit"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,' + row['id'] + ')" title="Delete"><i class="icon-trash-o"></i></button>';
            }
        }

    ];


    var domainKeyJson = { "match": { "domainKey": DOMAIN_KEY } };

    var queryParams = {
        query: {
            "bool": {
                "must": [],
                "should": []
            }
        },
        sort: [],
    };


    var tableOption = {
        responsive: true,
        paging: true,
        searching: true,
        aaSorting: [[0, 'desc']],
        "ordering": true,
        scrollY: '100px',
        scrollCollapse: true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        dom: '<"bskp-search-left" f> lrtip',
        language: {
            "emptyTable": "No data available",
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search here",
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            }
        },
        aoColumns: fields,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN_ALT,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {
            queryParams.query['bool']['must'] = [];
            queryParams.query['bool']['should'] = [];
            delete queryParams.query['bool']["minimum_should_match"];
            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = { "order": oSettings.aaSorting[0][1] };
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {
                // var searchJson = {
                //     "multi_match": {
                //         "query": '*' + searchText + '*',
                //         "type": "phrase_prefix",
                //         "fields": ['_all']
                //     }
                // };

                queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query.bool.should.push({
                    "match_phrase": {
                        "name": searchText
                    }
                })

                queryParams.query['bool']['should'].push({
                    "match_phrase_prefix": {
                        "name": {
                            "query": "*" + searchText + "*"
                        }
                    }
                })

                queryParams.query['bool']['should'].push({ "wildcard": { "email": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "email": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "email": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "email": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query.bool.should.push({
                    "match_phrase": {
                        "email.keyword": searchText
                    }
                }

                )
                queryParams.query['bool']['should'].push({
                    "match_phrase_prefix": {
                        "email.keyword": {
                            "query": "*" + searchText + "*"
                        }
                    }
                })

                queryParams.query['bool']["minimum_should_match"] = 1;
                queryParams.query['bool']['must'] = [domainKeyJson];

            } else {
                queryParams.query['bool']['must'] = [domainKeyJson];
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type: 'DOMAIN_USER_GROUP'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {
                    var resultData = QueryFormatter(data).data;
                    group_list = resultData.data;
                    $(".userGroupCount").html(resultData.recordsFiltered);
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }
    };

    userGroupTable = $("#userGroupTable").DataTable(tableOption);

    $(".dataTables_scrollBody").removeAttr("style").css({"min-height":"calc(100vh - 425px)","position":"relative","width":"100%"});
    var detailRows = [];

    $('#userGroupTable tbody').on('click', '.details-control', function () {

        //$(".eventRow").remove();
        var tr = $(this).closest('tr');
        var row = userGroupTable.row(tr);
        var idx = $.inArray(tr.attr('id'), detailRows);

        if (row.child.isShown()) {
            tr.removeClass('details');
            row.child.hide();
            // row.child.remove();

            // Remove from the 'open' array
            detailRows.splice(idx, 1);
            tr.removeClass('shown');
        }
        else {
            tr.addClass('details');
            formatRow(row.data(), function (str) {
                row.child(str).show();
            });


            // Add to the 'open' array
            if (idx === -1) {
                detailRows.push(tr.attr('id'));
            }
            tr.addClass('shown');
        }
    });


}

function formatRow(d, cbk) {
    current_group_obj = d;
    current_group_id = d.id;
    selected_user = [];
    var htmlStr = '<div class="group_' + d.id + ' eventRow"><h4 style="text-align: center"><i class="fa fa-spinner fa-spin"></i> <Loading></Loading></h4></div>';
    loadUserGroupMembers(d.id,d.name);
    cbk(htmlStr);

}

function loadUserGroupMembers(id,name) {

    $("#userGroupList_" + id).html('<div class="w-100" style="padding:5px 0px;"><div class="d-flex mx-auto" style="padding: 10px 20px;background-color: #F2F3F4;width: 10%;"><i class="fa fa-spinner fa-spin"></i><p class="pl-2 m-0">Processing</p></div><div></div></div>');
    listDomainUserGroupUsers(id, 1000, function (status, resdata) {
        var bodyStr = ''
        if (status && resdata.length > 0) {

            for (var i = 0; i < resdata.length; i++) {
                var data = resdata[i];
                // console.log(data)
                bodyStr = bodyStr + '<div class="col-md-3" style="margin-top: 10px;">' +
                    '<label style="display: block;text-align: left"><input type="checkbox" class="ch_' + id + '" name="ch_' + id + '[]" value="' + data['email'] + '"/> ' + (data.firstName + ' ' + data.lastName) + '</label>' +
                    '<small class="added-emails">' + data.email + '</small>' +
                    '</div>';
            }

        } else {
            bodyStr = '<div class="col-md-12" style="text-align: center">No User Added!</div>'
        }

        $(".group_" + id).html(' <div class="btn-group btn-group-justified left-right">' +
            '<a class="btn btn-default btn-xs"  onclick="openUserModal(1,\'' + id + '\',\''+name+'\')"><i class="fa fa-plus-square"></i> <span class="hidden-xs">Add User</span></a>' +
            '<a class="btn btn-default btn-xs"  onclick="openUserModal(2,\'' + id + '\',\''+name+'\')"><i class="icon-trash4"></i> <span class="hidden-xs">Delete</span></a>' +
            '<a class="btn btn-default btn-xs"  onclick="loadUserGroupMembers(\'' + id + '\')" title="Refresh"><i class="fa fa-redo"></i></a>' +
            '</div><hr style="clear:both">' +
            '<div id="userGroupList_'+id+'" class="row" style="clear: both;max-height: 300px;overflow: auto;overflow-x: hidden">' + bodyStr + '</div>');


    })
}


function openModal(type, id) {
    if (type === 1) {
        $("#group_id").removeAttr('readonly');
        $(".userAction").html('Create');
        $("#addUserGroup form")[0].reset();
        $("#addUserGroup").modal('show');
        $("#group_id").removeAttr('disabled');

        $("#group_id").attr('min', USER_OBJ.domain.startId)
        $("#group_id").attr('max', USER_OBJ.domain.startId + ID_RANGE_COUNT)

        $("#addUserGroup form").attr('onsubmit', 'addUserGroup()')
    } else if (type === 2) {
        $(".userAction").html('Update');
        var obj = {};
        current_group_id = id;

        for (var i = 0; i < group_list.length; i++) {
            if (Number(id) === Number(group_list[i].id)) {
                obj = group_list[i];
            }
        }
        // $("#event_id").attr('readonly', 'readonly');

        $("#group_id").attr('min', USER_OBJ.domain.startId)
        $("#group_id").attr('max', USER_OBJ.domain.startId + ID_RANGE_COUNT)

        $("#group_id").val(obj.id);
        $("#group_id").attr('disabled', 'disabled');

        $("#group_name").val(obj.name);
        $("#group_email").val(obj.email);
        $("#group_phone").val(obj.primaryPhone);

        $("#addUserGroup").modal('show');
        $("#addUserGroup form").attr('onsubmit', 'updateUserGroup()')
    } else if (type === 3) {
        current_group_id = id;
        $(".delete_group_id").html(id)
        $("#deleteModal").modal('show');
    }
}

var addedMemListArr = [];
function openUserModal(type, gid,name) {
    user_group_id = gid;
    if (type === 1) {
        addedMemListArr=[];
        selected_user = [];
        $(".userList").html('');
        loadUsersList();

        $(".group_"+gid+" .added-emails").each(function(){
            addedMemListArr.push($(this).text());
        })
    } else {
        selected_user = [];
        $(".removeUserCount").html(0);
        var inputElements = document.getElementsByClassName('ch_' + gid);
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                selected_user.push(inputElements[i].value);
            }
        }
        $(".removeUserCount").html(selected_user.length);
        if(selected_user.length===0){
            errorMsg('Atleast one user should be selected');
            return false;
        }else if(selected_user.length===1){
            $(".userText").html("user")
        }
        else{
            $(".userText").html("users")
        }

        $("#groupName").text(name)
        $("#deleteUserModal").modal('show');
    }

}

function loadUsersList() {
    if (userTable) {
        userTable.destroy();
        $("#userTable").html("");
    }

    var fields = [
        {
            mData: 'fullname',
            sTitle: 'Full Name',
            mRender: function (data, type, row) {
                data = (row['firstName'] ? row['firstName'] : "") + " " + (row['lastName'] ? row['lastName'] : "");
                return data;
            }
        },
        {
            mData: 'email',
            sTitle: 'Email'
        },
        {
            mData: 'primaryPhone',
            sTitle: 'Mobile No.',
            mRender: function (data, type, row) {
                return data ? data : "-";
            }
        },
        {
            mData: 'roles',
            sTitle: 'Roles',
            mRender: function (data, type, row) {
                data = data.join(", ")
                return data;
            }
        }

    ];



    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        "language": {
            "emptyTable": "No data available",
            "zeroRecords": "No data available",
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search here",
            loadingRecords: '',
            paginate: {
                previous: '< Prev',
                next: 'Next >'
            },
            "processing": '<i class="fa fa-spinner fa-spin"></i> Processing'
        },
        pagingType: 'simple',
        responsive: true,
        paging: true,
        searching: true,
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        data: []
    };

    getUserList(1000, function (status, data) {
        if (status && data.length > 0) {
            tableOption['data'] = data;
            $(".userCount").html(data.length);
            user_list = data;
        } else {
            $(".userCount").html(0)
        }

        $(".selectedCount").html(0);

        userTable = $("#userTable").DataTable(tableOption);
        $("#addUserModal").modal('show');
        $("#userTable tr").css("cursor","pointer");

        $("#userTable_filter").find("input").on("keyup",function(){
            var len = $("#userTable tbody tr").length;
            if(len == 1){
                if($("#userTable tbody tr td").hasClass("dataTables_empty")==true){
                    $(".userCount").text(0);
                }else{
                    $(".userCount").text(1);
                }
            }else{
                $(".userCount").text(len);
            }
        });

        $('#userTable tbody').on('click', 'tr', function () {
            var data = $(this);
            data.toggleClass('selected');
            selected_user = userTable.rows('.selected').data();
            var clickData = userTable.rows(data).data()[0];
            if(addedMemListArr.includes(clickData.email) == true){
                data.toggleClass('selected');
                errorMsg("User Already Selected");
            }
            setTimeout(() => {
                $(".selectedCount").html(userTable.rows('.selected').data().length);
            }, 100);
        });
        
    })
    


}


function addUserToGroup() {

    if (selected_user.length === 0) {
        errorMsg('Atleast one user should be selected');
        return false;
    }

    var emailIds = _.pluck(selected_user, 'email')

    $(".btnSubmit").attr('disabled', 'disabled');

    /*var data = {
        userIds : emailIds
    }*/

    addUserToDomainGroup(emailIds, user_group_id, function (status, data) {
        if (status) {

            successMsg('Users added successfully');
            $("#addUserModal").modal('hide');
            loadUserGroupMembers(user_group_id);
        } else {
            errorMsg('Error in adding users to user group')
        }

        $(".btnSubmit").removeAttr('disabled');
    })
}



function proceedDeleteUser() {

    var emailIds = selected_user;

    $(".btnSubmit").attr('disabled', 'disabled');

    removeUserToDomainGroup(emailIds, user_group_id, function (status, data) {
        if (status) {

            successMsg('Users removed successfully');
            $("#deleteUserModal").modal('hide');
            loadUserGroupMembers(user_group_id);
        } else {
            errorMsg('Error in removing users from user group')
        }

        $(".btnSubmit").removeAttr('disabled');
    })
}


function addUserGroup() {

    var groupObj = {
        "id": Number($("#group_id").val()),
        "name": $("#group_name").val(),
        "email": $("#group_email").val(),
        "primaryPhone": $("#group_phone").val(),
        "domainKey": DOMAIN_KEY,
        "workStart": 0,
        "workEnd": 0
    }

    $(".btnSubmit").attr('disabled', 'disabled');


    retrieveDomainUserGroup(groupObj.id, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('Group ID already exist', 'group_id');
        } else {
            upsertDomainUserGroup(groupObj, function (status, data) {
                if (status) {
                    setTimeout(() => {
                        loadUserGroup();
                    }, 1000);
                    successMsg('User Group Created Successfully');
                    $("#addUserGroup").modal('hide');   
                } else {
                    if(typeof(data)!="undefined"){
                        if(data.message){
                            var errmessage = data.message.replaceAll("_"," ")
                            errorMsg(errmessage);
                        }else{
                            errorMsg('Error in Creating User Group')
                        }
                    }else{
                        errorMsg('Error in Creating User Group')
                    }
                    
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
}

function updateUserGroup() {

    $(".btnSubmit").attr('disabled', 'disabled');


    var groupObj = {
        "id": Number($("#group_id").val()),
        "name": $("#group_name").val(),
        "email": $("#group_email").val(),
        "primaryPhone": $("#group_phone").val(),
        "domainKey": DOMAIN_KEY,
        "workStart": 0,
        "workEnd": 0,
    }

    upsertDomainUserGroup(groupObj, function (status, data) {
        if (status) {
            successMsg('User Group Updated Successfully');
            setTimeout(() => {
                loadUserGroup();
            }, 1000);
            $("#addUserGroup").modal('hide');
        } else {
            errorMsg('Error in Updating User Group')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    $(".btnSubmit").attr('disabled', 'disabled');
    deleteDomainUserGroup(current_group_id, function (status, data) {
        if (status) {
            setTimeout(() => {
                loadUserGroup();
            }, 1000);
            $("#deleteModal").modal('hide');
            successMsg('User Group Deleted Successfully');
        } else {
            errorMsg('Error in delete')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}