
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

  var $rendererParent = $('#particles')
  $rendererParent.css("opacity", 0.7)

  window.addEventListener('resize', onWindowResize, false);
}


function onWindowResize() {
  var innerWidth = window.innerWidth
  var innerHeight = window.innerHeight

  windowHalfX = innerWidth / 2;
  windowHalfY = innerHeight / 2;

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);

  positionParticles();
}

var frames = 0
function animate() {
  if (frames < 100) {
    requestAnimationFrame(animate);
    frames++

    render();
  }

}

var contentShown
function render() {
  var posX = 200 - camera.position.x
  var posY = 320 - camera.position.y

  camera.position.x += posX * .05;
  camera.position.y += posY * .05;
  camera.lookAt(scene.position);

  // Stop looping once camera is positioned correctly
  if (posX >= 2 && posY >= 2) {
    renderer.render(scene, camera);
  }

  // If animation is within 100px of completion, show content
  if (!contentShown && posX < 100 && posY < 100) {
    contentShown = true
    $("[js-header-group]").addClass("s-visible");

    setTimeout(function () {
      $("[js-header-cta], [js-navigation]").addClass("s-visible");
    }, 500);
  }
}

function positionParticles () {
  var i = 0;

  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      particle = particles[i++];

      var xSin = Math.sin((ix + count) * 0.3)
      var ySin = Math.sin((iy + count) * 0.5)

      particle.position.y = xSin * 50 + ySin * 50;
      particle.scale.x = particle.scale.y = (xSin + 1) * 2 + (ySin + 2) * 2;
    }
  }

  renderer.render(scene, camera);
}



// Renders animated terminal windows
function Terminal (terminalEl, options) {
  options = options || {};
  this.options = options;
  this.state = {
    started: false,
    complete: false
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
    this.$el.on('wheel', function (e) {
      if (this.$el.scrollTop() + this.$el.innerHeight() >= this.$el[0].scrollHeight) {
        this.state.userScrolled = false
      }
      else {
        this.state.userScrolled = true
      }
    }.bind(this))

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
    if (!this.state.userScrolled) {
      this.$el.scrollTop(this.$el.parent().prop("scrollHeight"));
    }
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
    this.typeQueue = [];
    var requiresModifier = "~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?".split("");
    var string = this.processCommandString(options.string);
    var $commandEl = $("<div class='terminal--command s-active s-blink'></div>");

    this.$el.append($commandEl);
    this.scrollToBottom();

    setTimeout(function () {
      string.forEach(function (item, index) {
        var isModified = requiresModifier.includes(item);
        var wait = (Math.random() + 1) * (isModified ? 100 : 40) + 20;

        this.typeQueue.push({
          character: item,
          wait: wait
        });
      }.bind(this));

      function renderCharacter (index) {
        var item = this.typeQueue[index];

        setTimeout(function () {
          var currentText = $commandEl.text();
          $commandEl.removeClass("s-blink");

          $commandEl.append(item.character);
          this.scrollToBottom();

          if (index === this.typeQueue.length - 1) {
            $commandEl.addClass("s-blink");
            setTimeout(function () {
              $commandEl.removeClass("s-active");
              this.advanceQueue();
            }.bind(this), 200);
          } else {
            renderCharacter.apply(this, [index + 1]);
          }
        }.bind(this), item.wait);
      }

      renderCharacter.apply(this, [0]);
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
  if (!window.terminalsInitialized) {
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

    window.terminalsInitialized = true;
  }
}


function beautifulCodeContent () {
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
  this.command({ string: "curl localhost:8888/zipcodes" });
  this.feedback({
    string: "[{\"_id\":\"10159\",\"state\":\"NY\"},{\"_id\":\"94110\",\"state\":\"CA\"}]",
    waitBefore: 400
  });
  this.command({ string: "curl localhost:8888/zipcodes/94110" });
  this.feedback({
    string: "{\"_id\":\"94110\", \"state\":\"CA\"}",
    waitBefore: 400
  });
  this.command({ string: "curl -X 'DELETE' localhost:8888/zipcodes/94110" });
  this.feedback({
    string: "{\"n\":1}",
    waitBefore: 400
  });
  this.command({ string: "curl localhost:8888/zipcodes" });
  this.feedback({
    string: "[{\"_id\":\"10159\",\"state\":\"NY\"}]",
    waitBefore: 400
  });
  this.finish();
}


function beautifulTestsContent () {
  this.command({
    string: "node test/ZipcodeServiceTest"
  });
  this.feedback({ string: "<strong>Running ZipcodeServiceTest...</strong>" });
  this.feedback({
    string: "&nbsp;[<span class='terminal--check'>*</span>] PUT /zipcodes/94114 (254ms)",
    waitBefore: 508
  });
  this.feedback({
    string: "&nbsp;[<span class='terminal--check'>*</span>] GET /zipcodes/94114 (14ms)",
    waitBefore: 28
  });
  this.feedback({
    string: "&nbsp;[<span class='terminal--check'>*</span>] ZipcodeServiceTest (268ms)",
    waitBefore: 0
  });

  this.feedback({ string: "<br><strong>Test Report</strong>" });
  this.feedback({
    string: "[<span class='terminal--check'>*</span>] Test: ZipcodeServiceTest (268ms)",
    waitBefore: 0
  });
  this.feedback({
    string: "&nbsp;[<span class='terminal--check'>*</span>] Test: PUT /zipcodes/94114 (254ms)",
    waitBefore: 0
  });
  this.feedback({
    string: "&nbsp;[<span class='terminal--check'>*</span>] Test: GET /zipcodes (14ms)",
    waitBefore: 0
  });
  this.finish();
}


function beautifulDocsContent () {
  this.command({
    string: "node lib/ZipcodeService gen-static-docs --flavor aglio --out docs/index.html"
  });
  this.feedback({ string: "<strong>carbon-io.carbond.Service:INFO:</strong> Service creating http server" });
  this.feedback({
    string: "<strong>carbon-io.carbond.Service:INFO:</strong> Writing API documentation to docs/index.html",
    waitBefore: 1000
  });

  this.finish();
}


var $carousel = $("[js-feature-carousel]");
var scrollHandler = throttle(function () {
  if (window.carouselInitialized && window.terminalsInitialized) {
    $(window).off('scroll', scrollHandler)
  }
  else {
    var visible = $carousel.isVisible(true)
    if (visible && !window.carouselInitialized) {
      initCarousel();
    }

    if (visible && !window.terminalsInitialized) {
      initTerminals();
    }
  }
}, 250)


function initCarousel () {
  window.featureCarousel = new Carousel($carousel, {
    autoRotate: false,
    afterTransition: [
      {
        $el: $("[js-carousel-group='code']"),
        callback: function () {
          window.beautifulCodeTerminal.start(beautifulCodeContent);
        }
      }, {
        $el: $("[js-carousel-group='tests']"),
        callback: function () {
          window.beautifulTestsTerminal.start(beautifulTestsContent);
        }
      }, {
        $el: $("[js-carousel-group='docs']"),
        callback: function () {
          window.beautifulDocsTerminal.start(beautifulDocsContent);
        }
      }
    ]
  });

  window.featureCarousel.start();
  window.carouselInitialized = true;
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
    this.$nextCtrl = $("[js-carousel-next]");
    this.$previousCtrl = $("[js-carousel-previous]");
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

    if (this.$previousCtrl) {
      this.$previousCtrl.click(this.previous.bind(this))
    }

    if (this.$nextCtrl) {
      this.$nextCtrl.click(this.next.bind(this))
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
      var selectedIndex = parseInt($(e.currentTarget).attr("js-page-indicator"));

      this.state.autonomousRotate = false;
      this.changeIndex(selectedIndex);
    }.bind(this));
  },


  transition: function (nextIndex, callback) {
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

    var $nextActiveChild = $(this.$children[nextIndex]);
    this.afterTransitionCallback($nextActiveChild);

    if (callback) {
      callback()
    }
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

    this.changeIndex(nextIndex);
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

    this.changeIndex(nextIndex);
  },


  autoRotate: function () {
    if (this.state.autonomousRotate) {
      setTimeout(function () {
        this.next();
        this.autoRotate();

      }.bind(this), this.options.delay);
    }
  },

  changeIndex: function (newIndex) {
    if (isNaN(newIndex)) {
      return;
    }

    if (this.state.changingIndex) {
      setTimeout(function () { this.changeIndex(newIndex) }.bind(this), 10);
    } else {
      this.state.changingIndex = true;
      this.transition(newIndex, function () {
        this.toggleLinearControls(newIndex);
        this.state.currentIndex = newIndex;
        this.state.changingIndex = false
      }.bind(this));
    }
  }
}

function isMobile () {
  window.isMobileDevice = window.isMobileDevice || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  var isSmall = width < 480;

  return window.isMobileDevice;
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
  this["highlightID"] = options.highlightID;
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

    this.boundOnHover = this.onHover.bind(this);
    this.boundOffHover = this.offHover.bind(this);
    this.$lineHighlight.hover(this.boundOnHover, this.boundOffHover);
    this.$highlightedCode.hover(this.boundOnHover, this.boundOffHover);
    this.$inlineHighlights.hover(this.boundOnHover, this.boundOffHover);


    this.boundToggleActive = this.toggleActive.bind(this);
    this.$lineHighlight.click(this.boundToggleActive);
    // this.$highlightedCode.click(this.boundToggleActive);
    // this.$inlineHighlights.click(this.boundToggleActive);

    this.boundDeactivate = this.deactivate.bind(this);
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
      this.$tooltip.append($("<a class='highlight-read-more' target='_blank' href='" + this.readMore + "'>Read More</a>"));
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
    title: "<code>__</code>: Fibers",
    body: "Fibers (<code>__</code>) add co-routine support to Node.js, which allows you to write asynchronous code in a logically synchronous way. In Carbon.io we wrap our Services in Fibers.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/fibers/docs/guide/index.html"
  }, {
    preID: "hello-world",
    highlightID: "hello-2",
    lines: "10",
    title: "<code>o</code>: Atom",
    body: "Atom (<code>o</code>) is a powerful tool for creating and configuring objects. Here, atom is defining an instance of the <code>Service</code> class (see <code>_type: carbon.carbond.Service</code>).",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/atom/docs/index.html"
  }, {
    preID: "hello-world",
    highlightID: "hello-3",
    lines: "11",
    title: "_type",
    body: "When constructing an object with Atom (<code>o</code>), you can define the class of the object with the <code>_type</code> property. The <code>_type</code> can be a class constructor or another object. The instantiated object will inherit methods, properties, and the prototype chain from this value.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/atom/docs/index.html"
  }, {
    preID: "endpoints-operations",
    highlightID: "endpoints-operations-1",
    lines: "7",
    title: "Service",
    body: "A Service defines an HTTP server that exposes a RESTful JSON API. Instances of Service define a tree of Endpoints which define the API’s URLs. The<code>Service</code> class comes with several built-in conveniences such as a command-line interface, authentication mechanisms, and documentation generation.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/services.html"
  }, {
    preID: "endpoints-operations",
    highlightID: "endpoints-operations-2",
    lines: "11",
    title: "Endpoint",
    body: "An Endpoint defines how to handle HTTP methods for a single path. Endpoints can formally define the expected request parameters and responses associated with each HTTP method.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/endpoints.html"
  }, {
    preID: "endpoints-operations",
    highlightID: "endpoints-operations-3",
    lines: "13",
    title: "get",
    body: "Endpoints have properties corresponding to the HTTP methods: <code>get</code>, <code>post</code>, <code>put</code>, <code>patch</code>, <code>delete</code>, <code>head</code>, and <code>options</code>. You can define request parameters (<code>parameters</code>), response objects (<code>responses</code>), and a handler (<code>service</code>) for each HTTP method.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/endpoints.html"
  }, {
    preID: "endpoints-operations",
    highlightID: "endpoints-operations-4",
    lines: "14",
    title: "parameters",
    body: "Each Operation can define the set of parameters it takes, JSON schemas for those parameters, whether parameters are required, as well as default values.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/operations.html#operation-responses"
  }, {
    preID: "endpoints-operations",
    highlightID: "endpoints-operations-5",
    lines: "22",
    title: "responses",
    body: "Operations can formally define their responses by HTTP status code and specify JSON schemas that are automatically enforced.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/operations.html#operation-responses"
  }, {
    preID: "endpoints-operations",
    highlightID: "endpoints-operations-6",
    lines: "37",
    title: "service (operation handler)",
    body: "The<code>service</code> method defines the handler for a particular HTTP verb. It takes in Express request and response objects and returns the response body.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/operations.html#operation-responses"
  }, {
    preID: "mongodb-collections",
    highlightID: "mongodb-collections-1",
    lines: "14",
    title: "enabled",
    body: "You may explicitly enable / disable Collection operations via the enabled property.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/collections.html?navScrollTop=236"
  }, {
    preID: "chaining-public",
    highlightID: "chaining-public-1",
    lines: "10",
    title: "<code>_o</code>: Bond",
    body: "Bond is a convenient universal name resolver component for Carbon.io. Bond allows for objects to be resolved from names in a variety of namespaces. Examples: <code>_o(“env:FOO”)</code>",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/bond/docs/index.html"
  }, {
    preID: "hello-service",
    highlightID: "hello-service-1",
    lines: "10",
    title: "authenticator",
    body: "You can define your own custom authenticator by creating an instance of the Authenticator class (or a subclass) with a customer authenticate method.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/aac/authentication.html?navScrollTop=89"
  }, {
    preID: "hello-endpoint",
    highlightID: "hello-service-2",
    lines: "7",
    title: "Access Control Lists",
    body: "ACLs allow granular access control to resources. An ACL maps users and groups to a set of permissions on a resource.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbond/docs/guide/aac/access-control.html?navScrollTop=89"
  }, {
    preID: "testing",
    highlightID: "testing-1",
    lines: "7",
    title: "HttpTest",
    body: "The HttpTest class allows you to easily test endpoints by issuing requests to a service and validating the responses to those requests.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/test-tube/docs/guide/index.html"
  }, {
    preID: "testing",
    highlightID: "testing-2",
    lines: "11",
    title: "tests",
    body: "The tests property allows you to implement a test suite. Simply override the tests property with an array of tests.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/test-tube/docs/guide/index.html"
  }, {
    preID: "testing",
    highlightID: "testing-3",
    lines: "13",
    title: "reqSpec",
    body: "The reqSpec property provides a shorthand for issuing requests to a service. Additionally, you can specify query parameters, headers, or a body.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/test-tube/docs/guide/index.html"
  }, {
    preID: "testing",
    highlightID: "testing-4",
    lines: "17",
    title: "resSpec",
    body: "The resSpec property provides a shorthand for validating responses to requests.",
    readMore: "https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/test-tube/docs/guide/index.html"
  }
];


function initCodeHighlights () {
  window.codeHighlightInstances = []
  codeHighlights.forEach(function (options) {
    var highlight = new Highlight(options);
    window.codeHighlightInstances.push(highlight);
  });
}


$(document).ready(function () {
  init();
  positionParticles();
  animate();

  // Fire once to init the carousel if it's visible
  scrollHandler()

  // Give client a second to breathe
  setTimeout(function () {
    initCodeHighlights();
  }, 100)

  $("body").click(function (e) {
    window.codeHighlightInstances.forEach(function (highlight) {
      highlight.boundDeactivate(e)
    })

    var $mobileNav = $("[js-toggle-mobile-navigation]");
    if ($mobileNav.hasClass("s-active")) {
      $mobileNav.removeClass("s-active");
      $("[js-mobile-navigation]").removeClass("s-active");
    }
  });

  $(window).on("keydown", function (e) {
    if (e.keyCode == 27 || e.key === "Escape") {
      window.codeHighlightInstances.forEach(function (highlight) {
        highlight.boundDeactivate(e)
      })
    }
  });

  $(window).on('scroll', scrollHandler)

  $("body").on('click', "[js-inline-highlights], [js-highlighted-code]", function (e) {
    var $node = $(e.currentTarget);

    var inlineAttr = $node.attr("js-inline-highlights")
    var highlightAttr = $node.attr("js-highlighted-code")

    var highlightId = inlineAttr || highlightAttr

    window.codeHighlightInstances.forEach(function (highlight) {
      if (highlight.highlightID === highlightId) {
        highlight.boundToggleActive(e)
      }
    })
  })

  $("[js-code-toggle]").click(function () {
    var $this = $(this);

    if (!$this.hasClass("s-active")) {
      var $parent = $this.parent();
      var $selectedExample = $parent.siblings("[js-code-block='" + $this.attr("js-code-toggle") + "']");

      $(this).siblings("[js-code-toggle]").removeClass("s-active");
      $this.addClass("s-active");

      $parent.siblings("[js-code-block]").not($selectedExample).removeClass("s-visible");

      $selectedExample.addClass("s-visible");
    }
  });

  $("[js-toggle-mobile-navigation]").click(function (e) {
    e.stopPropagation();

    $(this).toggleClass("s-active");
    $("[js-mobile-navigation]").toggleClass("s-active");
  });
});
