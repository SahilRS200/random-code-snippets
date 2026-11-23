import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// What a seller may change on their own product
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  pricePaise?: number;
}
