describe("'Reaction' service", () => {
  it('registered the service', () => {
    const service = global.__APP__.service('reactions');
    expect(service).toBeTruthy();
  });
});
