var editorHeight = $(window).height() - 150;
var delete_widget_id = null;
var added_widgets_list = [];
var imported_widget_list = [];
var current_widget_id = null;
var current_widget_obj = null;
var htmlEditor = null;
var jsEditor = null;
var cssEditor = null;
var asset_list = [];
var device_list = [];
var image_list = [];
var imageID = null;
var record_list = [];
var message_list = [];
var DASHBOARD_LIST = [];
var CURRENT_DASHBOARD = {};
var CURRENT_DASHBOARD_ID = null;
var DEFAULT_DASHBOARD = {
    name: 'Untiled Dashboard',
    id: new Date().getTime(),
    property: 'dashboard.1',
    icon: 'icon-dashboard',
};
var CURRENT_DOMAIN = {};
var DASHBOARD_WIDGETS = [];
var GRID_STACK = null;
var CURRENT_DASHBOARD_ID = null;
var clicked_dashboard_icon = null;
var WIDGETS_LIST = [];
var CURRENT_WIDGET_OBJ = null;

var widget_ids = [];
var update_widget_list = [];
var imported_widget_group = {};

$(document).ready(function () {
    $(".resourceTab").css('height', editorHeight + 'px');

    $(".dashboardContent").css('height', $(window).height() - 200);
    $(".widgetBody").css('height', $(window).height() - 370);
    $(".dashboardListBody").css('height', $(window).height() - 200);
    $("body").removeClass('bg-white');
    loadDashboardlist();
    loadImportedWidgets();
    // addIconList();
    loadImageList();

    var options = {
        animate: true,
        cellHeight: 100,
        float: false,
        verticalMargin: 10,
    };
    $('.grid-stack').gridstack(options);


});


function mqttListen() {

}


function loadDashboardlist() {

    getDomainProperty(DASHBOARD_LIST_PROPERTY, function (status, data) {
        if (status) {
            DASHBOARD_LIST = JSON.parse(data.value);
            if (DASHBOARD_LIST.length === 0) {
                DASHBOARD_LIST = [DEFAULT_DASHBOARD];
            }
        } else {
            DASHBOARD_LIST = [DEFAULT_DASHBOARD];
        }

        $(".dashboardList").html("");
        for (var i = 0; i < DASHBOARD_LIST.length; i++) {

            var iconStr = '';
            if(DASHBOARD_LIST[i].isimage && DASHBOARD_LIST[i].imgpath){
                iconStr = '<img src="' + DASHBOARD_LIST[i].imgpath + '" style="height: 18px;" />';
            }else {

                iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
            }


            $(".dashboardList").append('<li class="dashboardLi dashboard_' + DASHBOARD_LIST[i].id + '" onclick="loadDashboardContent(\'' + DASHBOARD_LIST[i].id + '\')">' +
                '<a href="javascript:void(0)">' +
                iconStr +
                '<span class="">' + DASHBOARD_LIST[i].name + '</span></a> ' +
                // '<span class="pull-right" onclick="openDashboardModal(3,\'' + DASHBOARD_LIST[i].id + '\')"><i class="icon-trash4"></i></span> ' +
                // '<span class="pull-right mr-1" onclick="openDashboardModal(2,\'' + DASHBOARD_LIST[i].id + '\')"><i class="icon-edit2"></i></span> ' +
                '</li>');
        }

        if(qs('id')){

            loadDashboardContent(qs('id'))
        }else {

            CURRENT_DASHBOARD_ID ? loadDashboard(CURRENT_DASHBOARD) : loadDashboard(DASHBOARD_LIST[0]);
        }
    });


}

function loadDashboardContent(id) {

    for (var i = 0; i < DASHBOARD_LIST.length; i++) {
        if (id+'' === DASHBOARD_LIST[i].id+'') {
            loadDashboard(DASHBOARD_LIST[i]);
        }
    }

}

function loadDashboard(obj) {


    $(".dashboardLi").removeClass('active');
    $(".dashboard_" + obj.id).addClass('active');

    $(".dashboardContent").css('background-color', obj.bgcolor ? obj.bgcolor : DEFAULT_DASHBOARD_BG)

    CURRENT_DASHBOARD = obj;

    CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;

    $(".dashboardName").html(CURRENT_DASHBOARD.name);

    if(CURRENT_DASHBOARD.isimage && CURRENT_DASHBOARD.imgpath){
        $(".dashboardIcon").html('<img src="' + CURRENT_DASHBOARD.imgpath + '" style="height: 28px;" />');
    }else {

        $(".dashboardIcon").html('<i class="' + CURRENT_DASHBOARD.icon + '"></i> ');
    }



    loadWidgets(CURRENT_DASHBOARD.property);

}

function loadWidgets(property) {
    if (GRID_STACK) GRID_STACK.removeAll();


    getDomainProperty(property, function (status, data) {
        if (status) {

            WIDGETS_LIST = JSON.parse(data.value);

            for (var i = 0; i < WIDGETS_LIST.length; i++) {

                var widget = WIDGETS_LIST[i];

                added_widgets_list.push(widget);


                if (!GRID_STACK) GRID_STACK = $('.grid-stack').data('gridstack');

                var id = widget['id'];

                var config = widget.config;

                var str = '';



                if(config && config.asset && config.asset.flag){
                    str = '[Asset Id: <b>'+(config.asset.assetid ? config.asset.assetid : '-')+'</b>]';
                }
                if(config && config.device && config.device.flag){
                    str = str + ' [Device Id: <b>'+(config.device.deviceid ? config.device.deviceid : '-')+'</b>]';
                }
                if(config && config.message && config.message.flag){
                    str = str +' [Message Id: <b>'+(config.message.messageid ? config.message.messageid : '-')+'</b>]';
                }
                if(config && config.record && config.record.flag){
                    str = str +' [Record Id: <b>'+(config.record.recordid ? config.record.recordid : '-')+'</b>]';
                }

                var widgetHtml = '<div><div class="grid-stack-item-content ' + id + '" data-gs-id="' + id + '">' +
                    '<h5 style="color:#666;margin-top: 20px;">' + (widget.widgetTitle ? widget.widgetTitle : widget.widgetname) + '</h5>' +
                    '<img src="' + API_BASE_PATH + '/files/public/download/' + widget.widgetimage + '" alt="" />' +
                    '<small style="display: block">version: '+widget.version+'</small>'+
                    '<a href="javascript:void(0)" onclick="widgetSettings(\'' + id + '\')" ' +
                    'style="display: block;margin-top: 10px;text-decoration: none;color:#6d6d6d" class="" title="Widget Settings">' +
                    '<i class="icon-gears"></i> Settings</a>' +
                    '<a href="javascript:void(0)" onclick="removeWidget(\'' + id + '\')" title="Remove Widget" ' +
                    'style="position:absolute;right: 3px;top: 2px;text-decoration: none;color: #6d6d6d;">' +
                    '<i class="icon-close"></i></a>' +
                    '<p><small>'+str+'</small></p>' +
                    '<a href="javascript:void(0)" class="btn btn-xs btn-warning" onclick="shareModal(\''+id+'\')"><i class="icon-share"></i> Share As Public</a>'+
                    '</div></div>';


                GRID_STACK.addWidget($(widgetHtml), widget.x, widget.y, widget.width, widget.height, false, 1, 100, 1, 100, id);
            }

        } else {
            errorMsg('No widgets added')
        }
    });

}

function addWidget(id) {

    var snippetCode = {};

    async.filter(imported_widget_list, function (data, cbk) {
        if (id === data['_id']) {
            getDomainGlobalProperty(data.code, data.domainKey, function (status, result) {
                if (status) {

                    var resultData = JSON.parse(result.data);
                    snippetCode = resultData;
                    cbk(null)
                } else {
                    cbk(null)
                }

            })
        } else {
            cbk(null)
        }
    }, function (resultData) {
        addWidgetToDashboard(id, snippetCode);
    })

}


function addWidgetToDashboard(id, code) {


    // WIDGETS_LIST.push
    var obj = {};


    for (var i = 0; i < imported_widget_list.length; i++) {
        if (id === imported_widget_list[i]['_id']) {
            obj = Object.assign({}, imported_widget_list[i]);

        }
    }

    var objId = 'w_' + new Date().getTime();
    obj.id = objId;
    obj.snippet = code;


    added_widgets_list.push(obj);


    if (!GRID_STACK) GRID_STACK = $('.grid-stack').data('gridstack');


    var id = obj.id;

    var config = JSON.parse(obj.config);

    var str = '';



    if(config.asset && config.asset.flag){
        str = '[Asset Id: <b>'+(config.asset.assetid ? config.asset.assetid : '-')+'</b>]';
    }
    if(config.device && config.device.flag){
        str = str + ' [Device Id: <b>'+(config.device.deviceid ? config.device.deviceid : '-')+'</b>]';
    }
    if(config.message && config.message.flag){
        str = str +' [Message Id: <b>'+(config.message.messageid ? config.message.messageid : '-')+'</b>]';
    }

    if(config.record && config.record.flag){
        str = str +' [Record Id: <b>'+(config.record.recordid ? config.record.recordid : '-')+'</b>]';
    }

    var widgetHtml = '<div><div class="grid-stack-item-content ' + id + '" data-gs-id="' + id + '">' +
        '<h5 style="color:#666;margin-top: 20px;">' + (obj.widgetTitle ? obj.widgetTitle : obj.widgetname) + '</h5>' +
        '<img src="' + API_BASE_PATH + '/files/public/download/' + obj.widgetimage + '" alt="" />' +
        '<small style="display: block">version: '+obj.version+'</small>'+
        '<a href="javascript:void(0)" onclick="widgetSettings(\'' + id + '\')" ' +
        'style="display: block;margin-top: 10px;text-decoration: none;color:#6d6d6d" class="" title="Widget Settings">' +
        '<i class="icon-gears"></i> Settings</a>' +
        '<a href="javascript:void(0)" onclick="removeWidget(\'' + id + '\')" title="Remove Widget" ' +
        'style="position:absolute;right: 3px;top: 2px;text-decoration: none;color: #6d6d6d;">' +
        '<i class="icon-close"></i></a>' +
        '<p><small>'+str+'</small></p>' +
        '<a href="javascript:void(0)" class="btn btn-xs btn-warning" onclick="shareModal(\''+id+'\')"><i class="icon-share"></i> Share As Public</a>'+

        '</div></div>';


   /* var widgetHtml = '<div><div class="grid-stack-item-content ' + objId + '" data-gs-id="' + objId + '">' +
        '<h5 style="color:#666;margin-top: 20px;">' + obj.widgetname + '</h5>' +
        '<img src="' + API_BASE_PATH + '/files/public/download/' + obj.widgetimage + '" alt="" />' +
        '<a href="javascript:void(0)" onclick="widgetSettings(\'' + objId + '\')" style="display: block;margin-top: 10px;text-decoration: none;color:#333" class="text-warning">' +
        '<i class="icon-cog"></i> Configure Widget</a>' +
        '<a href="javascript:void(0)" onclick="removeWidget(\'' + objId + '\')" style="display: block;margin-top: 10px;text-decoration: none;color:#333">' +
        '<i class="icon-trash4"></i> Remove Widget</a>' +
        '</div></div>';*/

    GRID_STACK.addWidget($(widgetHtml), 0, 0, 3, 2, true, 1, 100, 1, 100, objId);

}

function removeWidget(id) {

    var el = null;

    for (var i = 0; i < GRID_STACK.grid.nodes.length; i++) {
        if (id === GRID_STACK.grid.nodes[i].id) {
            el = GRID_STACK.grid.nodes[i].el;
        }
    }


    GRID_STACK.removeWidget(el, id);
}

function previewDashboard() {
    // window.open('/dashboard/' + CURRENT_DASHBOARD_ID + '/preview', "window", "height=" + $(window).height() + ", width=" + $(window).width() + ",directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no");
    window.open(BASE_PATH+'/dashboard/' + CURRENT_DASHBOARD_ID, "blank");
}

function saveDashboard() {

    console.log("current_widget_obj =>",current_widget_obj)

    WIDGETS_LIST = [];

    var nodesList = GRID_STACK.grid.nodes;

    for (var i = 0; i < nodesList.length; i++) {
        var node = nodesList[i];
        var obj = {};

        for (var j = 0; j < added_widgets_list.length; j++) {
            if (node.id === added_widgets_list[j]['id']) {
                obj = added_widgets_list[j];
            }
        }

        obj['x'] = node.x;
        obj['y'] = node.y;
        obj['width'] = node.width;
        obj['height'] = node.height;
        obj['config'] = typeof obj.config === 'string' ? JSON.parse(obj.config) : obj.config

        if (current_widget_obj && current_widget_obj.id === obj.id) {
            current_widget_obj['x'] = node.x;
            current_widget_obj['y'] = node.y;
            current_widget_obj['width'] = node.width;
            current_widget_obj['height'] = node.height;
            WIDGETS_LIST.push(current_widget_obj);
        } else {
            WIDGETS_LIST.push(obj)
        }


    }

    var data = {
        name: CURRENT_DASHBOARD.property,
        value: JSON.stringify(WIDGETS_LIST)
    };
    added_widgets_list = WIDGETS_LIST;

    upsertDomainProperty(data, function (status, data) {
        if (status) {
            successMsg('Successfully Saved');

            loadWidgets(CURRENT_DASHBOARD.property);

        } else {
            errorMsg('Error')
        }
    })

}


function addIconList() {
    $(".iconList").html('');
    for (var i = 0; i < ICONS.length; i++) {
        $(".iconList").append('<a class="custom-dropdown-item" style="" onclick="setIconClass(\'' + ICONS[i] + '\')"><i class="' + ICONS[i] + '"></i></a>')
    }
}

function setIconClass(icon) {
    clicked_dashboard_icon = icon;
    $("#dashboard_icon").html('<i class="' + icon + '"></i>');
}

function openDashboardModal(type, id) {
    id = CURRENT_DASHBOARD_ID;

    $(".imageHtml").html('');
    imageID = null;

    if (type === 1) {
        $(".dashboardAction").html('Create');

        try {
            $('#dashboard_bg').colorpicker('destroy');
            $('#dashboard_title_bg').colorpicker('destroy');
            $('#dashboard_title_text_bg').colorpicker('destroy');
        }
        catch(e){}

        $("#addDashboard form")[0].reset();

       /* $("#dashboard_bg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true,
        });

        $("#dashboard_bg").spectrum("set", DEFAULT_DASHBOARD_BG);*/

        $('#dashboard_bg').colorpicker({
            color: DEFAULT_DASHBOARD_BG,
            format: 'hex'
        });

        $('#dashboard_title_bg').colorpicker({
            color: DEFAULT_DASHBOARD_TITLE_BG,
            format: 'hex'
        });

        $('#dashboard_title_text_bg').colorpicker({
            color: '#fff',
            format: 'hex'
        });

        clicked_dashboard_icon = 'icon-dashboard';
        $("#dashboard_icon").html('<i class="icon-dashboard"></i>');
        $("#addDashboard form").attr('onsubmit', 'addDashboard()');
        $("#addDashboard").modal('show');
    } else if (type === 2) {

        $(".dashboardAction").html('Update');

        var obj = {};
        for (var i = 0; i < DASHBOARD_LIST.length; i++) {
            if (id === DASHBOARD_LIST[i].id) {
                obj = DASHBOARD_LIST[i];
            }
        }

        if(obj.isimage) {
            setImageId(obj.imgpath);
        }

        try {
            $('#dashboard_bg').colorpicker('destroy');
            $('#dashboard_title_bg').colorpicker('destroy');
            $('#dashboard_title_text_bg').colorpicker('destroy');
        }
        catch(e){}

        /*$("#dashboard_bg").spectrum({
            showPalette: true,
            showInput: true,
            showInitial: true
        });
        $("#dashboard_bg").spectrum("set", obj.bgcolor ? obj.bgcolor : DEFAULT_DASHBOARD_BG);*/

        $('#dashboard_bg').colorpicker({
            color: obj.bgcolor ? obj.bgcolor : DEFAULT_DASHBOARD_BG,
            format: 'hex'
        });

        $('#dashboard_title_bg').colorpicker({
            color: obj.titlebgcolor ? obj.titlebgcolor : DEFAULT_DASHBOARD_TITLE_BG,
            format: 'hex'
        });

        $('#dashboard_title_text_bg').colorpicker({
            color: obj.titletxtcolor ? obj.titletxtcolor : '#fff',
            format: 'hex'
        });


        $("#dashboard_name").val(obj.name);
        clicked_dashboard_icon = obj.icon;
        $("#dashboard_icon").html('<i class="' + obj.icon + '"></i>');

        $("#addDashboard form").attr('onsubmit', 'updateDashboard()');
        $("#addDashboard").modal('show');

    } else if (type === 3) {

        var obj = {};
        for (var i = 0; i < DASHBOARD_LIST.length; i++) {
            if (id === DASHBOARD_LIST[i].id) {
                obj = DASHBOARD_LIST[i];
            }
        }

        $(".dashboardDeleteName").html(obj.name)

        $("#deleteModal").modal('show');

    }
}

function addDashboard() {
    var obj = {
        name: $("#dashboard_name").val(),
        id: 'dashboard' + new Date().getTime(),
        property: 'dashboard.' + new Date().getTime(),
        icon: clicked_dashboard_icon,
        bgcolor: $("#dashboard_bg").colorpicker('getValue'),
        titlebgcolor: $("#dashboard_title_bg").colorpicker('getValue'),
        titletxtcolor: $("#dashboard_title_text_bg").colorpicker('getValue'),
        isimage : true,
        imgpath : imageID
    }

    DASHBOARD_LIST.push(obj);

    var data = {
        name: DASHBOARD_LIST_PROPERTY,
        value: JSON.stringify(DASHBOARD_LIST)
    };

    upsertDomainProperty(data, function (status, data) {
        if (status) {
            successMsg('Dashboard added successfully');

            $(".dashboardList").append('<li class="dashboardLi dashboard_' + obj.id + '" onclick="loadDashboardContent(\'' + obj.id + '\')">' +
                '<a href="javascript:void(0)">' +
                '<img src="'+obj.imgpath+'" style="height: 28px;" /> ' +
                '<span class="">' + obj.name + '</span></a> ' +
                '</li>');

            loadDashboardContent(obj.id);
            $("#addDashboard").modal('hide');

        } else {
            errorMsg('Error in adding new dashboard')
        }
    })
}

function updateDashboard() {
    var obj = {};
    for (var i = 0; i < DASHBOARD_LIST.length; i++) {
        if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
            obj = DASHBOARD_LIST[i];
        }
    }


    var tempObj = {
        name: $("#dashboard_name").val(),
        id: obj.id,
        property: obj.property,
        icon: clicked_dashboard_icon,
        bgcolor: $("#dashboard_bg").colorpicker('getValue'),
        titlebgcolor: $("#dashboard_title_bg").colorpicker('getValue'),
        titletxtcolor: $("#dashboard_title_text_bg").colorpicker('getValue'),
        isimage : imageID ? true : false,
        imgpath : imageID
    }


    for (var i = 0; i < DASHBOARD_LIST.length; i++) {

        if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
            DASHBOARD_LIST[i] = tempObj;
        }
    }


    var data = {
        name: DASHBOARD_LIST_PROPERTY,
        value: JSON.stringify(DASHBOARD_LIST)
    };

    upsertDomainProperty(data, function (status, data) {
        if (status) {
            successMsg('Dashboard updated successfully');
            // loadDashboardContent(CURRENT_DASHBOARD_ID);
            // loadDashboardlist();

            getDomainProperty(DASHBOARD_LIST_PROPERTY, function (status, data) {
                if (status) {
                    DASHBOARD_LIST = JSON.parse(data.value);
                    if (DASHBOARD_LIST.length === 0) {
                        DASHBOARD_LIST = [DEFAULT_DASHBOARD];
                    }
                } else {
                    DASHBOARD_LIST = [DEFAULT_DASHBOARD];
                }

                $(".dashboardList").html("");
                for (var i = 0; i < DASHBOARD_LIST.length; i++) {

                    var iconStr = '';

                    if(DASHBOARD_LIST[i].isimage){
                        iconStr = '<img src="' + DASHBOARD_LIST[i].imgpath + '" style="height: 28px;" />';
                    }else {

                        iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
                    }

                    $(".dashboardList").append('<li class="dashboardLi dashboard_' + DASHBOARD_LIST[i].id + '" onclick="loadDashboardContent(\'' + DASHBOARD_LIST[i].id + '\')">' +
                        '<a href="javascript:void(0)">' +
                        iconStr +
                        '<span class="">' + DASHBOARD_LIST[i].name + '</span></a> ' +
                        // '<span class="pull-right" onclick="openDashboardModal(3,\'' + DASHBOARD_LIST[i].id + '\')"><i class="icon-trash4"></i></span> ' +
                        // '<span class="pull-right mr-1" onclick="openDashboardModal(2,\'' + DASHBOARD_LIST[i].id + '\')"><i class="icon-edit2"></i></span> ' +
                        '</li>');
                }

                $(".dashboardLi").removeClass('active');
                $(".dashboard_" + tempObj.id).addClass('active');

                $(".dashboardContent").css('background-color', tempObj.bgcolor ? tempObj.bgcolor : DEFAULT_DASHBOARD_BG)

                $(".dashboardName").html(tempObj.name);
                // $(".dashboardIcon").html('<i class="' + tempObj.icon + '"></i>');

                if(tempObj.isimage){
                    $(".dashboardIcon").html('<img src="' + tempObj.imgpath + '" style="height: 28px;" />');
                }else {

                    $(".dashboardIcon").html('<i class="' + tempObj.icon + '"></i> ');
                }
            });

            $("#addDashboard").modal('hide');

        } else {
            errorMsg('Error in updating dashboard')
        }
    })
}


function deleteDashboard() {

    var temp_list = [];

    for (var i = 0; i < DASHBOARD_LIST.length; i++) {

        if (CURRENT_DASHBOARD_ID !== DASHBOARD_LIST[i].id) {
            temp_list.push(DASHBOARD_LIST[i]);
        }
    }


    DASHBOARD_LIST = temp_list;

    var data = {
        name: DASHBOARD_LIST_PROPERTY,
        value: JSON.stringify(DASHBOARD_LIST)
    };

    deleteDomainProperty(CURRENT_DASHBOARD_ID, function (status, result) {
        if (status) {
            upsertDomainProperty(data, function (status, data) {
                if (status) {
                    successMsg('Dashboard deleted successfully');
                    CURRENT_DASHBOARD_ID = null;
                    loadDashboardlist();
                    $("#deleteModal").modal('hide');

                } else {
                    errorMsg('Error in deleting new dashboard')
                }
            })
        } else {
            errorMsg('Error in deleting new dashboard')
        }

    })


}

function loadImportedWidgets() {


    var searchText = $.trim($("#searchText").val());

    var searchJson = {
        "multi_match": {
            "query": '*' + searchText + '*',
            "type": "phrase_prefix",
            "fields": ['_all']
        }
    };

    var clientDomainKey = {
        match: {clientDomainKey: DOMAIN_KEY}
    };

    var queryParams = {
        "query": {
            "bool": {
                "must": [clientDomainKey]
            }
        },
        "size": 25,
        "sort": [{"createdtime": {"order": "desc"}}]
    };

    if(searchText !== ''){
        queryParams['query']['bool']['must'] = [clientDomainKey, searchJson]
    }


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    searchByQuery('', 'WIDGET_IMPORTED', searchQuery, function (status, data) {

        $(".widgetBody").html('')
        if (status) {

            $(".widgetCount").html(searchQueryFormatter(data)['data'].recordsFiltered)

            var result = searchQueryFormatterNew(data)['data']['data'];
            $(".widgetBody").html('');

            imported_widget_list = result;

            imported_widget_group = _.indexBy(imported_widget_list, 'widgetid')

            widget_ids = _.pluck(imported_widget_list, 'widgetid');

            if(result.length === 0){
                $(".widgetBody").html('<p class="text-center">No Widgets Found!</p>')
            } else{
                for (var i = 0; i < result.length; i++) {
                    renderImportedWidget(result[i]);
                }
            }

            loadWidgetsVersion();



        } else {
            $(".widgetCount").html(0)

            errorMsg('No Widgets Found')
        }
    })
}


function renderImportedWidget(obj) {

    var acStr = `<a href="javascript:void(0)" onclick="deleteImportWidgetModal('` + obj.widgetid + `')" class="pull-right btn btn-icon btn-default btn-xs"
    title="Delete the widget from domain"><i class="icon-close"></i></a>`;

    if(obj.domainKey === DOMAIN_KEY){
        acStr = '';
    }

    var str = `<div class="widgetsBox mb-2" style="position: relative">
     <label>` + obj.widgetname + ` `+acStr+`</label>
      
      <img src="` + API_BASE_PATH + `/files/public/download/` + obj.widgetimage + `" alt="" />
      <small style="display: block">` + obj.category + `</small>
      <small style="display: block">` + obj.version + `</small>
       <button class="btn btn-default btn-outline btn-xs btn-block" onclick="addWidget('` + obj._id + `')"><i class="icon-plus"></i> Add</button>
       <p class="updateTag iw_`+obj.widgetid+`"></p>
   </div>
    `;
    $(".widgetBody").append(str)
}

function deleteImportWidgetModal(id) {

    delete_widget_id = id;
    var obj = {};
    for (var i = 0; i < imported_widget_list.length; i++) {
        if (id === imported_widget_list[i]['widgetid']) {
            obj = Object.assign({}, imported_widget_list[i]);

        }
    }

        $(".widgetImportName").html(obj.widgetname);
        $("#deleteWidgetModal").modal('show');


}


function deleteImportedWidget() {
    deleteImportWidget(delete_widget_id, function (status, data) {
        if (status) {
            loadImportedWidgets();
            $("#deleteWidgetModal").modal('hide');
            successMsg('Widgets successfully removed from the domain')
        } else {
            errorMsg('Error in widget removal')
        }
    })
}


function searchQueryFormatter(data) {

    var resultObj = {
        total: 0,
        data: {},
        aggregations: {}
    }

    if (data.httpCode === 200) {

        var arrayData = JSON.parse(data.result);

        var totalRecords = arrayData.hits.total ? arrayData.hits.total.value : 0;
        var records = arrayData.hits.hits;

        var aggregations = arrayData.aggregations ? arrayData.aggregations : {};


        for (var i = 0; i < records.length; i++) {
            records[i]['_source']['_id'] = records[i]['_id'];
        }

        resultObj = {
            "total": totalRecords,
            "data": {
                "recordsTotal": totalRecords,
                "recordsFiltered": totalRecords,
                "data": _.pluck(records, '_source')
            },
            aggregations: aggregations
            // data : _.pluck(records, '_source')
        }


        return resultObj;

    } else {

        return resultObj;
    }

}

function widgetSettings(id) {
    current_widget_id = id;
    current_widget_obj = {};

    for (var i = 0; i < added_widgets_list.length; i++) {
        if (id === added_widgets_list[i]['id']) {
            current_widget_obj = Object.assign({}, added_widgets_list[i]);

        }
    }

    if (typeof current_widget_obj.config === 'string') {
        current_widget_obj.config = JSON.parse(current_widget_obj.config);
    }

    if (current_widget_obj.snippet && current_widget_obj.snippet.code) {
        current_widget_obj.snippet = current_widget_obj.snippet;
    } else {
        current_widget_obj.snippet = {
            html: '',
            js: '',
            css: '',
            code: '',
            defaultjs: jsLink,
            defaultcss: cssLink,
            jsfiles: [],
            cssfiles: [],
            inbuildcss: true,
            inbuildjs: true
        };
    }

    $('#widgetTitle').val(current_widget_obj.widgetTitle ? current_widget_obj.widgetTitle : '')
    openEditorModal();
}


function openEditorModal() {
    $(".idBox").hide();
    $(".messageFields").html('');
    $(".recordFields").html('');
    $(".widgetTitle").html('Untitled Widget')
    $("#editorModal .modal-content").css('width', $(window).width());
    $("#editorModal").modal({
        backdrop: 'static',
        keyboard: false
    });

    $("#livePanel").css('height',(editorHeight+35)+'px')
    $("#livePanel").html('<h4 style="text-align: center;margin-top: 25%"><i class="fa fa-spinner fa-spin"></i> Loading...</h4>');

    var config = current_widget_obj.config;
    if (config.asset && config.asset.flag) {
        loadAssetList();
        $(".assetBox").show();
    }
    if (config.device && config.device.flag) {
        loadDeviceList();
        $(".deviceBox").show();
    }
    if (config.message && config.message.flag) {
        loadMessageList();
        $(".messageBox").show();
    }

    if (config.record && config.record.flag) {
        loadRecordList();
        $(".recordBox").show();
    }

    var code = Object.assign({}, current_widget_obj.snippet);


    loadHtmlEditor(code.html);
    loadJsEditor(code.js);
    loadCssEditor(code.css);

    try{
        $('#widget_bg').colorpicker('destroy');
        $('#widget_text').colorpicker('destroy');
    }catch(e){}

    $('#widget_bg').colorpicker({
        color: current_widget_obj.widgetBgColor ? current_widget_obj.widgetBgColor : DEFAULT_THEME.panelHeaderBg,
        format: 'hex'
    });
    $('#widget_text').colorpicker({
        color: current_widget_obj.widgetTextColor ? current_widget_obj.widgetTextColor : "#fff",
        format: 'hex'
    });

    if(current_widget_obj.widgetTitle) {
        $(".widgetLiveTitle").html(current_widget_obj.widgetTitle)
    }

    $("#jsResource").val(code.jsfiles.join("\n"))
    $("#cssResource").val(code.cssfiles.join("\n"))


    $(".defaultJs").html(code.defaultjs.join("\n"))
    $(".defaultCss").html(code.defaultcss.join("\n"))

    $('input:radio[name="inbuildcss"][value="' + code.inbuildcss + '"]').prop('checked', true);
    $('input:radio[name="inbuildjs"][value="' + code.inbuildjs + '"]').prop('checked', true);

    setTimeout(function () {
        codeLivePreview();
    },2000)


}


function loadAssetList() {
    $("#assetList").html("");
    getAssetList(1000, function (status, data) {
        if (status && data.length > 0) {
            asset_list = data;
            $("#assetList").html('<option value=""></option>');
            for (var i = 0; i < asset_list.length; i++) {
                $("#assetList").append('<option value="' + asset_list[i].id + '">' + asset_list[i].id + ' | ' + asset_list[i].name + '</option>');
            }

            try{
                $("#assetList").select2('destroy');
            }catch(e){}

            $("#assetList").select2({
                dropdownParent: $("#editorModal")
            });

            $("#assetList").val(current_widget_obj.config.asset.assetid ? current_widget_obj.config.asset.assetid : '').trigger('change');

        } else {
            asset_list = [];
        }
    })
}

function loadMessageList() {
    $("#messageList").html("");
    listMessageSpec(1000, null, null, function (status, data) {
        if (status && data.length > 0) {
            message_list = data;
            $("#messageList").html('<option value=""></option>');
            for (var i = 0; i < message_list.length; i++) {
                $("#messageList").append('<option value="' + message_list[i].id + '">' + message_list[i].id + ' | ' + message_list[i].name + '</option>');
            }
            try{
                $("#messageList").select2('destroy');
            }catch(e){}

            $("#messageList").select2({
                dropdownParent: $("#editorModal")
            });

            $("#messageList").val(current_widget_obj.config.message.messageid ? current_widget_obj.config.message.messageid : '').trigger('change');
            loadMsgFields();
        } else {
            message_list = [];
        }

    })
}



function loadRecordList() {
    $("#recordList").html("");
    listRecordSpec(1000,'','', function (status, data) {
        if (status && data.length > 0) {
            record_list = data;
            $("#recordList").html('<option value=""></option>');
            for (var i = 0; i < record_list.length; i++) {
                $("#recordList").append('<option value="' + record_list[i].id + '">' + record_list[i].id + ' | ' + record_list[i].name + '</option>');
            }

            try{
                $("#recordList").select2('destroy');
            }catch(e){}

            $("#recordList").select2({
                dropdownParent: $("#editorModal")
            });

            $("#recordList").val(current_widget_obj.config.record.recordid ? current_widget_obj.config.record.recordid : '').trigger('change');


        } else {
            record_list = [];
        }
    })
}

function loadDeviceList(searchText) {

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        "query": {
            "bool": {
                "must": []
            }
        },
        "size": 25,
        "sort": [{"reportedStamp": {"order": "desc"}}]
    };

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


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    $(".deviceListUl").html('');

    searchDevice(searchQuery, function (status, res) {
        if (status) {

            var resultData = searchQueryFormatterNew(res).data;
            device_list = resultData['data'];

            for (var i = 0; i < device_list.length; i++) {
                $(".deviceListUl").append('<li class="deviceListLi" onclick="setDeviceId(\'' + device_list[i].id + '\')">' +
                    (device_list[i].name ? device_list[i].name : device_list[i].id) + ' | ' + device_list[i].modelId + ' | <b>' +
                    device_list[i].version +
                    '</b></li>');
            }
            if(!searchText) {
                $("#deviceID").val(current_widget_obj.config.device.deviceid ? current_widget_obj.config.device.deviceid : '');
            }

        } else {
            device_list = []
        }


    })


}

function setDeviceId(id) {
    $("#deviceID").val(id)
}

function loadImageList(searchText) {

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var ispublicJson = {"match": {"isPublic": true}};
    var isprivateJson = {"match": {"isPublic": false}};




    var queryParams = {
        "query": {
            "bool": {
                "must": []
            }
        },
        "size": 75
    };

    if (searchText) {
        var searchJson = {
            "multi_match": {
                "query": '*' + searchText + '*',
                "type": "phrase_prefix",
                "fields": ['_all']
            }
        };
        queryParams.query['bool']['must'] = [ispublicJson,searchJson];

    } else {
        queryParams.query['bool']['must'] = [ispublicJson];
    }

    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    $(".imageListUl").html('');

    searchByQuery('', 'FILE_PUBLIC', searchQuery, function (status, res) {
        if (status) {

            var resultData = searchQueryFormatterNew(res).data;
            image_list = resultData['data'];

            for (var i = 0; i < image_list.length; i++) {

                var srcPath = '';
                var fileType = '';

                if (image_list[i].isPublic) {
                    srcPath = API_BASE_PATH + '/files/public/download/' + image_list[i].id;
                    fileType = '<span class="label label-success"><i class="icon-unlock"></i> Public</span>'
                } else {
                    srcPath = API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + image_list[i].id;
                    fileType = '<span class="label label-danger"><i class="icon-lock2"></i> Private</span>'
                }

                $(".imageListUl").append('<li class="imageListLi" onclick="setImageId(\'' + srcPath + '\')">' +
                    '<img src="'+srcPath+'" />'+
                    '<small>'+fileType+'</small></li>');
            }


        } else {
            image_list = []
        }


    })


}

function setImageId(id) {
    imageID = id;
    $(".imageHtml").html('<img src="'+id+'" style="width: 48px;height:48px;" />')

}

function loadHtmlEditor(code) {

    if (htmlEditor) {
        htmlEditor.destroy();
    }

    $("#htmlEditor").html("");

    htmlEditor = ace.edit("htmlEditor");
    htmlEditor.setTheme("ace/theme/monokai");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.getSession().setUseWrapMode(true);
    htmlEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    htmlEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });

    langTools.setCompleters([langTools.snippetCompleter])

    htmlEditor.setValue(code);
    htmlEditor.clearSelection();
    htmlEditor.focus();
    var session = htmlEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    htmlEditor.gotoLine(count, session.getLine(count - 1).length);


    $('#htmlEditor').height(editorHeight + 'px');

    htmlEditor.resize();

    htmlEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {

            // console.log(htmlEditor.getSession().getValue())

            var consoleText = htmlEditor.getSession().getValue();
            codeLivePreview();


        }
    });
}

function loadJsEditor(code) {

    if (jsEditor) {
        jsEditor.destroy();
    }

    $("#jsEditor").html("");

    jsEditor = ace.edit("jsEditor");
    jsEditor.setTheme("ace/theme/monokai");
    jsEditor.session.setMode("ace/mode/javascript");
    jsEditor.getSession().setUseWrapMode(true);
    jsEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    jsEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });

    langTools.setCompleters([langTools.snippetCompleter])

    if (code === '') {
        code =
            '/********************************************\n' +
            ' Pre Defined variables to access in the widget \n' +
            '********************************************/\n\n' +
            '// API_BASE_PATH - to get boodskap api base path\n' +
            '// DOMAIN_KEY - to get domain key\n' +
            '// API_KEY - to get api key\n' +
            '// API_TOKEN - to get api token\n' +
            '// MESSAGE_ID - to get message id\n' +
            '// DEVICE_ID - to get device id\n' +
            '// ASSET_ID - to get asset id\n' +
            '// RECORD_ID - to get record id\n' +
            '// WIDGET_ID - to get widget id\n' +
            '// USER_ID - to get user id (In public share this will be empty)\n\n' +
            '$(document).ready(function () {\n\n});'
    }

    jsEditor.setValue(code);
    jsEditor.clearSelection();
    jsEditor.focus();
    var session = jsEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    jsEditor.gotoLine(count, session.getLine(count - 1).length);


    $('#jsEditor').height(editorHeight + 'px');

    jsEditor.resize();

    jsEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {

            // console.log(jsEditor.getSession().getValue())

            var consoleText = jsEditor.getSession().getValue();

            codeLivePreview();

        }
    });
}

function loadCssEditor(code) {

    if (cssEditor) {
        cssEditor.destroy();
    }

    $("#cssEditor").html("");

    cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");
    cssEditor.getSession().setUseWrapMode(true);
    cssEditor.setShowPrintMargin(false);
    var langTools = ace.require("ace/ext/language_tools");

    cssEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });

    langTools.setCompleters([langTools.snippetCompleter])

    cssEditor.setValue(code);
    cssEditor.clearSelection();
    cssEditor.focus();
    var session = cssEditor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    cssEditor.gotoLine(count, session.getLine(count - 1).length);


    $('#cssEditor').height(editorHeight + 'px');

    cssEditor.resize();

    cssEditor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function (env, args, request) {

            // console.log(cssEditor.getSession().getValue())

            var consoleText = cssEditor.getSession().getValue();

            codeLivePreview();

        }
    });
}


function codeLivePreview() {


    $(".widgetLiveTitle").html($("#widgetTitle").val() ? $("#widgetTitle").val() : 'Untiled Widget');

    $(".widgetLiveHeader").css('background-color',$("#widget_bg").colorpicker('getValue'))
    $(".widgetLiveTitle").css('color',$("#widget_text").colorpicker('getValue'))
    // $("#widget_bg").colorpicker('getValue')
    // $("#widget_text").colorpicker('getValue')

    $("#livePanel").html('<iframe id="previewCode" style="width: 100%;height: 100%;border:0px;"></iframe>');


    // $("#livePanel").html('<iframe id="previewCode" style="width: 100%;height: ' + (editorHeight+25) + 'px;border:0px;"></iframe>');

    var iframe = document.getElementById('previewCode');
    var iframedocument = iframe['contentWindow'].document;
    var head = iframedocument.getElementsByTagName("head")[0];

    var meta = document.createElement('meta');
    meta.httpEquiv = "X-UA-Compatible";
    meta.content = "IE=edge";
    head.appendChild(meta);

    var meta=document.createElement('meta');
    meta.name='viewport';
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.setAttribute('charset',"utf-8");
    head.appendChild(meta);


    var body = $("#previewCode").contents().find("body");

    var jsResource = $("#jsResource").val().split('\n');
    var cssResource = $("#cssResource").val().split('\n');

    var htmlStr = '';

    var inbuildcss = $("input[name='inbuildcss']:checked").val();
    var inbuildjs = $("input[name='inbuildjs']:checked").val();

    inbuildcss = inbuildcss === 'true' ? true : false;
    inbuildjs = inbuildjs === 'true' ? true : false;

    // console.log("inbuildcss =>", inbuildcss)
    // console.log("inbuildjs =>", inbuildjs)

    if(inbuildcss || inbuildjs){
        $(".inbuildContent").css('display','block');
    }else{
        $(".inbuildContent").css('display','none');
    }

    var resultData =
        "var API_BASE_PATH='" + API_BASE_PATH + "';\n" +
        "var DOMAIN_KEY='" + USER_OBJ.domainKey + "';\n" +
        "var API_KEY='" + USER_OBJ.apiKey + "';\n" +
        "var API_TOKEN='" + USER_OBJ.token + "';\n" +
        "var USER_ID='" + USER_OBJ.user.email + "';\n" +
        "var DEVICE_ID='" + ($("#deviceID").val() ? $("#deviceID").val() : '') + "';\n" +
        "var RECORD_ID='" + ($("#recordList").val() ? $("#recordList").val() : '') + "';\n" +
        "var MESSAGE_ID='" + ($("#messageList").val() ? $("#messageList").val() : '') + "';\n" +
        "var ASSET_ID='" + ($("#assetList").val() ? $("#assetList").val() : '') + "';\n"+
        "var MQTT_CLIENT_ID='" + MQTT_CLIENT_ID + "';\n" +
        "var WIDGET_ID='" + current_widget_obj.id + "';\n" +
        "var MQTT_CONFIG='" + JSON.stringify(MQTT_CONFIG) + "';\n";


    var code = current_widget_obj.snippet;


    var cssCode = cssEditor.getSession().getValue();
    var htmlCode = htmlEditor.getSession().getValue();
    var jsCode = jsEditor.getSession().getValue();

    body.html('<style>' + cssCode + '</style><div>' + htmlCode + '</div><script>' + resultData + '</script>');

    var mqtt_file = 'js/boodskap.ws.js';
    var mqtt_adapter = 'resources/js/bdskp-live-adapter.js';

    jsResource.push(mqtt_file);
    jsResource.push(mqtt_adapter);

    async.mapSeries(code.defaultcss, function (file, callback) {

        // console.log('Enter FILE =>',file)

        if (inbuildcss) {
            var cssFile = iframedocument.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.setAttribute('href', CDN_PATH + '/css/' + file);
            head.appendChild(cssFile);

            if (cssFile.readyState) {  //IE
                cssFile.onreadystatechange = function () {
                    if (s.readyState == "loaded" ||
                        s.readyState == "complete") {
                        s.onreadystatechange = null;
                        callback(null, null);
                    } else {
                        callback(null, null);
                    }
                };
            } else {  //Others
                cssFile.onload = function () {
                    // console.log('FILE =>',file)
                    callback(null, null);
                };
            }
        } else {
            callback(null, null);
        }


    }, function (err, result) {

        async.mapSeries(cssResource, function (file, callback1) {
            // console.log('Enter FILE =>',file)
            if ($.trim(file)) {
                var cssFile = iframedocument.createElement('link');
                cssFile.setAttribute('type', 'text/css');
                cssFile.setAttribute('rel', 'stylesheet');
                cssFile.setAttribute('href', file);
                head.appendChild(cssFile);
                if (cssFile.readyState) {  //IE
                    cssFile.onreadystatechange = function () {
                        if (s.readyState == "loaded" ||
                            s.readyState == "complete") {
                            s.onreadystatechange = null;
                            callback1(null, null);
                        } else {
                            callback1(null, null);
                        }
                    };
                } else {  //Others
                    cssFile.onload = function () {

                        callback1(null, null);
                    };
                }
            } else {
                callback1(null, null);
            }

        }, function (err, result) {

            async.mapSeries(code.defaultjs, function (file, callback2) {
                // console.log('Enter FILE =>',file)

                if (inbuildjs) {
                    var jsFile = iframedocument.createElement('script');
                    jsFile.setAttribute('type', 'text/javascript');
                    jsFile.setAttribute('src', CDN_PATH + '/js/' + file);
                    head.appendChild(jsFile);

                    if (jsFile.readyState) {  //IE
                        jsFile.onreadystatechange = function () {
                            if (s.readyState == "loaded" ||
                                s.readyState == "complete") {
                                s.onreadystatechange = null;
                                callback2(null, null);
                            } else {
                                callback2(null, null);
                            }
                        };
                    } else {  //Others
                        jsFile.onload = function () {
                            // console.log('FILE =>',file)
                            callback2(null, null);
                        };
                    }
                } else {
                    callback2(null, null);
                }
            }, function (err, result) {


                async.mapSeries(jsResource, function (file, callback3) {
                    // console.log('Enter FILE =>',file)
                    if (file) {
                        var jsFile = iframedocument.createElement('script');
                        jsFile.setAttribute('type', 'text/javascript');
                        jsFile.setAttribute('src', file);
                        head.appendChild(jsFile);

                        if (jsFile.readyState) {  //IE
                            jsFile.onreadystatechange = function () {
                                if (s.readyState == "loaded" ||
                                    s.readyState == "complete") {
                                    s.onreadystatechange = null;
                                    callback3();
                                } else {
                                    callback3();
                                }
                            };
                        } else {  //Others
                            jsFile.onload = function () {
                                callback3();
                            };
                        }

                    }
                    else {
                        callback3(null, null);
                    }
                }, function (err, result) {


                    body.append('<script>' + resultData + '</script><script>' + jsCode + '</script>');

                    // saveCode();

                });

            });

        });
    });


}

function saveCode() {
    var iframe = document.getElementById('previewCode');
    var finalHtml = $(iframe).contents().find("html").html();

    var cssCode = cssEditor.getSession().getValue();
    var htmlCode = htmlEditor.getSession().getValue();
    var jsCode = jsEditor.getSession().getValue();

    var config = Object.assign({}, current_widget_obj.config);
    var tempObj = Object.assign({}, current_widget_obj);


    var code = current_widget_obj.snippet;

    var snippet = {
        html: htmlCode,
        js: jsCode,
        css: cssCode,
        code: finalHtml,
        defaultjs: code.defaultjs,
        defaultcss: code.defaultcss,
        jsfiles: $("#jsResource").val().split('\n'),
        cssfiles: $("#cssResource").val().split('\n'),
        inbuildcss: $("input[name='inbuildcss']:checked").val(),
        inbuildjs: $("input[name='inbuildjs']:checked").val()
    };




    /*if ($.trim($('#widgetTitle').val()) === '') {
        errorMsg('Please enter the widget title')
        return false;
    }*/
    if (config.asset && config.asset.flag) {
        config.asset['assetid'] = $("#assetList").val();
        if ($("#assetList").val() === '') {
            errorMsg('Please choose Asset ID')
            return false;
        }
    }
    if (config.device && config.device.flag) {
        config.device['deviceid'] = $("#deviceID").val();
        if ($("#deviecID").val() === '') {
            errorMsg('Please choose Device ID')
            return false;
        }
    }
    if (config.message && config.message.flag) {
        config.message['messageid'] = $("#messageList").val();
        if ($("#messageList").val() === '') {
            errorMsg('Please choose Message ID')
            return false;
        }
    }
    if (config.record && config.record.flag) {
        config.record['recordid'] = $("#recordList").val();
        if ($("#recordList").val() === '') {
            errorMsg('Please choose Record ID')
            return false;
        }
    }

    tempObj['snippet'] = snippet;
    tempObj['config'] = config;

    tempObj['widgetTitle'] = $.trim($('#widgetTitle').val());
    tempObj['widgetBgColor'] =  $("#widget_bg").colorpicker('getValue');
    tempObj['widgetTextColor'] = $("#widget_text").colorpicker('getValue');

    current_widget_obj = tempObj;


    saveDashboard();
    $("#editorModal").modal('hide');
}


function loadMsgFields() {
    var messageId = $('#messageList').val();

    for(var i=0;i<message_list.length;i++){
        if(Number(messageId) === message_list[i].id){
            var obj = [];
            for(var j=0;j<message_list[i].fields.length>0;j++){
                obj.push({fieldname:message_list[i].fields[j].name, type:message_list[i].fields[j].dataType})
            }
            $(".messageFields").html(JSON.stringify(obj))
        }
    }
}


function loadRecFields() {
    var recId = $('#recordList').val();

    for(var i=0;i<record_list.length;i++){
        if(Number(recId) === record_list[i].id){
            var obj = [];
            for(var j=0;j<record_list[i].fields.length>0;j++){
                obj.push({fieldname:record_list[i].fields[j].name, type:record_list[i].fields[j].dataType})
            }
            $(".recordFields").html(JSON.stringify(obj))
        }
    }
}


function loadWidgetsVersion() {


    var queryParams = {
        "query" : {
            "constant_score" : {
                "filter" : {
                    "terms" : {
                        "widgetid" : widget_ids
                    }
                }
            }
        },
        "_source": ["version", "widgetid","updatedtime"],
        "size" : 1000
    };


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    searchByQuery('', 'WIDGET_PUBLISHED', searchQuery, function (status, data) {

        if (status) {

            var result = searchQueryFormatterNew(data)['data']['data'];

            var resData = _.indexBy(result, 'widgetid');

            for(var i=0;i<widget_ids.length;i++){
                var resObj = resData[widget_ids[i]];
                if(resObj){
                    if(imported_widget_group[widget_ids[i]].version === resObj.version){
                        $(".iw_"+widget_ids[i]).remove();
                    }else{
                        $(".iw_"+widget_ids[i]).html(resObj.version +' New Version Available! <br>' +
                            '<a href="javascript:void(0)" style="color:#333;" onclick="updateDomainWidget(\''+resObj._id+'\')">' +
                            '<i class="icon-refresh2"></i> Click Here to Update Now</a>' +
                            '<span style="position: absolute;top: -3px;left: -3px;" class="btn btn-sm btn-icon" title="Latest Version Available">' +
                            '<i class="fa fa-bell"></i></span>');
                    }
                }else{
                    $(".iw_"+widget_ids[i]).remove();
                }
            }


        }
    })
}




function updateDomainWidget(id) {
    importWidget(id, function (status, data) {
        if (status) {
            loadImportedWidgets();
            successMsg('Widget Updated Successfully')
        } else {
            errorMsg('Error in updating widget')
        }
    });
}

function shareModal(id) {

    CURRENT_WIDGET_OBJ = {};

    var flag = false;


    for (var i = 0; i < WIDGETS_LIST.length; i++) {
        if(id === WIDGETS_LIST[i].id){
            CURRENT_WIDGET_OBJ = WIDGETS_LIST[i];
            flag = true;
        }

    }

    if(flag) {

        $(".shareLink").html("");

        if (CURRENT_WIDGET_OBJ.tokenId) {
            var url = WEB_BASE_PATH + '/public/widget/' + DOMAIN_KEY + '/' + CURRENT_WIDGET_OBJ.tokenId;
            $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                '<small style="font-size:11px;">This url can be embed in iframe.</small>');
            $("#enableBtn").prop("checked", true);
        } else {
            $("#disableBtn").prop("checked", true);
        }

        $("#shareModal").modal('show')
    }else{
        errorMsg('Please configure the widget then Share!')
    }
}

function shareWidget() {

    if ($("input[name='shareBtn']:checked").val() === 'enable') {

        if (CURRENT_WIDGET_OBJ.tokenId) {
            var url = WEB_BASE_PATH + '/public/widget/' + DOMAIN_KEY + '/' + CURRENT_WIDGET_OBJ.tokenId;
            $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                '<small style="font-size:11px;">This url can be embed in iframe.</small>');

        } else {
            var data = {
                data: JSON.stringify(CURRENT_WIDGET_OBJ)
            };

            insertGlobalProperty(data, function (status, data) {
                if (status) {
                    CURRENT_WIDGET_OBJ['tokenId'] = data.id;
                    var url = WEB_BASE_PATH + '/public/widget/' + DOMAIN_KEY + '/' + CURRENT_WIDGET_OBJ.tokenId;
                    $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                        '<small style="font-size:11px;">This url can be embed in iframe.</small>');

                    for (var i = 0; i < added_widgets_list.length; i++) {
                        if(CURRENT_WIDGET_OBJ.id === added_widgets_list[i].id){
                            added_widgets_list[i] = CURRENT_WIDGET_OBJ;
                        }
                    }

                    saveDashboard();


                } else {
                    errorMsg('Error in share')
                }
            })
        }

    } else {
        if (CURRENT_WIDGET_OBJ.tokenId) {
            deleteGlobalProperty(CURRENT_WIDGET_OBJ.tokenId, function (status, data) {
                if (status) {
                    delete CURRENT_WIDGET_OBJ['tokenId'];
                    $(".shareLink").html('');

                    for (var i = 0; i < added_widgets_list.length; i++) {
                        if(CURRENT_WIDGET_OBJ.id === added_widgets_list[i].id){
                            added_widgets_list[i] = CURRENT_WIDGET_OBJ;
                        }
                    }
                    saveDashboard();

                } else {
                    errorMsg('Error in disabling share')
                }
            })
        }

    }
}