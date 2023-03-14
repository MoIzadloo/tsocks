import {
  createServer,
  connect,
  clientAuthMethods,
  serverAuthMethods,
} from '../src'
import { SOCKS5REPLY } from '../src/helper/constants'

jest.setTimeout(20000)
const serverPort = 3369
const serverHost = '127.0.0.1'
const httpPort = 80

describe('client socks5 (connect | associate | bind)', () => {
  const server = createServer()
  beforeAll((done) => {
    server.listen(serverPort, serverHost)
    done()
  })

  test('connect to google.com', (done) => {
    connect(serverPort, serverHost, 5)
      .connect(httpPort, 'google.com')
      .then((socket) => {
        socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        socket.once('data', (data) => {
          socket.destroy()
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
        })
      })
      .catch((reason) => {
        expect(true).toBe(false)
      })
  })

  test('connect to wrong domain', () => {
    return expect(
      connect(serverPort, serverHost, 5).connect(httpPort, 'dummy-url.c')
    ).rejects.toBe(SOCKS5REPLY.generalFailure.msg)
  })

  afterAll((done) => {
    server.close()
    done()
  })
})

describe('client socks4 (connect | associate | bind)', () => {
  const server = createServer()
  beforeAll((done) => {
    server.listen(serverPort, serverHost)
    done()
  })

  test('connect to google.com', (done) => {
    connect(serverPort, serverHost, 4)
      .connect(httpPort, '142.251.1.101')
      .then((socket) => {
        socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        socket.once('data', (data) => {
          socket.destroy()
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
        })
      })
      .catch((reason) => {
        expect(true).toBe(false)
      })
  })

  afterAll((done) => {
    server.close()
    done()
  })
})

describe('client check authentication and identification', () => {
  const server = createServer()
  beforeAll((done) => {
    server.listen(serverPort, serverHost)
    server.useIdent((userId) => {
      return userId === 'tsocks'
    })
    server.useAuth(
      serverAuthMethods.userPass((user, pass) => {
        return user == 'tsocks' && pass == 'tsocks'
      })
    )
    done()
  })

  test('socks4 identification', (done) => {
    connect(serverPort, serverHost, 4, 'tsocks')
      .connect(httpPort, '142.251.1.101')
      .then((socket) => {
        socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        socket.once('data', (data) => {
          socket.destroy()
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
        })
      })
      .catch((reason) => {
        expect(true).toBe(false)
      })
  })

  test('socks5 authentication', (done) => {
    connect(serverPort, serverHost, 5)
      .useAuth(clientAuthMethods.userPass('tsocks', 'tsocks'))
      .connect(httpPort, '142.251.1.101')
      .then((socket) => {
        socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        socket.once('data', (data) => {
          socket.destroy()
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
        })
      })
      .catch((reason) => {
        expect(true).toBe(false)
      })
  })

  afterAll((done) => {
    server.close()
    done()
  })
})
