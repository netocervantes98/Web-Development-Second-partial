const get_element_li = () => {
    return `<li class="added-pokemon"><button class="jug">piedra</button><br><button class="jug">papel</button><br><button class="jug">tijera</button></li>`
}

const info = {
    id: "",
    name: "",
    status: "w",
}

const contador = {
    "g": 0,
    "e": 0,
    "l": 0,
    "up": true
}

const startPlay = (template_function) => {
    return (event) => {
        info.name = document.getElementById("player-name").value

        if (!info.name) {
            document.getElementById("error").innerText = "Falta nombre.";
            return
        } else {
            document.getElementById("error").innerText = "";
            document.getElementById("player-name").value = "";
        }

        axios.post(`http://localhost:3000/play`, info).then((data) => {

            // console.log(data)
            data = data.data
            info.id = data.id;
            // console.log(info.id)
            document.getElementById("error").innerText = "\nEsperando contrincante."
            checkState();

            const items = document.getElementsByClassName('items')[0];
            items.insertAdjacentHTML('beforeend', template_function());

            const updateArray = document.getElementsByClassName("jug");
            updateArray[0].addEventListener("click", update_element_event("s"))
            updateArray[1].addEventListener("click", update_element_event("p"))
            updateArray[2].addEventListener("click", update_element_event("t"))
            cancelB()
        }).catch(catchable_handle_for_the_error_generico)
    }
}


const catchable_handle_for_the_error_generico = (err) => {
    console.error(err)
    document.getElementById("error").innerText = "\nError."
}

function checkState() {
    setInterval(function () {
        axios.post(`http://localhost:3000/status/${info.id}`, info).then((data) => {
            data = data.data[0]
            info.status = data.status;
            info.res = data.res;
            info.jugada = data.jugada;


            
            if (info.status == "w") {
                contador.up = true;
                document.getElementById("error").innerText = "\nEsperando contrincante."
                cancelB()
            } else if (info.status == "p") {
                if(!info.jugada) {
                    contador.up = true;
                    document.getElementById("error").innerText = "\nSeleccione."
                    enableB()
                }
            } else if (info.status == "f") {
                console.log(info.res)
                if (contador.up) {

                    if (info.res == "g") {
                        contador.g += 1
                        document.getElementById("cg").innerText = contador.g;
                        document.getElementById("error").innerText = "\nGanaste."
                    }
                    else if (info.res == "l") {
                        contador.l += 1
                        document.getElementById("cl").innerText = contador.l;
                        document.getElementById("error").innerText = "\nPerdiste."
                    }
                    else if (info.res == "e") {
                        contador.e += 1
                        document.getElementById("ce").innerText = contador.e;
                        document.getElementById("error").innerText = "\nEmpate."
                    }
                    document.getElementById('otro').disabled = false
                    contador.up = false;
                }
                cancelB()
            } else if (info.jugada) {
                document.getElementById("error").innerText = "\nEsperando al contrincante."
                cancelB()
            } else {
                document.getElementById("error").innerText = "\nSeleccione."
                enableB()
            }
        }
            // info.da

        ).catch(catchable_handle_for_the_error_generico)

    }, 5000)
}

function cancelB() {
    document.getElementsByClassName('jug')[0].disabled = true
    document.getElementsByClassName('jug')[1].disabled = true
    document.getElementsByClassName('jug')[2].disabled = true
}

function enableB() {
    document.getElementsByClassName('jug')[0].disabled = false
    document.getElementsByClassName('jug')[1].disabled = false
    document.getElementsByClassName('jug')[2].disabled = false
    contador.up = true;
}

const update_element_event = (jug) => (event) => {
    document.getElementById('otro').disabled = true
    axios.post(`http://localhost:3000/jug/${info.id}-${jug}`,).then((data) => {
        cancelB()
        document.getElementById("error").innerText = "\nEsperando al contrincante."
    }).catch(catchable_handle_for_the_error_generico)
}
