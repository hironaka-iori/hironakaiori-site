# iPhone Location Integration Setup Guide

## Overview
Your new home page now displays your iPhone's location at the district level (e.g., "Xuhui, Shanghai, China"). This is powered by Apple's Find My API through a Cloudflare Worker backend.

## Features Added

1. **Status Display** - Shows "What am I doing now" with a pulsing green dot
2. **Creative ASCII Art** - Math/CS themed decorative element
3. **iPhone Location** - Displays district-level location from your Find My device

## Setup Instructions

### Step 1: Get Apple Find My Token

You have two options:

#### Option A: Using Apple's Web Interface (Recommended)

1. Go to [iCloud.com](https://www.icloud.com) and sign in with your Apple ID
2. Click "Find My" from the app launcher
3. **Open Browser DevTools:**
   - Press `F12` (or `Cmd+Option+I` on Mac)
   - Go to the **Network** tab
   - Make sure "Preserve log" is checked (checkbox at top)
   - Filter by typing `XHR` or `Fetch` to show API calls only

4. **Trigger the API request:**
   - In Find My, click on your iPhone device
   - Or wait for the page to fully load (it makes requests automatically)
   - Watch the Network tab for requests

5. **Look for one of these request URLs:**
   - `https://fmipmobile.icloud.com/fmipservice/client/web`
   - `https://fmipmobile.icloud.com/fmipservice/...` (any request here)
   - Search for `fmip` or `find` in the Network filter

6. **Extract the token from the request:**
   - Click on one of these requests
   - Go to the **Headers** tab
   - Look for **Request Headers** section:
     - Check for `Authorization: Bearer <token>`
     - Or `X-Apple-Session-Token: <token>`
     - Or `Cookie:` header with `X-Apple-Session=...`
   
   **Alternative: Check Response**
   - Go to **Response** tab of the request
   - Look for `fmlyAuthToken` or `sessionToken` in the JSON response
   - Copy that entire token

7. **If you still don't see the requests:**
   - Try this: In DevTools, click **Application** or **Storage** tab
   - Look for **Cookies** → select `icloud.com`
   - Find cookies named:
     - `X-Apple-Session`
     - `X-APPLE-SESSION`
     - Or any cookie that looks like a long alphanumeric string
   - Copy the entire cookie value

#### Option B: Using Apple's REST API
1. Sign in to your Apple ID account
2. Generate an app-specific password for security
3. Use that to authenticate with Apple's API

### Step 2: Store the Token in Cloudflare

```bash
# Install wrangler if not already installed
npm install -g wrangler

# Navigate to your project directory
cd f:\hironakaiori.site

# Login to Cloudflare
wrangler login

# Store your Apple Find My token as a secret
wrangler secret put APPLE_FIND_MY_TOKEN --env production

# You'll be prompted to enter your token securely
```

### Step 3: Install Dependencies

```bash
# Install required npm packages
npm install itty-router

# Or with wrangler
wrangler install
```

### Step 4: Deploy to Cloudflare Workers

```bash
# Deploy your worker to production
wrangler deploy --env production

# Or for development
wrangler dev
```

### Step 5: Connect Your Domain (if using custom domain)

If you have a custom domain (hironakaiori.site), add a route in your wrangler.jsonc:

```json
"routes": [
  {
    "pattern": "/api/*",
    "zone_name": "hironakaiori.site"
  }
]
```

## File Structure

```
f:\hironakaiori.site\
├── index.html           # Updated home page with status & location
├── script.js            # Added location fetching logic
├── style.css            # Added styles for status and location sections
├── src/
│   └── index.ts         # Cloudflare Worker backend
├── wrangler.jsonc       # Worker configuration
└── ...other files...
```

## How It Works

1. **Frontend** (`script.js`): On page load, calls `/api/iphone-location` endpoint
2. **Backend** (`src/index.ts`): Connects to Apple's Find My API using your stored token
3. **Reverse Geocoding**: Converts GPS coordinates to district/city using Open-Meteo API (free, no key needed)
4. **Display**: Shows location as "📍 District, City, Country"

## Customization

### Change Status Message
Edit `index.html` line with "Working on AI projects & competitive programming" to whatever you'd like

### Update ASCII Art
Modify the ASCII art in the `<div class="ascii-box">` section in `index.html`

### Adjust Location Refresh Rate
Add this to `script.js` to refresh location periodically:

```javascript
// Refresh location every 5 minutes
setInterval(fetchiPhoneLocation, 5 * 60 * 1000);
```

## Troubleshooting

### Location shows "Location unavailable"
- Check that APPLE_FIND_MY_TOKEN is set correctly in Cloudflare
- Verify your token is still valid (Apple tokens may expire)
- Check browser console for error messages

### API returns 404
- Ensure the worker is deployed: `wrangler deploy`
- Check that routes are configured in `wrangler.jsonc`
- Verify your domain is pointing to Cloudflare

### CORS errors
- The backend should handle this, but you can add CORS headers in the worker if needed

### Can't find Apple API requests in Network tab

**Common Issues & Solutions:**

1. **Requests happened before you opened DevTools**
   - Close DevTools
   - Refresh the Find My page completely (Ctrl+Shift+R for hard refresh)
   - Open DevTools again BEFORE the page fully loads
   - This ensures you catch all network requests

2. **Filtering is hiding the requests**
   - Clear the filter box (search field at top of Network tab)
   - Make sure you're not filtering by `JS`, `CSS`, `Img`, etc.
   - Filter by `XHR` or `Fetch` to see API calls

3. **Token is in cookies, not in request headers**
   - Go to DevTools → **Application** tab
   - Click **Cookies** in left sidebar
   - Select domain `icloud.com` or `*.icloud.com`
   - Look for cookies with these names:
     - `X-Apple-Session`
     - `X-APPLE-SESSION` 
     - Any long alphanumeric cookie value
   - The cookie value IS your token

4. **Apple blocked the request due to security**
   - Open DevTools Console tab
   - Look for error messages
   - Try a different browser (Chrome, Firefox, Edge)
   - Try incognito/private mode

5. **Alternative Method - Check Local Storage**
   - DevTools → **Application** tab
   - Click **Local Storage** 
   - Select `https://www.icloud.com`
   - Look for any value containing `token`, `session`, or `auth`

## Security Notes

- Your Apple token is stored securely in Cloudflare Secrets (encrypted)
- Tokens are never exposed to the frontend
- Consider using an app-specific password or limited-access token
- Regularly rotate your credentials

## Alternative: Static Location File (Easier Setup)

If you're having trouble getting the Apple token, here's a much simpler approach:

1. **Create `location.json` in your project root:**
```json
{
  "district": "Xuhui",
  "city": "Shanghai",
  "country": "China"
}
```

2. **Update `script.js`** - Replace the `fetchiPhoneLocation()` function:

```javascript
async function fetchiPhoneLocation() {
    const locationElement = document.getElementById('location-text');
    if (!locationElement) return;

    try {
        const response = await fetch('/location.json');
        if (!response.ok) throw new Error('Failed to fetch location');
        
        const data = await response.json();
        
        if (data.district) {
            let locationText = data.district;
            if (data.city && data.city !== data.district) {
                locationText += `, ${data.city}`;
            }
            if (data.country) {
                locationText += `, ${data.country}`;
            }
            locationElement.innerHTML = `📍 ${locationText}`;
        } else {
            locationElement.innerHTML = `<span class="error">Location unavailable</span>`;
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        locationElement.innerHTML = `<span class="error">Unable to load location</span>`;
    }
}
```

3. **That's it!** No backend needed.
   - Update `location.json` manually whenever you move
   - Redeploy your site

This approach works with Cloudflare's static file serving - no worker configuration needed.

## Support

If you encounter issues:
1. Check Cloudflare Worker logs: `wrangler tail`
2. Check browser DevTools Console for client-side errors
3. Verify Apple API token is valid
4. Test the API endpoint directly: `curl https://your-domain.com/api/iphone-location`

---

**Last Updated**: April 16, 2026
