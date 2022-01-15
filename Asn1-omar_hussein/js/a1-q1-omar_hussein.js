/********************************************************************************** 
 * BTI325 – Assignment 1 
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students.
 * Name: Omar Hussein   Student ID: 118073204   Date: Sept 21, 2021 
 * ********************************************************************************/
const requests = {  
    "Toronto": 
        {
            "EN": "https://api.openweathermap.org/data/2.5/weather?q=Toronto&appid=f7b7c86c8d83af5ce929fe37a40aa052&units=metric",
            "FR": "https://api.openweathermap.org/data/2.5/weather?q=Toronto&appid=f7b7c86c8d83af5ce929fe37a40aa052&units=metric&lang=fr" 
        } ,
    "Oakville":
        {
            "EN": "https://api.openweathermap.org/data/2.5/weather?q=Oakville&appid=f7b7c86c8d83af5ce929fe37a40aa052&units=metric",
            "FR": "https://api.openweathermap.org/data/2.5/weather?q=Oakville&appid=f7b7c86c8d83af5ce929fe37a40aa052&units=metric&lang=fr" 
        } 
};

window.onload = setupHandlers();

function generateTable(city, desc_en, windSpeed, temp, desc_fr) { 
    let table = document.getElementById(city);
    let row = document.createElement("tr");
    row.innerHTML = "<td>" + desc_en + "</td><td>" + windSpeed + " m/s</td><td>" + temp + "&#176;C</td><td>" + desc_fr + "</td><td>" + Date().substr(0,24) + "</td>"; 
    table.appendChild(row);
    table.style.visibility = "visible";
}

function getJSONdata(url){
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}

function processInfo(city, urlEN, urlFR) {
    let api_JSONdataEN = getJSONdata(urlEN);
    let api_JSONdataFR = getJSONdata(urlFR);
    generateTable(city, api_JSONdataEN.weather[0].description, api_JSONdataEN.wind.speed, api_JSONdataEN.main.temp, api_JSONdataFR.weather[0].description);
    let x = document.querySelector(city == "toronto" ? "#t_btn" : "#o_btn");
    x.parentNode.removeChild(x);
}

function setupHandlers() {
    document.querySelector("#t_btn").addEventListener("click", () => processInfo("toronto", requests.Toronto.EN, requests.Toronto.FR));
    document.querySelector("#o_btn").addEventListener("click", () => processInfo("oakville", requests.Oakville.EN, requests.Oakville.FR));
    
    document.querySelector("#t_update").addEventListener("click", () => processInfo("toronto", requests.Toronto.EN, requests.Toronto.FR));
    document.querySelector("#o_update").addEventListener("click", () => processInfo("oakville", requests.Oakville.EN, requests.Oakville.FR));
}