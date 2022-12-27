var sqlTable = null;
var table_list = [];
var table_obj = {};
var current_table_name = null;
var templateArray = ['PARTITIONED', 'REPLICATED'];
var automicityArray = ['ATOMIC', 'TRANSACTIONAL'];
var writeSyncArray = ['PRIMARY_SYNC', 'FULL_ASYNC', 'FULL_SYNC'];
var TAB_FIELD_COUNT = 0;

$(document).ready(function () {

    loadSQLTable();
    $("body").removeClass('bg-white');
    exportTables();


    document.getElementById('importFile')
        .addEventListener('change', getImportFile)

});


function loadSqlQuery() {

    $(".dkey").html(DOMAIN_KEY.toLowerCase() + "_")

    var bCount = 2;

    if (ADMIN_ACCESS) {
        bCount = 25;
    }


    $("#backup").html('');

    for (var i = 1; i <= bCount; i++) {
        $("#backup").append('<option value="' + i + '">' + i + '</option>');

    }


    $("#template").html('');

    for (var i = 0; i < templateArray.length; i++) {
        $("#template").append('<option value="' + templateArray[i] + '">' + templateArray[i] + '</option>');

    }

    $("#writeSync").html('');

    for (var i = 0; i < writeSyncArray.length; i++) {
        $("#writeSync").append('<option value="' + writeSyncArray[i] + '">' + writeSyncArray[i] + '</option>');

    }

    $("#automicity").html('');

    for (var i = 0; i < automicityArray.length; i++) {
        $("#automicity").append('<option value="' + automicityArray[i] + '">' + automicityArray[i] + '</option>');

    }


}


function loadSQLTable() {


    if (sqlTable) {
        sqlTable.destroy();
        $("#sqlTable").html("");
    }

    var fields = [
        {
            mData: 'xyz',
            sTitle: '',
            orderable: false,
            mRender: function (data, type, row) {

                var str = `<div class="form-group">
                            <div class="checkbox checkbox-inline">
                                <input type="checkbox" class="tableCheck" id="`+ row['_id'] + `" onclick="pushData(this,'` + row['_id'] + `')"> 
                            </div>
                            </div>
                `

                return str;

            }

        },
        {
            mData: 'name',
            sTitle: 'Table Name',
            orderable: false,

        },
        {
            mData: 'fields',
            sTitle: 'Fields',
            orderable: false,
            mRender: function (data, type, row) {
                var str = '<ul style="margin: 0px;padding: 0px;list-style: none">'
                for (var i = 0; i < data.length; i++) {

                    var pstr = '';
                    var istr = '';
                    var astr = '';
                    var actionStr = '<a href="javascript:void(0)" title="Drop Field" onclick="dropTableField(\'' + row['name'] + '\',\'' + data[i].name + '\')" ' +
                        'style="float:right;color:#666"><i class="icon-trash-o"></i> Field</a>' +

                        '<a href="javascript:void(0)" title="Add Index" onclick="addTableFieldIndex(\'' + row['name'] + '\',\'' + data[i].name + '\')" ' +
                        ' style="float:right;color:#666;margin-right: 5px;border-right: 1px solid #ccc;padding-right: 5px;">' +
                        '<i class="icon-plus3"></i> Index</a>';
                    var factionStr = '';


                    for (var j = 0; j < row['primaryKeyFields'].length; j++) {
                        if (data[i].name === row['primaryKeyFields'][j]) {
                            pstr = '<i class="icon-square" style="color:red;opacity: 0.6" title="Primary Field"></i>';
                            actionStr = '';
                        }
                    }

                    for (var j = 0; j < row['indexFields'].length; j++) {
                        if (data[i].name === row['indexFields'][j]) {
                            istr = '<i class="icon-square" style="color:forestgreen;opacity: 0.6" title="Indexed Field"></i>';
                            actionStr = '<a href="javascript:void(0)" title="Drop Index" onclick="dropTableFieldIndex(\'' + row['name'] + '\',\'' + data[i].name + '\')" ' +
                                ' style="float:right;color:#666"><i class="icon-trash-o"></i> Index</a> ';

                        }
                    }

                    if (data[i].name === row['affinityField']) {
                        astr = '<i class="icon-square" style="color:yellow;opacity: 0.6" title="Affinity Field"></i>'
                    }

                    str = str + '<li style="border-bottom: 1px solid #eee">' + (i + 1) + '] ' + pstr + ' ' + istr + ' ' + astr + ' <strong>' + data[i].name + '</strong> <small>' + data[i].type + '</small> ' +
                        actionStr + '</li>'
                }

                var addStr = '<p style="text-align: center">' +
                    '<a href="javascript:void(0)" onclick="addSQLTableFieldModal(\'' + row['name'] + '\')"><i class="icon-plus3"></i> Add Field</a>' +
                    '</p>'

                return str + addStr;
            }
        },
        {
            mData: 'backups',
            sTitle: 'Backups',
            orderable: false,
        },
        {
            mData: 'automicity',
            sTitle: 'Atomicity',
            orderable: false,
        },
        {
            mData: 'writeSync',
            sTitle: 'Write Sync',
            orderable: false,
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            mRender: function (data, type, row) {


                return '<button class="btn btn-sm btn-icon btn-default" title="Drop Table" onclick="openDeleteModal(\'' + row['name'] + '\')"><i class="icon-trash-o"></i></button>'
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
        // aaSorting: sortOrder,
        "ordering": false,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        dom: '<"bskp-search-left" f> lrtip',

        language: {
            "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> ',
            "searchPlaceholder": "Search by Table Name",
            

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

                queryParams.query['bool']['should'].push({ "wildcard": { "name": "*" + searchText.toLowerCase() + "*" } })
                queryParams.query['bool']["minimum_should_match"] = 1;

            }
            queryParams.query['bool']['must'] = [domainKeyJson];


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type: 'SQL_TABLE'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;

                    table_list = resultData['data'];
                    $(".tableCount").html(resultData.recordsFiltered)

                    resultData['draw'] = oSettings.iDraw;

                    setTimeout(function () {
                        checkSelectedData();

                    }, 500)

                    fnCallback(resultData);
                }
            });
        }

    };

    sqlTable = $("#sqlTable").DataTable(tableOption);
    $('').attr('maxlength', '100')




}



function openModal() {

    loadSqlQuery();

    TAB_FIELD_COUNT = 0;

    table_obj = {};

    $("#addSQLTable form")[0].reset();

    $("#table_name").removeAttr('disabled');

    $("#addSQLTable").modal({
        backdrop: 'static',
        keyboard: false
    });

    $(".tabFieldBody").html("");

    addTableField();
    addTableField();
}

function openEditModal(id) {

    TAB_FIELD_COUNT = 0;

    for (var i = 0; i < message_list.length; i++) {
        if (id === message_list[i].id) {
            table_obj = message_list[i];
        }
    }

    $("#msg_id").val(table_obj.id)
    $("#msg_name").val(table_obj.name)
    $("#msg_desc").val(table_obj.description)

    $("#msg_id").attr('min', USER_OBJ.domain.startId)
    $("#msg_id").attr('max', USER_OBJ.domain.startId + ID_RANGE_COUNT)
    $("#msg_id").attr('disabled', 'disabled');

    $("#addSQLTable").modal({
        backdrop: 'static',
        keyboard: false
    });
    $(".tabFieldBody").html("");

    for (var i = 0; i < table_obj.fields.length; i++) {
        definedFields(table_obj.fields[i]);
    }
    addTableField();

}

function definedFields(obj) {

    var str = `<tr>
    <td>
        <label>` + obj.name + `</label>
    </td>
    <td>
     <label>` + obj.dataType + `</label>
    </td>
    <td>-</td>
  </tr>`;

    $(".tabFieldBody").append(str);


}


function deleteMessageField(id) {
    $("#tab_field_row_" + id).remove();
    TAB_FIELD_COUNT--;



}

function addTableField() {

    var id = TAB_FIELD_COUNT;


    var sql_data_type = ['BOOLEAN', 'INT', 'TINYINT', 'SMALLINT', 'BIGINT', 'DECIMAL', 'DOUBLE', 'REAL',
        'TIME', 'DATE', 'TIMESTAMP', 'VARCHAR', 'CHAR', 'UUID', 'BINARY', 'GEOMETRY'];

    var dstr = '';
    for (var i = 0; i < sql_data_type.length; i++) {
        dstr = dstr + '<option value="' + sql_data_type[i] + '" >' + sql_data_type[i] + '</option>'
    }


    var str = `<tr class="fieldrow" id="tab_field_row_` + id + `">
    <td>
        <input class="form-control input-sm mesg-field" placeholder="Field Name" maxlength="100" type="text"  id="tab_field_` + id + `"  onkeyup="return forceLower(this);">
        <span id="logtab_field_`+id+`"></span>
        </td>
    <td>
    <select class="form-control mesg-type input-sm"  id="tab_datatype_` + id + `">
      <option value="" >Choose Data Type</option>
     `+ dstr + `
    </select>
    <span id="logtab_datatype_`+id+`"></span>

    </td>
    <td>
        <div class="checkbox checkbox-css checkbox-inline">
            <input type="checkbox" id="p_key_`+ id + `" class="primaryKey" value="` + id + `"  name="primaryKey[]" onclick="checkPrimaryKey(` + id + `)" value=""> <label for="p_key_` + id + `"> Primary Key</label>
        </div>
        <div class="checkbox checkbox-css checkbox-inline">
            <input type="checkbox" id="i_key_`+ id + `" class="indexKey" value="` + id + `"  name="indexKey[]" onclick="checkIndexKey(` + id + `)"> <label for="i_key_` + id + `"> Index</label>
        </div>
        <div class="checkbox checkbox-css checkbox-inline disabled">
            <input type="checkbox" id="a_key_`+ id + `" class="affKey"  value="` + id + `" name="affKey[]" disabled onclick="checkAffinityKey(` + id + `)"><label for="a_key_` + id + `"> Affinity</label>
        </div>
    </td>
    <td style="text-align: center;vertical-align: middle;" class="addMsg">`+
        (id > 0 ? '<img src="images/menu/plus1.svg" class="add" onclick="addTableField()" style="cursor: pointer; padding:3px" />' : '') +
        (id > 1 ? '<img src="images/menu/minus1.svg" class="minus" style="margin-left:5px;cursor: pointer;padding:3px" onclick="deleteMessageField(' + id + ')"/>' : '')
        + ` </td>
  </tr>`;

    $(".tabFieldBody").append(str);
    TAB_FIELD_COUNT++;
}

var primaryKey = [];
var indexFields = [];
var affinityField = '';

function checkPrimaryKey(id) {

    if ($("#p_key_" + id).prop("checked")) {
        $("#i_key_" + id).prop('checked', false);
        $("#i_key_" + id).parent().addClass('disabled')
        $("#i_key_" + id).attr('disabled', 'disabled');

        $("#a_key_" + id).prop('checked', false);
        $("#a_key_" + id).parent().removeClass('disabled')
        $("#a_key_" + id).removeAttr('disabled');
    } else {
        $("#i_key_" + id).prop('checked', false);
        $("#i_key_" + id).parent().removeClass('disabled')
        $("#i_key_" + id).removeAttr('disabled');

        $("#a_key_" + id).prop('checked', false);
        $("#a_key_" + id).parent().addClass('disabled')
        $("#a_key_" + id).attr('disabled', 'disabled');
    }

}

function checkIndexKey(id) {

    if ($("#i_key_" + id).prop("checked")) {
        $("#p_key_" + id).prop('checked', false);
        $("#p_key_" + id).parent().addClass('disabled')
        $("#p_key_" + id).attr('disabled', 'disabled');

    } else {
        $("#p_key_" + id).prop('checked', false);
        $("#p_key_" + id).parent().removeClass('disabled')
        $("#p_key_" + id).removeAttr('disabled');

    }

}

function checkAffinityKey(id) {

    if ($("#a_key_" + id).prop("checked")) {
        $(".affKey").prop('checked', false);
        $("#a_key_" + id).prop('checked', true);

    }

}


function addSQLTable() {
    primaryKey = [];
    indexFields = [];

    var flag = false;

    
    var table_name =$.trim($("#table_name").val() )

    if(table_name === "" ){
   
        errorMsgBorder('Table name is required', 'table_name');
        return false;
       
    }

    else{
        var fields = [];
    var check = false;
    $.each($('.fieldrow'),function () {
        if($(this).find('.mesg-field').val() === ""){ 

            errorMsgBorder('Field Name is required', $(this).find('.mesg-field').attr('id'));
            check = false;
            return false;
        }
        
        else if($(this).find('.mesg-type').val() === ""){ 
                errorMsgBorder('Data type is required', $(this).find('.mesg-type').attr('id'));
                check = false;
                return false;
            }
            else{
                var json = {
                    "dataType":$(this).find('.mesg-type').val(),
                    "format": "AS_IS",
                    "label": "",
                    "description": "",
                    "name": $(this).find('.mesg-field').val()
                }
                fields.push(json);
                console.log("True else");
                check = true;
                return true;
            }
               })
    
    
    }
       
    
    
    // if (msg_id == "") {
    //     console.log("mid");
    //     errorMsgBorder('Record ID cannot be empty', 'msg_id');
    //     return false;
    // }

    // var fields = [];
    // var check = false;

    for (var i = 0; i < TAB_FIELD_COUNT; i++) {
        var json = {
            "type": $("#tab_datatype_" + i).val(),
            "name": $("#tab_field_" + i).val()
        };
        fields.push(json);
    }

    $("input[name='primaryKey[]']:checked").each(function () {
        primaryKey.push($(this).val());
    });

    $("input[name='indexKey[]']:checked").each(function () {
        indexFields.push($(this).val());
    });

    if (primaryKey.length === 0) {
        errorMsg('Atleast one Primary Key in the table');
        return false;
    }


    if (primaryKey.length === (TAB_FIELD_COUNT)) {

        errorMsg('All fields cannot be Primary.')
        addTableField()

        return false;
    }


    var pKeyList = [];

    for (var i = 0; i < primaryKey.length; i++) {
        pKeyList.push($("#tab_field_" + primaryKey[i]).val());

        if ($("#a_key_" + primaryKey[i]).prop("checked")) {
            affinityField = $("#tab_field_" + primaryKey[i]).val();
        }
    }




    var iFieldList = [];

    for (var i = 0; i < indexFields.length; i++) {
        iFieldList.push($("#tab_field_" + indexFields[i]).val());
    }


    var msgObj = {
        "name": DOMAIN_KEY.toLowerCase() + "_" + $("#table_name").val(),
        "fields": fields,
        "primaryKeyFields": pKeyList,
        "indexFields": iFieldList,
        "affinityField": affinityField,
        "backups": Number($("#backup").val()),
        "template": $("#template").val(),
        "automicity": $("#automicity").val(),
        "writeSync": $("#writeSync").val()
    };

    var ignore = $("#ignore").prop("checked");

    console.log(msgObj)


    $(".btnSubmit").attr('disabled', 'disabled');

    createSQLTable(msgObj, ignore, function (status, data) {
        if (status) {
            successMsg('Table Created Successfully');
            loadSQLTable();
            $("#addSQLTable").modal('hide');
        } else {
            errorMsg('Error in Creating Table')
        }
        $(".btnSubmit").removeAttr('disabled');
    });


}

function createTable(msgObj, ignore) {

}


function checkTableExists(tableName, cbk) {

    var queryParams = {
        "query": {
            "bool": {
                "must": [
                    { match: { domainKey: DOMAIN_KEY } },
                    {
                        "multi_match": {
                            "query": tableName,
                            "type": "phrase_prefix",
                            "fields": ["name"]
                        }
                    }
                ]
            }

        },
        "size": 1
    };


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };
    searchByQuery('', 'SQL_TABLE', searchQuery, function (status, data) {

        if (status) {
            var resultData = QueryFormatter(data);

            if (resultData.total > 0) {
                cbk(true, null)
            } else {
                cbk(false, null)
            }


        }

    });
}

function openDeleteModal(id) {

    current_table_name = id;
    $(".delete_table_name").html(id);
    $("#deleteModal").modal('show');

}

function proceedDelete() {
    var ignore = $("#ignoreDrop").prop("checked");

    dropSQLTable(current_table_name, ignore, function (status, data) {
        if (status) {
            successMsg('Table Dropped Successfully');
            loadSQLTable();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in drop table')
        }
    })
}



function dropTableField(tname, fname) {
    dropSQLTableField(tname, fname, function (status, data) {
        if (status) {
            successMsg('Field Dropped Successfully');
            loadSQLTable();
        } else {
            errorMsg('Error in drop table field')
        }
    })
}


function dropTableFieldIndex(tname, fname) {
    dropSQLTableIndex(tname, fname, true, function (status, data) {
        if (status) {
            successMsg('Field Index Dropped Successfully');
            loadSQLTable();
        } else {
            errorMsg('Error in dropping table field index')
        }
    })
}


function addTableFieldIndex(tname, fname) {
    createSQLTableFieldIndex(tname, fname, true, true, function (status, data) {
        if (status) {
            successMsg('Field Index Added Successfully');
            loadSQLTable();
        } else {
            errorMsg('Error in adding table field index')
        }
    })
}

var tempTableName = null;
function addSQLTableFieldModal(tname) {
    tempTableName = tname;

    $("#field_name").val('')
    $("#field_type").val('')

    var sql_data_type = ['BOOLEAN', 'INT', 'TINYINT', 'SMALLINT', 'BIGINT', 'DECIMAL', 'DOUBLE', 'REAL',
        'TIME', 'DATE', 'TIMESTAMP', 'VARCHAR', 'CHAR', 'UUID', 'BINARY', 'GEOMETRY'];

    $("#field_type").html('<option value="" >Choose Data Type</option>');

    for (var i = 0; i < sql_data_type.length; i++) {
        $("#field_type").append('<option value="' + sql_data_type[i] + '" >' + sql_data_type[i] + '</option>');
    }

    $("#addFieldModal").modal({
        backdrop: 'static',
        keyboard: false
    });
}

function insertSQLTableField() {
    var data = {
        name: $("#field_name").val(),
        type: $("#field_type").val()
    }
    addSQLTableField(tempTableName, data, function (status, data) {
        if (status) {
            successMsg('Field Added Successfully');
            $("#addFieldModal").modal('hide');

            loadSQLTable();
        } else {
            errorMsg('Error in adding table field')
        }
    })
}

var selectedData = [];
function pushData(obj, id) {

    var data = {};

    for (var i = 0; i < table_list.length; i++) {
        if (id === table_list[i]._id) {
            data = table_list[i];
        }
    }

    if ($(obj).is(":checked")) {
        selectedData.push(data);
    } else {
        var tmp = [];
        for (var i = 0; i < selectedData.length; i++) {
            if (id !== selectedData[i]._id) {
                tmp.push(selectedData[i]);
            }
        }
        selectedData = tmp
    }


    if (selectedData.length > 0) {
        exportTables()
        $(".selectedData").html('<b>' + selectedData.length + '</b> Table\'s Selected. <a href="javascript:void(0)" onclick="clearData()">clear all</a>')
    } else {
        $(".selectedData").html('')
    }
}

function clearData() {

    for (var i = 0; i < selectedData.length; i++) {
        $("#" + selectedData[i]._id).prop('checked', false);
    }
    selectedData = [];

    $(".selectedData").html('')

}


function checkSelectedData() {
    for (var i = 0; i < selectedData.length; i++) {
        $("#" + selectedData[i]._id).prop('checked', true);
    }

    if (selectedData.length > 0) {
        exportTables()
        $(".selectedData").html('<b>' + selectedData.length + '</b> Table\'s Selected. <a href="javascript:void(0)" onclick="clearData()">clear all</a>')
    } else {
        $(".selectedData").html('')
    }
}



function exportTables() {


    var tmp = [];
    for (var i = 0; i < selectedData.length; i++) {
        tmp.push(selectedData[i]);
    }

    saveAndDownload(JSON.stringify(tmp), 'sql-tables-' + DOMAIN_KEY + '.json', 'application/json', 'exportMsg')

}



function importTable() {
    $("#importModal form")[0].reset();
    $("#imported_content").val('')
    $("#importFile").val('')
    importData = '';
    // $("#importModal").modal('show');
    $('#importModal').modal({ backdrop: 'static', keyboard: false })

}


function getImportFile(event) {
    importData = ''
    const input = event.target;
    if (input && input.files.length > 0) {
        placeFileContent(
            document.getElementById('imported_content'),
            input.files[0]);

    }
}

var importData = '';

function placeFileContent(target, file) {
    readFileContent(file).then(content => {
        importData = content;
    }).catch(error => console.log(error))
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}


function importContent() {

    var dat = JSON.parse(importData);

    $(".btnSubmit").attr('disabled', 'disabled');
    $(".btnSubmit").html('<i class="icon-spinner icon-spin"></i> importing tables. please wait...')

    async.filter(dat, function (obj, cbk) {

        delete obj._id;
        obj['name'] = obj['name'].replace(obj['domainKey'].toLowerCase(), DOMAIN_KEY.toLowerCase());
        obj['domainKey'] = DOMAIN_KEY;

        createSQLTable(obj, true, function (status, data) {
            cbk(null, null)

        });

    }, function (err, result) {
        successMsg('Table Imported Successfully');
        loadSQLTable();
        $("#importModal").modal('hide')
        $(".btnSubmit").removeAttr('disabled');
        $(".btnSubmit").html('Proceed');
    })


}
