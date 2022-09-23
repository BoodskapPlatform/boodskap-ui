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
                cbk(result.licensed);

            } else {
                cbk(false)
            }
        }else{
            cbk(false)
        }

    });
}
License.prototype.applyLicense = function (apiUrl,req,res){

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