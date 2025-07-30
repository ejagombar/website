// =================================== Routing ====================================

const routes = {
    404: {
        template: 'pages/404.html',
        title: '404',
        description: 'Page not found',
    },
    '/': {
        template: 'pages/home.html',
        title: 'Home',
    },
    '/home': {
        template: 'pages/home.html',
        title: 'Home',
    },
    '/projects': {
        template: 'pages/projects.html',
        title: 'Projects',
    },
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderText()

    window.addEventListener('popstate', locationHandler)

    document.addEventListener('click', handleNavigation)

    locationHandler()
})

const locationHandler = async () => {
    let path = window.location.pathname

    if (!path || path === '/') {
        path = '/'
    }

    console.log('Loading route:', path)

    const route = routes[path] || routes['404']

    try {
        const html = await fetch(route.template).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.text()
        })

        const content = document.getElementById('content')
        content.innerHTML = html

        document.title = route.title || '404'

        const metaDescription = document.querySelector(
            'meta[name="description"]'
        )
        if (metaDescription) {
            metaDescription.setAttribute('content', route.description || '')
        }

        if (path === '/projects') {
            console.log('Projects page loaded, initializing carousels...')
            setTimeout(() => {
                initializeCarousels()
            }, 100)
        }
    } catch (error) {
        console.error('Error loading route:', error)
        const html404 = await fetch(routes['404'].template).then((response) =>
            response.text()
        )
        document.getElementById('content').innerHTML = html404
        document.title = '404'
    }
}

function handleNavigation(e) {
    const link = e.target.closest('a[href]')

    if (link) {
        const href = link.getAttribute('href')

        if (href && href.startsWith('/') && !href.startsWith('//')) {
            e.preventDefault()

            if (href !== window.location.pathname) {
                navigateTo(href)
            }
        }
    }
}

function navigateTo(path) {
    window.history.pushState(null, '', path)

    locationHandler()
}

// ================================== Home Page====================================

function updateHeaderText() {
    const header = document.getElementById('nameHeader')

    if (!header) return

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

    if (header) {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled')
        } else {
            header.classList.remove('scrolled')
        }
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

    if (newIndex >= slides.length) {
        newIndex = 0
    } else if (newIndex < 0) {
        newIndex = slides.length - 1
    }

    console.log('Final new index:', newIndex)

    slides[currentIndex].classList.remove('active')
    slides[newIndex].classList.add('active')

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
        slides[currentIndex].classList.remove('active')
        slides[slideIndex].classList.add('active')

        indicators[currentIndex].classList.remove('active')
        indicators[slideIndex].classList.add('active')
    }
}

function initializeCarousels() {
    console.log('Initializing carousels...')

    document.removeEventListener('keydown', handleCarouselKeydown)
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchend', handleTouchEnd)

    document.addEventListener('keydown', handleCarouselKeydown)
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    const content = document.getElementById('content')

    content.removeEventListener('click', handleCarouselClick)

    content.addEventListener('click', handleCarouselClick)

    console.log('Carousel initialization complete')
}

function handleCarouselClick(e) {
    console.log('Carousel click detected:', e.target)

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
        const indicator = e.target.closest('.indicator')
        const container = indicator.closest('.carousel-container')
        const indicators = container.querySelectorAll('.indicator')
        const slideIndex = Array.from(indicators).indexOf(indicator)
        goToSlide(indicator, slideIndex)
        e.preventDefault()
        e.stopPropagation()
    }
}

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
            const nextBtn = carousel.querySelector('.carousel-next')
            if (nextBtn) changeSlide(nextBtn, 1)
        } else {
            const prevBtn = carousel.querySelector('.carousel-prev')
            if (prevBtn) changeSlide(prevBtn, -1)
        }
    }
}
