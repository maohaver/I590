//testing code

var apiKey = "897b700722da6ea1a25b679de7970f3ad6d81ef9";
var curCounty = '18097';
var g = null;
var centered;

$(function(){
    $('#totalPopulationByCounty').off('click').on('click', createPopulationByCounty);
    $('#medianAge').off('click').on('click', createMedianAge);
    $('#medianHouseholdIncome').off('click').on('click', createMedianHouseholdIncome);
    $('#perCapitaIncome').off('click').on('click', createPerCapitaIncome);

    $('body').on('click', 'path', function(){
        $('path').removeClass('active');
        $(this).addClass('active');
    });

    createPopulationByCounty();
});

function createPopulationByCounty(){
    var formats = {
        percent: d3.format('d')
    };

    $('#map, #legend').empty();

    var margin = {top: 10, left: 10, bottom: 10, right: 10}
        , width = parseInt(d3.select('#map').style('width'))
        , width = width - margin.left - margin.right
        , mapRatio = .5
        , height = width * mapRatio;

//example map code

    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", clicked);

    var rateById = d3.map();

    var projection = d3.geoAlbersUsa()
        .scale([width + 150])
        .translate([width / 2, height / 2.5]);

    var path = d3.geoPath()
        .projection(projection);

    var dataMax = 0;
    var dataMin = null;

    function getMin(){
        return dataMin;
    }

    function getMax(){
        return dataMax;
    }

    function getObjectFromArray(d){
        var names = d[0];
        var objContainer = [];
        $.each(d, function(name, value){
            if(name == 0){
                return true;
            }
            var obj = {};

            $.each(value, function(e, v){
                obj[names[e]] = v;

                if (typeof obj["B01003_001E"] != 'undefined') {

                    if (obj["B01003_001E"] > parseInt(dataMax)) {
                        dataMax = parseInt(obj["B01003_001E"]);
                    }

                    if(dataMin === null){
                        dataMin = obj["B01003_001E"];
                    } else if (obj["B01003_001E"] < parseInt(dataMin)) {
                        dataMin = parseInt(obj["B01003_001E"]);
                    }
                }
            });

            objContainer.push(obj);

        });

        return objContainer;
    }

    d3.queue()
        .defer(d3.json, "data/us.json")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B01003_001E&for=county:*&key=" + apiKey)
        .await(ready);


    function ready(error, us, eData) {
        if (error) throw error;

        var dObj = getObjectFromArray(eData);

        for(var i=0; i<dObj.length; i++) {
            rateById.set("" + dObj[i].state.replace(/^0+/, '') + dObj[i].county, +dObj[i].B01003_001E);
        }

        var colors = d3.scaleQuantize()
            .domain([getMin(), getMax()])
            .range(colorbrewer.Oranges[9]);

        var legend = d3.select('#legend')
            .append('ul')
            .attr('class', 'list-inline');

        var keys = legend.selectAll('li.key')
            .data(colors.range());

        keys.enter().append('li')
            .attr('class', 'key')
            .style('border-top-color', String)
            .text(function(d) {
                var r = colors.invertExtent(d);
                return formats.percent(r[0]);
            });

        colors.domain(
            d3.extent(d3.values(eData), function(d) { return d.percent; })
        );

        var quantize = d3.scaleQuantize()
            .domain([getMin(), getMax()])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

        g = svg.append("g");

        g.attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("class", function(d) { if((d.id) == curCounty) { return quantize(rateById.get(d.id)) + " active"; } else { return quantize(rateById.get(d.id)); } })
            .attr("d", path)
            .on("click", clicked)
            .on('mousedown.log', function (d) {
                curCounty = d.id;
                getTransportationData(d.id);
                getEducationalAttainment(d.id);
                getRace(d.id);
                livingArrangment(d.id);
                birthByNationality(d.id);
                populationByPoverty(d.id);
                placeBirthPoverty(d.id);
            })
            .enter()
            .call(function(d){
                getTransportationData(curCounty);
                getEducationalAttainment(curCounty);
                getRace(curCounty);
                livingArrangment(curCounty);
                birthByNationality(curCounty);
                populationByPoverty(curCounty);
                placeBirthPoverty(curCounty);
            });

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);

    }

    function clicked(d) {

        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");

        if(centered === null) {
            setTimeout(function () {
                $('.states').removeClass('hide');
            }, 700);
        } else {
            $('.states').addClass('hide');
        }

    }

}


function createMedianAge(){
    var formats = {
        percent: d3.format('d')
    };

    $('#map, #legend').empty();

    var margin = {top: 10, left: 10, bottom: 10, right: 10}
        , width = parseInt(d3.select('#map').style('width'))
        , width = width - margin.left - margin.right
        , mapRatio = .5
        , height = width * mapRatio;

//example map code
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var rateById = d3.map();

    var projection = d3.geoAlbersUsa()
        .scale([width + 150])
        .translate([width / 2, height / 2.5]);

    var path = d3.geoPath()
        .projection(projection);

    var dataMax = 0;
    var dataMin = null;

    function getMin(){
        return dataMin;
    }

    function getMax(){
        return dataMax;
    }

    function getObjectFromArray(d){
        var names = d[0];
        var objContainer = [];
        $.each(d, function(name, value){
            if(name == 0){
                return true;
            }
            var obj = {};

            $.each(value, function(e, v){
                obj[names[e]] = v;

                if (typeof obj["B01002_001E"] != 'undefined') {

                    if (obj["B01002_001E"] > parseInt(dataMax)) {
                        dataMax = parseInt(obj["B01002_001E"]);
                    }

                    if(dataMin === null){
                        dataMin = obj["B01002_001E"];
                    } else if (obj["B01002_001E"] < parseInt(dataMin)) {
                        dataMin = parseInt(obj["B01002_001E"]);
                    }
                }
            });

            objContainer.push(obj);

        });

        return objContainer;
    }

    d3.queue()
        .defer(d3.json, "data/us.json")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B01002_001E&for=county:*&key=" + apiKey)
        .await(ready);


    function ready(error, us, eData) {
        if (error) throw error;

        var dObj = getObjectFromArray(eData);

        for(var i=0; i<dObj.length; i++) {
            rateById.set("" + dObj[i].state.replace(/^0+/, '') + dObj[i].county, +dObj[i].B01002_001E);
        }

        var colors = d3.scaleQuantize()
            .domain([getMin(), getMax()])
            .range(colorbrewer.Oranges[9]);

        var legend = d3.select('#legend')
            .append('ul')
            .attr('class', 'list-inline');

        var keys = legend.selectAll('li.key')
            .data(colors.range());

        keys.enter().append('li')
            .attr('class', 'key')
            .style('border-top-color', String)
            .text(function(d) {
                var r = colors.invertExtent(d);
                return formats.percent(r[0]);
            });

        colors.domain(
            d3.extent(d3.values(eData), function(d) { return d.percent; })
        );

        var quantize = d3.scaleQuantize()
            .domain([getMin(), getMax()])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

        g = svg.append("g");

        g.attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("class", function(d) { if((d.id) == curCounty) { return quantize(rateById.get(d.id)) + " active"; } else { return quantize(rateById.get(d.id)); } })
            .attr("d", path)
            .on("click", clicked)
            .on('mousedown.log', function (d) {
                curCounty = d.id;
                getTransportationData(d.id);
                getEducationalAttainment(d.id);
                getRace(d.id);
                livingArrangment(d.id);
                birthByNationality(d.id);
                populationByPoverty(d.id);
                placeBirthPoverty(d.id);
            })
            .enter()
            .call(function(d){
                getTransportationData(curCounty);
                getEducationalAttainment(curCounty);
                getRace(curCounty);
                livingArrangment(curCounty);
                birthByNationality(curCounty);
                populationByPoverty(curCounty);
                placeBirthPoverty(curCounty);
            });

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);

    }

    function clicked(d) {

        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");

        if(centered === null) {
            setTimeout(function () {
                $('.states').removeClass('hide');
            }, 700);
        } else {
            $('.states').addClass('hide');
        }

    }
}

function createMedianHouseholdIncome(){
    var formats = {
        percent: d3.format('d')
    };

    $('#map, #legend').empty();

    var margin = {top: 10, left: 10, bottom: 10, right: 10}
        , width = parseInt(d3.select('#map').style('width'))
        , width = width - margin.left - margin.right
        , mapRatio = .5
        , height = width * mapRatio;

//example map code
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var rateById = d3.map();

    var projection = d3.geoAlbersUsa()
        .scale([width + 150])
        .translate([width / 2, height / 2.5]);

    var path = d3.geoPath()
        .projection(projection);

    var dataMax = 0;
    var dataMin = null;

    function getMin(){
        return dataMin;
    }

    function getMax(){
        return dataMax;
    }

    function getObjectFromArray(d){
        var names = d[0];
        var objContainer = [];
        $.each(d, function(name, value){
            if(name == 0){
                return true;
            }
            var obj = {};

            $.each(value, function(e, v){
                obj[names[e]] = v;

                if (typeof obj["B19013_001E"] != 'undefined') {

                    if (obj["B19013_001E"] > parseInt(dataMax)) {
                        dataMax = parseInt(obj["B19013_001E"]);
                    }

                    if(dataMin === null){
                        dataMin = obj["B19013_001E"];
                    } else if (obj["B19013_001E"] < parseInt(dataMin)) {
                        dataMin = parseInt(obj["B19013_001E"]);
                    }
                }
            });

            objContainer.push(obj);

        });

        return objContainer;
    }

    d3.queue()
        .defer(d3.json, "data/us.json")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B19013_001E&for=county:*&key=" + apiKey)
        .await(ready);


    function ready(error, us, eData) {
        if (error) throw error;

        var dObj = getObjectFromArray(eData);

        for(var i=0; i<dObj.length; i++) {
            rateById.set("" + dObj[i].state.replace(/^0+/, '') + dObj[i].county, +dObj[i].B19013_001E);
        }

        var colors = d3.scaleQuantize()
            .domain([getMin(), getMax()])
            .range(colorbrewer.Oranges[9]);

        var legend = d3.select('#legend')
            .append('ul')
            .attr('class', 'list-inline');

        var keys = legend.selectAll('li.key')
            .data(colors.range());

        keys.enter().append('li')
            .attr('class', 'key')
            .style('border-top-color', String)
            .text(function(d) {
                var r = colors.invertExtent(d);
                return formats.percent(r[0]);
            });

        colors.domain(
            d3.extent(d3.values(eData), function(d) { return d.percent; })
        );

        var quantize = d3.scaleQuantize()
            .domain([getMin(), getMax()])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

        g = svg.append("g");

        g.attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("class", function(d) { if((d.id) == curCounty) { return quantize(rateById.get(d.id)) + " active"; } else { return quantize(rateById.get(d.id)); } })
            .attr("d", path)
            .on("click", clicked)
            .on('mousedown.log', function (d) {
                curCounty = d.id;
                getTransportationData(d.id);
                getEducationalAttainment(d.id);
                getRace(d.id);
                livingArrangment(d.id);
                birthByNationality(d.id);
                populationByPoverty(d.id);
                placeBirthPoverty(d.id);
            })
            .enter()
            .call(function(d){
                getTransportationData(curCounty);
                getEducationalAttainment(curCounty);
                getRace(curCounty);
                livingArrangment(curCounty);
                birthByNationality(curCounty);
                populationByPoverty(curCounty);
                placeBirthPoverty(curCounty);
            });

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);

    }

    function clicked(d) {

        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");

        if(centered === null) {
            setTimeout(function () {
                $('.states').removeClass('hide');
            }, 700);
        } else {
            $('.states').addClass('hide');
        }

    }
}

function createPerCapitaIncome(){
    var formats = {
        percent: d3.format('d')
    };

    $('#map, #legend').empty();

    var margin = {top: 10, left: 10, bottom: 10, right: 10}
        , width = parseInt(d3.select('#map').style('width'))
        , width = width - margin.left - margin.right
        , mapRatio = .5
        , height = width * mapRatio;

//example map code
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var rateById = d3.map();

    var projection = d3.geoAlbersUsa()
        .scale([width + 150])
        .translate([width / 2, height / 2.5]);

    var path = d3.geoPath()
        .projection(projection);

    var dataMax = 0;
    var dataMin = null;

    function getMin(){
        return dataMin;
    }

    function getMax(){
        return dataMax;
    }

    function getObjectFromArray(d){
        var names = d[0];
        var objContainer = [];
        $.each(d, function(name, value){
            if(name == 0){
                return true;
            }
            var obj = {};

            $.each(value, function(e, v){
                obj[names[e]] = v;

                if (typeof obj["B19301_001E"] != 'undefined') {

                    if (obj["B19301_001E"] > parseInt(dataMax)) {
                        dataMax = parseInt(obj["B19301_001E"]);
                    }

                    if(dataMin === null){
                        dataMin = obj["B19301_001E"];
                    } else if (obj["B19301_001E"] < parseInt(dataMin)) {
                        dataMin = parseInt(obj["B19301_001E"]);
                    }
                }
            });

            objContainer.push(obj);

        });

        return objContainer;
    }

    d3.queue()
        .defer(d3.json, "data/us.json")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B19301_001E&for=county:*&key=" + apiKey)
        .await(ready);


    function ready(error, us, eData) {
        if (error) throw error;

        var dObj = getObjectFromArray(eData);

        for(var i=0; i<dObj.length; i++) {
            rateById.set("" + dObj[i].state.replace(/^0+/, '') + dObj[i].county, +dObj[i].B19301_001E);
        }

        var colors = d3.scaleQuantize()
            .domain([getMin(), getMax()])
            .range(colorbrewer.Oranges[9]);

        var legend = d3.select('#legend')
            .append('ul')
            .attr('class', 'list-inline');

        var keys = legend.selectAll('li.key')
            .data(colors.range());

        keys.enter().append('li')
            .attr('class', 'key')
            .style('border-top-color', String)
            .text(function(d) {
                var r = colors.invertExtent(d);
                return formats.percent(r[0]);
            });

        colors.domain(
            d3.extent(d3.values(eData), function(d) { return d.percent; })
        );

        var quantize = d3.scaleQuantize()
            .domain([getMin(), getMax()])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

        g = svg.append("g");

        g.attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("class", function(d) { if((d.id) == curCounty) { return quantize(rateById.get(d.id)) + " active"; } else { return quantize(rateById.get(d.id)); } })
            .attr("d", path)
            .on("click", clicked)
            .on('mousedown.log', function (d) {
                curCounty = d.id;
                getTransportationData(d.id);
                getEducationalAttainment(d.id);
                getRace(d.id);
                livingArrangment(d.id);
                birthByNationality(d.id);
                populationByPoverty(d.id);
                placeBirthPoverty(d.id);
            })
            .enter()
            .call(function(d){
                getTransportationData(curCounty);
                getEducationalAttainment(curCounty);
                getRace(curCounty);
                livingArrangment(curCounty);
                birthByNationality(curCounty);
                populationByPoverty(curCounty);
                placeBirthPoverty(curCounty);
            });

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);

    }

    function clicked(d) {

        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");

        if(centered === null) {
            setTimeout(function () {
                $('.states').removeClass('hide');
            }, 700);
        } else {
            $('.states').addClass('hide');
        }

    }
}

function getTransportationData(fullCode){
    fullCode = "" + fullCode;
    var state = fullCode.slice(0, -3);
    var county = fullCode.substr(fullCode.length - 3);

    d3.queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B08301_002E,B08301_010E,B08301_016E,B08301_017E,B08301_018E,B08301_019E,B08301_020E,B08301_021E&in=state:" + state + "&for=county:" + county + "&key=" + apiKey)
        .await(makeTransportationChart);
}

function makeTransportationChart(error, data){
    var width = 450;
    var height = 200;
    var radius = Math.min(width, height) / 2.5;
    var donutWidth = 50;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var newData = createTransportationObject(data);
    var legendRectSize = 16;
    var legendSpacing = 4;

    $('#panelBody1').empty();
    $('#panelTitle1').html('Modes of Transportation - ' + data[1][0])


    var svg = d3.select("#panelBody1").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 4.5 + "," + height / 2 + ")");

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var tooltip = d3.select('#panelBody1')            // NEW
        .append('div')                             // NEW
        .attr('class', 'tooltip');                 // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'label');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'count');                  // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'percent');

    var path = svg.selectAll('path')
        .data(pie(newData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        })
        .each(function(d) { this._current = d; }); // NEW

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = 6 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .on('click', function(label) {                // NEW
            var rect = d3.select(this);
            var enabled = true;
            var totalEnabled = d3.sum(newData.map(function(d) {
                return (d.enabled) ? 1 : 0;
            }));

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) return;
                rect.attr('class', 'disabled');
                enabled = false;
            }

            pie.value(function(d) {
                if (d.label === label) d.enabled = enabled;
                return (d.enabled) ? d.count : 0;
            });

            path = path.data(pie(newData));

            path.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });
        });

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d.toUpperCase(); });

    path.on('mouseover', function(d) {
        var total = d3.sum(newData.map(function(d) {
            return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.label').html(d.data.label);
        tooltip.select('.count').html("Count: " + d.data.count);
        tooltip.select('.percent').html("Percent: " + percent + '%');
        tooltip.style('display', 'block');
    });

    path.on('mouseout', function() {
        tooltip.style('display', 'none');
    });

}

function createTransportationObject(data){
    var objContainer = [];

    var obj1 = { "label": "Car, Truck, or Van", "count": data[1][1], "enabled": true };
    var obj2 = { "label": "Public Transportation", "count": data[1][2], "enabled": true };
    var obj3 = { "label": "Taxicab", "count": data[1][3], "enabled": true };
    var obj4 = { "label": "Motorcycle", "count": data[1][4], "enabled": true };
    var obj5 = { "label": "Bicycle", "count": data[1][5], "enabled": true };
    var obj6 = { "label": "Walked", "count": data[1][6], "enabled": true };
    var obj7 = { "label": "Other Means", "count": data[1][7], "enabled": true };
    var obj8 = { "label": "Worked at Home", "count": data[1][8], "enabled": true };

    objContainer.push(obj1);
    objContainer.push(obj2);
    objContainer.push(obj3);
    objContainer.push(obj4);
    objContainer.push(obj5);
    objContainer.push(obj6);
    objContainer.push(obj7);
    objContainer.push(obj8);


    return objContainer;
}

function getEducationalAttainment(fullCode){
    fullCode = "" + fullCode;
    var state = fullCode.slice(0, -3);
    var county = fullCode.substr(fullCode.length - 3);

    d3.queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B06009_002E,B06009_003E,B06009_004E,B06009_005E,B06009_006E&in=state:" + state + "&for=county:" + county + "&key=" + apiKey )
        .await(makeEducationalAttainmentChart);
}

function makeEducationalAttainmentChart(error, data){

    var width = 450;
    var height = 200;
    var radius = Math.min(width, height) / 2.5;
    var donutWidth = 50;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var newData = createmakeEducationalAttainmentChartObject(data);
    var legendRectSize = 16;
    var legendSpacing = 4;

    $('#panelBody2').empty();
    $('#panelTitle2').html('Educational Attainment - ' + data[1][0])

    var svg = d3.select("#panelBody2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 4.5 + "," + height / 2 + ")");

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var tooltip = d3.select('#panelBody2')            // NEW
        .append('div')                             // NEW
        .attr('class', 'tooltip');                 // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'label');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'count');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'percent');

    var path = svg.selectAll('path')
        .data(pie(newData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        })
        .each(function(d) { this._current = d; }); // NEW

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = 6 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .on('click', function(label) {                // NEW
            var rect = d3.select(this);
            var enabled = true;
            var totalEnabled = d3.sum(newData.map(function(d) {
                return (d.enabled) ? 1 : 0;
            }));

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) return;
                rect.attr('class', 'disabled');
                enabled = false;
            }

            pie.value(function(d) {
                if (d.label === label) d.enabled = enabled;
                return (d.enabled) ? d.count : 0;
            });

            path = path.data(pie(newData));

            path.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });
        });

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d.toUpperCase(); });

    path.on('mouseover', function(d) {
        var total = d3.sum(newData.map(function(d) {
            return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.label').html(d.data.label);
        tooltip.select('.count').html("Count: " + d.data.count);
        tooltip.select('.percent').html("Percent: " + percent + '%');
        tooltip.style('display', 'block');
    });

    path.on('mouseout', function() {
        tooltip.style('display', 'none');
    });

}

function createmakeEducationalAttainmentChartObject(data){
    var objContainer = [];

    var obj1 = { "label": "Less Than High School Graduate", "count": data[1][1], "enabled": true };
    var obj2 = { "label": "High School Graduate", "count": data[1][2], "enabled": true };
    var obj3 = { "label": "Some College or Associate's Degree", "count": data[1][3], "enabled": true };
    var obj4 = { "label": "Bachelor's Degree", "count": data[1][4], "enabled": true };
    var obj5 = { "label": "Graduate or Professional Degree", "count": data[1][5], "enabled": true };

    objContainer.push(obj1);
    objContainer.push(obj2);
    objContainer.push(obj3);
    objContainer.push(obj4);
    objContainer.push(obj5);


    return objContainer;
}

function getRace(fullCode){
    fullCode = "" + fullCode;
    var state = fullCode.slice(0, -3);
    var county = fullCode.substr(fullCode.length - 3);

    d3.queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B02001_002E,B02001_003E,B02001_004E,B02001_005E,B02001_006E,B02001_007E,B02001_008E&in=state:" + state + "&for=county:" + county + "&key=" + apiKey )
        .await(getRaceChart);
}

function getRaceChart(error, data){

    var width = 450;
    var height = 200;
    var radius = Math.min(width, height) / 2.5;
    var donutWidth = 50;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var newData = getRaceObject(data);
    var legendRectSize = 16;
    var legendSpacing = 4;

    $('#panelBody3').empty();
    $('#panelTitle3').html('Race - ' + data[1][0])

    var svg = d3.select("#panelBody3").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 4.5 + "," + height / 2 + ")");

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var tooltip = d3.select('#panelBody3')            // NEW
        .append('div')                             // NEW
        .attr('class', 'tooltip');                 // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'label');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'count');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'percent');

    var path = svg.selectAll('path')
        .data(pie(newData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        })
        .each(function(d) { this._current = d; }); // NEW

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = 6 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .on('click', function(label) {                // NEW
            var rect = d3.select(this);
            var enabled = true;
            var totalEnabled = d3.sum(newData.map(function(d) {
                return (d.enabled) ? 1 : 0;
            }));

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) return;
                rect.attr('class', 'disabled');
                enabled = false;
            }

            pie.value(function(d) {
                if (d.label === label) d.enabled = enabled;
                return (d.enabled) ? d.count : 0;
            });

            path = path.data(pie(newData));

            path.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });
        });

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d.toUpperCase(); });

    path.on('mouseover', function(d) {
        var total = d3.sum(newData.map(function(d) {
            return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.label').html(d.data.label);
        tooltip.select('.count').html("Count: " + d.data.count);
        tooltip.select('.percent').html("Percent: " + percent + '%');
        tooltip.style('display', 'block');
    });

    path.on('mouseout', function() {
        tooltip.style('display', 'none');
    });

}

function getRaceObject(data){
    var objContainer = [];

    var obj1 = { "label": "White", "count": data[1][1], "enabled": true };
    var obj2 = { "label": "Black or African American", "count": data[1][2], "enabled": true };
    var obj3 = { "label": "American Indian and Alaska Native", "count": data[1][3], "enabled": true };
    var obj4 = { "label": "Asian Alone", "count": data[1][4], "enabled": true };
    var obj5 = { "label": "Native Hawaiian / Pacific Islander", "count": data[1][5], "enabled": true };
    var obj6 = { "label": "Some Other Race", "count": data[1][6], "enabled": true };
    var obj7 = { "label": "Two or More Races", "count": data[1][7], "enabled": true };

    objContainer.push(obj1);
    objContainer.push(obj2);
    objContainer.push(obj3);
    objContainer.push(obj4);
    objContainer.push(obj5);
    objContainer.push(obj6);
    objContainer.push(obj7);


    return objContainer;
}


function livingArrangment(fullCode){
    fullCode = "" + fullCode;
    var state = fullCode.slice(0, -3);
    var county = fullCode.substr(fullCode.length - 3);

    d3.queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B09021_002E,B09021_003E,B09021_004E,B09021_005E,B09021_006E,B09021_007E&in=state:" + state + "&for=county:" + county + "&key=" + apiKey )
        .await(livingArrangmentChart);
}

function livingArrangmentChart(error, data){

    var width = 450;
    var height = 200;
    var radius = Math.min(width, height) / 2.5;
    var donutWidth = 50;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var newData = livingArrangmentObject(data);
    var legendRectSize = 16;
    var legendSpacing = 4;

    $('#panelBody4').empty();
    $('#panelTitle4').html('Living Arrangment - ' + data[1][0])

    var svg = d3.select("#panelBody4").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 4.5 + "," + height / 2 + ")");

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var tooltip = d3.select('#panelBody4')            // NEW
        .append('div')                             // NEW
        .attr('class', 'tooltip');                 // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'label');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'count');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'percent');

    var path = svg.selectAll('path')
        .data(pie(newData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        })
        .each(function(d) { this._current = d; }); // NEW

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = 6 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .on('click', function(label) {                // NEW
            var rect = d3.select(this);
            var enabled = true;
            var totalEnabled = d3.sum(newData.map(function(d) {
                return (d.enabled) ? 1 : 0;
            }));

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) return;
                rect.attr('class', 'disabled');
                enabled = false;
            }

            pie.value(function(d) {
                if (d.label === label) d.enabled = enabled;
                return (d.enabled) ? d.count : 0;
            });

            path = path.data(pie(newData));

            path.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });
        });

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d.toUpperCase(); });

    path.on('mouseover', function(d) {
        var total = d3.sum(newData.map(function(d) {
            return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.label').html(d.data.label);
        tooltip.select('.count').html("Count: " + d.data.count);
        tooltip.select('.percent').html("Percent: " + percent + '%');
        tooltip.style('display', 'block');
    });

    path.on('mouseout', function() {
        tooltip.style('display', 'none');
    });

}

function livingArrangmentObject(data){
    var objContainer = [];

    var obj1 = { "label": "Lives Alone", "count": data[1][1], "enabled": true };
    var obj2 = { "label": "Married Householder", "count": data[1][2], "enabled": true };
    var obj3 = { "label": "Unmarried Householder / Partner", "count": data[1][3], "enabled": true };
    var obj4 = { "label": "Child of Householder", "count": data[1][4], "enabled": true };
    var obj5 = { "label": "Other Relatives", "count": data[1][5], "enabled": true };
    var obj6 = { "label": "Other Nonrelatives", "count": data[1][6], "enabled": true };

    objContainer.push(obj1);
    objContainer.push(obj2);
    objContainer.push(obj3);
    objContainer.push(obj4);
    objContainer.push(obj5);
    objContainer.push(obj6);


    return objContainer;
}

function birthByNationality(fullCode){
    fullCode = "" + fullCode;
    var state = fullCode.slice(0, -3);
    var county = fullCode.substr(fullCode.length - 3);

    d3.queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B09021_002E,B09021_003E,B09021_004E,B09021_005E,B09021_006E,B09021_007E&in=state:" + state + "&for=county:" + county + "&key=" + apiKey )
        .await(birthByNationalityChart);
}

function birthByNationalityChart(error, data){

    var width = 450;
    var height = 200;
    var radius = Math.min(width, height) / 2.5;
    var donutWidth = 50;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var newData = birthByNationalityObject(data);
    var legendRectSize = 16;
    var legendSpacing = 4;

    $('#panelBody5').empty();
    $('#panelTitle5').html('Place of Birth By Nativity - ' + data[1][0])

    var svg = d3.select("#panelBody5").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 4.5 + "," + height / 2 + ")");

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var tooltip = d3.select('#panelBody5')            // NEW
        .append('div')                             // NEW
        .attr('class', 'tooltip');                 // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'label');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'count');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'percent');

    var path = svg.selectAll('path')
        .data(pie(newData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        })
        .each(function(d) { this._current = d; }); // NEW

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = 6 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .on('click', function(label) {                // NEW
            var rect = d3.select(this);
            var enabled = true;
            var totalEnabled = d3.sum(newData.map(function(d) {
                return (d.enabled) ? 1 : 0;
            }));

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) return;
                rect.attr('class', 'disabled');
                enabled = false;
            }

            pie.value(function(d) {
                if (d.label === label) d.enabled = enabled;
                return (d.enabled) ? d.count : 0;
            });

            path = path.data(pie(newData));

            path.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });
        });

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d.toUpperCase(); });

    path.on('mouseover', function(d) {
        var total = d3.sum(newData.map(function(d) {
            return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.label').html(d.data.label);
        tooltip.select('.count').html("Count: " + d.data.count);
        tooltip.select('.percent').html("Percent: " + percent + '%');
        tooltip.style('display', 'block');
    });

    path.on('mouseout', function() {
        tooltip.style('display', 'none');
    });

}

function birthByNationalityObject(data){
    var objContainer = [];

    var obj1 = { "label": "Born in State of Residence", "count": data[1][1], "enabled": true };
    var obj2 = { "label": "Born in Other State in the U.S.", "count": data[1][2], "enabled": true };
    var obj3 = { "label": "Born Outside the United States", "count": data[1][3], "enabled": true };

    objContainer.push(obj1);
    objContainer.push(obj2);
    objContainer.push(obj3);


    return objContainer;
}

function populationByPoverty(fullCode){
    fullCode = "" + fullCode;
    var state = fullCode.slice(0, -3);
    var county = fullCode.substr(fullCode.length - 3);

    d3.queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B17002_002E,B17002_003E,B17002_004E,B17002_005E,B17002_006E,B17002_007E,B17002_008E,B17002_009E,B17002_010E,B17002_011E,B17002_012E,B17002_013E&in=state:" + state + "&for=county:" + county + "&key=" + apiKey )
        .await(populationByPovertyChart);
}

function populationByPovertyChart(error, data){

    var width = 450;
    var height = 200;
    var radius = Math.min(width, height) / 2.5;
    var donutWidth = 50;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var newData = populationByPovertyObject(data);
    var legendRectSize = 16;
    var legendSpacing = 4;

    $('#panelBody6').empty();
    $('#panelTitle6').html('Ratio of Income to Poverty Level - ' + data[1][0])

    var svg = d3.select("#panelBody6").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 4.5 + "," + height / 2 + ")");

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var tooltip = d3.select('#panelBody6')            // NEW
        .append('div')                             // NEW
        .attr('class', 'tooltip');                 // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'label');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'count');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'percent');

    var path = svg.selectAll('path')
        .data(pie(newData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        })
        .each(function(d) { this._current = d; }); // NEW

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = 6 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .on('click', function(label) {                // NEW
            var rect = d3.select(this);
            var enabled = true;
            var totalEnabled = d3.sum(newData.map(function(d) {
                return (d.enabled) ? 1 : 0;
            }));

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) return;
                rect.attr('class', 'disabled');
                enabled = false;
            }

            pie.value(function(d) {
                if (d.label === label) d.enabled = enabled;
                return (d.enabled) ? d.count : 0;
            });

            path = path.data(pie(newData));

            path.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });
        });

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d.toUpperCase(); });

    path.on('mouseover', function(d) {
        var total = d3.sum(newData.map(function(d) {
            return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.label').html(d.data.label);
        tooltip.select('.count').html("Count: " + d.data.count);
        tooltip.select('.percent').html("Percent: " + percent + '%');
        tooltip.style('display', 'block');
    });

    path.on('mouseout', function() {
        tooltip.style('display', 'none');
    });

}

function populationByPovertyObject(data){
    var objContainer = [];

    var obj1 = { "label": "Under .50", "count": data[1][1], "enabled": true };
    var obj2 = { "label": ".50 to .74", "count": data[1][2], "enabled": true };
    var obj3 = { "label": ".75 to .99", "count": data[1][3], "enabled": true };
    var obj4 = { "label": "1.00 to 1.24", "count": data[1][4], "enabled": true };
    var obj5 = { "label": "1.25 to 1.49", "count": data[1][5], "enabled": true };
    var obj6 = { "label": "1.50 to 1.74", "count": data[1][6], "enabled": true };
    var obj7 = { "label": "1.75 to 1.84", "count": data[1][7], "enabled": true };
    var obj8 = { "label": "1.85 to 1.99", "count": data[1][8], "enabled": true };
    var obj9 = { "label": "2.00 to 2.99", "count": data[1][9], "enabled": true };
    var obj10 = { "label": "3.00 to 3.99", "count": data[1][10], "enabled": true };
    var obj11 = { "label": "4.00 to 4.99", "count": data[1][11], "enabled": true };
    var obj12 = { "label": "5.00 and over", "count": data[1][12], "enabled": true };


    objContainer.push(obj1);
    objContainer.push(obj2);
    objContainer.push(obj3);
    objContainer.push(obj4);
    objContainer.push(obj5);
    objContainer.push(obj6);
    objContainer.push(obj7);
    objContainer.push(obj8);
    objContainer.push(obj9);
    objContainer.push(obj10);
    objContainer.push(obj11);
    objContainer.push(obj12);


    return objContainer;
}

function placeBirthPoverty(fullCode){
    fullCode = "" + fullCode;
    var state = fullCode.slice(0, -3);
    var county = fullCode.substr(fullCode.length - 3);

    d3.queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B06012_002E,B06012_003E,B06012_004E&in=state:" + state + "&for=county:" + county + "&key=" + apiKey )
        .await(placeBirthPovertyChart);
}

function placeBirthPovertyChart(error, data){

    var width = 450;
    var height = 200;
    var radius = Math.min(width, height) / 2.5;
    var donutWidth = 50;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var newData = placeBirthPovertyObject(data);
    var legendRectSize = 16;
    var legendSpacing = 4;

    $('#panelBody7').empty();
    $('#panelTitle7').html('Place of Birth by Poverty Status - ' + data[1][0])

    var svg = d3.select("#panelBody7").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 4.5 + "," + height / 2 + ")");

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var tooltip = d3.select('#panelBody7')            // NEW
        .append('div')                             // NEW
        .attr('class', 'tooltip');                 // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'label');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'count');                   // NEW

    tooltip.append('div')                        // NEW
        .attr('class', 'percent');

    var path = svg.selectAll('path')
        .data(pie(newData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        })
        .each(function(d) { this._current = d; }); // NEW

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = 6 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .on('click', function(label) {                // NEW
            var rect = d3.select(this);
            var enabled = true;
            var totalEnabled = d3.sum(newData.map(function(d) {
                return (d.enabled) ? 1 : 0;
            }));

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) return;
                rect.attr('class', 'disabled');
                enabled = false;
            }

            pie.value(function(d) {
                if (d.label === label) d.enabled = enabled;
                return (d.enabled) ? d.count : 0;
            });

            path = path.data(pie(newData));

            path.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });
        });

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d.toUpperCase(); });

    path.on('mouseover', function(d) {
        var total = d3.sum(newData.map(function(d) {
            return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.label').html(d.data.label);
        tooltip.select('.count').html("Count: " + d.data.count);
        tooltip.select('.percent').html("Percent: " + percent + '%');
        tooltip.style('display', 'block');
    });

    path.on('mouseout', function() {
        tooltip.style('display', 'none');
    });

}

function placeBirthPovertyObject(data){
    var objContainer = [];

    var obj1 = { "label": "Below the Poverty Level", "count": data[1][1], "enabled": true };
    var obj2 = { "label": "1 to 1.49x the Poverty Level", "count": data[1][2], "enabled": true };
    var obj3 = { "label": "At or Above 1.5x the Poverty Level", "count": data[1][3], "enabled": true };


    objContainer.push(obj1);
    objContainer.push(obj2);
    objContainer.push(obj3);


    return objContainer;
}

//fixing affix behavior

$(document).ready(function () {
    $(window).resize(function () {
        $('#leftNav').width($('#leftNavParent').width());
    });
});

$(document).ready(function () {
    $('#leftNav').width($('#leftNavParent').width());
});

// tooltip appear on mouse cursor

var tooltips = document.querySelectorAll('.tooltip');

window.onmousemove = function (e) {
    var x = (e.clientX - 250) + 'px',
        y = (e.clientY + 50) + 'px';
    for (var i = 0; i < tooltips.length; i++) {
        tooltips[i].style.top = y;
        tooltips[i].style.left = x;
    }
};

//map zoom - add active class

 


