'use strict';

/* Controllers */
angular.module('pluffApp.controllers', [])
  .controller('LanguageCtrl', LanguageCtrl)
  .controller('TimeTableCtrl', TimeTableCtrl)
  .controller('HolidaysCtrl', HolidaysCtrl)
  .controller('RoomsCtrl', RoomsCtrl)
  .controller('ColorsCtrl', ColorsCtrl);

function LanguageCtrl($scope, $translate, $route) {
  $scope.switch = function($lang) {
    // Switch to the given language
    $translate.use($lang);
    // Full page reload to apply all languages
    // This is necessary because of the one-time bindings used for performance reasons
    window.location.reload();
  };
}

function TimeTableCtrl($scope, $rootScope, $http, $timeout, lessonService, $window, $location, dataService, timetableData, autocompleteData, ngDialog) {
  // Get the personal schedule from the API
  $scope.weeks = lessonService.getTimeTable(timetableData.data);

  // Get the title of the timetable and filter some words out of it

  $scope.tableTitle = lessonService.getTitle(timetableData.title);

  $scope.currentTime = moment();

  // List of the breaks and the duration. The first break is after the second hour and is 20 minutes.
  $scope.hourBreaks = [0, 0, 20, 0, 0, 0, 0, 10, 0, 0, 15, 0, 20, 0, 0];
  // Fontys starts at 8.45
  $scope.dayStartTime = moment().hour(8).minute(45).second(0);
  // And ends at 21.40
  $scope.dayEndTime = moment().hour(21).minute(40).second(0);

  // Set the default used weeknumber (without leading zero). In the weekend, use the next week number
  $scope.weekNumberUsed = parseInt(($scope.currentTime.day() === 0 || $scope.currentTime.day() === 6) ? $scope.currentTime.add(1, 'w').format('w') : $scope.currentTime.format('w'));
  // Set the default used year number
  $scope.yearUsed = parseInt($scope.currentTime.format('YYYY'));

  $scope.weekNumber = function() {
    var weekInfo = {};

    // Set default weeknumber. In the weekend, use the next week number
    weekInfo.current = parseInt(($scope.currentTime.day() === 0 || $scope.currentTime.day() === 6) ? moment().add(1, 'w').format('w') : $scope.currentTime.format('w'));
    weekInfo.use = $scope.weekNumberUsed;
    // Set default year
    weekInfo.yearCurrent = parseInt($scope.currentTime.format('YYYY'));
    weekInfo.yearUse = $scope.yearUsed;

    // Rotate the number when the year has ended
    if (weekInfo.use === 53) {
      weekInfo.use = 1;
      weekInfo.yearUse = weekInfo.yearCurrent + 1;
    }
    if (weekInfo.use === 0) {
      weekInfo.use = 52;
      weekInfo.yearUse = weekInfo.yearCurrent;
    }

    $scope.weekNumberUsed = weekInfo.use;
    $scope.yearUsed = weekInfo.yearUse;

    return weekInfo;
  };

  $scope.nextWeek = function() {
    // Add 1 to the weeknumber in use
    $scope.weekNumberUsed++;
    console.log('To the next week! ' + $scope.weekNumberUsed + ' year:' + $scope.yearUsed);
  };

  $scope.currentWeek = function() {
    // Reset to the current week
    $scope.weekNumberUsed = $scope.weekNumber().current;
    $scope.yearUsed = $scope.weekNumber().yearCurrent;
    console.log('To the current week! ' + $scope.weekNumberUsed + ' year:' + $scope.yearUsed);
  };

  $scope.previousWeek = function() {
    if (!$scope.isOldWeek()) {
      // Subtract 1 from the weeknumber in use
      $scope.weekNumberUsed--;
      console.log('To the previous week! ' + $scope.weekNumberUsed + ' year:' + $scope.yearUsed);
    }
  };

  // Bind keybindings to the window to enable right and left arrow navigation
  angular.element($window).on('keydown', function(e) {
    // Go to the next week on right arrow key
    if (e.keyCode === 39) {
      $scope.$apply(function() {
        $scope.nextWeek();
      });
    }
    // Go to the previous week on left arrow key
    if (e.keyCode === 37) {
      $scope.$apply(function() {
        $scope.previousWeek();
      });
    }
  });

  // Calculate the date of the current day
  $scope.currentDayDate = function(dayNumber) {
    return moment($scope.weekNumber().yearUse + '-' + $scope.weekNumber().use + '-' + dayNumber, 'YYYY-w-d');
  };

  $scope.countLessons = function(day) {
    var totalLessons = 0;

    day.forEach(function(hour) {
      var hourCount = parseInt(hour.lessons.length);
      totalLessons = totalLessons + hourCount;
    });

    return totalLessons;
  };

  // Check if the current day is today
  $scope.isActiveDay = function(dayNumber) {
    if ($scope.currentTime.isSame($scope.currentDayDate(dayNumber), 'day')) {
      return true;
    }
  };

  // Check if the used week is older then or the same as the current week
  $scope.isOldWeek = function() {
    if ($scope.weekNumberUsed <= $scope.weekNumber().current && $scope.yearUsed === $scope.weekNumber().yearCurrent) {
      return true;
    }
    return false;
  };

  // Add the resulting array in the global scope for the autocomplete plugin to use it
  $scope.searchAuto = autocompleteData;

  // Fired when a search suggestion is selected
  $scope.searchSelected = function(selected) {
    if (selected !== undefined) {
      var title = $rootScope.encode(selected.originalObject.name);
      var category = selected.originalObject.category;

      // Check which category is selected (room or class) to update the url
      console.log('Autocomplete ' + category + ' ' + title);
      $location.path('/search/' + category + '/' + title);
    }
  };

  $scope.teacherDialog = function(teacherAbr) {
    // When the API data is loaded, open the dialog
    dataService.getTeacher(teacherAbr).then(function(payload) {
      var data = payload.data;

      ngDialog.open({
        template: 'partials/dialog-teacher.html',
        data: data
      });
    });
  };

  $scope.calculateLine = function() {
    var now = moment();
    var percentageComplete = (now - $scope.dayStartTime) / ($scope.dayEndTime - $scope.dayStartTime) * 100;
    var percentageRounded = (Math.round(percentageComplete * 100) / 100);

    return percentageRounded + '%';
  };

  window.setInterval($scope.calculateLine, 60000); // Refresh every minute

  $scope.showSearchFormFunc = function() {
    if (!$scope.searchFormFocused) {
      $scope.showSearchForm = !$scope.showSearchForm;

      if ($scope.showSearchForm === true) {
        $timeout(function() {
          var searchInput = document.getElementById('search-query_value');
          searchInput.focus();
        }, 0);
      }
    }
    $scope.searchFormFocused = false;
  };

  $scope.searchFormFocusOut = function() {
    $scope.showSearchForm = false;

    // If the form was hidden because of a focus out event, the showSearchFormFunc needs to know this
    $scope.searchFormFocused = true;
  };

}

// Holidays dialog
function HolidaysCtrl($scope, holidayService) {
  // Load the holiday JSON and insert it in the scope
  holidayService.getHolidays().then(function(payload) {
    $scope.holidays = payload;
  });

}

// Holidays dialog
function RoomsCtrl($scope, roomService) {
  // Load all the rooms with occupied information if it isn't sunday (API gives an error on sundays)
  var isSunday = moment().day() === 0;

  if (!isSunday) {
    roomService.getFreeRooms().then(function(payload) {
      $scope.rooms = payload;
    });
  }

}

// Colors controllers
function ColorsCtrl($scope, colorService, lessonService) {
  colorService.getSubjects().then(function(payload) {
    $scope.subjects = payload.data;
  });

  $scope.setColor = function(name) {
    return lessonService.generateColor(name);
  };

}