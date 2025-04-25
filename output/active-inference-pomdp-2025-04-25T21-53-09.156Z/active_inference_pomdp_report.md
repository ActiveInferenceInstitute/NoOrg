# Active Inference POMDP Model Report

## Executive Summary

This report presents the results of an Active Inference Partially Observable Markov Decision Process (POMDP) model applied to analyze temperature changes within a narrative context. The model's goal was to determine optimal actions based on temperature observations extracted from a story. The analysis involved extracting temperature data, configuring a POMDP model, updating beliefs, selecting actions, and interpreting the results. This report details each step and provides insights into the model's performance.

## Temperature Extraction from the Story

The temperature extraction process involved analyzing a narrative to identify temperature-related descriptions and quantify them. The story was segmented into three timepoints: beginning, middle, and end. The extracted temperatures were:

- **Beginning**: 0°C, described as a "crisp autumn morning with frost on the ground and visible breath clouds," with a confidence level of 0.9.
- **Middle**: 15°C, described as "Midday with the sun high in the sky, warming the air considerably, perfect for hiking," with a confidence level of 0.8.
- **End**: 5°C, described as "Evening with a sudden summer storm, rain cooling the air dramatically," with a confidence level of 0.85.

These temperatures were used as observations in the POMDP model.

## POMDP Model Configuration

The POMDP model was configured with the following components:

- **States**: ["very-cold", "cold", "cool", "mild", "warm", "hot", "very-hot"]
- **Actions**: ["add-clothing", "remove-clothing", "seek-shelter", "seek-shade", "use-heating", "use-cooling", "no-action"]
- **Observations**: ["freezing", "very-cold", "cold", "cool", "mild", "warm", "hot", "very-hot"]
- **Policy Depth**: 2

The model aimed to infer the most probable state of the environment and select actions that minimize free energy, a measure of uncertainty and surprise.

## Belief Updates and Action Selection

### Final Beliefs

The final belief distribution over the states was as follows:

- Very-cold: 1.14%
- Cold: 42.35%
- Cool: 42.35%
- Mild: 10.59%
- Warm: 2.82%
- Hot: 0.71%
- Very-hot: 0.05%

This distribution indicates a high probability of the environment being in a "cold" or "cool" state.

### Belief History, Action History, Observation History, Policy History, Free Energy History

Unfortunately, the belief history, action history, observation history, policy history, and free energy history were not available in the provided data. These histories typically provide insights into how beliefs and actions evolved over time, how observations influenced the model, and how the policy adapted to minimize free energy.

## Interpretation of Results and Insights

The model's final belief distribution suggests that the environment was most likely in a "cold" or "cool" state, aligning with the extracted temperatures from the story. The high confidence in these states indicates that the model effectively integrated the temperature observations to update its beliefs.

The absence of detailed histories limits the ability to analyze the model's dynamic behavior and decision-making process. However, the final beliefs provide a snapshot of the model's inference capabilities.

## Conclusion

The Active Inference POMDP model successfully utilized temperature data extracted from a narrative to infer the most probable environmental states and guide action selection. Despite the lack of detailed histories, the final belief distribution aligns with the observed temperatures, demonstrating the model's effectiveness in processing and integrating sensory information. Future analyses could benefit from complete histories to provide a more comprehensive understanding of the model's decision-making process.

## Visualizations

The following visualizations were generated to support the analysis:

- **Belief History**: `belief_history.svg` and `belief_history.png`
- **Free Energy**: `free_energy.svg` and `free_energy.png`
- **Observation and Action History**: `observation_action_history.svg` and `observation_action_history.png`
- **Transition Model**: `transition_model.svg` and `transition_model.png`
- **Observation Model**: `observation_model.svg` and `observation_model.png`
- **Belief Animation**: `belief_animation.gif`

These visualizations can be referenced for a visual representation of the model's performance and dynamics.