$(document).ready(function () {
    setInterval(function () {
        loadStatus()
    },60000)
    loadStatus()
});

var soundInterval = null;


function playBeep() {
    document.getElementById("beepAudio").play().catch(function() {
        // do something
        var media = document.getElementById("beepAudio");
        media.play()
    });
}


function loadStatus() {

    if(soundInterval){
        clearInterval(soundInterval);
    }

    $.ajax({
        url: API_BASE_PATH + "/cluster/process/check",
        success: function (data) {

            // playBeep()
            // soundInterval = setInterval(function () {
            //     playBeep();
            // },5000)

            /*$(".mainStatus").html('<h1 class="alert alert-danger"><i class="fa fa-ban"></i> Error Encountered</h1>')
            $(".msgStatus").html('');
            $(".serverInfo").html('');
            $(".totalInfo").html('');*/

            $(".mainStatus").html('<h1 class="alert alert-success"><i class="fa fa-check-circle"></i>  All Systems Operational</h1>')
            $(".msgStatus").html(data['message'])
            $(".serverInfo").html('');

            var totalMessages=0;
            var totalMsgRules=0;
            var totalBinayRules=0;

            for (vkey in data) {
                var obj = data[vkey];
                if (obj['system.type'] === 'server') {
                    $(".serverInfo").append(`
                    <div class="col-md-4">
                        <div class="infoBlock serverClass">
                            <p class="sysName mb-1"><strong>` + obj['system.type'] + `</strong></p>
                            <small>Total CPU's: <b>` + obj['system.cpus'] + `</b></small><br>
                            <small>Started Time: <b>` + obj['system.started-date'] + `</b></small><br>
                            <table class="table table-striped" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Processed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Messages</td>
                                        <td>` + obj['messages.processed'] + `</td>
                                    </tr>
                                    <tr>
                                        <td>Message Rules</td>
                                        <td>` + obj['message.rules.processed'] + `</td>
                                    </tr>
                                    <tr>
                                        <td>Binary Rules</td>
                                        <td>` + obj['binary.rules.processed'] + `</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    `);
                    totalMessages+=obj['messages.processed'];
                    totalMsgRules+=obj['message.rules.processed'];
                    totalBinayRules+=obj['binary.rules.processed'];
                }
            }

            for (vkey in data) {
                var obj = data[vkey];
                if (obj['system.type'] === 'worker') {
                    $(".serverInfo").append(`
                    <div class="col-md-4">
                        <div class="infoBlock workerClass">
                            <p class="sysName mb-1"><strong>` + obj['system.type'] + `</strong></p>
                            <small>Total CPU's: <b>` + obj['system.cpus'] + `</b></small><br>
                            <small>Started Time: <b>` + obj['system.started-date'] + `</b></small><br>
                            <table class="table table-striped" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Processed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Messages</td>
                                        <td>` + obj['messages.processed'] + `</td>
                                    </tr>
                                    <tr>
                                        <td>Message Rules</td>
                                        <td>` + obj['message.rules.processed'] + `</td>
                                    </tr>
                                    <tr>
                                        <td>Binary Rules</td>
                                        <td>` + obj['binary.rules.processed'] + `</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    `);
                    totalMessages+=obj['messages.processed'];
                    totalMsgRules+=obj['message.rules.processed'];
                    totalBinayRules+=obj['binary.rules.processed'];
                }
            }

            $(".totalInfo").html(
            `<table class="table table-bordered" style="width: 100%">
                <thead>
                <tr>
                <th>Type</th>
                <th>Processed</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                <td>Messages</td>
                <td>` + totalMessages + `</td>
                </tr>
                <tr>
                <td>Message Rules</td>
            <td>` + totalMsgRules + `</td>
            </tr>
            <tr>
            <td>Binary Rules</td>
            <td>` + totalBinayRules + `</td>
            </tr>
            </tbody>
            </table>`
            )

        },
        error: function (e) {

            $(".mainStatus").html('<h1 class="alert alert-danger"><i class="fa fa-ban"></i> Error Encountered</h1>')
            $(".msgStatus").html('');
            $(".serverInfo").html('');
            $(".totalInfo").html('');
            playBeep();
            soundInterval = setInterval(function () {
                playBeep();
            },5000)

        }
    });


}