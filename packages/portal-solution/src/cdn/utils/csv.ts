/**
 * @file csv utils file
 * @autuor linchen <linchen@qiniu.com>
 */

import { saveAs } from 'file-saver'
import { Parser as Json2csvParser } from 'json2csv'

export function exportCSVFile(data: unknown, filename: string) {
  const parser = new Json2csvParser({ withBOM: true })
  const blob = new Blob([parser.parse(data)], {
    type: 'text/csv;charset=utf-8'
  })
  // 拼上 csv 文件后缀
  filename = /\.csv$/i.test(filename) ? filename : `${filename}.csv`
  saveAs(blob, filename)
}
