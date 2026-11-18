import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const API_BASE_URL = 'http://sufficient-misty-cppnomnomstation-293dc6c4.koyeb.app/api';

// Helper function to validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Helper function to show error
function showError(message) {
    alert(message);
}

// Add check for auth initialization
function checkAuth() {
    if (!auth) {
        console.error('Auth not initialized');
        alert('Authentication service not available. Please try again later.');
        return false;
    }
    return true;
}

// Add error message display function
function showErrorMessage(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        // Remove the timeout to make error message persist
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Helper function to register user with the backend API - simplified approach
async function registerUserWithBackend(uid, fullName, email) {
    console.log('Registering user with backend:', uid, fullName, email);
    
    // Create the user data
    const userData = {
        client_id: uid,
        name: fullName,
        mail_id: email
    };
    
    // Always store locally first as backup
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', uid);
    localStorage.setItem('currentUser', JSON.stringify({
        client_id: uid,
        name: fullName,
        mail_id: email,
        registration_date: new Date().toISOString()
    }));
    
    // Log request information for debugging
    console.log('Sending API request with payload:', userData);
    
    try {
        // Direct API call - using the proven approach from your working example
        const response = await fetch('https://sufficient-misty-cppnomnomstation-293dc6c4.koyeb.app/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        console.log('Response status:', response.status);
        
        // Handle specific error cases
        if (response.status === 500) {
            throw new Error('Server error (500): There was a problem with the server. Registration stored locally.');
        }
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error ${response.status}: ${text || response.statusText}`);
        }
        
        // Parse success response
        const data = await response.json();
        console.log('API registration successful:', data);
        return { success: true, data };
        
    } catch (error) {
        console.warn('API registration failed:', error.message);
        
        // Return local storage result but flag that API call failed
        return { 
            localOnly: true, 
            message: "Registration stored locally. API connection failed: " + error.message,
            userData
        };
    }
}

// Signup Functionality
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!checkAuth()) return;
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('error-message');

        // Clear previous messages
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }

        try {
            // Basic validation
            if (!fullName) {
                throw new Error('Please enter your full name');
            }

            if (!email || !validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            if (!password) {
                throw new Error('Please enter a password');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Show loading state and info message
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Creating Account...';
                if (submitButton.classList.contains('auth-button')) {
                    submitButton.classList.add('loading');
                }
            }

            if (errorDiv) {
                errorDiv.textContent = 'Please wait while we set up your account...';
                errorDiv.style.display = 'block';
                errorDiv.style.color = '#069C54';
                errorDiv.style.backgroundColor = 'rgba(6, 156, 84, 0.1)';
                errorDiv.style.border = '1px solid rgba(6, 156, 84, 0.3)';
            }

            // 1. Create Firebase account
            console.log('Creating Firebase user account...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Firebase signup successful:', userCredential.user);
            
            // 2. Register with backend API - using simplified method
            console.log('Registering with backend API...');
            const registrationResult = await registerUserWithBackend(
                userCredential.user.uid,
                fullName,
                email
            );
            
            // 3. Store user info regardless of API success
            localStorage.setItem('userName', fullName);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userId', userCredential.user.uid);
            localStorage.setItem('isNewUser', 'true');
            sessionStorage.setItem('fromSignup', 'true');
            
            // 4. Log results to console for debugging
            console.log('Registration complete. Results:', {
                firebase: userCredential.user.uid,
                api: registrationResult
            });
            
            // 5. Redirect to taste profile page instead of success page
            console.log('Redirecting to taste profile page...');
            window.location.href = 'taste-profile.html';
            
        } catch (error) {
            console.error('Signup error:', error);
            
            // Reset error div style and show error message
            if (errorDiv) {
                errorDiv.style.color = '#dc3545';
                errorDiv.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                errorDiv.style.border = '1px solid rgba(220, 53, 69, 0.3)';
                errorDiv.textContent = error.message.replace('Firebase: ', '');
                errorDiv.style.display = 'block';
            } else {
                showError(error.message.replace('Firebase: ', ''));
            }
            
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
                if (submitButton.classList.contains('auth-button')) {
                    submitButton.classList.remove('loading');
                }
            }
        }
    });
}

// Login Functionality
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        const submitButton = loginForm.querySelector('button[type="submit"]');

        try {
            // Clear previous error and disable button
            errorDiv.style.display = 'none';
            submitButton.disabled = true;
            submitButton.classList.add('loading');

            // Basic validation
            if (!email || !validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            if (!password) {
                throw new Error('Please enter your password');
            }

            // Set persistence and attempt login
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            if (userCredential && userCredential.user) {
                sessionStorage.setItem('isLoggedIn', 'true');
                
                // Remove admin check and redirect
                window.location.href = 'index.html';
                return;
            }

        } catch (error) {
            console.error('Login error:', error);
            let errorMessage;
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message || 'Login failed. Please try again.';
            }
            
            showErrorMessage(errorMessage);
            
        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    });
}

// Forgot Password Functionality
const forgotPasswordLink = document.getElementById('forgot-password-link');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const closeButtons = document.getElementsByClassName('close');

// Show forgot password modal
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
    });
}

// Close modal functionality
Array.from(closeButtons).forEach(button => {
    button.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
});

// Handle forgot password submit
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!checkAuth()) return;
        
        const email = document.getElementById('forgotEmail').value.trim();

        if (!email) {
            showError('Please enter an email address');
            return;
        }

        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent! Please check your inbox.');
            forgotPasswordModal.style.display = 'none';
        } catch (error) {
            console.error('Password reset error:', error);
            showError(error.message.replace('Firebase: ', ''));
        }
    });
}

export { auth };
