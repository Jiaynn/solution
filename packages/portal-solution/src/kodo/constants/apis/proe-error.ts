/**
 * @file kodo proe error constants
 * @author hovenjay <hovenjay@outlook.com>
 */

export enum ErrorName {
  InvalidParameter = 'invalid parameter',
  CreateTaskFail = 'create task fail',
  QueryTaskFail = 'query task fail',
  NotFund = 'not fond',
  TaskRunning = 'task running',
  EditTaskFail = 'edit task fail',
  DeleteTaskFail = 'delete task fail',
  RepeatOperation = 'repeat operation',
  GetWorkerFail = 'get worker fail',
  NoWorker = 'no worker',
  NoWorkerAvailable = 'no workers available',
  AddWorkersTaskFail = 'add worker\'s task fail',
  CallWorkerFail = 'call worker fail',
  StopTaskFail = 'stop task fail',
  QueryTaskLogFail = 'query task log fail'
}

export const errorMessages = {
  [ErrorName.InvalidParameter]: '无效的参数',
  [ErrorName.CreateTaskFail]: '任务创建失败',
  [ErrorName.QueryTaskFail]: '任务查询失败',
  [ErrorName.NotFund]: '任务不存在',
  [ErrorName.TaskRunning]: '任务运行中',
  [ErrorName.EditTaskFail]: '任务信息修改失败',
  [ErrorName.DeleteTaskFail]: '任务删除失败',
  [ErrorName.RepeatOperation]: '重复的操作',
  [ErrorName.GetWorkerFail]: '获取工作者失败',
  [ErrorName.NoWorker]: '无工作者',
  [ErrorName.NoWorkerAvailable]: '无可用的工作者',
  [ErrorName.AddWorkersTaskFail]: '添加工作者任务失败',
  [ErrorName.CallWorkerFail]: '调用工作者失败',
  [ErrorName.StopTaskFail]: '停止任务失败',
  [ErrorName.QueryTaskLogFail]: '查询任务日志失败'
}
