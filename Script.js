// Function to simulate a download (kept as is)
function downloadImage(filename) {
    alert(`Starting download for: ${filename}\n(In a real site, this would initiate the file transfer.)`);
}

// --- Pagination and Filtering Global Variables ---

const itemsPerPage = 12; // प्रति पृष्ठ आइटमों की संख्या
let currentPage = 1;    // वर्तमान में प्रदर्शित पृष्ठ
const allImageCards = document.querySelectorAll('.image-card'); // सभी कार्ड तत्वों को पकड़ें
const paginationContainer = document.getElementById('pagination-container'); // pagination कंटेनर

let visibleCards = []; // फ़िल्टरिंग के बाद वर्तमान में दृश्यमान कार्डों का सरणी
let totalPages = 0;     // कुल पृष्ठों की संख्या (फ़िल्टर के बाद अपडेट की जाती है)

// --- Core Functions (Pagination & Filtering) ---

/**
 * फ़िल्टर किए गए कार्डों के सरणी को अपडेट करता है, पृष्ठ गणना करता है, और पहला पृष्ठ प्रदर्शित करता है।
 */
function updateFilteredState() {
    // केवल वे कार्ड जो वर्तमान में दृश्यमान हैं (filterImages द्वारा सेट)
    visibleCards = Array.from(allImageCards).filter(card => card.style.display !== 'none');
    
    // कुल पृष्ठों की संख्या की पुनर्गणना करें
    totalPages = Math.ceil(visibleCards.length / itemsPerPage);
    
    // फ़िल्टरिंग के बाद, पहले पृष्ठ पर वापस जाएँ
    currentPage = 1;
    
    // UI अपडेट करें
    displayPage(currentPage);
}

/**
 * निर्दिष्ट पृष्ठ के लिए कार्ड प्रदर्शित करता है।
 * यह अब 'visibleCards' सरणी पर काम करता है।
 * @param {number} pageNumber - वह पृष्ठ संख्या जिसे दिखाना है।
 */
function displayPage(pageNumber) {
    // पृष्ठ संख्या को 1 और totalPages के बीच सीमित करें
    if (totalPages === 0) {
        // यदि कोई फ़िल्टर परिणाम नहीं हैं
        allImageCards.forEach(card => card.style.display = 'none');
        paginationContainer.innerHTML = 'कोई परिणाम नहीं मिला।';
        return;
    }

    currentPage = Math.max(1, Math.min(pageNumber, totalPages));

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    // पहले सभी कार्डों को छिपाएँ
    allImageCards.forEach(card => card.style.display = 'none');

    // फिर केवल वर्तमान पृष्ठ पर दृश्यमान कार्डों को दिखाएँ
    visibleCards.forEach((card, index) => {
        if (index >= start && index < end) {
            card.style.display = 'block'; // 'block' का उपयोग करें क्योंकि 'imageGrid' एक flex/grid कंटेनर होना चाहिए
        } else {
            card.style.display = 'none';
        }
    });

    // pagination बटन को फिर से रेंडर करें
    renderPaginationButtons();
}

/**
 * Function to filter images based on the search input
 * यह फ़ंक्शन अब updateFilteredState को कॉल करता है।
 */
function filterImages() {
    // Get search input value and convert to uppercase
    let input = document.getElementById('searchInput');
    let filter = input.value.toUpperCase();
    
    // Loop through all cards and hide those that don't match the search filter
    allImageCards.forEach(card => {
        let tags = card.getAttribute('data-tags');
        
        if (tags && tags.toUpperCase().indexOf(filter) > -1) {
            // फ़िल्टरिंग के लिए खाली स्ट्रिंग का उपयोग करें। displayPage बाद में इसे 'block' पर सेट करेगा।
            card.style.display = ''; 
        } else {
            card.style.display = 'none'; // Hide the card
        }
    });

    // फ़िल्टरिंग के बाद pagination को अपडेट करें
    updateFilteredState();
}

/**
 * पृष्ठ संख्या और नेविगेशन बटन बनाता और रेंडर करता है।
 */
function renderPaginationButtons() {
    paginationContainer.innerHTML = ''; 
    paginationContainer.style.textAlign = 'center'; 

    if (totalPages <= 1) {
        return; // यदि केवल 1 या 0 पृष्ठ हैं तो pagination की आवश्यकता नहीं है
    }

    // 'Previous' बटन
    const prevButton = createPaginationButton('<< Previous', () => displayPage(currentPage - 1), currentPage === 1);
    paginationContainer.appendChild(prevButton);

    // पृष्ठ संख्या बटन लॉजिक (अधिकतम 10 पृष्ठ दिखाने के लिए)
    const maxPagesToShow = 10;
    let startPage;
    let endPage;

    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        // वर्तमान पृष्ठ के चारों ओर pagination को केंद्रित करें
        const halfPages = Math.floor(maxPagesToShow / 2);
        startPage = Math.max(1, currentPage - halfPages);
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // यदि हम अंत में हैं, तो स्टार्ट को समायोजित करें
        if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        }
    }

    // पहला पृष्ठ और '...' यदि आवश्यक हो
    if (startPage > 1) {
        const firstPageButton = createPaginationButton(1, () => displayPage(1), false, 1 === currentPage);
        paginationContainer.appendChild(firstPageButton);
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.margin = '0 5px';
            paginationContainer.appendChild(dots);
        }
    }

    // दृश्यमान पृष्ठ बटन
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPaginationButton(i, () => displayPage(i), false, i === currentPage);
        paginationContainer.appendChild(pageButton);
    }
    
    // अंतिम पृष्ठ और '...' यदि आवश्यक हो
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.margin = '0 5px';
            paginationContainer.appendChild(dots);
        }
        const lastPageButton = createPaginationButton(totalPages, () => displayPage(totalPages), false, totalPages === currentPage);
        paginationContainer.appendChild(lastPageButton);
    }

    // 'Next' बटन
    const nextButton = createPaginationButton('Next >>', () => displayPage(currentPage + 1), currentPage === totalPages);
    paginationContainer.appendChild(nextButton);
}

/**
 * एक सामान्य pagination बटन बनाता है।
 */
function createPaginationButton(text, clickHandler, disabled, isCurrent = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('pagination-btn');
    button.onclick = clickHandler;
    button.disabled = disabled;
    
    if (isCurrent) {
        button.classList.add('active-page');
    }

    return button;
}

// --- New Hide/Show Functionality (Specific Functions) ---

/**
 * 'other' id वाले मुख्य कंटेनर को दिखाता है।
 */
function showOtherSections() {
    const otherDiv = document.getElementById('other');
    if (!otherDiv) {
        console.error("ID 'other' वाला तत्व नहीं मिला।");
        return;
    }
    // इसे 'block' पर सेट करके दिखाएं
    otherDiv.style.display = 'block'; 
}

/**
 * 'other' id वाले मुख्य कंटेनर को छिपाता है।
 */
function hideOtherSections() {
    const otherDiv = document.getElementById('other');
    if (!otherDiv) {
        console.error("ID 'other' वाला तत्व नहीं मिला।");
        return;
    }
    // इसे 'none' पर सेट करके छिपाएं
    otherDiv.style.display = 'none';
}


// --- Original Toggle Function (kept for existing use) ---

/**
 * 'other' id वाले मुख्य कंटेनर को छिपाता/दिखाता है।
 */
function toggleOtherSections() {
    const otherDiv = document.getElementById('other');
    if (!otherDiv) {
        console.error("ID 'other' वाला तत्व नहीं मिला।");
        return;
    }

    // current display style की जाँच करें
    if (otherDiv.style.display === 'none') {
        // इसे दिखाएं
        otherDiv.style.display = 'block'; 
    } else {
        // इसे छिपाएं
        otherDiv.style.display = 'none';
    }
}


/**
 * किसी विशिष्ट सेक्शन को छिपाता/दिखाता है।
 * यह उपयोगी है यदि आप प्रत्येक सेक्शन के भीतर एक टॉगल बटन जोड़ना चाहते हैं।
 * @param {string} sectionId - उस सेक्शन की ID जिसे टॉगल करना है (जैसे 'about us', 'privacy policy')
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error(`ID '${sectionId}' वाला सेक्शन नहीं मिला।`);
        return;
    }

    // सेक्शन की display property को टॉगल करें।
    // 'none' होने पर 'block' करें, अन्यथा 'none' करें।
    if (section.style.display === 'none') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// --- Utility Functions ---

// mobile menu le liye 
function toggleMobileMenu() {
    const nav = document.getElementById("mobile-menu");
    // 'active' क्लास को जोड़ना या हटाना
    nav.classList.toggle("active"); 
}

// Current Time 
function showTime() {
    document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}

// पेज लोड होने पर पहला पृष्ठ दिखाएँ
window.onload = function() {
    // प्रारंभिक दृश्यमान कार्ड सेट करें और pagination शुरू करें
    if (allImageCards.length > 0) {
        visibleCards = Array.from(allImageCards);
        totalPages = Math.ceil(visibleCards.length / itemsPerPage);
        displayPage(1);
    } else {
        paginationContainer.innerHTML = 'प्रदर्शन के लिए कोई कार्ड नहीं मिला।';
    }
    
    // Search input में keyup इवेंट जोड़ें
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterImages);
    }

    // समय अपडेट शुरू करें
    showTime();
    setInterval(function () {
        showTime();
    }, 1000);

    // नोट: यदि आप चाहते हैं कि 'other' सेक्शन शुरू में छिपा रहे, 
    // तो आपको यहां एक बार toggleOtherSections() को कॉल करना होगा या HTML/CSS में display: none; सेट करना होगा।
};




// यह फ़ंक्शन 'शेयर मॉडाल' को खोलेगा
function openShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.style.display = 'block';
        // वैकल्पिक: मॉडाल के बाहर क्लिक करने पर बंद करने के लिए इवेंट लिसनर जोड़ें
        window.addEventListener('click', outsideClick);
    }
}

// यह फ़ंक्शन 'शेयर मॉडाल' को बंद करेगा
function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.style.display = 'none';
        // वैकल्पिक: 'मॉडाल के बाहर क्लिक' इवेंट लिसनर को हटा दें
        window.removeEventListener('click', outsideClick);
    }
}

// वैकल्पिक: मॉडाल के बाहर क्लिक होने पर मॉडाल को बंद करने के लिए फ़ंक्शन
function outsideClick(event) {
    const modal = document.getElementById('shareModal');
    // सुनिश्चित करें कि क्लिक मॉडाल पर नहीं हुआ है और मॉडाल खुला है
    if (event.target === modal) {
        closeShareModal();
    }
}

// पेज लोड होने पर शेयर लिंक्स को वर्तमान URL के साथ अपडेट करने के लिए फ़ंक्शन
function updateShareLinks() {
    // वर्तमान पेज का URL प्राप्त करें
    const pageUrl = encodeURIComponent(window.location.href);
    // एक डिफ़ॉल्ट टेक्स्ट/शीर्षक जिसे आप साझा करना चाहते हैं (वैकल्पिक)
    const shareText = encodeURIComponent('इस बेहतरीन पेज को देखें!'); // 'इस पेज को शेयर करें' हिंदी में
    
    // WhatsApp लिंक अपडेट करें
    const whatsappLink = document.getElementById('share-whatsapp');
    if (whatsappLink) {
        // WhatsApp का शेयर URL: https://wa.me/?text=[text]%20[url]
        whatsappLink.href = `https://wa.me/?text=${shareText}%20${pageUrl}`;
    }

    // Facebook लिंक अपडेट करें
    const facebookLink = document.getElementById('share-facebook');
    if (facebookLink) {
        // Facebook का शेयर URL: https://www.facebook.com/sharer/sharer.php?u=[url]
        facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    }

    // Twitter लिंक अपडेट करें
    const twitterLink = document.getElementById('share-twitter');
    if (twitterLink) {
        // Twitter का शेयर URL: https://twitter.com/intent/tweet?text=[text]&url=[url]
        twitterLink.href = `https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}`;
    }
    
    // Email लिंक अपडेट करें
    const emailLink = document.getElementById('share-email');
    if (emailLink) {
        // Email का 'mailto' लिंक: mailto:?subject=[subject]&body=[body]%20[url]
        const emailSubject = encodeURIComponent('आपके लिए एक उपयोगी लिंक');
        const emailBody = encodeURIComponent('मुझे यह जानकारी उपयोगी लगी, आप भी देखें:');
        emailLink.href = `mailto:?subject=${emailSubject}&body=${emailBody}%20${pageUrl}`;
    }
}

// सुनिश्चित करें कि DOM पूरी तरह लोड हो जाने पर शेयर लिंक्स अपडेट हों
document.addEventListener('DOMContentLoaded', updateShareLinks);


// ⭐ स्टार रेटिंग फ़ंक्शनैलिटी

  // Star Rating Functionality
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star-rating .fa');
    const ratingValueInput = document.getElementById('ratingValue');

    if (stars.length > 0 && ratingValueInput) {
        stars.forEach(star => {
            // 1. स्टार पर माउस ले जाने पर (Hover) स्टार को दिखाना
            star.addEventListener('mouseover', () => {
                const hoverRating = parseInt(star.getAttribute('data-rating'));
                highlightStars(hoverRating);
            });

            // 2. माउस हटाने पर (Mouseout) पिछली (या डिफ़ॉल्ट) रेटिंग दिखाना
            star.addEventListener('mouseout', () => {
                const currentRating = parseInt(ratingValueInput.value);
                highlightStars(currentRating);
            });

            // 3. स्टार पर क्लिक करने पर रेटिंग सेट करना (Auto Count)
            star.addEventListener('click', () => {
                const clickedRating = parseInt(star.getAttribute('data-rating'));
                ratingValueInput.value = clickedRating; // रेटिंग मान सेट करें
                highlightStars(clickedRating); // स्टार्स को हाइलाइट करें
            });
        });

        // यह फ़ंक्शन स्टार्स को उनकी रेटिंग के आधार पर हाइलाइट करता है
        function highlightStars(rating) {
            stars.forEach(star => {
                const starRating = parseInt(star.getAttribute('data-rating'));
                if (starRating <= rating) {
                    star.classList.remove('fa-star-o');
                    star.classList.add('fa-star'); // भरा हुआ स्टार
                } else {
                    star.classList.remove('fa-star');
                    star.classList.add('fa-star-o'); // खाली स्टार
                }
            });
        }
    }
});


// 📝 फ़ॉर्म सबमिशन हैंडलिंग
feedbackForm.addEventListener('submit', function(event) {
    event.preventDefault(); // फ़ॉर्म को रीलोड होने से रोकें

    const name = document.getElementById('feedbackName').value.trim();
    const rating = ratingValueInput.value;
    const message = document.getElementById('feedbackMessage').value.trim();

    // ✅ वैलिडेशन
    if (rating === "0" || message === "") {
        alert("कृपया एक रेटिंग चुनें और अपना फ़ीडबैक संदेश भरें।");
        return;
    }

    // 📡 डेटा सबमिशन (सर्वर-साइड फ़ंक्शनैलिटी यहाँ जोड़ें)
    console.log("Feedback Submitted:", { name, rating, message });
    
    // 🎊 सफलता संदेश
    alert(`धन्यवाद, ${name || 'उपयोगकर्ता'}! आपका ${rating}-स्टार फ़ीडबैक सफलतापूर्वक जमा कर दिया गया है।`);

    // 🧹 फ़ॉर्म और रेटिंग को रीसेट करें
    feedbackForm.reset();
    ratingValueInput.value = "0";
    updateStarDisplay(0); // सभी स्टार्स को खाली करने के लिए
});

// अन्य kk.js कोड यहीं जारी रहेगा...

// --- 9. Light/Dark Mode Toggle ---
    
    // Add a button to the header for the mode toggle (You'll need to add this button in your HTML)
    // For now, let's create it dynamically or assume it's added later in the HTML, e.g.:
    // <button id="mode-toggle" title="Toggle Light/Dark Mode" aria-label="Toggle Light/Dark Mode"></button>

    // Since a button isn't in your current HTML, we'll add a link to the navigation bar
    // as a quick implementation, but the best practice is to add a dedicated button.

    // BEST PRACTICE: Create a dedicated button in the header near the logo/nav
    const header = document.querySelector('header');
    const modeToggleButton = document.createElement('button');
    modeToggleButton.id = 'mode-toggle';
    modeToggleButton.classList.add('mode-toggle-button');
    // Using a font-awesome icon for a moon/sun symbol
    modeToggleButton.innerHTML = '<i class="fa fa-moon-o"></i>'; 
    modeToggleButton.title = 'Toggle Dark Mode';
    
    // Insert the button before the mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    header.insertBefore(modeToggleButton, mobileToggle);


    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            modeToggleButton.innerHTML = '<i class="fa fa-sun-o"></i>';
            modeToggleButton.title = 'Toggle Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            modeToggleButton.innerHTML = '<i class="fa fa-moon-o"></i>';
            modeToggleButton.title = 'Toggle Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    }

    // Load saved preference or check system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }

    // Toggle logic
    modeToggleButton.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        setDarkMode(!isDark);
    });
    
