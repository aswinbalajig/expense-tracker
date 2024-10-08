document.getElementById('ConfirmPassword').addEventListener('input', validateForm);
        document.getElementById('username').addEventListener('input', validateForm);
        document.getElementById('InputEmail').addEventListener('input', validateForm);
        document.getElementById('InputPassword').addEventListener('input', validateForm);
        
        async function validateForm() {
            const password = document.getElementById('InputPassword').value;
            const confirmPassword = document.getElementById('ConfirmPassword').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('InputEmail').value;
            const submitButton = document.querySelector('button[type="submit"]');
            const errorMessages = document.getElementById('errorMessages');

            errorMessages.innerHTML = '';

            const usernamePattern = /^[a-zA-Z0-9@.+_-]{1,150}$/;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (username.length > 150) {
                errorMessages.innerHTML += '<p>Username should be less than 150 characters</p>';
            }
            if (!emailPattern.test(email)) {
                errorMessages.innerHTML += '<p>Please enter a valid email address.</p>';
            }
            if (!usernamePattern.test(username)) {
                errorMessages.innerHTML += '<p>Username must be 150 characters or fewer and can only contain letters, digits, and @/./+/-/_.</p>';
            }
            if (password.length < 8) {
                errorMessages.innerHTML += '<p>Password must be at least 8 characters long.</p>';
            }
            if (password !== confirmPassword) {
                errorMessages.innerHTML += '<p>Passwords do not match.</p>';
            }

            if (errorMessages.innerHTML !== '') {
                submitButton.disabled = true;
                submitButton.classList.remove('btn-primary');
                submitButton.classList.add('btn-danger');
            } else {
                submitButton.disabled = false;
                submitButton.classList.remove('btn-danger');
                submitButton.classList.add('btn-primary');
            }
        }

        document.getElementById('registrationForm').addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission

            const username = document.getElementById('username').value;
            const email = document.getElementById('InputEmail').value;
            const password = document.getElementById('InputPassword').value;
            const errorMessages = document.getElementById('errorMessages');

           
            errorMessages.innerHTML = '';

            try {
                const response = await fetch('http://127.0.0.1:8000/auth/users/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        username: username,
                        password: password,
                    }),
                });

                
                if (!response.ok) {
                    const errorData = await response.json();
                    if (errorData.email) {
                        errorData.email.forEach(msg => {
                            errorMessages.innerHTML += `<p>${msg}</p>`;
                        });
                    }
                    if (errorData.username) {
                        errorData.username.forEach(msg => {
                            errorMessages.innerHTML += `<p>${msg}</p>`;
                        });
                    }
                    throw new Error('Registration failed');
                }

                
                const loginResponse = await fetch('http://127.0.0.1:8000/auth/jwt/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (loginResponse.ok) {
                    const data = await loginResponse.json();
                    localStorage.setItem('accessToken', data.access);
                    localStorage.setItem('refreshToken', data.refresh);
                    window.location.href = '../html/homepage.html'; 
                } else {
                    const errorData = await loginResponse.json();
                    //console.error('Login failed:', errorData);
                    alert('Login failed: ' + errorData.non_field_errors[0]); 
                }

            } catch (error) {
                
                errorMessages.innerHTML += `<p>${error.message}</p>`;//adding this to check if any other errors occured
            }
        });