var newdata;
var scope = new Object();

scope.marginleft = 0;
scope.marginright = 50;
scope.margintop = 5;
scope.marginbottom = 100;
scope.width = 1200;
scope.height = 600;

d3.json("outputJSON/output.json", function(error, data) {
    if (error) {
        return;
    }

    newdata = data;

    var margin = {
        left: scope.marginleft,
        right: scope.marginright,
        top: scope.margintop,
        bottom: scope.marginbottom
    },
    width = scope.width - margin.left - margin.right,
    height = scope.height - margin.top - margin.bottom;

    function zoom() {
        vis.select(".xAxis").call(xAxis)
        .selectAll("text")
        .attr("dy", ((-cellXPosition.rangeBand())) + "px")
        .style("text-anchor", "start")
        .attr("dx", "10px")
        .attr("transform", function(d) {
            return "rotate(90)"
        });

        vis.select(".yAxis").call(yAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dy", (cellYPosition.rangeBand() / 2) + "px");

        cellcover.selectAll("rect").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        cellcover.selectAll(".cell-text").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

        if (d3.event.scale > 10) {
            cellcover.selectAll(".cell-text").classed({
                'cell-text-disable': false,
                'cell-text-active': true
            });
        } else {
            cellcover.selectAll(".cell-text").classed({
                'cell-text-disable': true,
                'cell-text-active': false
            });
        }
    }

    var threshold = 150;

    var colorScaleForward = function(j) {
        var value = d3.scale.linear()
        .domain(d3.extent(newdata.data, function(x) {
            return x.value
        }))
        .rangeRound([0, 255]);

        var output = 0;

        if (value(j) >= threshold) {
            var layer2 = d3.scale.linear()
            .domain([125, 255])
            .rangeRound([0, 255]);
            output = layer2(value(j));
        }

        return output;
    };

    var colorScaleReverse = function(j) {
        var value = d3.scale.linear()
        .domain(d3.extent(newdata.data, function(x) {
            return x.value
        }))
        .rangeRound([255, 0]);
        var output = 0;
        if (value(j) >= threshold) {
            var layer2 = d3.scale.linear()
            .domain([255, 125])
            .rangeRound([255, 0]);
            output = layer2(value(j));
        }
        return output;
    };

    var redColorControl = function(j, code) {
        var output = 0;
        if (code == "red") {
            output = colorScaleForward(j);
        } else {
            output = colorScaleForward(j);
        }
        return output;
    };

    var blueColorControl = function(j, code) {
        var output = 0;
        if (code == "blue") {
            output = colorScaleReverse(j);
        }
        return output;
    };

    var greenColorControl = function(j, code) {
        var output = 0;

        if (code == "red") {
            output = colorScaleReverse(j);
        } else {
            output = colorScaleForward(j);
        }

        return output;
    };


    var xkeylabels = newdata.columnlabels.map(function(d, i) {
        return {
            key: d,
            val: i
        }
    });

    var ykeylabels = newdata.rowlabels.map(function(d, i) {
        return {
            key: d,
            val: i
        }
    });

    var indexXMapper = d3.scale.ordinal()
    .domain(newdata.columnlabels.map(function(d, i) {
        return d;
    }))
    .range(newdata.columnlabels.map(function(d, i) {
        return i;
    }));

    var indexYMapper = d3.scale.ordinal()
    .domain(newdata.rowlabels.map(function(d, i) {
        return d;
    }))
    .range(newdata.rowlabels.map(function(d, i) {
        return i;
    }));

    var invIndexXMapper = d3.scale.ordinal()
    .domain(indexXMapper.range())
    .range(indexXMapper.domain());

    var invIndexYMapper = d3.scale.ordinal()
    .domain(indexYMapper.range())
    .range(indexYMapper.domain());

    var cellXPosition = d3.scale.ordinal()
    .domain(newdata.columnlabels)
    .rangeRoundBands([margin.left, margin.left + width]);

    var cellYPosition = d3.scale.ordinal()
    .domain(newdata.rowlabels)
    .rangeRoundBands([0, height]);

    var cellXPositionLin = d3.scale.linear()
    .domain(d3.extent(d3.range(newdata.columnlabels.length)))
    .range([margin.left, margin.left + width - cellXPosition.rangeBand()]);

    var cellYPositionLin = d3.scale.linear()
    .domain(d3.extent(d3.range(newdata.rowlabels.length)))
    .range([margin.top, margin.top + height - cellYPosition.rangeBand()]);

    var xAxis = d3.svg.axis().scale(cellXPositionLin).orient("bottom")
    .ticks(newdata.columnlabels.length)
    .tickFormat(function(d) {
        if (d % 1 == 0 && d >= 0 && d < newdata.columnlabels.length) {
            return invIndexXMapper(d);
        }
    });

    var yAxis = d3.svg.axis().scale(cellYPositionLin).orient("right")
    .ticks(newdata.rowlabels.length)
    .tickFormat(function(d) {
        if (d % 1 == 0 && d >= 0 && d < newdata.rowlabels.length) {
            return invIndexYMapper(d);
        }
    });


    var svg = d3.select(document.body)
    .append("svg")
    .attr("class", "chart")
    .attr("pointer-events", "all")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("id", "clip-rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width + margin.left)
    .attr("height", height + margin.top);

    var vis = svg.append("g")
    .attr("class", "uncovered")

    var cellcover = svg.append("g")
    .attr("class", "heatmapcells")
    .attr("clip-path", "url(#clip)")
    .call(d3.behavior.zoom()
    .x(cellXPositionLin)
    .y(cellYPositionLin)
    .scaleExtent([1, 20])
    .on("zoom", zoom));

    cellcover.append("g")
    .selectAll("rect")
    .data(newdata.data)
    .enter()
    .append("rect")
    .attr({
        "class": "cells",
        "height": function(d) {
            return .95 * (cellYPosition.rangeBand());
        },
        "width": function(d) {
            return .95 * (cellXPosition.rangeBand());
        },
        "x": function(d, i) {
            return cellXPositionLin(indexXMapper(d.col));
        },
        "y": function(d, i) {
            return cellYPositionLin(indexYMapper(d.row));
        },
        "fill": function(d) {
            return "rgb(" + redColorControl(d.value, "red") + "," + greenColorControl(d.value, "red") + "," + blueColorControl(d.value, "red") + ")";

        },
        "value": function(d) {
            return d.value;
        },
        "index": function(d, i) {
            return i;
        },
        "row": function(d, i) {
            return d.row;
        },
        "column": function(d, i) {
            return d.col;
        }
    });
    cellcover.append("g")
    .selectAll("text")
    .data(newdata.data)
    .enter()
    .append("text")
    .attr({
        "class": "cell-text",
        "x": function(d, i) {
            return cellXPositionLin(indexXMapper(d.col)) + .02 * (cellXPosition.rangeBand());
        },
        "y": function(d, i) {
            return cellYPositionLin(indexYMapper(d.row)) + .1 * (cellYPosition.rangeBand());
        },
    })
    .text(function(d) {
        return d.value;
    })
    .classed({
        'cell-text-disable': true,
        'cell-text-active': false
    });



    vis.append("g").attr("class", "xAxis").attr("transform", "translate(0," + (margin.top + height) + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("dy", ((-cellXPosition.rangeBand())) + "px")
    .style("text-anchor", "start")
    .attr("dx", "10px")
    .attr("transform", function(d) {
        return "rotate(90)"
    });

    vis.append("g").attr("class", "yAxis").attr("transform", "translate(" + (width + margin.left) + ")")
    .call(yAxis)
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("dy", (cellYPosition.rangeBand() / 2) + "px");

    d3.select("#order").on("change", function() {
        order(this.value);
    });

    function order(value) {
        if (value == "row") {
            indexYMapper.domain(newdata.rowlabels.sort().map(function(d, i) {
                return d;
            }))
            .range(newdata.rowlabels.map(function(d, i) {
                return i;
            }));

            invIndexYMapper.domain(indexYMapper.range())
            .range(indexYMapper.domain());

            var t = svg.transition().duration(2500);

            t.selectAll(".yAxis")
            .call(yAxis);

            t.selectAll(".cells")
            .attr("x", function(d, i) {
                return cellXPositionLin(indexXMapper(d.col));
            })
            .attr("y", function(d, i) {
                return cellYPositionLin(indexYMapper(d.row));
            });

            t.selectAll(".cell-text")
            .attr("x", function(d, i) {
                return cellXPositionLin(indexXMapper(d.col)) + .02 * (cellXPosition.rangeBand());
            })
            .attr("y", function(d, i) {
                return cellYPositionLin(indexYMapper(d.row)) + .1 * (cellYPosition.rangeBand());
            })
            .text(function(d) {
                return d.value;
            });
        } else if (value == "col") {
            indexXMapper.domain(newdata.columnlabels.sort().map(function(d, i) {
                return d;
            }))
            .range(newdata.columnlabels.map(function(d, i) {
                return i;
            }));

            invIndexXMapper.domain(indexXMapper.range())
            .range(indexXMapper.domain());

            var t = svg.transition().duration(2500);

            t.selectAll(".xAxis")
            .call(xAxis)
            .selectAll("text")
            .attr("dy", ((-cellXPosition.rangeBand())) + "px")
            .style("text-anchor", "start")
            .attr("dx", "10px");

            t.selectAll(".cells")
            .attr("x", function(d, i) {
                return cellXPositionLin(indexXMapper(d.col));
            })
            .attr("y", function(d, i) {
                return cellYPositionLin(indexYMapper(d.row));
            });

            t.selectAll(".cell-text")
            .attr("x", function(d, i) {
                return cellXPositionLin(indexXMapper(d.col)) + .02 * (cellXPosition.rangeBand());
            })
            .attr("y", function(d, i) {
                return cellYPositionLin(indexYMapper(d.row)) + .1 * (cellYPosition.rangeBand());
            })
            .text(function(d) {
                return d.value;
            });
        }
    }
});
