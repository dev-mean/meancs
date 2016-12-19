function initContentScript() {
    
        var el = document.activeElement;
            var jugaldiv = document.createElement('div'); 
            var jugal = document.getElementById('jugal');
            jugaldiv.setAttribute('id','jugal');
            
            var firechatwrapperdiv = document.createElement('div'); 
            var firechatwrapper = document.getElementById('firechat-wrapper');
            firechatwrapperdiv.setAttribute('id','firechat-wrapper');
            firechatwrapperdiv.setAttribute("style", "display:none;");
            firechatwrapperdiv.innerHTML='<div class="chatbox" id="chatbox"><ul id="chatList" class="chat-list"></ul><input id="chatInput" type="text" class="chat-input" placeholder="Chat here..." maxlength="35" /></div><div id="startMenu"><input type="text" tabindex="0" autofocus placeholder="Enter your name here" id="userNameInput" maxlength="25" /><b class="input-error">Nick must be alphanumeric characters only!</b><br /><a><button id="startButton">Chat</button></a></div>';
            
            var imgURL = chrome.extension.getURL("images/Chat_icon36.png");
            jugaldiv.setAttribute("style", 'background-repeat: no-repeat;'
                        + 'width: 100px; '
                        + 'height: 100px; '
                        + 'position: fixed; '
                        + 'top: 70px; '
                        + 'left: 30px; '
                        + 'z-index: 99999999999999; '
                        + 'background-image: url("'+imgURL+'")');
                  
            if (jugal&&firechatwrapper) {}    // if div excist -> do nothing
            else {
                $( function() {
                    
                    $( "#jugal" ).draggable();
                    $( "#firechat-wrapper" ).draggable();
                        $( "#jugal" ).dblclick(function() {
                            $( "#firechat-wrapper" ).css({"display": "block"});
			     $( "#jugal" ).css({"display": "none"});
                        });
                    } );
                document.body.appendChild(jugaldiv);
                document.body.appendChild(firechatwrapperdiv);
                return false;
                }  // inject the dom code

}

initContentScript();