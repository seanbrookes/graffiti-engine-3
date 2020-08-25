import React from 'react';
import ReactDOM from 'react-dom';
import { PostsContextProvider } from './context/PostsContext';

import {
  RecoilRoot,
} from 'recoil';

import { Main } from './Main';

ReactDOM.render(
  <RecoilRoot>
    <PostsContextProvider>
      <Main />
    </PostsContextProvider>
  </RecoilRoot>, 
  document.getElementById('root'));
