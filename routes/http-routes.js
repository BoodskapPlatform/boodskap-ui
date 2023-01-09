const YAML = require('yamljs');
const request = require('request');
const async = require('async');

const License = require('../modules/license');

var Routes = function (app,router) {

    this.app = app;
    this.router = router;
    this.init();

    this.license = new License(app);

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

    var mongoCheck = function (req, res, next) {
        var db = req.cookies['mongo_access'];
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

    var cassandraCheck = function (req, res, next) {
        var db = req.cookies['cassandra_access'];
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
            res.redirect(self.app.conf.basepath+'/login');
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
               /*  let apiUrl = self.app.conf.development ? self.app.conf.api : self.app.conf.protocol+"://"+req.headers.host+self.app.conf.api;
               
                self.license.getLicense(apiUrl,function (status, result){
                    console.log("***************** License Status *********************");
                    console.log("API : "+apiUrl);
                    console.log("Response : "+status);
                    console.log(result);
                    console.log("***************** License status *********************");
                    if(status && (result != null)){
                        if(!result["licensed"]){
                            res.redirect(self.app.conf.basepath+'/license-activation');
                        }else if(!result["accountActive"]){
                            res.redirect(self.app.conf.basepath+'/account-activation');
                        }else if(!result["domainActive"] ){
                            res.redirect(self.app.conf.basepath+'/domain-activation');
                        }else{
                            res.render('login.html', {layout:false,basepath: getBasePath(req),key:''});
                        }
                    }else{
                        res.redirect(self.app.conf.basepath+'/license-activation');
                    }
                }); */

                res.render('login.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
            }
    });

    self.router.get('/register',function (req, res) {
        res.render('register.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/forgotpassword',function (req, res) {
        res.render('forgotpassword.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/success',function (req, res) {
        res.render('success-message.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/registerSuccess',function (req, res) {
        res.render('register-success.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
    });
    

    self.router.get('/license-activation',function (req, res) {
        let apiUrl = self.app.conf.development ? self.app.conf.api : self.app.conf.protocol+"://"+req.headers.host+self.app.conf.api;
        self.license.getLicense(apiUrl,function (status, result){
            if(status){
                if(!result["licensed"]){
                    res.render('license-activation.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
                }else{
                    res.redirect(self.app.conf.basepath+'/login');
                }
            }else{
                res.render('license-activation.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
            }
        });
    });
    self.router.get('/account-activation',function (req, res) {
        let apiUrl = self.app.conf.development ? self.app.conf.api : self.app.conf.protocol+"://"+req.headers.host+self.app.conf.api;
        self.license.getLicense(apiUrl,function (status, result){
            if(status){
                if(!result["accountActive"]){
                    res.render('account-activation.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
                }else{
                    res.redirect(self.app.conf.basepath+'/login');
                }
            }else{
                res.render('account-activation.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
            }
        });
    });
    self.router.get('/domain-activation',function (req, res) {
        let apiUrl = self.app.conf.development ? self.app.conf.api : self.app.conf.protocol+"://"+req.headers.host+self.app.conf.api;
        self.license.getLicense(apiUrl,function (status, result){
            if(status){
                if(!result["domainActive"]){
                    res.render('domain-activation.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
                }else{
                    res.redirect(self.app.conf.basepath+'/login');
                }
            }else{
                res.render('domain-activation.html', {layout:false,basepath: getBasePath(req),key:'', buildVersion: self.app.conf.buildVersion});
            }
        });
    });
    self.router.post('/apply/cluster-license',function (req, res) {
        let apiUrl = self.app.conf.development ? self.app.conf.api : self.app.conf.protocol+"://"+req.headers.host+self.app.conf.api;
        self.license.applyClusterLicense(apiUrl,req,res)
    });
    self.router.post('/apply/account-license',function (req, res) {
        let apiUrl = self.app.conf.development ? self.app.conf.api : self.app.conf.protocol+"://"+req.headers.host+self.app.conf.api;
        self.license.applyAccountLicense(apiUrl,req,res)
    });
    self.router.post('/apply/domain-license',function (req, res) {
        let apiUrl = self.app.conf.development ? self.app.conf.api : self.app.conf.protocol+"://"+req.headers.host+self.app.conf.api;
        self.license.applyDomainLicense(apiUrl,req,res)
    });
    self.router.get('/profile', roleCheck,function (req, res) {
        res.render('profile.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, response : '', buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/updateUserPassword', roleCheck,function (req, res) {
        res.render('updateUserPassword.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, response : '', buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/userDomain', roleCheck,function (req, res) {
        res.render('userDomain.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, response : '', buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/domain', roleCheck, function (req, res) {
        res.render('domain.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/home', roleCheck, function (req, res) {
        res.render('home.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/statistics-dashboard', roleCheck, function (req, res) {
        res.render('statistics-dashboard.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/dashboard', roleCheck,function (req, res) {
        res.render('dashboard.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/userevents', roleCheck, function (req, res) {
        res.render('userevents.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/dashboard/:id', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:req.params.id, domainkey:'',token:'', public:false,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/linkeddomain', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:'',domainkey:'',token:'', public:false,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/dashboard/:id/preview', roleCheck,function (req, res) {
        res.render('singledashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:req.params.id, domainkey:'',token:'', public:false,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/public/dashboard/:domainkey/:token',function (req, res) {
        res.render('singledashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/public/widget/:domainkey/:token',function (req, res) {
        res.render('singlewidget.html',{layout:'',basepath: getBasePath(req), dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/dashboard-editor', roleCheck,function (req, res) {
        res.render('dashboard-editor.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/message-definition', roleCheck, function (req, res) {
        res.render('message-definition.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/record-definition', roleCheck, function (req, res) {
        res.render('record-definition.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/rules-engine', roleCheck, function (req, res) {
        res.render('rules-engine.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/script-console', roleCheck, function (req, res) {
        res.render('script-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/machine-learning', roleCheck, function (req, res) {
        res.render('machine-learning.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/machine-learning', roleCheck, function (req, res) {
        res.render('machine-learning.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/face-recognition', roleCheck, function (req, res) {
        res.render('face-recognition.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/block-chain', roleCheck, function (req, res) {
        res.render('block-chain.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/templates', roleCheck, function (req, res) {
        res.render('templates.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/events', roleCheck, function (req, res) {
        res.render('events.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/geofence', roleCheck, function (req, res) {
        res.render('geofence.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/geofence/create', roleCheck, function (req, res) {
        res.render('geofence-create.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/mobile-platform', roleCheck, function (req, res) {
        res.render('mobile-platform.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/device-management', roleCheck, function (req, res) {
        res.render('device-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/device-models', roleCheck, function (req, res) {
        res.render('device-models.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/sim-provisioning', roleCheck, function (req, res) {
        res.render('sim-provisioning.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/asset-management', roleCheck, function (req, res) {
        res.render('asset-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/firmware-management', roleCheck, function (req, res) {
        res.render('firmware-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/user-management', roleCheck, function (req, res) {
        res.render('user-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/token-management', roleCheck, function (req, res) {
        res.render('token-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/user-group', roleCheck, function (req, res) {
        res.render('user-group.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/log-console', onlyAdmin, function (req, res) {
        res.render('log-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/query-console', onlyAdmin, function (req, res) {
        res.render('query-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/mongodb', onlyAdmin, function (req, res) {
        res.render('mongodb.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/mongo-console', onlyAdmin, function (req, res) {
        res.render('mongo-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    // self.router.get('/site-noop', billingModuleCheck, function (req, res) {
    //     res.render('site-noop.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role});
    // });


    //SQL Calls
    self.router.get('/sql-table', onlyAdmin, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-table.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
        })

    });

    self.router.get('/sql-templates', roleCheck, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-templates.html', {layout:'',basepath: getBasePath(req), userRole: req.session.role, buildVersion: self.app.conf.buildVersion});
        });
    });

    self.router.get('/sql-query-console', onlyAdmin, function (req, res) {
        sqlCheck(req, res, function () {
            res.render('sql-query-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
        })

    });


    //DB Calls
    self.router.get('/db-table', onlyAdmin, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-table.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
        })

    });

    self.router.get('/db-templates', roleCheck, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-templates.html', {layout:'',basepath: getBasePath(req), userRole: req.session.role, buildVersion: self.app.conf.buildVersion});
        });
    });

    self.router.get('/db-query-console', onlyAdmin, function (req, res) {
        dbCheck(req, res, function () {
            res.render('db-query-console.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
        })

    });


    self.router.get('/messages', roleCheck, function (req, res) {
        res.render('messages.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/domain-audit', roleCheck, function (req, res) {
        res.render('domain-audit.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/event-logs', roleCheck, function (req, res) {
        res.render('event-logs.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/firmware/ota-upgrade', roleCheck, function (req, res) {
        res.render('ota-upgrade.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/marketplace', roleCheck, function (req, res) {
        res.render('marketplacev4.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/device-tokens', roleCheck, function (req, res) {
        res.render('device-tokens.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    // self.router.get('/marketplacev5', roleCheck, function (req, res) {
    //     res.render('marketplace.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    // });

    self.router.get('/widgets', roleCheck, function (req, res) {
        res.render('widgets.html',{layout:'',basepath: getBasePath(req),  query:req.query,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/widget/addwidget', roleCheck, function (req, res) {
        res.render('addwidget.html',{layout:'',basepath: getBasePath(req),  widgetId:'',userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/widget/editwidget/:id', roleCheck, function (req, res) {
        res.render('addwidget.html',{layout:'',basepath: getBasePath(req),  widgetId:req.params.id,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

   /* self.router.get('/marketplace/verticals', roleCheck, function (req, res) {
        res.render('verticals.html',{layout:'',basepath: getBasePath(req),  query:req.query,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/marketplace/addvertical', roleCheck, function (req, res) {
        res.render('addvertical.html',{layout:'',basepath: getBasePath(req), verticalId:'', userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });
    self.router.get('/marketplace/addvertical/:id', roleCheck, function (req, res) {
        res.render('addvertical.html',{layout:'',basepath: getBasePath(req),  verticalId:req.params.id,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });*/

    /*self.router.get('/simulator', onlyAdmin, function (req, res) {
        res.render('simulator.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });*/
    self.router.get('/files', roleCheck, function (req, res) {
        res.render('files.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/documentation', roleCheck, function (req, res) {
        res.render('api-docs.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/alexa', roleCheck, function (req, res) {
        res.render('alexa.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/code-editor', roleCheck, function (req, res) {
        res.render('code-editor.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });


    self.router.get('/mobileapp', roleCheck, function (req, res) {
        res.render('navigator.html',{layout:self.mobileLayout, userObj : req.session.userObj, domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    // Publish as website
    self.router.get('/publish/:domainkey/:token',function (req, res) {
        res.render('publicdashboard.html',{layout:'',basepath: getBasePath(req), dashboardId:'', domainkey:req.params.domainkey, token: req.params.token, public:true,userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });


    self.router.get('/callback/thirdparty/:id', function (req, res) {
        res.render('profile.html',{layout:'',basepath: getBasePath(req), userRole:'', response : {type: req.params['id']}, buildVersion: self.app.conf.buildVersion});
    });


    //Plugins
    self.router.get('/plugin-management', roleCheck,function (req, res) {
        res.render('plugins.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });


    //Billing
    // self.router.get('/manage-billing', billingModuleCheck, function (req, res) {
    //     res.render('billing-management.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    // });
    // self.router.get('/invoice', roleCheck, function (req, res) {
    //     res.render('invoice.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    // });


    self.router.get('/status',function (req, res) {
        res.render('public-status.html',{layout:false,basepath: getBasePath(req), buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/configuration',function (req, res) {
        res.render('configuration.html',{layout:false,basepath: getBasePath(req), buildVersion: self.app.conf.buildVersion });
    });

    self.router.get('/spec',function (req, res) {
        var version = '3.0.2/3.0.2';
        if(req.query.version){
            if(!req.query.version.includes(" ")){
                version = req.query.version+"/"+req.query.version;
            }

        }


        var resultFlag = false;

        async.series({
            apiSpec : function (asCbk) {
                console.log("Fetching from =>", self.app.conf.protocol + "://" + req.headers.host + '/api/global/swagger/spec/file/download')
                request.get({
                    uri: self.app.conf.protocol + "://" + req.headers.host + '/api/global/swagger/spec/file/download',
                    headers: {'Accepts': 'text/yaml'},
                }, function (err, resp, body) {

                    if (!err) {

                        if (resp.statusCode === 200) {
                            console.log("Fetched from =>", self.app.conf.protocol + "://" + req.headers.host + '/api/global/swagger/spec/file/download')
                            asCbk('exit', resp.body)
                        } else {
                            console.log("Error Fetching from =>", self.app.conf.protocol + "://" + req.headers.host + '/api/global/swagger/spec/file/download')
                            asCbk(null, null)
                        }

                    } else {
                        console.log("Error Fetching from =>", self.app.conf.protocol + "://" + req.headers.host + '/api/global/swagger/spec/file/download')
                        asCbk(null, null)
                    }
                })
            },
            devSpec : function (dsCbk){
                try {
                    console.log("Fetched from => api-dev.yaml")
                    resultFlag = true;
                    const swaggerDocument = YAML.load('./yaml/api-dev.yaml');
                    dsCbk('exit', swaggerDocument)
                } catch (e) {
                    dsCbk(null, null)
                }
            },
            gitApiSpec : function (gasCbk){
                    console.log("Fetching from =>",'https://cdn.jsdelivr.net/gh/BoodskapPlatform/apidoc@'+version+'/api.yaml')
                    request.get({
                        uri: 'https://cdn.jsdelivr.net/gh/BoodskapPlatform/apidoc@'+version+'/api.yaml',
                        headers: {'Accepts': 'text/yaml'},
                    }, function (err, resp, body) {

                        if (!err) {

                            if (resp.statusCode === 200) {
                                resultFlag=true;
                                console.log("Fetched from =>",'https://cdn.jsdelivr.net/gh/BoodskapPlatform/apidoc@'+version+'/api.yaml')
                                gasCbk('exit', resp.body)
                            } else {
                                console.log("Error Fetching from =>",'https://cdn.jsdelivr.net/gh/BoodskapPlatform/apidoc@'+version+'/api.yaml')
                                gasCbk(null, null)
                            }

                        } else {
                            console.log("Error Fetching from =>",'https://cdn.jsdelivr.net/gh/BoodskapPlatform/apidoc@'+version+'/api.yaml')
                            gasCbk(null, null)
                        }

                    });
            },
            localSpec : function (lsCbk){
                console.log("Fetched from => api.yaml")
                resultFlag = true;
                const swaggerDocument = YAML.load('./yaml/api.yaml');
                lsCbk('exit', swaggerDocument)
            }
        },function(err,results){
            if(results.apiSpec){
                res.setHeader('Content-Type', 'text/yaml')
                res.send(results.apiSpec);
            }
            else if(results.devSpec){
                res.json(results.devSpec)
            }
            else if(results.gitApiSpec){
                res.setHeader('Content-Type', 'text/yaml')
                res.send(results.gitApiSpec);
            }else{
                res.json(results.localSpec)
            }
        });

    });

    self.router.get('/swagger-doc',function (req, res) {
        res.render('swagger.html',{layout:false,basepath: getBasePath(req), buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/404', roleCheck,function (req, res) {
        res.render('404.html',{layout:'',basepath: getBasePath(req), userRole:req.session.role, buildVersion: self.app.conf.buildVersion});
    });

    self.router.get('/:key', function (req, res) {
        var userObj = req.cookies['user_details'];
        if(!userObj) {
            res.render('login.html',{layout:false,basepath: getBasePath(req),key:req.params['key'], buildVersion: self.app.conf.buildVersion});

        }else{
            res.redirect(getBasePath(req)+"/404");
        }

    });

    self.app.use(self.app.conf.basepath,self.router);
};

