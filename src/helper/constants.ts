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

interface Reply {
  code: number
  msg: string
}

type Socks5ReplyName =
  | 'succeeded'
  | 'generalFailure'
  | 'notAllowed'
  | 'netUnreachable'
  | 'hostUnreachable'
  | 'connRefused'
  | 'ttlExpired'
  | 'cmdNotSupported'
  | 'atypeNotSupported'

/**
 * Socks5's specific available reply codes
 */
export const SOCKS5REPLY: Record<Socks5ReplyName, Reply> = Object.freeze({
  succeeded: {
    code: 0x00,
    msg: 'Succeeded',
  },
  generalFailure: {
    code: 0x01,
    msg: 'General SOCKS server failure',
  },
  notAllowed: {
    code: 0x02,
    msg: 'Connection not allowed by ruleset',
  },
  netUnreachable: {
    code: 0x03,
    msg: 'Network unreachable',
  },
  hostUnreachable: {
    code: 0x03,
    msg: 'Host unreachable',
  },
  connRefused: {
    code: 0x05,
    msg: 'Connection refused',
  },
  ttlExpired: {
    code: 0x06,
    msg: 'TTL expired',
  },
  cmdNotSupported: {
    code: 0x07,
    msg: 'Command not supported',
  },
  atypeNotSupported: {
    code: 0x08,
    msg: 'Address type not supported',
  },
})

type Socks4ReplyName = 'granted' | 'rejected' | 'identFail' | 'diffUserId'

/**
 * Socks4's specific available reply codes
 */
export const SOCKS4REPLY: Record<Socks4ReplyName, Reply> = Object.freeze({
  granted: {
    code: 0x5a,
    msg: 'Request granted',
  },
  rejected: {
    code: 0x5b,
    msg: 'Request rejected or failed',
  },
  identFail: {
    code: 0x5c,
    msg: 'request rejected because SOCKS server cannot connect to identity on the client',
  },
  diffUserId: {
    code: 0x5d,
    msg: 'request rejected because the client program and identity report different user-ids',
  },
})
