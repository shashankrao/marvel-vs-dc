(function() {
  var height = 400,
      width = 700;

  var svg = d3.select("#map-1")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform", "translate(0,0)");

  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
          return "<strong style='color: Red;font-size:15pt'>" + d.HeroName + //" " + d.magType + "</strong>" +
              // "<br>" +
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Full Name:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " +d.FullName +
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Origin:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " +d.Placeofbirth +
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Type:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Race + "</span>"
      })

  svg.call(tip);

  d3.queue()
    .defer(d3.json, "world.topojson")
    .defer(d3.csv, "data/marvel-superheroes_geocodio.csv")
    .await(ready)

  // var colorScale = d3.scalePoint().range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f'])

  var projection = d3.geoMercator()
    .translate([width/2,height/2]) // putting the graph on the center of the graphic.
    .scale(110)

  var path = d3.geoPath()
    .projection(projection)

  var radiusScale = d3.scaleSqrt().domain([0,100]).range([0.2, 10])

  function ready(error, data, marvel) {
    // console.log(data)
    var countries = topojson.feature(data, data.objects.countries).features;
    console.log(countries)

    svg.selectAll(".country")
      .data(countries)
      .enter().append("path")
      .attr("d",path)
      .attr("class","country")
      .attr("fill","#e3e3e3")
      .attr("stroke",'#333333')
      .attr("stroke-width",0.5)
      .on('mouseover',function() {
        d3.select(this)
          .attr("fill","#f5f5dc")
      })
      .on('mouseout',function() {
        d3.select(this)
          .attr("fill","#e3e3e3")
      })


    // console.log(marvel)
    svg.selectAll(".city-circle")
      .data(marvel)
      .enter().append("circle")
      .attr("class","city-circle")
      .attr("r",function(d) {
        return radiusScale(d.Power)
      })
      .attr("fill","#ADFF2F")
      .attr("stroke","#2F4F4F")
      .attr("stroke-width", 0.8)
      .attr("opacity",0.5)
      .attr("cx",function(d) {
        var coords = projection([d.Longitude,d.Latitude])
        return coords[0];
      })
      .attr("cy",function(d) {
        var coords = projection([d.Longitude,d.Latitude])
        return coords[1];
      })
      .on('mouseover', function(d, i) {
          tip.show(d)
          var element = d3.select(this);
          element.style("stroke-width", "3")
          element.style("stroke", "maroon") // #006aab dark blue
          element.style("fill","red")
          element.style("opacity", 1)
      })
      .on('mouseout', function(d, i) {
          tip.hide(d)
          var element = d3.select(this);
          element.style("fill","#ADFF2F")
          element.style("opacity", 0.5)
          element.style("stroke-width", 0.8)
          element.style("stroke", "#2F4F4F")
      })
    }
})();
