import { color } from './color'
import { userAgent } from './user-agent'
import { binaryBytes, octalBytes } from './byte-arrays'
export const expandedDetectors = [binaryBytes, octalBytes, userAgent, color]
