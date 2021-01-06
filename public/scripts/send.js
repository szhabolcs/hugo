$(document).ready(function(){
    const PAUSE_HTML = `<button class="pattern-item pause"><img src="../img/pause-icon.svg" alt="pause icon"></button>`;
    const VIBRATE_HTML = `<button class="pattern-item vibrate"><img src="../img/vibration-icon.svg" alt="vibrate icon"></button>`;
    const PAUSE_ICON = `<img src="../img/pause-icon.svg" alt="pause icon">`;
    const VIBRATE_ICON = `<img src="../img/vibration-icon.svg" alt="vibrate icon">`;

    var patternDIV = $("#pattern");
    var view = "3";
    var pattern = [];
    var sender = "a dear someone";

    //Functions
    
    //Fills in the patternDIV with data on load
    changeView();

    /**
     * Applies the placeholder text to the span
     */
    $("#sender").focusout(function(){
        var element = $(this);        
        if (!element.text().replace(" ", "").length) {
            element.empty();
        }
    });

    /**
     * Changes the view between 4x4 and 3x3
     */
    function changeView(){
        patternDIV.empty();
        pattern = [];
        patternDIV.removeClass(`grid-cols-${view}`);
        $(this).children("span").text(`${view}x${view}`);

        if(view == "4"){
            if(!pattern.length){
                for(let i = 0; i < 9; i++){
                    pattern[i] = 0;
                    patternDIV.append($(PAUSE_HTML).attr("data-i",i));
                }
            }
            else
                for(let i = 0; i < 9; i++)
                    patternDIV.append($(PAUSE_HTML).attr("data-i",i));

            view = "3";
        }
        else{
            if(!pattern.length){
                for(let i = 0; i < 16; i++){
                    pattern[i] = 0;
                    patternDIV.append($(PAUSE_HTML).attr("data-i",i));
                }
            }
            else
                for(let i = 0; i < 16; i++)
                    patternDIV.append($(PAUSE_HTML).attr("data-i",i));

            view = "4";
        }

        patternDIV.addClass(`grid-cols-${view}`);
    }

    /**
     * Changes the type of a pattern item
     */
    function changeType(item){
        if(!(item.length == 1))
            item = item.currentTarget;

        let state = $(item).hasClass("pause") ? 1 : 0;
        
        if(state){
            $(item).removeClass("pause");
            $(item).addClass("vibrate");
            $(item).html(VIBRATE_ICON);
        }
        else{
            $(item).removeClass("vibrate");
            $(item).addClass("pause");
            $(item).html(PAUSE_ICON);
        }
        
        pattern[$(item).attr("data-i")] = state;
    }

    /**
     * Clears the pattern to it's original state
     */
    function clearPattern(){
        patternItems = $(".pattern-item");
        
        for (let item of patternItems) {
            if($(item).hasClass("vibrate")){
                changeType($(item));
            }
        }
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

    /**
     * Creates and starts the vibration sequence
     */
    function play(){
        vibrationPattern = generatePattern();
        runSequence(vibrationPattern);
    }

    //Helper function for runSequence
    const delay = ms => new Promise(resolve => {setTimeout(resolve, ms)});

    /**
     * Executes the vibration sequence
     * @param {object} sequence the sequence to vibrate
     */
    async function runSequence(sequence) {
        //Wait before execution
        if($("#preview-parent").css("display") == "grid"){
            $("#timer span").text("1");
            $("#timer").removeClass("hidden");
            $("#timer span").addClass("animate-ping").removeClass("hidden");
            await delay(980);
            $("#timer span").text("2");
            await delay(980);
            $("#timer span").text("3");
            await delay(1000);
            $("#timer span").removeClass("animate-ping").addClass("hidden");
        }

        for (const item of sequence) {
            if(item.type == 1){
                window.navigator.vibrate(200*item.number);
            }
            await delay(200*item.number);
        }
        $("#timer").addClass("hidden");
    }

    /**
     * Stops execution
     */
    function stop(){
        // Set a fake timeout to get the highest timeout id
        // This is a pretty hacky solution and doesn't work all the time, but it'll do for now
        var highestTimeoutId = setTimeout(";");
        for (var i = 0 ; i < highestTimeoutId ; i++) {
            clearTimeout(i); 
        }
    }

    /**
     * Executes the preview function
     */
    function preview(){
        $("#preview-parent").css("display","grid");
        if($.trim($("#load-preview").html())==''){
            $("#load-preview").load("../view/dummy.html",()=>{
                if(sender != ""){
                $("#sender-name").text(sender);
            }
            });
        }

        if(sender != "")
            $("#sender-name").text(sender);
    }

    /**
     * Closes the preview
     */
    function back(){
        $("#preview-parent").css("display","none");
        $("#link-parent").css("display","none");
    }

    /**
     * Sends the hug to the server
     */
    function send(){
        var settings = {
            "url": "https://hugo-ptrq2.ondigitalocean.app/api/",
            "method": "POST",
            "timeout": 0,
            "headers": {
              "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "pattern": generatePattern(),
                "name": sender.length == 0 ? "a dear someone" : sender
            }),
          };
          
        $.ajax(settings).done(function (response) {
            // id is response.id
            $("#link-parent").css("display","flex");

            $("#link").text(`https://hugo-ptrq2.ondigitalocean.app/view?id=${response.id}`);
    
            if (!navigator.share)
                $("#share-btn").text("Copy link");
        });
    }
    
    /**
     * Copies text to the clipboard
     * @param {String} text text to copy
     */
    function copyToClipboard(text) {
        var $temp = $("<input>").hide();
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }

    /**
     * Handles the url sharing
     */
    function share(){
        if (navigator.share) {
            navigator.share({
                title: "Sharing your hug",
                text: "",
                url: `https://hugo-ptrq2.ondigitalocean.app/view?id=${$("#link").text()}`
              });
        } else {
            copyToClipboard(`https://hugo-ptrq2.ondigitalocean.app/view?id=${$("#link").text()}`);
        }
    }
    
    /**
     * Changes the name in memory
     */
    function changeName(){
        sender = $(this).text();
    }

    //Listeners
    $("#view").click(changeView);
    $("#clear").click(clearPattern);
    $("#play").click(play);
    $("#stop").click(stop);
    $(".preview").click(preview);
    $(".back-btn").click(back);
    $("#send-btn").click(send);
    $("#share-btn").click(share);
    $("body").on("click","#play-hug", play);
    $('body').on('focus', '[contenteditable]', changeName).on('blur keyup paste input', '[contenteditable]', changeName);
    $("#pattern").on("click",".pattern-item",changeType);
});