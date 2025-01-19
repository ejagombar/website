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

async function constructProjectDetails(projectTitle) {
    if (!cache.projectDetails) {
        try {
            const response = await fetch('data/projectDetails.json')
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            cache.projectDetails = await response.json()
            const data = await loadProjectData()

            cache.projectDetails.forEach((detail, index) => {
                const detiledBodyContainer = document.createElement('div')
                const detiledBody = document.createElement('div')
                detiledBody.innerHTML = detail.description

                const labels = data.find(
                    (detail2) => detail2.title === detail.title
                ).labels

                const labelBox = document.createElement('div')
                labelBox.classList.add('projectLabelBox')
                labels.forEach((label) => {
                    const labelElement = document.createElement('p')
                    labelElement.classList.add('label')
                    labelElement.textContent = label
                    labelBox.appendChild(labelElement)
                })
                labelBox.classList.remove('unclicked')

                detiledBodyContainer.appendChild(labelBox)
                detiledBodyContainer.appendChild(detiledBody)

                cache.projectDetails[index] = {
                    ...cache.projectDetails[index],
                    description: detiledBodyContainer.innerHTML,
                }
            })

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
        projectBox.classList.add('clickable')

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

    constructProjectDetails()
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
    labelBox.classList.add('unclicked')

    projectBody.setAttribute('data-original-content', projectBody.innerHTML)

    return projectBody
}

function substituteMarkdownLink(htmlString) {
    const markdownLinkRegex = /\[([^\]]+)]\((https?:\/\/[^\)]+)\)/g
    const template = `<div class="projectLinkBox"> <a class="projectLink" href="{url}" target="_blank"> {text} <svg width="28" height="1.5em" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"> <path d="M10.604 1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.75.75 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1zM3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 14 12.25v-3.5a.75.75 0 0 0-1.5 0v3.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-8.5a.25.25 0 0 1 .25-.25h3.5a.75.75 0 0 0 0-1.5h-3.5z" /> </svg> </a> </div> `
    return htmlString.replace(markdownLinkRegex, (_, text, url) => {
        return template.replace('{url}', url).replace('{text}', text)
    })
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

    const originalHeight = projectBody.scrollHeight

    projectBox.classList.remove('clickable')
    projectBody.classList.remove('visible')
    projectBody.style.opacity = '0'

    setTimeout(() => {
        constructProjectDetails(title).then(
            (value) => {
                const newContent = substituteMarkdownLink(
                    value.description
                ).replace(/\n/g, '<br>')
                projectBody.innerHTML = newContent

                const newHeight = projectBody.scrollHeight

                projectBody.style.height = `${originalHeight}px`
                projectBody.offsetHeight // Force reflow

                requestAnimationFrame(() => {
                    projectBody.style.height = `${newHeight}px`
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
    projectBox.classList.add('clickable')

    projectBody.style.height = `${currentHeight}px`

    requestAnimationFrame(() => {
        projectBody.style.height = `${restoredHeight}px`

        projectBody.style.opacity = '1'

        setTimeout(() => {
            projectBody.classList.add('visible')
        }, 100)
    })

    setTimeout(() => {
        projectBody.style.height = 'auto'
    }, 300)
}
