import { User } from '@src/model/user';

describe('Users functional tests', () => {
  beforeAll(async () => await User.deleteMany({}));
  describe('When creating a new user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newUser));
    });

    it('should not create a duplicated email user', async () => {
      const firstUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await global.testRequest.post('/users').send(firstUser);

      const secondUser = {
        ...firstUser,
        name: 'Jonh Doe Second',
        password: '4321',
      };

      const response = await global.testRequest.post('/users').send(secondUser);

      expect(response.status).toBe(500);
    });
  });
});
