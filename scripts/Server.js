
/**
 * runs on the server side
 * for testing whether libraries have an effect
 * @namespace Server
 */
var Server = (function (ns) {

  /**
  * given a category get a selection of random questions
  * @param {string} category the category
  * @param {number} numberOfQuestions how many questions to use for answer multiple choice
  * @param {number} [chunkSize=1] the number of question chunks
  * @param {[object]} questions
  */
  ns.getQuestions = function (category , numberOfQuestions,chunkSize) {
    return Execution.run (
      'getQuestions',
      [category,numberOfQuestions,chunkSize || 1],
      false
    ).response.result;
  };

  

  /**
  * get existing categories
  * @param {number} maxCats number of cats to get
  * @param {[string]} categories
  */
  ns.getCategories = function (maxCats,nocache) {
  
    var execResponse = Execution.run (
      'getCategories',
      [maxCats,nocache],
      false
    );
    
    return execResponse.response.result;
    
  };

  ns.register = function (gameId) {
    return Tracking.init().register(gameId);
  };
  
  ns.registerCategory = function (gameData) {
    return Tracking.init().registerCategory(gameData);
  };
  
  ns.updateScore = function (gameData) {
    var result = Tracking.init().updateScore(gameData);
    return result;
  };
  
  ns.getAllGameData = function (gameData) {
    return Tracking.init().getAllGameData (gameData);
  };
  
  return ns;
}) (Server || {});

/**
* used to expose memebers of a namespace
* @param {string} namespace name
* @param {method} method name
*/
function exposeRun (namespace, method , argArray ) {
  var func = (namespace ? this[namespace][method] : this[method])
  if (argArray && argArray.length) {
    return func.apply(this,argArray);
  }
  else {
    return func();
  }
}

