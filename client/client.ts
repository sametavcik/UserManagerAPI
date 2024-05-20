
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

        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                console.log("Login successful");
                // Redirect or show success message
            } else {
                const errorText = await response.text();
                console.error("Login failed:", errorText);
                // Show error message to user
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    });
  
});
