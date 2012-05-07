require(['vennison','sampledata','lib/socket.io'],
    function(vennison,sampledata,socketio) {

    vennison({
      data : sampledata(10000)
    });

});
