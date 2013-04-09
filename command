emconfigure ./configure --enable-static --disable-shared
emmake make
em++ wrapper/player.cpp wrapper/wrapper.cpp lib/libxmp.a -o ../libxmp.js -Iinclude -s EXPORTED_FUNCTIONS="['_initialize_player', '_read_from_player', '_free_player', '_free_buffer']" -O2 --closure 0

