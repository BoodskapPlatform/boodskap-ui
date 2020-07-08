var widgets_list = [];
var verticals_list = [];
var downloadCount = 0;
var downloadList = []

$(document).ready(function () {
    // $(".bodyContainer").css('height', $(window).height() - 165)
    $("body").removeClass('bg-white');
    $("body").css('background-color', '#eee !important');

    loadWidgets();
    loadVerticals();

});



function loadVerticals() {

    var queryParams = {
        query: { "bool": {
            "must": [],
        }},
        size: 6,
        from: 0,
        sort: [{'updatedtime': {'order': 'desc'}}],
    };

    var obj = {
        "method": "GET",
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    $(".verticalList").html('')

    searchByQuery('', 'VERTICAL_PUBLISHED', obj, function (status, data) {
        if (status) {
            var result = QueryFormatter(data).data;
            verticals_list = result.data;

            $(".verticalCount").html(result.recordsTotal);

            for(var i=0;i<verticals_list.length;i++){
                $(".verticalList").append(renderVertical(verticals_list[i]))
            }
        }
    });

}

function renderVertical(obj) {
    var str =`
    <div class="col-lg-3" style="padding: 5px;" onclick="document.location=BASE_PATH+'/marketplace/verticals'">
        <div class="verticalContent" style="height: 185px">
        <div style="">
        <img src="` + API_BASE_PATH + `/files/public/download/` + obj.verticalimage + `" alt="" style="max-width: 100%;height:100px;"/>
        <h4 style="margin-top: 5px;">`+obj.verticalname+`</h4>
        <p style="margin-bottom: 5px;font-size:12px;">`+obj.category+` <br>
        <small> by, <b>`+obj.createdby+`</b></small> </p>
    </div>
    </div>`;
    return str;

}


function loadWidgets() {

    var queryParams = {
        query: { "bool": {
            "must": [],
        }},
        size: 12,
        from: 0,
        sort: [{'updatedtime': {'order': 'desc'}}],
    };

    var obj = {
        "method": "GET",
        "extraPath": "",
        "query": JSON.stringify(queryParams),
        "params": []
    };

    searchByQuery('', 'WIDGET_PUBLISHED', obj, function (status, data) {
        if (status) {
            var result = QueryFormatter(data).data;
            widgets_list = result.data;
            $(".widgetCount").html(result.recordsTotal);

            for(var i=0;i<widgets_list.length;i++){
                $(".widgetList").append(renderWidget(widgets_list[i]))
            }
        }
    });

}

function renderWidget(obj) {
    var str = `
    <div class="col-lg-2" style="padding: 5px;" onclick="document.location=BASE_PATH+'/marketplace/widgets'">
        <div class="widgetContent">
            <div style="">
            <img src="` + API_BASE_PATH + `/files/public/download/` + obj.widgetimage + `" alt="" style="max-width: 100%"/>
            <h4>`+obj.widgetname+`</h4>
            <p style="margin-bottom: 5px;font-size:12px;">`+obj.category+` <br>
            <small> by, <b>`+obj.createdby+`</b></small> </p>
        </div>
    </div>
    `;
    return str;

}

