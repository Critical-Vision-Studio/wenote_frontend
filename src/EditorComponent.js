import React from "react";
import MDEditor from '@uiw/react-md-editor';
import { getData, handlePromise, RequestMethodType } from "./utils";

async function sendNodeUpdateRequest(note_path, branch_name, commit_id, note_value, onSuccessCallback, onFailureCallback)
{
  if(!note_path || !branch_name || !commit_id){
    console.log(`Note Update Prevented: arguments empty note_path:${note_path} branch_name:${branch_name} commit_id:${commit_id}`);
    return;
  }
  console.log(`sendNodeUpdateRequest:note_value: ${note_value}`);

  let api_route = ["update-note"];
  let request_options = {method: RequestMethodType.PUT, mode: "cors",};
  let request_params = { 
    note_path:note_path,
    note_value:note_value,
    commit_id:commit_id,
    branch_name:branch_name,
   };

  let [promise, abortRequest] = getData(api_route, false, request_params, request_options);
  handlePromise(promise, onSuccessCallback, onFailureCallback,"EditorComponent update-note" );

  return abortRequest;
}

function effectGetNote(note_path, branch_name, setNoteText, setCommitId)
{
  if(!note_path || !branch_name){
    console.log(`Note Fetch Prevented: arguments empty note_path:${note_path} branch_name:${branch_name}`);
    return;
  }
  console.log(`${note_path} ${branch_name}`);
  let api_route = ["get-note"];
  let request_options = {method: RequestMethodType.GET, mode: "cors",};
  let request_params = { 
    note_path:note_path,
    branch_name:branch_name,
   };

  let [promise, abortRequest] = getData(api_route, true, request_params, request_options);
  handlePromise(promise,
      (response) => { setNoteText(response.body.note); setCommitId(response.body.commit_id);},
      (response) => { setNoteText(`Request failed with: ${JSON.stringify(response.error)}`); },
      "EditorComponent get-note"
  );

  return abortRequest;
}

function effectAddEventListenerUpdateNote(note_path, 
                                          branch_name, commit_id, 
                                          setBranchNme, setCommitId, 
                                          componentNodeRef, 
                                          noteText, setNoteText, 
                                          nodeUpdateRequestAbortCallback)
{
    // main source:    https://bobbyhadz.com/blog/react-functional-component-add-event-listener
    // extra examples: https://blog.logrocket.com/complete-guide-react-refs/#creating-refs-using-createref-hook
    // custom events:  https://stackoverflow.com/questions/64032647/event-listener-for-multiple-keys-in-react

    console.log(`useeffect fire! ${noteText}`);
    // componentNodeRef is already non-null here 
    // because this function is ran after the mount event
    const element = componentNodeRef.current;
    if (!element)
    {
      // no element - no editor - nothing to update
      return;
    }

    var handleNoteUpdateEvent = event => {

      if ((event.metaKey || event.ctrlKey) && event.code === 'KeyS')
      {
          event.preventDefault();
          event.stopPropagation();
          console.log(`fire! ${noteText}`);
          // setting to captured data member 
          nodeUpdateRequestAbortCallback.current = sendNodeUpdateRequest(note_path, branch_name, commit_id, noteText, 
                                            (response) => { setNoteText(response.body.note); setBranchNme(response.body.branch_name); setCommitId(response.body.commit_id); },
                                            (response) => { setNoteText(`Request failed with: ${JSON.stringify(response.error)}`); }
                                          );
      }
    };
    
    element.addEventListener('keydown', handleNoteUpdateEvent);

    return () => {
      // stop update request on demount: does it make sense?
      if (nodeUpdateRequestAbortCallback)
      {
        //nodeUpdateRequestAbortCallback.current();
        console.log(nodeUpdateRequestAbortCallback.current);
        nodeUpdateRequestAbortCallback.current = null;
      }
      element.removeEventListener('keydown', handleNoteUpdateEvent);
    };
}

export default function EditorComponent({note_path, branch_name, commit_id, setBranchNme, setCommitId}) {
  // STATE
  var [noteText, setNoteText] = React.useState("");
  
  // REFS - just persistant data members, do not trigger re-rendering
  
  // is set auto-magically by React because it is used 
  // as "ref" attribute of the returned component
  const componentNodeRef = React.useRef(null); 
  const nodeUpdateRequestAbortCallback = React.useRef(null); 

  // EFFECTS
  React.useEffect(() => effectGetNote(note_path, branch_name, setNoteText, setCommitId), [note_path, branch_name]);
  React.useEffect(() => effectAddEventListenerUpdateNote(note_path, branch_name, 
                                                          commit_id, setBranchNme, 
                                                          setCommitId, componentNodeRef, 
                                                          noteText, setNoteText, 
                                                          nodeUpdateRequestAbortCallback), [note_path, branch_name, noteText]);
  // END EFFECTS
  
  // LOGIC
  if(!branch_name){
    return (<div> Please choose a branch. </div>);
  }

  if(!note_path){
    return (<div> Please create or choose a note. </div>);
  }

  return (
    <div className="editor-container" ref={componentNodeRef}>
      <MDEditor
        value={noteText}
        height="100%"
        // minHeight={50}
        visibleDragbar={false}
        onChange={(value) => {setNoteText(value); console.log(`INSIDE MDEDIT CALL noteText: ${noteText}`);}}
      />
    </div>
  );
  // pure field> <MDEditor.Markdown source={noteText} style={{ whiteSpace: 'pre-wrap' }} />
}