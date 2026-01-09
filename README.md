# Fitts's Law Experiment

An interactive web-based experiment to test Fitts's Law, which predicts movement time based on target distance and width.

## Overview

This experiment demonstrates the relationship between the Index of Difficulty (ID) and movement time (MT) in human-computer interaction. Fitts's Law is expressed as:

```
MT = a + b × ID
where ID = log₂(D/W + 1)
```

- **MT**: Movement Time (milliseconds)
- **ID**: Index of Difficulty (bits)
- **D**: Distance to target (pixels)
- **W**: Width of target (pixels)
- **a**: Intercept (reaction time component)
- **b**: Slope (movement time per bit)

## Features

- 9 experimental conditions with varying difficulty levels (ID: 0.64 to 4.64 bits)
- Randomized trial presentation to avoid order effects
- Real-time statistics tracking (trial count, current ID, movement time, accuracy)
- Comprehensive data collection:
  - Movement time
  - Click accuracy
  - Error distance
  - Target and click coordinates
- Statistical analysis:
  - Mean and standard deviation of movement time
  - Error rates
  - Throughput (bits/second)
  - Linear regression with R² value
- Interactive visualization with scatter plot and regression line
- CSV export for further analysis

## Getting Started

### Running the Experiment

1. Open `index.html` in a web browser
2. Configure the number of trials per condition (default: 10)
3. Optionally enter a participant ID
4. Click "Start Experiment"
5. For each trial:
   - Click the green START button
   - Quickly click the target circle that appears
6. Complete all trials to view results

### Files

- **index.html** - Main HTML structure
- **styles.css** - All styling and layout
- **experiment.js** - Core experiment logic and analysis
- **fitts-law-experiment.html** - Original single-file version (legacy)

## Experimental Conditions

| Distance (px) | Width (px) | Index of Difficulty (bits) |
|---------------|------------|---------------------------|
| 100           | 80         | 0.64                      |
| 150           | 80         | 1.17                      |
| 200           | 80         | 1.64                      |
| 200           | 40         | 2.58                      |
| 300           | 40         | 3.00                      |
| 400           | 40         | 3.36                      |
| 300           | 20         | 4.00                      |
| 400           | 20         | 4.36                      |
| 500           | 20         | 4.64                      |

## Data Output

The experiment generates a CSV file with the following columns:

- **Trial**: Trial number
- **ParticipantID**: Participant identifier
- **Timestamp**: ISO timestamp
- **Condition**: Condition index
- **Distance**: Target distance in pixels
- **Width**: Target width in pixels
- **ID**: Index of Difficulty
- **MovementTime**: Time from start to click (ms)
- **ErrorDistance**: Distance from target center (px)
- **Accurate**: Whether click was within target (1/0)
- **ClickX, ClickY**: Click coordinates
- **TargetX, TargetY**: Target center coordinates

## Results Interpretation

### Linear Regression
The experiment fits a linear regression model: `MT = a + b × ID`
- **Intercept (a)**: Represents reaction time and initial movement preparation
- **Slope (b)**: Represents the time cost per bit of information
- **R²**: Indicates how well the linear model fits the data (closer to 1.0 is better)

### Throughput
Throughput (bits/second) measures performance efficiency:
```
Throughput = ID / (MT / 1000)
```
Higher throughput indicates faster and more efficient pointing.

## Applications

This experiment is useful for:
- Human-Computer Interaction (HCI) research
- User interface design and evaluation
- Input device comparison studies
- Motor control and biomechanics research
- Ergonomics and accessibility testing

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- CSS Grid/Flexbox

## References

Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. *Journal of Experimental Psychology*, 47(6), 381-391.

MacKenzie, I. S. (1992). Fitts' law as a research and design tool in human-computer interaction. *Human-Computer Interaction*, 7(1), 91-139.

## License

This project is open source and available for educational and research purposes.

## Author

Created with Claude Code
