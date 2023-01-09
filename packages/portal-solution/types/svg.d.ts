declare module '*.svg' {
  // export { SvgComponent } from 'portal-base/common/utils/svg'
  const svgExport: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement
  export default svgExport
}
