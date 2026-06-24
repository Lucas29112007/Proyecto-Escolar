// ======================
// LABEL BUSCADOR
// ======================

const inputs = document.querySelectorAll(".busqueda input");

inputs.forEach(input => {

    input.setAttribute("placeholder", " ");

});

// ======================
// AGREGAR LINK
// ======================

function agregarLink(){

    let url = prompt("Ingrese URL:");

    if(url){

        document.execCommand(
            "createLink",
            false,
            url
        );

    }

}