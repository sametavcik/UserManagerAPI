let loginForm: HTMLFormElement;
let registerForm: HTMLFormElement;
let signUpButton: HTMLInputElement;
let firstname: HTMLInputElement;
let lastname: HTMLInputElement;
let mail: HTMLInputElement;
let pass: HTMLInputElement;
let loginMail: HTMLInputElement;
let loginPass: HTMLInputElement;

document.addEventListener("DOMContentLoaded", (e) => { 
    e.preventDefault();
    signUpButton = document.querySelector('[data-mission="sign-up"]');
    loginForm = document.querySelector("#loginForm")
    registerForm = document.querySelector("#registerForm")

    firstname = document.querySelector("#registerForm [name='firstName']");
    lastname = document.querySelector("#registerForm [name='lastName']");
    mail = document.querySelector("#registerForm [name='email']");
    pass = document.querySelector("#registerForm [name='password']");
    loginMail = document.querySelector("#loginForm [name='email']");
    loginPass = document.querySelector("#loginForm [name='password']");

    loginForm.addEventListener("submit",  async function(event) {   // adding  eventlisteners to tableuser
        event.preventDefault();
        console.log("loginPass", loginPass);
        console.log("loginMail", loginMail);
        const response: Response = await fetch("http://localhost:8080/login", {
            method: "POST",
            body: JSON.stringify({
                email: loginMail.value,
                password: loginPass.value
            }),
            headers: {
                "Content-Type": "application/json"
            },
        credentials: "include"
        });
        let output = await response.json();
        if (response?.ok) {
            console.log("response ok", response.status);
            window.location.href ="/main.html";
        } else {
            let errorText = ""
            Object.entries(output[0].errors).forEach(([key, errors]) => {
                errorText += `${errors[0]}\n`;
            });
            alert(errorText);
            console.log("Error: Response is not OK", response.statusText);
        }
    });

    signUpButton.addEventListener("click",   (event: Event) =>  {
        event.preventDefault()
        loginForm.parentElement.style.display="none";
        registerForm.parentElement.classList.remove('d-none');
        registerForm.parentElement.style.display="block";
    });
    
    registerForm.addEventListener("submit", function(event) {  //when we click add animalbutton on the animal form, we find id of user with using its email then add user's animal
        event.preventDefault();
        addUser();
    });
});

async function addUser() {    // add a new user..

    const response: Response = await fetch(`http://localhost:8080/user`, {
        method: "POST",
        body: JSON.stringify({
            firstName: firstname.value,
            lastName: lastname.value,
            email: mail.value,
            password: pass.value
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
    let output = await response.json();
    if (response?.ok) {
        alert("Succesfull");
        loginForm.parentElement.style.display="block";
        registerForm.parentElement.style.display="none";

        // Clear values...
        firstname.value = "";
        lastname.value = "";
        mail.value = "";
        pass.value = "";
    } else {
        let errorText = ""
        Object.entries(output[0].errors).forEach(([key, errors]) => {
            errorText += `${key} ${errors[0]}\n`;
        });
        alert(errorText);
        console.log("Error: Response is not OK", response.statusText);
    }
}
