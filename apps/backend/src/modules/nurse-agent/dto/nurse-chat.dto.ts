import { IsString } from 'class-validator';

export class NurseChatDto {
  @IsString()
  prompt!: string;
}
