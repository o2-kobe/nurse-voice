import { Controller, Post, Body, Res } from '@nestjs/common';
import { NurseAgentService } from './nurse-agent.service';
import { NurseChatDto } from './dto/nurse-chat.dto';
import { type Response } from 'express';
import { pipeUIMessageStreamToResponse, toUIMessageStream } from 'ai';

@Controller('nurse-agent')
export class NurseAgentController {
  constructor(private readonly nurseAgentService: NurseAgentService) {}

  @Post('chat')
  async handleNurseChat(
    @Body() dto: NurseChatDto,
    @Res() res: Response,
  ): Promise<void> {
    console.log('Messages received**********', dto.messages);

    try {
      const result = await this.nurseAgentService.processNurseRequest(
        dto.messages,
      );

      const uiMessageStream = toUIMessageStream({
        stream: result.fullStream,
      });

      await pipeUIMessageStreamToResponse({
        response: res,
        stream: uiMessageStream,
      });
    } catch (error) {
      console.error('Error during AI streaming:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      } else {
        res.end();
      }
    }
  }
}
