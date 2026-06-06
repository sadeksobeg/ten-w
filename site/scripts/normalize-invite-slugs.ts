import { normalizeAllInviteSlugs } from "../lib/invite/normalize-slugs";

async function main() {
  const result = await normalizeAllInviteSlugs();
  console.log(`Scanned: ${result.scanned}`);
  console.log(`Updated: ${result.updated}`);
  console.log(`Skipped: ${result.skipped}`);
  for (const change of result.changes) {
    console.log(`- ${change.name}: ${change.from} → ${change.to}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
