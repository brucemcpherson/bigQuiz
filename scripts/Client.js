/**
* runs on the client side
* for testing whether libraries have an effect
* @namespace Client
*/
var Client = (function (ns) {
  
  ns.updateScore = function (gameData) {
     
    var ag = App.globals;
    App.clearMessage(); 

    return Provoke.run ('Server' , 'updateScore' , {
      categoryId:gameData.categoryId,
      playerId:ag.player.data.info.id,
      gameId:ag.game.id,
      wrong:gameData.wrong,
      score:gameData.score,
      value:gameData.value
    });
    
  };
  
  ns.getAllGameData = function () {
    var ag=App.globals;
    App.clearMessage();

    return Provoke.run ( 'Server' , 'getAllGameData' , {
      playerId:ag.player.data.info.id,
      gameId:ag.game.id
    });

  };
 
  
  ns.register = function () {

    var ag = App.globals;
    App.clearMessage();
    
    ag.promises.register = new Promise (function (resolve, reject ) {
      
      Provoke.run ('Server' , 'register' , ag.game.id).then (
        function (result) {
          ag.player.data = result;
          Render.playerData();
          resolve (result);
        }, 
        function (err) {
          App.reportMessage (err);
          reject(err);
        });
    });

    return ag.promises.register;
  };

  ns.registerCategory = function (gameData) {

    var ag = App.globals;
    App.clearMessage();
    
    ag.promises.registerCategory = new Promise ( function (resolve, reject) {
      
      Provoke.run ('Server' , 'registerCategory' , {
        categoryId:ag.questions.category,
        playerId:ag.player.data.info.id,
        gameId:ag.game.id
      })
      .then(
        function(result) {
          ag.player.data.category = result.category;
          Render.score();
          resolve(result);
        }, 
        function(err) {
          App.reportMessage (err);
          reject(err);
        });
    });
    return ag.promises.registerCategory;
  };
  
  
  /**
   * gets data either from queue or by asking for the queue to be filled
   * @return {Promise} a promise for the data
   */
  ns.provoke = function () {
    var ag = App.globals;

    return new Promise (function(resolve,reject) {
      
      var q = ag.source.q[ag.questions.category];

      if (q && q.length) {
        
        // there is already some data
        // was q.shift
        ag.source.data =  q.shift();
        
        // get some more to replenish for next time
        ns.getData();
        resolve (ag.source.data);
      }
      
      else {

        // there's not any, so need to get some now
        ns.getData().then ( 
          function (result) {
            var q = ag.source.q[result.picked.category];
            ag.source.data = q.shift();            
      
            // get some more to replenish
            ns.getData();
            resolve (ag.source.data);
          },
          function (err) {
            reject(err);
          });
      }
      
    });
    
  };
  
  // gets data from the server 
  // and stores it in a queue.
  ns.getData  = function () {
    var ag = App.globals;

    return new Promise ( function (resolve, reject) {
      Provoke.run ('Server','getQuestions',ag.questions.category,ag.questions.numQuestions).then (
        function (result) {
          ag.source.q[result.picked.category] = ag.source.q[result.picked.category] || [];
          ag.source.q[result.picked.category].push (result);
          resolve(result);
        },
        function (err) {
          reject(err);
        });
    })
  };
  
  
  /**
  * provoke a get categories
  * @return {object} the provoked item
  */
  ns.provokeCategories = function () {
    
    // shortcut
    var ag = App.globals;
    App.clearMessage();
    
    ag.promises.categories = new Promise ( function (resolve, reject ) {
      
      Provoke.run ('Server','getCategories',ag.questions.maxCategories,1)
      .then (
        function (result) {
          App.globals.source.categories = result.sort (function (a,b) {
            return a.category > b.category ? 1 : (a.category < b.category ? -1 : 0);
          });
          Render.createCategories();
          Render.hide (ag.divs.selectSpinner,true);
          Render.hide (ag.divs.selectSelect,false);
          ag.divs.go.disabled = ag.divs.goViz.disabled = false;

          resolve (result);
        },
        function (err) {
          Render.hide (ag.divs.selectSpinner,true);
          App.reportMessage (err);
          reject (err);
      });
    
    });

    return ag.promises.categories;
  };
  return ns;
})(Client || {});

