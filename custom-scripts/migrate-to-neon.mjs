import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
const raw = readFileSync(envPath, 'utf8');

function parseEnv(text) {
  const env = {};
  let key = null, val = '';
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) { if (key) env[key] = val; key = m[1]; val = m[2]; }
    else if (key) val += t;
  }
  if (key) env[key] = val;
  return env;
}

const env = parseEnv(raw);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
const neonUrl = env.NEON_DATABASE_URL.split('?')[0];
const sql = neon(neonUrl, { sslMode: 'require' });

const TOPIC_MAP = [
  { id: 11, slug: 'programming', keywords: ['programming', 'algorithms', 'data structures', 'paradigm', 'oop', 'functional'] },
  { id: 12, slug: 'python', keywords: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'jupyter', 'anaconda', 'pip'] },
  { id: 13, slug: 'javascript-typescript', keywords: ['javascript', 'typescript', 'js', 'ts', 'ecmascript', 'node', 'nodejs', 'react', 'angular', 'vue', 'jquery', 'nextjs', 'nuxt', 'svelte', 'express', 'npm', 'yarn', 'bun'] },
  { id: 14, slug: 'rust', keywords: ['rust', 'cargo', 'rustc'] },
  { id: 15, slug: 'go', keywords: ['go', 'golang'] },
  { id: 16, slug: 'systems-programming', keywords: ['systems programming', 'c\\+\\+', 'c programming', 'assembly', 'embedded', 'osdev', 'compiler', 'llvm'] },
  { id: 21, slug: 'ai-ml', keywords: ['ai', 'artificial intelligence', 'ml', 'machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'keras', 'scikit', 'model training'] },
  { id: 22, slug: 'machine-learning', keywords: ['machine learning', 'supervised', 'unsupervised', 'classification', 'regression', 'clustering'] },
  { id: 23, slug: 'llms-prompting', keywords: ['llm', 'llms', 'prompt', 'prompting', 'gpt', 'chatgpt', 'openai', 'claude', 'anthropic', 'gemini', 'mistral', 'llama', 'langchain', 'rag', 'fine tuning', 'token'] },
  { id: 24, slug: 'data-science', keywords: ['data science', 'analytics', 'statistics', 'visualization', 'tableau', 'power bi', 'jupyter'] },
  { id: 25, slug: 'databases', keywords: ['database', 'databases', 'postgres', 'postgresql', 'mysql', 'mongodb', 'nosql', 'redis', 'sqlite', 'dynamodb', 'cassandra', 'neo4j', 'supabase', 'prisma', 'orm'] },
  { id: 26, slug: 'sql', keywords: ['sql', 'query', 'rdbms', 'relational'] },
  { id: 31, slug: 'web-development', keywords: ['web development', 'web dev', 'fullstack', 'full stack', 'mvc', 'rest api', 'graphql', 'http', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'responsive'] },
  { id: 32, slug: 'frontend', keywords: ['frontend', 'front-end', 'ui', 'react', 'angular', 'vue', 'svelte', 'nextjs', 'nuxt', 'gatsby'] },
  { id: 33, slug: 'backend', keywords: ['backend', 'back-end', 'server', 'api', 'microservices', 'nodejs', 'express', 'fastify', 'spring', 'laravel', 'rails', 'asp'] },
  { id: 34, slug: 'apis', keywords: ['api', 'apis', 'rest', 'graphql', 'grpc', 'webhook', 'soap'] },
  { id: 35, slug: 'devops', keywords: ['devops', 'ci/cd', 'pipeline', 'jenkins', 'github actions', 'gitlab ci', 'ansible', 'terraform', 'iac'] },
  { id: 36, slug: 'cloud-infra', keywords: ['cloud', 'infra', 'infrastructure', 'aws', 'azure', 'gcp', 'google cloud', 'lambda', 'serverless', 'ec2', 's3', 'heroku', 'vercel', 'netlify', 'cloudflare'] },
  { id: 37, slug: 'kubernetes', keywords: ['kubernetes', 'k8s', 'docker', 'container', 'orchestration', 'pod', 'helm'] },
  { id: 38, slug: 'linux', keywords: ['linux', 'unix', 'bash', 'shell', 'terminal', 'command line', 'ubuntu', 'debian', 'centos', 'arch', 'kernel'] },
  { id: 39, slug: 'networking', keywords: ['networking', 'network', 'tcp', 'ip', 'dns', 'http', 'protocol', 'load balancer', 'proxy', 'vpn'] },
  { id: 41, slug: 'cybersecurity', keywords: ['cybersecurity', 'cyber security', 'security', 'hacking', 'hacker', 'penetration', 'pentest', 'vulnerability', 'exploit', 'malware', 'ransomware', 'firewall', 'encryption', 'authentication', 'oauth', 'jwt', 'xss', 'sql injection'] },
  { id: 42, slug: 'blockchain-web3', keywords: ['blockchain', 'web3', 'web 3', 'smart contract', 'solidity', 'ethereum', 'bitcoin', 'defi', 'nft', 'dapp', 'distributed'] },
  { id: 43, slug: 'crypto', keywords: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'token', 'wallet', 'mining'] },
  { id: 51, slug: 'software-architecture', keywords: ['architecture', 'design pattern', 'microservices', 'monolith', 'ddd', 'domain driven', 'clean architecture', 'solid', 'event driven'] },
  { id: 52, slug: 'open-source', keywords: ['open source', 'open-source', 'oss', 'contribution', 'github', 'gitlab', 'license', 'mit', 'gpl', 'apache'] },
  { id: 53, slug: 'developer-tools', keywords: ['developer tools', 'dev tools', 'ide', 'editor', 'vscode', 'vim', 'neovim', 'git', 'debugger', 'profiler', 'linter', 'formatter', 'prettier', 'eslint'] },
  { id: 54, slug: 'testing-qa', keywords: ['testing', 'qa', 'quality assurance', 'unit test', 'integration test', 'e2e', 'jest', 'mocha', 'cypress', 'playwright', 'selenium', 'tdd'] },
  { id: 55, slug: 'mobile-dev', keywords: ['mobile', 'android', 'ios', 'swift', 'kotlin', 'flutter', 'react native', 'expo', 'xamarin', 'app development'] },
  { id: 56, slug: 'game-dev', keywords: ['game', 'gamedev', 'game development', 'unity', 'unreal', 'godot', '3d', 'graphics', 'opengl', 'webgl', 'animation'] },
  { id: 57, slug: 'hardware', keywords: ['hardware', 'arduino', 'raspberry pi', 'fpga', 'schematic', 'pcb', 'electronics'] },
  { id: 58, slug: 'iot', keywords: ['iot', 'internet of things', 'sensor', 'smart home', 'embedded'] },
  { id: 61, slug: 'mathematics', keywords: ['mathematics', 'math', 'algebra', 'calculus', 'geometry', 'linear algebra', 'statistics', 'probability', 'discrete'] },
  { id: 62, slug: 'physics', keywords: ['physics', 'quantum', 'mechanics', 'thermodynamics', 'electromagnetism', 'relativity'] },
  { id: 63, slug: 'biology', keywords: ['biology', 'bio', 'genetics', 'dna', 'evolution', 'cell', 'neuroscience', 'ecology'] },
  { id: 64, slug: 'chemistry', keywords: ['chemistry', 'cheminformatics', 'molecule', 'reaction', 'organic', 'inorganic'] },
  { id: 65, slug: 'astronomy', keywords: ['astronomy', 'space', 'star', 'planet', 'galaxy', 'cosmos', 'telescope', 'nasa'] },
  { id: 66, slug: 'research', keywords: ['research', 'paper', 'publication', 'arxiv', 'academic', 'journal', 'study', 'peer review'] },
  { id: 71, slug: 'startups', keywords: ['startup', 'startups', 'entrepreneur', 'venture', 'fundraising', 'pitch', 'incubator', 'accelerator', 'mvp', 'scale'] },
  { id: 72, slug: 'business', keywords: ['business', 'strategy', 'management', 'leadership', 'operation', 'b2b', 'b2c', 'saas', 'ecommerce'] },
  { id: 73, slug: 'finance', keywords: ['finance', 'financial', 'investing', 'stock', 'trading', 'economy', 'economic', 'budget', 'wealth', 'tax'] },
  { id: 74, slug: 'marketing', keywords: ['marketing', 'seo', 'social media', 'content marketing', 'branding', 'advertising', 'growth', 'analytics', 'conversion'] },
  { id: 75, slug: 'productivity', keywords: ['productivity', 'time management', 'organization', 'workflow', 'automation', 'efficiency', 'note taking', 'todo'] },
  { id: 76, slug: 'career', keywords: ['career', 'job', 'resume', 'interview', 'salary', 'negotiation', 'remote work', 'freelance', 'hiring', 'mentorship'] },
  { id: 81, slug: 'design', keywords: ['design', 'graphic design', 'illustration', 'canva', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'typography', 'color'] },
  { id: 82, slug: 'ui-ux', keywords: ['ui', 'ux', 'user interface', 'user experience', 'usability', 'prototype', 'wireframe', 'figma', 'user research', 'accessibility', 'a11y'] },
  { id: 83, slug: 'art-photography', keywords: ['art', 'photography', 'photo', 'drawing', 'painting', 'digital art', '3d art', 'blender', 'gallery', 'exhibition'] },
  { id: 84, slug: 'music', keywords: ['music', 'audio', 'sound', 'podcast', 'spotify', 'production', 'instrument', 'song'] },
  { id: 85, slug: 'writing-books', keywords: ['writing', 'book', 'books', 'author', 'publishing', 'blog', 'blogging', 'content writing', 'copywriting', 'reading'] },
  { id: 86, slug: 'video-film', keywords: ['video', 'film', 'youtube', 'editing', 'production', 'director', 'cinema', 'movie', 'documentary', 'tiktok', 'reel'] },
  { id: 91, slug: 'health-fitness', keywords: ['health', 'fitness', 'exercise', 'workout', 'nutrition', 'diet', 'mental health', 'meditation', 'yoga', 'sleep', 'wellness'] },
  { id: 92, slug: 'education', keywords: ['education', 'learning', 'course', 'tutorial', 'online learning', 'mooc', 'udemy', 'coursera', 'freecodecamp', 'certification', 'degree', 'learn', 'teach', 'teacher', 'student', 'school', 'university', 'resource'] },
  { id: 93, slug: 'gaming', keywords: ['gaming', 'game', 'video game', 'esports', 'console', 'pc gaming', 'steam', 'rpg', 'fps', 'minecraft', 'roblox', 'fortnite'] },
  { id: 94, slug: 'entertainment', keywords: ['entertainment', 'fun', 'comedy', 'memes', 'tv', 'show', 'series', 'netflix', 'celebrity', 'pop culture'] },
  { id: 95, slug: 'sports', keywords: ['sports', 'football', 'soccer', 'basketball', 'cricket', 'tennis', 'olympics', 'fitness', 'athlete', 'coach'] },
  { id: 96, slug: 'travel', keywords: ['travel', 'tourism', 'vacation', 'destination', 'hotel', 'backpacking', 'adventure', 'explore', 'wanderlust'] },
  { id: 97, slug: 'news-politics', keywords: ['news', 'politics', 'government', 'policy', 'law', 'legal', 'democracy', 'election', 'rights', 'activism'] },
  { id: 98, slug: 'food-cooking', keywords: ['food', 'cooking', 'recipe', 'cuisine', 'restaurant', 'baking', 'vegan', 'vegetarian', 'kitchen'] },
  { id: 99, slug: 'nature-environment', keywords: ['nature', 'environment', 'climate', 'sustainability', 'eco', 'green', 'renewable', 'conservation', 'animal', 'plant', 'garden'] },
  { id: 100, slug: 'community', keywords: ['community', 'social', 'forum', 'discord', 'reddit', 'meetup', 'group', 'volunteer', 'nonprofit', 'charity'] },
];

function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9\s+]/g, '').trim(); }

function findTopicId(topic, tags) {
  const words = normalize(topic).split(/\s+/).filter(Boolean);
  const tagWords = (tags || []).map(t => normalize(t)).join(' ');
  const searchText = words.join(' ') + ' ' + tagWords;
  let best = { id: null, score: 0 };
  for (const t of TOPIC_MAP) {
    let score = 0;
    for (const kw of t.keywords) {
      const re = new RegExp('\\b' + kw.replace(/[+]/g, '\\+') + '\\b', 'i');
      if (re.test(searchText)) score += 10;
      if (re.test(normalize(topic))) score += 5;
    }
    if (score > best.score) best = { id: t.id, score };
  }
  return best.id || 92;
}

// ──────────────────────────────────────────────
async function main() {
  console.log('Fetching Supabase data...');
  const { data: sbData, error } = await supabase
    .from('saved_links')
    .select('*')
    .or('is_migrated.is.null,is_migrated.neq.true')
    .not('url', 'is', null);

  if (error) { console.error('Supabase error:', error); process.exit(1); }
  if (!sbData || !sbData.length) { console.log('Nothing to migrate.'); return; }

  console.log(`Found ${sbData.length} records to migrate.\n`);

  let migrated = 0, errors = 0;
  const total = sbData.length;

  for (let i = 0; i < total; i++) {
    const row = sbData[i];
    if (!row.url || !row.url.trim()) { errors++; continue; }
    try {
      const topicId = findTopicId(row.topic, row.tags);
      const desc = row.description ? row.description.slice(0, 500) : '';
      const savedAt = row.saved_at || new Date().toISOString();

      let linkId;
      const existing = await sql(
        'SELECT id FROM links WHERE original_url = $1 AND user_id = $2',
        [row.url, 'a14b72ae-5114-4db9-be1f-1e695bd20630']
      );
      if (existing && existing.length) {
        linkId = existing[0].id;
        await sql(
          `UPDATE links SET title = $1, description = $2, topic_id = $3, updated_at = NOW() WHERE id = $4`,
          [row.topic || '', desc, topicId, linkId]
        );
      } else {
        const linkResult = await sql(
          `INSERT INTO links (user_id, original_url, title, description, topic_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          ['a14b72ae-5114-4db9-be1f-1e695bd20630', row.url, row.topic || '', desc, topicId, savedAt]
        );
        linkId = linkResult[0].id;
      }

      if (row.tags && row.tags.length) {
        for (const tagName of row.tags) {
          const normalized = normalize(tagName);
          if (!normalized || normalized.length < 1) continue;
          const tagResult = await sql(
            `INSERT INTO tags (name, normalized_name) VALUES ($1, $2)
             ON CONFLICT (normalized_name) DO UPDATE SET
               name = CASE WHEN tags.name = '' THEN EXCLUDED.name ELSE tags.name END,
               usage_count = tags.usage_count + 1
             RETURNING id`,
            [tagName, normalized]
          );
          if (tagResult && tagResult.length) {
            await sql(
              'INSERT INTO link_tags (link_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [linkId, tagResult[0].id]
            );
          }
        }
      }

      try {
        await supabase.from('saved_links').update({ is_migrated: true }).eq('url', row.url);
      } catch (updErr) {
        console.error('  Supabase update error for', row.url, updErr.message);
      }

      migrated++;
    } catch (e) {
      errors++;
      console.error('  Error:', row.url.slice(0, 80) + '...', e.message);
    }
    if ((i + 1) % 50 === 0 || i === total - 1) {
      process.stdout.write(`  ${migrated + errors}/${total} — ${migrated} ok, ${errors} errors\n`);
    } else if (i % 10 === 0) {
      process.stdout.write('.');
    }
  }

  console.log(`\nDone. ${migrated} migrated, ${errors} errors.`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
