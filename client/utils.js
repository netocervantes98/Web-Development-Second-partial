const get_element_li = (name, id, weight, image, types, height, base_experience) => {
    return `<li class="added-pokemon">name: ${name}<br>id: ${id}<br>height: ${height}<br>base experience: ${base_experience} <div class="weight">weight: ${weight}<br>types: ${types.map(element => " " + element.type.name)} </div> <img src=${image} ><button class="remove-pokemon">remove</button><br><button class="update-pokemon">update weight</button></li>`
}

const add_item_to_list_with_template = (template_function) => {
    return (event) => {
        document.getElementById("error").innerText = "";
        const req = document.getElementById("pokemon-name").value;
        document.getElementById("pokemon-name").value = "";

        axios.get(`http://localhost:3000/get/${req}`).then(({ data: { name, id, weight, types, height, base_experience } }) => {
            const items = document.getElementsByClassName('items')[0];
            if(!id) id = 1
            const image = `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${id.toString().padStart(3, '0')}.png`;
            items.insertAdjacentHTML('beforeend', template_function(name, id, weight, image, types, height, base_experience));

            const removeArray = document.getElementsByClassName("remove-pokemon");
            const newRemove = removeArray[removeArray.length - 1];
            newRemove.addEventListener("click", remove_element_event)

            const updateArray = document.getElementsByClassName("update-pokemon");
            const newUpdate = updateArray[updateArray.length - 1];
            newUpdate.addEventListener("click", update_element_event)
        }).catch(catchable_handle_for_the_error)
    }
}

const create_element = (template_function) => {
    return (event) => {
        document.getElementById("error").innerText = "";
        const info = {
            id: document.getElementById("pokemon-name").value,
            name: document.getElementById("pokemon-name").value,
            weight: 10,
            types: [{ "type": { "name": "grass", "url": "https://pokeapi.co/api/v2/type/12/" } }, { "type": { "name": "poison", "url": "https://pokeapi.co/api/v2/type/4/" } }],
            height: 1,
            base_experience: 2
        }
        document.getElementById("pokemon-name").value = "";

        axios.post(`http://localhost:3000/create`, info).then(({ data: { name, weight, types, height, base_experience } }) => {
            const items = document.getElementsByClassName('items')[0];
            // const image = `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${id.toString().padStart(3, '0')}.png`;
            items.insertAdjacentHTML('beforeend', template_function(name, info.id, weight, '', types, height, base_experience));

            const removeArray = document.getElementsByClassName("remove-pokemon");
            const newRemove = removeArray[removeArray.length - 1];
            newRemove.addEventListener("click", remove_element_event)

            const updateArray = document.getElementsByClassName("update-pokemon");
            const newUpdate = updateArray[updateArray.length - 1];
            newUpdate.addEventListener("click", update_element_event)
        }).catch(catchable_handle_for_the_error_generico)
    }
}

const remove_element_event = (event) => {
    const padre = event.target.parentNode;
    pos = padre.innerText.search("id: ") + 4
    id = parseInt(padre.innerText.substring(pos, pos + 10))
    
    axios.delete(`http://localhost:3000/delete/${id}`).then(() => {
        padre.parentNode.removeChild(padre);
    }).catch(catchable_handle_for_the_error_generico)
}

const update_element_event = (event) => {
    const padre = event.target.parentNode;
    pos = padre.innerText.search("id: ") + 4
    id = parseInt(padre.innerText.substring(pos, pos + 10))
    
    axios.put(`http://localhost:3000/update/${id}`, {name: "test", weight: 40}).then(() => {
        // padre.parentNode.removeChild(padre);
    }).catch(catchable_handle_for_the_error_generico)
}

const catchable_handle_for_the_error = (err) => {
    console.error(err)
    document.getElementById("error").innerText = "\nEse pokemon no existe."
}

const catchable_handle_for_the_error_generico = (err) => {
    console.error(err)
    document.getElementById("error").innerText = "\nError."
}