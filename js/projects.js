const cache = {
    projectDetails: null,
}

async function loadProjectDetails(projectId) {
    if (!cache.projectDetails) {
        try {
            const response = await fetch('data/projectDetails.json')
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            cache.projectDetails = await response.json()
        } catch (error) {
            console.error(
                'There was a problem with fetching the project details:',
                error
            )
        }
    }
    return cache.projectDetails.find((detail) => detail.id === projectId)
}

export function renderProjects(projects) {
    const container = document.getElementById('projectsContainer')

    projects.forEach((project) => {
        const projectBox = document.createElement('div')
        projectBox.classList.add('projectBox')

        const title = document.createElement('h2')
        title.textContent = project.title
        projectBox.appendChild(title)

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

        const linkBox = document.createElement('div')
        linkBox.classList.add('projectLinkBox')
        project.links.forEach((link) => {
            const linkElement = document.createElement('a')
            linkElement.classList.add('projectLink')
            linkElement.href = link.url
            linkElement.target = '_blank'
            linkElement.textContent = link.label

            const svgIcon = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            )
            svgIcon.setAttribute('width', '28')
            svgIcon.setAttribute('height', '1.5em')
            svgIcon.setAttribute('fill', 'currentColor')
            svgIcon.setAttribute('viewBox', '0 0 16 16')

            const path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            )
            path.setAttribute(
                'd',
                'M10.604 1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.75.75 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1zM3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 14 12.25v-3.5a.75.75 0 0 0-1.5 0v3.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-8.5a.25.25 0 0 1 .25-.25h3.5a.75.75 0 0 0 0-1.5h-3.5z'
            )
            svgIcon.appendChild(path)
            linkElement.appendChild(svgIcon)

            linkBox.appendChild(linkElement)
        })
        projectBody.appendChild(linkBox)

        const button = document.createElement('button')
        projectBody.appendChild(button)

        projectBox.appendChild(projectBody)
        container.appendChild(projectBox)

        button.addEventListener('click', () => {
            const newContent =
                'ThiThis is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longercontent that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!This is some longer content that will increase the height of the div!s is some longer content that will increase the height of the div!'
            // Get the current height of the div
            const currentHeight = projectBody.offsetHeight

            // Fade out the current content
            const currentContent = projectBody
            currentContent.classList.remove('visible')
            currentContent.classList.add('hidden')

            // Set the height to the current height, to allow transition
            projectBody.style.height = `${currentHeight}px`

            // After fade out completes, update content and animate height change
            setTimeout(() => {
                // Step 1: Change the content of the div
                currentContent.innerHTML = newContent

                // Step 2: Fade in the new content
                currentContent.classList.remove('hidden')
                currentContent.classList.add('visible')

                // Step 3: Get the new height of the content
                const newHeight = projectBody.scrollHeight

                // Step 4: Animate the height change
                requestAnimationFrame(() => {
                    projectBody.style.height = `${newHeight}px`
                })
            }, 500) // Match the fade-out duration in CSS (0.5s)

            // projectBox.addEventListener('click', async () => {
            //     console.log('clikd')
            //     await expandProjectBox(projectBox, project.id)
            // })
        })
    })

    loadProjectDetails() // Load project details in the background on this page
}

async function expandProjectBox(projectBox, projectId) {
    const projectBody = projectBox.querySelector('.projectBody')
    projectBox.classList.add('expanded')

    projectBody.style.opacity = 0

    const details = await loadProjectDetails(projectId)

    if (details) {
        setTimeout(() => {
            projectBody.innerHTML = ''

            const detailedDescription = document.createElement('p')
            detailedDescription.classList.add('detailedText')
            detailedDescription.innerHTML = details.description.replace(
                /\n/g,
                '<br>'
            )
            projectBody.appendChild(detailedDescription)

            projectBody.style.opacity = 1
        }, 300)
    }
}
