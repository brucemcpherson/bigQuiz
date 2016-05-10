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
      clientSecret:'aKxxxxxxxxxxxxxx0h',
      root:'https://bigquiz.firebaseio.com/',
      service:'firebase'
  });
    

}
        