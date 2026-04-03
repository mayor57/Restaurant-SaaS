const fs = require("fs");
const files = [
  "app/orders/page.tsx",
  "app/inventory/page.tsx",
  "app/reservations/page.tsx",
  "app/menu/page.tsx"
];

for (const path of files) {
  if (fs.existsSync(path)) {
    let c = fs.readFileSync(path, "utf8");
    // Replace hardcoded min-w that breaks mobile grids
    c = c.replace(/min-w-\[800px\]/g, "w-full lg:min-w-[800px]");
    c = c.replace(/min-w-\[1000px\]/g, "w-full lg:min-w-[1000px]");
    // Remove fixed table widths and just let it adapt
    
    // Some lines might also have white-space-nowrap restricting natural wrapping on mobile.
    // Let's soften whitespace-nowrap to only apply on medium+ screens for table cells that have text overflow
    c = c.replace(/whitespace-nowrap/g, "whitespace-normal sm:whitespace-nowrap");
    
    fs.writeFileSync(path, c, "utf8");
  }
}