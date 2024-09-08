

describe('\'search-blog \' service', () => {
  it('registered the service', () => {
    const service = global.__APP__.service('search-blog');
    expect(service).toBeTruthy();
  });
});
