## Reflections on using Cline (w/Anthropic Claude Sonnet 4)

- Pretty impressive, how much and how cohesively it's able to generate things
- Really good at churning out a feature/system quickly
- Amusing that I told it to keep committing its changes as it went along, and it gave up on doing that partway through
- Blocked by the Anthropic API returning "overloaded" errors a couple of times. Good reminder that by using this stuff, we are introducing an external dependency into our core dev loop. One that requires continued favourable conditions to continue working:
    - sufficient credit/the bill being paid
    - AI API being in good health, w.r.t traffic etc.
    - all components of the toolchain maintaining compatibility
    - no infrastructure impediments, either ours or theirs, e.g. geoblocking etc.
- It takes a concerted effort to review the stuff the model produces, when it just pops up more or less all there and functioning.
- The sprint function was a funny experiment. Got the acceleration and especially the sound generation going very quickly, but the logic is *very* buggy. As expected; it's some complicated stuff.
- It's also pretty good for bulk accessibility and compatibility coverage.
- I think there's a lot of promise to this workflow, provided we can meet the following criteria (at least, there are sure to be other things that haven't occurred to me):
    - Manual tweaks and changes *must* be a common, expected part of the workflow.
        - If Cline produces a feature that is 95% good but needs that last 5% sorted out, we need to be able to make those changes ourselves rather than wrangling with the prompt for hours to refine Cline's output until it's 100%.
        - If we're cut off from Cline for any reason, we need to be able to keep working in the old-fashioned way.
        - Ideally, we should be able to have Cline running off to the side (as and when we want), watching the repo and keeping its memory bank up-to-date with changes as necessary.
    - Verification of behaviour should be outside Cline's remit. It can do some of its own, for sure, but it should not be able to change unit tests, Storybook stories, etc.
        - Using RACT Online as an example, a good workflow would be having Cline smash out a new feature or try out a bugfix, while Chromatic assesses the changes to the app as-rendered. That way we get the classical logic confirmation via Chromatic's diffs and such, as a "hard" backstop to the "print a bunch of associated tokens" output of the model.