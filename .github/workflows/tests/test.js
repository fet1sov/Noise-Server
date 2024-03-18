const { app } = require('../../../server.js');
const supertest = require('supertest');

describe('Server endpoints', () => {
    it('GET /index Pinging index page', async () => {
        const response = await supertest(app).get('/index');
        expect(response.statusCode).toBe(200);
    });

    it('GET /random/route Pinging index page', async () => {
        const response = await supertest(app).get('/random/route');
        expect(response.statusCode).toBe(404);
    });
})