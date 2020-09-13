const COMMA = ',';
const DQUOTE = '"';
const CR = '\r';
const LF = '\n';

function testShouldEnclose(fieldValue) {
  return [COMMA, DQUOTE, CR, LF].some((char) => fieldValue.includes(char));
}

function enclose(fieldValue) {
  let enclosed = DQUOTE;
  for (const char of fieldValue) {
    if (char === DQUOTE) {
      enclosed += DQUOTE;
    }
    enclosed += char;
  }
  enclosed += DQUOTE;
  return enclosed;
}

// serialize value in RFC-4180 manner
function serialize(values, options) {
  let csv = '';
  let fieldValue;
  values.forEach((value, i) => {
    if (typeof value === 'string') {
      fieldValue = value;
    } else {
      fieldValue = JSON.stringify(value) || '';
    }
    if (options.doubleQuotes || testShouldEnclose(fieldValue)) {
      fieldValue = enclose(fieldValue);
    }

    csv += fieldValue;
    if (i < values.length - 1) {
      csv += ',';
    }
  });
  return csv;
}

export default function toCsv(tdast, options = {}) {
  const rows = tdast.children;
  if (tdast.type !== 'table' || rows.length === 0) {
    return '';
  }

  const { columns } = options;

  let csv = '';
  let rowCardinality;
  rows.forEach((row, i) => {
    let cellValues = row.children.map((cell) => cell.value);
    if (i === 0 && Array.isArray(columns)) {
      cellValues = columns;
    }

    // check for invalid cardinality
    if (!rowCardinality) {
      rowCardinality = cellValues.length;
    } else if (rowCardinality !== cellValues.length) {
      throw new Error('Row cardinality must match length of columns.');
    }

    // build row csv
    csv += serialize(cellValues, options);
    if (i < rows.length - 1) {
      csv += '\n';
    }
  });

  return csv;
}
