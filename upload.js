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
            window.navigateTo(`/recipes/${id}`)
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


// Export for dynamic import
export { initializeUploadPage, initializeEditPage, checkAuth };
