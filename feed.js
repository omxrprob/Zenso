// js/feed.js

document.addEventListener('DOMContentLoaded', () => {
    // Basic auth check
    auth.onAuthStateChanged(user => {
        if (user) {
            loadFeed();
        } else {
            window.location.href = 'index.html';
        }
    });
});

function loadFeed() {
    const feedArea = document.getElementById('video-feed-area');
    // Clear previous content but keep the navbar
    const navBar = feedArea.querySelector('nav').outerHTML; 
    feedArea.innerHTML = navBar; 

    // Query posts that have finished processing (status is 'complete' after compression)
    // NOTE: Since you are skipping the Cloud Function, we will display *all* posts 
    // using the temporary original URL, but this MUST be fixed for production.
    db.collection("posts")
        .orderBy("createdAt", "desc")
        .limit(10) 
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                feedArea.innerHTML += '<h2>No videos yet!</h2><p>Be the first to upload one.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const post = doc.data();
                
                // --- ⚠️ COMPRESSION TEMPORARY WORKAROUND ---
                // In production, you would check for post.compressedVideoUrl.
                // For now, we fetch the original file's URL to make the feed work.
                
                const originalFilePath = post.originalFilePath; 
                if (originalFilePath) {
                    storage.ref(originalFilePath).getDownloadURL().then(videoUrl => {
                        const postElement = createVideoPostElement(post, videoUrl);
                        feedArea.appendChild(postElement);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error loading feed:", error);
            feedArea.innerHTML += '<h2 class="error">Error loading feed.</h2>';
        });
}

function createVideoPostElement(post, videoUrl) {
    const postDiv = document.createElement('div');
    postDiv.className = 'video-post';

    // Placeholder for author name
    let authorName = 'Loading...';
    
    // Fetch author name concurrently
    db.collection("users").doc(post.userId).get().then(userDoc => {
        if (userDoc.exists) {
            authorName = userDoc.data().name;
            // Update the author text once fetched
            const authorEl = postDiv.querySelector('.post-author');
            if(authorEl) authorEl.textContent = `By: ${authorName}`;
        }
    });

    postDiv.innerHTML = `
        <video class="video-player" src="${videoUrl}" controls loop muted autoplay></video>
        <div class="post-details">
            <p class="post-caption">${post.caption}</p>
            <p class="post-author">By: ${authorName}</p>
            <small>Status: ${post.status}. (Compression required for optimal size!)</small>
        </div>
    `;
    
    // Auto-play/mute logic (optional for a real TikTok feel)
    const videoElement = postDiv.querySelector('.video-player');
    
    // Using IntersectionObserver for the TikTok auto-play effect
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                videoElement.play().catch(e => console.log("Autoplay blocked:", e));
            } else {
                videoElement.pause();
            }
        });
    }, { threshold: 0.8 }); // 80% of video must be visible

    observer.observe(postDiv);

    return postDiv;
}
