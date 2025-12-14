// js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('user-email-display').textContent = user.email;
            loadUserProfile(user.uid);
            document.getElementById('update-profile-btn').addEventListener('click', () => updateProfile(user.uid));
        } else {
            window.location.href = 'index.html';
        }
    });
});

function loadUserProfile(userId) {
    // Load data from the 'users' collection in Firestore
    db.collection("users").doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('name-input').value = data.name || '';
                document.getElementById('bio-input').value = data.bio || '';
            }
        }).catch(error => {
            console.error("Error loading user profile:", error);
        });
}

function updateProfile(userId) {
    const newName = document.getElementById('name-input').value.trim();
    const newBio = document.getElementById('bio-input').value.trim();
    const statusEl = document.getElementById('profile-status');

    if (!newName) {
        statusEl.textContent = "Name cannot be empty.";
        return;
    }

    // Update the 'users' collection in Firestore
    db.collection("users").doc(userId).update({
        name: newName,
        bio: newBio,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        statusEl.textContent = "Profile successfully updated!";
        // Also update the core Firebase Auth profile name
        auth.currentUser.updateProfile({
            displayName: newName
        });
    })
    .catch(error => {
        console.error("Error updating profile:", error);
        statusEl.textContent = `Error updating profile: ${error.message}`;
    });
}
