function tokenTester() {
  var goa = cGoa.make(Demo.PACKAGE_APP.name,Demo.PACKAGE_APP.props);
  //Logger.log(goa.getPackage());
  Logger.log(goa.hasToken());
  
  var goa = cGoa.make(Demo.PACKAGE_RUN.name,Demo.PACKAGE_RUN.props);
  //Logger.log(goa.getPackage());
  Logger.log(goa.hasToken());
  
  var goa = cGoa.make(Demo.PACKAGE_PLAY.name,Demo.PACKAGE_PLAY.props);
  //Logger.log(goa.getPackage());
  Logger.log(goa.hasToken());
  
}
