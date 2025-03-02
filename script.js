// --- Browser Client Code ---
document.addEventListener('DOMContentLoaded', function () {
    const urlInput = document.getElementById('urlInput');
    const goButton = document.getElementById('goButton');
    const contentFrame = document.getElementById('contentFrame');
    const backButton = document.getElementById('backButton');
    const forwardButton = document.getElementById('forwardButton');
    const refreshButton = document.getElementById('refreshButton');
    let history = [];
    let historyIndex = -1;

   function loadURL(url) {
      if (url && url.trim() !== "") {
          historyIndex++;
          history.splice(historyIndex, history.length - historyIndex, url); // Clears future history

          fetch(`/proxy?url=${encodeURIComponent(url)}`) // Requesting URL through proxy
              .then(response => response.text())
              .then(html => {
                  contentFrame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
              })
              .catch(error => {
                  console.error('Error fetching page:', error);
                  contentFrame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent('<h1>Error loading page</h1><p>' + error + '</p>');
              });

         // Update URL bar to show newly loaded url
          urlInput.value = url;
         // Enable or disable navigation buttons based on history
        backButton.disabled = historyIndex <= 0;
        forwardButton.disabled = historyIndex >= history.length - 1;
       }
   }

  function navigateHistory(offset) {
        if(history[historyIndex + offset]){
            historyIndex += offset;
            loadURL(history[historyIndex]);
        }
        backButton.disabled = historyIndex <= 0;
        forwardButton.disabled = historyIndex >= history.length - 1;
    }

    goButton.addEventListener('click', function () {
        const url = urlInput.value;
        loadURL(url);
    });

    urlInput.addEventListener('keydown', function(event){
      if(event.key === 'Enter'){
          const url = urlInput.value;
          loadURL(url);
        }
    })

    backButton.addEventListener('click', () => {
        navigateHistory(-1);
    });

    forwardButton.addEventListener('click', () => {
        navigateHistory(1);
    });

    refreshButton.addEventListener('click', () => {
      loadURL(history[historyIndex]);
    });

});

// --- Node.js Server Code ---
if (typeof module !== 'undefined' && module.exports) { // Checks if running in Node.js
    const http = require('http');
    const https = require('https');
    const url = require('url');


    // Get port from command line args
    const args = process.argv.slice(2);
    let port = 3000;
    args.forEach((arg, index) => {
        if (arg === '--port') {
            const parsedPort = parseInt(args[index + 1], 10);
            if (!isNaN(parsedPort)) {
                port = parsedPort;
            }
        }
    });
   const hostname = '127.0.0.1';


  const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const targetUrl = parsedUrl.query.url;
        if (req.url.startsWith('/proxy') && targetUrl) {
            const protocol = targetUrl.startsWith('https') ? https : http;
            protocol.get(targetUrl, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/html');
                    res.end(data); // Send data back to the browser
                });
            }).on('error', (err) => {
                  console.error('Error fetching URL:', err);
                  res.statusCode = 500;
                res.end('Error fetching page');
           });
        } else {
              res.statusCode = 404;
              res.end('Not found');
          }
  });

    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}
