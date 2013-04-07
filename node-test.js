require('./libxmp.js');

var buf_get_size = function(buf_ptr) {
  return Module.getValue(buf_ptr + 1, '*');
}

var buf_get_dataptr = function(buf_ptr) {
  return Module.getValue(buf_ptr, '*');
}

var xmp = {
  init: Module.cwrap('initialize_player', 'number', ['string']),
  read: Module.cwrap('read_from_player', 'number', ['number']),
  free_buffer: Module.cwrap('free_buffer', 'null', ['number']),
  free_player: Module.cwrap('free_player', 'null', ['number'])
};


var player_ptr = xmp.init("test.mod");
if (player_ptr == 0) {
  console.log("Player init failed");
  return;
}

while (true) {
  var buf_ptr = xmp.read(player_ptr);
  console.log(buf_ptr);
  var size = buf_get_size(buf_ptr);
  if (size == 0) {
    break;
  }
  var data_ptr = buf_get_dataptr(buf_ptr);
  console.log(data_ptr);

  for (var i = 0; i < size; i++) {
    var tmp = Module.getValue(data_ptr + i, 'i8');
  }
}
