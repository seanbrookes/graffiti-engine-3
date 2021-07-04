import React, { useEffect, useState, useRef, useContext } from 'react';
import styled from "styled-components";
import Markdown from 'markdown-to-jsx';
// import { MarkdownEditor } from './components/MDEditor';
import { MarkedInput } from "./components";
import { Preview } from "./components";
import EditorContext from "./editorContext";
import regeneratorRuntime from 'regenerator-runtime';
import * as d3 from 'd3';
import './styles.css';
import Modal from 'react-modal';
// import CKEditor from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Link from '@ckeditor/ckeditor5-link/src/link';
// import { data } from './data/backup';
import ReactHtmlParser from 'react-html-parser';

const postsServiceEndpoint = 'http://localhost:4004/api/posts';

const AppContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  font-size: 25px;
  font-weight: 700;
  font-family: "Lato", sans-serif;
  margin-bottom: 1em;
`;

const EditorContainer = styled.div`
  width: 80%;
  border: 0;
`;

const TitleInput = styled.input`
  font-size: 18px;
  padding: .5rem;
  border: 1px solid #efefef;
  border-radius: 8px;
  width: 100%;
  display: inline-block;
  margin-right: 12px;
`;

const SaveButton = styled.button`
  font-size: 16px; 
  border: 0; 
  border-radius: 20px; 
  width: 120px; 
  background: #6777af; 
  color: #ffffff;
  cursor: pointer;

  &:hover {
    background: #0260ed;
  }
  &:active {
    background: #0141a0;
  }
`;

const SortColButton = styled.button`
  background: transparent;
  color: darkblue;
  cursor: pointer;
  border: 0;
  font-size: 18px;

  &:hover {
    background: blue;
  }
  &:active {
    background: #444444;
  }
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: 8rem 8rem 10rem auto;
`;

export const getSlug = (title) => {
  if (!title) {
    return;
  }
  // replace spaces with dashes
  // remove question marks
  return title.toLowerCase().replace(/([^a-z0-9]+)/gi, '-');
};

export const PublishForm = ({post, onSubmit, onCancel}) => {
  if (!post || !post.title) {
    console.warn('| Publish form called with no post');
    return null;
  }
  if (!post.author) {
    post.author = 'Sean Brookes';
  }
  post.publishDate = new Date();
  post.publishYear = post.publishDate.getFullYear();
  post.publishMonth = (post.publishDate.getMonth() + 1);
  post.publishDay = (post.publishDate.getDate());
  post.lastUpdate = new Date();
  post.status = 'published';
  post.slug = getSlug(post.title);
  return (
    <div>
      <div>
        <h3>Publish: {post.title}</h3>
      </div>
      <label>Author</label>
      <input onChange={() => {console.log('| author update not working for now')}} type="text" value={post.author} />
      <div>
        <button onClick={(event) => onCancel(post)}>Cancel</button>
        <button onClick={(event) => onSubmit(post)}>Publish</button>
      </div>
      <div>
        <pre>{JSON.stringify(post, null, 2)}</pre>
      </div>
    </div>
  );
};

const Main = () => {
  const [postsState, setPostsState] = useState({posts: {}, postsList: []});
  const [previewOn, setPreviewOn] = useState(false);
  const [currentPost, setCurrentPost] = useState({});
  const [sortState, setSortState] = useState({sortAscending: false, sortProp: 'lastUpdate'});
  const [isPreview, setIsPreview] = useState(false);
  const [isShowPublishModal, setIsShowPublishModal] = useState(false);

  let timer;
  const inputRef = useRef();

  const [markdownText, setMarkdownText] = useState('');

  const contextValue = {
    markdownText,
    setMarkdownText
  };
  let editorInstance = null;
  const sortAlgo = (a, b) => {
    if (sortState.sortAscending) {
      return (a[sortState.sortProp] > b[sortState.sortProp]) ? 1 : -1;
    }
    else {
      return (a[sortState.sortProp] < b[sortState.sortProp]) ? 1 : -1;
    }

   };

  useEffect(() => {
    const fetchPosts = async () => {
      const response = fetch('http://localhost:4004/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then((response) => {
        console.log('response status', response.status);
        if (response.status !== 200) {
          // console.log('|');
          // console.log('|  non 200 response', response.json());
          // console.log('|');

          throw response;
        }
        return response.json();
      })
      .then(data => {
       // console.log('Success:', data);
        if (data &&  data.sort) {
          const sortedCollection = data.sort(sortAlgo);
          const postCollectionState = sortedCollection.reduce((result, item, index) => {
            result[item.id] = item
            return result
          }, {});
          setPostsState({posts: postCollectionState, postsList: sortedCollection});  
        } 
      })
      .catch((error) => {
        error.json().then((body) => {
          console.error('| fetch posts error:', body);
        });
      });
    };

    fetchPosts();

    
  }, []);

  useEffect(() => {
    if (timer && !currentPost) {
      stopAutoSave();
    }
  }, [currentPost]);

  const sortPosts = (event) => {
    console.log('|  sortProperty 1');

    const sortAsc = !sortState.sortAscending;
    const sortProperty = event.target.value;

    setSortState({sortAscending: sortAsc, sortProp: sortProperty})

    const arrayToSort = postsState.postsList;
    const sortedCollection = arrayToSort.sort(sortAlgo);
    console.log('|  sortProperty', sortProperty);
    setPostsState({postsList: sortedCollection});
 
  };

  const onTogglePreview = () => {
    setIsPreview(!isPreview);
  };


  const updateTitle = (event) => {
    const currentTargetPost = Object.assign({}, currentPost);
    currentTargetPost.title = event.target.value;
    setCurrentPost(currentTargetPost);
  }
  const onPreview = () => {
    setPreviewOn(true);
  }
  const cancelPreview = () => {
    setPreviewOn(false);
  }
  const clearEditor = () => {
    setCurrentPost({});
    stopAutoSave();
  }
  const savePost = () => {
    if (currentPost) {
      const postToSever = async (post) => {
        const response = await fetch('http://localhost:4004/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify(post) 
        })
        .then(response => response.json())
        .then(data => {
          console.log('post Success:', data);
  
        })
        .catch((error) => {
          console.error('post Error:', error);
        });
        // return response.json();
      };
      // post the post to api
      console.log('|');
      console.log('| postToServer ', currentPost);
      console.log('|');
      if (currentPost &&  markdownText) {
        currentPost.body = markdownText;
      }
      postToSever(currentPost);
      setCurrentPost(currentPost);
  
    }
  //  const targetPost = currentPost;

  };
  const saveThisPost = (post) => {
    if (post) {
      const postToSever = async (post) => {
        const response = await fetch('http://localhost:4004/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify(post) 
        })
        .then(response => response.json())
        .then(data => {
          console.log('post Success:', data);
  
        })
        .catch((error) => {
          console.error('post Error:', error);
        });
        // return response.json();
      };
      // post the post to api
      console.log('|');
      console.log('| postToServer ', post);
      console.log('|');

      postToSever(post);
  
    }
  //  const targetPost = currentPost;

  };


  const selectPost = (event) => {
    const id = event.target.value;
    console.log(`|  id[${id}]`);
    const targetPost = (postsState.posts && postsState.posts[id]) ? postsState.posts[id] : {};

    const fetchPost = async (id) => {
      const response = await fetch(`http://localhost:4004/api/post/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then((response) => {
        if (!response.ok) {
          console.log('not ok', response.status);
          if (response.status === 404) {
            return targetPost;
          }

        }
        else {
          return response.json();
        }
      })
      .then(data => {
       console.log('Success:', data);

      // let markdown = turndownService.turndown(JSON.stringify(data.body));
      //  let markdown = data.body;
      //  console.log('|');
      //  console.log('|');
      //  console.log('|     Markdown', markdown);
      //  console.log('|');
      //  console.log('|');
      //  data.body = markdown;
       setCurrentPost(data);
       setMarkdownText(data.body);
      // startAutoSave();
       // setPostsState({posts: postCollectionState, postsList: data});
      })
      .catch((error) => {
        console.error('Error:', error);
      });
      // return response.json();
    };

    fetchPost(id);




   // setCurrentPost(targetPost);


  }
  const guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
  const startNew = () => {
    const newPost = {
      title: 'new...',
      body: 'new...',
      id: guid()
    };
    setCurrentPost(newPost);
  };
  const saveCurrentPost = () => {
    console.log('|');
    console.log('| saveCurrentPost');
    console.log('|');
  }

  const startAutoSave = () => {
    if (currentPost && !timer) {
      timer = setInterval(() => {
      // editorInstance = editor;
    //  console.log(editorInstance.getData());

       // const theCurrentPost = Object.assign({}, currentPost);
       // theCurrentPost.body = editorInstance.getData();
        // setTimeout(() => {
          savePost();
        // }, 1);
        // const postData = ClassicEditor.getData();
        console.log('autosave current post', currentPost.body);
      }, 10000);
    }
    else {
      console.log('| Autosave is already running');
    }
  };
  const stopAutoSave = () => {
    if (timer) {clearTimeout(timer)}
  };
  const resetThisPostToDraft = (post) => {
    if (post) {
      post.status = 'draft';
      delete post.publishDate;
      delete post.publishYear;
      delete post.publishMonth;
      delete post.publishDay;
      delete post.slug;
      setCurrentPost(post);
      saveThisPost(post);

    }

  };
  const initializePublishFlow = (post) => {
    setCurrentPost(post);
    setIsShowPublishModal(true);
    // we need to show a view to allow us to capture
    // author
    // final post title
  };

  const onDoSomethingToAPost = (event, post) => {
    const action = event.target.value;
    if (action && post && post.id) {
      if (action === 'delete') {
        if (confirm(`do you really want to delete ${post.title}?`)) {
          console.log(`|  delete this mother: ${post.title}`);
        }
      }
      if (action === 'publish') {
        if (confirm(`do you really want to publish ${post.title}?`)) {
          console.log(`|  publish this mother: ${post.title}`);
          initializePublishFlow(post);
        }        
      }
      if (action === 'reset') {
        resetThisPostToDraft(post);
      }
    }
  };


  const onEditPost = (postBody) => {
    if (currentPost) {
      // console.log('EDIT POST', postBody);
      // const theCurrentPost = Object.assign({}, currentPost);
      // theCurrentPost.body = postBody;
      setCurrentPost((prevState) => {return {...currentPost, body: postBody}});  
    }
  };


  const onSubmitPublishPost = (post) => {
    console.log('|  Submit this post', post.title);
    if (post) {
      const postToSever = async (post) => {
        const response = await fetch('http://localhost:4004/api/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify(post) 
        })
        .then(response => response.json())
        .then(data => {
          console.log('PUBLISH Success:', data);
  
        })
        .catch((error) => {
          console.error('PUBLISH Error:', error);
        });
        // return response.json();
      };


      // post the post to api
      console.log('|');
      console.log('| PUBLISH ', post);
      console.log('|');

      postToSever(post);
      setCurrentPost({});
  
    }
  };
  const onCancelPublishPost = (post) => {
    console.log('|  Cancel publish post', post.title);
  };

  const postGridCells = postsState && postsState.postsList && postsState.postsList.map((post, index) => {
    //var s = new Date(post.lastUpdate).toLocaleString("en-US")
    var s = new Date(post.lastUpdate);
    return (
      <>
        <div>
          <select value={''} onChange={(event) => onDoSomethingToAPost(event, post)}>
            <option value=''></option>
            <option value='delete'>delete</option>
            <option value='publish'>publish</option>
            <option value='reset'>reset</option>
          </select>
        </div>
        <div>{post.status}</div>
        <div>
          <div>{`${s.toDateString()}`}</div>
        </div>
        <div>
          <button style={{fontSize: '16px', cursor: 'pointer', textDecoration: 'underline', border: 0, background: 'transparent', color: 'blue'}} onClick={selectPost} value={post.id}>{post.title}</button>
        </div>
      </>
    );

  });
  const toggleEditorViewText = isPreview ? 'edit' : 'prev';



  return (
    <EditorContext.Provider value={contextValue}>
      <AppContainer>
        <header style={{width: '100%',  display: 'flex', justifyContent:'space-between'}}>
          <h2 style={{marginLeft: '12px', fontSize: '16px', color: '#777777'}}>Graffiti Engine</h2>
          <button style={{cursor: 'pointer', fontSize: '16px', color: 'blue', background: 'transparent', border: 0, display: 'inline-block', marginRight: '12px'}} onClick={startNew}>New</button>
        </header>

        {/* 
        
          EDITOR

        */}
        {currentPost && currentPost.id && <EditorContainer>
          <div style={{display: 'flex', width: '100%', justifyContent: 'flex-start'}}>
            <TitleInput type="text" value={currentPost.title} onChange={updateTitle} />
            <button onClick={onTogglePreview} style={{background: 'transparent', border: '1px solid #dddddd', cursor: 'pointer', display: 'inline-block', padding: '.3rem', borderRadius: '10px'}} >{toggleEditorViewText}</button> 
          </div>  
          {/*

            EDITOR / PREVIEW

          */}
          {isPreview ? <Preview /> : <MarkedInput />}
          <div style={{padding: '1rem', display: 'flex', justifyContent:'flex-end'}}>
            <button style={{fontSize: '16px', background:'transparent', border: 0, display:'inline-block', margin: '16px'}} onClick={clearEditor}>cancel</button>
            <SaveButton onClick={savePost}>Save</SaveButton>
          </div>
        </EditorContainer>
      }

      {/* 
      
        POSTS

      */}
      <div style={{ padding: '1rem', border: '1px solid #eeeeee', borderRadius: '25px'}}>
        {/* {currentPost && currentPost.id && <Markdown>{currentPost.body}</Markdown>} */}
        <h3>posts</h3>
        <PostsGrid>
          <div></div>
          <div>status</div>
          <div>
            <SortColButton value="lastUpdate" onClick={sortPosts}>last update</SortColButton>
          </div>
          <div>
            <SortColButton value="title" onClick={sortPosts}>title</SortColButton>
          </div>
          {postGridCells}
        </PostsGrid>
        
        
        /* 

          Modal

          PUBLISH FORM


        */
        <Modal appElement={document.getElementById('root')}
          isOpen={isShowPublishModal}>
          <PublishForm post={currentPost} onSubmit={onSubmitPublishPost} onCancel={onCancelPublishPost} />
        </Modal>
      </div>
      </AppContainer>
      </EditorContext.Provider>
  );
};

export { Main };
