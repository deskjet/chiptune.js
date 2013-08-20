#!/bin/bash
if [[ "$1" == "--full" ]]
then
  git submodule init
  git submodule update
  cd libxmp
  autoconf
  emconfigure ./configure --enable-static --disable-shared
  emmake make
  cd ..
fi
em++ wrapper/player.cpp wrapper/wrapper.cpp libxmp/lib/libxmp.a -o libxmp.js -Ilibxmp/include -s EXPORTED_FUNCTIONS="['_initialize_player', '_read_from_player', '_free_player', '_free_buffer']" -O2 --closure 0
