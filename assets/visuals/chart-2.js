(function() {
	var margin = { top: 30, left: 50, right: 30, bottom: 150},
	height = 500 - margin.top - margin.bottom,
	width = 780 - margin.left - margin.right;


	var svg = d3.select("#chart-2")
				.append("svg")
				.attr("height", height + margin.top + margin.bottom)
				.attr("width", width + margin.left + margin.right)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Build xy axes, x being the four measuring variables and y being the 0-100 value
  var xPositionScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);
  var yPositionScale = d3.scaleLinear().rangeRound([height, 0]);

  // Make tooltips.
  var tip = d3.tip()
    // .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return 	"<strong>Race:</strong> <span style='color:gold'>" + d.cat + "</span>"
						 +"<br><strong>Value:</strong> <span style='color:red'>" + d.val + "</span>";
    })
  svg.call(tip);

  // var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  // var y = d3.scale.linear().range([height, 0]);

  // var xPositionScale = d3.scalePoint()
  //                        .domain(['Alien','God','Human','Inhuman','Mutant','Robot'])
  //                        .range([0,width])
  //                        .padding(100);
  // var yPositionScale = d3.scaleLinear().domain([0,100]).range([height, 0]);


  // Read the file

  d3.queue()
    .defer(d3.csv, "data/aveValue.csv", function type(d) {
      if (d.cat !== "Unknown" && d.cat !== "All" ) {
				d.val = +d.val;
        return d}
		})
    .await(ready)


  function ready(error, datapoints) {
    console.log(datapoints)

    xPositionScale.domain(datapoints.map(function(d) { return d.cat; }));
    yPositionScale.domain([0, d3.max(datapoints, function(d) { return d.val; })]);

    // svg.selectAll(".bar")
    //     .data(datapoints)
    //     .enter().append("rect")
    //     .attr("class", "bar")
    //     .attr("x", function(d) {
    //       console.log(d.cat)
    //       return xPositionScale(d.cat);
    //     })
    //     .attr("y", function(d) {
    //       return yPositionScale(d.val);
    //     })
    //     .attr("width", xPositionScale.bandwidth())
    //     .attr("height", function(d) {
    //       return height - yPositionScale(d.val);
    //     })

    svg.selectAll(".bar")
      .data(datapoints)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {return xPositionScale(d.cat); })
        .attr("y", function(d) {return yPositionScale(d.val); })
        // .attr("x", function(d) {
        //   if (d.cat=="All") return xPositionScale(d.cat); })
        // .attr("y", function(d) {
        //   if (d.cat=="All") return yPositionScale(d.val); })
        // .attr("width",20)
        .attr("width", xPositionScale.bandwidth())
        .attr("height", function(d) { return height - yPositionScale(d.val); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)

    // Set up both x and y-axes

    var yAxis = d3.axisBottom(xPositionScale);
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, "+height+")")
      .call(yAxis);

    var xAxis = d3.axisLeft(yPositionScale);
		svg.append("g")
			.attr("class", "axis y axis")
			.call(xAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Average Value (%)")

    // d3.select("#scatter")
    //   .on("click", function (d) {
    //     console.log(d)
    //   })


  }
})();
