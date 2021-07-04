# Graffiti Engine

This is the third iteration of my personal blog app.

The basic premise is to store a local copy of posts as .json files with a property for title
and one for body that stores the content of the post as markdown text.

In order to publish the posts a host server is required to be set up to accept publishing requests.

When a post is published the content is posted to the target server using a shared api key.  

When the target app recieves the post it creates a new file in a relative path folder defined in the post data.

The logic is pretty simple for the taget application and is designed to be easy to setup and get working.  
All it needs is a web server running under an account with permissions to create folders and files.

Currently the target host files are written in PHP as that is pretty universal for public web hosting servers however it could easily be rewritten in node or other languages

The underlying philosophy behind this app is to make it easy to capture ideas and notes and then provide a simple way to publish and republish from the local source.

It is dead simple to move the hosting to a new server and simply re-post all of the content automatically, hence the graffiti name.


## Getting Started

```
$ git clone https://github.com/seanbrookes/graffiti-engine-3.git
```

```
$ npm install
```

To run the app you need to run a web server and an api server
run in separate terminals:
server:
```
$ node server/server
```
will start api server on port: 4004 by default

client app
```
$ npm run start
```
will start application on port: 9000

## Publishing

There are 2 template files in the ./host-templates folder.  One is for the home page to help display appropriate content such as post summary or ensure there is content there even if no posts have been published for a while.

The other is called 'inbox' and serves as the target file when publishing.  It will look for an api key and then confirm appropriate meta data configuration, then write the file contents to a folder.



