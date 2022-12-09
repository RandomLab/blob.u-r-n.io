
var timerSFN, timerSC, timerPC;
var menuState = false;
var $mainContent, $el;
var nbCaptions = 0;
var archiveBool = false;

var docScrollGlob;

function screen() {
    var wh = window.innerHeight;
    var wv = window.innerWidth;
    var docScroll = 0;
    var nbImgs = $('.article-content-image').length;

    function lazyLoad() {
      function logElementEvent(eventName, element) {
          console.log(Date.now(), eventName, element.getAttribute("data-src"));
      }
      var callback_loaded = function(element) {
          image_container(element)
          logElementEvent("👍 LOADED", element);
      };
       var myLazyLoad = new LazyLoad({
         elements_selector: ".lazy",
          callback_loaded: callback_loaded,
       });
    }

    function image_container(img){
      if(img.parentElement.tagName.localeCompare("P") == 0){

        if(img.width > img.height){
          $(img).addClass("horizontal");
        }else{
          $(img).addClass("vertical");
        }

        var para = img.parentElement;
        //console.log(para)
        var fig = document.createElement('figure');
        fig.innerHTML = para.innerHTML;
        fig.classList.add("image_container");
        //console.log(fig)
        var next = para.nextElementSibling;
        if(next){
          if (next.tagName.localeCompare("FIGCAPTION") == 0){
            fig.appendChild(next);
          }
        }
        if(!!para.parentElement){
          para.parentElement.replaceChild(fig, para);
        }
        var next = fig.nextElementSibling;
        //console.log(next);
        if(next){
          if(next.tagName.localeCompare("P") != -1 && next.innerText == "" && next.children.length == 0){
              fig.parentElement.removeChild(next);
              //console.log("remove")
          }
        }
      }
    }

    function titleScrolled() {
        $(document).on('scroll', function () {
            var scrollTop = $(this).scrollTop();
            $('.subchapter').each(function () {
                var topDistance = $(this).offset().top;
                var heightDistance = topDistance + $(this).height();
                var id = this.id;
                if ((topDistance) < scrollTop && heightDistance > scrollTop) {
                    $(this).find(".runningTitle").addClass('is-scrolled');
                    //console.log(id);
                    $('a[href="#'+ id +'"]').addClass("is-reading")
                } else {
                    $(this).find(".runningTitle").removeClass('is-scrolled');
                    $('a[href="#'+ id +'"]').removeClass("is-reading")
                }
            });
        });
    }

    function titleScrolledMobile() {
      $("body").append("<button id='toc-button' type='button'>…</button>");
      $("#toc-button").on('click', toogleTOC);
      $("#toc").clone().attr("id","toc-nav").appendTo($("body"));
      var prevScrollpos = window.pageYOffset;
      isNavMobile=false;
      window.onscroll = function() {
        var currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos) {
          $(".is-scrolled").removeClass("nav-up");
          $("#toc-button").addClass("is-scrolled");
        } else {
          $(".is-scrolled").addClass("nav-up");

        }
        prevScrollpos = currentScrollPos;
      }
      $("#toc-nav a").on("click",function(){
        toogleTOC();
      })

    }
    var isNavMobile;
    function toogleTOC(){
      if (isNavMobile == false){
        //$("html").css("overflow-y","hidden");
        $("#toc-nav").addClass("nav-displayed");
        $("#toc-button").text("←");
        isNavMobile = true;
      }
      else if(isNavMobile == true){
        //$("html").css("overflow-y","hidden");
        $("#toc-nav").removeClass("nav-displayed");
        $("#toc-button").text("…");
        isNavMobile = false;
      }
    }

    function endScrolled() {
        $(document).on('scroll', function () {
            var scrollTop = $(this).scrollTop();
            $('.article-infos').each(function () {
                var topDistance = $(this).offset().top;
                if ($(this).visible(true)) {
                    $('.article-footer').addClass('is-scrolled');
                } else {
                    $('.article-footer').removeClass('is-scrolled');
                }
            });
        });
    }

    function goToTop() {
        $('.article-end-top').on('click', function () {
            $('body, html').animate({
                scrollTop: 0
            }, 600);
        });
    }

    function buildCaption() {
        $('.article-content-image').each(function (e) {
            var myN = $(this).attr('data-n');
            var caption = $(this).find('figcaption').html();
            if (typeof caption === 'undefined') {
                caption = '';
            }
            $('.article-footer-wrapper').html($('.article-footer-wrapper').html() + '<div class="article-footer-item" id="caption-' + myN + '" >' + caption + '</div>');
        });
    }

    function showCaption() {
        $(document).on('scroll',function() {
          docScrollGlob = $(document).scrollTop();
          $('.article-content-image').each(function (e) {
              var myN = $(this).attr('data-n');
              var myOffset = Math.round($(this).offset().top + ($(this).outerHeight(true) / 2));
              if ($(this).visible(true) && parseInt(docScroll + (9 / 10 * wh)) >= myOffset && parseInt(docScroll + (1 / 10 * wh)) <= myOffset) {
                  $('#caption-' + myN).addClass('is-active');
              } else {
                  $('#caption-' + myN).removeClass('is-active');
              }
          });
        })
    }
    //timerSC = setInterval(showCaption, 500);

    function buildFootnote() {
        $("body").append("<div id='footnotes'></div>");
        $('.note_call').each(function () {
            var chapter = $(this).parent().parent().attr('id');
            var href = $(this).attr('href');
            var newhref = href.split("_")[0] + "_" + chapter + "_" + href.split("_")[1];
            newhref = "#" + newhref.replace(/^[^a-z]+|[^\w:.-]+/gi, "");
            $(this).attr('href',newhref);
        });

        $('.note').each(function () {

            if ($(this).parent().find(".notes").length === 0){
              $(this).parent().append("<div class='notes'></div>");
            }
            var chapter = $(this).parent().attr('id');
            var id = $(this).attr('id');
            //console.log(id);
            var newid = id.split("_")[0] + "_" + chapter + "_" + id.split("_")[1];
            //console.log(newid);
            newid = newid.replace(/^[^a-z]+|[^\w:.-]+/gi, "");
            $(this).attr('id', newid);
            var footnote = $(this).clone().attr('id',newid+"_footer").addClass("footnotes")
            $("#footnotes").append(footnote);
            $(this).appendTo($(this).parent().find(".notes"));
        });
    }

    function showFootnote() {
        $(document).on('scroll',function (){
            docScroll = $(document).scrollTop();
            $('.note_call').each(function (e) {
                var note_in_footer = $(this).attr('href')+"_footer";
                var myOffset = get_absolute_offset_top(this);
                if (myOffset < parseInt(docScroll + (3 / 4 * wh)) && myOffset > parseInt(docScroll + (1 / 4 * wh))) {
                  console.log(myOffset);
                  console.log(this);
                  $(note_in_footer).show();
                } else {
                  $(note_in_footer).hide();
                }
            });
        });
    }
    //timerSFN = setInterval(showFootnote, 500);

    function get_absolute_offset_top(element, root_parent = "BODY"){
      var offsetTop = 0;
      do {
        if ( !isNaN( element.offsetTop ) )
        {
            offsetTop += element.offsetTop;
        }
      } while( element = element.offsetParent );
      return offsetTop;
    }

    function showFootnoteOnclick() {
        $('.note_call').on('click', function () {
            clearInterval(timerSFN);
            timerSFN = 0;
            //console.log(this);
            var note_in_footer = $(this).attr('href')+"_footer";
            $('.footnotes').hide();
            $(note_in_footer).show();
            docScrollGlob = $(document).scrollTop();
            $(document).on('scroll', function () {
              if($(document).scrollTop() < docScrollGlob-100 || $(document).scrollTop() > docScrollGlob+100){
                $('.footnotes').hide();

              }

            });
            return false;
        });
    }

    function backToRef() {
        $('a.footnote-backref').on('click', function (e) {
            e.preventDefault();
            var navheight = $('.nav-bar').height();
            var fontsize = $('.article-content-text p').css('font-size');
            var position = $($(this).attr("href")).offset().top;
            var speed = 600;
            var finalpos = position - (wh / 2);
            $('body, html').animate({
                scrollTop: finalpos
            }, speed);
            return false;
        });
    }

    function mobileFootnote() {
        $('a.note_call, a.footnote-backref').click(function () {
            var navheight = $('.nav-bar').outerHeight();
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - navheight
                    }, 600);
                    return false;
                }
            }
        });
    }

    function pageCounter() {
        var _currentScroll;
        var $text = $('.article');
        var $console = $('.pagin');
        var h = $text.height();
        var pages = Math.round(h / wh);

        function counter() {
            var h = $text.height();
            var pages = Math.round(h / wh);
            var cs = $(document).scrollTop() + wh / 2;
            var currentpage = Math.round(cs / wh);
            $console.html('<p>' + currentpage + '/' + pages + '</p>');
        }
        timerPC = setInterval(counter, 100);
    }


    buildCaption();
    buildFootnote();
    lazyLoad();
    //load();
    showFootnoteOnclick();
    titleScrolled();
    $mainContent = $(".site");
    if (wv > 768) {
        endScrolled();
        showCaption();
        showFootnote();
        pageCounter();
        //escape();
        backToRef();
        //hackFirefoxWidthBug();
    } else {
        mobileFootnote();
        titleScrolledMobile();
    }
};
