// Note this object is purely in memory
const users = {};

// Respond with JSON object.
const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// Response with no body (HEAD requests).
const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.end();
};

const getUsers = (request, response) => respondJSON(request, response, 200, users);

const getUsersMeta = (request, response) => respondJSONMeta(request, response, 200);

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSON(request, response, 404);

// function to add a user from a POST body
const addUser = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  // Validate that the necessary fields are part of the body.
  // Send a 400 (bad request) if not.
  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // Store default 204 (updated) and start process of adding/updating object.
  let responseCode = 204;

  // If there is no user yet.
  if (!users[body.name]) {
    // Send a 201 created and beging user creation.
    responseCode = 201;
    users[body.name] = {};
  }

  // Add/update fields of object.
  users[body.name].name = body.name;
  users[body.name].age = body.age;

  // Send response if object was created.
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  // Send response if object was edited.
  return respondJSONMeta(request, response, responseCode);
};

module.exports = {
  getUsers,
  getUsersMeta,
  notFound,
  notFoundMeta,
  addUser,
};
