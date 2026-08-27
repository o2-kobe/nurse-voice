import { IsArray } from 'class-validator';
import { UIMessage } from 'ai';

export class NurseChatDto {
  @IsArray()
  messages!: UIMessage[];
}

