var audio;
var playlist;
var tracks;
var current;

function pauseSelected(id,emitter){
    var newUrl = 'play?id='+id;
    console.log("Already playing:"+audio.src);
    audio.pause();
    $(emitter).addClass('ui-icon ui-icon-play').removeClass('ui-icon-pause');
    $(emitter).unbind('click');
    $(emitter).click(function(){
        playSelected(id,emitter);
    });
}
function resumeSelected(id,emitter){
    console.log("Resuming:"+audio.src);
    audio.play();
    $(emitter).addClass('ui-icon ui-icon-pause').removeClass('ui-icon-stop ui-icon-play');
    $(emitter).unbind('click');
    $(emitter).click(function(){
        pauseSelected(id,emitter);
    });
}
function playSelected(id,emitter){
    if(audio.src.indexOf(id)!=-1){
        resumeSelected(id,emitter);
    }
    else{
        console.log("Not playing:"+audio.src);
        audio.src = 'play?id='+id;
        audio.load();
        $(emitter).removeAttr('onClick');
        $(".list-controls > span").removeClass('ui-icon-stop ui-icon-pause').addClass('ui-icon-play');
        resumeSelected(id,emitter);
    }
}

function search(term){
    $.ajax({url:'/search?id='+term,
        dataType: 'json',
    success: function(data){
        for(var i=0; i<data.length;i++){
            var title = data[i]["title"];
            var group = data[i]["group"];
            var id = data[i]["id"];
            var newLi = toHtml(id,group,title);
            $('#searchresults').append(newLi);
        }
    }
    });
};
function addSelected(id,group,title){
    $('#playlist').append(toHtml(id,group,title));
}
function toHtml(id,group,title){
    return '<li class="ui-state-default">'+
        '        <div class="list-controls">'+
        '            <span class="ui-icon ui-icon-play" onClick=\'playSelected("'+id+'",this)\'></span>'+
        '            <span class="ui-icon ui-icon-circle-plus" onClick=\'addSelected("'+id+'","'+group+'","'+title+'")\'></span>'+
        '            <a href="play?id='+id+'"><span class="ui-icon ui-icon-arrowthickstop-1-s"></span></a>'+
        '         </div>'+
        '        <div class="list-name">'+group+' - '+title+'</div>'+
        '</li>';    
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


$(document).ready(function(){
    audio = $('audio')[0];
    playlist = $('#playlist');

    tracks = [];

    var champions = { id:"4b9ed95",
        title:"We are the champions",
    group:"Queen"};
    var libertine = { id:"fe7e4f9",
        title:"Libertine",
    group:"Kate Ryan"};
    addSelected(libertine["id"],libertine["title"],libertine["group"]);
    addSelected(champions["id"],champions["title"],champions["group"]);
});
