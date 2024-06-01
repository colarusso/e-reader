document.addEventListener('DOMContentLoaded', () => {

    const collection_name = "Selected Works of Edgar Allan Poe"
    const text_arr = ["texts/Cover.txt","Contents","texts/The Purloined Letter.txt","texts/The Gold-Bug.txt","texts/About.txt"]

    window.onresize = function(){ location.reload(); }
    
    const content = document.getElementById('content');
    const fontType = document.getElementById('fontType');
    const fontSize = document.getElementById('fontSize');
    const lineHeight = document.getElementById('lineHeight');
    const textAlign = document.getElementById('textAlign');
    const darkMode = document.getElementById('darkMode');
    const progressPercentage = document.getElementById('progressPercentage');
    const timeRemaining = document.getElementById('timeRemaining');
    const controls = document.getElementById('controls');
    const settingsToggle = document.getElementById('settingsToggle');
    const infoToggle = document.getElementById('infoToggle');
    const titleElement = document.getElementById('title');
   
    const wordsPerMinute = 200; // Average reading speed
    let pages = [];
    let currentTitle = '';

    // Get title from URL
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('file') || localStorage.getItem('lastSelection') || "Contents";

    localStorage.setItem('lastSelection', title);

    const textFile = title//`${title}.txt`;
    
    // Display the title as a link
    //titleElement.innerText = title.charAt(0).toUpperCase() + title.slice(1);
    titleElement.innerText = title.split('/')[title.split('/').length-1].replace(/\.txt$/i,"")
    document.title = title.split('/')[title.split('/').length-1].replace(/\.txt$/i,"") + " | " + collection_name
    //if (title!="Contents") {
    //    titleElement.href = textFile;    
    //}

    // Check if the title has changed
    //if (localStorage.getItem('currentTitle') !== title) {
    //    localStorage.setItem('currentTitle', title);
    //    currentPage = 0;
    //    localStorage.setItem('currentPage', currentPage);
    //} else {
    //    currentPage = parseInt(localStorage.getItem('currentPage'), 10) || 0;
    //}
    //let currentPage = 0;
    let currentPage = parseInt(localStorage.getItem(`${title}-currentPage`), 10) || 0;
    let currentLength = parseInt(localStorage.getItem(`${title}-currentLength`), 10) || 1;
    localStorage.setItem('currentLength', currentLength);
    
    let currentProg = (urlParams.get('prog')) || currentPage/currentLength;
    if (currentProg>1){
        currentProg = 0.999999999999;
    }
    currentPage = Math.floor(currentLength*currentProg);
    //console.log(currentProg,currentLength,currentPage,Math.floor(currentLength*currentProg))

    // Load settings from local storage
    loadSettings();

    // Event listener for dark mode toggle
    darkMode.addEventListener('change', toggleDarkMode);

    var text = ""
    // Load the book content
    fetch(textFile)
    .then(response => {
        if (!response.ok) {  // Check if response is not OK (i.e., not status 200)
            throw new Error(`HTTP status ${response.status}`); // Throw an error with the status
        }
        return response.text(); // Proceed to extract the text only if status is 200
    })
    .then(text => {
        document.getElementById("text_container").value = text;
        pages = paginateText(text); // Dynamically paginate text
        displayPage(currentPage);
        //updateProgress();
    })
    .catch((error) => {
        console.log(error);
        if (titleElement.innerText!="Contents") {
            titleElement.innerText = "Contents"
            document.title = "Contents" + " | " + collection_name
            //titleElement.style.display = "none";
        }
        text = `<i>Tap to "turn" pages. Bookmark <a%20href=".">this </a><a%20href=".">page</a> to have this browser remember your place. Mobile users: add to your homescreen for best UX.</i>
        
        <center><b>~ Contents ~</b></center>`;

        for (const element of text_arr) { // You can use `let` instead of `const` if you like
            if (element!="Contents" && element!="texts/Cover.txt") {
                element_parts = element.split('/')[element.split('/').length-1].replace(/\.txt$/i,"").split(" ");
                text += `\n`;
                for (const part of element_parts) {
                    text += `<a%20href="?file=${element.replace(/\s/i,"%20")}"%20onClick="localStorage.setItem('${element.replace(/\s/g,"%20")}-currentPage',%200);">${part} </a>`;
                }
            }
        }

        document.getElementById("text_container").value = text;
        pages = paginateText(text); // Paginate the error message
        displayPage(currentPage);
        //updateProgress();
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newurl},'',newurl);    
    });

    //document.getElementById("information").innerHTML = "";
    for (const element of text_arr) { // You can use `let` instead of `const` if you like
        document.getElementById("information").innerHTML += `<button onclick="localStorage.setItem('${element}-currentPage', 0);window.location.href = '?file=${element}'" style="margin-bottom: 6px;">${element.split('/')[element.split('/').length-1].replace(/\.txt$/i,"")}</button>`
    }

    function saveSettings() {
        localStorage.setItem('fontType', fontType.value);
        localStorage.setItem('fontSize', fontSize.value);
        localStorage.setItem('lineHeight', lineHeight.value);
        localStorage.setItem('textAlign', textAlign.value);
        localStorage.setItem('darkMode', darkMode.checked);
        //localStorage.setItem('currentPage', currentPage);
        localStorage.setItem(`${title}-currentPage`, currentPage);
    }

    function loadSettings() {
        if (localStorage.getItem('fontType')) {
            fontType.value = localStorage.getItem('fontType');
        }
        if (localStorage.getItem('fontSize')) {
            fontSize.value = localStorage.getItem('fontSize');
        }
        if (localStorage.getItem('lineHeight')) {
            lineHeight.value = localStorage.getItem('lineHeight');
        }
        if (localStorage.getItem('textAlign')) {
            textAlign.value = localStorage.getItem('textAlign');
        }
        if (localStorage.getItem('darkMode')) {
            darkMode.checked = localStorage.getItem('darkMode') === 'true';
            applyDarkMode();
        }// else {
        //    darkMode.checked = true;
        //    applyDarkMode();
        //}
        applySettings();
    }

    function applySettings() {
        content.style.fontFamily = fontType.value;
        content.style.fontSize = fontSize.value + 'px';
        content.style.lineHeight = lineHeight.value;
        content.style.textAlign = textAlign.value;
        paginateAndDisplay();
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode', darkMode.checked);
        saveSettings();
    }

    function applyDarkMode() {
        document.body.classList.toggle('dark-mode', darkMode.checked);
    }

    function paginateAndDisplay() {
        saveSettings();
        if (pages.length > 0) {
            pages = paginateText(document.getElementById("text_container").value);
            //updateProgress();
            displayPage(currentPage);  
        }
    }

    function paginateText(text) {

        //text = text.replace(/\n+/g,"\n")
        text = text.replace(/\n/g," <br> ")
        text = text.replace(/\s+/g," ")

        //fontType=fontType.value
        //fontSize=fontSize.value
        //lineHeight=lineHeight.value
        screenWidth= Math.floor(window.innerWidth-40)
        screenHeight=  Math.floor(window.innerHeight-110)
        // Create a canvas element to measure text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
    
        // Set the font for the canvas context
        context.font = `${fontSize.value}px ${fontType.value}`;
    
        // Calculate the line height in pixels
        const computedLineHeight = (fontSize.value * lineHeight.value);
    
        // Calculate the number of lines per page
        const linesPerPage = Math.floor(screenHeight / computedLineHeight);

        //console.log(context.font ,linesPerPage)
    
        // Split the text into words
        const words = text.split(' ');
        let currentPage = [];
        let currentLine = '';
        let pages = [];
    
        // Helper function to add a line to the current page
        function addLineToPage(line) {
            line = line.replace(/\%20/g," ")
            if (!line.match(/<.+>/)){
                line = line.replace(/-/g,"&#8209;")                
                line = line.replace(/—/g,"&#8209;")                
            }
            if (currentPage.length < (linesPerPage)) {
                if ((currentPage.length>0) && (currentPage[currentPage.length-1].replace(/\s|<br>/,"").length>0)) {
                    //console.log(line)
                    currentPage.push(line);
                } else {
                    //console.log(line.replace(/^(<br>)/,""))
                    currentPage.push(line.replace(/^(<br>)/,""));
                } 
            } else {
                var found_br = 0;
                for (var i = currentPage.length-1; i > 0; i--) {
                    if (currentPage[i].match(/<br>/) && !line.match(/^(<br>)/)) {
                        currentPage[i] = currentPage[i].replace(/(.*)(<br>(.*))$/, '$1<br><div class="last_span">$3');
                        currentPage[currentPage.length-1] = currentPage[currentPage.length-1]+'</div>';
                        var found_br = 1;
                        break    
                    }
                }
                if (found_br==0 && !line.match(/^(<br>)/)) {
                    currentPage[0] = '<div class="last_span">'+currentPage[0]
                    currentPage[currentPage.length-1] = currentPage[currentPage.length-1]+'</div>';
                }
                //console.log("==== page break ("+pages.length+") ====")
                //console.log(line)
                pages.push(currentPage);
                currentPage = [line.replace(/^(<br>)/,"")];
            }
        }
    
        // Loop through words to build lines and pages
        words.forEach(word => {
            if (word.match(/<img/i)) {
                if (currentPage.length>0) {
                    pages.push(currentPage);
                    currentPage = [];    
                }
                addLineToPage(word);
                pages.push(currentPage);
                currentPage = [];
            } else if (word.match(/<br>/g)){
                addLineToPage(currentLine);
                currentLine =  word + ' ';
            } else {
                const testLine = currentLine + word + ' ';
                const metrics = context.measureText(testLine.replace(/<.*>/,"").replace(/\s+/," ").trim());
                const testWidth = metrics.width;
    
                if (testWidth > screenWidth && currentLine !== '') {
                    //console.log(screenWidth,testWidth,currentLine)
                    addLineToPage(currentLine);
                    currentLine = word + ' ';
                } else {
                    currentLine = testLine
    
                }             
            }
        });
    
        // Add the last line to the current page if it exists
        if (currentLine !== '') {
            addLineToPage(currentLine);
        }
    
        // Add the last page if it has content
        if (currentPage.length > 0) {
            pages.push(currentPage);
        }
    
        localStorage.setItem(`${title}-currentLength`, pages.length);
        localStorage.setItem('currentLength', pages.length);
        return pages;
    }
    
    window.displayPage = function(pageIndex) {
        this_page_marked = 0;
        start_of_page = pageIndex/localStorage.getItem("currentLength");
        end_of_page = pageIndex/localStorage.getItem("currentLength")+1/localStorage.getItem("currentLength");
        bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || {};
        document.getElementById('jumptobookmaks').options.length = 1;
        ordered_sections = []
        for (const [key, value0] of Object.entries(bookmarks)) {
            ordered_sections[text_arr.indexOf(key)] = key;
        }
        for (entry of ordered_sections){
            if (entry) {
                const ordered = Object.keys(bookmarks[entry]).sort().reduce(
                    (obj, subkey) => { 
                      obj[subkey] = bookmarks[entry][subkey]; 
                      return obj;
                    }, 
                    {}
                );
                for (const [mark, value1] of Object.entries(ordered)) {
                    if (entry==title && start_of_page<=mark && mark<end_of_page) {
                       this_page_marked = 1;
                       window.markpoint = mark;
                    }
                    var option = document.createElement("option");
                    preview = ordered[mark];
                    option.text = `${entry.split('/')[entry.split('/').length-1].replace(/\.txt$/i,"")}: ${preview}`.slice(0, 45)+"...";
                    option.value = `?file=${entry}&prog=${mark}`;
                    var select = document.getElementById("jumptobookmaks");
                    select.appendChild(option);
                }    
            }
        }

        if (this_page_marked==1) {
            document.getElementById("bookmark").classList.add("bookmarked");
        } else {
            document.getElementById("bookmark").classList.remove("bookmarked");
        }

        if (pageIndex >= 0 && pageIndex < pages.length) {
            content.innerHTML = pages[pageIndex].join('');
            currentPage = pageIndex;
            //localStorage.setItem('currentPage', currentPage);
            localStorage.setItem(`${title}-currentPage`, currentPage);   
            var elements = document.querySelectorAll('.last_span');
            for(var i=0; i<elements.length; i++){
                elements[i].style.textAlignLast = textAlign.value;
            }           
            updateProgress();
        }
    }

    window.nextPage = function() {
        //toggleInfo();
        if (currentPage < pages.length - 1) {
            displayPage(currentPage + 1);
        } else {

            if (text_arr.indexOf(title)>=0) {
                this_title = title
            } else {
                this_title = "Contents"
            }

            if ((text_arr[text_arr.indexOf(this_title)+1])) {
                localStorage.setItem(`${text_arr[text_arr.indexOf(this_title)+1]}-currentPage`, 0);
                window.location.href = '?file='+text_arr[text_arr.indexOf(this_title)+1]
            } else if (!text_arr.indexOf(this_title)) {
                localStorage.setItem(`${text_arr[1]}-currentPage`, 0);
                window.location.href = '?file='+text_arr[1]
            }
        }
    }

    window.previousPage = function() {
        //toggleInfo();
        if (currentPage > 0) {
            displayPage(currentPage - 1);
        } else {
            if (text_arr.indexOf(title)>=0) {
                this_title = title
            } else {
                this_title = "Contents"
            }

            if (text_arr[text_arr.indexOf(this_title)-1]) {
                //localStorage.setItem(`${text_arr[text_arr.indexOf(this_title)-1]}-currentPage`, 10000000000000000);
                window.location.href = '?file='+text_arr[text_arr.indexOf(this_title)-1]+'&prog=0.999999999999'
            }
        }
    }

    window.goToBeginning = function() {
        displayPage(0);
        //toggleInfo();
    }

    window.goToLast = function() {
        displayPage(pages.length - 1);
        //toggleInfo();
    }

    window.handleContentClick = function(event) {
        const rect = content.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const third = rect.width / 3;

        if (x < third) {
            previousPage();
        } else if (x > 2 * third) {
            nextPage();
        } //else {
        //    toggleSettings();
        //}
    }

    window.toggleBookmark = function() {
        bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || {};
        this_sections_bookmarks = bookmarks[title] || {}
        //console.log(bookmarks)
        if (document.getElementById("bookmark").classList.contains("bookmarked")) {
            delete this_sections_bookmarks[window.markpoint];
            bookmarks[title] = this_sections_bookmarks
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            document.getElementById("bookmark").classList.remove("bookmarked");
        } else {
            this_sections_bookmarks[currentPage/localStorage.getItem("currentLength")] = pages[currentPage].join(" ").replace(/<[^>]*>/g,"").replace(/\s+/g," ").replace("&#8209;","-").slice(0, 50); 
            bookmarks[title] = this_sections_bookmarks
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            document.getElementById("bookmark").classList.add("bookmarked");
        }
        //console.log(bookmarks)
        displayPage(currentPage);
    }

    window.toggleSettings = function() {
        if (controls.style.display === "none" || controls.style.display === "") {
            controls.style.display = "flex";
        } else {
            controls.style.display = "none";
            applySettings();
        }
    }

    window.toggleInfo = function() {
        document.getElementById("jumpto").value = ((currentPage / (pages.length - 1)) * 100);
        if (information.style.display === "none" || information.style.display === "") {
            information.style.display = "flex";
        } else {
            information.style.display = "none";
        }
    }

    document.addEventListener('click', function(event) {
        if (!controls.contains(event.target) && !settingsToggle.contains(event.target)) {
            if (controls.style.display === "flex") {
                controls.style.display = "none";
                applySettings();
            }
        }
    });

    document.addEventListener('click', function(event) {
        if (!information.contains(event.target) && !infoToggle.contains(event.target)) {
            if (information.style.display === "flex") {
                information.style.display = "none";
            }
        }
    });

    function updateProgress() {
        const progress = ((currentPage / (pages.length - 1)) * 100);
        if (progress>100){
            progress = 100;
            displayPage(pages.length - 1);
        } else if (isNaN(progress)) {
            progressPercentage.innerText = `100%`;
            timeRemaining.innerText = `0`;    
        } else {
            progressPercentage.innerText = `${Math.round(progress)}%`;
            const remainingWords = pages.slice(currentPage).join(' ').split(/\s+/).length;
            const remainingMinutes = Math.ceil(remainingWords / wordsPerMinute);
            if (remainingMinutes<=60) {
                timeRemaining.innerText = `${remainingMinutes} mins left`;    
            } else {
                remainingHours = Math.floor(remainingMinutes/60)
                minutesLeft = remainingMinutes % 60;
                timeRemaining.innerText = `${remainingHours}h ${minutesLeft}m left`;    
            }
        }
        if (title=="Contents") {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        } else {
            if (isNaN(progress)){
                var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?file='+title+'&prog='+0;
            } else if (progress>100) {
                var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?file='+title+'&prog='+1;
            } else {
                var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?file='+title+'&prog='+progress/100;
            }    
        }
        window.history.pushState({path:newurl},'',newurl);    
    }

    document.onkeydown = checkKey;

    function checkKey(e) {

        e = e || window.event;

        if (e.keyCode == '66') {
            // b
            toggleBookmark();
        }
        else if (e.keyCode == '49') {
            // 1
            controls.style.display = "none";
            applySettings();
            toggleInfo();
            document.getElementById("jumpto").focus();
        }
        else if (e.keyCode == '50') {
            // 2
            information.style.display = "none";
            toggleSettings();
            document.getElementById("fontType").focus();
        }
        else if (e.keyCode == '37') {
        // left arrow
        previousPage();
        }
        else if (e.keyCode == '39') {
        // right arrow
        nextPage();
        }

    }

    window.deleteBookmarks = function() {
        let text;
        if (confirm("Press OK to delete all bookmarks.") == true) {
            document.getElementById('jumptobookmaks').options.length = 1;
            localStorage.removeItem("bookmarks");
        }
    }
    
});
