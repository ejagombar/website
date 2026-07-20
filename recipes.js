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
    addEditButtonIfAuth(contentContainer, id)

    // Set up image lightbox click handler
    const recipeImage = contentContainer.querySelector('.recipe-image-clickable')
    if (recipeImage) {
        recipeImage.addEventListener('click', () => {
            window.openLightbox(recipeImage.src)
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

async function addEditButtonIfAuth(contentContainer, id) {
    try {
        const { checkAuth } = await import('/upload.js')
        const isAuth = await checkAuth()
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
    } catch (e) {
        // Auth check not available, skip edit button
        console.warn('Could not check auth status:', e)
    }
}

// Export for dynamic import
export { initializeRecipesPage, initializeRecipePage };
