# tdast-util-to-csv

[**tdast**][tdast] utility to serialize tdast into CSV ([RFC-4180][] compliant).

---

## Install

```sh
npm install tdast-util-to-csv
```

## Use

```js
import toCsv from 'tdast-util-to-csv';

const tdast = {
  type: 'table',
  children: [
    {
      type: 'row',
      index: 0,
      children: [
        {
          type: 'column',
          index: 0,
          value: 'col1',
        },
        {
          type: 'column',
          index: 1,
          value: 'col2',
        },
        {
          type: 'column',
          index: 2,
          value: 'col3',
        },
      ],
    },
    {
      type: 'row',
      index: 1,
      children: [
        {
          type: 'cell',
          columnIndex: 0,
          rowIndex: 1,
          value: 'row2cell1',
        },
        {
          type: 'cell',
          columnIndex: 1,
          rowIndex: 1,
          value: 'row2cell2',
        },
        {
          type: 'cell',
          columnIndex: 2,
          rowIndex: 1,
          value: 'row2cell3',
        },
      ],
    },
  ],
};

expect(toCsv(tdast))
  .toEqual('col1,col2,col3\nrow2cell1,row2cell2,row2cell3');
```

## API

### `toCsv(tdast[, options])`
#### Interface
```ts
function toCsv(
  // tdast Table node
  tdast: Table,
  // options to configure serializer
  options?: Options,
): string;
```

Serializes a tdast `Table` node to [RFC-4180][] compliant CSV.

All CSV field values are properly escaped with double quotes whenever applicable.  If the tdast `Cell` and `Column` node contains non-string values, these are stringified with `JSON.stringify` and propery escaped.

`toCsv` automatically infers `Column` node values to add in the CSV.  You may override this behavior by specifying columns explicitly with `options.columns`.  You can also always ensure field values are enclosed with double quotes by configuring `options.doubleQuotes`.  These are detailed in the example below.

#### Example
Using the same tdast tree in the earlier example
```js
import toCsv from 'tdast-util-to-csv';

const options = {
  columns: ['colA', 'colB', 'colC'],
  doubleQuotes: true,
};

expect(toCsv(tdast, options))
  .toEqual('"colA","colB","colC"\n"row2cell1","row2cell2","row2cell3"');
```

An example demonstrating how non-string values are stringified with `JSON.stringify` and properly escaped:

```js
import td from 'tdastscript';
import toCsv from 'tdast-util-to-csv';

// string, number, boolean, null values are easily stringified
expect(
  toCsv(td('table', [td('row', ['one', 2, true, false, null])])),
).toEqual('one,2,true,false,null');

// undefined value is converted to an empty string
expect(
  toCsv(td('table', [td('row', [undefined, undefined, undefined])])),
).toEqual(',,');

// array values are stringified and properly escaped with double quotes
expect(
  toCsv(
    td('table', [
      td('row', [
        td('cell', { value: ['one', 2, true, false, null, undefined] }),
      ]),
    ]),
  ),
).toEqual('"[""one"",2,true,false,null,null]"');

// object values are stringified and properly escaped with double quotes
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
```

#### Related interfaces
```ts
interface Options {
  // array of column strings that will be used as object keys.  Overrides the column values detected in the tdast tree.
  columns?: string[];
  // if CSV field values should be doublequoted
  doubleQuotes?: boolean;
}
```

## Related
- [`tdast-util-from-csv`][tdast-util-from-csv]
- [`tdastscript`][tdastscript]

<!-- Definitions -->
[rfc-4180]: https://tools.ietf.org/html/rfc4180
[tdast]: https://github.com/tdast/tdast
[tdast-util-from-csv]: https://github.com/tdast/tdast-util-from-csv
[tdastscript]: https://github.com/tdast/tdastscript
