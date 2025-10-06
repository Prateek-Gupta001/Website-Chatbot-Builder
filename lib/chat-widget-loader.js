
// Wait for page to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}

function initWidget() {
  // Step 1: Create container
  const container = document.createElement('div');
  container.id = 'chat-widget-root';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  document.body.appendChild(container);
  
  // Step 2: Attach Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' });
  
  // Step 3: Create mount point inside Shadow DOM
  const mountPoint = document.createElement('div');
  mountPoint.id = 'widget-mount';
  shadowRoot.appendChild(mountPoint);
  
  // Step 4: Load React bundle
  loadReactWidget(shadowRoot, mountPoint);
}

function loadReactWidget(shadowRoot, mountPoint) {
  // Load CSS first (scoped to Shadow DOM)
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'https://cdn.yoursite.com/chat-widget.css';
  shadowRoot.appendChild(style);
  
  // Load React bundle
  const script = document.createElement('script');
  script.src = 'https://cdn.yoursite.com/chat-widget.js';
  script.onload = function() {
    // When loaded, initialize React app
    if (window.ChatWidget && window.ChatWidget.init) {
      window.ChatWidget.init(mountPoint, window.ChatWidgetConfig);
    }
  };
  document.body.appendChild(script);  // ← Changed this!
}


//So basically this script is going to be there on a cdn. 
//Embed.js calls this script. 
//This script calls the react bundle script which we now need and need to code. 
