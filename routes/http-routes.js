const YAML = require('yamljs');
const request = require('request');

var Routes = function (app,router) {

    this.app = app;
    this.router = router;
    this.init();


    this.mobileLayout = app.mobileLayout;

};
module.exports = Routes;



Routes.prototype.init = function () {

    var self = this;

    var getBasePath = function (req) {
        return self.app.conf.protocol+"://"+req.headers.host+""+self.app.conf.basepath
    }

    var roleCheck = function (req, res, next) {
        var userObj = req.cookies['user_details'];
        var partDomain = req.cookies['partDomain'];
        if(partDomain && partDomain === 'false'){
            res.redirect(self.app.conf.basepath+'/login');
        }else {
            if (userObj) {
                var role = JSON.parse(userObj).user.roles;
                req.session.userObj = JSON.parse(userObj);
                req.session.role = role[0].toUpperCase();

                if (role.indexOf('admin') !== -1 || role.indexOf('domainadmin') !== -1) {
                    next();
                } else {
                    if (role.indexOf('user') !== -1) {
                        if (req.url.includes("/dashboard") || req.url.includes('/profile') || req.url.includes('/userevents') || req.url.includes('/alexa')) {
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
                res.redirect(self.app.conf.basepath+'/login');
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
            res.redirect(self.app.conf.basepath+'/login');
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
            res.redirect(getBasePath(req)+'/login');
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
            res.redirect(self.app.conf.basepath+'/404');
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
            res.redirect(self.app.conf.basepath+'/404');
        }
    };

    self.router.get('/', function (req, res) {
        var userObj = req.cookies['user_details'];
        if(userObj) {
            var role = JSON.parse(userObj).user.roles;
            req.session.userObj = JSON.parse(userObj);

            if (role.indexOf('user') !== -1) {
                res.redirect(self.app.conf.basepath+'/dashboard');
            } else {
                res.redirect(self.app.conf.basepath+'/home');
            }

        }else{
            res.render('login.html',{layout:false,basepath: getBasePath(req),});
        }
    });

    self.router.get('/login', function (req, res) {
        var userObj = req.cookies['user_details'];
        if(userObj) {
            var role = JSON.parse(userObj).user.roles;
            req.session.userObj = JSON.parse(userObj);

            if (role.indexOf('user') !== -1) {
                res.redirect(self.app.conf.basepath+'/dashboard');
            } else {
                res.redirect(self.app.conf.basepath+'/home');
            }
        }else{
            res.render('login.html', {layout:false,basepath: getBasePath(req),});
        }
    });
    // self.router.get('/register', function (req, res) {
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
    //         res.render('register.html', {layout:false,basepath: getBasePath(req),});
    //     }
    // });
    self.router.get('/profile', roleCheck,function (req, res) {
        res.render('profile.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, response : ''});
    });
    self.router.get('/domain', roleCheck, function (req, res) {
        res.render('domain.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/home', roleCheck, function (req, res) {
        res.render('home.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/dashboard', roleCheck,function (req, res) {
        res.render('dashboard.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/userevents', roleCheck, function (req, res) {
        res.render('userevents.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/dashboard/:id', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:req.params.id, domainkey:'',token:'', public:false,userRole:req.session.role});
    });
    self.router.get('/linkeddomain', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:'',domainkey:'',token:'', public:false,userRole:req.session.role});
    });
    self.router.get('/dashboard/:id/preview', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:req.params.id, domainkey:'',token:'', public:false,userRole:req.session.role});
    });
    self.router.get('/public/dashboard/:domainkey/:token',function (req, res) {
        res.render('singledashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role});
    });
    self.router.get('/public/widget/:domainkey/:token',function (req, res) {
        res.render('singlewidget.html',{layout:'',basepath: getBasePath(req), dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role});
    });
    self.router.get('/dashboard-editor', roleCheck,function (req, res) {
        res.render('dashboard-editor.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/message-definition', roleCheck, function (req, res) {
        res.render('message-definition.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/record-definition', roleCheck, function (req, res) {
        res.render('record-definition.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/rules-engine', roleCheck, function (req, res) {
        res.render('rules-engine.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/script-console', roleCheck, function (req, res) {
        res.render('script-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/machine-learning', roleCheck, function (req, res) {
        res.render('machine-learning.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/machine-learning', roleCheck, function (req, res) {
        res.render('machine-learning.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/face-recognition', roleCheck, function (req, res) {
        res.render('face-recognition.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/block-chain', roleCheck, function (req, res) {
        res.render('block-chain.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/templates', roleCheck, function (req, res) {
        res.render('templates.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/events', roleCheck, function (req, res) {
        res.render('events.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/geofence', roleCheck, function (req, res) {
        res.render('geofence.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/geofence/create', roleCheck, function (req, res) {
        res.render('geofence-create.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/mobile-platform', roleCheck, function (req, res) {
        res.render('mobile-platform.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/device-management', roleCheck, function (req, res) {
        res.render('device-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/device-models', roleCheck, function (req, res) {
        res.render('device-models.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/sim-provisioning', roleCheck, function (req, res) {
        res.render('sim-provisioning.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/asset-management', roleCheck, function (req, res) {
        res.render('asset-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/firmware-management', roleCheck, function (req, res) {
        res.render('firmware-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/user-management', roleCheck, function (req, res) {
        res.render('user-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/user-group', roleCheck, function (req, res) {
        res.render('user-group.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/log-console', onlyAdmin, function (req, res) {
        res.render('log-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/query-console', onlyAdmin, function (req, res) {
        res.render('query-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/site-noop', billingModuleCheck, function (req, res) {
        res.render('site-noop.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });


    //SQL Calls
    self.router.get('/sql-table', onlyAdmin, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-table.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
        })

    });

    self.router.get('/sql-templates', roleCheck, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-templates.html', {layout:'',basepath: getBasePath(req), userRole: req.session.role});
        });
    });

    self.router.get('/sql-query-console', onlyAdmin, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-query-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
        })

    });


    //DB Calls
    self.router.get('/db-table', onlyAdmin, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-table.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
        })

    });

    self.router.get('/db-templates', roleCheck, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-templates.html', {layout:'',basepath: getBasePath(req), userRole: req.session.role});
        });
    });

    self.router.get('/db-query-console', onlyAdmin, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-query-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
        })

    });


    self.router.get('/messages', roleCheck, function (req, res) {
        res.render('messages.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/domain-audit', roleCheck, function (req, res) {
        res.render('domain-audit.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/event-logs', roleCheck, function (req, res) {
        res.render('event-logs.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/firmware/ota-upgrade', roleCheck, function (req, res) {
        res.render('ota-upgrade.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/marketplace', roleCheck, function (req, res) {
        res.render('marketplace.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/widgets', roleCheck, function (req, res) {
        res.render('widgets.html',{layout:'',basepath: getBasePath(req),  query:req.query,userRole:req.session.role});
    });
    self.router.get('/widget/addwidget', roleCheck, function (req, res) {
        res.render('addwidget.html',{layout:'',basepath: getBasePath(req),  widgetId:'',userRole:req.session.role});
    });
    self.router.get('/widget/editwidget/:id', roleCheck, function (req, res) {
        res.render('addwidget.html',{layout:'',basepath: getBasePath(req),  widgetId:req.params.id,userRole:req.session.role});
    });

   /* self.router.get('/marketplace/verticals', roleCheck, function (req, res) {
        res.render('verticals.html',{layout:'',basepath: getBasePath(req),  query:req.query,userRole:req.session.role});
    });
    self.router.get('/marketplace/addvertical', roleCheck, function (req, res) {
        res.render('addvertical.html',{layout:'',basepath: getBasePath(req), verticalId:'', userRole:req.session.role});
    });
    self.router.get('/marketplace/addvertical/:id', roleCheck, function (req, res) {
        res.render('addvertical.html',{layout:'',basepath: getBasePath(req),  verticalId:req.params.id,userRole:req.session.role});
    });*/

    /*self.router.get('/simulator', onlyAdmin, function (req, res) {
        res.render('simulator.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });*/
    self.router.get('/files', roleCheck, function (req, res) {
        res.render('files.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/documentation', roleCheck, function (req, res) {
        res.render('api-docs.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/alexa', roleCheck, function (req, res) {
        res.render('alexa.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/code-editor', roleCheck, function (req, res) {
        res.render('code-editor.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });


    self.router.get('/mobileapp', roleCheck, function (req, res) {
        res.render('navigator.html',{layout:self.mobileLayout, userObj : req.session.userObj, domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role});
    });

    // Publish as website
    self.router.get('/publish/:domainkey/:token',function (req, res) {
        res.render('publicdashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role});
    });


    self.router.get('/callback/thirdparty/:id', function (req, res) {
        res.render('profile.html',{layout:'',basepath: getBasePath(req), userRole:'', response : {type: req.params['id']}});
    });


    //Plugins
    self.router.get('/plugin-management', roleCheck,function (req, res) {
        res.render('plugins.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });


    //Billing
    self.router.get('/manage-billing', billingModuleCheck, function (req, res) {
        res.render('billing-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });
    self.router.get('/invoice', roleCheck, function (req, res) {
        res.render('invoice.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });


    self.router.get('/status',function (req, res) {
        res.render('public-status.html',{layout:false,basepath: getBasePath(req),});
    });

    self.router.get('/configuration',function (req, res) {
        res.render('configuration.html',{layout:false,basepath: getBasePath(req) });
    });

    self.router.get('/spec',function (req, res) {
        var version = '3.0.2/3.0.2';
        if(req.query.version){
            if(!req.query.version.includes(" ")){
                version = req.query.version+"/"+req.query.version;
            }

        }
        request.get({
            uri: 'https://cdn.jsdelivr.net/gh/BoodskapPlatform/apidoc@'+version+'/api.yaml',
            headers: {'Accepts': 'text/yaml'},
        }, function (err, resp, body) {

            if (!err) {

                if (resp.statusCode === 200) {
                    res.setHeader('Content-Type', 'text/yaml')
                    res.send(resp.body);
                } else {
                    const swaggerDocument = YAML.load('./yaml/api.yaml');
                    res.json(swaggerDocument);
                }

            } else {
                const swaggerDocument = YAML.load('./yaml/api.yaml');
                res.json(swaggerDocument);
            }

        });



    });
    self.router.get('/swagger-doc',function (req, res) {
        res.render('swagger.html',{layout:false,basepath: getBasePath(req)});
    });

    self.router.get('/404', roleCheck,function (req, res) {
        res.render('404.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    });

    self.router.get('/:key', function (req, res) {
        var userObj = req.cookies['user_details'];
        if(!userObj) {
            res.render('login.html',{layout:false,basepath: getBasePath(req) });

        }else{
            res.redirect(getBasePath(req)+"/404");
        }

    });

    self.app.use(self.app.conf.basepath,self.router);


};

