define(['/scripts/lib/d3.js',
        '/scripts/underscore.js'],function(d3,_) {


  var vennison = function(args) {

    var width = 800, height = 600;

    var filters = [
      { name   : "numberofnotesover60",
        filter : function(d) { return d.notes_num > 60 },
        color  : "#ff0000"},
      { name   : "byphillortony",
        filter : function(d) { return d.name.match("tony") || d.name.match("phill")  }, 
        color  : "#00ff00" },
      { name   : "major",
        filter : function(d) { return d.mm == 1 },
        color  : "#0000ff" },
      { name   : "morethanonekey",
        filter : function(d) { return d.key_changes > 0 },
        color  : "#880000" },

    ];

    var parse16 = function(c) {
      if      (c.toLowerCase() == "a") { return 10;}
      else if (c.toLowerCase() == "b") { return 11;}
      else if (c.toLowerCase() == "c") { return 12;}
      else if (c.toLowerCase() == "d") { return 13;}
      else if (c.toLowerCase() == "e") { return 14;}
      else if (c.toLowerCase() == "f") { return 15;}
      else { return parseInt(c) };
    }

    var unparse16 = function(i) {
      if      (i == 15) { return "f" }
      else if (i == 14) { return "e" }
      else if (i == 13) { return "d" }
      else if (i == 12) { return "c" }
      else if (i == 11) { return "b" }
      else if (i == 10) { return "a" }
      else { return i.toString(); }
    }
      
    

    var mixcolors = function(list) {

      var ret = [0,0,0];
      var list = _.map(list,function(l) {return l.replace("#","")});
      _.each(list,function(l) {
        ret[0] = ret[0] + (parse16(l[0])*16) + parse16(l[1]);
        ret[1] = ret[1] + (parse16(l[2])*16) + parse16(l[3]);
        ret[2] = ret[2] + (parse16(l[4])*16) + parse16(l[5]);
      });

      if (list.length == 0) { return "#333333" } 

      return "#" + _.map(ret, function(r) {
        var s = Math.round(r/list.length);
        return unparse16(Math.floor(s/16)) + unparse16(s - (16*Math.floor(s/16)))
      }).join('');

    
    }


    //returns set of all sets
    var generatePowerSet = function (arr) {
      var ret = [],length, margin_padding = 100;


      //find out how many distributions so we can lay them out the right way
      var dists = [],
          dists_counter = [];
      for (var i=0; i<=arr.length;i++) {
        dists.push(comb(arr.length,i));
        dists_counter.push(0);
      }
      

      for ( var i = 1; i <= Math.pow(2,arr.length); i++) {

        var working = i, working_set = [];
        for ( var k = arr.length; k >=0; k--) {
          if (Math.pow(2,k) < working) {
            working_set.push(arr[k]);
            working = working - Math.pow(2,k);
          }
        }

        //apply filters

        working_data = args.data;
        working_count = args.data.length;
        _.each(working_set, function(f) {
          working_data = _.filter(working_data,f.filter);
          working_count = working_data.length;
        });


        ret.push({
          count:working_count,
          name:working_set.map(function(f) { return f.name}).join(','),
          filters:working_set,
          x:margin_padding+((width-(2*margin_padding))*working_set.length/arr.length),
          y:margin_padding+(
            (height-(2*margin_padding))*dists_counter[working_set.length]
            /
            dists[working_set.length] + (height-(2*margin_padding))/(1+dists[working_set.length]))
        });

        dists_counter[working_set.length] = dists_counter[working_set.length] + 1;
      }
      return ret;
    }



    var vis = d3.select("#chart").append("svg:svg")
      .attr("width",width)
      .attr("height",height);


    //math stuff 
    var fact = function(i) {
      if (i==0) return 1;
      var ret = 1;
      for (var a=1;a<=i;a++) {
        ret = ret * a;
      } 
      return ret;
    }

    var comb = function(n,k) {
      return fact(n) / (fact(k) * fact(n-k));
    }

    var midPoint = function(x1,y1,x2,y2) {
      return [x1- ((x1-x2)/2),y1 -((y1-y2)/2)];
    }

    var slope = function(x1,y1,x2,y2) {
      return (x1-x2)/(y1-y2);
    }

    var dis = function(x1,y1,x2,y2) {
      return Math.sqrt(Math.pow(Math.abs(x1-x2),2) + Math.pow(Math.abs(y1-y2),2));
    }
    
    var invdis = function(d,m) {
      return Math.sqrt(Math.pow(d,2) - 1) - m;
    }



    //Makes a bezier path string that 
    var makePathString = function(x1,y1,x2,y2,bendness) {
     
      var points = [], m = slope(x1,y1,x2,y2),
          mid = midPoint(x1,y1,x2,y2),
          c1 = midPoint(x1,y1,mid[0],mid[1]),
          angle = Math.atan(-1/m),
          control =[], control2 = [];

      if (m < 0) {
        control[0] = Math.sin(angle)*bendness + c1[0];
        control[1] = Math.cos(angle)*bendness + c1[1];
      } else {
        control[0] = Math.sin(Math.PI + angle)*bendness + c1[0];
        control[1] = Math.cos(Math.PI + angle)*bendness + c1[1];
      }

      points.push("M"+x1+","+y1);
      points.push("Q"+control[0]+","+control[1]);
      points.push(mid[0]+","+mid[1]);
      points.push("T"+x2+","+y2);
      
      return points.join(' ');
    }


    var makeLevelConnection = function(set) { 
      var ret = [];
      
      for (var i in set) {
        for (var j in set) {
          if (set[i].filters.length + 1 == set[j].filters.length) {
            if (_.isEqual(
                _.intersection(set[i].filters,set[j].filters),
                  set[i].filters )) {
              ret.push({
                x1:set[i].x,
                y1:set[i].y,
                x2:set[j].x,
                y2:set[j].y,
                classes : set[i].filters
              });
            }
          }
        }
      }
      return ret;
    }


    var link = vis.selectAll("path.link")
         .data(makeLevelConnection(generatePowerSet(filters))).enter().append("svg:path")
      .attr("class",function(d) {return d.classes.map(function(l) {return l.name}).join(' ') + " connection"})
      .attr("fill","none")
      .attr("stroke-opacity",".5")
      .attr("stroke",function(d) { return mixcolors(d.classes.map(function(l) { return l.color})); })
      .attr("d", function(d) {return makePathString(d.x1,d.y1,d.x2,d.y2,20)});

    var node = vis.selectAll("g.node")
        .data(generatePowerSet(filters))
      .enter().append("svg:g")
        .attr("transform", function(d) {return "translate("+d.x+","+d.y+")";})

    node.selectAll("circle")
      .data(function(d) { return d.filters })
      .enter().append("svg:circle")
      .attr("r",5) /*
      .attr("cx",function(d,i) { return 10*Math.sin((2*Math.PI)*(i/filters.length))})
      .attr("cy",function(d,i) { return 10*Math.cos((2*Math.PI)*(i/filters.length))}) */
      .attr("cx", function(d,i) { return (20+(10*i)) })
      .attr("cy", 10)
      .attr("stroke",function(d) {return d.color})
      .attr("fill",function(d) {return d.color})


    node.append("svg:circle")
      .attr("class",function(d) {return d.filters.map(function(l) {return l.name}).join(' ') + " node"})
      .attr("dx",5)
      .attr("stroke","black")
      .attr("fill","white")
      .attr("stroke-width","3px")
      .attr("r",function(d) {  return (25*d.count/args.data.length) + 2 });

    node.append("svg:rect")
      .attr("x",11)
      .attr("y",-15)
      .attr("fill","white")
      .attr("stroke","black")
      .attr("stroke-width","2px")
      .attr("width",50)
      .attr("height",18);

    node.append("svg:text")
      .attr("dx",15)
      .attr("dy",0)
      .attr("stroke","black")
      .attr("border","solid 1px red")
      .text(function(d) {return d.count});

   
    

    _.each(document.querySelectorAll("circle.node"),
        function(node) {
          node.addEventListener("mouseover", function(e) {
            e.target.setAttribute("fill","black");
            var c = e.target.getAttribute("class");
            var classes = c.split(' ');
            var sel = "."+classes.filter(function(c) { return c != "node" }).join(".");
            var circles = document.querySelectorAll("path"+sel);
            for (var i in circles) {
              if (circles[i].setAttribute) {
                circles[i].setAttribute("stroke-width","5px");
              }
            }
          });

          node.addEventListener("mouseout", function(e) {
            e.target.setAttribute("fill","white");

            
            var c = e.target.getAttribute("class");
            var classes = c.split(' ');
            var sel = "."+classes.filter(function(c) { return c != "node" }).join(".");
            var circles = document.querySelectorAll("path"+sel);
            for (var i in circles) {
              if (circles[i].setAttribute) {
                circles[i].setAttribute("stroke-width","1px");
              }
            }
          });
        }
    );

/*
    document.addEventListener("click",function(e) {
      var c = e.target.getAttribute("class");
      if (c && c.match("node")) {
        var classes = c.split(' ');
        var sel = "."+classes.filter(function(c) { return c != "node" }).join(".");
        var circles = document.querySelectorAll("path"+sel);
        for (var i in circles) {
          if (circles[i].setAttribute) {
            circles[i].setAttribute("stroke-width","5px");
          }
        }
      }
    });
*/
      
  }

  return vennison;


})
