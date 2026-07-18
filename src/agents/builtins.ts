import { AnalysisAgent, DataAnalysisAgent } from './builtin-analysis';
import {
  ActiveInferencePOMDPAgent,
  FinalReviewAgent,
  PlanningAgent,
  ReviewAgent,
} from './builtin-planning';
import {
  CalmTechnologyAgent,
  CreativeWritingAgent,
  CustomerSupportAgent,
  DevelopmentAgent,
  FinanceAgent,
  HRAgent,
  LegalAgent,
  MarketingAgent,
  ResearchAgent,
  RevisionAgent,
  WritingAgent,
} from './builtin-text';

export {
  ActiveInferencePOMDPAgent,
  AnalysisAgent,
  CalmTechnologyAgent,
  CreativeWritingAgent,
  CustomerSupportAgent,
  DataAnalysisAgent,
  DevelopmentAgent,
  FinanceAgent,
  FinalReviewAgent,
  HRAgent,
  LegalAgent,
  MarketingAgent,
  PlanningAgent,
  ResearchAgent,
  ReviewAgent,
  RevisionAgent,
  WritingAgent,
};

export function createBuiltInAgents() {
  return [
    new AnalysisAgent(),
    new DataAnalysisAgent(),
    new WritingAgent(),
    new CreativeWritingAgent(),
    new RevisionAgent(),
    new ResearchAgent(),
    new DevelopmentAgent(),
    new FinanceAgent(),
    new HRAgent(),
    new LegalAgent(),
    new MarketingAgent(),
    new CustomerSupportAgent(),
    new CalmTechnologyAgent(),
    new PlanningAgent(),
    new ReviewAgent(),
    new FinalReviewAgent(),
    new ActiveInferencePOMDPAgent(),
  ];
}
