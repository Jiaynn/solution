declare namespace qn {

  interface IListOptions {
    page?: number
    pageSize?: number
  }

  interface IListData<T> {
    count: number
    list: T[]
  }

}
