(function() {
    var margin = { top: 30, left: 30, right: 30, bottom: 30},
        height = 420 - margin.top - margin.bottom,
        height1 = 200 - margin.top - margin.bottom,
        width = screen.width/2 - margin.left - margin.right;

    // What is this???
    var svg = d3.select("#chart_a2")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var multi_svg = d3.select("#chart_a4")
        .append("svg")
        .attr("height", height1 + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var radius = 100;
    //
    var radiusScale = d3.scaleLinear()
        .domain([0, 100])
        .range([40, radius+10]);

    var radius1 = 40;
    //
    var radiusScale1 = d3.scaleLinear()
        .domain([0, 100])
        .range([10, radius1+10]);

    var angleScale = d3.scalePoint()
        .domain(['Combat', 'Durability', 'Intelligence', 'Power', "Speed", "Strength", 'Blah'])
        .range([0, Math.PI * 2]);

    var powerSet = ['Combat', 'Durability', 'Intelligence', 'Power', "Speed", "Strength"];

    var colorScale = d3.scaleLinear().domain([0, 100]).range(['lightblue', 'pink']);

    var xPositionScale = d3.scalePoint()
        .domain([0, 1, 2, 3, 4])
        .range([0, width])
        .padding(0.5);

    var radialLine = d3.radialLine()
        .angle(function(d) {
            return angleScale(d.power)
        })
        .radius(function(d) {
            return radiusScale(d.powerval);
        });

    var radialLine1 = d3.radialLine()
        .angle(function(d) {
            return angleScale(d.power)
        })
        .radius(function(d) {
            return radiusScale1(d.powerval);
        });

    var data_under = [];

    function create_new_datapoints(input_data){
        // console.log(nested);

        var power_data = [];
        // console.log(input_data);
        var aggregates = [];

        for (i in input_data){
            if (powerSet.includes(i)) {
                var element = {};
                // console.log(i);
                // console.log(input_data[i]);
                element.power = i;
                element.powerval = input_data[i];
                aggregates.push(element);
            }
        }
        // console.log(aggregates);
        return aggregates;
    }



    d3.queue()
        .defer(d3.csv, "assets/data/dc-superheroes_geocodio.csv", function(d){
            d.Combat = +d.Combat;
            d.Durability = +d.Durability;
            d.Intelligence = +d.Intelligence;
            d.Speed = +d.Speed;
            d.Strength = +d.Strength;
            d.Power = +d.Power;

            return d;
        })
        .await(ready);

    function ready(error, dcdata) {

        // console.log(marveldata);
        // console.log(dcdata);

        d3.select("#random_btn")
        // .on("click.marvel", function() { console.log("marvel"); })
            .on("click.dc", function() {
                console.log("dc");
                var random_index = Math.floor(Math.random() * dcdata.length);
                data_under.push(dcdata[random_index]);
                createVis(dcdata[random_index]);
                data_under_plot();
            });


        var heroNames = dcdata.map(function (d) {
            return d.HeroName
        });
        // console.log(heroNames);
        // console.log(heroNames);
        var heroIndex = heroNames.indexOf("Batman");
        data_under.push(dcdata[heroIndex]);
        createVis(dcdata[heroIndex]);
        data_under_plot();

        var options = {
            data: heroNames,
            list: {
                onClickEvent: function () {
                    var getData = $("#trigger-event2").getSelectedItemData();
                    var heroIndex = heroNames.indexOf(getData);
                    data_under.push(dcdata[heroIndex]);
                    createVis(dcdata[heroIndex]);
                    data_under_plot();
                    // alert("Click !");
                },
                maxNumberOfElements: 10,
                match: {
                    enabled: true
                },
                showAnimation: {
                    type: "slide",
                    time: 300
                },
                hideAnimation: {
                    type: "slide",
                    time: 300
                }
            },
            theme: "round"
        };
        $("#trigger-event2").easyAutocomplete(options);



        randomize(dcdata)
        randomize(dcdata)
        randomize(dcdata)
        randomize(dcdata)
        randomize(dcdata)
           
    }

    function randomize(dcdata) {
        var random_index = Math.floor(Math.random() * dcdata.length);
                data_under.push(dcdata[random_index]);
                createVis(dcdata[random_index]);
                data_under_plot();
    }
    function createVis(data_value){


        console.log(data_value);
        // console.log(data_value);
        finalPowerData = create_new_datapoints(data_value);
        finalPowerData.push(finalPowerData[0]);

        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // d3.selectAll(".con-circle").transition().remove();
        d3.selectAll(".con_path").remove();
        d3.selectAll(".powertext").remove();
        d3.selectAll(".heronamedc").remove();

        var con_circles = g.selectAll(".con-circle")
            .data([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
            .enter()
            .append("circle")
            .attr("class", "con-circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", function(d) {
                return radiusScale(d)
            })
            .attr("fill", "none")
            .attr("stroke", function(d) {
                return colorScale(d)
            });

        var con_path = g.append("path")
            .datum(finalPowerData)
            .attr("d", radialLine)
            .attr("class", "con_path")
            .transition()
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        g.append("text")
            .attr("class", "heronamedc")
            .attr("x", 0)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("font-weight", "600")
            .attr("font-size", "18")
            .text(data_value.HeroName);


        var con_text = g.selectAll(".powertext")
            .data(finalPowerData)
            .enter()
            .append("text")
            .attr("class", "powertext")
            .transition()
            .attr("x", function(d) {
                var a = angleScale(d.power);
                var r = radiusScale(d.powerval);
                return (r + 10) * Math.sin(a);
            })
            .attr("y", function(d) {
                var a = angleScale(d.power);
                var r = radiusScale(d.powerval);
                return (r + 10) * Math.cos(a) * -1;
            })
            .attr("font-size", 12)
            .attr("text-anchor", function(d) {
                if (d.power == "Durability" || d.power == "Intelligence"){
                    return "start";
                }
                return "end";
            })
            .attr("alignment-baseline", "middle")
            .text(function(d) {
                return d.power;
            });
    }
    function data_under_plot(){


        if (data_under.length >= 2) {

            end_index = data_under.length - 1;
            start_index = data_under.length - 6;
            if (start_index < 0) {
                start_index = 0;
            }
            console.log(data_under);
            console.log(start_index, end_index);

            data_under1 = data_under.slice(start_index, end_index);
            console.log(data_under1);

            multi_svg.selectAll(".radial-charts").remove();

            var charts = multi_svg.selectAll(".radial-charts")
                .data(data_under1)
                .enter()
                .append("g")
                .attr("class", "radial-charts")
                .attr("transform", function (d, i) {
                    var yPos = height1 / 2;
                    var xPos = xPositionScale(i);
                    return "translate(" + xPos + "," + yPos + ")"
                });

            multi_svg.append("text")
                .attr("x", width / 2)
                .attr("y", 160)
                .attr("text-anchor", "middle")
                .text("Recent DC Superheros");

            charts.each(function (d, i) {
                console.log("Here is", d, i);
                projectData = create_new_datapoints(d);

                projectData.push(projectData[0]);

                // for every instance of the graph, we need to push an extra value to connect the final 2 values
                var g = d3.select(this);

                g.selectAll("circle")
                    .data([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
                    .enter().append("circle")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", function (d) {
                        return radiusScale1(d);
                    })
                    .attr("fill", "none")
                    .attr("stroke", function (d) {
                        return colorScale(d);
                    });

                g.append("path")
                    .datum(projectData)
                    .attr("d", radialLine1)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2)
                    .attr("fill", "none")
                    .attr("opacity", 0.8);


                g.append("text")
                    .attr("class", "heronamedc")
                    .attr("x", 0)
                    .attr("y", -70)
                    .attr("text-anchor", "middle")
                    .attr("font-weight", "600")
                    .attr("font-size", "14")
                    .text(d.HeroName);


                g.selectAll(".powertext3")
                    .data(projectData)
                    .enter()
                    .append("text")
                    .attr("class", "powertext3")
                    .transition()
                    .attr("x", function (d) {
                        var a = angleScale(d.power);
                        var r = radiusScale1(d.powerval);
                        return (r + 10) * Math.sin(a);
                    })
                    .attr("y", function (d) {
                        var a = angleScale(d.power);
                        var r = radiusScale1(d.powerval);
                        return (r + 10) * Math.cos(a) * -1;
                    })
                    .attr("font-size", 6)
                    .attr("text-anchor", function (d) {
                        if (d.power == "Durability" || d.power == "Intelligence") {
                            return "start";
                        }
                        return "end";
                    })
                    .attr("alignment-baseline", "middle")
                    .text(function (d) {
                        return d.power;
                    });

            })
        }}

})();
