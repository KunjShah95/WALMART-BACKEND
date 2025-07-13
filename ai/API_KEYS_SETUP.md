# 🔑 API Keys Setup Guide

## Required API Keys for Walmart Sustainable Materials Platform

### 1. 🤖 **Google Gemini API Key**
- **Purpose**: AI text generation for sustainability narratives
- **Get Key**: https://aistudio.google.com/app/apikey
- **Steps**:
  1. Go to Google AI Studio
  2. Sign in with your Google account
  3. Click "Get API Key"
  4. Create new API key
  5. Copy the key to your `.env` file

### 2. 🤗 **Hugging Face API Token**
- **Purpose**: AI image generation for product designs
- **Get Token**: https://huggingface.co/settings/tokens
- **Steps**:
  1. Go to Hugging Face
  2. Sign up/Login to your account
  3. Go to Settings > Access Tokens
  4. Create new token with "Read" permissions
  5. Copy the token to your `.env` file

### 3. 🌍 **Climatiq API Key** (Optional)
- **Purpose**: Carbon footprint calculations
- **Get Key**: https://www.climatiq.io/
- **Steps**:
  1. Sign up at Climatiq
  2. Get your API key from dashboard
  3. Add to `.env` file

## 📋 **Setup Instructions:**

1. **Copy template file**:
   ```bash
   cp .env.template .env
   ```

2. **Edit the .env file** and replace placeholders:
   ```bash
   GEMINI_API_KEY=AIza...your_actual_key
   HF_TOKEN=hf_...your_actual_token
   CLIMATIQ_API_KEY=your_climatiq_key
   ```

3. **Test the setup**:
   ```bash
   python -c "import os; print('✅ Keys loaded' if os.getenv('GEMINI_API_KEY') else '❌ Keys missing')"
   ```

## 🚨 **Security Notes:**
- ✅ Never commit `.env` file to git
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly
- ✅ Monitor API usage and costs

## 💰 **API Costs (Approximate):**
- **Gemini 2.0 Flash**: Free tier (60 RPM) / $0.075 per 1K tokens
- **Hugging Face**: Free tier available / $0.06 per 1K tokens
- **Climatiq**: Free tier (100 requests/month)

## 🔧 **Development vs Production:**
- **Development**: Use free tiers
- **Production**: Consider paid plans for higher limits
- **Docker**: Pass keys as environment variables
