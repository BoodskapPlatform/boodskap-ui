var request = require("request")

var License = function (app){
}
module.exports = License;


License.prototype.getLicense = function (apiUrl,cbk){

    request.get({
            uri: apiUrl + '/license/status',
        headers: {'content-type': 'application/json'},

    }, function (err, res, body) {
        if(!err) {
            if (res.statusCode === 200) {
                let result =  JSON.parse(res.body);
                cbk(true, result);
            } else {
                cbk(false, null)
            }
        }else{
            cbk(false, null)
        }
    });
}
License.prototype.applyClusterLicense = function (apiUrl,req,res){

    console.log("applyClusterLicense-----------------------");
    console.log(apiUrl);
    console.log(req.body.data);

    request.post({
        uri: apiUrl + '/license/cluster/apply',
        headers: {'content-type': 'text/plain'},
        body: JSON.stringify(req.body.data),

    }, function (err, resp, body) {

        if(!err) {

            if (resp.statusCode === 200) {
                res.json({status:true,result:resp.body})
            } else {
                res.json({status:false,result:resp.body})
            }
        }else{
            res.json({status:false,result:err})
        }
    });
}

License.prototype.applyAccountLicense = function (apiUrl,req,res){

    console.log("applyAccountLicense-----------------------");
    console.log(apiUrl);
    console.log(req.body.data);

    request.post({
        uri: apiUrl + '/license/account/apply',
        headers: {'content-type': 'text/plain'},
        body: JSON.stringify(req.body.data),

    }, function (err, resp, body) {

        if(!err) {

            if (resp.statusCode === 200) {
                res.json({status:true,result:resp.body})
            } else {
                res.json({status:false,result:resp.body})
            }
        }else{
            res.json({status:false,result:err})
        }
    });
}

License.prototype.applyDomainLicense = function (apiUrl,req,res){

    console.log("applyDomainLicense-----------------------");
    console.log(apiUrl);
    console.log(req.body.data);

    request.post({
        uri: apiUrl + '/license/domain/apply',
        headers: {'content-type': 'text/plain'},
        body: JSON.stringify(req.body.data),

    }, function (err, resp, body) {

        if(!err) {

            if (resp.statusCode === 200) {
                res.json({status:true,result:resp.body})
            } else {
                res.json({status:false,result:resp.body})
            }
        }else{
            res.json({status:false,result:err})
        }
    });
}