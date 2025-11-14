# Briner - Nostr Bridge Signer Browser Extension

> A powerful Nostr bridge signer browser extension that supports multiple browsers and various signing methods.

Briner is a browser extension that provides Nostr signing capabilities across Chrome, Edge, and Firefox browsers. It acts as a bridge signer, allowing users to securely sign Nostr events using different signing methods.

## Features

- **Multi-Browser Support**: Compatible with Chrome, Edge, and Firefox
- **Multiple Signer Types**:
  - **NSEC Signer**: Traditional private key-based signing
  - **Remote Signer**: Connect to external signing services
  - **Hardware Signer**: Support for hardware wallet integration
  - **Readonly Signer**: Only support `getPublicKey` method and no need to provide private key.
- **Secure Storage**: Encrypted storage for sensitive data
- **Cross-Platform**: Works across different Nostr applications

## Supported Browsers

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

## Installation

### Development Setup

```bash
# Install extension.js as a devDependency
npm install extension@latest --save-dev

# Clone the repository
git clone <repository-url>
cd briner

# Install dependencies
npm install
```

## Development Commands

### Development Mode

Run the extension in development mode with hot reload:

```bash
npx extension@latest dev
```

### Production Build

Build the extension for production:

```bash
npx extension@latest build --browser=all
```

### Preview

Preview the extension in the browser:

```bash
npx extension@latest preview
```

## Project Structure

```
briner/
├── action/           # Extension popup interface
├── background/       # Background service worker
├── business/         # Core business logic
│   ├── consts/       # Constants and enums
│   ├── data/         # Data models and managers
│   ├── nostr_signer/ # Signer implementations
│   ├── service/      # Business services
│   └── utils/        # Utility functions
├── content/          # Content scripts
├── css/              # Stylesheets
├── dist/             # Built extensions
│   ├── chrome/       # Chrome distribution
│   ├── edge/         # Edge distribution
│   └── firefox/      # Firefox distribution
└── images/           # Extension icons
├── options/          # Extension options page
├── pages/            # Additional extension pages (e.g., auth page, connection page, hardware signer login page)
├── public/           # Public assets for UI use (e.g., icons, images)
├── scripts/          # nostr script for content script to call
├── ui/               # User interface components
```

## Signer Types

### NSEC Signer
Traditional private key-based signing using NSEC keys stored securely in the extension.

### Remote Signer
Connect to external signing services for decentralized signing capabilities.

### Hardware Signer
Integration with hardware wallets for enhanced security.

### Readonly Signer
Only need to provider pubkey to the extension and it also only support to call the ```getPublicKey``` method.

## Usage

1. Install the extension in your preferred browser
2. Configure your preferred signer type in the extension settings
3. Use Nostr-enabled websites that support browser extensions
4. The extension will automatically handle signing requests

## Development Status

⚠️ **This project is currently under active development**

Please note that this extension is still in development. Some features may be incomplete or contain bugs.

## Bug Reports

If you encounter any issues:

1. Check if the issue has already been reported
2. Provide detailed information about:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages (if any)

**Note**: While bug reports are welcome, please understand that response time may vary due to limited development resources.

## License

GNU General Public License v3.0 (GPL-3.0)

## Support

For technical support or questions, please check the documentation or create an issue in the repository.

---

Built with ❤️ for the Nostr ecosystem