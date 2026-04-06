const fs = require('fs');

const path = "app/menu/page.tsx";
let t = fs.readFileSync(path, 'utf8');

t = t.replace(
  'className="absolute top-full right-0 mt-2 w-44 glass-card bg-[#0A0A0A] border-white/10 transition-all z-[100] ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"} p-2 shadow-2xl"',
  'className={`absolute top-full right-0 mt-2 w-44 glass-card bg-[#0A0A0A] border-white/10 transition-all z-[100] p-2 shadow-2xl ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}'
);

fs.writeFileSync(path, t, 'utf8');
console.log("Syntax patched.");