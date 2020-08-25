import React, { useEffect, useState } from 'react';
import regeneratorRuntime from 'regenerator-runtime';
import * as d3 from 'd3';
import './styles.css';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Link from '@ckeditor/ckeditor5-link/src/link';
// import { data } from './data/backup';
import ReactHtmlParser from 'react-html-parser';

const postsServiceEndpoint = 'http://localhost:4004/api/posts';


const Main = () => {
  const [postsState, setPostsState] = useState({posts: {}, postsList: []});
  const [previewOn, setPreviewOn] = useState(false);
  const [currentPost, setCurrentPost] = useState({});
  const [sortState, setSortState] = useState({sortAscending: false, sortProp: 'lastUpdate'});

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
      const response = await fetch('http://localhost:4004/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => response.json())
      .then(data => {
       // console.log('Success:', data);

        const sortedCollection = data.sort(sortAlgo);
        const postCollectionState = sortedCollection.reduce((result, item, index) => {
          result[item.id] = item
          return result
        }, {});
        setPostsState({posts: postCollectionState, postsList: sortedCollection});
      })
      .catch((error) => {
        console.error('Error:', error);
      });
      // return response.json();
    };

    fetchPosts();

    
  }, []);

  const sortPosts = (event) => {
    console.log('|  sortProperty 1');

    const sortAsc = !sortState.sortAscending;
    const sortProperty = event.target.value;

    setSortState({sortAscending: sortAsc, sortProp: sortProperty})

    const arrayToSort = postsState.postsList;
    const sortedCollection = arrayToSort.sort(sortAlgo);
    console.log('|  sortProperty', sortProperty);
    setPostsState({postsList: sortedCollection});
 
  }

  const onEditPost = (event) => {
    //console.log('EDIT POST', event.target.value);
    const theCurrentPost = Object.assign({}, currentPost);
    theCurrentPost.body = event.target.value;
    // setCurrentPost(theCurrentPost);
  }
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
  }
  const savePost = ({post}) => {
    let targetPost = null;
    if (post) {
      targetPost = post;
    }
    else {
      targetPost = currentPost;
    }
    const postToSever = async (targetPost) => {
      const response = await fetch('http://localhost:4004/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(targetPost) 
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
    if (!targetPost) {
      return null;
    }
    // post the post to api
    postToSever(targetPost);
  //  const targetPost = currentPost;

  }


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
          return response.json()
        }
      })
      .then(data => {
       console.log('Success:', data);
       setCurrentPost(data);
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

  const postListItems = postsState && postsState.postsList && postsState.postsList.map((post) => {
    var s = new Date(post.lastUpdate).toLocaleString("en-US")
    return (
      <tr key={post.id}>
        <td>{s}</td>
        <td>
          <button style={{fontSize: '16px', cursor: 'pointer', textDecoration: 'underline', border: 0, background: 'transparent', color: 'blue'}} onClick={selectPost} value={post.id}>{post.title}</button>
        </td>
      </tr>
    );

  });
  const handleEditorChange = (event, editor) => {
    editorInstance = editor;
   // console.log(editorInstance.getData());
    const theCurrentPost = Object.assign({}, currentPost);
    theCurrentPost.body = editorInstance.getData();
    setTimeout(() => {
      savePost(theCurrentPost);
    }, 1);

    //  const theCurrentPost = Object.assign({}, currentPost);
    //  theCurrentPost.body = editor.getData();
    //  setCurrentPost(theCurrentPost);
    //  editor.editing.view.focus();
    return;
   };
   const handleEditorBlur = (event, editor) => {
    // console.log(editor.getData());
     const theCurrentPost = Object.assign({}, currentPost);
     theCurrentPost.body = editor.getData();
     setCurrentPost(theCurrentPost);
     editor.editing.view.focus();
   };
  const EditorComponent = ({post, onPreview}) => {

    useEffect(() => {
      let timer;
      if (editorInstance) {
        timer = setInterval(() => {
          // editorInstance = editor;
        //  console.log(editorInstance.getData());
          const theCurrentPost = Object.assign({}, currentPost);
          theCurrentPost.body = editorInstance.getData();
          setTimeout(() => {
            savePost(theCurrentPost);
          }, 1);
          // const postData = ClassicEditor.getData();
          console.log('autosave current post');
        }, 5000);
  
      }

      return () => {if (timer) {clearTimeout(timer)}};
    }, [])
    if (!post) {
      return null;
    }
    return (
      <div>
        <h3>{post.title}</h3>
        <button onClick={clearEditor}>cancel</button><button onClick={onPreview}>preview</button> <button onClick={savePost}>Save</button>
        <CKEditor 
          editor={ ClassicEditor }
          onChange={handleEditorChange}
          onBlur={handleEditorBlur}
          data={post.body}
        />
        <button onClick={savePost}>Save</button>
      </div>
    );
  }
  return (
    <>
      <h2>Graffiti Engine</h2>
      {previewOn && <div>{ReactHtmlParser(currentPost.body)}<button onClick={cancelPreview}>cancel</button></div>}
      {currentPost && currentPost.id && <input type="text" value={currentPost.title} onChange={updateTitle}/>}
      {currentPost && currentPost.id && <EditorComponent post={currentPost} onPreview={onPreview}/>}
      {<button onClick={startNew}>New</button>}
      <h3>posts</h3>
      <table>
        <thead>
          <tr>
            <th>
              <button value="lastUpdate" onClick={sortPosts}>last update</button>
            </th>
            <th>
              <button value="title" onClick={sortPosts}>title</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {postListItems}
        </tbody>
      </table>
    </>
  );
};

export { Main };