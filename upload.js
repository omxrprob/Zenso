// js/upload.js

document.addEventListener('DOMContentLoaded', () => {
    // Basic auth check
    auth.onAuthStateChanged(user => {
        if (!user) { window.location.href = 'index.html'; }
    });

    document.getElementById('upload-btn').addEventListener('click', handleUpload);
});

function handleUpload() {
    const file = document.getElementById('video-file-input').files[0];
    const caption = document.getElementById('caption-input').value;
    const statusEl = document.getElementById('upload-status');
    const progressBar = document.getElementById('upload-progress-fill');
    const user = auth.currentUser;

    if (!user || !file || caption.trim() === "") {
        statusEl.textContent = "Please select a file, enter a caption, and be logged in.";
        return;
    }

    // Reset UI
    statusEl.textContent = "Starting upload...";
    progressBar.style.width = '0%';
    document.getElementById('upload-btn').disabled = true;

    // 1. Initial Upload to Firebase Storage
    const storageRef = storage.ref();
    // Use an "original" filename to clearly mark files that need compression
    const fileName = `${user.uid}/${Date.now()}_original_${file.name}`;
    const videoRef = storageRef.child(fileName);

    const uploadTask = videoRef.put(file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
        (snapshot) => {
            // Update progress bar
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = `${progress}%`;
            statusEl.textContent = `Upload is ${progress.toFixed(0)}% complete. (File size: ${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        }, 
        (error) => {
            // Handle unsuccessful uploads
            console.error("Upload failed:", error);
            statusEl.textContent = `Upload failed: ${error.message}`;
            document.getElementById('upload-btn').disabled = false;
        }, 
        () => {
            // 2. Upload completed successfully.
            statusEl.textContent = "Upload successful. Compression is now REQUIRED.";
            
            // --- ⚠️ COMPRESSION MANDATORY (Placeholder) ---
            console.warn("MANDATORY COMPRESSION REQUIRED: The original file is uploaded. A serverless function (like GCF) must be triggered to compress and delete this large file.");
            
            // 3. Save initial post record to Firestore
            db.collection("posts").add({
                userId: user.uid,
                caption: caption,
                originalFilePath: fileName, 
                // Set status to 'pending' as it awaits compression
                status: "pending_compression", 
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                statusEl.textContent = "Video submitted! It is currently being processed for compression and will appear on the feed soon.";
                document.getElementById('upload-btn').disabled = false;
                document.getElementById('video-file-input').value = '';
                document.getElementById('caption-input').value = '';
            }).catch(e => {
                console.error("Firestore error:", e);
                statusEl.textContent = "Error saving post data.";
                document.getElementById('upload-btn').disabled = false;
            });
        }
    );
}
