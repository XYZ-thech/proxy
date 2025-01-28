function loadWebsite() {
    const url = document.getElementById('search-input').value;
    const iframe = document.getElementById('website-frame');

    if (url) {
        // Check if the URL starts with "http://" or "https://".
        const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;

        iframe.src = validUrl;
    } else {
        alert("https://www.tiktok.com/foryou.");
    }
}
