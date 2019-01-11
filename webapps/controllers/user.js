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



    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        searching: true,
        aaSorting: [[4, 'desc']],
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

        userTable = $("#userTable").DataTable(tableOption);
    })


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
                document.location='/dashboard';
            }else{
                document.location='/home';
            }

        }else{
            errorMsg('Erron in login!')
        }
    } )

}