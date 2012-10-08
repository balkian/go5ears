$(document).ready(function(){
    var audio;
    var tracks;
    var shuffle = ko.observable(false);
    var repeat = ko.observable(false);
    var current = ko.observable();
    var repeatAll = ko.observable(false);
    var playlist = ko.observableArray();
    var playHistory = [];

    

    function saveState(){
        var cleanList = [];
        var pl = playlist();
        for (var i = 0; i < pl.length; i += 1) {
            var obj = {id: pl[i].id(), group: pl[i].group(),title: pl[i].title()};
            cleanList.push(obj);
        }
        console.log(JSON.stringify(cleanList));
        localStorage.playlist = JSON.stringify(cleanList);
        console.log("prueba");
    }
    //Audio control

    audio = $('audio')[0];


    audio.addEventListener('ended', function(){
        console.log("Ended");
        if(repeat()){
            audio.play();
        }
        else{
            playNext();
        }
    });

    function playNext(){
        var now = playlist().indexOf(current());

        if(shuffle()){
            var rand=Math.floor(Math.random()*playlist().length);
            console.log("NOW: "+now+", NEXT:"+rand);
            playSong(playlist()[rand]);
        }
        else{
            var next = (now+1)%playlist().length;
            console.log("NOW: "+now+", NEXT:"+next);
            if(next>now || repeatAll()){
                playSong(playlist()[next]);
            }else{
                stop();
            }

        }
    };

    function stop(){
        audio.src = "";
        audio.load();
        current().isPlaying(false);
    }

    function pause(){
        var id = current().id();
        audio.pause();
        current().isPlaying(false);
    }

    function playSong(song){
        var id = song.id();
        if(typeof current() != 'undefined'){
            current().isPlaying(false);
        }
        if(audio.src.indexOf(id)==-1){
            audio.src = 'play?id='+id;
            audio.load();
            current(song)
                if (playlist().indexOf(song)>=0) {
                    playHistory.push(current());
                    console.log("Not adding to playlist");
                }        
        }
        audio.play();
        current().isPlaying(true);
    }

    function playPrevious(){
        if(audio.currentTime < 3.0 && playHistory.length > 0){
            //             console.log("History:");
            //             console.log(playHistory);
            playSong(playHistory.pop());
        }else{
            console.log("Tócala otra vez, Sam");
            audio.currentTime = 0;
        }
    }

    function addSelected(song){
        playlist.push(new Song(song.id(),song.group(),song.title()));
        saveState();
        console.log("prueba");
        console.log(localStorage.playlist);
        console.log(playlist());
    }

    function removeSong(song) {
        if(song.isPlaying()){
            playNext();
        }
        playlist.remove(song);
    }


    $(function() {
        $( ".sortable" ).sortable();
        $( ".sortable" ).disableSelection();
        $( "#accordion" ).accordion({fillSpace:true});
    });

    $('.accordion .head').click(function() {
        $(this).next().toggle();
        return false;
    }).next().hide();

    function Song(id, group, title) {
        var self = this;
        self.id = ko.observable(id);
        self.group = ko.observable(group);
        self.title = ko.observable(title);

        self.isPlaying = ko.observable(false);

        // Computed data
        self.formattedName = ko.computed(function() {
            var index = playlist().indexOf(self);
            index = index>=0?index+"/"+playlist().length+" ":"";
            return index+self.group() +" - "+self.title();   
        }, this);

    }


    function PlaylistViewModel() {
        // Data
        var self = this;

        self.results = ko.observableArray([]);
        self.queryString = ko.observable();
        self.shuffle = shuffle;
        self.current = current;
        self.repeat = repeat;
        self.repeatAll = repeatAll;
        self.playlist = playlist; 

        self.trackNumber = ko.computed(function(){
            return this.playlist.indexOf(this.current())+"/"+this.playlist().length;
        },this);

        self.addSong = function(song){
            console.log("Adding song");
            addSelected(song);
        }
        // Operations

        self.getResults = function(form) {
            $.getJSON(encodeURI('/search?id="'+self.queryString()+'"'), function(allData) {
                var results = $.map(allData, function(item) { console.log(JSON.stringify(item)); return new Song(item.id,item.group,item.title) });
                self.results(results);
            });
        }

        self.playNext = playNext;
        self.playPrevious = playPrevious;
        self.playSong = playSong;
        self.pauseSong = pause;
        self.removeSong = removeSong;
    }


    if(typeof(LocalStorage)!=="undefined"){
        alert("Bad luck!");

    }else{
        if (localStorage.playlist) {
            console.log("State recovered. Happy listening!");
            var pl = JSON.parse(localStorage.playlist);
            for (var i = 0; i < pl.length; i++){
                var obj = new Song(pl[i].id,pl[i].group,pl[i].title);
                playlist.push(obj);
            }

        }
        if(playlist().length < 2){
            console.log("No playlist found. Adding recommendation!");
            var champions = { id:"4b9ed95",
                title:"We are the champions",
                group:"Queen"};

            var libertine = { id:"fe7e4f9",
                title:"Libertine",
                group:"Kate Ryan"};
            playlist.push(new Song(champions.id,champions.group,champions.title));
            playlist.push(new Song(libertine.id,libertine.group,libertine.title));
        }

        $(window).unload(function(){
            saveState();
        });
    }

    ko.applyBindings(new PlaylistViewModel());


});


