# Project working rules

## Submit before the usage limit

- The user wants completed website work built and submitted before Codex usage or credit limits interrupt the session.
- During substantial work, check available usage periodically when a usage tool is available, and immediately when the user mentions a low limit. Do not assume remaining usage is known when it cannot be checked.
- At 20% or less remaining in either usage window, or when the user warns that credits are low, stop starting new work and prioritise a release checkpoint.
- Finish the current bounded change, run `npm run build` and `git diff --check`, review the intended diff, then commit and push completed, user-approved changes to the project's configured remote and current branch. The user authorizes these release checkpoints; do not ask again for routine push permission. Respect any later instruction to keep changes local and any required tool approval.
- Do not push unfinished work, unrelated changes, secrets, or changes with failing checks just to meet the limit. Report any blocker promptly and preserve the work locally.
- Confirm build and push results. Distinguish a successful push from a verified production deployment; never claim deployment success without evidence.
- Reserve enough usage for this checkpoint rather than spending the remaining allowance on optional improvements. Usage exhaustion can be abrupt, so do not promise a guaranteed submission if tools or limits prevent it.
