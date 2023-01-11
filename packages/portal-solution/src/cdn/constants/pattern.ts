export const domain = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
export const domainWithWildcard = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
export const hostname = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]+$/
// 宽松的匹配 IP 的正则，支持 IPv4/IPv6
export const ip = /^((\d+\.){3}\d+|([a-fA-F\d]*:){2,8}[a-fA-F\d.]*(%[0-9a-zA-Z]{1,})?)$/
export const referer = /^((\*\.){0,1}([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]+)+$/
// 宽松的匹配网段的正则，支持 IPv4/IPv6
export const segment = /^([a-fA-F\d.:]+)\/\d+$/
export const asteriskWildcardDomain = /^\*\.([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,7}$/
export const httpUrl = /(http(s)?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/
export const email = /^[a-z0-9_]+(\.?[a-z0-9-_])*?@([a-zA-Z0-9]([a-zA-Z0-9-]*?[a-zA-Z0-9])?\.)+[a-zA-Z]{2,20}$/i
export const phone = /^\d{11}$/ // 乞丐版手机号 pattern
