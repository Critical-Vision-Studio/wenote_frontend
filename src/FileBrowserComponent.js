import React from 'react';
import { getData, handlePromise, RequestMethodType } from "./utils";

export default function FileBrowserComponent({repo_name, branch_name, setNotePath}) {
    const [filePaths, setFilePaths] = React.useState([]);
    const [selectedFile, setSelectedFile] = React.useState(null);
    
    React.useEffect(() => {
        let api_route = ["get-note-names"];
        let request_options = {method: RequestMethodType.GET, mode: "cors",};
        let request_params = { 
          repo_name:repo_name,
          branch_name:branch_name,
         };
    
        let [promise, abortRequest] = getData(api_route, true, request_params, request_options);
        handlePromise(promise,
          (response) => { setFilePaths(response.body.notes); },
          (response) => { setFilePaths([]); },
          "FileBrowserComponent"
        );
    
        return abortRequest;
    }, [repo_name, branch_name]);

    const handleFileSelect = (file_path) => {
        setSelectedFile(file_path);
        setNotePath(file_path);
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
            </div>
            <ul className="file-browser">
                {list_items.length > 0 ? list_items : <li className="empty-message">No files found</li>}
            </ul>
        </div>
    );
};
