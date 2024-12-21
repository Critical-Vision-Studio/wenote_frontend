import React from "react";
import FileBrowserComponent from "./FileBrowserComponent";
import EditorComponent from "./EditorComponent";
import ServerModeDisplay from "./ServerModeDisplay";

export default function App() {
  const [note_path, setNotePath] = React.useState("");
  const [branch_name, setBranchNme] = React.useState("master");
  const [commit_id, setCommitId] = React.useState("HEAD");

  console.log(`new note path is ${note_path}`);
  return (
    <>
      <div class="left-sidebar-grid">
      <header id="server_mode" class="header">
        <ServerModeDisplay/>
      </header>
      <main id="root" class="main-content">
        <EditorComponent note_path={note_path} branch_name={branch_name} commit_id={commit_id} setBranchNme={setBranchNme} setCommitId={setCommitId} />
      </main>
      <section id="left-sidebar" class="left-sidebar">
        <FileBrowserComponent branch_name={branch_name} setNotePath={setNotePath} />
      </section>
      <footer class="footer">
        Footer
      </footer>
      </div>
    </>
  );
}