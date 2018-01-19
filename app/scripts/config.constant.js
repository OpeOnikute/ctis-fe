'use strict';

/**
 * Config constant
 */
app.constant('APP_MEDIAQUERY', {
    'desktopXL': 1200,
    'desktop': 992,
    'tablet': 768,
    'mobile': 480
});
app.constant('JS_REQUIRES', {
    //*** Scripts
    scripts: {
        //*** Controllers
        'mapCtrl': 'controllers/mapCtrl.js',
        'homeCtrl': 'controllers/homeCtrl.js',
        'mainCtrl': 'components/driver/js/controllers/mainCtrl.js',
        'adminMainCtrl': 'components/admin/js/controllers/mainCtrl.js',
        'adminTableCtrl': 'components/admin/js/controllers/tableCtrl.js',
        'driverShuttleTableCtrl': 'components/driver/js/controllers/shuttleTableCtrl.js',
        'driverDirectives': 'components/driver/js/directives.js',
        'adminDirectives': 'components/admin/js/directives.js'
    },
    //*** angularJS Modules
    modules: [{
        name: 'angularBlockUI',
        files: ['/bower_components/angular-block-ui/dist/angular-block-ui.min.js']
    },{
        name: 'toaster',
        files: ['components/driver/bower_components/AngularJS-Toaster/toaster.js', 'components/driver/bower_components/AngularJS-Toaster/toaster.css']
    }, {
        name: 'ui.select',
        files: ['components/admin/bower_components/angular-ui-select/dist/select.min.js', 'components/admin/bower_components/angular-ui-select/dist/select.min.css', 'components/admin/bower_components/select2/dist/css/select2.min.css', 'components/admin/bower_components/select2-bootstrap-css/select2-bootstrap.min.css', 'components/admin/bower_components/selectize/dist/css/selectize.bootstrap3.css']
    }]
});
