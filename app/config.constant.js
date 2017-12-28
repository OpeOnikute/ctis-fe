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
        'mainCtrl': 'components/driver/js/controllers/mainCtrl.js'
    },
    //*** angularJS Modules
    modules: [{
        name: 'angularBlockUI',
        files: ['/bower_components/angular-block-ui/dist/angular-block-ui.min.js']
    },{
        name: 'toaster',
        files: ['components/driver/bower_components/AngularJS-Toaster/toaster.js', 'components/driver/bower_components/AngularJS-Toaster/toaster.css']
    }]
});
