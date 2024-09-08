
describe('Media service', () => {

  it('registered the service', () => {
    const service = global.__APP__.service('medias');
    expect(service).toBeTruthy();
  });

});
