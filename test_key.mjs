import https from 'https';
import fs from 'fs';

const key = "AIzaSyA3pw4Fl7PqU_wHp6p9jk3-zJxXu0bi76g";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    if (data.models) {
      const names = data.models.map(m => m.name).join('\n');
      console.log("Writing to found_models.txt...");
      fs.writeFileSync('found_models.txt', names);
      console.log("Done.");
    }
  });
});
