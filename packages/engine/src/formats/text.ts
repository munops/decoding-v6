import { authHeader } from './auth-header'
import { datetime } from './datetime'
import { htmlEntities, unicodeEscapes } from './escapes'
import { pem } from './pem'
import { sshKey } from './ssh-key'
import { network } from './network'
import { cron } from './cron'
import { punycode } from './punycode'
import { mime } from './mime'
import { kv, env } from './kv'
import { base32, base58, ascii85 } from './base-n'
import { hashId } from './hash-id'
import { secretPatterns } from './secret-patterns'
import { jwe } from './jwe'
import { httpHeaders } from './http-headers'
import { dnsTxt } from './dns-txt'
import { yaml } from './yaml'
import { xml } from './xml'
import { k8sSecret } from './k8s-secret'
import { jsonDeep } from './json-deep'
import { textScan } from './text-scan'
import { pgpArmor } from './pgp-armor'
export const textDetectors = [
  authHeader,
  datetime,
  htmlEntities,
  unicodeEscapes,
  pem,
  sshKey,
  network,
  cron,
  punycode,
  mime,
  kv,
  env,
  base32,
  base58,
  ascii85,
  hashId,
  secretPatterns,
  jwe,
  httpHeaders,
  dnsTxt,
  yaml,
  xml,
  k8sSecret,
  jsonDeep,
  textScan,
  pgpArmor,
]
