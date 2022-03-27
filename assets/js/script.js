// Weather Pro JS

//OpenWeather API key
var APIKey = "5568aa3a7ef92d2e50a1823b6bba8d0d";

//DOM vars
var formElement = $("#search-form");
var cityCard = $("#city-card");
var weatherCards = $("#weather-cards");
var cityList = $("#city-list");

//Other Global vars
var defaultCity = "Sydney";


//Listeners
formElement.on('click', 'button', handleFormClick);


//Functions

function handleFormClick (event) {
    event.preventDefault();
    var optionValue = event.target.value;
    var searchString;

    if (optionValue != "" && optionValue != null && typeof optionValue === "string") {

        if (optionValue === "search") {          
            searchString = formElement[0][0].value;
       
        } else if (optionValue === "clear") {
            clearCities();
        } else {
            searchString = optionValue;
        }

        if (searchString != "" && searchString != null && typeof searchString === "string") {
            searchApi(toProperCase(searchString));
            //Save city in searches
            saveCity(searchString);
        }
    }
}

function searchApi(searchString) {
    var queryURL;
    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchString + "&appid=" + APIKey;
    fetch(queryURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (baseData) {
                queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + baseData["coord"]["lat"] + "&lon=" + baseData["coord"]["lon"] + "&exclude=minutely,hourly&units=metric&appid=" + APIKey;
                fetch(queryURL).then(function (response) {
                    if (response.ok) {
                        response.json().then(function (forecastData) {

                        renderWeather(searchString, forecastData);

                        renderCityList();

                        });
                    }else{
                        alert("OpenWeather API error: " + response.statusText);
                        console.log(response);
                        return;
                    }
                });
            });
        }else{
            alert("OpenWeather API error: " + response.statusText);
            console.log(response);
            return;
        }
    });
}

function renderWeather(searchString, forecastData) {
    console.log(weatherCards);

    //Render city card
    var iconHTML = '<img src="https://openweathermap.org/img/wn/' + forecastData["current"]["weather"][0]["icon"] + '@2x.png" alt="Weather icon" height="50px" width="auto">';
    cityCard.children().eq(0).html(searchString + " <span>" + moment((forecastData["current"]["dt"]*1000)).format("ddd Do MMM YYYY") + "</span> " +  iconHTML); 
    cityCard.children().eq(1).html("Temp: " + forecastData["current"]["temp"] + "&#x2103;");
    cityCard.children().eq(2).text("Wind: " + forecastData["current"]["wind_speed"] + " km/h");
    cityCard.children().eq(3).text("Humidty: " + forecastData["current"]["humidity"] + " %");
    cityCard.children().eq(4).text("UV Index: " +forecastData["current"]["uvi"]);

    //Render 5 day forecast'
    var date;
    var temp;
    var wind;
    var humidity;
    var weatherCard;

    //Remove any existing weather forecast cards
    weatherCards.empty();

    for (var i = 1; i < 6; i++) {
        date = moment((forecastData["daily"][i]["dt"]*1000)).format("ddd Do MMMM");
        iconHTML = '<img src="https://openweathermap.org/img/wn/' + forecastData["daily"][i]["weather"][0]["icon"] + '@2x.png" alt="Weather icon" height="40px" width="auto">';
        temp = forecastData["daily"][i]["temp"]["day"];
        wind = forecastData["daily"][i]["wind_speed"];
        humidity =  forecastData["daily"][i]["humidity"];

        weatherCard = $("<div>").addClass("card").attr("id","card" + i);
        cardBody = $("<div>").addClass("card-body weather-card");
        cardTitle = $("<h6>").addClass("card-title").text(date);
        cardIcon = $("<i>").html(iconHTML);
        cardTemp = $("<p>").addClass("card-text").html("Temp: " + temp + "&#x2103;");
        cardWind = $("<p>").addClass("card-text").text("Wind: " + wind + "km/h"),
        cardHum = $("<p>").addClass("card-text").text("Humidity: " + humidity + "%")

        cardBody.append(cardTitle, cardIcon, cardTemp, cardWind, cardHum);
        weatherCard.append(cardBody);
        weatherCards.append(weatherCard);
    }
}

function renderCityList() {
    var savedCities = JSON.parse(localStorage.getItem("weatherpro"));
    var btnElement;
    cityList.empty();

    if (savedCities != "" && savedCities != null && Object.keys(savedCities).length > 0) {
        var keys = Object.keys(savedCities);
        for (var i = keys.length-1; i >= 0; i--) {
            btnElement = $("<button>").addClass("btn btn-secondary btn-block").attr("value",keys[i]);
            btnElement.text(toProperCase(keys[i]));
            cityList.append(btnElement);
        }
        btnElement = $("<button>").addClass("btn btn-warning btn-block").attr("value","clear");
        btnElement.text("Clear List");
        cityList.append(btnElement);
    }
}

function saveCity(city) {

    var savedCities = JSON.parse(localStorage.getItem("weatherpro"));

    if (city != "" || city != undefined) {

        city = city.toLowerCase();

        //Check if any stored cities. If not initialise object first.
        if (savedCities === null) {
            var savedCities = {};
            savedCities[city] = "last";
        } else {
            savedCities[city] = "last";
        }

        for (const key in savedCities) {
            if (Object.hasOwnProperty.call(savedCities, key) && key != city) {
                savedCities[key] = "";
            }
        }

        // set new entry to local storage 
        localStorage.setItem("weatherpro", JSON.stringify(savedCities));
    }
}

function loadCity(city) {
    var savedCities = JSON.parse(localStorage.getItem("weatherpro"));

    if (city === "" || city === undefined) {
        if (savedCities != "" && savedCities != null && Object.keys(savedCities).length > 0) {
            for (var key in savedCities) {
                if (Object.hasOwnProperty.call(savedCities, key)) {
                    if (savedCities[key] === "last"){
                        city = key;
                    }
                }
            }
        } else {
            city = defaultCity;
        }
    }
    city = toProperCase(city);
    searchApi(city);
}

function clearCities() {

    if(confirm("Are you sure you wish to clear the list?")) {
        localStorage.removeItem("weatherpro");
        renderCityList();
    }
}

//Helpers
//Converts string text to proper case
function toProperCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

function init () {
    //Load weather for last city searched. If none, do default city.
    loadCity();
    //Render the saved list of cities buttons
    renderCityList();
}

//Wait for page to load and then initiate
$(function () {
    init()
});
