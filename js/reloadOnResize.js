var width = $(window).width();

// Call our resize function if the window size is changed.
window.onresize = function(){
    if($(window).width() != width){
        return location.reload();
    }      
};