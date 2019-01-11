var VERTICAL_ENABLE = true;
var verticalID = null;
var verticalImageID = null;
var codeID = null;
var verticalObj = {};
var createdBy = (USER_OBJ.user.firstName ? USER_OBJ.user.firstName : 'Boodskap Admin') + (USER_OBJ.user.lastName ? ' ' + USER_OBJ.user.lastName : '');
var createdByEmail = USER_OBJ.user.email;

var message_list = [];
var record_list = [];
var message_rules_list = [];
var named_rules_list = [];
var schedule_rules_list = [];
var templates_list = [];
var dashboard_list = [];
var mobile_dashboard_list = [];

var selected_message_list = [];
var selected_record_list = [];
var selected_message_rules_list = [];
var selected_named_rules_list = [];
var selected_schedule_rules_list = [];
var selected_templates_list = [];
var selected_dashboard_list = [];
var selected_mobile_dashboard_list = [];

$(document).ready(function () {

    $("body").removeClass('bg-white');


    $('#verticalCategory').html('<option value=""></option>');

    for (var i = 0; i < VERTICAL_CATEGORY.length; i++) {
        $('#verticalCategory').append('<option value="' + VERTICAL_CATEGORY[i] + '">' + VERTICAL_CATEGORY[i] + '</option>');

    }
    if ($.trim($("#verticalID").val()) === "") {
        verticalID = guid();
        $(".verticalVersion").html("1.0.0");
        $(".createdBy").html('<span><i class="icon-user"></i> ' + createdBy +
            '</span><br><span><i class="icon-envelop"></i> ' + createdByEmail + '</span>');
        $("#verticalVersion").val("1.0.0");
        $(".pageAction").html('Create');
        loadDataList();
    } else {
        verticalID = $.trim($("#verticalID").val());
        loadVertical();
        $(".pageAction").html('Edit');
    }

    $('#verticalTags').tagsinput({
        confirmKeys: [188]
    });

});


function loadVertical() {

    var queryParams = {
        query: {
            "bool": {
                "must": [{"match": {"domainKey": DOMAIN_KEY}}, {"match": {"verticalid": verticalID}}],
            }
        },
        size: 1
    };


    var ajaxObj = {
        "method": "GET",
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    searchByQuery('', 'VERTICAL', ajaxObj, function (status, data) {
        if (status) {
            var result = QueryFormatter(data).data;
            verticalObj = result.data[0];
            if (DOMAIN_KEY !== verticalObj.domainKey) {
                document.location = '/marketplace/addvertical'
            }

            loadVerticalPreview();

        } else {
            verticalID = guid();
            $(".verticalVersion").html("1.0.0");
            $(".createdBy").html('<span><i class="icon-user"></i> ' + createdBy +
                '</span><br><span><i class="icon-envelop"></i> ' + createdByEmail + '</span>');
            $("#verticalVersion").val("1.0.0");
        }
        loadDataList();
    })


}

function loadVerticalPreview() {
    $("#verticalName").val(verticalObj.verticalname);
    $("#verticalCategory").val(verticalObj.category);
    $("#verticalDesc").val(verticalObj.description);
    $("#verticalVersion").val(verticalObj.version);

    createdBy = verticalObj.createdby;
    createdByEmail = verticalObj.createdbyemail;
    $(".createdBy").html('<span><i class="icon-user"></i> ' + createdBy +
        '</span><br><span><i class="icon-envelop"></i> ' + createdByEmail + '</span>');

    $(".createdTime").html(moment(verticalObj.createdtime).format('MM/DD/YYYY hh:mm a'))
    $(".updatedTime").html(moment(verticalObj.updatedtime).format('MM/DD/YYYY hh:mm a'))


    $(".verticalImage").attr('src', API_BASE_PATH + '/files/public/download/' + verticalObj.verticalimage);
    verticalImageID = verticalObj.verticalimage;


    var tags = verticalObj.tags.split(",");

    for (var i = 0; i < tags.length; i++) {
        $('#verticalTags').tagsinput('add', tags[i]);
    }

    $('input:radio[name="publishStatus"][value="' + verticalObj.published + '"]').prop('checked', true);


    selected_message_list = verticalObj.messages;
    selected_record_list = verticalObj.records;
    selected_message_rules_list = verticalObj.messagerules;
    selected_schedule_rules_list = verticalObj.scheduledrules;
    selected_named_rules_list = verticalObj.namedrules;
    selected_templates_list = verticalObj.templates;
    selected_dashboard_list = verticalObj.dashboards;
    selected_mobile_dashboard_list = verticalObj.mobiledashboards;

    loadCount();
}

function uploadFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                verticalImageID = result.id;
                $(".verticalImage").attr('src', API_BASE_PATH + '/files/public/download/' + verticalImageID)


            } else {
                errorMsg('Error in image upload!');
            }
        }
    };
    xhr.open('POST', API_BASE_PATH + '/files/upload/' + USER_OBJ.token + '?ispublic=true', true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    xhr.send(formData);
}

function uploadImage() {

    var fileInput = document.getElementById("verticalImage");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return false;
    }

    uploadFile(files[0]);

}

function createVertical() {

    if(selected_dashboard_list.length === 0){
        errorMsg('Vertical cannot be created without selecting single dashboard!')
        return false;
    }

    verticalObj = {
        domainKey: DOMAIN_KEY,
        category: $("#verticalCategory").val(),
        tags: $("#verticalTags").val(),
        verticalid: verticalID,
        verticalname: $("#verticalName").val(),
        verticalimage: verticalImageID,
        version: $("#verticalVersion").val(),
        enabled: VERTICAL_ENABLE,
        pricing: false,
        price: 0,
        published: $("input[name='publishStatus']:checked").val() === 'true' ? true : false,
        description: $("#verticalDesc").val(),
        createdby: createdBy,
        createdbyemail: createdByEmail,
        createdtime: verticalObj.createdtime ? verticalObj.createdtime : new Date().getTime(),
        updatedtime: new Date().getTime(),
        messages: selected_message_list,
        records: selected_record_list,
        messagerules: selected_message_rules_list,
        scheduledrules: selected_schedule_rules_list,
        namedrules: selected_named_rules_list,
        templates: selected_templates_list,
        dashboards: selected_dashboard_list,
        mobiledashboards: selected_mobile_dashboard_list
    };


    upsertVertical(verticalObj, function (status, data) {
        if (status) {
            successMsg('Vertical created/updated successfully!');
            // setTimeout(function () {
            //     document.location = '/marketplace/verticals'
            // }, 2000)
        } else {
            errorMsg('Error in Vertical Creation!')
        }
    });

}

function loadDataList() {
    async.series({
        messageList: function (cbk1) {
            listMessageSpec(1000, null, null, function (status, data) {
                if (status && data.length > 0) {
                    message_list = data;
                    $(".messageDefCount").html(data.length)
                } else {
                    $(".messageDefCount").html(0)
                    message_list = [];
                }

                $(".messageDefList").html('');

                for (var i = 0; i < message_list.length; i++) {
                    $(".messageDefList").append('<div class="col-lg-3">' +
                        '<label><input type="checkbox" name="messgeDef" id="ms_' + message_list[i].id + '" value="' + message_list[i].id + '" onchange="changeCount(this,1)" /> ' +
                        message_list[i].name + ' <small>[' + message_list[i].id + ']</small></label>' +
                        '</div>');
                }


                cbk1(null, null);
            })

        },
        recordList: function (cbk2) {
            listRecordSpec(1000, null, null, function (status, data) {
                if (status && data.length > 0) {
                    record_list = data;
                    $(".recordDefCount").html(data.length)
                } else {
                    $(".recordDefCount").html(0)
                    record_list = [];
                }

                $(".recordDefList").html('');

                for (var i = 0; i < record_list.length; i++) {
                    $(".recordDefList").append('<div class="col-lg-3">' +
                        '<label><input type="checkbox" name="recordDef" id="rs_' + record_list[i].id + '" value="' + record_list[i].id + '" onchange="changeCount(this,2)"/> ' +
                        record_list[i].name + ' <small>[' + record_list[i].id + ']</small></label>' +
                        '</div>');
                }

                cbk2(null, null);
            })

        },
        messageRuleList: function (cbk3) {
            message_rules_list = message_list;

            $(".messageRuleList").html('');

            for (var i = 0; i < message_rules_list.length; i++) {
                $(".messageRuleList").append('<div class="col-lg-3">' +
                    '<label><input type="checkbox" name="messageRule" id="mr_' + message_rules_list[i].id + '" value="' + message_rules_list[i].id + '" onchange="changeCount(this,3)"/> ' +
                    message_rules_list[i].name + ' <small>[' + message_rules_list[i].id + ']</small></label>' +
                    '</div>');
            }

            cbk3(null, null);
        },
        namedRuleList: function (cbk4) {
            listNamedRules(1000, null, null, function (status, data) {
                if (status && data.length > 0) {
                    named_rules_list = data;
                    $(".namedRuleCount").html(data.length)
                } else {
                    $(".namedRuleCount").html(0)
                    named_rules_list = [];
                }
                $(".namedRuleList").html('');

                for (var i = 0; i < named_rules_list.length; i++) {
                    $(".namedRuleList").append('<div class="col-lg-3">' +
                        '<label><input type="checkbox" name="namedRule" id="nr_' + named_rules_list[i].name + '" value="' + named_rules_list[i].name + '" onchange="changeCount(this,4)"/> ' +
                        named_rules_list[i].name + '</label>' +
                        '</div>');
                }
                cbk4(null, null);
            })

        },
        scheduleRuleList: function (cbk5) {
            listScheduleRules(1000, null, null, function (status, data) {
                if (status && data.length > 0) {
                    schedule_rules_list = data;
                    $(".scheduleRuleCount").html(data.length)
                } else {
                    $(".scheduleRuleCount").html(0)
                    schedule_rules_list = [];
                }

                $(".scheduleRuleList").html('');

                for (var i = 0; i < schedule_rules_list.length; i++) {
                    $(".scheduleRuleList").append('<div class="col-lg-3">' +
                        '<label><input type="checkbox" name="scheduleRule" id="sr_' + schedule_rules_list[i].id + '" value="' + schedule_rules_list[i].id + '" onchange="changeCount(this,5)" /> ' +
                        schedule_rules_list[i].id + ' <small>[' + schedule_rules_list[i].pattern + ']</small></label>' +
                        '</div>');
                }

                cbk5(null, null);
            })

        },
        templatesList: function (cbk6) {
            listTemplates(1000, false, function (status, data) {
                if (status && data.length > 0) {
                    templates_list = data;
                    $(".templatesCount").html(data.length)
                } else {
                    $(".templatesCount").html(0)
                    templates_list = [];
                }

                $(".templatesList").html('');

                for (var i = 0; i < templates_list.length; i++) {
                    $(".templatesList").append('<div class="col-lg-3">' +
                        '<label><input type="checkbox" name="templates" id="t_' + templates_list[i].name + '" value="' + templates_list[i].name + '" onchange="changeCount(this,6)" /> ' +
                        templates_list[i].name + '</label>' +
                        '</div>');
                }

                cbk6(null, null);
            })

        },
        dashboardList: function (cbk7) {
            getDomainProperty(DASHBOARD_LIST_PROPERTY, function (status, data) {
                if (status) {
                    dashboard_list = JSON.parse(data.value);
                    $(".dashboardCount").html(dashboard_list.length);

                } else {
                    dashboard_list = [];
                    $(".dashboardCount").html(0);
                }

                $(".dashboardList").html('');

                for (var i = 0; i < dashboard_list.length; i++) {
                    $(".dashboardList").append('<div class="col-lg-3">' +
                        '<label><input type="checkbox" name="dashboardlist" id="d_' + dashboard_list[i].id + '" value="' + dashboard_list[i].property + '" onchange="changeCount(this,7)" /> ' +
                        '' + dashboard_list[i].name + '</label>' +
                        '</div>');
                }

                cbk7(null, null);
            });

        },
        mobileDashboardList: function (cbk7) {
            getDomainProperty(MOBILE_DASHBOARD_LIST_PROPERTY, function (status, data) {
                if (status) {
                    mobile_dashboard_list = JSON.parse(data.value);
                    $(".mobileDashboardCount").html(mobile_dashboard_list.length);

                } else {
                    mobile_dashboard_list = [];
                    $(".mobileDashboardCount").html(0);
                }

                $(".mobileDashboardList").html('');

                for (var i = 0; i < mobile_dashboard_list.length; i++) {
                    $(".mobileDashboardList").append('<div class="col-lg-3">' +
                        '<label><input type="checkbox" name="mobiledash" id="md_' + mobile_dashboard_list[i].id + '" value="' + mobile_dashboard_list[i].property + '" onchange="changeCount(this,8)" /> ' +
                        '' + mobile_dashboard_list[i].name + '</label>' +
                        '</div>');
                }

                cbk7(null, null);
            });

        }

    }, function (err, results) {
        // setTimeout(function () {
            checkData();
        // },1000)

    });
}

function checkData() {

    for(var i=0;i<selected_message_list.length;i++){
        $("#ms_"+selected_message_list[i]).prop('checked', true);
    }
    for(var i=0;i<selected_record_list.length;i++){
        $("#rs_" + selected_record_list[i]).prop('checked', true);
    }
    for(var i=0;i<selected_message_rules_list.length;i++){
        $("#mr_" + selected_message_rules_list[i]).prop('checked', true);
    }
    for(var i=0;i<selected_named_rules_list.length;i++){
        $("#nr_" + selected_named_rules_list[i]).prop('checked', true);
    }
    for(var i=0;i<selected_schedule_rules_list.length;i++){
        $("#sr_" + selected_schedule_rules_list[i]).prop('checked', true);
    }
    for(var i=0;i<selected_templates_list.length;i++){
        $("#t_"+selected_templates_list[i]).prop('checked',true);
    }
    for(var i=0;i<selected_dashboard_list.length;i++){

        $("#d_" + selected_dashboard_list[i].id).prop('checked',true);
    }
    for(var i=0;i<selected_mobile_dashboard_list.length;i++){
        $("#md_" + selected_mobile_dashboard_list[i].id).prop('checked', true);
    }
}

function loadCount() {
    $(".s_messageDefCount").html(selected_message_list.length)
    $(".s_recordDefCount").html(selected_record_list.length)
    $(".s_messageRuleCount").html(selected_message_rules_list.length)
    $(".s_namedRuleCount").html(selected_named_rules_list.length)
    $(".s_scheduleRuleCount").html(selected_schedule_rules_list.length)
    $(".s_templatesCount").html(selected_templates_list.length)
    $(".s_dashboardCount").html(selected_dashboard_list.length)
    $(".s_mobileDashboardCount").html(selected_mobile_dashboard_list.length)
}

function changeCount(obj, id) {

    var flag = $(obj).is(':checked');
    var value = $(obj).val();

    switch (id) {
        case 1:
            if (flag) {
                selected_message_list.push(value)
            } else {
                selected_message_list = _.reject(selected_message_list, function (d) {
                    return d === value
                });
            }
            break;
        case 2:
            if (flag) {
                selected_record_list.push(value)
            } else {
                selected_record_list = _.reject(selected_record_list, function (d) {
                    return d === value
                });
            }
            break;
        case 3:
            if (flag) {
                selected_message_rules_list.push(value)
            } else {
                selected_message_rules_list = _.reject(selected_message_rules_list, function (d) {
                    return d === value
                });
            }
            break;
        case 4:
            if (flag) {
                selected_named_rules_list.push(value)
            } else {
                selected_named_rules_list = _.reject(selected_named_rules_list, function (d) {
                    return d === value
                });
            }
            break;
        case 5:
            if (flag) {
                selected_schedule_rules_list.push(value)
            } else {
                selected_schedule_rules_list = _.reject(selected_schedule_rules_list, function (d) {
                    return d === value
                });
            }
            break;
        case 6:
            if (flag) {
                selected_templates_list.push(value)
            } else {
                selected_templates_list = _.reject(selected_templates_list, function (d) {
                    return d === value
                });
            }
            break;
        case 7:
            if (flag) {

                for (var i = 0; i < dashboard_list.length; i++) {
                    if (value === dashboard_list[i].property) {
                        selected_dashboard_list.push(dashboard_list[i])
                    }
                }


            } else {
                selected_dashboard_list = _.reject(selected_dashboard_list, function (d) {
                    return d.property === value
                });
            }
            break;
        case 8:
            if (flag) {
                for (var i = 0; i < mobile_dashboard_list.length; i++) {
                    if (value === mobile_dashboard_list[i].property) {
                        selected_mobile_dashboard_list.push(mobile_dashboard_list[i])
                    }
                }

            } else {
                selected_mobile_dashboard_list = _.reject(selected_mobile_dashboard_list, function (d) {
                    return d.property === value
                });
            }
            break;
    }

    loadCount();
}

