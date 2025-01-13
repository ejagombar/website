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
        svgIcon.setAttribute('viewBox', '0 0 20 20')

        const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        path.setAttribute(
            'd',
            'M10 20A10 10 0 1 0 0 10a10 10 0 0 0 10 10zM8.711 4.3l5.7 5.766L8.7 15.711l-1.4-1.422 4.289-4.242-4.3-4.347z'
        )

        svgIcon.appendChild(path)
        title.appendChild(svgIcon)

        title.style.display = 'flex'
        title.style.alignItems = 'center'
        title.style.gap = '8px'

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

function handleProjectClick(event, projectBox, projectBody, title) {
    event.preventDefault()

    if (activeProjectBox === projectBox) {
        return
    }

    if (activeProjectBox) {
        resetProjectBox(activeProjectBox)
    }

    activeProjectBox = projectBox

    let newContent
    loadProjectDetails(title).then(
        function (value) {
            projectBody.classList.remove('hidden')
            console.log(value)
            newContent = value.description

            const currentHeight = projectBody.offsetHeight
            projectBody.style.height = `${currentHeight}px`

            setTimeout(() => {
                projectBody.innerHTML = newContent
                projectBody.classList.add('visible')

                const newHeight = projectBody.scrollHeight

                requestAnimationFrame(() => {
                    projectBody.style.height = `${newHeight}px`
                })
            }, 300)
        },
        function (error) {
            console.log(error)
        }
    )

    projectBox.classList.add('active')
    projectBox.style.pointerEvents = 'none' // Disable further clicks
}

function resetProjectBox(projectBox) {
    const projectBody = projectBox.querySelector('.projectBody')

    projectBody.classList.remove('visible')
    projectBody.classList.add('hidden')
    projectBody.style.height = '0'

    projectBox.classList.remove('active')
    projectBox.style.pointerEvents = '' // Re-enable clicks
}
