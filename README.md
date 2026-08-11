# Secret mobile

Secret is a local-first Expo Go app, pinned to Expo SDK 54.

## Run it

```bash
npm start
```

Open the QR code with Expo Go. Create an account on the device, then use the app normally.

## Local data

There is no PHP, MySQL, HTTP API, or server dependency. Accounts, posts, replies, favorites, follows, notification state, and preferences are generated from user actions and stored locally in AsyncStorage. The app starts empty—there is no bundled social data.

Local accounts are intended for device-only prototyping. Do not use a real password, because there is no remote authentication service.
