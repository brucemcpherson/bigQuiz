/**
*@namespace QueryUtils
*runs client side and handles all view updating 
*/
var Render = (function (ns) {
  
  /**
  * create the category options
  */
  ns.createCategories = function () {
    var ag = App.globals;
    var sel = ag.divs.categories;
    
    ag.source.categories.forEach (function (d,i) {
      var opt = addElem (sel , 'OPTION' , d.category + ' (' + d.num + ' questions)');
      opt.value = i;
      // default category
      if (d.category === ag.questions.category) {
        sel.value = i;
      }
    });
  };
  
  
  ns.playerData = function () {
    
    var ag = App.globals;
    var data = ag.player.data;
    ag.divs.welcome.innerHTML = 'Welcome ' + data.info.displayName + '<br>' +
      (data.game.firstPlayed !== data.lastHere ? ('you were last here ' + 
       Math.round((new Date().getTime() - data.lastHere)/1000/60) + ' minutes ago') :
      'This is your first time here');
    ag.divs.playerPhoto.src = data.info.photoUrl + "?sz=" + ag.player.photoSize;
  };
  
  ns.score = function () {
    var ag = App.globals;
    
    // do the animation for the category and game summaries
    var agp = ag.player.data;
    ag.arcs.game.init(ag.arcDash.summary.options).setData(ag.arcDash.summary.data);  
    ag.arcs.category.init(ag.arcDash.summary.options).setData(ag.arcDash.summary.data); 
    
    setArcValues (ag.arcs.game, 0 ,agp.game.score).start(ag.game.anDuration,0,1) ;
    setArcValues (ag.arcs.category, 0 ,agp.category.value).start(ag.game.anDuration , 0, agp.category.value ? 
                                                                 agp.category.score/agp.category.value : 1); 
  };
  
  
  function getScore_ (targetValue , progressValue, wrong) {
    return Math.round(wrong ? 0 : targetValue/3 + (1-progressValue)*targetValue/3*2)
  }
  
  ns.markit = function (score, wrong, animate ) {
    var ag = App.globals;
    
    // upodate the score and replot
    return new Promise (function(resolve,reject)  {
      
      Client.updateScore ( {
        score:score,
        categoryId:ag.source.data.picked.category,
        wrong:wrong ? 1 : 0,
        value:ag.questions.score
      })
      .then (
        function (result) {
          ag.player.data.player = result.player;
          ag.player.data.game = result.game;
          ag.player.data.category = result.category;
          resolve(result);
          
          // dont bother waiting for the animation
          if (animate) {
            ns.score();
          }
          
        },
        function (err) {
          reject(err);
          App.reportMessage (err);
        }
      );
      
    });
    
  };
  
  ns.abandon = function () {
    var ag = App.globals;
    if(ag.questions.asking) {
      ag.arcs.value.getItem("main").custom.wrong = true;
      ag.arcs.value.cancel ();
    }
    return ag.arcs.promise;
  }
  /**
  * create a report
  */
  function report_ () {
    
    var ag = App.globals;
    var data = ag.source.data;
    var div = ag.divs.report;
    div.innerHTML = "";
    
    ag.arcs.promise = new Promise (function (resolve , reject) {
      
      ag.questions.score = data.picked.value ? parseInt(data.picked.value.replace(/[^\d]+/g,''),10) : ag.questions.defaultValue ;
      ag.questions.asking = false;
      
      // sort out the pause buttons
      ns.hide (ag.divs.pause, false);
      ns.hide(ag.divs.resume,true);
      
      // display the question area    
      var questionArea = addElem (div , "div" , "" , "mui-panel");
      var qDiv = addElem (questionArea, "div" , "","mui-panel question");
      var qt = addElem (qDiv, "span" , data.picked.question,"mui--text");
      var qi = addElem (qDiv,"span",'?',"mui--pull-right relative");
      
      // prepare an info panel
      var info = addElem (qi , "div" , '', "mui-panel mui--z2 info-card mui--hide");
      addElem (info, "div" , "Details from when this question was asked on Jeopardy","mui--text-caption");
      var infoTable = addElem (info , "div" , "" , "mui-container");
      var table = addElem (infoTable , "table" ,"","mui-table");
      
      // the info panel in case asked for
      ["category" , "show_number", "round" , "air_date" ,"value"].forEach(function(d) {
        var tr = addElem (table, "tr");
        addElem (tr,"td",d);
        addElem (tr,"td",data.picked[d]);         
      });
      
      //--show each answer 
      data.answers.forEach(function (d) {
        var answerElem = addElem (questionArea, "div" , d , "mui-panel answer");
        
        // listen for the answer being clicked
        App.listen (answerElem, "click" , function () {
          
          // ignore if already answered
          if (ag.questions.asking) {
            var wrong = d !== data.picked.answer;
            ns.addClass (answerElem ,wrong ?  "wrong" : "correct");
            
            // we can just reject it passing whether it was right or wrong
            // the promise handling will figure out what to do
            ag.arcs.value.getItem("main").custom.wrong = wrong;
            ag.arcs.value.cancel ();
          }
          
        });
      });
      
      // show info or not
      App.listen (qi , "click" , function (e) {
        
        // need to pause if showing info
        if (ag.questions.asking) {
          // if its hidden then we are going to show it, so pause
          if (ns.isHidden(info)) {
            ag.arcs.value.pause();
            ag.divs.pause.disabled = ag.divs.resume.disabled = true;
          }
          else {
            // if resume is hidden then we must have stopped because of the info bar
            // so restart it, otherwise leave it in its prior state (ie. paused)
            if (ns.isHidden(ag.divs.resume)) {
              ag.arcs.value.resume();
            }
            ag.divs.pause.disabled = ag.divs.resume.disabled = false;
          }
        }
        
        // show or hide the info
        ns.flip (info);
      });
      
      // start sealing with the answer
      ag.questions.asking = true;
      ag.divs.pause.disabled = false;
      
      // update the current game and category scores
      ns.score();
      
      // set up timer
      ag.arcs.value.init(ag.arcDash.value.options).setData(ag.arcDash.value.data);      
      
      
      
      // go
      setArcValues(ag.arcs.value, getScore_ (ag.questions.score , 0, false) , getScore_ (ag.questions.score , 1, false)).start(ag.game.turnDuration)
      .then (
        function (dt) {
          // if we get here then the timer has expired - it is wrong
          dt.getItem("main").custom.wrong = true;
          itsOver (dt);
        },
        function (dt) {
          // if we get here the question has been answered - it may be wrong
          itsOver (dt);
        }
      );
      
      function itsOver (dt) {
        
        doVictoryLap(dt)
        .then (
          function (data) {
            resolve(data);
          },
          function (err) {
            reject (err)
          }
        );     
      }
      
      function doVictoryLap (dt) {
        // if its the correct answer, then do a victory lap
        var ag = App.globals;
        
        // get where it got to
        var wrong = dt.getItem("main").custom.wrong;
        var score = getScore_ (ag.questions.score , dt.getProgress() , wrong);
        
        // finish this one & markit up in the database
        var markitPromise = ns.markit (score, wrong,true);
        //dt.kill();
        
        // stop asking
        ag.questions.asking = false;
        
        // set up victory lap & tweak for whether right or wrong
        var item = ag.arcDash.lap.data.filter(function(g) {
          return g.dataName === "main"; 
        })[0];
        
        item.finish.fill =  wrong ? ag.colors.wrong : ag.colors.correct;
        item.finish.value = item.start.value = score;
        ag.arcs.lap = new DashTimer(ag.divs.lapArc)
        .init(ag.arcDash.lap.options)
        .setData(ag.arcDash.lap.data)
        .start();
        
        // mark it up in the database
        return markitPromise;
        
      }
      
      // show the question page rather than the control page
      ns.hide (ag.divs.control,true);
      ns.hide (ag.divs.render,false);
      
    });
    return ag.arcs.promise;
  };
  
  /**
  * create a report
  */
  ns.report = function () {
    
    return report_();
    
  };
  
  function setArcValues (arc, start,finish) {
    var ag = App.globals;
    var ds = arc.getItem("main");
    ds.start.value = start; 
    ds.finish.value = finish; 
    
    
    return arc;
  }
  function addElem (parent, type , text, className) {
    
    var elem = document.createElement(type);
    parent.appendChild(elem);
    elem.innerHTML = typeof text === typeof undefined ? '' : text ;
    if (className) {
      elem.className += (" " + className);
    }
    return elem;
  }
  
  ns.addClass = function (element, className) {
    if (!element.classList.contains (className)) {
      element.classList.add (className);
    }
    return element;
  };
  
  /**
  * hide a div
  * @param {element} element
  * @param {boolean} addClass whether to remove or add
  * @param {string} [className] the class
  * @return {element} the div
  */
  ns.hide = function (element , addClass , className) {
    className = className || "mui--hide";
    // will only happen if polyfill not loaded..
    if (!element.classList.add) {
      throw 'classlist not supported';
    }
    var q = addClass ? ns.addClass (element , className) : element.classList.remove (className);
    return element;
  };
  
  /**
  * flip a div
  * @param {element} element
  * @param {string} [className] the class
  * @return {element} the div
  */
  ns.flip = function (element,className) {
    element.classList.toggle (className || "mui--hide");
    return element;
  };
  
  /**
  * is hidden
  * @param {element} element
  * @param {string} [className]
  * @return {boolean} is it hidden
  */
  ns.isHidden = function (element,className) {
    return element.classList.contains (className || "mui--hide");
  };
  
  /**
  * show my results
  */
  ns.myViz = function  () {
    var ag = App.globals;

    // we can get started working on the charts
    // migrate more of this later.
    var startReport = new Promise (function(resolve, reject) {
      ag.divs.vizible.innerHTML = "";
      var vm = addElem (ag.divs.vizible,"div","","mui-panel mui--text-center");
      
      var table = addElem (vm, "table","","mui-table");
      var tbody = addElem (table,"tbody");
      resolve (tbody);
      
    });
    
    // make sure we have player data
    ag.promises.register
    .then ( function () {
      // get all the gamedatafor this player
      Client.getAllGameData()
      .then(function (result) {
          startReport.then (
            function (tbody) {
              vizit(result,tbody);
            });
        },
        function (err) {
          App.reportMessage (err);
        });

    });
    
    function vizit(data,tbody) {
      
      // first create the html
      var getChartData = ag.charts.getChartData;
      var chartOptions = ag.charts.chartOptions; 
      

      addVizRows (data.topGame, data.game, "All categories","all" );
      
      Object.keys(data.game.categories).sort().forEach(function(d,i) {
        addVizRows(data.topGame.categories[d],data.game.categories[d] , d ,i );
      });
      
      
      function addVizRows(dtall, dtyou , cat,suffix) {

        var tr = addElem (tbody, "tr");
        
        addCard(cat,dtall,tr,"all players");

        addElem (addElem (tr,"td","Score"),"div").id="scoreall"+suffix;
        var chd = [dtall.summary.score,dtall.summary.value];
       
        new DashTimer("#scoreall"+suffix).init(chartOptions).setData(getChartData(chd)).start();
     
        addElem (addElem (tr,"td","Correct"),"div").id="wrongall"+suffix;
        var chd = [dtall.summary.numGames - dtall.summary.wrong,dtall.summary.wrong];
        new DashTimer("#wrongall"+suffix).init(chartOptions).setData(getChartData(chd)).start();
        
        addCard(cat,dtyou,tr,"you");
       
        addElem (addElem (tr,"td","Score"),"div").id="score"+suffix;
        var chd = [dtyou.summary.score, dtyou.summary.value];
        new DashTimer("#score"+suffix).init(chartOptions).setData(getChartData(chd)).start();
        
        addElem (addElem(tr,"td","Correct"),"div").id="wrong"+suffix;
        var chd = [dtyou.summary.numGames - dtyou.summary.wrong,dtyou.summary.wrong];
        new DashTimer("#wrong"+suffix).init(chartOptions).setData(getChartData(chd)).start();
        
        var td = addElem(addElem (tbody, "tr" ),"td");
        td.colSpan = "6";
        addElem (td,"div","","mui-divider");

      }
      function addCard (cat, dt,tr,who) {
        var df = d3.time.format("%a %b %e %H:%M");
        var card = addElem (tr,"td","","mui-panel");
        addElem (card,"div", cat , "mui--text-title");
        var table = addElem (card,"table","","mui-table");
        var tr = addElem (table,"tr");
        addElem (tr,"td","first played","mui--text-left mui--text-caption mui--text-dark-hint");
        addElem (tr,"td",df(new Date(dt.summary.firstPlayed)),"mui--text-left mui--text-dark-secondary");
        var tr = addElem (table,"tr");
        addElem (tr,"td","last played","mui--text-left mui--text-caption mui--text-dark-hint");
        addElem (tr,"td",df(new Date(dt.summary.lastPlayed)),"mui--text-left mui--text-dark-secondary");
        var tr = addElem (table,"tr");
        addElem (tr,"td","questions tried","mui--text-left mui--text-caption mui--text-dark-hint");
        addElem (tr,"td",dt.summary.numGames,"mui--text-left mui--text-dark-secondary");
        addElem (table,"tr","");
        var tr = addElem (table,"tr","");
        addElem (tr,"td","");
        var td = addElem (tr,"td", who,"mui--text-right mui--text-accent");
      }
      
      
    }
    
    
  }
  return ns;
  
})(Render || {});
