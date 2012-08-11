(function($){
	function init(){
		generateCharts();
	}

	function generateCharts(){
		$("table[data-chart]").each(function(){
			buildChart(this);
		});
	}

	function buildChart(table){
		var $table = $(table),
			id = $table.attr('data-chart'),
			$container = $('<div class="chart-container" id="' + id + '"></div>');

		$table.after($container);

		var categories = $table.find('tr').find('td:first').map(function(e){
			return $(this).text();
		});

		var series = $table.find('th:gt(0)').map(function(i){
			var $cell = $(this);
			var data = [];

			$table.find('tr').find('td:eq(' + (i + 1) + ')').each(function(){
				data.push(parseFloat($(this).text()));
			});
			console.log(data);
			return {name: $cell.text(), data:data}
		});

		var config = {
			chart: {
	            renderTo: id,
	            type: 'column'
	         },
	         colors: [
	         	$table.attr('data-color')
	         ],
	         title: { text: '' },
	         xAxis: {
	            categories: categories
	         },
	         yAxis: {
	         	title: {text:''}
	         },
	         plotOptions: {
				column: {
					stacking: 'normal',
					dataLabels: {
						enabled: true,
						color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
					}
				}
			},
	         series: series
     	};
		
		var chart = new Highcharts.Chart(config);
		$table.hide();
	}


	init();
}(jQuery));