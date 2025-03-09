import React from "react";
import FileBrowserComponent from "./FileBrowserComponent";
import EditorComponent from "./EditorComponent";
import ServerModeDisplay from "./ServerModeDisplay";

export default function App() {
  const [note_path, setNotePath] = React.useState("");
  const [branch_name, setBranchNme] = React.useState("master");
  const [commit_id, setCommitId] = React.useState("HEAD");
  // TODO: get av repos for user.
  console.log(`new note path is ${note_path}`);
  
  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  };
  
  return (
    <div className="left-sidebar-grid">
      <header className="header">
        <ServerModeDisplay/>
      </header>
      <main className="main-content">
        <EditorComponent note_path={note_path} branch_name={branch_name} commit_id={commit_id} setBranchNme={setBranchNme} setCommitId={setCommitId} />
      </main>
      <section className="left-sidebar">
        <FileBrowserComponent repo_name={"%2Fwenote-repo"} branch_name={branch_name} setNotePath={setNotePath} />
      </section>
      <footer className="footer">
        <div className="footer-left">
          {note_path && <span className="footer-file-path">{note_path}</span>}
        </div>
        <div className="footer-right">
          <span className="footer-branch">Branch: {branch_name}</span>
          <span className="footer-datetime">{getCurrentDateTime()}</span>
        </div>
      </footer>
    </div>
  );
}
