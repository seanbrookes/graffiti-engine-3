import React, { createContext, useContext, useReducer } from 'react';

const PostsStateContext = createContext();
const PostsDispatchContext = createContext();

export const usePostsState = () => {
  const context = useContext(PostsStateContext);
  if (context === undefined) {
    console.warn(`usePostsState must be used with UseContext`);
  }
  return context;
}

export const usePostsDispatch = () => {
  const context = useContext(PostsDispatchContext);
  if (context === undefined) {
    console.warn(`usePostsDispatch must be used with UseContext`);
  }
  return context;
};

export const PostsContextProvider = (props) => {
  const { children, posts = {}} = props;

  const initialState = {posts};

  const state = {
    ...initialState,
  };

  const dispatch = {
    selectPost: (id) => console.log(`edit post ${id}`)
  };

  return (
    <PostsStateContext.Provider value={state}>
      <PostsDispatchContext.Provider value={dispatch}>
        {children}
      </PostsDispatchContext.Provider>
    </PostsStateContext.Provider>
  );

};

