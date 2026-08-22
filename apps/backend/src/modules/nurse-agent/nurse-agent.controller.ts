import { Controller, Post, Sse, MessageEvent, Body } from '@nestjs/common';
import { NurseAgentService } from './nurse-agent.service';
import { from, map, Observable } from 'rxjs';
import { NurseChatDto } from './dto/nurse-chat.dto';

@Controller('nurseAgent')
export class NurseAgentController {
  constructor(private readonly nurseAgentService: NurseAgentService) {}

  @Post('chat')
  @Sse()
  handleNurseChat(@Body() dto: NurseChatDto): Observable<MessageEvent> {
    //  Pass incoming prompt as a single user message
    const result = this.nurseAgentService.processNurseRequest([
      { role: 'user', content: dto.prompt },
    ]);

    // Convert AsyncIterable (textStream) to RxJS Observable for NestJS SSE
    return from(result.textStream).pipe(
      map(
        (chunk) =>
          ({
            data: JSON.stringify({ text: chunk }),
          }) as MessageEvent,
      ),
    );

    // // 📡 fullStream emits typed events: 'text-delta', 'tool-call', 'tool-result'
    // return from(result.fullStream).pipe(
    //   map((part) => ({
    //     // 💬 Sends structured JSON so frontend can show spinners during tool execution
    //     data: JSON.stringify(part),
    //   }) as MessageEvent),
    // );
  }
}
