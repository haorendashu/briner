# Briner Project Analysis Document

**Last Updated**: 2026-02-06

## I. Project Overview

### Project Name
**Briner** - Nostr Bridge Signer Browser Extension

### Project Purpose
Briner is a browser extension that provides **cross-browser signing services** for the Nostr ecosystem. It acts as a "bridge signer" that allows users to securely sign Nostr events using multiple signing methods (private keys, remote services, hardware wallets, etc.) and supports permission management for multiple Nostr applications.

### Core Features
1. **Multiple Signing Methods**: NSEC (private key), Remote (remote service), Hardware (hardware wallet), Readonly (read-only)
2. **Cross-Browser Compatibility**: Chrome, Edge, Firefox
3. **Application Permission Management**: Manage access permissions for different Dapps
4. **Secure Storage**: Encrypted storage of sensitive data
5. **Nostr NIP Support**: Implementation of NIP-04 (encryption), NIP-44 (encryption), and other standards

---

## II. Technology Stack

### Core Technologies
- **Language**: TypeScript 5.3.3
- **Frontend Framework**: Vue 3.4.27 + Vue Router 4.5.1
- **Styling**: TailwindCSS 4.1.14 + PostCSS
- **Build Tool**: Extension.js (browser extension development framework)
- **Nostr Libraries**: 
  - `nostr-tools`: ^2.17.0 (Nostr standard library)
  - `js_nesigner_sdk`: ^0.1.7 (NE Signer SDK)

### Browser APIs
- Chrome Manifest V3 API
- Content Scripts
- Service Workers (Background)
- Storage API
- Runtime Port (messaging)

---

## III. Project Structure and Directory Functions

```
briner/
├── action/                          # Extension popup UI
│   ├── action.html                 # Popup HTML
│   ├── action.ts                   # Popup logic
│   └── action.vue                  # Popup component
│
├── background/                      # Background service (Service Worker)
│   └── background.ts               # Core message handling, signer management, permission verification
│
├── business/                        # Core business logic (most important)
│   ├── consts/                      # Constants and enums
│   │   ├── auth_result.ts          # Authentication result enum
│   │   ├── auth_type.ts            # Authentication type enum
│   │   ├── base.ts                 # Base constants
│   │   ├── connect_type.ts         # Connection type and permission definitions
│   │   └── other_message_type.ts   # Other message types
│   │
│   ├── data/                        # Data models and managers
│   │   ├── app.ts                  # App data model
│   │   ├── app_manager.ts          # App manager (CRUD, permission management)
│   │   ├── auth_log.ts             # Authentication log model
│   │   ├── auth_log_manager.ts     # Authentication log manager
│   │   ├── user.ts                 # User data model
│   │   └── user_manager.ts         # User manager (multiple signing methods)
│   │
│   ├── nostr_signer/                # Nostr signer implementations (Strategy pattern)
│   │   ├── isigner.ts              # Signer interface (defines all signing methods)
│   │   ├── nsec_signer.ts          # NSEC private key signing
│   │   ├── npub_signer.ts          # Npub read-only signing
│   │   ├── remote_signer.ts        # Remote service signing
│   │   ├── nesigner_signer.ts      # NE Signer integration
│   │   └── [other hardware signer implementations]  # Hardware wallet support
│   │
│   ├── service/                     # Business service layer
│   │   └── nostr_message_service.ts # Nostr message service (core business logic)
│   │
│   └── utils/                       # Utility functions
│       ├── id_utils.ts             # ID generation and validation utilities
│       └── [other utilities]
│
├── content/                         # Content Script (page context)
│   └── content.ts                  # Script injection and message relay
│
├── css/                             # Stylesheet files
│   ├── globals.css                 # Global styles
│   └── styles.css                  # Component styles
│
├── images/                          # Extension icons
│   └── extension_48.png            # UI icon resources
│
├── options/                         # Extension options page
│   ├── options.html                # Options page HTML
│   ├── options.ts                  # Options page logic
│   └── options.vue                 # Options page component
│
├── pages/                           # Special feature pages
│   ├── auth.html/.ts/.vue          # User authentication page
│   ├── connect.html/.ts/.vue       # Dapp connection authentication page
│   └── hardware_signer_login.html/.ts/.vue  # Hardware wallet login page
│
├── public/                          # Public resources (icons, images)
│   └── imgs/
│
├── scripts/                         # Injected scripts
│   └── nostr_script.js             # Script called by content script
│
├── ui/                              # UI components and routing
│   ├── router_builder.ts           # Vue Router configuration
│   ├── apps/                        # App-related components
│   │   ├── app_detail.vue          # App detail page
│   │   └── apps.vue                # App list page
│   ├── components/                  # Reusable components
│   │   ├── app_bar_component.vue   # App bar
│   │   ├── app_item_component.vue  # App item component
│   │   ├── auth_log_item_component.vue  # Authentication log item
│   │   ├── circle_image_component.vue   # Circle image
│   │   ├── footer_component.vue    # Footer
│   │   ├── user_select_component.vue    # User selection component
│   │   └── username_component.vue      # Username component
│   ├── index/                       # Home page
│   │   └── index.vue               # Home page component
│   ├── logs/                        # Log page
│   │   └── logs.vue                # Log list page
│   ├── oauth/                       # OAuth-related components
│   ├── pages/                       # Routing pages
│   │   ├── auth.vue                # Authentication page
│   │   ├── connect.vue             # Connection page
│   │   └── hardware_signer_login.vue # Hardware wallet login page
│   └── users/                       # User management page
│       ├── add_user.vue            # Add user page
│       └── users.vue               # User list page
│
├── test/                            # Test files
│   └── test.html
│
├── manifest.json                    # Chrome Manifest V3 configuration
├── package.json                     # Project dependencies
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # TailwindCSS configuration
├── postcss.config.mjs               # PostCSS configuration
└── README.md                        # Project documentation
```

---

## IV. Core Architecture Design

### 1. Layered Architecture
```
┌─────────────────────────────────────┐
│         UI Layer (Vue Components)   │  action/, options/, pages/, ui/
├─────────────────────────────────────┤
│   Service Layer (Business Logic)    │  business/service/
├─────────────────────────────────────┤
│  Data Layer (Models & Managers)     │  business/data/
├─────────────────────────────────────┤
│    Signer Implementations           │  business/nostr_signer/
├─────────────────────────────────────┤
│   Browser Extension API Layer       │  background/, content/
└─────────────────────────────────────┘
```

### 2. Key Design Patterns

#### **Strategy Pattern**
- **Interface**: `ISigner` - defines unified signing interface
- **Implementations**: `NsecSigner`, `RemoteSigner`, `HardwareSigner`, `NpubSigner`, `NesignerSigner`
- **Purpose**: Support multiple signing methods with flexible switching

```typescript
interface ISigner {
    getPublicKey(): Promise<string>
    signEvent(event: EventTemplate): Promise<VerifiedEvent>
    nip04Encrypt/Decrypt(): Promise<string>
    nip44Encrypt/Decrypt(): Promise<string>
}
```

#### **Manager Pattern** (Data management)
- `AppManager`: manages applications, permissions, connection states
- `UserManager`: manages users and signer bindings
- `AuthLogManager`: records authentication logs

#### **Message-Driven Architecture**
- `NostrMessageService`: core message processing service
  - Processes messages from Content Script
  - Verifies application permissions
  - Routes to appropriate signer
  - Manages hardware wallet long-lived connections

### 3. Message Flow

```
Dapp (in webpage)
    ↓
Content Script (content/content.ts)
    ↓
Web Accessible Resources (scripts/nostr_script.js)
    ↓
Background Service Worker (background/background.ts)
    ↓
NostrMessageService (business/service/nostr_message_service.ts)
    ↓
AppManager (permission check)
    ↓
UserManager & ISigner (concrete signer implementations)
    ↓
Response back to Dapp
```

### 4. Permission System
- **Storage Location**: Chrome Storage API
- **Permission Definition**: `ConnectType` enum defines permission types
- **Permission Management**: `AppManager.permissionMaps` records app permissions
- **Permission Verification**: `NostrMessageService` verifies permissions on every request

### 5. User Authentication Flow
```
User initiates connection request on Dapp
    ↓
Background verifies permissions
    ↓
If no permission → display connection confirmation page (pages/connect.vue)
    ↓
User selects user and grants authorization
    ↓
Record to AppManager (allow automatic authorization or confirm each time)
    ↓
Return pubkey to Dapp
```

---

## V. Core Classes and Interfaces

### ISigner Interface
**Location**: `business/nostr_signer/isigner.ts`
```typescript
interface ISigner {
    getPublicKey(): Promise<string>           // Get public key
    signEvent(event: EventTemplate): Promise<VerifiedEvent>  // Sign event
    nip04Encrypt/Decrypt()                    // NIP-04 encrypt/decrypt
    nip44Encrypt/Decrypt()                    // NIP-44 encrypt/decrypt
}
```
All signing methods implement this interface, ensuring consistent invocation.

### AppManager
**Location**: `business/data/app_manager.ts`
**Responsibilities**:
- Store and manage information about connected Dapps
- Manage permissions for each App
- Provide permission query and authorization interfaces
- Listen to storage changes

### UserManager
**Location**: `business/data/user_manager.ts`
**Responsibilities**:
- Store users (multiple public keys)
- Associate signers with each user
- CRUD operations on users

### NostrMessageService
**Location**: `business/service/nostr_message_service.ts`
**Responsibilities** (most critical):
- Handle all Nostr messages from Dapps
- Verify permissions
- Route to appropriate signer
- Manage hardware wallet long-lived connections
- Manage pending connection and permission requests

---

## VI. Important Data Flows and Interactions

### User Connects to Dapp Flow
1. Dapp sends `getPublicKey` request
2. Content Script forwards to Background
3. NostrMessageService checks permissions
4. If no permission, display `connect.vue` page
5. User selects user and authorization method
6. Permission stored to AppManager
7. Return pubkey

### Event Signing Flow
1. Dapp sends `signEvent` request + event data
2. NostrMessageService verifies permissions
3. Find corresponding Signer (via UserManager)
4. Call Signer.signEvent()
5. Return signed event

### Hardware Wallet Interaction
- Maintain `hardwarePorts` long-lived connections
- Maintain `pendingHardwareRequests` request queue
- Support request timeout handling

---

## VII. Storage Mechanism

### Chrome Storage
- **Keys**: `briner_apps`, `briner_users`, `briner_auth_logs`
- **Type**: Local storage (chrome.storage.local)
- **Access**: Via respective Manager classes

### Data Persistence
- Object serialization: model objects serialized to storage
- Initialization load: load data from storage on app startup

---

## VIII. Development Workflow

### Local Development
```bash
npm install
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview
```

### Build Output
- `dist/chrome/` - Chrome extension
- `dist/edge/` - Edge extension  
- `dist/firefox/` - Firefox extension

---

## IX. Key Technical Points

1. **Manifest V3**: Uses latest Chrome extension manifest version
2. **TypeScript**: Complete type safety
3. **Vue 3 Composition API**: Modern frontend framework
4. **Strategy Pattern**: Flexible signer implementation extension
5. **Async Message Handling**: Promise-based messaging support
6. **Permission Management**: Fine-grained app permission control
7. **Multi-Browser Support**: Single codebase for Chrome/Edge/Firefox

---

## X. Quick Navigation for Common Questions

| Question | Related Files |
|----------|---------------|
| Add new signing method | `business/nostr_signer/`, ISigner interface |
| Permission-related | `business/data/app_manager.ts` |
| Message handling | `business/service/nostr_message_service.ts` |
| User management | `business/data/user_manager.ts` |
| UI components | `ui/` directory |
| Extension lifecycle | `background/background.ts` |

---

## XI. Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| nostr-tools | ^2.17.0 | Nostr events, signing, encryption standard library |
| js_nesigner_sdk | ^0.1.7 | NE Signer SDK integration |
| vue | ^3.4.27 | Frontend framework |
| vue-router | ^4.5.1 | Frontend routing |
| tailwindcss | ^4.1.14 | CSS framework |
| @types/chrome | ^0.1.22 | Chrome API type definitions |
| extension | ^3.4.1 | Browser extension build tool |

---

**Note**: This document helps AI assistants quickly understand the project structure and design. Please update this document when there are major architectural changes.
