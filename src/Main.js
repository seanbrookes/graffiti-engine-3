import React, { useEffect, useState } from 'react';
import Markdown from 'markdown-to-jsx';
import { MarkdownEditor } from './components/MDEditor';
import regeneratorRuntime from 'regenerator-runtime';
import * as d3 from 'd3';
import './styles.css';
import TurndownService from 'turndown';
// import CKEditor from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Link from '@ckeditor/ckeditor5-link/src/link';
// import { data } from './data/backup';
import ReactHtmlParser from 'react-html-parser';

const postsServiceEndpoint = 'http://localhost:4004/api/posts';

/**
 * 
 Coyote 180R https://www.youtube.com/watch?v=hX0uEiGp_fc
 Troys place 14 custom jet boat walk around https://www.youtube.com/watch?v=fa_4H3_gw3o
 Rockfish 150 https://www.rockfishboats.com/r150
 riverpro https://www.youtube.com/watch?v=xwzh8VWtlZA
 hdpe bonding adhesive: https://tbbonding.com/glue-polyethylene/
 cast acrylic https://www.estreetplastics.com/Clear-Plexiglass-Acrylic-Sheets-1-Thick-s/31.htm
 

 */

const Main = () => {
  const [postsState, setPostsState] = useState({posts: {}, postsList: []});
  const [previewOn, setPreviewOn] = useState(false);
  const [currentPost, setCurrentPost] = useState({});
  const [sortState, setSortState] = useState({sortAscending: false, sortProp: 'lastUpdate'});
  let timer;
  let turndownService = new TurndownService();

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
 
  }

  const onEditPost = (postBody) => {
    if (currentPost) {
      // console.log('EDIT POST', postBody);
      const theCurrentPost = Object.assign({}, currentPost);
      theCurrentPost.body = postBody;
      setCurrentPost(theCurrentPost);  
    }
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
      postToSever(currentPost);
  
    }
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

  return (
    <>
      <h2>Graffiti Engine</h2>
      {currentPost && currentPost.id && <>
          <input type="text" value={currentPost.title} onChange={updateTitle}/>
          <MarkdownEditor value={currentPost.body} onChange={onEditPost} onBlur={saveCurrentPost} />

          <button onClick={savePost}>Save</button>
          <button onClick={clearEditor}>cancel</button>
        </>
      }
      <button onClick={startNew}>New</button>
      {/* {currentPost && currentPost.id && <Markdown>{currentPost.body}</Markdown>} */}
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