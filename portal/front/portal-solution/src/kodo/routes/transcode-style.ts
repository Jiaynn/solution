/**
 * @file transcode-style route
 * @author zhangheng <zhangheng01@qiniu.com>
 */

export function getCreatePrivatePipelinePath() {
  return '/dora/mps/new'
}

export function getCreateWorkflowPath(region: string, bucket: string) {
  return `/dora/media-gate/workflow/create?region=${region}&bucket=${bucket}&from=kodo`
}
