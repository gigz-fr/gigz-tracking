# gigz-tracking
Tracking library for Gigz

## Installation

```
npm install --save gigz-tracking
```

## Setup

In your app initialization

```
import gigz from 'gigz-tracking';

// Use the following if you have a token based access
gigz.initToken("YOUR-TOKEN");

// OR

// Use the following if you have a proxy based access
await gigz.initProxy("YOUR-GET-TOKEN-URL", "YOUR-CHECK-TOKEN-URL{0}"); // The {0} will be replaced by the token to check
```

Then you can track any action with the following code

```
gigz.track("My first action");
gigz.track("My second action", { event_gigz_id: "XXX" });
```

Use the following when a user successfully authentifies on your website

```
gigz.engage("USER_ID", "FIRSTNAME", "EMAIL", "USER_SUBSCRIPTION_TIME");
```

And the following when the user signs out

```
gigz.reset();
```