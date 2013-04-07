#include "sys/types.h"

#include "player.h"

player::player(char* filename):
  failed_(false)
{
  context_ = xmp_create_context();
  if (xmp_load_module(context_, filename) != 0) {
    failed_ = true;
    xmp_free_context(context_);
    return;
  }
  xmp_start_player(context_, 44100, XMP_FORMAT_MONO);
}

player::~player() {
  if (context_ != NULL) {
    xmp_end_player(context_);
    xmp_release_module(context_);
    xmp_free_context(context_);
  }
}

buf_wrap* player::read() {
  buf_wrap* ret = new buf_wrap();
  ret->buf = NULL;
  ret->size = 0;

  // read next frame if available
  if (xmp_play_frame(context_) == 0) {
    xmp_get_frame_info(context_, &frame_info_);

    if (frame_info_.loop_count > 0) {
      return ret;
    }

    ret->buf = frame_info_.buffer;
    ret->size = frame_info_.buffer_size;
  }

  convertToFloat(ret);
  return ret;
}

void player::convertToFloat(buf_wrap* in_wrap) {
  int count = (in_wrap->size / 2);
  int16_t* in = reinterpret_cast<int16_t*>(in_wrap->buf);
  float* out = new float[count];
  for (int i = 0; i < count; i++) {
    out[i] = in[i] / 32768.0f;
  }

  in_wrap->size = in_wrap->size * 2;
  in_wrap->buf = out;
}

bool player::valid() {
  return !failed_;
}
