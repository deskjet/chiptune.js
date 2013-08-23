#ifndef MODPLAYER_H_
#define MODPLAYER_H_

#include "xmp.h"

#ifndef NULL
#define NULL 0
#endif

struct buf_wrap {
  void* buf;
  int size;
};

class player {
 public:
  /// Initializes the context and loads a module.
  player(char* filename);

  virtual ~player();

  /// Request for the next chunk of raw music.
  buf_wrap* read(bool loop);

  /// Checks if this object is usable
  bool valid();

 private:
  /// libxmp context
  xmp_context context_;

  /// last loop count
  int last_loop_;

  /// Set to false if anything goes wrong.
  bool failed_;

  /// Used to store frameinfo data.
  xmp_frame_info frame_info_;

  /// Convert a buffer of 16-bit inter samples into float samples.
  void convertToFloat(buf_wrap* in_wrap);
};

#endif // MODPLAYER_H_
