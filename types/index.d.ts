import { Table } from 'tdast-types';

export interface Options {
  // array of column strings that will be used as object keys.  Overrides the column values detected in the tdast tree.
  columns?: string[];
  // if CSV field values should be doublequoted
  doubleQuotes?: boolean;
}

/**
 * Serialize a tdast tree into CSV (RFC-4180 compliant)
 */
export default function toCsv(
  // tdast Table node
  tdast: Table,
  // options to configure serializer
  options?: Options,
): string;
