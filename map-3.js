(function() {
  var height = 400,
      width = 700,
      centered;

  var svg = d3.select("#map-3")
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


  var dispatch = d3.dispatch("load", "statechange");

  var groups = [
    "Under 5 Years",
    "5 to 13 Years",
    "14 to 17 Years",
    "18 to 24 Years",
    "25 to 44 Years",
    "45 to 64 Years",
    "65 Years and Over"
  ];

// reading data for drop down
  d3.csv("data/marvel-superheroes_geocodio.csv", type, function(error, states) {
    if (error) throw error;
    var raceByLocation = d3.map();
    states.forEach(function(d) { raceByLocation.set(d.Race, d); });
    dispatch.call("load", this, raceByLocation);
    // dispatch.call("statechange", this, raceByLocation.get("human"));
  });

// building drop down menu
  dispatch.on("load.menu", function(raceByLocation) {
    var select = d3.select("#select-menu")
      .append("div")
      .append("select")
        .on("change", function() { dispatch.call("statechange", this, raceByLocation.get(this.value)); });

    select.selectAll("option")
        .data(raceByLocation.values())
        .enter().append("option")
        .attr("value", function(d) { return d.Race; })
        .text(function(d) { return d.Race; });

    dispatch.on("statechange.menu", function(state) {
      console.log(state)
      // d3.selectAll("circle")
      //   .attr("fill","red")

      select.property("value", function() {
        // console.log(state)
        // console.log(state.Race);
        return state.Race
      }
      );
    });
  });

  function type(d) {
    d.total = d3.sum(groups, function(k) { return d[k] = +d[k]; });
    return d;
  }

  d3.queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "data/marvel-superheroes_geocodio.csv")
    .defer(d3.csv, "data/dc-superheroes_geocodio.csv")
    // #33CCFF
    .await(ready)

  var projection = d3.geoAlbersUsa()
    .translate([width/2,height/2])
    .scale(850)

  var path = d3.geoPath()
    .projection(projection)

  var radiusScale = d3.scaleSqrt().domain([0,100]).range([0.2, 10])

  function clicked(d) {
    console.log(path.centroid(d))
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
    svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

    svg.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
  }


  function ready(error, data, marvel, dc) {
    // console.log(data)

    var countries = topojson.feature(data, data.objects.states).features; //'states' based on what you see (of the object) in the console.log

    svg.selectAll(".country")
      .data(countries)
      .enter().append("path")
      .attr("d",path)
      .attr("class","country")
      .attr("fill","#333333")
      .attr("stroke",'#e3e3e3')
      .attr("stroke-width",0.5)
      .on('mouseover',function() {
        d3.select(this)
          .attr("fill","gray")
      })
      .on('mouseout',function() {
        d3.select(this)
          .attr("fill","#333333")
      })
      .on("click", clicked);

    // console.log(marvel)
    svg.selectAll(".city-circle")
      .data(marvel)
      .enter().append("circle")
      .attr("class","city-circle")
      .attr("r",function(d) {
        return radiusScale(d.Power)
      })
      .attr("fill","lightpink")
      .attr("stroke","#2F4F4F")
      .attr("stroke-width", 0.8)
      .attr("opacity",0.5)
      .attr("cx",function(d) {
        var coords = projection([d.Longitude,d.Latitude])
        // console.log(coords)
        if (coords!==null) {
          return coords[0];}
        else {return -1}
      })
      .attr("cy",function(d) {
        var coords = projection([d.Longitude,d.Latitude])
        if (coords!==null) {
          return coords[1];}
        else {return -1}
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
          element.style("fill","lightpink")
          element.style("opacity", 0.5)
          element.style("stroke-width", 0.8)
          element.style("stroke", "#2F4F4F")
      })


    // console.log(marvel)
    svg.selectAll(".city-circle2")
      .data(dc)
      .enter().append("circle")
      .attr("class","city-circle2")
      .attr("r",function(d) {
        return radiusScale(d.Power)
      })
      .attr("fill","#57FEFF")
      .attr("stroke","#2F4F4F")
      .attr("stroke-width", 0.8)
      .attr("opacity",0.5)
      .attr("cx",function(d) {
        var coords = projection([d.Longitude,d.Latitude])
        // console.log(coords)
        if (coords!==null) {
          return coords[0];}
        else {return -1}
      })
      .attr("cy",function(d) {
        var coords = projection([d.Longitude,d.Latitude])
        if (coords!==null) {
          return coords[1];}
        else {return -1}
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
          element.style("fill","#57FEFF")
          element.style("opacity", 0.5)
          element.style("stroke-width", 0.8)
          element.style("stroke", "#2F4F4F")
      })

    // var hexbin = d3_hexbin.hexbin()
    //   .x(function(d) {
    //     var coords = projection([d.Longitude,d.Latitude])
    //     return coords[0]
    //   })
    //   .y(function(d) {
    //     var coords = projection([d.Longitude,d.Latitude])
    //     return coords[1]
    //   })
    //   .radius(6)
    //
    // var opacityScale = d3.scaleLinear().domain([0,10]).range([0,1])
    //
    // var colorScale = d3.scaleLinear().domain([0,1]).range(['pink','maroon'])
    // var colorScale2 = d3.scaleLinear().domain([0,1]).range(['lightblue','darkblue'])
    //
    // svg.selectAll(".hex-bin")
    //   .data(hexbin(marvel))
    //   .enter().append("path")
    //   .attr("class","hex-bin")
    //   .attr("d",function(d) {
    //     return "M" +d.x+","+d.y+hexbin.hexagon();
    //   })
    //   .attr("opacity",function(d){
    //     return opacityScale(d.length)
    //   })
    //   .attr("fill",function(d){
    //     return colorScale(d.length)
    //   })
    //   .attr("stroke","#e3e3e3")
    //   .attr("stroke-width",0.5)
    //
    // svg.selectAll(".hex-bin2")
    //   .data(hexbin(dc))
    //   .enter().append("path")
    //   .attr("class","hex-bin2")
    //   .attr("d",function(d) {
    //     return "M" +d.x+","+d.y+hexbin.hexagon();
    //   })
    //   .attr("opacity",function(d){
    //     return opacityScale(d.length)
    //   })
    //   .attr("fill",function(d){
    //     return colorScale2(d.length)
    //   })
    //   .attr("stroke","#e3e3e3")
    //   .attr("stroke-width",0.5)
  }


})();

// source: https://bl.ocks.org/mbostock/2206590
