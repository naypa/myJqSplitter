requirejs.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    //By default load any module IDs from js/lib
    baseUrl: '../js/lib',
    //paths config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
    }
});

//Espace global de l'application
define('window', [], window);

// 
require(
    ['jquery', 'jquery-ui', 'my-jq-splitter'],
    function($) {
    	$('body').myJqSplitter({mainPane: $('#one'), sidePane: $('#left'), position: 'left', toggler: false, resizeable: false});
    	$('#one').myJqSplitter({mainPane: $('#two'), sidePane: $('#top'), position: 'top', toggler: true, resizeable: false});
    	$('#two').myJqSplitter({mainPane: $('#three'), sidePane: $('#bottom'), position: 'bottom', toggler: false, resizeable: true});
    	$('#three').myJqSplitter({mainPane: $('#four'), sidePane: $('#right'), position: 'right', toggler: true, resizeable: true});
    }
);