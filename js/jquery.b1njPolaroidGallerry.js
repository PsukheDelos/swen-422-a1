/*! jQuery B1njPolaroidGallery - v1.0
* https://github.com/b1nj/b1njPolaroidGallery
* Includes: jquery.ui.js
* Copyright (c) 2012 b1nj Licensed MIT */

;(function ( $, window, document, undefined ) {

        var zArray = new Array();
        // Create the defaults once
        var pluginName = "b1njPolaroidGallery",
                defaults = {
                // maxRotation: 0,
                // randomStacking: true
        };

        // The actual plugin constructor
        function Plugin ( element, options ) {
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
                    self.galleryW = self.$element.width();
                    self.galleryH = self.$element.height();
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
                        $photo.width($('img', this).width() + (Number($('img', this).css('margin-left').slice(0,-2)) * 2));

                        $('a', this).click(function (e)
                        {
                            var $lien = $(this);
                            if (!$lien.parent('li').hasClass('b1njPolaroidGallery-linkOk')) {
                                $lien.parent('li').addClass('b1njPolaroidGallery-linkOk');
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        });



                        var photoW = $photo.outerWidth();
                        var photoH = $photo.outerHeight();

                        var rotDegrees = self._randomXToY(0, self.settings.maxRotation);
                        var tempVal = Math.round(Math.random());
                        if(tempVal == 1) {
                            var rotDegrees = 360 - rotDegrees; // rotate left
                        }

                        var shiftT = self._shiftAfterRotate(photoH, photoW, rotDegrees);
                        var shiftL = self._shiftAfterRotate(photoW, photoH, rotDegrees);

                        if (self.galleryH - shiftT - photoH > shiftT) {
                            var top = self._randomXToY(shiftT, self.galleryH - shiftT - photoH);
                        } else {
                            var top = shiftT;
                        }
                        if (self.galleryW - shiftL - photoW > shiftL) {
                            var left = self._randomXToY(shiftL, self.galleryW - shiftL - photoW);
                        } else {
                            var left = shiftL;
                        }

                        var cssObj = {
                            'left' : '+=' + left,
                            'top' : '+=' + top
                        };
                        cssObj['z-index'] = self.zIndex[index];

                        var datas = {
                            'shiftT' : shiftT,
                            'shiftL' : shiftL,
                            'rotDegrees' : rotDegrees,
                            'photoH' : photoH,
                            'photoW' : photoW
                        };

                        self.rotate($photo, rotDegrees);
                        $photo.css(cssObj).
                        data(datas).
                        bind('click', function(e)
                        {
                            // self._sortZIndex(index);
                            self.$element.find('li').not(this).removeClass('b1njPolaroidGallery-active b1njPolaroidGallery-linkOk');
                            $photo.addClass('b1njPolaroidGallery-active');
                            $("#selected").attr('id', '');
                            // console.log($photo.attr('id'));
                            if ($photo.attr('id') == '') { $photo.attr('id', 'selected'); }
                            else { $photo.attr('id', ''); }
                        }).
                        draggable({
                            containment : 'parent',
                            start: function(event, ui) {
                                if (('a', this).length != 0) {
                                    $photo.addClass('b1njPolaroidGallery-LinkOk');
                                }
                            },
                            stop: function(event, ui) {
                                rotDegrees = $(this).data('rotDegrees');
                                self.rotate($photo,rotDegrees);
                            }
                        });

                    });
                },

                _sortZIndex: function (index)
                {
                    var thisOldZIndex = this.zIndex[index];
                    for(var i = 0; i < this.zIndex.length; i++) {
                        var $this = $('li:eq(' + i + ')', gallery);
                        if (this.zIndex[i] == this.nbPhotos && i != index) {
                            var thisDatas = $this.data();
                            var top = $this.position().top;
                            var left = $this.position().left;
                            if (top < thisDatas.shiftT) {
                                $this.css('top', '+=' + (top + thisDatas.shiftT));
                            } else if (thisDatas.photoH + top + thisDatas.shiftT > this.galleryH) {
                                $this.css('top', '-=' + (thisDatas.photoH + top + thisDatas.shiftT - this.galleryH));
                            }
                            if (left < thisDatas.shiftL) {
                                $this.css('left', '+=' + (left + thisDatas.shiftL));
                            } else if (thisDatas.photoW + left + thisDatas.shiftL > this.galleryW) {
                                $this.css('left', '-=' + (thisDatas.photoW + left + thisDatas.shiftL - this.galleryW));
                            }
                        }
                        if (this.zIndex[i] > thisOldZIndex) {
                            this.zIndex[i]--;
                        } else if (i == index) {
                            this.zIndex[i] = this.nbPhotos;
                        }
                        $this.css('z-index', this.zIndex[i]);
                    }
                },

                // Function to get random number upto m
                // http://roshanbh.com.np/2008/09/get-random-number-range-two-numbers-javascript.html
                _randomXToY: function (minVal, maxVal, floatVal)
                {
                    var randVal = minVal+(Math.random()*(maxVal-minVal));
                    return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
                },

                rotate: function (element, rotation)
                {
                    var s = element.css("transform");
                    // console.log(s);
                    // rotation matrix - http://en.wikipedia.org/wiki/Rotation_matrix
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
                        // arc sin, convert from radians to degrees, round
                        var sin = b/scale;
                        // next line works for 30deg but not 130deg (returns 50);
                        // var angle = Math.round(Math.asin(sin) * (180/Math.PI));
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
                    if (dir=="down" && z > 0){ 
                        zArray.move(z,z-1);   
                    }
                    else if(dir=="up" && z < $('li').length-1){
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
                    // var s = parseFloat(element.css("transform").split(',')[0].slice(7));
                    var s = element.css("transform");
                    // rotation matrix - http://en.wikipedia.org/wiki/Rotation_matrix
                    if(s=='none'){
                        scale = 1;
                        angle = 0;
                    }else{

                        // if (s != null) {
                            // console.log(s);
                            var values = s.split('(')[1].split(')')[0].split(',');
                            var a = values[0];
                            var b = values[1];
                            var c = values[2];
                            var d = values[3];

                            var scale = Math.sqrt(a*a + b*b);

                            // console.log('Scale: ' + scale);

                            // arc sin, convert from radians to degrees, round
                            var sin = b/scale;
                            // next line works for 30deg but not 130deg (returns 50);
                            // var angle = Math.round(Math.asin(sin) * (180/Math.PI));
                            var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));

                            // console.log('Rotate: ' + angle + 'deg');

                        // }
                    
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

                // Fuction get the shift after rotate the photo
                // http://www.maths-forum.com/trigonometrie-rotation-d-un-rectangle-129467.php
                // //x = (1/V2).V(CD² + AD²) * V(1-cos(alpha)) * sin[(180° - alpha)/2 - arctg(AD/CD)]
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

        // A really lightweight plugin wrapper around the constructor,
        // preventing against multiple instantiations
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
