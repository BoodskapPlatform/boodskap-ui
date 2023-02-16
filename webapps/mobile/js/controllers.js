/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/
var USER_OBJ = JSON.parse($("#userObj").val());
var DASHBOARD_LIST = [];
var CURRENT_DASHBOARD = {};
var mobThemeProp = {};
var DEFAULT_DASHBOARD = null;
var CURRENT_DASHBOARD_ID = null;
var CURRENT_DOMAIN = {};
var DASHBOARD_WIDGETS = [];
var MGRID_STACK = null;

document.addEventListener('init', function(event) {

    var page = event.target;

    if (page.matches('#singleDashboardPage')) {
        var pageData = event.target.data.pageData;
    }
});

myApp.controllers = {

  menuPage: function(page) {
    // Set functionality for 'No Category' and 'All' default categories respectively.
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item[category-id=""]'));
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item:not([category-id])'));

    // Change splitter animation depending on platform.
    document.querySelector('#mySplitter').left.setAttribute('animation', ons.platform.isAndroid() ? 'overlay' : 'reveal');

    if(userObj.user.firstName && userObj.user.lastName){
        $(".user-fullname").html(userObj.user.firstName+' '+userObj.user.lastName);
    }else{
        $(".user-fullname").html(userObj.user.email);
    }

      $(".user-emailid").html(userObj.user.email);
  },

  sideMenu: function(page) {
        // $(".user-fullname").html(userObj.user.firstName+' '+userObj.user.lastName);
      if(userObj.user.firstName && userObj.user.lastName){
          $(".user-fullname").html(userObj.user.firstName+' '+userObj.user.lastName);
      }else{
          $(".user-fullname").html(userObj.user.email);
      }
      $(".user-emailid").html(userObj.user.email);
  },

  homePage: function(page) {

      $(".homeDashboardsList").html("");
      $(".dashboardBody").html("");

      var loadingModal = document.querySelector('ons-modal');

        // Set button functionality to open/close the menu.
        page.querySelector('[component="button/menu"]').onclick = function() {
            document.querySelector('#mySplitter').left.toggle();
        };

        if ($.trim($('#isPublic').val()) === 'true') {

            USER_OBJ = {
                apiKey: $.trim($('#token').val()),
                domainKey: $.trim($('#domainkey').val()),
                token: $.trim($('#token').val())
            };

            API_KEY = USER_OBJ.apiKey;
            DOMAIN_KEY = USER_OBJ.domainKey;
            API_TOKEN = USER_OBJ.token;

            MQTT_CLIENT_ID = 'GBL';
        }

        $(document).ready(function () {

            $("body").removeClass('bg-white');

            var options = {
                animate: true,
                cellHeight: 100,
                float: false,
                verticalMargin: 10,
                disableDrag: true,
                disableResize: true
            };
            $('.grid-stack').gridstack(options);
            loadDashboardlist();
            getMobileTheme();
            getMobileAppDomainBranding();
        });
  },

  singleDashboardPage: function(page) {

      var loadingModal = document.querySelector('ons-modal');
      setTimeout(function () {
          loadingModal.hide();
      },1000)

      var options = {
          animate: true,
          cellHeight: 100,
          float: false,
          verticalMargin: 10
      };
      $('.grid-stack').gridstack(options);

      $(".dashboardContent").css('background-color', CURRENT_DASHBOARD.bgcolor ? "#"+CURRENT_DASHBOARD.bgcolor : DEFAULT_DASHBOARD_BG);

      $(".dashboardName").html(CURRENT_DASHBOARD.name);
      $(".dashboardIcon").html('<i class="' + CURRENT_DASHBOARD.icon + '"></i>');


      loadWidgets(CURRENT_DASHBOARD.property);

      setTimeout(function(){
          themeChangesClick("USER_THEME");
      },1000);
  }

};



//*************************************
//********* Dashboard Functions *******
//*************************************

function gotoAction(id){

    if(id === 1){
        myNavigator.pushPage("templates/home/profile/profile.html", {closeMenu: true, animation:"slide"});
    }else if(id === 2){
        pushInit();
        $("#alertFeedback").hide();
    }
}

function refreshDashboard() {
    DASHBOARD_LIST = [];
    getDomainProperty(MOBILE_DASHBOARD_LIST_PROPERTY, function (status, data) {
        if (status) {

            DASHBOARD_LIST = JSON.parse(data.value);
            $(".dashboardList").html("");
            for (var i = 0; i < DASHBOARD_LIST.length; i++) {
                $(".dashboardList").append('<li><a href="javascript:void(0)" onclick="loadDashboard(\'' + DASHBOARD_LIST[i].id + '\')" ><i class="' + DASHBOARD_LIST[i].icon + '"></i> ' +
                    '<span class="">' + DASHBOARD_LIST[i].name + '</span></a></li>');

                if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
                    CURRENT_DASHBOARD = DASHBOARD_LIST[i];
                }
            }

            loadDashboard('current');


        } else {
            DASHBOARD_LIST = [];
            $(".dashboardList").html("");
        }
    });

}

function singleDashboard(id,ob) {

    if(ob){
        SINGLE_DASHBOARD_OBJ = JSON.parse(decodeURIComponent(ob));
    }

    if (id === 'default') {

        CURRENT_DASHBOARD = DEFAULT_DASHBOARD;

    } else if (id === 'current') {

    }
    else {

        for (var i = 0; i < DASHBOARD_LIST.length; i++) {
            if (id === DASHBOARD_LIST[i].id) {
                CURRENT_DASHBOARD = DASHBOARD_LIST[i];
            }
        }
    }

    CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;

    var options = {
        animation : 'slide',
        data: {
            pageData: CURRENT_DASHBOARD
        }
    };


    var loadingModal = document.querySelector('ons-modal');
    loadingModal.show();
    myNavigator.pushPage('mobile/templates/home/dashboard/single-dashboard-widgets.html',options);

}

function loadDashboard(id, flag) {



    if (id === 'default') {

        CURRENT_DASHBOARD = DEFAULT_DASHBOARD;

    } else if (id === 'current') {

    }
    else {


        if (lFlag) {
            if (USER_ROLE.indexOf('user') !== -1) {
                openNav();
            } else {
                // toggleDashboardMenu();
            }
        }
        lFlag = true;


        for (var i = 0; i < DASHBOARD_LIST.length; i++) {
            if (id + '' === DASHBOARD_LIST[i].id + '') {
                CURRENT_DASHBOARD = DASHBOARD_LIST[i];
            }
        }
    }

    CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;


    $(".dashboardMenu .nav-menu").removeClass('active');
    $(".dashboardMenu .d_"+CURRENT_DASHBOARD_ID).addClass('active');


    $(".dashboardName").html(CURRENT_DASHBOARD.name);


    var iconStr =  '';

    if(CURRENT_DASHBOARD.isimage){
        iconStr = '<img src="'+CURRENT_DASHBOARD.imgpath+'" style="height: 24px;" /> '
    }else{
        iconStr = '<i class="' + CURRENT_DASHBOARD.icon + '"></i> ';
    }

    $(".dashboardIcon").html(iconStr);
    $(".homeDashboardsList").css('background-color', CURRENT_DASHBOARD.bgcolor ? CURRENT_DASHBOARD.bgcolor : DEFAULT_DASHBOARD_BG + " !important");

    $(".panel-heading").css('background-color', (CURRENT_DASHBOARD.titlebgcolor ? CURRENT_DASHBOARD.titlebgcolor : DEFAULT_THEME.panelHeaderBg) +' !important');
    $(".dashmenuicon").css('background-color',(CURRENT_DASHBOARD.titlebgcolor ? CURRENT_DASHBOARD.titlebgcolor : '#6c757d') +' !important');
    $(".dashmenuicon").css('color',(CURRENT_DASHBOARD.titletxtcolor ? CURRENT_DASHBOARD.titletxtcolor : '#fff') +' !important');
    $(".panel-title").css('color', (CURRENT_DASHBOARD.titletxtcolor ? CURRENT_DASHBOARD.titletxtcolor : '#fff') +' !important');

}

function loadDashboardlist() {


    $(".loadingFdbk").show();

    $(".homeDashboardsList").html("");
    $(".dashboardBody").html("");

    getDomainProperty(MOBILE_DASHBOARD_LIST_PROPERTY, function (status, data) {
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

                $(".homeDashboardsList").append(renderDashMenu(DASHBOARD_LIST[i]));

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
            $(".homeDashboardsList").html("");
            $(".dashboardBody").html("");

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

    var str = '<ons-col width="50%" class="dashboardIconsAndText" style="padding: 7px;" onclick="singleDashboard(\'' + obj.id + '\',\'' + encodeURIComponent(JSON.stringify(obj)) + '\')">' +
        '    <div style="border-radius: 3px;" class="dashboardMenuBg">' +
        '          <p style="font-size: 28px;text-align: center;margin-bottom: 5px;margin-top: 20px;">'+iconStr+'</p>' +
        '          <div style="text-align: center;margin-bottom: 20px;font-size: 12px;" class="dotter">'+obj.name+'</div>' +
        '     </div>' +
        '</ons-col>';
    return str;
}

function renderVerticalDashboard(obj, id) {
    var txtColor = obj.titletxtcolor ? obj.titletxtcolor : DEFAULT_THEME.subHeaderBg;

    var iconStr = '';

    if (obj.isimage) {
        iconStr = '<img src="' + obj.imgpath + '" style="height: 48px;" />'
    } else {
        iconStr = '<i class="' + obj.icon + '" style="color:' + txtColor + '"></i> ';
    }

    var str = '<ons-col width="50%" class="dashboardIconsAndText" style="padding: 7px;" onclick="singleDashboard(\'' + obj.id + '\',\'' + encodeURIComponent(JSON.stringify(obj)) + '\')">' +
        '    <div style="border-radius: 3px;" class="dashboardMenuBg">' +
        '          <p style="font-size: 28px;text-align: center;margin-bottom: 5px;margin-top: 20px;">'+iconStr+'</p>' +
        '          <div style="text-align: center;margin-bottom: 20px;font-size: 12px;" class="dotter">'+obj.name+'</div>' +
        '     </div>' +
        '</ons-col>';

    return str;
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
                // $(".noData").removeClass('hide');
            } else {
                $(".noData").remove();
                VERTICAL_LIST = result.data;
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

                                    //Check mobile dashboard
                                    var dashStatus =  checkMobileDashboard(vd,obj);
                                    if(dashStatus){
                                        dashboards.push(vd);
                                    }


                                    liStr = liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                        '<a href="<%= basepath %>/dashboard/' + vd.id + '?vertical=' + obj.verticalid + '">' + iconStr +
                                        '<span> ' + vd.name + '</span></a></li>';


                                    vcbk(null, null);
                                } else {

                                    checkUserExist(vd.groupid, USER_OBJ.user.email, function (status) {

                                        var iconStr = '';

                                        if (vd.isimage) {
                                            iconStr = '<img src="' + vd.imgpath + '" style="height: 18px;" />'
                                        } else {
                                            iconStr = '<i class="' + vd.icon + '"></i> ';
                                        }

                                        if (status) {

                                            var dashStatus =  checkMobileDashboard(vd,obj);
                                            if(dashStatus){
                                                dashboards.push(vd);
                                            }

                                            vflag = true;

                                            liStr = liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                                '<a href="<%= basepath %>/dashboard/' + vd.id + '?vertical=' + obj.verticalid + '">' + iconStr +
                                                '<span> ' + vd.name + '</span></a></li>'
                                        }
                                        vcbk(null, null);

                                    });
                                }

                            }, function (err, result) {

                                if (vflag) {
                                    obj.mobiledashboards = dashboards;
                                    renderVerticalHtml(obj);

                                    if (USER_ROLE.indexOf('admin') === -1 && USER_ROLE.indexOf('domainadmin') === -1 && USER_ROLE.indexOf('developer') === -1) {
                                        $(".sidenav ul").append(' <li class="nav-header"  style="color:#f79802">' + obj.verticalname + '</li>')
                                        $(".sidenav ul").append(liStr);
                                    }
                                }

                                cbk(null, null)
                            });


                        }
                        else {

                            var liStr = '';

                            for (var i = 0; i < obj.mobiledashboards.length; i++) {

                                var iconStr = '';

                                if (obj.mobiledashboards[i].isimage) {
                                    iconStr = '<img src="' + obj.mobiledashboards[i].imgpath + '" style="height: 18px;" />'
                                } else {
                                    iconStr = '<i class="' + obj.mobiledashboards[i].icon + '"></i> ';
                                }

                                liStr = liStr + ' <li class="has-sub sideMain msgDefMenu">' +
                                    '<a href="<%= basepath %>/dashboard/' + obj.mobiledashboards[i].id + '?vertical=' + obj.verticalid + '">' + iconStr +
                                    '<span> ' + obj.mobiledashboards[i].name + '</span></a></li>'
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

            /*for (var i = 0; i < VERTICAL_LIST.length; i++) {
                renderVerticalHtml(VERTICAL_LIST[i])
            }*/


        }
        else {
            $(".noData").removeClass('hide');
            VERTICAL_LIST = [];
        }


        $(".loadingFdbk").hide();

    })
}

function checkMobileDashboard(vd,obj){

    var flag = false;

    for(var i=0;i<obj.mobiledashboards.length;i++){
        if(vd.id === obj.mobiledashboards[i].id){

            flag = true;

        }
    }

    return flag;
}

function renderVerticalHtml(obj) {

    var dash = '';

    if(obj.mobiledashboards.length > 0){
        for (var i = 0; i < obj.mobiledashboards.length; i++) {
            dash = dash + renderVerticalDashboard(obj.mobiledashboards[i], obj.verticalid);
        }

        var actionStr = '';
        var htmlStr = '';
        var permStr = '';
        var opStr = '';
        var verStr = '';

        var str = `<ons-row><ons-col class="dash-bg">
        <div class="panel panel-inverse panel-hover-icon" style="">
                    <div class="panel-heading ui-sortable-handle">
                        <h5 class="panel-title dash-bg-inner">` + obj.verticalname + `</label></h5>
                    </div>
                    <div class="panel-body">
                       ` + opStr + `
                        <ons-row>
                            ` + dash + `
                        </ons-row>
                    </div>
                </div>
        </ons-col></ons-row>`;

        $(".dashboardBody").append(str);
    }
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

//*************************************
//*************************************

/*function loadDashboardlist() {

    $(".fa-refresh").addClass("fa-spin");

    getDomainProperty(MOBILE_DASHBOARD_LIST_PROPERTY, function (status, data) {
        if (status) {

            DASHBOARD_LIST = JSON.parse(data.value);


            if ($.trim($('#dashboardID').val()) !== '') {


                var flag = false;

                for (var i = 0; i < DASHBOARD_LIST.length; i++) {

                    if ($.trim($('#dashboardID').val())+'' === DASHBOARD_LIST[i].id+'') {
                        CURRENT_DASHBOARD = DASHBOARD_LIST[i];
                        flag = true;
                    }
                }
                if (flag) {
                    loadDashboard('current');
                }
                else {
                    document.location = "/404";
                }


            }
            else {

                $("#homeDashboardsList").html("");
                $(".dashboardList").html("");

                for (var i = 0; i < DASHBOARD_LIST.length; i++) {
                   /!* $(".homeDashboardsList").append('<li><a href="javascript:void(0)" onclick="loadDashboard(\'' + DASHBOARD_LIST[i].id + '\')" ><i class="' + DASHBOARD_LIST[i].icon + '"></i> ' +
                        '<span class="">' + DASHBOARD_LIST[i].name + '</span></a></li>');*!/


                    var iconStr = '';

                    if(DASHBOARD_LIST[i].isimage){
                        iconStr = '<img src="' + DASHBOARD_LIST[i].imgpath + '" style="height: 28px;" />';
                    }else {

                        iconStr = '<i class="' + DASHBOARD_LIST[i].icon + '"></i> ';
                    }


                    /!*var widgetHtml = '' +
                        '<ons-list-item class="sideMenuListText" onclick="singleDashboard(\'' + DASHBOARD_LIST[i].id +'\')">' +
                        '<i class="' + DASHBOARD_LIST[i].icon + '"></i> <span class="m-item">'+DASHBOARD_LIST[i].name+'</span>' +
                        '</ons-list-item>';
                    $(".dashboardList").append(widgetHtml);*!/


                    var homeDashboardsListHtml =
                        '<ons-col width="50%" class="dashboardIconsAndText" style="padding: 7px;" onclick="singleDashboard(\'' + DASHBOARD_LIST[i].id + '\')">' +
                        '    <div style="border-radius: 3px;" class="dashboardMenuBg">' +
                        '          <p style="font-size: 28px;text-align: center;margin-bottom: 5px;margin-top: 20px;">'+iconStr+'</p>' +
                        '          <div style="text-align: center;margin-bottom: 20px;font-size: 12px;">'+DASHBOARD_LIST[i].name+'</div>' +
                        '     </div>' +
                        '</ons-col>';

                    $("#homeDashboardsList").append(homeDashboardsListHtml);
                }
                if(DASHBOARD_LIST[0]) {
                    CURRENT_DASHBOARD = DASHBOARD_LIST[0];
                    loadDashboard('other');
                }
            }


        } else {
            DASHBOARD_LIST = [];
            $(".homeDashboardsList").html("");
            loadDashboard('default');
        }

        setTimeout(function () {
            $(".fa-refresh").removeClass("fa-spin");
        },500);
    });
}

function refreshDashboard() {
    DASHBOARD_LIST = [];
    getDomainProperty(DASHBOARD_LIST_PROPERTY, function (status, data) {
        if (status) {

            DASHBOARD_LIST = JSON.parse(data.value);
            $(".dashboardList").html("");
            for (var i = 0; i < DASHBOARD_LIST.length; i++) {
                $(".dashboardList").append('<li><a href="javascript:void(0)" onclick="loadDashboard(\'' + DASHBOARD_LIST[i].id + '\')" ><i class="' + DASHBOARD_LIST[i].icon + '"></i> ' +
                    '<span class="">' + DASHBOARD_LIST[i].name + '</span></a></li>');

                if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
                    CURRENT_DASHBOARD = DASHBOARD_LIST[i];
                }
            }

            loadDashboard('current');


        } else {
            DASHBOARD_LIST = [];
            $(".dashboardList").html("");
        }
    });

}

function loadDashboard(id) {

    if (id === 'default') {

        CURRENT_DASHBOARD = DEFAULT_DASHBOARD;

    } else if (id === 'current') {

    }
    else {

        for (var i = 0; i < DASHBOARD_LIST.length; i++) {
            if (id === DASHBOARD_LIST[i].id) {
                CURRENT_DASHBOARD = DASHBOARD_LIST[i];
            }
        }
    }

    if(CURRENT_DASHBOARD){
        CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;
    }
}

function singleDashboard(id) {

    if (id === 'default') {

        CURRENT_DASHBOARD = DEFAULT_DASHBOARD;

    } else if (id === 'current') {

    }
    else {

        for (var i = 0; i < DASHBOARD_LIST.length; i++) {
            if (id === DASHBOARD_LIST[i].id) {
                CURRENT_DASHBOARD = DASHBOARD_LIST[i];
            }
        }
    }

    CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;

    var options = {
        animation : 'slide',
        data: {
            pageData: CURRENT_DASHBOARD
        }
    };


    var loadingModal = document.querySelector('ons-modal');
    loadingModal.show();
    myNavigator.pushPage('mobile/templates/home/dashboard/single-dashboard-widgets.html',options);
}*/




function menuExpand(flag){

    if($("#subMenus").is(':visible')){
        $("#subMenus").hide();
    }else{
        $("#subMenus").show();
    }
}

function mqttListen() {

}

function loadDomain() {

    for (var i = 0; i < LINKED_DOMAINS.length; i++) {
        if (id === LINKED_DOMAINS[i].domainKey) {
            CURRENT_DOMAIN = LINKED_DOMAINS[i];
        }
    }

    API_TOKEN = CURRENT_DOMAIN.token;
    DOMAIN_KEY = CURRENT_DOMAIN.domainKey;
    API_KEY = CURRENT_DOMAIN.apiKey;

    loadDashboardlist();

    $(".currentDomain").html(CURRENT_DOMAIN.label)
}


function loadSingleDashboardWidgets(obj) {

    CURRENT_DASHBOARD  = JSON.parse(decodeURIComponent(obj));
    CURRENT_DASHBOARD_ID = CURRENT_DASHBOARD.id;

    var options = {
        animation : 'slide',
        data: {
            pageData: CURRENT_DASHBOARD
        }
    };
    myNavigator.pushPage('mobile/templates/home/dashboard/single-dashboard-widgets.html',options);
}

function getDashboardList(){

    document.querySelector('#mySplitter').left.toggle();
    loadDashboard();
}



function loadWidgets(id) {

    if (MGRID_STACK){
        MGRID_STACK.removeAll();
        MGRID_STACK = null
    }
    $(".fa-refresh").addClass("fa-spin");

    getDomainProperty(id, function (status, data) {
        if (status) {

            DASHBOARD_WIDGETS = JSON.parse(data.value);

            for (var i = 0; i < DASHBOARD_WIDGETS.length; i++) {

                var widget = DASHBOARD_WIDGETS[i];

                if (!MGRID_STACK) MGRID_STACK = $('.grid-stack').data('gridstack');

                var id = widget.id;

                var widgetHeight = (widget.height * 100) -20;

                var iFrm = 'f_'+ id;


                var htmlStr = '',BTitleBar = "";
                if(widget.widgetTitle){
                    BTitleBar = '<div style="padding: 10px;background: '+(widget.widgetBgColor ? widget.widgetBgColor : '')+';color: '+(widget.widgetTextColor ? widget.widgetTextColor : '')+';font-size: 13px;font-weight: 600;margin-bottom: 10px;">'+(widget.widgetTitle ? widget.widgetTitle : (widget.category ? widget.category : ''))+'</div>';
                }

                htmlStr = BTitleBar+'<iframe id="f_' + id + '" style="width:100%;border:0px;height: 100%;overflow: hidden" onload="resizeIframe(this,id,MGRID_STACK)"></iframe>';

                var widgetHtml = '<div><div class="grid-stack-item-content ' + id + '" data-gs-id="' + id + '" style="overflow:hidden;border: 1px solid #e6e6e6;border-top: 0;">' +
                    htmlStr+'</div></div>';

                MGRID_STACK.addWidget($(widgetHtml), widget.x, widget.y, widget.width, widget.height, false, 1, 100, 1, 100, id);

                loadWidgetIFrame(widget);
            }
        }

        $(".fa-refresh").removeClass("fa-spin");
    });

}

function resizeIframe(obj,elemId,MGRID_STACK) {

    var h1 = obj.contentWindow.document.body.offsetHeight/100;
    MGRID_STACK = $('.grid-stack').data('gridstack');
    var gsi = $("#"+elemId).parents(".grid-stack-item");
    MGRID_STACK.resize(gsi,$(gsi).attr('data-gs-height'),h1+2);
}


function loadWidgetIFrame(obj) {

    var code = obj.snippet;
    var config = obj.config;


    var iframe = document.getElementById('f_' + obj.id);
    iframe.height = '100%'; //$("." + obj.id).height() + 'px'

    var iframedocument = iframe['contentWindow'].document;
    var head = iframedocument.getElementsByTagName("head")[0];


    var meta = document.createElement('meta');
    meta.httpEquiv = "X-UA-Compatible";
    meta.content = "IE=edge";
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.setAttribute('charset', "utf-8");
    head.appendChild(meta);


    var body = $('#f_' + obj.id).contents().find("body");


    var jsResource = code.jsfiles;
    var cssResource = code.cssfiles;

    var htmlStr = '';

    var inbuildcss = code.inbuildcss;
    var inbuildjs = code.inbuildjs;

    inbuildcss = inbuildcss === 'true' ? true : false;
    inbuildjs = inbuildjs === 'true' ? true : false;

    var w_device_id = config.device.deviceid ? config.device.deviceid : '',
        w_message_id = config.message.messageid ? config.message.messageid : '',
        w_asset_id = config.asset.assetid ? config.asset.assetid : '',
        w_widget_id = obj.id ? obj.id : '',
        w_record_id = config.record && config.record.recordid ? config.record.recordid : '';

    var resultData =
        "var API_BASE_PATH='" + API_BASE_PATH + "';\n" +
        "var DOMAIN_KEY='" + DOMAIN_KEY + "';\n" +
        "var API_KEY='" + API_KEY + "';\n" +
        "var API_TOKEN='" + API_TOKEN + "';\n" +
        "var USER_ID='" + (USER_OBJ && USER_OBJ.user ? USER_OBJ.user.email : '') + "';\n" +
        "var DEVICE_ID='" + (w_device_id) + "';\n" +
        "var RECORD_ID='" + (w_record_id) + "';\n" +
        "var MESSAGE_ID='" + (w_message_id) + "';\n" +
        "var ASSET_ID='" + (w_asset_id) + "';\n" +
        "var MQTT_CLIENT_ID='" + MQTT_CLIENT_ID + "';\n" +
        "var WIDGET_ID='" + (w_widget_id) + "';\n" +
        "var MQTT_CONFIG='" + JSON.stringify(MQTT_CONFIG) + "';\n";


    var cssCode = code.css;
    var htmlCode = code.html;
    var jsCode = code.js;
    // if(mobileOrWeb()) {
    //     body.html('<style>body{overflow-x: hidden}' + cssCode + '</style><div>' + htmlCode + '</div><script>' + resultData + '</script>');
    // }else{


    body.html('<style>body{overflow: auto}' + cssCode + '</style>' +
        '<div style="position: absolute;width:100%;height:100%;background-color:#6d6d6d;z-index:999;color:#fff;text-align: center;' +
        'font-size:12px;padding-top: 15%;font-weight: bold" ' +
        'id="loader">Loading Widget...</div>' +
        '<div>' + htmlCode + '</div><script>' + resultData + '</script>');


    // }

    var mqtt_file = '/js/boodskap.ws.js';
    var mqtt_adapter = WEB_BASE_PATH + '/resources/js/bdskp-live-adapter.js';

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
                    callback(null, null);
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

            body.append('<script>var elem = document.getElementById(\'loader\');\n' +
                ' elem.parentNode.removeChild(elem);</script>');


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
                                    callback3(null, null);
                                } else {
                                    callback3(null, null);
                                }
                            };
                        } else {  //Others
                            jsFile.onload = function () {
                                callback3(null, null);
                            };
                        }

                    }
                    else {
                        callback3(null, null);
                    }
                }, function (err, result) {
                    body.append('<script>' + jsCode + '</script>');


                });

            });

        });
    });

}

/*function loadWidgetIFrame(obj) {

    console.log(obj);

    var code = obj.snippet;
    var config = obj.config;


    var iframe = document.getElementById('f_' + obj.id);
    iframe.height = '100%' ; //$("." + obj.id).height() + 'px'

    var iframedocument = iframe['contentWindow'].document;
    var head = iframedocument.getElementsByTagName("head")[0];



    var meta = document.createElement('meta');
    meta.httpEquiv = "X-UA-Compatible";
    meta.content = "IE=edge";
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    head.appendChild(meta);

    var meta = document.createElement('meta');
    meta.setAttribute('charset', "utf-8");
    head.appendChild(meta);



    var body = $('#f_' + obj.id).contents().find("body");


    var jsResource = code.jsfiles;
    var cssResource = code.cssfiles;

    var htmlStr = '';

    var inbuildcss = code.inbuildcss;
    var inbuildjs = code.inbuildjs;

    inbuildcss = inbuildcss === 'true' ? true : false;
    inbuildjs = inbuildjs === 'true' ? true : false;

    var w_device_id = config.device.deviceid ? config.device.deviceid : '',
        w_message_id = config.message.messageid ? config.message.messageid : '',
        w_asset_id = config.asset.assetid ? config.asset.assetid : '';

    var resultData =
        "var API_BASE_PATH='" + API_BASE_PATH + "';\n" +
        "var DOMAIN_KEY='" + USER_OBJ.domainKey + "';\n" +
        "var API_KEY='" + USER_OBJ.apiKey + "';\n" +
        "var API_TOKEN='" + USER_OBJ.token + "';\n" +
        "var DEVICE_ID='" + (w_device_id) + "';\n" +
        "var MESSAGE_ID='" + (w_message_id) + "';\n" +
        "var ASSET_ID='" + (w_asset_id) + "';\n"+
        "var MQTT_CLIENT_ID='" + MQTT_CLIENT_ID + "';\n" +
        "var MQTT_CONFIG='" + JSON.stringify(MQTT_CONFIG) + "';\n";



    var cssCode = code.css;
    var htmlCode = code.html;
    var jsCode = code.js;

    // body.html('<style>body{overflow: hidden;padding:3px;}' + cssCode + '</style><div>' + htmlCode + '</div>');
    body.html('<style>' + cssCode + '</style><div>' + htmlCode + '</div><script>' + resultData + '</script>');

    var mqtt_file = WEB_BASE_PATH + '/js/boodskap.ws.js';
    var mqtt_adapter = WEB_BASE_PATH + '/resources/js/bdskp-live-adapter.js';

    jsResource.push(mqtt_file);
    jsResource.push(mqtt_adapter);



    async.mapSeries(code.defaultcss, function (file, callback) {

        // console.log('Enter FILE =>',file)

        if (inbuildcss) {
            var cssFile = iframedocument.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.setAttribute('href', CDN_PATH+'/css/' + file);
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
                    callback(null, null);
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
                    jsFile.setAttribute('src', CDN_PATH+'/js/' + file);
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
                                    callback3(null, null);
                                } else {
                                    callback3(null, null);
                                }
                            };
                        } else {  //Others
                            jsFile.onload = function () {
                                callback3(null, null);
                            };
                        }

                    }
                    else {
                        callback3(null, null);
                    }
                }, function (err, result) {
                    body.append('<script>' + resultData + '</script><script>' + jsCode + '</script>');


                });

            });

        });
    });

}*/

function shareModal() {

    if (CURRENT_DASHBOARD.tokenId) {
        var url = WEB_BASE_PATH + '/public/dashboard/' + DOMAIN_KEY + '/' + CURRENT_DASHBOARD.tokenId;
        $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
            '<small style="font-size:11px;">This url can be embed in iframe.</small>');
        $("#enableBtn").prop("checked", true);
    } else {
        $("#disableBtn").prop("checked", true);
    }

    $("#shareModal").modal('show')
}

function shareDashboard() {
    if ($("input[name='shareBtn']:checked").val() === 'enable') {

        if (CURRENT_DASHBOARD.tokenId) {
            var url = WEB_BASE_PATH + '/public/dashboard/' + DOMAIN_KEY + '/' + CURRENT_DASHBOARD.tokenId;
            $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                '<small style="font-size:11px;">This url can be embed in iframe.</small>');

        } else {
            var data = {
                data: JSON.stringify(CURRENT_DASHBOARD)
            };

            insertGlobalProperty(data, function (status, data) {
                if (status) {
                    CURRENT_DASHBOARD['tokenId'] = data.id;
                    var url = WEB_BASE_PATH + '/public/dashboard/' + DOMAIN_KEY + '/' + CURRENT_DASHBOARD.tokenId;
                    $(".shareLink").html('Public Link: <a href="' + url + '" target="_blank">' + url + '</a><br>' +
                        '<small style="font-size:11px;">This url can be embed in iframe.</small>');
                    updateDashboard();
                } else {
                    errorMsg('Error in share')
                }
            })
        }

    } else {
        if (CURRENT_DASHBOARD.tokenId) {
            deleteGlobalProperty(CURRENT_DASHBOARD.tokenId, function (status, data) {
                if (status) {
                    CURRENT_DASHBOARD['tokenId'] = '';
                    $(".shareLink").html('');
                    updateDashboard();
                } else {
                    errorMsg('Error in disabling share')
                }
            })
        }

    }
}

function updateDashboard() {


    for (var i = 0; i < DASHBOARD_LIST.length; i++) {

        if (CURRENT_DASHBOARD_ID === DASHBOARD_LIST[i].id) {
            DASHBOARD_LIST[i] = CURRENT_DASHBOARD;
        }
    }


    var data = {
        name: MOBILE_DASHBOARD_LIST_PROPERTY,
        value: JSON.stringify(DASHBOARD_LIST)
    };

    upsertDomainProperty(data, function (status, data) {
        if (status) {


        } else {
            errorMsg('Error in updating dashboard')
        }
    })
}

function themeChangesClick(flag) {
    if(flag === "USER_THEME"){

        $(".bskp-ons-toolbar").css({"background":(mobThemeProp.toolBar ? mobThemeProp.toolBar : MOBILE_DEFAULT_THEME.toolBar)});
        $(".bskp-ons-toolbar .toolbar-text").css({"color":mobThemeProp.toolBarText ? mobThemeProp.toolBarText : MOBILE_DEFAULT_THEME.toolBarText});

        $(".smenu-profile-bg").css({"background":mobThemeProp.sideMenuProfileBg ? mobThemeProp.sideMenuProfileBg : MOBILE_DEFAULT_THEME.sideMenuProfile});
        $(".smenu-profile-bg").css({"color":mobThemeProp.sideMenuProfileBgText ? mobThemeProp.sideMenuProfileBgText : MOBILE_DEFAULT_THEME.sideMenuProfileBgText});

        $(".sideMenuListText").css({"color":mobThemeProp.sideMenuListText ? mobThemeProp.sideMenuListText : MOBILE_DEFAULT_THEME.sideMenuListText});
        $(".dashboardIconsAndText").css({"color":mobThemeProp.dashboardIconsAndText ? mobThemeProp.dashboardIconsAndText : MOBILE_DEFAULT_THEME.dashboardIconsAndText});
        $(".dashboardBg").css({"background":mobThemeProp.dashboardBg ? mobThemeProp.dashboardBg : MOBILE_DEFAULT_THEME.dashboardBg});

        $(".dashboardMenuBg").css({"background":mobThemeProp.dashboardMenuBg ? mobThemeProp.dashboardMenuBg : MOBILE_DEFAULT_THEME.dashboardMenuBg});
        $(".dashboardMenuBg").css({"border":"1px solid "+ (mobThemeProp.dashboardMenuBorder ? mobThemeProp.dashboardMenuBorder : MOBILE_DEFAULT_THEME.dashboardMenuBorder)});

    }else{
        var theme = JSON.parse($("#THEME_CHANGES_VALUE").val());

        $(".bskp-ons-toolbar").css({"background":theme.toolBar});
        $(".bskp-ons-toolbar .toolbar-text").css({"color":theme.toolBarText});

        $(".smenu-profile-bg").css({"background":theme.sideMenuProfileBg});
        $(".smenu-profile-bg").css({"color":theme.sideMenuProfileBgText});

        $(".sideMenuListText").css({"color":theme.sideMenuListText});
        $(".dashboardIconsAndText").css({"color":theme.dashboardIconsAndText});
        $(".dashboardBg").css({"background":theme.dashboardBg});
        $(".dashboardMenuBg").css({"background":theme.dashboardMenuBg});
        $(".dashboardMenuBg").css({"border":"1px solid "+theme.dashboardMenuBorder});
    }
}

function sampleClick() {
    addWidget();
}

function getMobileTheme() {


    getDomainProperty(MOBILE_DOMAIN_THEME_PROPERTY, function (status, data) {

        if (status) {
            mobThemeProp = JSON.parse(data.value);
        }

        setTimeout(function () {
            themeChangesClick('USER_THEME');
        },500);
    });
}

function openSideMenu() {
    document.querySelector('#mySplitter').left.open();

    var dId = $("#ADD_DASHBOARD").val();
}

function addWidget(id) {

    var widget = WIDGETS_LIST[i];

    if (!MGRID_STACK) MGRID_STACK = $('.grid-stack').data('gridstack');
    var id = widget['id'];
    var widgetHtml = '<div><div class="grid-stack-item-content ' + id + '" data-gs-id="' + id + '">' +
        '<h5 style="color:#666;margin-top: 20px;">' + widget.widgetname + '</h5>' +
        '<img src="' + API_BASE_PATH + '/files/public/download/' + widget.widgetimage + '" alt="" />' +
        '<a href="javascript:void(0)" onclick="widgetSettings(\'' + id + '\')" style="display: block;margin-top: 10px;text-decoration: none;color:#333" class="text-warning">' +
        '<i class="icon-cog"></i> Configure</a>' +
        '<a href="javascript:void(0)" onclick="removeWidget(\'' + id + '\')" style="display: block;margin-top: 10px;text-decoration: none;color:#333">' +
        '<i class="icon-trash4"></i> Remove</a>' +
        '</div></div>';

    // GRID_STACK.addWidget($(widgetHtml), widget.x, widget.y, "100%", widget.height, true, 1, 100, 1, 100, id);

    MGRID_STACK.addWidget($(widgetHtml), 0, 0, "100%", 2, true,1,100,1,100,id);

    // Demo: Circular reference
    var o = {};
    o.o = o;

    // Note: cache should not be re-used by repeated calls to JSON.stringify.
    var cache = [];
    var widgetStack = JSON.stringify(MGRID_STACK, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null; // Enable garbage collection

    $("#MGRID_STACK").val(widgetStack);
}

function getMobileAppDomainBranding() {
    getDomainProperty(MOBILE_APP_DOMAIN_BRANDING_PROPERTY, function (status, data) {
        if (status) {
            var src = JSON.parse(data.value);
            $(".mob_domain_logo_m").attr('src', API_BASE_PATH + '/files/download/' + USER_OBJ.token + '/' + src.webLogo);
        } else {
            $(".mob_domain_logo_m").attr('src', "images/bdskap-logo.png");
        }
    })
}

function searchQueryFormatter(data) {


    var resultObj = {
        total: 0,
        data: {},
        aggregations: {}
    };

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
        };

        return resultObj;

    } else {

        return resultObj;
    }
}

function pagePushBack(){

    try{
        myNavigator.popPage();
    }catch (e){
        console.log(e);
    }
}
