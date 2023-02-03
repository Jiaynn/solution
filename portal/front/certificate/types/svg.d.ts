declare module '*.svg' {
  const svgExport: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement
  export default svgExport
}
