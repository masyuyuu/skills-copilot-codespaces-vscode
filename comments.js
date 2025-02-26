// Create web server
// Load the HTTP library
var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var comments = require("./comments.json");
var qs = require("querystring");

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd(), uri);

  if (request.method === "GET") {
    if (uri === "/comments") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(comments));
    } else {
      fs.readFile(filename, "binary", function (err, file) {
        if (err) {
          response.writeHead(500, { "Content-Type": "text/plain" });
          response.write(err + "\n");
          response.end();
          return;
        }

        response.writeHead(200);
        response.write(file, "binary");
        response.end();
      });
    }
  } else if (request.method === "POST") {
    var body = "";

    request.on("data", function (data) {
      body += data;
    });

    request.on("end", function () {
      var post = qs.parse(body);
      comments.push(post);

      fs.writeFile("comments.json", JSON.stringify(comments), function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Saved");
        }
      });

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(comments));
    });
  }
});

// Listen on port 8000, IP defaults to