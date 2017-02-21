// we use this values in s.js
window.path = '';
// if you change this value make sure you change #s-templates>.card src to match the cards_path
window.cards_path = window.path + 'imgs/cards-low-res/';

$(function () {
    addImagesSoWindowOnloadWaitsTillTheyAreReady();
    translateMouseEventsToDragEvents();    
});

$(window).on("load", function () {
    setTimeout(function () {
        $('#tmp-wrapper-to-load-images').hide();
        $('#s-board').show();
        var s = $('#s-board').s();
    }, 1000);
});

function addImagesSoWindowOnloadWaitsTillTheyAreReady() {
    var info = { 0: 's', 1: 'd', 2: 'h', 3: 's' };
    var cardElements = [];
    var createElement = function (i, j, isBackCard) {
        let card = isBackCard ? 'back.png' : (info[j] + (i + 1) + '.png');
        // make sure the width/height match the one in s.css
        return $('<img width="125px" height="181" alt="' + card + '" src="' + window.cards_path + card + '">');;
    }
    cardElements.push(createElement(undefined, undefined, true));    
    for (var i = 0; i < 13; i++) {
        for (var j = 0; j < 4; j++) {
            cardElements.push(createElement(i, j));
        }
    }
    var cardsPerLine = 7;
    for (var i = 0; i < Math.ceil(52 / cardsPerLine); i++) {
        var line = $('<div>');
        $('#tmp-wrapper-to-load-images').append(line);
        for (var j = 0; j < cardsPerLine; j++) {
            if (!cardElements.length) {
                break;
            }
            line.append(cardElements.shift());
        }
    }
}

/**
 * So click events translate to mobile events (touchstart/touchmove/touchend etc...)
 */
function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    // event.preventDefault(); // gives warning but seems like it doesn't matter if we comment it, commenting to avoid warning
}

function translateMouseEventsToDragEvents() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    // document.addEventListener("touchcancel", touchHandler, true);
}