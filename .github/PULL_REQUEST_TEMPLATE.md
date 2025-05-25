## Overview

Brief description of what this PR does, and why it is needed.

Closes VWN-XXX

### Demo

Optional. Screenshots, `curl` examples, etc.

### Notes

Optional. Ancillary topics, caveats, alternative strategies that didn't work out, anything else.

# Checklist for Author

- [ ] Have integration tests been written : 
- [ ] Is code well documented
- [ ] Any changes to the schema have been tested with the frontends, and necessay adjustments made
- [ ] Have migrations been created and added to the migrations folder
- [ ] Have new environment variable been added to serverless config and ssm.
- [ ] Have permissions been granted in serverless config for any new aws service

## Checklist for Reviewer

- [ ] The changes been pulled in locally and the feature has been tested manually
- [ ] Does the code follow best practices [Guide](https://www.notion.so/liftai/Engineering-Guidelines-6bb02659f17a49b5bdc5c3ed9ec69fec)
- [ ] Does the feature meet acceptance criteria on the ticket.

## Testing Instructions

- How to test this PR
- Prefer bulleted description
- Start after checking out this branch
- Include any setup required, such as bundling scripts, restarting services, etc.
- Include test case, and expected output
