// Store frame for motion functions
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

Leap.loop(controllerOptions, function(frame) {

  if($('#selected').size() > 0) {

    // Display Hand object data
    var handString = "No hands";
    if (frame.hands.length > 0) {
      for (var i = 0; i < frame.hands.length; i++) {
        var hand = frame.hands[i];
        var img = $("#selected");
        if (img != 'none') {
          // if hand roll detected
          if (hand.roll() < -0.5) { $('#gallery').tooltip('rotate', img, "right"); }
          else if (hand.roll() > 0.7) { $('#gallery').tooltip('rotate', img, "left"); }
          // if hand z change detected
          var zChange = hand.translation(previousFrame)[2];
          if (zChange > 3.5) { $('#gallery').tooltip('zUpdate', $("#selected"), "up"); }
          else if (zChange < -3.5) { $('#gallery').tooltip('zUpdate', $("#selected"), "down"); }
        }
      }
    }
    // if (handString != "No hands") { console.log(handString); }

    // Display Gesture object data
    var gestureString = "No gestures";
    if (frame.gestures.length > 0) {
      if (pauseOnGesture) { togglePause(); }
      for (var i = 0; i < frame.gestures.length; i++) {
        var gesture = frame.gestures[i];
        // find gesture type
        switch (gesture.type) {
          case "circle":
            // gestureString = "circle"
            var clockwise = false;
            var pointableID = gesture.pointableIds[0];
            var direction = frame.pointable(pointableID).direction;
            var dotProduct = Leap.vec3.dot(direction, gesture.normal);
            if(dotProduct > 0) clockwise = true;
            var img = $("#selected")
            if(clockwise){ $('#gallery').tooltip('scale', img, "increase"); }
            else{ $('#gallery').tooltip('scale', img, "decrease"); }
            break;
          case "swipe": gestureString  = "swipe"; break;
          case "screenTap": gestureString  = "screenTap"; break;
          case "keyTap": gestureString = "keyTap"; break;
          default: gestureString = "unkown gesture type";
        }
      }
    }
    // if (gestureString != "No gestures") { console.log(gestureString); }

    // Store frame for motion functions
    previousFrame = frame;

}

});

//load in all images from img folder  
for(x = 0 ; x<4 ; x++){ $("#gallery-ul").append($("<li><img src=\"img/" + x + ".jpg\" alt=\"\"></img></li>")); }

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

 //    console.log($('li').length);  //this is the Z so far, so this++ is next Z 
 //    $("#gallery-ul").append($("<li class=\"ui-draggable b1njPolaroidGallery-LinkOk\" style=\"width: 220px; z-index: 1; left: 272px; top: 216px;\" id=\"\"><img src=\"img_bak/img1.jpg\" alt=\"\"></li>"));
 //    <li class="ui-draggable" style="width: 220px; z-index: 4;"><img src="img/10.jpg" alt=""></li>
 //    $("#gallery-ul").append($("<li class=\"ui-draggable\" style=\"width: 220px; z-index: 1;\" id=\"added\"><img src=\"img_bak/img1.jpg\" alt=\"\"></img></li>"));
 //    $("#gallery-ul").append($("<li class=\"ui-draggable\" style=\"width: 220px; z-index: "+($('li').length+1)+";\"><img src=\"img_bak/img1.jpg\" alt=\"\"></img></li>"));
 //    var img = $("#added")
 //    console.log(img);
 //    $('#gallery').tooltip('addPhoto', ("<li class=\"ui-draggable\" style=\"width: 220px; z-index: "+($('li').length+1)+";\"><img src=\"img_bak/img1.jpg\" alt></img></li>"), $('li').length+1); 

 //    $("#gallery-ul").append($("<li class=\"ui-draggable\" style=\"width: 220px; z-index: "+($('li').length+1)+";\"><img src=\"img_bak/img1.jpg\" alt=\"\"></img></li>"));
 //    $('#gallery').tooltip('addPhoto', $("#selected"), "up");

//remove selection if no photo picked
// $('#gallery').mouseup(function(e) { e.preventDefault(); $("#selected").attr('id', ''); });
// $('body').mouseup(function(e) { e.preventDefault(); $("#selected").attr('id', ''); });

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