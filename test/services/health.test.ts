import app from '../../src/app';
import assert from 'assert';
import axios from 'axios';

describe('Health Check Service', () => {
  let server: any;
  let port: number;

  before(function (done) {
    server = app.listen(0);
    server.once('listening', () => {
      port = server.address().port;
      done();
    });
  });

  after(function (done) {
    server.close(done);
  });

  it('should return 200 OK with health data', async () => {
    const url = `http://localhost:${port}/health`;
    const response = await axios.get(url);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.status, 'ok');
    assert.ok(response.data.timestamp);
    assert.ok(response.data.uptime >= 0);
    assert.ok(response.data.memory);
  });
});
