const get_element_li = () => {
    return `<li class="added-pokemon"><button class="jug">piedra</button><br><button class="jug">papel</button><br><button class="jug">tijera</button></li>`
}

const info = {
    id: "",
    name: "",
    status: "w",
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
            data = data.data[0]
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

            if (info.status == "w") {
                document.getElementById("error").innerText = "\nEsperando contrincante."
            } else if (info.status == "p") {
                if(info.res) {
                    if (info.res == "g")
                    document.getElementById("error").innerText = "\nGanaste."
                    else if (info.res == "l")
                    document.getElementById("error").innerText = "\nPerdiste."
                    else if (info.res == "e")
                    document.getElementById("error").innerText = "\nEmpate."
                } else if (info.jugada) {
                    document.getElementById("error").innerText = "\nEsperando al contrincante."
                } else {
                    document.getElementById("error").innerText = "\nSeleccione."
                }
            }
            // info.da

        }).catch(catchable_handle_for_the_error_generico)

    }, 5000)
}



const update_element_event = (jug) => (event) => {
    axios.post(`http://localhost:3000/jug/${info.id}-${jug}`,).then((data) => {
        document.getElementById("error").innerText = "\nEsperando al contrincante."
    }).catch(catchable_handle_for_the_error_generico)
}