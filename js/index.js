
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


function init () {
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


var $carousel = $("[js-feature-carousel]");
var $examples = $("[js-example-section]");
var $scrollHeader = $("[js-scroll-header]");
var $scrollHeaderClone = $scrollHeader.clone().addClass("m-fixed");
var scrollHeaderVisible = false;

function scrollHandler () {
  if (!isMobile() && $carousel.isVisible(true) && (!window.carouselIsInitialized || window.terminalsAreInitialized)) {
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
  }
}


function isMobile () {
  window.isMobileDevice = window.isMobileDevice || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  var isSmall = width < 480;

  return window.isMobileDevice || isSmall;
}


function Highlight (options) {
  if (!options.preID ||
      !options.highlightID ||
      !options.lines ||
      !options.title ||
      !options.body) {
    
    console.error("Highlight requires 'preID', 'lines', 'title', and 'body' as options.");
  }

  this["$preWrapper"] = $("pre[js-highlight-id='" + options.preID + "']");
  this["$inlineHighlights"] = options.highlightID ? $("[js-inline-highlight='" + options.highlightID + "']") : null;
  this["$highlightedCode"] = $("[js-highlighted-code='" + options.highlightID + "']");
  this["lines"] = options.lines;
  this["title"] = options.title;
  this["body"] = options.body;
  this["readMore"] = options.readMore || null;
  this["active"] = false;

  this.init();
}

Highlight.prototype = {
  init: function () {
    this.renderHighlight();

    function toggleActive () {
      this.$lineHighlight.toggleClass("s-active");
      this.$inlineHighlights.toggleClass("s-active");
      this.$highlightedCode.toggleClass("s-active");
      this.$tooltip.toggleClass("s-active");
    }

    var boundOnHover = this.onHover.bind(this);
    var boundOffHover = this.offHover.bind(this);
    this.$lineHighlight.hover(boundOnHover, boundOffHover);
    this.$highlightedCode.hover(boundOnHover, boundOffHover);
    this.$inlineHighlights.hover(boundOnHover, boundOffHover);

    
    var boundToggleActive = this.toggleActive.bind(this);
    this.$lineHighlight.click(boundToggleActive);
    this.$highlightedCode.click(boundToggleActive);
    this.$inlineHighlights.click(boundToggleActive);

    var boundDeactivate = this.deactivate.bind(this);
    $("body").click(boundDeactivate);
    $(window).on("keydown", function (e) {
      if (e.keyCode == 27 || e.key === "Escape") {
        this.deactivate(e);
      }
    }.bind(this));
  },


  onHover: function () {
    this.$lineHighlight.addClass("s-hover");
    this.$inlineHighlights.addClass("s-hover");
    this.$highlightedCode.addClass("s-hover");
  },


  offHover: function () {
    this.$lineHighlight.removeClass("s-hover");
    this.$inlineHighlights.removeClass("s-hover");
    this.$highlightedCode.removeClass("s-hover");
  },


  toggleActive: function (e) {
    if (!this.active) {
      this.activate();
    } else {
      this.deactivate(e);
    }
  },


  activate: function () {
    this.$lineHighlight.addClass("s-active");
    this.$inlineHighlights.addClass("s-active");
    this.$highlightedCode.addClass("s-active");
    this.$tooltip.addClass("s-active");

    setTimeout(function () {
      this.active = true;
    }.bind(this), 20)
  },


  deactivate: function (e) {
    if (!$.contains(this.$tooltip[0], e.target) && this.$tooltip[0] !== e.target && this.active) {
      this.$lineHighlight.removeClass("s-active");
      this.$inlineHighlights.removeClass("s-active");
      this.$highlightedCode.removeClass("s-active");
      this.$tooltip.removeClass("s-active");

      setTimeout(function () {
        this.active = false;
      }.bind(this), 20)
    }
  },


  renderHighlight: function () {
    var ranges = this.lines.replace(/\s+/g, '').split(',');
    var offset = this.$preWrapper.attr('data-line-offset') || 0;

    var parseMethod = this.isLineHeightRounded() ? parseInt : parseFloat;
    var lineHeight = parseMethod(this.$preWrapper.css("line-height"));

    for (var i = 0, range; range = ranges[i++];) {
      range = range.split('-');

      var start = +range[0],
          end = +range[1] || start;

      var $line = $("<div aria-hidden='true' class='line-highlight'></div>");

      $line.text(Array(end - start + 2).join(' \n'));

      //if the line-numbers plugin is enabled, then there is no reason for this plugin to display the line numbers
      if (!this.$preWrapper.hasClass('line-numbers')) {
        $line.attr('data-start', start);

        if (end > start) {
          $line.attr('data-end', end);
        }
      }

      $line.css("top", (start - offset - 1) * lineHeight + 'px');

      $line.append(this.createHighlightArrow());
      $line.append(this.createTooltip());

      this.$lineHighlight = $line;

      this.$preWrapper.append(this.$lineHighlight);
    }
  },


  isLineHeightRounded: function () {
    var res;

    if (typeof res === 'undefined') {
      var $d = $("<div>&nbsp;<br />&nbsp;</div>");

      $d.css({
        "font-size": "13px",
        "line-height": "1.5",
        "padding": 0,
        "border": 0
      });
      $("body").append($d);

      // Browsers that round the line-height should have offsetHeight === 38
      // The others should have 39.
      res = $d[0].offsetHeight === 38;
      $d.remove();
    }

    return res;
  },


  createTooltip: function () {
    this.$tooltip = $("<div class='highlight-tooltip'><label>" + this.title + "</label><p>" + this.body + "</p></label>");
    if (this.readMore) {
      this.$tooltip.append($("<a class='highlight-read-more' href='" + this.readMore + "'>Read More</a>"));
    }

    return this.$tooltip;
  },


  createHighlightArrow: function () {
    function makeSVG (tag, attrs) {
      var el= document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (var k in attrs)
          el.setAttribute(k, attrs[k]);

      return el;
    }

    var $svg = $("<svg class='highlight-arrow-wrapper' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'\
                viewBox='0 0 21 13.9' style='enable-background:new 0 0 21 13.9;' xml:space='preserve'></svg>");
    var path = makeSVG("path", {
      class: "highlight-arrow",
      d: "M20.2,5.2L20.2,5.2c-0.6-0.8-3.4-3.6-3.4-3.6c-1-1-2.3-1.6-3.8-1.6C9.2,0,3.9,0,3,0.1l0,0\
          C1.4,0.1,0.1,1.4,0.1,3l0,0C0,4.3,0,5.6,0,7c0,1.3,0,2.7,0.1,4l0,0c0,1.6,1.3,2.8,2.8,2.8l0,0c1,0.1,6.2,0.1,10.1,0.1\
          c1.4,0,2.8-0.6,3.8-1.6c0,0,3.2-3.3,3.4-3.6l0,0C21.2,7.8,21.2,6.2,20.2,5.2z"
    });

    $svg.append(path);

    return $svg;
  }
}


var codeHighlights = [
  {
    preID: "hello-world",
    highlightID: "hello-1",
    lines: "5",
    title: "Fibers",
    body: "Fibers allow you to write code that is logically synchronous.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/fibers/docs/guide/index.html"
  }, {
    preID: "hello-world",
    highlightID: "hello-2",
    lines: "10",
    title: "Atom",
    body: "Atom is the universal object factory, used to instantiate objects and create components."
  }, {
    preID: "chaining-public",
    highlightID: "chaining-public-1",
    lines: "10",
    title: "Bond",
    body: "Bond is the name resolver component that allows for objects to be resolved from names in a variety of \
          namespaces. Here we resolve the URL of the private microservice (PrivateHelloService)."
  }, {
    preID: "hello-service",
    highlightID: "hello-service-1",
    lines: "19",
    title: "Bond",
    body: "Bond is the name resolver component that allows for objects to be resolved from names in a variety of \
          namespaces. Here we resolve the filename that contains the Endpoint for our Service."
  } 
];


function initCodeHighlights () {
  codeHighlights.forEach(function (options) {
    var highlight = new Highlight(options);
  });
}


$(document).ready(function () {
  init();
  positionParticles();
  animate();

  initCodeHighlights();

  // Fire once on page load to ensure content in
  // viewport is visible
  scrollHandler();

  // Initialize fastclick on mobile
  // FastClick.attach(document.body);

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
