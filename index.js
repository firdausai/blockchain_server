//initialize express app
var app = require('express')();

//initialize express server instance
var http = require('http').createServer(app);

//initialize socket io listening to express server instance
var io = require('socket.io')(http);

//import crypto.js
const SHA256 = require('crypto-js/sha256');

var index = 0;
var previous_hash = 'Genesis Hash'

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function generateSalt(index) {
	//bikin sebuah pola
	var pattern = Math.pow((2*index),3);
	
	//ubah pattern menjadi string
	var string_pattern = pattern.toString();
	
	//hash string_pattern
    var hash_pattern = SHA256(string_pattern).toString();
    return hash_pattern;
};

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('chat message', function (data) {
		//increment block index
		index = index + 1;
		
		//bikin timestamp
        var dateobj = new Date();
        var timestamp = dateobj.toUTCString();

		//generate salt
        var salt = generateSalt(index);

		//bikin nonce
		var nonce = SHA256(data + salt).toString();
		
		//bikin hash
        var hash = SHA256(index.toString() + data + timestamp + nonce + previous_hash).toString();

        var block = {
            'index' : index,
            'data' : data,
            'timestamp' : timestamp,
            'nonce' : nonce,
            'hash' : hash,
            'previous_hash' : previous_hash
        };

        // console.log('data input:', block);
        io.emit('clientEvent', block);
        previous_hash = hash;
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});