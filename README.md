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

## Usage via a CDN

```
<script src="https://cdn.jsdelivr.net/npm/gigz-tracking@latest/dist/gigz.umd.min.js"></script>
<script>
	gigz.initToken("YOUR-TOKEN");
	gigz.track("My first action");
</script>
```

## Use properties

Properties are custom parameter that you associate with logs, in order to improve segmentation.
You can pass any properties, as following:

```
gigz.track("A custom log", { custom_parameter: "AAA", another_parameter: "BBB" });
```


## Improve the user location

By default, the users location will be determined based on the user IP. This method is not very accurate, so if you want to improve the user location, you can use the Geolocation API to specify the current user location to the library.

```
if (navigator && navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(
		position => gigz.setUserLocation(position.coords.latitude, position.coords.longitude),
		err => { }
	);

	navigator.geolocation.watchPosition(position => gigz.setUserLocation(position.coords.latitude, position.coords.longitude));
}
```