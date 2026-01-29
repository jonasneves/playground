# Setup TODO

## Auth0 Configuration Required

The auth module was generated but needs the correct Auth0 Client ID.

### Steps to complete:

1. **Fix Auth0 credentials in setup script**
   - Verify Machine-to-Machine app in Auth0 dashboard
   - Ensure all Auth0 Management API permissions are granted
   - Re-run `node auth-setup/setup.js` with correct credentials

2. **Update public/auth/api.js**
   - Replace `AUTH0_CLIENT_ID = 'undefined'` with actual client ID from Auth0

3. **Enable Google Connection in Auth0**
   - Go to Auth0 Dashboard > Authentication > Social
   - Enable Google OAuth2
   - Add your Google OAuth credentials

4. **Deploy Auth0 Action**
   - Go to Actions > Library
   - Find the created action for access control
   - Deploy it
   - Add to Login flow

5. **Deploy to GitHub Pages**
   ```bash
   git checkout -b gh-pages
   git add public/
   git commit -m "Deploy authenticated site"
   git push -u origin gh-pages
   ```

6. **Configure custom domain in GitHub**
   - Go to repository Settings > Pages
   - Set custom domain to: capstone.neevs.io
   - Enable HTTPS

## Current Status

- ✅ Setup script created
- ✅ .gitignore configured
- ✅ Auth module structure generated
- ⏳ Auth0 credentials need verification
- ⏳ Client ID needs to be updated
- ⏳ Deployment pending
