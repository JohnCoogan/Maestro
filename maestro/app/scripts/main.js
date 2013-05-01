
  function render_vexflow(element_id, data, render_options) {
    var element = document.getElementById(element_id);
    // Add the note.
    var json = new Vex.Flow.JSON(data);
    json.render(element, render_options);
  }

  function noteCtrl($scope) {
    $scope.customChord = '["C", "E", "G", "Bb"]';
    $scope.render = render_vexflow;
    $scope.redraw = function(element_id) {
      $scope.render(element_id, angular.fromJson($scope.customChord));
    }

    $scope.render('simple-chord', angular.fromJson($scope.customChord));
  }
