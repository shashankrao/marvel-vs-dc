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
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.FullName +
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Origin:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Placeofbirth +
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Type:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Category + "</span>"
      })

  svg.call(tip);

  var dispatch = d3.dispatch("load", "statechange");

  var groups = ["Unknown",
                "Alien",
                "Human",
                "Inhuman",
                "Robot",
                "God",
                "Mutant"];

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


  function ready(error, data, marvel, dc) { // how to reset.

    if (!marvel || !dc) throw error;
    var raceByLocation = d3.map();
    marvel.forEach(function(d) {
      // console.log('Marvel: '+d.Category)
      raceByLocation.set(d.Category, d);
    })
    // var raceByLocation2 = d3.map();
    // dc.forEach(function(d) {
    //   console.log('DC: '+d.Category)
    //   raceByLocation2.set(d.Category, d);
    // });

    // Dropdown menu for Marvel
    dispatch.on("load.menu", function(raceByLocation) {
      console.log('building select menu');
      // console.log(raceByLocation);
      // console.log(raceByLocation2);
      var select = d3.select("#select-menu")
        .append("div")
        .append("select")
        .on("change", function() { dispatch.call("statechange", this, raceByLocation.get(this.value)); });

      select.selectAll("option")
          .data(raceByLocation.values())
          .enter().append("option")
          .attr("value", function(d) { return d.Category; })
          .text(function(d) { return d.Category; });

      dispatch.on("statechange.menu", function(state) {
        // console.log(state)
        // console.log(state.Category)
        d3.selectAll(".city-circle")
          .attr("opacity",function(d){
            if (d.Category!==state.Category) {
              return 0
            } else {return .5}
          })

        select.property("value", function() {
          // console.log(state)
          // console.log(state.Race);
          return state.Category
        });
      });
    });
    dispatch.call("load", this, raceByLocation);
    // dispatch.call("load", this, raceByLocation2);


    // // Dropdown menu for DC
    // dispatch.on("load.menu", function(raceByLocation2) {
    //   console.log('building select menu');
    //   var select = d3.select("#select-menu")
    //     .append("div")
    //     .append("select")
    //     .on("change", function() { dispatch.call("statechange", this, raceByLocation2.get(this.value)); });
    //
    //   select.selectAll("option")
    //       .data(raceByLocation2.values())
    //       .enter().append("option")
    //       .attr("value", function(d) { return d.Category; })
    //       .text(function(d) { return d.Category; });
    //
    //   dispatch.on("statechange.menu", function(state) {
    //     console.log(state)
    //     console.log(state.Category)
    //     d3.selectAll(".city-circle")
    //       .attr("opacity",function(d){
    //         if (d.Category!==state.Category) {
    //           return 0
    //         } else {return .5}
    //       })
    //
    //     select.property("value", function() {
    //       // console.log(state)
    //       // console.log(state.Race);
    //       return state.Category
    //     }
    //     );
    //   });
    // });
    // dispatch.call("load", this, raceByLocation2);


    // Taking care of the State/County-level map borderlines.
    var county = topojson.feature(data, data.objects.counties).features; //'states' based on what you see (of the object) in the console.log

    svg.selectAll(".county")
      .data(county)
      .enter().append("path")
      .attr("d",path) // a path always needs 'd' as an attribute
      .attr("class","county")
      .attr("fill","#333333")
      .attr("stroke",'#696969')
      .attr("stroke-width",0.2)

    var states = topojson.feature(data, data.objects.states).features; //'states' based on what you see (of the object) in the console.log

    svg.selectAll(".states")
      .data(states)
      .enter().append("path")
      .attr("d",path) // a path always needs 'd' as an attribute
      .attr("class","states")
      .attr("fill","transparent")
      .attr("stroke",'#696969')
      .attr("stroke-width",1)
      .on('mouseover',function() {
        d3.select(this)
          .attr("fill","gray")
          .attr("opacity",0.45)
      })
      .on('mouseout',function() {
        d3.select(this)
          .attr("fill","transparent")
      })
      .on("click", clicked);

    // console.log(marvel)
    var sorted_marvel = marvel.sort(function(a, b) {
      return b.Power - a.Power;
    });

    svg.selectAll(".city-circle")
      .data(sorted_marvel)
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


    // console.log(dc)
    var sorted_dc = dc.sort(function(a, b) {
      return b.Power - a.Power;
    });

    svg.selectAll(".city-circle2")
      .data(sorted_dc)
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

    // Doing the gender select
    d3.select(".FM")
      .on('click', function() {
      console.log('FM gender button')
      svg.selectAll(".city-circle")
          .data(sorted_marvel)
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
              // .transition()
              // .duration(1200)
              var element = d3.select(this);
              element.style("stroke-width", "3")
              element.style("stroke", "maroon") // #006aab dark blue
              element.style("fill","red")
              element.style("opacity", 1)
          })
          .on('mouseout', function(d, i) {
              tip.hide(d)
              // .transition()
              // .duration(1200)
              var element = d3.select(this);
              element.style("fill","lightpink")
              element.style("opacity", 0.5)
              element.style("stroke-width", 0.8)
              element.style("stroke", "#2F4F4F")
          })
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
