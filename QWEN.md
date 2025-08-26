# Project Context for Qwen Code

## Project Overview

This is a Node.js/TypeScript project structured according to Clean Architecture principles. The project is named "bot" and appears to be a foundation for a bot application that uses the mezon-sdk.

The architecture follows the principles of Clean Architecture with a clear separation of concerns:

1. **Domain Layer**: Contains the core business logic, entities, and interfaces for repositories and services
2. **Application Layer**: Implements use cases and orchestrates the domain layer
3. **Infrastructure Layer**: Contains concrete implementations of repositories, services, and external integrations
4. **Interfaces Layer**: Contains entry points like HTTP controllers and CLI interfaces
5. **Shared Layer**: Contains utilities and common code used across the application

## Project Structure

```
src/
├── application/
│   ├── dtos/
│   ├── interfaces/
│   └── use-cases/
├── domain/
│   ├── entities/
│   ├── enums/
│   ├── exceptions/
│   ├── repositories/
│   └── services/
├── infrastructure/
│   ├── config/
│   ├── mappers/
│   ├── repositories/
│   ├── services/
│   └── utils/
├── interfaces/
│   ├── cli/
│   └── http/
└── shared/
    └── utils/
```

## Key Technologies

- **TypeScript**: Strongly typed programming language that builds on JavaScript
- **Node.js**: JavaScript runtime environment
- **mezon-sdk**: SDK for bot functionality
- **Clean Architecture**: Architectural pattern for separation of concerns

## Building and Running

### Development Commands

- `npm run dev`: Run the application in development mode using ts-node
- `npm run watch`: Run the application in watch mode with nodemon
- `npm run build`: Compile TypeScript code to JavaScript in the dist/ directory
- `npm start`: Run the compiled JavaScript application from dist/

### Key Dependencies

- mezon-sdk: ^2.8.11
- TypeScript-related: typescript, ts-node, @types/node
- Development tools: nodemon, dotenv

## Development Conventions

### Architecture Guidelines

1. **Domain Layer**: 
   - Contains pure business logic with no external dependencies
   - Entities are defined as interfaces
   - Repositories are defined as interfaces to enable dependency inversion

2. **Application Layer**:
   - Contains use cases that orchestrate domain operations
   - Depends only on the domain layer
   - Does not contain infrastructure concerns

3. **Infrastructure Layer**:
   - Contains concrete implementations of domain interfaces
   - Handles external concerns like databases, APIs, file systems
   - Can depend on domain and application layers

4. **Interfaces Layer**:
   - Contains entry points like HTTP controllers
   - Depends on application layer use cases
   - Handles presentation concerns

### Code Organization

- Each layer has its own directory under `src/`
- TypeScript path aliases are configured for cleaner imports:
  - `@application/*` maps to `src/application/*`
  - `@domain/*` maps to `src/domain/*`
  - `@infrastructure/*` maps to `src/infrastructure/*`
  - `@interfaces/*` maps to `src/interfaces/*`
  - `@shared/*` maps to `src/shared/*`

### TypeScript Configuration

- Target: ES2020
- Module system: CommonJS
- Strict type checking enabled
- Path mapping for cleaner imports
- Source maps and declaration files generated

## Example Implementation

The project includes a sample implementation of a User entity with:
- Domain entity: User interface
- Repository interface: UserRepository
- Use case: CreateUserUseCase
- In-memory implementation: InMemoryUserRepository
- Controller: UserController
- Service: EmailService

This demonstrates the data flow from interface layer through application layer to domain layer and back.

## Mezon SDK Information

The bot uses the `mezon-sdk` library (version 2.8.11) which provides functionality for interacting with the Mezon platform. The SDK enables the bot to:

### Client Initialization
- Create a client instance with an API key
- Connect to the Mezon server (gw.mezon.ai:443 by default)
- Authenticate the bot with the server

### Core Functionality
- **Authentication**: Login and session management
- **Messaging**: Send messages to channels and users
- **Event Handling**: Listen to and respond to various events
- **Channel Management**: Create and manage channels
- **User Interactions**: Send tokens, react to messages, etc.

### Event Listeners
The SDK provides numerous event listeners that can be used to build bot functionality:

1. **ChannelMessage**: Listen to messages sent on channels and threads
2. **MessageReaction**: Listen to user reactions to messages
3. **UserChannelRemoved**: Listen when users are removed from channels
4. **UserClanRemoved**: Listen when users are removed from clans
5. **UserChannelAdded**: Listen when users are added to channels
6. **ChannelCreated**: Listen when new channels are created
7. **ChannelDeleted**: Listen when channels are deleted
8. **ChannelUpdated**: Listen when channels are updated
9. **RoleEvent**: Listen to clan role creation events
10. **GiveCoffee**: Listen when users give coffee to each other
11. **RoleAssign**: Listen when roles are assigned to users
12. **AddClanUser**: Listen when users are added to clans
13. **TokenSend**: Listen when users send tokens to each other
14. **ClanEventCreated**: Listen when clans create new events
15. **MessageButtonClicked**: Listen when users click buttons on embed messages
16. **StreamingJoinedEvent**: Listen when users join stream rooms
17. **StreamingLeavedEvent**: Listen when users leave stream rooms
18. **DropdownBoxSelected**: Listen when users select dropdown options
19. **WebrtcSignalingFwd**: Listen to WebRTC signaling events
20. **VoiceStartedEvent**: Listen when voice sessions start
21. **VoiceEndedEvent**: Listen when voice sessions end
22. **VoiceJoinedEvent**: Listen when users join voice rooms
23. **VoiceLeavedEvent**: Listen when users leave voice rooms
24. **Notifications**: Listen to notification events
25. **QuickMenu**: Listen to quick menu events

### Channel Types
The SDK supports various channel types:
1. CHANNEL_TYPE_CHANNEL (1)
2. CHANNEL_TYPE_GROUP (2)
3. CHANNEL_TYPE_DM (3) - Direct Messages
4. CHANNEL_TYPE_GMEET_VOICE (4)
5. CHANNEL_TYPE_FORUM (5)
6. CHANNEL_TYPE_STREAMING (6)
7. CHANNEL_TYPE_THREAD (7)
8. CHANNEL_TYPE_APP (8)
9. CHANNEL_TYPE_ANNOUNCEMENT (9)
10. CHANNEL_TYPE_MEZON_VOICE (10)

### Message Types
Different types of messages can be sent:
1. Chat (0)
2. ChatUpdate (1)
3. ChatRemove (2)
4. Typing (3)
5. Indicator (4)
6. Welcome (5)
7. CreateThread (6)
8. CreatePin (7)
9. MessageBuzz (8)
10. Topic (9)
11. AuditLog (10)
12. SendToken (11)
13. Ephemeral (12)

### Key Methods
- `login()`: Authenticate the bot with the server
- `sendMessage()`: Send messages to channels
- `sendToken()`: Send tokens to users
- `createDMchannel()`: Create direct message channels with users
- `reactionMessage()`: React to messages with emojis
- `updateChatMessage()`: Update existing messages
- `joinClanChat()`: Join clan chat when invited
- `createChannelDesc()`: Create new channels
- `listChannelVoiceUsers()`: List users in voice channels
- `registerStreamingChannel()`: Register streaming channels

This SDK provides a comprehensive set of tools for building feature-rich bots that can interact with users, manage channels, and respond to various events in the Mezon platform.