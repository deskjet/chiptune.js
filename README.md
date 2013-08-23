# Chiptune.js

This is a javascript library that can play module music files. It is based on the [libxmp](https://github.com/cmatsuoka/libxmp) C library. To translate libxmp into Javascript [emscripten](https://github.com/kripken/emscripten) was used. Audio output is implemented with the Web Audio API as specified by W3C.

## Features

* Play all traker formats supported by libxmp (including mod, xm, s3m, it)
* Simple Javascript API
* Pause/Resume
* Support for Google Chrome (also future Firefox versions)
* Load local (HTML5) and remote files (XHR2)

## To do

* Stereo playback
* ~~Looping mode~~
* Module comment text
* Playback information (e.g. position, speed, bpm)
* Mixer settings (e.g. sampling rate, interpolation, resolution)

## Demo

A demo is available: [DEMO](http://deskjet.github.io/chiptune.js/)

Just drop a module (e.g. from [modarchive.org](http://modarchive.org)) on the demo page and press the play button.

## License

As libxmp is LGPL 2.1 licensed all code derived from libxmp and libxmp itself remain under that licsense. Especially the libxmp.js file, which is basicly libxmp (plus a wrapper) compiled to javascript.
You can find a copy of the license text in the libxmp folder of the repository.

The code not derived from libxmp is MIT (X11) licensed.
License text below:

>Copyright © 2013 Simon Gündling.
>
>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
