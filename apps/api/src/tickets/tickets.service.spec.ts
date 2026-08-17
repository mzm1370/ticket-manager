import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';

describe('TicketsService', () => {
  let service: TicketsService;
  const mockRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((ticket) => Promise.resolve({ id: 1, ...ticket })),
    find: jest.fn(() => Promise.resolve([])),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Ticket), useValue: mockRepo },
      ],
    }).compile();
    service = moduleRef.get(TicketsService);
  });

  it('creates a ticket with the given title', async () => {
    const result = await service.create({ title: 'Test ticket' });
    expect(result.title).toBe('Test ticket');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('returns an empty list when there are no tickets', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});
