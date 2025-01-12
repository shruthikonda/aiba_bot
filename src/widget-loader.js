// Chat Widget Loader
(function() {
  // Create global namespace for the widget
  window.ChatWidget = {
    init: function() {
      // Get the current script tag and client ID
      const currentScript = document.currentScript;
      const clientId = currentScript?.getAttribute('data-client-id');
      
      if (!clientId) {
        console.error('ChatWidget: data-client-id attribute is required');
        return;
      }

      // Create and inject required styles
      const style = document.createElement('style');
      style.textContent = `
        #chat-widget-container {
          position: fixed;
          z-index: 999999;
          right: 20px;
          bottom: 20px;
        }
        
        @keyframes chat-widget-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        #chat-widget-container {
          animation: chat-widget-fade-in 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);

      // Create container for the widget
      const container = document.createElement('div');
      container.id = 'chat-widget-container';
      document.body.appendChild(container);

      // Load required scripts
      this.loadScripts(clientId);
    },

    loadScripts: function(clientId) {
      const scripts = [
        'runtime.js',
        'polyfills.js',
        'main.js'
      ];

      const baseUrl = this.getBaseUrl();
      let loaded = 0;

      scripts.forEach(script => {
        const scriptElement = document.createElement('script');
        scriptElement.src = `${baseUrl}/${script}`;
        scriptElement.async = true;
        
        scriptElement.onload = () => {
          loaded++;
          if (loaded === scripts.length) {
            this.initializeWidget(clientId);
          }
        };
        
        scriptElement.onerror = (error) => {
          console.error(`Failed to load ${script}:`, error);
        };
        
        document.body.appendChild(scriptElement);
      });
    },

    getBaseUrl: function() {
      const scripts = document.getElementsByTagName('script');
      const currentScript = scripts[scripts.length - 1];
      const scriptUrl = currentScript.src;
      return scriptUrl.substring(0, scriptUrl.lastIndexOf('/'));
    },

    initializeWidget: function(clientId) {
      const app = document.createElement('app-chat-widget');
      app.setAttribute('clientId', clientId);
      
      const container = document.getElementById('chat-widget-container');
      if (container) {
        container.appendChild(app);
      }
    }
  };

  // Auto-initialize when script loads
  window.ChatWidget.init();
})();