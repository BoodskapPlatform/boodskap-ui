var poolTable = null;
var pool_list = [];
var current_pool_name = null;
var current_pool_obj = null;

$(document).ready(function () {


    loadDBPool();

    $("body").removeClass('bg-white');

});

var POOL_TYPE = {
    "C3P0": [{name:"jdbcUrl",type:"string",mandatory:true},{name:"user",type:"string",mandatory:true},{name:"password",type:"string",mandatory:true},{name:"driverClass",type:"string",mandatory:true},{name:"acquireIncrement",type:"integer"},{name:"acquireRetryAttempts",type:"integer"},{name:"acquireRetryDelay",type:"integer"},{name:"autoCommitOnClose",type:"boolean"},{name:"automaticTestTable",type:"string"},{name:"breakAfterAcquireFailure",type:"boolean"},{name:"checkoutTimeout",type:"integer"},{name:"debugUnreturnedConnectionStackTraces",type:"boolean"},{name:"forceIgnoreUnresolvedTransactions",type:"boolean"},{name:"forceSynchronousCheckins",type:"boolean"},{name:"forceUseNamedDriverClass",type:"boolean"},{name:"identityToken",type:"string"},{name:"idleConnectionTestPeriod",type:"integer"},{name:"initialPoolSize",type:"integer"},{name:"loginTimeout",type:"integer"},{name:"maxAdministrativeTaskTime",type:"integer"},{name:"maxConnectionAge",type:"integer"},{name:"maxIdleTime",type:"integer"},{name:"maxIdleTimeExcessConnections",type:"integer"},{name:"maxPoolSize",type:"integer"},{name:"maxStatements",type:"integer"},{name:"maxStatementsPerConnection",type:"integer"},{name:"minPoolSize",type:"integer"},{name:"numHelperThreads",type:"integer"},{name:"overrideDefaultPassword",type:"string"},{name:"overrideDefaultUser",type:"string"},{name:"preferredTestQuery",type:"string"},{name:"privilegeSpawnedThreads",type:"boolean"},{name:"propertyCycle",type:"integer"},{name:"statementCacheNumDeferredCloseThreads",type:"integer"},{name:"testConnectionOnCheckin",type:"boolean"},{name:"testConnectionOnCheckout",type:"boolean"},{name:"unreturnedConnectionTimeout",type:"integer"},{name:"userOverridesAsString",type:"string"},{name:"usesTraditionalReflectiveProxies",type:"boolean"}],
    "DBCP":[{name:"url",type:"string",mandatory:true},{name:"username",type:"string",mandatory:true},{name:"password",type:"string",mandatory:true},{name:"driverClassName",type:"string",mandatory:true},{name:"abandonedUsageTracking",type:"boolean"},{name:"accessToUnderlyingConnectionAllowed",type:"boolean"},{name:"cacheState",type:"boolean"},{name:"defaultAutoCommit",type:"boolean"},{name:"defaultCatalog",type:"string"},{name:"defaultQueryTimeout",type:"integer"},{name:"defaultReadOnly",type:"boolean"},{name:"defaultSchema",type:"string"},{name:"defaultTransactionIsolation",type:"integer"},{name:"enableAutoCommitOnReturn",type:"boolean"},{name:"fastFailValidation",type:"boolean"},{name:"initialSize",type:"integer"},{name:"lifo",type:"boolean"},{name:"logAbandoned",type:"boolean"},{name:"logExpiredConnections",type:"boolean"},{name:"loginTimeout",type:"integer"},{name:"maxConnLifetimeMillis",type:"integer($int64)"},{name:"maxIdle",type:"integer"},{name:"maxOpenPreparedStatements",type:"integer"},{name:"maxTotal",type:"integer"},{name:"maxWaitMillis",type:"integer($int64)"},{name:"minEvictableIdleTimeMillis",type:"integer($int64)"},{name:"minIdle",type:"integer"},{name:"numTestsPerEvictionRun",type:"integer"},{name:"poolPreparedStatements",type:"boolean"},{name:"removeAbandonedOnBorrow",type:"boolean"},{name:"removeAbandonedOnMaintenance",type:"boolean"},{name:"rollbackOnReturn",type:"boolean"},{name:"softMinEvictableIdleTimeMillis",type:"integer($int64)"},{name:"testOnBorrow",type:"boolean"},{name:"testOnCreate",type:"boolean"},{name:"testOnReturn",type:"boolean"},{name:"testWhileIdle",type:"boolean"},{name:"timeBetweenEvictionRunsMillis",type:"integer($int64)"},{name:"validationQuery",type:"string"},{name:"validationQueryTimeout",type:"integer"}],
    "HIKARI": [{name:"jdbcUrl",type:"string",mandatory:true},{name:"username",type:"string",mandatory:true},{name:"password",type:"string",mandatory:true},{name:"dataSourceClassName",type:"string",text:'dataSourceClassName/driverClassName must be required',mandatory:true},{name:"driverClassName",type:"string",mandatory:true,text:'dataSourceClassName/driverClassName must be required'},{name:"allowPoolSuspension",type:"boolean"},{name:"autoCommit",type:"boolean"},{name:"catalog",type:"string"},{name:"connectionInitSql",type:"string"},{name:"connectionTestQuery",type:"string"},{name:"connectionTimeout",type:"integer"},{name:"idleTimeout",type:"integer"},{name:"initializationFailTimeout",type:"integer"},{name:"isolateInternalQueries",type:"boolean"},{name:"leakDetectionThreshold",type:"integer"},{name:"maximumPoolSize",type:"integer"},{name:"maxLifetime",type:"integer"},{name:"minimumIdle",type:"integer"},{name:"readOnly",type:"boolean"},{name:"schema",type:"string"},{name:"transactionIsolation",type:"string"},{name:"validationTimeout",type:"integer"}],
    "TOMCAT": [{name:"url",type:"string",mandatory:true},{name:"username",type:"string",mandatory:true},{name:"password",type:"string",mandatory:true},{name:"driverClassName",type:"string",mandatory:true},{name:"abandonWhenPercentageFull",type:"integer"},{name:"accessToUnderlyingConnectionAllowed",type:"boolean"},{name:"alternateUsernameAllowed",type:"boolean"},{name:"commitOnReturn",type:"boolean"},{name:"defaultAutoCommit",type:"boolean"},{name:"defaultCatalog",type:"string"},{name:"defaultReadOnly",type:"boolean"},{name:"defaultTransactionIsolation",type:"integer"},{name:"fairQueue",type:"boolean"},{name:"ignoreExceptionOnPreLoad",type:"boolean"},{name:"initialSize",type:"integer"},{name:"initSQL",type:"string"},{name:"logAbandoned",type:"boolean"},{name:"logValidationErrors",type:"boolean"},{name:"maxActive",type:"integer"},{name:"maxAge",type:"integer"},{name:"maxIdle",type:"integer"},{name:"maxWait",type:"integer"},{name:"minEvictableIdleTimeMillis",type:"integer"},{name:"minIdle",type:"integer"},{name:"numTestsPerEvictionRun",type:"integer"},{name:"propagateInterruptState",type:"boolean"},{name:"removeAbandoned",type:"boolean"},{name:"removeAbandonedTimeout",type:"integer"},{name:"rollbackOnReturn",type:"boolean"},{name:"suspectTimeout",type:"integer"},{name:"testOnBorrow",type:"boolean"},{name:"testOnConnect",type:"boolean"},{name:"testOnReturn",type:"boolean"},{name:"testWhileIdle",type:"boolean"},{name:"timeBetweenEvictionRunsMillis",type:"integer"},{name:"useDisposableConnectionFacade",type:"boolean"},{name:"useEquals",type:"boolean"},{name:"useLock",type:"boolean"},{name:"useStatementFacade",type:"boolean"},{name:"validationInterval",type:"integer"},{name:"validationQuery",type:"string"},{name:"validationQueryTimeout",type:"integer"}]
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
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN_ALT,
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

function openModal(type, id) {
    if (type === 1) {
        $("#pool_name").removeAttr('readonly');
        $(".templateAction").html('Create');


        renderType();



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
        $("#pool_name").attr('readonly', 'readonly');

        $("#pool_name").val(obj.id);
        $("#pool_type").val(obj.type);
        renderType();
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



    $(".btnSubmit").attr('disabled', 'disabled');


    retreiveDBPool(tempObj.id, function (status, data) {

        if (status) {
            $(".btnSubmit").removeAttr('disabled');
            errorMsgBorder('DB Connection Pool name already exist', 'pool_name');
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


function renderType() {
    var id = $("#pool_type").val();

    $(".typeBody").html('')

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
    var id = $("#pool_type").val();
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
    var id = $("#pool_type").val();
    var arg = id.toLowerCase()+'Args';

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
        id : $("#pool_name").val(),
        type :  $("#pool_type").val(),
        "c3p0Args": null,
        "dbcpArgs": null,
        "hikariArgs":null,
        "tomcatArgs" : null

    };

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