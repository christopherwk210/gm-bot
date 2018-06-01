# Utilities
Under the `gm-bot/src/shared/utils/` folder exists various project utilities, such as the command and modifier parser exports. There are a few noteworthy exports available from here.

## Detect staff
The `detectStaff()` function provides a simple way to determine if a `GuildMember` has a ducky (or above) role on the server. Also included in `gm-bot/src/shared/utils/detect-staff.ts` is the `detectOutsideStaff()` function, which can determine the same information from a regular `User`, useful for making the check inside a direct message.

## Choose
A simple utility that extends the `Array<T>` prototype with a `.choose()` method. This functions similar to the `choose()` function from GML, in that it returns a random item from the array. It can be used like this:
```typescript
import './shared/utils/choose';

let choice = [1, 2, 3].choose(); // => returns 1, 2, or 3 randomly
```
