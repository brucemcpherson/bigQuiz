function onceOff () { 
  
  // can be deleted after running once
  // DriveApp.getFiles() .. leave this comment in to provoke 
  // a drive dialog.
  cGoa.GoaApp.setPackage (PropertiesService.getScriptProperties() , 
    cGoa.GoaApp.createPackageFromFile (DriveApp , {
      packageName: Demo.PACKAGE_APP.name,
      fileId:'0B92ExLh4POiZVEJ2b0E3SkdyYzQ',
      scopes : cGoa.GoaApp.scopesGoogleExpand ([
        'userinfo.profile',
        'user.emails.read'
      ]),
      service:'google'
  }));

  cGoa.GoaApp.setPackage (PropertiesService.getScriptProperties() , 
    cGoa.GoaApp.createPackageFromFile (DriveApp , {
      packageName: Demo.PACKAGE_RUN.name,
      fileId:'0B92ExLh4POiZdVZKdHVEUjBMaDg',
      scopes : cGoa.GoaApp.scopesGoogleExpand ([
        'drive',
        'script.external_request',
        'script.scriptapp',
        'script.storage'
      ]),
      service:'google',
      executionProject:'MrH2Hz-cZpO-bGH1gT1NAVKi_d-phDA33'
  }));
  
  cGoa.GoaApp.setPackage (PropertiesService.getScriptProperties() , {
      packageName: Demo.PACKAGE_PLAY.name,
      data:{
        uid:"bruce"
      },
      clientSecret:'aK....0h',
      root:'https://bigquiz.firebaseio.com/',
      service:'firebase'
  });
  
  /*
  cGoa.GoaApp.setPackage (PropertiesService.getScriptProperties() , 
    cGoa.GoaApp.createServiceAccount (DriveApp , {
      packageName:  Demo.PACKAGE_PLAY.name,
      fileId:'19KHHxatjCuFmeC5Lls6hTyhC3yjfdrW6',
      scopes : cGoa.GoaApp.scopesGoogleExpand (['firebase.database','userinfo.email']),
      service:'google_service'
    }));
*/

}
function x () {
  cGoa.GoaApp.setPackage (PropertiesService.getScriptProperties() , 
    cGoa.GoaApp.createServiceAccount (DriveApp , {
      packageName:  Demo.PACKAGE_PLAY.name,
      fileId:'19KHHxatjCuFmeC5Lls6hTyhC3yjfdrW6',
      scopes : cGoa.GoaApp.scopesGoogleExpand (['firebase.database','userinfo.email']),
      service:'google_service'
    }));
}
function kill (){

  cGoa.GoaApp.invalidate(PropertiesService.getScriptProperties(), Demo.PACKAGE_RUN.name);
}
        
