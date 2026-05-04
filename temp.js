const fs = require('fs');
const content = fs.readFileSync('src/hooks/useAuth.ts', 'utf8');
console.log(content.substring(90, 110));
