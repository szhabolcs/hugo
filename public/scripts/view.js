$(document).ready(function(){
    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    var pattern = [];
    var plays = 0;

    //create a synth and connect it to the main output
    const notes = ["C4", "E4", "G4", "C5"];
    const sampler = new Tone.Sampler({
        urls: {
            A0: "A0.mp3",
            C1: "C1.mp3",
            "D#1": "Ds1.mp3",
            "F#1": "Fs1.mp3",
            A1: "A1.mp3",
            C2: "C2.mp3",
            "D#2": "Ds2.mp3",
            "F#2": "Fs2.mp3",
            A2: "A2.mp3",
            C3: "C3.mp3",
            "D#3": "Ds3.mp3",
            "F#3": "Fs3.mp3",
            A3: "A3.mp3",
            C4: "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            A4: "A4.mp3",
            C5: "C5.mp3",
            "D#5": "Ds5.mp3",
            "F#5": "Fs5.mp3",
            A5: "A5.mp3",
            C6: "C6.mp3",
            "D#6": "Ds6.mp3",
            "F#6": "Fs6.mp3",
            A6: "A6.mp3",
            C7: "C7.mp3",
            "D#7": "Ds7.mp3",
            "F#7": "Fs7.mp3",
            A7: "A7.mp3",
            C8: "C8.mp3"
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/"
    }).toDestination();

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
                pattern = response.pattern["pattern"];
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

    /**
     * Generates a playable pattern
     */
    function generatePattern(){
        let vibrationPattern = [
            {
                type: pattern[0],
                number: 0
            }
        ];

        let i = 0;

        for (const item of pattern) {
            if(item == vibrationPattern[i].type){
                vibrationPattern[i].number++;
            }
            else{
                i++;
                vibrationPattern[i] = {};
                (vibrationPattern[i-1].type == 0) ? vibrationPattern[i].type = 1 : vibrationPattern[i].type = 0;
                vibrationPattern[i].number = 1;
            }
        }

        return vibrationPattern;
    }

    //Helper function for runSequence
    const delay = ms => new Promise(resolve => {setTimeout(resolve, ms)});

        /**
     * Executes the vibration sequence
     */
    async function runSequence() {
        //check if sound is checked
        let sound = $("#sound-checkbox").is(":checked");

        $("#timer span").text("1");
        $("#timer").removeClass("hidden");
        $("#timer span").addClass("animate-ping").removeClass("hidden");
        await delay(980);
        $("#timer span").text("2");
        await delay(980);
        $("#timer span").text("3");
        await delay(1000);
        $("#timer span").removeClass("animate-ping").addClass("hidden");

        if(sound){
            let currentPattern = [];
            let playedPattern = [];
            let iterateBy = pattern.length % 2 == 0 ? 4 : 3;

            for( let i = 0; i < pattern.length; i+=iterateBy){
                await delay(800);
                sampler.context.resume();

                currentPattern = pattern.slice(i,i+iterateBy);
                playedPattern = [];

                for(let j = 0; j < currentPattern.length; j++)
                    currentPattern[j] == 1 ? playedPattern.push(notes[j]) : null;

                sampler.triggerAttackRelease(playedPattern, 0.8);
            }
        }
        else{
            let sequence = generatePattern();
            for (const item of sequence) {
                if(item.type == 1){
                    window.navigator.vibrate(200*item.number);
                }
                await delay(200*item.number);
            }
        }
        await delay(800);
    $("#timer").addClass("hidden");
}

    /**
     * Creates and starts the vibration sequence
     */
    async function play(){
        let sound = $("#sound-checkbox").is(":checked");

        if(!window.navigator.vibrate && !sound){
            alert("Vibration is not supported on your device or browser. We are sorry for the inconvenience. Please play it with sound!");
            throw new Error("Vibration not supported.");
        }

        var settings = {
            "url": `https://hugo-ptrq2.ondigitalocean.app/api/${id}`,
            "method": "POST"
          };
        
        if(plays != 3){
            await $.ajax(settings).done(function (response) {
                plays = response.plays != undefined ? response.plays : 3;
                $("#plays-left").text(plays == 3 ? "You can't play the hug anymore." : 3-plays + " plays left");
                if(plays == 3) {
                    $("#play-hug").html(`Send a new hug <img class="inline-block ml-2" src="../img/heart-icon.svg" alt="heart icon">`);
                    $("#new-hug-btn").remove();
                }
            });
            runSequence();
        }
        else if(plays == 3){
            window.open("https://hugo-ptrq2.ondigitalocean.app/send","_self");
        }
    }

    //Listeners
    $("body").on("click","#play-hug", play);
});