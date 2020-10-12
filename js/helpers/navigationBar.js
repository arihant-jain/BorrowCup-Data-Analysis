$('#navigation-div').load('../navigation.html .navbar', function(){
    console.log("changing links");

    // changing chart links
    var anchors = $('.charts-links .nav-link');
    for (var anchor of anchors){
      var link = $(anchor).attr('href');
      $(anchor).attr('href', link.slice(10));
    }

    // changing index page link
    var titleAnchor = $('.navbar-brand > a');
    link = $(titleAnchor).attr('href');
    $(titleAnchor).attr('href', '.' + link);
    var titleImage = $('.navbar-brand > a > img');
    link = $(titleImage).attr('src');
    $(titleImage).attr('src', '.' + link);

    // changing developers page link
    var devAnchors = $('.developers .nav-link');
    for (var anchor of devAnchors){
        var link = $(anchor).attr('href');
        $(anchor).attr('href', link.slice(10));
    }
    
    // for adding active class to the current page
    var path = window.location.pathname;
    var page = path.split("/").pop();
    console.log('name: ', page);
    for (anchor of anchors){
        if($(anchor).attr('href').includes(page)){
            $(anchor).parent().addClass('active');
        }
    }
    for (anchor of devAnchors){
        if($(anchor).attr('href').includes(page)){
            $(anchor).parent().addClass('active');
        }
    }
});