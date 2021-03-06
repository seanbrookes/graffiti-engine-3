const express = require('express');
const fs = require('fs');
const http = require('http');
var cors = require('cors');
const bodyParser = require('body-parser');
const TurndownService = require('turndown');
const _ = require('lodash');
const showdown   = require('showdown');
const querystring = require('querystring');
const config = require('./config');
// TODO - this will need to be more dynamic
const PORT = 4004;

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(bodyParser.raw());
server.use(cors());
converter = new showdown.Converter();

const getSlug = (title) => {
  // replace spaces with dashes
  // remove question marks
  return title.toLowerCase().replace(/([^a-z0-9]+)/gi, '-');
};
const guid = () => {
  let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
  }
  //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};



/* 

  GET THE POSTS

*/
server.get('/api/posts', (req, res) => {
  const dir = './server/posts/';
  let files;
  let returnError;
  res.contentType('application/json');

  try {
    files = fs.readdirSync(dir);
  
  }
  catch(error) {
    returnError = error;
  }

  const postCollection = [];

  if (files) {
    try {
      // files object contains all files names
      files.forEach(file => {
        // console.log('reading file', file);
        try {
          const data = fs.readFileSync('./server/posts/' + file);
          postCollection.push(JSON.parse(data));
        } catch (err) {
          console.error('| build list of posts', err);
          returnError = err;
        }
      });
    }
    catch(error) {
      console.log('| Error iterating over the files', error);
      returnError = error;
    }
  }

  if (returnError) {
    res.status(500)
    res.send({error: returnError.message});
  }
  else {
    res.send(JSON.stringify(postCollection));
  }
});

/* 

  GET SINGLE POST

*/
server.get('/api/post/:id', (req, res) => {
  const postId = req.params.id;
  const path = `./server/posts/${postId}.json`;
  if (postId && fs.existsSync(path)) {
    fs.readFile(path, function(err, data) { 
      
      // Check for errors 
      if (err) throw err; 
     
      // Converting to JSON 
      const post = JSON.parse(data); 
        
     // console.log('posts', posts);
      res.send(JSON.stringify(post));
    });
  }
  else {
    res.sendStatus(404);
    //res.send({status: 404, message: 'resource not found'});
  }
});



/* 

  SAVE POST

*/
server.post('/api/posts', (req, res) => {
  const targetPost = req.body;
  const saveTimestamp = new Date().getTime();
  if (!targetPost || !targetPost.body) {
    res.sendStatus(500);
    res.send({message: 'not saved missing post body'});
  }
  let freshPost = Object.assign({}, targetPost);
  if (!freshPost.date) {
    freshPost.date = saveTimestamp;
  }
  if (!freshPost.id) {
    /*
      new post needs
      - title?
      - lastUpdate
      - id
      - status
    */
    freshPost.status = 'draft';
    freshPost.id = guid();
    freshPost.title = targetPost.title ? targetPost.title : '';
  }
  if (!freshPost.status) {
    freshPost.status = 'draft';
  }
  freshPost.lastUpdate = saveTimestamp;
  console.log('Save freshPost.lastUpdate', freshPost.lastUpdate);
  console.log('Save this thing', JSON.stringify(freshPost, null, 2));
  /*
  write the file
  */
  fs.writeFile(`./server/posts/${freshPost.id}.json`, JSON.stringify(freshPost), err => { 
      
    // Checking for errors 
    if (err) throw err;  
  
  //  console.log("Done writing"); // Success 
    res.send({status: 200, message: 'saved'});
  });

});

/* 

  PUBLISH

*/
function postPost(targetConfig, post, cb){




  var publishDoc;

  fs.readFile('./server/templates/postTemplate.html', 'utf8', function (err, tpl) {
    if (err) {
      return console.log(err);
    }
    var pubDate = new Date(post.publishDate);


    post.publishYear = post.publishDate.getFullYear();
    post.publishMonth = (post.publishDate.getMonth() + 1);

    post.markup = converter.makeHtml(post.body);

    var compiled = _.template(tpl);

    publishDoc = compiled(post);

    var post_data = querystring.stringify({
      'ApiKey': targetConfig.apiKey,
      'PostPublishYear': post.publishYear,
      'PostPublishMonth': post.publishMonth,
      'PostSlug': post.slug,
      'PostBody': publishDoc
    });

    // An object of options to indicate where to post to
    var post_options = {
      host: targetConfig.host,
      port: targetConfig.port,
      path: targetConfig.path,
//            path: '/inbox.php',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length
      }
    };


    // Set up the request
    /*
     *
     *
     *  POST PUBLISH DOCUMENT TO INBOX
     *
     * Request
     *
     *
     * */

    // console.log('| here |  the doc to post: ' + publishDoc);
    var post_req = http.request(post_options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        //console.log('| ');
        console.log('Response: It worked!!!');
        //console.log('| ');
      });
    });
    post_req.write(post_data);
    post_req.end();
    cb(null, publishDoc);// publishDoc;

  });
}
server.post('/api/publish', (req, res) => {
  const post = req.body;
  if (!post || !post.body) {
    res.sendStatus(500);
    res.send({message: 'not saved missing post body'});
  }

  if (!post.id) {
    res.sendStatus(500);
    res.send({message: 'not published missing post id'});
  }
  if (!post.slug) {
    post.slug = getSlug(post.title);
  }

  /**
   *
   * Establish the publish date
   * note this may not be valid in case
   * there is a failure in the flow
   *
   * */
  post.publishDate = new Date();
  post.publishYear = post.publishDate.getFullYear();
  post.publishMonth = (post.publishDate.getMonth() + 1);
  post.publishDay = (post.publishDate.getDate());
  post.lastUpdate = new Date();
  post.author = author;
  post.status = 'published';

  var targetConfig = {
    host: 'localhost',
    port: '8888',
    path: '/fourfivesixtest/inbox.php',
    apiKey: 'sdfaersdf23esdfa33adfasdfwdrrwdfs5'
  };
  postPost(targetConfig, post, (err, doc) => {
    console.log('|  publish callback ', post.title);
    // save this post
    /*
    write the file
    */
    fs.writeFile(`./server/posts/${post.id}.json`, JSON.stringify(post), err => { 
          
      // Checking for errors 
      if (err) throw err;  

      //  console.log("Done writing"); // Success 
      res.send({status: 200, message: 'published'});
    });
  });



});





























/*

  Older custom methods

  not in main use


*/

server.get('/api/doit', (req, res) => {
  console.log('made it this far');
  const dir = './server/posts/';

  let alreadyExistingFiles = [];
  console.log('A');
  // list all files in the directory
  try {
      const files = fs.readdirSync(dir);
      console.log('B');
      // files object contains all files names
      files.forEach(file => {
        // console.log('reading file', file);
        try {
          const data = fs.readFileSync('./server/posts/' + file);
        //  console.log('original ', data);
          const subjectPost = JSON.parse(data);
        //  console.log('original ', subjectPost.lastUpdate);

          const testData = new Date(subjectPost.lastUpdate);
        //  console.log('testData', testData.getTime());
          subjectPost.lastUpdate = testData.getTime();

          //data.lastUpdate = new Date(subjectPost.lastUpdate).getTime();
     //     console.log('file last update', subjectPost.lastUpdate);
          alreadyExistingFiles.push(subjectPost);
        } catch (err) {
            console.error(err);
        }

      });

  } catch (err) {
      console.log(err);
  }
  console.log('C');
  alreadyExistingFiles.map((freshPost) => {
    // fs.writeFile(`./posts/${freshPost.id}.json`, JSON.stringify(freshPost), err => { 
      
    //   // Checking for errors 
    //   if (err) throw err;  
    
    //   console.log("Done writing"); // Success 
    //   // res.send({status: 200, message: 'saved'});
    // });
  
  });
      
   // console.log('posts', posts);
  res.send({message:'we are done'});
});

server.get('/api/convert-once', (req, res) => {

  console.log('| This was used once to convert old markup fragments to markdown it is only here for reference');
  
  
  // get list of all the posts
  const dir = './server/posts/';
  let files;
  let returnError;
  res.contentType('application/json');

  try {
    files = fs.readdirSync(dir);
  
  }
  catch(error) {
    returnError = error;
  }

  const postCollection = [];

  if (files) {
    try {
      const turndownService = new TurndownService();


      // files object contains all files names
      files.forEach(file => {
        // console.log('reading file', file);
        // loop over them

        // for each post

        // check if it has html body

        // if it has html it must be converted

        // call markdow service on the body

        // if all is good then resave the file

        try {
          const fileData = fs.readFileSync('./server/posts/' + file);
          if (fileData) {
            const parsedFileData = JSON.parse(fileData);
            const postBody = parsedFileData.body;
            const postTitle = parsedFileData.title;
            if (postBody) {
              if (postBody.startsWith('<')) {
                console.log('|');
               // console.log('|  NEW POST');
                console.log('|');
              //  console.log('|  before:  ', postBody);
                console.log('|');
    
                // convert HTML to Markdown
                const convertedBody = turndownService.turndown(postBody);
    
                console.log('|');
                console.log('|  after:  ', convertedBody);
                console.log('|');
                parsedFileData.body = convertedBody;

                // now resave the file
                // fs.writeFile(`./server/posts/${parsedFileData.id}.json`, JSON.stringify(parsedFileData), err => { 
      
                //   // Checking for errors 
                //   if (err) throw err;  
                
                // //  console.log("Done writing"); // Success 
                //   console.log('|');
                //   console.log('|  SAVED:  ');
                //   console.log('|');
                // });      
              }
              else {
                console.log('|');
                console.log('|  NOT THIS ONE');
                console.log('|');
                console.log('|    ', postTitle);
                console.log('|');
      
              }
    
            }
            else {
              console.log('|');
              console.log('|  ', postTitle);
              console.log('|  Something no body on this file');
              console.log('|');            
            }
          }
          else {
            console.log('|');
            console.log('| no file data', file);
            console.log('|');
          }

        } catch (err) {
          console.error('|  list of posts', err);
          returnError = err;
        }
      });
    }
    catch(error) {
      console.log('| Error iterating over the files', error);
      returnError = error;
    }
  }

  if (returnError) {
    res.status(500)
    res.send({error: returnError.message});
  }
  else {
    res.send('all good');
  }





});
server.get('*', (req, res) => {
  res.send('nothing here');
});






server.listen(PORT, () => {
  console.log('server is running on port 4004');
});
