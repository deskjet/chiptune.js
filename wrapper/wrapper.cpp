#include <stdlib.h>
#include <stdio.h>

#include "wrapper.h"

#define FILENAME "/tmp/modplayjs.mod"

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

buf_wrap* read_from_player(void* ptr, bool loop) {
  player* p = reinterpret_cast<player*>(ptr);
  return p->read(loop);
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

char* write_to_file(void* ptr, int size) {
  char* filename = FILENAME;
  FILE* p = fopen(filename, "wb");
  if (p == NULL) {
    return NULL;
  }
  fwrite(ptr, size, 1, p);
  fclose(p);
  free(ptr);

  return filename;
}

#ifdef __cplusplus
} /* extern "C" */
#endif
