var searchVisible = 0;
var transparent = true;

var transparentDemo = true;
var fixedTop = false;

var navbar_initialized = false;

var big_image;
var scroll;
var project_content;
var $project;
scroll = (2500 - $(window).width()) / $(window).width();

var $ScrollTop;
var $ScrollBot;

var pixels;

var modal;
var $project_content;

var test = true;

var timerStart = Date.now();
var delay;

var no_of_elements = 0;
var window_height;
var window_width;

var content_opacity = 0;
var content_transition = 0;
var no_touch_screen = false;

var burger_menu;

// Projects
// Array of projects
const projects = [
  { src: "assets/img/SimpleConnect.png", title: "Smart Home App", target: "project_1" },
  { src: "assets/img/UtilityManagerComputerScreen.png", title: "Utility Manager", target: "project_2" },
  { src: "assets/img/NikePage.png", title: "Nike Mobile & Web", target: "project_3" },
  { src: "assets/img/TheGOAT.png", title: "The GOAT Mobile", target: "project_4" },
  { src: "assets/img/EducationDesktopTabletPhone.png", title: "LMS Web & Mobile", target: "project_5" },
  { src: "assets/img/SAIGroupImage.png", title: "SAI Group Design", target: "project_6" },
  { src: "assets/img/FDQBusinessAdvocates.png", title: "FDQ Business Advocates", target: "project_7" },
  { src: "assets/img/EogentLoginPage.png", title: "Eogent Properties", target: "project_8" },
  { src: "assets/img/SuperHStoryBoard.jpg", title: "Storyboarding", target: "project_9" },
  { src: "assets/img/HandSoftware.png", title: "Hand Software", target: "project_10" },
  { src: "assets/img/Clubman_UI.png", title: "Clubman by Calloway", target: "project_11" },
  { src: "assets/img/SchoolHouse.jpg", title: "School House Game Model", target: "project_12" },
  { src: "assets/img/Spaceship.png", title: "Spaceship 3D Model", target: "project_13" },
  { src: "assets/img/RobinHood.png", title: "Robin Hood", target: "project_14" },
  { src: "assets/img/ToddsHead.png", title: "My Head", target: "project_15" },
  { src: "assets/img/Tunnel.png", title: "Train Tunnel", target: "project_16" },
  { src: "assets/img/Linux.jpg", title: "Linux Workstation", target: "project_17" },
  { src: "assets/img/Windows.jpg", title: "Windows Workstation", target: "project_18" },
  { src: "assets/img/HeadRenders1920.png", title: "Heads", target: "project_19" },
  { src: "assets/img/House03c.jpg", title: "House 3D Model", target: "project_20" },
  { src: "assets/img/3dblock.png", title: "3D Block Environment Model", target: "project_21" }
];

// Projects function
$(document).ready(function() {
  let projectHtml = '';
  
  projects.forEach((project, index) => {
    projectHtml += `
      <div class="col-lg-4 col-md-6 col-sm-6">
        <div class="project add-animation animation-${(index % 3) + 1}">
          <img src="${project.src}" style="width: 100%; object-fit: cover; height: 400px;" />
          <a class="over-area color-1" href="javascript:void(0)" onClick="rubik.showModal(this)" data-target="${project.target}">
            <div class="content">
              <h4>${project.title}</h4>
              <p>Click for more... </p>
            </div>
          </a>
        </div>
      </div>
    `;
  });
  
  $('.projects-array').html(projectHtml);
});
// / Projects

// Process images scaling
function setConditionalHeight() {
    // Get all elements with the class 'section-first'
    var sections = document.querySelectorAll('.section-first');

    // Set height conditionally based on screen width
    sections.forEach(function (section) {
        if (window.innerWidth < 768) {
            section.style.height = '40vh';  // For mobile
        } else if (window.innerWidth >= 768 && window.innerWidth < 1200) {
            section.style.height = '60vh';  // For tablet/small desktop
        } else {
            section.style.height = '80vh';  // For large desktop
        }
    });
}

// Run the function when the page loads
setConditionalHeight();

// Run the function whenever the window is resized
window.onresize = setConditionalHeight;
// / Process images scaling

$(document).ready(function () {
    BrowserDetect.init();

    if (BrowserDetect.browser == 'Explorer' && BrowserDetect.version <= 9) {
        $('body').html(better_browser);
    }

    window_width = $(window).width();
    window_height = $(window).height();

    burger_menu = $('nav[role="navigation"]').hasClass('navbar-burger') ? true : false;

    if (!Modernizr.touch) {
        $('body').addClass('no-touch');
        no_touch_screen = true;
    }

    rubik.initAnimationsCheck();

    // Init navigation toggle for small screens   
    if (window_width < 992 || burger_menu) {
        rubik.initRightMenu();
    }

    if (window_width < 992) {
        $('.over-area').each(function () {
            var click = $(this).attr("onClick");
            if (click == '') {
                src = "rubik.showModal(this)";
                $(this).attr("onClick", src);
            }
        });

        rubik.checkResponsiveImage();
    }

    setTimeout(function () {
        $('.loading').css('opacity', '0');
        setTimeout(function () {
            $('.loading').addClass('hide');
        }, 500);
    }, 3000);


    if ($('#contactUsMap').length != 0) {
        rubik.initGoogleMaps();
    }

    if ($('.content-with-opacity').length != 0) {
        content_opacity = 1;
    }

});


$(window).load(function () {

    //after the content is loaded we reinitialize all the waypoints for the animations
    rubik.initAnimationsCheck();

});

//activate collapse right menu when the windows is resized 
$(window).resize(function () {
    if ($(window).width() < 992) {
        rubik.initRightMenu();
        rubik.checkResponsiveImage();
    }
    if ($(window).width() > 992 && !burger_menu) {
        $('nav[role="navigation"]').removeClass('navbar-burger');
        rubik.misc.navbar_menu_visible = 1;
        navbar_initialized = false;
    }
});

$(window).on('scroll', function () {
    rubik.checkScrollForTransparentNavbar();

    if (window_width > 992) {
        rubik.checkScrollForParallax();
    }

    if (content_opacity == 1) {
        rubik.checkScrollForContentTransitions();
    }
});

$(document).on('click', 'a[data-scroll="true"]', function (e) {
    var scroll_target = $(this).data('id');
    var scroll_trigger = $(this).data('scroll');

    if (scroll_trigger === true && scroll_target !== undefined) {
        e.preventDefault();

        // Smooth scroll to the target section
        $('html, body').animate({
            scrollTop: $(scroll_target).offset().top - 50
        }, 1000, function() {
            console.log('Scroll animation complete'); // Debug log

            // Collapse the navbar if the toggle button is visible (i.e., on mobile)
            if ($('.navbar-toggle').is(':visible')) {
                console.log('Navbar toggle is visible, collapsing the navbar...'); // Debug log

                $('.navbar-collapse').collapse('hide');  // Collapse the navbar
                $('html').removeClass('nav-open');       // Remove 'nav-open' from <html>
                $('.navbar-toggle').removeClass('toggled'); // Remove the toggled state from the navbar button

                console.log('Navbar collapse attempted, nav-open class removed'); // Debug log
            } else {
                console.log('Navbar toggle not visible, no need to collapse'); // Debug log
            }
        });
    }
});

$('.section-we-made-2 .scroller').mousemove(
    function (event) {
        if (!Modernizr.touch) {
            if (event.clientX < 200) {
                $(this).css("transform", "translateX(0)");
            }
            if (event.clientX > 200 && event.clientX < $(window).width() - 200 && event.clientX % 2 == 0) {
                pixels = -event.clientX * scroll;

                $(this).css("transform", "translateX(" + pixels + "px)");
            }
            if (event.clientX > $(window).width() - 200) {
                pixels = -(2500 - $(window).width());
                $(this).css("transform", "translateX(" + pixels + "px)");
            }
            $('.projects').css('overflow', 'hidden');
        }
    }
);



rubik = {
    misc: {
        navbar_menu_visible: 0
    },
    initAnimationsCheck: function () {
        $('[class*="add-animation"]').each(function () {
            offset_diff = 30;
            if ($(this).hasClass('title')) {
                offset_diff = 110;
            }

            var waypoints = $(this).waypoint(function (direction) {
                if (direction == 'down') {
                    $(this.element).addClass('animate');
                } else {
                    $(this.element).removeClass('animate');
                }
            }, {
                offset: window_height - offset_diff
            });
        });

    },
    initRightMenu: function () {
        if (!navbar_initialized) {
            $nav = $('nav[role="navigation"]');
            $nav.addClass('navbar-burger');

            $navbar = $nav.find('.navbar-collapse').first().clone(true);

            ul_content = '';

            $navbar.children('ul').each(function () {
                content_buff = $(this).html();
                ul_content = ul_content + content_buff;
            });

            ul_content = '<ul class="nav navbar-nav">' + ul_content + '</ul>';
            $navbar.html(ul_content);

            $('body').append($navbar);

            background_image = $navbar.data('nav-image');
            if (background_image != undefined) {
                $navbar.css('background', "url('" + background_image + "')")
                    .removeAttr('data-nav-image')
                    .css('background-size', "cover")
                    .addClass('has-image');
            }

            $toggle = $('.navbar-toggle');

            $navbar.find('a').removeClass('btn btn-round btn-default');
            $navbar.find('button').removeClass('btn-round btn-fill btn-info btn-primary btn-success btn-danger btn-warning btn-neutral');
            $navbar.find('button').addClass('btn-simple btn-block');

            $link = $navbar.find('a');

            $link.click(function (e) {
                var scroll_target = $(this).data('id');
                var scroll_trigger = $(this).data('scroll');

                if (scroll_trigger == true && scroll_target !== undefined) {
                    e.preventDefault();

                    $('html, body').animate({
                        scrollTop: $(scroll_target).offset().top - 50
                    }, 1000);
                }

            });


            $toggle.click(function () {

                if (rubik.misc.navbar_menu_visible == 1) {
                    $('html').removeClass('nav-open');
                    rubik.misc.navbar_menu_visible = 0;
                    $('#bodyClick').remove();
                    setTimeout(function () {
                        $toggle.removeClass('toggled');
                    }, 550);

                } else {
                    setTimeout(function () {
                        $toggle.addClass('toggled');
                    }, 580);

                    div = '<div id="bodyClick"></div>';
                    $(div).appendTo("body").click(function () {
                        $('html').removeClass('nav-open');
                        rubik.misc.navbar_menu_visible = 0;
                        $('#bodyClick').remove();
                        setTimeout(function () {
                            $toggle.removeClass('toggled');
                        }, 550);
                    });

                    $('html').addClass('nav-open');
                    rubik.misc.navbar_menu_visible = 1;

                }
            });
            navbar_initialized = true;
        }

    },

    checkResponsiveImage: function () {
        responsive_background = $('.section-header > div .responsive-background');

        if (responsive_background.length == 0) {
            $('.section-header > div > img, .section-header video').each(function () {
                var $image = $(this);
                var src = $image.attr("src");

                if ($image.attr("responsive-src")) {
                    src = $image.attr("responsive-src");
                }

                div = '<div class="responsive-background" style="background-image:url(' + src + ')"/>';
                $image.after(div);
                $image.addClass('hidden-xs hidden-sm');
            });
        }
    },

    checkScrollForTransparentNavbar: debounce(function () {
        if ($(document).scrollTop() > 560) {
            if (transparent) {
                transparent = false;
                $('nav[role="navigation"]').removeClass('navbar-transparent');
            }
        } else {
            if (!transparent) {
                transparent = true;
                $('nav[role="navigation"]').addClass('navbar-transparent');
            }
        }
    }, 17),

    checkScrollForParallax: debounce(function () {
        no_of_elements = 0;
        $('.parallax').each(function () {
            var $elem = $(this);

            if (isElementInViewport($elem)) {
                var parent_top = $elem.offset().top;
                var window_bottom = $(window).scrollTop();
                var $image = $elem.children('img');

                oVal = ((window_bottom - parent_top) / 3);
                $image.css('transform', 'translate3d(0px, ' + oVal + 'px, 0px)');
            }
        });

    }, 6),

    checkScrollForContentTransitions: debounce(function () {
        $('.content-with-opacity').each(function () {
            var $content = $(this);

            if (isElementInViewport($content)) {
                var window_top = $(window).scrollTop();
                opacityVal = 1 - (window_top / 230);

                if (opacityVal < 0) {
                    opacityVal = 0;
                    return;
                } else {
                    $content.css('opacity', opacityVal);
                }

            }
        });
    }, 6),

    showModal: function (button) {
        var id = $(button).data('target');
        var $project = $(button).closest('.project');

        var scrollTop = $(window).scrollTop();
        var distanceTop = $project.offset().top;

        var projectTop = distanceTop - scrollTop;
        var projectLeft = $project.offset().left;
        var projectHeight = $project.innerHeight();
        var projectWidth = $project.innerWidth();

        modal = $('#' + id);

        $(modal).css({
            'top': projectTop,
            'left': projectLeft,
            'width': projectWidth,
            'height': projectHeight,
            'z-index': '1032'
        });

        $(modal).addClass('has-background');

        setTimeout(function () {
            $(modal).addClass('open');
        }, 30);

        setTimeout(function () {
            $('body').addClass('noscroll');
            $(modal).addClass('scroll');
        }, 1000);

        $('.icon-close').click(function () {
            $project_content = $(this).closest('.project-content');
            $project_content.removeClass('open scroll');

            $('body').removeClass("noscroll");
            //$('a').removeClass('no-opacity');
            setTimeout(function () {
                $project_content.removeClass('has-background');
                setTimeout(function () {
                    $project_content.removeAttr('style');
                }, 450);
            }, 500);
        });
    },
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
};


function isElementInViewport(elem) {
    var $elem = $(elem);

    // Get the scroll position of the page.
    var scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html');
    var viewportTop = $(scrollElem).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    // Get the position of the element on the page.
    var elemTop = Math.round($elem.offset().top);
    var elemBottom = elemTop + $elem.height();

    return ((elemTop < viewportBottom) && (elemBottom > viewportTop));
}


var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) !== -1) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }

        var rv = dataString.indexOf("rv:");
        if (this.versionSearchString === "Trident" && rv !== -1) {
            return parseFloat(dataString.substring(rv + 3));
        } else {
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }
    },

    dataBrowser: [
        { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
        { string: navigator.userAgent, subString: "MSIE", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Trident", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
        { string: navigator.userAgent, subString: "Safari", identity: "Safari" },
        { string: navigator.userAgent, subString: "Opera", identity: "Opera" }
    ]

};

var better_browser = '<div class="container"><div class="better-browser row"><div class="col-md-2"></div><div class="col-md-8"><h3>We are sorry but it looks like your Browser doesn\'t support our website Features. In order to get the full experience please download a new version of your favourite browser.</h3></div><div class="col-md-2"></div><br><div class="col-md-4"><a href="https://www.mozilla.org/ro/firefox/new/" class="btn btn-warning">Mozilla</a><br></div><div class="col-md-4"><a href="https://www.google.com/chrome/browser/desktop/index.html" class="btn ">Chrome</a><br></div><div class="col-md-4"><a href="http://windows.microsoft.com/en-us/internet-explorer/ie-11-worldwide-languages" class="btn">Internet Explorer</a><br></div><br><br><h4>Thank you!</h4></div></div>';
