/**
 * LexDAO Analytics and Insights Engine
 *
 * Advanced analytics and insights generation for LexDAO governance data.
 * Provides comprehensive analysis of governance patterns, member behavior,
 * proposal success rates, and strategic recommendations.
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export interface AnalyticsData {
  members: MemberData[];
  proposals: ProposalData[];
  votes: VoteData[];
  treasury: TreasuryData[];
  activities: ActivityData[];
}

export interface MemberData {
  address: string;
  joined: string;
  status: 'active' | 'inactive';
  tokens: number;
  votes: number;
  proposals: number;
  lastActivity: string;
}

export interface ProposalData {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'pending' | 'active' | 'executed' | 'rejected';
  proposer: string;
  timestamp: string;
  votesFor: number;
  votesAgainst: number;
  votingThreshold: string;
  duration: number;
}

export interface VoteData {
  proposalId: string;
  voter: string;
  support: boolean;
  votingPower: number;
  timestamp: string;
}

export interface TreasuryData {
  eth: number;
  dai: number;
  usdc: number;
  timestamp: string;
}

export interface ActivityData {
  type: 'proposal' | 'vote' | 'execution' | 'membership';
  description: string;
  actor: string;
  timestamp: string;
  proposalId?: string;
}

export interface AnalyticsResult {
  overview: {
    totalMembers: number;
    activeMembers: number;
    totalProposals: number;
    executedProposals: number;
    participationRate: number;
    treasuryValue: number;
  };
  trends: {
    membershipGrowth: GrowthData[];
    proposalActivity: ActivityTrend[];
    votingParticipation: ParticipationTrend[];
    treasuryEvolution: TreasuryTrend[];
  };
  insights: {
    governance: GovernanceInsights;
    membership: MembershipInsights;
    treasury: TreasuryInsights;
    risk: RiskAssessment;
  };
  recommendations: StrategicRecommendation[];
}

export interface GrowthData {
  date: string;
  members: number;
  growth: number;
}

export interface ActivityTrend {
  period: string;
  proposals: number;
  votes: number;
  executions: number;
}

export interface ParticipationTrend {
  period: string;
  participationRate: number;
  avgVotesPerMember: number;
}

export interface TreasuryTrend {
  date: string;
  totalValue: number;
  eth: number;
  dai: number;
  usdc: number;
}

export interface GovernanceInsights {
  proposalSuccessRate: number;
  avgVotingDuration: number;
  quorumAchievement: number;
  categoryDistribution: Record<string, number>;
  decisionVelocity: number;
}

export interface MembershipInsights {
  retentionRate: number;
  engagementScore: number;
  diversityIndex: number;
  contributionPatterns: Record<string, number>;
  onboardingEffectiveness: number;
}

export interface TreasuryInsights {
  allocationEfficiency: number;
  riskAdjustedReturns: number;
  liquidityRatio: number;
  spendingPatterns: Record<string, number>;
}

export interface RiskAssessment {
  governanceRisk: number;
  treasuryRisk: number;
  operationalRisk: number;
  complianceRisk: number;
  overallRisk: number;
}

export interface StrategicRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'governance' | 'membership' | 'treasury' | 'technical' | 'legal';
  title: string;
  description: string;
  impact: string;
  effort: string;
  timeframe: string;
  metrics?: string[];
}

export class DAOAnalytics {
  private data: AnalyticsData;

  constructor(dataPath?: string) {
    if (dataPath) {
      this.data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } else {
      // Generate sample data for demonstration
      this.data = this.generateSampleData();
    }
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateAnalytics(): Promise<AnalyticsResult> {
    const overview = this.calculateOverview();
    const trends = this.analyzeTrends();
    const insights = this.generateInsights();
    const recommendations = this.generateRecommendations();

    return {
      overview,
      trends,
      insights,
      recommendations
    };
  }

  /**
   * Calculate high-level overview metrics
   */
  private calculateOverview() {
    const members = this.data.members;
    const proposals = this.data.proposals;

    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const totalProposals = proposals.length;
    const executedProposals = proposals.filter(p => p.status === 'executed').length;

    // Calculate participation rate
    const totalVotes = this.data.votes.length;
    const participationRate = totalMembers > 0 ? (totalVotes / totalMembers) * 100 : 0;

    // Calculate current treasury value (simplified)
    const latestTreasury = this.getLatestTreasuryData();
    const ethPrice = 3000; // Simulated ETH price
    const treasuryValue = (latestTreasury.eth * ethPrice) + latestTreasury.dai + latestTreasury.usdc;

    return {
      totalMembers,
      activeMembers,
      totalProposals,
      executedProposals,
      participationRate,
      treasuryValue
    };
  }

  /**
   * Analyze trends over time
   */
  private analyzeTrends() {
    const membershipGrowth = this.calculateMembershipGrowth();
    const proposalActivity = this.calculateProposalActivity();
    const votingParticipation = this.calculateVotingParticipation();
    const treasuryEvolution = this.calculateTreasuryEvolution();

    return {
      membershipGrowth,
      proposalActivity,
      votingParticipation,
      treasuryEvolution
    };
  }

  /**
   * Calculate membership growth over time
   */
  private calculateMembershipGrowth(): GrowthData[] {
    const members = this.data.members;
    const sortedMembers = members.sort((a, b) =>
      new Date(a.joined).getTime() - new Date(b.joined).getTime()
    );

    const growth: GrowthData[] = [];
    const monthlyGrowth: Record<string, number> = {};

    sortedMembers.forEach(member => {
      const month = new Date(member.joined).toISOString().substring(0, 7); // YYYY-MM
      monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
    });

    let cumulative = 0;
    Object.entries(monthlyGrowth)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, newMembers]) => {
        cumulative += newMembers;
        const previousMonth = growth.length > 0 ? growth[growth.length - 1].members : 0;
        growth.push({
          date: month,
          members: cumulative,
          growth: cumulative - previousMonth
        });
      });

    return growth;
  }

  /**
   * Calculate proposal activity trends
   */
  private calculateProposalActivity(): ActivityTrend[] {
    const proposals = this.data.proposals;
    const monthlyActivity: Record<string, { proposals: number; votes: number; executions: number }> = {};

    // Aggregate by month
    proposals.forEach(proposal => {
      const month = new Date(proposal.timestamp).toISOString().substring(0, 7);
      if (!monthlyActivity[month]) {
        monthlyActivity[month] = { proposals: 0, votes: 0, executions: 0 };
      }
      monthlyActivity[month].proposals++;
      if (proposal.status === 'executed') {
        monthlyActivity[month].executions++;
      }
    });

    this.data.votes.forEach(vote => {
      const month = new Date(vote.timestamp).toISOString().substring(0, 7);
      if (monthlyActivity[month]) {
        monthlyActivity[month].votes++;
      }
    });

    return Object.entries(monthlyActivity)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        period: month,
        proposals: data.proposals,
        votes: data.votes,
        executions: data.executions
      }));
  }

  /**
   * Calculate voting participation trends
   */
  private calculateVotingParticipation(): ParticipationTrend[] {
    const members = this.data.members.length;
    const monthlyParticipation: Record<string, { votes: number; uniqueVoters: Set<string> }> = {};

    this.data.votes.forEach(vote => {
      const month = new Date(vote.timestamp).toISOString().substring(0, 7);
      if (!monthlyParticipation[month]) {
        monthlyParticipation[month] = { votes: 0, uniqueVoters: new Set() };
      }
      monthlyParticipation[month].votes++;
      monthlyParticipation[month].uniqueVoters.add(vote.voter);
    });

    return Object.entries(monthlyParticipation)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        period: month,
        participationRate: (data.uniqueVoters.size / members) * 100,
        avgVotesPerMember: data.votes / data.uniqueVoters.size
      }));
  }

  /**
   * Calculate treasury evolution over time
   */
  private calculateTreasuryEvolution(): TreasuryTrend[] {
    const treasury = this.data.treasury;
    const ethPrice = 3000; // Simulated current ETH price

    return treasury.map(t => ({
      date: t.timestamp,
      totalValue: (t.eth * ethPrice) + t.dai + t.usdc,
      eth: t.eth,
      dai: t.dai,
      usdc: t.usdc
    }));
  }

  /**
   * Generate comprehensive insights
   */
  private generateInsights() {
    const governance = this.analyzeGovernance();
    const membership = this.analyzeMembership();
    const treasury = this.analyzeTreasury();
    const risk = this.assessRisk();

    return {
      governance,
      membership,
      treasury,
      risk
    };
  }

  /**
   * Analyze governance patterns and effectiveness
   */
  private analyzeGovernance(): GovernanceInsights {
    const proposals = this.data.proposals;
    const votes = this.data.votes;

    // Proposal success rate
    const executedProposals = proposals.filter(p => p.status === 'executed').length;
    const proposalSuccessRate = proposals.length > 0 ? (executedProposals / proposals.length) * 100 : 0;

    // Average voting duration
    const completedProposals = proposals.filter(p => p.status !== 'pending' && p.status !== 'active');
    const avgVotingDuration = completedProposals.length > 0
      ? completedProposals.reduce((sum, p) => sum + p.duration, 0) / completedProposals.length
      : 0;

    // Quorum achievement rate
    const proposalsWithQuorum = proposals.filter(p => {
      const totalVotes = p.votesFor + p.votesAgainst;
      const members = this.data.members.length;
      return totalVotes >= (members * 0.1); // 10% quorum
    });
    const quorumAchievement = proposals.length > 0 ? (proposalsWithQuorum.length / proposals.length) * 100 : 0;

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    proposals.forEach(proposal => {
      categoryDistribution[proposal.category] = (categoryDistribution[proposal.category] || 0) + 1;
    });

    // Decision velocity (proposals per month)
    const months = this.getMonthsSpan();
    const decisionVelocity = months > 0 ? proposals.length / months : 0;

    return {
      proposalSuccessRate,
      avgVotingDuration,
      quorumAchievement,
      categoryDistribution,
      decisionVelocity
    };
  }

  /**
   * Analyze membership patterns and engagement
   */
  private analyzeMembership(): MembershipInsights {
    const members = this.data.members;

    // Retention rate (members active in last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentMembers = members.filter(m =>
      new Date(m.lastActivity) >= threeMonthsAgo
    );
    const retentionRate = members.length > 0 ? (recentMembers.length / members.length) * 100 : 0;

    // Engagement score (based on votes and proposals)
    const engagementScores = members.map(member => {
      const voteScore = Math.min(member.votes / 10, 1) * 50; // Up to 50 points for votes
      const proposalScore = Math.min(member.proposals / 3, 1) * 50; // Up to 50 points for proposals
      return voteScore + proposalScore;
    });
    const engagementScore = engagementScores.length > 0
      ? engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length
      : 0;

    // Diversity index (simplified - based on join dates)
    const joinDates = members.map(m => new Date(m.joined).getTime());
    const diversityIndex = joinDates.length > 1
      ? 100 - (Math.max(...joinDates) - Math.min(...joinDates)) / (365 * 24 * 60 * 60 * 1000) * 100
      : 100;

    // Contribution patterns
    const contributionPatterns: Record<string, number> = {
      high: members.filter(m => m.votes + m.proposals > 5).length,
      medium: members.filter(m => m.votes + m.proposals > 1 && m.votes + m.proposals <= 5).length,
      low: members.filter(m => m.votes + m.proposals <= 1).length
    };

    // Onboarding effectiveness (new members who become active)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const newMembers = members.filter(m => new Date(m.joined) >= oneMonthAgo);
    const activeNewMembers = newMembers.filter(m => m.status === 'active');
    const onboardingEffectiveness = newMembers.length > 0
      ? (activeNewMembers.length / newMembers.length) * 100
      : 0;

    return {
      retentionRate,
      engagementScore,
      diversityIndex,
      contributionPatterns,
      onboardingEffectiveness
    };
  }

  /**
   * Analyze treasury management and efficiency
   */
  private analyzeTreasury(): TreasuryInsights {
    const treasury = this.data.treasury;

    // Allocation efficiency (diversification measure)
    const latest = this.getLatestTreasuryData();
    const totalValue = (latest.eth * 3000) + latest.dai + latest.usdc;
    const maxAllocation = Math.max(latest.eth * 3000, latest.dai, latest.usdc);
    const allocationEfficiency = totalValue > 0 ? (maxAllocation / totalValue) * 100 : 0;

    // Risk-adjusted returns (simplified simulation)
    const riskAdjustedReturns = this.calculateRiskAdjustedReturns();

    // Liquidity ratio (cash equivalents / total assets)
    const cashEquivalents = latest.dai + latest.usdc;
    const liquidityRatio = totalValue > 0 ? (cashEquivalents / totalValue) * 100 : 0;

    // Spending patterns (simulated based on executed proposals)
    const executedProposals = this.data.proposals.filter(p => p.status === 'executed');
    const spendingPatterns: Record<string, number> = {};

    executedProposals.forEach(proposal => {
      // Simulate spending based on proposal category
      const amount = this.getSimulatedSpending(proposal.category);
      spendingPatterns[proposal.category] = (spendingPatterns[proposal.category] || 0) + amount;
    });

    return {
      allocationEfficiency,
      riskAdjustedReturns,
      liquidityRatio,
      spendingPatterns
    };
  }

  /**
   * Assess various risk factors
   */
  private assessRisk(): RiskAssessment {
    // Governance risk (based on proposal success and participation)
    const governanceInsights = this.analyzeGovernance();
    const governanceRisk = Math.max(0, 100 - governanceInsights.proposalSuccessRate - governanceInsights.quorumAchievement);

    // Treasury risk (based on allocation and liquidity)
    const treasuryInsights = this.analyzeTreasury();
    const treasuryRisk = Math.max(0, treasuryInsights.allocationEfficiency - treasuryInsights.liquidityRatio);

    // Operational risk (based on activity levels)
    const activityTrend = this.calculateProposalActivity();
    const recentActivity = activityTrend.slice(-3); // Last 3 months
    const avgActivity = recentActivity.reduce((sum, a) => sum + a.proposals, 0) / recentActivity.length;
    const operationalRisk = avgActivity < 2 ? 70 : avgActivity < 5 ? 40 : 20;

    // Compliance risk (simplified)
    const complianceRisk = 30; // Placeholder - would need legal analysis

    const overallRisk = (governanceRisk + treasuryRisk + operationalRisk + complianceRisk) / 4;

    return {
      governanceRisk,
      treasuryRisk,
      operationalRisk,
      complianceRisk,
      overallRisk
    };
  }

  /**
   * Generate strategic recommendations
   */
  private generateRecommendations(): StrategicRecommendation[] {
    const recommendations: StrategicRecommendation[] = [];

    // Governance recommendations
    const governanceInsights = this.analyzeGovernance();
    if (governanceInsights.proposalSuccessRate < 60) {
      recommendations.push({
        priority: 'high',
        category: 'governance',
        title: 'Improve Proposal Quality',
        description: 'Focus on developing higher-quality proposals with clear rationale and implementation plans.',
        impact: 'Higher proposal success rate and better governance outcomes',
        effort: 'Medium',
        timeframe: '3-6 months',
        metrics: ['proposal success rate', 'member satisfaction']
      });
    }

    // Membership recommendations
    const membershipInsights = this.analyzeMembership();
    if (membershipInsights.retentionRate < 70) {
      recommendations.push({
        priority: 'high',
        category: 'membership',
        title: 'Enhance Member Engagement',
        description: 'Implement programs to increase member participation and retention.',
        impact: 'Stronger community and better governance participation',
        effort: 'High',
        timeframe: '6-12 months',
        metrics: ['retention rate', 'engagement score']
      });
    }

    // Treasury recommendations
    const treasuryInsights = this.analyzeTreasury();
    if (treasuryInsights.allocationEfficiency > 80) {
      recommendations.push({
        priority: 'medium',
        category: 'treasury',
        title: 'Diversify Treasury Holdings',
        description: 'Reduce concentration risk by diversifying treasury asset allocation.',
        impact: 'Lower portfolio risk and improved stability',
        effort: 'Medium',
        timeframe: '3-6 months',
        metrics: ['allocation efficiency', 'risk-adjusted returns']
      });
    }

    // Technical recommendations
    recommendations.push({
      priority: 'medium',
      category: 'technical',
      title: 'Implement Advanced Analytics Dashboard',
      description: 'Build comprehensive analytics dashboard for real-time governance insights.',
      impact: 'Better decision-making and transparency',
      effort: 'High',
      timeframe: '6-9 months',
      metrics: ['dashboard usage', 'decision velocity']
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get the most recent treasury data
   */
  private getLatestTreasuryData(): TreasuryData {
    const treasury = this.data.treasury;
    return treasury.reduce((latest, current) =>
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    );
  }

  /**
   * Get the number of months spanned by the data
   */
  private getMonthsSpan(): number {
    const timestamps = [
      ...this.data.proposals.map(p => new Date(p.timestamp)),
      ...this.data.votes.map(v => new Date(v.timestamp)),
      ...this.data.activities.map(a => new Date(a.timestamp))
    ];

    if (timestamps.length === 0) return 1;

    const earliest = new Date(Math.min(...timestamps.map(t => t.getTime())));
    const latest = new Date(Math.max(...timestamps.map(t => t.getTime())));
    const monthsDiff = (latest.getFullYear() - earliest.getFullYear()) * 12 +
                     (latest.getMonth() - earliest.getMonth());

    return Math.max(1, monthsDiff);
  }

  /**
   * Calculate simulated risk-adjusted returns
   */
  private calculateRiskAdjustedReturns(): number {
    // Simplified calculation based on treasury composition
    const latest = this.getLatestTreasuryData();
    const ethAllocation = (latest.eth * 3000) / ((latest.eth * 3000) + latest.dai + latest.usdc);

    // Assume ETH has higher returns but higher volatility
    const expectedReturn = (ethAllocation * 0.15) + ((1 - ethAllocation) * 0.05);
    const riskAdjustment = ethAllocation * 0.3; // Higher ETH allocation = higher risk

    return expectedReturn - riskAdjustment;
  }

  /**
   * Get simulated spending amount for a proposal category
   */
  private getSimulatedSpending(category: string): number {
    const spendingByCategory: Record<string, number> = {
      membership: 2000,
      treasury: 5000,
      governance: 1000,
      technical: 8000,
      legal: 3000,
      partnership: 10000
    };

    return spendingByCategory[category] || 1000;
  }

  /**
   * Generate sample data for demonstration
   */
  private generateSampleData(): AnalyticsData {
    const members: MemberData[] = [];
    const proposals: ProposalData[] = [];
    const votes: VoteData[] = [];
    const treasury: TreasuryData[] = [];
    const activities: ActivityData[] = [];

    // Generate sample members
    for (let i = 0; i < 50; i++) {
      const joinDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      members.push({
        address: `0x${i.toString(16).padStart(40, '0')}`,
        joined: joinDate.toISOString(),
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        tokens: 1000,
        votes: Math.floor(Math.random() * 20),
        proposals: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
        lastActivity: new Date(joinDate.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Generate sample proposals
    const categories = ['membership', 'treasury', 'governance', 'technical', 'legal'];
    for (let i = 0; i < 25; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = ['draft', 'pending', 'active', 'executed', 'rejected'][Math.floor(Math.random() * 5)] as any;
      const timestamp = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);

      proposals.push({
        id: `proposal_${i}`,
        title: `Sample ${category} proposal ${i}`,
        category,
        status,
        proposer: members[Math.floor(Math.random() * members.length)].address,
        timestamp: timestamp.toISOString(),
        votesFor: status === 'executed' ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 20),
        votesAgainst: status === 'rejected' ? Math.floor(Math.random() * 25) + 15 : Math.floor(Math.random() * 15),
        votingThreshold: 'Simple Majority',
        duration: 7 + Math.floor(Math.random() * 14)
      });
    }

    // Generate sample votes
    proposals.forEach(proposal => {
      const voteCount = proposal.votesFor + proposal.votesAgainst;
      for (let i = 0; i < voteCount; i++) {
        const isFor = i < proposal.votesFor;
        votes.push({
          proposalId: proposal.id,
          voter: members[Math.floor(Math.random() * members.length)].address,
          support: isFor,
          votingPower: 1000,
          timestamp: new Date(new Date(proposal.timestamp).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    // Generate sample treasury data
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const timestamp = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
      treasury.push({
        eth: 5 + Math.random() * 2,
        dai: 12000 + Math.random() * 2000,
        usdc: 8000 + Math.random() * 2000,
        timestamp: timestamp.toISOString()
      });
    }

    // Generate sample activities
    [...proposals, ...votes].forEach((item, i) => {
      activities.push({
        type: 'proposalId' in item ? 'vote' : 'proposal',
        description: 'proposalId' in item ? `Vote cast on proposal` : `Proposal created`,
        actor: 'proposalId' in item ? item.voter : item.proposer,
        timestamp: item.timestamp,
        proposalId: 'proposalId' in item ? item.proposalId : item.id
      });
    });

    return {
      members,
      proposals,
      votes,
      treasury,
      activities
    };
  }

  /**
   * Export analytics report to various formats
   */
  async exportReport(analytics: AnalyticsResult, format: 'json' | 'markdown' | 'html', outputPath: string): Promise<void> {
    switch (format) {
      case 'json':
        await fs.writeJson(outputPath, analytics, { spaces: 2 });
        break;

      case 'markdown':
        await this.exportToMarkdown(analytics, outputPath);
        break;

      case 'html':
        await this.exportToHTML(analytics, outputPath);
        break;
    }
  }

  private async exportToMarkdown(analytics: AnalyticsResult, outputPath: string): Promise<void> {
    let markdown = `# LexDAO Analytics Report\n\n`;
    markdown += `Generated on: ${new Date().toISOString()}\n\n`;

    // Overview
    markdown += `## Executive Overview\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Members | ${analytics.overview.totalMembers} |\n`;
    markdown += `| Active Members | ${analytics.overview.activeMembers} |\n`;
    markdown += `| Total Proposals | ${analytics.overview.totalProposals} |\n`;
    markdown += `| Executed Proposals | ${analytics.overview.executedProposals} |\n`;
    markdown += `| Participation Rate | ${analytics.overview.participationRate.toFixed(1)}% |\n`;
    markdown += `| Treasury Value | $${analytics.overview.treasuryValue.toLocaleString()} |\n\n`;

    // Governance Insights
    markdown += `## Governance Insights\n\n`;
    markdown += `**Proposal Success Rate:** ${analytics.insights.governance.proposalSuccessRate.toFixed(1)}%\n`;
    markdown += `**Average Voting Duration:** ${analytics.insights.governance.avgVotingDuration.toFixed(1)} days\n`;
    markdown += `**Quorum Achievement:** ${analytics.insights.governance.quorumAchievement.toFixed(1)}%\n`;
    markdown += `**Decision Velocity:** ${analytics.insights.governance.decisionVelocity.toFixed(1)} proposals/month\n\n`;

    // Recommendations
    markdown += `## Strategic Recommendations\n\n`;
    analytics.recommendations.forEach((rec, i) => {
      markdown += `### ${i + 1}. ${rec.title} [${rec.priority.toUpperCase()}]\n`;
      markdown += `**Category:** ${rec.category}\n`;
      markdown += `**Description:** ${rec.description}\n`;
      markdown += `**Impact:** ${rec.impact}\n`;
      markdown += `**Effort:** ${rec.effort} | **Timeframe:** ${rec.timeframe}\n\n`;
    });

    await fs.writeFile(outputPath, markdown);
  }

  private async exportToHTML(analytics: AnalyticsResult, outputPath: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LexDAO Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .metric-card { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 5px; }
          .high-priority { border-left: 5px solid #f44336; }
          .medium-priority { border-left: 5px solid #ff9800; }
          .low-priority { border-left: 5px solid #4caf50; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>LexDAO Analytics Report</h1>
        <p>Generated on: ${new Date().toISOString()}</p>

        <h2>Executive Overview</h2>
        <div class="metric-card">
          <p><strong>Total Members:</strong> ${analytics.overview.totalMembers}</p>
          <p><strong>Active Members:</strong> ${analytics.overview.activeMembers}</p>
          <p><strong>Total Proposals:</strong> ${analytics.overview.totalProposals}</p>
          <p><strong>Participation Rate:</strong> ${analytics.overview.participationRate.toFixed(1)}%</p>
          <p><strong>Treasury Value:</strong> $${analytics.overview.treasuryValue.toLocaleString()}</p>
        </div>

        <h2>Governance Insights</h2>
        <div class="metric-card">
          <p><strong>Proposal Success Rate:</strong> ${analytics.insights.governance.proposalSuccessRate.toFixed(1)}%</p>
          <p><strong>Average Voting Duration:</strong> ${analytics.insights.governance.avgVotingDuration.toFixed(1)} days</p>
          <p><strong>Quorum Achievement:</strong> ${analytics.insights.governance.quorumAchievement.toFixed(1)}%</p>
        </div>

        <h2>Strategic Recommendations</h2>
        ${analytics.recommendations.map(rec => `
          <div class="metric-card ${rec.priority}-priority">
            <h3>${rec.title}</h3>
            <p><strong>Category:</strong> ${rec.category}</p>
            <p><strong>Description:</strong> ${rec.description}</p>
            <p><strong>Impact:</strong> ${rec.impact}</p>
            <p><strong>Effort:</strong> ${rec.effort} | <strong>Timeframe:</strong> ${rec.timeframe}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    await fs.writeFile(outputPath, html);
  }
}

// CLI interface for the analytics engine
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: ts-node dao-analytics.ts <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  analyze [data-file]     Generate comprehensive analytics report');
    console.log('  export <format> <file>  Export analytics in specified format');
    console.log('  insights                Show key insights only');
    console.log('');
    console.log('Examples:');
    console.log('  ts-node dao-analytics.ts analyze');
    console.log('  ts-node dao-analytics.ts analyze workflow_outputs.json');
    console.log('  ts-node dao-analytics.ts export markdown report.md');
    process.exit(1);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'analyze': {
        const dataFile = args[1];
        const analytics = new DAOAnalytics(dataFile);
        const report = await analytics.generateAnalytics();

        console.log('📊 LexDAO Analytics Report');
        console.log('========================');
        console.log(`\n📈 Overview:`);
        console.log(`   Members: ${report.overview.totalMembers} (${report.overview.activeMembers} active)`);
        console.log(`   Proposals: ${report.overview.totalProposals} (${report.overview.executedProposals} executed)`);
        console.log(`   Participation: ${report.overview.participationRate.toFixed(1)}%`);
        console.log(`   Treasury: $${report.overview.treasuryValue.toLocaleString()}`);

        console.log(`\n⚖️ Governance:`);
        console.log(`   Success Rate: ${report.insights.governance.proposalSuccessRate.toFixed(1)}%`);
        console.log(`   Quorum Rate: ${report.insights.governance.quorumAchievement.toFixed(1)}%`);

        console.log(`\n💡 Top Recommendations:`);
        report.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`   ${i + 1}. ${rec.title} (${rec.priority})`);
        });

        // Export default report
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await analytics.exportReport(report, 'json', `./analytics-report-${timestamp}.json`);
        console.log(`\n📄 Full report exported to: analytics-report-${timestamp}.json`);
        break;
      }

      case 'export': {
        const format = args[1];
        const file = args[2];

        if (!format || !file) {
          throw new Error('Format and file path required');
        }

        const analytics = new DAOAnalytics();
        const report = await analytics.generateAnalytics();
        await analytics.exportReport(report, format as any, file);

        console.log(`✅ Analytics exported to ${file} in ${format} format`);
        break;
      }

      case 'insights': {
        const analytics = new DAOAnalytics();
        const report = await analytics.generateAnalytics();

        console.log('🎯 Key Insights');
        console.log('==============');

        console.log(`\nGovernance Health:`);
        console.log(`   • Proposal success rate: ${report.insights.governance.proposalSuccessRate.toFixed(1)}%`);
        console.log(`   • Member participation: ${report.overview.participationRate.toFixed(1)}%`);
        console.log(`   • Decision velocity: ${report.insights.governance.decisionVelocity.toFixed(1)} proposals/month`);

        console.log(`\nMembership Vitality:`);
        console.log(`   • Retention rate: ${report.insights.membership.retentionRate.toFixed(1)}%`);
        console.log(`   • Engagement score: ${report.insights.membership.engagementScore.toFixed(1)}/100`);

        console.log(`\nTreasury Health:`);
        console.log(`   • Allocation efficiency: ${report.insights.treasury.allocationEfficiency.toFixed(1)}%`);
        console.log(`   • Liquidity ratio: ${report.insights.treasury.liquidityRatio.toFixed(1)}%`);

        console.log(`\nRisk Assessment:`);
        console.log(`   • Overall risk: ${report.insights.risk.overallRisk.toFixed(1)}/100`);
        console.log(`   • Governance risk: ${report.insights.risk.governanceRisk.toFixed(1)}/100`);
        console.log(`   • Treasury risk: ${report.insights.risk.treasuryRisk.toFixed(1)}/100`);
        break;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DAOAnalytics };
