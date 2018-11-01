function doGet(e) {
  
  // do the oauth2 dance if needed .. im running multiple consent dialogs here just for fun
  var gap = cGoa.GoaApp;   // just a shortcut
 
  var name = gap.getName(e);
  
  // only do this the very foirst time - name will be undefined.
  if (!name) {
    Demo.packages.forEach(function (d) {
      if (d.clone) {
        gap.userClone ( 
          d.name, 
          PropertiesService.getScriptProperties() , 
          d.props
        ); 
      }
    });
  }
  else {
    // get for the one we are doing
    var p  = Demo.packages.filter(function (d) {
      return d.name === name;
    });
    if (!p.length) {
      throw 'something very strange has happened - goa package ' + name + ' is missing';
    }
    var goa = new cGoa.Goa(name,p[0].props).execute(e); 
    // renter for consent
    if (goa.needsConsent()) {
      return goa.getConsent();
    }
  }
  
  // if we get here then we look through each one to see if any more consent is needed
  for (var i = 0; i < Demo.packages.length ; i++ ) {
    var goa = cGoa.GoaApp.createGoa (Demo.packages[i].name,Demo.packages[i].props).execute();
    if (goa.needsConsent()) {
       return goa.getConsent();
     }
     if (!goa.hasToken()) throw 'something went wrong with goa for ' + 
       goa.getProperty('packageName') + ' - did you check if consent was needed?';
   }

  // now return the evaluated page
  return HtmlService
  .createTemplateFromFile(Demo.HTML)
  .evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .setTitle('jeopardy questions ')
  .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  
}

var Demo = (function (ns)  {
  
  // always called when code is entered server side
  ns.HTML = 'index';
  
  // the app runs as the user - needs different creds
  ns.PACKAGE_APP = {
    name:'jeopardy_demo',
    props:PropertiesService.getUserProperties(),
    clone:true
  };
  
  // the execution service - same creds for all
  ns.PACKAGE_RUN = {
    name:'execution_demo',
    props:PropertiesService.getScriptProperties(),
    clone:false
  };
  
  // the firebase stuff - same creds for all
  ns.PACKAGE_PLAY = {
    name:'player_demo',
    props:PropertiesService.getScriptProperties(),
    clone:false
  };
  
  ns.packages = [
    ns.PACKAGE_APP, 
    ns.PACKAGE_RUN,
    ns.PACKAGE_PLAY
  ];
  

  return ns;
}) ({});