var alexaTable = null;
var current_alexa_id = null;
var alexa_list = []
var named_rules_list = [];


$(document).ready(function () {

    if(USER_ROLE.indexOf('user') !== -1){
        $(".acBtn").remove();
    }

    loadNamedRulesList();
    loadAlexa();

    $("body").removeClass('bg-white');

});

function loadAlexa() {


    if (alexaTable) {
        alexaTable.destroy();
        $("#alexaTable").html("");
    }

    var fields = [
        {
            mData: 'intentName',
            sTitle: 'Alexa Action',
            orderable: false,
            mRender: function (data, type, row) {
                return '<i class="icon-microphone"></i> Say, <label style="display: inline-block;border-bottom: 1px dashed #ccc;cursor: help">"Boodskap, ' + data + '"</label>';
            }
        },
        {
            mData: 'ruleName',
            sTitle: 'Rule Name',
            orderable: false,
        },
        {
            mData: 'createdBy',
            sTitle: 'Created By',
            orderable: false,
        },
        {
            mData: 'updatedStamp',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return data ? moment(data).format('MM/DD/YYYY hh:mm:ss a') : "-";
            }
        },
        {
            mData: 'createdStamp',
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

                if(row['createdBy'] === USER_OBJ.user.email) {
                    return '' +
                        '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(2,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                        '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
                }else{
                    return '-';
                }
            }

        }

    ];


    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        query: {
            "bool": {
                "must": [],
            }
        },
        sort: []
    };

    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        aaSorting: [[3, 'desc']],
        searching: true,
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {
                var searchJson = {
                    "multi_match": {
                        "query": '*' + searchText + '*',
                        "type": "phrase_prefix",
                        "fields": ['_all']
                    }
                };

                queryParams.query['bool']['must'] = [domainKeyJson, searchJson];

            } else {
                queryParams.query['bool']['must'] = [domainKeyJson];
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : 'ALEXA'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;
                    alexa_list = resultData.data;
                    $(".actionCount").html(resultData.recordsFiltered)
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    alexaTable = $("#alexaTable").DataTable(tableOption);


}


function loadNamedRulesList() {
    listNamedRules(1000, null, null, function (status, data) {


        $("#rule_name").html('<option value=""></option>');


        if (status && data.length > 0) {
            named_rules_list = data;

            for (var i = 0; i < data.length; i++) {

                $("#rule_name").append('<option value="' + data[i].name + '">' + data[i].name + '</option>');

            }

        }
    })
}


function openModal(type, id) {
    current_alexa_id = id;

    $(".intentName").html('')

    var obj = {};

    for (var i = 0; i < alexa_list.length; i++) {
        if (id === alexa_list[i].id) {
            obj = alexa_list[i];
        }
    }

    if (type === 1) {

        $("#addAlexaAction form")[0].reset();
        $("#addAlexaAction").modal('show');

    } else if (type === 2) {

        $("#addAlexaAction form")[0].reset();

        $("#rule_name").val(obj.ruleName)
        $("#intent_name").val(obj.intentName)


        $("#addAlexaAction").modal('show');

    } else if (type === 3) {
        $(".delete_rule_name").html(obj.intentName)

        $("#deleteModal").modal('show');
    }
}

function showIntentName() {
    $(".intentName").html('<label >"Boodskap, ' + $("#intent_name").val() + '"</label>' );
}


function proceedDelete() {
    deleteAlexa(current_alexa_id, function (status, data) {
        if (status) {
            successMsg('Alexa Action Deleted Successfully');
            loadAlexa();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
        }
    })
}


function upsertAlexaAction() {

    $(".btnSubmit").attr('disabled', 'disabled');

    var acObj = {
        "domainKey": DOMAIN_KEY,
        "ruleType": "DOMAIN",
        "ruleName": $("#rule_name").val(),
        "intentName": $("#intent_name").val().toLowerCase(),
        "errorResponse": "",
        "createdBy": USER_OBJ.user.email,
        "createdStamp": new Date().getTime(),
        "updatedStamp": new Date().getTime(),
        id : current_alexa_id ? current_alexa_id : guid()
    };



    if (current_alexa_id) {
        acObj['updatedStamp'] = new Date().getTime();
    } else {
        acObj['createdStamp'] = new Date().getTime();
        acObj['updatedStamp'] = new Date().getTime();
    }


    upsertAlexa(acObj, function (status, data) {

        $(".btnSubmit").removeAttr('disabled');
        if (status) {
            if (current_alexa_id) {
                successMsg('Alexa Action Updated Successfully');
            } else {
                successMsg('Alexa Action Created Successfully');
            }
            loadAlexa();

            $("#addAlexaAction").modal('hide');
        } else {
            errorMsg('Error in Updating Alexa Action')
        }

    })
}



