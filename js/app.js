$(document).ready(function(){
    var audio;
    var tracks;
    var shuffle = ko.observable();
    var repeat = ko.observable();
    var current = ko.observable();
    var repeatAll = ko.observable();
    var playlist = ko.observableArray();
    var playHistory = [];

    
    
    function clearPlaylist(){
        playlist.removeAll();
    }

    function savePlaylist(){
        saveState();
        uriContent = "data:application/json," + encodeURIComponent(localStorage.playlist);
        window.open(uriContent,"PlayList.json");
    }


    function loadPlaylist(evt){
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.
            var file = evt.target.files[0]; // FileList object
            console.log(evt.target.files);
            // files is a FileList of File objects. List some properties.
            var reader = new FileReader();
            reader.onload = function (event) {
                var content = event.target.result;
                console.log("Content:"+content);
                if (typeof content != 'undefined'){
                    localStorage.playlist = content;
                    loadState();
                }
            }
            reader.readAsText(file);

        } else {
            //   alert('The File APIs are not fully supported in this browser.');
        }
    }


    $("#clearPlaylist").click(clearPlaylist);
    $("#savePlaylist").click(savePlaylist);
    $("#file").change(loadPlaylist);
    $('#fileSelector').click(function(){
        $('#file').click();
    });

    function saveState(){
        var cleanList = [];
        var pl = playlist();
        for (var i = 0; i < pl.length; i += 1) {
            var obj = {id: pl[i].id(), group: pl[i].group(),title: pl[i].title(), quality:pl[i].quality()};
            cleanList.push(obj);
        }
        console.log(JSON.stringify(cleanList));
        localStorage.playlist = JSON.stringify(cleanList);
        localStorage.shuffle = shuffle() == true;
        localStorage.repeat = repeat() == true;
        localStorage.repeatAll = repeatAll() == true;
        console.log("REPEATALL:"+localStorage.repeatAll);
    }

    function loadState(){
        if (localStorage.playlist) {
            playlist.removeAll();
            console.log("State recovered. Happy listening!");
            var pl = JSON.parse(localStorage.playlist);
            for (var i = 0; i < pl.length; i++){
                var obj = new Song(pl[i].id,pl[i].group,pl[i].title,pl[i].quality);
                playlist.push(obj);
            }

        }
        if(playlist().length < 1){
            console.log("No playlist found. Adding recommendation!");
            var champions = { id:"4b9ed95",
                title:"We are the champions",
                group:"Queen"};

//             var libertine = { id:"fe7e4f9",
//                 title:"Libertine",
//                 group:"Kate Ryan"};
            playlist.push(new Song(champions.id,champions.group,champions.title,'Example Song'));
//             playlist.push(new Song(libertine.id,libertine.group,libertine.title));
        }

        shuffle(localStorage.shuffle == 'true');
        repeat(localStorage.repeat == 'true');
        repeatAll(localStorage.repeatAll == 'true');
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
        var len = playlist().length;
        if(shuffle()){
            var rand=(now+Math.floor(Math.random()*(len)+1))%len;
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

    function resume(){
        audio.play();
        current().isPlaying(true);
    }

    function playSong(song){
        var id = song.id();
        console.log("Going to play "+song.title());
        if(typeof current() != 'undefined'){
            current().isPlaying(false);
        }
        //if(audio.src.indexOf(id)==-1){ // Check if already playing. Buggy when there are duplicates
        audio.src = 'play?id='+id;
        audio.load();
        current(song)
            if (playlist().indexOf(song)>=0) {
                playHistory.push(current());
            }else{
                console.log("Not adding to playlist>"+playlist().indexOf(song));
            }
        //}
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
        playlist.push(new Song(song.id(),song.group(),song.title(),song.quality()));
        saveState();
    }

    function removeSong(song) {
        if(song.isPlaying()){
            playNext();
        }
        playlist.remove(song);
        saveState();
    }


    $(function() {
        $( ".sortable" ).sortable();
        $( ".sortable" ).disableSelection();
        $( "#accordion" ).accordion({heightStyle: "fill"});

        $(window).resize(function(){
                $("#accordion").accordion("refresh");
        });
    });

    $('.accordion .head').click(function() {
        $(this).next().toggle();
        return false;
    }).next().hide();
    

    function Song(id, group, title, quality) {
        var self = this;
        self.id = ko.observable(id);
        self.group = ko.observable(group);
        self.title = ko.observable(title);
        self.quality = ko.observable(quality);
        self.isPlaying = ko.observable(false);

        // Computed data
        self.formattedName = ko.computed(function() {
            var index = playlist().indexOf(self);
            index = index>=0?index+"/"+playlist().length+" ":"";
            return index+self.group() +" - "+self.title()+" ["+self.quality()+"]";   
        }, this);

        self.downloadSong = function(){
            window.open("/play?id="+self.id(), self.formattedName());
        }
    }


    function PlaylistViewModel() {
        // Data
        var self = this;

        self.results = ko.observableArray([]);
        self.hasMoreSearch = ko.observable(true);
        self.currentPage = ko.observable(0);
        self.queryString = ko.observable();
        self.shuffle = shuffle;
        self.current = current;
        self.repeat = repeat;
        self.repeatAll = repeatAll;
        self.playlist = playlist; 

        self.trackNumber = ko.computed(function(){
            return this.playlist.indexOf(this.current())+"/"+this.playlist().length;
        },this);

        self.isPlaying = ko.computed(function(){
            return (typeof current() != 'undefined') && current().isPlaying();
        },this);

        self.addSong = function(song){
            console.log("Adding song");
            addSelected(song);
        }
        // Operations

        self.search = function(page) {
            $.getJSON(encodeURI('/search?id='+self.queryString()+'&p='+page), function(allData) {
                var results = $.map(allData, function(item) { console.log(JSON.stringify(item)); return new Song(item.id,item.group,item.title,item.quality) });
                console.log("Results:");
                console.log(results);
                if(results.length < 10){
                    console.log("No more results");
                    self.hasMoreSearch(false);
                }else{
                    self.hasMoreSearch(true);   
                }
                if(results.length > 0){
                    for (var i = 0; i < results.length; i += 1) {
                        self.results.push(results[i])
                    }    
                    self.currentPage(page);
                }
            });

        }        
        
        self.getResults = function() {
            self.results.removeAll();
            self.search(1);
        }
        
        self.searchMore = function(){
            if(self.hasMoreSearch()){
                self.search(self.currentPage()+1);
            }
        }

        if(typeof(LocalStorage)!=="undefined"){
            alert("Bad luck!");

        }else{
            loadState();

            $(window).unload(function(){
                saveState();
            });
        }


        self.playNext = playNext;
        self.playPrevious = playPrevious;
        self.resume = resume;
        self.playSong = playSong;
        self.pause = pause;
        self.stop = stop;
        self.removeSong = removeSong;
    }


    ko.applyBindings(new PlaylistViewModel());


});


