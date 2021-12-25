//var player =  iframe.getElementById('player');

//player.mute();

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);


    n =  new Date();
    y = n.getFullYear();
    m = n.getMonth();
    d = n.getDate();
    var monthArr = ["January", "February","March", "April", "May", "June", "July", "August", "September", "October", "November","December"];
    m = monthArr[m];
    document.getElementById("date").innerHTML = m + " - " + d + " - " + y;

  }
  function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
  }

// function todaydate() {
//     var date = moment.utc("2016-09-19", "YYYY-MM-DD");
//     date.add(1, 'month'); // date operations follow date-math logic
//     var s = date.format("YYYY-MM-DD");
    
//     var dt = new Date();
//     document.getElementById("datetime").innerHTML = dt.toLocaleDateString();

//   }

// function tdate(){
//   var d = new Date();
//   document.getElementById("demo").innerHTML = d.getMonth() + 1;

// }