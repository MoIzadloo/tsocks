import { createServer } from '../src'
import Address from '../src/helper/address'
import { userPass } from '../src/server/auth/methods'
import { SOCKSVERSIONS, COMMANDS } from '../src/helper/constants'
import net from 'net'

jest.setTimeout(20000)
const serverPort = 3369
const httpPort = 80

describe('server socks5 (connect | associate | bind)', () => {
  const server = createServer()
  beforeAll((done) => {
    server.listen(serverPort, '127.0.0.1')
    done()
  })

  test('connect to google.com', (done) => {
    const client = net.connect(serverPort, '127.0.0.1')
    const states = ['identifier', 'request', 'tunnel']
    let state = 0
    client.write(Buffer.from([SOCKSVERSIONS.socks5, 0x01, 0x00]))
    client.on('data', (data) => {
      switch (states[state]) {
        case states[2]:
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
          break
        case states[1]:
          client.write(
            Buffer.from(
              'GET / HTTP/1.1\r\n' +
                'Host: www.google.com:80\r\n' +
                'Connection: close\r\n' +
                '\r\n'
            )
          )
          ++state
          break
        default:
          const google = new Address(httpPort, 'google.com').toBuffer()
          client.write(
            Buffer.concat([
              Buffer.from([
                SOCKSVERSIONS.socks5,
                COMMANDS.connect,
                0x00,
                google.type,
                google.host.length,
              ]),
              google.host,
              google.port,
            ])
          )
          ++state
          break
      }
    })
  })

  afterAll((done) => {
    server.close()
    done()
  })
})

describe('server check auth (useAuth)', () => {
  const server = createServer()
  const username = 'tsocks'
  const password = 'tsocks'

  server.useAuth(
    userPass((user, pass) => {
      return user === username && pass === password
    })
  )

  beforeAll((done) => {
    server.listen(serverPort, '127.0.0.1')
    done()
  })

  test('user/pass method', (done) => {
    const client = net.connect(serverPort, '127.0.0.1')
    const states = ['negotiation', 'verify']
    let state = 0
    client.write(Buffer.from([SOCKSVERSIONS.socks5, 0x01, 0x02]))
    client.on('data', (data) => {
      switch (states[state]) {
        case states[1]:
          expect(data).toEqual(Buffer.from([SOCKSVERSIONS.socks5, 0x00]))
          client.destroy()
          done()
          break
        default:
          client.write(
            Buffer.concat([
              Buffer.from([SOCKSVERSIONS.socks5, username.length]),
              Buffer.from(username),
              Buffer.from([password.length]),
              Buffer.from(password),
            ])
          )
          ++state
          break
      }
    })
  })

  afterAll((done) => {
    server.close()
    done()
  })
})

describe('server socks4 check (connect | associate | bind)', () => {
  const server = createServer()
  beforeAll((done) => {
    server.listen(serverPort, '127.0.0.1')
    done()
  })

  test('connect to google.com', (done) => {
    const client = net.connect(serverPort, '127.0.0.1')
    const states = ['request', 'tunnel']
    let state = 0
    const google = new Address(httpPort, '142.251.1.101').toBuffer()
    client.write(
      Buffer.concat([
        Buffer.from([SOCKSVERSIONS.socks4, COMMANDS.connect]),
        google.port,
        google.host,
        Buffer.from([0x00]),
      ])
    )
    client.on('data', (data) => {
      switch (states[state]) {
        case states[1]:
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
          break
        default:
          client.write(
            Buffer.from(
              'GET / HTTP/1.1\r\n' +
                'Host: www.google.com:80\r\n' +
                'Connection: close\r\n' +
                '\r\n'
            )
          )
          ++state
          break
      }
    })
  })

  afterAll((done) => {
    server.close()
    done()
  })
})

describe('server check hooks (userReq | useIdent)', () => {
  const server = createServer()
  const id = 'tsocks:tsocks'
  let google = new Address(httpPort, '142.251.1.101')
  const connect = Buffer.concat([
    Buffer.from([SOCKSVERSIONS.socks4, COMMANDS.connect]),
    google.toBuffer().port,
    google.toBuffer().host,
    Buffer.from(id),
    Buffer.from([0x00]),
  ])

  beforeAll((done) => {
    server.listen(serverPort, '127.0.0.1')
    done()
  })

  test('useIdent', (done) => {
    const client = net.connect(serverPort, '127.0.0.1')
    server.useIdent((userId) => {
      expect(userId).toEqual(id)
      done()
      return true
    })
    client.write(connect)
  })

  test('useReq connect', (done) => {
    const client = net.connect(serverPort, '127.0.0.1')
    server.useReq('connect', (info, socket) => {
      expect(info).toEqual({
        version: 0x04,
        address: google,
      })
      done()
    })
    client.write(connect)
  })

  afterAll((done) => {
    server.close()
    done()
  })
})

describe('server check events (data)', () => {
  const server = createServer()
  let google = new Address(httpPort, '142.251.1.101')
  const connect = Buffer.concat([
    Buffer.from([SOCKSVERSIONS.socks4, COMMANDS.connect]),
    google.toBuffer().port,
    google.toBuffer().host,
    Buffer.from([0x00]),
  ])

  beforeAll((done) => {
    server.listen(serverPort, '127.0.0.1')
    done()
  })

  test('on data', (done) => {
    const client = net.connect(serverPort, '127.0.0.1')
    server.on('data', (data) => {
      expect(data).toEqual(connect)
      done()
    })
    client.write(connect)
  })

  afterAll((done) => {
    server.close()
    done()
  })
})
