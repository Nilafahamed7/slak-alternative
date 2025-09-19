# Slack Alternative

A beautiful React-based Slack alternative with full messaging functionality, built with Vite and Tailwind CSS.

## Features

- 🔐 **OAuth Authentication**: Secure OAuth 2.0 login with Slack API
- 🔑 **Token Authentication**: Alternative bot token authentication
- 💬 **Send Messages**: Post messages to any Slack channel
- ⏰ **Schedule Messages**: Schedule messages for future delivery
- 🔍 **Search Messages**: Find messages by content
- ✏️ **Edit Messages**: Modify existing messages
- 🗑️ **Delete Messages**: Remove messages from channels
- 📱 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- 🏗️ **Developer Sandbox**: Safe testing environment

## Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or higher)
- A Slack workspace
- Slack app with appropriate permissions

## Slack App Setup

### 1. Create a Slack App

1. Go to [Slack API Dashboard](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Enter app name and select your workspace

### 2. Configure OAuth Settings

In your app settings, go to "OAuth & Permissions":

**OAuth Redirect URLs:**
- Add your callback URL: `http://localhost:5173/oauth/callback` (for development)
- For production: `https://yourdomain.com/oauth/callback`

**Bot Token Scopes:**
- `chat:write` - Send messages
- `channels:read` - List public channels
- `groups:read` - List private channels
- `im:read` - List direct messages
- `mpim:read` - List group direct messages
- `users:read` - List users

### 3. Install Your App

1. Go to "Install App" in your Slack app settings
2. Click "Install to Workspace"
3. Authorize the permissions
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 4. Set Up Channels

After installing your app, you need to add it to channels:

**Method 1: Invite Bot to Channels (Recommended)**
1. In any Slack channel, type: `/invite @YourBotName`
2. The bot will automatically appear in your app's channel list
3. Click "Refresh Channels" in the app to see new channels

**Method 2: Add Channels Manually**
1. Go to "Manage Channels" tab in the app
2. Enter channel ID (starts with C) or channel name (starts with #)
3. Click "Add Channel"

**Method 3: Use Channel IDs**
1. Right-click on any channel in Slack
2. Select "Copy link"
3. Extract the channel ID from the URL (e.g., `C1234567890`)
4. Add it manually in the app

### 5. Get OAuth Credentials

1. Copy your **Client ID** and **Client Secret** from the "Basic Information" section
2. Create a `.env` file in your project root (see Environment Setup below)

### 4. Install App to Workspace

1. Go to "Install App" in your app settings
2. Click "Install to Workspace"
3. Copy the "Bot User OAuth Token" (starts with `xoxb-`) for token-based auth

### 5. Developer Sandbox (Recommended)

For safe testing:

1. In your app settings, go to "Developer Sandbox"
2. Enable the sandbox environment
3. This creates a safe testing space without affecting real channels

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd slack-alternative
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your Slack app credentials
   VITE_SLACK_CLIENT_ID=your-slack-client-id
   VITE_SLACK_CLIENT_SECRET=your-slack-client-secret
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## Usage

### 1. Login

**OAuth Login (Recommended):**
1. Click "OAuth Login" tab
2. Click "Connect with Slack"
3. You'll be redirected to Slack for authorization
4. Grant permissions and you'll be redirected back
5. The app will automatically log you in

**Token Login (Alternative):**
1. Click "Bot Token" tab
2. Enter your Slack Bot Token (from step 4 above)
3. Click "Connect to Slack"
4. The app will verify your token and log you in

### 2. Send Messages

1. Select a channel from the sidebar
2. Go to "Send Message" tab
3. Type your message
4. Optionally add thread timestamp or blocks JSON
5. Click "Send Message"

### 3. Schedule Messages

1. Go to "Schedule Message" tab
2. Enter your message text
3. Select date and time for delivery
4. Click "Schedule Message"

### 4. Search Messages

1. Go to "Search Messages" tab
2. Enter search query
3. Click "Search"
4. View filtered results

### 5. Manage Messages

1. Go to "Manage Messages" tab
2. View recent messages
3. Click edit icon to modify messages
4. Click delete icon to remove messages

## API Endpoints Used

The app uses these Slack API endpoints:

- `auth.test` - Verify authentication
- `conversations.list` - List channels
- `conversations.history` - Get message history
- `chat.postMessage` - Send messages
- `chat.scheduleMessage` - Schedule messages
- `chat.update` - Edit messages
- `chat.delete` - Delete messages
- `users.list` - List users

## Project Structure

```
src/
├── components/
│   ├── Login.jsx          # Authentication component
│   ├── Dashboard.jsx      # Main dashboard
│   ├── MessageForm.jsx    # Message input form
│   ├── MessageList.jsx    # Message display
│   └── ChannelSelector.jsx # Channel selection
├── services/
│   └── slackService.js    # Slack API functions
├── App.jsx               # Main app component
├── main.jsx             # App entry point
└── index.css            # Global styles
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

For production deployment, you might want to use environment variables:

```bash
VITE_SLACK_API_URL=https://slack.com/api
```

## Troubleshooting

### Common Issues

1. **"Invalid token" error:**
   - Ensure your bot token is correct
   - Check that the app is installed in your workspace
   - Verify bot token scopes are properly configured

2. **"Channel not found" error:**
   - Make sure the bot is added to the channel
   - Check channel permissions

3. **"Message not found" error:**
   - Verify the message timestamp is correct
   - Ensure the message exists in the channel

## Sharing Your App with Others

### For Each User:

**Important:** Each user must create their own Slack app because:
- **Security**: Users can't share OAuth credentials
- **Permissions**: Each user needs to authorize their own workspace
- **Channels**: Users need to invite the bot to their own channels

### User Setup Process:

1. **Create Their Own Slack App:**
   - Go to [Slack API Dashboard](https://api.slack.com/apps)
   - Create a new app for their workspace
   - Follow the setup steps above

2. **Configure Their Environment:**
   - Get their own Client ID and Client Secret
   - Set up their own `.env` file
   - Install the app to their workspace

3. **Add Their Channels:**
   - Use the "Manage Channels" tab in your app
   - Invite their bot to channels: `/invite @TheirBotName`
   - Or add channels manually using channel IDs

### Deployment Options:

**Option 1: Self-Hosted**
- Each user deploys their own instance
- They use their own Slack app credentials
- Complete privacy and control

**Option 2: Shared Instance**
- Deploy one instance (e.g., on Vercel)
- Each user creates their own Slack app
- They use the same app URL but different credentials

### Getting Help

- Check [Slack API Documentation](https://api.slack.com/apis)
- Review [Slack Developer Sandbox Guide](https://api.slack.com/docs/developer-sandbox)
- Ensure your app has the required permissions

## License

MIT License - feel free to use this project for learning and development purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note:** This is a development/learning project. For production use, consider additional security measures and error handling.
