var simTable = null;

var sim_list = [
    {
        modulesn:'GT001',
        serialno: '488455058023',
        imei: '540799794151047',
        imsi: '535115169494580',
        batchnumber: '252',
        batchdate: '04/03/2018',
        vendorid: '0b05',
        entity: 'Customer 1',

        msgno:25,
        expdate: '06/23/2020',
        devicesn:'D488455058023',
        sensorsn:'GTQ488455058023',
        timezone:'PT',
        nextwakeup:'-',
        maxawake:3,

        devicename:'Device 1',
        manufacturer:'GeoTraq',
        batterypower:'250mAh',
        noofsensors:2,

        sensortype: 'BINARY',
        sensorstate: true,
        msgtype: 543,
        sensormsgval: 243,
        sensormsgvalrev: 245,
        msgcalibration: 90,
        msgrevdate: new Date(moment().subtract(10, 'minutes')).getTime(),

        servicetype:'-',
        mqttlib:'mqtt://gw.boodskap.io',
        msgtourl:'https://api.boodskap.io',

        activestatus: true,
        provisioned: true,
        carrier: 'AT&T',

        updatedtime: new Date(moment().subtract(5, 'hours')).getTime()
    },
    {
        modulesn:'GT001',
        serialno: '520408452917137',
        imei: '458962119566725',
        imsi: '520287000236616',
        batchnumber: '125',
        batchdate: '02/18/2018',
        vendorid: '0502',
        entity: 'Customer 2',

        msgno:20,
        expdate: '04/03/2023',
        devicesn:'D395921899534',
        sensorsn:'GTQ820141526170',
        timezone:'PT',
        nextwakeup:'-',
        maxawake:5,

        devicename:'Device 2',
        manufacturer:'GeoTraq',
        batterypower:'250mAh',
        noofsensors:1,

        sensortype: 'ANALOG',
        sensorstate: false,
        msgtype: 245,
        sensormsgval: 55,
        sensormsgvalrev: 58,
        msgcalibration: 3.5,
        msgrevdate: new Date(moment().subtract(5, 'minutes')).getTime(),

        servicetype:'-',
        mqttlib:'mqtt://gw.boodskap.io',
        msgtourl:'https://api.boodskap.io',

        activestatus: true,
        provisioned: false,
        carrier: 'VERIZON',

        updatedtime: new Date(moment().subtract(4, 'hours')).getTime()
    },
    {
        modulesn:'GT002',
        serialno: '548710968290',
        imei: '350999101719820',
        imsi: '330003453732690',
        batchnumber: '125',
        batchdate: '05/18/2018',
        vendorid: '0103',
        entity: 'Customer 3',

        msgno:20,
        expdate: '04/03/2023',
        devicesn:'D548710968290',
        sensorsn:'GTQ548710968290',
        timezone:'PT',
        nextwakeup:'-',
        maxawake:5,

        devicename:'Device 3',
        manufacturer:'GeoTraq',
        batterypower:'250mAh',
        noofsensors:1,

        sensortype: 'ANALOG',
        sensorstate: true,
        msgtype: 245,
        sensormsgval: 55,
        sensormsgvalrev: 58,
        msgcalibration: 3.5,
        msgrevdate: new Date(moment().subtract(10, 'minutes')).getTime(),

        servicetype:'-',
        mqttlib:'mqtt://gw.boodskap.io',
        msgtourl:'https://api.boodskap.io',

        activestatus: false,
        provisioned: false,
        carrier: 'AT&T',

        updatedtime: new Date(moment().subtract(2, 'hours')).getTime()
    },
];


$(document).ready(function () {

    loadSimList();

    $("body").removeClass('bg-white');

});


function loadSimList() {


    if (simTable) {
        simTable.destroy();
        $("#simTable").html("");
    }

    var fields = [];

    //module profile
    /* fields = [
        {
            mData: 'checkbox',
            sTitle: '<input type="checkbox" name="tableCheck[]" value="" />',
            orderable: false,
            sWidth: '2%',
            mRender: function (data, type, row) {
                return '<input type="checkbox" name="tableCheck[]" value="" />';
            }
        },
        {
            mData: 'modulesn',
            sTitle: 'Module S/N',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'imei',
            sTitle: 'IMEI',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'imsi',
            sTitle: 'IMSI',
            orderable: true,
        },
        {
            mData: 'batchnumber',
            sTitle: 'Batch Number',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'batchdate',
            sTitle: 'Batch Date',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'vendorid',
            sTitle: 'Vendor ID',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'entity',
            sTitle: 'Entity Ownership',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')" title="Settings"><i class="icon-cog"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];*/

    //module attributes
    /*fields = [
        {
            mData: 'checkbox',
            sTitle: '<input type="checkbox" name="tableCheck[]" value="" />',
            orderable: false,
            sWidth: '2%',
            mRender: function (data, type, row) {
                return '<input type="checkbox" name="tableCheck[]" value="" />';
            }
        },
        {
            mData: 'modulesn',
            sTitle: 'Module S/N',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'imei',
            sTitle: 'IMEI',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'imsi',
            sTitle: 'IMSI',
            orderable: true,
        },
        {
            mData: 'msgno',
            sTitle: 'No. of Messages',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'expdate',
            sTitle: 'Exp. Date',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'devicesn',
            sTitle: 'Device S/N',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'sensorsn',
            sTitle: 'Sensor S/N',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'timezone',
            sTitle: 'Timezone',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'nextwakeup',
            sTitle: 'Next Wake Up Time',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'maxawake',
            sTitle: 'Max Awake Time',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')" title="Settings"><i class="icon-cog"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];*/

    //device profile
    /*fields = [
        {
            mData: 'checkbox',
            sTitle: '<input type="checkbox" name="tableCheck[]" value="" />',
            orderable: false,
            sWidth: '2%',
            mRender: function (data, type, row) {
                return '<input type="checkbox" name="tableCheck[]" value="" />';
            }
        },
        {
            mData: 'devicesn',
            sTitle: 'Device S/N',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'devicename',
            sTitle: 'Device Name',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'manufacturer',
            sTitle: 'Manufacturer Name',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'batterypower',
            sTitle: 'Battery Power',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'noofsensors',
            sTitle: 'Number of Sensors',
            orderable: true,
        },

        {
            mData: 'sensorsn',
            sTitle: 'Sensor S/N',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')" title="Settings"><i class="icon-cog"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];*/

    //Sensor Profile & Attributes
   /* fields = [
        {
            mData: 'checkbox',
            sTitle: '<input type="checkbox" name="tableCheck[]" value="" />',
            orderable: false,
            sWidth: '2%',
            mRender: function (data, type, row) {
                return '<input type="checkbox" name="tableCheck[]" value="" />';
            }
        },
        {
            mData: 'sensorsn',
            sTitle: 'Sensor S/N',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'sensortype',
            sTitle: 'Sensor Type',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'sensorstate',
            sTitle: 'Sensor State',
            orderable: true,
            mRender: function (data, type, row) {
                if(data){
                    return '<span class="label label-success">ON</span>'
                }else{
                    return '<span class="label label-danger">OFF</span>'
                }
            }
        },
        {
            mData: 'msgtype',
            sTitle: 'Message Type',
            orderable: true,
        },

        {
            mData: 'sensormsgval',
            sTitle: 'Sensor Message Value',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'sensormsgvalrev',
            sTitle: 'Sensor Message Value Revised',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'msgcalibration',
            sTitle: 'Message Calibration',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'msgrevdate',
            sTitle: 'Message Revised Date',
            orderable: false,
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY')
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')" title="Settings"><i class="icon-cog"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];
*/
    //Message Services Profile
    /*fields = [
        {
            mData: 'checkbox',
            sTitle: '<input type="checkbox" name="tableCheck[]" value="" />',
            orderable: false,
            sWidth: '2%',
            mRender: function (data, type, row) {
                return '<input type="checkbox" name="tableCheck[]" value="" />';
            }
        },
        {
            mData: 'modulesn',
            sTitle: 'Module S/N',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'imei',
            sTitle: 'IMEI',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'imsi',
            sTitle: 'IMSI',
            orderable: true,
        },
        {
            mData: 'servicetype',
            sTitle: 'Service Type',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'mqttlib',
            sTitle: 'MQTT Lib Type',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'msgtourl',
            sTitle: 'Message To Url',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '';
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')" title="Settings"><i class="icon-cog"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];*/

    //Carrier Profile
    fields = [
        {
            mData: 'checkbox',
            sTitle: '<input type="checkbox" name="tableCheck[]" value="" />',
            orderable: false,
            sWidth:'2%',
            mRender: function (data, type, row) {
                return '<input type="checkbox" name="tableCheck[]" value="" />';
            }
        },
        {
            mData: 'modulesn',
            sTitle: 'Module S/N',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>' + data + '</b>' : '-';
            }
        },
        {
            mData: 'imei',
            sTitle: 'IMEI',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>'+data+'</b>' : '-';
            }
        },
        {
            mData: 'imsi',
            sTitle: 'IMSI',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>'+data+'</b>' : '-';
            }
        },
        {
            mData: 'activestatus',
            sTitle: 'Active Status',
            orderable: false,
            mRender: function (data, type, row) {
                if(data){
                    return '<span class="label label-success">ACTIVE</span>'
                }else{
                    return '<span class="label label-default">IN-ACTIVE</span>'
                }
            }
        },
        {
            mData: 'provisioned',
            sTitle: 'Provisioned',
            orderable: false,
            mRender: function (data, type, row) {
                if(data){
                    return '<span class="label label-success">PROVISIONED</span>'
                }else{
                    return '<span class="label label-default">NOT PROVISIONED</span>'
                }
            }
        },
        {
            mData: 'carrier',
            sTitle: 'Carrier',
            orderable: true,
            mRender: function (data, type, row) {
                return data ? '<b>'+data+'</b>' : '-';
            }
        },
        {
            mData: 'updatedtime',
            sTitle: 'Updated Time',
            mRender: function (data, type, row) {
                return moment(data).format('MM/DD/YYYY hh:mm a')
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '10%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')" title="Settings"><i class="icon-cog"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row["id"] + '\')"><i class="icon-edit2"></i></button>' +
                    '<button class="btn btn-sm btn-icon btn-default" onclick="openModal(0,\'' + row['id'] + '\')"><i class="icon-trash-o"></i></button>';
            }
        }

    ];


    var sortNumber = fields.length-2;


    var tableOption = {
        fixedHeader: {
            header: true,
            headerOffset: -5
        },
        responsive: true,
        paging: true,
        searching: true,
        "ordering": true,
        aaSorting: [[sortNumber, 'desc']],
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        data: sim_list
    };

    $(".simCount").html(sim_list.length)
    simTable = $("#simTable").DataTable(tableOption);


}

