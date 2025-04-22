document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".login-button");
  
    if (loginButton) {
      loginButton.addEventListener("click", function (event) {
        const email = document.querySelector('input[name="email"]')?.value.trim();
        const password = document.querySelector('input[name="password"]')?.value.trim();
        const designation = document.querySelector('select[name="designation"]')?.value;
  

        if (!email || !password || !designation || designation === "select designation") {
          event.preventDefault();
          alert("Please fill first");
          return;
        }
  
       
        if (!(email.includes("@") && email.indexOf("@") < email.lastIndexOf("."))) {
          event.preventDefault();
          alert("Please enter a valid email");
          return;
        }
  
      
      });
    } else {
      console.error("Login button not found in the DOM.");
    }
  });
