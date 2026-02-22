# Match Sharing Guide

## Overview
Matches can now be shared on social media platforms like Facebook, Instagram, Twitter, and more. Each match has a dedicated page with rich preview cards that display match information.

## How It Works

### For Users
1. **View Match Details**: Navigate to any match from the tournament page
2. **Share Button**: Click the "Share" button on any match card
3. **Share Options**:
   - On mobile devices with native share support: A share sheet will appear with all available apps
   - On other devices: The match URL will be copied to your clipboard

### Match Detail Page
Each match has a dedicated URL: `/matches/{match-id}`

The match detail page shows:
- Tournament information
- Match type (Singles/Doubles)
- Player names and photos
- Complete score breakdown by sets
- Winner announcement
- Date and round information

### Social Media Preview Cards

When sharing a match link on social media platforms, a rich preview card will appear showing:
- Match participants (e.g., "John Doe vs Jane Smith")
- Complete score (e.g., "11-9, 11-7")
- Tournament name
- Match category

## Technical Implementation

### Components Created

1. **MatchDetail.jsx** (`client/src/pages/MatchDetail.jsx`)
   - Full match detail page with responsive design
   - Dynamic meta tag updates for social sharing
   - Native share API integration with clipboard fallback
   - Visual indication of winners with trophy icons

2. **Share API Route** (`api/routes/share.js`)
   - `/api/share/match/:id` - Returns JSON metadata for a match
   - `/api/share/match/:id/html` - Returns HTML with Open Graph meta tags

3. **Match Preview API** (`client/api/match-preview/[id].js`)
   - Vercel serverless function for generating preview pages
   - Handles social media bot requests
   - Includes fallback HTML for direct viewing

### Meta Tags Included

**Open Graph (Facebook, LinkedIn, etc.):**
- `og:title` - Match participants
- `og:description` - Score and tournament name
- `og:type` - article
- `og:url` - Match detail page URL
- `og:site_name` - Tupi Smash Pickleball Club
- `og:image` - Club logo

**Twitter Cards:**
- `twitter:card` - summary_large_card
- `twitter:title` - Match participants
- `twitter:description` - Score and tournament
- `twitter:image` - Club logo

## Features

### Share Button Integration
- Added to all match cards in tournament detail view
- Link icon that navigates to full match detail
- Desktop: Copies link to clipboard
- Mobile: Opens native share sheet

### Client-Side Meta Tag Updates
The MatchDetail component dynamically updates meta tags when:
- Page loads
- Match data is fetched
- Tournament information is available

This ensures proper previews when sharing via browser or mobile apps.

## Usage Examples

### Sharing a Match
```javascript
// The share functionality is built into the MatchDetail page
// Users just click the "Share" button

// Programmatically (if needed):
const shareMatch = async (matchId) => {
  const url = `${window.location.origin}/matches/${matchId}`
  if (navigator.share) {
    await navigator.share({
      title: 'Check out this match!',
      url: url
    })
  } else {
    await navigator.clipboard.writeText(url)
  }
}
```

### API Endpoints

**Get Match Metadata:**
```bash
GET /api/share/match/:id
```

Response:
```json
{
  "title": "John Doe / Jane Smith vs Bob Williams / Sarah Johnson",
  "description": "11-9, 11-7 - Summer Tournament 2024",
  "tournament": "Summer Tournament 2024",
  "category": "Mixed Doubles",
  "date": "2/22/2026",
  "team1Name": "John Doe / Jane Smith",
  "team2Name": "Bob Williams / Sarah Johnson",
  "score": "11-9, 11-7"
}
```

**Get HTML Preview (for bots):**
```bash
GET /api/share/match/:id/html
```

Returns HTML with embedded Open Graph meta tags for social media crawlers.

## Social Media Platform Support

✅ **Fully Supported:**
- Facebook
- Twitter/X
- LinkedIn
- WhatsApp
- Telegram
- Discord
- Slack
- Reddit
- Pinterest

✅ **Tested Platforms:**
The preview cards work on all major social media platforms that support Open Graph or Twitter Card protocols.

## Best Practices

1. **Testing Previews:**
   - Facebook: Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Twitter: Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - LinkedIn: Share the link in a post preview

2. **Image Optimization:**
   - Current implementation uses the club logo
   - For better engagement, consider generating dynamic OG images with match details
   - Recommended size: 1200x630px for optimal display

3. **Cache Invalidation:**
   - Social media platforms cache previews
   - Use platform debug tools to refresh cache after updates
   - Match data is cached for 1 hour on the preview endpoint

## Future Enhancements

Potential improvements for the sharing feature:

1. **Dynamic OG Images:**
   - Generate custom images with match score overlays
   - Include player photos in preview images
   - Use Canvas/Puppeteer for server-side image generation

2. **Share Statistics:**
   - Track share counts per match
   - Analytics for most-shared matches
   - Popular tournament tracking

3. **QR Code Generation:**
   - Generate QR codes for match pages
   - Enable easy sharing at physical events
   - Print-friendly scorecards with QR codes

4. **Deep Linking:**
   - Mobile app integration (future)
   - Direct links to specific sections
   - Tournament-specific share templates

## Troubleshooting

### Preview Not Showing
1. Check if the match exists and has valid data
2. Verify API endpoints are accessible
3. Use social platform debug tools to see what they're reading
4. Clear cache on social media platforms

### Share Button Not Working
1. Check browser console for errors
2. Verify HTTPS is enabled (required for native share API)
3. Test clipboard API permissions
4. Ensure match ID is valid in the URL

### Mobile Share Issues
1. Native share API requires HTTPS
2. Check mobile browser compatibility
3. Fallback to clipboard should work if share fails
4. Test on different mobile browsers

## Development Notes

### Environment Variables Required
```env
# For API
VITE_API_URL=https://your-api-url.vercel.app

# For Client Preview Function
VITE_CLIENT_URL=https://your-client-url.vercel.app
```

### Local Testing
```bash
# Test match detail page
http://localhost:5173/matches/1

# Test preview API (after deploying)
http://localhost:5173/api/match-preview/1
```

### Deployment Checklist
- [ ] Verify all environment variables are set
- [ ] Test share functionality on staging
- [ ] Validate OG tags with Facebook Debugger
- [ ] Test on mobile devices
- [ ] Verify preview API endpoint works
- [ ] Check CORS settings if needed

## API Integration

If you need to integrate match sharing in other parts of the app:

```javascript
import { Link } from 'react-router-dom'
import { Share2 } from 'lucide-react'

// In your component
<Link
  to={`/matches/${matchId}`}
  className="flex items-center gap-2"
>
  <Share2 className="w-4 h-4" />
  View & Share
</Link>
```

## Support

For issues or questions about the match sharing feature, please refer to:
- Main README.md for general application information
- DEPLOY_GUIDE.md for deployment-specific details
- GitHub Issues for bug reports and feature requests
