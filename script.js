const sectionsContainer = document.getElementById('sections-container');
const scrollTriggerTop = document.getElementById('scroll-trigger-top');
const scrollTriggerBottom = document.getElementById('scroll-trigger-bottom');
const totalSections = 5;
let currentStartIndex = 0;
let isScrolling = false;

// Array of section file paths
const sectionFiles = [
    'home.html',
    'skill.html',
    'about.html',
    'cv.html',
    'contact.html',
];

function fetchSectionContent(filePath) {
    return fetch(filePath).then(response => response.text());
}

function createSection(index) {
    const section = document.createElement('div');
    section.className = 'section';
    section.dataset.index = index;

    // Fetch content from the corresponding file
    fetchSectionContent(sectionFiles[index])
        .then(content => {
            section.innerHTML = content;
        })
        .catch(error => {
            section.innerHTML = '<p>Error loading content</p>';
            console.error('Error loading content:', error);
        });

    return section;
}

function updateSections() {
    sectionsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const sectionIndex = (currentStartIndex + i) % totalSections;
        sectionsContainer.appendChild(createSection(sectionIndex));
    }
    // Scroll to the middle after sections are updated
    scrollToMiddle();
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !isScrolling) {
            isScrolling = true;
            setTimeout(() => {
                if (observer === observerBottom) {
                    console.log('Bottom trigger intersected');
                    currentStartIndex = (currentStartIndex + 1) % totalSections;
                    updateSections();
                    window.scrollBy(0, -50); // Adjust scrollBy for smoother scroll
                    if (currentStartIndex === 0) {
                        console.log('Reached the end, cycled back to start');
                    }
                } else if (observer === observerTop) {
                    console.log('Top trigger intersected');
                    currentStartIndex = (currentStartIndex - 1 + totalSections) % totalSections;
                    updateSections();
                    window.scrollBy(0, 50); // Adjust scrollBy for smoother scroll
                    if (currentStartIndex === totalSections - 1) {
                        console.log('Reached the start, cycled back to end');
                    }
                }
                isScrolling = false;
            }, 500); // Add a small delay to smoothen the transitions
        }
    });
}

const observerBottom = new IntersectionObserver(debounce((entries) => handleIntersection(entries, observerBottom), 300), {
    root: null,
    threshold: 0.3 // Increase threshold for smoother transitions
});

const observerTop = new IntersectionObserver(debounce((entries) => handleIntersection(entries, observerTop), 300), {
    root: null,
    threshold: 0.3 // Increase threshold for smoother transitions
});

// Scroll the page to the middle
function scrollToMiddle() {
    setTimeout(() => {
        const middlePosition = sectionsContainer.offsetHeight / 2 - window.innerHeight / 2;
        window.scrollTo({ top: middlePosition, behavior: 'smooth' });
    }, 2000); // Delay by 2 seconds
}

updateSections();
observerBottom.observe(scrollTriggerBottom);
observerTop.observe(scrollTriggerTop);

// Re-observe new sections after update
const observeNewSections = () => {
    observerBottom.observe(scrollTriggerBottom);
    observerTop.observe(scrollTriggerTop);
};

const observerConfig = {
    childList: true,
    subtree: true,
};
const observerForSections = new MutationObserver(observeNewSections);
observerForSections.observe(sectionsContainer, observerConfig);
