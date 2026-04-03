const fs = require('fs');

const fixDropdown = (path) => {
  if (!fs.existsSync(path)) return;
  let t = fs.readFileSync(path, 'utf8');
  
  // 1. Add state variable if not there
  if (!t.includes("const [isFilterOpen")) {
    t = t.replace(/export default function [A-Za-z0-9_]+\(\) \{/, "$&\n  const [isFilterOpen, setIsFilterOpen] = useState(false);");
  }

  // 2. Fix the wrapper z-index (finding the wrapper above the filter)
  // Usually starts with <div className="flex flex-col
  t = t.replace(/<div className="flex flex-col lg:flex-row/g, '<div className="relative z-50 flex flex-col lg:flex-row');
  
  // 3. Fix the group hover
  t = t.replace(/<div className="relative group">/g, '<div className="relative">');

  // 4. Find the button right after that contains the filter icon
  // We'll replace className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20...
  t = t.replace(/<button className="([^"]*?)">[\s\S]*?<Filter/g, '<button onClick={() => setIsFilterOpen(!isFilterOpen)} className="$1">$&');

  // 5. Find the dropdown menu classes
  t = t.replace(/className="([^"]*?) opacity-0 invisible group-hover:opacity-100 group-hover:visible ([^"]*?z-50[^"]*?)"/g, 'className={`$1 $2 ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}');
  
  // 6. Make the dropdown buttons close the menu
  t = t.replace(/onClick=\{\(\) => setFilterStatus\(s\)\}/g, 'onClick={() => { setFilterStatus(s); setIsFilterOpen(false); }}');
  t = t.replace(/onClick=\{\(\) => setFilterCategory\(([^\)]+)\)\}/g, 'onClick={() => { setFilterCategory($1); setIsFilterOpen(false); }}');
  t = t.replace(/onClick=\{\(\) => setTimeRange\(rng\)\}/g, 'onClick={() => { setTimeRange(rng); setIsFilterOpen(false); }}');

  fs.writeFileSync(path, t, 'utf8');
  console.log("Fixed", path);
};

["app/orders/page.tsx", "app/menu/page.tsx", "app/reports/page.tsx"].forEach(fixDropdown);
