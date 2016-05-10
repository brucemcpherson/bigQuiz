
/**
*@namespace GamesApi
*runs server side and handles all gameplay interaction
*i decided not to use the google gameplay service
*the setup is too complicated
* using firebase
*/
var Tracking = (function (ns) {

  ns.base = 'https://people.googleapis.com/v1/';
  /**
  * check init has happened
  */
  ns.checkInit = function () {
    if (!ns.handle) {
      throw 'you need to run Tracking.init()';
    }
  }
 
  
  function cleanComponent_ (text) {
    // firebase doesnt like dots.
    return encodeURIComponent ( text.replace (/\./g,""));
  }
  
  /**
   * initialize 
   * @return {Tracking} self
   */
  ns.init = function () {
    
    // make a goa and get a firebase handle
    var goa =  cGoa.make (Demo.PACKAGE_PLAY.name,Demo.PACKAGE_PLAY.props);
    
    // use this handle for everything
    ns.handle = new cFireBase.FireBase().setAuthData (goa);
    
    return ns;
  };  

  /**
   * called when a category is changed
   * @param {object} gameData about the game to be registered
   * @return {object} updated category info
   */
  ns.registerCategory = function  (gameData) {
   
    ns.checkInit();
    if (!gameData || !gameData.playerId || !gameData.gameId || !gameData.categoryId) {
      throw new Error ('cant register category with this ' + JSON.stringify(gameData));
    }
    // for timestamping
    var now = new Date().getTime();
    
    // get category data
    var result = handleAssert_ ( ns.handle.get(ns.getCategoryPath(gameData.playerId, gameData.gameId, gameData.categoryId ) + '/summary'));
    
    var category = result.data || {
      firstPlayed:now,
      numGames:0,
      score:0,
      wrong:0,
      value:0
    };
    
    category.registered = now;
    
    handleAssert_ ( ns.handle.put(category, ns.getCategoryPath(gameData.playerId, gameData.gameId, gameData.categoryId ) + '/summary'));
    
    // register the category at the top level
    var result = handleAssert_ ( ns.handle.get(ns.getTopCategoryPath( gameData.gameId, gameData.categoryId ) + '/summary'));
    var topCategory = result.data || {
      firstPlayed:now,
      numGames:0,
      score:0,
      wrong:0,
      value:0
    };
    topCategory.registered = now;
    handleAssert_ ( ns.handle.put(topCategory, ns.getTopCategoryPath( gameData.gameId, gameData.categoryId ) + '/summary'));
    
    return {
      category:category,
      topCategory:topCategory
    };
  };
  
  /**
  * get all the data for this player for this game
  * @param {object] gameData
  * @return {object} all playerdata for this game
  */
  ns.getAllGameData  = function(gameData) {
    ns.checkInit();
    
    // get all the game data for this player
    var result = handleAssert_ ( ns.handle.get(ns.getGamePath(gameData.playerId, gameData.gameId )));
    var game = result.data;

    
    // get the overall game data
    var result = handleAssert_ ( ns.handle.get( ns.getTopGamePath( gameData.gameId )));
    var topGame = result.data;

    return {
      game:game,
      topGame:topGame
    };
    
  };
  /**
   * called when a question is answered
   * @param {object} gameData about the question answered
   * @return {object} updated game info
   */
  ns.updateScore = function (gameData) {

    ns.checkInit();
    if (!gameData || !gameData.playerId || !gameData.gameId || !gameData.categoryId) {
      throw new Error ('cant update score with this ' + JSON.stringify(gameData));
    }
    
    
    // get player data
    var result = handleAssert_ ( ns.handle.get(ns.getPlayerPath(gameData.playerId) + '/summary' ));
    var player = result.data;
                                
    // get game data
    var result = handleAssert_ ( ns.handle.get(ns.getGamePath(gameData.playerId, gameData.gameId ) + '/summary'));
    var game = result.data;
    
    // get category data
    var result = handleAssert_ ( ns.handle.get(ns.getCategoryPath(gameData.playerId, gameData.gameId, gameData.categoryId ) + '/summary'));
    var category = result.data; 
    
    // get top category data
    var result = handleAssert_ ( ns.handle.get(ns.getTopCategoryPath( gameData.gameId, gameData.categoryId ) + '/summary'));
    var topCategory = result.data; 
    
    // get top game data
    var result = handleAssert_ ( ns.handle.get(ns.getTopGamePath( gameData.gameId ) + '/summary'));
    var topGame = result.data; 
    
    // get top App data
    var result = handleAssert_ ( ns.handle.get(ns.getAppPath() + '/summary'));
    var topApp = result.data; 
    
    // for timestamping
    var now = new Date().getTime();
    
    // update all the summaries
    topApp.score += gameData.score;
    topApp.numGames++;
    topApp.lastPlayed = now;
    topApp.wrong += gameData.wrong;
    topApp.value += gameData.value;
    handleAssert_ ( ns.handle.put(topApp, ns.getAppPath() + '/summary'));
    
    topCategory.score += gameData.score;
    topCategory.numGames++;
    topCategory.lastPlayed = now;
    topCategory.wrong += gameData.wrong;
    topCategory.value += gameData.value;
    handleAssert_ ( ns.handle.put(topCategory, ns.getTopCategoryPath( gameData.gameId, gameData.categoryId ) + '/summary'));
    
    topGame.score += gameData.score;
    topGame.numGames++;
    topGame.lastPlayed = now;
    topGame.wrong += gameData.wrong;
    topGame.value += gameData.value;
    handleAssert_ ( ns.handle.put(topGame, ns.getTopGamePath( gameData.gameId ) + '/summary'));
    
    
    player.score += gameData.score;
    player.numGames++;
    player.lastPlayed = now;
    player.wrong += gameData.wrong;
    player.value += gameData.value;
    handleAssert_ ( ns.handle.put(player, ns.getPlayerPath(gameData.playerId) + '/summary'));
    
    game.score += gameData.score;
    game.numGames++;
    game.lastPlayed = now;
    game.wrong += gameData.wrong;
    game.value += gameData.value;
    handleAssert_ ( ns.handle.put(game, ns.getGamePath(gameData.playerId, gameData.gameId ) + '/summary'));
    
    category.score += gameData.score;
    category.numGames++;
    category.lastPlayed = now;
    category.wrong += gameData.wrong;
    category.value += gameData.value;
    handleAssert_ ( ns.handle.put(category, ns.getCategoryPath(gameData.playerId, gameData.gameId, gameData.categoryId ) + '/summary'));
    
    
    // this can be used to show progress
    var result =  {
      player:player,
      game:game,
      category:category,
      topGame:topGame,
      topCategory:topCategory,
      topApp:topApp
    };

    return result;
  }
  
  ns.getPlayerPath = function (playerId) {
    return 'players/' + cleanComponent_ (playerId);
  };
  ns.getAppPath = function () {
    return 'app';
  };
  
  ns.getTopGamePath = function (gameId) {
    return 'games/' + cleanComponent_(gameId);
  };
  
  ns.getTopCategoryPath = function (gameId,categoryId) {
    return ns.getTopGamePath(gameId) + '/categories/' + cleanComponent_(categoryId);
  };
  
  ns.getGamePath = function (playerId,gameId) {
    return ns.getPlayerPath(playerId) + '/games/' + cleanComponent_(gameId);
  };
  
  ns.getCategoryPath = function (playerId,gameId,categoryId) {
    return ns.getGamePath(playerId, gameId) + '/categories/' + cleanComponent_(categoryId);
  };
  
  ns.register = function (gameId,info) {
    
    // make sure its initialized
    ns.checkInit();
    
    // identify the current player
    info = info || ns.getPlayer();

    // get player data
    var result = handleAssert_ ( ns.handle.get(ns.getPlayerPath(info.id) + '/summary' ));
    
    var now = new Date().getTime();
    
    function initSpace () {
      return {
        firstPlayed:now,
        numGames:0,
        score:0,
        wrong:0,
        value:0
      };
    };

    // first time
    var player = result.data || initSpace();
    player.registered = now;
    
    // get game data
    var result = handleAssert_ ( ns.handle.get(ns.getGamePath(info.id, gameId ) + '/summary'));
    
    
    // first time this game
    var game = result.data || initSpace();
    // remember when last registered
    var lastHere = game.registered;
    
    game.registered = now;
    
    // get all player summary
    var result = handleAssert_ ( ns.handle.get(ns.getTopGamePath( gameId ) + '/summary'));
    var topGame = result.data || initSpace(); 
    topGame.registered = now;
    
    // get all games summary
    var result = handleAssert_ ( ns.handle.get(ns.getAppPath() + '/summary'));
    var topApp = result.data || initSpace(); 
    topApp.registered = now;
    
    handleAssert_ ( ns.handle.put(player, ns.getPlayerPath(info.id ) + '/summary'));
    handleAssert_ ( ns.handle.put(game, ns.getGamePath(info.id, gameId ) + '/summary'));
    handleAssert_ ( ns.handle.put(topGame, ns.getTopGamePath( gameId ) + '/summary'));
    handleAssert_ ( ns.handle.put(topApp, ns.getAppPath( gameId ) + '/summary'));
    
    return {
      player:player,
      game:game,
      info:info,
      lastHere:lastHere,
      topApp:topApp,
      topGame:topGame
    }
    
  };
  
  function handleAssert_ (result) {

    if (!result.ok) {
      throw new Error (result.response.getContentText() + '(' + result.url + ')' );
    }
    return result;
  }
  /**
  * get player
  * @param {string} [id] if missing, gets the current players id 
  * @return {string} the playerid
  */
  ns.getPlayer = function (id) {
    var result  = ns.fetch ('people/' + 
      (id || 'me') + 
      '?fields=emailAddresses%2Cnames(displayName%2CfamilyName%2CgivenName%2Cmetadata)%2Cphotos');
    
    // create minimalized person
    function findPrimary (objects) {
      return objects && objects.length ? objects.filter (function(d) {
        return d.metadata.primary;
      })[0] : {};
    }
    
    return {
      photoUrl:findPrimary(result.photos).url,
      firstName:findPrimary(result.names).givenName,
      displayName:findPrimary(result.names).displayName,
      email:findPrimary(result.emailAddresses).value,
      id:findPrimary(result.emailAddresses).metadata.source.id
    }
  };
  


  /**
   * do the fetch
   * @param {string} url (not including the base)
   * @param {object} options not including the token
   * @return {object} the result
   */
  ns.fetch = function (url, options) {
    var options = options || {};
    options.headers = options.headers || {};
    options.headers.authorization = "Bearer " + ns.getToken();
    var result = cUseful.Utils.expBackoff ( function () {
      return UrlFetchApp.fetch ( ns.base + url, options);
    });
    return JSON.parse(result.getContentText());
  };
  
  ns.getGoa = function () {
    return cGoa.make (
      Demo.PACKAGE_APP.name, 
      Demo.PACKAGE_APP.props
    );
  };
  
  ns.getToken = function () {
    var goa = ns.getGoa();
    if (!goa.hasToken()) {
      throw 'there is no token available - did you do a consent dialog?';
    }
    return goa.getToken();
  };
  return ns;
}) (Tracking || {});


