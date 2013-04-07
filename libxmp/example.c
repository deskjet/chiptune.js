#include <stdio.h>
#include <stdlib.h>
#include <xmp.h>

int main(int argc, char **argv)
{
    xmp_context c;
    struct xmp_frame_info mi;
    FILE *f;

    /* The output raw file */
    f = fopen("out.raw", "wb");
    if (f == NULL) {
        fprintf(stderr, "can't open output file\n");
        exit(EXIT_FAILURE);
    }

    /* Create the player context */
    c = xmp_create_context();

    /* Load our module */
    if (xmp_load_module(c, argv[1]) != 0) {
        fprintf(stderr, "can't load module\n");
        exit(EXIT_FAILURE);
    }

    /* Play the module */
    xmp_start_player(c, 44100, 0);
    while (xmp_play_frame(c) == 0) {
        xmp_get_frame_info(c, &mi);

        if (mi.loop_count > 0)    /* exit before looping */
            break;

        fwrite(mi.buffer, mi.buffer_size, 1, stdout);  /* write audio data */
    }
    xmp_end_player(c);
    xmp_release_module(c);        /* unload module */
    xmp_free_context(c);          /* destroy the player context */

    fclose(f);

    exit(EXIT_SUCCESS);
}
