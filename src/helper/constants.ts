interface SocksVersion {
  socks5: number
  socks4: number
}

/**
 * Versions of socks protocol
 */
export const SOCKSVERSIONS: SocksVersion = Object.freeze({
  socks5: 0x05,
  socks4: 0x04,
})

interface AuthModes {
  none: number
  userPass: number
}

/**
 * Socks5's specific available authentication methods
 */
export const AUTHMODES: AuthModes = Object.freeze({
  none: 0x00,
  userPass: 0x02,
})

interface AddressTypes {
  ipv4: number
  ipv6: number
  domain: number
}

/**
 * Available address types
 */
export const ADDRESSTYPES: AddressTypes = Object.freeze({
  ipv4: 0x01,
  ipv6: 0x04,
  domain: 0x03,
})

interface Commands {
  connect: number
  bind: number
  associate: number
}

/**
 * Available request commands
 */
export const COMMANDS: Commands = Object.freeze({
  connect: 0x01,
  bind: 0x02,
  associate: 0x03,
})

interface Socks5reply {
  succeeded: number
  serveFailure: number
  connRefused: number
}

/**
 * Socks5's specific available reply codes
 */
export const SOCKS5REPLY: Socks5reply = Object.freeze({
  succeeded: 0x00,
  serveFailure: 0x01,
  connRefused: 0x05,
})

interface Socks4reply {
  succeeded: number
  connRefused: number
}

/**
 * Socks5'4 specific available reply codes
 */
export const SOCKS4REPLY: Socks4reply = Object.freeze({
  succeeded: 0x5a,
  connRefused: 0x5b,
})
