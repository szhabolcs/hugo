$(document).ready(function(){
    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    var vibrationPattern = [];
    var plays = 0;

    //Check if id parameter exists
    if(id == null){
        $("body").addClass("grid h-screen grid-cols-1 content-center");
        $("#content").html(`
            <h1 class="font-header text-5xl text-center">No hug found</h1>
            <button id="new-hug-btn" class="btn back-btn mx-auto mt-10 bg-secondary text-primary text-lg" onclick='window.open("https:\/\/hugo-ptrq2.ondigitalocean.app\/send","_self");'>But you can send a new one!</button>
        `);
    }
    else{
        fetchPattern();
    }

    async function fetchPattern(){
        var settings = {
            "url": `https://hugo-ptrq2.ondigitalocean.app/api/${id}`,
            "method": "GET"
          };
          
        await $.ajax(settings).done(function (response) {
            if(!response.hasOwnProperty("error")){
                $("#sender-name").text(response.name);
                vibrationPattern = response.pattern["pattern"];
                plays = response.plays;
                $("#plays-left").text(`${3-plays} plays left`);
            }
            else{
                $("body").addClass("grid h-screen grid-cols-1 content-center");
                $("#content").html(`
                    <h1 class="font-header text-5xl text-center">No hug found</h1>
                    <button id="new-hug-btn" class="btn back-btn mx-auto mt-10 bg-secondary text-primary text-lg" onclick='window.open("https:\/\/hugo-ptrq2.ondigitalocean.app\/send","_self");'>But you can send a new one!</button>
                `);
            }
        });
    }

    //Helper function for runSequence
    const delay = ms => new Promise(resolve => {setTimeout(resolve, ms)});

    /**
     * Executes the vibration sequence
     * @param {object} sequence the sequence to vibrate
     */
    async function runSequence(sequence) {
        $("#timer span").text("1");
        $("#timer").removeClass("hidden");
        $("#timer span").addClass("animate-ping").removeClass("hidden");
        await delay(980);
        $("#timer span").text("2");
        await delay(980);
        $("#timer span").text("3");
        await delay(1000);
        $("#timer span").removeClass("animate-ping").addClass("hidden");
    

        for (const item of sequence) {
            if(item.type == 1){
                window.navigator.vibrate(200*item.number);
            }
            await delay(200*item.number);
        }
        $("#timer").addClass("hidden");
    }

    /**
     * Creates and starts the vibration sequence
     */
    async function play(){
        var settings = {
            "url": `https://hugo-ptrq2.ondigitalocean.app/api/${id}`,
            "method": "POST"
          };
        
        if(plays != 3){
            await $.ajax(settings).done(function (response) {
                plays = response.plays;
                $("#plays-left").text(plays == 3 ? "You can't play the hug anymore." : 3-plays + " plays left");
                if(plays == 3) {
                    $("#play-hug").html(`Send a new hug <img class="inline-block ml-2" src="../img/heart-icon.svg" alt="heart icon">`);
                    $("#new-hug-btn").remove();
                }
            });
            runSequence(vibrationPattern);
        }
        else if(plays == 3){
            window.open("https://hugo-ptrq2.ondigitalocean.app/send","_self");
        }
    }

    //Listeners
    $("body").on("click","#play-hug", play);
});