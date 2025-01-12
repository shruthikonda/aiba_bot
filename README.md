# Angular Chat Widget

A modern, customizable web chat widget built with Angular that can be easily integrated into any website.

## Features

- Floating chat button
- Expandable chat window
- Real-time message updates
- Customizable themes
- Responsive design
- Loading states and animations

## Installation

```bash
npm install @your-org/angular-chat-widget
```

## Usage

1. Import the ChatWidgetComponent in your Angular module:

```typescript
import { ChatWidgetComponent } from '@your-org/angular-chat-widget';
```

2. Add the component to your template:

```html
<chat-widget
  [config]="{
    clientId: 'YOUR_CLIENT_ID',
    primaryColor: '#007bff',
    secondaryColor: '#e9ecef',
    position: 'bottom-right',
    initialMessage: 'Hello! How can I help you today?'
  }">
</chat-widget>
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| clientId | string | Your unique client identifier |
| primaryColor | string | Primary theme color |
| secondaryColor | string | Secondary theme color |
| position | 'bottom-right' \| 'bottom-left' | Widget position |
| initialMessage | string | First message shown to users |

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Building

```bash
npm run build
```

## License

MIT