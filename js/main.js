/**
 * Global variables
 */
"use strict";

var userAgent = navigator.userAgent.toLowerCase(),
  initialDate = new Date(),

  $document = $(document),
  $window = $(window),
  $html = $("html"),

  isDesktop = $html.hasClass("desktop"),
  isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTouch = "ontouchstart" in window,
  isNoviBuilder,

  plugins = {
    swiper: $(".swiper-slider"),
    pageLoader: $(".page-loader"),
    videBG: $('.bg-vide'),
  };



$(function () {
  isNoviBuilder = window.xMode;

  /**
   * toggleSwiperInnerVideos
   * @description  toggle swiper videos on active slides
   */
  function toggleSwiperInnerVideos(swiper) {
    var videos;

    $.grep(swiper.slides, function (element, index) {
      var $slide = $(element),
        video;

      if (index === swiper.activeIndex) {
        videos = $slide.find("video");
        if (videos.length) {
          videos.get(0).play();
        }
      } else {
        $slide.find("video").each(function () {
          this.pause();
        });
      }
    });
  }

  /**
   * toggleSwiperCaptionAnimation
   * @description  toggle swiper animations on active slides
   */
  function toggleSwiperCaptionAnimation(swiper) {
    if (isIE && isIE < 10) {
      return;
    }

    var prevSlide = $(swiper.container),
      nextSlide = $(swiper.slides[swiper.activeIndex]);

    prevSlide
      .find("[data-caption-animate]")
      .each(function () {
        var $this = $(this);
        $this
          .removeClass("animated")
          .removeClass($this.attr("data-caption-animate"))
          .addClass("not-animated");
      });

    nextSlide
      .find("[data-caption-animate]")
      .each(function () {
        var $this = $(this),
          delay = $this.attr("data-caption-delay");

        setTimeout(function () {
          $this
            .removeClass("not-animated")
            .addClass($this.attr("data-caption-animate"))
            .addClass("animated");
        }, delay ? parseInt(delay) : 0);
      });
  }

  /**
   * Swiper 3.1.7
   * @description  Enable Swiper Slider
   */
  if (plugins.swiper.length) {
    plugins.swiper.each(function () {
      var slider = $(this),
        pag      = slider.find(".swiper-pagination"),
        next     = slider.find(".swiper-button-next"),
        prev     = slider.find(".swiper-button-prev"),
        bar      = slider.find(".swiper-scrollbar"),
        parallax = slider.parents('.rd-parallax').length;

      slider.find(".swiper-slide")
        .each( function () {
          var $this = $(this), url;
          if ( url = $this.attr("data-slide-bg") ) {
            $this.css({
              "background-image": "url(" + url + ")",
              "background-size": "cover"
            })
          }

        })
        .end()
        .find("[data-caption-animate]")
        .addClass("not-animated")
        .end()
        .swiper({
          autoplay:                 !isNoviBuilder && $.isNumeric( slider.attr( 'data-autoplay' ) ) ? slider.attr( 'data-autoplay' ) : false,
          direction:                slider.attr('data-direction') || "horizontal",
          effect:                   slider.attr('data-slide-effect') || "slide",
          speed:                    slider.attr('data-slide-speed') || 600,
          keyboardControl:          !isNoviBuilder ? slider.attr('data-keyboard') === "true" : false,
          mousewheelControl:        !isNoviBuilder ? slider.attr('data-mousewheel') === "true" : false,
          mousewheelReleaseOnEdges: slider.attr('data-mousewheel-release') === "true",
          nextButton:               next.length ? next.get(0) : null,
          prevButton:               prev.length ? prev.get(0) : null,
          pagination:               pag.length ? pag.get(0) : null,
          simulateTouch:            false,
          paginationClickable:      pag.length ? pag.attr("data-clickable") !== "false" : false,
          paginationBulletRender:   pag.length ? pag.attr("data-index-bullet") === "true" ? function ( index, className ) {
            return '<span class="'+ className +'">'+ (index + 1) +'</span>';
          } : null : null,
          scrollbar:                bar.length ? bar.get(0) : null,
          scrollbarDraggable:       bar.length ? bar.attr("data-draggable") !== "false" : true,
          scrollbarHide:            bar.length ? bar.attr("data-draggable") === "false" : false,
          loop:                     !isNoviBuilder ? slider.attr('data-loop') !== "false" : false,
          loopAdditionalSlides:     0,
          loopedSlides:             0,
          onTransitionStart: function ( swiper ) {
            if( !isNoviBuilder ) toggleSwiperInnerVideos( swiper );
          },
          onTransitionEnd: function ( swiper ) {
            if( !isNoviBuilder ) toggleSwiperCaptionAnimation( swiper );
            $(window).trigger("resize");
          },

          onInit: function ( swiper ) {
            if ( plugins.pageLoader.length ) {
              var srcFirst = $("#page-loader").attr("data-slide-bg"),
                image = document.createElement('img');

              image.src = srcFirst;
              image.onload = function () {
                plugins.pageLoader.addClass( "loaded" );
              };
            }

            if( !isNoviBuilder ) toggleSwiperInnerVideos( swiper );
            if( !isNoviBuilder ) toggleSwiperCaptionAnimation( swiper );


            $(window).on('resize', function () {
              swiper.update(true);
            })
          },
          onSlideChangeStart: function (swiper) {
            if ( isNoviBuilder ) return;

            var activeSlideIndex = swiper.activeIndex,
              slidesCount = swiper.slides.not(".swiper-slide-duplicate").length,
              thumbsToShow = 3;

            //If there is not enough slides
            if ( slidesCount < thumbsToShow ) return false;

            //Fix index count
            if ( activeSlideIndex === slidesCount + 1 ) activeSlideIndex = 1;
            else if ( activeSlideIndex === 0 ) activeSlideIndex = slidesCount;

            //Lopp that adds background to thumbs
            for (var i = -thumbsToShow; i < thumbsToShow + 1; i++) {
              if ( i === 0 ) continue;

              //Previous btn thumbs
              if ( i < 0 ) {
                //If there is no slides before current
                if ( ( activeSlideIndex + i - 1) < 0 ) {
                  $(swiper.container).find( '.swiper-button-prev .preview__img-'+ Math.abs(i) )
                    .css("background-image", "url(" + swiper.slides[slidesCount + i + 1].getAttribute("data-preview-bg") + ")");
                } else {
                  $(swiper.container).find( '.swiper-button-prev .preview__img-'+ Math.abs(i) )
                    .css("background-image", "url(" + swiper.slides[activeSlideIndex + i].getAttribute("data-preview-bg") + ")");
                }

                //Next btn thumbs
              } else {
                //If there is no slides after current
                if ( activeSlideIndex + i - 1 > slidesCount ) {
                  $(swiper.container).find('.swiper-button-next .preview__img-' + i)
                    .css("background-image", "url(" + swiper.slides[i].getAttribute("data-preview-bg") + ")");
                } else {
                  $(swiper.container).find('.swiper-button-next .preview__img-' + i)
                    .css("background-image", "url(" + swiper.slides[activeSlideIndex + i].getAttribute("data-preview-bg") + ")");
                }
              }
            }
          },
        });

      $(window)
        .load(function () {
          slider.find("video").each(function () {
            if (!$(this).parents(".swiper-slide-active").length) {
              this.pause();
            }
          });
        })
        .trigger("resize");
    });
  }

  /**
   * WOW
   * @description Enables Wow animation plugin
   */
  if ( !isNoviBuilder && $html.hasClass('desktop') && $html.hasClass("wow-animation") && $(".wow").length ) {
    new WOW().init();
  }

  /**
   * Background Video
   * @description  Enable Video plugin
   */
  if ( plugins.videBG.length ) {
    for( var i =0; i < plugins.videBG.length; i++ ) {
      var $element = $(plugins.videBG[i]),
        options = $element.data('vide-options'),
        path = $element.data('vide-bg');
      $element.vide( path, options );
    }
  }


});