/**
 * GitHub Repository API Abstraction with Caching
 */

class GitHubRepo {
  constructor(owner, repo, token) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
    this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    this.cachePrefix = `gh_${owner}_${repo}_`;
    this.cacheTimeout = 300000; // 5 minutes
  }

  getFromCache(path) {
    const cached = localStorage.getItem(this.cachePrefix + path);
    if (!cached) return null;

    try {
      const { content, sha, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > this.cacheTimeout) {
        localStorage.removeItem(this.cachePrefix + path);
        return null;
      }
      return { content, sha, path };
    } catch {
      return null;
    }
  }

  setCache(path, data) {
    try {
      localStorage.setItem(this.cachePrefix + path, JSON.stringify({
        content: data.content,
        sha: data.sha,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  }

  clearCache() {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(this.cachePrefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to ${options.method || 'fetch'} ${path}: ${response.statusText}`);
    }

    return response.json();
  }

  encodeContent(content) {
    return btoa(unescape(encodeURIComponent(content)));
  }

  decodeContent(base64Content) {
    return decodeURIComponent(escape(atob(base64Content)));
  }

  invalidateCache(path) {
    localStorage.removeItem(this.cachePrefix + path);
  }

  async getFile(path) {
    const cached = this.getFromCache(path);
    if (cached) return cached;

    const data = await this.request(path);
    const result = {
      content: this.decodeContent(data.content),
      sha: data.sha,
      path: data.path,
      name: data.name,
      size: data.size
    };

    this.setCache(path, result);
    return result;
  }

  async updateFile(path, content, sha, message) {
    const result = await this.request(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message || `Update ${path}`,
        content: this.encodeContent(content),
        sha
      })
    });

    this.invalidateCache(path);
    return result;
  }

  async createFile(path, content, message) {
    return this.request(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message || `Create ${path}`,
        content: this.encodeContent(content)
      })
    });
  }

  async deleteFile(path, sha, message) {
    const result = await this.request(path, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message || `Delete ${path}`,
        sha
      })
    });

    this.invalidateCache(path);
    return result;
  }

  async listDirectory(path = '') {
    return this.request(path);
  }

  async getManifest(appPath) {
    try {
      const file = await this.getFile(`${appPath}/manifest.json`);
      return JSON.parse(file.content);
    } catch {
      return null;
    }
  }
}

window.repo = null;

function initRepo(token) {
  window.repo = new GitHubRepo('jonasneves', 'duke-capstone', token);
  return window.repo;
}
