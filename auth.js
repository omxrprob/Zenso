// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('google-login-btn');

    if (loginButton) {
        loginButton.addEventListener('click', signInWithGoogle);
    }

    // Redirect authenticated users
    auth.onAuthStateChanged((user) => {
        if (user && window.location.pathname.endsWith('index.html')) {
            window.location.href = 'home.html';
        }
        // If not logged in and not on index.html (e.g., home.html), redirect to login
        if (!user && !window.location.pathname.endsWith('index.html')) {
            window.location.href = 'index.html';
        }
    });
});

function signInWithGoogle() {
    // 1. Create a Google Auth Provider
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // 2. Sign in with the provider
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log("User successfully signed in:", user.displayName);

            // 3. Create/Update a basic profile in Firestore
            db.collection("users").doc(user.uid).get().then(doc => {
                if (!doc.exists) {
                    db.collection("users").doc(user.uid).set({
                        name: user.displayName,
                        bio: "A new Zenso user!",
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            });

        }).catch((error) => {
            console.error("Google Sign-in Error:", error.message);
            alert(`Login failed: ${error.message}`);
        });
}
