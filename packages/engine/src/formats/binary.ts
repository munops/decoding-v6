import { dataUri } from './data-uri'
import { zstd } from './zstd'
import { msgpack } from './msgpack'
import { cbor } from './cbor'
import { protobuf } from './protobuf'
import { saml } from './saml'
import { toml } from './toml'
import { magicBytes } from './magic-bytes'
export const binaryDetectors = [dataUri, zstd, msgpack, cbor, protobuf, saml, toml, magicBytes]
