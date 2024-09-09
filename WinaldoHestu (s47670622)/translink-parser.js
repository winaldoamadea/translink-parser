// Javascript Functional Programming Assignment
// Winaldo Amadea Hestu - s47670622


// Required Things
const fs = require("fs");
const prompt = require('prompt-sync')();
const { parse } = require("csv-parse");
const fetch = require('node-fetch');

/**
 * Checking whether the string is in HH:MM format or not
 *
 * @param {str} str the HH:MM that the user input
 * @return {bool} true/false
 */

function checkHHMM(str) {
    return !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(str);
}

/**
 * Gets the name of the day
 *
 * @param {str} date the date that the user input
 * @return {str} name of the day
 */

function getNameofDay(date) {
    let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date];
}

/**
 * Geting date from the User and making sure it is using YYYY-MM-DD format
 *
 * @return {str} date
 */

function getDate() {
    const date = prompt("What date will you depart UQ Lakes station by bus? " );

    // Check if it is a valid date
    if (!date.match("\\d{4}-\\d{2}-\\d{2}")){
        console.log("Incorrect date format. Please use YYYY-MM-DD");
        return getDate();
    }

    if (date.length != 10){
        console.log("Incorrect date format. Please use YYYY-MM-DD");
        return getDate();
    }
    const parseDate = Date.parse(date);

    if (isNaN(parseDate)){
        console.log("Incorrect date format. Please use YYYY-MM-DD");
        return getDate();
    }
    else{
        return date;
    }
}

/**
 * Getting Time from the User and making sure it is using HH:MM format
 *
 * @return {str} time
 */

function getTime(){
    let time = prompt("What time will you depart UQ Lakes station by bus? ");

    if (checkHHMM(time)){
        console.log("Incorrect time format. Please use HH:mm");
        return getTime();
    }
    else{
        return time;
    }
}


/**
 * Get the route input from the user
 * @return {str} theRoute
 */

function getRoute() {
    let route = prompt("What Bus Route would you like to take? ['Show All Routes', '66', '192', '169', '209', '29', 'P332', '139', '28'] ");
    let theRoute = "";

    if (route == '1') {
        theRoute = "Show All Route";
    }
    else if (route == '2') {
        theRoute = "66";
    }
    else if (route == '3') {
        theRoute = "192";
    }
    else if (route == '4') {
        theRoute = "169";
    }
    else if (route == '5') {
        theRoute = "209";
    }
    else if (route == '6') {
        theRoute = "29";
    }
    else if (route == '7') {
        theRoute = "P332";
    }
    else if (route == '8') {
        theRoute = "139";
    }
    else if (route == '9') {
        theRoute = "28";
    }
    else{
        console.log("Please enter a valid option for a bus route.")
        return getRoute();
    }

    return theRoute;
}

// source: https://stackoverflow.com/questions/46493889/nodejs-parsing-csv-and-returning-the-list-through-a-promise

/**
 * Read the CSV file and parse it
 *
 * @param {file} file that needed to be parsed
 * @return parsed data
 */

function readCSV(file) {
  return new Promise((resolve) => {
    fs.readFile(`static-data/${file}`,function (error, data) {

      if (error) {
        throw error;
      }
      parse(data, {columns: true}, function (error, parsedData) {
        
        if (error) {
          throw error;
        }
        resolve(parsedData);
      });
    });
  });
}


/**
 * Function to fetch the data and write it
 *
 */

async function tripUpdatesToJson() {
    const fetchTrip = await fetch("http://127.0.0.1:5343/gtfs/seq/trip_updates.json");
    const fetchVehicle = await fetch("http://127.0.0.1:5343/gtfs/seq/vehicle_positions.json");
    const tripUpdates = await fetchTrip.json();
    const vehicleUpdate = await fetchVehicle.json();
    
    // Write the cached-data into the corresponding file
    fs.writeFileSync('cached-data/trip_updates.json', JSON.stringify(tripUpdates),
        (err) => err && console.error(err));

    fs.writeFileSync('cached-data/vehicle_positions.json', JSON.stringify(vehicleUpdate), 
        (err) => err && console.error(err));    
        
}

/**
 * Function to read the cached-data
 * @return combined JSON.parse data
 */

async function readCache() {
    try {
        let tripUpdates = fs.readFileSync('cached-data/trip_updates.json', { encoding: 'utf8', flag: 'r' });
        let vehiclePosition = fs.readFileSync('cached-data/vehicle_positions.json', { encoding: 'utf8', flag: 'r' });
        let dataCombine = {
            trip: JSON.parse(tripUpdates)["entity"],
            vehicle: JSON.parse(vehiclePosition)["entity"],
            header: JSON.parse(tripUpdates)["header"]
        };
        return dataCombine;
    }
    catch(error) {
        return "";
    }
}

/**
 * Function for translink with the static-data
 *
 * @param {obj} calendarDatesData the calendar_dates.txt data
 * @param {obj} calendarData the calendar.txt data
 * @param {obj} routesData the routes.txt data
 * @param {obj} stopTimesData the stop_times.txt data
 * @param {obj} stopsData the stops.txt data
 * @param {obj} tripsData the trips.txt data
 * @return {obj} finalTrip static data
 */

async function transLink(calendarDatesData,calendarData,routesData,stopTimesData,stopsData,tripsData) {

    // Checking the day of the date
    const date = getDate();
    const dateObject = new Date(date);

    // Getting the day name 
    const day = dateObject.getDay() == 0 ? 7 : dateObject.getDay();
    const dayName = getNameofDay(day);

    // Getting the time
    const time = getTime();

    // Getting the route
    const routeTaken = getRoute();

    // Convert the date string to number
    const stringDate = date.replace(/-/g,'');
    const numberDate = Number(stringDate);

    // Convert the time string to number
    const stringTime = time.replace(/:/g,"");
    const numberTime = Number(stringTime);
    const hourTime = Number(stringTime.slice(0,2));
    const minuteTime = Number(stringTime.slice(2,4));
    

    // Filter the data to find the trips that available on that date and day
    const filteredTrips = calendarData.filter( 
        cal => cal[dayName] == 1 && Number(cal.start_date) <= numberDate && Number(cal.end_date) >= numberDate);

    // Filter the data according to calendar_dates.txt that has exception_type 2 (not available) on the corresponding date
    const removeException = filteredTrips.filter(
        trip => !calendarDatesData.some(
            cal => cal.service_id === trip.service_id && cal.date == numberDate && cal.exception_type == 2
        )
    ).map(trip => ({service_id : trip.service_id}));

    // Filter the data according to calendar_dates.txt that has exception_type 1 (available) on the corresponding date
    const addException = calendarDatesData
        .filter(cal => cal.date == numberDate && cal.exception_type == 1)
            .map(cal => ({
                service_id: cal.service_id,
    }));

    // Merge the data from removeException and addException
    const mergeArray  = Object.assign(removeException, addException);

    // Filter the route based on the user's input
    const routeList = (routeTaken == "Show All Route") ? routesData : routesData.filter(route => route.route_short_name == routeTaken);

    // Filter the route and trips using the route_id and then returning the trip_id, service_id, route_short_name, route_long_name, and headsign 
    // and also flatten the array using flat()
    const tripsList = routeList.map(route => {
        const filterTrips = tripsData.filter(trip => trip.route_id === route.route_id);
        return filterTrips.map(filterTrip => ({
            trip_id: filterTrip.trip_id,
            service_id: filterTrip.service_id,
            route_short_name: route.route_short_name,
            route_long_name: route.route_long_name,
            headsign : filterTrip.trip_headsign,
        }));
    }).flat();

    // Filter the tripsList and the mergeArray using service_id 
    const availableTrips = tripsList.filter(
        trip => mergeArray.some(
            merge => merge.service_id == trip.service_id));

    // Filtering the incomingRoutes that has less than 10 minutes arrival time / departure time.
    const incomingRoutes = stopTimesData.filter(
        stop =>  (Number(stop.arrival_time.slice(0,5).replace(/:/g,"") - numberTime) >= 0 && (Number(stop.arrival_time.slice(0,5).replace(/:/g,"") - numberTime )) <= 10) ||
        (Number(stop.arrival_time.slice(0,3).replace(/:/g,"")) - hourTime == 1 && (Number(stop.arrival_time.slice(3,5).replace(/:/g,"") - minuteTime )) + 60 <= 10));
    
    
    // Filtering the arrivingRoutes stop that stop in UQ Lakes and then flat the array
    const arrivingRoutes = stopsData.map(
        uq => incomingRoutes.filter(stop => uq.stop_id == stop.stop_id && uq.stop_name.includes("UQ Lakes")))
        .flat();

    // Filtering the availableTrips using the trip_id from arrivingRoutes and then returning 
    // the route_short_name, route_long_name, service_id, headsign, trip_id, arrival_time, and stop_id and then flatten the array.
    const finalTrip = arrivingRoutes.map(route => {
        const filterTrips = availableTrips.filter(trip => trip.trip_id == route.trip_id);
        return filterTrips.map(filterTrip => ({
            "Route Short Name": filterTrip.route_short_name,
            "Route Long Name": filterTrip.route_long_name,
            "Service ID": filterTrip.service_id,
            "Heading Sign" : filterTrip.headsign,
            trip_id: filterTrip.trip_id,
            "Scheduled Arrival Time": route.arrival_time,
            stop_id: route.stop_id,
        }));
    }
    ).flat();

    return finalTrip;
}

/**
 * Function to find the Scheduled Arrival Time and Live Arrival Time
 *
 * @param {obj} calendarDatesData the calendar_dates.txt data
 * @param {obj} calendarData the calendar.txt data
 * @param {obj} routesData the routes.txt data
 * @param {obj} stopTimesData the stop_times.txt data
 * @param {obj} stopsData the stops.txt data
 * @param {obj} tripsData the trips.txt data
 * @param {obj} tripUpdates the trip_updates.json data
 * printing the table data along with the live data
 */

async function program(calendarDatesData,calendarData,routesData,stopTimesData,stopsData,tripsData) {

    /**
    * Function to fetch the data again if the data has past 5 minutes 
    *
    * @return dataAllCached the cached data
    */
    async function cachedData(){
        let dataAllCached = await readCache();

        if (dataAllCached != ""){
            const unixTime = ((dataAllCached.header).timestamp) * 1000;
            const unixHeaderTime = new Date(unixTime);
            const minutesCached = unixHeaderTime.getUTCMinutes();
            const currentTime = Date.now();
            const currentMinute = new Date(currentTime).getMinutes();
        
            let  diffMins = Number(currentMinute) - Number(minutesCached);
            diffMins = (diffMins < 0 ) ? 60 + diffMins : diffMins ;
        
            if (diffMins > 5){
                await tripUpdatesToJson();
                dataAllCached = await readCache();
            }
        }
        else{
            await tripUpdatesToJson();
            dataAllCached = await readCache();
        } 

        return dataAllCached;
    }

    // Passing each objects to each const 
    const finalCached = await cachedData();
    const vehiclePosition = await finalCached.vehicle;
    const tripUpdates = await finalCached.trip;

    // Calling the transLink function and pass the return value into const staticData
    const staticData = await transLink(calendarDatesData,calendarData,routesData,stopTimesData,stopsData,tripsData);
    // Filtering the trip_id from the staticData and the cached_data and then find the delay time 
    staticData.forEach(
        veh => {
            const liveFilteredTrip = tripUpdates.find(vehs => ((((vehs.tripUpdate).trip).tripId)) == veh.trip_id);

            if (liveFilteredTrip){
                const liveArrivalTime = ((liveFilteredTrip.tripUpdate).stopTimeUpdate).find(stop => stop.stopId == veh.stop_id);

                if (liveArrivalTime){

                    if (liveArrivalTime.arrival){
                        const unixTime = ((liveArrivalTime.arrival).time) * 1000
                        const changeDate = new Date(unixTime)
                        const timezoneDate = changeDate.toLocaleString("en-AU", {timeZone: "Australia/Sydney",hour12: false});
                        veh["Live Arrival Time"] = timezoneDate.toString().slice(12,)

                    }
                    else{
                        const unixTime = ((liveArrivalTime.departure).time) * 1000
                        const changeDate = new Date(unixTime)
                        const timezoneDate = changeDate.toLocaleString("en-AU", {timeZone: "Australia/Sydney",hour12: false});
                        veh["Live Arrival Time"] = timezoneDate.toString().slice(12,)
                    }
                }
                else {
                    veh["Live Arrival Time"] = "No Live Data";
                }
            }
            else{
                veh["Live Arrival Time"] = "No Live Data";
            }
    });
    
    // Filtering the trip_id from the staticData and the cached_data and then find the live position
    staticData.forEach(
        veh => {
            const filteredPositionData = vehiclePosition.find(vehs => ((((vehs.vehicle).trip).tripId)) == veh.trip_id);

            if (filteredPositionData){
                veh["Live Position"] = (JSON.stringify(((filteredPositionData.vehicle).position))).replace(/{|}|"/g,'');
            }
            else{
                veh["Live Position"] = "No Live Data";
            }
        })

    // For each data in staticData that is already combined with live arrival and live position,
    // remove the stop_id, trip_id, and live_arrival
    staticData.forEach(trip => {
        delete trip.stop_id;
        delete trip.trip_id;
    });

    // Printing the data in table format
    console.table(staticData);

}

/**
 * Function to ask the user whether they are going to search again or not
 *
 * @return {str} answer again/done
 */

function repeatFunction() {
    const finishLine = prompt("Would you like to search again? ");

    if (finishLine == "y" || finishLine == "yes"){
        return "again";
    }
    if (finishLine == "n" || finishLine == "no"){
        return "done";
    }
    else{
        console.log("Please enter a valid option.");
        return repeatFunction();
    }
}

/**
 * Main Function
 * Main function to run all the codes and function above
 */

async function main(){
    
    console.log("Welcome to the UQ Lakes station bus tracker!");

    // Reading the static-data
    const calendarDatesData = await readCSV("calendar_dates.txt");
    const calendarData = await readCSV("calendar.txt");
    const routesData = await readCSV("routes.txt");
    const stopTimesData = await readCSV("stop_times.txt");
    const stopsData = await readCSV("stops.txt");
    const tripsData = await readCSV("trips.txt");

    // Calling the program function and asking for user's input whether to continue or no
    while (true) {
        await program(calendarDatesData,calendarData,routesData,stopTimesData,stopsData,tripsData);
        const answer = repeatFunction();

        // Calling the main function again if the answer is yes
        if (answer == "again"){
            continue
        }
        // Finish the program if the answer is no
        else{
            console.log("Thanks for using the UQ Lakes station bus tracker!");
            return;
        }
    }
}

main();