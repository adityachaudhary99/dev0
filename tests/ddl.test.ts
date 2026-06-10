import { describe, it, expect } from 'vitest';
import { parseDDL } from '../src/lib/ddl';

const SQL = `
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  team_id INT REFERENCES teams(id)
);
CREATE TABLE teams (
  id INT PRIMARY KEY,
  name TEXT
);
CREATE TABLE posts (
  id SERIAL,
  author_id BIGINT,
  PRIMARY KEY (id),
  FOREIGN KEY (author_id) REFERENCES users (id)
);`;

describe('parseDDL', () => {
  const schema = parseDDL(SQL);
  it('finds all tables', () => {
    expect(schema.tables.map((t) => t.name).sort()).toEqual(['posts', 'teams', 'users']);
  });
  it('parses columns with types', () => {
    const users = schema.tables.find((t) => t.name === 'users')!;
    expect(users.columns).toEqual([
      { name: 'id', type: 'BIGINT', pk: true, nullable: true },
      { name: 'email', type: 'VARCHAR(255)', pk: false, nullable: false },
      { name: 'team_id', type: 'INT', pk: false, nullable: true },
    ]);
  });
  it('detects inline REFERENCES as FK', () => {
    expect(schema.fks).toContainEqual(
      { fromTable: 'users', fromColumn: 'team_id', toTable: 'teams', toColumn: 'id' });
  });
  it('detects table-level FOREIGN KEY and PRIMARY KEY', () => {
    expect(schema.fks).toContainEqual(
      { fromTable: 'posts', fromColumn: 'author_id', toTable: 'users', toColumn: 'id' });
    expect(schema.tables.find((t) => t.name === 'posts')!.columns
      .find((c) => c.name === 'id')!.pk).toBe(true);
  });
  it('handles quoted identifiers and backticks', () => {
    const s = parseDDL('CREATE TABLE "Order Items" (`id` INT PRIMARY KEY);');
    expect(s.tables[0]!.name).toBe('Order Items');
    expect(s.tables[0]!.columns[0]!.name).toBe('id');
  });
  it('ignores non-CREATE statements', () => {
    expect(parseDDL('INSERT INTO x VALUES (1); SELECT 1;').tables).toEqual([]);
  });
});
