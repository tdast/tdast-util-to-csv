import td from 'tdastscript';

import toCsv from '../lib/to-csv';

describe(toCsv, () => {
  it('should serialize empty tree to empty csv', () => {
    expect(toCsv(td())).toEqual('');
    expect(toCsv(td('table'))).toEqual('');
    expect(toCsv(td('table', []))).toEqual('');
  });

  describe('RFC-4180-1', () => {
    it('should delimit rows with line breaks', () => {
      expect(
        toCsv(
          td('table', [
            td('row', ['row1cell1', 'row1cell2', 'row1cell3']),
            td('row', ['row2cell1', 'row2cell2', 'row2cell3']),
          ]),
        ),
      ).toEqual('row1cell1,row1cell2,row1cell3\nrow2cell1,row2cell2,row2cell3');
    });
  });

  describe('RFC-4180-2', () => {
    it('will not opinionatedly not add optional ending line break in rows', () => {
      const csv = toCsv(
        td('table', [
          td('row', ['row1cell1', 'row1cell2', 'row1cell3']),
          td('row', ['row2cell1', 'row2cell2', 'row2cell3']),
        ]),
      );
      expect(csv[csv.length - 1]).not.toEqual('\n');
    });
  });

  describe('RFC-4180-3', () => {
    it('should serialize multiple rows with multiple columns + cells to csv', () => {
      expect(
        toCsv(
          td('table', [
            td('row', [
              td('column', 'col1'),
              td('column', 'col2'),
              td('column', 'col3'),
            ]),
            td('row', ['row2cell1', 'row2cell2', 'row2cell3']),
          ]),
        ),
      ).toEqual('col1,col2,col3\nrow2cell1,row2cell2,row2cell3');
    });

    it('should serialize to csv overriding columns using options.columns', () => {
      expect(
        toCsv(
          td('table', [
            td('row', [
              td('column', 'col1'),
              td('column', 'col2'),
              td('column', 'col3'),
            ]),
            td('row', ['row2cell1', 'row2cell2', 'row2cell3']),
          ]),
          { columns: ['colA', 'colB', 'colC'] },
        ),
      ).toEqual('colA,colB,colC\nrow2cell1,row2cell2,row2cell3');
    });
  });

  describe('RFC-4180-4', () => {
    it('should serialize single row with cell to csv', () => {
      expect(toCsv(td('table', [td('row', ['cell1'])]))).toEqual('cell1');
    });

    it('should serialize single row with multiple cells to csv, separated by comma, respecting spaces', () => {
      expect(
        toCsv(td('table', [td('row', ['cell1', '  cell2  ', ' cell3'])])),
      ).toEqual('cell1,  cell2  , cell3');
    });

    it('should throw an error if row and column cardinality does not match', () => {
      expect(() =>
        toCsv(
          td('table', [
            td('row', ['row1col1', 'row1col2', 'row1col3']),
            td('row', ['row2col1', 'row2col2', 'row2col3']),
            td('row', ['row2col1', 'row2col2']),
          ]),
        ),
      ).toThrow('Row cardinality must match length of columns.');
      expect(() =>
        toCsv(
          td('table', [
            td('row', [td('column', 'col1'), td('column', 'col2')]),
            td('row', ['row1col1', 'row1col2', 'row1col3']),
            td('row', ['row2col1', 'row2col2', 'row2col3']),
          ]),
        ),
      ).toThrow('Row cardinality must match length of columns.');
      expect(() =>
        toCsv(
          td('table', [
            td('row', ['row1col1', 'row1col2', 'row1col3']),
            td('row', ['row2col1', 'row2col2', 'row2col3']),
          ]),
          { columns: ['Col A', 'Col B', 'Col C', 'Col D'] },
        ),
      ).toThrow('Row cardinality must match length of columns.');
    });
  });

  describe('RFC-4180-5', () => {
    it('encloses fields with double quotes based on options.doubleQuotes', () => {
      expect(
        toCsv(td('table', [td('row', ['cell1', '  cell2  ', ' cell3'])]), {
          doubleQuotes: true,
        }),
      ).toEqual('"cell1","  cell2  "," cell3"');
    });
  });

  describe('RFC-4180-6', () => {
    it('ensure that fields with line breaks, doubleQuotes, or commas are always enclosed with double quotes', () => {
      expect(
        toCsv(td('table', [td('row', ['cell1', '\ncell"",2', ',cell\n\n3'])])),
      ).toEqual('cell1,"\ncell"""",2",",cell\n\n3"');
    });
  });

  describe('RFC-4180-7', () => {
    it('should properly escapes double quotes in string content', () => {
      expect(
        toCsv(td('table', [td('row', ['col"1', 'c"ol""2', 'col3'])])),
      ).toEqual('"col""1","c""ol""""2",col3');
    });
  });

  describe('stringify non-string cell values via JSON.stringify', () => {
    it('should stringify number, boolean, null primitives to string', () => {
      expect(
        toCsv(td('table', [td('row', ['one', 2, true, false, null])])),
      ).toEqual('one,2,true,false,null');
    });
    it('should stringify undefined value to empty string', () => {
      expect(
        toCsv(td('table', [td('row', [undefined, undefined, undefined])])),
      ).toEqual(',,');
    });
    it('should stringify array values properly escaped with double quotes', () => {
      expect(
        toCsv(
          td('table', [
            td('row', [
              td('cell', { value: ['one', 2, true, false, null, undefined] }),
            ]),
          ]),
        ),
      ).toEqual('"[""one"",2,true,false,null,null]"');
    });
    it('should stringify object values properly escaped with double quotes', () => {
      expect(
        toCsv(
          td('table', [
            td('row', [
              td('cell', {
                value: {
                  one: 2,
                  3: 'four',
                  five: [6, 'seven'],
                  eight: null,
                  nine: undefined,
                },
              }),
            ]),
          ]),
        ),
      ).toEqual(
        '"{""3"":""four"",""one"":2,""five"":[6,""seven""],""eight"":null}"',
      );
    });
  });

  describe('kitchen sink', () => {
    it('should handle all edge cases and options', () => {
      expect(
        toCsv(
          td('table', [
            td('row', [
              td('column', 'col1'),
              td('column', 'col2'),
              td('column', 'col3'),
            ]),
            td('row', [
              42,
              'row2cell2',
              td('cell', {
                value: {
                  one: 2,
                  3: 'four',
                  five: [6, 'seven'],
                  eight: null,
                  nine: undefined,
                },
              }),
              td('cell', { value: ['one', 2, true, false, null, undefined] }),
            ]),
          ]),
          {
            columns: [
              'Column A',
              'Column "B"',
              'Column\nC',
              ['array', true, 'column'],
            ],
            doubleQuotes: true,
          },
        ),
      ).toEqual(
        '"Column A","Column ""B""","Column\nC","[""array"",true,""column""]"\n"42","row2cell2","{""3"":""four"",""one"":2,""five"":[6,""seven""],""eight"":null}","[""one"",2,true,false,null,null]"',
      );
    });
  });
});
