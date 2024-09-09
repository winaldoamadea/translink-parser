# UQ Lakes Station Bus Tracker

Welcome to the UQ Lakes Station Bus Tracker! This Node.js application is designed to provide real-time bus schedule information for the UQ Lakes station. It demonstrates key concepts of functional programming in JavaScript and integrates with the TransLink GTFS Real-Time Feed API.

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Project Structure](#project-structure)
5. [Dependencies](#dependencies)
6. [Contributing](#contributing)
7. [License](#license)

## Overview

This application allows users to:
- Input a departure date and time.
- Choose a bus route.
- Get a summary of buses arriving at UQ Lakes station within 10 minutes of the current time.

The application is built with a focus on functional programming principles and features asynchronous data handling.

## Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/yourusername/uq-lakes-bus-tracker.git
    cd uq-lakes-bus-tracker
    ```

2. **Install dependencies:**

    Ensure you have [Node.js](https://nodejs.org/) installed. Then, run:

    ```sh
    npm install
    ```

3. **Download and extract data files:**

    - Download `SEQ_GTFS.zip` and extract it into the `static-data` folder.
    - The static data files should be placed as follows:
      ```
      static-data/
        calendar.txt
        routes.txt
        stops.txt
        stop_times.txt
        trips.txt
      ```

4. **Set up the proxy server:**

    - Download and extract `proxyserver_v3.zip`.
    - For macOS and Linux, ensure the binaries have execute permissions:
      ```sh
      chmod +x assign1_server_macos_m1  # macOS
      chmod +x assign1_server_linux     # Linux
      ```
    - For Windows, run the provided executable.

    Start the proxy server:
    ```sh
    ./assign1_server_macos_m1 -static  # or use the Windows executable
    ```

## Usage

1. **Run the application:**

    ```sh
    node translink-parser.js
    ```

2. **Follow the prompts:**

    - Enter the departure date in `YYYY-MM-DD` format.
    - Enter the departure time in `HH:mm` format.
    - Choose a bus route from the list or type `1` to show all routes.

3. **View the output:**

    The application will display a table of buses scheduled to arrive within 10 minutes of the current time.

4. **Restart or exit:**

    After viewing the results, you can choose to search again or exit the application.

## Project Structure

