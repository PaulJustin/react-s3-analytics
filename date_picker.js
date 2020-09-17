function dynamicallyLoadScript(url) {
    var script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script); 
}

function loadExternalScripts() {
  dynamicallyLoadScript("https://cdn.jsdelivr.net/jquery/latest/jquery.min.js");
  dynamicallyLoadScript("https://cdn.jsdelivr.net/momentjs/latest/moment.min.js");
  dynamicallyLoadScript("https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js");
  dynamicallyLoadScript("https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css");
}

/*
<script>
$(function() {
  $('input[name="datetimes"]').daterangepicker({
    timePicker: true,
    startDate: moment().startOf('hour'),
    endDate: moment().startOf('hour').add(32, 'hour'),
    locale: {
      format: 'MM/DD/YY hh:mm A'
    },
  });
});
</script>
*/

var setDate = function() {
  $('input[name="datetimes"]').daterangepicker({
    timePicker: true,
    startDate: moment().startOf('hour'),
    endDate: moment().startOf('hour').add(32, 'hour'),
    locale: {
      format: 'MM/DD/YY hh:mm A'
    },
  });
};

export function datePicker() {
  
  loadExternalScripts();


  console.log("date picker loaded");
};