// Weather Pro JS

//OpenWeather API key
var APIKey = "5568aa3a7ef92d2e50a1823b6bba8d0d";

//DOM vars
var formElement = $("#search-form");
var cityCard = $("#city-card");
var weatherCards = $("#weather-cards");
var cityList = $("#city-list");
var uvi = $("#uvi");

//Other Global vars
var defaultCity = "sydney";
var canSave = false;

//Listeners
formElement.on('click', 'button', handleFormClick);


//Functions
//Form button click handler
function handleFormClick(event) {
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
            canSave = true;
            searchApi(toProperCase(searchString));
        }
    }
}

//API handler for openweather api. Can take a place name, or lat and lon data- note default http changed to https
function searchApi(searchString, mode = 0, lat = "", lon = "") {
    var queryURL;

    //Call basic api response which also provides lat and lon for selected city
    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchString + "&appid=" + APIKey;
    fetch(queryURL)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                //Capture API error and alert user
                alert("OpenWeather API error: " + response.statusText);
                console.log(response);
                return;
            }
        })
        .then(function (baseData) {
            if (mode != 1) {
                lon = baseData["coord"]["lon"];
                lat = baseData["coord"]["lat"];
            }
            //Call the one call API with filters to remove unused data. Metric units selected
            if (lon != "" && lon != undefined && lat != "" && lat != undefined) {
                queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=metric&appid=" + APIKey;
                fetch(queryURL)
                    .then(function (response) {
                        if (response.ok) {
                            return response.json();
                        } else {
                            //Capture API error and alert user
                            alert("OpenWeather API error: " + response.statusText);
                            console.log(response);
                            return;
                        }
                    })
                    .then(function (forecastData) {
                        console.log(forecastData);
                        //Render the weather details for selected city
                        renderWeather(searchString, forecastData);
                        //Save city in searches
                        saveCity(searchString);
                        //Render saved city list
                        renderCityList();
                    });

            } else {
                alert("Miising lon and/or lat data. Check search string and try again.");
            }
        });
};

function renderWeather(searchString, forecastData) {
    var uvIndex;
    //Render city card
    var iconHTML = '<img src="https://openweathermap.org/img/wn/' + forecastData["current"]["weather"][0]["icon"] + '@2x.png" alt="Weather icon" height="50px" width="auto">';
    cityCard.children().eq(0).html(searchString + " <span>" + moment((forecastData["current"]["dt"] * 1000)).format("ddd Do MMM YYYY") + "</span> " + iconHTML);
    cityCard.children().eq(1).html("Temp: " + forecastData["current"]["temp"] + "&#x2103;");
    cityCard.children().eq(2).text("Wind: " + forecastData["current"]["wind_speed"] + " km/h");
    cityCard.children().eq(3).text("Humidty: " + forecastData["current"]["humidity"] + " %");

    uvIndex = parseInt(forecastData["current"]["uvi"]);
    if (uvIndex < 5) {
        cityCard.children().eq(4).html('<p class="card-text">UV Index: <span class="badge bg-success uvi">' + forecastData["current"]["uvi"] + '</span></p>');
    } else if (uvIndex < 8) {
        cityCard.children().eq(4).html('<p class="card-text">UV Index: <span class="badge bg-warning uvi">' + forecastData["current"]["uvi"] + '</span></p>');
    } else {
        cityCard.children().eq(4).html('<p class="card-text">UV Index: <span class="badge bg-danger uvi">' + forecastData["current"]["uvi"] + '</span></p>');
    }

    //Render 5 day forecast'
    var date, iconHTML, temp, wind, humidity;
    var weatherCard, cardBody, cardTitle, cardIcon, cardTemp, cardWind, cardHum;

    //Remove any existing weather forecast cards
    weatherCards.empty();

    //Create dynamic HTML
    for (var i = 1; i < 6; i++) {
        date = moment((forecastData["daily"][i]["dt"] * 1000)).format("ddd Do MMMM");
        iconHTML = '<img src="https://openweathermap.org/img/wn/' + forecastData["daily"][i]["weather"][0]["icon"] + '@2x.png" alt="Weather icon" height="40px" width="auto">';
        temp = forecastData["daily"][i]["temp"]["day"];
        wind = forecastData["daily"][i]["wind_speed"];
        humidity = forecastData["daily"][i]["humidity"];

        weatherCard = $("<div>").addClass("card").attr("id", "card" + i);
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

    return true;
}

//Render city list on aside
function renderCityList() {
    var savedCities = JSON.parse(localStorage.getItem("weatherpro"));
    var btnElement;
    cityList.empty();

    if (savedCities != "" && savedCities != null && Object.keys(savedCities).length > 0) {
        var keys = Object.keys(savedCities);
        for (var i = keys.length - 1; i >= 0; i--) {
            btnElement = $("<button>").addClass("btn btn-secondary btn-block").attr("value", keys[i]);
            btnElement.text(toProperCase(keys[i]));
            cityList.append(btnElement);
        }
        btnElement = $("<button>").addClass("btn btn-warning btn-block").attr("value", "clear");
        btnElement.text("Clear List");
        cityList.append(btnElement);
    }

    return true;
}

//Save city to local storage. Don't save if no current storage and city is default city
function saveCity(city) {

    var savedCities = JSON.parse(localStorage.getItem("weatherpro"));

    if (city != "" && city != undefined && canSave === true) {

        city = city.toLowerCase();

        //Check if any stored cities. If not initialise object first.
        if (savedCities === null) {
            var savedCities = {};
            if (city != defaultCity.toLowerCase()) {
                savedCities[city] = "last";
            }
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

        canSave = false;
    }

    return true;
}

//Function to load last or default city when opening app
function loadCity(city) {
    var savedCities = JSON.parse(localStorage.getItem("weatherpro"));

    if (city === "" || city === undefined) {
        if (savedCities != "" && savedCities != null && Object.keys(savedCities).length > 0) {
            for (var key in savedCities) {
                if (Object.hasOwnProperty.call(savedCities, key)) {
                    if (savedCities[key] === "last") {
                        city = key;
                        city = toProperCase(city);
                        searchApi(city);
                        return true;
                    }
                }
            }
        } else {
            city = defaultCity;
            city = toProperCase(city);
            searchApi(city);
        }
    } else {
        city = toProperCase(city);
        searchApi(city);
    }
}

//Clear local storage
function clearCities() {

    if (confirm("Are you sure you wish to clear the list?")) {
        localStorage.removeItem("weatherpro");
        renderCityList();
    }

    return true;
}

//Helpers
//Converts string text to proper case
function toProperCase(str) {
    return str.replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
    });
}



function init() {
    //Load weather for last city searched. If none, do default city.
    loadCity();
    //Render the saved list of cities buttons
    renderCityList();
}

//Wait for page to load and then initiate
$(function () {
    init()
});
