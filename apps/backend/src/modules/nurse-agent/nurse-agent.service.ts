import { google } from '@ai-sdk/google';
import { Injectable } from '@nestjs/common';
import { ModelMessage, stepCountIs, streamText } from 'ai';
import { NurseAgentToolsService } from './nurse-agent-tools.service';

@Injectable()
export class NurseAgentService {
  constructor(private readonly toolsService: NurseAgentToolsService) {}

  processNurseRequest(messages: ModelMessage[]) {
    const result = streamText({
      model: google('gemini-3.6-flash'),
      system: `You are an AI Nurse Assistant. Be concise, direct, and clinical. Always confirm tool executions clearly with patient codes.`,
      messages,
      tools: this.toolsService.getTools(),
      stopWhen: stepCountIs(5),
    });

    return result;
  }
}
