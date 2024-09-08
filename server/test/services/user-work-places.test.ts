
describe('\'userWorkPlaces\' service', () => {
  it('registered the service', () => {
    const service = global.__APP__.service('user-work-places');
    expect(service).toBeTruthy();
  });
});
