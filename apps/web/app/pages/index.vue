<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="landing-header">
      <div class="header-container">
        <div class="logo">
          <h1 class="logo-text">BLINK</h1>
        </div>
        <nav class="nav">
          <button class="theme-toggle-btn" @click="toggleTheme" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <ClientOnly>
              <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <template #fallback>
                <div style="width: 20px; height: 20px;" />
              </template>
            </ClientOnly>
          </button>
          <NuxtLink to="/app" class="btn-primary">LAUNCH APP</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">FREE FOREVER</div>
        <h1 class="hero-title">INSTANT FILE SHARING</h1>
        <p class="hero-subtitle">Fast, secure, peer-to-peer file transfer on your local network. No cloud, no tracking, just pure speed.</p>
        <div class="hero-actions">
          <NuxtLink to="/app" class="btn-hero">GET STARTED</NuxtLink>
        </div>
        <div class="announcement">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          <span>Mobile app coming soon</span>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <h3 class="feature-title">SIMPLE & FAST</h3>
          <p class="feature-description">No setup required. Just open and share files instantly across devices on your local network.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3 class="feature-title">SECURE</h3>
          <p class="feature-description">Peer-to-peer connections with WebRTC. Your files never leave your local network.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
          <h3 class="feature-title">LIGHTNING SPEED</h3>
          <p class="feature-description">Direct device-to-device transfer at your network's full bandwidth. No cloud bottleneck.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h3 class="feature-title">CROSS-PLATFORM</h3>
          <p class="feature-description">Works seamlessly on desktop and mobile browsers. Share between any devices.</p>
        </div>

        <div class="feature-card feature-card-soon">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <h3 class="feature-title">MOBILE APP</h3>
          <p class="feature-description">Native iOS and Android apps coming soon for even better performance.</p>
          <span class="badge-soon">COMING SOON</span>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-content">
        <p class="text-mono">CREATED BY <a href="https://leighdinaya.dev" target="_blank" rel="noopener" class="footer-link">LEIGH DINAYA</a></p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Header */
.landing-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  backdrop-filter: blur(8px);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-text {
  font-family: var(--font-sans);
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: -0.05em;
  margin: 0;
}

.nav {
  display: flex;
  gap: var(--space-4);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.5rem;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  background: var(--text-primary);
  color: var(--bg-primary);
  border: 1px solid var(--text-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: transparent;
  color: var(--text-primary);
}

/* Hero Section */
.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(4rem, 12vh, 8rem) var(--space-8);
  text-align: center;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  margin-bottom: var(--space-4);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: var(--text-primary);
  color: var(--bg-primary);
  border-radius: 999px;
}

:global(.dark) .hero-badge {
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(0, 255, 255, 0.3));
  color: var(--text-primary);
  border: 1px solid rgba(0, 255, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.hero-title {
  font-family: var(--font-sans);
  font-weight: 900;
  font-size: clamp(2.5rem, 8vw, 5rem);
  letter-spacing: -0.05em;
  line-height: 1.1;
  margin-bottom: var(--space-6);
}

.hero-subtitle {
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-8);
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}

.btn-hero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.5rem;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: 700;
  background: var(--text-primary);
  color: var(--bg-primary);
  border: 2px solid var(--text-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-hero:hover {
  background: transparent;
  color: var(--text-primary);
  transform: translateY(-2px);
}

.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

/* Announcement */
.announcement {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

:global(.dark) .announcement {
  background: rgba(22, 22, 42, 0.5);
  border-color: rgba(255, 0, 255, 0.2);
}

.announcement svg {
  flex-shrink: 0;
}

/* Features Section */
.features {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(3rem, 8vh, 6rem) var(--space-8);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.feature-card {
  padding: var(--space-8);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  position: relative;
}

.feature-card:hover {
  border-color: var(--text-primary);
  transform: translateY(-4px);
}

.feature-card-soon {
  opacity: 0.7;
}

.feature-icon {
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.feature-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.feature-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.badge-soon {
  display: inline-block;
  margin-top: var(--space-3);
  padding: 0.25rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  background: var(--text-primary);
  color: var(--bg-primary);
  border-radius: 999px;
  letter-spacing: 0.05em;
}

/* Footer */
.landing-footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8);
  border-top: 1px solid var(--border-primary);
}

.footer-content {
  text-align: center;
}

.footer-content p {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
}

.footer-link {
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.footer-link:hover {
  border-bottom-color: var(--text-primary);
}

/* Dark Mode Enhancements */
:global(.dark) .feature-card {
  background: rgba(22, 22, 42, 0.5);
  border-color: rgba(255, 0, 255, 0.15);
}

:global(.dark) .feature-card:hover {
  border-color: rgba(0, 255, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
}

:global(.dark) .feature-icon {
  filter: drop-shadow(0 0 8px currentColor);
}

:global(.dark) .badge-soon {
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(0, 255, 255, 0.3));
  color: var(--text-primary);
  border: 1px solid rgba(0, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: var(--space-4) var(--space-6);
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .btn-primary {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }

  .hero {
    padding: clamp(3rem, 8vh, 5rem) var(--space-6);
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn-hero {
    width: 100%;
    max-width: 300px;
  }

  .features {
    padding: clamp(2rem, 6vh, 4rem) var(--space-6);
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .feature-card {
    padding: var(--space-6);
  }

  .landing-footer {
    padding: var(--space-6);
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: var(--space-3) var(--space-4);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
