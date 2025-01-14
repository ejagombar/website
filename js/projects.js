const cache = {
    projectDetails: null,
    projectData: null,
}

let activeProjectBox = null

export async function loadProjectData() {
    if (!cache.projectData) {
        try {
            const response = await fetch('data/projects.json')
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            cache.projectData = await response.json()
        } catch (error) {
            console.error(
                'There was a problem with fetching the project data:',
                error
            )
        }
    }
    return cache.projectData
}

async function loadProjectDetails(projectTitle) {
    if (!cache.projectDetails) {
        try {
            const response = await fetch('data/projectDetails.json')
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            cache.projectDetails = await response.json()
            console.log('Loaded project details')
        } catch (error) {
            console.error(
                'There was a problem with fetching the project details:',
                error
            )
        }
    }
    return cache.projectDetails.find((detail) => detail.title === projectTitle)
}

export function renderProjects(projects) {
    const container = document.getElementById('projectsContainer')

    projects.forEach((project) => {
        const projectBox = document.createElement('div')
        projectBox.classList.add('projectBox')

        const title = document.createElement('h2')
        title.textContent = project.title
        projectBox.appendChild(title)

        const svgIcon = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        )
        svgIcon.classList.add('projectIcon')
        svgIcon.setAttribute('width', '20')
        svgIcon.setAttribute('height', '20')
        svgIcon.setAttribute('fill', 'var(--highlight)')
        svgIcon.setAttribute('viewBox', '0 0 32 32')

        const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        path.setAttribute(
            'd',
            'M13.71 24.71 12.3 23.3l7.29-7.3-7.3-7.29L13.7 7.3l8 8a1 1 0 0 1 0 1.41z'
        )

        const path2 = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        path2.setAttribute(
            'd',
            'M16 32a16 16 0 1 1 16-16 16 16 0 0 1-16 16zm0-30a14 14 0 1 0 14 14A14 14 0 0 0 16 2z'
        )

        svgIcon.appendChild(path)
        svgIcon.appendChild(path2)
        title.appendChild(svgIcon)

        title.style.display = 'flex'
        title.style.alignItems = 'center'
        title.style.gap = '8px'

        const projectBody = generateProjectBody(project)
        projectBox.appendChild(projectBody)
        container.appendChild(projectBox)

        projectBox.addEventListener('click', (event) =>
            handleProjectClick(
                event,
                projectBox,
                projectBody,
                title.textContent
            )
        )
    })

    loadProjectDetails()
}

function generateProjectBody(project) {
    const projectBody = document.createElement('div')
    projectBody.classList.add('projectBody')

    const projectDivider = document.createElement('div')
    projectDivider.classList.add('projectDivider')
    projectBody.appendChild(projectDivider)

    const description = document.createElement('p')
    description.classList.add('projectText')
    description.innerHTML = project.description.replace(/\n/g, '<br>')
    projectDivider.appendChild(description)

    const labelBox = document.createElement('div')
    labelBox.classList.add('projectLabelBox')
    project.labels.forEach((label) => {
        const labelElement = document.createElement('p')
        labelElement.classList.add('label')
        labelElement.textContent = label
        labelBox.appendChild(labelElement)
    })
    projectDivider.appendChild(labelBox)

    projectBody.setAttribute('data-original-content', projectBody.innerHTML)

    return projectBody
}

function handleProjectClick(event, projectBox, projectBody, title) {
    event.preventDefault()

    if (activeProjectBox === projectBox) {
        return
    }

    if (activeProjectBox) {
        resetProjectBox(activeProjectBox)
    }

    activeProjectBox = projectBox

    projectBox.classList.add('active')
    projectBox.style.pointerEvents = 'none' // Disable further clicks

    const originalHeight = projectBody.scrollHeight

    projectBody.classList.remove('visible')
    projectBody.style.opacity = '0'

    setTimeout(() => {
        loadProjectDetails(title).then(
            (value) => {
                const newContent = value.description
                projectBody.innerHTML = newContent

                const newHeight = projectBody.scrollHeight

                projectBody.style.height = `${originalHeight}px`
                console.log('Active Original Height', originalHeight)

                projectBody.offsetHeight // Force reflow

                requestAnimationFrame(() => {
                    projectBody.style.height = `${newHeight}px`
                    console.log('Active New Height', newHeight)
                })

                setTimeout(() => {
                    projectBody.style.opacity = '1'
                    projectBody.classList.add('visible')
                }, 300)
            },
            (error) => {
                console.error('Failed to load project details:', error)
            }
        )
    }, 300)

    projectBody.style.height = 'auto'
}

function resetProjectBox(projectBox) {
    const projectBody = projectBox.querySelector('.projectBody')

    const currentHeight = projectBody.scrollHeight
    const originalContent = projectBody.getAttribute('data-original-content')
    projectBody.style.height = 'auto'
    projectBody.innerHTML = originalContent

    const restoredHeight = projectBody.scrollHeight

    projectBody.style.height = `${currentHeight}px`
    console.log('Reset Current Height (Before Transition):', currentHeight)

    requestAnimationFrame(() => {
        console.log('Reset Restored Height (After Transition):', restoredHeight)

        projectBody.style.height = `${restoredHeight}px`

        projectBody.style.opacity = '1'

        setTimeout(() => {
            projectBody.classList.add('visible')
        }, 100)
    })

    projectBox.classList.remove('active')
    projectBox.style.pointerEvents = '' // Re-enable clicks

    setTimeout(() => {
        projectBody.style.height = 'auto'
    }, 300)
}
