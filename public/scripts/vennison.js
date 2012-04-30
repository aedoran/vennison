define(['/scripts/lib/d3.js',
        '/scripts/underscore.js'],function(d3,_) {

  var width = 600, height = 500;

  var filters = [
    { name   : "f1",
      filter : function(d) { return d>2 },
      color  : "red"},
    { name   : "f2",
      filter : function(d) { return d>2 }, 
      color  : "blue" },
    { name   : "f3",
      filter : function(d) { return d>2 },
      color  : "green" },
    { name   : "f4",
      filter : function(d) { return d>2 },
      color  : "yellow" },
  ];

  //returns set of all sets
  var generatePowerSet = function (arr) {
    var ret = [],length, margin_padding = 20;


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

      ret.push({
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
    .attr("d", function(d) {return makePathString(d.x1,d.y1,d.x2,d.y2,20)});

  var node = vis.selectAll("g.node")
      .data(generatePowerSet(filters))
    .enter().append("svg:g")
      .attr("transform", function(d) {return "translate("+d.x+","+d.y+")";})

  node.
    append("svg:circle")
    .attr("class",function(d) {return d.filters.map(function(l) {return l.name}).join(' ') + " node"})
    .attr("dx",5)
    .attr("r",5);

  node.append("svg:text")
    .attr("dx",5)
    .text(function(d) {return d.name});

 
 
  document.addEventListener("click",function(e) {
    var c = e.target.getAttribute("class");
    if (c && c.match("node")) {
      var classes = c.split(' ');
      var sel = "."+classes.filter(function(c) { return c != "node" }).join(".");
      var circles = document.querySelectorAll("path"+sel);
      console.log(sel);
      for (var i in circles) {
        console.log(circles[i]);
        circles[i].setAttribute("stroke","red");
      }
    }
  });

})
