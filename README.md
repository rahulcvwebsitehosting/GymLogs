# IronLog

A high-performance personal training dashboard for tracking workouts, strength progression, and systemic recovery.

## Description

IronLog is a private training tool designed for athletes who require detailed documentation of their training sessions and physical state. It provides a streamlined interface for fast in-gym logging while offering comprehensive data analysis tools to monitor long-term progress.

The application serves as a centralized hub for managing strength training routines, body composition metrics, and physiological recovery markers such as sleep quality and joint health. It is built for dedicated individuals who prioritize data accuracy and privacy in their fitness journey.

## Features

*   **Optimized Workout Logging**: A mobile-first interface designed for rapid data entry between sets, including integrated rest timers and set-by-set history.
*   **Progressive Overload Analysis**: Automated tracking of personal records and strength curves to visualize performance trends over time.
*   **Training Split Management**: Customizable workout routines with drag-and-drop reordering and support for individual training styles.
*   **Systemic Recovery Tracking**: Dedicated logs for sleep, energy levels, and localized pain markers to help prevent overtraining and injury.
*   **Body Composition Monitoring**: Persistent tracking of body weight and fat percentage alongside a private local gallery for visual progress assessment.
*   **Training Insights**: Algorithmic analysis of training volume and fatigue levels to provide objective feedback on workload management.

## Tech Stack

*   **Frontend Framework**: React 19 with TypeScript
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand
*   **Data Visualization**: Recharts for interactive performance and metric graphs
*   **Data Persistence**: Browser-based IndexedDB for private photo storage and local storage for training logs
*   **Utility Libraries**: Lucide React for iconography, date-fns for time-series data management, and dnd-kit for routine customization

## Live Demo

https://rahulcvwebhosting.github.io/ironlog/

## Installation & Setup

To set up a local development environment:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/rahulcvwebhosting/ironlog.git
    cd ironlog
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure environment variables**
    Create a `.env` file in the root directory and add your API credentials for analysis features:
    ```env
    API_KEY=your_api_key_here
    ```

4.  **Start the development server**
    ```bash
    npm start
    ```

## Usage

*   **Stats Dashboard**: Review your weekly rep volume and consistency score. Use the quick-access icons to visit specific lift analytics.
*   **Recording Exercises**: Navigate to the Workouts tab to select your daily split. The logger will automatically surface your previous weights and reps to facilitate progressive overload.
*   **Recovery Monitoring**: Use the Recovery tab to log systemic fatigue markers. This data is correlated with your training volume to identify potential overreaching.
*   **Body Tracking**: Log weight and capture progress photos in the Body tab. All images are stored locally in the browser's IndexedDB and are never transmitted to external servers.

## Future Improvements

*   **Data Portability**: Implementation of CSV and JSON export functionality for external data analysis and manual backups.
*   **Periodization Automation**: Algorithmic suggestions for deload weeks based on multi-week performance plateaus and pain log spikes.
*   **Advanced Volume Mapping**: Heatmap visualization of weekly volume distribution across specific muscle groups to identify training imbalances.

## Author

**Rahul S**
Civil Engineering student and developer focused on creating performance-oriented productivity tools and engineering-grade data dashboards.