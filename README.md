# Hatid - Nuxt 4 Implementation

A local file sharing web application built with Nuxt 4, WebRTC, and WebSockets for peer-to-peer file transfers on a local network.

## Features

- 🚀 Device discovery on local network
- 🔗 Peer-to-peer WebRTC connections
- 📁 File transfer with chunking
- 📊 Real-time progress tracking
- 💾 Multiple file support
- 🎨 Drag and drop interface
- 🌐 Works across different platforms

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn package manager

## Installation

1. Clone or navigate to the project directory:
```bash
cd hatid
```

2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Network Access

To access the app from other devices on your network:

```bash
npm run dev -- --host 0.0.0.0
```

Then find your local IP:
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr` (look for inet)

Access from other devices: `http://<YOUR_LOCAL_IP>:3000`

## Building

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
hatid/
├── app/
│   ├── components/         # Vue components
│   │   ├── DeviceList.vue
│   │   ├── FileUploader.vue
│   │   └── TransferProgress.vue
│   ├── composables/        # Vue composables
│   │   ├── useDeviceDiscovery.ts
│   │   ├── useWebRTC.ts
│   │   └── useFileTransfer.ts
│   ├── layouts/            # Layout components
│   │   └── default.vue
│   ├── pages/              # Page components
│   │   └── index.vue
│   ├── stores/             # Pinia stores
│   │   ├── devices.ts
│   │   └── transfers.ts
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts
│   └── app.vue             # Root component
├── server/
│   ├── routes/
│   │   └── ws.ts           # WebSocket handler
│   ├── api/                # API endpoints
│   └── utils/              # Server utilities
├── public/                 # Static assets
├── nuxt.config.ts          # Nuxt configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## How It Works

### Device Discovery
1. Devices connect to the WebSocket server
2. Each device announces itself to all connected peers
3. Devices update their local list of available peers

### File Transfer
1. User selects a device to connect to
2. WebRTC P2P connection is established
3. Files are sent in 64KB chunks
4. Progress is tracked and displayed in real-time
5. Files are automatically downloaded when transfer completes

### Key Technologies

- **Nuxt 4**: Modern Vue.js framework
- **Vue 3**: Reactive UI framework
- **PeerJS**: Simplified WebRTC library
- **WebSocket**: Real-time device discovery
- **Pinia**: State management
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling (optional)

## Configuration

Edit `nuxt.config.ts` to customize:

```typescript
runtimeConfig: {
  public: {
    wsUrl: process.env.WS_URL || 'ws://localhost:3000',
    signalingServer: process.env.SIGNALING_SERVER || 'http://localhost:3000'
  }
}
```

## Environment Variables

Create a `.env` file:

```env
WS_URL=ws://your-server-url
SIGNALING_SERVER=http://your-server-url
```

## Testing

### Local Testing
Test device discovery and file transfer on a single machine by opening multiple browser tabs.

### Network Testing
1. Start the server with network access: `npm run dev -- --host 0.0.0.0`
2. Find your local IP address
3. Open the app on multiple devices on the same network
4. Test device discovery and file transfers

### Testing Checklist
- [ ] Devices are discovered on the same network
- [ ] Can establish WebRTC connections
- [ ] Can send single and multiple files
- [ ] Progress updates correctly
- [ ] Large files transfer successfully
- [ ] App handles connection drops gracefully
- [ ] Works across different platforms (Windows/Mac/Linux/Mobile)

## Troubleshooting

### WebSocket Connection Issues
- Ensure port 3000 is not blocked by firewall
- Check that WebSocket is enabled in `nuxt.config.ts`
- Verify server is accessible from your network

### WebRTC Connection Issues
- STUN servers may be blocked (try alternative STUN servers in `useWebRTC.ts`)
- Check browser console for ICE candidate errors
- Ensure devices are on the same local network

### File Transfer Issues
- Large files may need larger chunk sizes
- Check browser memory limits
- Ensure connection stays alive during transfer

### Device Discovery Issues
- Devices must be on the same subnet
- Check firewall settings
- Verify WebSocket server is running

## Performance Optimization

### For Large Files
Adjust chunk size in `useFileTransfer.ts`:
```typescript
const CHUNK_SIZE = 256 * 1024 // 256KB for better speed
```

### For Multiple Files
Implement a queue system to send files sequentially instead of in parallel.

### For Slow Networks
Reduce chunk size for better reliability:
```typescript
const CHUNK_SIZE = 32 * 1024 // 32KB for slower connections
```

## Deployment

### Production Build
```bash
npm run build
npm run preview
```

### HTTPS Configuration
For production, you'll need HTTPS:

```typescript
// nuxt.config.ts
import fs from 'fs'

vite: {
  server: {
    https: {
      key: fs.readFileSync('path/to/key.pem'),
      cert: fs.readFileSync('path/to/cert.pem')
    }
  }
}
```

## Future Enhancements

- Resume interrupted transfers
- End-to-end encryption
- QR code device pairing
- Transfer history
- Folder transfer support
- Themes/customization
- PWA support
- Compression support

## Security Considerations

- Transfers happen over local network only
- WebRTC connections are peer-to-peer
- No files are stored on the server
- Consider adding encryption for sensitive data
- Validate file types and sizes

## Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Opera 47+
- Mobile browsers with WebRTC support

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project as you like.

## Resources

- [Nuxt 4 Documentation](https://nuxt.com)
- [PeerJS Documentation](https://peerjs.com/docs)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Vue 3 Documentation](https://vuejs.org)
- [Pinia Documentation](https://pinia.vuejs.org)

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify network connectivity
4. Check firewall settings
5. Try opening the browser developer tools (F12) to inspect errors

---

Built with ❤️ using Nuxt 4, Vue 3, and WebRTC
