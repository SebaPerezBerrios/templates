import { Body, Controller, Get, Post } from '@nestjs/common';
import { JwtUserGuard, Roles } from '../../shared/utils/guards';
import { ZodValidate } from '../../shared/utils/types';
import { TenantCreateDto, TenantService } from '../../shared/domain/tenant';

@JwtUserGuard()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('')
  @Roles('tenants.create')
  create(@Body(ZodValidate(TenantCreateDto)) tenantCreateDto: TenantCreateDto) {
    return this.tenantService.create(tenantCreateDto);
  }

  @Get('')
  @Roles('tenants.list')
  userData() {
    return this.tenantService.getTenants();
  }
}
