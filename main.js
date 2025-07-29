// =================================== Routing ====================================

const routes = {
    404: {
        template: 'pages/404.html',
        title: '404',
        description: 'Page not found',
    },
    '': {
        template: 'pages/home.html',
        title: 'Home',
    },
    home: {
        template: 'pages/home.html',
        title: 'Home',
    },
    projects: {
        template: 'pages/projects.html',
        title: 'Projects',
    },
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderText()

    // Handle hash change events
    window.addEventListener('hashchange', locationHandler)

    // Load initial route
    locationHandler()
})

const locationHandler = async () => {
    // Get the hash without the '#' symbol
    let hash = window.location.hash.slice(1)

    // Default to home if no hash
    if (!hash) {
        hash = ''
    }

    console.log('Loading route:', hash)

    const route = routes[hash] || routes['404']
    const html = await fetch(route.template).then((response) => response.text())

    const content = document.getElementById('content')
    content.innerHTML = html

    document.title = route.title || '404'
    document
        .querySelector('meta[name="description"]')
        .setAttribute('content', route.description || '')

    // Initialize carousel functionality after content is loaded
    if (hash === 'projects') {
        console.log('Projects page loaded, initializing carousels...')
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            initializeCarousels()
        }, 100)
    }
}

// ================================== Home Page====================================

function updateHeaderText() {
    const header = document.getElementById('nameHeader')

    if (window.innerWidth <= 341) {
        header.textContent = 'EA'
    } else if (window.innerWidth <= 450) {
        header.textContent = 'Ed A'
    } else if (window.innerWidth <= 520) {
        header.textContent = 'Ed Agombar'
    } else {
        header.textContent = 'Edward Agombar'
    }
}

window.addEventListener('resize', updateHeaderText)

function handleHeaderScroll() {
    const header = document.querySelector('header')
    const scrollThreshold = 20

    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled')
    } else {
        header.classList.remove('scrolled')
    }
}

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('scroll', handleHeaderScroll)
    handleHeaderScroll()
})

// ======================== CAROUSEL FUNCTIONALITY ========================

function changeSlide(button, direction) {
    console.log('changeSlide called with direction:', direction)

    const container = button.closest('.carousel-container')
    const wrapper = container.querySelector('.carousel-wrapper')
    const slides = wrapper.querySelectorAll('.carousel-slide')
    const indicators = container.querySelectorAll('.indicator')

    let currentIndex = Array.from(slides).findIndex((slide) =>
        slide.classList.contains('active')
    )
    let newIndex = currentIndex + direction

    console.log(
        'Current index:',
        currentIndex,
        'New index before wrapping:',
        newIndex
    )

    // Handle wrapping
    if (newIndex >= slides.length) {
        newIndex = 0
    } else if (newIndex < 0) {
        newIndex = slides.length - 1
    }

    console.log('Final new index:', newIndex)

    // Update slides
    slides[currentIndex].classList.remove('active')
    slides[newIndex].classList.add('active')

    // Update indicators
    if (indicators.length > 0) {
        indicators[currentIndex].classList.remove('active')
        indicators[newIndex].classList.add('active')
    }

    console.log('Slide change complete')
}

function goToSlide(indicator, slideIndex) {
    const container = indicator.closest('.carousel-container')
    const wrapper = container.querySelector('.carousel-wrapper')
    const slides = wrapper.querySelectorAll('.carousel-slide')
    const indicators = container.querySelectorAll('.indicator')

    const currentIndex = Array.from(slides).findIndex((slide) =>
        slide.classList.contains('active')
    )

    if (currentIndex !== slideIndex) {
        // Update slides
        slides[currentIndex].classList.remove('active')
        slides[slideIndex].classList.add('active')

        // Update indicators
        indicators[currentIndex].classList.remove('active')
        indicators[slideIndex].classList.add('active')
    }
}

function initializeCarousels() {
    console.log('Initializing carousels...')

    // Remove any existing event listeners to prevent duplicates
    document.removeEventListener('keydown', handleCarouselKeydown)
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchend', handleTouchEnd)

    // Add event listeners
    document.addEventListener('keydown', handleCarouselKeydown)
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    // Set up click event listeners for carousel buttons using event delegation
    const content = document.getElementById('content')

    // Remove existing carousel listeners to prevent duplicates
    content.removeEventListener('click', handleCarouselClick)

    // Add carousel click handler
    content.addEventListener('click', handleCarouselClick)

    console.log('Carousel initialization complete')
}

function handleCarouselClick(e) {
    console.log('Carousel click detected:', e.target)

    // Handle prev/next buttons
    if (e.target.closest('.carousel-prev')) {
        console.log('Previous button clicked')
        const button = e.target.closest('.carousel-prev')
        changeSlide(button, -1)
        e.preventDefault()
        e.stopPropagation()
    } else if (e.target.closest('.carousel-next')) {
        console.log('Next button clicked')
        const button = e.target.closest('.carousel-next')
        changeSlide(button, 1)
        e.preventDefault()
        e.stopPropagation()
    } else if (e.target.closest('.indicator')) {
        console.log('Indicator clicked')
        // Handle indicator clicks
        const indicator = e.target.closest('.indicator')
        const container = indicator.closest('.carousel-container')
        const indicators = container.querySelectorAll('.indicator')
        const slideIndex = Array.from(indicators).indexOf(indicator)
        goToSlide(indicator, slideIndex)
        e.preventDefault()
        e.stopPropagation()
    }
}

// Keyboard navigation for carousels
function handleCarouselKeydown(e) {
    const focusedCarousel = document.querySelector('.carousel-container:hover')
    if (focusedCarousel) {
        if (e.key === 'ArrowLeft') {
            const prevBtn = focusedCarousel.querySelector('.carousel-prev')
            if (prevBtn) changeSlide(prevBtn, -1)
        } else if (e.key === 'ArrowRight') {
            const nextBtn = focusedCarousel.querySelector('.carousel-next')
            if (nextBtn) changeSlide(nextBtn, 1)
        }
    }
}

// Touch/swipe support for mobile
let touchStartX = 0
let touchEndX = 0

function handleTouchStart(e) {
    if (e.target.closest('.carousel-container')) {
        touchStartX = e.changedTouches[0].screenX
    }
}

function handleTouchEnd(e) {
    const carousel = e.target.closest('.carousel-container')
    if (carousel) {
        touchEndX = e.changedTouches[0].screenX
        handleSwipe(carousel)
    }
}

function handleSwipe(carousel) {
    const swipeThreshold = 50
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left - go to next slide
            const nextBtn = carousel.querySelector('.carousel-next')
            if (nextBtn) changeSlide(nextBtn, 1)
        } else {
            // Swiped right - go to previous slide
            const prevBtn = carousel.querySelector('.carousel-prev')
            if (prevBtn) changeSlide(prevBtn, -1)
        }
    }
}
