/*
 * @file overview info constants
 * @author zhuhao <zhuhao@qiniu.com>
 */

export enum UserSearchField {
  RemarkName = 'remarkName',
  FirstName = 'firstName',
  LastName = 'lastName',
  Position = 'position',
  Phone = 'phone'
}

export const userSearchFieldTextMap = {
  [UserSearchField.RemarkName]: '备注名称',
  [UserSearchField.LastName]: '姓',
  [UserSearchField.FirstName]: '名',
  [UserSearchField.Position]: '职位',
  [UserSearchField.Phone]: '电话'
}

export const userSearchFieldOptionList = Object.values(UserSearchField)
  .map(field => ({ value: field, label: userSearchFieldTextMap[field] }))

export enum CompanySearchField {
  Name = 'name',
  RemarkName = 'remarkName',
  Division = 'division',
  Phone = 'phone'
}

export const companySearchFieldTextMap = {
  [CompanySearchField.RemarkName]: '备注名称',
  [CompanySearchField.Name]: '公司名称',
  [CompanySearchField.Division]: '部门',
  [CompanySearchField.Phone]: '座机电话'
}

export const companySearchFieldOptionList = Object.values(CompanySearchField)
  .map(field => ({ value: field, label: companySearchFieldTextMap[field] }))
