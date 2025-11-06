// AI Agent Launcher - Standalone Web Application
// Launches AI Agent without requiring Docker

class AIAgentLauncher {
  constructor() {
    this.agentUrl = 'https://ducnguyen1978-digitizedgemini.hf.space';
    this.localPort = '7860';
    this.isLocalAvailable = false;
    this.fallbackMode = false;
    
    console.log('AI Agent Launcher initialized');
  }

  // Check if local Docker container is running
  async checkLocalAgent() {
    try {
      const response = await fetch(`http://localhost:${this.localPort}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      this.isLocalAvailable = true;
      return true;
    } catch (error) {
      this.isLocalAvailable = false;
      return false;
    }
  }

  // Launch AI Agent with fallback options
  async launchAIAgent() {
    console.log('Launching AI Agent...');
    
    this.showLoadingMessage();
    
    // First, try local Docker container
    const localAvailable = await this.checkLocalAgent();
    
    if (localAvailable) {
      console.log('Using local Docker container');
      this.loadAgent(`http://localhost:${this.localPort}`);
    } else {
      console.log('Local container not available, using Hugging Face Space');
      this.fallbackMode = true;
      this.loadAgent(this.agentUrl);
    }
  }

  // Load AI Agent in iframe or new window
  loadAgent(url) {
    const container = document.getElementById('ai-agent-container');
    const iframe = document.getElementById('ai-agent-iframe');
    
    if (container && iframe) {
      // Load in iframe
      iframe.src = url;
      iframe.onload = () => {
        console.log('AI Agent loaded successfully');
        this.hideLoadingMessage();
        this.showAgent();
      };
      
      iframe.onerror = () => {
        console.error('Failed to load AI Agent');
        if (!this.fallbackMode) {
          console.log('Retrying with Hugging Face Space');
          this.fallbackMode = true;
          this.loadAgent(this.agentUrl);
        } else {
          this.showErrorMessage('Không thể kết nối với AI Agent. Vui lòng thử lại sau.');
        }
      };
      
      // Set timeout for loading
      setTimeout(() => {
        if (iframe.src && !iframe.contentDocument) {
          console.log('Loading timeout, showing interface anyway');
          this.hideLoadingMessage();
          this.showAgent();
        }
      }, 5000);
      
    } else {
      // Fallback: open in new window
      console.log('Opening in new window');
      window.open(url, '_blank', 'width=800,height=600');
      this.hideLoadingMessage();
    }
  }

  // Show AI Agent interface
  showAgent() {
    const container = document.getElementById('ai-agent-container');
    if (container) {
      container.style.display = 'block';
      container.classList.add('show');
    }
  }

  // Hide AI Agent interface
  hideAgent() {
    const container = document.getElementById('ai-agent-container');
    if (container) {
      container.style.display = 'none';
      container.classList.remove('show');
    }
  }

  // Show loading message
  showLoadingMessage() {
    let loadingDiv = document.getElementById('ai-agent-loading');
    if (!loadingDiv) {
      loadingDiv = this.createLoadingDiv();
    }
    
    loadingDiv.innerHTML = `
      <div class="loading-container">
        <div class="loading-animation">
          <div class="brain-loading">
            <div class="brain-emoji">🧠</div>
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
        <div class="loading-text">
          <h3>Đang khởi động AI Agent...</h3>
          <p>${this.fallbackMode ? 'Đang kết nối với Hugging Face Space...' : 'Đang kiểm tra Docker container...'}</p>
        </div>
      </div>
    `;
    loadingDiv.style.display = 'flex';
  }

  // Hide loading message
  hideLoadingMessage() {
    const loadingDiv = document.getElementById('ai-agent-loading');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }

  // Show error message
  showErrorMessage(message) {
    let errorDiv = document.getElementById('ai-agent-error');
    if (!errorDiv) {
      errorDiv = this.createErrorDiv();
    }
    
    errorDiv.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Không thể khởi động AI Agent</h3>
        <p>${message}</p>
        <div class="error-actions">
          <button onclick="aiAgentLauncher.retryLaunch()" class="retry-btn">Thử lại</button>
          <button onclick="aiAgentLauncher.openExternal()" class="external-btn">Mở trang ngoài</button>
        </div>
      </div>
    `;
    errorDiv.style.display = 'flex';
    this.hideLoadingMessage();
  }

  // Create loading div
  createLoadingDiv() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'ai-agent-loading';
    loadingDiv.className = 'ai-agent-overlay';
    document.body.appendChild(loadingDiv);
    return loadingDiv;
  }

  // Create error div
  createErrorDiv() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'ai-agent-error';
    errorDiv.className = 'ai-agent-overlay';
    document.body.appendChild(errorDiv);
    return errorDiv;
  }

  // Retry launch
  async retryLaunch() {
    this.hideErrorMessage();
    this.fallbackMode = false;
    await this.launchAIAgent();
  }

  // Open in external window
  openExternal() {
    window.open(this.agentUrl, '_blank');
    this.hideErrorMessage();
  }

  // Hide error message
  hideErrorMessage() {
    const errorDiv = document.getElementById('ai-agent-error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  // Close AI Agent
  closeAgent() {
    this.hideAgent();
    const iframe = document.getElementById('ai-agent-iframe');
    if (iframe) {
      iframe.src = 'about:blank';
    }
  }
}

// Global instance
let aiAgentLauncher;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  aiAgentLauncher = new AIAgentLauncher();
  console.log('AI Agent Launcher ready');
});

// CSS Styles for AI Agent Launcher
const launcherStyles = `
  .ai-agent-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(10px);
  }

  .loading-container, .error-container {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    max-width: 400px;
    width: 90%;
  }

  .loading-animation {
    margin-bottom: 20px;
  }

  .brain-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .brain-emoji {
    font-size: 48px;
    animation: brainPulse 2s ease-in-out infinite;
  }

  .loading-dots {
    display: flex;
    gap: 8px;
  }

  .loading-dots span {
    width: 10px;
    height: 10px;
    background: #667eea;
    border-radius: 50%;
    animation: dotBounce 1.4s ease-in-out infinite both;
  }

  .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
  .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
  .loading-dots span:nth-child(3) { animation-delay: 0s; }

  .loading-text h3, .error-container h3 {
    color: #334155;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 10px 0;
  }

  .loading-text p, .error-container p {
    color: #64748b;
    font-size: 16px;
    margin: 0;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .error-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .retry-btn, .external-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  .external-btn {
    background: #f8fafc;
    color: #334155;
    border: 1px solid #e2e8f0;
  }

  .external-btn:hover {
    background: #f1f5f9;
  }

  #ai-agent-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: white;
    display: none;
  }

  #ai-agent-container.show {
    display: block;
    animation: slideIn 0.3s ease-out;
  }

  #ai-agent-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  @keyframes brainPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes dotBounce {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = launcherStyles;
document.head.appendChild(styleSheet);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIAgentLauncher;
}