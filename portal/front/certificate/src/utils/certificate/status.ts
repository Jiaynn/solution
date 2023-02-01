/*
 * @file component certificate transforms
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import { doneStatuses, pendingStatuses, payingStatuses, shouldHasCertStatuses } from '../../constants/ssl'

export function isStatusDone(status: number) {
  return doneStatuses.indexOf(status) !== -1
}

export function isStatusPending(status: number) {
  return pendingStatuses.indexOf(status) !== -1
}

export function isStatusPaying(status: number) {
  return payingStatuses.indexOf(status) !== -1
}

export function shouldHasCert(status: number) {
  return shouldHasCertStatuses.indexOf(status) !== -1
}
