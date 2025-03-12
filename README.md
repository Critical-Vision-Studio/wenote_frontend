# Wenote Frontend

This is the frontend application for Wenote, a web-based note-taking application.

## Features

Wenote provides a seamless note-taking experience with the following features:

### Browsing Your Notes

The file browser panel displays all your notes stored in the repository. You can:
- View a list of all available notes
- Select any note to open it in the editor
- See different file types with distinct icons for easy identification

### Reading Notes

When you select a note from the file browser:
- The note content loads automatically in the editor
- The editor preserves formatting and code syntax highlighting
- You can view the note without making any changes

### Editing Notes

The editor provides a rich text editing experience:
- Edit note content with a modern text editor
- Format text using the toolbar (bold, italic, headings, lists)
- Add code blocks with syntax highlighting for various programming languages
- Changes are saved to the server when you finish editing

### Creating New Notes

To create a new note:
- Click the "+ New" button in the file browser header
- Enter a filename with appropriate extension (e.g., .md, .txt) in the form that appears
- Click "Create" to create the note
- The new note will be selected automatically, and you can begin editing it in the editor
- Click "Save" to save your new note to the repository

### Deleting Notes

To remove notes you no longer need:
- Select the note in the file browser
- Click the "Delete" button in the file browser header
- Confirm deletion when prompted in the dialog
- The note will be permanently removed from the repository

### Vim Mode

For advanced users:
- Toggle Vim mode for keyboard-driven editing
- Use familiar Vim commands to navigate and edit text
- Switch between normal and Vim modes at any time

## Organization

Notes are organized in a flat file structure, displayed in the file browser panel. Different file types are represented by appropriate icons to make navigation easier.

## Automatic Saving

The application saves your changes automatically when:
- You navigate away from a note
- You manually trigger a save
- After a period of inactivity while editing

All changes are safely stored in the Git repository, allowing you to track the history of your notes. 