import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('transactions')
  createTransaction(@Body() dto: CreateStockTransactionDto) {
    return this.inventoryService.createTransaction(dto);
  }

  @Get('transactions')
  findAllTransactions() {
    return this.inventoryService.findAllTransactions();
  }

  @Get('low-stock')
  getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }
}