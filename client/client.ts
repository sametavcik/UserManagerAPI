
let loginForm: HTMLFormElement;
let userEmail: HTMLInputElement;
let userPassword: HTMLInputElement;

document.addEventListener("DOMContentLoaded", () => { 
    loginForm = document.querySelector("#loginForm") as HTMLFormElement;
    userEmail = document.querySelector("#userEmail") as HTMLInputElement;
    userPassword = document.querySelector("#userPassword") as HTMLInputElement;

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = userEmail.value;
        const password = userPassword.value;
        console.log("email",email);
        console.log("password",password);
        login(email, password);
    });
  
});

async function login(email, password){

    try {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Oturum bilgilerini istekle birlikte gönder
        });

        if (response?.ok) {
            console.log("Login successful");
            console.log(response)
            await fetchUserData();
            //window.location.href = 'http://127.0.0.1:5500/main.html';
        } else {
            const errorText = await response.text();
            console.error("Login failed:", errorText);
            // Show error message to user
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function fetchUserData() {
    try {
        console.log("Fetch user");
        const response = await fetch("http://localhost:8080/user", {
            credentials: "include" // Oturum bilgilerini istekle birlikte gönder
        });
       
        if (response?.ok) {
            const userData = await response.json();
            console.log("User data:", userData);
            // userData'ı kullanarak gerekli işlemleri gerçekleştirin
        } else {
            console.error("Failed to fetch user data");
            // Hata mesajını kullanıcıya gösterin veya uygun işlemleri gerçekleştirin
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// Başarılı girişten sonra getUser işlevini çağırın
