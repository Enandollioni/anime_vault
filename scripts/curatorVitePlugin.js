import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export function curatorPlugin() {
  return {
    name: 'curator-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // 1. Check local status & git state
        if (url === '/api/curator/status' && req.method === 'GET') {
          try {
            let status = '';
            try {
              status = execSync('git status --porcelain src/data/', { encoding: 'utf-8' }).trim();
            } catch {}
            let lastCommit = '';
            try {
              lastCommit = execSync('git log -1 --format="%h - %s (%cd)" --date=relative', { encoding: 'utf-8' }).trim();
            } catch {}

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              isLocal: true,
              hasUncommittedChanges: status.length > 0,
              uncommittedFiles: status,
              lastCommit
            }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        // 2. Save rating, review & status
        if (url === '/api/curator/save' && req.method === 'POST') {
          try {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const body = JSON.parse(Buffer.concat(buffers).toString('utf-8'));
            const { mode, id, score, review, status } = body;

            const filename = mode === 'cinema' ? 'cinemaData.json' : 'animeData.json';
            const filePath = path.resolve(process.cwd(), 'src', 'data', filename);
            const backupPath = path.resolve(process.cwd(), 'src', 'data', `${filename}.backup`);

            if (!fs.existsSync(filePath)) {
              throw new Error(`Файл ${filename} не найден`);
            }

            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);

            const index = data.findIndex(item => Number(item.id) === Number(id));
            if (index === -1) {
              throw new Error(`Тайтл с ID ${id} не найден в ${filename}`);
            }

            // Create safety backup
            fs.writeFileSync(backupPath, raw, 'utf-8');

            const item = data[index];
            if (score !== undefined && score !== null && !isNaN(Number(score))) {
              item.score = Math.round(Number(score) * 100) / 100;
              // Recalc tier
              if (item.score >= 10.0) item.tier = 'S+';
              else if (item.score >= 9.0) item.tier = 'S';
              else if (item.score >= 8.0) item.tier = 'A';
              else if (item.score >= 7.0) item.tier = 'B';
              else if (item.score >= 5.0) item.tier = 'C';
              else if (item.score > 0.0) item.tier = 'D_F';
              else item.tier = 'unrated';
            }

            if (review !== undefined && review !== null) {
              item.review = String(review).trim();
            }

            if (status) {
              item.status = status;
            }

            item.updated_at = new Date().toISOString();

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              message: `Изменения успешно сохранены в ${filename}`,
              item
            }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        }

        // 3. One-click deploy to GitHub
        if (url === '/api/curator/deploy' && req.method === 'POST') {
          try {
            execSync('git add src/data/animeData.json src/data/cinemaData.json', { encoding: 'utf-8' });

            const diff = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim();
            let commitMsg = '';
            if (diff) {
              const now = new Date().toLocaleString('ru-RU');
              commitMsg = `curator: update ratings and reviews (${now})`;
              execSync(`git commit -m "${commitMsg}"`, { encoding: 'utf-8' });
            }

            execSync('git push origin main', { encoding: 'utf-8' });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              message: diff ? `Опубликовано на GitHub: ${commitMsg}` : 'Все изменения уже на GitHub.',
              deployedAt: new Date().toISOString()
            }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        }

        next();
      });
    }
  };
}
