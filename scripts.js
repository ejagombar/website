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

document.addEventListener('DOMContentLoaded', function () {
    var x = document.getElementById('myLinks')
    var menuToggle = document.getElementById('menu-toggle')
    x.style.display = 'none'
    menuToggle.checked = false
})

loadIconsData()
loadProjectData()

window.addEventListener('resize', myFunction2)

async function loadIconsData() {
    try {
        const response = await fetch('data/icons.json')
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const iconsData = await response.json()
        renderIcons(iconsData)
    } catch (error) {
        console.error(
            'There was a problem with fetching the icons data:',
            error
        )
    }
}

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

async function loadProjectData() {
    try {
        const response = await fetch('data/projects.json')
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const iconsData = await response.json()
        renderProjects(iconsData)
    } catch (error) {
        console.error(
            'There was a problem with fetching the project data:',
            error
        )
    }
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
    })
}
