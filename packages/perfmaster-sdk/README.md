# @perfmaster/sdk

Real-time performance monitoring SDK for PerfMaster.

## Installation

```bash
npm install @perfmaster/sdk
# or
yarn add @perfmaster/sdk
```

## Usage

```typescript
import { PerfMaster } from '@perfmaster/sdk';

PerfMaster.init({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  environment: 'production'
});
```

## Features

- ✅ Real-time Core Web Vitals monitoring
- ✅ Automatic performance metrics collection
- ✅ WebSocket live streaming
- ✅ Error tracking
- ✅ Custom event tracking
- ✅ Memory usage monitoring

## API

### PerfMaster.init(config)
Initialize the SDK with your configuration.

### PerfMaster.trackEvent(name, data)
Track custom events.

### PerfMaster.trackError(error)
Track JavaScript errors.

### PerfMaster.destroy()
Clean up and disconnect.