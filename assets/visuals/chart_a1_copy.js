(function() {
    var margin = { top: 30, left: 30, right: 30, bottom: 30},
        height = 500 - margin.top - margin.bottom,
        width = screen.width/2 - margin.left - margin.right;

    // What is this???
    var svg = d3.select("#chart_a1")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var radius = 100;
    //
    var radiusScale = d3.scaleLinear()
        .domain([0, 100])
        .range([40, radius+10]);

    var angleScale = d3.scalePoint()
        .domain(['Combat', 'Durability', 'Intelligence', 'Power', "Speed", "Strength", 'Blah'])
        .range([0, Math.PI * 2]);

    var powerSet = ['Combat', 'Durability', 'Intelligence', 'Power', "Speed", "Strength"];

    var colorScale = d3.scaleLinear().domain([0, 100]).range(['lightblue', 'pink']);


    var radialLine = d3.radialLine()
        .angle(function(d) {
            return angleScale(d.power)
        })
        .radius(function(d) {
            return radiusScale(d.powerval);
        });

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
        console.log(aggregates);
        return aggregates;
    }





    d3.queue()
        .defer(d3.csv, "assets/data/marvel-superheroes_geocodio.csv", function(d) {
            d.Combat = +d.Combat;
            d.Durability = +d.Durability;
            d.Intelligence = +d.Intelligence;
            d.Speed = +d.Speed;
            d.Strength = +d.Strength;
            d.Power = +d.Power;

            return d;
        })
        .await(ready);

    function ready(error, marveldata) {

        d3.select("#random_btn")
            .on("click.marvel", function() {
                console.log(marveldata.length);
                var random_index = Math.floor(Math.random() * marveldata.length) + 1
                createVis(marveldata, random_index);
            });
            // .on("click.dc", function() { console.log("dc"); });

        var heroNames = marveldata.map(function (d) {
            return d.HeroName
        });
        // console.log(heroNames);
        var heroIndex = heroNames.indexOf("Spider-Man");
        createVis(marveldata, heroIndex);

        var options = {
            data: heroNames,
            list: {
                onClickEvent: function () {
                    var getData = $("#trigger-event1").getSelectedItemData();
                    var heroIndex = heroNames.indexOf(getData);
                    createVis(marveldata, heroIndex);
                    // alert("Click !");
                },
                maxNumberOfElements: 10,
                match: {
                    enabled: true
                }
            }
        };
        $("#trigger-event1").easyAutocomplete(options);

    }
    function createVis(marveldata, superheroIndex){

        // console.log(superheroName);
        data_value = marveldata[superheroIndex];

        console.log(data_value);
        // console.log(data_value);
        finalPowerData = create_new_datapoints(data_value);
        finalPowerData.push(finalPowerData[0]);

        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // d3.selectAll(".con-circle").transition().remove();
        d3.selectAll(".con_path1").remove();
        d3.selectAll(".powertext1").remove();
        d3.selectAll(".heronamemv").remove();


        var con_circles = g.selectAll(".con-circle1")
            .data([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
            .enter()
            .append("circle")
            .attr("class", "con-circle1")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", function(d) {
                return radiusScale(d)
            })
            .attr("fill", "none")
            .attr("stroke", function(d) {
                return colorScale(d);
            });

        var con_path = g.append("path")
            .datum(finalPowerData)
            .attr("d", radialLine)
            .attr("class", "con_path1")
            .transition()
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        g.append("text")
            .attr("class", "heronamemv")
            .attr("x", 0)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("font-weight", "600")
            .attr("font-size", "18")
            .text(marveldata[superheroIndex].HeroName);


        var con_text = g.selectAll(".powertext1")
            .data(finalPowerData)
            .enter()
            .append("text")
            .attr("class", "powertext1")
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
})();
