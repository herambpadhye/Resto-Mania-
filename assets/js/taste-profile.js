import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
    });

    const tasteProfileForm = document.getElementById('tasteProfileForm');
    
    tasteProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tasteProfile = {
            userId: auth.currentUser.uid,
            favoriteCuisine: document.getElementById('favoriteCuisine').value.trim(),
            favoriteDish: document.getElementById('favoriteDish').value.trim(),
            dietaryRestrictions: document.getElementById('dietaryRestrictions').value.trim(),
            allergies: document.getElementById('allergies').value.trim(),
            spicePreference: document.querySelector('input[name="spice"]:checked').value
        };

        try {
            // Here you would typically save to Firebase
            console.log('Saving taste profile:', tasteProfile);
            
            // Show success message
            alert('Profile saved successfully!');
            
            // Redirect to home page after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000); // 1 second delay

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error saving profile. Please try again.');
        }
    });
});
