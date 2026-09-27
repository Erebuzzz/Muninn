const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6RgoG7wkCpHe@ep-square-star-artu8u5i-pooler.c-4.us-west-2.aws.neon.tech/neondb?sslmode=require';
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

const sql = neon(DATABASE_URL);

async function seed() {
  console.log('Seeding Curated Sample Vault for user:', DEFAULT_USER_ID);

  // 1. Ensure default user exists
  await sql`
    INSERT INTO users (id, email, password_hash, salt, name, created_at)
    VALUES (
      ${DEFAULT_USER_ID},
      'guest@muninn.local',
      'demo_hash',
      'demo_salt',
      'Guest Engineer',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET name = 'Guest Engineer';
  `;

  // 2. Clear existing conversations for default user (cascades to claims, speakers, task_state, relationships)
  console.log('Purging test artifacts for default user...');
  await sql`DELETE FROM conversations WHERE user_id = ${DEFAULT_USER_ID}`;
  await sql`DELETE FROM entities WHERE user_id = ${DEFAULT_USER_ID}`;
  await sql`DELETE FROM resurfacing_events WHERE user_id = ${DEFAULT_USER_ID}`;

  // 3. Define curated entities
  console.log('Creating curated knowledge graph entities...');
  const entityDefs = [
    { name: 'PCB Rev 2.1', type: 'component' },
    { name: 'Heatsink Bracket', type: 'component' },
    { name: 'Enclosure Fabrication', type: 'project' },
    { name: 'Alex', type: 'person' },
    { name: 'Thermal Paste', type: 'component' },
    { name: 'Cloudflare Workers', type: 'component' },
    { name: 'Neon PostgreSQL', type: 'component' },
    { name: 'Hono', type: 'component' },
    { name: 'Liam', type: 'person' },
    { name: 'AudioWorklet', type: 'component' },
    { name: 'AssemblyAI', type: 'vendor' },
    { name: 'David', type: 'person' },
    { name: 'Android Tablet APK', type: 'project' },
  ];

  const entityMap = new Map();
  for (const ent of entityDefs) {
    const entId = crypto.randomUUID();
    await sql`
      INSERT INTO entities (id, user_id, type, name, first_seen_at)
      VALUES (${entId}, ${DEFAULT_USER_ID}, ${ent.type}, ${ent.name}, NOW())
    `;
    entityMap.set(ent.name, entId);
  }

  // 4. Session 1: Hardware Revision & Thermal Architecture
  console.log('Creating Session 1: Hardware Revision & Thermal Architecture...');
  const sess1Id = crypto.randomUUID();
  const sess1Started = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  await sql`
    INSERT INTO conversations (id, user_id, title, started_at, ended_at, status, raw_transcript)
    VALUES (
      ${sess1Id},
      ${DEFAULT_USER_ID},
      'Hardware Revision & Thermal Architecture',
      ${sess1Started},
      ${sess1Started},
      'completed',
      ${JSON.stringify({
        text: "Maya: We received the updated revision 2.1 of the PCB today from the fabricator.\nAlex: The mounting holes on the heatsink bracket do not align with the board.\nMaya: We decided to pause enclosure fabrication until the heatsink redesign is verified.\nMaya: Task for Alex: redesign the heatsink mounting bracket by Thursday.\nAlex: Question: should we order the high-conductivity thermal paste now or wait for the new bracket?\nLiam: Off the record, Alex mentioned the supplier overcharged us by $1,200 on the prototype batch."
      })}
    )
  `;

  // Claims for Session 1
  const c1_1 = crypto.randomUUID();
  const c1_2 = crypto.randomUUID();
  const c1_3 = crypto.randomUUID();
  const c1_4 = crypto.randomUUID();
  const c1_5 = crypto.randomUUID();
  const c1_6 = crypto.randomUUID();

  await sql`
    INSERT INTO claims (id, conversation_id, type, text, confidence, sensitivity, timestamp)
    VALUES
      (${c1_1}, ${sess1Id}, 'observation', 'We received the updated revision 2.1 of the PCB today from the fabricator.', 'verified', 'none', ${sess1Started}),
      (${c1_2}, ${sess1Id}, 'observation', 'The mounting holes on the heatsink bracket do not align with the board.', 'verified', 'none', ${sess1Started}),
      (${c1_3}, ${sess1Id}, 'decision', 'We decided to pause enclosure fabrication until the heatsink redesign is verified.', 'verified', 'none', ${sess1Started}),
      (${c1_4}, ${sess1Id}, 'task', 'Task for Alex: redesign the heatsink mounting bracket by Thursday.', 'verified', 'none', ${sess1Started}),
      (${c1_5}, ${sess1Id}, 'question', 'Question: should we order the high-conductivity thermal paste now or wait for the new bracket?', 'verified', 'none', ${sess1Started}),
      (${c1_6}, ${sess1Id}, 'observation', 'Off the record: prototype batch supplier overcharge of $1,200.', 'unverified', 'flagged', ${sess1Started})
  `;

  // Task state for Alex's task
  await sql`
    INSERT INTO task_state (claim_id, status, blocked_by, resurfaced_at)
    VALUES (${c1_4}, 'open', NULL, ARRAY[NOW()::timestamp])
  `;

  // Entity links for Session 1
  await linkEntities(c1_1, ['PCB Rev 2.1']);
  await linkEntities(c1_2, ['Heatsink Bracket']);
  await linkEntities(c1_3, ['Enclosure Fabrication']);
  await linkEntities(c1_4, ['Alex', 'Heatsink Bracket']);
  await linkEntities(c1_5, ['Thermal Paste']);

  // Relationship: Task blocks Decision
  await sql`
    INSERT INTO relationships (id, from_claim_id, to_claim_id, relation_type)
    VALUES (${crypto.randomUUID()}, ${c1_4}, ${c1_3}, 'blocks')
  `;

  // 5. Session 2: Cloudflare Edge & Serverless Migration
  console.log('Creating Session 2: Cloudflare Edge & Serverless Migration...');
  const sess2Id = crypto.randomUUID();
  const sess2Started = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
  await sql`
    INSERT INTO conversations (id, user_id, title, started_at, ended_at, status, raw_transcript)
    VALUES (
      ${sess2Id},
      ${DEFAULT_USER_ID},
      'Cloudflare Edge & Serverless Migration',
      ${sess2Started},
      ${sess2Started},
      'completed',
      ${JSON.stringify({
        text: "Kshitiz: We completed the migration of the backend service to TypeScript with Hono on Cloudflare Workers.\nLiam: We decided to standardize on Neon Serverless PostgreSQL with pgvector for zero cold-start execution.\nKshitiz: Task for Liam: benchmark cold-start latency across Mumbai, Frankfurt, and San Jose edge points.\nLiam: Question: should we enable Durable Objects for WebSocket session state or keep connections stateless?"
      })}
    )
  `;

  const c2_1 = crypto.randomUUID();
  const c2_2 = crypto.randomUUID();
  const c2_3 = crypto.randomUUID();
  const c2_4 = crypto.randomUUID();

  await sql`
    INSERT INTO claims (id, conversation_id, type, text, confidence, sensitivity, timestamp)
    VALUES
      (${c2_1}, ${sess2Id}, 'observation', 'Completed the migration of the backend service to TypeScript with Hono on Cloudflare Workers.', 'verified', 'none', ${sess2Started}),
      (${c2_2}, ${sess2Id}, 'decision', 'Standardize on Neon Serverless PostgreSQL with pgvector for zero cold-start execution.', 'verified', 'none', ${sess2Started}),
      (${c2_3}, ${sess2Id}, 'task', 'Task for Liam: benchmark cold-start latency across Mumbai, Frankfurt, and San Jose edge points.', 'verified', 'none', ${sess2Started}),
      (${c2_4}, ${sess2Id}, 'question', 'Question: should we enable Durable Objects for WebSocket session state or keep connections stateless?', 'verified', 'none', ${sess2Started})
  `;

  await sql`
    INSERT INTO task_state (claim_id, status, blocked_by, resurfaced_at)
    VALUES (${c2_3}, 'open', NULL, ARRAY[NOW()::timestamp])
  `;

  await linkEntities(c2_1, ['Cloudflare Workers', 'Hono']);
  await linkEntities(c2_2, ['Neon PostgreSQL']);
  await linkEntities(c2_3, ['Liam']);

  // Relationship: Standardize on Neon resolves migration observation
  await sql`
    INSERT INTO relationships (id, from_claim_id, to_claim_id, relation_type)
    VALUES (${crypto.randomUUID()}, ${c2_2}, ${c2_1}, 'resolves')
  `;

  // 6. Session 3: Acoustic Pipeline & AudioWorklet Optimization
  console.log('Creating Session 3: Acoustic Pipeline & AudioWorklet Optimization...');
  const sess3Id = crypto.randomUUID();
  const sess3Started = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  await sql`
    INSERT INTO conversations (id, user_id, title, started_at, ended_at, status, raw_transcript)
    VALUES (
      ${sess3Id},
      ${DEFAULT_USER_ID},
      'Acoustic Pipeline & AudioWorklet Optimization',
      ${sess3Started},
      ${sess3Started},
      'completed',
      ${JSON.stringify({
        text: "Sarah: Audio downsampling to 24kHz PCM16 in the AudioWorklet thread reduced frame drops to zero percent.\nDavid: We decided to use AssemblyAI streaming for live sessions and synchronous STT for 1-tap voice notes.\nSarah: Task for David: implement tactile Web Audio confirmation cues for voice memo completion.\nDavid: Observation: memory usage on the Android tablet APK remained constant at 42MB during continuous recording."
      })}
    )
  `;

  const c3_1 = crypto.randomUUID();
  const c3_2 = crypto.randomUUID();
  const c3_3 = crypto.randomUUID();
  const c3_4 = crypto.randomUUID();

  await sql`
    INSERT INTO claims (id, conversation_id, type, text, confidence, sensitivity, timestamp)
    VALUES
      (${c3_1}, ${sess3Id}, 'observation', 'Audio downsampling to 24kHz PCM16 in the AudioWorklet thread reduced frame drops to zero percent.', 'verified', 'none', ${sess3Started}),
      (${c3_2}, ${sess3Id}, 'decision', 'Use AssemblyAI streaming for live sessions and synchronous STT for 1-tap voice notes.', 'verified', 'none', ${sess3Started}),
      (${c3_3}, ${sess3Id}, 'task', 'Task for David: implement tactile Web Audio confirmation cues for voice memo completion.', 'verified', 'none', ${sess3Started}),
      (${c3_4}, ${sess3Id}, 'observation', 'Memory usage on the Android tablet APK remained constant at 42MB during continuous recording.', 'verified', 'none', ${sess3Started})
  `;

  await sql`
    INSERT INTO task_state (claim_id, status, blocked_by, resurfaced_at)
    VALUES (${c3_3}, 'open', NULL, ARRAY[NOW()::timestamp])
  `;

  await linkEntities(c3_1, ['AudioWorklet']);
  await linkEntities(c3_2, ['AssemblyAI']);
  await linkEntities(c3_3, ['David']);
  await linkEntities(c3_4, ['Android Tablet APK']);

  // Relationship: Audio downsampling depends on AssemblyAI decision
  await sql`
    INSERT INTO relationships (id, from_claim_id, to_claim_id, relation_type)
    VALUES (${crypto.randomUUID()}, ${c3_1}, ${c3_2}, 'depends_on')
  `;

  async function linkEntities(claimId, entityNames) {
    for (const name of entityNames) {
      const entId = entityMap.get(name);
      if (entId) {
        await sql`
          INSERT INTO claim_entities (claim_id, entity_id)
          VALUES (${claimId}, ${entId})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  }

  console.log('Curated Sample Vault successfully seeded with 3 distinct engineering scenarios!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
