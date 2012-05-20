define(['/scripts/underscore.js'],function(_) {

  var attr = {
    name        : ['tony', 'phill', 'brandon', 'jonah', 'cotter'],
    keys        : _.range(12),
    mm          : _.range(2),
    notes_num   : _.range(40,100),
    key_changes : _.range(4),
    style       : ['jazz','funk','r&b','soul','rock','experimental'],
    subject     : ['love','revenge','nostalgia','loss','political']
  }

  return function(num) {
    var list = [];
    var keys = _.keys(attr);
    for (var i=0; i<num; i++) {
      var obj = {};
      _.each(_.keys(attr),function (key) {
        obj[key] = attr[key][Math.floor(Math.random()*attr[key].length)];
      });
      if (i<700) {
        obj['last_login'] = '5/18/2012';
      } else {
        obj['last_login'] = '5/18/2011';
      }

      if (i<300) {
        obj['downloads']  = 25;
        obj['comments']   = 15;
      } else {
        obj['downloads'] = 0;
        obj['comments'] = 0;
      }
      list.push(obj);
    }

    return list;

  }

});
