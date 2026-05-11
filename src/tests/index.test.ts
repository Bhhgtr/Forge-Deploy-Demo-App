import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, count } from '../index.js';


describe('GET /sum', () => {
  it('should return incremental value', async () => {
    const res = await request(app).get('/sum');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'sum',
      sum: count,
    });
  });
});
