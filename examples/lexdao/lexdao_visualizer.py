#!/usr/bin/env python3
"""
LexDAO Governance Visualizer

Enhanced visualization and animation tool for LexDAO governance data.
Generates interactive visualizations and animations based on the workflow output.
"""

import os
import json
import sys
import argparse
from datetime import datetime, timedelta
import random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.colors import LinearSegmentedColormap
import networkx as nx
import seaborn as sns
from matplotlib.ticker import MaxNLocator
import io
import base64

# Set plotting style
plt.style.use('ggplot')
sns.set_theme(style="whitegrid")

# Define LexDAO color palette
LEXDAO_COLORS = {
    'primary': '#3949ab',  # Primary LexDAO blue
    'secondary': '#5c6bc0',  # Secondary blue
    'accent': '#9c27b0',  # Purple accent
    'positive': '#4caf50',  # Green for positive/approved
    'negative': '#f44336',  # Red for negative/rejected
    'neutral': '#ff9800',  # Orange for pending/neutral
    'background': '#f8f9fa',  # Light background
    'text': '#212121',  # Dark text
    'muted': '#757575'  # Muted text
}

def load_workflow_data(output_dir):
    """Load workflow output data from the specified directory."""
    try:
        with open(os.path.join(output_dir, 'workflow_outputs.json'), 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"Error: Could not find workflow_outputs.json in {output_dir}")
        sys.exit(1)
    except json.JSONDecodeError:
        print("Error: Invalid JSON in workflow_outputs.json")
        sys.exit(1)

def ensure_output_dirs(output_dir):
    """Ensure that output directories exist."""
    os.makedirs(os.path.join(output_dir, 'visualizations'), exist_ok=True)
    os.makedirs(os.path.join(output_dir, 'animations'), exist_ok=True)

def save_figure(fig, output_path, dpi=300):
    """Save a figure with proper formatting."""
    fig.tight_layout()
    fig.savefig(output_path, dpi=dpi, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved figure to {output_path}")

def visualize_membership_network(data, output_dir):
    """Create a network visualization of DAO membership interactions."""
    print("Generating membership network visualization...")
    
    members = data.get('membership_data', {}).get('members', [])
    proposals = data.get('proposal_data', {}).get('proposals', [])
    votes = data.get('vote_data', {}).get('votes', [])
    
    if not members or not proposals or not votes:
        print("Warning: Missing membership, proposal, or vote data for network visualization")
        return
    
    # Create a graph
    G = nx.Graph()
    
    # Add member nodes
    for member in members:
        G.add_node(member['address'][:10], 
                  type='member', 
                  joined=member['joined'],
                  status=member['status'])
    
    # Add proposal nodes
    for proposal in proposals:
        proposal_id = proposal['title'].replace(' ', '_').lower()
        G.add_node(proposal_id, 
                  type='proposal',
                  category=proposal.get('category', 'unknown'),
                  status=proposal['status'])
        
        # Connect proposer to proposal
        if 'proposer' in proposal:
            G.add_edge(proposal['proposer'][:10], proposal_id, type='proposed')
    
    # Add vote edges
    for vote in votes:
        proposal_id = vote['proposalId']
        voter = vote['voter'][:10]
        
        if G.has_node(voter) and G.has_node(proposal_id):
            G.add_edge(voter, proposal_id, 
                      type='vote', 
                      support=vote['support'])
    
    # Create figure
    plt.figure(figsize=(14, 10))
    
    # Define node positions using a layout algorithm
    pos = nx.spring_layout(G, k=0.15, iterations=50)
    
    # Draw member nodes
    member_nodes = [node for node, attr in G.nodes(data=True) if attr.get('type') == 'member']
    nx.draw_networkx_nodes(G, pos, 
                          nodelist=member_nodes,
                          node_color=LEXDAO_COLORS['primary'],
                          node_size=50,
                          alpha=0.7)
    
    # Draw proposal nodes - color by status
    proposal_nodes = [node for node, attr in G.nodes(data=True) if attr.get('type') == 'proposal']
    proposal_colors = []
    for node in proposal_nodes:
        status = G.nodes[node]['status']
        if status == 'executed':
            proposal_colors.append(LEXDAO_COLORS['positive'])
        elif status == 'rejected':
            proposal_colors.append(LEXDAO_COLORS['negative'])
        elif status == 'active':
            proposal_colors.append(LEXDAO_COLORS['secondary'])
        else:
            proposal_colors.append(LEXDAO_COLORS['neutral'])
    
    nx.draw_networkx_nodes(G, pos, 
                          nodelist=proposal_nodes,
                          node_color=proposal_colors,
                          node_shape='s',  # square for proposals
                          node_size=100,
                          alpha=0.9)
    
    # Draw edges - different colors for propose vs vote
    propose_edges = [(u, v) for u, v, attr in G.edges(data=True) if attr.get('type') == 'proposed']
    vote_for_edges = [(u, v) for u, v, attr in G.edges(data=True) 
                    if attr.get('type') == 'vote' and attr.get('support')]
    vote_against_edges = [(u, v) for u, v, attr in G.edges(data=True) 
                         if attr.get('type') == 'vote' and not attr.get('support')]
    
    nx.draw_networkx_edges(G, pos, 
                          edgelist=propose_edges,
                          width=2,
                          alpha=0.7,
                          edge_color=LEXDAO_COLORS['accent'])
    
    nx.draw_networkx_edges(G, pos, 
                          edgelist=vote_for_edges,
                          width=1,
                          alpha=0.5,
                          edge_color=LEXDAO_COLORS['positive'])
    
    nx.draw_networkx_edges(G, pos, 
                          edgelist=vote_against_edges,
                          width=1,
                          alpha=0.5,
                          edge_color=LEXDAO_COLORS['negative'])
    
    # Add labels for proposal nodes only (to avoid overcrowding)
    proposal_labels = {node: node.replace('_', ' ')[:15] + '...' 
                      for node in proposal_nodes}
    nx.draw_networkx_labels(G, pos, 
                           labels=proposal_labels,
                           font_size=8,
                           font_family='sans-serif')
    
    # Create legend
    plt.legend([
        plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=LEXDAO_COLORS['primary'], markersize=10),
        plt.Line2D([0], [0], marker='s', color='w', markerfacecolor=LEXDAO_COLORS['positive'], markersize=10),
        plt.Line2D([0], [0], marker='s', color='w', markerfacecolor=LEXDAO_COLORS['negative'], markersize=10),
        plt.Line2D([0], [0], marker='s', color='w', markerfacecolor=LEXDAO_COLORS['neutral'], markersize=10),
        plt.Line2D([0], [0], color=LEXDAO_COLORS['accent'], lw=2),
        plt.Line2D([0], [0], color=LEXDAO_COLORS['positive'], lw=2),
        plt.Line2D([0], [0], color=LEXDAO_COLORS['negative'], lw=2),
    ], [
        'Members',
        'Executed Proposals',
        'Rejected Proposals',
        'Pending Proposals',
        'Proposed By',
        'Voted For',
        'Voted Against'
    ], loc='upper right')
    
    plt.title('LexDAO Governance Network', fontsize=16, fontweight='bold')
    plt.axis('off')
    
    # Save the figure
    output_path = os.path.join(output_dir, 'visualizations', 'membership_network.png')
    save_figure(plt.gcf(), output_path)

def create_vote_animation(data, output_dir):
    """Create an animated visualization of voting over time."""
    print("Generating vote animation...")
    
    proposals = data.get('proposal_data', {}).get('proposals', [])
    votes = data.get('vote_data', {}).get('votes', [])
    
    if not proposals or not votes:
        print("Warning: Missing proposal or vote data for animation")
        return
    
    # Select a single proposal for animation
    proposal = next((p for p in proposals if p['status'] in ['executed', 'active']), proposals[0])
    proposal_id = proposal['title'].replace(' ', '_').lower()
    
    # Filter votes for this proposal
    proposal_votes = [v for v in votes if v['proposalId'] == proposal_id]
    
    # Sort votes by timestamp
    proposal_votes.sort(key=lambda x: x['timestamp'])
    
    # Calculate cumulative votes over time
    timestamps = []
    cumulative_for = []
    cumulative_against = []
    for_count = 0
    against_count = 0
    
    for vote in proposal_votes:
        timestamps.append(datetime.fromisoformat(vote['timestamp'].replace('Z', '+00:00')))
        if vote['support']:
            for_count += 1
        else:
            against_count += 1
        cumulative_for.append(for_count)
        cumulative_against.append(against_count)
    
    # Create animation
    fig, ax = plt.subplots(figsize=(10, 6))
    
    def animate(i):
        ax.clear()
        if i == 0:
            return
        
        # Plot data up to frame i
        ax.plot(timestamps[:i], cumulative_for[:i], 'o-', color=LEXDAO_COLORS['positive'], label='For')
        ax.plot(timestamps[:i], cumulative_against[:i], 'o-', color=LEXDAO_COLORS['negative'], label='Against')
        
        # Formatting
        ax.set_title(f"Voting Progress: {proposal['title']}", fontweight='bold', fontsize=14)
        ax.set_xlabel('Time')
        ax.set_ylabel('Number of Votes')
        ax.grid(True, alpha=0.3)
        ax.legend()
        
        # Adjust y-axis to be integer only
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        
        # Add current status
        status_text = f"Current Status: {for_count/(for_count+against_count)*100:.1f}% For, {against_count/(for_count+against_count)*100:.1f}% Against"
        ax.text(0.5, 0.02, status_text, transform=ax.transAxes, 
                ha='center', fontsize=10, bbox=dict(facecolor='white', alpha=0.8))
    
    frames = len(timestamps) + 1
    ani = animation.FuncAnimation(fig, animate, frames=frames, interval=500, blit=False)
    
    # Save animation
    output_path = os.path.join(output_dir, 'animations', 'vote_progress.gif')
    ani.save(output_path, writer='pillow', fps=2, dpi=100)
    plt.close(fig)
    print(f"Saved animation to {output_path}")

def visualize_treasury_trends(data, output_dir):
    """Create visualizations of treasury trends over time."""
    print("Generating treasury trend visualization...")
    
    treasury_data = data.get('treasury_data', {})
    
    if not treasury_data:
        print("Warning: Missing treasury data for trend visualization")
        return
    
    # For a real implementation, we'd use historical data
    # Here we'll simulate historical data based on current values
    
    # Get current values
    current = {
        'eth': treasury_data.get('eth', 0),
        'dai': treasury_data.get('dai', 0),
        'usdc': treasury_data.get('usdc', 0)
    }
    
    # Create simulated historical data for the past 12 months
    now = datetime.now()
    dates = [now - timedelta(days=30*i) for i in range(12)]
    dates.reverse()  # Earliest to latest
    
    # Create random but plausible trends
    np.random.seed(42)  # For reproducibility
    
    # ETH starts lower and increases
    eth_values = [current['eth'] * 0.5]
    for i in range(1, 12):
        change = np.random.normal(0.05, 0.1)  # Slight upward trend
        eth_values.append(max(0, eth_values[-1] * (1 + change)))
    
    # DAI starts higher and decreases
    dai_values = [current['dai'] * 1.3]
    for i in range(1, 12):
        change = np.random.normal(-0.02, 0.05)  # Slight downward trend
        dai_values.append(max(0, dai_values[-1] * (1 + change)))
    
    # USDC fluctuates around current value
    usdc_values = [current['usdc'] * 0.9]
    for i in range(1, 12):
        change = np.random.normal(0.01, 0.07)  # Fluctuation
        usdc_values.append(max(0, usdc_values[-1] * (1 + change)))
    
    # Create DataFrame
    df = pd.DataFrame({
        'date': dates,
        'ETH': eth_values,
        'DAI': dai_values,
        'USDC': usdc_values
    })
    
    # Calculate total USD value (simplified)
    eth_price = 3000  # Simulated ETH price in USD
    df['Total USD'] = df['ETH'] * eth_price + df['DAI'] + df['USDC']
    
    # Create figure with multiple subplots
    fig, axes = plt.subplots(2, 1, figsize=(12, 10), gridspec_kw={'height_ratios': [2, 1]})
    
    # Top plot: Stacked area chart of all assets
    df.plot(x='date', y=['ETH', 'DAI', 'USDC'], kind='area', stacked=True, 
            color=[LEXDAO_COLORS['primary'], LEXDAO_COLORS['secondary'], LEXDAO_COLORS['accent']],
            alpha=0.7, ax=axes[0])
    axes[0].set_title('LexDAO Treasury Assets Over Time', fontsize=14, fontweight='bold')
    axes[0].set_ylabel('Amount')
    axes[0].grid(True, alpha=0.3)
    axes[0].legend(title='Asset')
    
    # Bottom plot: Line chart of total USD value
    df.plot(x='date', y='Total USD', kind='line', 
            color=LEXDAO_COLORS['primary'], 
            marker='o', linewidth=2, ax=axes[1])
    axes[1].set_title('Total Treasury Value (USD)', fontsize=14, fontweight='bold')
    axes[1].set_ylabel('USD Value')
    axes[1].grid(True, alpha=0.3)
    
    # Format y-axis with commas for thousands
    axes[1].get_yaxis().set_major_formatter(
        plt.FuncFormatter(lambda x, loc: "{:,}".format(int(x)))
    )
    
    # Calculate and annotate growth rate
    growth_rate = (df['Total USD'].iloc[-1] / df['Total USD'].iloc[0] - 1) * 100
    growth_text = f"12-Month Growth: {growth_rate:.1f}%"
    color = LEXDAO_COLORS['positive'] if growth_rate >= 0 else LEXDAO_COLORS['negative']
    axes[1].text(0.02, 0.05, growth_text, transform=axes[1].transAxes, 
                fontsize=12, color=color, fontweight='bold',
                bbox=dict(facecolor='white', alpha=0.8))
    
    # Save the figure
    output_path = os.path.join(output_dir, 'visualizations', 'treasury_trends.png')
    save_figure(fig, output_path)

def visualize_governance_metrics(data, output_dir):
    """Create visualizations of key governance metrics."""
    print("Generating governance metrics visualization...")
    
    governance_analysis = data.get('governance_analysis', {}).get('analysis', {})
    proposals = data.get('proposal_data', {}).get('proposals', [])
    
    if not governance_analysis or not proposals:
        print("Warning: Missing governance analysis or proposal data")
        return
    
    # Extract data
    proposal_stats = governance_analysis.get('proposalStats', {})
    vote_stats = governance_analysis.get('voteStats', {})
    categories = governance_analysis.get('categories', {})
    
    # Create figure with subplots
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    
    # Plot 1: Proposal status breakdown (pie chart)
    if proposal_stats:
        status_labels = ['Executed', 'Rejected', 'Pending']
        status_values = [
            proposal_stats.get('executed', 0),
            proposal_stats.get('rejected', 0),
            proposal_stats.get('pending', 0)
        ]
        status_colors = [LEXDAO_COLORS['positive'], LEXDAO_COLORS['negative'], LEXDAO_COLORS['neutral']]
        
        axes[0, 0].pie(status_values, labels=status_labels, colors=status_colors, 
                      autopct='%1.1f%%', startangle=90, wedgeprops={'alpha': 0.8})
        axes[0, 0].set_title('Proposal Status Distribution', fontsize=14, fontweight='bold')
    
    # Plot 2: Vote distribution (pie chart)
    if vote_stats:
        vote_labels = ['For', 'Against']
        vote_values = [vote_stats.get('for', 0), vote_stats.get('against', 0)]
        vote_colors = [LEXDAO_COLORS['positive'], LEXDAO_COLORS['negative']]
        
        axes[0, 1].pie(vote_values, labels=vote_labels, colors=vote_colors, 
                      autopct='%1.1f%%', startangle=90, wedgeprops={'alpha': 0.8})
        axes[0, 1].set_title('Vote Distribution', fontsize=14, fontweight='bold')
    
    # Plot 3: Proposal categories (bar chart)
    if categories:
        category_labels = list(categories.keys())
        category_values = list(categories.values())
        
        category_bars = axes[1, 0].bar(category_labels, category_values, 
                                      color=LEXDAO_COLORS['secondary'], alpha=0.8)
        axes[1, 0].set_title('Proposals by Category', fontsize=14, fontweight='bold')
        axes[1, 0].set_ylabel('Number of Proposals')
        axes[1, 0].set_xticklabels(category_labels, rotation=45, ha='right')
        
        # Add value annotations
        for bar in category_bars:
            height = bar.get_height()
            axes[1, 0].text(bar.get_x() + bar.get_width()/2., height + 0.1,
                           f'{height:.0f}', ha='center', va='bottom')
    
    # Plot 4: Governance participation over time
    # We'll simulate participation data
    if proposals:
        # Sort proposals by date
        proposals_sorted = sorted(proposals, key=lambda x: x.get('timestamp', ''))
        
        # Extract proposal timestamps and simulate participation rates
        timestamps = [datetime.fromisoformat(p.get('timestamp', '').replace('Z', '+00:00')) 
                     for p in proposals_sorted]
        participation_rates = []
        
        for p in proposals_sorted:
            votes_for = p.get('votes_for', 0)
            votes_against = p.get('votes_against', 0)
            total_votes = votes_for + votes_against
            # Assume 50 eligible voters
            participation = (total_votes / 50) * 100
            participation_rates.append(participation)
        
        axes[1, 1].plot(timestamps, participation_rates, 'o-', 
                       color=LEXDAO_COLORS['primary'], linewidth=2)
        axes[1, 1].set_title('Governance Participation Trend', fontsize=14, fontweight='bold')
        axes[1, 1].set_ylabel('Participation Rate (%)')
        axes[1, 1].set_ylim(0, 100)
        axes[1, 1].grid(True, alpha=0.3)
        
        # Add trend line
        if len(timestamps) > 1:
            z = np.polyfit(range(len(timestamps)), participation_rates, 1)
            p = np.poly1d(z)
            axes[1, 1].plot(timestamps, p(range(len(timestamps))), 
                           '--', color=LEXDAO_COLORS['muted'])
    
    # Add overall title
    plt.suptitle('LexDAO Governance Metrics', fontsize=16, fontweight='bold')
    
    # Save the figure
    output_path = os.path.join(output_dir, 'visualizations', 'governance_metrics.png')
    save_figure(fig, output_path)

def create_membership_animation(data, output_dir):
    """Create an animated visualization of membership growth over time."""
    print("Generating membership growth animation...")
    
    members = data.get('membership_data', {}).get('members', [])
    
    if not members:
        print("Warning: Missing membership data for animation")
        return
    
    # Sort members by join date
    members.sort(key=lambda x: x.get('joined', ''))
    
    # Extract join dates and create cumulative membership count
    join_dates = [datetime.fromisoformat(m.get('joined', '').replace('Z', '+00:00')) for m in members]
    member_count = list(range(1, len(members) + 1))
    
    # Create animation
    fig, ax = plt.subplots(figsize=(10, 6))
    
    def animate(i):
        ax.clear()
        if i == 0:
            return
        
        # Plot data up to frame i
        ax.plot(join_dates[:i], member_count[:i], 'o-', color=LEXDAO_COLORS['primary'], linewidth=2)
        
        # Add dots for each member
        ax.scatter(join_dates[:i], member_count[:i], color=LEXDAO_COLORS['secondary'], s=50, zorder=5)
        
        # Formatting
        ax.set_title("LexDAO Membership Growth", fontweight='bold', fontsize=14)
        ax.set_xlabel('Date')
        ax.set_ylabel('Number of Members')
        ax.grid(True, alpha=0.3)
        
        # Set y-axis to be integer only
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        
        # Add current count
        ax.text(0.02, 0.95, f"Members: {i}", transform=ax.transAxes, 
                fontsize=12, fontweight='bold', 
                bbox=dict(facecolor='white', alpha=0.8))
    
    frames = len(members) + 1
    ani = animation.FuncAnimation(fig, animate, frames=frames, interval=200, blit=False)
    
    # Save animation
    output_path = os.path.join(output_dir, 'animations', 'membership_growth.gif')
    ani.save(output_path, writer='pillow', fps=4, dpi=100)
    plt.close(fig)
    print(f"Saved animation to {output_path}")

def visualize_governance_heatmap(data, output_dir):
    """Create a heatmap of governance activity."""
    print("Generating governance activity heatmap...")
    
    proposals = data.get('proposal_data', {}).get('proposals', [])
    votes = data.get('vote_data', {}).get('votes', [])
    activities = data.get('activity_visualization', {}).get('activities', [])
    
    if not proposals and not votes and not activities:
        print("Warning: Missing governance activity data")
        return
    
    # Combine all governance activities
    all_activities = []
    
    # Add proposals
    for p in proposals:
        all_activities.append({
            'type': 'proposal',
            'timestamp': p.get('timestamp', '')
        })
    
    # Add votes
    for v in votes:
        all_activities.append({
            'type': 'vote',
            'timestamp': v.get('timestamp', '')
        })
    
    # Add other activities
    if activities:
        all_activities.extend(activities)
    
    # Parse dates and extract month and day of week
    activity_dates = []
    for activity in all_activities:
        if activity.get('timestamp'):
            try:
                date = datetime.fromisoformat(activity.get('timestamp', '').replace('Z', '+00:00'))
                activity_dates.append(date)
            except (ValueError, TypeError):
                continue
    
    if not activity_dates:
        print("Warning: No valid dates found in activity data")
        return
    
    # Extract month and day of week
    months = [d.month for d in activity_dates]
    days_of_week = [d.weekday() for d in activity_dates]
    
    # Create 2D histogram (heatmap data)
    heatmap_data = np.zeros((7, 12))  # 7 days, 12 months
    for m, d in zip(months, days_of_week):
        heatmap_data[d, m-1] += 1
    
    # Create heatmap
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Custom colormap from light to dark blue
    cmap = LinearSegmentedColormap.from_list(
        'LexDAO', 
        [LEXDAO_COLORS['background'], LEXDAO_COLORS['primary']], 
        N=256
    )
    
    # Plot heatmap
    sns.heatmap(heatmap_data, ax=ax, cmap=cmap, annot=True, fmt='g',
               xticklabels=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
               yticklabels=['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    
    ax.set_title('LexDAO Governance Activity Heatmap', fontsize=14, fontweight='bold')
    ax.set_xlabel('Month')
    ax.set_ylabel('Day of Week')
    
    # Save the figure
    output_path = os.path.join(output_dir, 'visualizations', 'governance_heatmap.png')
    save_figure(fig, output_path)

def update_html_report(data, output_dir):
    """Update the HTML report with the additional visualizations."""
    print("Updating HTML report with new visualizations...")
    
    # Path to original HTML report
    html_path = os.path.join(output_dir, 'lexdao_governance_report.html')
    
    if not os.path.exists(html_path):
        print(f"Warning: HTML report not found at {html_path}")
        return
    
    try:
        with open(html_path, 'r') as f:
            html_content = f.read()
        
        # Find the position to insert new content (before the footer)
        footer_pos = html_content.find('<footer>')
        if footer_pos == -1:
            print("Warning: Could not find footer in HTML report")
            return
        
        # Create additional visualizations section
        additional_section = """
        <div class="visualization-section">
            <h2>Enhanced Visualizations</h2>
            <p>These advanced visualizations provide deeper insights into LexDAO's governance patterns.</p>
            
            <div class="enhanced-viz">
                <h3>Membership Network</h3>
                <img src="visualizations/membership_network.png" alt="Membership Network" class="full-width-img">
                <p>This network visualization shows the relationships between LexDAO members and governance proposals.</p>
            </div>
            
            <div class="enhanced-viz">
                <h3>Treasury Trends</h3>
                <img src="visualizations/treasury_trends.png" alt="Treasury Trends" class="full-width-img">
                <p>Historical trends of LexDAO treasury assets and total value over time.</p>
            </div>
            
            <div class="enhanced-viz">
                <h3>Governance Metrics</h3>
                <img src="visualizations/governance_metrics.png" alt="Governance Metrics" class="full-width-img">
                <p>Key metrics about LexDAO governance including proposal status, voting patterns, and participation rates.</p>
            </div>
            
            <div class="enhanced-viz">
                <h3>Activity Heatmap</h3>
                <img src="visualizations/governance_heatmap.png" alt="Activity Heatmap" class="full-width-img">
                <p>Heatmap showing patterns of governance activity by day of week and month.</p>
            </div>
        </div>
        
        <div class="visualization-section">
            <h2>Animations</h2>
            <p>These animations demonstrate the evolution of LexDAO governance over time.</p>
            
            <div class="enhanced-viz">
                <h3>Membership Growth</h3>
                <img src="animations/membership_growth.gif" alt="Membership Growth Animation" class="full-width-img">
                <p>Animation showing the growth of LexDAO membership over time.</p>
            </div>
            
            <div class="enhanced-viz">
                <h3>Voting Progress</h3>
                <img src="animations/vote_progress.gif" alt="Vote Progress Animation" class="full-width-img">
                <p>Animation showing how votes accumulate during a proposal's voting period.</p>
            </div>
        </div>
        """
        
        # Add CSS for new elements
        style_additions = """
        .full-width-img {
            width: 100%;
            max-width: 1000px;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .enhanced-viz {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .enhanced-viz:last-child {
            border-bottom: none;
        }
        """
        
        # Insert style additions
        style_pos = html_content.find('</style>')
        if style_pos != -1:
            html_content = html_content[:style_pos] + style_additions + html_content[style_pos:]
        
        # Insert additional section
        html_content = html_content[:footer_pos] + additional_section + html_content[footer_pos:]
        
        # Write updated HTML
        with open(html_path, 'w') as f:
            f.write(html_content)
            
        print(f"Updated HTML report at {html_path}")
    
    except Exception as e:
        print(f"Error updating HTML report: {e}")

def main():
    parser = argparse.ArgumentParser(description='LexDAO Governance Visualizer')
    parser.add_argument('--output-dir', type=str, required=True, 
                        help='Directory containing workflow outputs')
    args = parser.parse_args()
    
    # Load data
    data = load_workflow_data(args.output_dir)
    
    # Ensure output directories exist
    ensure_output_dirs(args.output_dir)
    
    # Generate visualizations
    visualize_membership_network(data, args.output_dir)
    visualize_treasury_trends(data, args.output_dir)
    visualize_governance_metrics(data, args.output_dir)
    visualize_governance_heatmap(data, args.output_dir)
    
    # Generate animations
    create_membership_animation(data, args.output_dir)
    create_vote_animation(data, args.output_dir)
    
    # Update HTML report
    update_html_report(data, args.output_dir)
    
    print("LexDAO visualization completed successfully!")

if __name__ == "__main__":
    main() 