(function() {

  var margin = { top: 30, left: 30, right: 30, bottom: 30},
      height = 600 - margin.top - margin.bottom,
      width = 800 - margin.left - margin.right;

  var svg = d3.select("#chart_s1")
      .append("svg")
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", width + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + margin.top + "," + margin.left + ")");

  // Let's create some scales
  var xPositionScale = d3.scaleLinear()
      .domain([0,1000])
      .range([0,width]);

  var yPositionScale = d3.scaleLinear()
      .domain([0,120])
      .range([height,0]);


  var colorScale = d3.scaleOrdinal().domain(["Amber","Black","Blue","Blue / White", "Brown", "Gold", "Green", "Green / Blue", "Grey", "Hazel", "Purple", "Red", "Silver", "Violet", "White", "White / Red", "Yellow", "Yellow / Blue", "Yellow (without irises)"]).range(["#F17F42",
    "black",
    "#4F86C6",
    "#84B1ED",
    "#49010F",
    "#E3E36A",
    "#5A9367",
    "#67D5B5",
    "#c9d6de",
    "#8c9184",
    "#6a60a9",
    "#df405a",
    "#d3e0f7",
    "#512645",
    "#f1f1f1",
    "#fec8c9",
    "yellow",
    "yellow",
    "yellow"
  ])

  var xHeroScale = d3.scaleOrdinal().domain(["good","bad","neutral","-"]).range(["200", "450", "650"]);


  var places = {};

  var simulation = d3.forceSimulation()
      .force("x", d3.forceX(function(d) {
        return xHeroScale(d.Alignment);
      }).strength(function(d) {
        return 0.02;
      }))
      .force("y", d3.forceY(function(d) {
        return 300;
      }).strength(function(d) {
        return 0.02;
      }))
      .force("collide", d3.forceCollide(function(d) {
        return 6;
      }))


  d3.queue()
      .defer(d3.csv, "assets/data/marvel-superheroes_geocodio.csv", function (d) {
        d.Strength = +d.Strength;
        d.Weight = +parseFloat(d.Weight.slice(0,d.Weight.indexOf("lb")).replace(" ",""))
        return d;
      })
      .await(ready)

  function ready(error, datapoints) {

    var marvel = datapoints.filter( function(d) {
      return isNaN(d.Weight) == false && d.Weight < 1000 && d.Strength <= 100
    });

    var circles = svg.selectAll("circle")
        .data(marvel)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", function(d) {
          // console.log(d)
          d.x = xPositionScale(d.Weight)
          return xPositionScale(d.Weight);
        })
        .attr("cy", function(d) {
          d.y = yPositionScale(d.Strength);
          return yPositionScale(d.Strength);
        })
        .attr("fill", function (d) {
          return colorScale(d.EyeColor)
        })
        .attr("opacity", 0.6);


    var xAxis = d3.axisBottom(xPositionScale)
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var yAxis = d3.axisLeft(yPositionScale);
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis);


    d3.select("#force")
        .on("click", function (d) {

          d3.select(".y-axis")
              .attr("opacity", 0)

          d3.select(".x-axis")
              .attr("opacity", 0)

          simulation.nodes(marvel)
              .on('tick', ticked)
              .alphaTarget(25)
              .restart()

          var splitTimeout = null;
          splitTimeout = setTimeout(function() {
            simulation.alphaTarget(0.2).restart()
          }, 100);

          svg.append("text")
              .attr("class", "country-text")
              .attr("y", 300-100)
              .attr("x", xHeroScale("good"))
              .attr("text-anchor","middle")
              .text("Good")
              .attr("style", "font-family: Verdana;font-size: 14px;");

          svg.append("text")
              .attr("class", "country-text")
              .attr("y", 300-100)
              .attr("x", xHeroScale("bad"))
              .attr("text-anchor","middle")
              .text("Bad")
              .attr("style", "font-family: Verdana;font-size: 14px;");

          svg.append("text")
              .attr("class", "country-text")
              .attr("y", 300-100)
              .attr("x", xHeroScale("neutral"))
              .attr("text-anchor","middle")
              .text("Neutral")
              .attr("style", "font-family: Verdana;font-size: 14px;");


        });


    d3.select("#scatter")
        .on("click", function (d) {

          d3.select(".y-axis")
              .attr("opacity", 1)

          d3.select(".x-axis")
              .attr("opacity", 1)

          svg.selectAll(".country-text")
              .remove();

          simulation.stop()

          circles.transition()
              .attr("cx", function(d) {
                d.x = xPositionScale(d.Weight)
                return xPositionScale(d.Weight);
              })
              .attr("cy", function(d) {
                d.y = yPositionScale(d.Strength);
                return yPositionScale(d.Strength);
              })


        });

    function ticked() {
      circles.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

  }
})();
