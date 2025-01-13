const cache = {
    projectDetails: null,
}

async function loadProjectDetails(projectTitle) {
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

        // const linkBox = document.createElement('div')
        // linkBox.classList.add('projectLinkBox')
        // project.links.forEach((link) => {
        //     const linkElement = document.createElement('a')
        //     linkElement.classList.add('projectLink')
        //     linkElement.href = link.url
        //     linkElement.target = '_blank'
        //     linkElement.textContent = link.label
        //
        //     const svgIcon = document.createElementNS(
        //         'http://www.w3.org/2000/svg',
        //         'svg'
        //     )
        //     svgIcon.setAttribute('width', '28')
        //     svgIcon.setAttribute('height', '1.5em')
        //     svgIcon.setAttribute('fill', 'currentColor')
        //     svgIcon.setAttribute('viewBox', '0 0 16 16')
        //
        //     const path = document.createElementNS(
        //         'http://www.w3.org/2000/svg',
        //         'path'
        //     )
        //     path.setAttribute(
        //         'd',
        //         'M10.604 1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.75.75 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1zM3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 14 12.25v-3.5a.75.75 0 0 0-1.5 0v3.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-8.5a.25.25 0 0 1 .25-.25h3.5a.75.75 0 0 0 0-1.5h-3.5z'
        //     )

        //     svgIcon.appendChild(path)
        //     linkElement.appendChild(svgIcon)
        //
        //     linkBox.appendChild(linkElement)
        // })
        // projectBody.appendChild(linkBox)

        projectBox.appendChild(projectBody)
        container.appendChild(projectBox)

        projectBox.addEventListener('click', (event) =>
            handleProjectClick(event, projectBody, title.textContent)
        )
    })

    loadProjectDetails()
}

function handleProjectClick(event, projectBody, title) {
    event.preventDefault()

    let newContent
    loadProjectDetails(title).then(
        function (value) {
            console.log(value)
            newContent = value.description
        },
        function (error) {
            console.log(error)
        }
    )
    console.log(newContent)
    const currentHeight = projectBody.offsetHeight

    const currentContent = projectBody
    currentContent.classList.remove('visible')
    currentContent.classList.add('hidden')

    projectBody.style.height = `${currentHeight}px`

    setTimeout(() => {
        currentContent.innerHTML = newContent
        currentContent.classList.remove('hidden')
        currentContent.classList.add('visible')

        const newHeight = projectBody.scrollHeight

        requestAnimationFrame(() => {
            projectBody.style.height = `${newHeight}px`
        })
    }, 300)
}
