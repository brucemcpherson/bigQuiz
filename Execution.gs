/**
* calls executionAPI
* @namespace Execution
*/
var Execution = (function(ns) {
  
  ns.run = function (functionName , args, devMode ) {
    var payload =  JSON.stringify({
      "function":functionName,
      "devMode":devMode,
      "parameters":args
    });
    
    // now call the remote project
    var result = UrlFetchApp
    .fetch ( 
      "https://script.googleapis.com/v1/scripts/" + 
      ns.getGoa().getProperty("executionProject") + ":run", {
      method:"POST",
      payload: payload,
      contentType: "application/JSON",
      headers: {
      "Authorization":"Bearer " + ns.getToken()
      }
    });
    
    return JSON.parse(result.getContentText());
  };
  
  ns.getGoa = function () {
    return cGoa.make(
      Demo.PACKAGE_RUN.name, 
      Demo.PACKAGE_RUN.props
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
})(Execution || {});

