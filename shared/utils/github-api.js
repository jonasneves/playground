/**
 * GitHub Repository API Abstraction
 * Simplifies interactions with GitHub Contents API
 */

class GitHubRepo {
  constructor(owner, repo, token) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
    this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  }

  async getFile(path) {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: atob(data.content),
      sha: data.sha,
      path: data.path,
      name: data.name,
      size: data.size
    };
  }

  async updateFile(path, content, sha, message) {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message || `Update ${path}`,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: sha
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${path}: ${response.statusText}`);
    }

    return response.json();
  }

  async createFile(path, content, message) {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message || `Create ${path}`,
        content: btoa(unescape(encodeURIComponent(content)))
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${path}: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFile(path, sha, message) {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message || `Delete ${path}`,
        sha: sha
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${path}: ${response.statusText}`);
    }

    return response.json();
  }

  async listDirectory(path = '') {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list ${path}: ${response.statusText}`);
    }

    return response.json();
  }

  async getManifest(appPath) {
    try {
      const file = await this.getFile(`${appPath}/manifest.json`);
      return JSON.parse(file.content);
    } catch (error) {
      return null;
    }
  }
}

// Global instance (initialized after auth)
window.repo = null;

function initRepo(token) {
  window.repo = new GitHubRepo('jonasneves', 'duke-capstone', token);
  return window.repo;
}
