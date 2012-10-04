/**
 * Module dependencies.
 */
var express = require('express')
, $ = require('jquery')
, http = require('http')
, xml2js = require('xml2js')
, app = module.exports = express();


var port = process.env.PORT || 8888;

var parser = new xml2js.Parser();

app.get('/', function(req,res){
    res.sendfile("public/index.html");
}); 

app.get('/goear', function(req,res){
    jquery.get(req.query['id'],null,function(data, textStatus,jqXHR){
        res.write("Pidió:"+req.query['id']);
        res.end();
});
});

app.get('/search', function(req, resp){
     var options = {
        host: 'www.goear.com',
        port: 80,
        path: '/search.php?q='+encodeURIComponent(req.query['id'])
    };

    var results = [];
    var html = '';
    http.get(options, function(res) {
        res.on('data', function(data) {
            // collect the data chunks to the variable named "html"
            html += data;
        }).on('end', function() {
            // the whole of webpage data has been collected. parsing time!
            $(html).find('.play').each(function(i,elem){
                var prev = $(elem).prev();
                var title = $(prev).children(".song").text();
                var group = $(prev).children(".group").text();
                var id = prev.attr("href").split("/")[1];
                results.push({id:id,"title":title,group:group})
            });
            console.log("Results:"+JSON.stringify(results));
            resp.send(JSON.stringify(results));
         });
    });

});

app.get('/play', function(req,resp){
    var id = req.query['id'];
    
    var options = {
        host: 'www.goear.com',
        port: 80,
        path: '/tracker758.php?f='+encodeURIComponent(req.query['id'])
    };

    var xml = '';
    http.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            xml += data;
        }).on('end', function() {
            // the whole of webpage data has been collected. parsing time!
            parser.parseString(xml, function(err,result){
                console.log("xml: "+xml);
                console.log("Object: "+JSON.stringify(result));
                var song = result['songs']['song'][0]["$"];
                console.log("Song:"+JSON.stringify(song)); 
                var path = song['path'];
                var title = song['title'];
                var artist = song['artist'];
                console.log(title + " - " +artist+" - "+path);
                resp.writeHead(302, {
                  'Location': path
                  //add other headers here...
                });
                resp.end();
            });
        });
    });
});

app.listen(port);
