# Deployment Instructions

## Manual Deployment to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (can sign up with GitHub)

### Steps to Deploy

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create a new repository named `manufacturing-tracker`
   - Don't initialize with README (since we already have code)

2. **Push Code to GitHub**
   ```bash
   cd "C:\Users\green\CascadeProjects\manufacturing-tracker"
   git remote add origin https://github.com/YOUR_USERNAME/manufacturing-tracker.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your `manufacturing-tracker` repository
   - Vercel will auto-detect it's a Vite React project
   - Click "Deploy"

### Automatic Deployments
Once connected, Vercel will automatically deploy on every push to the main branch.

### Build Settings (Auto-detected)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables (if needed)
No environment variables required for the current setup.

### PWA Features
The app includes PWA capabilities:
- Service Worker for offline functionality
- Web App Manifest for installability
- Responsive design for mobile/tablet use

### Sharing with Team
After deployment, you'll get:
- **Production URL**: `https://manufacturing-tracker-xxx.vercel.app`
- **Preview URLs**: For each pull request
- **Dashboard**: Monitor deployments at vercel.com