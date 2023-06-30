import React, { createContext, useContext, useState } from "react";

export const EditorContext = createContext();

export const useEditorContext = () => useContext(EditorContext);

export const EditorProvider = ({children}) => {
  const [postList, setPostList] = useState();
  const [currentPost, setCurrentPost] = useState();

  return (
    <EditorContext.Provider value={{ postList, setPostList, currentPost, setCurrentPost }}>
      {children}
    </EditorContext.Provider>
  );
};

// const useEditorContext = () => {
//   const [state, setState] = useContext(EditorContext);

//   function addNewPost({ item }) {
//     setState(state => {
//       const newEditor = [...state.itemEditor, item];
//       return {
//         ...state,
//         itemEditor: newEditor
//       };
//     });
//   }

//   function resetEditor() {
//     setState(state => ({
//       ...state,
//       itemEditor: []
//     }));
//   }

//   return {
//     addNewPost,
//     resetEditor
//   };
// };

// const defaultContext = {
//   markdownText: "",
//   setMarkdownText: () => {},
//   currentPost: null,
// };

// export default React.createContext(defaultContext);
