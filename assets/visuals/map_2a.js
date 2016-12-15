(function() {
  var height = 400,
      width = 700,
      centered;

  var svg = d3.select("#map_2a")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform", "translate(0,0)");

  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .direction('se')
      .html(function(d) {
          return "<strong style='color: Red;font-size:15pt'>" + d.HeroName + "</strong>" +
              "<br>" +
              // '<img src="https://i.annihil.us/u/prod/marvel/i/mg/2/00/53710b14a320b.png" alt="Mountain View" style="width:150px;height:150px;">'+
              '<img src="http://www.superherodb.com/pictures/portraits/' + d.HeroName.toLowerCase() + '.jpg" alt="'+ d.HeroName + '" style="width:120px;height:140px;">'+
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Full Name:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.FullName +
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Origin:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Placeofbirth +
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Type:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Category + "</span>"+
              "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Power:  </span>" +
              "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Power + "</span>"
              // "http://i.annihil.us/u/prod/marvel/i/mg/2/00/53710b14a320b.png"
      })

  svg.call(tip);

  var dispatch = d3.dispatch("load", "statechange");

  function type(d) {
    d.total = d3.sum(groups, function(k) { return d[k] = +d[k]; });
    return d;
  }

  d3.queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "assets/data/marvel-superheroes_geocodio.csv")
    // #33CCFF
    .await(ready)

  var projection = d3.geoAlbersUsa()
    .translate([width/2,height/2])
    .scale(850)

  var path = d3.geoPath()
    .projection(projection)

  var radiusScale = d3.scaleSqrt().domain([7,100]).range([2, 17])

  var dropDown = d3.select(".dropmenu").attr("name", "race-list");
                  //  .append("select")

  function clicked(d) {
    // console.log(path.centroid(d))
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

  function menuChanged() {
      var category = d3.event.target.value;
      console.log(category)
      // var category = this.value;
      console.log('New dropdown: FILTERING FOR', category)

      svg.selectAll(".city-circle")
        .classed('filtered-in', function(d) {
          if (d.Category===category || category === "All") {
            return true
          } else {
            return false
          }
        })
        .attr("opacity",function(d){
          if (d.Category===category || category === "All") {
            return .5
          } else {
            return 0
          }
        })
        .attr("r",function(d){
          if(d.Country.localeCompare("CA") == 0) {
            return 0;
          }
          if (d.Category===category || category === "All") {
            return radiusScale(d.Power)
          } else {
            return 0
          }
        })
  }

  function ready(error, data, marvel) { // how to reset.

    var options = dropDown.selectAll("option").data(data).enter().append("option");
    console.log(options)
    // var select = d3.select("#select-menu2a")
    //   .append("div")
    //   .append("select")



    options.text(function (d) {return d.value;
      console.log(d)
    })
           .attr("value", function (d) { return d.value; });

    dropDown.on("change.marvel", menuChanged );

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
          .attr("fill","transparent")
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
      // .filter(function(d) {
      //   if (d.rank<=15) {
      //     return d
      //   }
      // })
      .attr("class","city-circle")
      .attr("r",function(d) {
        if(d.Country.localeCompare("CA") == 0) {
          return 0;
        }
        return radiusScale(d.Power)
      })
      .attr("fill","lightpink")
      .attr("stroke","white")
      .attr("stroke-width", 0.8)
      .attr("opacity",0.5)
      .attr("cx",function(d) {

        var coords = projection([d.Longitude,d.Latitude])
        console.log(coords)
        if (coords!==null) {
          // console.log(coords[0])
          return coords[0];}
        // if (coords[0]!==0){
        //   console.log(coords[0])
        //   return -1
        // }
        else {return -100}
      })
      .attr("cy",function(d) {
        var coords = projection([d.Longitude,d.Latitude])
        if (coords!==null) {
          return coords[1];}
        else {return -1}
      })
      .attr("cursor", "pointer")
      .on('mouseover', function(d, i) {
        var element = d3.select(this)
          // console.log(element.classed("filtered-in"))
          // if (element.classed("filtered-in")) {
            tip.show(d)
            element.style("stroke-width", "3")
            element.style("stroke", "maroon")
            element.style("fill","red")
            element.style("opacity", 1)
      	  .transition()
        	  .duration(50)
            .attr("r", function(d) {
              if(d.Country.localeCompare("CA") == 0) {
                return 0;
              }
              return radiusScale(d.Power)+7.5
            });
      })
      .on('mouseout', function(d, i) {
        var element = d3.select(this)
          // if (element.classed("filtered-in")) {
            tip.hide(d)
            element.style("fill","lightpink")
            element.style("opacity", 0.5)
            element.style("stroke-width", 0.8)
            element.style("stroke", "white")
      	  .transition()
        	  .duration(50)
            .attr("r", function(d) {
              if(d.Country.localeCompare("CA") == 0) {
                return 0;
              }
              return radiusScale(d.Power)
            });
      })

  }

})();
