function ChiptunePlayer(destination) {
  this.output = destination;
}

ChiptunePlayer.prototype.fileCounter = 0;

ChiptunePlayer.prototype.generateFilename = function() {
  return "modfile" + this.fileCounter++;
}

ChiptunePlayer.prototype.load = function load(input, loop, cb) {
  var onFileReady = function onFileReady() {
    this.player_ptr = this.xmp.init(this.path);
    if (this.player_ptr == 0) {
      try { FS.deleteFile(this.path); } catch(err) {};
      return cb("could not initialize player");
    };

    this.xmp.player_data[this.player_ptr] = {
      'stop': true,
      'pause': false,
      'looping': !!loop
    };

    return cb();
  }.bind(this);

  if (input instanceof File) {
    var filename = this.generateFilename();
    this.path = "/" + filename;

    var reader = new FileReader();
    reader.onload = function() {
      FS.createDataFile('/', filename, new Int8Array(reader.result), true, true);
      onFileReady();
    }
    reader.readAsArrayBuffer(input);
  }

  if (typeof input === "string") {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', input, true);
    xhr.responseType = 'arraybuffer';

    var filename = this.generateFilename();
    this.path = "/" + filename;

    xhr.onload = function(e) {
      FS.createDataFile('/', filename, new Int8Array(xhr.response), true, true);
      onFileReady();
    };

    xhr.send();
  }
};


// clean up; player will be useless after this
ChiptunePlayer.prototype.unload = function() {
  var initialized = this.xmp.player_data[this.player_ptr] || false;
  var paused = this.xmp.player_data[this.player_ptr].pause;
  var playing = initialized && !paused;

  // mute - can't harm in any case
  this.pause();

  if (initialized) {
    // stop on next chunk and prevent resume
    this.xmp.player_data[this.player_ptr].stop = true;
  }

  if (!playing) {
    // not playing, so stop flag won't work - clean now
    this.xmp.free_player(this.player_ptr);
    delete this.xmp.player_data[this.player_ptr];
  }
};

// play if not started / resume if paused
ChiptunePlayer.prototype.play = function() {
  if (this.isPaused() && !this.isStopped()) {
    this.resume();
  } else if (this.isStopped()) {
    this.xmp.player_data[this.player_ptr].stop = false;
    this.xmp.play.bind(this)(this.player_ptr, 0, true);
  }
};

// pause playing
ChiptunePlayer.prototype.pause = function() {
  this.xmp.pause.bind(this)(this.player_ptr);
};

// resume from pause (you probably want to user play())
ChiptunePlayer.prototype.resume = function() {
  this.xmp.resume.bind(this)(this.player_ptr);
};

// en/disable looping
ChiptunePlayer.prototype.setLooping = function(looping) {
  this.xmp.setLooping.bind(this)(this.player_ptr, looping);
};

// true if player paused
ChiptunePlayer.prototype.isPaused = function() {
  return this.xmp.isPaused.bind(this)(this.player_ptr);
};


// true if player stopped or hasn't ever started
ChiptunePlayer.prototype.isStopped = function() {
  return this.xmp.isStopped.bind(this)(this.player_ptr);
};

ChiptunePlayer.prototype.xmp = {
  init: Module.cwrap('initialize_player', 'number', ['string']),
  read: Module.cwrap('read_from_player', 'number', ['number', 'bool']),
  free_buffer: Module.cwrap('free_buffer', 'null', ['number']),
  free_player: Module.cwrap('free_player', 'null', ['number']),
  player_data: {},
  get_audio_source: function(player_ptr) {
    // Helper: Read one chunk from player
    var get_buffer = function(player_ptr) {
      // Helper: Retreive data from buffer as Float32Array
      var get_data = function(buf_ptr) {
        var data_ptr = Module.getValue(buf_ptr, '*');
        var size = Module.getValue(buf_ptr + 4, 'i32');
        if (size == 0  || data_ptr == 0) return;

        var i8Array = Module.HEAP8.subarray(data_ptr, data_ptr + size);
        return new Float32Array(i8Array.buffer, data_ptr, size / 4);
      }

      var buf_ptr = this.xmp.read(player_ptr, this.xmp.player_data[player_ptr].looping);
      var ret = get_data(buf_ptr);
      this.xmp.free_buffer(buf_ptr);
      return ret;
    }.bind(this);

    // Append a number of audio chunks
    var raw_audio = get_buffer(player_ptr);
    if (raw_audio === undefined) return;

    for (var i = 0; i < 19; i++) {
      var new_data = get_buffer(player_ptr);
      if (new_data === undefined) break;
      var old_data = raw_audio;
      raw_audio = new Float32Array(old_data.length + new_data.length);
      raw_audio.set(old_data, 0);
      raw_audio.set(new_data, old_data.length);
    }
    delete new_data;
    delete old_data;

    // Create a JS AudioBuffer
    var audio_buffer = context.createBuffer(1, raw_audio.length, 44100);
    audio_buffer.getChannelData(0).set(raw_audio);

    // Put it into a JS BufferSource
    var source = context.createBufferSource();
    source.buffer = audio_buffer;
    source.connect(this.output);
    return source;
  },
  play: function(player_ptr, last_chunk_start, first_run, fixed_time) {
    // Fill buffer on first run
    if (first_run) {
      this.xmp.player_data[player_ptr].next_src = this.xmp.get_audio_source.bind(this)(player_ptr);
    }

    // Check for stop-flag or no more data
    // -> clean up
    if (this.xmp.player_data[player_ptr].stop === true
        || this.xmp.player_data[player_ptr].next_src === undefined) {
      this.xmp.free_player(this.player_ptr);
      delete this.xmp.player_data[player_ptr];
      return;
    }

    // play!
    if (!this.xmp.player_data[player_ptr].pause) {
      var last_chunk_duration = first_run ? 0 : this.xmp.player_data[player_ptr].current_src.buffer.duration;
      var current_chunk_start = first_run ? context.currentTime : last_chunk_start + last_chunk_duration;
      if (fixed_time) {
        current_chunk_start = fixed_time;
      }
      this.xmp.player_data[player_ptr].last_src = this.xmp.player_data[player_ptr].current_src;
      this.xmp.player_data[player_ptr].current_src = this.xmp.player_data[player_ptr].next_src;

      this.xmp.player_data[player_ptr].current_src.start(current_chunk_start);
      this.xmp.player_data[player_ptr].current_src.timeScheduled = current_chunk_start;

      // schedule next chunk
      var current_chunk_duration = this.xmp.player_data[player_ptr].current_src.buffer.duration;
      var next_play = first_run ? (current_chunk_duration * 1000) / 2 : (current_chunk_duration * 1000);
      var timerId = setTimeout(this.xmp.play.bind(this, player_ptr, current_chunk_start), next_play);
      this.xmp.player_data[player_ptr].timerId = timerId;

      // fill buffer while playing
      this.xmp.player_data[player_ptr].next_src = this.xmp.get_audio_source.bind(this)(player_ptr);
    }
  },
  pause: function(player_ptr) {
    // stop/unschedule everything and save current time
    if (this.xmp.player_data[player_ptr]) {
      this.xmp.player_data[player_ptr].last_src && this.xmp.player_data[player_ptr].last_src.stop(0);
      this.xmp.player_data[player_ptr].current_src && this.xmp.player_data[player_ptr].current_src.stop(0);
      this.xmp.player_data[player_ptr].pause = context.currentTime;
      clearTimeout(this.xmp.player_data[player_ptr].timerId);
    }
  },
  resume: function(player_ptr) {
    // only resume if paused and not stopped
    if (this.xmp.player_data[player_ptr] && this.xmp.player_data[player_ptr].pause && !this.xmp.player_data[player_ptr].stop) {
      // calculate point in buffer at the time the player paused
      var current_offset = this.xmp.player_data[player_ptr].pause - this.xmp.player_data[player_ptr].current_src.timeScheduled;
    var start_time = 0;

      // play buffer from calculated point
      if (current_offset > 0 && current_offset < this.xmp.player_data[player_ptr].current_src.buffer.duration) {
        var new_src = context.createBufferSource();
        new_src.buffer = this.xmp.player_data[player_ptr].current_src.buffer;
        new_src.connect(this.output);
        new_src.start(0, current_offset);
      start_time = context.currentTime + this.xmp.player_data[player_ptr].current_src.buffer.duration - current_offset;
      }

      // unpause
      this.xmp.player_data[player_ptr].pause = undefined;

      // continue normally
      this.xmp.play.bind(this)(player_ptr, 0, false, start_time);
    }
  },
  setLooping: function(player_ptr, looping) {
    this.xmp.player_data[player_ptr].looping = looping;
  },
  isPaused: function(player_ptr) {
    try {
      return this.xmp.player_data[player_ptr].pause ? true : false;
    } catch (err) {
      return false;
    }
  },
  isStopped: function(player_ptr) {
    try {
      return this.xmp.player_data[player_ptr].stop ? true : false;
    } catch (err) {
      return true;
    }
  }
};
