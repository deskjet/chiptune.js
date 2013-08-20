#include <stdio.h>
#include <stdlib.h>
#include "wrapper.h"

int main(void) {
  FILE *f = fopen("../test.mod", "rb");
  fseek(f, 0, SEEK_END);
  int fsize = ftell(f);
  fseek(f, 0, SEEK_SET);

  void *data = malloc(fsize);
  fread(data, fsize, 1, f);
  fclose(f);

  char* filename = write_to_file(data, fsize);
  void* p = initialize_player(filename);
  if (p == NULL) {
    fprintf(stderr, "failed initializing player\n");
    return 1;
  }

  buf_wrap* buf;
  while(true) {
    buf = read_from_player(p);
    if (buf->buf == NULL || buf->size == 0) {
      fprintf(stderr, "failed reading from player\n");
      free_buffer(buf);
      break;
    }

    fwrite(buf->buf, buf->size, 1, stdout);
    free_buffer(buf);
  }
  free_player(p);
}
