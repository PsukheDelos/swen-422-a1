// Store frame for motion functions
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;
var appX = 0;
var appY = 0;

var swipeUp = 0;
var swipeDn = 0;
var swipeRt = 0;
var swipeLf = 0;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

Leap.loop(controllerOptions, function(frame) {

  try{
    var appWidth = document.body.clientWidth;
    var appHeight = document.body.clientHeight;

    var iBox = frame.interactionBox;
    var pointable = frame.pointables[0];

    var leapPoint = pointable.stabilizedTipPosition;
    var normalizedPoint = iBox.normalizePoint(leapPoint, true);

    appX = normalizedPoint[0] * appWidth;
    appY = (1 - normalizedPoint[1]) * appHeight;

    // console.log("touchzone: " + touchZone);
    var touchZone = frame.pointables[0].touchZone;

    if (!(touchZone=="hovering"  && $('#selected').size() > 0)){
          moveSection("target", appX, appY);
    } 

    if(frame.pointables.length > 0 && frame.hands.length==1) {
        // console.log(document.elementFromPoint(appX, appY));
        if(touchZone!="touching" && $('#selected').size() == 0) {
          for (var i = 0; i < frame.gestures.length; i++) {
            // $("#gallery-ul").append($("<li><img src=\"img/" + 2 + ".jpg\" alt=\"\"></img></li>"));
            // $('#gallery').tooltip('init', $("#selected"), "down");
            var gestureo = frame.gestures[i];
            switch (gestureo.type) {
              case "swipe":
                // console.log("no selected & swipe");
                gestureString  = "swipe"; 
                var isHorizontal = Math.abs(gestureo.direction[0]) > Math.abs(gestureo.direction[1]);
                if(isHorizontal) {
                  if(gestureo.direction[0] > 0) {swipeRt++;} // right swipe
                  else {swipeLf++;} // left swipe
                }
                break;
              default: break;
            }
            if (swipeRt > 12) {
              addImages();
              swipeRt = 0;
            }
          }
        } else if(touchZone=="touching" && $('#selected').size() == 0) {
          // console.log('touching');
          $(document.elementFromPoint(appX, appY)).click();
        } else if (touchZone=="touching" && $('#selected').size() > 0) {
          // console.log('move');
          var cssObj = {'left' : appX-$('#selected').width()-40, 'top' : (appY-$('#selected').height()/2)};
          $('#selected').css(cssObj);
          $('#selected').css({ background: "red" });
          $('#target').css({ fill: "red" });
        } else if (touchZone=="hovering"  && $('#selected').size() > 0) {
          // console.log('hovering');
          $('#target').css({ fill: "green" });
          $('#selected').css({ background: "green" });
          var handString = "No hands";
          // for (var i = 0; i < frame.hands.length; i++) {
            var hand = frame.hands[0];
            var img = $("#selected");
            // if hand roll detected
            if (hand.roll() < -0.5) { $('#gallery').tooltip('rotate', img, "right"); }
            else if (hand.roll() > 0.5) { $('#gallery').tooltip('rotate', img, "left"); }

          if (pauseOnGesture) { togglePause(); }
          var gestureString = "No gestures";
          if (pauseOnGesture) { togglePause(); }
          for (var i = 0; i < frame.gestures.length; i++) {
            var gesture = frame.gestures[i];
            switch (gesture.type) {
              case "circle":
                gestureString = "circle";
                var clockwise = false;
                var pointableID = gesture.pointableIds[0];
                var direction = frame.pointable(pointableID).direction;
                var dotProduct = Leap.vec3.dot(direction, gesture.normal);
                if(dotProduct > 0) clockwise = true;
                var img = $("#selected")
                if(clockwise) { $('#gallery').tooltip('scale', img, "increase"); }
                else{ $('#gallery').tooltip('scale', img, "decrease"); }
                break;
              case "swipe": 
                gestureString  = "swipe"; 
                var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                if(isHorizontal) {
                  if(gesture.direction[0] > 0) {console.log("left");} // left swipe
                  else {shitHappens();console.log("right");} // right swipe
                } else { //vertical
                  if(gesture.direction[1] > 0) {
                    console.log(swipeUp);
                    swipeUp++;
                    if(swipeUp > 40) {
                      swipeUp = 0;
                      $('#gallery').tooltip('zUpdate', $("#selected"), "up");
                    }
                  } else {
                    console.log(swipeDn);
                    swipeDn++;
                    if(swipeDn > 40) {
                      swipeDn = 0;
                      $('#gallery').tooltip('zUpdate', $("#selected"), "down");
                    }
                  }                  
                }
                break;
              case "screenTap": gestureString  = "screenTap"; break;
              case "keyTap": 
                $('#gallery').tooltip('zUpdate', $("#selected"), "cycle"); 
                // console.log("cycleZ");
                break;
              default: break;
            }
          }

        } else {
            $('#selected').css({ background: "white" });
            $("#selected").attr('id', '');
            $('#target').css({ fill: "grey" });
        }
    }
  }catch(e){
    // console.log("error");
  }
  previousFrame = frame;
});


//load in all images from img folder  
// for(x = 0 ; x<4 ; x++){ $("#gallery-ul").append($("<li><img src=\"img/" + x + ".jpg\" alt=\"\"></img></li>")); }

//create photo gallery
$(function() { $('#gallery').b1njPolaroidGallery(); });

//listen for key presses (for testing functions)
window.onkeydown = function (e) {
  var code = e.keyCode ? e.keyCode : e.which;
  if (code === 39) { var img = $("#selected"); $('#gallery').tooltip('rotate', img, "right"); } //right key
  else if (code === 37) { var img = $("#selected"); $('#gallery').tooltip('rotate', img, "left"); } //left key
  else if (code === 40) { $('#gallery').tooltip('zUpdate', $("#selected"), "down"); } //down key
  else if (code === 38) { $('#gallery').tooltip('zUpdate', $("#selected"), "up"); } //up key
  else if (code === 221){ $('#gallery').tooltip('scale', $("#selected"), "increase"); }  // ] key
  else if (code === 219){ $('#gallery').tooltip('scale', $("#selected"), "decrease"); } // [ key
};

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) { document.documentElement.requestFullScreen(); }
    else if (document.documentElement.mozRequestFullScreen) { document.documentElement.mozRequestFullScreen(); }
    else if (document.documentElement.webkitRequestFullScreen) { document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); }  
  } else {  
    if (document.cancelFullScreen) { document.cancelFullScreen(); }
    else if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); } 
    else if (document.webkitCancelFullScreen) { document.webkitCancelFullScreen(); }  
  }  
}

function moveSection(idStr, xOffset, yOffset) {
var domElemnt = document.getElementById(idStr);
    if (domElemnt) {
        var transformAttr = ' translate(' + xOffset + ',' + yOffset + ')';
        domElemnt.setAttribute('transform', transformAttr);
    }
}

function addImages() { // on right swipe with no images being moved or manipulated, add some images to work with
  // console.log($(".selected-thumb").length);
  $(".selected-thumb").each(function(){
    // console.log($(this).attr('id'));
    $("#gallery-ul").append($("<li><img src=\"img/" + $(this).attr('id') + ".jpg\" alt=\"\"></img></li>"));
  });
  $('#gallery').tooltip('init', $("#selected"), "down");
}