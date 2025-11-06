// Docker Manager for DigitizedBrains AI Agent
// Manages Docker container lifecycle for AI Agent

class DockerManager {
  constructor() {
    this.containerName = 'digitized-brains-ai-agent';
    this.imageName = 'applied-agents-groq-fixed';
    this.port = '7860';
    this.isRunning = false;
    this.checkInterval = null;
    
    console.log('Docker Manager initialized');
  }

  // Check if Docker container is running
  async checkContainerStatus() {
    try {
      const response = await fetch(`http://localhost:${this.port}`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      this.isRunning = true;
      return true;
    } catch (error) {
      this.isRunning = false;
      return false;
    }
  }

  // Start Docker container via PowerShell command
  async startContainer() {
    console.log('Starting AI Agent Docker container...');
    
    const startCommand = `docker run -d --name ${this.containerName} -p ${this.port}:${this.port} ${this.imageName}`;
    
    try {
      // First, stop and remove existing container if any
      await this.stopContainer(true);
      
      // Execute PowerShell command to start Docker
      const script = `
        try {
          $result = Invoke-Expression "${startCommand}"
          if ($LASTEXITCODE -eq 0) {
            Write-Output "Container started successfully: $result"
          } else {
            Write-Error "Failed to start container"
          }
        } catch {
          Write-Error "Error starting container: $_"
        }
      `;
      
      // Create a temporary PowerShell script
      const scriptPath = 'C:\\temp\\start-ai-agent.ps1';
      const fs = require('fs');
      fs.writeFileSync(scriptPath, script);
      
      // Execute via PowerShell
      const { exec } = require('child_process');
      exec(`powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error starting container:', error);
          this.showErrorMessage('Failed to start AI Agent. Please ensure Docker is running.');
          return;
        }
        console.log('Container start output:', stdout);
        this.waitForContainer();
      });
      
    } catch (error) {
      console.error('Error in startContainer:', error);
      this.showErrorMessage('Failed to start AI Agent. Please check Docker installation.');
    }
  }

  // Stop Docker container
  async stopContainer(silent = false) {
    try {
      const { exec } = require('child_process');
      exec(`docker stop ${this.containerName} && docker rm ${this.containerName}`, (error, stdout, stderr) => {
        if (!silent && error) {
          console.warn('Container may not exist:', error.message);
        } else if (!silent) {
          console.log('Container stopped successfully');
        }
      });
    } catch (error) {
      if (!silent) console.error('Error stopping container:', error);
    }
  }

  // Wait for container to be ready
  async waitForContainer() {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    const checkReady = async () => {
      attempts++;
      const isReady = await this.checkContainerStatus();
      
      if (isReady) {
        console.log('AI Agent is ready!');
        this.onContainerReady();
        return;
      }
      
      if (attempts < maxAttempts) {
        console.log(`Waiting for AI Agent... (${attempts}/${maxAttempts})`);
        setTimeout(checkReady, 1000);
      } else {
        console.error('Timeout waiting for AI Agent to start');
        this.showErrorMessage('AI Agent took too long to start. Please try again.');
      }
    };
    
    checkReady();
  }

  // Called when container is ready
  onContainerReady() {
    this.isRunning = true;
    this.hideLoadingMessage();
    
    // Open AI Agent in iframe or new window
    const iframe = document.getElementById('ai-agent-iframe');
    if (iframe) {
      iframe.src = `http://localhost:${this.port}`;
    } else {
      // Fallback: open in new window
      window.open(`http://localhost:${this.port}`, '_blank');
    }
    
    // Start monitoring
    this.startMonitoring();
  }

  // Start monitoring container status
  startMonitoring() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    
    this.checkInterval = setInterval(async () => {
      const isRunning = await this.checkContainerStatus();
      if (!isRunning && this.isRunning) {
        console.log('Container stopped unexpectedly');
        this.isRunning = false;
        this.showErrorMessage('AI Agent has stopped. Click to restart.');
      }
    }, 5000); // Check every 5 seconds
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Show loading message
  showLoadingMessage() {
    const message = document.getElementById('ai-agent-loading');
    if (message) {
      message.style.display = 'block';
      message.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <h3>Đang khởi động AI Agent...</h3>
          <p>Vui lòng chờ trong giây lát (khoảng 10-30 giây)</p>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      `;
    }
  }

  // Hide loading message
  hideLoadingMessage() {
    const message = document.getElementById('ai-agent-loading');
    if (message) {
      message.style.display = 'none';
    }
  }

  // Show error message
  showErrorMessage(message) {
    const errorDiv = document.getElementById('ai-agent-error') || this.createErrorDiv();
    errorDiv.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Lỗi khởi động AI Agent</h3>
        <p>${message}</p>
        <button onclick="dockerManager.retryStart()" class="retry-btn">Thử lại</button>
      </div>
    `;
    errorDiv.style.display = 'block';
    this.hideLoadingMessage();
  }

  // Create error div if not exists
  createErrorDiv() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'ai-agent-error';
    errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; display: none;';
    document.body.appendChild(errorDiv);
    return errorDiv;
  }

  // Retry starting container
  async retryStart() {
    const errorDiv = document.getElementById('ai-agent-error');
    if (errorDiv) errorDiv.style.display = 'none';
    
    await this.launchAIAgent();
  }

  // Main launch function
  async launchAIAgent() {
    console.log('Launching AI Agent...');
    
    // Check if already running
    const isRunning = await this.checkContainerStatus();
    if (isRunning) {
      console.log('AI Agent is already running');
      this.onContainerReady();
      return;
    }
    
    // Show loading
    this.showLoadingMessage();
    
    // Start container
    await this.startContainer();
  }

  // Cleanup on page unload
  cleanup() {
    this.stopMonitoring();
    // Note: We don't stop the container on cleanup to allow user to continue using it
  }
}

// Global instance
let dockerManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  dockerManager = new DockerManager();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (dockerManager) dockerManager.cleanup();
  });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockerManager;
}