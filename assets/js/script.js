// Weather Pro JS

//DOM vars
var formElement = $("#search-form");
var cityCard = $("#city-card");

console.log(cityCard);


//Listeners
formElement.on('click', 'button', handleFormClick);


//Functions

function handleFormClick (event) {
    event.preventDefault();
    var optionValue = event.target.value;
    var searchString;

    if (optionValue != "" && optionValue != null && typeof optionValue === "string") {

        if (optionValue === "Search") {          
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
    console.log(searchString);

}


function init () {

}


$(function () {
    init()
});
