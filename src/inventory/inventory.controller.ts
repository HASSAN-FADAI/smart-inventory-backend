import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'),RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('transactions')
  @Roles(Role.ADMIN, Role.MANAGER)
  createTransaction(@Body() dto: CreateStockTransactionDto) {
    return this.inventoryService.createTransaction(dto);
  }

  @Get('transactions')
  @Roles(Role.ADMIN, Role.MANAGER)
  findAllTransactions() {
    return this.inventoryService.findAllTransactions();
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.MANAGER)
  getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }
}