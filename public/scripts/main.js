require(['vennison','sampledata','lib/socket.io'],
    function(vennison,sampledata,socketio) {

    vennison(
    { 
      width   : 550,
      height  : 400,
      data    : sampledata(2000),
      filters :  [
        { name   : "last_login",
          filter : function(user) {
            var now     = (new Date()).getTime(),
              last_login = (new Date(user.last_login)).getTime(),
              week       = 1000*60*60*24*7;

            return now - last_login < week;
          },
          color  : "#BE8586"},
        
        { name   : "active",
          filter : function(user) { return user.comments >= 10 && user.downloads >= 20 },
          color  : "#7CAF6C" },
        { name   : "test",
          filter : function(user) { return user.notes_num > 70 },
          color  : "#A2A6FE" }, 
          

    ],
      
    });

});
