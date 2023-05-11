function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log("fired injectHTML");
  const target = document.querySelector("#polling_list");
  target.innerHTML = "";
  list.forEach((item) => {
    const str = `<li>${item.name}</li>`;
    target.innerHTML += str;
  });
}

function filterList(list, query) {
  return list.filter((item) => {
    const lowerCaseName = item.name.toLowerCase();
    const lowerCaseQuery = query.toLowerCase();
    return lowerCaseName.includes(lowerCaseQuery);
  });
}

function cutPollingPlaceList(list) {
  console.log("fired cut list");
  const range = [...Array(20).keys()];
  return (newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length - 1);
    return list[index];
  }));
}

function initMap(){
  const carto = L.map('map').setView([38.80, -76.90], 13);// PG County
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(carto);
  return carto;
}

function markerPlace(array, map){
  console.log('array for markers', array);

  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  array.forEach((item) => {
    console.log('markerPlace', item);
    const {coordinates} = item.the_geom;
    L.marker([coordinates[1], coordinates[0]]).addTo(map);
  })
}


async function mainEvent() {
  const mainForm = document.querySelector(".main_form");
  const loadDataButton = document.querySelector("#data_load");
  const clearDataButton = document.querySelector("#data_clear");
  const generateListButton = document.querySelector("#generate");
  const textField = document.querySelector("#place");

  const loadAnimation = document.querySelector("#load_animation");
  loadAnimation.style.display = "none";
  generateListButton.classList.add("hidden");

  const carto = initMap();

  const storedData = localStorage.getItem('storedData');
  let parsedData = JSON.parse(storedData);
 
  if (parsedData?.length > 0) {
    generateListButton.classList.remove("hidden"); 
  }

  let currentList = [];

  loadDataButton.addEventListener("click", async (submitEvent) => {
    console.log("loading data");
    loadAnimation.style.display = "inline-block";
    // Basic GET request
    const results = await fetch(
      "https://data.princegeorgescountymd.gov/resource/2v6d-7p4w.json"
    );

    const storedList = await results.json();
    localStorage.setItem('storedData', JSON.stringify(storedList));
    parsedData = storedList;
    
    if (parsedData?.length > 0) {
      generateListButton.classList.remove("hidden"); 
    }

    loadAnimation.style.display = "none";
    //console.table(storedList);
  });

  generateListButton.addEventListener("click", (event) => {
    console.log("generate new list");

    currentList = cutPollingPlaceList(parsedData);
    console.log(currentList);
    injectHTML(currentList);
    markerPlace(currentList, carto);
  });

  textField.addEventListener("input", (event) => {
    console.log("input", event.target.value);
    const newList = filterList(currentList, event.target.value);
    console.log(newList);
    injectHTML(newList);
    markerPlace(newList, carto);
  });

  clearDataButton.addEventListener("click", (event) => {
    console.log('clear browser data');
    localStorage.clear();
    console.log('localStorage Check', localStorage.getItem("storedData"));
  })
}

document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests
