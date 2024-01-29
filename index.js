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

window.addEventListener('resize', myFunction2)
function2()
