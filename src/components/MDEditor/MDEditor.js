import React from "react";
import MDEditor from '@uiw/react-md-editor';

const MarkdownEditor = ({value, onChange}) => {
  return (
    <div className="container">
      <MDEditor
        value={value}
        onChange={onChange}
      />
      {/* <MDEditor.Markdown source={value} /> */}
    </div>
  );
};

export default MarkdownEditor;