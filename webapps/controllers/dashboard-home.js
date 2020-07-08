var DASHBOARD_LIST = [];
var VERTICAL_LIST = [];
var user_group_list = [];
var tempObj = {};
var delete_vertical_id = null;
var shareType = null;
var sharePropName = null;
var shareTypeId = null;
var shareId = null;
var shareObj = null;

var verticalID = null;

$(document).ready(function () {

    $("body").removeClass('bg-white');
    loadDashboardlist();
    loadUsersGroup()

    if (USER_ROLE.indexOf('developer') >= 0) {
        $(".shareButton").remove();
    }

    if (USER_ROLE.indexOf('user') >= 0) {
        $(".shareButton").remove();
        $(".verticalTitle").html('Solution\'s')
    } else {

        $(".verticalTitle").html('Created & Imported Verticals')
    }

});


function loadDashboardlist() {
    $(".dashboardList").html("");
    getDomainProperty(DASHBOARD_LIST_PROPERTY, function (status, data) {
        if (status) {
            $(".noData").remove();
            $(".dashboardMenuHeader").removeClass('hide');
            DASHBOARD_LIST = JSON.parse(data.value);
            $(".dashboardCount").html(DASHBOARD_LIST.length);

            if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {
                if (DASHBOARD_LIST.length > 0) {
                    $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">Domain Dashboard\'s</li>')
                }
            }

            for (var i = 0; i < DASHBOARD_LIST.length; i++) {

                $(".dashboardList").append(renderDashMenu(DASHBOARD_LIST[i]));

                if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {


                    var iconStr = '';

                    if (DASHBOARD_LIST[i].isimage) {
                        iconStr = '<img src="' + DASHBOARD_LIST[i].imgpath + '" style="height: 18px;" />'
                    } else {
                        iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
                    }

                    $(".sidenav ul").append(' <li class="has-sub sideMain msgDefMenu"><a href="<%= basepath %>/dashboard/' + DASHBOARD_LIST[i].id + '">' +
                        iconStr +
                        '<span>' + DASHBOARD_LIST[i].name + '</span></a></li>')
                }

            }


        } else {
            DASHBOARD_LIST = [];
            $(".dashboardList").html("");
        }
        loadImportedVerticals();
    });
}

function renderDashMenu(obj) {
    var txtColor = obj.titletxtcolor ? obj.titletxtcolor : DEFAULT_THEME.subHeaderBg;

    var iconStr = '';

    if (obj.isimage) {
        iconStr = '<img src="' + obj.imgpath + '" style="height: 48px;" />'
    } else {
        iconStr = '<i class="' + obj.icon + '" style="color:' + txtColor + '"></i> ';
    }


    var str = `
        <div class="col-lg-2 col-md-3 col-sm-4 col-xs-12 d_`+obj.id+`" onclick="loadDashboard('` + obj.id + `')">
            <div class="card modules">
               ` + iconStr + `
                <p class="mt-2"><label>` + obj.name + `</label></p>
            </div>
        </div>
    `;
    return str;
}


function loadDashboard(id) {
    document.location = BASE_PATH+'/dashboard/' + id;
}


function loadImportedVerticals() {

    $(".verticalList").html("");
    var queryParams = {
        "query": {
            "bool": {
                "must": [{
                    match: {clientDomainKey: DOMAIN_KEY}
                }]
            }
        },
        "size": 100,
        sort: {
            'importedtime': {'order': 'desc'}
        }

    };


    var searchQuery = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    searchByQuery('', 'VERTICAL_IMPORTED', searchQuery, function (status, data) {
        if (status) {

            var result = searchQueryFormatterNew(data)['data'];
            $(".verticalsCount").html(result.recordsTotal);
            if (result.recordsTotal === 0) {
                VERTICAL_LIST = [];
                $(".noData").removeClass('hide');
            } else {
                $(".noData").remove();
                VERTICAL_LIST = result.data;
                getVerticalVersion();
            }

            async.filter(VERTICAL_LIST, function (obj, cbk) {

                getVerticalPermission(obj.verticalid, function (vdata) {

                    var sFlag = true;

                    for (var i = 0; i < USER_ROLE.length; i++) {
                        if (USER_ROLE[i] === 'admin' || USER_ROLE[i] === 'domainadmin') {
                            sFlag = false;
                        }
                    }

                    if (sFlag) {

                        if (vdata.length > 0) {



                            console.log('vertical name TRUE=>',obj.verticalname)

                            var vflag = false;
                            var liStr = '';
                            var liStrFalse = '';

                            var dashboards = [];
                            async.filter(vdata, function (vd, vcbk) {

                                if (vd.groupid === 'ALL') {
                                    var iconStr = '';

                                    if (vd.isimage) {
                                        iconStr = '<img src="' + vd.imgpath + '" style="height: 18px;" />'
                                    } else {
                                        iconStr = '<i class="' + vd.icon + '"></i> ';
                                    }

                                    vflag = true;
                                    var dashStatus = checkDashboadExist(vd, obj);
                                    if(dashStatus){
                                        dashboards.push(vd);
                                        liStr = liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                            '<a href="<%= basepath %>/dashboard/' + vd.id + '?vertical=' + obj.verticalid + '">' + iconStr +
                                            '<span> ' + vd.name + '</span></a></li>';

                                    }



                                    vcbk(null, null);
                                } else {

                                    checkUserExist(vd.groupid, USER_OBJ.user.email, function (status) {

                                        var iconStr = '';

                                        if (vd.isimage) {
                                            iconStr = '<img src="' + vd.imgpath + '" style="height: 18px;" />'
                                        } else {
                                            iconStr = '<i class="' + vd.icon + '"></i> ';
                                        }
                                        console.log("groupid =>",vd.groupid)
                                        console.log("email =>",USER_OBJ.user.email)
                                        console.log("status =>",status)

                                        if (status) {
                                            var dashStatus = checkDashboadExist(vd, obj);
                                            if(dashStatus){
                                                dashboards.push(vd);
                                                vflag = true;

                                                liStr = liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                                    '<a href="<%= basepath %>/dashboard/' + vd.id + '?vertical=' + obj.verticalid + '">' + iconStr +
                                                    '<span> ' + vd.name + '</span></a></li>'
                                            }

                                        }
                                        vcbk(null, null);

                                    });
                                }

                            }, function (err, result) {

                                if (vflag) {
                                    obj.dashboards = dashboards;
                                    renderVerticalHtml(obj)
                                    if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {
                                        $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + obj.verticalname + '</li>')
                                        $(".sidenav ul").append(liStr);
                                    }
                                }

                                cbk(null, null)
                            });


                        }
                        else {

                            console.log('vertical name FALSE=>',obj.verticalname)
                            var liStr = '';

                            for (var i = 0; i < obj.dashboards.length; i++) {

                                var iconStr = '';

                                if (obj.dashboards[i].isimage) {
                                    iconStr = '<img src="' + obj.dashboards[i].imgpath + '" style="height: 18px;" />'
                                } else {
                                    iconStr = '<i class="' + obj.dashboards[i].icon + '"></i> ';
                                }

                                liStr = liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                    '<a href="<%= basepath %>/dashboard/' + obj.dashboards[i].id + '?vertical=' + obj.verticalid + '">' + iconStr +
                                    '<span> ' + obj.dashboards[i].name + '</span></a></li>'
                            }

                            if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {
                                $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + obj.verticalname + '</li>')
                                $(".sidenav ul").append(liStr);
                            }

                            renderVerticalHtml(obj);
                            // $(".verticalList").append(renderVertical(obj));
                            cbk(null, null)
                        }
                    } else {
                        // $(".verticalList").append(renderVertical(obj));
                        renderVerticalHtml(obj);
                        cbk(null, null)
                    }

                });

            }, function (err, result) {

            })

            /* for (var i = 0; i < VERTICAL_LIST.length; i++) {
                 renderVerticalHtml(VERTICAL_LIST[i])
             }*/


        }
        else {
            $(".noData").removeClass('hide');
            VERTICAL_LIST = [];
        }
    })
}

function checkDashboadExist(vd, obj) {
    var flag = false;

    for(var i=0;i<obj.dashboards.length;i++){
        if(vd.id === obj.dashboards[i].id){
            flag = true
        }
    }

    return flag;
}


function renderVerticalDashboard(obj, id) {
    var txtColor = obj.titletxtcolor ? obj.titletxtcolor : DEFAULT_THEME.subHeaderBg;

    var iconStr = '';

    if (obj.isimage) {
        iconStr = '<img src="' + obj.imgpath + '" style="height: 48px;" />'
    } else {
        iconStr = '<i class="' + obj.icon + '" style="color:' + txtColor + '"></i> ';
    }


    var str = `
        <div class="col-lg-2 col-md-3 col-sm-4 col-xs-12" onclick="loadVerticalDashMenu('` + obj.id + `','` + id + `')">
            <div class="card modules">
               ` + iconStr + `
                <p class="mt-2"><label>` + obj.name + `</label></p>
            </div>
        </div>
    `;
    return str;
}

function loadVerticalDashMenu(did, vid) {

    document.location = BASE_PATH+'/dashboard/' + did + '?vertical=' + vid;


}

function renderVerticalHtml(obj) {

    var dash = '';

    for (var i = 0; i < obj.dashboards.length; i++) {
        // $(".d_"+obj.dashboards[i].id).remove();

        dash = dash + renderVerticalDashboard(obj.dashboards[i], obj.verticalid);
    }

    var actionStr = '';
    var htmlStr = '';
    var permStr = '';
    var opStr = '';
    var verStr = '';

    if (USER_ROLE.indexOf('user') === -1 && USER_ROLE.indexOf('developer') === -1) {
        actionStr = '<button class="btn btn-xs btn-outline-danger" style="" ' +
            'onclick="deleteImportVerticalModal(\'' + obj.verticalid + '\')" title="Remove Vertical from Domain">' +
            '<i class="icon-close"></i> Delete Vertical</button>';

        htmlStr = '<button class="btn btn-xs btn-outline-success"  style="margin-right: 5px;" title="Publish as Website"' +
            ' onclick="shareModal(2,\'' + obj.verticalid + '\')"><i class="icon-globe"></i> Publish</button>';

        permStr = '<button class="btn btn-xs btn-outline-secondary" style="margin-right: 5px;" ' +
            'onclick="addUserPermission(\'' + obj.verticalid + '\')" title="Add User Group Permission">' +
            '<i class="icon-users3" style=""></i> Permission</button>';

        if (DOMAIN_KEY === obj.domainKey) {
            actionStr = '';
        }

        verStr = '<span><label class="label label-warning" style="margin-right: 10px;">v '+obj.version+'</label>' +
            '<a href="javascript:void(0)" id="v-'+obj.verticalid+'" data-value="'+obj.version+'" ' +
            'style="margin-right: 10px;color: #FF9800;text-decoration: underline;"></a> ' +
            '</span>'




        opStr = `<div class="row hidden-xs"><div class="col-md-12">
            <div style="text-align: right;margin-bottom: 10px;">
            ` + verStr + htmlStr + permStr + actionStr + `
            </div>
            </div></div> `;
    }


    var str = `
    <div class="panel panel-inverse panel-hover-icon" style="">
                <div class="panel-heading ui-sortable-handle">
                    <h4 class="panel-title">` + obj.verticalname + `</label></h4>
                </div>
                <div class="panel-body">
                   ` + opStr + `
                    <div class="row">
                        ` + dash + `
                    </div>
                </div>
            </div>
    `;

    $(".dashboardBody").append(str)

}

function getVerticalVersion() {

        var verticalIds = _.pluck(VERTICAL_LIST, 'verticalid');
        var queryParams = {
            "query" : {
                "constant_score" : {
                    "filter" : {
                        "terms" : {
                            "verticalid" : verticalIds
                        }
                    }
                }
            },
            "_source": ["version", "verticalid"],
            "size" : 1000
        };


        var searchQuery = {
            "method": 'GET',
            "extraPath": "",
            "query": JSON.stringify(queryParams),
            "params": []
        };

        searchByQuery('', 'VERTICAL_PUBLISHED', searchQuery, function (status, data) {

            if (status) {

                var result = searchQueryFormatterNew(data)['data']['data'];

                var resData = _.indexBy(result, 'verticalid');

                for(var i=0;i<verticalIds.length;i++){
                    var resObj = resData[verticalIds[i]];
                    if(resObj){

                        var getVal = $("#v-"+resObj.verticalid).attr('data-value');

                        if(getVal !== resObj.version) {
                            var str = 'Click here to update <b>Latest '+resObj.version+'</b> version';
                            $("#v-"+resObj.verticalid).html(str);
                            $("#v-"+resObj.verticalid).attr('onclick','verticalUpdate(\''+resObj._id+'\')');
                        }else{
                            $("#v-"+resObj.verticalid).remove()
                        }
                    }else{
                        $("#v-"+resObj.verticalid).remove()
                    }
                }


            }
        })
}



function verticalUpdate(id) {

    importVertical(id, function (status, data) {
        if(status){
            successMsg('Vertical successfully updated to latest version');
            location.reload();
        }else{
            errorMsg('Error in updating vertical')
        }
    })
}

/*function loadImportedVerticals() {

    $(".verticalList").html("");
    var queryParams = {
        "query": {
            "bool": {
                "must": [{
                    match: {clientDomainKey: DOMAIN_KEY}
                }]
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

    searchByQuery('', 'VERTICAL_IMPORTED', searchQuery, function (status, data) {
        if (status) {

            var result = searchQueryFormatterNew(data)['data'];
            $(".verticalsCount").html(result.recordsTotal);
            if (result.recordsTotal === 0) {
                VERTICAL_LIST = [];
            } else {
                $(".noData").remove();
                VERTICAL_LIST = result.data;
                $(".verticalMenuHeader").removeClass('hide');
            }

            async.filter(VERTICAL_LIST, function (obj, cbk) {

                getVerticalPermission(obj.verticalid, function (vdata) {

                    console.log(vdata)

                    var sFlag = true;

                    for(var i=0; i<USER_ROLE.length;i++){
                        if(USER_ROLE[i] === 'admin' || USER_ROLE[i] === 'domainadmin' ){
                            sFlag = false;
                        }
                    }

                    if (sFlag) {

                        if (vdata.length > 0) {

                            var vflag = false;
                            var liStr = '';
                            var liStrFalse = '';

                            async.filter(vdata, function (vd, vcbk) {

                                checkUserExist(vd.groupid, USER_OBJ.user.email, function (status) {

                                    var iconStr =  '';

                                    if(vd.isimage){
                                        iconStr = '<img src="'+vd.imgpath+'" style="height: 18px;" />'
                                    }else{
                                        iconStr = '<i class="' + vd.icon + '"></i> ';
                                    }


                                    if (status) {
                                        vflag = true;


                                        liStr = liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                        '<a href="<%= basepath %>/dashboard/' + vd.id + '?vertical=' + obj.verticalid + '">'+iconStr +
                                        '<span> ' + vd.name + '</span></a></li>'
                                    }else{
                                        liStrFalse = liStrFalse + ' <li class="has-sub sideMain msgDefMenu">' +
                                            '<a href="<%= basepath %>/dashboard/' + vd.id + '?vertical=' + obj.verticalid + '">'+iconStr +
                                            '<span>' + vd.name + '</span></a></li>'
                                    }
                                    vcbk(null, null);

                                });

                            }, function (err, result) {
                                if (vflag) {
                                    $(".verticalList").append(renderVertical(obj));
                                    if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {
                                        $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + obj.verticalname + ' <small>' + obj.version + '</small></li>')
                                        $(".sidenav ul").append(liStr);
                                    }
                                }else{
                                    $(".verticalList").append(renderVertical(obj));
                                    if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {
                                        $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + obj.verticalname + ' <small>' + obj.version + '</small></li>')
                                        $(".sidenav ul").append(liStrFalse);
                                    }
                                }
                                cbk(null, null)
                            });


                        } else {

                            var liStr = '';

                            for(var i=0;i<obj.dashboards.length;i++){

                                var iconStr =  '';

                                if(obj.dashboards[i].isimage){
                                    iconStr = '<img src="'+obj.dashboards[i].imgpath+'" style="height: 18px;" />'
                                }else{
                                    iconStr = '<i class="' + obj.dashboards[i].icon + '"></i> ';
                                }

                                liStr = liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                    '<a href="<%= basepath %>/dashboard/' + obj.dashboards[i].id + '?vertical=' + obj.verticalid + '">'+iconStr+
                                    '<span> ' + obj.dashboards[i].name + '</span></a></li>'
                            }

                            if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {
                                $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + obj.verticalname + ' <small>' + obj.version + '</small></li>')
                                $(".sidenav ul").append(liStr);
                            }

                            $(".verticalList").append(renderVertical(obj));
                            cbk(null, null)
                        }
                    } else {
                        $(".verticalList").append(renderVertical(obj));
                        cbk(null, null)
                    }

                });

            }, function (err, result) {

            })


        }
        else {
            $(".noData").show();
            VERTICAL_LIST = [];
            // $(".verticalMenuHeader").hide();
        }
    })
}*/


function renderVertical(obj) {

    var actionStr = '';
    var htmlStr = '';
    var permStr = '';
    var authorName = '';

    if (USER_ROLE.indexOf('user') === -1 && USER_ROLE.indexOf('developer') === -1) {
        actionStr = '<button class="btn btn-xs btn-icon btn-outline-danger" style="position: absolute;top:0px;right:0px;" ' +
            'onclick="deleteImportVerticalModal(\'' + obj.verticalid + '\')" title="Delete Vertical">' +
            '<i class="icon-close" style="font-size: 100%"></i></button>';

        htmlStr = '<button class="btn btn-xs btn-default" onclick="shareModal(2,\'' + obj.verticalid + '\')"><i class="icon-globe" style="font-size: 100%"></i> Publish as Website</button>';

        permStr = '<button class="btn btn-icon btn-outline-secondary" style="position: absolute;top:3px;left:3px;" ' +
            'onclick="addUserPermission(\'' + obj.verticalid + '\')" title="Add User Group Permission">' +
            '<i class="icon-users3" style="font-size: 14px;"></i></button>';

        authorName = 'by, ' + obj.createdby;

    }

    if (DOMAIN_KEY === obj.domainKey) {
        actionStr = ''
    }

    var str = `
        <div class="col-lg-2 col-md-3 col-sm-4 col-xs-12">
            <div class="card modules">
                <div onclick="loadVerticalDashboard('` + obj.verticalid + `')" >
                <img style="" src="` + API_BASE_PATH + `/files/public/download/` + obj.verticalimage + `" width="75" height="75" />
                </div>
                <p class="mt-2" onclick="loadVerticalDashboard('` + obj.verticalid + `')"><label>` + obj.verticalname + `</label><br><small>` + obj.category + ` <br> ` + authorName + `</small></p>
                 ` + actionStr + `
                 ` + htmlStr + `
                 ` + permStr + `
            </div>
        </div>
    `;
    return str;
}


function renderVerticalDashMenu(obj) {
    tempObj = obj;
    var theme = Cookies.get('platform_theme') ? JSON.parse(Cookies.get('platform_theme')) : DEFAULT_THEME;
    var str = `
        <div class="col-lg-2 col-md-3 col-sm-4 col-xs-12" onclick="loadVerticalDashboard('` + obj.id + `')">
            <div class="card modules">
                <i class="` + obj.icon + `" style="color: ` + theme.subHeaderBg + `"></i>
                <p class="mt-2"><label>` + obj.name + `</label></p>
            </div>
        </div>
    `;
    return str;
}


function loadUsersGroup() {
    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};

    var queryParams = {
        "query": {
            "bool": {
                "must": [domainKeyJson]
            }
        },
        "size": 10000,
    };

    $("#verticalGroup").html('')

    var searchQueryObj = {
        "method": 'GET',
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };


    searchByQuery('', 'DOMAIN_USER_GROUP', searchQueryObj, function (status, res) {
        if (status) {

            var resultData = QueryFormatter(res).data;
            user_group_list = resultData['data'];

            var options = '<option value=""></option>';
            for (var i = 0; i < user_group_list.length; i++) {
                options = options + '<option value="' + user_group_list[i].id + '">' + user_group_list[i].name + ' [' + user_group_list[i].id + ']</option>'
            }

            $("#verticalGroup").html(options)

        } else {
            user_group_list = []
        }


    })
}

function addUserPermission(id) {
    verticalID = id;
    $(".dashList").html('');
    $(".groupList").html('');
    $(".mobileDashList").html('');
    $(".mobileGroupList").html('');

    for (var i = 0; i < VERTICAL_LIST.length; i++) {

        if (id === VERTICAL_LIST[i].verticalid) {

            tempObj = VERTICAL_LIST[i];

            $(".verticalName").html(tempObj.verticalname)
            $(".verticalCat").html(tempObj.category)
            $(".verticalVersion").html(tempObj.version)

            for (var j = 0; j < tempObj.dashboards.length; j++) {
                var dash = tempObj.dashboards[j]
                $(".dashList").append('<li><label style="font-weight: normal">' + dash.name + '</label></li>');
                $(".groupList").append('<li style="height: 25px;">' + renderUserGroup('' + dash.id + '') + '</li>');
            }

            if(tempObj.mobiledashboards.length === 0){
                $(".mobiledashboard").remove();
            }

            for (var j = 0; j < tempObj.mobiledashboards.length; j++) {
                var dash = tempObj.mobiledashboards[j]
                $(".mobileDashList").append('<li><label style="font-weight: normal">' + dash.name + '</label></li>');
                $(".mobileGroupList").append('<li style="height: 25px;">' + renderUserGroup('' + dash.id + '') + '</li>');
            }


        }
    }

    getVerticalPermission(verticalID, function (data) {
        if (data.length > 0) {

            for (var j = 0; j < data.length; j++) {
                var dash = data[j];

                var val = dash.groupid === 'ALL' ? '' : dash.groupid;
                $(".s_" + dash.id).val(val)
            }
        }
        $("#permissionModal").modal('show')
    })


}

function renderUserGroup(id) {
    var options = '<option value="">All Users</option>';

    for (var i = 0; i < user_group_list.length; i++) {
        options = options + '<option value="' + user_group_list[i].id + '">' + user_group_list[i].name + ' [' + user_group_list[i].id + ']</option>'
    }


    var str = '<select class="s_' + id + '" >' + options + '</select>';
    return str;
}

function loadVerticalDashboard(id) {

    for (var i = 0; i < VERTICAL_LIST.length; i++) {

        if (id === VERTICAL_LIST[i].verticalid) {

            for (var j = 0; j < VERTICAL_LIST[i].dashboards.length; j++) {
                document.location = BASE_PATH+'/dashboard/' + VERTICAL_LIST[i].dashboards[j].id + '?query=' + encodeURIComponent(JSON.stringify(VERTICAL_LIST[i].dashboards[j])) + '&vertical=' + VERTICAL_LIST[i].verticalid;
            }


        }
    }


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

function deleteImportVerticalModal(id) {
    delete_vertical_id = id;
    var obj = {};
    for (var i = 0; i < VERTICAL_LIST.length; i++) {
        if (id === VERTICAL_LIST[i]['verticalid']) {
            obj = Object.assign({}, VERTICAL_LIST[i]);

        }
    }

    $(".verticalImportName").html(obj.verticalname);
    $("#deleteVerticalModal").modal('show');
}

function deleteImportedVertical() {
    deleteImportVertical(delete_vertical_id, function (status, data) {
        if (status) {
            loadImportedVerticals();
            $("#deleteVerticalModal").modal('hide');
            successMsg('Vertical successfully removed from the domain')
        } else {
            errorMsg('Error in vertical delete')
        }
    })
}

function shareModal(type, id) {

    shareType = type;
    shareTypeId = id ? id : '';

    if (type === 1) {
        sharePropName = 'dashboard.share';
    } else {
        sharePropName = 'vertical.share.' + id;
    }

    shareId = null;
    shareObj = {};
    $(".shareLink").html('');

    getDomainProperty(sharePropName, function (status, data) {
        if (status) {
            shareObj = JSON.parse(data.value);
            shareId = shareObj.shareid;
        }

        if (type === 1) {
            $(".shareTitle").html('Publish Dashboard as Website');
        } else {
            $(".shareTitle").html('Publish Vertical as Website');
        }

        if (shareId) {
            var url = WEB_BASE_PATH + '/publish/' + DOMAIN_KEY + '/' + shareId;
            $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                '<small style="font-size:11px;">This url can be embed in iframe</small>');
            $("#enableBtn").prop("checked", true);
        } else {
            $("#disableBtn").prop("checked", true);
        }

        $("#shareModal").modal('show')
    });

}

function shareDashboard() {

    if ($("input[name='shareBtn']:checked").val() === 'enable') {

        if (shareId) {
            var url = WEB_BASE_PATH + '/publish/' + DOMAIN_KEY + '/' + shareId;

            $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                '<small style="font-size:11px;">This url can be embed in iframe.</small>');

        } else {

            if (shareType === 1) {
                shareObj = {
                    type: 'dashboard',
                    id: shareTypeId,
                    shareid: ''
                };
            } else {
                shareObj = {
                    type: 'vertical',
                    id: shareTypeId,
                    shareid: ''
                };
            }

            var data = {
                data: JSON.stringify(shareObj)
            };

            insertGlobalProperty(data, function (status, data) {
                if (status) {

                    shareId = data.id;
                    shareObj['shareid'] = shareId;

                    var data = {
                        name: sharePropName,
                        value: JSON.stringify(shareObj)
                    };

                    upsertDomainProperty(data, function (status, data) {
                        if (status) {

                            var url = WEB_BASE_PATH + '/publish/' + DOMAIN_KEY + '/' + shareId;

                            $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                                '<small style="font-size:11px;">This url can be embed in iframe</small>');
                        }
                    })

                } else {
                    errorMsg('Error in publish')
                }
            })
        }

    } else {

        if (shareId) {
            deleteGlobalProperty(shareId, function (status, data) {
                if (status) {
                    shareId = null;
                    shareObj['shareid'] = shareId;

                    var data = {
                        name: sharePropName,
                        value: JSON.stringify(shareObj)
                    };

                    upsertDomainProperty(data, function (status, data) {
                        if (status) {

                            $(".shareLink").html('');
                        }
                    })

                } else {
                    errorMsg('Error in disabling public share')
                }
            })
        }

    }
}

function savePermission() {

    var obj = [];

    for (var i = 0; i < tempObj.dashboards.length; i++) {
        var dash = tempObj.dashboards[i];
        if ($(".s_" + dash.id).val() !== '') {
            dash['groupid'] = $(".s_" + dash.id).val();
            obj.push(dash);
        } else {
            dash['groupid'] = 'ALL';
            obj.push(dash);
        }
    }

    for (var i = 0; i < tempObj.mobiledashboards.length; i++) {
        var dash = tempObj.mobiledashboards[i];
        if ($(".s_" + dash.id).val() !== '') {
            dash['groupid'] = $(".s_" + dash.id).val();
            obj.push(dash);
        } else {
            dash['groupid'] = 'ALL';
            obj.push(dash);
        }
    }


    var data = {
        name: 'v_pem_' + verticalID,
        value: JSON.stringify(obj)
    };

    upsertDomainProperty(data, function (status, data) {
        if (status) {
            $("#permissionModal").modal('hide')
            successMsg('Permission Updated Successfully')
        } else {
            errorMsg('Error in saving permission')
        }
    })
}

