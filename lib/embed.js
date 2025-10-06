function somefunction() {
    window.ChatWidgetConfig = {
      apiUrl: import.meta.env.VITE_CHAT_BACKEND,

      PUBLIC_API_KEY: 'your-public-api-key',
      position: 'bottom-right'
    };
    
    var script = document.createElement('script');
    script.src = 'https://cdn.yoursite.com/chat-widget-loader.js';
    script.async = true;
    document.head.appendChild(script);
  }
