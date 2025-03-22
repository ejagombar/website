const cache = {
    projectData: null,
}

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

async function loadProjectHtml(htmlFile) {
    try {
        const response = await fetch(`pages/projects/${htmlFile}`)
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`)
        }
        const html = await response.text()
        const temp = document.createElement('div')
        temp.innerHTML = html
        return html
    } catch (error) {
        console.error('Failed to load project HTML:', error)
        return null
    }
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

        title.style.display = 'flex'
        title.style.alignItems = 'center'
        title.style.gap = '8px'

        const labelBox = document.createElement('div')
        labelBox.classList.add('projectLabelBox')
        project.labels.forEach((label) => {
            const labelElement = document.createElement('p')
            labelElement.classList.add('label')
            labelElement.textContent = label
            labelBox.appendChild(labelElement)
        })
        projectBox.appendChild(labelBox)

        const projectBody = document.createElement('div')
        projectBody.classList.add('projectBody')

        loadProjectHtml(project.htmlFile).then((content) => {
            if (content) {
                const contentDiv = document.createElement('div')
                contentDiv.classList.add('project-full-content')
                contentDiv.innerHTML = content
                projectBody.appendChild(contentDiv)
            }
        })

        projectBox.appendChild(projectBody)
        container.appendChild(projectBox)
    })
}
