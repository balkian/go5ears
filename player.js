/**
 * Module dependencies.
 */
var express = require('express')
, $ = require('jquery')
, http = require('http')
, xml2js = require('xml2js')
, app = module.exports = express()
, api = require('goear_api');


var port = process.env.PORT || 8888;

var parser = new xml2js.Parser();

app.use("/css", express.static(__dirname + '/css'));
app.use("/", express.static(__dirname + '/public'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/img", express.static(__dirname + '/img'));

app.get('/', function(req,res){
    res.sendfile("public/index.html");
}); 

app.get('/search', function(req, resp){
    var query = req.query['id']
    var page = req.query['p']
    console.log("Query:"+req.query['id']);
    console.log("Page:"+page);

    api.search(query, { offset: page }, function(err, data) {
        var results = [];
        for( var i in data.tracks){
            res = data.tracks[i];
            results.push({id:res.id,title:res.title,group:res.artist,quality:res.quality})
        }
        console.log("Total songs available: " + data.totalCount);
        console.log("First title available: " + data.tracks[0].title);
        console.log("Results:"+JSON.stringify(results));
        resp.send(JSON.stringify(results));
    });
});

app.get('/play', function(req,resp){
    var id = req.query['id'];
    api.lookup(id, function(err, data){
        console.log('Lookup:', data);
        resp.writeHead(302, {
          'Location': data.link
          //add other headers here...
        });
        resp.end();
    });
});

app.listen(port);
