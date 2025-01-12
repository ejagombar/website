function myFunction2() {
    var x = document.getElementById('myLinks')
    var menuToggle = document.getElementById('menu-toggle')
    if (window.innerWidth > 490) {
        x.style.display = 'none'
        menuToggle.checked = false
    }
}

function myFunction() {
    var x = document.getElementById('myLinks')
    if (x.style.display === 'flex') {
        x.style.display = 'none'
    } else {
        x.style.display = 'flex'
    }
}

const routes = {
    404: {
        template: '404.html',
        title: '404',
        description: 'Page not found',
    },
    '/': {
        template: 'home.html',
        title: 'Home',
        description: 'This is the home page',
    },
    projects: {
        template: 'projects.html',
        title: 'Projects',
        description: 'This is the contact page',
    },
}

const cache = {
    iconsData: null,
    projectsData: null,
}

const locationHandler = async () => {
    let location = window.location.hash.replace('#', '')
    if (location.length == 0) {
        location = '/'
    }

    const route = routes[location] || routes['404']

    const html = await fetch(route.template).then((response) =>
        response.ok ? response.text() : '<h1>404 Page Not Found</h1>'
    )

    document.getElementById('content').innerHTML = html
    document.title = route.title || '404'
    document
        .querySelector('meta[name="description"]')
        .setAttribute('content', route.description || '')

    const gridBackground = document.getElementById('gridBackground')
    const dotsBackground = document.getElementById('dotsBackground')

    if (location === '/') {
        gridBackground.classList.add('fade-out')
        dotsBackground.classList.remove('fade-out')
        const iconsData = await loadIconsData()
        renderIcons(iconsData)
    }

    if (location === 'projects') {
        gridBackground.classList.remove('fade-out')
        dotsBackground.classList.add('fade-out')
        const iconsData = await loadProjectData()
        renderProjects(iconsData)
    }
}

// Cache for fetched data
async function loadIconsData() {
    if (!cache.iconsData) {
        try {
            const response = await fetch('assets/icons.json')
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            cache.iconsData = await response.json()
        } catch (error) {
            console.error(
                'There was a problem with fetching the icons data:',
                error
            )
        }
    }
    return cache.iconsData
}

async function loadProjectData() {
    if (!cache.projectsData) {
        try {
            const response = await fetch('data/projects.json')
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            cache.projectsData = await response.json()
        } catch (error) {
            console.error(
                'There was a problem with fetching the project data:',
                error
            )
        }
    }
    return cache.projectsData
}

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('nav a')

    const route = (event) => {
        event.preventDefault()
        window.history.pushState({}, '', event.target.href)
        locationHandler()
    }

    // Add click event listeners to navigation links
    navItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault()
            route(event)
        })
    })

    // add an event listener to the window that watches for url changes
    window.onpopstate = locationHandler
    window.route = route
    locationHandler()

    // loadPage('home') // Load the default page (home)
    loadProjectData() // Load project data in the background
})

window.addEventListener('resize', myFunction2)
window.addEventListener('hashchange', locationHandler)

function renderIcons(iconsData) {
    const container = document.getElementById('link-icons-container') // Make sure you have an element with this ID
    container.innerHTML = '' // Clear the container

    iconsData.forEach((icon) => {
        const anchor = document.createElement('a')
        anchor.href = icon.href
        anchor.target = icon.target

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        )
        svg.setAttribute('class', 'link-icons')
        svg.setAttribute('width', '28')
        svg.setAttribute('height', '28')
        svg.setAttribute('viewBox', '0 0 16 16')
        svg.setAttribute('fill', 'currentColor')

        const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        path.setAttribute('d', icon.path)

        svg.appendChild(path)
        anchor.appendChild(svg)

        container.appendChild(anchor)

        if (icon !== iconsData[iconsData.length - 1]) {
            const spacer = document.createElement('div')
            spacer.setAttribute('class', 'linkIconSpacer')
            container.appendChild(spacer)
        }
    })
}

function renderProjects(projects) {
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

        projectBox.appendChild(projectBody)
        container.appendChild(projectBox)

        // projectBox.addEventListener('click', async () => {
        //     await expandProjectBox(projectBox, project.id)
        // })
    })
}

async function loadProjectDetails(projectId) {
    try {
        const response = await fetch('data/projectDetails.json')
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const detailsData = await response.json()
        return detailsData.find((detail) => detail.id === projectId)
    } catch (error) {
        console.error(
            'There was a problem with fetching the project details:',
            error
        )
    }
}

async function expandProjectBox(projectBox, projectId) {
    const projectBody = projectBox.querySelector('.projectBody')
    projectBox.classList.add('expanded')

    // Fade out old content
    projectBody.style.opacity = 0

    // Load detailed description
    const details = await loadProjectDetails(projectId)

    if (details) {
        setTimeout(() => {
            // Replace old content with detailed description
            projectBody.innerHTML = '' // Clear current content

            const detailedDescription = document.createElement('p')
            detailedDescription.classList.add('detailedText')
            detailedDescription.innerHTML = details.description.replace(
                /\n/g,
                '<br>'
            )
            projectBody.appendChild(detailedDescription)

            // Fade in new content
            projectBody.style.opacity = 1
        }, 300) // Match this duration with the CSS transition duration
    }
}
