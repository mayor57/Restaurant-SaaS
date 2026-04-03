const fs = require("fs");
const path = "app/staff/page.tsx";
let c = fs.readFileSync(path, "utf8");

// Add import if not exists
if (!c.includes('import Topbar from "@/components/Topbar";')) {
  c = c.replace('import { motion, AnimatePresence } from "framer-motion";', 
    'import Topbar from "@/components/Topbar";\nimport { motion, AnimatePresence } from "framer-motion";');
}

// Replace the return <div> wrapper with <><Topbar /><main></main></>
c = c.replace(/return \(\s*<div className="p-4 md:p-8 space-y-8 max-w-\[1600px\] mx-auto">/, 
`return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-32">`);

c = c.replace(/<\/AnimatePresence>\s*<\/div>\s*\);\s*}\s*$/, 
`      </AnimatePresence>
      </main>
    </>
  );
}`);

fs.writeFileSync(path, c, "utf8");