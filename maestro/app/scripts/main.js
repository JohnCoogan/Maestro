
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
var fullNotes = [];
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
      resting = false,
      threshold = 0,
      startTime = new Date(),
      totalTime = 0,
      incTime = 0,
      noteAvail = true,
      currentNote = "b",
      previousNote = "a",
      noteLookup = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  this.init = function() {
    embedFlash();
    noteData = {clef: "treble",notes: [{ duration: "q", keys: ["C/4"] }]};
    render_vexflow('live-chord', noteData);
  };

  this.newData = function(audioJson) {
    var timeSince = new Date() - noteTime;
    noteTime = new Date();
    // console.log(timeSince);
    var audioData = JSON.parse(audioJson);
    if (audioData.note) {
      previousNote = currentNote;
      currentNote = audioData.name.slice(0,-1) + '/' + audioData.name.slice(-1);
      fullNotes.push(currentNote);

      if (previousNote != currentNote) {
        // console.log("New Note");
        // return;
      }

      audioData.vexflow = [currentNote];
      var lastNote = noteData.notes[noteData.notes.length-1];

      if (Math.abs(lastNote.keys[0].slice(-1) - audioData.name.slice(-1)) > 2 && !resting) {
        // console.log('Big Jump');
        // return;
      }

      if (lastNote.keys[0] != currentNote || resting) {
        resting = false;
        noteLength = 0;
        if (noteData.notes.length > 10) {
          noteData.notes.shift();
        };
        if (noteAvail) {
          noteData.notes.push({ duration: "q", keys: [currentNote] });
          render_vexflow('live-chord', noteData);
          noteAvail = false;
        };
      } else {
        noteLength += timeSince;
        var lastNote = noteData.notes[noteData.notes.length-1];
        // if (noteLength < eighthUpper) {
        //   lastNote.duration = "8";
        // } else 
        if (eighthUpper < noteLength < quarterUpper) {
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
      fullNotes.push("rest");
    };
    if (fullNotes.length % 23 == 0) {
      incTime = (new Date() - startTime) - totalTime;
      totalTime = new Date() - startTime;
      // console.log(incTime);
      // console.log(audioData);
      noteAvail = true;
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