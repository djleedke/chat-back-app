var socket = io.connect('http://' + document.domain + ':' + location.port);
var attackMode = false;
var letterQueue = [];

/*--------- Receiving from Server ---------*/

//On connection we send username & room args from index
socket.on('connect', function() {
    socket.emit('join_room', {
        username: username,
        room: room
    });
});

//Receiving the message from the server and updating the html
socket.on('client_message_receive', function(data){
    if(data['username'] !== username){ //We only want messages from other users
        //Adding the letters in the message to our container
        for(i = 0; i < data.message.length; i++){
            var letter = createLetter(data.message[i]);
            var pos = getRandomPosition(letter);

            //Assigning random location
            letter.style.left = pos[0] + 'px';
            letter.style.top = pos[1] + 'px'; // Need to get height of header and add it here

            $('#arena').append(letter);
        }
    }
});


/* --------- Sending to Server ---------*/

//When our message form is submitted we send the message to the server
$('#message-form').submit(function(e){
    e.preventDefault();

    socket.emit('client_message', {
        username: username,
        room: room,
        message: $('#client-message').val()
    });

    $('#client-message').val('');
});

//When team is changed we need to send a message to the server
$('#team-select').change(function(e){

    var team = $('#team-select').val();
    changeTeamColors(team);
    socket.emit('team_change', {
        username: username,
        room: room,
        team: team
    });

    console.log('switching teams to ' + team)
});

/*--------- Key Handler --------- */

//Keypress logic
document.onkeydown = function(e){
    e = e || window.event;

    //Attack mode toggling
    if(e.ctrlKey && attackMode === false){
        setAttackMode(true);
    } else if(e.ctrlKey && attackMode === true){
        setAttackMode(false); 
    }

    //We are defending, letters will now be removed when typed
    if(attackMode === false){
        checkForLetterRemoval(e);
    }
}

/*--------- Helper Functions --------*/

//Sets our attack mode to the desired value (true or false)
function setAttackMode(bool){
    if(bool === false){ //Attack mode off
        attackMode = false;
        document.getElementById('attack').checked = false;
        document.getElementById('client-message').readOnly = true;
    } else if (bool === true){ //Attack mode on
        attackMode = true;
        document.getElementById('attack').checked = true;
        document.getElementById('client-message').readOnly = false;
    }
}

function changeTeamColors(team){

    if(team === 'red'){
        console.log('here');
        $('#arena').removeClass('red-team blue-team default');
        $('#arena').addClass('red-team');
    } else if(team === 'blue'){
        $('#arena').removeClass('red-team blue-team default');
        $('#arena').addClass('blue-team');
    } else if(team === 'spectator'){
        $('#arena').removeClass('red-team blue-team default');
        $('#arena').addClass('default');
    }
}

//Checks if the specified letter was pressed if it exists removes it from the DOM
function checkForLetterRemoval(e){
    for(i = 0; i < letterQueue.length; i++){

        inputChar = String.fromCharCode(e.keyCode).toUpperCase();
        letterChar = letterQueue[i].innerHTML.toUpperCase();

        if(inputChar === letterChar){
            letterQueue[i].remove();
            letterQueue = letterQueue.filter(function(ele) { return ele !== letterQueue[i] });
            console.log(letterQueue);
            break;
        }
    }
}

//Creates our letter div that will be added to the message area
function createLetter(letterString){
    var letter = document.createElement('div');
    letter.innerHTML = letterString;
    letter.setAttribute('style', 'position:absolute');
    letter.setAttribute('class', 'letter');

    letterQueue.push(letter);

    return letter;
}

//Determing random location inside message area to place our letters
function getRandomPosition(ele){

    var areaWidth = $('#arena').width(),
        areaHeight = $('#arena').height(),
        letterWidth = ele.clientWidth,
        letterHeight = ele.clientHeight,
        widthMax = areaWidth - letterWidth,
        heightMax = areaHeight - letterHeight;

    var randomX = Math.floor(Math.random() * widthMax),
        randomY = Math.floor(Math.random() * heightMax);

    return [randomX ,randomY]
}
