import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const MINIMUM_COMPLETION_THRESHOLD = 0.3;

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL.trim().replace(/^['"]|['"]$/g, '');
  }

  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const line = envContent
    .split('\n')
    .find((entry) => entry.trim().startsWith('DATABASE_URL='));

  if (!line) {
    throw new Error('DATABASE_URL not found in .env');
  }

  const value = line.split('=').slice(1).join('=').trim();
  return value.replace(/^['"]|['"]$/g, '');
}

function getCompletionRatio(startedAt, durationMinutes, now = new Date()) {
  const totalDurationMs = durationMinutes * 60 * 1000;
  if (totalDurationMs <= 0) return 0;
  return (now.getTime() - new Date(startedAt).getTime()) / totalDurationMs;
}

function getFinalStatus(startedAt, durationMinutes, now = new Date()) {
  return getCompletionRatio(startedAt, durationMinutes, now) < MINIMUM_COMPLETION_THRESHOLD
    ? 'abandoned'
    : 'completed';
}

async function main() {
  const client = new pg.Client({ connectionString: loadDatabaseUrl() });
  await client.connect();

  const now = new Date();
  const { rows } = await client.query(
    `
      SELECT id, started_at, duration
      FROM interviews
      WHERE status = 'in_progress'
    `,
  );

  let updated = 0;
  let completed = 0;
  let abandoned = 0;

  for (const row of rows) {
    const completionRatio = getCompletionRatio(row.started_at, row.duration, now);
    if (completionRatio < 1) continue;

    const status = getFinalStatus(row.started_at, row.duration, now);
    await client.query(
      `
        UPDATE interviews
        SET status = $1,
            ended_at = $2,
            total_score = $3
        WHERE id = $4
      `,
      [status, now, status === 'completed' ? 0 : null, row.id],
    );

    updated += 1;
    if (status === 'completed') {
      completed += 1;
    } else {
      abandoned += 1;
    }
  }

  await client.end();

  console.log(
    JSON.stringify(
      {
        scanned: rows.length,
        updated,
        completed,
        abandoned,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
