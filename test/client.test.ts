import { createServer, connect } from '../src'
import Address from '../src/helper/address'
import { userPass } from '../src/server/auth/methods'
import { SOCKSVERSIONS, COMMANDS } from '../src/helper/constants'
import net from 'net'

jest.setTimeout(20000)
const serverPort = 3369
const serverHost = '127.0.0.1'
const httpPort = 80

describe('client socks5 (connect | associate | bind)', () => {
  const server = createServer()
  beforeAll((done) => {
    server.listen(serverPort, serverHost)
    server.on('data', data => console.log(data))
    done()
  })

  test('connect to google.com', (done) => {
    const socket = connect(serverPort, serverHost).connect(
      httpPort,
      'google.com',
      5
    )
    socket.write(Buffer.from(
      'GET / HTTP/1.1\r\n' +
      'Host: www.google.com:80\r\n' +
      'Connection: close\r\n' +
      '\r\n'
    ))
    console.log('passed')
    socket.on('data', data => {
      console.log(data)
      expect(data.toString()).toMatch(/20[01] OK/)
      done()
    })
  })

  afterAll((done) => {
    server.close()
    done()
  })
})
