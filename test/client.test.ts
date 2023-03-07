import { createServer, connect } from '../src'
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
    connect(serverPort, serverHost)
      .connect(httpPort, 'google.com', 5)
      .then((socket) => {
        socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        socket.on('data', async (data) => {
          socket.removeAllListeners('data')
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
      connect(serverPort, serverHost).connect(httpPort, 'dummy-url.c', 5)
    ).rejects.toBe(SOCKS5REPLY.generalFailure.msg)
  })

  test('wrong socks server address', async () => {
    return expect(
      connect(22, serverHost).connect(httpPort, 'google.com', 5)
    ).rejects.toMatch(/ECONNREFUSED/)
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
    connect(serverPort, serverHost)
      .connect(httpPort, '142.251.1.101', 4)
      .then((socket) => {
        socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        socket.on('data', async (data) => {
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
          socket.end()
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
    done()
  })

  test('socks4 identification', (done) => {
    connect(serverPort, serverHost)
      .connect(httpPort, '142.251.1.101', 4, 'tsocks')
      .then((socket) => {
        socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        socket.on('data', async (data) => {
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
          socket.end()
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
