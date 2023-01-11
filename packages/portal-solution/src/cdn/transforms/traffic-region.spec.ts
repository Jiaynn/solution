import { combineForeignRegions } from './traffic-region'

it('combineForeignRegions works correctly', () => {
  expect(combineForeignRegions(['china'])).toEqual(['china'])
  expect(combineForeignRegions(['china', 'sea'])).toEqual(['china', 'sea'])
  expect(combineForeignRegions(['china', 'sea', 'asia', 'ameu', 'sa', 'oc'])).toEqual(['china', 'foreign'])
  expect(combineForeignRegions(['sea', 'asia', 'ameu', 'sa', 'oc'])).toEqual(['foreign'])
  expect(combineForeignRegions(['sa', 'oc'])).toEqual(['sa', 'oc'])
})
