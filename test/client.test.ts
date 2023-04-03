import {
  createServer,
  connect,
  clientAuthMethods,
  serverAuthMethods,
  createUdpFrame,
  parseUdpFrame,
} from '../src'
import { ADDRESSTYPES, SOCKS5REPLY } from '../src/helper/constants'
import * as dgram from 'dgram'
import Address from '../src/helper/address'
import * as dns from 'dns'
import net from 'net'
import Readable from '../src/helper/readable'

jest.setTimeout(20000)
const serverPort = 3369
const serverHost = '127.0.0.1'
const httpPort = 80

describe('client socks5 (connect | associate | bind)', () => {
  const server = createServer()
  const fakeDnsPort = 3456
  const fakeDnsServer = dgram.createSocket('udp4')
  beforeAll((done) => {
    fakeDnsServer.bind(fakeDnsPort)
    server.listen(serverPort, serverHost)
    done()
  })

  test('connect to google.com', (done) => {
    connect(serverPort, serverHost, 5)
      .connect(httpPort, 'google.com')
      .then((info) => {
        info.socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        info.socket.once('data', (data) => {
          info.socket.destroy()
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
        })
      })
      .catch((reason) => {
        expect(true).toBe(false)
      })
  })

  test('associate', (done) => {
    connect(serverPort, serverHost, 5)
      .associate(0, '0.0.0.0')
      .then((info) => {
        const udpSocket = dgram.createSocket('udp4')
        dns.setServers([`127.0.0.1:${fakeDnsPort}`])
        dns.resolve('google.com', (err, addresses) => {
          fakeDnsServer.close()
          udpSocket.close()
          done()
        })
        fakeDnsServer.on('message', (msg, rinfo) => {
          udpSocket.send(
            createUdpFrame(new Address(53, '8.8.8.8'), Buffer.from(msg)),
            info.address.port,
            info.address.host
          )
          udpSocket.once('message', (msg) => {
            const parsedMsg = parseUdpFrame(msg)
            fakeDnsServer.send(parsedMsg.data, rinfo.port, rinfo.address)
          })
        })
        udpSocket.bind()
      })
      .catch((reason) => {
        console.log(reason)
        expect(true).toBe(false)
      })
  })

  test('bind', (done) => {
    connect(serverPort, serverHost, 5)
      .bind(0, '0.0.0.0')
      .then((info) => {
        const remote = net.connect(info.address.port, info.address.host)
        const states = ['information', 'relay']
        let readable, port, host, atype, relayAddr
        let state = 0
        info.socket.on('data', (data) => {
          switch (states[state]) {
            case states[1]:
              expect(data.toString()).toBe('Hello')
              remote.destroy()
              info.socket.destroy()
              done()
              break
            default:
              readable = new Readable(data)
              readable.read(3)
              atype = readable.read(1).readInt8()
              switch (atype) {
                case ADDRESSTYPES.ipv4:
                  host = readable.read(4)
                  break
                case ADDRESSTYPES.ipv6:
                  host = readable.read(16)
                  break
                default:
                  host = readable.read(readable.read(1).readInt8())
                  break
              }
              port = readable.read(2)
              relayAddr = Address.buffToAddrFactory(port, host, atype)
              remote.write(Buffer.from('Hello'))
              state++
          }
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
      .then((info) => {
        info.socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        info.socket.once('data', (data) => {
          info.socket.destroy()
          expect(data.toString()).toMatch(/20[01] OK/)
          done()
        })
      })
      .catch((reason) => {
        expect(true).toBe(false)
      })
  })

  test('bind', (done) => {
    connect(serverPort, serverHost, 4)
      .bind(0, '0.0.0.0')
      .then((info) => {
        const remote = net.connect(info.address.port, info.address.host)
        const states = ['information', 'relay']
        let readable, port, host, relayAddr
        let state = 0
        info.socket.on('data', (data) => {
          switch (states[state]) {
            case states[1]:
              expect(data.toString()).toBe('Hello')
              remote.destroy()
              info.socket.destroy()
              done()
              break
            default:
              readable = new Readable(data)
              readable.read(3)
              port = readable.read(2)
              host = readable.read(4)
              relayAddr = Address.buffToAddrFactory(
                port,
                host,
                ADDRESSTYPES.ipv4
              )
              remote.write(Buffer.from('Hello'))
              state++
          }
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
      .then((info) => {
        info.socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        info.socket.once('data', (data) => {
          info.socket.destroy()
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
      .then((info) => {
        info.socket.write(
          Buffer.from(
            'GET / HTTP/1.1\r\n' +
              'Host: www.google.com:80\r\n' +
              'Connection: close\r\n' +
              '\r\n'
          )
        )
        info.socket.once('data', (data) => {
          info.socket.destroy()
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

describe('client check useReq', () => {
  const server = createServer()
  beforeAll((done) => {
    server.listen(serverPort, serverHost)
    done()
  })

  test('useReq connect', (done) => {
    let google = new Address(httpPort, '142.251.1.101')
    const id = 'tsocks:tsocks'
    connect(serverPort, serverHost, 4, id)
      .useReq('connect', (info, socket, event, resolve, reject) => {
        expect(info).toEqual({
          version: 0x04,
          address: google,
          userId: id,
        })
        done()
      })
      .connect(httpPort, '142.251.1.101')
  })

  afterAll((done) => {
    server.close()
    done()
  })
})
