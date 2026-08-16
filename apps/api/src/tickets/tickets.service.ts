import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
  ) {}

  create(dto: CreateTicketDto) {
    const ticket = this.ticketsRepo.create(dto);
    return this.ticketsRepo.save(ticket);
  }

  findAll() {
    return this.ticketsRepo.find();
  }

  async findOne(id: number) {
    const ticket = await this.ticketsRepo.findOneBy({ id });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto) {
    await this.findOne(id);
    await this.ticketsRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const ticket = await this.findOne(id);
    await this.ticketsRepo.remove(ticket);
    return ticket;
  }
}
