# Growth Engine UI Audit Checklist

Manual QA for partner and admin routes (RTL ar, LTR en, mobile + desktop).

## Partner routes

- [ ] `/growth` — Hub hero, missions, badges, support card, heatmap
- [ ] `/growth/deals` — Kanban, lead form, journey pills
- [ ] `/growth/earnings` — Stat cards, ledger, payout form
- [ ] `/growth/network` — Referral analytics, team list/tree
- [ ] `/growth/events` — Event cards, join flow
- [ ] `/growth/events/[slug]` — Detail, milestones
- [ ] `/growth/chat` — Full thread, history segments
- [ ] `/growth/notifications` — List, openChat links
- [ ] `/growth/settings` — Share card export, avatar
- [ ] `/growth/kit` — Marketing kit
- [ ] `/growth/profile/[slug]` — Public profile, network tree (3 levels)
- [ ] Mobile bottom nav — dashboard, deals, earnings, network, events, chat, notifications

## Admin routes

- [ ] `/growth/admin` — Overview stats
- [ ] `/growth/admin/partners` — Create, upline picker, tree preview
- [ ] `/growth/admin/events` — Create, edit, delete
- [ ] `/growth/admin/chat` — Inbox
- [ ] Other admin CRUD — missions, badges, rewards, levels

## Visual system

- [ ] Gold tokens consistent inside `.growth-root`
- [ ] `GlassCard` from `@/components/growth/ui/GlassCard` on growth pages
- [ ] `GrowthPageHeader` on secondary partner pages
- [ ] Reduced motion respected (celebrations, shimmer)

## Functional

- [ ] Admin set upline — no cycles
- [ ] Public profile shows network tree
- [ ] Share card PNG downloads (landscape + story)
- [ ] Event edit + delete (confirm when participants)
