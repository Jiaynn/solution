import { jsonStringToObject } from '../../utils/parse';

describe('test utils parse', function() {
  it('jsonStringToObject function', function() {
    expect(jsonStringToObject('')).toEqual('');
    expect(jsonStringToObject('{}')).toEqual({});
    expect(jsonStringToObject('{a: 1}')).toEqual('{a: 1}');
    expect(jsonStringToObject('{"a": 1}')).toEqual({ a: 1 });
  });
});