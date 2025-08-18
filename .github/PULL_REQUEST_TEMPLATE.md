## Overview

Brief description of what this PR does, and why it is needed.

**Closes:** VWN-XXX  
**Type of Change:** 
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)  
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Security enhancement

### Demo

Optional. Screenshots, `curl` examples, etc.

### Breaking Changes

⚠️ **List any breaking changes and migration steps required**

### Security Considerations

🔒 **Any security implications, new permissions, or sensitive data handling**

### Performance Impact

⚡ **Expected performance impact (positive, negative, or neutral) and any load testing performed**

### Notes

Optional. Ancillary topics, caveats, alternative strategies that didn't work out, anything else.

## Checklist for Author

### Code Quality
- [ ] Code follows project style guidelines and best practices
- [ ] Code is well documented with clear comments
- [ ] No commented-out code or debug statements left behind
- [ ] Variable and function names are descriptive and consistent

### Testing
- [ ] Unit tests have been added/updated and pass locally
- [ ] Integration tests have been written and pass
- [ ] Manual testing completed for the feature/fix
- [ ] Edge cases and error scenarios have been tested
- [ ] Browser compatibility tested (if frontend changes)

### Database & Infrastructure  
- [ ] Database migrations created and tested (if schema changes)
- [ ] New environment variables added to serverless config and SSM
- [ ] AWS permissions granted in serverless config for new services
- [ ] Configuration changes documented

### Documentation
- [ ] README updated (if needed)
- [ ] API documentation updated (if applicable)
- [ ] Deployment notes added (if special steps required)

### Security & Performance
- [ ] Security review completed (if handling sensitive data)
- [ ] Performance impact assessed
- [ ] No secrets or sensitive data exposed in code

## Checklist for Reviewer

### Functional Review
- [ ] The changes have been pulled locally and tested manually
- [ ] Feature meets acceptance criteria from the ticket
- [ ] Edge cases and error scenarios work as expected
- [ ] UI/UX changes reviewed and approved (if applicable)

### Code Review
- [ ] Code follows [Engineering Guidelines](https://www.notion.so/liftai/Engineering-Guidelines-6bb02659f17a49b5bdc5c3ed9ec69fec)
- [ ] Architecture and design patterns are appropriate
- [ ] No obvious security vulnerabilities
- [ ] Error handling is appropriate
- [ ] Logging is adequate for debugging

### Integration Review  
- [ ] Changes tested with frontend applications (if backend changes)
- [ ] Database migrations reviewed and tested
- [ ] Environment variable changes verified
- [ ] Deployment process reviewed

## Testing Instructions

**Prerequisites:**
- List any setup required (environment variables, services, etc.)

**Test Cases:**
1. **Happy Path Testing:**
   - Step-by-step instructions for main functionality
   - Expected results

2. **Edge Case Testing:**
   - Test invalid inputs, boundary conditions
   - Expected error handling

3. **Integration Testing:**
   - Test with other system components
   - Verify API contracts (if applicable)

**Regression Testing:**
- [ ] Existing functionality still works as expected
- [ ] No unintended side effects observed

## Deployment Notes

**Pre-deployment checklist:**
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Feature flags configured (if applicable)

**Post-deployment verification:**
- [ ] Health checks pass
- [ ] Monitoring and alerts configured
- [ ] Rollback plan documented
