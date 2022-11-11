# API reference

### Auth ([source](https://github.com/albertincx/routebot/blob/main/src/routes/users.js))
```http
POST /users/login
```
<details><summary>Parameters</summary>
<p>

| Parameter  | Type | Description |
|:-----------| :--- | :--- |
| `username` | `string` | **Required**.  |
| `password` | `string` | **Required**.  |

</p>
</details>
<details><summary>Response</summary>
<p>

```javascript
{
    "success"   : bool,
    "token"     : string,
    "expiresIn" : string, // "2d"
}
```

</p>
</details>
<details><summary>Status Codes</summary>
<p>

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 404 | `NOT FOUND` |

</p>
</details>

```http
POST /users/register
```
<details><summary>Parameters</summary>
<p>

| Parameter  | Type | Description |
|:-----------| :--- | :--- |
| `username` | `string` | **Required**.  |
| `password` | `string` | **Required**.  |

</p>
</details>
<details><summary>Response</summary>
<p>

```javascript
{
    "success" : bool,
    "user"    : object,
}
```

</p>
</details>
<details><summary>Status Codes</summary>
<p>

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |

</p>
</details>

### Get routes ([source](https://github.com/albertincx/routebot/blob/main/src/routes/routes.js))
```http
GET /routes
```

<details><summary>Parameters</summary>
<p>

| Parameter | Type | Description       | Example         |
|:----------| :--- |:------------------|:----------------|
| `filter`  | `string` | **Not Required**. | {point: true}   |
| `range`   | `string` | **Required**.     | range = [0, 24] |

</p>
</details>
<details><summary>Filter</summary>
<p>

| Parameter | Type     | Description             |
|:----------|:---------|:------------------------|
| `point`   | `bool`   | show only with location |
| `name`    | `string` | search by name          |

</p>
</details>
<details><summary>Response</summary>
<p>

```javascript
[
  route1, route2, ..., routeN,
]
```

</p>
</details>
<details><summary>Status Codes</summary>
<p>

| Status Code | Description             |
|:------------|:------------------------|
| 200         | `OK`                    |
| 401         | `Unauthorized`          |
| 404         | `NOT FOUND`             |
| 500         | `INTERNAL SERVER ERROR` |

</p>
</details>

### Get route by id

```http
GET /routes/:id
```
<details><summary>Parameters</summary>
<p>

| Parameter  | Type | Description   |
|:-----------| :--- |:--------------|
| `id`       | `string` | route id      |

</p>
</details>
<details><summary>Response</summary>
<p>

```javascript
route
```
</p>
</details>
<details><summary>Status Codes</summary>
<p>

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 401         | `Unauthorized`          |
| 404 | `NOT FOUND` |
| 500 | `INTERNAL SERVER ERROR` |

</p>
</details>

### Create new route

```http
POST /routes
```
<details><summary>Parameters</summary>
<p>

| body    | Type     | Description                        |
|:--------|:---------|:-----------------------------------|
| `route` | `object` | **Required**. [see](#route-object) |

</p>
</details>
<details><summary>Response</summary>
<p>

```javascript
{
    "route" : object,
}
```
</p>
</details>

or Error Response [see](#error-response)

<details><summary>Status Codes</summary>
<p>

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 201 | `CREATED` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `INTERNAL SERVER ERROR` |

</p>
</details>

### Update route by id

```http
PUT /routes/:id
```
<details><summary>Parameters</summary>
<p>

| body       | Type     | Description |
|:-----------|:---------| :--- |
| `route`    | `object` | **Required**.  |

</p>
</details>
<details><summary>Response</summary>
<p>

```javascript
{
    "success"   : bool,
    "token"     : string,
    "expiresIn" : string, // "1d"
}
```
</p>
</details>

or Error Response [see](#error-response)

<details><summary>Status Codes</summary>
<p>

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `INTERNAL SERVER ERROR` |

</p>
</details>

### Delete route by id

```http
DELETE /routes/:id
```
<details><summary>Parameters</summary>
<p>

| Parameter  | Type | Description            |
|:-----------| :--- |:-----------------------|
| `id`       | `string` | **Required**. Route id |

</p>
</details>

<details><summary>Response</summary>
<p>

```javascript
{
    "success"   : bool,
    "token"     : string,
    "expiresIn" : string, // "1d"
}
```
</p>
</details>

or Error Response [see](#error-response)

<details><summary>Status Codes</summary>
<p>

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `INTERNAL SERVER ERROR` |

</p>
</details>

## Additionals

### Error Response

<details><summary>open/hide</summary>
<p>

```javascript
{
  "success" : bool,
  "message" : string,
}
```

</p>
</details>

### Route Object

<details><summary>open</summary>
<p>

```javascript
{
  "id": string,
  "createdAt": timestamp,
  "category": string,
  "name": string,
  "pointA": {
    "type":"Point",
    "coordinates": [number,number]
  },
  "pointB": {
    "type":"Point",
    "coordinates": [number,number]
  },
  "userId": number,
  "type": number, 
  "status": number,
}
```

</p>
</details>

[auth](#auth) - [get routes](#get-routes) - [get-route-by-id](#get-route-by-id) - [create-new-route](#create-new-route) - [update](#update-route-by-id) - [delete](#delete-route-by-id)
