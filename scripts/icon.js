function iconToggle() {
    var x = document.getElementsByClassName("bar-item");
    for (var i = 0; i < x.length; i++) {
        if (x[i].className != "bar-item bar-button dummy") {
            console.log(x[i].className);
            x[i].classList.toggle("responsive");
        }
    }
}