#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    // Build the command string to run npx.cmd
    char cmd[16384] = "npx.cmd";
    for (int i = 1; i < argc; i++) {
        // Simple escaping check for arguments containing spaces
        if (strchr(argv[i], ' ') != NULL) {
            strcat(cmd, " \"");
            strcat(cmd, argv[i]);
            strcat(cmd, "\"");
        } else {
            strcat(cmd, " ");
            strcat(cmd, argv[i]);
        }
    }
    
    // Execute npx.cmd via the command processor
    return system(cmd);
}
