# Shared
The shared folder (`gm-bot/src/shared/`) contains a variety of project files, mainly those that are acccessed by both commands and modifiers. It also contains project assets, such as JSON files. Any TypeScript export found anywhere within the shared folder is exported by its root `index.ts` file, which means that any export can be accessed from importing the shared folder itself:
```typescript
import {
  /* Anything exported within the shared directories can be imported here */
} from './shared';
```

Some exports you may want to be aware of include various [Services](/deep-dive/services) and [Utilities](/deep-dive/utilities).
