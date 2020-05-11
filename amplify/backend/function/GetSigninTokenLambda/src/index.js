const request  = require('request-promise-native');

exports.handler = async (event) => {
  const body = await request(JSON.parse(event.body)['uri']);

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Credentials" : true,
      "Access-Control-Allow-Origin" : "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  };
  return response;
};
