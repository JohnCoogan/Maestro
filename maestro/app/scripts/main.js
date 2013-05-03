
function render_vexflow(element_id, data, render_options) {
  var element = document.getElementById(element_id);
  // Add the note.
  var json = new Vex.Flow.JSON(data);
  json.render(element, render_options);
}

function noteCtrl($scope) {
  $scope.customChord = '["C", "E", "G", "Bb"]';
  $scope.customList = '[["C"], ["D"], ["E"], ["F"], ["G"]]';
  $scope.render = render_vexflow;
  $scope.redraw = function(element_id) {
    $scope.render(element_id, angular.fromJson($scope.customChord));
  }
  $scope.redrawList = function(element_id) {
    $scope.render(element_id, angular.fromJson($scope.customList));
  }

  $scope.render('simple-chord', angular.fromJson($scope.customChord));
  $scope.render('simple-list-of-notes', angular.fromJson($scope.customList));
}

var MAESTRO = MAESTRO || {};
var noteData = {};
MAESTRO.MusicApp = new function() {
  var LoadedApp = false,
      noteTime = new Date(),
      noteLength = 0,
      noteArray = [],
      bpm = 120,
      msPerBeat = 60000/bpm, // 500 ms at 120 bpm
      eighth = msPerBeat / 2,
      quarter = msPerBeat,
      half = msPerBeat * 2,
      whole = msPerBeat * 4;
      eighthUpper = (eighth + quarter) / 2,
      quarterUpper = (quarter + half) / 2,
      halfUpper = (half + whole) / 2,
      wholeUpper = whole * 1.5,
      resting = false;

  this.init = function() {
    embedFlash();
    noteData = {clef: "treble",notes: [{ duration: "q", keys: ["C/4"] }]};
    render_vexflow('live-chord', noteData);
  };

  // if (!LoadedApp) {
  //   $('#flashcontent').css('height', '0px');
  //   LoadedApp = true;
  // };

  this.newData = function(audioJson) {
    var audioData = JSON.parse(audioJson);
    if (audioData.note) {
      var timeSince = new Date() - noteTime;
      noteTime = new Date();
      audioData.vexflow = [audioData.name.slice(0,-1) + '/' + audioData.name.slice(-1)];
      var lastNote = noteData.notes[noteData.notes.length-1];
      if (Math.abs(lastNote.keys[0].slice(-1) - audioData.name.slice(-1)) > 1 && !resting) {
        console.log('Big Jump');
      }
      if (lastNote.keys[0] != audioData.vexflow[0] || resting) {
        resting = false;
        noteLength = 0;
        if (noteData.notes.length > 10) {
          noteData.notes.shift();
        };
        noteData.notes.push({ duration: "8", keys: audioData.vexflow });
        render_vexflow('live-chord', noteData);
      } else {
        noteLength += timeSince;
        var lastNote = noteData.notes[noteData.notes.length-1];
        if (noteLength < eighthUpper) {
          lastNote.duration = "8";
        } else if (noteLength < quarterUpper) {
          lastNote.duration = "q";
        } else if (noteLength < halfUpper) {
          lastNote.duration = "h";
        } else if (noteLength < wholeUpper) {
          lastNote.duration = "w";
        } else {
          return;
        };
        render_vexflow('live-chord', noteData);
      };
    } else {
      resting = true;
    };
  };

  function embedFlash() {
    swfobject.embedSWF("swf/Main.swf", "flashcontent", "330", "200", "10.2.0", "swf/expressInstall.swf", null, {allowScriptAccess:"always",wmode:"transparent",width:"330",height:"200"}, null, embedded);
  };

  function embedded(e) {
    if(!e.success) {
      console.log("ERROR");
    }
  };
};

$(document).ready(function(){  
  if(Modernizr.webgl) {
    MAESTRO.MusicApp.init();
  }
});