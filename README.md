<img src="./logo.svg" width="90" align="right" />

# TSocks

TSocks is an implementation of SOCKS protocol.
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
  // Log incoming data
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
of which version of the SOCKS protocol you are working with.
in case you are using V5, you can use the useAuth hook and use
one of the available methods from the [methods'](src/server/auth/methods)
directory, or if you want to create your own implementations or
custom methods, you have to define a function that implements the
AuthMethod interface, like [userPass.ts](src/server/auth/methods/userPass.ts) and pass it as an argument to useAuth hook, in case you are using V4 you have to use useIdent hook which receives a callback function which gives you userId, a string in which
should be processed and the result, which is going to be
a boolean should be return from the callback function, in case you want to support
both versions and also authenticate users on both you can use
both useAuth and useIdent together.

1. Server socks5

   ```typescript
   import { createServer, serverAuthMethods } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const username = 'user'
   const password = 'pass'

   const server = createServer({
     socks4: false,
     socks5: true,
   })

   server.useAuth(
     serverAuthMethods.userPass((user, pass) => {
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
   const id = 'user:pass'

   const server = createServer({
     socks4: true,
     socks5: false,
   })

   server.useIdent((userId) => {
     return userId === id
   })

   server.listen(port, host)
   ```

3. Server socks4 and SOCKS 5

   ```typescript
   import { createServer, serverAuthMethods } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const id = 'user:pass'
   const username = 'user'
   const password = 'pass'

   const server = createServer({
     socks4: true,
     socks5: true,
   })

   // useAuth for socks5 requests
   server.useAuth(
     serverAuthMethods.userPass((user, pass) => {
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

### Associate (UDP Relay)

The associate command assists you to send UDP packets to a remote host through the proxy server.
the relay will listen for packets on the same port number as the SOCKS server does, and it doesn't support fragmentation however,
you could replace it with your own implementation with the help of the useReq hook

```typescript
import { createServer } from 'tsocks'

const host = '127.0.0.1'
const port = 1080

const server = createServer({
  socks4: true,
  socks5: true,
})

server.useReq('associate', (info, socket) => {
  const host = info.address.host
  const port = info.address.port // Port number
  const type = info.address.type // ipv4 | ipv6 | domain
  const version = info.version // SOCKS version
  // You can implement the rest how ever you want
  // Just remember the response should be decided by version
})

server.listen(port, host)
```

### Bind (TCP Relay)

When the bind command is sent to a SOCKS proxy server v4|v5, the proxy server starts to listen on a new TCP port
and sends the relay information back to the client. When another remote client connects to the proxy server on this port
the SOCKS proxy sends a notification that an incoming connection has been accepted to the initial client and
a full duplex stream is now established to the initial client and the client that connected to that special port.
according to the SOCKS RFC, only one inbound connection is allowed per bind request.
you can easily change my implementation of the bind command with your implementation or even deactivate it with the help of the useReq hook
and inform the client with a command not supported reply.

```typescript
import { createServer, Reply } from 'tsocks'

const host = '127.0.0.1'
const port = 1080

const server = createServer({
  socks4: true,
  socks5: true,
})

server.useReq('bind', (info, socket) => {
  const host = info.address.host
  const port = info.address.port // Port number
  const type = info.address.type // ipv4 | ipv6 | domain
  const version = info.version // SOCKS version
  // You can implement the rest however you want or reject the request
  // With the proper reply code as below
  // Remember the response should be decided by the version
  let reply
  if (version === 5) {
    reply = new Reply(version, 0x07, info.address)
  } else {
    reply = new Reply(version, 0x5b, info.address)
  }
  socket.write(reply.toBuffer())
})

server.listen(port, host)
```

### SOCKS Adaptor

You may want to use the SOCKS protocol to handle incoming network traffic.
so you can set up a SOCKS server and with the help of
useReq hook you have access to the socket and request information
which contains information like host address and port, therefore you can send traffic through a tunnel with any other protocol like WS or HTTP
or whatever you want and then send the response back to the client through SOCKS.

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
  const version = info.version // SOCKS version
  // You can implement the rest how ever you want
  // Just remember the response should be decided by version
})

server.listen(port, host)
```

### Proxy Client

No matter which version of the proxy server you want to interact with V4 or V5
you can easily implement it in a matter of seconds.

1. Single connection

   ```typescript
   import { connect } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const httpPort = 80

   try {
     const info = await connect(port, host, 5).connect(httpPort, 'google.com')

     info.socket.write(
       Buffer.from(
         'GET / HTTP/1.1\r\n' +
           'Host: www.google.com:80\r\n' +
           'Connection: close\r\n' +
           '\r\n'
       )
     )

     info.socket.on('data', (data) => {
       console.log(data)
     })
   } catch (err) {
     console.log(err)
   }
   ```

2. Multiple connections

   ```typescript
   import { connect } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const httpPort = 80

   const client = connect(port, host, 5)

   try {
     const info1 = await client.connect(httpPort, 'google.com')

     info1.socket.write(
       Buffer.from(
         'GET / HTTP/1.1\r\n' +
           'Host: www.google.com:80\r\n' +
           'Connection: close\r\n' +
           '\r\n'
       )
     )

     info1.socket.on('data', (data) => {
       console.log(data)
     })
   } catch (err) {
     console.log(err)
   }

   try {
     const info2 = await client.connect(httpPort, 'google.com')

     info2.socket.write(
       Buffer.from(
         'GET / HTTP/1.1\r\n' +
           'Host: www.google.com:80\r\n' +
           'Connection: close\r\n' +
           '\r\n'
       )
     )

     info2.socket.on('data', (data) => {
       console.log(data)
     })
   } catch (err) {
     console.log(err)
   }
   ```

### Proxy client with authentication

There are two different authentication methods independent
of which version of the SOCKS protocol you are working with.
in case you are using V5, you can use the useAuth hook and use
one of the available methods from the [methods'](src/client/auth/methods)
directory, or if you want to create your own implementations or
custom methods, you have to define a function that implements the
AuthMethod interface, like [userPass.ts](src/client/auth/methods/userPass.ts) and pass it as an argument to useAuth hook,
in case you are using V4 you have to add your identification token
as an argument (userId) to the request handler (connect | bind | associate).

1. Authentication socks5

   ```typescript
   import { connect, clientAuthMethods } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const username = 'user'
   const password = 'pass'
   const httpPort = 80

   try {
     const info = await connect(port, host, 5)
       .useAuth(clientAuthMethods.userPass(username, password))
       .connect(httpPort, 'google.com')

     info.socket.write(
       Buffer.from(
         'GET / HTTP/1.1\r\n' +
           'Host: www.google.com:80\r\n' +
           'Connection: close\r\n' +
           '\r\n'
       )
     )

     info.socket.on('data', (data) => {
       console.log(data)
     })
   } catch (err) {
     console.log(err)
   }
   ```

2. Identification socks4

   ```typescript
   import { connect } from 'tsocks'

   const host = '127.0.0.1'
   const port = 1080
   const userId = 'user:pass'
   const httpPort = 80

   try {
     const info = await connect(port, host, 4, userId).connect(
       httpPort,
       '142.251.1.101'
     )

     info.socket.write(
       Buffer.from(
         'GET / HTTP/1.1\r\n' +
           'Host: www.google.com:80\r\n' +
           'Connection: close\r\n' +
           '\r\n'
       )
     )

     info.socket.on('data', (data) => {
       console.log(data)
     })
   } catch (err) {
     console.log(err)
   }
   ```

### Associate (UDP Relay)

The associate command assists you to send UDP packets to a remote host through the proxy server.
after sending an associate request the server will reply with the information about the relays host and port
with that information, you can create a datagram socket and send your UDP packets to the address of the relay to get relayed.
as you can see in the example below you have to wrap your data with the createUdpFrame and also unwrap it with parseUdpFrame as it's part of the protocol

```typescript
import {
  createServer,
  connect,
  createUdpFrame,
  parseUdpFrame,
  Address,
} from 'tsocks'
import * as dgram from 'dgram'

const host = '127.0.0.1'
const port = 1080

// Create simple socks server
const server = createServer()
server.listen(port, host)

// Creates a simple echo server that returns whatever you send
const echoServerPort = 5467
const echoServer = dgram.createSocket('udp4')
echoServer.on('message', (msg, rinfo) => {
  echoServer.send(msg, rinfo.port, rinfo.address)
})
echoServer.bind(echoServerPort)

try {
  // Send an associate request
  const info = await connect(port, host, 5).associate(0, '0.0.0.0')
  const udpSocket = dgram.createSocket('udp4')
  udpSocket.send(
    createUdpFrame(
      new Address(echoServerPort, '127.0.0.1'),
      Buffer.from('Hello')
    ),
    info.address.port,
    info.address.host
  )
  udpSocket.once('message', (msg) => {
    const parsedMsg = parseUdpFrame(msg)
    console.log(parsedMsg.data.toString())
  })

  info.socket.on('data', (data) => {
    console.log(data)
  })
} catch (err) {
  console.log(err)
}
```

### Bind (TCP Relay)

When the bind command is sent to a SOCKS proxy server v4|v5, the proxy server starts to listen on a new TCP port
and sends the relay information back to the client. When another remote client connects to the proxy server on this port
the SOCKS proxy sends a notification that an incoming connection has been accepted to the initial client and
a full duplex stream is now established to the initial client and the client that connected to that special port.
according to the SOCKS RFC, only one inbound connection is allowed per bind request.

```typescript
import { createServer, connect, Reply } from 'tsocks'
import * as net from 'net'

const host = '127.0.0.1'
const port = 1080
// v5 or v4
const version = 5

// Create simple socks server
const server = createServer()
server.listen(port, host)

try {
  // Send a bind request
  const info = await connect(port, host, version).bind(0, '0.0.0.0')
  const remote = net.connect(info.address.port, info.address.host)
  const states = ['information', 'relay']
  let state = 0
  console.log(info.address)
  // The relays Address and port
  // host: "143.123.35.425",
  // port: 3342,
  // type: "ipv4",
  info.socket.on('data', (data) => {
    switch (states[state]) {
      case states[1]:
        console.log(data.toString())
        remote.destroy()
        info.socket.destroy()
        break
      default:
        const reply = Reply.from(data)
        console.log(reply.addr)
        // The remote address of the client that connected to the SOCKS proxy
        //host: "122.153.15.225",
        //port: 4562,
        //type: "ipv4",
        remote.write(Buffer.from('Hello'))
        state++
    }
  })
} catch (err) {
  console.log(err)
}
```

## References

- [RFC - SOCKS Protocol Version 5](https://www.rfc-editor.org/rfc/rfc1928)
- [OpenSSH - SOCKS Protocol Version 4](https://www.openssh.com/txt/socks4.protocol)
- [RFC - Username/Password Authentication for SOCKS V5](https://www.rfc-editor.org/rfc/rfc1929)
- [RFC - Identification Protocol](https://www.rfc-editor.org/rfc/rfc1413)

### Contact Me

Email : `moizadloo@gmail.com`
