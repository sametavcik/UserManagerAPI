
let formEdit: HTMLFormElement;
let inputFName: HTMLInputElement;
let inputLName: HTMLInputElement;
let inputEmail: HTMLInputElement;
let inputPass: HTMLInputElement;
let inputEditFName: HTMLInputElement;
let inputEditLName: HTMLInputElement;
let inputEditEmail: HTMLInputElement;
let formAnimal: HTMLInputElement;
let tableAnimal: HTMLInputElement;
let tierName: HTMLInputElement;
let tierKind: HTMLInputElement;
let tableUser: HTMLElement;


document.addEventListener("DOMContentLoaded", (e) => { 
    e.preventDefault();
    tableUser = document.querySelector("#tableUser");
    formEdit = document.querySelector("#formEdit");;
    inputEditFName = document.querySelector("#formEdit [name='firstname']");
    inputEditLName = document.querySelector("#formEdit [name='lastname']");
    inputEditEmail = document.querySelector("#formEdit [name='email']");
    formAnimal = document.querySelector("#formAnimal");
    tableAnimal = document.querySelector("#tableAnimal");
    tierName = document.querySelector("#formAnimal [name='tierName'] ")
    tierKind = document.querySelector("#formAnimal [name='tierKind'] ")

    formEdit.addEventListener("submit", function(event) { // when we click edit user button we find id of user with using its email then edit user
        event.preventDefault();
        editUser(event);   
        stopEdit(); 
    });

    tableUser.addEventListener("click", (event: Event) => {   // adding  eventlisteners to tableuser
        
        let target: HTMLElement = event.target as HTMLElement;
        target = target.closest("button");
        
        if (target.matches(".showAnimal")) { 
                showAnimal();
        }else if (target.matches(".addAnimal")) {  // closing animals section
                startAnimalAdd();
        }else if (target.matches(".edit")) { 
                startEdit();
        }
    });
   
    renderUserList();

    formAnimal.addEventListener("submit", async function(event) {  //when we click add animalbutton on the animal form, we find id of user with using its email then add user's animal
        event.preventDefault();
        await addAnimal();
        await showAnimal();
        await stopAnimalAdd();
    });

});

async function renderUserList() {   // show all users on screen
    const response: Response = await fetch("http://localhost:8080/user", {
        credentials: "include"
    });
    if (response?.ok) {
        const users = await response.json();
        tableUser.innerHTML = "";

        users.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${user.email}</td>
            <td>${user.lastName}</td>
            <td>${user.firstName}</td>
            <td>
              <button class="btn btn-primary edit" data-email="${user.email}"><i class="fas fa-pen"></i></button>
              <button class="btn btn-primary showAnimal" data-email="${user.email}"><i class="fas fa-paw"></i></button>
              <button class="btn btn-primary addAnimal" data-email="${user.email}"><i class="fa-solid fa-plus"></i></button>
            </td>`;
            tableUser.appendChild(tr);
        });
    } else {
        tableUser.innerHTML = ""
        console.log("Error: Response is not OK", response.statusText);
    }
}

async function showAnimal() {  // Get animals of User
    console.log("show animal");
    const response: Response = await fetch(`http://localhost:8080/user/pets`, {
    method: 'GET',          // HTTP methodunu GET olarak belirleyin
    credentials: 'include'  // İstek ile birlikte kimlik bilgilerini dahil edin
    });
    if (response?.ok) {
        let animals = await response.json();
        tableAnimal.innerHTML = "";

        animals.forEach(animal => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${animal.name}</td>
            <td>${animal.kind}</td>
            <td><button class="btn btn-primary edit" data-animal-id="${animal.id}"><i class="fas fa-trash"></i></button></td>
            <td></td>
            `;
            tableAnimal.appendChild(tr);
        });
    } else {
        console.log("Error: Response is not OK", response.statusText);
    }
}

function startAnimalAdd() {   // assign userId to animal section and open animal section
    formAnimal.style.display = "block";
}

async function addAnimal() {    // post animal to user's animal
    let Name: string = tierName.value
    let Kind: string = tierKind.value

    const response: Response = await fetch(`http://localhost:8080/user/pets`, {
        method: "POST",
        body: JSON.stringify({
            name: Name,
            kind: Kind,
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
    if (response?.ok) {
       
    } else {
        console.log("Error: Response is not OK", response.statusText);
    }

}
function stopAnimalAdd() {   // close animal section
    tierName.value = ""
    tierKind.value = ""
    formAnimal.style.display = "none";
}

async function startEdit() { // open user edit section
    const response: Response = await fetch("http://localhost:8080/user", {
        credentials: "include"
    });

    if (response.ok) {
        console.log("response", response);
        let user = await response.json();
        inputEditFName.value = user[0].firstName;
        inputEditLName.value = user[0].lastName;
        inputEditEmail.value = user[0].email;
        formEdit.style.display = "block";
    } else {
        console.log("Error: Response is not OK", response.statusText);
    }
}
function stopEdit() {   // close user edit section
    formEdit.style.display = "none";
}
async function editUser(event: Event) {  // submit user edit button
    event.preventDefault();
    const response: Response = await fetch(`http://localhost:8080/user/edit-user`, {
            method: "PATCH",
            body: JSON.stringify({
                firstName: inputEditFName.value,
                lastName: inputEditLName.value,
            }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    
    if (response.ok) {
        renderUserList();
    } else {
        console.log("Error: Response is not OK", response.statusText);
    }
    formEdit.style.display = "none";
}