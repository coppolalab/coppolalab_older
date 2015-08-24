var w = 800,
    h = 600;
    
var defaultStrokeWidth = 1.5;

var path = "/gclabapps/nb/";
//var path ="/nb/";

var selectedSymbolName="";
var selectedColor = "#cccccc";
var projectId="0";
var sizeDatas = {};

$( document ).ready(function() {
  initWindowSize();
  initGraph();
  initProjectId();
  initModelGraph();
  initKnob();
  initNodeinfoWindowSize();
  initNodeinfoWindowOpenButton();
  initNodeinfoWindowCloseButton();
  //initAboutB();
  initSearchB();
});

function getPlotDataPath() {
	//for testing use
	//return "/nb/getNetworkPlotData";
	//return "/nb/getNetworkPlotDataDan";
	return path + "getNetworkPlotData";
	//return path + "getNetworkPlotDataDan";
	
	//for public use
	//return "/gclabapps/nb/getNetworkPlotData";
	//return "/gclabapps/nb/getNetworkPlotDataDan";
}

function initGraph() {
  modelvis = d3.select("#modelChart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .attr("pointer-events", "all")
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", zoomHandler))
    .append('svg:g');
/*
vis = d3.select("#geneChart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)//;
    .attr("pointer-events", "all")
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", zoomHandler))
    .append('svg:g');	
*/	
}

function initd3() {
	document.getElementById("geneChart").innerHTML="";
	
	vis = d3.select("#geneChart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)//;
    .attr("pointer-events", "all")
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", zoomHandler))
    .append('svg:g');
  

	vis.append('svg:rect')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', 'none');
}
  
function zoomHandler() {
	//if (d3.event.sourceEvent.type=='mousewheel' || d3.event.sourceEvent.type=='DOMMouseScroll')
	//{
  		vis.attr("transform",
      			 "translate(" + d3.event.translate + ")"
      			 + " scale(" + d3.event.scale*1.2 + ")");
    //}
}  

function initProjectId() {
  var pathArray = window.location.search.split( '=' );
  projectId = pathArray[1];
  if (projectId === "Yang_HD_STR;ver") {
	specialText();
  }
}

function specialText() {
	$("#credit").before('<h3>Network Plot from <b style="color: black">"N17 Modifies Mutant Huntingtin Nuclear Pathogenesis and Severity of Disease in HD BAC Transgenic Mice"</b> (Gu et al., Neuron 85 , 2015). <br/>Raw data is available in <a target="_blank" href="http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE64386">GEO</a>. Additional Information about this and other HD studies from the X. William Yang lab can be found on our <a target="_blank" href="http://yanglab.npih.ucla.edu">website</a>.</h3>');
	$("#searchB").before("<div id='aboutB'></div>");
	initAboutB();
}

function initWindowSize() {
	w = $(window).width()-20;
	h = $(window).height()-40;
}

function initKnob() {
	$(".dial").knob({
		"fgColor":"#56E0F0",
		"min":1,
		"max":500,
		"angleArc":250,
		"angleOffset":-125,
		"width":250,
		"release" : function (v) { knobSymbolRedraw(v); } 
		});	
}

function initModelGraph() {
	document.getElementById("modelChart").style.display = "block"; 
	document.getElementById("geneChart").style.display = "none"; 
    //document.getElementById("controlPanelDiv").style.display = "none"; 
	
	//var moduleDataPath = "/fb/getNetworkPlotModuleData?id="+projectId;
	var moduleDataPath = getPlotDataPath()+"?num=9999;model=symbol;symbol=module;id="+projectId;
    
	
	//d3.json("data/sub_network_modules.json", function(json) {
		
	d3.json(moduleDataPath, function(json) {
    var force = self.force = d3.layout.force()
        .nodes(json.nodes)
        .links(json.links)
        //.gravity(.05)
        //.distance(390)
        .distance(300)
        .linkStrength(0.05)
        //.charge(-100)
        .charge(-300)
        .size([w, h])
        .start();

    var link = modelvis.selectAll("line.link")
        .data(json.links)
        .enter().append("svg:line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .style("stroke",function(d) {return "#ccc";/*return getModelEdgeColor(d.source.name,d.target.name);*/ });

    var node = modelvis.selectAll("g.node")
        .data(json.nodes)
      	.enter().append("svg:g")
        .attr("class", "node")
        .call(force.drag);

	node.append("svg:circle")
     .attr("r", function(d) { return 15;/*getSize();*/ }  )
     .style("fill",  function(d) { return getColorByName(d.name); }  );
     // .style("fill",  function(d) { return "#56E0F0";/*getColorByName(d.name);*/ }  );
     //.style("fill",  function(d) { return getColor(); }  );

    node.append("svg:text")
        .attr("class", "nodetext")
        // .attr("dx", 12)
        .attr("dx", 15)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });
    
    node.on("mouseover", fade(0.05,true));
    	                              
    node.on("mouseout", function(){fade(0,false); } );	  
    
    node.on("click", function(d, i) {
    	var name = d.name;	
    	selectedSymbolName=name;
    	
    	selectedColor = getColorByName(name); 
    	
    	$("#modelname").html(selectedSymbolName);
    	
    	//var url = path + "getNodeSizeDan" +"?symbol="+selectedSymbolName+";id="+projectId; 
	    //$.getJSON(url,function(data){
                   // sizeDatas[selectedSymbolName] = data;
                    //if(name.indexOf("mi") == -1)
    			//	{	
    					document.getElementById("modelChart").style.display = "none"; 
    					document.getElementById("geneChart").style.display = "block"; 
    		
    					initd3();
    		
              var num = 100;
    					var file = getPlotDataPath()+"?num="+num+";model=symbol;symbol="+name+";id="+projectId;
    					initGneGraph(file);

						$( "#infoContainer" ).toggle( "slide",200 );
    				//}
                   
        //          }
		//);  
       	
    });
    
    link.on("click", function(d, i) {
    					var matchresult = matchLink(connectedLinks,d);
    				
    					if(matchresult) {
            			link.style("stroke-opacity", function(o) {
            		
            				if(o===d) {
                				link.attr("class", "link");
                				return 1;
                			}	
                			else
                			{
                				link.attr("class", "linkHighLightSingle");
                				return 0;
                			}
            			});
            		   }
        			}
    );
    
    link.on("contextmenu", function(data, index) {
     /*
        d3.event.preventDefault();
     
        link.style("stroke-opacity", function(o) {
            				if(o===data) { 
                				link.attr("class", "link");
                				
                				var sourceNodeName = o.source.name ;
                				var targetNodeName = o.target.name;
                				
                				document.getElementById("genecard_a").style.display = "none"; 
                				document.getElementById("brainspan_a").style.display = "none"; 
                				document.getElementById("cox_a").style.display = "none"; 
                				
                				document.getElementById("pubmid_a").setAttribute("href", "http://www.ncbi.nlm.nih.gov/pubmed?term="+"(" + sourceNodeName + ")" +"OR"+ "(" + targetNodeName + ")"  );
     	
     							document.getElementById("NGPopUp").style.left = "400px";
     							document.getElementById("NGPopUp").style.top = "300px";
     							document.getElementById("NGPopUp").style.display = "block";     	

     							cancelTimer();
                				return 1;
                			}	
                			else {
                				link.attr("class", "linkHighLightSingle");
                				return 0;
                			}
            			});
     */
	});
	
  var linkedByIndex = {};

  json.links.forEach(function(d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });

	function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }
    
    var selectedNodeName = "";
    //var connectedNodes = [];
    //var connectedLinks = [];

	function fade(opacity,linkHighLight) {
        return function(d) {
            node.style("stroke-opacity", function(o) {
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('fill-opacity', thisOpacity);
                return thisOpacity;
            });
            
			selectedNodeName = d.name;
            //connectedNodes = [];

      link.style("stroke-opacity", function(o) {
          //link.attr("class", "linkRed");
          
          if(linkHighLight) {
            //alert(o.value); 
            link.attr("class", "linkHighLight");
          }
          else {
            link.attr("class", "link");
          }
          
          if(o.source === d || o.target === d) {	
          /*
            if(o.source === d)
              connectedNodes.push(o.target.name);
            else
              connectedNodes.push(o.source.name);
            
            connectedLinks.push(o);
            */
            return 1;
          }
          else {
            return opacity;
          }
      });
      
      link.style("stroke", function(d) {
         // if(o.source === d || o.target === d)
         // {	
         // 	if(o.value < 0)
         // 		return "#F99";
         // 	else
         // 		return "#aaa";
         // }
         // else
         // {
            return "#aaa";
            //return getModelEdgeColor(d.source.name,d.target.name); 
          //}
      });            
            
           // var s="";
            //for(var i=0; i<connectedNodes.length;i++)
            //{
            //	s = s + connectedNodes[i]+"<br/>";
            //}
            
            //document.getElementById("infoPanel").innerHTML = s;
        };
    }

	node.on("contextmenu", function(data, index) {
		//alert("R:"+data.name);
        /*
     	d3.event.preventDefault();
        showAllLinkField();
     	
     	document.getElementById("genecard_a").setAttribute("href", "http://www.genecards.org/cgi-bin/carddisp.pl?gene="+data.name);
     	document.getElementById("brainspan_a").setAttribute("href", "http://www.brainspan.org/rnaseq/search?type=rnaseq&query="+data.name);
     	document.getElementById("pubmid_a").setAttribute("href", "http://www.ncbi.nlm.nih.gov/pubmed?term="+data.name);
     	document.getElementById("cox_a").setAttribute("href", "http://coxpresdb.jp/cgi-bin/inkeyword.cgi?type=any&word="+data.name);
     	
     	document.getElementById("NGPopUp").style.left = (data.x+30)+"px";
     	document.getElementById("NGPopUp").style.top = data.y+"px";
     	document.getElementById("NGPopUp").style.display = "block";     	
     
     	cancelTimer();
     	*/
	});

	node.on("dblclick", function(d) {
    	d.x=400;
    	d.y=300;
    	d.px=400;
    	d.py=300;
    	force.start();
    
  });	 

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
});  
}

function initGneGraph(file) {
  //var file = "fb/getNetworkPlotData?num=300;model=symbol;symbol=paM1";

  d3.json(file, function(json) {
    var force = self.force = d3.layout.force()
        .nodes(json.nodes)
        .links(json.links)
        //.gravity(.005)
        //.distance(300)
        //.linkStrength(0.05)
        .charge(-300)
        .gravity(.05)
        .distance(100)
        .linkStrength(0.5)
        .size([w, h])
        .start();

    var link = vis.selectAll("line.link")
        .data(json.links)
        .enter().append("svg:line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    var node = vis.selectAll("g.node")
        .data(json.nodes)
      	.enter().append("svg:g")
        .attr("class", "node")
        .call(force.drag);
    //force.alpha(0.02);    
	/*
    node.append("svg:image")
        .attr("class", "circle")
        .attr("xlink:href", "https://d3nwyuy0nl342s.cloudfront.net/images/icons/public.png")
        .attr("x", "-8px")
        .attr("y", "-8px")
        .attr("width", "16px")
        .attr("height", "16px");*/

	node.append("svg:circle")
      //.attr("r", 15)
      .attr("r", function(d) { return 12;/*getSizeByNameSearch(d.name);*//*getSize();*/ }  )
      
      //.style("fill", "#1BE032"  );//.style("fill", function(d) { return color(d.group); }  );
     // .style("fill",  function(d) { return "#56E0F0";/*getASDColor(d.name);*//*return selectedColor;*//*return getColor();*/ }  );
     .style("fill",  function(d) { return selectedColor;}  );
      
     // .style("stroke", function(o) { return "#FAC0F2";  })
     // .style("stroke-width", function(d) { return getASDColor(d.name);  });

    node.append("svg:text")
        .attr("class", "nodetext")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });
    /*alert(d.name);*/
    
    node.on("click", fade(0.1,true)  );
    /*
    node.on("click", function(d){
    	
    	//alert("A");
    	
    	fade(0.1,true);
    
    });
    */
     
    link.on("click", function(d, i) {
    					//alert(connectedNodes);
    					//alert( d.source.name+"       "+d.target.name);
    					
    					//connectedNodes.push(selectedNodeName);
    					//var matchresult = matchNode(connectedNodes, d.source.name) && matchNode(connectedNodes, d.target.name);
    					var matchresult = matchLink(connectedLinks,d);
    					//connectedNodes.pop();
    					
    					if(matchresult) {
            			link.style("stroke-opacity", function(o) {
            				
            				//var matchresult = matchNode(connectedNodes, o.source.name) || matchNode(connectedNodes, o.target.name);
            				if(o===d) {
                				link.attr("class", "link");
                				return 1;
                			}	
                			else {
                				link.attr("class", "linkHighLightSingle");
                				return 0;
                			}
            			});
            		   }
        			}
    );
    
    link.on("mouseover", function(d,i) {
     	var matchresult = matchLink(connectedLinks,d);
    					
    	if(matchresult) {					
     		//alert(d.source.name+"     "+d.target.name);
     		
     		link.style("stroke-width", function(o) {
                if(o.source.name == d.source.name && o.target.name == d.target.name ) {
                	return "7px";
                }
                else {
                	return "1.5px";
                }
            });
     	}
     });
       
    link.on("contextmenu", function(data, index) {
        d3.event.preventDefault();
     
        link.style("stroke-opacity", function(o) {
            				if(o===data) { 
                				link.attr("class", "link");
                				
                				var sourceNodeName = o.source.name ;
                				var targetNodeName = o.target.name;
                				
                				document.getElementById("genecard_a").style.display = "none"; 
                				document.getElementById("brainspan_a").style.display = "none"; 
                				document.getElementById("cox_a").style.display = "none"; 
                				document.getElementById("stanford_a").style.display = "none"; 
                				
                				//document.getElementById("pubmid_a").setAttribute("href", "http://www.ncbi.nlm.nih.gov/pubmed?term="+"(" + sourceNodeName + ")" +"AND"+ "(" + targetNodeName + ")AND(brain)"  );
     							document.getElementById("pubmid_a").setAttribute("href", "http://www.ncbi.nlm.nih.gov/pubmed?term="+"(" + sourceNodeName + ")" +"AND"+ "(" + targetNodeName + ")"  );
     							
     							//document.getElementById("NGPopUp").style.left = "400px";
     							/*
     							document.getElementById("NGPopUp").style.top = "300px";
     							document.getElementById("NGPopUp").style.marginLeft = "50%";
     							document.getElementById("NGPopUp").style.marginRight = "50%";
     							*/
     							
     							document.getElementById("NGPopUp").style.top = mousePos.y + "px";
     							document.getElementById("NGPopUp").style.left = (mousePos.x+20) + "px";
     							
     							document.getElementById("NGPopUp").style.display = "block";     	

     							cancelTimer();
                				return 1;
                	}	
                	else {
                				link.attr("class", "linkHighLightSingle");
                				return 0;
                			}
            			});
	});
    /*
    node.on("mouseover", fade(0.1,true)
    							//link.attr("class", "link2");
    	                              );
    	                              
    node.on("mouseout", function(){fade(0,false); setTimer("NGPopUp");}
    							//link.attr("class", "link");
    	                              );	  
    */	                                                          
	
	var linkedByIndex = {};
    json.links.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

	function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }
    
    var selectedNodeName = "";
    var connectedNodes = [];
    var connectedLinks = [];

	function fade(opacity,linkHighLight) {
        return function(d) {
            node.style("stroke-opacity", function(o) {
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('fill-opacity', thisOpacity);
                return thisOpacity;
            });
            
			selectedNodeName = d.name;
      connectedNodes = [];
      connectedNodes.push(selectedNodeName);

      link.style("stroke-opacity", function(o) {
          //link.attr("class", "linkRed");
        if(linkHighLight) {
          link.attr("class", "linkHighLight");
        }
        else {
          link.attr("class", "link");
        }
        
        if(o.source === d || o.target === d) {
          if(o.source === d) {	
            connectedNodes.push(o.target.name);
            //  alert("t:"+o.target.name);
          }
          else {	
            connectedNodes.push(o.source.name);
            //  alert("s:"+o.source.name);
          }
          
          connectedLinks.push(o);
          
          return 1;
        }
        else {
          return opacity;
        }
        //return o.source === d || o.target === d ? 1 : opacity;
    });
            /*
            link.style("stroke-width", function(o) {
               
                if(o.source === d || o.target === d)
                {
                	return "7px";
                }
                else
                {
                	return "1.5px";
                }
               
            });
            */
            
            //var s="";
    connectedNodes = connectedNodes.getUnique();
    setNodeInfoList(connectedNodes);
            //for(var i=0; i<connectedNodes.length;i++)
            //{   
            //	s = s + connectedNodes[i]+"\n";
            //}
            //document.getElementById("infoPanel").innerHTML = s;
            //document.getElementById("infoPanel").value = s;
        };
    }

	node.on("contextmenu", function(data, index) {
		//alert("R:"+data.name);
     	d3.event.preventDefault();
     	//alert(mousePos.x+"-----"+mousePos.y);
    
      showAllLinkField();
     	
     	document.getElementById("genecard_a").setAttribute("href", "http://www.genecards.org/cgi-bin/carddisp.pl?gene="+data.name);
     	document.getElementById("brainspan_a").setAttribute("href", "http://www.brainspan.org/rnaseq/search?type=rnaseq&query="+data.name);
     	document.getElementById("pubmid_a").setAttribute("href", "http://www.ncbi.nlm.nih.gov/pubmed?term="+data.name);
     	document.getElementById("cox_a").setAttribute("href", "http://coxpresdb.jp/cgi-bin/inkeyword.cgi?type=any&word="+data.name);
     	document.getElementById("stanford_a").setAttribute("href", "http://web.stanford.edu/group/barres_lab/cgi-bin/igv_cgi_2.py?lname="+data.name);
     	
     	//document.getElementById("NGPopUp").style.left = (data.x+300)+"px";
     	/*
     	document.getElementById("NGPopUp").style.top = data.y+"px";
     	document.getElementById("NGPopUp").style.marginLeft = "50%";
     	document.getElementById("NGPopUp").style.marginRight = "50%";
     	*/
     	
     	
     	document.getElementById("NGPopUp").style.top = mousePos.y + "px";
     	document.getElementById("NGPopUp").style.left = (mousePos.x+20) + "px";
    	
     	document.getElementById("NGPopUp").style.display = "block";     	
     	
     	//var item = document.getElementById("button");
		//item.addEventListener("mouseover", func, false);
		//item.addEventListener("mouseout", func1, false);

     	cancelTimer();
	});

	node.on("dblclick", function(d) {
    	//node.attr("transform", function(d) { return "translate(" + 300 + "," + 300 + ")"; });
    	
    	d.x=400;
    	d.y=300;
    	d.px=400;
    	d.py=300;
    	force.start();
    	//force.tick();
    							//alert("C");
    							
    							//node.forEach(function(n) {
    /*if (n.source && node.target) {
      node.type = node.source.type = "target-source";
      node.target.type = "source-target";
    } else if (node.source) {
      node.type = node.source.type = "source";
    } else if (node.target) {
      node.type = node.target.type = "target";
    } else {
      node.connectors = [{node: node}];
      node.type = "source";
    }*/
  //});
    							/*
    							if (d.children) 
    							{
    								d._children = d.children;
    								d.children = null;
  								} 
  								else 
  								{
    								d.children = d._children;
    								d._children = null;
  								}
  								update();
  									*/
    });	 

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
});  

}

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

var timeout	= 300;
var closetimer	= 0;

function cancelTimer() {
	if(closetimer) {
		window.clearTimeout(closetimer);
		closetimer = null;
	}
}

function setTimer(itemToClose) {
	closetimer = window.setTimeout( function(){document.getElementById(itemToClose).style.display = "none";  } , timeout);
}

var colorIndex = 0;
function getColor() {
	var a = ["#F73E88","#F74581","#F745F1","#9773FA","#7375FA","#73A7FA","#73EAFA","#4EF5CE","#45E670","#96E60E","#E6D40E","#E67A0E"];
	
	var c = a[colorIndex];
	
	colorIndex = colorIndex+1;
	if(colorIndex >= a.length)
		colorIndex=0;
	
	return c;
}

function getColorByName(name) {
/*
blue	2
brown	3
cyan	4
grey60	8
lightcyan	9
magenta	11
purple	13
red	14
salmon	15
tan	16
turquoise	17
yellow	18
*/
	
	var o = {
				"m2":"#0000FF",	
				"m3":"#A52A2A",
				"m4":"#00FFFF",
				"m8":"#808080",
				"m9":"#E0FFFF",
				"m11":"#FF00FF",
				"m13":"#800080",
				"m14":"#FF0000",
				"m15":"#FA8072",
				"m16":"#D2B48C",
				"m17":"#40E0D0",
				"m18":"#FFFF00"
			};

  name = name.toLowerCase();

	/* if(o.hasOwnProperty(name)) {
		return o[name];	
	}
	else
	  return "#cccccc";
   */
  name = name.replace(/\d+/g, '');
  
  return name;
}

var sizeIndex = 0;
function getSize() {
	var a = [4,6,8,10,12,14,16];
	
	var c = a[sizeIndex];

	sizeIndex = sizeIndex+1;
	if(sizeIndex >= a.length)
		sizeIndex=0;
	
	return c;
}

/*
function getSizeByName(name) {   
	if(sizeDatas.hasOwnProperty(selectedSymbolName)) {
	}
	else {
	    var url = path + "getNodeSizeDan" +"?symbol="+selectedSymbolName+";id="+projectId; 
	
	    $.getJSON(url,function(data){
                  sizeDatas[selectedSymbolName] = data;
                  }
		);     
	}
}
*/

function getSizeByNameSearch(name) {
	if(sizeDatas.hasOwnProperty(selectedSymbolName)) {
		if( typeof sizeDatas[selectedSymbolName][name] == 'undefined'  )
		  return 8;
	
		var n = sizeDatas[selectedSymbolName][name].s * 10;
		var n1 = n % 10;
		var n2 = n + Math.round(sizeDatas[selectedSymbolName][name].s*5)  ;
	
		//var n2 = n1/5 * (n-3);  
		//alert(n2);
		
		return n2;
	}
	else {
		return 8;
	}
}

function showAllLinkField() {
	document.getElementById("genecard_a").style.display = "block"; 
  	document.getElementById("brainspan_a").style.display = "block"; 
  	document.getElementById("pubmid_a").style.display = "block"; 
 	document.getElementById("cox_a").style.display = "block"; 
 	document.getElementById("stanford_a").style.display = "block"; 
}

function resetModelSelection() {
	//alert();
	//vis.selectAll("line").attr("class", "link");
	modelvis.selectAll("line").style("stroke-opacity",0.1);
	modelvis.selectAll("line").style("stroke-width",1.5);
	modelvis.selectAll(".node").style("fill-opacity",1);
}

function resetSelection() {
	//alert();
	//vis.selectAll("line").attr("class", "link");
	vis.selectAll("line").style("stroke-opacity",0.1);
	vis.selectAll("line").style("stroke-width",1.5);
	vis.selectAll(".node").style("fill-opacity",1);
}

function showModules() {
	//document.getElementById("modelReswetButton").style.display = "block"; 
	document.getElementById("modelChart").style.display = "block"; 
	document.getElementById("geneChart").style.display = "none"; 
	
	$( "#infoContainer" ).toggle( "slide",200 );//.hide();
	
	$("#modelname").html("");
	
    //document.getElementById("controlPanelDiv").style.display = "none"; 
    //document.getElementById("sliderDiv").style.display = "none"; 
	//document.getElementById("symbolNameLabel").style.display = "none"; 
    //document.getElementById("symbolNameLabel").innerHTML = ""; 
}
/*
function matchNode(nodelist,node) {
	var result = false;
	for(var i=0; i< nodelist.length; i++) {
		if(nodelist[i] == node) {
		 	result = true;
		 	alert(nodelist+"     N:"+node);
		 	
		 	break;
		}
	}
	return result;
}
*/
function matchLink(connectedLinks,d) {
	var result = false;
	for(var i=0; i< connectedLinks.length; i++) {
		
		if(connectedLinks[i].source.name == d.source.name  &&  connectedLinks[i].target.name == d.target.name) {
			//alert(connectedLinks[i].source.name+"    "+connectedLinks[i].target.name);
		 	result = true;
		 	//alert(nodelist+"     N:"+node);	
		 	break;
		}
	}
	return result;
}

function initSlider() {
// Create a YUI instance and request the slider module and its dependencies
YUI().use("slider", function (Y) {

	var xInput,  // input tied to xSlider
    	yInput,  // input tied to ySlider
    	xSlider; // horizontal Slider

	// Function to pass input value back to the Slider
	function updateSlider( e ) {
    	var data   = this.getData(),
        	slider = data.slider,
        	value  = parseInt( this.get( "value" ), 10 );

    	if ( data.wait ) 
    	{
        	data.wait.cancel();
    	}

    	// Update the Slider on a delay to allow time for typing
    	data.wait = Y.later( 200, slider, function () {
        	data.wait = null;
        	this.set( "value", value );
    	} );
	}

	// Function to update the input value from the Slider value
	function updateInput( e ) {
    	this.set( "value", e.newVal );
    	//alert("g");
	}

	// Link the input value to the Slider
	xInput = Y.one( "#horiz_value" );
	xInput.setData( "slider", new Y.Slider({
            axis: 'x',
            min   : 0,      // min is the value at the top
            max   : 1225,     // max is the value at the bottom
            value : 100,       // initial value
            length: '500px',  // rail extended to afford all values

            // construction-time event subscription
            after : {
                valueChange: Y.bind( updateInput, xInput )
            }
        }).render( ".horiz_slider" ) // render returns the Slider
    )                               // set( "data", ... ) returns the Node
    .on( "keyup", updateSlider );  

	// Pass the input as the 'this' object inside updateInput
	//xSlider.after( "valueChange", updateInput, xInput );
	//xInput.on( "keyup", updateSlider );
    
	// Render the Slider next to the input
	//xSlider.render('.horiz_slider');
});
} 

function initJQSlider() {
	 $(function() {
	$( "#jqslider" ).slider({ min: 0,
		                      max: 1000,
		                      value: 100,
		                      slide: function( event, ui ) {

 										$("#horiz_value").val(ui.value);
		                      		  }   
		                   });
	});
}

function knobSymbolRedraw(v) {
	initd3();         
    var file = getPlotDataPath()+"?num="+v+";model=symbol;symbol="+selectedSymbolName+";id="+projectId;
    initGneGraph(file);
}

function symbolRedraw() {
	//alert(selectedSymbolName);
	initd3();         
	//initGneGraph( "data/visant_symbol_" + "paM1" + ".json");
	
	var num = document.getElementById("horiz_value").value;
    		
    var file = getPlotDataPath()+"?num="+num+";model=symbol;symbol="+selectedSymbolName+";id="+projectId;
    initGneGraph(file);

}

var mousePos;
window.onmousemove = handleMouseMove;

function handleMouseMove(event) {
        event = event || window.event; 
        mousePos = {
            x: event.clientX,
            y: event.clientY
        };
    }

function initNodeinfoWindowSize() {
	var s = 0;
	if((h-500) > 550)
       s=550;
    else
       s=h-500;   	  
	
	$("#nodeinfo").css("height", s + "px");
	$("#infowin").css("height", s + "px");
}

function setNodeInfoList(connectedNodes) {
	var s="";
	
	for(var i=0; i<connectedNodes.length;i++) {   
		//alert(sizeDatas[selectedSymbolName][connectedNodes[i]].n);
		//s = s +"<div class='nitem' n='"+  sizeDatas[selectedSymbolName][connectedNodes[i]].n  +"'>" + "<span class='nname'>" + connectedNodes[i] + "</span>" + "<div class='iiconsdiv'><div class='info_icon'></div><div class='figure_icon'></div></div></div>";
	
	    s = s +"<div class='nitem'>" + "<span class='nname'>" + connectedNodes[i] + "</span>" + "</div>";
	}

	$("#nodeinfo").html(s);
	
	//$(".nitem").click(function() {
			//alert( $(this).attr("n") );
		//	setInfoWin($(this).attr("n"));
	//});
	
	$( ".nitem" ).hover(
		function() {
		//	$(this).children(".iiconsdiv").fadeIn();
		   // $(this).find(".iiconsdiv").fadeIn();
			$(this).addClass("nitem_hover");
		}, 
		function() {
		//	$(this).children(".iiconsdiv").hide();
		   // $(this).find(".iiconsdiv").hide();
			$(this).removeClass("nitem_hover");
		}
	);
	
	/*
	$(".info_icon").click(function() {
			
			setInfoWin($(this).parent().parent().attr("n"));
	});
	*/
	/*
	$(".figure_icon").click(function() {
			window.open( path + "nodeimage/Network/home/webuser/webappgclab/upload/dan/nodeimage/" +$(this).parent().parent().attr("n")+".jpeg");
	
	});
	*/
}

function setInfoWin(genename) {
	var url = path + "getNodeInfoPage" +"?id="+genename; 
	
	$.get(url,function(data){
       //alert(data);
       $("#infowin").html("<div id='ibackb'>&lsaquo;&lsaquo;</div>" + data);
	
				$( "#nodeinfo" ).hide( );
				$( "#infowin" ).toggle( "slide",200 );
				$( "#ibackb" ).click(function() {
			
					$( "#infowin" ).hide();
			
					$( "#nodeinfo" ).show( );
				});
       }
	);    
}

function initNodeinfoWindowOpenButton() {
	$("#infoContainerExpandBut").click(function() {
	 $( "#infoContainer" ).toggle( "slide",200 );
	 $("#infoContainerExpandBut").hide();
	}); 	
}

function initNodeinfoWindowCloseButton() {
	$("#hidebar").click(function() {
	 $( "#infoContainer" ).toggle( "slide",200 );
	 $("#infoContainerExpandBut").show();
	}); 
}

function getModelEdgeColor(mA,mB) {
	var a = [
	           [1,	0.66,	-0.81,	-0.44,	-0.1,	0.26,	-0.76,	0.39,	-0.56,	-0.46,	-0.64,	-0.63],
	           [0.66,	1,	-0.42,	-0.2,	0.44,	0.23,	-0.78,	0.81,	-0.65,	-0.57,	-0.96,	-0.56],
	           [-0.81,	-0.42,	1,	0.0067,	0.44,	-0.42,	0.73,	-0.08,	0.3,	0.65,	0.46,	0.32],
	           [-0.44,	-0.2,	0.0067,	1,	-0.27,	0.5,	0.17,	-0.31,	0.41,	-0.4,	0.058,	0.59],
	           [-0.1,	0.44,	0.44,	-0.27,	1,	-0.11,	-0.22,	0.79,	-0.32,	0.087,	-0.31,	-0.34],
	           [0.26,	0.23,	-0.42,	0.5,	-0.11,	1,	-0.42,	0.14,	-0.084,	-0.62,	-0.28,	0.0014],
	           [-0.76,	-0.78,	0.73,	0.17,	-0.22,	-0.42,	1,	-0.66,	0.44,	0.68,	0.73,	0.55],
	           [0.39,	0.81,	-0.08,	-0.31,	0.79,	0.14,	-0.66,	1,	-0.59,	-0.35,	-0.71,	-0.6],
	           [-0.56,	-0.65,	0.3,	0.41,	-0.32,	-0.084,	0.44,	-0.59,	1,	0.35,	0.52,	0.62],
	           [-0.46,	-0.57,	0.65,	-0.4,	0.087,	-0.62,	0.68,	-0.35,	0.35,	1,	0.67,	0.16],
	           [-0.64,	-0.96,	0.46,	0.058,	-0.31,	-0.28,	0.73,	-0.71,	0.52,	0.67,	1,	0.46],
	           [-0.63,	-0.56,	0.32,	0.59,	-0.34,	0.0014,	0.55,	-0.6,	0.62,	0.16,	0.46,	1]
			];
	
	var mlist = {"2":0,	"3":1,	"4":2,	"8":3,	"9":4,	"11":5,	"13":6,	"14":7, "15":8, "16":9, "17":10, "18":11};
	
	var mA = mA.replace("M","");
	var mB = mB.replace("M","");
	
	var iA = mlist[mA];
	var iB = mlist[mB];
	
	if(a[iA][iB]>0)
	  return "#F777BB"; 
	else
	  return "#0FCCF2";
}

function getASDColor(name) {
	var a = {"ARX":"","NCAPD2":"","PTBP1":"","VIM":"","POLQ":"","HMG20B":"","SRBD1":"","TEAD2":"","RFX2":"","ASAP3":"","FCGBP":"","CDC45":"","MCM4":"","H2AFV":"","MPDZ":"","PDLIM1":"","PTK7":"","HDAC1":"","TTF2":"","CNN3":"","PHF19":"","HSDL2":"","SORBS3":"","KIF18A":"","CAT":"","STIL":"","SDF2L1":"","TROAP":"","BRCA2":"","BNIP2":"","CMTM3":"","SLC16A3":"","RNPEPL1":"","IQGAP2":"","MKI67":"","MSI2":"","WASF2":"","TAGLN2":"","FBXO8":"","FABP5":"","ACAA2":"","BMP1":"","DAG1":"","CTDSP2":"","OPLAH":"","PTTG1IP":"","IQGAP3":"","HIST2H2AC":"","TMEM216":"","PLCD1":"","HIST1H1C":"","SVIL":"","ECI2":"","PNP":"","GPR56":"","CLIC1":"","RHBDD2":"","DNAH9":"","CAMK1G":"","ADAM22":"","ROS1":"","PTPRN":"","NPFFR2":"","ERLEC1":"","PTPN3":"","SNCB":"","IPCEF1":"","RIMS1":"","CADPS2":"","TESC":"","RAPGEF4":"","PITPNM3":"","SLC22A17":"","SYNGR1":"","CACNA1F":"","SYP":"","NDRG4":"","NOMO1":"","SYT17":"","CTSH":"","SLC17A7":"","TMEM59L":"","SCN1B":"","DNM1":"","KANK1":"","B9D1":"","CNTNAP1":"","DUSP3":"","GABRA4":"","CDH9":"","GABRG2":"","FHL2":"","EPAS1":"","KIF17":"","B4GALT6":"","CASC1":"","PPL":"","SRGN":"","KCNS1":"","SLC12A5":"","NAPB":"","SULT4A1":"","GFAP":"","ATP6V1E1":"","EFR3A":"","POPDC3":"","XAF1":"","MYH11":"","MICAL2":"","GLS2":"","RAB11FIP5":"","ENPP2":"","HADHB":"","ZNF365":"","STAT4":"","VAMP1":"","C1ORF222":"","SCN1A":"","UNC80":"","IQSEC1":"","C10ORF116":"","ITPR1":"","TDO2":"","TCTEX1D1":"","ADPRHL1":"","THY1":"","GRAMD3":"","NPTN":"","STEAP2":"","CABP1":"","VSNL1":"","ATP1A1":"","SCRG1":"","OXR1":"","GPR146":"","TPP1":"","IDH3A":"","TMEM130":"","SPRYD3":"","BSCL2":"","CPLX1":"","CDK5R2":"","CYP4F11":"","RCAN2":"","THEMIS":"","RAB37":"","C1QTNF1":"","PCSK1":"","RIMS2":"","CTNNA3":"","GRIN2A":"","TSPYL2":"","CEND1":"","METTL7A":"","SV2B":"","KCNIP4":"","MKL2":"","GABRD":"","FHIT":"","TPK1":"","ANXA6":"","SLC6A17":"","OGDHL":"","ST7":"","WDR54":"","CUL3":"","RPL18":"","NFYC":"","GSTP1":"","THOC5":"","ZMAT5":"","RPS19":"","DSE":"","CCNG1":"","SET":"","CPSF3L":"","EIF3G":"","TRAF7":"","NXT1":"","C20ORF111":"","RPS15A":"","RPS6":"","RPLP1":"","LRRC49":"","SEC11A":"","RPS2":"","RPL10":"","EIF4A1":"","DDB1":"","GPS1":"","CHD2":"","RPS27":"","PACS2":"","RPL14":"","NACA":"","SND1":"","ISY1":"","MGST1":"","KAL1":"","TYMP":"","TRAF3IP2":"","IFI35":"","ZC3HAV1":"","IFIH1":"","BST2":"","LGALS3":"","VAV3":"","FAM189A2":"","AGT":"","SP110":"","SLCO1C1":"","ALDH1L1":"","SLC39A12":"","EN2":"","ANGPTL4":"","TAP1":"","RAB31":"","AQP4":"","PARP14":"","IFITM1":"","CYP4F3":"","MT1X":"","MT1M":"","HLA-A":"","IRF9":"","MFRP":"","MTMR7":"","AGK":"","NUDCD3":"","ATP6V0A1":"","MYO16":"","SNAP91":"","NGEF":"","CACNB1":"","ATP2B3":"","LNX1":"","NSF":"","DLG3":"","SMAP2":"","EPB41L1":"","DDX24":"","ACOT7":"","EEF1A2":"","USP11":"","AP3B2":"","RAB2A":"","MTMR9":"","GPI":"","CLIP3":"","SLC1A1":"","FBXW7":"","MADD":"","ENO2":"","CAP2":"","GLS":"","ELOVL4":"","KLC1":"","NDFIP1":"","DLG4":"","SUCLA2":"","SCN2A":"","STXBP1":"","FAM8A1":"","ABI2":"","BBS7":"","UBR3":"","FAM134A":"","ATP6V1B2":"","PAK1":"","DLG2":"","EIF4E":"","RAB6B":"","RAB39B":"","HK1":"","SV2A":"","ATP13A2":"","AP2M1":"","SHANK2":"","CNST":"","BTRC":"","NDEL1":"","SCG5":"","OTUB1":"","LDB2":"","PRKCE":"","CLSTN1":"","C2CD2L":"","SEZ6L2":"","C12ORF68":"","PER1":"","NRXN1":"","ANKRD34A":"","RGS7":"","INPP5J":"","PARK2":"","CYP4X1":"","NKRF":"","ATL1":"","SLC9A6":"","SCAMP5":"","MAGEE1":"","DCTN1":"","PCDHA13":"","PI4KA":"","ABHD14A":"","ICA1":"","CYB561":"","ZMYND11":"","CDH10":"","CAMK2B":"","ST3GAL6":"","PFKP":"","ATP8B1":"","ACHE":"","KIAA0284":"","SGSM3":"","MCF2":"","ZC3H12B":"","FGF9":"","NCALD":"","PIK3CG":"","STX1A":"","EPHB6":"","GLIS3":"","USP46":"","HTATIP2":"","GALNTL4":"","PRMT8":"","SLC29A1":"","FOXP1":"","DNAJC27":"","SLC25A12":"","RAB7L1":"","APOL3":"","UNC13A":"","CALY":"","CYP2E1":"","SESN2":"","SYNE1":"","ACP2":"","DTNA":"","ACRV1":"","HTR1B":"","AGAP2":"","KIAA0513":"","PCDH10":"","RAB15":"","ATP1B1":"","EPHX1":"","ZNF385B":"","CNTN4":"","ANK2":"","NLGN4X":"","SNTG1":"","EBAG9":"","DOC2A":"","CACNA1C":"","NR3C2":"","INPP1":"","PTPRK":"","ABI3BP":"","ABCA5":"","FMN2":"","MAPK13":"","ATP2B2":"","C9ORF91":"","TPRG1L":"","NPM2":"","PPAPDC3":"","PTCHD1":"","SLITRK5":"","LRFN5":"","IGFBP6":"","CHRM1":"","FRMPD4":"","NPAS2":"","ABCG4":"","SNAPC5":"","PELI3":"","BAIAP2":"","LPCAT4":"","SCN4B":"","PGBD5":"","CAMK1D":"","CSMD1":"","FAM174B":"","C11ORF87":"","PION":"","EFCAB6":"","PTPRT":"","GRM7":"","CPNE4":"","ASB13":"","LAMB3":"","GYPE":"","DLGAP2":"","CHSY3":"","ITSN2":"","GPRASP1":"","VAMP2":"","CKMT1B":"","GPR162":"","SLC7A2":"","MPO":"","SLC6A13":"","EHD2":"","ZIC2":"","LAMC3":"","TNFRSF1A":"","TGFBR3":"","CYBRD1":"","MCAM":"","FXYD5":"","LAMB1":"","PLTP":"","MYL12A":"","TIMP1":"","EHD4":"","FCGRT":"","PLEKHA4":"","PCOLCE":"","ECM2":"","SLC6A4":"","CPZ":"","SLC15A3":"","COL12A1":"","TBX18":"","SEMA5A":"","PLSCR4":"","FN1":"","VAMP8":"","RDH10":"","CDKN1A":"","C3":"","RRAS":"","ZFP36":"","PODXL":"","CD68":"","RHBDF2":"","RARRES3":"","EMP1":"","HEY2":"","GNS":"","TMBIM1":"","TLN1":"","LRRC32":"","MYOF":"","IFITM3":"","EMP3":"","MOB3C":"","RBMS3":"","LPP":"","ATP10D":"","ADD3":"","SERPING1":"","ADAM33":"","GJA1":"","MR1":"","DAB2":"","ADAMTS1":"","SLC7A7":"","COLEC12":"","SHC1":"","ITGA5":"","CXCL16":"","DHRS3":"","DDR2":"","DISC1":"","TGFBR2":"","FBN1":"","B2M":"","RAB3IL1":"","SDC2":"","ADORA2B":"","CD14":"","TMEM51":"","LAMB2":"","MMRN2":"","ANO6":"","ZNF366":"","CDH5":"","NQO1":"","FAM89A":"","BGN":"","ANXA2":"","SRPR":"","OAF":"","PROS1":"","IFITM2":"","COL4A1":"","S100A16":"","ADA":"","LRP10":"","S100A10":"","TGM2":"","PSMB8":"","CEBPD":"","MLL5":"","BAZ1B":"","TRIO":"","MLL3":"","ARHGEF10L":"","ZNF638":"","CTTNBP2":"","SRCAP":"","BCORL1":"","ZNF213":"","CNOT3":"","DEPDC5":"","ZMYND8":"","ADNP":"","CORO2A":"","SMC3":"","RAI1":"","SLC38A1":"","KIAA0240":"","CNOT6":"","BIRC6":"","MLL":"","PHF3":"","MED13L":"","MYBBP1A":"","KDM6B":"","ARHGEF11":"","EPHB2":"","KRBA1":"","MEN1":"","UGGT1":"","RTF1":"","MBD1":"","LMTK3":"","POGZ":"","FLG":"","PPRC1":"","CABLES2":"","SETBP1":"","PITPNC1":"","WDR4":"","VPS39":"","KIAA1586":"","CHD3":"","TANC2":"","TSNARE1":"","DLK2":"","JMJD1C":"","CSRP2":"","MLXIP":"","UBE2O":"","ZBTB41":"","GPR139":"","ZNF594":"","SETD2":"","EP400":"","ZNF445":"","MTF1":"","TRRAP":"","PCDHB16":"","SLC25A29":"","ZNF860":"","TOPORS":"","SPTAN1":"","PHF2":"","ZNF311":"","TOP1":"","MBD5":"","TSSK2":"","ZNF585B":"","ITGB3":"","DVL2":"","SLC25A39":"","ARID1B":"","SEC61A1":"","DDX20":"","ANKS1A":"","GNAI3":"","NUP133":"","TCF3":"","IKBKG":"","GTF3C1":"","CAD":"","UIMC1":"","GCN1L1":"","RBM27":"","SUPT16H":"","EIF2C1":"","POLRMT":"","CRKL":"","DGCR14":"","SMCHD1":"","AXIN1":"","TSC2":"","HNRNPUL1":"","PLEKHA8":"","TRDMT1":"","AATF":"","ZNF451":"","CISH":"","MSH6":"","ALMS1":"","APH1A":"","STK11":"","RPN2":"","IRF2BPL":"","DNMT3A":"","BCL11A":"","GNA13":"","ZMYM2":"","XPO5":"","CNOT1":"","KIAA0182":"","CDK4":"","DHX9":"","ACTL6A":"","TBR1":"","FAM129B":"","LRRC1":"","TET1":"","SMARCC2":"","DCAF5":"","USP3":"","XPR1":"","MCL1":"","METTL14":"","PPIP5K2":"","TLK2":"","MCPH1":"","FEZF2":"","AUTS2":"","PPP1R15B":"","KIAA1967":"","NFIA":"","VANGL2":"","GATAD2A":"","AC011498.1":"","C2CD3":"","SF1":"","RFWD3":"","HNRNPF":"","PWWP2A":"","PPM1D":"","TSEN34":"","TNKS":"","SMARCC1":"","RUVBL1":"","SCRIB":"","EHMT1":"","CADM1":"","DCC":"","ZNF292":"","ZKSCAN5":"","ZNF813":"","DLL1":"","DCAF12":"","AP2S1":"","MAP4":"","NCKAP1":"","PKM2":"","SDHA":"","MAPK1":"","C14ORF129":"","DCAF11":"","CD99L2":"","CYB5B":"","STUB1":"","BCL7B":"","SOD2":"","ACTR1B":"","PPP1R7":"","SCP2":"","KLHDC3":"","PIN1":"","DNAJB9":"","GRSF1":"","YARS":"","SLC39A3":"","TAGLN3":"","SAR1B":"","PRDX3":"","FAM91A1":"","AK2":"","LTBP1":"","CSDA":"","NOTCH3":"","TTC38":"","FAT1":"","TRIP6":"","ITGA6":"","TBL1X":"","HSPB1":"","PLOD3":"","RAB34":"","ATP6V0E1":"","MAPKAPK3":"","CHST3":"","SOX9":"","PALLD":"","YAP1":"","TMX1":"","MSN":"","ITGB1":"","TCF7L1":"","PLOD2":"","NECAP2":"","FSTL1":"","ANXA5":"","GPR98":"","CDCA7L":"","SLC4A2":"","IKBIP":"","FAM111A":"","ANTXR1":"","EMX2":"","GNG5":"","YES1":"","OXTR":"","SOX2":"","SPATA13":"","ZFP36L1":"","FLNA":"","SLC2A10":"","GNAS":"","AARSD1":"","GORASP2":"","TM4SF19":"","TRAPPC9":"","PAFAH1B2":"","GAK":"","HEATR8":"","THAP7":"","GPX1":""};

    if(a.hasOwnProperty(name)) { 
    	if(selectedColor=="#FF0000")
    	  return "#FAC0F2";
    	else
    	 return "#FF0000";//"#FAC0F2";//"3px";//
    }
    else {  
    	  return selectedColor;//"0px";//
    } 
}

function initAboutB() {
	$("#aboutB").click(function() {
	 // $( "#aboutContainer" ).toggle( "slide", { direction: "right" },200 );
	 $( "#aboutContainer" ).toggle();
	}); 
}

function initSearchB() {
	$("#searchB").click(function() {
	 $( "#searchContainer" ).toggle( "slide", { direction: "right" },200 );
	 $("#searchtext").focus();
	}); 
	
	$("#searchtext").keyup(function(event){
    if(event.keyCode == 13){
        nodeSearch();
    }
    });
}

//String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};

function nodeSearch() {
	//alert($("#searchtext").val());
	
	var key = $("#searchtext").val();
	
	var e = null;
	if($("#modelChart").is(":visible")) {
		e = $("#modelChart");
	}
	else {
		e = $("#geneChart");
	}
	
	d3.selectAll(".node").each(function( d,i ) {
	    d3.select(this).select("circle").classed("nodeFound",false);
	    
	    var text = d3.select(this).select("text").text();
	    
	    if(text.toLowerCase() == key.toLowerCase()) {
			//$(this).find("circle").addClass("nodeFound"); 
			 d3.select(this).select("circle").classed("nodeFound",true);
			
		}
	   // alert(d3.select(this).select("text").text());
	});
	
	/*
	$(e).find(".node").each(function( index ) {
		
		$(this).find("circle").removeClass("nodeFound");
		
		if($(this).find("text").html().toString().toLowerCase() == key.toLowerCase().toString()) {
			$(this).find("circle").addClass("nodeFound"); 
		}
	});
	*/
}

/* http://keith-wood.name/svg.html
   SVG for jQuery v1.4.5.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2007.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict
/* SVG manager.
   Use the singleton instance of this class, $.svg, 
   to interact with the SVG functionality. */
function SVGManager() {
	this._settings = []; // Settings to be remembered per SVG object
	this._extensions = []; // List of SVG extensions added to SVGWrapper
		// for each entry [0] is extension name, [1] is extension class (function)
		// the function takes one parameter - the SVGWrapper instance
	this.regional = []; // Localisations, indexed by language, '' for default (English)
	this.regional[''] = {errorLoadingText: 'Error loading',
		notSupportedText: 'This browser does not support SVG'};
	this.local = this.regional['']; // Current localisation
	this._uuid = new Date().getTime();
	this._renesis = detectActiveX('RenesisX.RenesisCtrl');
}

/* Determine whether a given ActiveX control is available.
   @param  classId  (string) the ID for the ActiveX control
   @return  (boolean) true if found, false if not */
function detectActiveX(classId) {
	try {
		return !!(window.ActiveXObject && new ActiveXObject(classId));
	}
	catch (e) {
		return false;
	}
}

var PROP_NAME = 'svgwrapper';

$.extend(SVGManager.prototype, {
	/* Class name added to elements to indicate already configured with SVG. */
	markerClassName: 'hasSVG',

	/* SVG namespace. */
	svgNS: 'http://www.w3.org/2000/svg',
	/* XLink namespace. */
	xlinkNS: 'http://www.w3.org/1999/xlink',

	/* SVG wrapper class. */
	_wrapperClass: SVGWrapper,

	/* Camel-case versions of attribute names containing dashes or are reserved words. */
	_attrNames: {class_: 'class', in_: 'in',
		alignmentBaseline: 'alignment-baseline', baselineShift: 'baseline-shift',
		clipPath: 'clip-path', clipRule: 'clip-rule',
		colorInterpolation: 'color-interpolation',
		colorInterpolationFilters: 'color-interpolation-filters',
		colorRendering: 'color-rendering', dominantBaseline: 'dominant-baseline',
		enableBackground: 'enable-background', fillOpacity: 'fill-opacity',
		fillRule: 'fill-rule', floodColor: 'flood-color',
		floodOpacity: 'flood-opacity', fontFamily: 'font-family',
		fontSize: 'font-size', fontSizeAdjust: 'font-size-adjust',
		fontStretch: 'font-stretch', fontStyle: 'font-style',
		fontVariant: 'font-variant', fontWeight: 'font-weight',
		glyphOrientationHorizontal: 'glyph-orientation-horizontal',
		glyphOrientationVertical: 'glyph-orientation-vertical',
		horizAdvX: 'horiz-adv-x', horizOriginX: 'horiz-origin-x',
		imageRendering: 'image-rendering', letterSpacing: 'letter-spacing',
		lightingColor: 'lighting-color', markerEnd: 'marker-end',
		markerMid: 'marker-mid', markerStart: 'marker-start',
		stopColor: 'stop-color', stopOpacity: 'stop-opacity',
		strikethroughPosition: 'strikethrough-position',
		strikethroughThickness: 'strikethrough-thickness',
		strokeDashArray: 'stroke-dasharray', strokeDashOffset: 'stroke-dashoffset',
		strokeLineCap: 'stroke-linecap', strokeLineJoin: 'stroke-linejoin',
		strokeMiterLimit: 'stroke-miterlimit', strokeOpacity: 'stroke-opacity',
		strokeWidth: 'stroke-width', textAnchor: 'text-anchor',
		textDecoration: 'text-decoration', textRendering: 'text-rendering',
		underlinePosition: 'underline-position', underlineThickness: 'underline-thickness',
		vertAdvY: 'vert-adv-y', vertOriginY: 'vert-origin-y',
		wordSpacing: 'word-spacing', writingMode: 'writing-mode'},

	/* Add the SVG object to its container. */
	_attachSVG: function(container, settings) {
		var svg = (container.namespaceURI == this.svgNS ? container : null);
		var container = (svg ? null : container);
		if ($(container || svg).hasClass(this.markerClassName)) {
			return;
		}
		if (typeof settings == 'string') {
			settings = {loadURL: settings};
		}
		else if (typeof settings == 'function') {
			settings = {onLoad: settings};
		}
		$(container || svg).addClass(this.markerClassName);
		try {
			if (!svg) {
				svg = document.createElementNS(this.svgNS, 'svg');
				svg.setAttribute('version', '1.1');
				if (container.clientWidth > 0) {
					svg.setAttribute('width', container.clientWidth);
				}
				if (container.clientHeight > 0) {
					svg.setAttribute('height', container.clientHeight);
				}
				container.appendChild(svg);
			}
			this._afterLoad(container, svg, settings || {});
		}
		catch (e) {
			if ($.browser.msie) {
				if (!container.id) {
					container.id = 'svg' + (this._uuid++);
				}
				this._settings[container.id] = settings;
				container.innerHTML = '<embed type="image/svg+xml" width="100%" ' +
					'height="100%" src="' + (settings.initPath || '') + 'blank.svg" ' +
					'pluginspage="http://www.adobe.com/svg/viewer/install/main.html"/>';
			}
			else {
				container.innerHTML = '<p class="svg_error">' +
					this.local.notSupportedText + '</p>';
			}
		}
	},

	/* SVG callback after loading - register SVG root. */
	_registerSVG: function() {
		for (var i = 0; i < document.embeds.length; i++) { // Check all
			var container = document.embeds[i].parentNode;
			if (!$(container).hasClass($.svg.markerClassName) || // Not SVG
					$.data(container, PROP_NAME)) { // Already done
				continue;
			}
			var svg = null;
			try {
				svg = document.embeds[i].getSVGDocument();
			}
			catch(e) {
				setTimeout($.svg._registerSVG, 250); // Renesis takes longer to load
				return;
			}
			svg = (svg ? svg.documentElement : null);
			if (svg) {
				$.svg._afterLoad(container, svg);
			}
		}
	},

	/* Post-processing once loaded. */
	_afterLoad: function(container, svg, settings) {
		var settings = settings || this._settings[container.id];
		this._settings[container ? container.id : ''] = null;
		var wrapper = new this._wrapperClass(svg, container);
		$.data(container || svg, PROP_NAME, wrapper);
		try {
			if (settings.loadURL) { // Load URL
				wrapper.load(settings.loadURL, settings);
			}
			if (settings.settings) { // Additional settings
				wrapper.configure(settings.settings);
			}
			if (settings.onLoad && !settings.loadURL) { // Onload callback
				settings.onLoad.apply(container || svg, [wrapper]);
			}
		}
		catch (e) {
			alert(e);
		}
	},

	/* Return the SVG wrapper created for a given container.
	   @param  container  (string) selector for the container or
	                      (element) the container for the SVG object or
	                      jQuery collection - first entry is the container
	   @return  (SVGWrapper) the corresponding SVG wrapper element, or null if not attached */
	_getSVG: function(container) {
		container = (typeof container == 'string' ? $(container)[0] :
			(container.jquery ? container[0] : container));
		return $.data(container, PROP_NAME);
	},

	/* Remove the SVG functionality from a div.
	   @param  container  (element) the container for the SVG object */
	_destroySVG: function(container) {
		var $container = $(container);
		if (!$container.hasClass(this.markerClassName)) {
			return;
		}
		$container.removeClass(this.markerClassName);
		if (container.namespaceURI != this.svgNS) {
			$container.empty();
		}
		$.removeData(container, PROP_NAME);
	},

	/* Extend the SVGWrapper object with an embedded class.
	   The constructor function must take a single parameter that is
	   a reference to the owning SVG root object. This allows the 
	   extension to access the basic SVG functionality.
	   @param  name      (string) the name of the SVGWrapper attribute to access the new class
	   @param  extClass  (function) the extension class constructor */
	addExtension: function(name, extClass) {
		this._extensions.push([name, extClass]);
	},

	/* Does this node belong to SVG?
	   @param  node  (element) the node to be tested
	   @return  (boolean) true if an SVG node, false if not */
	isSVGElem: function(node) {
		return (node.nodeType == 1 && node.namespaceURI == $.svg.svgNS);
	}
});

/* The main SVG interface, which encapsulates the SVG element.
   Obtain a reference from $().svg('get') */
function SVGWrapper(svg, container) {
	this._svg = svg; // The SVG root node
	this._container = container; // The containing div
	for (var i = 0; i < $.svg._extensions.length; i++) {
		var extension = $.svg._extensions[i];
		this[extension[0]] = new extension[1](this);
	}
}

$.extend(SVGWrapper.prototype, {

	/* Retrieve the width of the SVG object. */
	_width: function() {
		return (this._container ? this._container.clientWidth : this._svg.width);
	},

	/* Retrieve the height of the SVG object. */
	_height: function() {
		return (this._container ? this._container.clientHeight : this._svg.height);
	},

	/* Retrieve the root SVG element.
	   @return  the top-level SVG element */
	root: function() {
		return this._svg;
	},

	/* Configure a SVG node.
	   @param  node      (element, optional) the node to configure
	   @param  settings  (object) additional settings for the root
	   @param  clear     (boolean) true to remove existing attributes first,
	                     false to add to what is already there (optional)
	   @return  (SVGWrapper) this root */
	configure: function(node, settings, clear) {
		if (!node.nodeName) {
			clear = settings;
			settings = node;
			node = this._svg;
		}
		if (clear) {
			for (var i = node.attributes.length - 1; i >= 0; i--) {
				var attr = node.attributes.item(i);
				if (!(attr.nodeName == 'onload' || attr.nodeName == 'version' || 
						attr.nodeName.substring(0, 5) == 'xmlns')) {
					node.attributes.removeNamedItem(attr.nodeName);
				}
			}
		}
		for (var attrName in settings) {
			node.setAttribute($.svg._attrNames[attrName] || attrName, settings[attrName]);
		}
		return this;
	},

	/* Locate a specific element in the SVG document.
	   @param  id  (string) the element's identifier
	   @return  (element) the element reference, or null if not found */
	getElementById: function(id) {
		return this._svg.ownerDocument.getElementById(id);
	},

	/* Change the attributes for a SVG node.
	   @param  element   (SVG element) the node to change
	   @param  settings  (object) the new settings
	   @return  (SVGWrapper) this root */
	change: function(element, settings) {
		if (element) {
			for (var name in settings) {
				if (settings[name] == null) {
					element.removeAttribute($.svg._attrNames[name] || name);
				}
				else {
					element.setAttribute($.svg._attrNames[name] || name, settings[name]);
				}
			}
		}
		return this;
	},

	/* Check for parent being absent and adjust arguments accordingly. */
	_args: function(values, names, optSettings) {
		names.splice(0, 0, 'parent');
		names.splice(names.length, 0, 'settings');
		var args = {};
		var offset = 0;
		if (values[0] != null && values[0].jquery) {
			values[0] = values[0][0];
		}
		if (values[0] != null && !(typeof values[0] == 'object' && values[0].nodeName)) {
			args['parent'] = null;
			offset = 1;
		}
		for (var i = 0; i < values.length; i++) {
			args[names[i + offset]] = values[i];
		}
		if (optSettings) {
			$.each(optSettings, function(i, value) {
				if (typeof args[value] == 'object') {
					args.settings = args[value];
					args[value] = null;
				}
			});
		}
		return args;
	},

	/* Add a title.
	   @param  parent    (element or jQuery) the parent node for the new title (optional)
	   @param  text      (string) the text of the title
	   @param  settings  (object) additional settings for the title (optional)
	   @return  (element) the new title node */
	title: function(parent, text, settings) {
		var args = this._args(arguments, ['text']);
		var node = this._makeNode(args.parent, 'title', args.settings || {});
		node.appendChild(this._svg.ownerDocument.createTextNode(args.text));
		return node;
	},

	/* Add a description.
	   @param  parent    (element or jQuery) the parent node for the new description (optional)
	   @param  text      (string) the text of the description
	   @param  settings  (object) additional settings for the description (optional)
	   @return  (element) the new description node */
	describe: function(parent, text, settings) {
		var args = this._args(arguments, ['text']);
		var node = this._makeNode(args.parent, 'desc', args.settings || {});
		node.appendChild(this._svg.ownerDocument.createTextNode(args.text));
		return node;
	},

	/* Add a definitions node.
	   @param  parent    (element or jQuery) the parent node for the new definitions (optional)
	   @param  id        (string) the ID of this definitions (optional)
	   @param  settings  (object) additional settings for the definitions (optional)
	   @return  (element) the new definitions node */
	defs: function(parent, id, settings) {
		var args = this._args(arguments, ['id'], ['id']);
		return this._makeNode(args.parent, 'defs', $.extend(
			(args.id ? {id: args.id} : {}), args.settings || {}));
	},

	/* Add a symbol definition.
	   @param  parent    (element or jQuery) the parent node for the new symbol (optional)
	   @param  id        (string) the ID of this symbol
	   @param  x1        (number) the left coordinate for this symbol
	   @param  y1        (number) the top coordinate for this symbol
	   @param  width     (number) the width of this symbol
	   @param  height    (number) the height of this symbol
	   @param  settings  (object) additional settings for the symbol (optional)
	   @return  (element) the new symbol node */
	symbol: function(parent, id, x1, y1, width, height, settings) {
		var args = this._args(arguments, ['id', 'x1', 'y1', 'width', 'height']);
		return this._makeNode(args.parent, 'symbol', $.extend({id: args.id,
			viewBox: args.x1 + ' ' + args.y1 + ' ' + args.width + ' ' + args.height},
			args.settings || {}));
	},

	/* Add a marker definition.
	   @param  parent    (element or jQuery) the parent node for the new marker (optional)
	   @param  id        (string) the ID of this marker
	   @param  refX      (number) the x-coordinate for the reference point
	   @param  refY      (number) the y-coordinate for the reference point
	   @param  mWidth    (number) the marker viewport width
	   @param  mHeight   (number) the marker viewport height
	   @param  orient    (string or int) 'auto' or angle (degrees) (optional)
	   @param  settings  (object) additional settings for the marker (optional)
	   @return  (element) the new marker node */
	marker: function(parent, id, refX, refY, mWidth, mHeight, orient, settings) {
		var args = this._args(arguments, ['id', 'refX', 'refY',
			'mWidth', 'mHeight', 'orient'], ['orient']);
		return this._makeNode(args.parent, 'marker', $.extend(
			{id: args.id, refX: args.refX, refY: args.refY, markerWidth: args.mWidth, 
			markerHeight: args.mHeight, orient: args.orient || 'auto'}, args.settings || {}));
	},

	/* Add a style node.
	   @param  parent    (element or jQuery) the parent node for the new node (optional)
	   @param  styles    (string) the CSS styles
	   @param  settings  (object) additional settings for the node (optional)
	   @return  (element) the new style node */
	style: function(parent, styles, settings) {
		var args = this._args(arguments, ['styles']);
		var node = this._makeNode(args.parent, 'style', $.extend(
			{type: 'text/css'}, args.settings || {}));
		node.appendChild(this._svg.ownerDocument.createTextNode(args.styles));
		if ($.browser.opera) {
			$('head').append('<style type="text/css">' + args.styles + '</style>');
		}
		return node;
	},

	/* Add a script node.
	   @param  parent    (element or jQuery) the parent node for the new node (optional)
	   @param  script    (string) the JavaScript code
	   @param  type      (string) the MIME type for the code (optional, default 'text/javascript')
	   @param  settings  (object) additional settings for the node (optional)
	   @return  (element) the new script node */
	script: function(parent, script, type, settings) {
		var args = this._args(arguments, ['script', 'type'], ['type']);
		var node = this._makeNode(args.parent, 'script', $.extend(
			{type: args.type || 'text/javascript'}, args.settings || {}));
		node.appendChild(this._svg.ownerDocument.createTextNode(args.script));
		if (!$.browser.mozilla) {
			$.globalEval(args.script);
		}
		return node;
	},

	/* Add a linear gradient definition.
	   Specify all of x1, y1, x2, y2 or none of them.
	   @param  parent    (element or jQuery) the parent node for the new gradient (optional)
	   @param  id        (string) the ID for this gradient
	   @param  stops     (string[][]) the gradient stops, each entry is
	                     [0] is offset (0.0-1.0 or 0%-100%), [1] is colour, 
						 [2] is opacity (optional)
	   @param  x1        (number) the x-coordinate of the gradient start (optional)
	   @param  y1        (number) the y-coordinate of the gradient start (optional)
	   @param  x2        (number) the x-coordinate of the gradient end (optional)
	   @param  y2        (number) the y-coordinate of the gradient end (optional)
	   @param  settings  (object) additional settings for the gradient (optional)
	   @return  (element) the new gradient node */
	linearGradient: function(parent, id, stops, x1, y1, x2, y2, settings) {
		var args = this._args(arguments,
			['id', 'stops', 'x1', 'y1', 'x2', 'y2'], ['x1']);
		var sets = $.extend({id: args.id}, 
			(args.x1 != null ? {x1: args.x1, y1: args.y1, x2: args.x2, y2: args.y2} : {}));
		return this._gradient(args.parent, 'linearGradient', 
			$.extend(sets, args.settings || {}), args.stops);
	},

	/* Add a radial gradient definition.
	   Specify all of cx, cy, r, fx, fy or none of them.
	   @param  parent    (element or jQuery) the parent node for the new gradient (optional)
	   @param  id        (string) the ID for this gradient
	   @param  stops     (string[][]) the gradient stops, each entry
	                     [0] is offset, [1] is colour, [2] is opacity (optional)
	   @param  cx        (number) the x-coordinate of the largest circle centre (optional)
	   @param  cy        (number) the y-coordinate of the largest circle centre (optional)
	   @param  r         (number) the radius of the largest circle (optional)
	   @param  fx        (number) the x-coordinate of the gradient focus (optional)
	   @param  fy        (number) the y-coordinate of the gradient focus (optional)
	   @param  settings  (object) additional settings for the gradient (optional)
	   @return  (element) the new gradient node */
	radialGradient: function(parent, id, stops, cx, cy, r, fx, fy, settings) {
		var args = this._args(arguments,
			['id', 'stops', 'cx', 'cy', 'r', 'fx', 'fy'], ['cx']);
		var sets = $.extend({id: args.id}, (args.cx != null ?
			{cx: args.cx, cy: args.cy, r: args.r, fx: args.fx, fy: args.fy} : {}));
		return this._gradient(args.parent, 'radialGradient', 
			$.extend(sets, args.settings || {}), args.stops);
	},

	/* Add a gradient node. */
	_gradient: function(parent, name, settings, stops) {
		var node = this._makeNode(parent, name, settings);
		for (var i = 0; i < stops.length; i++) {
			var stop = stops[i];
			this._makeNode(node, 'stop', $.extend(
				{offset: stop[0], stopColor: stop[1]}, 
				(stop[2] != null ? {stopOpacity: stop[2]} : {})));
		}
		return node;
	},

	/* Add a pattern definition.
	   Specify all of vx, vy, xwidth, vheight or none of them.
	   @param  parent    (element or jQuery) the parent node for the new pattern (optional)
	   @param  id        (string) the ID for this pattern
	   @param  x         (number) the x-coordinate for the left edge of the pattern
	   @param  y         (number) the y-coordinate for the top edge of the pattern
	   @param  width     (number) the width of the pattern
	   @param  height    (number) the height of the pattern
	   @param  vx        (number) the minimum x-coordinate for view box (optional)
	   @param  vy        (number) the minimum y-coordinate for the view box (optional)
	   @param  vwidth    (number) the width of the view box (optional)
	   @param  vheight   (number) the height of the view box (optional)
	   @param  settings  (object) additional settings for the pattern (optional)
	   @return  (element) the new pattern node */
	pattern: function(parent, id, x, y, width, height, vx, vy, vwidth, vheight, settings) {
		var args = this._args(arguments, ['id', 'x', 'y', 'width', 'height',
			'vx', 'vy', 'vwidth', 'vheight'], ['vx']);
		var sets = $.extend({id: args.id, x: args.x, y: args.y,
			width: args.width, height: args.height}, (args.vx != null ?
			{viewBox: args.vx + ' ' + args.vy + ' ' + args.vwidth + ' ' + args.vheight} : {}));
		return this._makeNode(args.parent, 'pattern', $.extend(sets, args.settings || {}));
	},

	/* Add a clip path definition.
	   @param  parent  (element) the parent node for the new element (optional)
	   @param  id      (string) the ID for this path
	   @param  units   (string) either 'userSpaceOnUse' (default) or 'objectBoundingBox' (optional)
	   @return  (element) the new clipPath node */
	clipPath: function(parent, id, units, settings) {
		var args = this._args(arguments, ['id', 'units']);
		args.units = args.units || 'userSpaceOnUse';
		return this._makeNode(args.parent, 'clipPath', $.extend(
			{id: args.id, clipPathUnits: args.units}, args.settings || {}));
	},

	/* Add a mask definition.
	   @param  parent    (element or jQuery) the parent node for the new mask (optional)
	   @param  id        (string) the ID for this mask
	   @param  x         (number) the x-coordinate for the left edge of the mask
	   @param  y         (number) the y-coordinate for the top edge of the mask
	   @param  width     (number) the width of the mask
	   @param  height    (number) the height of the mask
	   @param  settings  (object) additional settings for the mask (optional)
	   @return  (element) the new mask node */
	mask: function(parent, id, x, y, width, height, settings) {
		var args = this._args(arguments, ['id', 'x', 'y', 'width', 'height']);
		return this._makeNode(args.parent, 'mask', $.extend(
			{id: args.id, x: args.x, y: args.y, width: args.width, height: args.height},
			args.settings || {}));
	},

	/* Create a new path object.
	   @return  (SVGPath) a new path object */
	createPath: function() {
		return new SVGPath();
	},

	/* Create a new text object.
	   @return  (SVGText) a new text object */
	createText: function() {
		return new SVGText();
	},

	/* Add an embedded SVG element.
	   Specify all of vx, vy, vwidth, vheight or none of them.
	   @param  parent    (element or jQuery) the parent node for the new node (optional)
	   @param  x         (number) the x-coordinate for the left edge of the node
	   @param  y         (number) the y-coordinate for the top edge of the node
	   @param  width     (number) the width of the node
	   @param  height    (number) the height of the node
	   @param  vx        (number) the minimum x-coordinate for view box (optional)
	   @param  vy        (number) the minimum y-coordinate for the view box (optional)
	   @param  vwidth    (number) the width of the view box (optional)
	   @param  vheight   (number) the height of the view box (optional)
	   @param  settings  (object) additional settings for the node (optional)
	   @return  (element) the new node */
	svg: function(parent, x, y, width, height, vx, vy, vwidth, vheight, settings) {
		var args = this._args(arguments, ['x', 'y', 'width', 'height',
			'vx', 'vy', 'vwidth', 'vheight'], ['vx']);
		var sets = $.extend({x: args.x, y: args.y, width: args.width, height: args.height}, 
			(args.vx != null ? {viewBox: args.vx + ' ' + args.vy + ' ' +
			args.vwidth + ' ' + args.vheight} : {}));
		return this._makeNode(args.parent, 'svg', $.extend(sets, args.settings || {}));
	},

	/* Create a group.
	   @param  parent    (element or jQuery) the parent node for the new group (optional)
	   @param  id        (string) the ID of this group (optional)
	   @param  settings  (object) additional settings for the group (optional)
	   @return  (element) the new group node */
	group: function(parent, id, settings) {
		var args = this._args(arguments, ['id'], ['id']);
		return this._makeNode(args.parent, 'g', $.extend({id: args.id}, args.settings || {}));
	},

	/* Add a usage reference.
	   Specify all of x, y, width, height or none of them.
	   @param  parent    (element or jQuery) the parent node for the new node (optional)
	   @param  x         (number) the x-coordinate for the left edge of the node (optional)
	   @param  y         (number) the y-coordinate for the top edge of the node (optional)
	   @param  width     (number) the width of the node (optional)
	   @param  height    (number) the height of the node (optional)
	   @param  ref       (string) the ID of the definition node
	   @param  settings  (object) additional settings for the node (optional)
	   @return  (element) the new node */
	use: function(parent, x, y, width, height, ref, settings) {
		var args = this._args(arguments, ['x', 'y', 'width', 'height', 'ref']);
		if (typeof args.x == 'string') {
			args.ref = args.x;
			args.settings = args.y;
			args.x = args.y = args.width = args.height = null;
		}
		var node = this._makeNode(args.parent, 'use', $.extend(
			{x: args.x, y: args.y, width: args.width, height: args.height},
			args.settings || {}));
		node.setAttributeNS($.svg.xlinkNS, 'href', args.ref);
		return node;
	},

	/* Add a link, which applies to all child elements.
	   @param  parent    (element or jQuery) the parent node for the new link (optional)
	   @param  ref       (string) the target URL
	   @param  settings  (object) additional settings for the link (optional)
	   @return  (element) the new link node */
	link: function(parent, ref, settings) {
		var args = this._args(arguments, ['ref']);
		var node = this._makeNode(args.parent, 'a', args.settings);
		node.setAttributeNS($.svg.xlinkNS, 'href', args.ref);
		return node;
	},

	/* Add an image.
	   @param  parent    (element or jQuery) the parent node for the new image (optional)
	   @param  x         (number) the x-coordinate for the left edge of the image
	   @param  y         (number) the y-coordinate for the top edge of the image
	   @param  width     (number) the width of the image
	   @param  height    (number) the height of the image
	   @param  ref       (string) the path to the image
	   @param  settings  (object) additional settings for the image (optional)
	   @return  (element) the new image node */
	image: function(parent, x, y, width, height, ref, settings) {
		var args = this._args(arguments, ['x', 'y', 'width', 'height', 'ref']);
		var node = this._makeNode(args.parent, 'image', $.extend(
			{x: args.x, y: args.y, width: args.width, height: args.height},
			args.settings || {}));
		node.setAttributeNS($.svg.xlinkNS, 'href', args.ref);
		return node;
	},

	/* Draw a path.
	   @param  parent    (element or jQuery) the parent node for the new shape (optional)
	   @param  path      (string or SVGPath) the path to draw
	   @param  settings  (object) additional settings for the shape (optional)
	   @return  (element) the new shape node */
	path: function(parent, path, settings) {
		var args = this._args(arguments, ['path']);
		return this._makeNode(args.parent, 'path', $.extend(
			{d: (args.path.path ? args.path.path() : args.path)}, args.settings || {}));
	},

	/* Draw a rectangle.
	   Specify both of rx and ry or neither.
	   @param  parent    (element or jQuery) the parent node for the new shape (optional)
	   @param  x         (number) the x-coordinate for the left edge of the rectangle
	   @param  y         (number) the y-coordinate for the top edge of the rectangle
	   @param  width     (number) the width of the rectangle
	   @param  height    (number) the height of the rectangle
	   @param  rx        (number) the x-radius of the ellipse for the rounded corners (optional)
	   @param  ry        (number) the y-radius of the ellipse for the rounded corners (optional)
	   @param  settings  (object) additional settings for the shape (optional)
	   @return  (element) the new shape node */
	rect: function(parent, x, y, width, height, rx, ry, settings) {
		var args = this._args(arguments, ['x', 'y', 'width', 'height', 'rx', 'ry'], ['rx']);
		return this._makeNode(args.parent, 'rect', $.extend(
			{x: args.x, y: args.y, width: args.width, height: args.height},
			(args.rx ? {rx: args.rx, ry: args.ry} : {}), args.settings || {}));
	},

	/* Draw a circle.
	   @param  parent    (element or jQuery) the parent node for the new shape (optional)
	   @param  cx        (number) the x-coordinate for the centre of the circle
	   @param  cy        (number) the y-coordinate for the centre of the circle
	   @param  r         (number) the radius of the circle
	   @param  settings  (object) additional settings for the shape (optional)
	   @return  (element) the new shape node */
	circle: function(parent, cx, cy, r, settings) {
		var args = this._args(arguments, ['cx', 'cy', 'r']);
		return this._makeNode(args.parent, 'circle', $.extend(
			{cx: args.cx, cy: args.cy, r: args.r}, args.settings || {}));
	},

	/* Draw an ellipse.
	   @param  parent    (element or jQuery) the parent node for the new shape (optional)
	   @param  cx        (number) the x-coordinate for the centre of the ellipse
	   @param  cy        (number) the y-coordinate for the centre of the ellipse
	   @param  rx        (number) the x-radius of the ellipse
	   @param  ry        (number) the y-radius of the ellipse
	   @param  settings  (object) additional settings for the shape (optional)
	   @return  (element) the new shape node */
	ellipse: function(parent, cx, cy, rx, ry, settings) {
		var args = this._args(arguments, ['cx', 'cy', 'rx', 'ry']);
		return this._makeNode(args.parent, 'ellipse', $.extend(
			{cx: args.cx, cy: args.cy, rx: args.rx, ry: args.ry}, args.settings || {}));
	},

	/* Draw a line.
	   @param  parent    (element or jQuery) the parent node for the new shape (optional)
	   @param  x1        (number) the x-coordinate for the start of the line
	   @param  y1        (number) the y-coordinate for the start of the line
	   @param  x2        (number) the x-coordinate for the end of the line
	   @param  y2        (number) the y-coordinate for the end of the line
	   @param  settings  (object) additional settings for the shape (optional)
	   @return  (element) the new shape node */
	line: function(parent, x1, y1, x2, y2, settings) {
		var args = this._args(arguments, ['x1', 'y1', 'x2', 'y2']);
		return this._makeNode(args.parent, 'line', $.extend(
			{x1: args.x1, y1: args.y1, x2: args.x2, y2: args.y2}, args.settings || {}));
	},

	/* Draw a polygonal line.
	   @param  parent    (element or jQuery) the parent node for the new shape (optional)
	   @param  points    (number[][]) the x-/y-coordinates for the points on the line
	   @param  settings  (object) additional settings for the shape (optional)
	   @return  (element) the new shape node */
	polyline: function(parent, points, settings) {
		var args = this._args(arguments, ['points']);
		return this._poly(args.parent, 'polyline', args.points, args.settings);
	},

	/* Draw a polygonal shape.
	   @param  parent    (element or jQuery) the parent node for the new shape (optional)
	   @param  points    (number[][]) the x-/y-coordinates for the points on the shape
	   @param  settings  (object) additional settings for the shape (optional)
	   @return  (element) the new shape node */
	polygon: function(parent, points, settings) {
		var args = this._args(arguments, ['points']);
		return this._poly(args.parent, 'polygon', args.points, args.settings);
	},

	/* Draw a polygonal line or shape. */
	_poly: function(parent, name, points, settings) {
		var ps = '';
		for (var i = 0; i < points.length; i++) {
			ps += points[i].join() + ' ';
		}
		return this._makeNode(parent, name, $.extend(
			{points: $.trim(ps)}, settings || {}));
	},

	/* Draw text.
	   Specify both of x and y or neither of them.
	   @param  parent    (element or jQuery) the parent node for the text (optional)
	   @param  x         (number or number[]) the x-coordinate(s) for the text (optional)
	   @param  y         (number or number[]) the y-coordinate(s) for the text (optional)
	   @param  value     (string) the text content or
	                     (SVGText) text with spans and references
	   @param  settings  (object) additional settings for the text (optional)
	   @return  (element) the new text node */
	text: function(parent, x, y, value, settings) {
		var args = this._args(arguments, ['x', 'y', 'value']);
		if (typeof args.x == 'string' && arguments.length < 4) {
			args.value = args.x;
			args.settings = args.y;
			args.x = args.y = null;
		}
		return this._text(args.parent, 'text', args.value, $.extend(
			{x: (args.x && isArray(args.x) ? args.x.join(' ') : args.x),
			y: (args.y && isArray(args.y) ? args.y.join(' ') : args.y)}, 
			args.settings || {}));
	},

	/* Draw text along a path.
	   @param  parent    (element or jQuery) the parent node for the text (optional)
	   @param  path      (string) the ID of the path
	   @param  value     (string) the text content or
	                     (SVGText) text with spans and references
	   @param  settings  (object) additional settings for the text (optional)
	   @return  (element) the new text node */
	textpath: function(parent, path, value, settings) {
		var args = this._args(arguments, ['path', 'value']);
		var node = this._text(args.parent, 'textPath', args.value, args.settings || {});
		node.setAttributeNS($.svg.xlinkNS, 'href', args.path);
		return node;
	},

	/* Draw text. */
	_text: function(parent, name, value, settings) {
		var node = this._makeNode(parent, name, settings);
		if (typeof value == 'string') {
			node.appendChild(node.ownerDocument.createTextNode(value));
		}
		else {
			for (var i = 0; i < value._parts.length; i++) {
				var part = value._parts[i];
				if (part[0] == 'tspan') {
					var child = this._makeNode(node, part[0], part[2]);
					child.appendChild(node.ownerDocument.createTextNode(part[1]));
					node.appendChild(child);
				}
				else if (part[0] == 'tref') {
					var child = this._makeNode(node, part[0], part[2]);
					child.setAttributeNS($.svg.xlinkNS, 'href', part[1]);
					node.appendChild(child);
				}
				else if (part[0] == 'textpath') {
					var set = $.extend({}, part[2]);
					set.href = null;
					var child = this._makeNode(node, part[0], set);
					child.setAttributeNS($.svg.xlinkNS, 'href', part[2].href);
					child.appendChild(node.ownerDocument.createTextNode(part[1]));
					node.appendChild(child);
				}
				else { // straight text
					node.appendChild(node.ownerDocument.createTextNode(part[1]));
				}
			}
		}
		return node;
	},

	/* Add a custom SVG element.
	   @param  parent    (element or jQuery) the parent node for the new element (optional)
	   @param  name      (string) the name of the element
	   @param  settings  (object) additional settings for the element (optional)
	   @return  (element) the new custom node */
	other: function(parent, name, settings) {
		var args = this._args(arguments, ['name']);
		return this._makeNode(args.parent, args.name, args.settings || {});
	},

	/* Create a shape node with the given settings. */
	_makeNode: function(parent, name, settings) {
		parent = parent || this._svg;
		var node = this._svg.ownerDocument.createElementNS($.svg.svgNS, name);
		for (var name in settings) {
			var value = settings[name];
			if (value != null && value != null && 
					(typeof value != 'string' || value != '')) {
				node.setAttribute($.svg._attrNames[name] || name, value);
			}
		}
		parent.appendChild(node);
		return node;
	},

	/* Add an existing SVG node to the diagram.
	   @param  parent  (element or jQuery) the parent node for the new node (optional)
	   @param  node    (element) the new node to add or
	                   (string) the jQuery selector for the node or
	                   (jQuery collection) set of nodes to add
	   @return  (SVGWrapper) this wrapper */
	add: function(parent, node) {
		var args = this._args((arguments.length == 1 ? [null, parent] : arguments), ['node']);
		var svg = this;
		args.parent = args.parent || this._svg;
		args.node = (args.node.jquery ? args.node : $(args.node));
		try {
			if ($.svg._renesis) {
				throw 'Force traversal';
			}
			args.parent.appendChild(args.node.cloneNode(true));
		}
		catch (e) {
			args.node.each(function() {
				var child = svg._cloneAsSVG(this);
				if (child) {
					args.parent.appendChild(child);
				}
			});
		}
		return this;
	},

	/* Clone an existing SVG node and add it to the diagram.
	   @param  parent  (element or jQuery) the parent node for the new node (optional)
	   @param  node    (element) the new node to add or
	                   (string) the jQuery selector for the node or
	                   (jQuery collection) set of nodes to add
	   @return  (element[]) collection of new nodes */
	clone: function(parent, node) {
		var svg = this;
		var args = this._args((arguments.length == 1 ? [null, parent] : arguments), ['node']);
		args.parent = args.parent || this._svg;
		args.node = (args.node.jquery ? args.node : $(args.node));
		var newNodes = [];
		args.node.each(function() {
			var child = svg._cloneAsSVG(this);
			if (child) {
				child.id = '';
				args.parent.appendChild(child);
				newNodes.push(child);
			}
		});
		return newNodes;
	},

	/* SVG nodes must belong to the SVG namespace, so clone and ensure this is so.
	   @param  node  (element) the SVG node to clone
	   @return  (element) the cloned node */
	_cloneAsSVG: function(node) {
		var newNode = null;
		if (node.nodeType == 1) { // element
			newNode = this._svg.ownerDocument.createElementNS(
				$.svg.svgNS, this._checkName(node.nodeName));
			for (var i = 0; i < node.attributes.length; i++) {
				var attr = node.attributes.item(i);
				if (attr.nodeName != 'xmlns' && attr.nodeValue) {
					if (attr.prefix == 'xlink') {
						newNode.setAttributeNS($.svg.xlinkNS,
							attr.localName || attr.baseName, attr.nodeValue);
					}
					else {
						newNode.setAttribute(this._checkName(attr.nodeName), attr.nodeValue);
					}
				}
			}
			for (var i = 0; i < node.childNodes.length; i++) {
				var child = this._cloneAsSVG(node.childNodes[i]);
				if (child) {
					newNode.appendChild(child);
				}
			}
		}
		else if (node.nodeType == 3) { // text
			if ($.trim(node.nodeValue)) {
				newNode = this._svg.ownerDocument.createTextNode(node.nodeValue);
			}
		}
		else if (node.nodeType == 4) { // CDATA
			if ($.trim(node.nodeValue)) {
				try {
					newNode = this._svg.ownerDocument.createCDATASection(node.nodeValue);
				}
				catch (e) {
					newNode = this._svg.ownerDocument.createTextNode(
						node.nodeValue.replace(/&/g, '&amp;').
						replace(/</g, '&lt;').replace(/>/g, '&gt;'));
				}
			}
		}
		return newNode;
	},

	/* Node names must be lower case and without SVG namespace prefix. */
	_checkName: function(name) {
		name = (name.substring(0, 1) >= 'A' && name.substring(0, 1) <= 'Z' ?
			name.toLowerCase() : name);
		return (name.substring(0, 4) == 'svg:' ? name.substring(4) : name);
	},

	/* Load an external SVG document.
	   @param  url       (string) the location of the SVG document or
	                     the actual SVG content
	   @param  settings  (boolean) see addTo below or
	                     (function) see onLoad below or
	                     (object) additional settings for the load with attributes below:
	                       addTo       (boolean) true to add to what's already there,
	                                   or false to clear the canvas first
						   changeSize  (boolean) true to allow the canvas size to change,
	                                   or false to retain the original
	                       onLoad      (function) callback after the document has loaded,
	                                   'this' is the container, receives SVG object and
	                                   optional error message as a parameter
	                       parent      (string or element or jQuery) the parent to load
	                                   into, defaults to top-level svg element
	   @return  (SVGWrapper) this root */
	load: function(url, settings) {
		settings = (typeof settings == 'boolean' ? {addTo: settings} :
			(typeof settings == 'function' ? {onLoad: settings} :
			(typeof settings == 'string' ? {parent: settings} : 
			(typeof settings == 'object' && settings.nodeName ? {parent: settings} :
			(typeof settings == 'object' && settings.jquery ? {parent: settings} :
			settings || {})))));
		if (!settings.parent && !settings.addTo) {
			this.clear(false);
		}
		var size = [this._svg.getAttribute('width'), this._svg.getAttribute('height')];
		var wrapper = this;
		// Report a problem with the load
		var reportError = function(message) {
			message = $.svg.local.errorLoadingText + ': ' + message;
			if (settings.onLoad) {
				settings.onLoad.apply(wrapper._container || wrapper._svg, [wrapper, message]);
			}
			else {
				wrapper.text(null, 10, 20, message);
			}
		};
		// Create a DOM from SVG content
		var loadXML4IE = function(data) {
			var xml = new ActiveXObject('Microsoft.XMLDOM');
			xml.validateOnParse = false;
			xml.resolveExternals = false;
			xml.async = false;
			xml.loadXML(data);
			if (xml.parseError.errorCode != 0) {
				reportError(xml.parseError.reason);
				return null;
			}
			return xml;
		};
		// Load the SVG DOM
		var loadSVG = function(data) {
			if (!data) {
				return;
			}
			if (data.documentElement.nodeName != 'svg') {
				var errors = data.getElementsByTagName('parsererror');
				var messages = (errors.length ? errors[0].getElementsByTagName('div') : []); // Safari
				reportError(!errors.length ? '???' :
					(messages.length ? messages[0] : errors[0]).firstChild.nodeValue);
				return;
			}
			var parent = (settings.parent ? $(settings.parent)[0] : wrapper._svg);
			var attrs = {};
			for (var i = 0; i < data.documentElement.attributes.length; i++) {
				var attr = data.documentElement.attributes.item(i);
				if (!(attr.nodeName == 'version' || attr.nodeName.substring(0, 5) == 'xmlns')) {
					attrs[attr.nodeName] = attr.nodeValue;
				}
			}
			wrapper.configure(parent, attrs, !settings.parent);
			var nodes = data.documentElement.childNodes;
			for (var i = 0; i < nodes.length; i++) {
				try {
					if ($.svg._renesis) {
						throw 'Force traversal';
					}
					parent.appendChild(wrapper._svg.ownerDocument.importNode(nodes[i], true));
					if (nodes[i].nodeName == 'script') {
						$.globalEval(nodes[i].textContent);
					}
				}
				catch (e) {
					wrapper.add(parent, nodes[i]);
				}
			}
			if (!settings.changeSize) {
				wrapper.configure(parent, {width: size[0], height: size[1]});
			}
			if (settings.onLoad) {
				settings.onLoad.apply(wrapper._container || wrapper._svg, [wrapper]);
			}
		};
		if (url.match('<svg')) { // Inline SVG
			loadSVG($.browser.msie ? loadXML4IE(url) :
				new DOMParser().parseFromString(url, 'text/xml'));
		}
		else { // Remote SVG
			$.ajax({url: url, dataType: ($.browser.msie ? 'text' : 'xml'),
				success: function(xml) {
					loadSVG($.browser.msie ? loadXML4IE(xml) : xml);
				}, error: function(http, message, exc) {
					reportError(message + (exc ? ' ' + exc.message : ''));
				}});
		}
		return this;
	},

	/* Delete a specified node.
	   @param  node  (element or jQuery) the drawing node to remove
	   @return  (SVGWrapper) this root */
	remove: function(node) {
		node = (node.jquery ? node[0] : node);
		node.parentNode.removeChild(node);
		return this;
	},

	/* Delete everything in the current document.
	   @param  attrsToo  (boolean) true to clear any root attributes as well,
	                     false to leave them (optional)
	   @return  (SVGWrapper) this root */
	clear: function(attrsToo) {
		if (attrsToo) {
			this.configure({}, true);
		}
		while (this._svg.firstChild) {
			this._svg.removeChild(this._svg.firstChild);
		}
		return this;
	},

	/* Serialise the current diagram into an SVG text document.
	   @param  node  (SVG element) the starting node (optional)
	   @return  (string) the SVG as text */
	toSVG: function(node) {
		node = node || this._svg;
		return (typeof XMLSerializer == 'undefined' ? this._toSVG(node) :
			new XMLSerializer().serializeToString(node));
	},

	/* Serialise one node in the SVG hierarchy. */
	_toSVG: function(node) {
		var svgDoc = '';
		if (!node) {
			return svgDoc;
		}
		if (node.nodeType == 3) { // Text
			svgDoc = node.nodeValue;
		}
		else if (node.nodeType == 4) { // CDATA
			svgDoc = '<![CDATA[' + node.nodeValue + ']]>';
		}
		else { // Element
			svgDoc = '<' + node.nodeName;
			if (node.attributes) {
				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes.item(i);
					if (!($.trim(attr.nodeValue) == '' || attr.nodeValue.match(/^\[object/) ||
							attr.nodeValue.match(/^function/))) {
						svgDoc += ' ' + (attr.namespaceURI == $.svg.xlinkNS ? 'xlink:' : '') + 
							attr.nodeName + '="' + attr.nodeValue + '"';
					}
				}
			}	
			if (node.firstChild) {
				svgDoc += '>';
				var child = node.firstChild;
				while (child) {
					svgDoc += this._toSVG(child);
					child = child.nextSibling;
				}
				svgDoc += '</' + node.nodeName + '>';
			}
				else {
				svgDoc += '/>';
			}
		}
		return svgDoc;
	}
});

/* Helper to generate an SVG path.
   Obtain an instance from the SVGWrapper object.
   String calls together to generate the path and use its value:
   var path = root.createPath();
   root.path(null, path.move(100, 100).line(300, 100).line(200, 300).close(), {fill: 'red'});
   or
   root.path(null, path.move(100, 100).line([[300, 100], [200, 300]]).close(), {fill: 'red'}); */
function SVGPath() {
	this._path = '';
}

$.extend(SVGPath.prototype, {
	/* Prepare to create a new path.
	   @return  (SVGPath) this path */
	reset: function() {
		this._path = '';
		return this;
	},

	/* Move the pointer to a position.
	   @param  x         (number) x-coordinate to move to or
	                     (number[][]) x-/y-coordinates to move to
	   @param  y         (number) y-coordinate to move to (omitted if x is array)
	   @param  relative  (boolean) true for coordinates relative to the current point,
	                     false for coordinates being absolute
	   @return  (SVGPath) this path */
	move: function(x, y, relative) {
		relative = (isArray(x) ? y : relative);
		return this._coords((relative ? 'm' : 'M'), x, y);
	},

	/* Draw a line to a position.
	   @param  x         (number) x-coordinate to move to or
	                     (number[][]) x-/y-coordinates to move to
	   @param  y         (number) y-coordinate to move to (omitted if x is array)
	   @param  relative  (boolean) true for coordinates relative to the current point,
	                     false for coordinates being absolute
	   @return  (SVGPath) this path */
	line: function(x, y, relative) {
		relative = (isArray(x) ? y : relative);
		return this._coords((relative ? 'l' : 'L'), x, y);
	},

	/* Draw a horizontal line to a position.
	   @param  x         (number) x-coordinate to draw to or
	                     (number[]) x-coordinates to draw to
	   @param  relative  (boolean) true for coordinates relative to the current point,
	                     false for coordinates being absolute
	   @return  (SVGPath) this path */
	horiz: function(x, relative) {
		this._path += (relative ? 'h' : 'H') + (isArray(x) ? x.join(' ') : x);
		return this;
	},

	/* Draw a vertical line to a position.
	   @param  y         (number) y-coordinate to draw to or
	                     (number[]) y-coordinates to draw to
	   @param  relative  (boolean) true for coordinates relative to the current point,
	                     false for coordinates being absolute
	   @return  (SVGPath) this path */
	vert: function(y, relative) {
		this._path += (relative ? 'v' : 'V') + (isArray(y) ? y.join(' ') : y);
		return this;
	},

	/* Draw a cubic Bézier curve.
	   @param  x1        (number) x-coordinate of beginning control point or
	                     (number[][]) x-/y-coordinates of control and end points to draw to
	   @param  y1        (number) y-coordinate of beginning control point (omitted if x1 is array)
	   @param  x2        (number) x-coordinate of ending control point (omitted if x1 is array)
	   @param  y2        (number) y-coordinate of ending control point (omitted if x1 is array)
	   @param  x         (number) x-coordinate of curve end (omitted if x1 is array)
	   @param  y         (number) y-coordinate of curve end (omitted if x1 is array)
	   @param  relative  (boolean) true for coordinates relative to the current point,
	                     false for coordinates being absolute
	   @return  (SVGPath) this path */
	curveC: function(x1, y1, x2, y2, x, y, relative) {
		relative = (isArray(x1) ? y1 : relative);
		return this._coords((relative ? 'c' : 'C'), x1, y1, x2, y2, x, y);
	},

	/* Continue a cubic Bézier curve.
	   Starting control point is the reflection of the previous end control point.
	   @param  x2        (number) x-coordinate of ending control point or
	                     (number[][]) x-/y-coordinates of control and end points to draw to
	   @param  y2        (number) y-coordinate of ending control point (omitted if x2 is array)
	   @param  x         (number) x-coordinate of curve end (omitted if x2 is array)
	   @param  y         (number) y-coordinate of curve end (omitted if x2 is array)
	   @param  relative  (boolean) true for coordinates relative to the current point,
	                     false for coordinates being absolute
	   @return  (SVGPath) this path */
	smoothC: function(x2, y2, x, y, relative) {
		relative = (isArray(x2) ? y2 : relative);
		return this._coords((relative ? 's' : 'S'), x2, y2, x, y);
	},

	/* Draw a quadratic Bézier curve.
	   @param  x1        (number) x-coordinate of control point or
	                     (number[][]) x-/y-coordinates of control and end points to draw to
	   @param  y1        (number) y-coordinate of control point (omitted if x1 is array)
	   @param  x         (number) x-coordinate of curve end (omitted if x1 is array)
	   @param  y         (number) y-coordinate of curve end (omitted if x1 is array)
	   @param  relative  (boolean) true for coordinates relative to the current point,
	                     false for coordinates being absolute
	   @return  (SVGPath) this path */
	curveQ: function(x1, y1, x, y, relative) {
		relative = (isArray(x1) ? y1 : relative);
		return this._coords((relative ? 'q' : 'Q'), x1, y1, x, y);
	},

	/* Continue a quadratic Bézier curve.
	   Control point is the reflection of the previous control point.
	   @param  x         (number) x-coordinate of curve end or
	                     (number[][]) x-/y-coordinates of points to draw to
	   @param  y         (number) y-coordinate of curve end (omitted if x is array)
	   @param  relative  (boolean) true for coordinates relative to the current point,
	                     false for coordinates being absolute
	   @return  (SVGPath) this path */
	smoothQ: function(x, y, relative) {
		relative = (isArray(x) ? y : relative);
		return this._coords((relative ? 't' : 'T'), x, y);
	},

	/* Generate a path command with (a list of) coordinates. */
	_coords: function(cmd, x1, y1, x2, y2, x3, y3) {
		if (isArray(x1)) {
			for (var i = 0; i < x1.length; i++) {
				var cs = x1[i];
				this._path += (i == 0 ? cmd : ' ') + cs[0] + ',' + cs[1] +
					(cs.length < 4 ? '' : ' ' + cs[2] + ',' + cs[3] +
					(cs.length < 6 ? '': ' ' + cs[4] + ',' + cs[5]));
			}
		}
		else {
			this._path += cmd + x1 + ',' + y1 + 
				(x2 == null ? '' : ' ' + x2 + ',' + y2 +
				(x3 == null ? '' : ' ' + x3 + ',' + y3));
		}
		return this;
	},

	/* Draw an arc to a position.
	   @param  rx         (number) x-radius of arc or
	                      (number/boolean[][]) x-/y-coordinates and flags for points to draw to
	   @param  ry         (number) y-radius of arc (omitted if rx is array)
	   @param  xRotate    (number) x-axis rotation (degrees, clockwise) (omitted if rx is array)
	   @param  large      (boolean) true to draw the large part of the arc,
	                      false to draw the small part (omitted if rx is array)
	   @param  clockwise  (boolean) true to draw the clockwise arc,
	                      false to draw the anti-clockwise arc (omitted if rx is array)
	   @param  x          (number) x-coordinate of arc end (omitted if rx is array)
	   @param  y          (number) y-coordinate of arc end (omitted if rx is array)
	   @param  relative   (boolean) true for coordinates relative to the current point,
	                      false for coordinates being absolute
	   @return  (SVGPath) this path */
	arc: function(rx, ry, xRotate, large, clockwise, x, y, relative) {
		relative = (isArray(rx) ? ry : relative);
		this._path += (relative ? 'a' : 'A');
		if (isArray(rx)) {
			for (var i = 0; i < rx.length; i++) {
				var cs = rx[i];
				this._path += (i == 0 ? '' : ' ') + cs[0] + ',' + cs[1] + ' ' +
					cs[2] + ' ' + (cs[3] ? '1' : '0') + ',' +
					(cs[4] ? '1' : '0') + ' ' + cs[5] + ',' + cs[6];
			}
		}
		else {
			this._path += rx + ',' + ry + ' ' + xRotate + ' ' +
				(large ? '1' : '0') + ',' + (clockwise ? '1' : '0') + ' ' + x + ',' + y;
		}
		return this;
	},

	/* Close the current path.
	   @return  (SVGPath) this path */
	close: function() {
		this._path += 'z';
		return this;
	},

	/* Return the string rendering of the specified path.
	   @return  (string) stringified path */
	path: function() {
		return this._path;
	}
});

SVGPath.prototype.moveTo = SVGPath.prototype.move;
SVGPath.prototype.lineTo = SVGPath.prototype.line;
SVGPath.prototype.horizTo = SVGPath.prototype.horiz;
SVGPath.prototype.vertTo = SVGPath.prototype.vert;
SVGPath.prototype.curveCTo = SVGPath.prototype.curveC;
SVGPath.prototype.smoothCTo = SVGPath.prototype.smoothC;
SVGPath.prototype.curveQTo = SVGPath.prototype.curveQ;
SVGPath.prototype.smoothQTo = SVGPath.prototype.smoothQ;
SVGPath.prototype.arcTo = SVGPath.prototype.arc;

/* Helper to generate an SVG text object.
   Obtain an instance from the SVGWrapper object.
   String calls together to generate the text and use its value:
   var text = root.createText();
   root.text(null, x, y, text.string('This is ').
     span('red', {fill: 'red'}).string('!'), {fill: 'blue'}); */
function SVGText() {
	this._parts = []; // The components of the text object
}

$.extend(SVGText.prototype, {
	/* Prepare to create a new text object.
	   @return  (SVGText) this text */
	reset: function() {
		this._parts = [];
		return this;
	},

	/* Add a straight string value.
	   @param  value  (string) the actual text
	   @return  (SVGText) this text object */
	string: function(value) {
		this._parts[this._parts.length] = ['text', value];
		return this;
	},

	/* Add a separate text span that has its own settings.
	   @param  value     (string) the actual text
	   @param  settings  (object) the settings for this text
	   @return  (SVGText) this text object */
	span: function(value, settings) {
		this._parts[this._parts.length] = ['tspan', value, settings];
		return this;
	},

	/* Add a reference to a previously defined text string.
	   @param  id        (string) the ID of the actual text
	   @param  settings  (object) the settings for this text
	   @return  (SVGText) this text object */
	ref: function(id, settings) {
		this._parts[this._parts.length] = ['tref', id, settings];
		return this;
	},

	/* Add text drawn along a path.
	   @param  id        (string) the ID of the path
	   @param  value     (string) the actual text
	   @param  settings  (object) the settings for this text
	   @return  (SVGText) this text object */
	path: function(id, value, settings) {
		this._parts[this._parts.length] = ['textpath', value, 
			$.extend({href: id}, settings || {})];
		return this;
	}
});

/* Attach the SVG functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these SVG instances
   @return jQuery (object) for chaining further calls */
$.fn.svg = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (typeof options == 'string' && options == 'get') {
		return $.svg['_' + options + 'SVG'].apply($.svg, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			$.svg['_' + options + 'SVG'].apply($.svg, [this].concat(otherArgs));
		}
		else {
			$.svg._attachSVG(this, options || {});
		} 
	});
};

/* Determine whether an object is an array. */
function isArray(a) {
	return (a && a.constructor == Array);
}

// Singleton primary SVG interface
$.svg = new SVGManager();

})(jQuery);

/* http://keith-wood.name/svg.html
   jQuery DOM compatibility for jQuery SVG v1.4.5.
   Written by Keith Wood (kbwood{at}iinet.com.au) April 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Support adding class names to SVG nodes. */
$.fn.addClass = function(origAddClass) {
	return function(classNames) {
		classNames = classNames || '';
		return this.each(function() {
			if ($.svg.isSVGElem(this)) {
				var node = this;
				$.each(classNames.split(/\s+/), function(i, className) {
					var classes = (node.className ? node.className.baseVal : node.getAttribute('class'));
					if ($.inArray(className, classes.split(/\s+/)) == -1) {
						classes += (classes ? ' ' : '') + className;
						(node.className ? node.className.baseVal = classes :
							node.setAttribute('class',  classes));
					}
				});
			}
			else {
				origAddClass.apply($(this), [classNames]);
			}
		});
	};
}($.fn.addClass);

/* Support removing class names from SVG nodes. */
$.fn.removeClass = function(origRemoveClass) {
	return function(classNames) {
		classNames = classNames || '';
		return this.each(function() {
			if ($.svg.isSVGElem(this)) {
				var node = this;
				$.each(classNames.split(/\s+/), function(i, className) {
					var classes = (node.className ? node.className.baseVal : node.getAttribute('class'));
					classes = $.grep(classes.split(/\s+/), function(n, i) { return n != className; }).
						join(' ');
					(node.className ? node.className.baseVal = classes :
						node.setAttribute('class', classes));
				});
			}
			else {
				origRemoveClass.apply($(this), [classNames]);
			}
		});
	};
}($.fn.removeClass);

/* Support toggling class names on SVG nodes. */
$.fn.toggleClass = function(origToggleClass) {
	return function(className, state) {
		return this.each(function() {
			if ($.svg.isSVGElem(this)) {
				if (typeof state !== 'boolean') {
					state = !$(this).hasClass(className);
				}
				$(this)[(state ? 'add' : 'remove') + 'Class'](className);
			}
			else {
				origToggleClass.apply($(this), [className, state]);
			}
		});
	};
}($.fn.toggleClass);

/* Support checking class names on SVG nodes. */
$.fn.hasClass = function(origHasClass) {
	return function(className) {
		className = className || '';
		var found = false;
		this.each(function() {
			if ($.svg.isSVGElem(this)) {
				var classes = (this.className ? this.className.baseVal :
					this.getAttribute('class')).split(/\s+/);
				found = ($.inArray(className, classes) > -1);
			}
			else {
				found = (origHasClass.apply($(this), [className]));
			}
			return !found;
		});
		return found;
	};
}($.fn.hasClass);

/* Support attributes on SVG nodes. */
$.fn.attr = function(origAttr) {
	return function(name, value, type) {
		if (typeof name === 'string' && value === undefined) {
			var val = origAttr.apply(this, [name]);
			if (val && val.baseVal && val.baseVal.numberOfItems != null) { // Multiple values
				value = '';
				val = val.baseVal;
				if (name == 'transform') {
					for (var i = 0; i < val.numberOfItems; i++) {
						var item = val.getItem(i);
						switch (item.type) {
							case 1: value += ' matrix(' + item.matrix.a + ',' + item.matrix.b + ',' +
										item.matrix.c + ',' + item.matrix.d + ',' +
										item.matrix.e + ',' + item.matrix.f + ')';
									break;
							case 2: value += ' translate(' + item.matrix.e + ',' + item.matrix.f + ')'; break;
							case 3: value += ' scale(' + item.matrix.a + ',' + item.matrix.d + ')'; break;
							case 4: value += ' rotate(' + item.angle + ')'; break; // Doesn't handle new origin
							case 5: value += ' skewX(' + item.angle + ')'; break;
							case 6: value += ' skewY(' + item.angle + ')'; break;
						}
					}
					val = value.substring(1);
				}
				else {
					val = val.getItem(0).valueAsString;
				}
			}
			return (val && val.baseVal ? val.baseVal.valueAsString : val);
		}

		var options = name;
		if (typeof name === 'string') {
			options = {};
			options[name] = value;
		}
		return this.each(function() {
			if ($.svg.isSVGElem(this)) {
				for (var n in options) {
					var val = ($.isFunction(options[n]) ? options[n]() : options[n]);
					(type ? this.style[n] = val : this.setAttribute(n, val));
				}
			}
			else {
				origAttr.apply($(this), [name, value, type]);
			}
		});
	};
}($.fn.attr);

/* Support removing attributes on SVG nodes. */
$.fn.removeAttr = function(origRemoveAttr) {
	return function(name) {
		return this.each(function() {
			if ($.svg.isSVGElem(this)) {
				(this[name] && this[name].baseVal ? this[name].baseVal.value = '' :
					this.setAttribute(name, ''));
			}
			else {
				origRemoveAttr.apply($(this), [name]);
			}
		});
	};
}($.fn.removeAttr);

/* Add numeric only properties. */
$.extend($.cssNumber, {
	'stopOpacity': true,
	'strokeMitrelimit': true,
	'strokeOpacity': true
});

/* Support retrieving CSS/attribute values on SVG nodes. */
if ($.cssProps) {
	$.css = function(origCSS) {
		return function(elem, name, extra) {
			var value = (name.match(/^svg.*/) ? $(elem).attr($.cssProps[name] || name) : '');
			return value || origCSS(elem, name, extra);
		};
	}($.css);
}
  
/* Determine if any nodes are SVG nodes. */
function anySVG(checkSet) {
	for (var i = 0; i < checkSet.length; i++) {
		if (checkSet[i].nodeType == 1 && checkSet[i].namespaceURI == $.svg.svgNS) {
			return true;
		}
	}
	return false;
}

/* Update Sizzle selectors. */

$.expr.relative['+'] = function(origRelativeNext) {
	return function(checkSet, part, isXML) {
		origRelativeNext(checkSet, part, isXML || anySVG(checkSet));
	};
}($.expr.relative['+']);

$.expr.relative['>'] = function(origRelativeChild) {
	return function(checkSet, part, isXML) {
		origRelativeChild(checkSet, part, isXML || anySVG(checkSet));
	};
}($.expr.relative['>']);

$.expr.relative[''] = function(origRelativeDescendant) {
	return function(checkSet, part, isXML) {
		origRelativeDescendant(checkSet, part, isXML || anySVG(checkSet));
	};
}($.expr.relative['']);

$.expr.relative['~'] = function(origRelativeSiblings) {
	return function(checkSet, part, isXML) {
		origRelativeSiblings(checkSet, part, isXML || anySVG(checkSet));
	};
}($.expr.relative['~']);

$.expr.find.ID = function(origFindId) {
	return function(match, context, isXML) {
		return ($.svg.isSVGElem(context) ?
			[context.ownerDocument.getElementById(match[1])] :
			origFindId(match, context, isXML));
	};
}($.expr.find.ID);

var div = document.createElement('div');
div.appendChild(document.createComment(''));
if (div.getElementsByTagName('*').length > 0) { // Make sure no comments are found
	$.expr.find.TAG = function(match, context) {
		var results = context.getElementsByTagName(match[1]);
		if (match[1] === '*') { // Filter out possible comments
			var tmp = [];
			for (var i = 0; results[i] || results.item(i); i++) {
				if ((results[i] || results.item(i)).nodeType === 1) {
					tmp.push(results[i] || results.item(i));
				}
			}
			results = tmp;
		}
		return results;
	};
}

$.expr.preFilter.CLASS = function(match, curLoop, inplace, result, not, isXML) {
	match = ' ' + match[1].replace(/\\/g, '') + ' ';
	if (isXML) {
		return match;
	}
	for (var i = 0, elem = {}; elem != null; i++) {
		elem = curLoop[i];
		if (!elem) {
			try {
				elem = curLoop.item(i);
			}
			catch (e) {
				// Ignore
			}
		}
		if (elem) {
			var className = (!$.svg.isSVGElem(elem) ? elem.className :
				(elem.className ? elem.className.baseVal : '') || elem.getAttribute('class'));
			if (not ^ (className && (' ' + className + ' ').indexOf(match) > -1)) {
				if (!inplace)
					result.push(elem);
			}
			else if (inplace) {
				curLoop[i] = false;
			}
		}
	}
	return false;
};

$.expr.filter.CLASS = function(elem, match) {
	var className = (!$.svg.isSVGElem(elem) ? elem.className :
		(elem.className ? elem.className.baseVal : elem.getAttribute('class')));
	return (' ' + className + ' ').indexOf(match) > -1;
};

$.expr.filter.ATTR = function(origFilterAttr) {
	return function(elem, match) {
		var handler = null;
		if ($.svg.isSVGElem(elem)) {
			handler = match[1];
			$.expr.attrHandle[handler] = function(elem){
				var attr = elem.getAttribute(handler);
				return attr && attr.baseVal || attr;
			};
		}
		var filter = origFilterAttr(elem, match);
		if (handler) {
			$.expr.attrHandle[handler] = null;
		}
		return filter;
	};
}($.expr.filter.ATTR);

/*
	In the removeData function (line 1881, v1.7.2):

				if ( jQuery.support.deleteExpando ) {
					delete elem[ internalKey ];
				} else {
					try { // SVG
						elem.removeAttribute( internalKey );
					} catch (e) {
						elem[ internalKey ] = null;
					}
				}

	In the event.add function (line 2985, v1.7.2):

				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					try { // SVG
						elem.addEventListener( type, eventHandle, false );
					} catch(e) {
						if ( elem.attachEvent ) {
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}

	In the event.remove function (line 3074, v1.7.2):

			if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
				try { // SVG
					elem.removeEventListener(type, elemData.handle, false);
				}
				catch (e) {
					if (elem.detachEvent) {
						elem.detachEvent("on" + type, elemData.handle);
					}
				}
			}

	In the event.fix function (line 3394, v1.7.2):

		if (event.target.namespaceURI == 'http://www.w3.org/2000/svg') { // SVG
			event.button = [1, 4, 2][event.button];
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && button !== undefined ) {
			event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
		}

	In the Sizzle function (line 4083, v1.7.2):

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
				results.push( set[i] || set.item(i) ); // SVG
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] || set.item(i) ); // SVG
				}
			}
		}
	} else {...

	In the fallback for the Sizzle makeArray function (line 4877, v1.7.2):

	if ( toString.call(array) === "[object Array]" ) {
		Array.prototype.push.apply( ret, array );

	} else {
		if ( typeof array.length === "number" ) {
			for ( var l = array.length; i &lt; l; i++ ) {
				ret.push( array[i] || array.item(i) ); // SVG
			}

		} else {
			for ( ; array[i]; i++ ) {
				ret.push( array[i] );
			}
		}
	}

	In the jQuery.cleandata function (line 6538, v1.7.2):

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else {
					try { // SVG
						elem.removeAttribute( jQuery.expando );
					} catch (e) {
						// Ignore
					}
				}

	In the fallback getComputedStyle function (line 6727, v1.7.2):

		defaultView = (elem.ownerDocument ? elem.ownerDocument.defaultView : elem.defaultView); // SVG
		if ( defaultView &&
		(computedStyle = defaultView.getComputedStyle( elem, null )) ) {

			ret = computedStyle.getPropertyValue( name );
			...

*/

})(jQuery);

