
var Routes = function (app) {

    this.app = app;
    this.init();


    this.mobileLayout = app.mobileLayout;

};
module.exports = Routes;



Routes.prototype.init = function () {

    var self = this;

    var roleCheck = function (req, res, next) {
        var userObj = req.cookies['user_details'];
        var partDomain = req.cookies['partDomain'];
        if(partDomain && partDomain === 'false'){
            res.redirect('/login');
        }else {
            if (userObj) {
                var role = JSON.parse(userObj).user.roles;
                req.session.userObj = JSON.parse(userObj);
                req.session.role = role[0].toUpperCase();

                if (role.indexOf('admin') !== -1 || role.indexOf('domainadmin') !== -1) {
                    next();
                } else {
                    if (role.indexOf('user') !== -1) {
                        if (req.url.includes("/dashboard") || req.url === '/profile' || req.url === '/userevents' || req.url === '/alexa') {
                            next();
                        } else {
                            console.log(new Date() + " | unauthorized access");
                            res.sendStatus(401)
                        }
                    }
                    else if (role.indexOf('developer') !== -1) {
                        if (req.url !== '/user-management') {
                            next();
                        } else {
                            console.log(new Date() + " | unauthorized access");
                            res.sendStatus(401)
                        }
                    } else {
                        if (req.url.includes("/dashboard") || req.url === '/profile' || req.url === '/userevents' || req.url === '/alexa') {
                            next();
                        } else {
                            console.log(new Date() + " | unauthorized access");
                            res.sendStatus(401)
                        }
                    }
                }
            } else {
                res.redirect('/login');
            }
        }
    };

    var onlyAdmin = function (req, res, next) {
        var userObj = req.cookies['user_details'];
        if(userObj) {
            var role = JSON.parse(userObj).user.roles;
            req.session.userObj = JSON.parse(userObj);

            if (role.indexOf('admin') !== -1 || role.indexOf('domainadmin') !== -1 || role.indexOf('developer') !== -1) {
                next();
            } else {
                console.log(new Date() + " | unauthorized access");
                res.sendStatus(401)
            }
        }else{
            res.redirect('/login');
        }
    };

    var billingModuleCheck = function (req, res, next) {
        var userObj = req.cookies['user_details'];
        if(userObj) {
            var role = JSON.parse(userObj).user.roles;
            req.session.userObj = JSON.parse(userObj);

            if (role.indexOf('admin') !== -1) {
                next();
            } else {
                console.log(new Date() + " | unauthorized access");
                res.sendStatus(401)
            }
        }else{
            res.redirect('/login');
        }
    };

    var sqlCheck = function (req, res, next) {
        var sql = req.cookies['sql_access'];
        if(sql) {
            if(sql === 'true') {
                next();
            } else {
                console.log(new Date() + " | unauthorized access");
                res.sendStatus(401)
            }
        }else{
            res.redirect('/404');
        }
    };

    var dbCheck = function (req, res, next) {
        var db = req.cookies['db_access'];
        if(db) {
            if(db === 'true') {
                next();
            } else {
                console.log(new Date() + " | unauthorized access");
                res.sendStatus(401)
            }
        }else{
            res.redirect('/404');
        }
    };

    self.app.get('/', function (req, res) {
        var userObj = req.cookies['user_details'];
        if(userObj) {
            var role = JSON.parse(userObj).user.roles;
            req.session.userObj = JSON.parse(userObj);

            if (role.indexOf('user') !== -1) {
                res.redirect('/dashboard');
            } else {
                res.redirect('/home');
            }

        }else{
            res.render('login.html',{layout:false});
        }
    });

    self.app.get('/login', function (req, res) {
        var userObj = req.cookies['user_details'];
        if(userObj) {
            var role = JSON.parse(userObj).user.roles;
            req.session.userObj = JSON.parse(userObj);

            if (role.indexOf('user') !== -1) {
                res.redirect('/dashboard');
            } else {
                res.redirect('/home');
            }
        }else{
            res.render('login.html', {layout: false});
        }
    });
    // self.app.get('/register', function (req, res) {
    //     var userObj = req.cookies['user_details'];
    //     if(userObj) {
    //         var role = JSON.parse(userObj).user.roles;
    //         req.session.userObj = JSON.parse(userObj);
    //
    //         if (role.indexOf('user') !== -1) {
    //             res.redirect('/dashboard');
    //         } else {
    //             res.redirect('/home');
    //         }
    //     }else{
    //         res.render('register.html', {layout: false});
    //     }
    // });
    self.app.get('/profile', roleCheck,function (req, res) {
        res.render('profile.html',{layout:'',userRole:req.session.role, response : ''});
    });
    self.app.get('/domain', roleCheck, function (req, res) {
        res.render('domain.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/home', roleCheck, function (req, res) {
        res.render('home.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/dashboard', roleCheck,function (req, res) {
        res.render('dashboard.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/userevents', roleCheck, function (req, res) {
        res.render('userevents.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/dashboard/:id', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',dashboardId:req.params.id, domainkey:'',token:'', public:false,userRole:req.session.role});
    });
    self.app.get('/linkeddomain', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',dashboardId:'',domainkey:'',token:'', public:false,userRole:req.session.role});
    });
    self.app.get('/dashboard/:id/preview', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',dashboardId:req.params.id, domainkey:'',token:'', public:false,userRole:req.session.role});
    });
    self.app.get('/public/dashboard/:domainkey/:token',function (req, res) {
        res.render('singledashboard.html',{layout:'',dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role});
    });
    self.app.get('/public/widget/:domainkey/:token',function (req, res) {
        res.render('singlewidget.html',{layout:'',dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role});
    });
    self.app.get('/dashboard-editor', roleCheck,function (req, res) {
        res.render('dashboard-editor.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/message-definition', roleCheck, function (req, res) {
        res.render('message-definition.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/record-definition', roleCheck, function (req, res) {
        res.render('record-definition.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/rules-engine', roleCheck, function (req, res) {
        res.render('rules-engine.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/script-console', roleCheck, function (req, res) {
        res.render('script-console.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/machine-learning', roleCheck, function (req, res) {
        res.render('machine-learning.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/machine-learning', roleCheck, function (req, res) {
        res.render('machine-learning.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/face-recognition', roleCheck, function (req, res) {
        res.render('face-recognition.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/block-chain', roleCheck, function (req, res) {
        res.render('block-chain.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/templates', roleCheck, function (req, res) {
        res.render('templates.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/events', roleCheck, function (req, res) {
        res.render('events.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/geofence', roleCheck, function (req, res) {
        res.render('geofence.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/geofence/create', roleCheck, function (req, res) {
        res.render('geofence-create.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/mobile-platform', roleCheck, function (req, res) {
        res.render('mobile-platform.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/device-management', roleCheck, function (req, res) {
        res.render('device-management.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/device-models', roleCheck, function (req, res) {
        res.render('device-models.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/sim-provisioning', roleCheck, function (req, res) {
        res.render('sim-provisioning.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/asset-management', roleCheck, function (req, res) {
        res.render('asset-management.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/firmware-management', roleCheck, function (req, res) {
        res.render('firmware-management.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/user-management', roleCheck, function (req, res) {
        res.render('user-management.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/user-group', roleCheck, function (req, res) {
        res.render('user-group.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/log-console', onlyAdmin, function (req, res) {
        res.render('log-console.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/query-console', onlyAdmin, function (req, res) {
        res.render('query-console.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/site-noop', billingModuleCheck, function (req, res) {
        res.render('site-noop.html',{layout:'',userRole:req.session.role});
    });


    //SQL Calls
    self.app.get('/sql-table', onlyAdmin, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-table.html',{layout:'',userRole:req.session.role});
        })

    });

    self.app.get('/sql-templates', roleCheck, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-templates.html', {layout: '', userRole: req.session.role});
        });
    });

    self.app.get('/sql-query-console', onlyAdmin, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-query-console.html',{layout:'',userRole:req.session.role});
        })

    });


    //DB Calls
    self.app.get('/db-table', onlyAdmin, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-table.html',{layout:'',userRole:req.session.role});
        })

    });

    self.app.get('/db-templates', roleCheck, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-templates.html', {layout: '', userRole: req.session.role});
        });
    });

    self.app.get('/db-query-console', onlyAdmin, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-query-console.html',{layout:'',userRole:req.session.role});
        })

    });


    self.app.get('/messages', roleCheck, function (req, res) {
        res.render('messages.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/domain-audit', roleCheck, function (req, res) {
        res.render('domain-audit.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/event-logs', roleCheck, function (req, res) {
        res.render('event-logs.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/firmware/ota-upgrade', roleCheck, function (req, res) {
        res.render('ota-upgrade.html',{layout:'',userRole:req.session.role});
    });


    self.app.get('/marketplace', roleCheck, function (req, res) {
        res.render('marketplace.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/marketplace/widgets', roleCheck, function (req, res) {
        res.render('widgets.html',{layout:'', query:req.query,userRole:req.session.role});
    });
    self.app.get('/marketplace/addwidget', roleCheck, function (req, res) {
        res.render('addwidget.html',{layout:'', widgetId:'',userRole:req.session.role});
    });
    self.app.get('/marketplace/addwidget/:id', roleCheck, function (req, res) {
        res.render('addwidget.html',{layout:'', widgetId:req.params.id,userRole:req.session.role});
    });

    self.app.get('/marketplace/verticals', roleCheck, function (req, res) {
        res.render('verticals.html',{layout:'', query:req.query,userRole:req.session.role});
    });
    self.app.get('/marketplace/addvertical', roleCheck, function (req, res) {
        res.render('addvertical.html',{layout:'',verticalId:'', userRole:req.session.role});
    });
    self.app.get('/marketplace/addvertical/:id', roleCheck, function (req, res) {
        res.render('addvertical.html',{layout:'', verticalId:req.params.id,userRole:req.session.role});
    });

    /*self.app.get('/simulator', onlyAdmin, function (req, res) {
        res.render('simulator.html',{layout:'',userRole:req.session.role});
    });*/
    self.app.get('/files', roleCheck, function (req, res) {
        res.render('files.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/documentation', roleCheck, function (req, res) {
        res.render('api-docs.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/alexa', roleCheck, function (req, res) {
        res.render('alexa.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/code-editor', roleCheck, function (req, res) {
        res.render('code-editor.html',{layout:'',userRole:req.session.role});
    });


    self.app.get('/mobileapp', roleCheck, function (req, res) {
        res.render('navigator.html',{layout:self.mobileLayout, userObj : req.session.userObj, domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role});
    });

    // Publish as website
    self.app.get('/publish/:domainkey/:token',function (req, res) {
        res.render('publicdashboard.html',{layout:'',dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role});
    });


    self.app.get('/callback/thirdparty/:id', function (req, res) {
        res.render('profile.html',{layout:'',userRole:'', response : {type: req.params['id']}});
    });


    //Plugins
    self.app.get('/plugin-management', roleCheck,function (req, res) {
        res.render('plugins.html',{layout:'',userRole:req.session.role});
    });


    //Billing
    self.app.get('/manage-billing', billingModuleCheck, function (req, res) {
        res.render('billing-management.html',{layout:'',userRole:req.session.role});
    });
    self.app.get('/invoice', roleCheck, function (req, res) {
        res.render('invoice.html',{layout:'',userRole:req.session.role});
    });


    self.app.get('/status',function (req, res) {
        res.render('public-status.html',{layout:false});
    });

    self.app.get('/configuration',function (req, res) {
        res.render('configuration.html',{layout:false});
    });

    self.app.get('/404', roleCheck,function (req, res) {
        res.render('404.html',{layout:'',userRole:req.session.role});
    });

    self.app.get('/:key', function (req, res) {
        var userObj = req.cookies['user_details'];
        if(!userObj) {
            res.render('login.html',{layout:false});

        }else{
            res.redirect("/404");
        }

    });



};

