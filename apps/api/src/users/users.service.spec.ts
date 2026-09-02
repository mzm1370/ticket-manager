import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  const mockRepo = {
    findOneBy: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve({ id: 1, ...user })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('registers a new user with a hashed password', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    const result = await service.register({
      email: 'dev@example.com',
      password: 'password123',
      role: 'DEVELOPER',
    });
    expect(result.email).toBe('dev@example.com');
    expect((result as any).passwordHash).not.toBe('password123'); // must be hashed, not plaintext
  });

  it('rejects registration if the email already exists', async () => {
    mockRepo.findOneBy.mockResolvedValue({ id: 1, email: 'dev@example.com' });
    await expect(
      service.register({ email: 'dev@example.com', password: 'password123', role: 'DEVELOPER' }),
    ).rejects.toThrow(ConflictException);
  });
});
