
describe('\'timelineBlogs\' service', () => {
  it('registered the service', () => {
    const service = global.__APP__.service('timeline-blogs');
    expect(service).toBeTruthy();
  });
});
