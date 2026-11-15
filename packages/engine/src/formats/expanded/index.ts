import { roman } from './roman'
import { sql } from './sql'
import { logLine } from './log-line'
import { jsonLines } from './json-lines'
import { filetime } from './filetime'
import { asn1Der } from './asn1-der'
import { javaSerialization } from './java-serialization'
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
  javaSerialization,
  asn1Der,
  filetime,
  jsonLines,
  sql,
  logLine,
  roman,
]
