const express = require("express");
const fs = require("fs");
var cors = require('cors');
const bodyParser = require('body-parser');

const PORT = 4004;

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(bodyParser.raw());
server.use(cors())

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




  // fs.readFile('../src/data/posts.json', function(err, data) { 
      
  //   // Check for errors 
  //   if (err) throw err; 
   
  //   // Converting to JSON 
  //   const posts = JSON.parse(data); 



  //   // existing posts
  //   // directory path


  //   let migratedPosts = [];

  //   // list all files in the directory
  //   try {
  //       const files = fs.readdirSync(dir);

  //       // files object contains all files names
  //       files.forEach(file => {
  //         // console.log('reading file', file);
  //         try {
  //           const data = fs.readFileSync('./posts/' + file);
  //           migratedPosts.push(JSON.parse(data));
  //         } catch (err) {
  //             console.error(err);
  //         }

  //       });

  //   } catch (err) {
  //       console.log(err);
  //   }
  //   let immutablePosts = [];
  //   let netNewPosts = [];
  //   if (migratedPosts.length > 0) {

  //     migratedPosts.map((post) => {
  //       let isNew = true;
  //       posts.map((originalPost) => {
  //         if (originalPost.id === post.id) {
  //           isNew = false;
  //         }
  //       });
  //       if (isNew) {
  //         netNewPosts.push(post);
  //       }
  //     })

  //     immutablePosts = posts.map((post) => {
  //       post.lastUpdate = new Date(post.lastUpdate).getTime();
  //       // console.log('timestamp', post.lastUpdate);
  //       let isNew = true;
  //       migratedPosts.map((migratedPost) => {
  //         if (migratedPost.id === post.id) {
  //           // console.log(`we got a match  [${post.title}][${post.lastUpdate}][${migratedPost.lastUpdate}]`);
  //           post = migratedPost;
  //           // console.log(`TAKE 2  [${post.title}][${post.lastUpdate}]`);

  //         }
  //       });

  //       return post;
  //     });
  //   }

  //   const totalReturnCollection = immutablePosts.concat(netNewPosts);

      
  //  // console.log('posts', posts);
  //   res.send(JSON.stringify(totalReturnCollection));
  // });


});
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
const guid = () => {
  let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
  }
  //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
server.post('/api/posts', (req, res) => {
  const targetPost = req.body;
  if (!targetPost || !targetPost.body) {
    res.sendStatus(500);
    res.send({message: 'not saved missing post body'});
  }
  let freshPost = Object.assign({}, targetPost);
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

  freshPost.lastUpdate = new Date().getTime();
   console.log('Save freshPost.lastUpdate', freshPost.lastUpdate);
  // console.log('Save this thing', freshPost.body);
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
server.get('*', (req, res) => {
  res.send('nothing here');
});






server.listen(PORT, () => {
  console.log('server is running on port 4004');
});
