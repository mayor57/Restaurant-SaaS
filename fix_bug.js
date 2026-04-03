const fs = require('fs');

const fixDropdown = (path) => {
  if (!fs.existsSync(path)) return;
  let t = fs.readFileSync(path, 'utf8');
  
  // Fix the double button
  t = t.replace(/<button onClick=\{\(\) => setIsFilterOpen\(!isFilterOpen\)\} className="([^"]*?)"><button className="\1">/g, '<button onClick={() => setIsFilterOpen(!isFilterOpen)} className="$1">');

  fs.writeFileSync(path, t, 'utf8');
  console.log("Fixed", path);
};

["app/orders/page.tsx", "app/menu/page.tsx", "app/reports/page.tsx"].forEach(fixDropdown);