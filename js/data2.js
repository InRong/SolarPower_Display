			var gendata = {
				labels:[],
				datasets : [
					{
						label: 'Generated Power',
						backgroundColor: 'rgba(40, 200, 000, 0.75)',
						borderColor: 'rgba(200, 200, 200, 0.75)',
						hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
						hoverBorderColor: 'rgba(200, 200, 200, 1)',
						data: []
					}
				]
			};

			var useddata = {
				labels:[],
				datasets : [
					{
						label: 'Used Power',
						backgroundColor: 'rgba(240, 00, 000, 0.75)',
						borderColor: 'rgba(200, 200, 200, 0.75)',
						hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
						hoverBorderColor: 'rgba(200, 200, 200, 1)',
						data: []
					}
				]
			};

			var griddata = {
				labels:[],
				datasets : [
					{
						label: 'Grid Power',
						backgroundColor: 'rgba(40, 00, 200, 0.75)',
						borderColor: 'rgba(200, 200, 200, 0.75)',
						hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
						hoverBorderColor: 'rgba(200, 200, 200, 1)',
						data: []
					}
				]
			};

			var ctxgen = $("#gencanvas");
			var ctxused = $("#usedcanvas");
			var ctxgrid = $("#gridcanvas");

			var genGraph = new Chart(ctxgen, {
				type: 'bar',
				data: gendata,
				options: {
				  scales: {
				    yAxes: [{
					scaleLabel: {
					  display: true,
					  labelString: 'Watts'}
				    }],
				    xAxes: [{
					type: 'time',
					scaleLabel: {
					  display: true,
					  labelString: 'Time'}
				    }]
				  }
				}
			});
			var usedGraph = new Chart(ctxused, {
				type: 'bar',
				data: useddata,
				options: {
					  scales: {
				    yAxes: [{
					scaleLabel: {
					  display: true,
					  labelString: 'Watts'}
				    }],
				    xAxes: [{
					type: 'time',
					scaleLabel: {
					  display: true,
					  labelString: 'Time'}
				    }]
				  }
				}
			});
			var gridGraph = new Chart(ctxgrid, {
				type: 'bar',
				data: griddata,
				options: {
				  scales: {
				    yAxes: [{
					scaleLabel: {
					  display: true,
					  labelString: 'Watts'}
				    }],
				    xAxes: [{
					type: 'time',
					scaleLabel: {
					  display: true,
					  labelString: 'Time'}
				    }]
				  }
				}
			});

$body = $("body");


function newdate(item){
	if (!item){
		var chosen=item.value;
		//alert (item.value);
		alert (chosen);
		get_data("DATE&DATE="+chosen);
	}
}
function get_data(periodset){
	$.ajax({
		url: "getdata.php?PERIOD="+periodset,
		method: "GET",
		success: function(data) {
			//console.log(data);
			var times = [];
			var gen = [];
			var used = [];
			var grid = [];
			var maxgen = 0;
			var mingen = 10000;
			var maxused = 0;
			var minused = 10000;
			var maxexp = 0;
			var minexp = 10000;

			for(var i in data) {
			   if (data[i]["DATE"]==null) {	
				times.push(data[i]["LogTime"]);
				gen.push(data[i]["GeneratedPower"]);
				ttt = parseFloat(data[i]["GeneratedPower"]);
				if (ttt>maxgen) { maxgen = ttt; }
				if (ttt<mingen) { mingen = ttt; }
				used.push(data[i]["UsedPower"]);
				ttt = parseFloat(data[i]["UsedPower"]);
				if (ttt>maxused) { maxused = ttt; }
				if (ttt<minused) { minused = ttt; }
				grid.push(data[i]["Exported"]);
				ttt = parseFloat(data[i]["Exported"]);
				if (ttt>maxexp) { maxexp = ttt; }
				if (ttt<minexp) { minexp = ttt; }
			   }
			}
			readDate=data[i]["DATE"];
			if (readDate!=null) {
			       	$(document).prop("title","Alma Lane Power for "+readDate);
			  	//$("#TitleDate").html("Test");
			  	$("#TitleDate").html(readDate);
			}
			$("#MinGen").text(mingen);
			$("#MaxGen").html(maxgen);
			$("#MinUsed").html(minused);
			$("#MaxUsed").html(maxused);
			$("#MinExport").html(minexp);
			$("#MaxExport").html(maxexp);
			//console.log(maxgen);
			//console.log(i);

			removeData(usedGraph);
			addData(usedGraph, times, used);
			removeData(genGraph);
			addData(genGraph, times, gen);
			removeData(gridGraph);
			addData(gridGraph, times, grid);
		},
		error: function(data) {
			console.log(data);
		}
	});
}
function getOffset(offset) {
  var daystr = $("#TitleDate").text();
  if (daystr == "TODAY") {
     var dayt = new Date();
  } else {
     var dayt = new Date(daystr);
  }
  dayt.setDate(dayt.getDate()+offset);
  var newDaytM=dayt.getMonth()+1;
  var newDaytD=dayt.getDate();
  if (newDaytD<10) {newDaytD="0"+newDaytD;}
  if (newDaytM<10) {newDaytM="0"+newDaytM;}
  newdate=dayt.getFullYear()+"-"+newDaytM+"-"+newDaytD;
  //get_data("DATE&DATE="+newdate);
  get_data("DATE&DATE="+newdate);
		  }
function nextDay() {
	getOffset(1);
		  }
function previousDay() {
	getOffset(-1);
		  }
function test(Graph) {
	removeData(Graph);
	Graph.update();
}
function addData(chart, label, dataList) {
	    chart.data.labels=label;
	    //for (var i in dataList) {
	        chart.data.datasets.forEach((dataset) => {
		        //dataset.data.push(dataList[i]);
		        dataset.data=dataList;
		});
	    //}
	    chart.update();
}
function removeData(chart) {
	while (chart.data.labels.pop()) {
	        chart.data.datasets.forEach((dataset) => {
		        dataset.data.pop();
        	});
	}
}
$(document).ready(function(){
	get_data("TODAY");
	$('input[type="date"]').change(function(){
	        //alert(this.value);         //Date in full format alert(new Date(this.value));
	        //var inputDate = new Date(this.value);
		get_data("DATE&DATE="+this.value);
	});
	
});

$(document).on({
	    ajaxStart: function() { $body.addClass("loading");    },
	     ajaxStop: function() { $body.removeClass("loading"); }    
});
