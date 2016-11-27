queue()
	.defer(d3.csv, "./terrorism_attack.csv")
	.await(makeGraphs);
	var a;
function makeGraphs(error, apiData) {
//date now becomes date
    var dataSet = apiData;
    var dateFormat = d3.time.format("%m/%d/%Y");
	console.log(dataSet)
	a=dataSet
    dataSet.forEach(function(d) {
		d.nkill = +d.nkill;
		d.nwound = +d.nwound;
		d.date = dateFormat.parse(d.date);
				d.date.setDate(1);
	});



	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensionsm, from dataset names to js names
	var international =ndx.dimension(function(d){ return d.INT_ANY; });
	var death = ndx.dimension(function(d) { return +d.nkill; });
	var wounded = ndx.dimension(function(d) { return +d.nwound; });
	var countryName = ndx.dimension(function(d) { return d.country_txt; });
	var dateAttack = ndx.dimension(function(d) { return d.date; });
	var attackTarget = ndx.dimension(function(d) { return d.targtype1_txt; });
	var attackType = ndx.dimension(function(d) { return d.attacktype1_txt; });
	var longitude = ndx.dimension(function(d) { return +d.longitude; });
	var latitude = ndx.dimension(function(d) { return +d.latitude; });
	var allDim = ndx.dimension(function(d) {return d;});

  

	//Calculate metrics, aggregate (sum up) using js names to get group names
	var attacksByDate = dateAttack.group();
	var attacksByTarget = attackTarget.group();
	var attacksByType = attackType.group();
	var countryGroup = countryName.group();
	var internationalGroup = international.group();
	var deathGroup = death.group();
	var woundedGroup = wounded.group();
	var all = ndx.groupAll();

	
	
	//sum numbers, aggregate using js names, return dataset names
	var totalwounded = ndx.groupAll().reduceSum(function(d) {
		return d.nwound;
	});

	var totalkilled = ndx.groupAll().reduceSum(function(d) {
		return d.nkill;
	});
	


	
	
	//Define threshold values for data
	var minDate = dateAttack.bottom(1)[0].date;
	var maxDate = dateAttack.top(1)[0].date;

console.log(minDate);
console.log(maxDate);

	//Charts, define the chart names
	var attackdatesChart = dc.lineChart("#attack-dates-chart");
	var attacktargetChart = dc.rowChart("#attack-target-chart");
	var attacktypeChart = dc.rowChart("#attack-type-chart");
	var deathfigure = dc.numberDisplay("#total-death-number");
	var woundedfigure = dc.numberDisplay("#total-wounded-number");
	var attacksfigure = dc.numberDisplay("#total-attack-number");
  
  
  // create additonal maps
  var grayscale = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}),
      osmde = L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
            attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
  
  
  
   // add map
  var map = L.map('map',{
            center: [30, 20],
            zoom:1,
            maxZoom:5,
            minZoom:1,
            layers:[osmde,grayscale]
  });    
  
  var baseMaps = {
        "Grayscale": grayscale,
        "OSM": osmde
  };
  
  L.control.layers(baseMaps).addTo(map);
  
  
  
  // draw map, add as a tile layer 
  var drawMap = function(){

   map.setView([30, 20], 1);
    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
     attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        maxZoom: 5,
       minZoom: 1,
      }).addTo(map);

   
  // read data
  var geoData = [];
    _.each(allDim.top(Infinity), function (d) {
        geoData.push([d["latitude"], d["longitude"], 1]);
    });
    
  // draw heatmap
  var heat = L.heatLayer(geoData,{
        radius: 9,
        blur: 21, 
        maxZoom: 1,
    }).addTo(map);
  
    }; 
    drawMap();
    
  //L.marker(geoData).addTo(map);
    
    // CODES THAT DON'T WORK FOR UPLOADING MARKERS
    //eventMarkers.clearLayers();
    // _.each(allDim.top(Infinity), function (d) {
    // var latitude = +d.latitude;
    // var longitude = +d.longitude;
    // var killed = +d.nkill;
    // var wounded = +d.nwound;
    // var marker = L.marker([latitude, longitude]);
    // marker.bindPopup("<p>" + killed + " " + wounded + " </p>");
    // eventMarkers.addLayer(marker);
    // });
    // map.addLayer(eventMarkers);
    // map.fitBounds(eventMarkers.getBounds());
    // SIMPLE MARKER CODE THAT WORKS. 
    //L.marker([20, 55]).addTo(map)
    //.bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //.openPopup(); 
   // updating map markers  -- TO ADD FILTER TOO. Filter does not update map for now



	//For cross filter
  var countryfilter = dc.selectMenu('#countries')
        .dimension(countryName)
        .group(countryGroup);


   dcCharts = [countryfilter, attackdatesChart, attacktargetChart, attacktypeChart];

_.each(dcCharts, function (dcChart) {
    dcChart.on("filtered", function (chart, filter) {
        map.eachLayer(function (layer) {
          map.removeLayer(layer)
        }); 
    drawMap();
    });
});


	attackdatesChart
		.width(600)
		.height(230)
		.margins({top: 10, right: 30, bottom: 30, left: 40})
		.dimension(dateAttack)
		.group(attacksByDate)
		.renderArea(true)
		.transitionDuration(200)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);

	attacktargetChart
        .width(400)
        .height(300)
        .dimension(attackTarget)
        .group(attacksByTarget)
        .elasticX(true)
        .xAxis().ticks(5);

	attacktypeChart
		.width(400)
		.height(300)
        .dimension(attackType)
        .group(attacksByType)
		.elasticX(true)
        .xAxis().ticks(4);

	deathfigure
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalkilled)
		.formatNumber(d3.format(".3s"));
		
	woundedfigure
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalwounded)
		.formatNumber(d3.format(".3s"));
				
	attacksfigure
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);
		

    dc.renderAll();

};
