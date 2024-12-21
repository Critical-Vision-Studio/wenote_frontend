import React from 'react';
import { getData, handlePromise, RequestMethodType } from "./utils";

export default function FileBrowserComponent({branch_name, setNotePath}) {
    const [filePaths, setFilePaths] = React.useState([]);
    
    React.useEffect(() => {
        let api_route = ["get-note-names"];
        let request_options = {method: RequestMethodType.GET, mode: "cors",};
        let request_params = { 
          branch_name:branch_name,
         };
    
        let [promise, abortRequest] = getData(api_route, true, request_params, request_options);
        handlePromise(promise,
          (response) => { setFilePaths(response.body.notes); },
          (response) => { setFilePaths([]); },
          "FileBrowserComponent"
        );
    
        return abortRequest;
      }, [branch_name]);

    let list_items = filePaths.map((file_path,index) => <li key={index} onClick={(e)=>{e.preventDefault();console.log(file_path);setNotePath(file_path)}}>{file_path}</li>);
    return (<ul> {list_items} </ul>);
};