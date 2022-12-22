
var poolTable = null;
var pool_list = [];
var current_pool_name = null;
var current_pool_obj = null;

$(document).ready(function () {


    loadDBPool();

    $("body").removeClass('bg-white');

});

var POOL_TYPE = {
    "C3P0": [
        { name: "Name", type: "string", mandatory: false, id: "name" },
        { name: "URL", type: "string", mandatory: true, text: "JdbcURL must be required", id: "url" },
        { name: "User", type: "string", mandatory: true, text: "User must be required", id: "username" },
        { name: "Password", type: "password", mandatory: true, text: "Password must be required",  id: "password" },
        { name: "DriverClass", type: "string", mandatory: true, text: "ClassName must be required", id: "driverclass" },

    ],
    "DBCP": [
        { name: "Name", type: "string", mandatory: false, id: "name" },
        { name: "URL", type: "string", mandatory: true, text: "URL must be required", id: "url" },
        { name: "Username", type: "string", mandatory: true, text: "Username must be required", id: "username" },
        { name: "Password", type: "password", mandatory: true, text: "Password must be required", id: "password" },
        { name: "Driver ClassName", type: "string", mandatory: true, text: "ClassName must be required", id: "driverclass" },

    ],
    "HIKARI": [
        { name: "Name", type: "string", mandatory: false, id: "name" },
        { name: "URL", type: "string", mandatory: true, text: "JdbcURL must be required", id: "url" },
        { name: "User", type: "string", mandatory: true, text: "user must be required", id: "username" },
        { name: "Password", type: "password", mandatory: true, text: "password must be required",class:"inputpassword", id: "password" },
        { name: "Data Source ClassName", type: "string", text: 'dataSourceClassName/driverClassName must be required', mandatory: true, id: "datasource" },
        { name: "Driver ClassName", type: "string", mandatory: true, text: 'dataSourceClassName/driverClassName must be required', id: "driverclass" },

    ],
    "TOMCAT": [
        { name: "Name", type: "string", mandatory: false, id: "name" },

        { name: "URL", type: "string", mandatory: true, text: "URL must be required", id: "url" },
        { name: "Username", type: "string", mandatory: true, text: "Username must ne required", id: "username" },
        { name: "Password", type: "password", mandatory: true, text: "password must be required", id: "password" },
        { name: "Driver ClassName", type: "string", mandatory: true, text: 'dataSourceClassName/driverClassName must be required', id: "driverclass" },

    ]
}


function loadDBPool() {


    if (poolTable) {
        poolTable.destroy();
        $("#poolTable").html("");
    }

    var fields = [
        {
            mData: 'id',
            sTitle: 'Pool Name',
            mRender: function (data, type, row) {

                var str = '<button style="float: right" class="btn btn-xs btn-default" onclick="openModal(4,\'' + row["id"] + '\')"><i class="icon-reload"></i> sync pool</button>';


                var astr = '<a style="color: #333;text-decoration: none;font-size: 10px;display: block;text-align: center" href="javascript:void(0)" onclick="openModal(5,\'' + row["id"] + '\')"><i class="icon-eye4"></i> View DB MetaData</a>';
                return '<span style="font-weight: bold">' + data + '</span>' + str + '<hr>' + astr;
            }

        },
        {
            mData: 'type',
            sTitle: 'Pool Type',
            orderable: false,
            mRender: function (data, type, row) {

                return data ? data : '-';
            }
        },
        {
            mData: 'ptype',
            sTitle: 'Pool Arguments',
            orderable: false,
            sWidth: '40%',
            mRender: function (data, type, row) {
                var code = js_beautify(JSON.stringify(row[row['type'].toLowerCase() + 'Args']), { indent_size: 4 })
                

                return '<textarea class="form-control" style="width: 100%;height: 250px;resize: none;background-color: #fff;color: #333;opacity: 0.8;" readonly>' + code + '</textarea>';
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '15%',
            mRender: function (data, type, row) {

                var str = '<button class="btn bskp-trash-btn  " onclick="openModal(2,\'' + row['id'] + '\')"><img src="images/menu/trash.svg" alt=""></button>'

                return '<button class="btn bskp-edit-btn mr-3" onclick="openModal(3,\'' + row["id"] + '\')"><img src="images/menu/edit.svg" alt=""></button>' +
                    str;
            }
        }

    ];

    var domainKeyJson = { "match": { "domainKey": DOMAIN_KEY } };
    var defaultSorting = [{ "createdStamp": { "order": "desc" } }];
    var queryParams = {
        query: {
            "bool": {
                "must": []
            }
        },
        // sort: [defaultSorting]
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
        // aaSorting: [[8, 'desc']],
        // aaSorting: sortOrder,
        "ordering": false,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        dom: '<"bskp-search-left" f> lrtip',

        language: {
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search by Pool Name",
            "emptyTable": "No data available",


            loadingRecords: '',
            paginate: {
                previous: '< Previous',
                next: 'Next >'
            }
        },
        aoColumns: fields,
        // "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            queryParams.query['bool']['must'] = [];
            queryParams.query['bool']['should'] = [];
            delete queryParams.query['bool']["minimum_should_match"];

            // var keyName = fields[oSettings.aaSorting[0][0]]
            //
            // var sortingJson = {};
            // sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            // queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {

                queryParams.query['bool']['should'].push({ "wildcard": { "id": "*" + searchText.toLowerCase() + "*" } })
                queryParams.query['bool']["minimum_should_match"] = 1;

            }
            queryParams.query['bool']['must'] = [domainKeyJson];


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type: 'CONNECTION_POOL'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;

                    pool_list = resultData['data'];
                    
                    $(".poolCount").html(resultData.recordsFiltered)

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                    
                }
            });
        }

    };

    poolTable = $("#poolTable").DataTable(tableOption);


}
function onclosebutton() {
    $(".checkimg").css('display', 'none');
    $(".typeBody").html('')

}
function openModal(type, id) {
    if (type === 1) {
        $("#name").removeAttr('readonly');

        $(".templateAction").html('Create');
        $('#addPool').modal({ backdrop: 'static', keyboard: false })
        $("#addPool form")[0].reset();
        $("#addPool").modal('show');
        $("#addPool form").attr('onsubmit', 'addPool()')
        renderType1();

    }
    else if (type === 2) {
        $('#deleteModal').modal({ backdrop: 'static', keyboard: false })

        current_pool_name = id;
        $(".templateName").html(id)
        $("#deleteModal").modal('show');
    } else if (type === 3) {
        $("#addPool form")[0].reset();
        $(".templateAction").html('Update');
        var obj = {};
        current_pool_name = id;

        for (var i = 0; i < pool_list.length; i++) {
            if (id === pool_list[i].id) {
                obj = pool_list[i];
            }
        }

        current_pool_obj = obj;

        // $("#pool_name").attr('readonly', 'readonly');
        $("#name").attr('readonly', 'readonly');


        $("#name").val(obj.id);
        $.each($('.check'),function () {
    
            if($(this).prop("checked", true)){
    

            }
        });
        // $("#pool_type1").val(obj.type)
        // $("#pool_type2").val(obj.type) 
        // $("#pool_type3").val(obj.type)
        // $("#pool_type4").val(obj.type)
        // console.log(obj.type);

        renderType1();
        renderType2();
        renderType3();
        renderType4();
        renderData();
        $("#addPool").modal('show');
        $("#addPool form").attr('onsubmit', 'updatePool()')

    }
    else if (type === 4) {
        $('#syncModal').modal({ backdrop: 'static', keyboard: false })

        var obj = {};
        current_pool_name = id;


        for (var i = 0; i < pool_list.length; i++) {
            if (id === pool_list[i].id) {
                obj = pool_list[i];
            }
        }


        $("#syncModal").modal('show');

    }
    else if (type === 5) {
        $('#viewTable').modal({ backdrop: 'static', keyboard: false })

        var obj = {};
        current_pool_name = id;

        for (var i = 0; i < pool_list.length; i++) {
            if (id === pool_list[i].id) {
                obj = pool_list[i];
            }
        }

        loadDBTable();

        $(".poolName").html(obj.id);

        $("#viewTable").modal('show');


    }
}
// console.log(type, id)


function addPool() {
    console.log(tempObj);

    var tempObj = buildData();


    var jdbcurl = $("#url").val();
    var username = $("#username").val();
    var password = $("#password").val();
    var datasource = $("#datasource").val();
    var driverclass = $("#driverclass").val();


    if (jdbcurl == "") {
        $("#urlerror").css("display", "block")
        $("#url").css("border-color", "red")

    } else if (username == "") {
        $("#usernameerror").css("display", "block")
        $("#username").css("border-color", "red")

    } else if (password == "") {
        $("#passworderror").css("display", "block")
        $("#password").css("border-color", "red")

    }
    else if (datasource == "") {
        $("#datasourceerror").css("display", "block")
        $("#datasource").css("border-color", "red")

    }
    else if (driverclass == "") {
        $("#driverclasserror").css("display", "block")
        $("#driverclass").css("border-color", "red")

    }
    else {
    }
    // $(".btnSubmit").attr('disabled', 'disabled');


    retreiveDBPool(tempObj.id, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('DB Connection Pool name already exist', 'Name');
        } else {
            console.log(tempObj);
            return
    
            upsertDBPool(tempObj, function (status, data) {
                if (status) {
                    successMsg('DB Connection Pool Created Successfully');
                    loadDBPool();
                    $("#addPool").modal('hide');
                } else {
                    errorMsg('Error in Creating DB Connection Pool')
                }
                $(".btnSubmit").removeAttr('disabled');
            })
        }
    })

}

function updatePool() {
    console.log(tempObj);

    var tempObj = buildData();



    $(".btnSubmit").attr('disabled', 'disabled');


    upsertDBPool(tempObj, function (status, data) {
        if (status) {
            successMsg('DB Connection Pool Updated Successfully');
            loadDBPool();
            $("#addPool").modal('hide');
        } else {
            errorMsg('Error in Updating DB Connection Pool')
        }
        $(".btnSubmit").removeAttr('disabled');
    })
}


function proceedDelete() {
    $(".btnModal").attr('disabled', 'disabled');

    deleteDBPool(current_pool_name, function (status, data) {
        if (status) {
            successMsg('Connection Pool Deleted Successfully');
            loadDBPool();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
        $(".btnModal").removeAttr('disabled');

    })
}


function syncPool() {

    var async = $("#async").prop("checked");

    $(".btnModal").attr('disabled', 'disabled');

    syncDBPool(current_pool_name, async, function (status, data) {
        if (status) {
            successMsg('Syncing DB Metadata Initiated');
            $("#syncModal").modal('hide');

        } else {
            errorMsg('Error in Sync')
        }

        $(".btnModal").removeAttr('disabled');


    })

}

function loadDBTable() {

    var queryParams = {
        "query": {
            "bool": {
                "must": [
                    {
                        match: { domainKey: DOMAIN_KEY }
                    },
                    {
                        "multi_match": {
                            "query": current_pool_name,
                            "type": "phrase_prefix",
                            "fields": ["id"]
                        }
                    }
                ]
            }
        },
        "size": 100

    };

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    var verticalStr = '';

    searchByQuery('', 'DB_METADATA', searchQuery, function (status, data) {
        if (status) {
            var result = QueryFormatter(data).data;
            var resultData = result.data;

            if (resultData.length > 0) {
                var resultData = result.data[0];

                $(".dbMetadata").html('')


                for (var i = 0; i < resultData.tables.length; i++) {
                    var table = resultData.tables[i];
                    var str = '<tr><td>' + table.name + '<br><small>scheme: ' + table.schema + '</small></td>' +
                        '<td><textarea class="form-control"  style="width: 100%;height: 150px;resize: none;background-color: #fff;color: #333;opacity: 0.8;" readonly>' +
                        js_beautify(JSON.stringify(table.fields), { indent_size: 4 }) + '</textarea></td></tr>';

                    $(".dbMetadata").append(str);

                }

            } else {
                $(".dbMetadata").html('<tr><td colspan="2"><p style="text-align: center">No data found!</p></td></tr>')
            }
        }
    });


}


function renderType1() {
    var id = $("#pool_type1").val();
    console.log(id)
    $(".typeBody").html('')
    if (id == "HIKARI") {
        $("#pool_type1").prop("checked", true)
        $("#checkimg1").css('display', 'block')
        $("#checkimg2").css('display', 'none')
        $("#checkimg3").css('display', 'none')
        $("#checkimg4").css('display', 'none')
        $(".typeBody").css({ "border-top": "1px solid #e2e7eb", "padding": "20px" })

    }

    for (var i = 0; i < POOL_TYPE[id].length; i++) {
        var pool = POOL_TYPE[id][i];
        console.log(pool)
        var str = '';

        if (pool.type === 'string') {
            if (pool.text) {
                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="' + pool.name + '">*</span>' : '') + `</label>
                    <input  class="form-control input-sm"  placeholder="" type="text" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + ` 
                    onkeyup="checkField(this)">
                    ` + (pool.text ? '<small id="' + pool.id + "error" + '"  style="display:none;color:red;font-weight:600">' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
            }
            else {

                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red">*</span>' : '') + `</label>
                    <input  class="form-control input-sm"  placeholder="" type="text" id="` + pool.id + `" ` + (pool.mandatory ? 'required' : '') + `>
                </div>
            </div>
            `
            }
        }
        if (pool.type === 'password') {
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="' + pool.name + '">*</span>' : '') + `</label>
                    <input  class="form-control input-sm inputpassword"  placeholder="" type="password" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + ` ">
                    <i class="fas fa-eye-slash" id="eye" value="icon" style="cursor:pointer;"></i>

                    ` + (pool.text ? '<small id="' + pool.id + "error" + '"  style="display:none;color:red;font-weight:600">' + pool.text + '</small>' : '') + `
                    
                    </div>
                    
                    

            </div>
            `
        }
        // if(pool.type === 'boolean'){
        //     str = `
        //     <div  class="col-md-4">
        //         <div  class="form-group">
        //             <label  class="inputLabel">`+pool.name+`</label>
        //             <select class="form-control input-sm" id="`+pool.name+`">
        //                 <option value=""></option>
        //                 <option value="true">true</option>
        //                 <option value="false">false</option>
        //             </select>
        //         </div>
        //     </div>
        //     `
        // }

        $(".typeBody").append(str)

    }
    $('#eye').click(function(){
        
          if($(this).hasClass('fa-eye-slash')){
             
            $(this).removeClass('fa-eye-slash');
            
            $(this).addClass('fa-eye');
            
            $('#password').attr('type','text');
              
          }else{
           
            $(this).removeClass('fa-eye');
            
            $(this).addClass('fa-eye-slash');  
            
            $('#password').attr('type','password');
          }
      });
}
// console.log(id);
function renderType2() {
    var id = $("#pool_type2").val();
console.log(id)
    $(".typeBody").html('')

    if (id == "DBCP") {
        $(".typeBody").css({ "border-top": "1px solid #e2e7eb", "padding": "20px" })

        $("#pool_type2").prop("checked", true)
        $("#checkimg2").css('display', 'block')
        $("#checkimg1").css('display', 'none')
        $("#checkimg3").css('display', 'none')
        $("#checkimg4").css('display', 'none')

    }


    for (var i = 0; i < POOL_TYPE[id].length; i++) {
        var pool = POOL_TYPE[id][i];
        var str = '';

        if (pool.type === 'string') {
            if (pool.text) {
                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="' + pool.name + '">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + ` 
                    onkeyup="checkField(this)">
                    ` + (pool.text ? '<small id="' + pool.id + "error" + '"  style="display:none;color:red;font-weight:600" >' + pool.text + '</small>' : '') + `

                </div>
            </div>
            `
            } else {

                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.id + `" ` + (pool.mandatory ? 'required' : '') + `>
                </div>
            </div>
            `
            }
        }
        if (pool.type === 'password') {
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="' + pool.name + '">*</span>' : '') + `</label>
                    <input  class="form-control input-sm"  placeholder="" type="password" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + ` 
                    onkeyup="checkField(this)">
                    <i class="fas fa-eye-slash" id="eye2" value="icon" style="cursor:pointer;"></i>

                    ` + (pool.text ? '<small id="' + pool.id + "error" + '"  style="display:none;color:red;font-weight:600">' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
        }
        // 
        // if(pool.type === 'boolean'){
        //     str = `
        //     <div  class="col-md-4">
        //         <div  class="form-group">
        //             <label  class="inputLabel">`+pool.name+`</label>
        //             <select class="form-control input-sm" id="`+pool.name+`">
        //                 <option value=""></option>
        //                 <option value="true">true</option>
        //                 <option value="false">false</option>
        //             </select>
        //         </div>
        //     </div>
        //     `
        // }

        $(".typeBody").append(str)

    }
    $('#eye2').click(function(){
    
         
          if($(this).hasClass('fa-eye-slash')){
             
            $(this).removeClass('fa-eye-slash');
            
            $(this).addClass('fa-eye');
            
            $('#password').attr('type','text');
              
          }else{
           
            $(this).removeClass('fa-eye');
            
            $(this).addClass('fa-eye-slash');  
            
            $('#password').attr('type','password');
          }
      }); 
}
function renderType3() {
    var id = $("#pool_type3").val();
    console.log(id)

    $(".typeBody").html('')
    if (id == "C3P0") {
        $(".typeBody").css({ "border-top": "1px solid #e2e7eb", "padding": "20px" })

        $("#pool_type3").prop("checked", true)
        $("#checkimg3").css('display', 'block')
        $("#checkimg1").css('display', 'none')
        $("#checkimg2").css('display', 'none')
        $("#checkimg4").css('display', 'none')

    }


    for (var i = 0; i < POOL_TYPE[id].length; i++) {
        var pool = POOL_TYPE[id][i];
        var str = '';

        if (pool.type === 'string') {
            if (pool.text) {
                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="' + pool.name + '">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + ` 
                    onkeyup="checkField(this)">
                    ` + (pool.text ? '<small id="' + pool.id + "error" + '"  style="display:none;color:red;font-weight:600">' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
            } else {

                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.id + `" ` + (pool.mandatory ? 'required' : '') + `>
                </div>
            </div>
            `
            }
        }
        if (pool.type === 'password') {
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="' + pool.name + '">*</span>' : '') + `</label>
                    <input  class="form-control input-sm"  placeholder="" type="password" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + ` 
                    onkeyup="checkField(this)">
                    <i class="fas fa-eye-slash" id="eye3" value="icon" style="cursor:pointer;"></i>

                    ` + (pool.text ? '<small id="' + pool.id + "error" + '"  style="display:none;color:red;font-weight:600">' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
        }
        // if(pool.type === 'boolean'){
        //     str = `
        //     <div  class="col-md-4">
        //         <div  class="form-group">
        //             <label  class="inputLabel">`+pool.name+`</label>
        //             <select class="form-control input-sm" id="`+pool.name+`">
        //                 <option value=""></option>
        //                 <option value="true">true</option>
        //                 <option value="false">false</option>
        //             </select>
        //         </div>
        //     </div>
        //     `
        // }

        $(".typeBody").append(str)

    }
    $('#eye3').click(function(){

         
          if($(this).hasClass('fa-eye-slash')){
             
            $(this).removeClass('fa-eye-slash');
            
            $(this).addClass('fa-eye');
            
            $('#password').attr('type','text');
              
          }else{
           
            $(this).removeClass('fa-eye');
            
            $(this).addClass('fa-eye-slash');  
            
            $('#password').attr('type','password');
          }
      });
}
function renderType4() {
    var id = $("#pool_type4").val();

    $(".typeBody").html('')
    if (id == "TOMCAT") {
        $(".typeBody").css({ "border-top": "1px solid #e2e7eb", "padding": "20px" })

        $("#pool_type4").prop("checked", true)
        $("#checkimg4").css('display', 'block')
        $("#checkimg1").css('display', 'none')
        $("#checkimg2").css('display', 'none')
        $("#checkimg3").css('display', 'none')

    }

    for (var i = 0; i < POOL_TYPE[id].length; i++) {
        var pool = POOL_TYPE[id][i];
        var str = '';

        if (pool.type === 'string') {
            if (pool.text) {
                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="' + pool.name + '">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + ` 
                    onkeyup="checkField(this)">
                    ` + (pool.text ? '<small id="' + pool.id + "error" + '"  style="display:none;color:red;font-weight:600" >' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
            } else {

                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + `>
                </div>
            </div>
            `
            }
        }
        if (pool.type === 'password') {
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="' + pool.name + '">*</span>' : '') + `</label>
                    <input  class="form-control input-sm"  placeholder="" type="password" id="` + pool.id + `" ` + (pool.mandatory ? '' : '') + ` 
                    onkeyup="checkField(this)">
                    <i class="fas fa-eye-slash" id="eye4" value="icon" style="cursor:pointer;"></i>

                    ` + (pool.text ? '<small id="' + pool.id + "error" + '"  style="display:none;color:red;font-weight:600">' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
        }
        // if(pool.type === 'boolean'){
        //     str = `
        //     <div  class="col-md-4">
        //         <div  class="form-group">
        //             <label  class="inputLabel">`+pool.name+`</label>
        //             <select class="form-control input-sm" id="`+pool.name+`">
        //                 <option value=""></option>
        //                 <option value="true">true</option>
        //                 <option value="false">false</option>
        //             </select>
        //         </div>
        //     </div>
        //     `
        // }

        $(".typeBody").append(str)

    }
    $('#eye4').click(function(){

         
          if($(this).hasClass('fa-eye-slash')){
             
            $(this).removeClass('fa-eye-slash');
            
            $(this).addClass('fa-eye');
            
            $('#password').attr('type','text');
              
          }else{
           
            $(this).removeClass('fa-eye');
            
            $(this).addClass('fa-eye-slash');  
            
            $('#password').attr('type','password');
          }
      });
}

function renderData() {
    var id = $("#pool_type1").val();
    var id = $("#pool_type2").val();
    var id = $("#pool_type3").val();
    var id = $("#pool_type4").val();
    var arg = id.toLowerCase()+'Args';

    var val = current_pool_obj[arg];

    for(var i=0;i<POOL_TYPE[id].length;i++){
        var pool = POOL_TYPE[id][i];

            $("#"+pool.name).val(val[pool.name])

            if(pool.text){
                if($("#"+pool.name).val() === ''){
                    $("."+pool.name).hide();
                    $("#"+pool.name).removeAttr('required');
                    $("#"+pool.name).attr('disabled','disabled');
                }


            }

    }
}

function buildData() {
    // var id = $("#pool_type1").val();
 var id= $('.check:checked').val()
    // var id = $("#pool_type2").val();
    // var id = $("#pool_type3").val();
    // var id = $("#pool_type4").val();
    var arg = id.toLowerCase()+'Args';
    var val = {};

    for(var i=0;i<POOL_TYPE[id].length;i++){
        var pool = POOL_TYPE[id][i];

        if(pool.type === 'string'){
            $("#"+pool.id).val() ? val[pool.id] = $("#"+pool.id).val() : '';
        }
        if(pool.type === 'password'){
            $("#"+pool.id).val() ? val[pool.id] = $("#"+pool.id).val() : '';

        }
        // if(pool.type === 'boolean'){

        //     $("#"+pool.name).val() ? val[pool.name] = ($("#"+pool.name).val() === 'true' ? true : false) : '';

        // }
    }

    var resultObj = {
        domainKey : DOMAIN_KEY,
        id : $("#name").val(),
        type :  id,
        "c3p0Args": null,
        "dbcpArgs": null,
        "hikariArgs":null,
        "tomcatArgs" : null

    };
    resultObj[arg] = val;
    console.log(resultObj)

    return resultObj;
}

function checkField(obj) {
    if (obj.id === 'url') {
        if (obj.value !== '') {
            $("#urlerror").hide();
            $("#url").css("border-color", "");


        }
    }
    if (obj.id === 'username') {
        if (obj.value !== '') {
            $("#usernameerror").hide();
            $("#username").css("border-color", "")
        }
    }
    if (obj.id === 'password') {

        if (obj.value !== '') {
            $("#passworderror").hide();
            $("#password").css("border-color", "")

        }
    }
    if (obj.id === 'datasource') {

        if (obj.value !== 'datasource') {
            $("#datasourceerror").hide();
            $("#datasource").css("border-color", "")

        }
    }
    if (obj.id === 'driverclass') {

        if (obj.value !== '') {
            $("#driverclasserror").hide();
            $("#driverclass").css("border-color", "")

        }
    }


}
function check() {
    var check = $("#pool_type1").val();


}
