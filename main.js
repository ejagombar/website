// =================================== Routing ====================================

const routes = {
    404: {
        template: '/pages/404.html',
        title: '404',
        description: 'Page not found',
    },
    '/': {
        template: '/pages/home.html',
        title: 'Home',
        description: 'Ed Agombar - Software Engineer at ThreatSpike.',
    },
    '/home': {
        template: '/pages/home.html',
        title: 'Home',
        description: 'Ed Agombar - Software Engineer at ThreatSpike.',
    },
    '/projects': {
        template: '/pages/projects.html',
        title: 'Projects',
        description: 'A mix of hardware and software projects',
    },
    '/recipes': {
        template: '/pages/recipes.html',
        title: 'Recipes',
        description: 'Recipe collection',
    },
    '/upload': {
        template: '/pages/upload.html',
        title: 'Recipe Uploader',
    },
}

const dynamicRoutes = {
    '/edit/': {
        template: '/pages/upload.html',
        title: 'Edit Recipe',
        paramName: 'id',
    },
    '/recipes/': {
        template: '/pages/recipe.html',
        title: 'Recipe',
        paramName: 'id',
    },
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderText()

    window.addEventListener('popstate', locationHandler)

    document.addEventListener('click', handleNavigation)

    locationHandler()
})

let currentRouteParams = {}

const locationHandler = async () => {
    let path = window.location.pathname

    if (!path || path === '/') {
        path = '/'
    }

    console.log('Loading route:', path)

    let route = routes[path]
    currentRouteParams = {}

    // Check dynamic routes if no exact match
    if (!route) {
        for (const [prefix, dynamicRoute] of Object.entries(dynamicRoutes)) {
            if (path.startsWith(prefix)) {
                route = dynamicRoute
                const paramValue = path.slice(prefix.length)
                if (paramValue) {
                    currentRouteParams[dynamicRoute.paramName] = paramValue
                }
                break
            }
        }
    }

    if (!route) {
        route = routes['404']
    }

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
        if (metaDescription && route.description) {
            metaDescription.setAttribute('content', route.description)
        }

        if (path === '/projects') {
            console.log('Projects page loaded, initializing carousels...')
            setTimeout(() => {
                initializeCarousels()
            }, 100)
        }

        if (path === '/recipes') {
            setTimeout(async () => {
                const { initializeRecipesPage } = await import('/recipes.js')
                initializeRecipesPage()
            }, 100)
        }

        if (path.startsWith('/recipes/') && currentRouteParams.id) {
            const id = currentRouteParams.id
            setTimeout(async () => {
                const { initializeRecipePage } = await import('/recipes.js')
                initializeRecipePage(id)
            }, 100)
        }

        if (path === '/upload') {
            setTimeout(async () => {
                const { initializeUploadPage } = await import('/upload.js')
                initializeUploadPage()
            }, 100)
        }

        if (path.startsWith('/edit/') && currentRouteParams.id) {
            const id = currentRouteParams.id
            setTimeout(async () => {
                const { initializeEditPage } = await import('/upload.js')
                initializeEditPage(id)
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

    if (window.innerWidth <= 420) {
        header.style.display = 'none'
    } else if (window.innerWidth <= 500) {
        header.style.display = ''
        header.textContent = 'EA'
    } else if (window.innerWidth <= 580) {
        header.style.display = ''
        header.textContent = 'Ed A'
    } else {
        header.style.display = ''
        header.textContent = 'Ed Agombar'
    }
}

window.addEventListener('resize', updateHeaderText)

let lastScrollY = window.scrollY

function handleHeaderScroll() {
    const header = document.querySelector('header')
    const currentScrollY = window.scrollY

    const styleChangeThreshold = 20 // When to make corners square
    const hideThreshold = 100 // Minimum scroll before hiding starts

    if (header) {
        if (currentScrollY > styleChangeThreshold) {
            header.classList.add('scrolled')
        } else {
            header.classList.remove('scrolled')
        }

        if (currentScrollY > lastScrollY && currentScrollY > hideThreshold) {
            header.classList.add('header-hidden')
        } else {
            header.classList.remove('header-hidden')
        }
    }

    lastScrollY = currentScrollY
}

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('scroll', handleHeaderScroll)
    handleHeaderScroll()
})
// ======================== CAROUSEL FUNCTIONALITY ========================

function preloadCarouselImages(container, indices, priority = 'low') {
    const slides = container.querySelectorAll('.carousel-slide')
    indices.forEach((idx) => {
        if (idx >= 0 && idx < slides.length) {
            const imgs = slides[idx].querySelectorAll('img[loading="lazy"]')
            imgs.forEach((img) => {
                img.loading = 'eager'
                img.fetchPriority = priority
            })
        }
    })
}

function markImageLoaded(img) {
    if (img.complete) {
        img.setAttribute('data-loaded', 'true')
    } else {
        img.addEventListener(
            'load',
            () => {
                img.setAttribute('data-loaded', 'true')
            },
            { once: true }
        )
        img.addEventListener(
            'error',
            () => {
                img.setAttribute('data-loaded', 'true')
            },
            { once: true }
        )
    }
}

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

    // Lock wrapper height to prevent page scroll jump during transition
    const currentHeight = wrapper.offsetHeight
    wrapper.style.minHeight = currentHeight + 'px'

    slides[currentIndex].classList.remove('active')
    slides[newIndex].classList.add('active')

    // Boost new active slide to high priority, preload adjacent at low
    preloadCarouselImages(container, [newIndex], 'high')
    const nextAfter = (newIndex + 1) % slides.length
    const prevBefore = (newIndex - 1 + slides.length) % slides.length
    preloadCarouselImages(container, [nextAfter, prevBefore], 'low')

    if (indicators.length > 0) {
        indicators[currentIndex].classList.remove('active')
        indicators[newIndex].classList.add('active')
    }

    // Reset min-height after transition so wrapper sizes naturally to the new slide
    requestAnimationFrame(() => {
        wrapper.style.minHeight = ''
    })

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
        // Lock wrapper height to prevent page scroll jump during transition
        const currentHeight = wrapper.offsetHeight
        wrapper.style.minHeight = currentHeight + 'px'

        slides[currentIndex].classList.remove('active')
        slides[slideIndex].classList.add('active')

        // Boost new active slide to high priority, preload adjacent at low
        preloadCarouselImages(container, [slideIndex], 'high')
        const nextAfter = (slideIndex + 1) % slides.length
        const prevBefore = (slideIndex - 1 + slides.length) % slides.length
        preloadCarouselImages(container, [nextAfter, prevBefore], 'low')

        indicators[currentIndex].classList.remove('active')
        indicators[slideIndex].classList.add('active')

        // Reset min-height after transition
        requestAnimationFrame(() => {
            wrapper.style.minHeight = ''
        })
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

    // Phase 1: Load active (first) slide images at high priority
    // Phase 2: Once those are done, background-load the rest
    const carousels = content.querySelectorAll('.carousel-container')
    carousels.forEach((carousel) => {
        const slides = carousel.querySelectorAll('.carousel-slide')

        // Track load state for all images
        carousel.querySelectorAll('img').forEach(markImageLoaded)

        // Immediately load the active slide at high priority
        preloadCarouselImages(carousel, [0], 'high')

        if (slides.length <= 1) return

        // Wait for active images to load, then background-load the rest
        const activeImgs = slides[0].querySelectorAll('img')
        const loadPromises = Array.from(activeImgs).map((img) => {
            if (img.complete) return Promise.resolve()
            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true })
                img.addEventListener('error', resolve, { once: true })
            })
        })

        const backgroundLoad = () => {
            const remaining = Array.from(
                { length: slides.length - 1 },
                (_, i) => i + 1
            )
            preloadCarouselImages(carousel, remaining, 'low')
        }

        // Fire background load after active images complete or 3s timeout
        Promise.race([
            Promise.all(loadPromises),
            new Promise((resolve) => setTimeout(resolve, 3000)),
        ]).then(backgroundLoad)
    })

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
    } else {
        // Check if click is on a carousel slide (image/video area)
        const container = e.target.closest('.carousel-container')
        if (container && !e.target.closest('.carousel-lightbox-content')) {
            // Don't open lightbox if directly interacting with video controls
            if (e.target.tagName === 'VIDEO') {
                return
            }
            openCarouselLightbox(container)
            e.preventDefault()
            e.stopPropagation()
        }
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

// ======================== CAROUSEL LIGHTBOX ========================

function openCarouselLightbox(container) {
    const lightbox = document.getElementById('carouselLightbox')
    const lightboxContent = lightbox.querySelector('.carousel-lightbox-content')

    // Find current active index
    const slides = container.querySelectorAll('.carousel-slide')
    let activeIndex = Array.from(slides).findIndex((s) =>
        s.classList.contains('active')
    )
    if (activeIndex < 0) activeIndex = 0

    // Clone the carousel wrapper
    const originalWrapper = container.querySelector('.carousel-wrapper')
    const clonedWrapper = originalWrapper.cloneNode(true)

    // Create a fresh carousel container for the lightbox
    const clonedContainer = document.createElement('div')
    clonedContainer.className = 'carousel-container'
    clonedContainer.appendChild(clonedWrapper)

    // Add nav buttons
    const slidesInClone = clonedWrapper.querySelectorAll('.carousel-slide')
    if (slidesInClone.length > 1) {
        // Prev button
        const prevBtn = document.createElement('button')
        prevBtn.className = 'carousel-btn carousel-prev'
        prevBtn.innerHTML =
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        clonedContainer.appendChild(prevBtn)

        // Next button
        const nextBtn = document.createElement('button')
        nextBtn.className = 'carousel-btn carousel-next'
        nextBtn.innerHTML =
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        clonedContainer.appendChild(nextBtn)

        // Indicators
        const indicatorsDiv = document.createElement('div')
        indicatorsDiv.className = 'carousel-indicators'
        for (let i = 0; i < slidesInClone.length; i++) {
            const indicator = document.createElement('span')
            indicator.className =
                'indicator' + (i === activeIndex ? ' active' : '')
            indicatorsDiv.appendChild(indicator)
        }
        clonedContainer.appendChild(indicatorsDiv)
    }

    // Set active slide
    slidesInClone.forEach((s, i) => {
        s.classList.toggle('active', i === activeIndex)
    })

    // Preload active slide at high priority, next at low
    preloadCarouselImages(clonedContainer, [activeIndex], 'high')
    if (slidesInClone.length > 1) {
        preloadCarouselImages(
            clonedContainer,
            [(activeIndex + 1) % slidesInClone.length],
            'low'
        )
    }
    clonedContainer.querySelectorAll('img').forEach(markImageLoaded)

    // Add click handlers to cloned nav
    clonedContainer.addEventListener('click', (e) => {
        if (e.target.closest('.carousel-prev')) {
            changeLightboxSlide(clonedContainer, -1)
            e.preventDefault()
            e.stopPropagation()
        } else if (e.target.closest('.carousel-next')) {
            changeLightboxSlide(clonedContainer, 1)
            e.preventDefault()
            e.stopPropagation()
        } else if (e.target.closest('.indicator')) {
            const indicator = e.target.closest('.indicator')
            const indicators = clonedContainer.querySelectorAll('.indicator')
            const slideIndex = Array.from(indicators).indexOf(indicator)
            goToLightboxSlide(clonedContainer, slideIndex)
            e.preventDefault()
            e.stopPropagation()
        }
    })

    // Store reference for keydown handling
    lightbox._clonedContainer = clonedContainer

    // Insert into lightbox
    lightboxContent.innerHTML = ''
    lightboxContent.appendChild(clonedContainer)

    // Show lightbox
    lightbox.classList.add('active')

    // Lock background scroll
    lightbox._scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = -lightbox._scrollY + 'px'
    document.body.style.width = '100%'
    document.documentElement.style.overflow = 'hidden'

    // Prevent touch-scroll on lightbox background (allow within carousel content)
    lightbox._preventScroll = (e) => {
        if (!e.target.closest('.carousel-lightbox-content')) {
            e.preventDefault()
        }
    }
    lightbox.addEventListener('touchmove', lightbox._preventScroll, {
        passive: false,
    })

    // Pause any videos in the original carousel
    container.querySelectorAll('video').forEach((v) => v.pause())
}

function changeLightboxSlide(container, direction) {
    const slides = container.querySelectorAll('.carousel-slide')
    const indicators = container.querySelectorAll('.indicator')

    let currentIndex = Array.from(slides).findIndex((s) =>
        s.classList.contains('active')
    )
    let newIndex = currentIndex + direction

    if (newIndex >= slides.length) newIndex = 0
    else if (newIndex < 0) newIndex = slides.length - 1

    slides[currentIndex].classList.remove('active')
    slides[newIndex].classList.add('active')

    // Boost new active slide to high priority, preload next at low
    preloadCarouselImages(container, [newIndex], 'high')
    const nextAfter = (newIndex + 1) % slides.length
    preloadCarouselImages(container, [nextAfter], 'low')

    // Track load state for images in the newly active slide
    slides[newIndex].querySelectorAll('img').forEach(markImageLoaded)

    if (indicators.length > 0) {
        indicators[currentIndex].classList.remove('active')
        indicators[newIndex].classList.add('active')
    }

    // Pause video in previous slide
    const prevVideo = slides[currentIndex].querySelector('video')
    if (prevVideo) {
        prevVideo.pause()
        prevVideo.currentTime = 0
    }
}

function goToLightboxSlide(container, slideIndex) {
    const slides = container.querySelectorAll('.carousel-slide')
    const indicators = container.querySelectorAll('.indicator')

    const currentIndex = Array.from(slides).findIndex((s) =>
        s.classList.contains('active')
    )

    if (currentIndex !== slideIndex) {
        slides[currentIndex].classList.remove('active')
        slides[slideIndex].classList.add('active')

        if (indicators.length > 0) {
            indicators[currentIndex].classList.remove('active')
            indicators[slideIndex].classList.add('active')
        }

        // Pause video in previous slide
        const prevVideo = slides[currentIndex].querySelector('video')
        if (prevVideo) {
            prevVideo.pause()
            prevVideo.currentTime = 0
        }
    }
}

function closeCarouselLightbox() {
    const lightbox = document.getElementById('carouselLightbox')

    if (lightbox) {
        // Pause any playing videos
        const container = lightbox.querySelector('.carousel-container')
        if (container) {
            container.querySelectorAll('video').forEach((v) => {
                v.pause()
                v.currentTime = 0
            })
        }

        lightbox.classList.remove('active')

        // Restore background scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.documentElement.style.overflow = ''
        window.scrollTo(0, lightbox._scrollY || 0)

        // Remove touch-scroll prevention
        if (lightbox._preventScroll) {
            lightbox.removeEventListener('touchmove', lightbox._preventScroll)
            lightbox._preventScroll = null
        }

        // Clear content after transition
        setTimeout(() => {
            const content = lightbox.querySelector('.carousel-lightbox-content')
            if (content) content.innerHTML = ''
            lightbox._clonedContainer = null
        }, 300)
    }
}

// ======================== IMAGE LIGHTBOX ========================

function openLightbox(imageSrc) {
    const lightbox = document.getElementById('imageLightbox')
    const lightboxImage = document.getElementById('lightboxImage')

    if (lightbox && lightboxImage) {
        lightboxImage.src = imageSrc
        lightbox.classList.add('active')
        document.body.style.overflow = 'hidden'
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox')

    if (lightbox) {
        lightbox.classList.remove('active')
        document.body.style.overflow = ''
    }
}

// Set up lightbox close handlers
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('imageLightbox')
    if (lightbox) {
        lightbox.addEventListener('click', closeLightbox)
    }

    // Carousel lightbox close handlers
    const carouselLightbox = document.getElementById('carouselLightbox')
    if (carouselLightbox) {
        // Click background to close
        carouselLightbox.addEventListener('click', (e) => {
            if (
                e.target === carouselLightbox ||
                e.target.classList.contains('carousel-lightbox-content')
            ) {
                closeCarouselLightbox()
            }
        })

        // Close button
        const closeBtn = carouselLightbox.querySelector(
            '.carousel-lightbox-close'
        )
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCarouselLightbox)
        }
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const cl = document.getElementById('carouselLightbox')
            if (cl && cl.classList.contains('active')) {
                closeCarouselLightbox()
            } else {
                closeLightbox()
            }
        }
    })

    // Keyboard nav for carousel lightbox
    document.addEventListener('keydown', (e) => {
        const cl = document.getElementById('carouselLightbox')
        if (cl && cl.classList.contains('active') && cl._clonedContainer) {
            if (e.key === 'ArrowLeft') {
                changeLightboxSlide(cl._clonedContainer, -1)
            } else if (e.key === 'ArrowRight') {
                changeLightboxSlide(cl._clonedContainer, 1)
            }
        }
    })
})

// Export for dynamic imports
window.navigateTo = navigateTo
window.openLightbox = openLightbox
window.closeLightbox = closeLightbox
