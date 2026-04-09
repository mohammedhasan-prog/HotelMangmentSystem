const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqlitePath = databaseUrl.startsWith('file:')
	? databaseUrl.replace('file:', '')
	: databaseUrl;

const resolvedPath = path.isAbsolute(sqlitePath)
	? sqlitePath
	: path.resolve(__dirname, '../../', sqlitePath);

const adapter = new PrismaBetterSqlite3({
	url: resolvedPath,
});

const prisma = new PrismaClient({
	adapter,
});

module.exports = prisma;