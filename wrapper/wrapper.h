#ifndef MODWRAPPER_H_
#define MODWRAPPER_H_

#include "player.h"

#ifdef __cplusplus
extern "C" {
#endif

/// Initializes the player with the given filename as source for the module.
///
/// \param  filename name of a file containing a module
/// \return  a pointer to the player object
void* initialize_player(char* filename);

/// Reads bytes from the given player.
///
/// \param player  the player to read from (initialized by initialize_player())
/// \return a buffer  containing raw music and its size
buf_wrap* read_from_player(void* ptr);

/// Free a buffer returned by read_from_player().
///
/// \param ptr  pointer to the buffer to be freed
void free_buffer(buf_wrap* ptr);

/// Frees the player.
///
/// \param player  pointer to the player to free
void free_player(void* ptr);

/// Write a buffer into a file and frees to buffer on success.
///
/// \param  ptr pointer to a buffer
/// \param  size size in bytes of the buffer
/// \return name of the file written or NULL in case of an error
char* write_to_file(void* ptr, int size);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif // MODWRAPPER_H_
