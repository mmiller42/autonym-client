# autonym-client

A JavaScript client for consuming Autonym APIs.

A class that provides a thin wrapper around [axios](https://github.com/mzabriskie/axios) for making HTTP requests against an Autonym API.

## Installation

```sh
npm install autonym-client --save
```

The package can be imported into your application if you are using a build system like Webpack or Browserify.

```js
// es2015
import Autonym from 'autonym-client';

// common-js
const Autonym = require('autonym-client');
```

Alternatively, you can point a script tag to the dist file. Note that the dist file bundles its dependencies, [axios](https://github.com/mzabriskie/axios) and [qs](https://github.com/ljharb/qs).

```html
<!-- uncompressed -->
<script src="/node_modules/autonym-client/dist/autonym.js"></script>

<!-- compressed -->
<script src="/node_modules/autonym-client/dist/autonym.min.js"></script>
```

## Quick Start

```js
const autonym = new Autonym('https://api.myservice.com');
const peopleApi = autonym.bindToRoute('people');

// Create a new resource
peopleApi.create({ firstName: 'John', lastName: 'Galt' }).then(response => console.log(response));

// Fetch resources
peopleApi.find().then(response => console.log(response));

// Fetch a resource
peopleApi.findOne('42').then(response => console.log(response));

// Update an existing resource
peopleApi.findOneAndUpdate('42', { lastName: 'Doe' }).then(response => console.log(response));

// Delete a resource
peopleApi.findOneAndDelete('42').then(response => console.log(response));
```

## API

### `Autonym#constructor(uri[, config])`

| Argument             | Type                   | Description                                                                                    | Default Value |
|----------------------|------------------------|------------------------------------------------------------------------------------------------|---------------|
| `uri`                | `string`               | The URI to your Autonym server.                                                                | _None_        |
| `config`             | `object`               |                                                                                                | `{}`          |
| `config.serialize`   | `function(attributes)` | A function to transform resource attributes before sending it.                                 | _None_        |
| `config.unserialize` | `function(attributes)` | A function to transform resource attributes received.                                          | _None_        |
| `config.axiosConfig` | `object`               | Additional configuration to pass to the [axios](https://github.com/mzabriskie/axios) instance. | `{}`          |

### `Autonym#create(route, attributes)`

Serializes the given attributes and sends a request to create a new resource.

| Argument     | Type     | Description                     | Default Value |
|--------------|----------|---------------------------------|---------------|
| `route`      | `string` | The route for the resource.     | _None_        |
| `attributes` | `object` | The attributes of the resource. | _None_        |

Returns a promise that resolves with the unserialized server response.

### `Autonym#find(route[, query = {}])`

Sends a request to fetch resources, optionally passing a query string to filter the result set.

| Argument | Type     | Description                                                                                                                      | Default Value |
|----------|----------|----------------------------------------------------------------------------------------------------------------------------------|---------------|
| `route`  | `string` | The route for the resource.                                                                                                      | _None_        |
| `query`  | `object` | An object that will be converted to a query string via [`qs.stringify()`](https://github.com/ljharb/qs#stringifying) and appended. | `{}`          |

Returns a promise that resolves with the unserialized server response.

### `Autonym#findOne(route, id)`

Sends a request to fetch a resource.

| Argument | Type     | Description                                          | Default Value |
|----------|----------|------------------------------------------------------|---------------|
| `route`  | `string` | The route for the resource.                          | _None_        |
| `id`     | `string` | The id that uniquely identifies the resource to get. | _None_        |

Returns a promise that resolves with the unserialized server response.

### `Autonym#findOneAndUpdate(route, id, attributes)`

Serializes the given attributes and sends a request to update an existing resource.

| Argument     | Type     | Description                                             | Default Value |
|--------------|----------|---------------------------------------------------------|---------------|
| `route`      | `string` | The route for the resource.                             | _None_        |
| `id`         | `string` | The id that uniquely identifies the resource to update. | _None_        |
| `attributes` | `object` | The attributes to update.                               | _None_        |

Returns a promise that resolves with the unserialized server response.

### `Autonym#findOneAndDelete(route, id)`

Sends a request to delete a resource.

| Argument | Type     | Description                                             | Default Value |
|----------|----------|---------------------------------------------------------|---------------|
| `route`  | `string` | The route for the resource.                             | _None_        |
| `id`     | `string` | The id that uniquely identifies the resource to delete. | _None_        |

Returns a promise that resolves with the unserialized server response.

### `Autonym#bindToRoute(route)`

A convenience method that returns the methods on this class bound to the given route.

| Argument | Type     | Description                       | Default Value |
|----------|----------|-----------------------------------|---------------|
| `route`  | `string` | The route to bind the methods to. | _None_        |

Returns an object with the methods bound to the given route.

## Examples

### Serializing and unserializing resources

```js
const autonym = new Autonym('https://api.myservice.com', {
  serialize: attributes => ({
    ...attributes,
    birthdate: attributes.birthdate.getTime()
  }),
  unserialize: attributes => ({
    ...attributes,
    birthdate: new Date(attributes.birthdate)
  })
});
```

### Reading and modifying headers

```js
const autonym = new Autonym('https://api.myservice.com', {
  axiosConfig: {
    transformRequest: (data, headers) => {
      headers['Authorization'] = `Token ${localStorage.getItem('apiToken')}`;
      return data;
    },
    transformResponse: (data, headers) => {
      if (Array.isArray(data)) {
        return { items: data, numberOfPages: parseInt(headers['x-page-count'], 10) };
      } else {
        return { item: data };
      }
    }
  }
});
```
