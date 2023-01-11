/**
 * @file NormalAndPanDomain Detail formstate
 * @author linchen <gakiclin@gmail.com>
 */

import { pickBy } from 'lodash'

import { cacheConfigApi2Form } from 'cdn/transforms/domain/cache'

import { bsAuthConfigForForm } from 'cdn/transforms/domain/bs-auth'

import { joinImageSlims } from 'cdn/transforms/domain/image-slim'

import {
  advancedSourceForForm,
  sourceIgnoreParamsConfigApi2Form,
  sourceHostApi2Form
} from 'cdn/transforms/domain/source'

import AbilityConfig from 'cdn/constants/ability-config'
import { CertInputType } from 'cdn/constants/domain'

import * as sourceConfigInput from 'cdn/components/Domain/Inputs/SourceConfigInput'
import * as cacheConfigInput from 'cdn/components/Domain/Inputs/CacheConfigInput'
import * as refererConfigInput from 'cdn/components/Domain/Inputs/RefererConfigInput'
import * as timeRefererConfigInput from 'cdn/components/Domain/Inputs/TimeRefererConfigInput'
import * as bsAuthConfigInput from 'cdn/components/Domain/Inputs/BsAuthConfigInput'
import * as ipACLConfigInput from 'cdn/components/Domain/Inputs/IpACLConfigInput'
import * as httpsConfigInput from 'cdn/components/Domain/Inputs/HttpsConfigInput/ForEdit'
import * as imageSlimConfigInput from 'cdn/components/Domain/Inputs/ImageSlimConfigInput'
import * as fopConfigInput from 'cdn/components/Domain/Inputs/FopConfigInput'
import * as responseHeaderConfigInput from 'cdn/components/Domain/Inputs/HeaderInput'

import DomainApis, { IDomainDetail } from 'cdn/apis/domain'

export function createStateMap(
  domainApis: DomainApis,
  domain: IDomainDetail,
  isQiniuPrivate: () => boolean,
  abilityConfig: AbilityConfig
) {

  return {
    sourceConfig: createSourceState(domainApis, domain),
    cacheConfig: abilityConfig.useStaticCacheConfig
      ? createStaticCacheState(domain)
      : createCacheState(domain),
    refererConfig: createRefererState(domain),
    timeRefererConfig: createTimeRefererState(domain),
    bsAuthConfig: createBsAuthState(domain, isQiniuPrivate),
    ipACLConfig: createIpAclState(domain),
    httpsConfig: createHttpsState(domain),
    imageSlimConfig: createImageSlimState(domain),
    fopConfig: createFopState(domain),
    responseHeaderControlConfig: createResponseHeaderState(domain)
  }
}

export type StateMap = ReturnType<typeof createStateMap>

export type ConfigType = keyof StateMap

function createSourceState(domainApis: DomainApis, domain: IDomainDetail) {
  return sourceConfigInput.createState(domainApis, true, {
    ...sourceConfigInput.getDefaultSourceConfig(),
    ...pickBy({
      sourceType: domain.source.sourceType,
      sourceHost: sourceHostApi2Form(domain.source.sourceHost, domain.source.sourceDomain, domain.name),
      sourceURLScheme: domain.source.sourceURLScheme,
      sourceQiniuBucket: domain.source.sourceQiniuBucket,
      sourceDomain: domain.source.sourceDomain,
      sourceIPs: domain.source.sourceIPs,
      advancedSources: (
        domain.source.advancedSources
        && domain.source.advancedSources.map(advancedSourceForForm)
      ),
      testURLPath: domain.source.testURLPath,
      testSourceHost: domain.source.testSourceHost,
      sourceIgnoreParamsConfig: sourceIgnoreParamsConfigApi2Form({
        sourceIgnoreAllParams: domain.source.sourceIgnoreAllParams,
        sourceIgnoreParams: domain.source.sourceIgnoreParams
      }),
      urlRewrites: domain.source.urlRewrites
    }, v => v != null)
  }, () => [domain])
}

function createCacheState(domain: IDomainDetail) {
  return cacheConfigInput.createState(cacheConfigApi2Form(domain.cache))
}

function createStaticCacheState(domain: IDomainDetail) {
  return cacheConfigInput.createStaticCacheState(cacheConfigApi2Form(domain.cache))
}

function createRefererState(domain: IDomainDetail) {
  return refererConfigInput.createState({
    refererType: domain.referer.refererType,
    refererValues: domain.referer.refererValues,
    nullReferer: domain.referer.nullReferer
  })
}

function createTimeRefererState(domain: IDomainDetail) {
  return timeRefererConfigInput.createState({
    timeACL: domain.timeACL.enable,
    timeACLKeys: domain.timeACL.timeACLKeys || ['', ''],
    checkUrl: ''
  })
}

function createBsAuthState(domain: IDomainDetail, isQiniuPrivate: () => boolean) {
  const config = bsAuthConfigForForm(domain.bsauth)
  return bsAuthConfigInput.createState(config, isQiniuPrivate)
}

function createIpAclState(domain: IDomainDetail) {
  return ipACLConfigInput.createState({
    ipACLType: domain.ipACL.ipACLType,
    ipACLValues: domain.ipACL.ipACLValues
  })
}

function createHttpsState(domain: IDomainDetail) {
  return httpsConfigInput.createState({
    protocol: domain.protocol,
    certId: domain.https.certId,
    uploadCertId: null!,
    forceHttps: domain.https.forceHttps,
    http2Enable: domain.https.http2Enable,
    certInputType: CertInputType.Existed,
    agreeLicense: false
  })
}

function createImageSlimState(domain: IDomainDetail) {
  return imageSlimConfigInput.createState({
    enableImageSlim: domain.external.imageSlim.enableImageSlim,
    prefixImageSlims: joinImageSlims(domain.external.imageSlim.prefixImageSlims),
    regexpImageSlims: joinImageSlims(domain.external.imageSlim.regexpImageSlims)
  })
}

function createFopState(domain: IDomainDetail) {
  return fopConfigInput.createState({
    enableFop: domain.external.enableFop
  })
}

function createResponseHeaderState(domain: IDomainDetail) {
  return responseHeaderConfigInput.createState(domain.responseHeaderControls || [])
}

export function createStateByType(
  type: ConfigType,
  domainApis: DomainApis,
  domain: IDomainDetail,
  isQiniuPrivate: () => boolean,
  abilityConfig: AbilityConfig
) {
  switch (type) {
    case 'bsAuthConfig': {
      return createBsAuthState(domain, isQiniuPrivate)
    }
    case 'cacheConfig': {
      return abilityConfig.useStaticCacheConfig
        ? createStaticCacheState(domain)
        : createCacheState(domain)
    }
    case 'fopConfig': {
      return createFopState(domain)
    }
    case 'httpsConfig': {
      return createHttpsState(domain)
    }
    case 'imageSlimConfig': {
      return createImageSlimState(domain)
    }
    case 'ipACLConfig': {
      return createIpAclState(domain)
    }
    case 'responseHeaderControlConfig': {
      return createResponseHeaderState(domain)
    }
    case 'sourceConfig': {
      return createSourceState(domainApis, domain)
    }
    case 'timeRefererConfig': {
      return createTimeRefererState(domain)
    }
    case 'refererConfig': {
      return createRefererState(domain)
    }
    default: { break }
  }
}

export function getSourceConfigValue(state: sourceConfigInput.State) {
  return sourceConfigInput.getValue(state)
}

export function getBsAuthConfigValue(state: bsAuthConfigInput.State) {
  return bsAuthConfigInput.getValue(state)
}

export function getHttpsConfigValue(state: httpsConfigInput.State) {
  return httpsConfigInput.getValue(state)
}

export function getCacheConfigValue(state: cacheConfigInput.State) {
  return state.value
}

export function getRefererConfigValue(state: refererConfigInput.State) {
  return refererConfigInput.getValue(state)
}

export function getTimeRefererConfigValue(state: timeRefererConfigInput.State) {
  return timeRefererConfigInput.getValue(state)
}

export function getIpAclConfigValue(state: ipACLConfigInput.State) {
  return ipACLConfigInput.getValue(state)
}

export function getImageSlimConfigValue(state: imageSlimConfigInput.State) {
  return imageSlimConfigInput.getValue(state)
}

export function getFopConfigValue(state: fopConfigInput.State) {
  return fopConfigInput.getValue(state)
}

export function getRespHeaderConfigValue(state: responseHeaderConfigInput.State) {
  return state.value
}
