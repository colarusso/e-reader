document.addEventListener('DOMContentLoaded', () => {

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
    const title = urlParams.get('file') || 'file.txt';
    const textFile = title//`${title}.txt`;
    
    // Display the title as a link
    //titleElement.innerText = title.charAt(0).toUpperCase() + title.slice(1);
    titleElement.innerText = title.split('/')[title.split('/').length-1]
    document.title = title.split('/')[title.split('/').length-1]
    titleElement.href = textFile;

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
        updateProgress();
    })
    .catch((error) => {
        console.log(error);
        text = `<b>File not found</b>
        
        Make sure you have a file name specified in the url. The URL should end with something that looks like this: <i style="white-space: nowrap;">?file=file_name.txt</i>`;
        document.getElementById("text_container").value = text;
        pages = paginateText(text); // Paginate the error message
        displayPage(currentPage);
        updateProgress();        
    });


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
        }
        applySettings();
    }

    function applySettings() {
        content.style.fontFamily = fontType.value;
        content.style.fontSize = fontSize.value + 'px';
        content.style.lineHeight = lineHeight.value;
        content.style.textAlign = textAlign.value;
        //content.style.textAlignLast = textAlign.value;
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
            //window.location.href = ''
            displayPage(currentPage);
            updateProgress();
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
        screenHeight=  Math.floor(window.innerHeight-105)
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
            if (currentPage.length < (linesPerPage)) {
                currentPage.push(line);
            } else {
                //console.log("==========")
                pages.push(currentPage);
                currentPage = [line.replace(/^(<br>)/,"")];
            }
        }
    
        // Loop through words to build lines and pages
        words.forEach(word => {
            if (word.match(/<br>/g)){
                //console.log(currentLine)
                addLineToPage(currentLine);
                //addLineToPage("<br>");
                currentLine =  word + ' ';
            } else {
                const testLine = currentLine + word + ' ';
                const metrics = context.measureText(testLine.replace("<br>","").replace(/\s+/," ").trim());
                const testWidth = metrics.width;
    
                if (testWidth > screenWidth && currentLine !== '') {
                    //console.log(screenWidth,testWidth,currentLine)
                    //console.log(currentLine)
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
    
        return pages;
    }
    

    function displayPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < pages.length) {
            content.innerHTML = pages[pageIndex].join('');
            currentPage = pageIndex;
            //localStorage.setItem('currentPage', currentPage);
            localStorage.setItem(`${title}-currentPage`, currentPage);            
            updateProgress();
        }
    }

    window.nextPage = function() {
        if (currentPage < pages.length - 1) {
            displayPage(currentPage + 1);
        }
    }

    window.previousPage = function() {
        if (currentPage > 0) {
            displayPage(currentPage - 1);
        }
    }

    window.goToBeginning = function() {
        displayPage(0);
    }

    window.goToLast = function() {
        displayPage(pages.length - 1);
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

    window.toggleSettings = function() {
        if (controls.style.display === "none" || controls.style.display === "") {
            controls.style.display = "flex";
        } else {
            controls.style.display = "none";
            applySettings();
        }
    }

    window.toggleInfo = function() {
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
            displayPage(pages.length - 1);
        } else if (isNaN(progress)) {
            progressPercentage.innerText = `100%`;
            timeRemaining.innerText = `0`;    
        } else {
            progressPercentage.innerText = `${Math.round(progress)}%`;
            const remainingWords = pages.slice(currentPage).join(' ').split(/\s+/).length;
            const remainingMinutes = Math.ceil(remainingWords / wordsPerMinute);
            if (remainingMinutes<60) {
                timeRemaining.innerText = `${remainingMinutes} mins left`;    
            } else {
                remainingHours = Math.floor(remainingMinutes/60)
                minutesLeft = remainingMinutes % 60;
                timeRemaining.innerText = `${remainingHours} h ${minutesLeft} m left`;    
            }
        }
    }

    
});
