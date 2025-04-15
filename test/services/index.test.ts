/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */
/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import registerService from '../../src/services';

// custom dependencies
import app from '../../src/app';

const mockedApp = {
  configure: jest.fn(),
};

export default class Service {
  _testServer;
  _endpoint;

  constructor(endpoint) {
    this._endpoint = endpoint;
    this._testServer = request(app);
  }

  /**
   *
   * @param details - The details of the resource to be created
   * @param token - the access token of the user
   * @param idToken - the ID token of the user
   * @returns - the server response
   */
  create(details, token, idToken) {
    return this._testServer
      .post(this._endpoint)
      .send(details)
      .set('authorization', token)
      .set('x-id-token', idToken);
  }

  getList(token, query = null, idToken = '') {
    const endpoint = query ? `${this._endpoint}?${query}` : this._endpoint;

    return this._testServer
      .get(endpoint)
      .set('authorization', token)
      .set('x-id-token', idToken);
  }

  get(id, token, idToken = '') {
    return this._testServer
      .get(`${this._endpoint}/${id}`)
      .set('authorization', token)
      .set('x-id-token', idToken);
  }

  patch(id, details, token, idToken = '') {
    return this._testServer
      .patch(`${this._endpoint}/${id}`)
      .send(details)
      .set('authorization', token)
      .set('x-id-token', idToken);
  }

  /**
   *
   * @param id - id of the resource to be deleted
   * @param token - The access token of the user
   * @param idToken - The ID token of the user
   * @returns - The response from the server
   */
  delete(id, token, idToken = '') {
    return this._testServer
      .delete(`${this._endpoint}/${id}`)
      .set('authorization', token)
      .set('x-id-token', idToken);
  }
}

describe('Services', () => {
  it('should register all services', () => {
    // @ts-ignore
    registerService(mockedApp);
    expect(mockedApp.configure).toHaveBeenCalled();
  });
});
