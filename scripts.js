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

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('nav a')
    const contentContainer = document.getElementById('content')

    // Cache for fetched data
    const cache = {
        iconsData: null,
        projectsData: null,
    }

    const gridBackground = document.getElementById('gridBackground')
    const dotsBackground = document.getElementById('dotsBackground')

    // Mock functions to fetch data
    async function loadIconsData() {
        if (!cache.iconsData) {
            try {
                const response = await fetch('data/icons.json')
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

    // Define pages with placeholders for dynamic content
    const pages = {
        home: `
                <div class="profileBox">
                    <div class="profileLayout1">
                        <img class="profilePicture" src="data/profilePic.jpg" width="200px" height="200px" alt="Profile Picture" />
                        <div class="profileLayout2">
                            <p>
                                Hi, I am a recent <b>Electronic and Computer Engineering</b> graduate from the University of Nottingham.
                            </p>
                            <div id="link-icons-container" class="link-icons-container" > </div>
                        </div>
                    </div>
                </div>

                <div class="aboutBox">
                    <p class="aboutParagraph">
                        Hi, I am an Electronic and Computer Engineer, looking for a job in software engineering. I recently achieved a First class degree in my Master's at the University of Nottingham. <br /><br />

                        In my free time, I enjoy working on software projects and building stuff. Some recent examples can be found under the portfolio page. I like to try new things and explore new areas, such as my current project, WikiMapper, where I am processing Wikipedia XML dumps with C++ to create a visual graph database. <br /><br />

                        Now that I have graduated, I want to focus on backend development, improving my knowledge of Linux, C++, and computer architecture. <br /><br />

                        In my free time, I enjoy Mounting Biking, Climbing, Guitar, Cooking, and building things.
                    </p>
                </div>
            `,
        projects: `
                <div id="projectsContainer"> </div>
                `,
    }

    // Load the requested page content
    async function loadPage(page) {
        contentContainer.innerHTML = pages[page]
        if (page === 'home') {
            gridBackground.classList.add('fade-out')
            dotsBackground.classList.remove('fade-out')
            const iconsData = await loadIconsData()
            renderIcons(iconsData)
        }

        if (page === 'projects') {
            gridBackground.classList.remove('fade-out')
            dotsBackground.classList.add('fade-out')
            const iconsData = await loadProjectData()
            renderProjects(iconsData)
        }
    }

    // Add click event listeners to navigation links
    navItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault()
            const page = item.getAttribute('href').replace('#', '')
            loadPage(page)
        })
    })

    // Load the default page (home)
    loadPage('home')
})

window.addEventListener('resize', myFunction2)

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
