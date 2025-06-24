
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
    '/projects': {
        template: 'pages/projects.html',
        title: 'Projects',
    },
}

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('nav a')

    updateHeaderText()

    const route = (event) => {
        event.preventDefault()
        const href = event.currentTarget.getAttribute('href')
        window.history.pushState({}, '', href)
        locationHandler()
    }

    navItems.forEach((item) => {
        item.addEventListener('click', route)
    })

    window.onpopstate = locationHandler
    window.route = route
    locationHandler()
})

const locationHandler = async () => {
    let location = window.location.pathname
    if (location.length === 0) {
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

// ================================== Home Page====================================

function updateHeaderText() {
    const header = document.getElementById('nameHeader')

    if (window.innerWidth <= 341) {
        header.textContent = 'EA'
    } else if (window.innerWidth <= 450) {
        header.textContent = 'Ed A'
    } else if (window.innerWidth <= 520) {
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

document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('scroll', handleHeaderScroll)
    handleHeaderScroll()
})
