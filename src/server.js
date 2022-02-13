const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    '/notReal': jsonHandler.notFound,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    '/notReal': jsonHandler.notFoundMeta,
  },
  // POST requests not included in URL struct due to different process
};

// Parse the body of the POST requests.
const parseBody = (request, response, handler) => {
  // array to hold individual pieces as they come in
  const body = [];

  // Event handler for in case of error.
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // Event handler for one we receive a piece of the body
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // Event handler for when we finish processing the request.
  // Puts the body together.
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    // Proceed with the provided handler function.
    handler(request, response, bodyParams);
  });
};

// Handles POST requests.
const handlePost = (request, response, parsedUrl) => {
  // We don't really need to check the pathname since we only have one POST path,
  // but it's good infrastructure to build.
  if (parsedUrl.pathname === '/addUser') {
    parseBody(request, response, jsonHandler.addUser);
  }
};

// Handles any requests coming into the server and directs them to the correct place.
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  console.dir(request.method);
  console.dir(parsedUrl);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else if (urlStruct[request.method] && urlStruct[request.method][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response);
  } else {
    urlStruct.GET.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
