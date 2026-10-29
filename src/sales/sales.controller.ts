import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('sales')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'),RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER,Role.CASHIER)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.salesService.create(createOrderDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER,Role.CASHIER)
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER,Role.CASHIER)
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}