import { renderProjects, loadProjectData } from './projects.js'

// ===================================== Data =====================================
const cache = {
    iconsData: null,
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

// =================================== Routing ====================================

const routes = {
    404: {
        template: 'pages/404.html',
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

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('nav a')

    updateHeaderText()
    loadIconsData() // After doing testing, I found it is best to load these earlier on slow connections.

    const route = (event) => {
        event.preventDefault()
        window.history.pushState({}, '', event.target.href)
        locationHandler()
    }

    navItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault()
            route(event)
        })
    })

    window.onpopstate = locationHandler
    window.route = route
    locationHandler()

    loadProjectData() // Load project data in the background
})

const locationHandler = async () => {
    let location = window.location.hash.replace('#', '')
    if (location.length == 0) {
        location = '/'
    }

    const route = routes[location] || routes['404']

    const html = await fetch(route.template).then((response) => response.text())

    document.getElementById('content').innerHTML = html
    document.title = route.title || '404'
    document
        .querySelector('meta[name="description"]')
        .setAttribute('content', route.description || '')

    if (location === '/') {
        const iconsData = await loadIconsData()
        renderIcons(iconsData)
    }

    if (location === 'projects') {
        const projectData = await loadProjectData()
        renderProjects(projectData)
    }
}

window.addEventListener('hashchange', locationHandler)

// ================================== Home Page====================================

function updateHeaderText() {
    const header = document.getElementById('nameHeader')

    if (window.innerWidth <= 300) {
        header.textContent = 'EA'
    } else if (window.innerWidth <= 400) {
        header.textContent = 'Ed A'
    } else if (window.innerWidth <= 500) {
        header.textContent = 'Ed Agombar'
    } else {
        header.textContent = 'Edward Agombar'
    }
}

window.addEventListener('resize', updateHeaderText)

function renderIcons(iconsData) {
    const container = document.getElementById('link-icons-container')
    container.innerHTML = '' // Clear the container

    iconsData.forEach((icon) => {
        const anchor = document.createElement('a')
        anchor.href = icon.href
        anchor.target = icon.target

        if (icon.colorClass) {
            anchor.classList.add(icon.colorClass)
        }

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
