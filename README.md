<img src="./logo.svg" width="90" align="right" />

# TSocks

TSocks is an implementation of socks protocol.
It's designed to be very flexible and adhesive

- **Modular** to be suited to your needs
- **Authentication** and **Identification** support.
- **V4** and **V5** support.
- **Multi-distribution** (**CommonJS** | **ES Modules** | **UMD** | **TypeScript**)

# Pros

1. TSocks is powered with hooks and events which give you
   the ability to implement different parts of protocol yourself
2. We used an API similar to the [net](https://nodejs.org/api/net.html) module which you are propably familiar with
3. You have access to incoming connections socket through available hooks

## Install

```sh
npm install --save tscoks
```

or

```sh
yarn add tsocks
```

## Usage

### Proxy Server

No matter which version of the proxy server you want V4 or V5
or even both you can easily implement it in a matter of seconds.

```typescript
import { createServer } from 'tsocks'

const host = '127.0.0.1'
const port = 1080

// Both versions with no authentication
const server = createServer({
  socks4: true,
  socks5: true,
})

// For development purposes
server.on('data', (data) => {
  // Log incoming requests
  console.log(data)
})

server.on('error', (err) => {
  // Log server errors
  console.log(err)
})

server.listen(port, host)
```

### Proxy Server With Authentication

There are two different authentication methods independent
of which version of the socks protocol you are working with.
in case you are using V5, you can use the useAuth hook and use
one of the available methods from the [methods](./src/auth/methods)
directory, or if you want to create your own implementations or
custom methods, you have to define a function that implements the
AuthMethod interface, like [userPass.ts](./src/auth/methods/userPass.ts) and pass it as an argument to useAuth hook, in case you are using V4 you have to use useIdent hook which receives a callback function which gives you userId, a string in which
should be processed and the result, which is going to be
a boolean should be return from the callback function, in case you want to support
both versions and also authenticate users on both you can use
both useAuth and useIdent together.

1. Server socks5

   ```typescript
   import { createServer, authMethods } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const username = 'tsocks'
   const password = 'tsocks'

   const server = createServer({
     socks4: false,
     socks5: true,
   })

   server.useAuth(
     authMethods.userPass((user, pass) => {
       return user === username && pass === password
     })
   )

   server.listen(port, host)
   ```

2. Server socks4

   ```typescript
   import { createServer } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const id = 'tsocks'

   const server = createServer({
     socks4: true,
     socks5: false,
   })

   server.useIdent((userId) => {
     return userId === id
   })

   server.listen(port, host)
   ```

3. Server socks4 and socks 5

   ```typescript
   import { createServer, authMethods } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const id = 'tsocks'
   const username = 'tsocks'
   const password = 'tsocks'

   const server = createServer({
     socks4: true,
     socks5: true,
   })

   // useAuth for socks5 requests
   server.useAuth(
     authMethods.userPass((user, pass) => {
       // You can use an array or database query instead
       return user === username && pass === password
     })
   )

   // useIdent for socks4 requests
   server.useIdent((userId) => {
     // You can use an array or database query instead
     return userId === id
   })

   server.listen(port, host)
   ```

### Socks Adaptor

You may want to use the socks protocol to handle incoming network traffic.
so you can set up a socks server and with the help of
useReq hook you have access to the socket and request information
which contains information like host address and port, therefore you can send traffic through a tunnel with any other protocol like WS or HTTP
or whatever you want and then send the response back to the client through socks.

```typescript
import { createServer } from 'tsocks'

const host = '127.0.0.1'
const port = 1080

const server = createServer({
  socks4: true,
  socks5: true,
})

server.useReq('connect', (info, socket) => {
  const host = info.address.host
  const port = info.address.port // Port number
  const type = info.address.type // ipv4 | ipv6 | domain
  const version = info.version // Socks version
  // You can implement the rest how ever you want
  // Just remember the response should be decided by version
})

server.listen(port, host)
```

## References

- [RFC - SOCKS Protocol Version 5](https://www.rfc-editor.org/rfc/rfc1928)
- [OpenSSH - SOCKS Protocol Version 4](https://www.openssh.com/txt/socks4.protocol)
- [RFC - Username/Password Authentication for SOCKS V5](https://www.rfc-editor.org/rfc/rfc1929)
- [RFC - Identification Protocol](https://www.rfc-editor.org/rfc/rfc1413)

### Contact Me

Email : `moizadloo@gmail.com`
