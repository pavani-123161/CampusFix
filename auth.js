document.addEventListener("DOMContentLoaded", () => {

    const loginTab = document.getElementById("loginTab");
    const signupTab = document.getElementById("signupTab");

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");

    const loginMessage = document.getElementById("loginMessage");
    const signupMessage = document.getElementById("signupMessage");


    // Switch to Login
    loginTab.addEventListener("click", () => {

        loginTab.classList.add("active");
        signupTab.classList.remove("active");

        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");

        authTitle.textContent = "Welcome back";
        authSubtitle.textContent =
            "Login to continue to your campus dashboard.";

        clearMessages();
    });


    // Switch to Signup
    signupTab.addEventListener("click", () => {

        signupTab.classList.add("active");
        loginTab.classList.remove("active");

        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");

        authTitle.textContent = "Join CampusFix";
        authSubtitle.textContent =
            "Create your student account and start making a difference.";

        clearMessages();
    });


    // Student Signup
    signupForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const name =
            document.getElementById("signupName").value.trim();

        const email =
            document.getElementById("signupEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("signupConfirmPassword").value;


        if (password !== confirmPassword) {

            showMessage(
                signupMessage,
                "Passwords do not match.",
                "error"
            );

            return;
        }


        const users =
            JSON.parse(localStorage.getItem("campus_users")) || [];


        const existingUser =
            users.find(user => user.email === email);


        if (existingUser) {

            showMessage(
                signupMessage,
                "An account with this email already exists.",
                "error"
            );

            return;
        }


        const newUser = {
            id: "user-" + Date.now(),
            name: name,
            email: email,
            password: password,
            role: "student"
        };


        users.push(newUser);

        localStorage.setItem(
            "campus_users",
            JSON.stringify(users)
        );


        showMessage(
            signupMessage,
            "Account created successfully! You can now login.",
            "success"
        );


        signupForm.reset();


        setTimeout(() => {
            loginTab.click();
        }, 1200);

    });


    // Login
    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("loginPassword").value;

        const selectedRole =
            document.querySelector(
                'input[name="loginRole"]:checked'
            ).value;


        /*
         * Demo admin account.
         *
         * IMPORTANT:
         * This is prototype authentication only.
         * It is NOT secure production authentication.
         */
        const adminAccount = {
            email: "admin@campusfix.demo",
            password: "admin123",
            name: "Campus Administrator",
            role: "admin"
        };


        // Admin login
        if (selectedRole === "admin") {

            if (
                email === adminAccount.email &&
                password === adminAccount.password
            ) {

                createSession(adminAccount);

                showMessage(
                    loginMessage,
                    "Admin login successful!",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 700);

            } else {

                showMessage(
                    loginMessage,
                    "Invalid admin credentials.",
                    "error"
                );
            }

            return;
        }


        // Student login
        const users =
            JSON.parse(localStorage.getItem("campus_users")) || [];


        const user = users.find(
            user =>
                user.email === email &&
                user.password === password &&
                user.role === "student"
        );


        if (!user) {

            showMessage(
                loginMessage,
                "Invalid email or password.",
                "error"
            );

            return;
        }


        createSession(user);


        showMessage(
            loginMessage,
            `Welcome back, ${user.name}!`,
            "success"
        );


        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);

    });


    function createSession(user) {

        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            loginTime: new Date().toISOString()
        };


        localStorage.setItem(
            "campus_current_user",
            JSON.stringify(session)
        );
    }


    function showMessage(element, message, type) {

        element.textContent = message;

        element.className =
            "auth-message " + type;
    }


    function clearMessages() {

        loginMessage.textContent = "";
        loginMessage.className = "auth-message";

        signupMessage.textContent = "";
        signupMessage.className = "auth-message";
    }

});