
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.

    var margin = { top: 30, left: 30, right: 30, bottom: 30},
      height = 650 - margin.top - margin.bottom,
      width = 800 - margin.left - margin.right;


  // Let's create some scales
  var xPositionScale = d3.scaleLinear()
      .domain([0,1000])
      .range([0,width]);

  var yPositionScale = d3.scaleLinear()
      .domain([0,120])
      .range([height,0]);


  var colorScale = d3.scaleOrdinal().domain(["Amber","Black","Blue","Blue / White", "Brown", "Gold", "Green", "Green / Blue", "Grey", "Hazel", "Purple", "Red", "Silver", "Violet", "White", "White / Red", "Yellow", "Yellow / Blue", "Yellow (without irises)"]).range([
    "#F17F42",
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

  var genderscale = d3.scaleOrdinal().domain(["male, female"]).range(["lightpink", "lightblue"])

  var xHeroScale = d3.scaleOrdinal().domain(["good","bad","neutral","-"]).range(["200", "450", "650"]);

   var xforcesc = d3.scaleOrdinal().domain(["Amber","Black","Blue","Blue / White", "Brown", "Gold", "Green", "Green / Blue", "Grey", "Hazel", "Purple", "Red", "Silver", "Violet", "White", "White / Red", "Yellow", "Yellow / Blue", "Yellow (without irises)"])
                    .range([300,350,200,250,400,450,500,550,600,650,225,275,325,375,425,475,525,575,625,675]);


   var yforcesc = d3.scaleOrdinal().domain(["Amber","Black","Blue","Blue / White", "Brown", "Gold", "Green", "Green / Blue", "Grey", "Hazel", "Purple", "Red", "Silver", "Violet", "White", "White / Red", "Yellow", "Yellow / Blue", "Yellow (without irises)"])
                    .range([200,200,200,200,200,200,200,200,200,200,400,400,400,400,400,400,400,400,400,400]);



  var places = {};

  var simulation = d3.forceSimulation()
      .force("x", d3.forceX(function(d) {
        return xHeroScale(d.Alignment);
      }).strength(function(d) {
        return 0.04;
      }))
      .force("y", d3.forceY(function(d) {
        return 300;
      }).strength(function(d) {
        return 0.02;
      }))
      .force("collide", d3.forceCollide(function(d) {
        return 6;
      }))



  function ticked() {
      circles.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      // create svg and give it a width and height
      svg = d3.select(this)
      .append("svg")
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", width + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + margin.top + "," + margin.left + ")");


      svg.append("g");
      //
      // var tip = d3.tip()
      //     .attr('class', 'd3-tip')
      //     .offset([-10, 0])
      //     .html(function(d) {
      //         return "<strong style='color: Red;font-size:15pt'>" + d.HeroName + "</strong>" +
      //             "<br>" +
      //             // '<img src="https://i.annihil.us/u/prod/marvel/i/mg/2/00/53710b14a320b.png" alt="Mountain View" style="width:150px;height:150px;">'+
      //             '<img src="http://www.superherodb.com/pictures/portraits/' + d.HeroName.toLowerCase() + '.jpg" alt="'+ d.HeroName + '" style="width:120px;height:140px;">'+
      //             "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Full Name:  </span>" +
      //             "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.FullName +
      //             "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Origin:  </span>" +
      //             "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Placeofbirth +
      //             "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Type:  </span>" +
      //             "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Category + "</span>"+
      //             "<br><span style='color:#40bf80;font-size:10pt' 'font-weight:bolder'> Power:  </span>" +
      //             "<span style='color:black;font-size:10pt' 'font-weight:bolder'> " + d.Power + "</span>"
      //             // "http://i.annihil.us/u/prod/marvel/i/mg/2/00/53710b14a320b.png"
      //     })
      //
      // svg.call(tip);


      // this group element will be used to contain all
      // other elements.
      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // preprocess the data - and then call setupVis
      setupVis(rawData);

      setupSections();

    });
  };

  var marvel  = null;
  var circles = null;
  var inForce = false;

  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  setupVis = function(datapoints) {
    console.log(datapoints)

    console.log("Visualization setup.")

    marvel = datapoints.filter( function(d) {
      return isNaN(d.Weight) == false && d.Weight < 1000 && d.Strength <= 100
    });


    circles = svg.selectAll("circle")
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
          console.log(d.Gender)
          return genderscale(d.Gender)
        })
        .attr("opacity", 0.9);






  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = page0;
    activateFunctions[1] = page1;
    activateFunctions[2] = page2;
    activateFunctions[3] = page3;
    activateFunctions[4] = lastPage;


    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 5; i++) {
      updateFunctions[i] = function() {};
    }
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */


  function lastPage() {
    var vis = d3.select("#vis");
    vis.style("display", "none");
  }

  function page0() {
    var vis = d3.select("#vis");
    vis.style("display", "none");
  }

  function page1() {
    var vis = d3.select("#vis");
    vis.style("display", "inline-block");


    svg.selectAll("circle")
    .attr("fill", function(d) {
      return genderscale(d.Gender)
    })


    console.log("page1!!")

    svg.selectAll(".axis").remove()

        var xAxis = d3.axisBottom(xPositionScale)
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var yAxis = d3.axisLeft(yPositionScale);
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis);

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
  }

  /**
   * showFillerTitle - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function page2() {

    svg.selectAll("circle")
    .attr("fill", function(d) {
      return genderscale(d.Gender)
    })


    svg.selectAll(".axis").remove()


    var vis = d3.select("#vis");
    vis.style("display", "inline-block");
    console.log("page2!!")

    d3.select(".y-axis")
              .attr("opacity", 0)

          d3.select(".x-axis")
              .attr("opacity", 0)

              svg.selectAll("circle")
    .transition()
    .attr("fill", function(d) {
      return genderscale(d.Gender)
    })

          simulation.nodes(marvel)
              .force("x", d3.forceX(function(d) {
                return xHeroScale(d.Alignment);
              }).strength(function(d) {
                return 0.04;
              }))
              .on('tick', ticked)
              .alphaTarget(8)
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
  }

  function page3() {
    var vis = d3.select("#vis");
    vis.style("display", "inline-block");
    svg.selectAll("circle")
    .transition()
    .attr("fill", function(d) {
      return colorScale(d.EyeColor)
    })
    // .on('mouseover', function(d, i) {
    //   var element = d3.select(this)
    //     // console.log(element.classed("filtered-in"))
    //     // if (element.classed("filtered-in")) {
    //       tip.show(d)
    //       element.style("stroke-width", "5")
    //       element.style("stroke", "maroon")
    //       // element.style("fill","red")
    //       // element.style("opacity", 1)
    //     // .transition()
    //     //   .duration(500)
    //     //   .attr("r", function(d) {
    //     //     return radiusScale(d.Power)+7.5
    //     //   });
    // })
    // .on('mouseout', function(d, i) {
    //   var element = d3.select(this)
    //     // if (element.classed("filtered-in")) {
    //       tip.hide(d)
    //       // element.style("fill","lightpink")
    //       // element.style("opacity", 0.5)
    //       // element.style("stroke-width", 0.8)
    //       element.style("stroke", "transparent")
    //     // .transition()
    //     //   .duration(500)
    //     //   .attr("r", function(d) {
    //     //     return radiusScale(d.Power)
    //     //   });
    // })



    svg.selectAll(".axis").remove()


          simulation.nodes(marvel)
              .on('tick', ticked)
              .alphaTarget(3)
              .force("x", d3.forceX(function(d) {
                return xforcesc(d.EyeColor);
              }).strength(function(d) {
                return 0.04;
              }))
              .restart()

          var splitTimeout2 = null;
          splitTimeout2 = setTimeout(function() {
            simulation.alphaTarget(0.2).restart()
          }, 350);

          svg.selectAll("text").remove();
  }


  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(error, data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(d) {
    index = d;
    console.log(index)
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(d,i){
    plot.update(d,i);
  });

}

function combine(error, big_data_1, big_data_2, big_data_3) {
    if (error) {
        console.log(error);
    }
    console.log(d3.merge([big_data_1, big_data_2, big_data_3]));
}

d3.queue()
      .defer(d3.csv, "assets/data/marvel-superheroes_geocodio.csv", function (d) {
        d.Strength = +d.Strength;
        d.Weight = +parseFloat(d.Weight.slice(0,d.Weight.indexOf("lb")).replace(" ",""))
        return d;
      })
      .await(display)
