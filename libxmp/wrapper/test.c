#include <stdio.h>
#include "wrapper.h"

int main(void) {
  void* p = initialize_player("test.mod");
  if (p == NULL) {
    fprintf(stderr, "failed initializing player\n");
    return 1;
  }

  buf_wrap* buf = read_from_player(p);
  if (buf->buf == NULL || buf->size == 0) {
    fprintf(stderr, "failed reading from player\n");
    return 1;
  }

  fwrite(buf->buf, buf->size, 1, stdout);

  free_buffer(buf);
  free_player(p);
}
