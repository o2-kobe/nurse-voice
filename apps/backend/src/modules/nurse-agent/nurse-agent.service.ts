import { google } from '@ai-sdk/google';
import { Injectable } from '@nestjs/common';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';
import { NurseAgentToolsService } from './nurse-agent-tools.service';

@Injectable()
export class NurseAgentService {
  constructor(private readonly toolsService: NurseAgentToolsService) {}

  async processNurseRequest(messages: UIMessage[]) {
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google('gemini-3.6-flash'),
      system: `You are an AI Nurse Assistant. Be concise, direct, and clinical. Always confirm tool executions clearly with patient codes. Format details cleanly using plain line breaks rather than bold asterisks or special characters, so the response is easy to speak out loud.`,
      messages: modelMessages,
      tools: this.toolsService.getTools(),
      stopWhen: stepCountIs(5),
    });

    return result;
  }
}
