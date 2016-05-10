/**
* this is initialized client side
* and is used to control the App functions
* and hold globals values
* @namespace App
*/
var App = (function (ns) {
  
  ns.globals = {
    source: {
      data: null,
      categories: null,
      q: {}
    },
    bigQuery: {
      projectId: 'lateral-command-416',
      dataStore: 'jeopardydata',
      table: 'questions'
    },
    questions: {
      maxCategories: 150,
      numQuestions: 4,
      category: "ARTISTS",
      asking: false,
      score: 0,
      defaultValue:1000
    },
    player: {
      data: null,
      photoSize: 50
    },
    game: {
      id: 'jeopardy',
      turnDuration: 20000,
      anDuration: 0,
      victoryLap: 200
    },
    promises: {},
    colors: { // blue//amber
      primary: '#2196F3',
      accent: '#FFC107',
      darkPrimary:'#1976D2',
      lightPrimary:'#BBDEFB',
      primaryText: '#212121',
      correct: '#4CAF50',
      wrong: '#FF5252',
      secondaryText:'#727272',
      divider:'#B6B6B6'
    },
    arcs: {}
  };
  
  var ag = ns.globals;
  
  // chart stuff
  ag.charts = {
    chartOptions:{
      duration:1000,
      values: {
        classes: "mu--text-caption mui--text-center",
        styles: "font-size:.7em;text-anchor:middle;"
      }
    },
    getColor: function (x) {
      var c = [ag.colors.darkPrimary,ag.colors.accent,ag.colors.primary,ag.colors.divider];
      return c[x % c.length];
    },
    getChartData: function getChartData(data) {

      var sum = d3.sum(data);
      var angle = 0;
      return data.map(function(d, i) {
        var x = { 
          dataName: 'name' + i,
          start: { 
            angle: angle,
            fill: ag.charts.getColor(i),
            value: 0
          },
          finish: {
            angle: angle + d / sum,
            fill: ag.charts.getColor(i),
            innerRatio: .5,
             value: d
          },
          values: {
            show: !i
          }
        };
        angle += d / sum;
        return x;
     });
        
    }
  };
  
  // the timer stuff
  ag.arcDash = {
    value: {
      data: [{
        dataName: 'shadow',
        immediate: {
          angle: true
        },
        start:{
          angle:1,
          fill:'#DCEDC8'
        },
        finish:{
          angle:0,
          fill:'#F8BBD0',
          innerRatio:.65
        }
      }, {
        dataName: 'main',
        start: {
          fill: ag.colors.correct
        },
        finish: {
          fill: ag.colors.wrong,
          innerRatio: .65
        },
        values: {
          show: true
        }
      }]
    },
    options: {
      duration: ag.game.turnDuration,
      values: {
        classes: "mui--text-light-secondary mui--text-caption"
      }
    },
    summary: {
      data: [{
        dataName: 'shadow',
        immediate: {
          angle: true
        },
        start:{
          fill:'#FFECB3'
        },
        finish:{
          fill:'#FFECB3'
        }
      }, {
        dataName: 'main',
        values: {
          show: true
        },
        start:{
          value:1000
        },
        finish:{
          value:10000
        }
      }],
      options: {
        duration: ag.game.anDuration,
        values: {
          classes: "mui--text-light-secondary mui--text-caption"
        }
      }
      
    },
    lap: {
      data: [{
        dataName: 'shadow',
        immediate: {
          angle: false
        },
        start:{
          angle:1,
          fill:'#DCEDC8'
        },
        finish:{
          angle:0,
          fill:'#F8BBD0',
          innerRatio:.6
        }
      }, {
        dataName: 'main',
        values: {
          show: true
        },
        start: {
          fill: ag.colors.correct
        },
        finish: {
          fill: ag.colors.wrong,
          innerRatio:.6
        }
      }],
      options: {
        duration: ag.game.victoryLap,
        values: {
          classes: "mui--text-light-secondary mui--text-caption"
        }
      }
      
    }
    
  };
  
  // for use on client side.
  ns.init = function () {
    
    var ag = ns.globals;
    
    ag.divs = {
      categories:document.getElementById('categories'),
      numQuestions:document.getElementById('numquestions'),
      go:document.getElementById('go'),
      message:document.getElementById('message'),
      report:document.getElementById('report'),
      control:document.getElementById('control'),
      render:document.getElementById('render'),
      reset:document.getElementById('reset'),
      next:document.getElementById('next'),
      pause:document.getElementById('pause'),
      resume:document.getElementById('resume'),
      playerPhoto:document.getElementById('playerphoto'),
      welcome:document.getElementById('welcome'),
      questionValue:document.getElementById('questionvalue'),
      totalScore:document.getElementById('totalscore'),
      catScore:document.getElementById('catscore'),
      selectSpinner:document.getElementById('selectspinner'),
      selectSelect:document.getElementById('selectselect'),
      startSpinner:document.getElementById('startspinner'),
      viz:document.getElementById('viz'),
      goViz:document.getElementById('goviz'),
      resetViz:document.getElementById('resetviz'),
      valueArc:document.getElementById('valuearc'),
      categoryArc:document.getElementById('categoryarc'),
      gameArc:document.getElementById('gamearc'),
      lapArc:document.getElementById('valuearc'),
      vizible:document.getElementById('vizible')
    };

    
    // set up the timers
    [{name:"value",dash:"value"},{name:"category",dash:"summary"}, {name:"game",dash:"summary"}].forEach(function(d) {
      ag.arcs[d.name] = new DashTimer(ag.divs[d.name+'Arc'])
      .init(ag.arcDash[d.dash].options)
      .setData(ag.arcDash[d.dash].data);
    });
    
    ns.listeners();
  };
  
  ns.clearMessage = function () {
    var div = ns.globals.divs.message;
    div.innerHTML = '';
    Render.hide(div,true);
  };
  
  
  /**
  * report a message
  * @param {string} message the message
  * @param {boolean} [append=false] whether to append
  */
  ns.reportMessage = function (message,append) {
    var div = ns.globals.divs.message;
    div.innerHTML = (append ?  div.innerHTML : '' ) +message;
    Render.hide(div,false);
  };
  
  /**
  * just a shortener to add these events
  * if the element exists
  */
  ns.listen = function (element , what , func ) {
    
    if (element) {
      element.addEventListener ( what , func , false);
    }
    else {
      console.log("element was missing for listening for " + what);
    }
  }
  
  /** 
  * add listeners
  */
  ns.listeners = function () {
    
    // shortcut
    var ag = App.globals;
    
    // sho viz of all results
    
    ns.listen (ag.divs.goViz , "click", function (e) {
      Render.hide(ag.divs.resetViz,true);
      Render.hide(ag.divs.control,true);
      Render.hide(ag.divs.viz,false);
      Render.myViz();
      Render.hide(ag.divs.resetViz, false);
    });
    
    // clear viz and get back to main
    ns.listen (ag.divs.resetViz , "click", function (e) {
      Render.hide(ag.divs.viz,true);
      Render.hide(ag.divs.control,false);
    });
    
    // max number of multiple responses
    ns.listen ( ag.divs.numQuestions, 'change' , function (e) {
      ag.questions.numQuestions = parseInt(ag.divs.numQuestions.value,10);
    });
    
    // get some questions
    ns.listen(ag.divs.go,"click", function (e) {
      
      // hide the category spinner
      Render.hide(ag.divs.startSpinner,false);
      
      // only proceed if we have everything we need
      Promise.all ([ag.promises.categories,ag.promises.register, Client.provoke() , Client.registerCategory()])
      .then (
        function (values) {
         
          Render.hide(ag.divs.startSpinner,true);
          Render.report();
        },
        function (errors) {
          App.reportMessage ('cant continue:' + JSON.stringify(errors));
        });
    });
    
    // category change
    ns.listen ( ag.divs.categories, 'change' , function (e) {
      
      ag.questions.category = ag.source.categories[parseInt(ag.divs.categories.value,10)].category;
      //
      Client.registerCategory ().then (function(result) {
        Render.playerData();
      });
      // invalidate any cached questions on the old category
      ag.source.nextData = null;
      // also stack up some data 
      Client.provoke();
    });
    
    // the pause /resume buttons
    ns.listen (ag.divs.pause, "click" , function () {
      if (ag.questions.asking) {
        ag.arcs.value.pause();
        Render.hide (ag.divs.pause, true );
        Render.hide (ag.divs.resume , false);
      }
    });
    
    ns.listen (ag.divs.resume, "click" , function () {
      if (ag.questions.asking) {
        ag.arcs.value.resume();
        Render.hide (ag.divs.pause , false);
        Render.hide (ag.divs.resume , true);
      }
    });
    
    // if next question selected
    // and we havent yet finished
    // update as wrong and get next question
    ns.listen (ag.divs.next,"click", function (e) {
      Promise.all([Render.abandon(),Client.provoke()]).then(
        function(result) {
          
          Render.report();
        },
        function (err) {
          App.reportMessage(err);
        });
    });
    
    // switch  back to category choice
    // mark current question wrong
    ns.listen(ag.divs.reset,"click", function (e) {
      // no need to wait for the last one to finish
      Render.abandon();
      // switch back to control
      Render.hide (ag.divs.render,true);
      Render.hide (ag.divs.control,false);
    });
    
  };
  
  return ns;
}) (App || {});
