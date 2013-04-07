#include "wrapper.h"

#ifdef __cplusplus
extern "C" {
#endif

void* initialize_player(char* filename) {
  player* p = new player(filename);
  if (p->valid()) {
    return p;
  }

  free_player(p);
  return NULL;
}

buf_wrap* read_from_player(void* ptr) {
  player* p = reinterpret_cast<player*>(ptr);
  return p->read();
}

void free_buffer(buf_wrap* ptr) {
  delete[] (float*)ptr->buf;
  delete ptr;
}

void free_player(void* ptr) {
  if (ptr != NULL) {
    delete reinterpret_cast<player*>(ptr);
  }
}

#ifdef __cplusplus
} /* extern "C" */
#endif
