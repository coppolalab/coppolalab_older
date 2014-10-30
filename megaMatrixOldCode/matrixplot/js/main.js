
var plotMarginTop = 150;
var plotWidth = 500;
var plotPosition = null;
var labelColor = "#aaa";
var labelHighLightColor = "red";

var currentMousePos = { x: -1, y: -1 };
var zoomEnd = false;
var zoomLevel = {
					"z1":{
							"imgsize":25000,
							"slicesize":5000,
							"filepath":"img/slices/5000/p5000-"
						 },	
					"z2":{
							"imgsize":25000,
							"slicesize":1000,
							"filepath":"img/slices/1000/p1000-"
						 }
	
	
				};
var currentZoom = "";
var preblock = 0;



d3.selection.prototype.moveToFront = function() {
return this.each(function(){
this.parentNode.appendChild(this);
});
};





$( document ).ready(function() 
{

	initPlotSize();

	initDefPlotControl();
	
	initBackButtom();
});




function initPlotSize()
{	
	
	plotWidth = $( window ).height() - plotMarginTop*2;
	
	$("#plotDiv").css({ "width":plotWidth,
						"height":plotWidth
					});
	
	$("#bottomDiv").css({ "width":plotWidth + plotMarginTop,
						  "height":plotWidth + plotMarginTop 
					});
					
	$("#xLabelDiv").css({ "width":plotWidth
					});
					
	$("#yLabelDiv").css({ "height":plotWidth
					});
	
	
}







function initDefPlotControl()
{

	
	plotPosition = $( "#plotDiv" ).position();

	
	
	$( "#plotDiv" ).mousemove(function( event ) {
			currentMousePos = { x: event.pageX , y: event.pageY};
	});
	
	
	
	
	$("#defPlot").click(function(e) {
		
		var x= currentMousePos.x;
		var y = currentMousePos.y;
		
		
		//initZoomPlotControl();
		
		showZoomPlot(x,y,"z1");
		
		//showBackButtom("z1");
		
	});
	
}




function initZoomPlotControl()
{
	
	$("#zoomPlot").click(function(e) {
		
		var x= currentMousePos.x;
		var y = currentMousePos.y;
		
		//showZoomPlot(x,y,"z2");
		//showZoomPlotD3(x,y,"z2");
		showZoomPlotD3_2(x,y,"z2");
		//showBackButtom("z2");
	});

}








function showZoomPlot(x,y,level)
{
	$("#returnB").show();
	//alert("------"+x+"----"+y+"-------"+level);
	//alert(preblock);
	
	
	currentZoom = level;
	
	if(zoomEnd && level=="z2")
	{	
		return;
	}
	else if(level=="z2")
	{
		zoomEnd = true;
		row_blocks = 4;
		
		if(preblock.bx-1 == row_blocks)
		{
			row_blocks = row_blocks + 1;
		}	
		
	}
	else
	{
		row_blocks = 5;
	}
	
	
	
	
	var imgsize = zoomLevel[level].imgsize;//25000;
	var slicesize = zoomLevel[level].slicesize;//1000;
	//var row_blocks = imgsize/slicesize; 
	
	//alert("row blocks:"+row_blocks);
	//row_blocks = 5;

	var bsize = plotWidth / row_blocks;
	
	
	var bx=-1;
	var by=-1;
	
	for(var i=1;i<=row_blocks;i++)
	{	
		//alert(i);
		
		if(bx != -1 && by !=-1)
			break;
		
		var xx = plotPosition.left +  bsize*i ;
		
		
		var yy = plotPosition.top + 0 +  bsize*i ; //plotMarginTop
		
		//alert(y+"==="+yy+"==="+plotPosition.top +"==="+ plotMarginTop +"==="+  bsize*i);
		
		if( x <= xx && bx==-1 )
		{ 
		  bx=i;
		}
		
		
		if( y <= yy && by==-1 )
		{ 
		  by=i;
		}
		
	}
	
	
	//alert("X:"+bx+" *** Y:"+by);
	//var blockNum = ((by - 1)* row_blocks + bx)-1;
	
	
	//alert("aaaa");
	
	
	var blockNum = 0;
	//if(!zoomEnd)
	//{
		//alert("bbbbbb");
		blockNum = (preblock*row_blocks*row_blocks)+(((by - 1)* row_blocks + bx)-1);
		preblock = {"bn":blockNum, "by":by, "bx":bx};	
	//}
	//else
	//{
	//	alert("cccc");
	//	var numRows = (preblock.by-1) * 4;
	//	var currentNumRows = numRows + (by-1);
		//alert("by:"+by+"-----"+numRows+"==="+currentNumRows);
		
	//	var numB = (preblock.bx-1) * 4;
	//	var currentNumB = numB + (bx-1);
		//alert(numB+"==="+currentNumB);
		
	//	var totalblocks = currentNumRows * row_blocks * row_blocks;
	//	var a = totalblocks + currentNumB;
		//alert(totalblocks+"-----"+a);
		
	//	blockNum = a;
		
		//blockNum = row_blocks * preblock.bx * (preblock.by-1) +   ((by-1) * 25 + bx-1 + (preblock.bx-1)*5  )         ;                     
	//}

	//alert("BN:"+blockNum);
	//alert("rb:"+row_blocks+"------by:"+by+"-----bx:"+bx+"-----preby:"+preblock.by+","+preblock.bx+"-----bNum:"+blockNum+"-------A:"+a);
	
	
	include = function (fn) {
       var e = document.createElement("script");
       e.onload = fn;
       e.src = "json2/"+blockNum+".js";
       e.className="thejsonfile";
       e.async=true;
       document.getElementsByTagName("head")[0].appendChild(e);
    };

    include(function(){
      console.log(plotJson);
      d3draw(plotJson);

      $("#defPlot").fadeOut(400);
	  $("#zoomPlot").hide();
	  $("#zoomPlotD3").show();

    });

	
	/*
	$("#defPlot").fadeOut(400);
	$("#zoomPlot").fadeIn(400);
	//$("#zoomPlot").css("background-image","url('img/slices/p1000-"+blockNum+".png')");
	$("#zoomPlot").css("background-image","url('"+zoomLevel[level].filepath+blockNum+".png')");
	*/
}



function d3draw(plotJson)
{
	//d3.json(plotJson, function(matrix) {
	//d3.json("json2/"+blockNum+".json", function(matrix) {
	
	matrix = plotJson;
	var blockmargin = 1;
    var matrixlength = 30;//84;
    var blocksize = (plotWidth-matrixlength*blockmargin) / matrixlength; //5;
    
    
    var yindex = -1;
    var xindex = -1;
    var out = 0;

	var svg = d3.select("#zoomPlotD3").append("svg")
              .attr("width", plotWidth)
              .attr("height", plotWidth)
              .append("g");
  
    
	var plot = svg.selectAll("rect")
	          .data(matrix.m)
              .enter().append("rect")
              .attr("x", function(d,i) { 				
              								if(i%matrixlength == 0)
              	                            {	
              	                            	xindex = xindex +1;
              	                            	out = (xindex)*(blocksize+blockmargin);
              	                            	xindex = -1;
              	                            }
              	                            else
              	                            {
              	                            	out = (i%matrixlength)*(blocksize+blockmargin);
              	                            }
              	
              								return out;
              							})
              							
              .attr("y", function(d,i) {  
              								if(i%matrixlength == 0)  
              									yindex = yindex + 1;
              								return (yindex)*(blocksize+blockmargin);
              							
              						   })
              .attr("rx", 0)
              .attr("ry", 0)
              .attr("class", "rectblock")
              .attr("width", function(d) { return blocksize; } )
              .attr("height", function(d) { return blocksize; } )
              .style("fill", function(d){return getColorD3(d);})
              
              .on('click', function(d,i) {
              	
              		blockClick();
              	
              })
              .on('mouseover', function(d,i) {
              	
              		if(!checkFilterOutValue(d))  
              		{
              			d3.select(this).style({"stroke":labelHighLightColor,"stroke-width":6,"stroke-opacity":0.6});
              			d3.select(this).moveToFront();
              			
              			showLabel(i,matrixlength,false);	
              		}
              		
              })
              .on('mouseout', function(d,i) {
              		
              		if(!checkFilterOutValue(d))
              		{
              			d3.select(this).style({"stroke-width":0,"stroke-opacity":0});
              			
              			showLabel(i,matrixlength,true);
              		}
              	
              });
              
              
              
 
  	var widthRatio = 0.0335;//0.0119;
  
  	 d3.select("#xLabelDiv").selectAll("svg").remove();
  	 
  	 var xlabelsvg = d3.select("#xLabelDiv").append("svg")
              .attr("width", plotWidth+250)
              .attr("height", plotMarginTop)
              .append("g");
  

	 var xlabel = xlabelsvg.selectAll(".xlabel")
              	.data(matrix.nameX)
              	.enter().append("text")
                .text(function (d) { return d; })
                .attr("x", function (d, i) {return (i+1) * (plotWidth*widthRatio); })
                .attr("y", 180)
                .style("text-anchor", "start")
                .attr("class", "xlabel plotlabel")
                .style("fill",labelColor)
                .attr("transform", function (d, i) { return "rotate(-45,"+ (i*(plotWidth*widthRatio)) +",80)"  ; }    );
                
                
                //.attr("transform", "translate(-6," + 5 / 1.5 + ")");

	 
	 
	 d3.select("#yLabelDiv").selectAll("svg").remove();
  	 
  	 var ylabelsvg = d3.select("#yLabelDiv").append("svg")
              .attr("width", plotMarginTop)
              .attr("height", plotWidth)
              .append("g");
  

	 var ylabel = ylabelsvg.selectAll(".ylabel")
              	.data(matrix.nameY)
              	.enter().append("text")
                .text(function (d) { return d; })
                .attr("x", 150)
                .attr("y", function (d, i) { return (i+1) * (plotWidth*widthRatio);    })
                .style("text-anchor", "end")
                .attr("class", "ylabel plotlabel")
                .style("fill",labelColor);
              
  
	//});

}//End d3draw





function showZoomPlotD3_2(x,y,level)
{
	
	currentZoom = level;
	
	$("#zoomPlot").hide();
	$("#zoomPlotD3").show();

	//if(zoomEnd && level=="z2")
	//{	
	//	return;
	//}
	//else 
	if(level=="z2")
	{
		zoomEnd = true;
		row_blocks = 5;
		
		//if(preblock.bx-1 == row_blocks || preblock.by-1 == row_blocks)
		//{
		//	row_blocks = 5;
		//}	
	}
	else
	{
		row_blocks = 5;
	}


	var bsize = plotWidth / row_blocks;
	var bx=-1;
	var by=-1;

	for(var i=1;i<=row_blocks;i++)
	{	
		if(bx != -1 && by !=-1)
			break;
		
		var xx = plotPosition.left +  bsize*i ;
		var yy = plotPosition.top  +  bsize*i ;
		
		if( x <= xx && bx==-1 )
		{ 
		  bx=i;
		}
		
		if( y <= yy && by==-1 )
		{ 
		  by=i;
		}
		
	}
	
	var b = row_blocks;
	var blockNum = 0;
	if(!zoomEnd)
	{
		
		blockNum = (preblock*row_blocks*row_blocks)+(((by - 1)* row_blocks + bx)-1);
		preblock = {"bn":blockNum, "by":by, "bx":bx};
	}
	
	else
	{
		
			var numRows = (preblock.by-1) * row_blocks;
			var currentNumRows = numRows + (by-1);
			
			var numB = (preblock.bx-1) * row_blocks;
			var currentNumB = numB + (bx-1);
			
			var totalblocks = currentNumRows * row_blocks * row_blocks;
			var a = totalblocks + currentNumB;
			
			blockNum = a;

		console.log(numRows+"--"+currentNumRows+"--"+numB+"--"+currentNumB+"--"+blockNum);
		    //blockNum = row_blocks * preblock.bx * (preblock.by-1) +   ((by-1) * 25 + bx-1 + (preblock.bx-1)*5  )         ;                     
	}







	
	//alert("D3----rb:"+row_blocks+"------by:"+by+"-----bx:"+bx+"-----preby:"+preblock.by+","+preblock.bx+"-----bNum:"+blockNum+"-------A:"+a+"----b:"+b);
	//alert("D3-BN:"+blockNum);

/*
    $( ".thejsonfile" ).remove();
    var script=document.createElement('script');
    script.type='text/javascript';
    script.src="json2/"+blockNum+".js";
    script.id="json"+blockNum;
    script.className="thejsonfile";
    //$("head").append(script);
    document.getElementsByTagName('body')[0].appendChild(script);
*/

    include = function (fn) {
       var e = document.createElement("script");
       e.onload = fn;
       e.src = "json2/"+blockNum+".js";
       e.className="thejsonfile";
       e.async=true;
       document.getElementsByTagName("head")[0].appendChild(e);
    };

    include(function(){
      console.log(plotJson);
      d3draw(plotJson);
    });

    return true; 


























   
//alert("111");
//    var plotJson = JSON.parse($('#'+"json"+blockNum).html());


	d3.json(plotJson, function(matrix) {
	//d3.json("json2/"+blockNum+".json", function(matrix) {
	
	alert(matrix);
	var blockmargin = 1;
    var matrixlength = 84;
    var blocksize = (plotWidth-matrixlength*blockmargin) / matrixlength; //5;
    
    
    var yindex = -1;
    var xindex = -1;
    var out = 0;

	var svg = d3.select("#zoomPlotD3").append("svg")
              .attr("width", plotWidth)
              .attr("height", plotWidth)
              .append("g");
  
    
	var plot = svg.selectAll("rect")
	          .data(matrix.m)
              .enter().append("rect")
              .attr("x", function(d,i) { 				
              								if(i%matrixlength == 0)
              	                            {	
              	                            	xindex = xindex +1;
              	                            	out = (xindex)*(blocksize+blockmargin);
              	                            	xindex = -1;
              	                            }
              	                            else
              	                            {
              	                            	out = (i%matrixlength)*(blocksize+blockmargin);
              	                            }
              	
              								return out;
              							})
              							
              .attr("y", function(d,i) {  
              								if(i%matrixlength == 0)  
              									yindex = yindex + 1;
              								return (yindex)*(blocksize+blockmargin);
              							
              						   })
              .attr("rx", 0)
              .attr("ry", 0)
              .attr("class", "rectblock")
              .attr("width", function(d) { return blocksize; } )
              .attr("height", function(d) { return blocksize; } )
              .style("fill", function(d){return getColorD3(d);})
              
              .on('click', function(d,i) {
              	
              		blockClick();
              	
              })
              .on('mouseover', function(d,i) {
              	
              		if(!checkFilterOutValue(d))  
              		{
              			d3.select(this).style({"stroke":labelHighLightColor,"stroke-width":6,"stroke-opacity":0.6});
              			d3.select(this).moveToFront();
              			
              			showLabel(i,matrixlength,false);	
              		}
              		
              })
              .on('mouseout', function(d,i) {
              		
              		if(!checkFilterOutValue(d))
              		{
              			d3.select(this).style({"stroke-width":0,"stroke-opacity":0});
              			
              			showLabel(i,matrixlength,true);
              		}
              	
              });
              
              
              
 
  	var widthRatio = 0.0119;
  
  	 d3.select("#xLabelDiv").selectAll("svg").remove();
  	 
  	 var xlabelsvg = d3.select("#xLabelDiv").append("svg")
              .attr("width", plotWidth+250)
              .attr("height", plotMarginTop)
              .append("g");
  

	 var xlabel = xlabelsvg.selectAll(".xlabel")
              	.data(matrix.nameX)
              	.enter().append("text")
                .text(function (d) { return d; })
                .attr("x", function (d, i) {return (i+1) * (plotWidth*widthRatio); })
                .attr("y", 180)
                .style("text-anchor", "start")
                .attr("class", "xlabel plotlabel")
                .style("fill",labelColor)
                .attr("transform", function (d, i) { return "rotate(-45,"+ (i*(plotWidth*widthRatio)) +",80)"  ; }    );
                
                
                //.attr("transform", "translate(-6," + 5 / 1.5 + ")");

	 
	 
	 d3.select("#yLabelDiv").selectAll("svg").remove();
  	 
  	 var ylabelsvg = d3.select("#yLabelDiv").append("svg")
              .attr("width", plotMarginTop)
              .attr("height", plotWidth)
              .append("g");
  

	 var ylabel = ylabelsvg.selectAll(".ylabel")
              	.data(matrix.nameY)
              	.enter().append("text")
                .text(function (d) { return d; })
                .attr("x", 150)
                .attr("y", function (d, i) { return (i+1) * (plotWidth*widthRatio);    })
                .style("text-anchor", "end")
                .attr("class", "ylabel plotlabel")
                .style("fill",labelColor);
              
  
	});
	
	
}





















function showLabel(i,matrixlength,hide)
{
	
	var y = Math.floor(i / matrixlength);
	var x = i % matrixlength;
	
	var c = labelHighLightColor;
	var s = "12px";
	if(hide)
	{
		c = labelColor;
		s = "7px";
	}
	
	//d3.selectAll(".xlabel").filter(":nth-child("+(x+1)+")").style("fill",c);
	//d3.selectAll(".ylabel").filter(":nth-child("+(y+1)+")").style("fill",c);
	
	d3.selectAll(".xlabel").filter(":nth-child("+(x+1)+")").style({"fill":c,"font-size":s});
	d3.selectAll(".ylabel").filter(":nth-child("+(y+1)+")").style({"fill":c,"font-size":s});
	
}






function blockClick()
{
	
	//alert("1");
	//d3.selectAll(".xlabel").filter(":nth-child(3)").style("fill","red");
	
	
	
	//d3.selectAll(".xlabel").style("fill","red");
	
	
	//d3.selectAll(".xlabel").each(function(d, i) {
    //    				alert("--------"+i);
   	//				 });
	
}



function checkFilterOutValue(value)
{
	//if (value > -0.1 && value < 0.1 )
	if (value > 0.5)
		return true;
	else
		return false;
}



function getColorD3(value)
{

	if(value == -2)
		value = 0;
	
	if(checkFilterOutValue(value))   //if (value > -0.1 && value < 0.1 )
		return "hsl(0,0%,93%)";

	//var r=d3.scale.linear().domain([-2,2]).range([10,360]);
	var r=d3.scale.linear().domain([0,0.5]).range([10,360]);
	
	return "hsl("+ r(value) +",100%,50%)"	;
	
}





function initBackButtom()
{
	
	
	
	
	$("#returnB").click(function() {
			
			
			//alert(currentZoom);
			
			if(currentZoom == "z1")
			{
				$("#defPlot").fadeIn(400);
				$("#zoomPlot").fadeOut(400);
				preblock = 0;
				
				$("#zoomPlotD3").html("");
				$("#xLabelDiv").html("");
				$("#yLabelDiv").html("");
				
				$("#returnB").hide();
			}
			else if(currentZoom == "z2")
			{
				$("#defPlot").hide();
				$("#zoomPlot").fadeIn(400);
				$("#zoomPlotD3").hide();
			
				$("#zoomPlotD3").html("");
				$("#xLabelDiv").html("");
				$("#yLabelDiv").html("");
				
				
				
				currentZoom = "z1";
				
			}
			
			
	});
	
	
	//alert("aa");
		//$("#returnB").click(function() {
			//alert("bb");
			
			
			
		//});
		
}





































































































/*
d3.csv("data.csv", function(d) {
  return {
    v: d.v
  };
}, function(error, data) {
  
  
  var svg = d3.select("#mplot").append("svg")
              .attr("width", 500)
              .attr("height", 500)
              .append("g");
  
  
   var heatMap = svg.selectAll("rect")
              .data(data)
              .enter().append("rect")
              .attr("x", function(d,i) { return i * 100; })
              .attr("y", function(d,i) { return i * 100; })
              .attr("rx", 0)
              .attr("ry", 0)
              .attr("class", "rectblock")
              .attr("width", function(d) { return Math.abs(d.v) * 1000; } )
              .attr("height", function(d) { return Math.abs(d.v) * 1000; } )
              .style("fill", "red");
  
  
});
*/

function d3graph()
{


d3.json("datasmall.json", function(matrix) {
	
	var blocksize = 5;
	var blockmargin = 2;
    var matrixlength = 2096;
    var yindex = -1;
    var xindex = -1;
    var out = 0;

	var svg = d3.select("#mplot").append("svg")
              .attr("width", 9000)
              .attr("height", 1000)
              .append("g");
  
    
	var plot = svg.selectAll("rect")
	          .data(matrix.m)
              .enter().append("rect")
              .attr("x", function(d,i) { 
              	                            //var c = d3.scale.category10().domain(d3.range(10));
              	                            //alert(c(-0.043)+"-----"+c(0.044));
              								//var color = d3.scale.quantile().range(d3.range(9));
              								//alert(color(0)+"------"+color(9)+"-------"+color(10));
              								//alert(d3.range(9)+"-----"+color);
              								
              								//c = d3.scale.category10().domain(d3.range(50));
              								// alert(c(1)+c(11));
              								
              								
              								
              	
              								if(i%matrixlength == 0)
              	                            {	
              	                            	xindex = xindex +1;
              	                            	out = (xindex)*(blocksize+blockmargin);
              	                            	xindex = -1;
              	                            }
              	                            else
              	                            {
              	                            	out = (i%matrixlength)*(blocksize+blockmargin);
              	                            }
              	
              								return out;
              							})
              							
              .attr("y", function(d,i) {  
              								if(i%matrixlength == 0)  
              									yindex = yindex + 1;
              								return (yindex)*(blocksize+blockmargin);
              							
              						   })
              .attr("rx", 0)
              .attr("ry", 0)
              .attr("class", "rectblock")
              .attr("width", function(d) { return blocksize; } )
              .attr("height", function(d) { return blocksize; } )
              .style("fill", function(d){return getColor(d);});
  






	
  
  
});




}






function getColor(value)
{
	
	var r=d3.scale.linear().domain([-1,1]).range([0,360]);
	//alert(r(-0.043859856)+"------"+r(-0.044055638));
	
	//alert(r(value));
	return "hsl(" + r(value) + ",100%,80%)";
	 //-1 to 1
	 //var r = Math.floor(Math.random() * (360 - 2 + 1)) + 2;
	 //return "hsl(" + Math.random() * 360 + ",100%,80%)";
	
}






function showZoomPlotD3(x,y,level)
{
	
	$("#zoomPlot").hide();
	$("#zoomPlotD3").show();



	if(zoomEnd && level=="z2")
	{	
		return;
	}
	else if(level=="z2")
	{
		zoomEnd = true;
		row_blocks = 4;
		
		if(preblock.bx-1 == row_blocks || preblock.by-1 == row_blocks)
		{
			row_blocks = 5;
		}	
		
		
	}
	else
	{
		row_blocks = 5;
	}



	var bsize = plotWidth / row_blocks;
	var bx=-1;
	var by=-1;

	for(var i=1;i<=row_blocks;i++)
	{	//alert(i);
		
		if(bx != -1 && by !=-1)
			break;
		
		var xx = plotPosition.left +  bsize*i ;
		var yy = plotPosition.top  +  bsize*i ;
		
		//alert(plotPosition.top+"***"+plotMarginTop+"***"+row_blocks+"***"+y+"***"+yy+"***"+by);
		
		if( x <= xx && bx==-1 )
		{ 
		  bx=i;
		}
		
		
		if( y <= yy && by==-1 )
		{ 
		  by=i;
		}
		
	}
	
	
	
	//alert("Y:"+by);
	

	var b = row_blocks;
	var blockNum = 0;
	if(!zoomEnd)
	{
		
		blockNum = (preblock*row_blocks*row_blocks)+(((by - 1)* row_blocks + bx)-1);
		preblock = {"bn":blockNum, "by":by, "bx":bx};
	}
	else
	{
		//alert("aaaaaa");
		//alert("prebX:"+preblock.bx +"----rowb:"+ row_blocks);
		
		
		if(row_blocks == 5)//if(preblock.bx-1 == row_blocks)
		{
			b = row_blocks;
			alert("It's END - B:"+b);
			
			
			var numRows = (preblock.by-1) * b;
			var currentNumRows = numRows + (by-1);
			//alert("by:"+by+"-----"+numRows+"==="+currentNumRows);
		
			var numB = (preblock.bx-1) * (b-1);
			var currentNumB = numB + (bx-1) ;
			//alert(preblock.bx+"===="+numB+"==="+currentNumB);
		
			var totalblocks = currentNumRows * 22;//row_blocks * row_blocks;
			var a = totalblocks + currentNumB;
			//alert(totalblocks+"-----"+a);
		
			blockNum = a;
			
			//alert("bn:"+a);
			//alert("D3----rb:"+row_blocks+"------by:"+by+"-----bx:"+bx+"-----preby:"+preblock.by+","+preblock.bx+"-----bNum:"+blockNum+"-------A:"+a+"----b:"+b);
			
			
			
		}
		else
		{
			var numRows = (preblock.by-1) * row_blocks;
			var currentNumRows = numRows + (by-1);
			//alert("preBY:"+preblock.by+"-----by:"+by+"-----"+numRows+"==="+currentNumRows);
		
			var numB = (preblock.bx-1) * b;
			var currentNumB = numB + (bx-1);
			//alert(numB+"==="+currentNumB);
		
			var totalblocks = currentNumRows * 22;//currentNumRows * row_blocks * row_blocks;
			var a = totalblocks + currentNumB;
			//alert(totalblocks+"-----"+a);
		
			blockNum = a;
		}
		//blockNum = row_blocks * preblock.bx * (preblock.by-1) +   ((by-1) * 25 + bx-1 + (preblock.bx-1)*5  )         ;                     
	}

	
	//alert("D3----rb:"+row_blocks+"------by:"+by+"-----bx:"+bx+"-----preby:"+preblock.by+","+preblock.bx+"-----bNum:"+blockNum+"-------A:"+a+"----b:"+b);
	
	
	//alert("D3-BN:"+blockNum);


















	
	
	d3.json("json/"+blockNum+".json", function(matrix) {
	
	
	var blockmargin = 1;
    var matrixlength = 100;
    var blocksize = (plotWidth-matrixlength*blockmargin) / matrixlength; //5;
    
    
    var yindex = -1;
    var xindex = -1;
    var out = 0;

	var svg = d3.select("#zoomPlotD3").append("svg")
              .attr("width", plotWidth)
              .attr("height", plotWidth)
              .append("g");
  
    
	var plot = svg.selectAll("rect")
	          .data(matrix.m)
              .enter().append("rect")
              .attr("x", function(d,i) { 				
              								if(i%matrixlength == 0)
              	                            {	
              	                            	xindex = xindex +1;
              	                            	out = (xindex)*(blocksize+blockmargin);
              	                            	xindex = -1;
              	                            }
              	                            else
              	                            {
              	                            	out = (i%matrixlength)*(blocksize+blockmargin);
              	                            }
              	
              								return out;
              							})
              							
              .attr("y", function(d,i) {  
              								if(i%matrixlength == 0)  
              									yindex = yindex + 1;
              								return (yindex)*(blocksize+blockmargin);
              							
              						   })
              .attr("rx", 0)
              .attr("ry", 0)
              .attr("class", "rectblock")
              .attr("width", function(d) { return blocksize; } )
              .attr("height", function(d) { return blocksize; } )
              .style("fill", function(d){return getColorD3(d);})
              
              .on('click', function(d,i) {
              	
              	
              	alert("A");
              	kkk();
              	
              	
              	
              })
              .on('mouseover', function(d,i) {
              	
              	
              	
              		d3.select(this).style({"stroke":"red","stroke-width":6,"stroke-opacity":0.6});
              	
              	
              	 //d3.select(this).style('fill', 'red');
              	 //d3.select(this).attr("width", function(d) { return blocksize*5.5; } );
              	 //d3.select(this).attr("height", function(d) { return blocksize*5.5; } );
              	d3.select(this).moveToFront();
              	
              })
              
              .on('mouseout', function(d,i) {
              	
              	d3.select(this).style({"stroke-width":0,"stroke-opacity":0});
              	//d3.select(this).attr("width", function(d) { return blocksize; } );
              	//d3.select(this).attr("height", function(d) { return blocksize; } );
              
              	
              })
              
              
              
              
              
              ;
              
              
              
              
              
 
  
  
  
  	var xlabelsvg = d3.select("#xLabelDiv").append("svg")
              .attr("width", plotWidth+1500)
              .attr("height", plotMarginTop)
              .append("g");
  

	var xlabel = xlabelsvg.selectAll(".xlabel")
              	.data(matrix.nameX)
              	.enter().append("text")
                .text(function (d) { return d; })
                .attr("x", function (d, i) { return i * 15; })
                .attr("y", 80)
                .style("text-anchor", "start")
                .attr("class", "xlabel plotlabel")
                .style("fill","#777")
                .attr("transform", function (d, i) { return "rotate(-45,"+ (i*15) +",80)"  ; }    );
                
                
                //.attr("transform", "translate(-6," + 5 / 1.5 + ")");



  
	});
	
	
}








function showZoomPlotOLD(x,y,level)
{
	
	if(zoomEnd && level=="z2")
		return;
	else if(level=="z2")
		zoomEnd = true;
	
	
	var imgsize = zoomLevel[level].imgsize;//25000;
	var slicesize = zoomLevel[level].slicesize;//1000;
	var row_blocks = imgsize/slicesize; 
	
	//alert(row_blocks);
	row_blocks = 5;

	var bsize = plotWidth / row_blocks;
	
	
	var bx=-1;
	var by=-1;
	
	for(var i=1;i<=row_blocks;i++)
	{	
		
		if(bx != -1 && by !=-1)
			break;
		
		var xx = plotPosition.left +  bsize*i ;
		var yy = plotPosition.top + plotMarginTop +  bsize*i ;
		
		
		if( x <= xx && bx==-1 )
		{ 
		  bx=i;
		}
		
		
		if( y <= yy && by==-1 )
		{ 
		  by=i;
		}
		
	}
	
	//var blockNum = ((by - 1)* row_blocks + bx)-1;
	
	var blockNum = 0;
	if(!zoomEnd)
	{
		
		blockNum = (preblock*row_blocks*row_blocks)+(((by - 1)* row_blocks + bx)-1);
		preblock = {"bn":blockNum, "by":by, "bx":bx};
	}
	else
	{
		var numRows = (preblock.by-1) * 5;
		var currentNumRows = numRows + (by-1);
		//alert("by:"+by+"-----"+numRows+"==="+currentNumRows);
		
		var numB = (preblock.bx-1) * 5;
		var currentNumB = numB + (bx-1);
		//alert(numB+"==="+currentNumB);
		
		var totalblocks = currentNumRows * row_blocks * row_blocks;
		var a = totalblocks + currentNumB;
		//alert(totalblocks+"-----"+a);
		
		blockNum = a;
		
		//blockNum = row_blocks * preblock.bx * (preblock.by-1) +   ((by-1) * 25 + bx-1 + (preblock.bx-1)*5  )         ;                     
	}

	
	//alert("rb:"+row_blocks+"------by:"+by+"-----bx:"+bx+"-----preby:"+preblock.by+","+preblock.bx+"-----bNum:"+blockNum+"-------A:"+a);
	
	
	
	
	
	
	
	
	
	
	$("#defPlot").fadeOut(400);
	$("#zoomPlot").fadeIn(400);
	//$("#zoomPlot").css("background-image","url('img/slices/p1000-"+blockNum+".png')");
	$("#zoomPlot").css("background-image","url('"+zoomLevel[level].filepath+blockNum+".png')");
	
}





