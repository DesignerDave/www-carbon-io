
// jQuery plugin: isVisible
// Checks if an element is visible within the
// client viewport.
$.fn.isVisible = function(partial) {
  var $t            = $(this),
      $w            = $(window),
      viewTop       = $w.scrollTop(),
      viewBottom    = viewTop + $w.height(),
      // Offset top by 200px for more natural transitions
      _top          = $t.offset().top + 200,
      _bottom       = _top + $t.height(),
      compareTop    = partial === true ? _bottom : _top,
      compareBottom = partial === true ? _top : _bottom;

  return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
};

function throttle (fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;

  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;

    if (last && now < last + threshhold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);

    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}


// Particles
var SEPARATION = 130,
    AMOUNTX = 80,
    AMOUNTY = 70;

var container;
var camera, scene, renderer;

var particles, particle, count = 0;

var mouseX = 200,
    mouseY = -320;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


function init() {
  container = document.getElementById("particles");

  camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 500;

  scene = new THREE.Scene();

  particles = new Array();

  var PI2 = Math.PI * 2;
  var material = new THREE.ParticleCanvasMaterial({
    color: 0xF9FAFC,

    program: function(context) {
        context.beginPath();
        context.arc(0, 0, .6, 0, PI2, true);
        context.fill();
    }
  });

  var i = 0;

  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      particle = particles[i++] = new THREE.Particle(material);
      particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
      particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
      scene.add(particle);
    }
  }

  renderer = new THREE.CanvasRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
}


function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  positionParticles();
}


function animate() {
  requestAnimationFrame(animate);

  render();
}


function render() {
  camera.position.x += (mouseX - camera.position.x) * .05;
  camera.position.y += (-mouseY - camera.position.y) * .05;
  camera.lookAt(scene.position);

  // Uncomment to animate
  // positionParticles();

  // Stop looping once camera is positioned correctly
  if (!((mouseX - camera.position.x) < 2) && !((-mouseY - camera.position.y) < 2)) {
    renderer.render(scene, camera);
  
  }

  // If animation is within 100px of completion, show content
  if ((mouseX - camera.position.x) < 100 && (-mouseY - camera.position.y) < 100) {
    $("[js-header-group]").addClass("s-visible");

    setTimeout(function () {
      $("[js-header-cta]").addClass("s-visible");
      $("[js-navigation]").addClass("s-visible");
    }, 500);
  }
}

function positionParticles () {
  var i = 0;

  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      particle = particles[i++];
      particle.position.y = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50);
      particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 2) * 2;
    }
  }

  renderer.render(scene, camera);

  count += 0;
}


// Renders animated terminal windows
function Terminal (terminalEl, options) {
  options = options || {};
  this.options = options;
  this.state = {
    started: false,
    complete: false,
    $cursor: null
  };
  this.queue = [];

  if (terminalEl) {
    this.$el = $(terminalEl);

  } else {
    throw "Terminal class requires a node or jQuery object as the first parameter."
  }
}

Terminal.prototype = {
  start: function (callback) {
    if (!this.state.started) {
      this.$el.addClass("terminal");
      this.state.started = true;
      callback.call(this);

      if (!this.state.complete) {
        this.advanceQueue();
      }
    }
  },


  scrollToBottom: function () {
    this.$el.scrollTop(this.$el.parent().prop("scrollHeight"));
  },


  advanceQueue: function () {
    setTimeout(function () {
      if (this.queue.length) {
        this.$el.append($("<br />"));

        var currentItem = this.queue[0];
        if (currentItem[1]) {
          currentItem[0].apply(this, currentItem[1]);
        } else {
          currentItem[0].call(this);
        }
        this.queue.shift();
      } else {
        this.state.complete = true;

        if (this.options.onComplete) {
          this.options.onComplete.call(this);
        }
      }
    }.bind(this), 0);
  },


  command: function (options) {
    this.queue.push([this.renderCommand, [options]]);
  },


  renderCommand: function (options) {
    string = this.processCommandString(options.string);
    var $commandEl = $("<div class='terminal--command s-active s-blink'></div>");
    $commandEl.css({ "white-space": "normal" });

    this.$el.append($commandEl);
    this.scrollToBottom();

    setTimeout(function () {
      $commandEl.removeClass("s-blink");

      string.forEach(function (item, index) {
        var timeout = index * 70 + Math.random() * 50;

        setTimeout(function () {
          var currentText = $commandEl.text();

          $commandEl.append(item);
          this.scrollToBottom();

          if (index === string.length - 1) {
            $commandEl.removeClass("s-active");
            this.advanceQueue();
          }
        }.bind(this), timeout);
      }.bind(this));
    }.bind(this), 2000);
  },


  processCommandString: function (string) {
    if (!string) return [""];

    if (typeof string === "string") {
      string = string.split("");
    
    } else {
      string.forEach(function (val, i) {
        if (val.charAt(0) !== "<") string[i] = val.split("");
      });
    }

    return [].concat.apply([], string);;
  },


  feedback: function (options) {
    if (!options) {
      throw "Feedback requires an options object.";
    }
    this.queue.push([this.renderFeedback, [options]]);
  },


  renderFeedback: function (options) {
    var $feedbackEl = $("<div class='terminal--feedback s-active s-blink'></div>")

    this.$el.append($feedbackEl);
    this.scrollToBottom();

    var wait = options.waitBefore !== null ? options.waitBefore : 600;

    setTimeout(function () {
      $feedbackEl.removeClass("s-blink");
      $feedbackEl.removeClass("s-active");
      $feedbackEl.html(options.string || "");
      this.scrollToBottom();

      this.advanceQueue();
    }.bind(this), wait);
  },


  finish: function () {
    this.queue.push([this.renderFinish, []]);
  },


  renderFinish: function () {
    var $commandEl = $("<div class='terminal--command s-active s-blink'></div>");
    $commandEl.css({
      "white-space": "normal"
    });
    this.$el.append($commandEl);
    this.scrollToBottom();

    setTimeout(function () {
      this.advanceQueue();
    }.bind(this), 1000)
  }
}


function initTerminals () {
  if (!window.terminalsAreInitialized) {
    window.beautifulCodeTerminal =
      new Terminal($("[js-terminal='code']")[0], {
        onComplete: function () {
          if (window.featureCarousel.state.autonomousRotate) {
            setTimeout(function () {
              window.featureCarousel.next();
            }, 2000);
          }
        }
      }
    );

    window.beautifulTestsTerminal = 
      new Terminal($("[js-terminal='tests']")[0], {
        onComplete: function () {
          if (window.featureCarousel.state.autonomousRotate) {
            setTimeout(function () {
              window.featureCarousel.next();
            }, 2000);
          }
        }
      }
    );

    window.beautifulDocsTerminal =
      new Terminal($("[js-terminal='docs']")[0], {
        onComplete: function () {
          if (window.featureCarousel.state.autonomousRotate) {
            setTimeout(function () {
              window.featureCarousel.next();
            }, 2000);
          }
        }
      }
    );

    window.terminalsAreInitialized = true;
  }
}


// function setActiveFeature (feature) {
//   $features = $("[js-carousel-feature]");
//   $feature = $("[js-carousel-feature='" + feature + "']");

//   $features.not($feature).removeClass("s-active");
//   $feature.addClass("s-active");
// }

function initCarousel () {
  if (!window.carouselIsInitialized) {
    window.featureCarousel = new Carousel($("[js-feature-carousel]"), {
      autoRotate: false,
      afterTransition: [
        {
          $el: $("[js-carousel-group='code']"),
          callback: function (node) {
            window.beautifulCodeTerminal.start(function () {
              this.command({
                string: "ls"
              });
              this.feedback({
                string: "docs&nbsp;&nbsp;&nbsp;lib&nbsp;&nbsp;&nbsp;test&nbsp;&nbsp;&nbsp;package.json",
                waitBefore: 10
              });
              this.command({
                string: "node lib/ZipcodeService & "
              });
              this.feedback({
                string: "[2017-10-06T21:27:34] Service starting...",
                waitBefore: 500
              });
              this.feedback({
                string: "[2017-10-06T21:27:34] Service creating http server",
                waitBefore: 500
              });
              this.feedback({
                string: "[2017-10-06T21:27:34] Service listening on port 8888",
                waitBefore: 1500
              });
              this.command({
                string: [ "curl localhost:8888/zipcodes \\",
                          "<br />",
                          "-H \"Content-Type: application/json\" \\",
                          "<br />",
                          "-d '{\"_id\":\"94110\", \"state\":\"CA\"}'" ]
              });
              this.command({
                string: "curl localhost:8888/zipcodes/94110"
              });
              this.feedback({ string: "{\"_id\":\"94110\", \"state\":\"CA\"}" });
              this.finish();
            });
          }
        
        }, {
          $el: $("[js-carousel-group='tests']"),
          callback: function (node) {
            window.beautifulTestsTerminal.start(function () {
              this.command({
                string: "node test/ZipcodeServiceTest"
              });
              this.feedback({ string: "<strong>Running ZipcodeServiceTest...</strong>" });
              this.feedback({
                string: "&nbsp;[<span class='terminal--check'>*</span>] POST /zipcodes (130ms)",
                waitBefore: 260
              });
              this.feedback({
                string: "&nbsp;[<span class='terminal--check'>*</span>] POST /zipcodes (12ms)",
                waitBefore: 24
              });
              this.feedback({
                string: "&nbsp;[<span class='terminal--check'>*</span>] ZipcodeServiceTest (142ms)",
                waitBefore: 284
              });

              this.feedback({ string: "<br><strong>Test Report</strong>" });
              this.feedback({
                string: "[<span class='terminal--check'>*</span>] Test: ZipcodeServiceTest (142ms)",
                waitBefore: 0
              });
              this.feedback({
                string: "&nbsp;[<span class='terminal--check'>*</span>] Test: POST /zipcodes (130ms)",
                waitBefore: 0
              });
              this.feedback({
                string: "&nbsp;[<span class='terminal--check'>*</span>] Test: POST /zipcodes (12ms)",
                waitBefore: 0
              });
              this.finish();
            });
          }

        }, {
          $el: $("[js-carousel-group='docs']"),
          callback: function (node) {
            window.beautifulDocsTerminal.start(function () {
              this.command({
                string: "node lib/ZipcodeService gen-static-docs --flavor aglio --out docs/index.html"
              });
              this.feedback({ string: "<strong>carbon-io.carbond.Service:INFO:</strong> Service creating http server" });
              this.feedback({
                string: "<strong>carbon-io.carbond.Service:INFO:</strong> Writing API documentation to docs/index.html",
                waitBefore: 1000
              });

              this.finish();
            });
          }
        }
      ]
    });
    
    window.featureCarousel.start();

    $("[js-carousel-previous]").click(function () {
      window.featureCarousel.previous(true);
    });

    $("[js-carousel-next]").click(function () {
      window.featureCarousel.next(true);
    });

    window.carouselIsInitialized = true;
  }
}


function Carousel (carouselEl, options) {
  var options = options || {};

  if (carouselEl) {
    this.$el = $(carouselEl);
    this.$children = this.$el.children();
    this.options = {
      delay: options.delay || 5000,
      autoRotate: options.autoRotate,
      afterTransition: options.afterTransition || null
    };

    this.state = {
      currentIndex: 0,
      autonomousRotate: this.options.autoRotate || true,
      started: false
    }

  } else {
    throw "Carousel class requires a node or jQuery object as the first parameter."
  }
}

Carousel.prototype = {
  start: function () {
    if (!this.state.started) {
      this.renderPagination();
      this.toggleLinearControls(0);
      this.afterTransitionCallback($(this.$children[0]));

      if (this.options.autoRotate) {
        this.autoRotate();
      }

      this.state.started = true;
    }

    $(window).resize(function () {
      this.positionContent();
    }.bind(this))
  },


  renderPagination: function () {
    $pagination = $("<div class='carousel--pagination'></div>");
    this.$children.each(function (index, node) {
      var className = "carousel--pagination-indicator";
      if (index === 0) {
        className += " s-active";
      }
      $pagination.append("<div class='" + className + "' js-page-indicator='" + index + "'></div>")
    });

    this.$el.parent().append($pagination);

    $("[js-page-indicator]").click(function (e) {
      var nextIndex = parseInt($(e.target).attr("js-page-indicator"));
      this.transition(nextIndex);
      this.state.currentIndex = nextIndex;
    }.bind(this));
  },


  transition: function (nextIndex) {
    var childrenCount = this.$children.length;

    this.positionContent(nextIndex);

    this.$children.not(this.$children[nextIndex]).each(function (index, node) {
      $(node).addClass("s-inactive");
      $(node).removeClass("s-active");
    });

    var $nextActiveChild = $(this.$children[nextIndex]);
    $nextActiveChild.removeClass("s-inactive");
    $nextActiveChild.addClass("s-active");

    $("[js-page-indicator]").removeClass("s-active");
    $("[js-page-indicator='" + nextIndex + "']").addClass("s-active");

    this.toggleLinearControls(nextIndex);

    var $nextActiveChild = $(this.$children[nextIndex]);
    this.afterTransitionCallback($nextActiveChild);
  },


  positionContent: function (index) {
    if (index == null) {
      index = this.state.currentIndex;
    }
    this.$el.css({transform: "translate3d(" + index * -$(window).width() + "px, 0, 0)"});
  },


  toggleLinearControls: function (index) {
    var maxIndex = this.$children.length - 1;
    var previousCtrl = $("[js-carousel-previous]");
    var nextCtrl = $("[js-carousel-next]");

    if (index == maxIndex) {
      nextCtrl.addClass("s-disabled");
    } else {
      nextCtrl.removeClass("s-disabled");
    }

    if (index == 0) {
      previousCtrl.addClass("s-disabled");
    } else {
      previousCtrl.removeClass("s-disabled");
    }
  },


  afterTransitionCallback: function ($nextActiveChild) {
    $nextActiveChild = $($nextActiveChild);

    setTimeout(function () {
      if (this.options.afterTransition && this.options.afterTransition.length) {
        this.options.afterTransition.forEach(function (item, index) {
          if (item.$el[0] === $nextActiveChild[0]) {
            item.callback.call(this);
            this.options.afterTransition.splice(index, index);
          }
        }.bind(this));
      }
    }.bind(this), 500);
  },


  previous: function (stopRotate) {
    if (stopRotate) {
      this.state.autonomousRotate = false;
    }
    
    var nextIndex;

    if (this.state.currentIndex - 1 < 0) {
      nextIndex = this.$children.length - 1;
    } else {
      nextIndex = this.state.currentIndex - 1;
    }

    this.transition(nextIndex);

    var $nextActiveChild = $(this.$children[nextIndex]);
    this.afterTransitionCallback($nextActiveChild);

    this.state.currentIndex = nextIndex;
  },


  next: function (stopRotate) {
    if (stopRotate) {
      this.state.autonomousRotate = false;
    }

    var nextIndex;

    if (this.state.currentIndex + 1 === this.$children.length) {
      nextIndex = 0;
    } else {
      nextIndex = this.state.currentIndex + 1;
    }

    this.transition(nextIndex);

    this.state.currentIndex = nextIndex;
  },


  autoRotate: function () {
    if (this.state.autonomousRotate) {
      setTimeout(function () {
        this.next();
        this.autoRotate();

      }.bind(this), this.options.delay);
    }
  }
}

// var $t            = $(this),
//     $w            = $(window),
//     viewTop       = $w.scrollTop(),
//     viewBottom    = viewTop + $w.height(),
//     // Offset top by 200px for more natural transitions
//     _top          = $t.offset().top + 200,
//     _bottom       = _top + $t.height(),
//     compareTop    = partial === true ? _bottom : _top,
//     compareBottom = partial === true ? _top : _bottom;

var $carousel = $("[js-feature-carousel]");
var $examples = $("[js-example-section]");
var $scrollHeader = $("[js-scroll-header]");
var $scrollHeaderClone = $scrollHeader.clone().addClass("m-fixed");
var scrollHeaderVisible = false;

function scrollHandler () {
  if ($carousel.isVisible(true) && (!window.carouselIsInitialized || window.terminalsAreInitialized)) {
    initTerminals();
    initCarousel();
  }

  if (!isMobile()) {
    $examples.each(function (i, node) {
      var $el = $(node);

      if ($el.isVisible(true)) {
        $el.addClass("s-visible");
      }
    });

    // var scrollHeaderTop = $scrollHeader.offset().top;
    // var viewportTop = $(window).scrollTop();

    // if (viewportTop >= scrollHeaderTop && !scrollHeaderVisible) {
    //   $("body").append($scrollHeaderClone);
    //   setTimeout(function () {
    //     $scrollHeaderClone.addClass("s-visible");
    //   }, 10);
    //   scrollHeaderVisible = true;
    // } else if (viewportTop < scrollHeaderTop && scrollHeaderVisible) {
    //   $scrollHeaderClone.removeClass("s-visible");
    //   $scrollHeaderClone.remove();
    //   scrollHeaderVisible = false;
    // }
  }
}


function isMobile () {
  window.isMobileDevice = window.isMobileDevice || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return window.isMobileDevice;
}


$(document).ready(function () {
  init();
  positionParticles();
  animate();

  // Fire once on page load to ensure content in
  // viewport is visible
  scrollHandler();

  // Initialize fastclick on mobile
  // FastClick.attach(document.body);

  // if (!isMobile()) {
  //   $("body").on("click", "[js-page-link]", function (e) {
  //     e.preventDefault();

  //     var link = $(this).attr("href");
  //     var viewportTop = $(window).scrollTop();
  //     var elOffsetTop = $(link).offset().top;
      
  //     var animationTime;
  //     if (viewportTop > elOffsetTop) {
  //       animationTime = (viewportTop - elOffsetTop) / 3;
  //     } else if (viewportTop < elOffsetTop) {
  //       animationTime = (elOffsetTop - viewportTop) / 3;
  //     } else {
  //       animationTime = 0;
  //     }

  //     $("html, body").animate({
  //         scrollTop: elOffsetTop
  //     }, animationTime, "swing");
  //   });
  // }

  $("[js-code-toggle]").click(function () {
    var $this = $(this);
    
    if (!$this.hasClass("s-active")) {
      var $parent = $this.parent();
      var $selectedExample = $parent.siblings("[js-code-block='" + $this.attr("js-code-toggle") + "']");

      $(this).siblings("[js-code-toggle]").removeClass("s-active");
      $this.addClass("s-active");

      var $notSelectedExample = $parent.siblings("[js-code-block]").not($selectedExample);
      $notSelectedExample.removeClass("s-in");

      setTimeout(function () {
        $notSelectedExample.removeClass("s-visible");

        $selectedExample.addClass("s-visible");

        setTimeout(function () {
          $selectedExample.addClass("s-in");
        }, 25);
      }, 150);

    }
  });

  $("body").click(function () {
    var $mobileNav = $("[js-toggle-mobile-navigation]");
    if ($mobileNav.hasClass("s-active")) {
      $mobileNav.removeClass("s-active");
      $("[js-mobile-navigation]").removeClass("s-active");
    }
  });

  $("[js-toggle-mobile-navigation]").click(function (e) {
    e.stopPropagation();

    $(this).toggleClass("s-active");
    $("[js-mobile-navigation]").toggleClass("s-active");
  });

  $(window).scroll(scrollHandler);
});
