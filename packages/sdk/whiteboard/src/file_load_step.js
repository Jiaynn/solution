export default {
    // 收到 5-0，准备换取文件下载地址
    loading: `file_loading`,
    // 白板获取下载地址请求
    download_request: `download_request`,
    // 从 OSS-SDK 获取下载地址
    download_pdf: `download_pdf`,
    download_image: `download_image`,
    // 文件下载结果
    download_pdf_failed: `download_pdf_failed`,
    download_pdf_success: `download_pdf_success`,
    // 图片下载结果
    download_image_failed: `download_image_failed`,
    download_image_success: `download_image_success`,
    // 从程序内缓存读取文件
    read_pdf_app: `read_pdf_app`,
    // 从文件系统读取文件
    read_pdf_system: `read_pdf_system`,
    // 文件读取完成后转换为解析库可读取格式
    read_pdf_library: `read_pdf_library`,
    // 解析库读取页数据成功
    read_page_library: `read_page_library`,
    // 解析库页数据转换完成
    conver_page_success: `conver_page_success`,
    // 页数据写入文件系统成功
    write_page_success: `write_page_success`,
    // 通知白板文件已写入
    notice_write_page: `notice_write_page`
}