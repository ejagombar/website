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

        if (path === '/upload') {
            setTimeout(() => {
                initializeUploadPage()
            }, 100)
        }

        if (path.startsWith('/edit/') && currentRouteParams.id) {
            setTimeout(() => {
                initializeEditPage(currentRouteParams.id)
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

document.addEventListener('DOMContentLoaded', function() {
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
let currentSearchQuery = ''
let currentSearchIngredients = false
let lastSearchResults = null
let searchDebounceTimer = null

function isMobile() {
    return window.innerWidth <= 600
}

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
            source: getValue('source'),
            sourceLink: getValue('source_link'),
            image: getValue('image'),
            hasImage: getValue('has_image') === '1'
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

    const searchInput = document.getElementById('recipeSearch')
    const searchIngredientsCheckbox = document.getElementById('searchIngredients')
    const suggestions = document.getElementById('searchSuggestions')

    // Restore saved state
    if (searchInput && currentSearchQuery) {
        searchInput.value = currentSearchQuery
    }
    if (searchIngredientsCheckbox) {
        searchIngredientsCheckbox.checked = currentSearchIngredients
    }

    // Fetch types if needed
    if (recipeTypes.length === 0) {
        await fetchRecipeTypes()
    }
    renderTypeFilters(recipeTypes)

    // Restore active filter button
    if (currentTypeFilter !== 'all') {
        document.querySelectorAll('.type-filter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.type === currentTypeFilter)
        })
    }

    // Render recipes - use last search results if we have them, otherwise fetch
    if (lastSearchResults !== null) {
        renderRecipeList(lastSearchResults)
    } else if (allRecipes.length > 0) {
        renderRecipesByType(allRecipes, recipeTypes)
    } else {
        allRecipes = await fetchRecipes()
        renderRecipesByType(allRecipes, recipeTypes)
    }

    // Set up search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer)
            const query = e.target.value.trim()
            currentSearchQuery = query

            if (query.length < 2) {
                suggestions.innerHTML = ''
                suggestions.classList.remove('visible')
                lastSearchResults = null
                // Reset to show all recipes
                if (currentTypeFilter === 'all') {
                    renderRecipesByType(allRecipes, recipeTypes)
                } else {
                    fetchRecipes(currentTypeFilter).then(results => {
                        lastSearchResults = results
                        renderRecipeList(results)
                    })
                }
                return
            }

            searchDebounceTimer = setTimeout(async () => {
                const includeIngredients = searchIngredientsCheckbox?.checked || false
                currentSearchIngredients = includeIngredients
                const results = await fetchRecipes(
                    currentTypeFilter !== 'all' ? currentTypeFilter : null,
                    query,
                    includeIngredients
                )
                lastSearchResults = results

                // Show suggestions on mobile only
                if (isMobile()) {
                    renderSuggestions(results.slice(0, 8), suggestions)
                }

                // Update main list
                renderRecipeList(results)
            }, 300)
        })

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                suggestions.classList.remove('visible')
            }
        })
    }

    // Track checkbox changes
    if (searchIngredientsCheckbox) {
        searchIngredientsCheckbox.addEventListener('change', () => {
            currentSearchIngredients = searchIngredientsCheckbox.checked
            // Re-trigger search if there's a query
            if (searchInput && searchInput.value.trim().length >= 2) {
                searchInput.dispatchEvent(new Event('input'))
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
        const searchQuery = searchInput?.value.trim() || ''
        const includeIngredients = searchIngredientsCheckbox?.checked || false

        if (searchQuery.length >= 2) {
            const results = await fetchRecipes(
                currentTypeFilter !== 'all' ? currentTypeFilter : null,
                searchQuery,
                includeIngredients
            )
            lastSearchResults = results
            renderRecipeList(results)
        } else {
            // Filter allRecipes by type or show grouped view
            if (currentTypeFilter === 'all') {
                lastSearchResults = null
                renderRecipesByType(allRecipes, recipeTypes)
            } else {
                const filtered = await fetchRecipes(currentTypeFilter)
                lastSearchResults = filtered
                renderRecipeList(filtered)
            }
        }
    })
}

function renderTypeFilters(types) {
    const container = document.getElementById('typeFilters')
    if (!container) return

    const isAllActive = currentTypeFilter === 'all'
    let html = `<button class="type-filter-btn${isAllActive ? ' active' : ''}" data-type="all">All</button>`
    types.forEach(type => {
        const displayName = type.charAt(0).toUpperCase() + type.slice(1)
        const isActive = currentTypeFilter === type
        html += `<button class="type-filter-btn${isActive ? ' active' : ''}" data-type="${type}">${displayName}</button>`
    })
    container.innerHTML = html
}

function renderSuggestions(recipes, container) {
    if (!container) return

    if (recipes.length === 0) {
        container.classList.remove('visible')
        return
    }

    let html = ''
    recipes.forEach(recipe => {
        html += `<a href="/recipes/${recipe.index}" class="suggestion-item">${recipe.name}</a>`
    })
    container.innerHTML = html
    container.classList.add('visible')
}

function renderRecipesByType(recipes, types) {
    const container = document.getElementById('recipeList')
    if (!container) return

    if (recipes.length === 0) {
        container.innerHTML = '<p class="no-results">No recipes found.</p>'
        return
    }

    let html = '<div class="recipe-list-box"><ul class="recipe-link-list">'
    recipes.forEach(recipe => {
        html += `<li><a href="/recipes/${recipe.index}" class="recipe-link">${recipe.name}</a></li>`
    })
    html += '</ul></div>'

    container.innerHTML = html
}

function renderRecipeList(recipes) {
    const container = document.getElementById('recipeList')
    if (!container) return

    if (recipes.length === 0) {
        container.innerHTML = '<p class="no-results">No recipes found.</p>'
        return
    }

    let html = '<div class="recipe-list-box"><ul class="recipe-link-list">'
    recipes.forEach(recipe => {
        html += `<li><a href="/recipes/${recipe.index}" class="recipe-link">${recipe.name}</a></li>`
    })
    html += '</ul></div>'

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

    // Load tracker state - only track one recipe at a time
    const trackerKey = `recipe-tracker-${id}`
    const lastTrackedRecipe = localStorage.getItem('recipe-tracker-current')
    if (lastTrackedRecipe && lastTrackedRecipe !== id) {
        localStorage.removeItem(`recipe-tracker-${lastTrackedRecipe}`)
    }
    localStorage.setItem('recipe-tracker-current', id)
    let trackerState = JSON.parse(localStorage.getItem(trackerKey) || '{"enabled": false, "ingredients": {}, "instructions": {}}')

    // Build instructions list with checkboxes
    let instructionsHtml = ''
    recipe.instructions.forEach((instruction, index) => {
        const checked = trackerState.instructions[index] ? 'checked' : ''
        instructionsHtml += `<li class="trackable-item"><input type="checkbox" class="tracker-checkbox instruction-checkbox" data-index="${index}" ${checked}><span class="item-text">${instruction}</span></li>`
    })

    // Build ingredients list - split by newlines only (not commas, as ingredients can contain commas)
    let ingredientsHtml = ''
    if (recipe.ingredients) {
        const ingredients = recipe.ingredients.split(/[\r\n]+/).map(i => i.trim()).filter(i => i)
        ingredients.forEach((ingredient, index) => {
            const checked = trackerState.ingredients[index] ? 'checked' : ''
            ingredientsHtml += `<li class="trackable-item"><input type="checkbox" class="tracker-checkbox ingredient-checkbox" data-index="${index}" ${checked}><span class="item-text">${ingredient}</span></li>`
        })
    }

    let imageUrl = ''
    if (recipe.image) {
        imageUrl = recipe.image
    } else if (recipe.hasImage) {
        imageUrl = getRecipeImageUrl(id)
    }

    let html = `
        <div class="recipe-info-box">
            ${imageUrl ? `<img src="${imageUrl}" alt="${recipe.name}" class="recipe-image recipe-image-clickable" onerror="this.style.display='none'; this.classList.remove('recipe-image-clickable')">` : ''}
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
                <div class="section-header">
                    <h2>Ingredients</h2>
                    <label class="tracker-toggle">
                        <input type="checkbox" id="trackerToggle" ${trackerState.enabled ? 'checked' : ''}>
                        <span>Tracker</span>
                    </label>
                </div>
                <ul class="ingredients-list${trackerState.enabled ? ' tracker-enabled' : ''}">
                    ${ingredientsHtml}
                </ul>
            </div>
            ` : ''}

            ${instructionsHtml ? `
            <div class="recipe-instructions-box">
                <h2>Instructions</h2>
                <ol class="instructions-list${trackerState.enabled ? ' tracker-enabled' : ''}">
                    ${instructionsHtml}
                </ol>
            </div>
            ` : ''}
        </div>

        ${recipe.source ? `<p class="recipe-source">Source: ${recipe.sourceLink ? `<a href="${recipe.sourceLink}" target="_blank" rel="noopener">${recipe.source}</a>` : recipe.source}</p>` : ''}
    `

    contentContainer.innerHTML = html

    // Add edit button if authenticated
    checkAuth().then(isAuth => {
        if (isAuth) {
            const titleEl = contentContainer.querySelector('.recipe-title')
            if (titleEl) {
                const wrapper = document.createElement('div')
                wrapper.className = 'recipe-title-row'
                titleEl.parentNode.insertBefore(wrapper, titleEl)
                wrapper.appendChild(titleEl)
                const editBtn = document.createElement('a')
                editBtn.href = `/edit/${id}`
                editBtn.className = 'edit-recipe-btn'
                editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>'
                editBtn.title = 'Edit recipe'
                wrapper.appendChild(editBtn)
            }
        }
    })

    // Set up image lightbox click handler
    const recipeImage = contentContainer.querySelector('.recipe-image-clickable')
    if (recipeImage) {
        recipeImage.addEventListener('click', () => {
            openLightbox(recipeImage.src)
        })
    }

    // Set up tracker toggle
    const trackerToggle = document.getElementById('trackerToggle')
    const ingredientsList = contentContainer.querySelector('.ingredients-list')
    const instructionsList = contentContainer.querySelector('.instructions-list')

    if (trackerToggle) {
        trackerToggle.addEventListener('change', () => {
            trackerState.enabled = trackerToggle.checked
            localStorage.setItem(trackerKey, JSON.stringify(trackerState))

            if (trackerToggle.checked) {
                ingredientsList?.classList.add('tracker-enabled')
                instructionsList?.classList.add('tracker-enabled')
            } else {
                ingredientsList?.classList.remove('tracker-enabled')
                instructionsList?.classList.remove('tracker-enabled')
            }
        })
    }

    // Set up ingredient checkbox listeners
    contentContainer.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            trackerState.ingredients[checkbox.dataset.index] = checkbox.checked
            localStorage.setItem(trackerKey, JSON.stringify(trackerState))
        })
    })

    // Set up instruction checkbox listeners
    contentContainer.querySelectorAll('.instruction-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            trackerState.instructions[checkbox.dataset.index] = checkbox.checked
            localStorage.setItem(trackerKey, JSON.stringify(trackerState))
        })
    })

    // Set up text click to toggle checkbox (only when tracker enabled)
    contentContainer.querySelectorAll('.item-text').forEach(text => {
        text.addEventListener('click', () => {
            if (!trackerToggle?.checked) return
            const checkbox = text.previousElementSibling
            if (checkbox && checkbox.classList.contains('tracker-checkbox')) {
                checkbox.checked = !checkbox.checked
                checkbox.dispatchEvent(new Event('change'))
            }
        })
    })
}

// ======================== RECIPE UPLOADER ========================

const UPLOAD_API_BASE = 'https://api.recipes.eagombar.uk/recipeQuery'

async function initializeUploadPage() {
    console.log('Initializing upload page...')

    // Check if already authenticated
    const isAuth = await checkAuth()
    if (isAuth) {
        showUploadForm()
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm')
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            const password = document.getElementById('password').value
            const errorEl = document.getElementById('loginError')

            try {
                const response = await fetch(`${UPLOAD_API_BASE}/auth.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ password })
                })

                const data = await response.json()

                if (data.success) {
                    showUploadForm()
                } else {
                    errorEl.textContent = data.error || 'Invalid password'
                }
            } catch (error) {
                errorEl.textContent = 'Connection error. Please try again.'
            }
        })
    }

    // Import button handler
    const importBtn = document.getElementById('importBtn')
    if (importBtn) {
        importBtn.addEventListener('click', handleImport)
    }

    // Recipe form handler
    const recipeForm = document.getElementById('recipeForm')
    if (recipeForm) {
        recipeForm.addEventListener('submit', handleRecipeSubmit)
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn')
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                window.history.back()
            }
        })
    }

    setupImageHandlers()
}

async function checkAuth() {
    try {
        const response = await fetch(`${UPLOAD_API_BASE}/check-auth.php`, {
            credentials: 'include'
        })
        if (!response.ok) return false
        const data = await response.json()
        return data.authenticated === true
    } catch (error) {
        return false
    }
}

function setupImageHandlers() {
    const imageUrl = document.getElementById('imageUrl')
    const imageFile = document.getElementById('imageFile')
    const previewContainer = document.getElementById('imagePreviewContainer')
    const previewImg = document.getElementById('imagePreview')
    const removeBtn = document.getElementById('imageRemoveBtn')

    if (!imageUrl || !imageFile) return

    imageFile.addEventListener('change', () => {
        const file = imageFile.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            imageUrl.dataset.fileData = e.target.result
            imageUrl.value = ''
            previewImg.src = e.target.result
            previewContainer.style.display = ''
        }
        reader.readAsDataURL(file)
    })

    imageUrl.addEventListener('input', () => {
        delete imageUrl.dataset.fileData
        imageFile.value = ''
        const url = imageUrl.value.trim()
        if (url) {
            previewImg.src = url
            previewContainer.style.display = ''
        } else {
            previewContainer.style.display = 'none'
        }
    })

    removeBtn.addEventListener('click', () => {
        imageUrl.value = ''
        delete imageUrl.dataset.fileData
        imageFile.value = ''
        previewContainer.style.display = 'none'
        previewImg.src = ''
    })
}

function showUploadForm() {
    document.getElementById('loginSection').style.display = 'none'
    document.getElementById('uploadSection').style.display = 'block'
}

async function handleImport() {
    const urlInput = document.getElementById('importUrl')
    const statusEl = document.getElementById('importStatus')
    const url = urlInput.value.trim()

    if (!url) {
        statusEl.textContent = 'Please enter a URL'
        statusEl.className = 'status-message error'
        return
    }

    statusEl.textContent = 'Importing recipe...'
    statusEl.className = 'status-message'

    try {
        const response = await fetch(`${UPLOAD_API_BASE}/parse-url.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ url })
        })

        const data = await response.json()

        if (data.success && data.recipe) {
            populateForm(data.recipe)
            statusEl.textContent = 'Recipe imported! Review and submit.'
            statusEl.className = 'status-message success'
        } else {
            statusEl.textContent = data.error || 'Failed to parse recipe'
            statusEl.className = 'status-message error'
        }
    } catch (error) {
        statusEl.textContent = 'Import failed. Please try manually.'
        statusEl.className = 'status-message error'
    }
}

function populateForm(recipe) {
    // Basic fields
    if (recipe.name) document.getElementById('recipeName').value = recipe.name
    if (recipe.description) document.getElementById('recipeDescription').value = recipe.description
    if (recipe.type) document.getElementById('recipeType').value = recipe.type
    if (recipe.source) document.getElementById('sourceLink').value = recipe.source
    if (recipe.preparation_time) document.getElementById('prepTime').value = recipe.preparation_time
    if (recipe.cooking_time) document.getElementById('cookTime').value = recipe.cooking_time
    if (recipe.temperature) document.getElementById('temperature').value = recipe.temperature
    if (recipe.serves) document.getElementById('serves').value = recipe.serves
    if (recipe.makes) document.getElementById('makes').value = recipe.makes
    if (recipe.image) document.getElementById('imageUrl').value = recipe.image
    if (recipe.source_link) document.getElementById('sourceLink').value = recipe.source_link

    // Ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
        const container = document.getElementById('ingredientsList')
        container.innerHTML = ''
        recipe.ingredients.forEach(ing => {
            addIngredient(ing)
        })
    }

    // Instructions
    if (recipe.instructions && recipe.instructions.length > 0) {
        const container = document.getElementById('instructionsList')
        container.innerHTML = ''
        recipe.instructions.slice(0, 16).forEach((inst, index) => {
            addInstruction(inst)
        })
    }
}

async function handleRecipeSubmit(e) {
    e.preventDefault()

    const statusEl = document.getElementById('uploadStatus')
    statusEl.textContent = 'Uploading recipe...'
    statusEl.className = 'status-message'

    // Gather form data
    const imageUrlEl = document.getElementById('imageUrl')
    const formData = {
        name: document.getElementById('recipeName').value,
        description: document.getElementById('recipeDescription').value,
        type: document.getElementById('recipeType').value,
        source: document.getElementById('recipeSource').value,
        source_link: document.getElementById('sourceLink').value,
        preparation_time: document.getElementById('prepTime').value,
        cooking_time: document.getElementById('cookTime').value,
        temperature: document.getElementById('temperature').value,
        serves: document.getElementById('serves').value,
        makes: document.getElementById('makes').value,
        image: imageUrlEl.dataset.fileData || imageUrlEl.value,
        ingredients: [],
        instructions: []
    }

    // Gather ingredients
    document.querySelectorAll('#ingredientsList input[name="ingredients[]"]').forEach(input => {
        if (input.value.trim()) {
            formData.ingredients.push(input.value.trim())
        }
    })

    // Gather instructions
    document.querySelectorAll('#instructionsList textarea[name="instructions[]"]').forEach(textarea => {
        if (textarea.value.trim()) {
            formData.instructions.push(textarea.value.trim())
        }
    })

    try {
        const response = await fetch(`${UPLOAD_API_BASE}/upload-recipe.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (data.success) {
            statusEl.textContent = `Recipe uploaded successfully! ID: ${data.id}`
            statusEl.className = 'status-message success'
            // Clear form
            document.getElementById('recipeForm').reset()
            resetDynamicLists()
        } else {
            statusEl.textContent = data.error || 'Upload failed'
            statusEl.className = 'status-message error'
        }
    } catch (error) {
        statusEl.textContent = 'Upload failed. Please try again.'
        statusEl.className = 'status-message error'
    }
}

function resetDynamicLists() {
    document.getElementById('ingredientsList').innerHTML = `
        <div class="ingredient-row">
            <input type="text" name="ingredients[]" placeholder="e.g. 200g flour" required>
            <button type="button" class="remove-btn" onclick="removeRow(this)">-</button>
        </div>
    `
    document.getElementById('instructionsList').innerHTML = `
        <div class="instruction-row">
            <span class="instruction-num">1.</span>
            <textarea name="instructions[]" rows="2" placeholder="First step..." required></textarea>
            <button type="button" class="remove-btn" onclick="removeRow(this)">-</button>
        </div>
    `
    document.getElementById('addInstructionBtn').style.display = ''

    // Reset image
    const imageUrl = document.getElementById('imageUrl')
    if (imageUrl) {
        imageUrl.value = ''
        delete imageUrl.dataset.fileData
    }
    const imageFile = document.getElementById('imageFile')
    if (imageFile) imageFile.value = ''
    const previewContainer = document.getElementById('imagePreviewContainer')
    if (previewContainer) previewContainer.style.display = 'none'
}

// ======================== RECIPE EDIT ========================

async function initializeEditPage(id) {
    const isAuth = await checkAuth()
    if (isAuth) {
        showUploadForm()
        setupEditForm(id)
    } else {
        // Show login form, on success proceed to edit
        const loginForm = document.getElementById('loginForm')
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault()
                const password = document.getElementById('password').value
                const errorEl = document.getElementById('loginError')

                try {
                    const response = await fetch(`${UPLOAD_API_BASE}/auth.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ password })
                    })

                    const data = await response.json()

                    if (data.success) {
                        showUploadForm()
                        setupEditForm(id)
                    } else {
                        errorEl.textContent = data.error || 'Invalid password'
                    }
                } catch (error) {
                    errorEl.textContent = 'Connection error. Please try again.'
                }
            })
        }
    }
}

async function setupEditForm(id) {
    // Change heading
    const heading = document.querySelector('.upload-page h1')
    if (heading) heading.textContent = 'Edit Recipe'

    // Hide auto-import section
    const importBox = document.querySelector('.import-box')
    if (importBox) importBox.style.display = 'none'

    // Fetch recipe data
    const recipe = await fetchRecipeDetails(id)
    if (!recipe) {
        const statusEl = document.getElementById('uploadStatus')
        if (statusEl) {
            statusEl.textContent = 'Failed to load recipe data'
            statusEl.className = 'status-message error'
        }
        return
    }

    // Populate form
    populateFormForEdit(recipe, id)

    // Show existing image preview
    const previewContainer = document.getElementById('imagePreviewContainer')
    const previewImg = document.getElementById('imagePreview')
    if (recipe.image) {
        previewImg.src = recipe.image
        previewContainer.style.display = ''
    } else if (recipe.hasImage) {
        previewImg.src = getRecipeImageUrl(id)
        previewContainer.style.display = ''
    }

    // Replace form submit handler (cloneNode resets select values and button text)
    const recipeForm = document.getElementById('recipeForm')
    if (recipeForm) {
        const newForm = recipeForm.cloneNode(true)
        recipeForm.parentNode.replaceChild(newForm, recipeForm)
        newForm.addEventListener('submit', (e) => handleEditSubmit(e, id))

        // Re-set type and button text after clone
        if (recipe.type) newForm.querySelector('#recipeType').value = recipe.type
        const submitBtn = newForm.querySelector('.submit-btn')
        if (submitBtn) submitBtn.textContent = 'Update Recipe'

        // Re-attach cancel handler after clone
        const cancelBtn = newForm.querySelector('#cancelBtn')
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                    window.history.back()
                }
            })
        }
    }

    setupImageHandlers()
}

function populateFormForEdit(recipe, id) {
    if (recipe.name) document.getElementById('recipeName').value = recipe.name
    if (recipe.description) document.getElementById('recipeDescription').value = recipe.description
    if (recipe.type) document.getElementById('recipeType').value = recipe.type
    if (recipe.source) document.getElementById('recipeSource').value = recipe.source
    if (recipe.sourceLink) document.getElementById('sourceLink').value = recipe.sourceLink
    if (recipe.preparationTime) document.getElementById('prepTime').value = recipe.preparationTime
    if (recipe.cookingTime) document.getElementById('cookTime').value = recipe.cookingTime
    if (recipe.temperature) document.getElementById('temperature').value = recipe.temperature
    if (recipe.serves) document.getElementById('serves').value = recipe.serves
    if (recipe.makes) document.getElementById('makes').value = recipe.makes
    if (recipe.image) document.getElementById('imageUrl').value = recipe.image

    // Ingredients - split by newlines
    if (recipe.ingredients) {
        const container = document.getElementById('ingredientsList')
        container.innerHTML = ''
        const ingredients = recipe.ingredients.split(/[\r\n]+/).map(i => i.trim()).filter(i => i)
        ingredients.forEach(ing => {
            addIngredient(ing)
        })
    }

    // Instructions
    if (recipe.instructions && recipe.instructions.length > 0) {
        const container = document.getElementById('instructionsList')
        container.innerHTML = ''
        recipe.instructions.forEach(inst => {
            addInstruction(inst)
        })
    }
}

async function handleEditSubmit(e, id) {
    e.preventDefault()

    const statusEl = document.getElementById('uploadStatus')
    statusEl.textContent = 'Updating recipe...'
    statusEl.className = 'status-message'

    const imageUrlEl = document.getElementById('imageUrl')
    const formData = {
        id: id,
        name: document.getElementById('recipeName').value,
        description: document.getElementById('recipeDescription').value,
        type: document.getElementById('recipeType').value,
        source: document.getElementById('recipeSource').value,
        source_link: document.getElementById('sourceLink').value,
        preparation_time: document.getElementById('prepTime').value,
        cooking_time: document.getElementById('cookTime').value,
        temperature: document.getElementById('temperature').value,
        serves: document.getElementById('serves').value,
        makes: document.getElementById('makes').value,
        image: imageUrlEl.dataset.fileData || imageUrlEl.value,
        ingredients: [],
        instructions: []
    }

    document.querySelectorAll('#ingredientsList input[name="ingredients[]"]').forEach(input => {
        if (input.value.trim()) {
            formData.ingredients.push(input.value.trim())
        }
    })

    document.querySelectorAll('#instructionsList textarea[name="instructions[]"]').forEach(textarea => {
        if (textarea.value.trim()) {
            formData.instructions.push(textarea.value.trim())
        }
    })

    try {
        const response = await fetch(`${UPLOAD_API_BASE}/update-recipe.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (data.success) {
            // Clear any cached recipe data
            lastSearchResults = null
            allRecipes = []
            navigateTo(`/recipes/${id}`)
        } else {
            statusEl.textContent = data.error || 'Update failed'
            statusEl.className = 'status-message error'
        }
    } catch (error) {
        statusEl.textContent = 'Update failed. Please try again.'
        statusEl.className = 'status-message error'
    }
}

// Global functions for onclick handlers
window.addIngredient = function(value = '') {
    const container = document.getElementById('ingredientsList')
    const row = document.createElement('div')
    row.className = 'ingredient-row'
    row.innerHTML = `
        <input type="text" name="ingredients[]" placeholder="e.g. 200g flour" value="${escapeHtml(value)}">
        <button type="button" class="remove-btn" onclick="removeRow(this)">-</button>
    `
    container.appendChild(row)
}

window.addInstruction = function(value = '') {
    const container = document.getElementById('instructionsList')
    const count = container.querySelectorAll('.instruction-row').length

    if (count >= 16) {
        document.getElementById('addInstructionBtn').style.display = 'none'
        return
    }

    const row = document.createElement('div')
    row.className = 'instruction-row'
    row.innerHTML = `
        <span class="instruction-num">${count + 1}.</span>
        <textarea name="instructions[]" rows="2" placeholder="Step ${count + 1}...">${escapeHtml(value)}</textarea>
        <button type="button" class="remove-btn" onclick="removeRow(this)">-</button>
    `
    container.appendChild(row)

    if (count + 1 >= 16) {
        document.getElementById('addInstructionBtn').style.display = 'none'
    }
}

window.removeRow = function(btn) {
    const row = btn.parentElement
    const container = row.parentElement

    // Don't remove if it's the last one
    if (container.children.length > 1) {
        row.remove()
        // Renumber instructions if needed
        if (container.id === 'instructionsList') {
            renumberInstructions()
            document.getElementById('addInstructionBtn').style.display = ''
        }
    }
}

function renumberInstructions() {
    const rows = document.querySelectorAll('#instructionsList .instruction-row')
    rows.forEach((row, index) => {
        const numSpan = row.querySelector('.instruction-num')
        if (numSpan) {
            numSpan.textContent = `${index + 1}.`
        }
        const textarea = row.querySelector('textarea')
        if (textarea) {
            textarea.placeholder = `Step ${index + 1}...`
        }
    })
}

function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
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

// Set up lightbox close handler
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('imageLightbox')
    if (lightbox) {
        lightbox.addEventListener('click', closeLightbox)
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox()
        }
    })
})
