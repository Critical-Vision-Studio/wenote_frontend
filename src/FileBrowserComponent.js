import React from 'react';
import { getData, handlePromise, RequestMethodType, createNote, deleteNote } from "./utils";

export default function FileBrowserComponent({repo_name, branch_name, setNotePath, refreshTrigger}) {
    const [filePaths, setFilePaths] = React.useState([]);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [isCreatingNote, setIsCreatingNote] = React.useState(false);
    const [newNoteFilename, setNewNoteFilename] = React.useState('');
    
    const refreshNotes = () => {
        // Remove any URL encoding from repo_name if present
        const cleanRepoName = repo_name.replace(/%2F/g, '/');
        
        let api_route = ["get-note-names"];
        let request_options = {method: RequestMethodType.GET, mode: "cors",};
        let request_params = { 
          repo_name: cleanRepoName,
          branch_name: branch_name,
         };
    
        let [promise, abortRequest] = getData(api_route, true, request_params, request_options);
        handlePromise(promise,
          (response) => { setFilePaths(response.body.notes); },
          (response) => { setFilePaths([]); },
          "FileBrowserComponent"
        );
    
        return abortRequest;
    };
    
    React.useEffect(() => {
        const abortRequest = refreshNotes();
        return abortRequest;
    }, [repo_name, branch_name, refreshTrigger]);

    const handleFileSelect = (file_path) => {
        setSelectedFile(file_path);
        setNotePath(file_path);
    };

    const handleCreateNoteClick = () => {
        setIsCreatingNote(true);
    };

    const handleCreateNoteSubmit = (e) => {
        e.preventDefault();
        if (!newNoteFilename) return;
        
        // First close the create note form and set up the UI
        setIsCreatingNote(false);
        
        // Add the new filename to the file list immediately
        // This shows the file in the browser before it's actually saved
        setFilePaths(prevFiles => {
            // Check if the file already exists
            if (!prevFiles.includes(newNoteFilename)) {
                return [...prevFiles, newNoteFilename].sort();
            }
            return prevFiles;
        });
        
        // Clear editor first by setting path to empty, then to new filename
        setNotePath("");
        setTimeout(() => {
            setSelectedFile(newNoteFilename);
            setNotePath(newNoteFilename);
        }, 50);
        
        setNewNoteFilename('');
        
        // The actual note creation will happen when the user saves in the editor
        // This avoids the backend error when checking if the file exists
    };

    const handleDeleteNoteClick = () => {
        if (!selectedFile) return;
        
        if (window.confirm(`Are you sure you want to delete "${selectedFile}"?`)) {
            // Remove any URL encoding from repo_name if present
            const cleanRepoName = repo_name.replace(/%2F/g, '/');
            
            deleteNote(
                cleanRepoName,
                selectedFile,
                branch_name,
                (response) => {
                    // Clear selection first, then refresh notes
                    setSelectedFile(null);
                    setNotePath('');
                    setTimeout(() => {
                        refreshNotes();
                    }, 100); // Small delay to ensure state updates propagate
                },
                (error) => {
                    console.error("Failed to delete note:", error);
                    alert("Failed to delete note. Please try again.");
                }
            );
        }
    };

    // Helper function to get file extension
    const getFileIcon = (filePath) => {
        const extension = filePath.split('.').pop().toLowerCase();
        
        switch(extension) {
            case 'md':
                return '📝';
            case 'txt':
                return '📄';
            case 'js':
            case 'jsx':
                return '⚛️';
            case 'css':
                return '🎨';
            case 'json':
                return '📊';
            case 'c':
            case 'cpp':
            case 'h':
                return '🔧';
            default:
                return '📁';
        }
    };

    const list_items = filePaths.map((file_path, index) => (
        <li 
            key={index} 
            className={selectedFile === file_path ? 'active' : ''}
            onClick={(e) => {
                e.preventDefault();
                handleFileSelect(file_path);
            }}
        >
            <span className="file-icon">{getFileIcon(file_path)}</span>
            <span className="file-name">{file_path}</span>
        </li>
    ));

    return (
        <div className="file-browser-container">
            <div className="file-browser-header">
                <h3>Files</h3>
                <div className="branch-name">{branch_name}</div>
                <div className="file-browser-actions">
                    <button 
                        className="create-note-btn"
                        onClick={handleCreateNoteClick}
                        title="Create new note"
                    >
                        + New
                    </button>
                    <button 
                        className="delete-note-btn"
                        onClick={handleDeleteNoteClick}
                        disabled={!selectedFile}
                        title="Delete selected note"
                    >
                        Delete
                    </button>
                </div>
            </div>
            
            {isCreatingNote && (
                <div className="create-note-form">
                    <form onSubmit={handleCreateNoteSubmit}>
                        <input
                            type="text"
                            placeholder="filename.md"
                            value={newNoteFilename}
                            onChange={(e) => setNewNoteFilename(e.target.value)}
                            autoFocus
                        />
                        <div className="create-note-actions">
                            <button type="submit" disabled={!newNoteFilename}>Create</button>
                            <button type="button" onClick={() => {
                                setIsCreatingNote(false);
                                setNewNoteFilename('');
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            
            <ul className="file-browser">
                {list_items.length > 0 ? list_items : <li className="empty-message">No files found</li>}
            </ul>
        </div>
    );
};
