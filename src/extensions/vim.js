import { Extension } from '@tiptap/core';

export const VimMode = Extension.create({
  name: 'vim',

  addStorage() {
    return {
      mode: 'normal',
    };
  },

  addKeyboardShortcuts() {
    return {
      'Escape': () => {
        this.storage.mode = 'normal';
        return true;
      },
      'i': () => {
        if (this.storage.mode === 'normal') {
          this.storage.mode = 'insert';
          return true;
        }
        return false;
      },
    };
  },
}); 