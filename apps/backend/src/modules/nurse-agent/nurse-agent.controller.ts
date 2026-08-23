import { Controller, Post, Body, Res } from '@nestjs/common';
import { NurseAgentService } from './nurse-agent.service';
import { NurseChatDto } from './dto/nurse-chat.dto';
import { type Response } from 'express';

@Controller('nurse-agent')
export class NurseAgentController {
  constructor(private readonly nurseAgentService: NurseAgentService) {}

  @Post('chat')
  async handleNurseChat(
    @Body() dto: NurseChatDto,
    @Res() res: Response,
  ): Promise<void> {
    console.log('Prompt received**********', dto.prompt);

    // Set SSE headers manually — @Sse() only works with @Get, not @Post
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    try {
      const result = this.nurseAgentService.processNurseRequest([
        { role: 'user', content: dto.prompt },
      ]);

      // 📡 fullStream emits typed events: 'text-delta', 'tool-call', 'tool-result'
      for await (const part of result.fullStream) {
        const line = `data: ${JSON.stringify(part)}\n\n`;
        res.write(line);
      }
    } catch (error) {
      console.error('Error during AI streaming:', error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : String(error) })}\n\n`,
      );
    } finally {
      res.end();
    }
  }
}
