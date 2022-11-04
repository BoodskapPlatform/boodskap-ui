// App logic.
window.myApp = {};

document.addEventListener('init', function(event) {
  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.
  if (page.id === 'menuPage' || page.id === 'pendingTasksPage') {
    if (document.querySelector('#menuPage')
      && document.querySelector('#pendingTasksPage')
      && !document.querySelector('#pendingTasksPage ons-list-item')
    ) {
      myApp.services.fixtures.forEach(function(data) {
        myApp.services.tasks.create(data);
      });
    }
  }
});

myNavigator.addEventListener('prepop', function(event) {

    pageActions('prepop',event);
});

myNavigator.addEventListener('postpop', function(event) {

    pageActions('postpop',event);
});

myNavigator.addEventListener('prepush', function(event) {

    pageActions('prepush',event);
});

myNavigator.addEventListener('postpush', function(event) {

    pageActions('postpush',event);
});


function pageActions(action,event) {

     var pages = myNavigator.pages; // Get current page object
     var pagesLength = myNavigator.pages.length; // Get current page object


    if(action === 'prepop'){

    }else if(action === 'postpop'){

    }else if(action === 'prepush'){
        var cpage = pages[pagesLength - 1];

        themeChangesClick("USER_THEME");

    }else if(action === 'postpush'){
        var cpage = pages[pagesLength - 1];
        if (cpage.id === 'singleDashboardPage') {

            $(".dashboardContent").css('background-color', CURRENT_DASHBOARD.bgcolor ? "#"+CURRENT_DASHBOARD.bgcolor : DEFAULT_DASHBOARD_BG);
            $(".dashboardName").html(CURRENT_DASHBOARD.name);
            $(".dashboardIcon").html('<i class="' + CURRENT_DASHBOARD.icon + '"></i>');
            themeChangesClick("USER_THEME");

        }
    }
};