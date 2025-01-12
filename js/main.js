import { renderProjects } from './projects.js'

const routes = {
    404: {
        template: '404.html',
        title: '404',
        description: 'Page not found',
    },
    '/': {
        template: 'pages/home.html',
        title: 'Home',
        description: 'This is the home page',
    },
    projects: {
        template: 'pages/projects.html',
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

    loadProjectData() // Load project data in the background
})

// window.addEventListener('resize', myFunction2)
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
