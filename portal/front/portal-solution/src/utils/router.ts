import { basenameMap, Solution } from 'constants/solutions'
import { basename } from 'constants/routes'

export const buildPath = (type: Solution) => `${basename}${basenameMap[type]}`

export const imagePath = buildPath(Solution.Image)
export const messagePath = buildPath(Solution.Message)
export const lowcodePath = buildPath(Solution.Lowcode)
export const interactMarketingPath = buildPath(Solution.InteractMarketing)
