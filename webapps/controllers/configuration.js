// var CONFIG_BASE_PATH = 'https://platform.boodskap.io/config';
var CONFIG_BASE_PATH = 'http://localhost:4202/config';
var uniqueKey = '';

$(document).ready(function () {

    uniqueKey = guid();
    checkMachineType();

});


function checkMachineType() {

    var val = $("#machineType").val();

    if(val === 'Single'){
        $("#platformHost").val('127.0.0.1');
        $("#platformHost").attr('disabled','disabled')
        $("#cassandraHost").val('127.0.0.1');
        $("#cassandraHost").attr('disabled','disabled')
        $("#elasticHost").val('127.0.0.1');
        $("#elasticHost").attr('disabled','disabled')
        $("#emqHost").val('127.0.0.1');
        $("#emqHost").attr('disabled','disabled')
        $("#kibanaHost").val('127.0.0.1');
        $("#kibanaHost").attr('disabled','disabled')
    }else{
        $("#platformHost").val('');
        $("#platformHost").removeAttr('disabled')
        $("#cassandraHost").val('');
        $("#cassandraHost").removeAttr('disabled')
        $("#elasticHost").val('');
        $("#elasticHost").removeAttr('disabled')
        $("#emqHost").val('');
        $("#emqHost").removeAttr('disabled')
        $("#kibanaHost").val('');
        $("#kibanaHost").removeAttr('disabled')
    }

}

function getConfigList() {

    var data = {
        tokenid : $("#searchText").val()
    }

    $(".btnSubmit").attr('disabled','disabled')
    $(".btnSubmit").html('<i class="fa fa-spinner fa-spin"></i> Processing..')
    $.ajax({
        url: CONFIG_BASE_PATH + "/list",
        data:  JSON.stringify(data),
        contentType: "application/json",
        type: 'POST',
        success: function (data) {
            $(".btnSubmit").removeAttr('disabled')
            $(".btnSubmit").html('Fetch Configurations');
            if(data.status && data.result.total > 0){
                var result = data.result.data.data;
                $(".configList").html('');
                var count = 0;
                for(var i=0;i<result.length;i++){
                    var val = result[i];
                    if(val.downloadfile){
                        count+=1;
                    }
                    $(".configList").append('<tr>' +
                        '<td>' +
                        (val.downloadfile ? '<a href="'+CONFIG_BASE_PATH+'/download/'+val.downloadfile+'"><i class="fa fa-cog"></i> '+val.label+'<i class="fa fa-download"></i></a>' :
                            '<i class="fa fa-cog"></i> '+val.label +'<br><small><i class="fa fa-spinner fa-spin"></i> processing...</small>')+
                        '<br><i class="fa fa-server"></i> '+val.machine_type+' Instance' +
                        '<br><i class="fa fa-clock-o"></i> '+moment(val.create_ts).format('MM/DD/YYYY hh:mm a')+'</td>' +
                        '<td>'+val.platformhosts.split(",").join("<br>")+'</td>' +
                        '<td>'+val.cassandrahosts.split(",").join("<br>")+'</td>' +
                        '<td>'+val.elastichosts.split(",").join("<br>")+'</td>' +
                        '<td>'+val.emqxhosts.split(",").join("<br>")+'</td>' +
                        '<td>'+val.kibanahosts.split(",").join("<br>")+'</td>' +
                        '</tr>');
                }

                if(count === result.length){
                    setTimeout(function () {
                        getConfigList()
                    },2000);

                }

            }else{
                $(".configList").html('<tr><td colspan="7"><p style="padding:25px">No data available!</p></td></tr>')
                swal("Warning", "No configuration found!", "warning");
            }
        },
        error: function (e) {
            $(".btnSubmit").removeAttr('disabled')
            $(".btnSubmit").html('Fetch Configurations');
            swal("Error", "Something went wrong, Please try again later", "error");
        }
    });
}

function generateConfig() {
    var data = {
        cassandrahosts : $("#cassandraHost").val(),
        configid : guid(),
        elastichosts : $("#elasticHost").val(),
        emqxhosts : $("#emqHost").val(),
        kibanahosts : $("#kibanaHost").val(),
        label : $("#configName").val(),
        platformhosts : $("#platformHost").val(),
        tokenid : $("#emailID").val(),
        machine_type : $("#machineType").val(),
        create_ts : new Date().getTime()
    }
    $(".btnSubmit").attr('disabled','disabled')
    $(".btnSubmit").html('<i class="fa fa-spinner fa-spin"></i> Processing..')

    $.ajax({
        url: CONFIG_BASE_PATH + "/generate/configuration",
        data:  JSON.stringify(data),
        contentType: "application/json",
        type: 'POST',
        success: function (data) {
            $(".btnSubmit").removeAttr('disabled')
            $(".btnSubmit").html('<i class="fa fa-cogs"></i> Generate Configuration');

            if(data.status){
                $(".genearteConf form")[0].reset();
                checkMachineType();
                document.location="#configList";
                swal("Success", "Config generated successfully!", "success");
                $("#searchText").val($("#emailID").val())
                getConfigList();
            }else{
                swal("Error", "Error in generating configuration!", "error");
            }
        },
        error: function (e) {
            $(".btnSubmit").removeAttr('disabled')
            $(".btnSubmit").html('<i class="fa fa-cogs"></i> Generate Configuration');
            swal("Error", "Something went wrong, Please try again later", "error");
        }
    });
}





function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}