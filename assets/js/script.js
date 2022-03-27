// Weather Pro JS

//OpenWeather API key
var APIKey = "5568aa3a7ef92d2e50a1823b6bba8d0d";

//DOM vars
var formElement = $("#search-form");
var cityCard = $("#city-card");
var weatherCards = $("#weather-cards");

//Other Globa
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
       
        } else {
            searchString = optionValue;
        }

        if (searchString != "" && searchString != null && typeof searchString === "string") {
            searchApi(searchString);
        }
    }
}

function searchApi(searchString) {
    var queryURL;
    
    queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + searchString + "&appid=" + APIKey;
    fetch(queryURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (baseData) {
                queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + baseData["coord"]["lat"] + "&lon=" + baseData["coord"]["lon"] + "&exclude=minutely,hourly&units=metric&appid=" + APIKey;
                fetch(queryURL).then(function (response) {
                    if (response.ok) {
                        response.json().then(function (forecastData) {

                        renderWeather(searchString, forecastData);

                        //Save city in searches
                        saveCity();

                        });
                    }else{
                        alert("OpenWeather API error");
                        return;
                    }
                });
            });
        }else{
            alert("OpenWeather API error");
            return;
        }
    });
}

function renderWeather(searchString, forecastData) {
    console.log(weatherCards);

    //Render city card
    var iconHTML = '<img src="http://openweathermap.org/img/wn/' + forecastData["current"]["weather"][0]["icon"] + '@2x.png" alt="Weather icon" height="50px" width="auto">';
    cityCard.children()[0].innerHTML = searchString + " <span>" + moment((forecastData["current"]["dt"]*1000)).format("ddd Do MMM YYYY") + "</span> " +  iconHTML; 
    cityCard.children()[1].textContent = "Temp: " + forecastData["current"]["temp"];
    cityCard.children()[2].textContent = "Wind: " + forecastData["current"]["wind_speed"] + " kPH";
    cityCard.children()[3].textContent = "Humidty: " + forecastData["current"]["humidity"] + " %";
    cityCard.children()[4].textContent = "UV Index: " +forecastData["current"]["uvi"];

    //Render 5 day forecast'
    var date;
    var temp;
    var wind;
    var humidity;
    var html="";

    //Remove any existing weather forecast cards
    weatherCards.empty();

    for (var i = 1; i < 6; i++) {
        date = moment((forecastData["daily"][i]["dt"]*1000)).format("ddd Do MMMM");
        iconHTML = '<img src="http://openweathermap.org/img/wn/' + forecastData["daily"][i]["weather"][0]["icon"] + '@2x.png" alt="Weather icon" height="40px" width="auto">';
        temp = forecastData["daily"][i]["temp"]["day"];
        wind = forecastData["daily"][i]["wind_speed"];
        humidity =  forecastData["daily"][i]["humidity"];

        html = html + '<div class="card" id="card' + i + '"><div class="card-body weather-card"><h6 class="card-title">' + date + '</h6>'
        html = html + '<i>' + iconHTML + '</i>'
        html = html + '<p class="card-text">Temp: ' + temp + '</p><p class="card-text">Wind: ' + wind + ' kph</p><p class="card-text">Humidity: ' + humidity + '%</p></div></div>';
    }
    weatherCards.html(html);
}

function renderCityList() {
    
}

function saveCity() {


}

function loadCity(city) {

    var savedCities = JSON.parse(localStorage.getItem("weatherpro"));
    if (city === "" || city === undefined) {
        if (savedCities != "" && savedCities != null && Object.keys(savedCities).length > 0) {
            city = savedCities["last"];  
        } else {
            city = defaultCity;
        }
    }

    searchApi(city);

}

function init () {

    //Load weather for last city searched. If none, do default city.
    loadCity();

    renderCityList();

}


$(function () {
    init()
});
