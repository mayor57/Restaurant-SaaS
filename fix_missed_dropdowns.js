const fs = require('fs');

const fixMenu = () => {
  let path = "app/menu/page.tsx";
  if (!fs.existsSync(path)) return;
  let t = fs.readFileSync(path, 'utf8');

  // Fix button onClick
  t = t.replace(
    '<button className="flex items-center justify-between gap-4 bg-black/60 border border-white/5 hover:border-amber-500/30 text-white px-5 py-3 rounded-xl transition-all min-w-[140px]">',
    '<button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center justify-between gap-4 bg-black/60 border border-white/5 hover:border-amber-500/30 text-white px-5 py-3 rounded-xl transition-all min-w-[140px]">'
  );

  // Fix Dropdown Logic and Z-index
  t = t.replace(
    'opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]',
    'transition-all z-[100] ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"}'
  );
  // Add backtic injection if needed
  t = t.replace(
    'className="absolute top-full right-0 mt-2 w-44 glass-card bg-[#0A0A0A] border-white/10 transition-all z-[100] ${isFilterOpen ? \\"opacity-100 visible\\" : \\"opacity-0 invisible\\"}"',
    'className={`absolute top-full right-0 mt-2 w-44 glass-card bg-[#0A0A0A] border-white/10 transition-all z-[100] ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}'
  );
  // Just in case it didn't match the backtic, let's just do a clean replace 
  t = t.replace(
    /className="absolute top-full right-0 mt-2 w-44 glass-card bg-\[#0A0A0A\] border-white\/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-\[60\] p-2 shadow-2xl"/,
    'className={`absolute top-full right-0 mt-2 w-44 glass-card bg-[#0A0A0A] border-white/10 transition-all z-[100] p-2 shadow-2xl ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}'
  );

  // Fix Wrapper
  t = t.replace('relative z-10', 'relative z-50');

  fs.writeFileSync(path, t, 'utf8');
  console.log("Fixed Menu");
}

const fixReports = () => {
  let path = "app/reports/page.tsx";
  if (!fs.existsSync(path)) return;
  let t = fs.readFileSync(path, 'utf8');

  // Add onClick to calendar button
  t = t.replace(
    '<div className="relative"><button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5">',
    '<div className="relative"><button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5">'
  );

  // Fix Wrapper
  t = t.replace('className="mb-10 flex items-end justify-between relative z-10 transition-all"', 'className="mb-10 flex items-end justify-between relative z-[100] transition-all"');
  t = t.replace(
    /onClick=\{\(\) => changeRange\(range\)\}/g,
    'onClick={() => { changeRange(range); setIsFilterOpen(false); }}'
  );

  fs.writeFileSync(path, t, 'utf8');
  console.log("Fixed Reports");
}

fixMenu();
fixReports();