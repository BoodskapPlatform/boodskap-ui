var userTable = null;
var user_list = [];
var current_user_id = null;


$(document).ready(function () {

    loadUsersList();

    $("body").removeClass('bg-white');

});

function loadUsersList() {


    if (userTable) {
        userTable.destroy();
        $("#userTable").html("");
    }

    var fields = [
        {
            sTitle: 'Details',
            "className": 'details-control',
            "orderable": false,
            sWidth: '5%',
            "data": null,
            "defaultContent": ''
        },
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
            orderable: false,
            mRender: function (data, type, row) {
                data = data.join(", ")
                return data;
            }
        },
        {
            mData: 'registeredStamp',
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

                var str = '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(4,\'' + row["email"] + '\')"><i class="icon-sign-in"></i></button>'+
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(2,\'' + row["email"] + '\')"><i class="icon-edit2"></i></button>'+
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,\'' + row['email'] + '\')"><i class="icon-trash-o"></i></button>';

                if(row['roles'].indexOf('admin')>=0){
                    str = '-';
                }

                return str;

            }
        }

    ];




    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [];

    var queryParams = {
        query: {
            "bool": {
                "must": [],
            }
        },

        sort: []
    };

    var tableOption = {
        "language": {

            "processing": '<i class="fa fa-spinner fa-spin"></i> Processing'
        },
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

            queryParams.query['bool']['must'] = [];
            queryParams.query['bool']['should'] = [];
            delete queryParams.query['bool']["minimum_should_match"];

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {

                queryParams.query['bool']['should'].push({"wildcard" : { "fullname" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "email" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "primaryPhone" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']["minimum_should_match"]=1;
                queryParams.query['bool']['must'] = [domainKeyJson];
            }else {
                queryParams.query['bool']['must'] = [domainKeyJson];
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                type : 'USER',
                "query": JSON.stringify(queryParams),
                "params": []
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData =searchQueryFormatterNew(data).data;
                    user_list =resultData.data;
                    $('.userCount').html(resultData.recordsTotal)
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    userTable = $("#userTable").DataTable(tableOption);

    $('#userTable tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = userTable.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        } else {
            var obj = row.data();
            row.child(format(obj)).show();
            tr.addClass('shown');
            loadUserProperties(obj)

        }
    });

}



function openModal(type,id) {
    if (type === 1) {
        $("#emailId").removeAttr('readonly');
        $(".templateAction").html('Create');
        $("#password").attr('required','required');
        $("#addUser form")[0].reset();
        $("#addUser").modal('show');
        $("#addUser form").attr('onsubmit','addUser()')
    }else if (type === 2) {
        $(".templateAction").html('Update');
        var obj ={};
        current_user_id = id;

        for(var i=0;i<user_list.length;i++){
            if(id === user_list[i].email){
                obj = user_list[i];
            }
        }

        $("#addUser form")[0].reset();

        $("#emailId").attr('readonly','readonly');

        $("#password").removeAttr('required');

        $("#firstName").val(obj.firstName);
        $("#lastName").val(obj.lastName);
        $("#mobileNo").val(obj.primaryPhone);
        $("#emailId").val(obj.email);
        $("#role").val(obj.roles[0]);
        $("#addUser").modal('show');
        $("#addUser form").attr('onsubmit','updateUser()')
    }else if (type === 3) {
        var obj ={};
        current_user_id = id;

        for(var i=0;i<user_list.length;i++){
            if(id === user_list[i].email){
                obj = user_list[i];
            }
        }
        
        $(".fullName").html((obj['firstName'] ? obj['firstName'] : "") + " " + (obj['lastName'] ? obj['lastName'] : ""));
        $("#deleteModal").modal('show');
    }else if(type === 4){
        current_user_id = id;
        $(".loginAs").html(id)
        $("#domainModal").modal('show')
    }
}



function addUser() {

    var userObj = {
        "firstName": $("#firstName").val(),
        "lastName": $("#lastName").val(),
        "primaryPhone": $("#mobileNo").val(),
        "email": $("#emailId").val(),
        "password": $("#password").val(),
        "roles": [$("#role").val()],
    }

    $(".btnSubmit").attr('disabled','disabled');

    retreiveUser(userObj.email, function (status, data) {
        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('User Email ID already exist', 'emailId');
        } else {
            upsertUser(userObj,function (status, data) {
                if (status) {
                    successMsg('User Created Successfully');
                    loadUsersList();
                    $("#addUser").modal('hide');
                } else {
                    errorMsg('Error in Creating User')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })
}


function updateUser() {

    var userObj = {
        "firstName": $("#firstName").val(),
        "lastName": $("#lastName").val(),
        "primaryPhone": $("#mobileNo").val(),
        "email": $("#emailId").val(),
        "roles": [$("#role").val()],
    };

    if($.trim($("#password").val()) === ''){
        userObj['password'] = ' ';
    }else{
        userObj['password'] = $.trim($("#password").val());
    }

    $(".btnSubmit").attr('disabled','disabled');

    upsertUser(userObj, function (status, data) {
        if (status) {
            successMsg('User Updated Successfully');
            loadUsersList();
            $("#addUser").modal('hide');
        } else {
            errorMsg('Error in Updating User')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    deleteUser(current_user_id,function (status, data) {
        if (status) {
            successMsg('User Deleted Successfully');
            loadUsersList();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}




function loginAs() {
    if($.trim($("#adminPwd").val()) === ''){
        errorMsg('Password cannot be empty');
        return false;
    }

    loginAsCall(USER_OBJ.user.email,$("#adminPwd").val(), DOMAIN_KEY, current_user_id, function (status, data) {
        if(status){

            Cookies.remove('user_details');
            Cookies.remove('domain_logo');
            Cookies.remove('user_picture');
            Cookies.remove('greetings');

            Cookies.set('user_details', data);

            var roles = data.user.roles;
            var flag = false;

            for(var i=0;i<roles.length;i++){
                if(roles[i]==='user'){
                    flag = true;
                }
            }
            if(flag){
                document.location=BASE_PATH+'/dashboard';
            }else{
                document.location=BASE_PATH+'/home';
            }

        }else{
            errorMsg('Erron in login!')
        }
    } )

}





function format(obj) {

    var str = '<div class="row">' +
        '<div class="col-md-12 mt-2 mb-2"> ' +
        '<p>Give access to the dashboard</p>' +
        '<ul class="list-group" id="user_'+obj.email.replace("@",'').replace(".",'')+'">' +

        '</ul>'+
        '<p class="msg_'+obj.email.replace("@",'').replace(".",'')+'"></p>' +
        '</div> ' +
        '</div>';
    return str;
}
var dashboardList = [];

function loadUserProperties(obj){
    dashboardList = [];
    var id= obj.email.replace("@",'').replace(".",'');
    $("#user_"+id).html('');

    getUserPropertyEmail('user.dashboard.list',obj.email,function (status,data){

        var userDasboard = [];

        if(status){

            var dat = JSON.parse(data.value);
            userDasboard = _.pluck(dat,'property');

        }

        getDomainProperty('domain.dashboard.list',function (status,result){
            if(status){

                var data = JSON.parse(result.value);

                dashboardList = JSON.parse(result.value);

                if(data && data.length > 0){

                    for(var i=0;i<data.length;i++){

                        var flag = userDasboard.includes(data[i].property) ? 'checked' : '';

                        var disabled = data[i].tokenId ? '' : 'disabled';

                        $("#user_"+id).append('<li style="" class="list-group-item">' +
                            '<label style="display: block"><input type="checkbox" '+disabled+' '+flag+' onchange="updateUserProp(\''+obj.email+'\',\''+data[i].property+'\',this)" /> '+data[i].name+'</label>' +
                            '</li>')
                    }



                }
            }
        })
    })


}

function updateUserProp(id, property, e){

    // console.log("status =>",$(e).is(':checked'))
    // console.log("Id =>",id)
    // console.log("property =>",property)


    var classId= id.replace("@",'').replace(".",'');

    // $("#user_"+classId+" input").attr('disabled','disabled');
    $(".msg_"+classId).html('<i class="fa fa-spinner fa-spin"></i> processing....')

    getUserPropertyEmail('user.dashboard.list',id,function (status,data) {
        var result = [];
        if (status) {

            result = JSON.parse(data.value);
            result = _.pluck(result,'property');

        }


        if($(e).is(':checked')){
            result.push(property)

        }else{
            var tmp = [];
            for(var j=0;j<result.length;j++){
                if(property != result[j]){
                    tmp.push(result[j])
                }
            }
            result = tmp;
        }

        result = _.uniq(result);


        var rObj = [];
        for(var i=0;i<dashboardList.length;i++){
            if(result.includes(dashboardList[i].property)){
                rObj.push(dashboardList[i])
            }
        }

        var obj = {
            name : 'user.dashboard.list',
            userId : id,
            value : JSON.stringify(rObj)
        }

        upsertUserProperty(obj,function (status,result){
            if(status){
            }else{
                errorMsg('Error in giving dashboard access')
            }
            $(".msg_"+classId).html('');
            // $("#user_"+classId+" input").removeAttr('disabled');

        })
    });
}
