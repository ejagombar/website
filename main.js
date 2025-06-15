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
    },
    projects: {
        template: 'pages/projects.html',
        title: 'Projects',
    },
}

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('nav a')

    updateHeaderText()

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
})

const locationHandler = async () => {
    let location = window.location.hash.replace('#', '')
    if (location.length == 0) {
        location = '/'
    }
    const route = routes[location] || routes['404']
    const html = await fetch(route.template).then((response) => response.text())

    const content = document.getElementById('content')
    content.innerHTML = html

    document.title = route.title || '404'
    document
        .querySelector('meta[name="description"]')
        .setAttribute('content', route.description || '')
}

window.addEventListener('hashchange', locationHandler)

// ================================== Home Page====================================

function updateHeaderText() {
    const header = document.getElementById('nameHeader')

    if (window.innerWidth <= 320) {
        header.textContent = 'EA'
    } else if (window.innerWidth <= 415) {
        header.textContent = 'Ed A'
    } else if (window.innerWidth <= 500) {
        header.textContent = 'Ed Agombar'
    } else {
        header.textContent = 'Edward Agombar'
    }
}

window.addEventListener('resize', updateHeaderText)

function handleHeaderScroll() {
    const header = document.querySelector('header')
    const scrollThreshold = 20

    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled')
    } else {
        header.classList.remove('scrolled')
    }
}

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('scroll', handleHeaderScroll)
    handleHeaderScroll()
})
