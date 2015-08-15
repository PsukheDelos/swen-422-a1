
;(function ( $, window, document, undefined ) {
        var selected = "";
        var zArray = new Array();
        var pluginName = "b1njPolaroidGallery",
                defaults = {};

        function Plugin ( element, options ) {
                console.log(element);
                this.element = element;
                this.$element = $(this.element);
                this.settings = $.extend( {}, defaults, options );
                this._defaults = defaults;
                this._name = pluginName;

                this.$element.addClass('b1njPolaroidGallery');

                this.nbPhotos = $('li', this.element).length;
                this.zIndex = new Array();
                for(var i = 0; i < this.nbPhotos; i++) {
                    this.zIndex[i] = i + 1;
                }
                if (this.settings.randomStacking) {
                    this.zIndex = this.zIndex.sort(function() { return 0.5 - Math.random(); });
                }

                var self = this;
                $(window).load(function() {
                    self.init();
                });
        }

        Plugin.prototype = {
                init: function () {
                    var self = this;
                    z = 0;
                    $('li', this.element).each (function (index, value)
                    {
                        var $photo = $(this);
                        zArray[z] = $('img', this).attr('src');
                        z++;
                        var alt = $('img', this).attr('alt');
                        if (alt != '') {
                            $(this).append('<p>'+ alt +'</p>');
                        }

                        $photo.
                        bind('click', function(e)
                        {
                            $photo.addClass('b1njPolaroidGallery-active');
                            $photo.attr('id', 'selected');  
                        }).
                        draggable({
                            containment : 'parent',
                            start: function(event, ui) {
                                if (('a', this).length != 0) {
                                    $photo.addClass('b1njPolaroidGallery-LinkOk');
                                }
                            }
                        });

                    });
                },

                rotate: function (element, rotation)
                {
                    var s = element.css("transform");
                    if(s=='none'){
                        scale = 1;
                        angle = 0;
                    }else{
                        var values = s.split('(')[1].split(')')[0].split(',');
                        var a = values[0];
                        var b = values[1];
                        var c = values[2];
                        var d = values[3];
                        var scale = Math.sqrt(a*a + b*b);
                        var sin = b/scale;
                        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));                    
                    }

                    if(rotation=='right'){
                        angle = angle + 2;
                    }else if(rotation=='left'){
                        angle = angle - 2;
                    }

                    if ($.browser.msie  && parseInt($.browser.version, 10) === 8) {
                        var photoW = element.outerWidth();
                        var photoH = element.outerHeight();
                        var shiftT = this._shiftAfterRotate(photoH, photoW, rotation);
                        var shiftL = this._shiftAfterRotate(photoW, photoH, rotation);
                        if (rotation >= 0) {
                            rotation = Math.PI * rotation / 180;
                        } else {
                            rotation = Math.PI * (360 + rotation) / 180;
                        }
                        var cssObj = {
                            'filter' : 'progid:DXImageTransform.Microsoft.Matrix(M11=' + Math.cos(rotation) + ",M12=" + (-Math.sin(rotation)) + ",M21=" + Math.sin(rotation) + ",M22=" + Math.cos(rotation) + ",SizingMethod='auto expand')",
                            'margin-top' : -shiftT,
                            'margin-left' : -shiftL
                        }
                    } else {
                        var cssObj = {
                            'transform' : 'scale('+scale+','+scale+') rotate(' + angle + 'deg)', 
                        };
                    }
                    element.css(cssObj);
                },

                zUpdate: function (element, dir)
                {
                    img = element.children('img').attr('src');
                    oz = zArray;
                    z = zArray.indexOf(img);
                    if (dir=="cycle"){
                        if(z==0){ zArray.move(z, zArray.length-1); }
                        else{ zArray.move(z,z-1); }
                    } else if (dir=="down" && z > 0){
                        zArray.move(z,z-1);   
                    } else if(dir=="up" && z < $('li').length-1){
                        zArray.move(z,z+1);
                    }
                    $( ".ui-draggable" ).each(function() {
                        i = zArray.indexOf($(this).children('img').attr('src'));
                        var cssObj = {
                            'z-index' : i
                        }
                        $(this).css(cssObj);
                    });
                },

                scale: function (element, dir)
                {
                    var s = element.css("transform");

                    if(s=='none'){
                        scale = 1;
                        angle = 0;
                    }else{
                        var values = s.split('(')[1].split(')')[0].split(',');
                        var a = values[0];
                        var b = values[1];
                        var c = values[2];
                        var d = values[3];

                        var scale = Math.sqrt(a*a + b*b);
                        var sin = b/scale;
                        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));                    
                    }

                    if (dir=="increase"){ 
                        scale = scale + .01;
                        var cssObj = {
                            'transform' : 'scale('+scale+','+scale+') rotate(' + angle + 'deg)'
                        }
                    }
                    else if (dir=="decrease"){ 
                        scale = scale - .01;
                        var cssObj = {
                            'transform' : 'scale('+scale+','+scale+') rotate(' + angle + 'deg)'
                        }
                    }
                    element.css(cssObj);
                },                

                _shiftAfterRotate: function _(height, width, rotate)
                {
                    if (rotate > 180) {
                        rotate = 360 - rotate;
                    } else if (rotate < 0) {
                        rotate = -rotate;
                    }
                    var x = (1/Math.sqrt(2)) *
                    Math.sqrt(Math.pow(width,2) + Math.pow(height,2)) *
                    Math.sqrt(1 - Math.cos(rotate * (Math.PI / 180))) *
                    Math.sin(((180 - rotate)/2 - (Math.atan2(height, width)  * (180 / Math.PI))) * (Math.PI / 180));
                    return x;
                }

        };

        $.fn[ pluginName ] = function ( options ) {
                return this.each(function() {
                        if ( !$.data( this, "plugin_" + pluginName ) ) {
                                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
                        }
                });
        };
        methods = Plugin.prototype;

        $.fn.tooltip = function(methodOrOptions) {
            if ( methods[methodOrOptions] ) {
                return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
                // Default to "init"
                return methods.init.apply( this, arguments );
            } else {
                $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tooltip' );
            }    
        };

        Array.prototype.move = function (old_index, new_index) {
            if (new_index >= this.length) {
                var k = new_index - this.length;
                while ((k--) + 1) {
                    this.push(undefined);
                }
            }
            this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        };

})( jQuery, window, document );
