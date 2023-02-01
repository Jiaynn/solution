/**
 * @file modal relative hooks
 * @author linchen <gakiclin@gmail.com>
 */

import { useState, useEffect } from 'react'

import { ModalStore } from 'cdn/stores/modal'

export function useModal<T, V>() {
  const [modalStore] = useState(
    () => new ModalStore<T, V>()
  )

  useEffect(() => modalStore.dispose, [modalStore])

  return modalStore
}
