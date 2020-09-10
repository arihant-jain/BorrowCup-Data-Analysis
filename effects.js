$( window ).on( "load", function() {
    console.log( "window loaded" );
    $(".arc").tooltip({
        container: 'body',
        placement: 'right'
    });
});