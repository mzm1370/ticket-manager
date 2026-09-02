import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const testEmail = `e2e-${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('blocks /tickets without a token', () => {
    return request(app.getHttpServer())
      .get('/tickets')
      .expect(401);
  });

  it('allows register and login without a token (public routes)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: testEmail, password: 'password123', role: 'DEVELOPER' })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'password123' })
      .expect(201);

    expect(loginRes.body.accessToken).toBeDefined();
  });

  it('allows /tickets WITH a valid token', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'password123' })
      .expect(201);

    const token = loginRes.body.accessToken;

    await request(app.getHttpServer())
      .get('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('rejects a garbage token', () => {
    return request(app.getHttpServer())
      .get('/tickets')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401);
  });
});
