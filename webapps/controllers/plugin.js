var pluginTable = null;
var plugin_list = [];
var current_plugin_obj = {};
var current_plugin_id = null;

var md = window.markdownit()

$(document).ready(function () {

    loadPlugins();

    $(".pluginList").css('height',$(window).height()-330)
    $(".contentBlock").css('height',$(window).height()-250)

    $("body").removeClass('bg-white');

});

function loadPlugins() {


        var searchText = $.trim($("#searchText").val());


        var queryParams = {
            "query": {
                "bool": {
                    "must": []
                }
            },
            "size": 50
        };

        if (searchText !== '') {
            var searchJson = {
                "multi_match": {
                    "query": '*' + searchText + '*',
                    "type": "phrase_prefix",
                    "fields": ['_all']
                }
            };
            queryParams.query['bool']['must'] = [searchJson];

        } else {
            queryParams.query['bool']['must'] = [];
        }




        var searchQuery = {
            "method": 'GET',
            "extraPath": "",
            "query": JSON.stringify(queryParams),
            "params": []
        };



        searchByQuery('', 'PLUGIN', searchQuery, function (status, res) {

            if (status) {

                var resultData = QueryFormatter(res).data;
                $(".pluginCount").html(resultData.recordsTotal);
                plugin_list = resultData['data'];
                var str = ''
                for(var i=0;i<plugin_list.length;i++){
                    var val = plugin_list[i];
                    str += '<li><span onclick="loadData(1,\''+val.id+'\')">'+ val.contextId+' [<b>'+val.version+'</b>] <small>'+val.type+'</small></span>';

                    var subStr = ''

                    if(val.config){
                        subStr += '<li data-jstree=\'{ "icon" : "icon-cog" }\'><span onclick="loadData(2,\''+val.id+'\')">Configuration</span></li>';
                    }

                    if(val.props.length > 0){
                        subStr += '<li  data-jstree=\'{ "icon" : "icon-file-text" }\'><span onclick="loadData(3,\''+val.id+'\')">Properties</span></li>';
                    }

                    if(val.lookups.length > 0){
                        subStr += '<li  data-jstree=\'{ "icon" : "icon-file-text" }\'><span onclick="loadData(4,\''+val.id+'\')">Lookups</span></li>';
                    }

                    if(val.docs.length > 0){
                        subStr += '<li  data-jstree=\'{ "icon" : "icon-file-text" }\'><span onclick="loadData(5,\''+val.id+'\')">Documentation</span></li>';

                    }

                    // if(ADMIN_ACCESS){
                        if(val.sysprops.length > 0){
                            subStr += '<li  data-jstree=\'{ "icon" : "icon-file-text" }\'><span onclick="loadData(6,\''+val.id+'\')">System Properties</span></li>';
                        }
                        if(val.syslookups.length > 0){
                            subStr += '<li  data-jstree=\'{ "icon" : "icon-file-text" }\'><span onclick="loadData(7,\''+val.id+'\')">System Lookups</li>';
                        }
                    // }

                    if(val.readme){
                        subStr += '<li data-jstree=\'{ "icon" : "icon-file-text" }\'><span onclick="loadData(8,\''+val.id+'\')">Readme</li>';
                    }

                    if(subStr){
                        str += '<ul>'+subStr+'</ul>';
                    }

                    str +='</li>'

                }

                $(".pluginList").html('<div id="pluginList"><ul>'+str+'</ul></div>')

                $('#pluginList').jstree();

            }


        })



}

function loadData(type,id) {
    current_plugin_obj = {};
    current_plugin_id = id;
    var obj = {}

    $(".contentBlock").html('<h5 style="margin-top: 25%;text-align: center"><i class="icon-spinner icon-spin"></i> Loading..</h5>')

    for (var i = 0; i < plugin_list.length; i++) {
        if (id === plugin_list[i].id) {
            current_plugin_obj = plugin_list[i];
        }
    }
    obj = current_plugin_obj;


    if(type === 1){

        $(".contentBlock").html('<h5 style="text-transform: uppercase">'+obj.contextId +' Readme</h5><hr>'+md.render(obj.readme))

    }else if(type === 2){
        $(".contentBlock").html('<h5 style="text-transform: uppercase">'+obj.contextId +' Configuration</h5><hr>')

        loadConfiguration(obj);

    }else if(type === 3){
        $(".contentBlock").html('<h5 style="text-transform: uppercase">'+obj.contextId +' Properties</h5><hr>')
        loadProperties(obj);

    }else if(type === 4){

        $(".contentBlock").html('<h5 style="text-transform: uppercase">'+obj.contextId +' Lookups</h5><hr>')
        loadLookups(obj);

    }else if(type === 5){
        $(".contentBlock").html('<h5 style="text-transform: uppercase">'+obj.contextId +' Documentation</h5><hr>')
        loadDocumentation(obj);

    }else if(type === 6){
        $(".contentBlock").html('<h5 style="text-transform: uppercase">'+obj.contextId +' System Properties</h5><hr>')
        loadSysProperties(obj);

    }else if(type === 7){
        $(".contentBlock").html('<h5 style="text-transform: uppercase">'+obj.contextId +' System Lookups</h5><hr>')
        loadSysLookups(obj);

    }else{
        $(".contentBlock").html('<h5 style="text-transform: uppercase">'+obj.contextId +' Readme</h5><hr>'+md.render(obj.readme))
    }
}


/*function loadPlugins() {


    if (pluginTable) {
        pluginTable.destroy();
        $("#pluginTable").html("");
    }

    var fields = [
        {
            mData: 'contextId',
            sTitle: 'Context Id',
            "class": "details-control",
            "orderable": false,
        },
        {
            mData: 'type',
            sTitle: 'Type',
            "class": "details-control",
            "orderable": false,

        },
        {
            mData: 'version',
            sTitle: 'Version',
            "class": "details-control",
            orderable: false,
        },
        {
            mData: 'author',
            sTitle: 'Author',
            "class": "details-control",
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'desc',
            sTitle: 'Description',
            "class": "details-control",
            orderable: false,
            sWidth:'25%',
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        }

    ];

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
        searching: true,
        "ordering": false,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN_ALT,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

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

                queryParams.query['bool']['must'] = [searchJson];

            } else {
                queryParams.query['bool']['must'] = [];
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type : 'PLUGIN'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = QueryFormatter(data).data;
                    plugin_list = resultData.data;
                    $(".pluginCount").html(resultData.recordsFiltered)
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };
   

        pluginTable = $("#pluginTable").DataTable(tableOption);


        var detailRows = [];

        $('#pluginTable tbody').on('click', '.details-control', function () {

            $(".pluginRow").hide();
            var tr = $(this).closest('tr');
            var row = pluginTable.row(tr);
            var idx = $.inArray(tr.attr('id'), detailRows);

            if (row.child.isShown()) {
                tr.removeClass('details');
                row.child.hide();

                // Remove from the 'open' array
                detailRows.splice(idx, 1);
            }
            else {
                tr.addClass('details');
                row.child(formatRow(row.data())).show();

                // Add to the 'open' array
                if (idx === -1) {
                    detailRows.push(tr.attr('id'));
                }
            }
        });



}*/

function formatRow(d) {

    console.log(d)
    var id = d.id
    var htmlStr = '<div class="pluginRow plugin_'+id+'"><h4 style="text-align: center"><i class="fa fa-spinner fa-spin"></i> <Loading></Loading></h4></div>';



    var str = `
    <div id="a_`+id+`" class="card-accordion">
						<div class="card 1_`+id+`">
							<div class="card-header  pointer-cursor collapsed" data-toggle="collapse" data-target="#1_`+id+`" aria-expanded="false">
								Configuration
							</div>
							<div id="1_`+id+`" class="collapse" data-parent="#a_`+id+`" style="">
								<div class="card-body c_`+id+`">
								
								</div>
							</div>
						</div>
						<div class="card admin_`+id+` 2_`+id+`">
							<div class="card-header pointer-cursor collapsed" data-toggle="collapse" data-target="#2_`+id+`" aria-expanded="false">
								System Properties
							</div>
							<div id="2_`+id+`" class="collapse" data-parent="#a_`+id+`" style="">
								<div class="card-body sp_`+id+`">
								
								</div>
							</div>
						</div>
						<div class="card 3_`+id+`"">
							<div class="card-header pointer-cursor collapsed" data-toggle="collapse" data-target="#3_`+id+`" aria-expanded="false">
								Properties
							</div>
							<div id="3_`+id+`" class="collapse" data-parent="#a_`+id+`" style="">
								<div class="card-body p_`+id+`">
								
								</div>
							</div>
						</div>
						<div class="card admin_`+id+` 4_`+id+`">
							<div class="card-header pointer-cursor collapsed " data-toggle="collapse" data-target="#4_`+id+`" aria-expanded="false">
								System Lookups
							</div>
							<div id="4_`+id+`" class="collapse" data-parent="#a_`+id+`" style="">
								<div class="card-body sl_`+id+`">
								
								</div>
							</div>
						</div>
						<div class="card 5_`+id+`">
							<div class="card-header pointer-cursor collapsed" data-toggle="collapse" data-target="#5_`+id+`" aria-expanded="false">
								Lookups
							</div>
							<div id="5_`+id+`" class="collapse" data-parent="#a_`+id+`" style="">
								<div class="card-body l_`+id+`">
								
								</div>
							</div>
						</div>
						<div class="card 6_`+id+`">
							<div class="card-header pointer-cursor collapsed" data-toggle="collapse" data-target="#6_`+id+`" aria-expanded="false">
								Documentation
							</div>
							<div id="6_`+id+`" class="collapse" data-parent="#a_`+id+`" style="">
								<div class="card-body d_`+id+`">
								
								</div>
							</div>
						</div>
						
						
					</div>
    `;
    setTimeout(function () {
        $(".plugin_"+id).html(str);
        // if(!ADMIN_ACCESS){
        //     $(".admin_"+id).remove()
        // }else{
            if(d.sysprops.length > 0){
                loadSysProperties(d);
            }else{
                $(".2_"+id).remove()
            }

            if(d.syslookups.length > 0){
                loadSysLookups(d);
            }else{
                $(".4_"+id).remove()
            }
        // }

        if(d.config){
            loadConfiguration(d);
        }else{
            $(".1_"+id).remove()
        }

        if(d.props.length > 0){
            loadProperties(d);
        }else{
            $(".3_"+id).remove()
        }
        if(d.lookups.length > 0){
            loadLookups(d);
        }else{
            $(".5_"+id).remove()
        }

        if(d.docs.length > 0){
            loadDocumentation(d);
        }else{
            $(".6_"+id).remove()
        }



    },500)


    return htmlStr;

}

function loadConfiguration(d) {

    var params = d.config.params;
    var configName = d.config.name ? (d.config.name + ' ('+d.contextId+')') : d.contextId;
    var str = ''
    for(var i=0;i<params.length;i++){
        str += `
            <div class="col-md-6" style="margin: 5px 0px">
                <div class="form-group">
                    <label class="inputLabel" style="display: block">`+(params[i].title ? params[i].title : params[i].name)+` <small>`+(params[i].description ? params[i].description : '')+`</small></label> <br>
                    `+returnType(d,params[i])+`
                    
                </div>
            </div>
           
        `;
    }

    str = '<div class="row">'+str+'<div class="col-md-12"><button type="submit" class="btn btn-sm btn-warning">Save Configuration</button></div></div>'


    $(".contentBlock").append('<h5>'+configName+'</h5><form action="javascript:void(0)" onsubmit="updateConfig(\''+d.id+'\')">'+str+'</form>')


}

function returnType(d,obj) {
    var str = '';

    if(obj.type === 'STRING'){
        str = '<input type="text" class="form-control input-sm" required value="'+(obj.def ? obj.def : '')+'" id="'+d.contextId+'_'+obj.name+'" style="display: block;width:100%;margin: 5px 0px;">'
    }

    return str;
}

function updateConfig(id) {

    var obj = {};

    for (var i = 0; i < plugin_list.length; i++) {
        if (id === plugin_list[i].id) {
            obj = plugin_list[i];
        }
    }

    var params = obj.config.params;
    var data = {};
    for(var i=0;i<params.length;i++){
        if(params[i].type === 'STRING') {
            data[params[i].name] = $("#" + obj.contextId + "_" + params[i].name).val();
        }
    }
    updatePluginConfig(id,JSON.stringify(data),function (status, data) {
        if(status){
            successMsg('Configuration updated successfully')
            loadPlugins();
        }else{
            errorMsg('Error in Configuration update')
        }
    })

}

function loadSysProperties(d) {
    var props = d.sysprops;
    for(var i=0;i<props.length;i++){
        var str = `
            <div class="row" style="margin: 5px 0px">
                <div class="col-md-3" style="word-break: break-all">
                    <div class="form-group">
                        <label class="inputLabel">`+props[i]+`</label>                    
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                       <input class="form-control input-sm" type="text" id="`+d.contextId+`_sp_`+i+`" value="" style="width: 100%">  
                    </div>
                </div>
               <div class="col-md-3 onlyAdmin">
                    <div class="form-group">
                       <button class="btn btn-sm btn-warning" onclick="updateSysProp('`+d.contextId+`','`+props[i]+`',`+i+`)">Update Property</button>         
                    </div>
                </div>
            </div>
        `;
        $(".contentBlock").append(str);
        if(!DOMAIN_ADMIN_ACCESS){
            $(".onlyAdmin").remove()
        }
        loadSysPropertyKey(d.contextId,props[i],i)
    }
}


function loadSysPropertyKey(id,key,i){
    getSystemProperty(key, function (status, data) {
        if (status) {
            var val =data.value;
            $("#"+id+"_sp_"+i).val(val);
        }
    })
}

function updateSysProp(id,key,i) {
    var val = $("#"+id+"_sp_"+i).val();
    var data = {
        name: key,
        value: val
    };

    upsertSystemProperty(data, function (status, data) {
        if (status) {
            successMsg('Successfully updated')
        } else {
            errorMsg('Error in update')
        }
    })

}

function loadProperties(d) {
    var props = d.props;
    for(var i=0;i<props.length;i++){
        var str = `
            <div class="row" style="margin: 5px 0px">
                <div class="col-md-3" >
                    <div class="form-group" style="word-break: break-all">
                        <label class="inputLabel">`+props[i]+`</label>                    
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                       <input class="form-control input-sm" type="text" id="`+d.contextId+`_p_`+i+`" value="" style="width: 100%">  
                    </div>
                </div>
               <div class="col-md-3">
                    <div class="form-group">
                       <button class="btn btn-sm btn-warning" onclick="updateProp('`+d.contextId+`','`+props[i]+`',`+i+`)">Update Property</button>         
                    </div>
                </div>
            </div>
        `;
        $(".contentBlock").append(str);
        loadPropertyKey(d.contextId,props[i],i)
    }
}

function loadPropertyKey(id,key,i){
    getDomainProperty(key, function (status, data) {
        if (status) {
            var val =data.value;
            $("#"+id+"_p_"+i).val(val);
        }
    })
}

function updateProp(id,key,i) {
    var val = $("#"+id+"_p_"+i).val();
        var data = {
            name: key,
            value: val
        };

        upsertDomainProperty(data, function (status, data) {
            if (status) {
                successMsg('Successfully updated')
            } else {
                errorMsg('Error in update')
            }
        })

}

function loadSysLookups(d) {
    var lookups = d.syslookups;
    for(var i=0;i<lookups.length;i++){
        var str = `
            <div class="row" style="margin: 5px 0px">
                <div class="col-md-3" >
                    <div class="form-group">
                        <label class="inputLabel" style="word-break: break-all">`+lookups[i]+`</label>                    
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                       <input class="form-control input-sm" type="text" id="`+d.contextId+`_sl_`+i+`" value="" style="width: 100%">  
                    </div>
                </div>
               <div class="col-md-3 onlyAdmin">
                    <div class="form-group">
                       <button class="btn btn-sm btn-warning" onclick="updateSysLookup('`+d.contextId+`','`+lookups[i]+`',`+i+`)">Update Lookup</button>         
                    </div>
                </div>
            </div>
        `;
        $(".contentBlock").append(str);
        if(!DOMAIN_ADMIN_ACCESS){
            $(".onlyAdmin").remove()
        }
        loadSysLookupKey(d.contextId,lookups[i],i)
    }
}

function loadSysLookupKey(id,key,i){
   /* getDomainProperty(key, function (status, data) {
        if (status) {
            var val =data.value;
            $("#"+id+"_sl_"+i).val(val);
        }
    })*/
}

function updateSysLookup(id,key,i) {
    /*var val = $("#"+id+"_sl_"+i).val();
    var data = {
        name: key,
        value: val
    };

    upsertDomainProperty(data, function (status, data) {
        if (status) {
            successMsg('Successfully updated')
        } else {
            errorMsg('Error in update')
        }
    })*/

}

function loadLookups(d) {
    var lookups = d.lookups;
    console.log(lookups)
    for(var i=0;i<lookups.length;i++){
        var str = `
            <div class="row" style="margin: 5px 0px">
                <div class="col-md-3" >
                    <div class="form-group">
                        <label class="inputLabel" style="word-break: break-all">`+lookups[i].key+`</label>    <br>
                        <small>Datatype: `+lookups[i].value+`</small>                
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                       <input class="form-control input-sm" type="text" id="`+d.contextId+`_l_`+i+`" value="" style="width: 100%">  
                    </div>
                </div>
               <div class="col-md-3">
                    <div class="form-group">
                       <button class="btn btn-sm btn-warning" onclick="updateLookup('`+d.contextId+`',`+i+`,'`+lookups[i].key+`','`+lookups[i].value+`')">Update Lookup</button>         
                    </div>
                </div>
            </div>
        `;
        $(".contentBlock").append(str);
        loadLookupKey(d.contextId,lookups[i],i)
    }
}

function loadLookupKey(id,obj,i){
    var lObj = {
        "target": "DOMAIN",
        "name" : obj.key
    }
     getLookup(lObj, function (status, data) {
         if (status) {
             var val =data.value;
             $("#"+id+"_l_"+i).val(val);
         }
     })
}

function updateLookup(id,i,key,type) {
    var val = $("#"+id+"_l_"+i).val();

    if(val === ''){
        errorMsg('value cannot be empty')
        return false;
    }


    if(type === 'BOOLEAN'){
        if(val === 'true' || val === 'false'){

        }else{
            errorMsg('Not a valid type')
            return false;
        }
    }

    if(type === 'INT' || type === 'LONG' || type === 'FLOAT' || type === 'DOUBLE'){
        if(isNaN(val)){
            errorMsg('Not a valid Type')
            return false;
        }
    }

    if(type === 'CHAR' || type === 'STRING'){
        if(typeof val !== 'string'){
            errorMsg('Not a valid Type')
            return false;
        }
    }

    if(type === 'UUID'){
        if(!isUUID(val)){
            errorMsg('Not a valid Type')
            return false;
        }
    }

    var lObj = {
        "target": "DOMAIN",
        "name" : key,
        "dataType": type,
        value : val
    };

    putLookup(lObj, function (status, data) {
        if (status) {
            successMsg('Successfully updated')
        } else {
            errorMsg('Error in update')
        }
    })

}

function loadDocumentation(d) {
    var docs = d.docs;


    for(var i=0;i<docs.length;i++){
        var ex='<strong style="text-decoration: underline">Examples</strong>';
        if(docs[i].examples.length === 0){
            ex = '';
        }
        for(var j=0;j<docs[i].examples.length;j++){
            ex+= '<code style="display: block;white-space: pre-wrap">'+docs[i].examples[j]+'</code><hr>'
        }

        var res='<strong style="text-decoration: underline">Resources</strong>';
        if(docs[i].resources.length === 0){
            res = '';
        }
        for(var j=0;j<docs[i].resources.length;j++){
            ex+= '<code style="display: block;white-space: pre-wrap">'+docs[i].resources[j]+'</code><hr>'
        }


        var str=`
            <div class="row">
                <div class="col-md-12">
                    <h5>`+docs[i].signature+`</h5>
                   `+(docs[i].help ? '<p style="display: block;white-space: pre-wrap">'+md.render(docs[i].help)+'</p>' : '')+`
                   `+ex+`<br> `+res+`
                </div>
            </div>
            
        `
        $(".contentBlock").append(str)

    }
}

function openModal(type, id) {

    if (type === 1) {
        $("#uploadPlugin form")[0].reset();
        $("#uploadPlugin").modal('show');
    }
}


function uploadPlugin() {
    var fileInput = document.getElementById("pluginFile");

    var files = fileInput.files;

    if (files.length === 0) {
        errorMsg('File not found. select a file to start upload');
        return this.system;
    }

    uploadFile(files[0]);
    $(".btnSubmit").attr('disabled', 'disabled');
    $(".btnSubmit").html('<i class="icon-spinner icon-spin"></i> Uploading in progress');

}


function uploadFile(file) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                $("#uploadPlugin").modal('hide');
                loadPlugins()
                successMsg('Plugin Uploaded successfully!');
            } else {
                errorMsg('Error in plugin upload!');
            }
            $(".btnSubmit").removeAttr('disabled');
            $(".btnSubmit").html('Proceed');
        }
    };
    xhr.open('POST', API_BASE_PATH + '/plugin/upload/' + USER_OBJ.token, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    xhr.send(formData);
}