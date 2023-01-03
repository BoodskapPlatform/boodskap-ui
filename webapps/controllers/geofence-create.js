var geofenceTable = null;
var current_geofence_id = "";
var geofence_list = [];
var overlaysList = [];
var title = 'Geofence';
var lat = 51.678418;
var lng = 7.809007;
var geoStatus = "label";
var drawingManager;
var minMaximizeFlag = true;
var geofenceObj = {
        "group": USER_GEOFENCE,
        "name": "",
        "geoType": "POINT",
        "label": "",
        "description": "",
        "coordinates": "",
        "radius": 50,
        "geometries": "",
        "locationSearch": "",
        "coordinatesGroup": "",
        "lat": "",
        "lng": ""
    };

var geofenceCount = [];
var msgPagination = false;
var msgPageSize = 5;
var msgPageNo = 1;
var geoListLoader = false;

var isActive ;
var geoMapio ;
var geodata  = [];
var newGeoMarker ;
var newGeoCircle ;
var newGeoPolygon ;
var newGeoPolyline ;

var markersGroup  = [];
var circlesGroup  = [];
var polygonGroup  = [];
var polylineGroup  = [];
var markerCluster ;

var place ={};
var geofence  = {
    latlng : "",
    address : "",
    title : "Test"
};
var mapHgt;


$(document).ready(function () {

    $("#geoMap").css('height',$(window).height()-155);
    $(".geoBody").css('height',$(window).height()-275);
    $("body").removeClass('bg-white');


    $("#geoType").on('change',function (e) {
       mapTools(e.target.value);
    });

    console.log($("#geoCreateType").val());

    $("#geofenceCreateType option[value=" + $("#geoCreateType").val()+"]").attr("selected","selected") ;


    /*setTimeout(function () {
        openSlider();
    },1000);*/

    loadGoogleApiKey();

});



function loadGoogleApiKey() {
    getDomainProperty(GOOGLE_API_PROPERTY, function (status, data) {
        if (status) {
            var obj = JSON.parse(data.value);
            loadGoogleMaps(obj.apiKey);
        } else {
            errorMsg('Please update the Google Api Key in Domain Settings')
        }

    })
}


function loadGoogleMaps(key) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type", "text/javascript");
    script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?key=" + key + "&libraries=visualization,places,drawing&callback=geofenceInit");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
}


function mapInit() {
    var uluru = {lat: -25.363, lng: 131.044};
    var map = new google.maps.Map(document.getElementById('geoMap'), {
        zoom: 4,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
}

function restoreRecord(){
    geofenceObj = {
        "group":USER_GEOFENCE,
        "name": "",
        "geoType": "",
        "label": "",
        "description": "",
        "coordinates": "",
        "radius": 50,
        "geometries": "",
        "locationSearch": "",
        "lat": "",
        "lng": ""
    };

    $("#locationSearch").val("");
}

function singleGeoSnapshot(obj){

    var oneGeoObj = JSON.parse(decodeURIComponent(obj));
    oneGeoObj.geoType = oneGeoObj.geoType.toUpperCase();
    var center= {};

    if(oneGeoObj.geoType == "POINT"){

        center["lat"] = oneGeoObj.location.coordinates[0];
        center["lng"] = oneGeoObj.location.coordinates[1];

    }else if(oneGeoObj.geoType == "CIRCLE"){

        center["lat"] = oneGeoObj.location.coordinates[0];
        center["lng"] = oneGeoObj.location.coordinates[1];

    }else if(oneGeoObj.geoType == "LINESTRING"){

        center["lat"] = oneGeoObj.location.coordinates[0][0];
        center["lng"] = oneGeoObj.location.coordinates[0][1];

    }else if(oneGeoObj.geoType == "POLYGON"){

        center["lat"] = oneGeoObj.location.coordinates[0][0][0];
        center["lng"] = oneGeoObj.location.coordinates[0][0][1];
    }
    // geoMapio.setCenter();
    geoMapio.panTo(center);
    geoMapio.setZoom(17);
}


function createNewGeofence() {
    upsertEntityGeofence()
    // var type = $("#geofenceCreateType").val();

    // if(type === 'ENTITY'){

    //     upsertEntityGeofence();

    // }else if(type === 'ASSET'){

    //     upsertAssetGeofence();

    // }else if(type === 'DEVICE'){

    //     upsertDeviceGeofence();
    // }
}

function upsertEntityGeofence(){

    var geoInputObj  = {};
    geoInputObj['coordinates'] = [];
    geoInputObj['description'] = geofenceObj.description;

    geoInputObj['geometries'] = {
        "type": "",
        "coordinates": []
    };

    if(geofenceObj.geoType == 'POINT'){

        geoInputObj['coordinates'] = [geofenceObj.lat,geofenceObj.lng];

    }else if(geofenceObj.geoType == 'LINESTRING'){

        geoInputObj['coordinates'] = geofenceObj.coordinatesGroup;

    }else if(geofenceObj.geoType == 'CIRCLE'){

        geoInputObj['coordinates'] = [geofenceObj.lat,geofenceObj.lng];
        geoInputObj['radius'] = geofenceObj.radius;

    }else if(geofenceObj.geoType == 'POLYGON'){

        geoInputObj['coordinates'] = [];
        geoInputObj.coordinates.push(geofenceObj.coordinatesGroup);
    }
    geofenceObj.name = $("#geoCreateForm #name").val();
    geofenceObj.label = $("#geoCreateForm #label").val();
    geofenceObj.description = $("#geoCreateForm #description").val();
    // geofenceObj.category1 = $("#geoCreateForm #category1").val();

    geoInputObj['domainKey'] = DOMAIN_KEY;
    // geoInputObj['name'] = geofenceObj.name ? (geofenceObj.name.replace(/\s+/g, '+')) :"";
    // geoInputObj['name'] = geofenceObj.name ? encodeURIComponent(geofenceObj.name) :"";
    geoInputObj['group'] = USER_GEOFENCE;
    geoInputObj['name'] = geofenceObj.name ? geofenceObj.name :"";
    geoInputObj['geoType'] = geofenceObj.geoType;
    geoInputObj['label'] = geofenceObj.label;
    geoInputObj['description'] = geofenceObj.description;
    geoInputObj['coordinates'] = JSON.stringify(geoInputObj.coordinates);
    geoInputObj['createdAt'] = new Date().getTime();
    geoInputObj['entityId'] = guid();

    // geoInputObj['category1'] = geofenceObj.category1;
    geoInputObj['geometries']['type'] = geoInputObj.geoType;
    geoInputObj['geometries']['coordinates'] = geoInputObj.coordinates;
    geoInputObj['geometries'] = JSON.stringify(geoInputObj.geometries);

    $("input").css({"border":"1px solid #ccc","background":"#fff"});

   if(!geofenceObj.name){

        $("#name").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Geofence Name is Required');

    }else if(!geofenceObj.geoType){

        $("#geoType").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Geofence Type is Required');

    }else if(!geofenceObj.label){

        $("#label").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Label is Required');

    } else{

        if(geofenceObj.geoType === 'POINTS'){

            if(!$("#pointLat").val()){

                $("#pointLat").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Lat. is required for points');
                return false;

            }else if(!$("#pointLong").val()){

                $("#pointLong").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Long. is required for points');
                return false;

            }

        }else if(geofenceObj.geoType === 'CIRCLE'){

            if(!$("#bskpLat").val()){

                $("#bskpLat").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Lat. is required for circle');
                return false;

            }else if(!$("#bskpLong").val()){

                $("#bskpLong").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Long. is required for circle');
                return false;

            }else if(!$("#bskpCircleRadius").val()){

                $("#bskpCircleRadius").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Radius is required for circle');
                return false;

            }

        }

        Swal({
            title: 'Confirmation',
            text: 'Confirm to create this Geofence!',
            type: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, Create!',
            cancelButtonText: 'No, Edit',
            closeOnConfirm: false,
            closeOnCancel: false
        }).then(function(result){

            if (result.value) {


                $.ajax({
                    url: API_BASE_PATH + "/geofence/upsert/" + API_TOKEN_ALT+"?geotype="+geoInputObj.geoType,
                    data: JSON.stringify(geoInputObj),
                    contentType: "application/json",
                    type: 'POST',
                    success: function (res) {
                        if(res){

                            $("#geoCreateForm input").val("");
                            $("#geoCreateForm textarea").val("");
                            $("#geoCreateForm #geoType").val("POINT");
                            mapTools("DEFAULT")

                            setTimeout(function () {
                                loadGeofenceList();
                            },1000);
                            Swal("Created!", "Your Geofence has been Created.", "success");
                            resetAll();
                        }else{
                            Swal("Error", "Try Again", "error");
                        }
                    },
                    error: function (err) {
                        console.log(err.message);
                        if(err.status === 417){
                            Swal("417 Error", "Invalid Parameters, Check Your Geofence Details!"+err, "error");
                        }
                    }
                });

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal("Error", "Now You Can Edit", "info");
            }
        });

    }
}

function upsertAssetGeofence(){

    var geoInputObj  = {};
    geoInputObj['coordinates'] = [];
    geoInputObj['description'] = geofenceObj.description;

    geoInputObj['geometries'] = {
        "type": "",
        "coordinates": []
    };

    if(geofenceObj.geoType == 'POINT'){

        geoInputObj['coordinates'] = [geofenceObj.lat,geofenceObj.lng];

    }else if(geofenceObj.geoType == 'LINESTRING'){

        geoInputObj['coordinates'] = geofenceObj.coordinatesGroup;

    }else if(geofenceObj.geoType == 'CIRCLE'){

        geoInputObj['coordinates'] = [geofenceObj.lat,geofenceObj.lng];
        geoInputObj['radius'] = geofenceObj.radius;

    }else if(geofenceObj.geoType == 'POLYGON'){

        geoInputObj['coordinates'] = [];
        geoInputObj.coordinates.push(geofenceObj.coordinatesGroup);
    }
    geofenceObj.name = $("#geoCreateForm #name").val();
    geofenceObj.label = $("#geoCreateForm #label").val();
    geofenceObj.description = $("#geoCreateForm #description").val();
    // geofenceObj.category1 = $("#geoCreateForm #category1").val();

    geoInputObj['domainKey'] = DOMAIN_KEY;
    // geoInputObj['name'] = geofenceObj.name ? (geofenceObj.name.replace(/\s+/g, '+')) :"";
    // geoInputObj['name'] = geofenceObj.name ? encodeURIComponent(geofenceObj.name) :"";
    geoInputObj['group'] = USER_GEOFENCE;
    geoInputObj['name'] = geofenceObj.name ? geofenceObj.name :"";
    geoInputObj['geoType'] = geofenceObj.geoType;
    geoInputObj['label'] = geofenceObj.label;
    geoInputObj['description'] = geofenceObj.description;
    geoInputObj['coordinates'] = JSON.stringify(geoInputObj.coordinates);
    geoInputObj['createdAt'] = new Date().getTime();
    geoInputObj['entityId'] = guid();

    // geoInputObj['category1'] = geofenceObj.category1;
    geoInputObj['geometries']['type'] = geoInputObj.geoType;
    geoInputObj['geometries']['coordinates'] = geoInputObj.coordinates;
    geoInputObj['geometries'] = JSON.stringify(geoInputObj.geometries);

    $("input").css({"border":"1px solid #ccc","background":"#fff"});

    if(!geofenceObj.name){

        $("#name").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Geofence Name is Required');

    }else if(!geofenceObj.geoType){

        $("#geoType").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Geofence Type is Required');

    }else if(!geofenceObj.label){

        $("#label").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Label is Required');

    }
    // else if(!geofenceObj.category1){

    //     $("#category1").css({"border":"1px solid red","background":"#ff00000d"}).focus();
    //     errorMsg('Category is Required');

    // }
    else{

        if(geofenceObj.geoType === 'POINTS'){

            if($("#pointLat").val()){

                $("#pointLat").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Lat. is required for points');
                return false;

            }else if($("#pointLong").val()){

                $("#pointLong").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Long. is required for points');
                return false;

            }

        }else if(geofenceObj.geoType === 'CIRCLE'){

            if($("#bskpLat").val()){

                $("#bskpLat").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Lat. is required for circle');
                return false;

            }else if($("#bskpLong").val()){

                $("#bskpLong").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Long. is required for circle');
                return false;

            }else if($("#bskpCircleRadius").val()){

                $("#bskpCircleRadius").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Radius is required for circle');
                return false;

            }

        }else if(geofenceObj.geoType === 'LINESTRING'){

        }else if(geofenceObj.geoType === 'POLYGON'){

        }

        Swal({
            title: 'Confirmation',
            text: 'Confirm to create this Geofence!',
            type: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, Create!',
            cancelButtonText: 'No, Edit',
            closeOnConfirm: false,
            closeOnCancel: false
        }).then(function(result){

            if (result.value) {


                $.ajax({
                    url: API_BASE_PATH + "/geofence/upsert/" + API_TOKEN_ALT+"?geotype="+geoInputObj.geoType,
                    data: JSON.stringify(geoInputObj),
                    contentType: "application/json",
                    type: 'POST',
                    success: function (res) {
                        if(res){

                            $("#geoCreateForm input").val("");
                            $("#geoCreateForm textarea").val("");
                            $("#geoCreateForm #geoType").val("POINT");
                            mapTools("DEFAULT")

                            setTimeout(function () {
                                loadGeofenceList();
                            },1000);
                            Swal("Created!", "Your Geofence has been Created.", "success");
                            resetAll();
                        }else{
                            Swal("Error", "Try Again", "error");
                        }
                    },
                    error: function (err) {
                        console.log(err.message);
                        if(err.status === 417){
                            Swal("417 Error", "Invalid Parameters, Check Your Geofence Details!"+err, "error");
                        }
                    }
                });

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal("Error", "Now You Can Edit", "info");
            }
        });

    }
}

function upsertDeviceGeofence(){

    var geoInputObj  = {};
    geoInputObj['coordinates'] = [];
    geoInputObj['description'] = geofenceObj.description;

    geoInputObj['geometries'] = {
        "type": "",
        "coordinates": []
    };

    if(geofenceObj.geoType == 'POINT'){

        geoInputObj['coordinates'] = [geofenceObj.lat,geofenceObj.lng];

    }else if(geofenceObj.geoType == 'LINESTRING'){

        geoInputObj['coordinates'] = geofenceObj.coordinatesGroup;

    }else if(geofenceObj.geoType == 'CIRCLE'){

        geoInputObj['coordinates'] = [geofenceObj.lat,geofenceObj.lng];
        geoInputObj['radius'] = geofenceObj.radius;

    }else if(geofenceObj.geoType == 'POLYGON'){

        geoInputObj['coordinates'] = [];
        geoInputObj.coordinates.push(geofenceObj.coordinatesGroup);
    }
    geofenceObj.name = $("#geoCreateForm #name").val();
    geofenceObj.label = $("#geoCreateForm #label").val();
    geofenceObj.description = $("#geoCreateForm #description").val();
    // geofenceObj.category1 = $("#geoCreateForm #category1").val();

    geoInputObj['domainKey'] = DOMAIN_KEY;
    // geoInputObj['name'] = geofenceObj.name ? (geofenceObj.name.replace(/\s+/g, '+')) :"";
    // geoInputObj['name'] = geofenceObj.name ? encodeURIComponent(geofenceObj.name) :"";
    geoInputObj['group'] = USER_GEOFENCE;
    geoInputObj['name'] = geofenceObj.name ? geofenceObj.name :"";
    geoInputObj['geoType'] = geofenceObj.geoType;
    geoInputObj['label'] = geofenceObj.label;
    geoInputObj['description'] = geofenceObj.description;
    geoInputObj['coordinates'] = JSON.stringify(geoInputObj.coordinates);
    geoInputObj['createdAt'] = new Date().getTime();
    geoInputObj['entityId'] = guid();

    // geoInputObj['category1'] = geofenceObj.category1;
    geoInputObj['geometries']['type'] = geoInputObj.geoType;
    geoInputObj['geometries']['coordinates'] = geoInputObj.coordinates;
    geoInputObj['geometries'] = JSON.stringify(geoInputObj.geometries);

    $("input").css({"border":"1px solid #ccc","background":"#fff"});

   if(!geofenceObj.name){

        $("#name").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Geofence Name is Required');

    }else if(!geofenceObj.geoType){

        $("#geoType").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Geofence Type is Required');

    }else if(!geofenceObj.label){

        $("#label").css({"border":"1px solid red","background":"#ff00000d"}).focus();
        errorMsg('Label is Required');

    }else{

        if(geofenceObj.geoType === 'POINTS'){
          
            if($("#pointLat").val()){

                $("#pointLat").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Lat. is required for points');
                return false;

            }else if($("#pointLong").val()){

                $("#pointLong").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Long. is required for points');
                return false;

            }

        }else if(geofenceObj.geoType === 'CIRCLE'){

            if($("#bskpLat").val()){

                $("#bskpLat").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Lat. is required for circle');
                return false;

            }else if($("#bskpLong").val()){

                $("#bskpLong").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Long. is required for circle');
                return false;

            }else if($("#bskpCircleRadius").val()){

                $("#bskpCircleRadius").css({"border":"1px solid red","background":"#ff00000d"}).focus();
                errorMsg('Radius is required for circle');
                return false;

            }

        }else if(geofenceObj.geoType === 'LINESTRING'){

        }else if(geofenceObj.geoType === 'POLYGON'){

        }

        Swal({
            title: 'Confirmation',
            text: 'Confirm to create this Geofence!',
            type: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, Create!',
            cancelButtonText: 'No, Edit',
            closeOnConfirm: false,
            closeOnCancel: false
        }).then(function(result){

            if (result.value) {


                $.ajax({
                    url: API_BASE_PATH + "/geofence/device/upsert/" + API_TOKEN_ALT+"?geotype="+geoInputObj.geoType,
                    data: JSON.stringify(geoInputObj),
                    contentType: "application/json",
                    type: 'POST',
                    success: function (res) {
                        if(res){

                            $("#geoCreateForm input").val("");
                            $("#geoCreateForm textarea").val("");
                            $("#geoCreateForm #geoType").val("POINT");
                            mapTools("DEFAULT")

                            setTimeout(function () {
                                loadGeofenceList();
                            },1000);
                            Swal("Created!", "Your Geofence has been Created.", "success");
                            resetAll();
                        }else{
                            Swal("Error", "Try Again", "error");
                        }
                    },
                    error: function (err) {
                        console.log(err.message);
                        if(err.status === 417){
                            Swal("417 Error", "Invalid Parameters, Check Your Geofence Details!"+err, "error");
                        }
                    }
                });

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal("Error", "Now You Can Edit", "info");
            }
        });

    }
}

function resetAll(){

    if(newGeoMarker){
        newGeoMarker.setMap(null); //Reset Map Markers
    }

    if(newGeoCircle){
        newGeoCircle.setMap(null); //Reset Map Circles
    }

    if(newGeoPolygon){
        newGeoPolygon.setMap(null); //Reset Map Circles
    }
    if(newGeoPolyline){
        newGeoPolyline.setMap(null); //Reset Map Circles
    }

    if(drawingManager){
        drawingManager.setDrawingMode(null); //Reset Drawing Mode
        // drawingManager.setMap(null);//Reset Drawing Tool
    }
}

function loadGeofenceList() {

    if (geofenceTable) {
        geofenceTable.destroy();
        $("#geofenceTable").html("");
    }

    var fields = [
        {
            mData: 'name',
            sTitle: 'Geofence Name',
            orderable: false,
            mRender: function (data, type, row) {

                return '<span onclick="singleGeoSnapshot(\'' + encodeURIComponent(JSON.stringify(row)) + '\')" style="cursor: pointer;">'+data + '<br>' +
                    '<small class="text-grey">'+(row['name'] ? ''+row['description'] : '')+'</small>' +
                    '</span>';
            }
        },
        {
            mData: 'geoType',
            sTitle: 'Type',
            orderable: false,
            mRender: function (data, type, row) {


                if(row['geoType'] == "POINT"){

                }else if(row['geoType'] == "CIRCLE"){

                }else if(row['geoType'] == "POLYGON"){

                }else if(row['geoType'] == "POINT"){

                }



                return data ? data : '-';
            }
        },

        {
            mData: 'label',
            sTitle: 'Label',
            orderable: false,
            sWidth: '5%',
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        // {
        //     mData: 'category1',
        //     sTitle: 'Category',
        //     orderable: false,
        //     sWidth: '5%',
        //     mRender: function (data, type, row) {
        //         return data ? data : '-';
        //     }
        // },
        {
            mData: 'createdAt',
            sTitle: 'CreatedAt',
            orderable: true,
            sWidth: '5%',
            mRender: function (data, type, row) {
                return data ? moment(data).format('MM/DD/YYYY hh:mm a') : '-';
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {
                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,\'' + row['_id'] + '\')"><i class="icon-trash-o"></i></button>' +
                '<button class="btn btn-sm btn-icon btn-default" style="margin-left: 10px;" onclick="singleGeoSnapshot(\'' + encodeURIComponent(JSON.stringify(row)) + '\')"><i class="icon-eye"></i></button>';
            }
        }

    ];

    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [{"reported": {"order": "desc"}}];

    var queryParams = {
        query: {
            "bool": {
                "must": []
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
        aaSorting: [[4, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": API_BASE_PATH + '/elastic/search/query/' + API_TOKEN_ALT,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            var keyName = fields[oSettings.aaSorting[0][0]];

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {
                var searchJson = {
                    "multi_match": {
                        "query": '*' + searchText + '*',
                        "type": "phrase_prefix",
                        "fields": ['name', 'label','geoType']
                    }
                };

                queryParams.query['bool']['must'] = [domainKeyJson, searchJson];

            } else {
                queryParams.query['bool']['must'] = [domainKeyJson];
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": [],
                type: 'GEOFENCE'
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var fullObj = searchQueryFormatterNew(data);
                    var resultData = fullObj.data;
                    geofence_list =resultData.data;

                    geodata = resultData.data;
                    geofenceMapManagement();
                    google.maps.event.trigger(geoMapio, 'resize'); // Refresh Map
                    restoreRecord();

                    $("#entityGeoCount").html(fullObj.total);

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    geofenceTable = $("#geofenceTable").DataTable(tableOption);

    geofenceTable.on( 'draw', function () {
        var body = $( geofenceTable.table().body() );

        body.unhighlight();
        body.highlight( geofenceTable.search() );
    } );
}


function locateGeofence(obj) {

    var locateData = JSON.parse(decodeURIComponent(obj));
}


function openModal(type,id) {
    if (type === 1) {
        loadDeviceModels();
        $("#device_id").removeAttr('readonly');
        $(".templateAction").html('Create');
        $("#addDevice form")[0].reset();
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit','addDevice()')
    }else if (type === 2) {
        loadDeviceModels();
        $(".templateAction").html('Update');
        var obj ={};
        current_geofence_id = id;

        for(var i=0;i<geofence_list.length;i++){
            if(id === geofence_list[i].id){
                obj = geofence_list[i];
            }
        }
        $("#device_id").attr('readonly','readonly');
        $("#device_id").val(obj.id);
        $("#device_name").val(obj.name);
        $("#device_model").val(obj.modelId);
        $("#device_version").val(obj.version);
        $("#addDevice").modal('show');
        $("#addDevice form").attr('onsubmit','updateDevice()')
    }else if (type === 3) {
        current_geofence_id = id;
        $(".geofenceId").html(id)
        $("#deleteModal").modal('show');
    }else if (type === 4) {
        current_geofence_id = id;
        retrieveDeviceProperty(id, DEVICE_PROPERTY_NAME[$("input[name='configType']:checked").val()],function (status, data) {
            if (status) {
                $("#board_config").val(data.value);
            }else{
                $("#board_config").val("");
            }
            $("#deviceSettings").modal('show');
        });
    }
}

function proceedDelete() {
    deleteEntityGeofence(current_geofence_id,function (status, data) {
        if (status) {
            successMsg('Geofence Deleted Successfully');
            loadGeofenceList();
            $("#deleteModal").modal('hide');
        } else {
            errorMsg('Error in delete')
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

        $(".deviceCount").html(totalRecords);


        return resultObj;

    } else {

        return resultObj;
    }

}


/*function loadGeofenceList() {

    if (geofenceTable) {
        geofenceTable.destroy();
        $("#geofenceTable").html("");
    }

    var fields = [
        {
            mData: 'name',
            sTitle: 'name',
            mRender: function (data, type, row) {

                return data + '<br><small class="text-grey">'+(row['name'] ? ''+row['name'] : '')+'</small>'
            }
        },
        {
            mData: 'geoType',
            sTitle: 'geoType',
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'label',
            sTitle: 'label',
            sWidth: '5%',
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'createdAt',
            sTitle: 'createdAt',
            sWidth: '5%',
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(4,\'' + row["id"] + '\')" title="Board Configuration"><i class="icon-cog"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(2,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(3,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];


    var domainKeyJson = {"match": {"domainKey": DOMAIN_KEY}};
    var defaultSorting = [{"reported": {"order": "desc"}}];
    var pageSize = 50;

    var queryParams = {
        query: {
            "bool": {
                "must": [],
            }
        },
        sort: [],
    };


    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        searching: true,
        aaSorting: [[4, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "bProcessing": true,
        "bServerSide": true,
        // "sAjaxSource": API_BASE_PATH + '/elastic/query/' + API_TOKEN_ALT + '/GLOBAL/?repositary=geofence&mapping=geofence',
        "sAjaxSource": API_BASE_PATH + '/geofence/list/' + API_TOKEN_ALT + '/' + pageSize,
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

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

                queryParams.query['bool']['must'] = [domainKeyJson, searchJson];

            } else {
                queryParams.query['bool']['must'] = [domainKeyJson];
            }


            var ajaxObj = {
                "method": "GET",
                "extraPath": "",
                "query": JSON.stringify(queryParams),
                "params": []
            };


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "GET",
                "url": sSource,
                "data": JSON.stringify(ajaxObj),
                success: function (data) {

                    var resultData = searchQueryFormatterNew(data).data;
                    geofence_list =resultData.data;
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    geofenceTable = $("#geofenceTable").DataTable(tableOption);
}*/


/*function loadGeofenceList(dir, mid){

    geoListLoader = true;

    // countAllGeofences API
    $.ajax({
        url: API_BASE_PATH + "/geofence/count/" + API_TOKEN_ALT,
        data: {},
        type: 'POST',
        success: function (res) {
            if(res){

                geofenceCount = res.total;

                if(geofenceCount > msgPageSize) {
                    msgPagination = true;
                } else {
                    msgPagination = false;
                }

                // listGeofences API
                var data = {};
                if (mid && dir) {
                    data = {
                        mid: mid,
                        direction: dir
                    };
                }

                $.ajax({
                    url: API_BASE_PATH + "/geofence/list/" + API_TOKEN_ALT + "/"+msgPageSize,
                    data: data,
                    type: 'GET',
                    success: function (res) {
                        if(res){

                            // listGeofences API
                            if(res.length > 0){
                                _.each(res,function(val,i){
                                    val["createdAt"] = moment(val.createdAt).format('MM/DD/YYYY hh:mm:ss a')
                                });

                                geodata = res;
                                geofenceMapManagement();
                                google.maps.event.trigger(geoMapio, 'resize'); // Refresh Map
                                restoreRecord();
                            }

                        }else{
                            swal("Error", "Try Again", "error");
                        }
                    },
                    error: function (err) {
                        console.log(e.message);
                        if(err.status === 417){
                            console.log("Error :", err);
                            console.log("Error in getting device count");
                        }
                    }
                });



            }else{
                swal("Error", "Try Again", "error");
            }
        },
        error: function (err) {
            if(err.status === 417){
                console.log("Error :", err);
                console.log("Error in getting device count");
            }
        }
    });
}*/

function  loadPrevMsg() {
    if (msgPageNo > 1) {
        msgPageNo--;
        loadGeofenceList('PREV', geodata[0].name);
    }
}

function  loadNxtMsg() {
     var pages = Math.ceil(geofenceCount / msgPageSize);
    if (msgPageNo < pages) {
        msgPageNo++;
        loadGeofenceList('NEXT', geodata[geodata.length - 1].name);
    }
}


function getGeofenceList(){

    var pageSize = 100;

    $.ajax({
        url: API_BASE_PATH + "/geofence/list/" + API_TOKEN_ALT + "/" + pageSize,
        data: data,
        type: 'GET',
        success: function (data) {

            geodata = res;
            geofenceMapManagement();
            google.maps.event.trigger(geoMapio, 'resize'); // Refresh Map
            restoreRecord();
        },
        error: function (e) {
            console.log(e.message);
        }
    });
}

function openSlider(){
    // $("#geofenceSlider").slideReveal("show");
}

function overlayClickListener(overlay) {

    google.maps.event.addListener(overlay, "mouseup", function(event){
        // $('#bskpCoordinatesBox').val(overlay.getPath().getArray());
        $('#bskpCoordinatesBox').val(JSON.stringify(geofenceObj.coordinatesGroup));
    });
}

function googleMapDrawingTool(){

     var map = geoMapio;
     var drawingStyle = {
        strokeWeight: 2,
        fillOpacity: 0.45,
        editable: true,
        draggable: true
    };

    drawingManager = new google.maps.drawing.DrawingManager({
        // drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['marker', 'circle', 'polygon']
        },
        markerOptions: {
            icon: 'images/map/marker_red.png',
            clickable: true,
            editable: true,
            draggable: true
        },
        circleOptions: {
            fillColor: '#FF0000',
            clickable: false,
            editable: true,
            zIndex: 1,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillOpacity: 0.35,
            draggable: true
        },
        rectangleOptions: drawingStyle,
        polygonOptions: drawingStyle
    });
    drawingManager.setMap(map);

         // var drawingManager = drawingManager;

    //Common OverlayComplete Listener
    google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
        $("#widgetButton").click();
        overlayClickListener(event.overlay);
         var newShape = event.overlay;
        newShape.type = event.type;

        if(geofenceObj.geoType == "POINT"){  //POINT

            var centerLtlg = event.overlay.position;
            var markerId = getMarkerUniqueId(centerLtlg.lat(), centerLtlg.lng());
            var newMark = new google.maps.Marker({
                draggable: true,
                id: 'marker_' + markerId
            });
            markersGroup[markerId] = newMark;

            google.maps.event.addListener(newShape, 'rightclick', function(e) {

                var newMark2 = markersGroup[markerId];
                removeThisMarker(newMark2,markerId);
            });

            drawingManager.setDrawingMode(null);

        }else if(geofenceObj.geoType == "CIRCLE"){  //CIRCLE
             var newShape = event.overlay;
            newGeoCircle = newShape;

            var lat = newGeoCircle.getCenter().lat();
            var lng = newGeoCircle.getCenter().lng();

            geofenceObj.lat = lat;
            geofenceObj.lng = lng;
            $("#bskpLat").val(lat);
            $("#bskpLong").val(lng);
            // openCreateGeoModal();
            //Common Circle Drag Listener
            newGeoCircle.addListener('radius_changed', function(event){
                geofenceObj.radius = newGeoCircle.getRadius();
                $("#bskpCircleRadius").val(geofenceObj.radius);
            });

            //Common Circle Drag Listener
            newGeoCircle.addListener('center_changed', function(event){

                var lat = newGeoCircle.getCenter().lat();
                var lng = newGeoCircle.getCenter().lng();
                geofenceObj.lat = lat;
                geofenceObj.lng = lng;
                $("#bskpLat").val(lat);
                $("#bskpLong").val(lng);
            });

            if(newGeoMarker){

                newGeoCircle.bindTo('center', newGeoMarker, 'position');
                newGeoMarker._myCircle = newGeoCircle;

                newGeoMarker.addListener('dragend', function(event){
                    geofenceObj.lat = event.latLng.lat();
                    geofenceObj.lng = event.latLng.lng();

                    $("#bskpLat").val(geofenceObj.lat);
                    $("#bskpLong").val(geofenceObj.lng);
                });

            }

            drawingManager.setDrawingMode(null)
        }
        else if(geofenceObj.geoType == "POLYGON"){ //POLYGON

            newGeoPolygon = newShape;
            var temp=[];
            _.each(event.overlay.getPath().getArray(),function(val,i){

                 var st2 = [];
                st2.push(val.lat());
                st2.push(val.lng());
                temp.push(st2);
            });

            if(!(_.isEqual(temp[0],temp[temp.length-1]))){  //Add polygon close coordinate check
                temp.push(temp[0]);
            }
            geofenceObj.coordinatesGroup = temp;
            $('#polygonCoordinates').val(JSON.stringify(temp));

            drawingManager.setDrawingMode(null)

        }
        else if(geofenceObj.geoType == "LINESTRING"){ //LINESTRING

            newGeoPolyline = newShape;

             var temp=[];
            _.each(event.overlay.getPath().getArray(),function(val,i){

                 var st2 = [];
                st2.push(val.lat());
                st2.push(val.lng());
                temp.push(st2);
            });

            geofenceObj.coordinatesGroup = temp;
            $('#linestringCoordinates').val(JSON.stringify(temp));
            drawingManager.setDrawingMode(null)

        }

        $("#geoType").val(geofenceObj.geoType);
        $(".map-top-tools .min-tool-btn").removeClass("active");
        $("#DEFAULT").addClass("active");
    });
}

function getMarkerUniqueId(lat, lng) {
    return lat + '_' + lng;
}

function removeThisMarker(newMark,markerId){

    newMark.setMap(null); // set markers setMap to null to remove it from map
    delete markersGroup[markerId];
}

function mapTools(flag){
    resetAll()
    $(".map-top-tools .min-tool-btn").removeClass("active");
    $("#"+flag).addClass("active");
    $("#geoType").val(flag);

    if(flag == "DEFAULT"){

        drawingManager.setDrawingMode(null);

    }else{

        $(".geo-type-fields").hide();
        $("#GEOTYPE_"+flag).show();


        if(flag == "POINT"){    //Draw Point Tool
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
            geofenceObj.geoType = "POINT";

        }else if(flag == "CIRCLE"){     //Draw Circle Tool
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
            geofenceObj.geoType = "CIRCLE";

        }else if(flag == "POLYGON"){    //Draw Polygon Tool
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            geofenceObj.geoType = "POLYGON";

        }else if(flag == "LINESTRING"){    //Draw Linestring Tool
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
            geofenceObj.geoType = "LINESTRING";

        }else if(flag == "ENVELOPE"){    //Draw Envelope Tool
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
            geofenceObj.geoType = "ENVELOPE";

        }else{    //Select

            drawingManager.setDrawingMode(null);
        }
    }
}

function drawingMode($event){


    if(geofenceObj.geoType == "CIRCLE"){
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);

    }else if(geofenceObj.geoType == "POLYGON"){
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

    }else if(geofenceObj.geoType == "LINESTRING"){
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);

    }else if(geofenceObj.geoType == "ENVELOPE"){
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    }
}

function searchLocationAPI() {

    var map = geoMapio;
    var input = document.getElementById('locationSearch');

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', function() {
         var place = autocomplete.getPlace();

        geofenceObj.autocomplete = autocomplete;
        geofenceObj['lat'] = place.geometry.location.lat();
        geofenceObj['lng'] = place.geometry.location.lng();
        geofenceObj['geoType'] = $("#geoType").val() ? $("#geoType").val() : "POINT";

        mapPreview();
    });
}


function mapPreview(){

    var place = geofenceObj.autocomplete.getPlace();
     var geofence = geofenceObj.autocomplete.getPlace();
     var map = geoMapio;
     // var geofenceObj = geofenceObj;

    google.maps.event.trigger(map, 'resize'); // Refresh Map

    var icon = {
        url: "images/map/marker_red.png", // url
        scaledSize: new google.maps.Size(32, 32) // scaled size
    };

    if (!place.geometry) {
        return;
    }

    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
    }

    geofence.latlng = place.geometry.location;
    geofence.address = place.formatted_address;

    var val = {
        title : geofenceObj.name,
        description : geofenceObj.description,
        location : geofence.address,
        lat : geofence.latlng.lat(),
        lng : geofence.latlng.lng(),
        strokeColor: "#08c",
        radius: geofence.radius,
        fillColor: "#08c"
    };

    var center= {
        lat : val.lat,
        lng : val.lng
    };


    newGeoMarker = new google.maps.Marker({
        map: geoMapio,
        position: new google.maps.LatLng(center),
        title: geofenceObj.name,
        animation: google.maps.Animation.DROP,
        draggable: true,
        icon : icon
    });

    var html =
        '<b>'+val.location ? val.location : ''+'</b> <br>' +
        '<b>'+val.location ? val.location : ''+'</b>';

    var infowindow = new google.maps.InfoWindow({
        content:html

    });

    // infowindow.open(map, newGeoMarker);
    newGeoMarker.addListener('click', function() {
        infowindow.open(map, newGeoMarker);
        map.panTo(center);
        map.setZoom(17);
    });

    infowindow.open(map, newGeoMarker);

    if(geofenceObj.geoType == "POINT"){

        $("#pointLat").val(center.lat);
        $("#pointLong").val(center.lng);

    }else if(geofenceObj.geoType == "CIRCLE"){
        $("#bskpLat").val(center.lat);
        $("#bskpLong").val(center.lng);
        $("#bskpCircleRadius").val(50);

        newGeoCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            editable: true,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            draggable: true,
            map: map,
            center: center,
            // radius: geofenceObj.radius ? geofenceObj.radius : 50
            radius: 100
        });

        newGeoCircle.bindTo('center', newGeoMarker, 'position');
        newGeoMarker._myCircle = newGeoCircle;

        //Common Circle Radius Listener
        google.maps.event.addListener(newGeoCircle, 'radius_changed', function () {
            geofenceObj.radius = newGeoCircle.getRadius();
            $("#bskpCircleRadius").val(geofenceObj.radius);
        });

        newGeoMarker.addListener('dragend', function(event){
            geofenceObj.lat = event.latLng.lat();
            geofenceObj.lng = event.latLng.lng();

            $("#bskpLat").val(geofenceObj.lat);
            $("#bskpLong").val(geofenceObj.lng);
        });

    }else if(geofenceObj.geoType == "LINESTRING"){


    }else if(geofenceObj.geoType == "POLYGON"){

    }

    // mapTools('DEFAULT');
}

function minMaximize(){
    if(minMaximizeFlag){
        $(".geo-list-cover").hide();
        $("#minMaxGeoList").html('<i class="icon-expand"></i>');
        minMaximizeFlag = false;
    }else{
        $(".geo-list-cover").show();
        $("#minMaxGeoList").html('<i class="icon-compress"></i>');
        minMaximizeFlag = true;
    }
};


function initialize() {

    var mapDiv = document.getElementById('geoMap');
    var geocoder = new google.maps.Geocoder();
    geoMapio = new google.maps.Map(mapDiv, {
        center: new google.maps.LatLng(13.010236, 80.215651),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });


    google.maps.event.addListener(geoMapio, 'click', function(e) {});

    searchLocationAPI();
    googleMapDrawingTool();
}


function geofenceMapManagement(){
    if(markersGroup.length > 0){
        _.each(markersGroup,function(marker,i){
            marker.setMap(null);
        });
    }

    if(circlesGroup.length > 0){
        _.each(circlesGroup,function(circle,i){
            circle.setMap(null);
        });
    }

    if(polygonGroup.length > 0){
        _.each(polygonGroup,function(polygon,i){
            polygon.setMap(null);
        });
    }

    if(polylineGroup.length > 0){
        _.each(polylineGroup,function(polyline,i){
            polyline.setMap(null);
        });
    }


    var centersArray = [];
    markersGroup = [];
    resetAll();

    _.each(geodata,function (val,i) {

        val.geoType = val.geoType.toUpperCase();

        if(val.geoType){

            if(val.geoType == "POINT") {

                val.location["coordinates"] = val.location.coordinates;
                val["description"] = val.description;

                var center= {
                    lat : val.location.coordinates[0],
                    lng : val.location.coordinates[1]
                };

                var icon = {
                    url: "images/map/marker_red.png"
                };

                var infowindow = new google.maps.InfoWindow({
                    content:
                    "<div><b style='text-transform: capitalize;font-size: 16px;color: #F62459;'>"+val.name+"</b></br>" +
                    "<p style='font-size: 13px;color: #767676;margin-top:8px;text-transform: capitalize;margin-bottom:0px;width:200px;'><img src='images/map/location-pin.png' >"+val.description+"</p>"+
                    "<div style='margin-top:10px;'>" +
                    "<p style='font-size: 11px;color: #888;display:inline-block;padding: 3px 6px;background: #eee;border-radius: 3px;margin-right: 5px;margin-bottom: 0px;'>"+val.label+"</p>" +
                    "<p style='font-size: 13px;color: #767676;margin-top:8px;'><img src='images/map/pin.png' > POINT</p>"+
                    "</div>" +
                    "</div>"
                });

                // Create marker
                var marker = new google.maps.Marker({
                    map: geoMapio,
                    position: new google.maps.LatLng(center),
                    title: val.name,
                    animation: google.maps.Animation.DROP,
                    icon:icon
                });
                marker.addListener('click', function() {
                    infowindow.open(geoMapio, marker);
                    geoMapio.panTo(center);
                    geoMapio.setZoom(17);
                });

                infowindow.open(geoMapio, marker);

            }
            else if(val.geoType == "CIRCLE"){  //DRAW CIRCLE

                val.location["coordinates"] = val.location.coordinates;

                var center= {
                    lat : val.location.coordinates[0],
                    lng : val.location.coordinates[1]
                };

                var icon = {
                    url: "images/map/marker_red.png"
                };

                var infowindow = new google.maps.InfoWindow({
                    content:
                    "<div><b style='text-transform: capitalize;font-size: 16px;color: #F62459;'>"+val.name+"</b></br>" +
                    "<p style='font-size: 13px;color: #767676;margin-top:8px;text-transform: capitalize;margin-bottom:0px;width:200px;'><img src='images/map/location-pin.png' >"+val.description+"</p>"+
                    "<div style='margin-top:10px;'>" +
                    "<p style='font-size: 11px;color: #888;display:inline-block;padding: 3px 6px;background: #eee;border-radius: 3px;margin-right: 5px;margin-bottom: 0px;'>"+val.label+"</p>" +
                    "<p style='font-size: 13px;color: #767676;margin-top:8px;'><img src='images/map/oval.png' > CIRCLE</p>"+
                    "</div>" +
                    "</div>"
                });
                // Create marker
                var marker = new google.maps.Marker({
                    map: geoMapio,
                    position: new google.maps.LatLng(center),
                    title: val.name,
                    animation: google.maps.Animation.DROP,
                    icon:icon
                });
                marker.addListener('click', function() {
                    infowindow.open(geoMapio, marker);
                    geoMapio.panTo(center);
                    geoMapio.setZoom(17);
                });
                infowindow.open(geoMapio, marker);
                var geofenceCircle = new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                    map: geoMapio,
                    center: center,
                    radius: Number(val.location.radius)
                });

                circlesGroup.push(geofenceCircle);

            }
            else if(val.geoType == "LINESTRING"){  //DRAW LINESTRING


                val.location["coordinates"] = val.location.coordinates;

                var center= {
                    lat : val.location.coordinates[0][0],
                    lng : val.location.coordinates[0][1]
                };

                var icon = {
                    url: "images/map/marker_red.png"
                };

                var infowindow = new google.maps.InfoWindow({
                    content:
                    "<div>" +
                    "<b style='text-transform: capitalize;font-size: 16px;color: #F62459;'>"+val.name+"</b></br>" +
                    "<p style='font-size: 13px;color: #767676;margin-top:8px;text-transform: capitalize;margin-bottom:0px;width:200px;'><img src='images/map/location-pin.png' >"+val.description+"</p>"+
                    "<div style='margin-top:10px;'>" +
                    "<p style='font-size: 11px;color: #888;display:inline-block;padding: 3px 6px;background: #eee;border-radius: 3px;margin-right: 5px;margin-bottom: 0px;'>"+val.label+"</p>" +
                    "<p style='font-size: 13px;color: #767676;margin-top:8px;'><img src='images/map/polyline.png' > LINESTRING</p>"+
                    "</div>" +
                    "</div>"
                });

                // Create marker
                var marker = new google.maps.Marker({
                    map: geoMapio,
                    position: new google.maps.LatLng(center),
                    title: val.name,
                    animation: google.maps.Animation.DROP,
                    icon:icon
                });
                marker.addListener('click', function() {
                    infowindow.open(geoMapio, marker);
                    geoMapio.panTo(center);
                    geoMapio.setZoom(17);
                });
                infowindow.open(geoMapio, marker);

                var lineCoords = [];
                _.each(val.location.coordinates,function(val,i){

                    var oneCoord = {};
                    oneCoord["lat"] = val[0];
                    oneCoord["lng"] = val[1];
                    lineCoords.push(oneCoord);
                });

                var geoLineString = new google.maps.Polyline({
                    path: lineCoords,
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                geoLineString.setMap(geoMapio);
                polylineGroup.push(geoLineString);

            }
            else if(val.geoType == "POLYGON"){  //DRAW POLYGON

                val.location["coordinates"] = val.location.coordinates;

                var center= {
                    lat : val.location.coordinates[0][0][0],
                    lng : val.location.coordinates[0][0][1]
                };

                var icon = {
                    url: "images/map/marker_red.png"
                };

                var infowindow = new google.maps.InfoWindow({
                    content:
                    "<div><b style='text-transform: capitalize;font-size: 16px;color: #F62459;'>"+val.name+"</b></br>" +
                    "<p style='font-size: 13px;color: #767676;margin-top:8px;text-transform: capitalize;margin-bottom:0px;width:200px;'><img src='images/map/location-pin.png' >"+val.description+"</p>"+
                    "<div style='margin-top:10px;'>" +
                    "<p style='font-size: 11px;color: #888;display:inline-block;padding: 3px 6px;background: #eee;border-radius: 3px;margin-right: 5px;margin-bottom: 0px;'>"+val.label+"</p>" +
                    "<p style='font-size: 13px;color: #767676;margin-top:8px;'><img src='images/map/polygon.png' > POLYGON</p>"+
                    "</div>" +
                    "</div>"
                });

                // Create marker
                var marker = new google.maps.Marker({
                    map: geoMapio,
                    position: new google.maps.LatLng(center),
                    title: val.name,
                    animation: google.maps.Animation.DROP,
                    icon:icon
                });
                marker.addListener('click', function() {
                    infowindow.open(geoMapio, marker);
                    geoMapio.panTo(center);
                    geoMapio.setZoom(17);
                });
                infowindow.open(geoMapio, marker);

                var polyCoords = [];
                _.each(val.location.coordinates[0],function(val,i){

                    var oneCoord = {};
                    oneCoord["lat"] = val[0];
                    oneCoord["lng"] = val[1];
                    polyCoords.push(oneCoord);
                });

                // Construct the polygon.
                var geoPoly = new google.maps.Polygon({
                    paths: polyCoords,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35
                });
                geoPoly.setMap(geoMapio);
                polygonGroup.push(geoPoly);
            }
            centersArray.push(center);

            markersGroup.push(marker);

        }
    });

    markerCluster = new MarkerClusterer(
        geoMapio,
        markersGroup,
        // {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'}
        {imagePath: 'images/map/m'}
    );
}


function openCreateGeoModal(){
    $("#createGeoModal").modal({
        keyboard : true,
        show : true,
        backdrop:false
    });
}

function geofenceInit(){

    /*$('#geofenceSlider').slideReveal({
        push: false,
        position: "right",
        width: "300",
        trigger: $(".widgetButton"),
        autoEscape: true,
        top: 65
    });*/

    google.maps.event.addDomListener(window, 'load', initialize());

    DistanceWidget.prototype = new google.maps.MVCObject();
    RadiusWidget.prototype = new google.maps.MVCObject();

}



// Circle Options

function DistanceWidget(map) {

    this.set('map', map);
    this.set('position', map.getCenter());
    var marker = new google.maps.Marker({
        draggable: true
    });
    marker.bindTo('map', this);
    marker.bindTo('position', this);
    var radiusWidget = new RadiusWidget();
    radiusWidget.bindTo('map', this);
    radiusWidget.bindTo('center', this, 'position');
    this.bindTo('distance', radiusWidget);
    this.bindTo('bounds', radiusWidget);
}

function RadiusWidget() {
    var circle = new google.maps.Circle({
        fillColor: '#efefef',
        fillOpacity: 0.5,
        strokeColor: '#000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    this.set('distance', 5);
    this.bindTo('bounds', circle);
    circle.bindTo('center', this);
    circle.bindTo('map', this);
    circle.bindTo('radius', this);
    this.addSizer_();
}
RadiusWidget.prototype.distance_changed = function() {
    this.set('radius', this.get('distance') * 1000);
};
RadiusWidget.prototype.addSizer_ = function() {
    var sizer = new google.maps.Marker({
        draggable: true
    });
    sizer.bindTo('map', this);
    sizer.bindTo('position', this, 'sizer_position');
    var me = this;
    google.maps.event.addListener(sizer, 'drag', function() {
        me.setDistance();
    });
};
RadiusWidget.prototype.center_changed = function() {
    var bounds = this.get('bounds');
    if (bounds) {
        var lng = bounds.getNorthEast().lng();
        var position = new google.maps.LatLng(this.get('center').lat(), lng);
        this.set('sizer_position', position);
    }
};

RadiusWidget.prototype.distanceBetweenPoints_ = function(p1, p2) {
    if (!p1 || !p2) {
        return 0;
    }
    var R = 6371;
    var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
    var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};
RadiusWidget.prototype.setDistance = function() {
    var pos = this.get('sizer_position');
    var center = this.get('center');
    var distance = this.distanceBetweenPoints_(center, pos);
    var distance = Math.round(distance * 100) / 100
    this.set('distance', distance);
};

function init() {
    var mapDiv = document.getElementById('map-canvas');
    var geocoder = new google.maps.Geocoder();
    var map = new google.maps.Map(mapDiv, {
        center: new google.maps.LatLng(51.5001524, -0.1262362),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var distanceWidget = new DistanceWidget(map);

    var mySubmit = document.getElementById('geosubmit');
    var myGeoInfo = document.getElementById('q');
    mySubmit.onclick = function() {
        geocoder.geocode({
            address: myGeoInfo.value
        }, function(responses) {
            if (responses && responses.length > 0) {
                var newMarkerPos = new google.maps.LatLng(responses[0].geometry.location.lat(), responses[0].geometry.location.lng());
                distanceWidget.set('position', newMarkerPos);
                distanceWidget.map.setCenter(newMarkerPos);
            } else {
                alert('error getting geocode');
            }
        });
    }

    google.maps.event.addListener(distanceWidget, 'distance_changed', function() {
        displayInfo(distanceWidget);
    });
    google.maps.event.addListener(distanceWidget, 'position_changed', function() {
        displayInfo(distanceWidget);
    });

    mapDiv.style.width = "500px";
    mapDiv.style.height = "300px";
}

function displayInfo(widget) {
    var info = document.getElementById('info');
    info.innerHTML = 'Position: ' + widget.get('position') + '<br />' + 'Distance: ' + widget.get('distance') + '<br />' + 'Bounds: ' + widget.get('bounds');
}
