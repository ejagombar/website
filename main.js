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
    },
    '/home': {
        template: '/pages/home.html',
        title: 'Home',
    },
    '/projects': {
        template: '/pages/projects.html',
        title: 'Projects',
    },
    '/recipes': {
        template: '/pages/recipes.html',
        title: 'Recipes',
    },
}

const dynamicRoutes = {
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
        if (metaDescription) {
            metaDescription.setAttribute('content', route.description || '')
        }

        if (path === '/projects') {
            console.log('Projects page loaded, initializing carousels...')
            setTimeout(() => {
                initializeCarousels()
            }, 100)
        }

        if (path === '/recipes') {
            setTimeout(() => {
                initializeRecipesPage()
            }, 100)
        }

        if (path.startsWith('/recipes/') && currentRouteParams.id) {
            setTimeout(() => {
                initializeRecipePage(currentRouteParams.id)
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

// ======================== RECIPES FUNCTIONALITY ========================

const RECIPE_API_BASE = 'https://api.recipes.eagombar.uk/recipeQuery'

let recipeTypes = []
let allRecipes = []
let currentTypeFilter = 'all'
let searchDebounceTimer = null

function parseXML(xmlString) {
    // Strip any content before the XML declaration (PHP warnings, etc.)
    const xmlStart = xmlString.indexOf('<?xml')
    if (xmlStart > 0) {
        xmlString = xmlString.slice(xmlStart)
    }
    const parser = new DOMParser()
    return parser.parseFromString(xmlString, 'text/xml')
}

async function fetchRecipeTypes() {
    try {
        const response = await fetch(`${RECIPE_API_BASE}/typeQuery.php`)
        const xmlText = await response.text()
        const xml = parseXML(xmlText)
        const typeElements = xml.querySelectorAll('type')
        recipeTypes = Array.from(typeElements).map(el => el.textContent)
        return recipeTypes
    } catch (error) {
        console.error('Error fetching recipe types:', error)
        return []
    }
}

async function fetchRecipes(type = null, keyword = null, searchIngredients = false) {
    try {
        let url = `${RECIPE_API_BASE}/recipeQuery.php`
        const params = new URLSearchParams()

        if (type && type !== 'all') {
            params.append('type', type)
        }
        if (keyword) {
            params.append('keyword', keyword)
        }
        if (searchIngredients) {
            params.append('searchIngredients', '1')
        }

        const queryString = params.toString()
        if (queryString) {
            url += '?' + queryString
        }

        const response = await fetch(url)
        const xmlText = await response.text()
        const xml = parseXML(xmlText)
        const recipeElements = xml.querySelectorAll('recipe')

        return Array.from(recipeElements).map(el => ({
            name: el.querySelector('name')?.textContent || '',
            index: el.querySelector('index')?.textContent || ''
        }))
    } catch (error) {
        console.error('Error fetching recipes:', error)
        return []
    }
}

async function fetchRecipeDetails(id) {
    try {
        const response = await fetch(`${RECIPE_API_BASE}/recipeGet.php?id=${id}`)
        const xmlText = await response.text()
        const xml = parseXML(xmlText)
        const recipe = xml.querySelector('recipe')

        if (!recipe) return null

        const getValue = (tag) => recipe.querySelector(tag)?.textContent || ''

        const instructions = []
        let i = 1
        while (true) {
            const instruction = getValue(`instructions_${i}`)
            if (!instruction) break
            instructions.push(instruction)
            i++
        }

        return {
            name: getValue('name'),
            ingredients: getValue('ingredients'),
            description: getValue('description'),
            type: getValue('type'),
            instructions,
            preparationTime: getValue('preparation_time'),
            cookingTime: getValue('cooking_time'),
            temperature: getValue('temperature'),
            serves: getValue('serves'),
            makes: getValue('makes'),
            source: getValue('source')
        }
    } catch (error) {
        console.error('Error fetching recipe details:', error)
        return null
    }
}

function getRecipeImageUrl(id) {
    return `${RECIPE_API_BASE}/recipeGetImage.php?id=${id}`
}

async function initializeRecipesPage() {
    console.log('Initializing recipes page...')

    // Use cached data for immediate render if available
    if (recipeTypes.length > 0 && allRecipes.length > 0) {
        renderTypeFilters(recipeTypes)
        renderRecipesByType(allRecipes, recipeTypes)
    } else {
        // Fetch types and populate filter buttons
        const types = await fetchRecipeTypes()
        renderTypeFilters(types)

        // Load all recipes initially
        allRecipes = await fetchRecipes()
        renderRecipesByType(allRecipes, types)
    }

    // Set up search
    const searchInput = document.getElementById('recipeSearch')
    const searchIngredients = document.getElementById('searchIngredients')
    const suggestions = document.getElementById('searchSuggestions')

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer)
            const query = e.target.value.trim()

            if (query.length < 2) {
                suggestions.innerHTML = ''
                suggestions.style.display = 'none'
                // Reset to show all recipes grouped by type
                renderRecipesByType(allRecipes, recipeTypes)
                return
            }

            searchDebounceTimer = setTimeout(async () => {
                const includeIngredients = searchIngredients?.checked || false
                const results = await fetchRecipes(
                    currentTypeFilter !== 'all' ? currentTypeFilter : null,
                    query,
                    includeIngredients
                )

                // Show suggestions
                renderSuggestions(results.slice(0, 8), suggestions)

                // Update main list
                renderRecipeList(results)
            }, 300)
        })

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                suggestions.style.display = 'none'
            }
        })
    }

    // Set up filter button clicks
    document.getElementById('typeFilters')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.type-filter-btn')
        if (!btn) return

        document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')

        currentTypeFilter = btn.dataset.type
        const searchQuery = document.getElementById('recipeSearch')?.value.trim()
        const includeIngredients = document.getElementById('searchIngredients')?.checked || false

        if (searchQuery && searchQuery.length >= 2) {
            const results = await fetchRecipes(
                currentTypeFilter !== 'all' ? currentTypeFilter : null,
                searchQuery,
                includeIngredients
            )
            renderRecipeList(results)
        } else {
            // Filter allRecipes by type or show grouped view
            if (currentTypeFilter === 'all') {
                renderRecipesByType(allRecipes, recipeTypes)
            } else {
                const filtered = await fetchRecipes(currentTypeFilter)
                renderRecipeList(filtered)
            }
        }
    })
}

function renderTypeFilters(types) {
    const container = document.getElementById('typeFilters')
    if (!container) return

    let html = '<button class="type-filter-btn active" data-type="all">All</button>'
    types.forEach(type => {
        const displayName = type.charAt(0).toUpperCase() + type.slice(1)
        html += `<button class="type-filter-btn" data-type="${type}">${displayName}</button>`
    })
    container.innerHTML = html
}

function renderSuggestions(recipes, container) {
    if (!container) return

    if (recipes.length === 0) {
        container.style.display = 'none'
        return
    }

    let html = ''
    recipes.forEach(recipe => {
        html += `<a href="/recipes/${recipe.index}" class="suggestion-item">${recipe.name}</a>`
    })
    container.innerHTML = html
    container.style.display = 'block'
}

function renderRecipesByType(recipes, types) {
    const container = document.getElementById('recipeList')
    if (!container) return

    if (recipes.length === 0) {
        container.innerHTML = '<p class="no-results">No recipes found.</p>'
        return
    }

    // Group recipes - we need to fetch by type since the search results don't include type
    let html = ''

    // For now, just show all recipes in a simple list since we don't have type info in search results
    // We'll organize by fetching each type separately
    html = '<div class="recipe-grid">'
    recipes.forEach(recipe => {
        html += `
            <a href="/recipes/${recipe.index}" class="recipe-card">
                <span class="recipe-card-name">${recipe.name}</span>
            </a>
        `
    })
    html += '</div>'

    container.innerHTML = html
}

function renderRecipeList(recipes) {
    const container = document.getElementById('recipeList')
    if (!container) return

    if (recipes.length === 0) {
        container.innerHTML = '<p class="no-results">No recipes found.</p>'
        return
    }

    let html = '<div class="recipe-grid">'
    recipes.forEach(recipe => {
        html += `
            <a href="/recipes/${recipe.index}" class="recipe-card">
                <span class="recipe-card-name">${recipe.name}</span>
            </a>
        `
    })
    html += '</div>'

    container.innerHTML = html
}

async function initializeRecipePage(id) {
    console.log('Initializing recipe page for id:', id)

    const contentContainer = document.getElementById('recipeContent')
    if (!contentContainer) return

    const recipe = await fetchRecipeDetails(id)

    if (!recipe) {
        contentContainer.innerHTML = '<p class="error">Recipe not found.</p>'
        return
    }

    document.title = recipe.name + ' - Recipe'

    // Build info items
    let infoItems = ''
    if (recipe.serves) {
        infoItems += `<div class="recipe-info-item"><span class="info-label">Serves</span><span class="info-value">${recipe.serves}</span></div>`
    }
    if (recipe.makes) {
        infoItems += `<div class="recipe-info-item"><span class="info-label">Makes</span><span class="info-value">${recipe.makes}</span></div>`
    }
    if (recipe.preparationTime) {
        infoItems += `<div class="recipe-info-item"><span class="info-label">Prep Time</span><span class="info-value">${recipe.preparationTime}</span></div>`
    }
    if (recipe.cookingTime) {
        infoItems += `<div class="recipe-info-item"><span class="info-label">Cook Time</span><span class="info-value">${recipe.cookingTime}</span></div>`
    }
    if (recipe.temperature) {
        infoItems += `<div class="recipe-info-item"><span class="info-label">Temperature</span><span class="info-value">${recipe.temperature}</span></div>`
    }

    // Build instructions list
    let instructionsHtml = ''
    recipe.instructions.forEach((instruction, index) => {
        instructionsHtml += `<li>${instruction}</li>`
    })

    // Build ingredients list - split by newlines only (not commas, as ingredients can contain commas)
    let ingredientsHtml = ''
    if (recipe.ingredients) {
        const ingredients = recipe.ingredients.split(/[\r\n]+/).map(i => i.trim()).filter(i => i)
        ingredients.forEach(ingredient => {
            ingredientsHtml += `<li>${ingredient}</li>`
        })
    }

    const imageUrl = getRecipeImageUrl(id)

    let html = `
        <div class="recipe-info-box">
            <img src="${imageUrl}" alt="${recipe.name}" class="recipe-image" onerror="this.style.display='none'">
            <div class="recipe-info-grid">
                <h1 class="recipe-title">${recipe.name}</h1>
                ${recipe.description ? `<p class="recipe-description">${recipe.description}</p>` : ''}
                <div class="recipe-meta">
                    ${infoItems}
                </div>
            </div>
        </div>

        <div class="recipe-details-grid">
            ${ingredientsHtml ? `
            <div class="recipe-ingredients-box">
                <h2>Ingredients</h2>
                <ul class="ingredients-list">
                    ${ingredientsHtml}
                </ul>
            </div>
            ` : ''}

            ${instructionsHtml ? `
            <div class="recipe-instructions-box">
                <h2>Instructions</h2>
                <ol class="instructions-list">
                    ${instructionsHtml}
                </ol>
            </div>
            ` : ''}
        </div>

        ${recipe.source ? `<p class="recipe-source">Source: ${recipe.source}</p>` : ''}
    `

    contentContainer.innerHTML = html
}
