$(document).ready(function(){
    var audio;
    var tracks;
    var shuffle = ko.observable(false);
    var repeat = ko.observable(false);
    var repeatAll = ko.observable(false);
    var playlist = ko.observableArray();

    $(function() {
        $( ".sortable" ).sortable();
        $( ".sortable" ).disableSelection();
        $( "#accordion" ).accordion({fillSpace:true});
    });

    $('.accordion .head').click(function() {
        $(this).next().toggle();
        return false;
    }).next().hide();

    var champions = { id:"4b9ed95",
        title:"We are the champions",
    group:"Queen"};
    
    var libertine = { id:"fe7e4f9",
        title:"Libertine",
    group:"Kate Ryan"};

    var playlist = ko.observableArray(); 
    function Song(id, group, title) {
        var self = this;
        self.id = ko.observable(id);
        self.group = ko.observable(group);
        self.title = ko.observable(title);
        
        self.isPlaying = ko.observable(false);

        // Computed data
        self.formattedName = ko.computed(function() {
            console.log("Recomputed");
            return playlist().indexOf(self)+"/"+playlist().length+" "+self.group() +" - "+self.title();   
        }, this);
        
        self.playSong = function(){
            console.log("Playing song");
            playSelected(self);
        }  
        
        self.pauseSong = function(){
            console.log("Pausing song");
            pauseSelected(self);
        }
    }


    function PlaylistViewModel() {
        // Data
        var self = this;

        self.results = ko.observableArray([]);
        self.queryString = ko.observable();
        self.shuffle = shuffle;
        self.current = ko.observable();
        self.repeat = repeat;
        self.repeatAll = repeatAll;
        self.playlist = playlist; 

        self.trackNumber = ko.computed(function(){
            console.log("Recomputed");
            return this.playlist.indexOf(this.current())+"/"+this.playlist().length;
        },this);

        self.addSong = function(song){
            console.log("Adding song");
            addSelected(song);
        }
        // Operations

        self.getResults = function(form) {
    //         console.log("Form:"+JSON.stringify(form));
            $.getJSON("/search?id="+self.queryString(), function(allData) {
                var results = $.map(allData, function(item) { console.log(JSON.stringify(item)); return new Song(item.id,item.group,item.title) });
                self.results(results);
            });
        }

        self.playNext = playNext;

    }

    playlist.push(new Song(champions.id,champions.group,champions.title));
    playlist.push(new Song(libertine.id,libertine.group,libertine.title));

    ko.applyBindings(new PlaylistViewModel());

    //Audio control

    audio = $('audio')[0];
    
    audio.addEventListener('ended', function(){
        if(repeatOne){
            audio.play();
        }
        else{
            playNext();
        }
    });

    function playNext(){
            var now = playlist().indexOf(current);
            var next = (now+1)%playlist().length;

        console.log("NOW: "+now+", NEXT:"+next);
        if(shuffle()){
            var rand=Math.floor(Math.random()*playlist().length);
            playSelected(playlist()[rand]);
        }
        else{
            if(next>now || repeatAll()){
                playSelected(playlist()[next]);
            }else{
                stop();
            }

        }
    };

    function stop(){
        audio.src = "";
        audio.load();
        current.isPlaying(false);
    }

    function pauseSelected(song){
        var id = song.id();
        audio.pause();
        song.isPlaying(false);
    }

    function playSelected(song){
        var id = song.id();
        if(audio.src.indexOf(id)==-1){
            audio.src = 'play?id='+id;
            audio.load();
        }
    //     else{
    //         console.log("Not playing:"+audio.src);
    //     }
        audio.play();
        song.isPlaying(true);
        current = song;
    }

    function addSelected(song){
        playlist.push(new Song(song.id(),song.group(),song.title()));
    }


});



