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
        {name:"Name",type:"string",mandatory:false},
        {name:"jdbcUrl",type:"string",mandatory:true},
        {name:"user",type:"string",mandatory:true},
        {name:"password",type:"string",mandatory:true},
        {name:"driverClass",type:"string",mandatory:true},
       
    ],
    "DBCP":[
        {name:"Name",type:"string",mandatory:false},

        {name:"url",type:"string",mandatory:true},
        {name:"username",type:"string",mandatory:true},
        {name:"password",type:"string",mandatory:true},
        {name:"driverClassName",type:"string",mandatory:true},
        
    ],
    "HIKARI": [
        {name:"Name",type:"string",mandatory:false},
        {name:"jdbcUrl",type:"string",mandatory:true},
        {name:"username",type:"string",mandatory:true},
        {name:"password",type:"string",mandatory:true},
        {name:"dataSourceClassName",type:"string",text:'dataSourceClassName/driverClassName must be required',mandatory:true},
        {name:"driverClassName",type:"string",mandatory:true,text:'dataSourceClassName/driverClassName must be required'},
       
    ],
    "TOMCAT": [
        {name:"Name",type:"string",mandatory:false},

        {name:"url",type:"string",mandatory:true},
        {name:"username",type:"string",mandatory:true},
        {name:"password",type:"string",mandatory:true},
        {name:"driverClassName",type:"string",mandatory:true},
        
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

                var code = js_beautify(JSON.stringify(row[row['type'].toLowerCase() + 'Args']), {indent_size: 4})


                return '<textarea class="form-control" style="width: 100%;height: 250px;resize: none;background-color: #fff;color: #333;opacity: 0.8;" readonly>' + code + '</textarea>';
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '15%',
            mRender: function (data, type, row) {

                var str = '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(2,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>'

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    str;
            }
        }

    ];

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [{"createdStamp": {"order": "desc"}}];
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
            "emptyTable":"No data available",


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

                queryParams.query['bool']['should'].push({"wildcard" : { "id" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']["minimum_should_match"]=1;

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
function onclosebutton(){
    $(".checkimg").css('display','none');
    $(".typeBody").html('')

}
function openModal(type, id) {
    if (type === 1) {
        // $("#pool_name").removeAttr('readonly');
        $("#Name").removeAttr('readonly');

        $(".templateAction").html('Create');
        $('#addPool').modal({backdrop: 'static', keyboard: false})  


        


        $("#addPool form")[0].reset();
        $("#addPool").modal('show');
        $("#addPool form").attr('onsubmit', 'addPool()')
    }
    else if (type === 2) {
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
        $("#Name").attr('readonly', 'readonly');


        $("#Name").val(obj.id);
        $("#pool_type1").val(obj.type);
        $("#pool_type2").val(obj.type);
        $("#pool_type3").val(obj.type);
        $("#pool_type4").val(obj.type);
        renderType1();
        renderType2();
        renderType3();
        renderType4();
        renderData();
        $("#addPool").modal('show');
        $("#addPool form").attr('onsubmit', 'updatePool()')

    }
    else if (type === 4) {

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


function addPool() {
    var tempObj = buildData();

   console.log(tempObj);


    $(".btnSubmit").attr('disabled', 'disabled');


    retreiveDBPool(tempObj.id, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('DB Connection Pool name already exist', 'Name');
        } else {
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

    var tempObj = buildData();

    console.log(tempObj);


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
                        match: {domainKey: DOMAIN_KEY}
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
                        js_beautify(JSON.stringify(table.fields), {indent_size: 4}) + '</textarea></td></tr>';

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
   
    $(".typeBody").html('')
    if(id=="HIKARI"){
        $("#pool_type1").prop("checked", true)
        $("#checkimg1").css('display','block')    
        $("#checkimg2").css('display','none')    
        $("#checkimg3").css('display','none')    
        $("#checkimg4").css('display','none')  
    $(".typeBody").css('border-top','1px solid #e2e7eb', 'padding-top','10px !important')

    }

    for(var i=0;i<POOL_TYPE[id].length;i++){
        var pool = POOL_TYPE[id][i];
        var str = '';

        if(pool.type === 'string'){
            if(pool.text) {
                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="'+pool.name+'">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.name + `" ` + (pool.mandatory ? 'required' : '') + ` 
                    onkeyup="checkField(this)">
                    ` + (pool.text ? '<small>' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
            }else {

                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.name + `" ` + (pool.mandatory ? 'required' : '') + `>
                </div>
            </div>
            `
            }
        }
        if(pool.type === 'integer'){
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">`+pool.name+`</label>
                    <input  class="form-control input-sm" placeholder="" type="number" id="`+pool.name+`" `+(pool.mandatory ? 'required' : '')+`>
                </div>
            </div>
            `
        }
        if(pool.type === 'boolean'){
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">`+pool.name+`</label>
                    <select class="form-control input-sm" id="`+pool.name+`">
                        <option value=""></option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                    </select>
                </div>
            </div>
            `
        }

        $(".typeBody").append(str)

    }
}
function renderType2() {
    var id = $("#pool_type2").val();
    
    $(".typeBody").html('')

    if(id=="DBCP"){
    $(".typeBody").css('border-top','1px solid #e2e7eb')

        $("#pool_type2").prop("checked", true)
        $("#checkimg2").css('display','block')
        $("#checkimg1").css('display','none')
        $("#checkimg3").css('display','none')
        $("#checkimg4").css('display','none')

    }


    for(var i=0;i<POOL_TYPE[id].length;i++){
        var pool = POOL_TYPE[id][i];
        var str = '';

        if(pool.type === 'string'){
            if(pool.text) {
                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="'+pool.name+'">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.name + `" ` + (pool.mandatory ? 'required' : '') + ` 
                    onkeyup="checkField(this)">
                    ` + (pool.text ? '<small>' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
            }else {

                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.name + `" ` + (pool.mandatory ? 'required' : '') + `>
                </div>
            </div>
            `
            }
        }
        if(pool.type === 'integer'){
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">`+pool.name+`</label>
                    <input  class="form-control input-sm" placeholder="" type="number" id="`+pool.name+`" `+(pool.mandatory ? 'required' : '')+`>
                </div>
            </div>
            `
        }
        if(pool.type === 'boolean'){
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">`+pool.name+`</label>
                    <select class="form-control input-sm" id="`+pool.name+`">
                        <option value=""></option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                    </select>
                </div>
            </div>
            `
        }

        $(".typeBody").append(str)

    }
}
function renderType3() {
    var id = $("#pool_type3").val();
    
    $(".typeBody").html('')
    if(id=="C3P0"){
    $(".typeBody").css('border-top','1px solid #e2e7eb')

        $("#pool_type3").prop("checked", true)
        $("#checkimg3").css('display','block')
        $("#checkimg1").css('display','none')
        $("#checkimg2").css('display','none')
        $("#checkimg4").css('display','none')

    }


    for(var i=0;i<POOL_TYPE[id].length;i++){
        var pool = POOL_TYPE[id][i];
        var str = '';

        if(pool.type === 'string'){
            if(pool.text) {
                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="'+pool.name+'">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.name + `" ` + (pool.mandatory ? 'required' : '') + ` 
                    onkeyup="checkField(this)">
                    ` + (pool.text ? '<small>' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
            }else {

                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.name + `" ` + (pool.mandatory ? 'required' : '') + `>
                </div>
            </div>
            `
            }
        }
        if(pool.type === 'integer'){
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">`+pool.name+`</label>
                    <input  class="form-control input-sm" placeholder="" type="number" id="`+pool.name+`" `+(pool.mandatory ? 'required' : '')+`>
                </div>
            </div>
            `
        }
        if(pool.type === 'boolean'){
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">`+pool.name+`</label>
                    <select class="form-control input-sm" id="`+pool.name+`">
                        <option value=""></option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                    </select>
                </div>
            </div>
            `
        }

        $(".typeBody").append(str)

    }
}
function renderType4() {
    var id = $("#pool_type4").val();
    
    $(".typeBody").html('')
    if(id=="TOMCAT"){
    $(".typeBody").css('border-top','1px solid #e2e7eb')

        $("#pool_type4").prop("checked", true)
        $("#checkimg4").css('display','block')
        $("#checkimg1").css('display','none')
        $("#checkimg2").css('display','none')
        $("#checkimg3").css('display','none')

    }
    
    for(var i=0;i<POOL_TYPE[id].length;i++){
        var pool = POOL_TYPE[id][i];
        var str = '';

        if(pool.type === 'string'){
            if(pool.text) {
                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red" class="'+pool.name+'">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.name + `" ` + (pool.mandatory ? 'required' : '') + ` 
                    onkeyup="checkField(this)">
                    ` + (pool.text ? '<small>' + pool.text + '</small>' : '') + `
                </div>
            </div>
            `
            }else {

                str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">` + pool.name + ` ` + (pool.mandatory ? '<span style="color:red">*</span>' : '') + `</label>
                    <input  class="form-control input-sm" placeholder="" type="text" id="` + pool.name + `" ` + (pool.mandatory ? 'required' : '') + `>
                </div>
            </div>
            `
            }
        }
        if(pool.type === 'integer'){
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">`+pool.name+`</label>
                    <input  class="form-control input-sm" placeholder="" type="number" id="`+pool.name+`" `+(pool.mandatory ? 'required' : '')+`>
                </div>
            </div>
            `
        }
        if(pool.type === 'boolean'){
            str = `
            <div  class="col-md-4">
                <div  class="form-group">
                    <label  class="inputLabel">`+pool.name+`</label>
                    <select class="form-control input-sm" id="`+pool.name+`">
                        <option value=""></option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                    </select>
                </div>
            </div>
            `
        }

        $(".typeBody").append(str)

    }
}

function renderData() {
    var id="";
    if(  $("#pool_type1").prop("checked"))
  {
      id = $("#pool_type1").val();
  }
  else if($("#pool_type2").prop("checked")){
      id = $("#pool_type2").val();
      
  }
  else if($("#pool_type3").prop("checked")){
      id = $("#pool_type3").val();
  
  }else if($("#pool_type4").prop("checked")){
      id = $("#pool_type4").val();
      
  }
  
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
    var id="";
  if(  $("#pool_type1").prop("checked"))
{
    id = $("#pool_type1").val();
}
else if($("#pool_type2").prop("checked")){
    id = $("#pool_type2").val();
    
}
else if($("#pool_type3").prop("checked")){
    id = $("#pool_type3").val();

}else if($("#pool_type4").prop("checked")){
    id = $("#pool_type4").val();
    
}

var arg = id.toLowerCase()+'Args';
console.log(arg);
    
    var val = {};

    for(var i=0;i<POOL_TYPE[id].length;i++){
        var pool = POOL_TYPE[id][i];

        if(pool.type === 'string'){
            $("#"+pool.name).val() ? val[pool.name] = $("#"+pool.name).val() : '';
        }
        if(pool.type === 'integer'){
            $("#"+pool.name).val() ? val[pool.name] = Number($("#"+pool.name).val()) : '';

        }
        if(pool.type === 'boolean'){

            $("#"+pool.name).val() ? val[pool.name] = ($("#"+pool.name).val() === 'true' ? true : false) : '';

        }
    }

    var resultObj = {
        domainKey : DOMAIN_KEY,
        id : $("#Name").val(),
        type :  id,
        "c3p0Args": null,
        "dbcpArgs": null,
        "hikariArgs":null,
        "tomcatArgs" : null

    };

console.log(id);
    resultObj[arg] = val;

    return resultObj;
}

function checkField(obj) {

    if(obj.id === 'dataSourceClassName'){
        if(obj.value !== '') {
            $(".driverClassName").hide();
            $("#driverClassName").removeAttr('required');
            $("#driverClassName").attr('disabled','disabled');

        }

        if(obj.value === '') {
            $(".driverClassName").show();
            $("#driverClassName").attr('required','required');
            $("#driverClassName").removeAttr('disabled');

        }

    }

    if(obj.id === 'driverClassName'){
        if(obj.value !== '') {
            $(".dataSourceClassName").hide();
            $("#dataSourceClassName").removeAttr('required')
            $("#dataSourceClassName").attr('disabled','disabled');

        }

        if(obj.value === '') {
            $(".dataSourceClassName").show();
            $("#dataSourceClassName").attr('required','required');
            $("#dataSourceClassName").removeAttr('disabled');

        }
    }
}
// function check(){
//     var check = $("#pool_type1").val();


// }