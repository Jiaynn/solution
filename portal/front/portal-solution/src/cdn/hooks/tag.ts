/**
 * @file Tags relative hooks
 * @author linchen <gakiclin@gmail.com>
 */

import { useCallback, useEffect } from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { useAsync } from 'cdn/hooks/api'

import TagApis from 'cdn/apis/tag'

/**
 * @description 默认 fireImmediately
 */
export function useTags() {
  const {
    isLoading,
    isIdle,
    isError,
    error,
    isSuccess,
    run,
    result
  } = useAsync<string[]>([])

  const tagApis = useInjection(TagApis)

  const call = useCallback(() => (
    run(tagApis.getTags())
  ), [run, tagApis])

  useEffect(() => { call() }, [call])

  const toaster = useInjection(Toaster)

  useEffect(() => {
    if (isError) {
      toaster.exception(error)
    }
  }, [toaster, error, isError])

  return {
    call,
    isIdle,
    isSuccess,
    isLoading,
    tags: result || []
  }
}

export function useCreateTag() {
  const {
    isLoading,
    isIdle,
    isError,
    isSuccess,
    error,
    run
  } = useAsync()
  const tagApis = useInjection(TagApis)

  const call = useCallback((tag: string) => (
    run(tagApis.createTag(tag))
  ), [run, tagApis])

  const toaster = useInjection(Toaster)

  useEffect(() => {
    if (isError) {
      toaster.exception(error)
    }
  }, [toaster, error, isError])

  return {
    call,
    isIdle,
    isError,
    isSuccess,
    isCreating: isLoading
  }
}

export function useBindDomainTags(domain: string) {
  const {
    isLoading,
    isIdle,
    isError,
    error,
    run
  } = useAsync()
  const tagApis = useInjection(TagApis)

  const call = useCallback((tags: string[]) => (
    run(tagApis.updateDomainTags(domain, tags))
  ), [domain, run, tagApis])

  const toaster = useInjection(Toaster)

  useEffect(() => {
    if (isError) {
      toaster.exception(error)
    }
  }, [toaster, error, isError])

  return {
    call,
    isIdle,
    isLoading
  }
}
