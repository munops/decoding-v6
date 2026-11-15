import { mac } from './mac'
import { cidr } from './cidr'
import { curlCommand } from './curl-command'
import { base45 } from './base45'
import { ethereumAddress } from './ethereum-address'
import { bitcoinAddress } from './bitcoin-address'
import { color } from './color'
import { userAgent } from './user-agent'
import { binaryBytes, octalBytes } from './byte-arrays'
export const expandedDetectors = [
  binaryBytes,
  octalBytes,
  userAgent,
  color,
  bitcoinAddress,
  ethereumAddress,
  base45,
  curlCommand,
  cidr,
  mac,
]
