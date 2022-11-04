var messageListTable='';
var profileListTable='';
$( document ).ready(function() {
    linechart()
    date()
    loadMessageList()
    loadProfileList()

    const numbers = document.querySelectorAll('.number');
const svgEl = document.querySelectorAll('svg circle');
const counters = Array(numbers.length);
const intervals = Array(counters.length);
counters.fill(0);
numbers.forEach((number, index) => {
    intervals[index] = setInterval(() => {
        // if(counters[index] === parseInt(number.dataset.num)){ 
        if(counters[index] === 1243){ 
            clearInterval(counters[index]);
        }else{
            counters[index] += 1;
            number.innerHTML = counters[index];
            svgEl[index].style.strokeDashoffset = Math.floor(495 - 495 * parseFloat(number.dataset.num / 100));
        
        }
    }, 0);
});
   
});

function linechart() {
    $("#deviceChart").html('<div id="deviceChartdiv"  style="height: 300px;margin:auto!important;"></div>');
var chartDom = document.getElementById('deviceChartdiv');
var myChart = echarts.init(chartDom);
var option;

option = {
    tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        formatter: '<div class="line-tip"> <h4 class="mb-0"> {c}</h4> <small>{b}</small> </div>'
      },
      xAxis: {
        type: 'category',
        data: ['11:00', '12:00', '01:00', '02:00', '03:00', '04:00', '05:00'],  lineStyle: {color: 'yellow'},
         splitLine: {
          show: true
        },
        axisTick: {
            show: false
          },
        
          axisLabel: {
            color: 'orange'
          }
      },
      yAxis: {
        type: 'value',
        axisTick: {
            show: false
          },
          color:'grey',
          splitLine: { 
          show: false  // remove the value line axis
        },
              
      },
      
    grid: {
        top:15,
    left:50,
    bottom:40,
    right:20
    },
   
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          areaStyle: {},
          type: 'line',
          smooth: true,
              symbolSize: 8,
              color:"red",
              
              lineStyle: {
                  color: "red"
                },
        }
      ]
};

option && myChart.setOption(option);

}

function date() {
  startDate = moment().subtract(29, 'days').startOf('day');  
  endDate = moment().endOf('days');
  $('#reportrange').daterangepicker({
      startDate: startDate,
      endDate: endDate,
      "opens": "left",
      ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
      }
  }, cb);
  cb(startDate, endDate);
}

function cb(start, end) {
  var title = '';
  var range = '';

  startDate = start;
  endDate = end;

  if (new Date(start).getTime() === new Date(moment().startOf('day')).getTime()) {
      title = 'Today:';
      range = start.format('MMMM D, YYYY');
  } else if (new Date(start).getTime() === new Date(moment().subtract(1, 'day').startOf('day')).getTime()) {
      title = 'Yesterday:';
      range = start.format('MMMM D, YYYY');
  }
  else {
      range = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');
  }
  $('#reportrange span').html(title + ' ' + range);

  startDate = new Date(moment(start).startOf('day')).getTime();
  endDate = new Date(moment(end).endOf('day')).getTime();

}
var dataSet = [
  ['',"CVID_0098", "145234667789", "Simulator_199","HTTP","03/27/2022 11:25:13 pm", "Boodskap","1.1","12312312312", "-1","0:0:0:;1%2342:434:45","0:0:0:;1%234","XOTJSONBI","eb34534$$%3"],
  ['',"CVID_0098", "145234667789", "Simulator_199","HTTP","03/27/2022 11:25:13 pm", "Boodskap","1.1","12312312312", "-1","0:0:0:;1%2342:434:45","0:0:0:;1%234","XOTJSONBI","eb34534$$%3"],
  ['',"CVID_0098", "145234667789", "Simulator_199","HTTP","03/27/2022 11:25:13 pm", "Boodskap","1.1","12312312312", "-1","0:0:0:;1%2342:434:45","0:0:0:;1%234","XOTJSONBI","eb34534$$%3"],
  ['',"CVID_0098", "145234667789", "Simulator_199","HTTP","03/27/2022 11:25:13 pm", "Boodskap","1.1","12312312312", "-1","0:0:0:;1%2342:434:45","0:0:0:;1%234","XOTJSONBI","eb34534$$%3"],
  ['',"CVID_0098", "145234667789", "Simulator_199","HTTP","03/27/2022 11:25:13 pm", "Boodskap","1.1","12312312312", "-1","0:0:0:;1%2342:434:45","0:0:0:;1%234","XOTJSONBI","eb34534$$%3"],
  ['',"CVID_0098", "145234667789", "Simulator_199","HTTP","03/27/2022 11:25:13 pm", "Boodskap","1.1","12312312312", "-1","0:0:0:;1%2342:434:45","0:0:0:;1%234","XOTJSONBI","eb34534$$%3"],
];
function loadMessageList() {
  if (messageListTable) {
    messageListTable.destroy();
      $("#messageListTable").html("");
  }
  messageListTable = $('#messageListTable').DataTable({
      data: dataSet,
      searching: true,
      paging: true,
      dom: '<"search-left"f><"pull-left"l>rtip',
      lengthChange: true,
      iDisplayLength: 10,
      lengthMenu: [
          [10, 50, 100],
          [10, 50, 100]
      ],
      pagingType: "simple_numbers",
      language: {
          "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> &nbsp;',
          "searchPlaceholder": "Search here...",
          "emptyTable": "No data found!",
          "processing": '<div class="p-2"><i class="fa fa-spinner fa-spin"></i> Processing</div>',
          loadingRecords: '',
          paginate: {
              previous: '< Prev',
              next: 'Next >'
          }
      },
      "bLengthChange": true,
      columns: [
        {
          sTitle: "",
          "className": 'details-control sortingtable font-weight-400',
          "orderable": false,
          sWidth: '3%',
          "data": null,
          "defaultContent": '',
          "render": function () {
              return '<i class="fa fa-plus-square" aria-hidden="true"></i>';
          },
          width:"15px"
      },
          {
              sTitle: "Frame Id",
              "className": 'sortingtable font-weight-400',
              "orderable": true,
              sWidth: '3%',
              _render: function (data, row) {
                  var str = data
                  return str;
              }
          },
          {
              sTitle: "MUId",
              sWidth: '2%',
              "orderable": true,
              "className": 'sortingtable font-weight-400',
              render: function (data) {
                  var str = data;
                  return str;
              }
          },
          {
              sTitle: "Device Id",
              sWidth: '3%',
              "className": 'sortingtable font-weight-400',
              "orderable": true,
              render: function (data) {
                  var str = data;
                  return str;
              }
          },
          {
              sTitle: "Channel",
              sWidth: '5%',
              "className": 'sortingtable font-weight-400',
              "orderable": true,
              render: function (data) {
                  var str = data
                  return str;
              }
          },
          {
            sTitle: "Receivedstamp",
            sWidth: '10%',
            "className": 'sortingtable font-weight-400',
            "orderable": true,
            render: function (data) {
                var str = data
                return str;
            }
        },
        {
          sTitle: "DMDL",
          sWidth: '5%',
          "className": 'sortingtable font-weight-400',
          "orderable": true,
          render: function (data) {
              var str = data
              return str;
          }
      },
      {
        sTitle: "Fwver",
        sWidth: '2%',
        "className": 'sortingtable font-weight-400',
        "orderable": true,
        render: function (data) {
            var str = data
            return str;
        }
    },
    {
      sTitle: "IP Address",
      sWidth: '5%',
      "className": 'sortingtable font-weight-400',
      "orderable": true,
      render: function (data) {
          var str = data
          return str;
      }
  },
  {
    sTitle: "Port",
    sWidth: '2%',
    "className": 'sortingtable font-weight-400',
    "orderable": true,
    render: function (data) {
        var str = data
        return str;
    }
},


      ],
      "initComplete": function( settings, json ) {
          $('#'+settings.nTable.id+'_filter input').wrap(`
          <div class="d-inline-flex"></div>
      `).after(`
          <button type="button" class="close d-none position-absolute" aria-label="Close" style="right: 42px; bottom:7px;font-size: 20px;">
            <span aria-hidden="true">&times;</span>
          </button>
          <button class="search-btn"> <i class="fa fa-search" aria-hidden="true"></i></button> 
      `).attr('required','required').attr('title','Search');

      // Click Event on Clear button
      $(document).on('click', '#'+settings.nTable.id+'_filter button', function(){
         $('#'+settings.nTable.id).DataTable({
           "retrieve": true,
          }).search('').draw(); // reDraw table
      });
     },
     
  });
  $('#messageListTable tbody').on('click', 'td.details-control', function () {
    var tr = $(this).closest('tr');
    var tdi = tr.find("i.fa");
    var row = messageListTable.row(tr);
  
    if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
        tdi.first().removeClass('fa-minus-square');
        tdi.first().addClass('fa-plus-square');
    }
    else {
        // Open this row
        row.child(format(row.data())).show();
        tr.addClass('shown');
        tdi.first().removeClass('fa-plus-square');
        tdi.first().addClass('fa-minus-square');
    }
  });
  
  messageListTable.on("user-select", function (e, dt, type, cell, originalEvent) {
    if ($(cell.node()).hasClass("details-control")) {
        e.preventDefault();
    }
  });
}
var dataSet2 = [
  ["trigger_event","Domain_name_rule","03/27/2022 11:25:13 pm","Cannot invoke method size"],
  ["trigger_event","Domain_name_rule","03/27/2022 11:25:13 pm","Cannot invoke method size"],
  ["trigger_event","Domain_name_rule","03/27/2022 11:25:13 pm","Cannot invoke method size"],
  ["trigger_event","Domain_name_rule","03/27/2022 11:25:13 pm","Cannot invoke method size"],
  ["trigger_event","Domain_name_rule","03/27/2022 11:25:13 pm","Cannot invoke method size"],
  ["trigger_event","Domain_name_rule","03/27/2022 11:25:13 pm","Cannot invoke method size"],
  ["trigger_event","Domain_name_rule","03/27/2022 11:25:13 pm","Cannot invoke method size"],

]
function loadProfileList() {
  if (profileListTable) {
    profileListTable.destroy();
      $("#profileListTable").html("");
  }
  profileListTable = $('#profileListTable').DataTable({
      data: dataSet2,
      searching: true,
      paging: true,
      dom: '<"search-left"f><"pull-left"l>rtip',
      lengthChange: true,
      iDisplayLength: 10,
      lengthMenu: [
          [10, 50, 100],
          [10, 50, 100]
      ],
      pagingType: "simple_numbers",
      language: {
          "sSearch": '<i class="fa fa-search" aria-hidden="true"></i> &nbsp;',
          "searchPlaceholder": "Search here...",
          "emptyTable": "No data found!",
          "processing": '<div class="p-2"><i class="fa fa-spinner fa-spin"></i> Processing</div>',
          loadingRecords: '',
          paginate: {
              previous: '< Prev',
              next: 'Next >'
          }
      },
      "bLengthChange": true,
      columns: [
       
          {
              sTitle: "Frame Id",
              "className": 'sortingtable font-weight-400',
              "orderable": true,
              sWidth: '3%',
              _render: function (data) {
                  var str = data
                  return str;
              }
          },
          {
              sTitle: "MUId",
              sWidth: '2%',
              "orderable": true,
              "className": 'sortingtable font-weight-400',
              render: function (data) {
                  var str = data;
                  return str;
              }
          },
          {
              sTitle: "Device Id",
              sWidth: '3%',
              "className": 'sortingtable font-weight-400',
              "orderable": true,
              render: function (data) {
                  var str = data;
                  return str;
              }
          },
          {
              sTitle: "Channel",
              sWidth: '5%',
              "className": 'sortingtable font-weight-400',
              "orderable": true,
              render: function (data) {
                  var str = data
                  return str;
              }
          },
        


      ],
      "initComplete": function( settings, json ) {
          $('#'+settings.nTable.id+'_filter input').wrap(`
          <div class="d-inline-flex"></div>
      `).after(`
          <button type="button" class="close d-none position-absolute" aria-label="Close" style="right: 42px; bottom:7px;font-size: 20px;">
            <span aria-hidden="true">&times;</span>
          </button>
          <button class="search-btn"> <i class="fa fa-search" aria-hidden="true"></i></button> 
      `).attr('required','required').attr('title','Search');

      // Click Event on Clear button
      $(document).on('click', '#'+settings.nTable.id+'_filter button', function(){
         $('#'+settings.nTable.id).DataTable({
           "retrieve": true,
          }).search('').draw(); // reDraw table
      });
     },
     
  });
}

function format(d){
        
  // `d` is the original data object for the row
  return '<table cellpadding="5" cellspacing="0" border="0" style="margin-left:25px;">' +
     '<tr class="inner-row">' +
          '<th>NodeUId</th>' +
          '<th>NodeUId</th>' +
          '<th>Domain Key</th>' +
          '<th>Id</th>' +
          '</tr>' +
    '<tr>' +
       '<td>' + dataSet[0][10] + '</td>' +
        '<td>' + dataSet[0][11] + '</td>' +
       '<td>' +  dataSet[0][12] + '</td>' +
         '<td>' +  dataSet[0][13] + '</td>' +
      '</tr>' +
  '</table>';  
}





