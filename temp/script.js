// Work Day Scheduler js

//Set vars

//Dom Vars
var currentDayElement = $('#currentDay');
var formElement = $('#event-form');

//Global vars
var schdeduleHours = {
    start : 8,
    end : 17
}


//Listeners
formElement.on('click', 'button', handleBtnClick);


//Event handlers
// Schedule entry button click
function handleBtnClick (event) {
    event.preventDefault();
    var btnHour = event.target.value;

    saveSchedule(btnHour);
}

//Functions

//Set day display
function updateDay() {
    var rightNow = moment().format('dddd, MMMM Do');
    currentDayElement.text(rightNow);
}

//Set up schedule display
function scheduleSetup() {

    //Ensure form inner html is cleared
    formElement.empty();

    //Loop through schedule set hours
    for (var scheduleHour = schdeduleHours["start"]; scheduleHour <= schdeduleHours["end"]; scheduleHour++) {
        
        //create row element
        var scheduleRowElement = $("<div>").addClass("row");

        //Create hour column and set hour text
        if (scheduleHour > 0 && scheduleHour < 12){
            var hourColElement = $("<div>").text(scheduleHour + " AM");
        } else if (scheduleHour === 12) {
            var hourColElement = $("<div>").text("12 PM");
        } else if (scheduleHour != 24) {
            var hourColElement = $("<div>").text(scheduleHour - 12 + " PM");
        } else {
            var hourColElement = $("<div>").text("12 AM");
        }
        hourColElement.addClass("col-2 col-md-1 hour");

        //Create text column
        var descColElement = $("<div>").addClass("col-9 col-md-10 p-0");
        //Set schedule backcolour based on past, present or future
        if (scheduleHour === parseInt(moment().format("k"))) {
            descColElement.addClass("present");
        } else if (scheduleHour < parseInt(moment().format("k"))) {
            descColElement.addClass("past");
        } else {
            descColElement.addClass("future");
        }
        //Set the textarea element
        var descTextElement = $("<textarea>").addClass("form-control h-100 w-100 textarea").attr({
            "name" : "event",
            "id" : "hour-" + scheduleHour
        });

        //Create button column and button element and set button id
        var btnColElement = $("<div>").addClass("col-1 saveBtn");
        var btmElement = $("<button>").addClass("fas fa-save").attr({
            "type" : "submit",
            "value" : scheduleHour
        });

        //Put it all together and append to form element
        descColElement.append(descTextElement);
        btnColElement.append(btmElement);

        scheduleRowElement.append(hourColElement, descColElement, btnColElement);
        formElement.append(scheduleRowElement);
    }
}

//Get the local storage schedule and populate display
function loadSavedSchedule() {
    //Get the saved schedule if there is one in local storage
    var savedSchedule = JSON.parse(localStorage.getItem("myschedule"));

    //Check schedule returned and display
    if (savedSchedule != "" && savedSchedule != null && Object.keys(savedSchedule).length > 0) {

        for (var scheduleHour in savedSchedule) {
            if (Object.hasOwnProperty.call(savedSchedule, scheduleHour)) {
                var scheduleEvent = savedSchedule[scheduleHour];
                if (scheduleHour >= schdeduleHours["start"] && scheduleHour <= schdeduleHours["end"]) {
                    $('#hour-' + scheduleHour).text(scheduleEvent);

                }else{
                //event not within set schedule hours - to handle if needed in future

                }
            }
        }

    } else {
       //No events to display so alert user 
        alert("There are no saved events in the schedule for today.")
    }
}

//Add or update schedule entry. Save to local storage.
function saveSchedule(scheduleHour) {

    var savedSchedule = JSON.parse(localStorage.getItem("myschedule"));
    var scheduledEvent;

  //Check if stored schedule is set. If not initialise object first.
    if (savedSchedule === null) {
        var savedSchedule = {};
    }

    if (scheduleHour != "") {

        //Get schedule entry text
        scheduledEvent = $('#hour-' + scheduleHour)[0].value;

        //Check if empty
        if (scheduledEvent === "") {
            //If event empty, remove from schedule object if exists
            if (scheduleHour in savedSchedule){
                delete savedSchedule[scheduleHour];
            }
        } else {
            //Add to or update schedule object
            savedSchedule[scheduleHour] = scheduledEvent;
        }

        // set new entry to local storage. Remove existing entry first.
        localStorage.removeItem("myschedule");
        localStorage.setItem("myschedule", JSON.stringify(savedSchedule));
    }

}

function init () {
    //Set day display
    updateDay();
    //Render the schedule display
    scheduleSetup();
    //Load in stored events
    loadSavedSchedule();
}

//Kick of init function when page loaded
$(function ( ) {
    init();
});