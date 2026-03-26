import { NextFunction, Request, Response } from "express";
import { parseAgentQueryCommand } from "./agent.schema";
import { AgentService } from "./agent.service";

export function createAgentController(agentService: AgentService) {
  return {
    query: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const command = parseAgentQueryCommand(request.body);
        const result = await agentService.query(command);

        response.status(200).json(result);
      } catch (error) {
        next(error);
      }
    }
  };
}
