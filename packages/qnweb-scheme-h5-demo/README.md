# qnweb-scheme-h5-demo

方案解决demo

## 功能

*  展示方案列表和详情介绍，并关联对应现有的demo应用


## 技术选型

* [React](https://github.com/facebook/react)
* [TypeScript](https://github.com/microsoft/TypeScript)
* [Vite](https://github.com/vitejs/vite)

## 快速启动

```shell
$ pnpm install
$ pnpm run dev
```

## 如何打包

```shell
$ pnpm run build
```

## 目录结构

```
src                                                               
├─ components                                                     
│  ├─ AppList    # app列表展示                                           
│  └─ SearchBar  # 搜索栏                                          
├─ data                                                           
│  └─ index.ts   # 数据                                                 
├─ pages                                                          
│  ├─ AppInfo    # 详情页为图片版本                                           
│  ├─ Home       # 首页                                        
│  ├─ Search     # 搜索页                                         
│  └─ ShowDetail # 详情页为pdf版本                                            
├─ router                                                         
│  └─ index.tsx                                                   
├─ static        # 静态资源                                                  
├─ style                                                          
│  └─ index.scss                                                  
├─ types                                                          
│  └─ index.ts                                                    
├─ utils                                                          
│  ├─ filterApp.ts                                                
│  ├─ filterImage.ts                                              
│  ├─ hot.ts                                                      
│  ├─ index.ts                                                    
│  ├─ searchApp.ts                                                
│  └─ usePdf.ts   # 获取pdf并显示                                                
├─ App.tsx                                                        
├─ global.d.ts                                                    
├─ main.tsx                                                       
└─ vite-env.d.ts                                                  
```
## PRD地址
https://cf.qiniu.io/pages/viewpage.action?pageId=118227439
