# R2 and GitHub Setup Guide

This guide will help you configure Cloudflare R2 and GitHub for the PIKO COMMAND upload system.

## Cloudflare R2 Setup

### 1. Create an R2 Bucket

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**
4. Name your bucket (e.g., `piko-tracks-production`)
5. Click **Create bucket**

### 2. Configure CORS for Browser Uploads

**CRITICAL**: R2 buckets must have CORS configured to allow browser-based uploads.

1. In your R2 bucket, go to **Settings**
2. Scroll to **CORS Policy**
3. Add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**Note**: For production, replace `"*"` in `AllowedOrigins` with your actual Spark app URL.

### 3. Create R2 API Tokens

1. In the Cloudflare dashboard, navigate to **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Select **Edit** permissions
4. Choose **Apply to specific buckets only** and select your bucket
5. Click **Create API Token**
6. **Save these credentials** (you won't see them again):
   - **Access Key ID** (R2 Access Key)
   - **Secret Access Key** (R2 Secret Key)
   - **Account ID** (visible in R2 overview)

### 4. Get Your R2 Account ID

1. Go to R2 Overview in Cloudflare dashboard
2. Your **Account ID** is displayed in the sidebar
3. Copy and save this value

## GitHub Setup

### 1. Create a Repository

1. Go to [GitHub](https://github.com/)
2. Create a new repository for your track data (e.g., `piko-artist-website`)
3. You can make it public or private

### 2. Create Required Directory Structure

In your repository, create this folder structure:

```
your-repo/
└── public/
    └── data/
        └── tracks.json
```

Create an empty `tracks.json` file with:

```json
[]
```

### 3. Generate a Personal Access Token

1. Go to **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a descriptive name (e.g., "PIKO COMMAND Upload")
4. Set expiration as needed
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
6. Click **Generate token**
7. **Copy and save the token immediately** (you won't see it again)

### 4. Get Repository Information

You'll need:
- **GitHub Owner**: Your GitHub username (e.g., `yourusername`)
- **GitHub Repo**: Your repository name (e.g., `piko-artist-website`)
- **GitHub Token**: The Personal Access Token you just created

## Entering Credentials in PIKO COMMAND

1. Open PIKO COMMAND
2. Navigate to **THE VAULT** tab
3. Enter all the credentials you collected:

### R2 Credentials
- **R2 Access Key**: From R2 API Token (Access Key ID)
- **R2 Secret Key**: From R2 API Token (Secret Access Key)
- **R2 Bucket Name**: Your bucket name (e.g., `piko-tracks-production`)
- **R2 Account ID**: From R2 dashboard

### GitHub Credentials
- **GitHub Token**: Your Personal Access Token
- **GitHub Owner**: Your GitHub username
- **GitHub Repo**: Your repository name

4. Click **SAVE CONFIGURATION**

## Testing Your Setup

1. Go to the **STUDIO** tab
2. Click **RUN INTEGRATION TEST**
3. If the test passes, your configuration is correct!
4. If it fails, check:
   - All credentials are correct
   - CORS is properly configured on R2
   - GitHub token has `repo` scope
   - The `public/data/tracks.json` file exists in your repo

## Common Issues

### "Access Denied" Error
- **Cause**: R2 credentials are incorrect or the API token doesn't have Edit permissions
- **Fix**: Verify your R2 Access Key and Secret Key, regenerate if needed

### "CORS" or "Network" Error
- **Cause**: R2 bucket doesn't have CORS configured for browser uploads
- **Fix**: Add the CORS policy shown above to your R2 bucket settings

### "NoSuchBucket" Error
- **Cause**: Bucket name is incorrect or doesn't exist
- **Fix**: Verify the bucket name matches exactly (case-sensitive)

### GitHub Sync Fails
- **Cause**: Token doesn't have permissions, or repo/owner name is wrong
- **Fix**: Verify GitHub credentials and ensure token has `repo` scope

### File Upload Succeeds but GitHub Sync Fails
- **Cause**: The `public/data/tracks.json` file doesn't exist in your repository
- **Fix**: Create the directory structure and empty JSON file as shown above

## Security Best Practices

1. **Never share your credentials** - They provide full access to your R2 bucket and GitHub repo
2. **Use environment-specific tokens** - Create separate tokens for testing vs. production
3. **Rotate credentials regularly** - Regenerate API tokens periodically
4. **Limit token scope** - Only grant necessary permissions
5. **Monitor usage** - Check R2 and GitHub for unauthorized access

## Cost Information

### Cloudflare R2
- **Free tier**: 10 GB storage, 10 million Class A operations/month
- **Storage**: $0.015/GB/month after free tier
- **Operations**: Minimal cost for typical usage

### GitHub
- **Public repos**: Free unlimited storage
- **Private repos**: Free for personal accounts with limits

For typical music distribution (a few tracks per month), costs should remain within free tiers.

## Support

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Verify all credentials are entered correctly
3. Ensure CORS is properly configured
4. Test with the Integration Test feature first
5. Review the error messages in the Upload Status section
