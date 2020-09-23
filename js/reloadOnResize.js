var screenWidth = $(window).width();

// Call our resize function if the window size is changed.
window.onresize = function(){
    if($(window).width() != screenWidth){
        return location.reload();
    }      
};